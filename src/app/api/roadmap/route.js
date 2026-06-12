import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const roadmapSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      expectedImpact: z.enum(["high", "medium", "low"]),
      effortEstimate: z.string(),
      priorityRank: z.number().int(),
    })
  )
});

// GENERATE ROADMAP
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    const skillGaps = await prisma.skillGap.findMany({ where: { userId: session.user.id, role } });
    
    // We also want to see what's already completed to avoid duplicating
    const existingItems = await prisma.roadmapItem.findMany({ where: { userId: session.user.id } });
    const completedItems = existingItems.filter(i => i.status === "done").map(i => i.title);

    if (!profile || skillGaps.length === 0) {
      return NextResponse.json({ error: "Please evaluate your readiness first to identify skill gaps." }, { status: 400 });
    }

    const prompt = `
You are an expert career coach helping a candidate transition into a "${role}" role.
Based on their profile and identified skill gaps, generate a personalized, prioritized action plan.

Candidate Profile:
${JSON.stringify({ skills: profile.skills, experience: profile.experience, projects: profile.projects })}

Skill Gaps to Address:
${JSON.stringify(skillGaps.map(g => ({ skill: g.skillName, impact: g.impact })))}

Previously Completed Items (DO NOT RECOMMEND THESE):
${JSON.stringify(completedItems)}

Generate 5 to 7 prioritized action items. For each item provide:
1. title: A clear, actionable title.
2. description: Detail exactly what they should do.
3. expectedImpact: "high", "medium", or "low".
4. effortEstimate: E.g., "5 hours", "1 week", "2 days".
5. priorityRank: Integer from 1 (most important) to N.

Return strictly as JSON matching this schema:
{ "items": [ { "title": "...", "description": "...", "expectedImpact": "...", "effortEstimate": "...", "priorityRank": 1 } ] }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const parsedJsonString = chatCompletion.choices[0]?.message?.content || "{}";
    const parsedData = roadmapSchema.parse(JSON.parse(parsedJsonString));

    // Delete existing pending/in_progress items for this user to regenerate fresh ones
    // We preserve "done" items to maintain history.
    await prisma.roadmapItem.deleteMany({
      where: { userId: session.user.id, status: { in: ["pending", "in_progress"] } }
    });

    const itemsToCreate = parsedData.items.map(item => ({
      userId: session.user.id,
      title: item.title,
      description: item.description,
      expectedImpact: item.expectedImpact,
      effortEstimate: item.effortEstimate,
      status: "pending",
      priorityRank: item.priorityRank,
    }));

    await prisma.roadmapItem.createMany({ data: itemsToCreate });
    const allItems = await prisma.roadmapItem.findMany({ where: { userId: session.user.id }, orderBy: { priorityRank: 'asc' } });

    return NextResponse.json({ success: true, roadmap: allItems });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}

// UPDATE STATUS
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

    const updatedItem = await prisma.roadmapItem.update({
      where: { id: id, userId: session.user.id }, // ensure it belongs to user
      data: { status }
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

