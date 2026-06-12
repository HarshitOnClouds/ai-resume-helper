"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReadinessWidget({ initialScores, initialGaps }) {
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Find the score/gaps for the currently selected role
  const currentScore = initialScores.find(s => s.role === targetRole);
  const currentGaps = initialGaps.filter(g => g.role === targetRole);

  const evaluateReadiness = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      
      router.refresh(); // Refresh to get updated server data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-card border border-border/50 p-5 rounded-xl shadow-sm">
        <div className="w-full sm:w-72">
          <label className="block text-sm font-semibold mb-2 text-card-foreground">Target Role</label>
          <select 
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full border border-border/60 rounded-md px-3 py-2.5 bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            <option value="Software Engineer">Software Engineer</option>
            {/* Add more roles here as they are added to the taxonomy JSON */}
          </select>
        </div>
        <button 
          onClick={evaluateReadiness}
          disabled={loading}
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
        >
          {loading ? "Analyzing Profile..." : "Evaluate Readiness"}
        </button>
      </div>

      {error && <p className="text-destructive font-medium bg-destructive/10 p-3 rounded-md">{error}</p>}

      {currentScore ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border/50 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-card-foreground mb-6">Readiness Score</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="64" className="text-muted stroke-current" strokeWidth="12" fill="transparent" />
                <circle cx="72" cy="72" r="64" className={`${currentScore.score > 70 ? 'text-green-500' : currentScore.score > 40 ? 'text-yellow-500' : 'text-red-500'} stroke-current transition-all duration-1000 ease-out`} strokeWidth="12" fill="transparent" 
                  strokeDasharray={`${(currentScore.score / 100) * 402} 402`} strokeLinecap="round" />
              </svg>
              <span className="absolute text-5xl font-bold tracking-tighter">{currentScore.score}</span>
            </div>
            <p className="mt-8 text-sm text-muted-foreground leading-relaxed font-medium">{currentScore.reasoning}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-green-500 mb-4 flex items-center gap-2 text-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Strengths
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground list-disc pl-5 marker:text-green-500/50">
                {currentScore.strengths.map((str, i) => <li key={i} className="leading-relaxed">{str}</li>)}
              </ul>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-destructive mb-4 flex items-center gap-2 text-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Weaknesses
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground list-disc pl-5 marker:text-destructive/50">
                {currentScore.weaknesses.map((weak, i) => <li key={i} className="leading-relaxed">{weak}</li>)}
              </ul>
            </div>
          </div>

          {currentGaps.length > 0 && (
            <div className="md:col-span-2 mt-2 bg-card border border-border/50 rounded-xl p-6 shadow-sm overflow-hidden">
              <h3 className="text-xl font-bold mb-4">Identified Skill Gaps</h3>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3.5 rounded-l-md">Skill</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Impact</th>
                      <th className="px-4 py-3.5 rounded-r-md">Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {currentGaps.sort((a,b) => a.impact === 'critical' ? -1 : 1).map((gap) => (
                      <tr key={gap.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4 font-semibold text-card-foreground">{gap.skillName}</td>
                        <td className="px-4 py-4">
                          <span className="bg-secondary/80 px-2.5 py-1 rounded-md text-xs font-medium border border-border/50">{gap.category}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${gap.impact === 'critical' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-muted text-muted-foreground border border-border/50'}`}>
                            {gap.impact}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground whitespace-normal min-w-[300px] leading-relaxed">{gap.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 border-2 border-dashed border-border/50 rounded-xl">
          <p className="text-muted-foreground font-medium text-lg">Click "Evaluate Readiness" to generate your score and identify skill gaps.</p>
        </div>
      )}
    </div>
  );
}
