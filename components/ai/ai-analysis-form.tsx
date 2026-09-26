"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { Application } from "@/types/application";
import type { AIAnalysis } from "@/types/ai";
import { Card } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  applications: Application[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AIAnalysisForm({ applications }: Props) {
  const [applicationId, setApplicationId] = useState(applications[0]?._id || "");
  const selected = useMemo(() => applications.find((item) => item._id === applicationId), [applications, applicationId]);
  const [jobDescription, setJobDescription] = useState(selected?.description || "");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(() => Boolean(selected));
  const [error, setError] = useState("");
  const [prevApplicationId, setPrevApplicationId] = useState(applicationId);

  if (applicationId !== prevApplicationId) {
    setPrevApplicationId(applicationId);
    setJobDescription(selected?.description || "");
    setAnalysis(null);
    setError("");
    setLoadingPrevious(Boolean(selected));
  }

  useEffect(() => {
    if (!selected) return;

    let active = true;
    fetch(`/api/ai/job-analysis?applicationId=${encodeURIComponent(selected._id)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error || "Unable to load previous analysis");
        if (active) setAnalysis(body.data?.analysis || null);
      })
      .catch(() => {
        if (active) setAnalysis(null);
      })
      .finally(() => {
        if (active) setLoadingPrevious(false);
      });

    return () => {
      active = false;
    };
  }, [selected]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    if (!applicationId) {
      setError("Select an application first.");
      return;
    }
    if (jobDescription.trim().length < 50) {
      setError("Job description must be at least 50 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/job-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, jobDescription, resumeText }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || body?.message || "Analysis failed");
      setAnalysis(body.data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-3 text-sm font-semibold text-foreground">Add an application first</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          AI analysis is linked to an application so your results stay organized with the job you are targeting.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="p-5">
        <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-muted p-2 text-foreground"><Sparkles className="h-5 w-5" aria-hidden="true" /></div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Analyze a job</h2>
            <p className="mt-1 text-sm text-muted-foreground">Compare the job with your profile and get targeted preparation guidance.</p>
          </div>
        </div>

        <div className="mt-5">
          <Label htmlFor="application">Application</Label>
          <Select
            id="application"
            value={applicationId}
            onChange={(event) => setApplicationId(event.target.value)}
          >
            {applications.map((application) => (
              <option key={application._id} value={application._id}>
                {application.company} — {application.jobTitle}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4">
          <Label htmlFor="jobDescription" required>Job description</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            rows={12}
            maxLength={20000}
            placeholder="Paste the complete job description here..."
            required
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Use the actual job description. Minimum 50 characters.</p>
        </div>

        <div className="mt-4">
          <Label htmlFor="resumeText">Additional resume context <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea
            id="resumeText"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            rows={7}
            maxLength={20000}
            placeholder="Paste relevant resume content if you want the analysis to consider it..."
          />
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          isLoading={loading}
          size="lg"
          className="mt-5 w-full"
        >
          {!loading && <Sparkles className="h-4 w-4" aria-hidden="true" />}
          {loading ? "Analyzing..." : "Analyze with AI"}
        </Button>
        </form>
      </Card>

      <Card className="p-5" aria-live="polite">
        {loadingPrevious && !analysis ? (
          <div className="flex min-h-[420px] items-center justify-center text-sm text-muted-foreground">Loading previous analysis...</div>
        ) : !analysis ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold text-foreground">Your analysis will appear here</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Run an analysis to see your match score, skills, recommendations, keywords, and interview questions.</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Latest analysis</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">{selected?.company} — {selected?.jobTitle}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Generated {formatDate(analysis.createdAt)}</p>
              </div>
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-border">
                <span className="text-xl font-bold text-foreground">{analysis.matchScore}</span>
                <span className="text-[10px] text-muted-foreground">match</span>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-muted p-4 text-sm leading-6 text-foreground">{analysis.summary}</div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SkillList title="Matched skills" items={analysis.matchedSkills} empty="No matched skills identified." variant="success" />
              <SkillList title="Skill gaps" items={analysis.missingSkills} empty="No major gaps identified." variant="warning" />
              <ResultList title="Resume keywords" items={analysis.resumeKeywords} empty="No keywords identified." />
              <ResultList title="Recommendations" items={analysis.suggestions} empty="No additional recommendations." />
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-foreground">Interview questions</h3>
              <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
                {analysis.interviewQuestions.length ? analysis.interviewQuestions.map((question, index) => (
                  <li key={`${question}-${index}`} className="rounded-md border border-border px-3 py-2">{index + 1}. {question}</li>
                )) : <li className="text-muted-foreground">No questions generated.</li>}
              </ol>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function SkillList({
  title,
  items,
  empty,
  variant,
}: {
  title: string;
  items: string[];
  empty: string;
  variant: "success" | "warning";
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <Badge key={`${item}-${index}`} variant={variant}>
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function ResultList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length ? (
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {items.map((item, index) => <li key={`${item}-${index}`} className="rounded-md bg-muted px-3 py-2">{item}</li>)}
        </ul>
      ) : <p className="mt-2 text-sm text-muted-foreground">{empty}</p>}
    </div>
  );
}
