"use client";

import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from "@react-pdf/renderer";

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
      .split(/(?<=[.?!;])\s+/)
      .map(l => l.trim())
      .filter(Boolean);
  }
  
  return lines.length ? lines : [text.trim()];
}

// ─── PDF Styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a", lineHeight: 1.4 },
  
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 16
  },
  headerTextContainer: {
    flexDirection: "column",
    flex: 1
  },
  profileImage: {
    width: 90,
    height: 120,
    borderRadius: 4,
    objectFit: "cover",
  },
  
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  contactCol: { fontSize: 9, color: "#555", marginBottom: 8 , flexDirection: "column"},
  contactItem: { marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 2, marginTop: 10, marginBottom: 6 },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  entryMeta: { fontSize: 9, color: "#555", marginBottom: 2 },
  bullet: { marginLeft: 10, marginBottom: 2 },
  skillRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  skillChip: { fontSize: 9, backgroundColor: "#f0f0f0", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});

// ─── Full Resume PDF Document ─────────────────────────────────────────────────
export default function ResumePDF({ profile, optimizations, profileImageBase64 }) {
  const opts = optimizations || [];
  const apply = (text) => applyOptimizations(text, opts);

  // Extract contact info
  const contactInfo = profile?.contactInfo || {};

  return (
    <Document>
      <Page size="A4" style={s.page}>
        
        {/* Header Section (Image + Name/Contact) */}
        <View style={s.headerContainer}>
          {profileImageBase64 && (
            <PDFImage src={profileImageBase64} style={s.profileImage} />
          )}
          
          <View style={s.headerTextContainer}>
            <Text style={s.name}>{profile?.name || "Your Name"}</Text>
            <View style={s.contactCol}>
              {profile?.email && <Text style={s.contactItem}>{profile.email}</Text>}
              {contactInfo.phone && <Text style={s.contactItem}>{contactInfo.phone}</Text>}
              {contactInfo.github && <Text style={s.contactItem}>{contactInfo.github}</Text>}
              {contactInfo.linkedin && <Text style={s.contactItem}>{contactInfo.linkedin}</Text>}
              {contactInfo.portfolio && <Text style={s.contactItem}>{contactInfo.portfolio}</Text>}
            </View>
          </View>
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
