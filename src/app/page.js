import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white relative overflow-hidden">
      {/* Decorative background blobs for glassmorphism effect */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-60 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-60 mix-blend-screen pointer-events-none"></div>

      <main className="z-10 flex flex-col items-center text-center px-6 py-20 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300 mb-8 backdrop-blur-md">
          <span className="flex w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          GetMeTheJob v1.0 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500 drop-shadow-sm">
          Master Your Career.
        </h1>
        <p className="text-lg md:text-2xl text-zinc-400 mb-14 max-w-3xl font-medium leading-relaxed">
          Stop guessing what to learn next. Upload your resume and let AI generate a personalized roadmap to land your dream role.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Link href="/profile" className="group relative p-px rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-primary/50 hover:to-primary/10 transition-all duration-500 shadow-xl hover:shadow-primary/20">
            <div className="h-full bg-zinc-950/90 backdrop-blur-xl rounded-[23px] p-8 md:p-10 border border-white/5 flex flex-col items-start text-left group-hover:bg-zinc-950/60 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <span className="text-2xl">📄</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">1. Profile Builder</h2>
              <p className="text-zinc-400 font-medium leading-relaxed">Upload your resume and let AI extract and structure your skills, projects, and experience automatically.</p>
            </div>
          </Link>

          <Link href="/dashboard" className="group relative p-px rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-blue-500/50 hover:to-blue-500/10 transition-all duration-500 shadow-xl hover:shadow-blue-500/20">
            <div className="h-full bg-zinc-950/90 backdrop-blur-xl rounded-[23px] p-8 md:p-10 border border-white/5 flex flex-col items-start text-left group-hover:bg-zinc-950/60 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">2. Readiness Engine</h2>
              <p className="text-zinc-400 font-medium leading-relaxed">Check your fit for target roles. Get a readiness score and identify critical skill gaps holding you back.</p>
            </div>
          </Link>

          <Link href="/roadmap" className="group relative p-px rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-purple-500/50 hover:to-purple-500/10 transition-all duration-500 shadow-xl hover:shadow-purple-500/20">
            <div className="h-full bg-zinc-950/90 backdrop-blur-xl rounded-[23px] p-8 md:p-10 border border-white/5 flex flex-col items-start text-left group-hover:bg-zinc-950/60 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <span className="text-2xl">🗺️</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">3. Action Roadmap</h2>
              <p className="text-zinc-400 font-medium leading-relaxed">Get an AI-generated, prioritized Kanban board of actionable tasks tailored to level up your skills.</p>
            </div>
          </Link>

          <Link href="/optimizer" className="group relative p-px rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-emerald-500/50 hover:to-emerald-500/10 transition-all duration-500 shadow-xl hover:shadow-emerald-500/20">
            <div className="h-full bg-zinc-950/90 backdrop-blur-xl rounded-[23px] p-8 md:p-10 border border-white/5 flex flex-col items-start text-left group-hover:bg-zinc-950/60 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">4. Resume Optimizer</h2>
              <p className="text-zinc-400 font-medium leading-relaxed">Tailor your resume bullets and projects to perfectly match a specific job description to beat the ATS.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
