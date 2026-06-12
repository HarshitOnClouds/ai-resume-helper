"use client";

import { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import ResumePDF from "../components/ResumePDF";
import { useRouter } from "next/navigation";

export default function ResumeEditor({ profile }) {
  const router = useRouter();
  
  // Local form state holding all resume arrays and contact info
  const [formData, setFormData] = useState({
    skills: profile?.skills || [],
    experience: profile?.experience || [],
    projects: profile?.projects || [],
    education: profile?.education || [],
    certifications: profile?.certifications || [],
    achievements: profile?.achievements || [],
    contactInfo: profile?.contactInfo || { phone: "", github: "", linkedin: "", portfolio: "" }
  });

  const [imageBase64, setImageBase64] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [appliedCache, setAppliedCache] = useState(false);
  const [previewProfile, setPreviewProfile] = useState(profile);

  // Load local image and check optimizer cache on mount
  useEffect(() => {
    // 1. Load Image
    const savedImage = localStorage.getItem("resume_profile_image");
    if (savedImage) setImageBase64(savedImage);

    // 2. Load Optimizer Cache
    try {
      const cache = localStorage.getItem("career_copilot_optimizer_cache");
      if (cache) {
        const parsed = JSON.parse(cache);
        if (parsed?.result?.optimizations?.length > 0) {
          applyOptimizationsToState(parsed.result.optimizations);
          setAppliedCache(true);
        }
      }
    } catch (e) {
      console.error("Failed to load optimizer cache", e);
    }
  }, []);

  const applyOptimizationsToState = (opts) => {
    setFormData(prev => {
      const next = { ...prev };
      
      // Helper to replace text in an array of objects
      const applyToDescriptions = (arr) => arr.map(item => {
        let newDesc = item.description || "";
        opts.forEach(opt => {
          if (opt.originalText && opt.suggestedText) {
            newDesc = newDesc.replace(opt.originalText, opt.suggestedText);
          }
        });
        return { ...item, description: newDesc };
      });

      next.experience = applyToDescriptions(next.experience);
      next.projects = applyToDescriptions(next.projects);
      
      // Update preview immediately on mount if optimisations applied
      setPreviewProfile({ ...profile, ...next });
      
      return next;
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      localStorage.setItem("resume_profile_image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageBase64("");
    localStorage.removeItem("resume_profile_image");
  };

  // Generic array handlers
  const updateItem = (section, index, field, value) => {
    const newList = [...formData[section]];
    newList[index] = { ...newList[index], [field]: value };
    setFormData({ ...formData, [section]: newList });
  };

  const removeItem = (section, index) => {
    const newList = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: newList });
  };

  const addItem = (section, defaultObj) => {
    setFormData({ ...formData, [section]: [...formData[section], defaultObj] });
  };

  // String array handlers (skills, certs, achievements)
  const updateStringItem = (section, index, value) => {
    const newList = [...formData[section]];
    newList[index] = value;
    setFormData({ ...formData, [section]: newList });
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to save profile");
      setMessage({ text: "Profile saved successfully!", type: "success" });
      router.refresh();
    } catch (e) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleRefreshPreview = () => {
    setPreviewProfile({
      ...profile,
      ...formData,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      
      {/* LEFT: Editor Form */}
      <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-8 custom-scrollbar">
        
        {/* Actions & Status */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-4">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-md font-semibold text-sm shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {message.text && (
              <span className={`text-sm font-medium ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
                {message.text}
              </span>
            )}
          </div>
          {appliedCache && (
            <span className="text-xs bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full border border-amber-500/20 font-medium">
              ✨ AI Optimizations Applied
            </span>
          )}
        </div>

        {/* Contact Info & Photo */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-border/40 pb-2">Profile & Contact</h2>
          
          <div className="flex gap-6 items-start">
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="w-24 h-32 rounded-md border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden bg-muted/20 relative group">
                {imageBase64 ? (
                  <>
                    <img src={imageBase64} alt="Profile" className="w-full h-full object-cover" />
                    <button onClick={handleClearImage} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold transition-opacity">
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="text-3xl text-muted-foreground/30">📷</span>
                )}
              </div>
              <label className="cursor-pointer text-xs font-semibold text-primary hover:underline">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Phone Number</label>
                <input type="text" value={formData.contactInfo.phone || ""} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, phone: e.target.value}})} className="w-full bg-card border border-border/50 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">LinkedIn URL</label>
                <input type="text" value={formData.contactInfo.linkedin || ""} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, linkedin: e.target.value}})} className="w-full bg-card border border-border/50 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="linkedin.com/in/username" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">GitHub URL</label>
                <input type="text" value={formData.contactInfo.github || ""} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, github: e.target.value}})} className="w-full bg-card border border-border/50 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="github.com/username" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Portfolio / Website</label>
                <input type="text" value={formData.contactInfo.portfolio || ""} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, portfolio: e.target.value}})} className="w-full bg-card border border-border/50 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="johndoe.com" />
              </div>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h2 className="text-xl font-bold">Experience</h2>
            <button onClick={() => addItem("experience", { company: "", role: "", startDate: "", endDate: "", description: "" })} className="text-xs font-semibold text-primary hover:underline">+ Add</button>
          </div>
          <div className="space-y-4">
            {formData.experience.map((exp, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-lg p-4 space-y-3 relative group">
                <button onClick={() => removeItem("experience", i)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={exp.role || ""} onChange={e => updateItem("experience", i, "role", e.target.value)} placeholder="Role (e.g. Software Engineer)" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                  <input type="text" value={exp.company || ""} onChange={e => updateItem("experience", i, "company", e.target.value)} placeholder="Company" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                  <input type="text" value={exp.startDate || ""} onChange={e => updateItem("experience", i, "startDate", e.target.value)} placeholder="Start Date" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                  <input type="text" value={exp.endDate || ""} onChange={e => updateItem("experience", i, "endDate", e.target.value)} placeholder="End Date" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                </div>
                <textarea value={exp.description || ""} onChange={e => updateItem("experience", i, "description", e.target.value)} placeholder="Bullet points (can be paragraph or newlines)" className="w-full h-24 bg-background border border-border/40 rounded px-2.5 py-2 text-sm outline-none focus:border-primary/50 resize-y" />
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h2 className="text-xl font-bold">Projects</h2>
            <button onClick={() => addItem("projects", { name: "", technologies: [], description: "" })} className="text-xs font-semibold text-primary hover:underline">+ Add</button>
          </div>
          <div className="space-y-4">
            {formData.projects.map((proj, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-lg p-4 space-y-3 relative group">
                <button onClick={() => removeItem("projects", i)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={proj.name || ""} onChange={e => updateItem("projects", i, "name", e.target.value)} placeholder="Project Name" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                  <input type="text" value={(proj.technologies || []).join(", ")} onChange={e => updateItem("projects", i, "technologies", e.target.value.split(",").map(t=>t.trim()).filter(Boolean))} placeholder="Technologies (comma separated)" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                </div>
                <textarea value={proj.description || ""} onChange={e => updateItem("projects", i, "description", e.target.value)} placeholder="Project description or bullet points" className="w-full h-24 bg-background border border-border/40 rounded px-2.5 py-2 text-sm outline-none focus:border-primary/50 resize-y" />
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h2 className="text-xl font-bold">Education</h2>
            <button onClick={() => addItem("education", { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" })} className="text-xs font-semibold text-primary hover:underline">+ Add</button>
          </div>
          <div className="space-y-4">
            {formData.education.map((edu, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-lg p-4 grid grid-cols-2 gap-3 relative group">
                <button onClick={() => removeItem("education", i)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                <input type="text" value={edu.institution || ""} onChange={e => updateItem("education", i, "institution", e.target.value)} placeholder="Institution" className="col-span-2 bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                <input type="text" value={edu.degree || ""} onChange={e => updateItem("education", i, "degree", e.target.value)} placeholder="Degree" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                <input type="text" value={edu.fieldOfStudy || ""} onChange={e => updateItem("education", i, "fieldOfStudy", e.target.value)} placeholder="Field of Study" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                <input type="text" value={edu.startDate || ""} onChange={e => updateItem("education", i, "startDate", e.target.value)} placeholder="Start Date" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
                <input type="text" value={edu.endDate || ""} onChange={e => updateItem("education", i, "endDate", e.target.value)} placeholder="End Date" className="bg-background border border-border/40 rounded px-2.5 py-1.5 text-sm outline-none focus:border-primary/50" />
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h2 className="text-xl font-bold">Skills</h2>
          </div>
          <textarea 
            value={formData.skills.join(", ")} 
            onChange={e => setFormData({...formData, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})}
            className="w-full h-24 bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-y" 
            placeholder="Comma separated skills (e.g. React, Node.js, Python)"
          />
        </section>

        {/* Certifications */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h2 className="text-xl font-bold">Certifications</h2>
          </div>
          <textarea 
            value={formData.certifications.join("\n")} 
            onChange={e => setFormData({...formData, certifications: e.target.value.split("\n").filter(Boolean)})}
            className="w-full h-24 bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-y" 
            placeholder="One certification per line"
          />
        </section>

        {/* Achievements */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h2 className="text-xl font-bold">Achievements</h2>
          </div>
          <textarea 
            value={formData.achievements.join("\n")} 
            onChange={e => setFormData({...formData, achievements: e.target.value.split("\n").filter(Boolean)})}
            className="w-full h-24 bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-y" 
            placeholder="One achievement per line"
          />
        </section>

      </div>

      {/* RIGHT: Live PDF Preview */}
      <div className="hidden lg:block w-[45%] h-full border border-border/50 rounded-xl overflow-hidden bg-muted/20 shadow-inner relative flex flex-col">
        <div className="h-12 bg-card border-b border-border/50 flex items-center justify-between px-4 z-10 shadow-sm shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">PDF Preview</span>
          <button 
            onClick={handleRefreshPreview}
            className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded transition-colors"
          >
            ↻ Refresh Preview
          </button>
        </div>
        <div className="w-full flex-1 min-h-[800px]">
          <PDFViewer width="100%" height="100%" style={{ minHeight: '800px' }} className="border-none">
            <ResumePDF profile={previewProfile} profileImageBase64={imageBase64} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
