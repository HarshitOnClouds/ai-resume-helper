import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import { z } from "zod";
import taxonomies from "@/data/taxonomies.json";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const readinessSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  reasoning: z.string(),
  skillGaps: z.array(
    z.object({
      skillName: z.string(),
      category: z.enum(["technical", "soft"]),
      impact: z.enum(["critical", "optional"]),
      rationale: z.string(),
    })
  )
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body; // e.g., "Software Engineer"

    if (!role || !taxonomies[role]) {
      return NextResponse.json({ error: "Invalid or missing target role" }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found. Please upload a resume first." }, { status: 404 });
    }

    const roleTaxonomy = taxonomies[role];

    const prompt = `
You are an expert technical interviewer and career coach.
Evaluate the candidate's profile against the requirements for a "${role}" role.

Candidate Profile:
${JSON.stringify({
  skills: profile.skills,
  experience: profile.experience,
  projects: profile.projects,
  education: profile.education
})}

Role Requirements (with importance):
${JSON.stringify(roleTaxonomy)}

Task:
Generate a strictly formatted JSON response that contains:
1. score: An integer from 0-100 indicating readiness for this role.
2. strengths: Array of 2-4 sentences highlighting their strengths.
3. weaknesses: Array of 2-4 sentences highlighting their weaknesses.
4. reasoning: A short paragraph explaining the score.
5. skillGaps: An array of missing skills derived from comparing the profile to the taxonomy. For each gap, provide:
   - skillName: Name of the missing skill.
   - category: "technical" or "soft".
   - impact: "critical" (if importance is high/medium and completely absent) or "optional" (if importance is low).
   - rationale: A 1-sentence explanation of why it's missing or needed.

Do not include markdown formatting or explanations, just the raw JSON string.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const parsedJsonString = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Validate with Zod
    const parsedData = readinessSchema.parse(JSON.parse(parsedJsonString));

    // Save to DB
    // 1. Delete old readiness and gaps for this role to maintain 1 active evaluation per role
    await prisma.readinessScore.deleteMany({
      where: { userId: session.user.id, role: role }
    });
    
    await prisma.skillGap.deleteMany({
      where: { userId: session.user.id, role: role }
    });

    // 2. Create new ReadinessScore
    const readinessScore = await prisma.readinessScore.create({
      data: {
        userId: session.user.id,
        role: role,
        score: parsedData.score,
        strengths: parsedData.strengths,
        weaknesses: parsedData.weaknesses,
        reasoning: parsedData.reasoning,
      }
    });

    // 3. Create new SkillGaps
    let savedGaps = [];
    if (parsedData.skillGaps.length > 0) {
      const gapsToCreate = parsedData.skillGaps.map(gap => ({
        userId: session.user.id,
        role: role,
        ...gap
      }));
      await prisma.skillGap.createMany({
        data: gapsToCreate
      });
      // fetch back to return full objects
      savedGaps = await prisma.skillGap.findMany({
        where: { userId: session.user.id, role: role }
      });
    }

    return NextResponse.json({ success: true, readinessScore, skillGaps: savedGaps });
  } catch (error) {
    console.error("Readiness evaluation error:", error);
    return NextResponse.json({ error: "Failed to evaluate readiness" }, { status: 500 });
  }
}

