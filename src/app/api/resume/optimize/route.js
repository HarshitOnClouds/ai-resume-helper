import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const optimizationSchema = z.object({
  atsScore: z.number().min(0).max(100),
  atsIssues: z.array(z.string()),
  optimizations: z.array(
    z.object({
      section: z.string(), // Allow any section: experience, projects, skills, education, certifications, etc.
      originalText: z.string(),
      suggestedText: z.string(),
      reasoning: z.string()
    })
  )
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeText, jobDescription, mode = "jd" } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    if (mode === "jd" && !jobDescription) {
      return NextResponse.json({ error: "Job description is required for targeted optimization" }, { status: 400 });
    }

    const prompt = mode === "jd"
      ? `
You are an expert technical recruiter and ATS optimization AI.
Your task is to optimize the provided resume for the provided job description.

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Task:
1. Score the resume's ATS compatibility and fit for this job (0-100).
2. Flag any ATS issues (e.g., missing critical keywords, wrong formatting).
3. Suggest improvements by rewriting weak bullet points into strong impact statements (Action Verb + Task + Metric/Outcome).
4. Specifically enhance project descriptions to highlight technical depth and impact relevant to the JD.

Return strictly as JSON:
{
  "atsScore": 85,
  "atsIssues": ["Missing keyword 'Kubernetes'", "Vague project descriptions"],
  "optimizations": [
    {
      "section": "experience",
      "originalText": "Worked on backend API.",
      "suggestedText": "Developed scalable RESTful backend APIs using Node.js, reducing query latency by 20%.",
      "reasoning": "Added metrics and specific technologies matching JD requirements."
    }
  ]
}
`
      : `
You are a world-class resume writer and career coach.
Your task is to make this resume significantly stronger by improving the writing quality, impact, and clarity — without targeting any specific job.

Candidate Resume:
${resumeText}

Task:
1. Set atsScore to a general quality score (0-100) based on writing strength.
2. List general weaknesses as atsIssues (e.g., "Bullets lack metrics", "Passive voice used").
3. For each weak bullet or description, rewrite it using strong action verbs and quantifiable outcomes (Action Verb + Task + Metric/Outcome).
4. Enhance project descriptions to showcase technical depth and real impact.
5. Suggest at least 4-6 improvements.

Return strictly as JSON:
{
  "atsScore": 72,
  "atsIssues": ["Bullets lack quantifiable outcomes", "Project descriptions are too vague"],
  "optimizations": [
    {
      "section": "experience",
      "originalText": "Helped with testing.",
      "suggestedText": "Engineered automated test suites using Jest, increasing code coverage from 45% to 89% and reducing bug escape rate by 30%.",
      "reasoning": "Added specific tool, metric, and measurable outcome."
    }
  ]
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const parsedJsonString = chatCompletion.choices[0]?.message?.content || "{}";
    const parsedData = optimizationSchema.parse(JSON.parse(parsedJsonString));

    return NextResponse.json({ success: true, optimization: parsedData });
  } catch (error) {
    console.error("Resume optimization error:", error);
    return NextResponse.json({ error: "Failed to optimize resume" }, { status: 500 });
  }
}

