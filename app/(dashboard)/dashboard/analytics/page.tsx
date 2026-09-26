import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/services/dashboard.service";
import StatCard from "@/components/dashboard/stat-card";
import Insights from "@/components/analytics/insights";
import ApplicationStatusChart from "@/components/analytics/application-status-chart";
import ApplicationTrendChart from "@/components/analytics/application-trend-chart";
import InterviewTrendChart from "@/components/analytics/interview-trend-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, CalendarClock, Trophy, XCircle, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics | JobPilot",
  description: "Insights into your job search activity.",
};

export default async function AnalyticsPage() {
  const user = await requireUser();
  const data = await getDashboardData(user._id);
  const hasAnyData = data.stats.totalApplications > 0 || data.stats.totalInterviews > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Insights into your job search activity, last 6 months.</p>
      </div>

      {!hasAnyData ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics available yet"
          description="Add applications and interviews to see your job-search analytics."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Applications"
              value={data.stats.totalApplications}
              hint="Total applications"
              icon={Briefcase}
            />
            <StatCard
              label="Interviews"
              value={data.stats.totalInterviews}
              hint={`${data.stats.upcomingInterviews} upcoming`}
              icon={CalendarClock}
            />
            <StatCard label="Offers" value={data.stats.offer} hint="Offers received" icon={Trophy} />
            <StatCard
              label="Rejected"
              value={data.stats.rejected}
              hint="Applications rejected"
              icon={XCircle}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application status distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationStatusChart data={data.statusDistribution} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Application activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationTrendChart data={data.applicationTrend} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Interview activity</CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewTrendChart data={data.interviewTrend} />
            </CardContent>
          </Card>

          <Insights data={data} />
        </>
      )}
    </div>
  );
}
