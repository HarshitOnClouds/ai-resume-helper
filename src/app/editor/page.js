import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ResumeEditor from "./ResumeEditor";

export default async function EditorPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/api/auth/signin");

  const profileData = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  });

  if (!profileData) {
    redirect("/profile");
  }

  // Inject user info and ensure contactInfo exists
  const profile = {
    ...profileData,
    name: session.user.name,
    email: session.user.email,
    contactInfo: profileData.contactInfo || {}
  };

  return (
    <div className="container mx-auto py-8 px-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Editor</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manually edit your parsed profile, add a photo, and preview the results live.
          </p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResumeEditor profile={profile} />
      </div>
    </div>
  );
}
