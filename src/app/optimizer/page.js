import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OptimizerForm from "./OptimizerForm";

function profileToText(profile) {
  const lines = [];

  if (profile.skills?.length) {
    lines.push("SKILLS");
    lines.push(profile.skills.join(", "));
    lines.push("");
  }

  if (profile.experience?.length) {
    lines.push("EXPERIENCE");
    for (const exp of profile.experience) {
      lines.push(`${exp.role} at ${exp.company} (${exp.startDate || ""} - ${exp.endDate || "Present"})`);
      lines.push(exp.description || "");
    }
    lines.push("");
  }

  if (profile.projects?.length) {
    lines.push("PROJECTS");
    for (const proj of profile.projects) {
      lines.push(`${proj.name}: ${proj.description}`);
      if (proj.technologies?.length) lines.push(`Technologies: ${proj.technologies.join(", ")}`);
    }
    lines.push("");
  }

  if (profile.education?.length) {
    lines.push("EDUCATION");
    for (const edu of profile.education) {
      lines.push(`${edu.degree} in ${edu.fieldOfStudy || "N/A"} at ${edu.institution}`);
    }
    lines.push("");
  }

  if (profile.certifications?.length) {
    lines.push("CERTIFICATIONS");
    lines.push(profile.certifications.join(", "));
    lines.push("");
  }

  if (profile.achievements?.length) {
    lines.push("ACHIEVEMENTS");
    lines.push(profile.achievements.join(", "));
  }

  return lines.join("\n");
}

export default async function OptimizerPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/api/auth/signin");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  });

  if (!profile) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Resume Optimizer</h1>
        </div>
        <div className="text-center py-20 border-2 border-dashed border-border/60 rounded-2xl bg-muted/10">
          <p className="text-4xl mb-4">📄</p>
          <h3 className="text-xl font-semibold mb-2">No Resume Found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            You need to upload your resume first before we can optimize it against a job description.
          </p>
          <Link href="/profile" className="inline-block bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
            Upload Resume →
          </Link>
        </div>
      </div>
    );
  }

  const resumeText = profileToText(profile);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Resume Optimizer</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Paste the job description you are targeting and our AI will analyze your uploaded resume for ATS compatibility and suggest powerful rewrites.
        </p>
      </div>

      <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm">
        <span className="text-xl">✅</span>
        <div>
          <span className="font-semibold text-card-foreground">Resume loaded automatically</span>
          <span className="text-muted-foreground ml-2">using your previously uploaded resume ({profile.skills?.length || 0} skills, {profile.experience?.length || 0} experiences, {profile.projects?.length || 0} projects detected)</span>
        </div>
      </div>

      <OptimizerForm resumeText={resumeText} />
    </div>
  );
}
