import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadResumeForm from "./UploadResumeForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin"); // Quick redirect to default NextAuth sign in
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Career Profile</h1>
        <p className="text-muted-foreground mt-2">
          Upload your latest resume to automatically extract your skills, experience, and projects.
        </p>
      </div>

      <UploadResumeForm />

      {profile && (
        <div className="space-y-8 mt-10">
          <h2 className="text-2xl font-semibold border-b pb-2">Extracted Data</h2>
          
          <section>
            <h3 className="text-xl font-medium mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium border border-border/50 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-medium mb-3">Experience</h3>
            <div className="space-y-4">
              {profile.experience?.map((exp, i) => (
                <div key={i} className="bg-card text-card-foreground border border-border/50 rounded-lg p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2 gap-2">
                    <div>
                      <h4 className="font-semibold text-lg">{exp.role}</h4>
                      <p className="text-sm font-medium text-primary/80">{exp.company}</p>
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md whitespace-nowrap">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </div>
                  </div>
                  <p className="text-sm mt-3 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-medium mb-3">Projects</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {profile.projects?.map((proj, i) => (
                <div key={i} className="bg-card text-card-foreground border border-border/50 rounded-lg p-5 shadow-sm flex flex-col">
                  <h4 className="font-semibold text-lg">{proj.name}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                    {proj.technologies?.map((tech, j) => (
                      <span key={j} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-sm font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-grow">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
