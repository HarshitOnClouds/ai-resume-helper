import Link from "next/link";
export default function DiffView({ data, profile }) {
  if (!data) return null;

  // Merge name/email from profile into the object for the PDF
  const pdfProfile = {
    ...profile,
    name: profile?.name || "Your Name",
    email: profile?.email || "",
  };

  return (
    <div className="space-y-8 mt-10">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-5 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold">Optimization Results</h2>
        <div className="flex items-center gap-3">
          <Link 
            href="/editor" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            ✍️ Open in Editor
          </Link>
        </div>
      </div>

      {/* ATS Score + Issues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Quality Score</h3>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" className="text-muted stroke-current" strokeWidth="12" fill="transparent" />
              <circle
                cx="64" cy="64" r="56"
                className={`${data.atsScore > 75 ? "text-green-500" : data.atsScore > 50 ? "text-yellow-500" : "text-red-500"} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="12" fill="transparent"
                strokeDasharray={`${(data.atsScore / 100) * 351} 351`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-4xl font-bold">{data.atsScore}</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Issues Detected
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 marker:text-destructive/50">
            {data.atsIssues.map((issue, i) => (
              <li key={i} className="leading-relaxed">{issue}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Diff View */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-6 border-b border-border/40 pb-3">AI Suggestions (Before → After)</h3>
        <div className="space-y-6">
          {data.optimizations.map((opt, i) => (
            <div key={i} className="border border-border/40 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between border-b border-border/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/50">{opt.section}</span>
                <span className="text-xs text-primary/80 font-medium ml-4 truncate max-w-xs hidden sm:block">💡 {opt.reasoning}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
                <div className="p-5 bg-red-50/30 dark:bg-red-900/10">
                  <div className="text-[11px] font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">Before</div>
                  <p className="text-sm line-through decoration-red-500/50 text-muted-foreground leading-relaxed">{opt.originalText}</p>
                </div>
                <div className="p-5 bg-green-50/30 dark:bg-green-900/10">
                  <div className="text-[11px] font-bold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wider">After</div>
                  <p className="text-sm text-foreground font-medium leading-relaxed">{opt.suggestedText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
