import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KanbanBoard from "./KanbanBoard";

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  const items = await prisma.roadmapItem.findMany({
    where: { userId: session.user.id },
    orderBy: { priorityRank: 'asc' }
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Action Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          A personalized roadmap generated to bridge your skill gaps. Track your progress below. 
          When you finish tasks, regenerate the roadmap to get your next priorities.
        </p>
      </div>

      <KanbanBoard initialItems={items} />
    </div>
  );
}
