"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KanbanBoard({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("Software Engineer");
  const router = useRouter();

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic UI update
    const previousItems = [...items];
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));

    try {
      const res = await fetch("/api/roadmap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (err) {
      console.error(err);
      setItems(previousItems); // revert on failure
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setItems(data.roadmap);
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: "pending", title: "To Do", bg: "bg-muted/30" },
    { id: "in_progress", title: "In Progress", bg: "bg-blue-50/50 dark:bg-blue-900/10" },
    { id: "done", title: "Done", bg: "bg-green-50/50 dark:bg-green-900/10" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-5 border border-border/50 rounded-xl shadow-sm">
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Role</label>
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)}
            className="w-full border border-border/60 rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="Software Engineer">Software Engineer</option>
          </select>
        </div>
        <div className="mt-5">
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full sm:w-auto bg-primary text-primary-foreground px-5 py-2 rounded-md font-semibold text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
          >
            {loading ? "Generating Roadmap..." : "Generate AI Roadmap"}
          </button>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <div className="text-center py-16 border-2 border-dashed border-border/60 rounded-xl bg-muted/10">
          <h3 className="text-lg font-semibold mb-2 text-card-foreground">No Action Items</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            You don't have an active roadmap yet. Select a role and click generate to let AI create a personalized plan based on your skill gaps.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map(col => (
            <div key={col.id} className={`${col.bg} border border-border/50 rounded-2xl p-4 min-h-[500px] flex flex-col`}>
              <h2 className="font-semibold text-lg mb-4 flex items-center justify-between pb-2 border-b border-border/40">
                {col.title}
                <span className="text-xs bg-background border border-border shadow-sm text-foreground px-2.5 py-1 rounded-full">
                  {items.filter(i => i.status === col.id).length}
                </span>
              </h2>
              <div className="space-y-4 flex-1">
                {items.filter(item => item.status === col.id).map(item => (
                  <div key={item.id} className="bg-card border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        item.expectedImpact === 'high' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 
                        item.expectedImpact === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 
                        'bg-muted text-muted-foreground border border-border/50'
                      }`}>
                        {item.expectedImpact} Impact
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-medium flex items-center gap-1.5 border border-border/40">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {item.effortEstimate}
                      </span>
                    </div>
                    <h3 className="font-bold text-card-foreground mb-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    
                    <div className="mt-4 pt-3 border-t border-border/40 flex gap-2">
                      {col.id !== 'pending' && (
                        <button onClick={() => handleStatusChange(item.id, 'pending')} className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex-1 text-center bg-muted/50 hover:bg-muted py-1.5 rounded-md">To Do</button>
                      )}
                      {col.id !== 'in_progress' && (
                        <button onClick={() => handleStatusChange(item.id, 'in_progress')} className="text-xs font-semibold text-muted-foreground hover:text-blue-500 transition-colors flex-1 text-center bg-muted/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-1.5 rounded-md">Start</button>
                      )}
                      {col.id !== 'done' && (
                        <button onClick={() => handleStatusChange(item.id, 'done')} className="text-xs font-semibold text-muted-foreground hover:text-green-500 transition-colors flex-1 text-center bg-muted/50 hover:bg-green-50 dark:hover:bg-green-900/20 py-1.5 rounded-md">Finish</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
