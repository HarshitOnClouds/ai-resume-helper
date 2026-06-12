"use client";

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── PDF Styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a", lineHeight: 1.4 },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  contactRow: { fontSize: 9, color: "#555", marginBottom: 8, flexDirection: "row", gap: 12 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 2, marginTop: 10, marginBottom: 6 },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  entryMeta: { fontSize: 9, color: "#555", marginBottom: 2 },
  bullet: { marginLeft: 10, marginBottom: 2 },
  skillRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  skillChip: { fontSize: 9, backgroundColor: "#f0f0f0", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});

// ─── Apply optimizations: replace originalText → suggestedText in a string ───
function applyOptimizations(text, optimizations) {
  if (!text || !optimizations?.length) return text;
  let result = text;
  for (const opt of optimizations) {
    if (opt.originalText && opt.suggestedText) {
      result = result.replace(opt.originalText, opt.suggestedText);
    }
  }
  return result;
}

// ─── Split a description string into individual bullet lines ─────────────────
function splitBullets(text) {
  if (!text) return [];
  
  // First, check for explicit newlines or bullet/dash markers
  let lines = text
    .split(/\n|(?=\s*[•\-\*]\s)/)
    .map((l) => l.replace(/^[\s•\-\*]+/, "").trim())
    .filter(Boolean);
    
  // If the parser squashed it all into one line and it's long, 
  // forcefully split it by sentence-ending punctuation.
  if (lines.length <= 1 && text.length > 50) {
    lines = text
      // Split after a period, exclamation mark, question mark, or semicolon
      // that is followed by a space or the end of the string.
      .split(/(?<=[.?!;])\s+/)
      .map(l => l.trim())
      .filter(Boolean);
  }
  
  return lines.length ? lines : [text.trim()];
}

// ─── Full Resume PDF Document ─────────────────────────────────────────────────
function ResumePDF({ profile, optimizations }) {
  const opts = optimizations || [];
  const apply = (text) => applyOptimizations(text, opts);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <Text style={s.name}>{profile?.name || "Your Name"}</Text>
        <View style={s.contactRow}>
          {profile?.email && <Text>{profile.email}</Text>}
        </View>

        {/* Education */}
        {profile?.education?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Education</Text>
            {profile.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={s.entryTitle}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</Text>
                <Text style={s.entryMeta}>{edu.institution}{edu.startDate ? ` · ${edu.startDate}${edu.endDate ? ` – ${edu.endDate}` : ""}` : ""}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {profile?.skills?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Skills</Text>
            <View style={s.skillRow}>
              {profile.skills.map((skill, i) => (
                <Text key={i} style={s.skillChip}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {profile?.experience?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Experience</Text>
            {profile.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={s.entryTitle}>{exp.role} — {exp.company}</Text>
                <Text style={s.entryMeta}>{exp.startDate || ""}{exp.endDate ? ` – ${exp.endDate}` : ""}</Text>
                {splitBullets(apply(exp.description || "")).map((line, j) => (
                  <Text key={j} style={s.bullet}>• {line}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {profile?.projects?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Projects</Text>
            {profile.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={s.entryTitle}>{proj.name}</Text>
                {proj.technologies?.length > 0 && (
                  <Text style={s.entryMeta}>{proj.technologies.join(", ")}</Text>
                )}
                {splitBullets(apply(proj.description || "")).map((line, j) => (
                  <Text key={j} style={s.bullet}>• {line}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {profile?.certifications?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Certifications</Text>
            {profile.certifications.map((cert, i) => (
              <Text key={i} style={s.bullet}>• {cert}</Text>
            ))}
          </View>
        )}

        {/* Achievements */}
        {profile?.achievements?.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Achievements</Text>
            {profile.achievements.map((ach, i) => (
              <Text key={i} style={s.bullet}>• {ach}</Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

// ─── Main DiffView Component ─────────────────────────────────────────────────
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
        <PDFDownloadLink
          document={<ResumePDF profile={pdfProfile} optimizations={data.optimizations} />}
          fileName="optimized-resume.pdf"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          {({ loading }) => (loading ? "Generating PDF…" : "⬇ Download Full Resume PDF")}
        </PDFDownloadLink>
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
