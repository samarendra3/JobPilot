import Link from "next/link";
import {
  Rocket,
  Briefcase,
  CalendarClock,
  BarChart3,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Clock,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Briefcase,
    title: "Track every application",
    description: "Log companies, roles, status, and notes in one organized pipeline instead of scattered spreadsheets.",
  },
  {
    icon: CalendarClock,
    title: "Never miss an interview",
    description: "Schedule interviews against each application with interviewer details, meeting links, and reminders of what's upcoming.",
  },
  {
    icon: BarChart3,
    title: "See your progress",
    description: "Understand your pipeline at a glance with status breakdowns and activity trends over time.",
  },
  {
    icon: Sparkles,
    title: "AI-powered insights",
    description: "Get intelligent analysis on job descriptions to prepare faster and apply smarter.",
  },
];

const HIGHLIGHTS = [
  { icon: Sparkles, text: "Free to get started" },
  { icon: ShieldCheck, text: "Your data stays private" },
  { icon: Briefcase, text: "Built for job seekers, not recruiters" },
];

const PREVIEW_APPLICATIONS = [
  { company: "Acme Corp", role: "Senior Frontend Engineer", status: "Interview", variant: "primary" as const },
  { company: "Northwind Labs", role: "Product Designer", status: "Applied", variant: "info" as const },
  { company: "Globex Inc", role: "Backend Engineer", status: "Offer", variant: "success" as const },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Rocket aria-hidden="true" className="h-4.5 w-4.5 text-primary-foreground" />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">{siteConfig.name}</span>
          </div>

          <nav aria-label="Primary" className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-accent),transparent)]"
          />

          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8 lg:pt-28">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                  AI-Powered Job Application Intelligence
                </span>

                <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                  Your job search,
                  <br />
                  finally organized.
                </h1>

                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  JobPilot helps you track applications, manage interviews, and understand your progress
                  — so you can focus on landing the offer instead of managing spreadsheets.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link
                    href="/register"
                    className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
                  >
                    Start tracking for free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
                  >
                    Sign in
                  </Link>
                </div>

                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2 lg:items-start lg:justify-start">
                  {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                    <span key={text} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
                <div className="rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Applications</h2>
                    <Badge variant="neutral">3 active</Badge>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {PREVIEW_APPLICATIONS.map((app) => (
                      <div
                        key={app.company}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Building2 aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{app.company}</p>
                            <p className="truncate text-xs text-muted-foreground">{app.role}</p>
                          </div>
                        </div>
                        <Badge variant={app.variant} className="shrink-0">
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                    <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                    Interview reminders and status updates, all in one pipeline.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Everything you need to run your job search
              </h2>
              <p className="mt-3 text-muted-foreground">
                One place to track applications, prepare for interviews, and see what&apos;s working.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md sm:p-6"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="rounded-2xl border border-border bg-accent px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ready to take control of your job search?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Create a free account and add your first application in under a minute.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Get started for free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Built for job seekers.
          </p>
          <p>
            Built by Samarendra Barik ·{" "}
            <a
              href="https://github.com/samarendra3"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-foreground hover:underline"
            >
              GitHub
            </a>{" "}
            ·{" "}
            <a
              href="https://www.linkedin.com/in/samarendra-barik-92a3a8286"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-foreground hover:underline"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
