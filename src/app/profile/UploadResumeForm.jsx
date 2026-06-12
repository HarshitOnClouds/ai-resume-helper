"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadResumeForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage("Resume parsed successfully!");
      router.refresh(); // Refresh the page to load new profile data
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="bg-card border border-border/50 rounded-xl p-6 shadow-sm max-w-md">
      <div className="space-y-5">
        <div>
          <label htmlFor="resume" className="block text-sm font-semibold mb-2">
            Upload Resume
          </label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="resume" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF or DOCX (MAX. 5MB)</p>
              </div>
              <input
                id="resume"
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setMessage("");
                }}
                className="hidden"
              />
            </label>
          </div>
          {file && (
            <p className="text-sm mt-3 font-medium text-primary">Selected: {file.name}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-md font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? "Parsing Resume via AI..." : "Upload & Extract Profile"}
        </button>
        {message && (
          <p className={`text-sm font-medium ${message.includes("success") ? "text-green-500" : "text-destructive"}`}>
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
