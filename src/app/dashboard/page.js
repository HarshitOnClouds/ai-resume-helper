import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReadinessWidget from "./ReadinessWidget";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  const readinessScores = await prisma.readinessScore.findMany({
    where: { userId: session.user.id },
  });

  const skillGaps = await prisma.skillGap.findMany({
    where: { userId: session.user.id },
  });

  return (
    <div className="container mx-auto py-10 max-w-5xl px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Select a target role to evaluate your readiness and identify critical skill gaps.
        </p>
      </div>

      {!profile ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">No Profile Found</h2>
          <p>You need to upload your resume to build a profile before we can evaluate your readiness.</p>
          <a href="/profile" className="inline-block mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Go to Profile
          </a>
        </div>
      ) : (
        <ReadinessWidget 
          initialScores={readinessScores} 
          initialGaps={skillGaps} 
        />
      )}
    </div>
  );
}
