import Link from "next/link";
import { ArrowRight, FileText, Target, Map, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 overflow-x-hidden selection:bg-primary/30">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300 mb-8 backdrop-blur-md shadow-2xl">
            <span className="flex w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            GetMeTheJob v1.0 is Live
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500 drop-shadow-sm leading-tight">
            Don't just apply.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Master your career.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-2xl font-medium leading-relaxed">
            Upload your resume and let AI generate a personalized, step-by-step roadmap to land your dream role and beat the ATS.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link 
              href="/profile" 
              className="group relative inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold transition-all hover:bg-primary/90 hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Start Free Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#how-it-works" 
              className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-full text-lg font-bold transition-all"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS / FEATURES ─── */}
      <section id="how-it-works" className="py-24 px-6 relative border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Your AI Career Copilot</h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">An end-to-end platform to parse your experience, find your gaps, and build your future.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Feature 1 */}
            <Link href="/profile" className="group relative p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">1. Smart Profile Builder</h3>
              <p className="text-zinc-400 leading-relaxed">Simply upload your PDF/DOCX resume. Our AI instantly extracts, structures, and maps your skills and experience.</p>
            </Link>

            {/* Feature 2 */}
            <Link href="/dashboard" className="group relative p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">2. Readiness Engine</h3>
              <p className="text-zinc-400 leading-relaxed">Select from 17+ target roles (e.g. Software Engineer, Data Scientist). See exactly which technical and soft skills you're missing.</p>
            </Link>

            {/* Feature 3 */}
            <Link href="/roadmap" className="group relative p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">3. Action Roadmap</h3>
              <p className="text-zinc-400 leading-relaxed">Get a personalized Kanban board with specific, actionable steps to bridge your skill gaps and level up.</p>
            </Link>

            {/* Feature 4 */}
            <Link href="/optimizer" className="group relative p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full group-hover:bg-orange-500/20 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">4. Resume Optimizer & Export</h3>
              <p className="text-zinc-400 leading-relaxed">Paste a job description to get line-by-line AI bullet improvements. Edit live and download a beautiful, ATS-friendly PDF.</p>
            </Link>

          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[100px] pointer-events-none" />
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Ready to level up?</h2>
          <p className="text-xl text-zinc-400 mb-10 relative z-10">Join professionals using AI to build their career strategy.</p>
          
          <Link 
            href="/profile" 
            className="relative z-10 inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105"
          >
            Upload Your Resume
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-medium text-zinc-500 relative z-10">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Free Analysis</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> No Credit Card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> PDF Export</span>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-zinc-600 text-sm border-t border-white/5">
        <p>© {new Date().getFullYear()} GetMeTheJob. All rights reserved.</p>
      </footer>
    </div>
  );
}
