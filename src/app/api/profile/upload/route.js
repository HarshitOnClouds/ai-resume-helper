import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import mammoth from "mammoth";
import Groq from "groq-sdk";
import { z } from "zod";
import { getDocumentProxy, extractText } from "unpdf";

export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const profileSchema = z.object({
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string(),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  ),
  certifications: z.array(z.string()),
  achievements: z.array(z.string()),
});

async function extractTextFromPDF(buffer) {
  // Load the PDF into memory
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  
  // Extract text pages
  const { text } = await extractText(pdf);
  
  // CRITICAL: Clean up memory to prevent leaks on Vercel/Railway
  pdf.destroy();
  
  // unpdf returns text as an array of strings (one per page). Join them.
  return Array.isArray(text) ? text.join("\n") : (text || "");
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (file.type === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json({ error: "Unsupported file format. Please upload PDF or DOCX." }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "Could not extract text from the document" }, { status: 400 });
    }

    const prompt = `
You are an expert technical recruiter and resume parser.
Extract the following information from the provided resume text and return it strictly as a JSON object that matches this schema:
{
  "skills": ["skill1", "skill2"],
  "projects": [{ "name": "...", "description": "...", "technologies": ["..."] }],
  "experience": [{ "company": "...", "role": "...", "startDate": "...", "endDate": "...", "description": "..." }],
  "education": [{ "institution": "...", "degree": "...", "fieldOfStudy": "...", "startDate": "...", "endDate": "..." }],
  "certifications": ["..."],
  "achievements": ["..."]
}
If any section is missing, return an empty array for that field. Do not include markdown formatting or explanations, just the JSON string.

Resume Text:
${extractedText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const parsedJsonString = chatCompletion.choices[0]?.message?.content || "{}";
    const parsedData = profileSchema.parse(JSON.parse(parsedJsonString));

    await prisma.resumeVersion.create({
      data: {
        userId: session.user.id,
        parsedJson: parsedData,
      }
    });

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        skills: parsedData.skills,
        projects: parsedData.projects,
        experience: parsedData.experience,
        education: parsedData.education,
        certifications: parsedData.certifications,
        achievements: parsedData.achievements,
      },
      create: {
        userId: session.user.id,
        skills: parsedData.skills,
        projects: parsedData.projects,
        experience: parsedData.experience,
        education: parsedData.education,
        certifications: parsedData.certifications,
        achievements: parsedData.achievements,
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}

