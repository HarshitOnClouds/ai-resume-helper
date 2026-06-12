"use client";

import { useState, useEffect } from "react";
import DiffView from "./DiffView";

const CACHE_KEY = "career_copilot_optimizer_cache";

const MODES = [
  {
    id: "jd",
    label: "Target a Job",
    icon: "🎯",
    description: "Paste a job description and AI will tailor your resume to beat ATS and match requirements.",
  },
  {
    id: "general",
    label: "General Improvement",
    icon: "✨",
    description: "No JD needed. AI will rewrite weak bullets into stronger impact statements.",
  },
];

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function OptimizerForm({ resumeText, profile }) {
  const [mode, setMode] = useState("jd");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cachedAt, setCachedAt] = useState(null);
  const [showingCached, setShowingCached] = useState(false);

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (cached?.result) {
        setResult(cached.result);
        setCachedAt(cached.cachedAt);
        setMode(cached.mode || "jd");
        setJobDescription(cached.jobDescription || "");
        setShowingCached(true);
      }
    } catch {
      // ignore malformed cache
    }
  }, []);

  const saveToCache = (result, mode, jobDescription) => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          result,
          mode,
          jobDescription,
          cachedAt: new Date().toISOString(),
        })
      );
      setCachedAt(new Date().toISOString());
    } catch {
      // ignore storage errors
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setResult(null);
    setCachedAt(null);
    setShowingCached(false);
    setJobDescription("");
    setMode("jd");
  };

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (mode === "jd" && !jobDescription.trim()) {
      setError("Please paste a job description to analyze against.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setShowingCached(false);

    try {
      const res = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: mode === "jd" ? jobDescription : null, mode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");

      setResult(data.optimization);
      saveToCache(data.optimization, mode, jobDescription);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cached result banner */}
      {showingCached && cachedAt && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3.5">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-xl">💾</span>
            <div>
              <span className="font-semibold text-amber-400">Showing cached results</span>
              <span className="text-muted-foreground ml-2">from {timeAgo(cachedAt)} — {mode === "jd" ? "Job-targeted optimization" : "General improvement"}</span>
            </div>
          </div>
          <button
            onClick={clearCache}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/50 px-3 py-1.5 rounded-lg transition-all"
          >
            Clear & Start Fresh
          </button>
        </div>
      )}

      <form onSubmit={handleOptimize} className="bg-card border border-border/50 rounded-xl p-6 shadow-sm space-y-6">
        {/* Mode Toggle */}
        <div>
          <label className="block text-sm font-semibold text-card-foreground mb-3">Optimization Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); setError(""); }}
                className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                  mode === m.id
                    ? "border-primary/60 bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border/50 hover:border-border hover:bg-muted/30"
                }`}
              >
                <span className="text-2xl mt-0.5">{m.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${mode === m.id ? "text-primary" : "text-card-foreground"}`}>{m.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{m.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {mode === "jd" && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-card-foreground">Target Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-52 border border-border/60 rounded-md px-3 py-2 bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              placeholder="Paste the full job description here (requirements, responsibilities, and qualifications)..."
            />
          </div>
        )}

        {mode === "general" && (
          <div className="bg-muted/30 border border-border/40 rounded-xl px-5 py-4 text-sm text-muted-foreground leading-relaxed">
            AI will analyze your entire resume and suggest improvements to make every bullet stronger — adding action verbs, quantifiable metrics, and technical depth where missing.
          </div>
        )}

        {error && (
          <p className="text-destructive font-medium bg-destructive/10 p-3 rounded-md border border-destructive/20 text-sm">{error}</p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
          >
            {loading ? "Analyzing via AI..." : mode === "jd" ? "Optimize for This Job" : "Improve My Resume"}
          </button>
          {cachedAt && !showingCached && (
            <button
              type="button"
              onClick={() => {
                try {
                  const raw = localStorage.getItem(CACHE_KEY);
                  if (raw) {
                    const cached = JSON.parse(raw);
                    setResult(cached.result);
                    setCachedAt(cached.cachedAt);
                    setShowingCached(true);
                  }
                } catch {}
              }}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground border border-border/50 hover:border-border px-4 py-2.5 rounded-md transition-all"
            >
              Restore Last Result
            </button>
          )}
        </div>
      </form>

      {result && <DiffView data={result} profile={profile} />}
    </div>
  );
}
