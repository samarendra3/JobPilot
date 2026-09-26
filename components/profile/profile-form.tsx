"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicUser, ExperienceEntry, EducationEntry } from "@/types/user";

interface Props { initialUser: PublicUser }

const emptyExperience = (): ExperienceEntry => ({ title: "", company: "", startDate: "", endDate: "", description: "" });
const emptyEducation = (): EducationEntry => ({ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" });

function inputClass() {
  return "mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProfileForm({ initialUser }: Props) {
  const [name, setName] = useState(initialUser.name);
  const [headline, setHeadline] = useState(initialUser.headline || "");
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [location, setLocation] = useState(initialUser.location || "");
  const [image, setImage] = useState(initialUser.image || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialUser.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(initialUser.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialUser.portfolioUrl || "");
  const [skills, setSkills] = useState(initialUser.skills.join(", "));
  const [resumeText, setResumeText] = useState(initialUser.resumeText || "");
  const [experience, setExperience] = useState<ExperienceEntry[]>(initialUser.experience || []);
  const [education, setEducation] = useState<EducationEntry[]>(initialUser.education || []);
  const [resume, setResume] = useState(initialUser.resume || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const skillPreview = useMemo(
    () => skills.split(",").map((item) => item.trim()).filter(Boolean),
    [skills]
  );

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const normalizedImage = normalizeUrl(image);
      const normalizedLinkedin = normalizeUrl(linkedinUrl);
      const normalizedGithub = normalizeUrl(githubUrl);
      const normalizedPortfolio = normalizeUrl(portfolioUrl);
      setImage(normalizedImage);
      setLinkedinUrl(normalizedLinkedin);
      setGithubUrl(normalizedGithub);
      setPortfolioUrl(normalizedPortfolio);

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, headline, phone, location,
          image: normalizedImage,
          linkedinUrl: normalizedLinkedin,
          githubUrl: normalizedGithub,
          portfolioUrl: normalizedPortfolio,
          skills: skillPreview,
          experience,
          education,
          resumeText,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        const fieldError = body?.errors?.[0];
        const message = fieldError
          ? `${fieldError.path}: ${fieldError.message}`
          : body?.error || "Unable to save profile";
        throw new Error(message);
      }

      setResume(body.data.user.resume || null);
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function uploadResume(file: File) {
    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/profile/resume", { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Resume upload failed");

      const uploaded = body.data.resume;
      setResume({ ...uploaded, updatedAt: new Date().toISOString() });
      setMessage("Resume uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteResume() {
    if (!window.confirm("Delete your uploaded resume?")) return;
    setDeletingResume(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile/resume/delete", { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Unable to delete resume");
      setResume(null);
      setMessage("Resume deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete resume");
    } finally {
      setDeletingResume(false);
    }
  }

  function updateExperience(index: number, key: keyof ExperienceEntry, value: string) {
    setExperience((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  function updateEducation(index: number, key: keyof EducationEntry, value: string) {
    setEducation((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground">Basic information</h2>
          <p className="text-sm text-muted-foreground">Your identity and professional contact details.</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-foreground">Full name<input className={inputClass()} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></label>
          <label className="text-sm font-medium text-foreground">Email<input className={`${inputClass()} bg-muted`} value={initialUser.email} readOnly /></label>
          <label className="text-sm font-medium text-foreground">Professional headline<input className={inputClass()} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Full-stack developer" /></label>
          <label className="text-sm font-medium text-foreground">Phone<input className={inputClass()} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" /></label>
          <label className="text-sm font-medium text-foreground">Location<input className={inputClass()} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bhubaneswar, India" /></label>
          <label className="text-sm font-medium text-foreground">Profile image URL<input className={inputClass()} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." /></label>
          <label className="text-sm font-medium text-foreground">LinkedIn URL<input className={inputClass()} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." /></label>
          <label className="text-sm font-medium text-foreground">GitHub URL<input className={inputClass()} value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." /></label>
          <label className="text-sm font-medium text-foreground md:col-span-2">Portfolio URL<input className={inputClass()} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." /></label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground">Skills</h2>
          <p className="text-sm text-muted-foreground">Separate skills with commas. These are also used by AI Job Analysis.</p>
        </div>
        <input className={inputClass()} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Next.js, TypeScript, MongoDB" />
        <div className="mt-3 flex flex-wrap gap-2">
          {skillPreview.map((skill) => <Badge key={skill} variant="neutral">{skill}</Badge>)}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div><h2 className="text-base font-semibold text-foreground">Experience</h2><p className="text-sm text-muted-foreground">Build a structured work history for applications and AI analysis.</p></div>
          <button type="button" onClick={() => setExperience((items) => [...items, emptyExperience()])} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add</button>
        </div>

        <div className="mt-5 space-y-5">
          {experience.map((entry, index) => (
            <div key={index} className="rounded-lg border border-border p-4">
              <div className="flex justify-end"><button type="button" onClick={() => setExperience((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" />Remove</button></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-foreground">Job title<input className={inputClass()} value={entry.title} onChange={(e) => updateExperience(index, "title", e.target.value)} /></label>
                <label className="text-sm font-medium text-foreground">Company<input className={inputClass()} value={entry.company} onChange={(e) => updateExperience(index, "company", e.target.value)} /></label>
                <label className="text-sm font-medium text-foreground">Start date<input type="month" className={inputClass()} value={entry.startDate || ""} onChange={(e) => updateExperience(index, "startDate", e.target.value)} /></label>
                <label className="text-sm font-medium text-foreground">End date<input type="month" className={inputClass()} value={entry.endDate || ""} onChange={(e) => updateExperience(index, "endDate", e.target.value)} /></label>
                <label className="text-sm font-medium text-foreground md:col-span-2">Description<textarea className={inputClass()} rows={4} value={entry.description || ""} onChange={(e) => updateExperience(index, "description", e.target.value)} /></label>
              </div>
            </div>
          ))}
          {!experience.length && <p className="py-4 text-center text-sm text-muted-foreground">No experience added yet.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div><h2 className="text-base font-semibold text-foreground">Education</h2><p className="text-sm text-muted-foreground">Keep your education history available for your profile.</p></div>
          <button type="button" onClick={() => setEducation((items) => [...items, emptyEducation()])} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"><Plus className="h-4 w-4" />Add</button>
        </div>

        <div className="mt-5 space-y-5">
          {education.map((entry, index) => (
            <div key={index} className="rounded-lg border border-border p-4">
              <div className="flex justify-end"><button type="button" onClick={() => setEducation((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" />Remove</button></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-foreground">Institution<input className={inputClass()} value={entry.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} /></label>
                <label className="text-sm font-medium text-foreground">Degree<input className={inputClass()} value={entry.degree || ""} onChange={(e) => updateEducation(index, "degree", e.target.value)} /></label>
                <label className="text-sm font-medium text-foreground">Field of study<input className={inputClass()} value={entry.fieldOfStudy || ""} onChange={(e) => updateEducation(index, "fieldOfStudy", e.target.value)} /></label>
                <label className="text-sm font-medium text-foreground">Start date<input type="month" className={inputClass()} value={entry.startDate || ""} onChange={(e) => updateEducation(index, "startDate", e.target.value)} /></label>
                <label className="text-sm font-medium text-foreground">End date<input type="month" className={inputClass()} value={entry.endDate || ""} onChange={(e) => updateEducation(index, "endDate", e.target.value)} /></label>
              </div>
            </div>
          ))}
          {!education.length && <p className="py-4 text-center text-sm text-muted-foreground">No education added yet.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="border-b border-border pb-4"><h2 className="text-base font-semibold text-foreground">Resume</h2><p className="text-sm text-muted-foreground">Upload a PDF or DOCX up to 4 MB and optionally keep resume text for AI analysis.</p></div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2"><FileText className="h-5 w-5 text-muted-foreground" /></div>
            {resume ? <div><p className="text-sm font-medium text-foreground">{resume.fileName}</p><p className="text-xs text-muted-foreground">{formatBytes(resume.size)}</p></div> : <p className="text-sm text-muted-foreground">No resume uploaded.</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload resume"}
              <input type="file" className="sr-only" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadResume(file); e.currentTarget.value = ""; }} />
            </label>
            {resume && <a href="/api/profile/resume/download" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"><Download className="h-4 w-4" />Download</a>}
            {resume && <button type="button" disabled={deletingResume} onClick={() => void deleteResume()} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"><Trash2 className="h-4 w-4" />{deletingResume ? "Deleting..." : "Delete"}</button>}
          </div>
        </div>

        <label className="mt-5 block text-sm font-medium text-foreground">Resume text for AI analysis<textarea className={inputClass()} rows={10} maxLength={30000} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume text here. This lets JobPilot use your resume content during AI job analysis." /></label>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          {message && <p className="text-emerald-600">{message}</p>}
          {error && <p role="alert" className="text-destructive">{error}</p>}
        </div>
        <button type="button" onClick={() => void saveProfile()} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}
