import { APPLICATION_STATUS_LABELS } from "@/constants/application-status";
import { formatMonthLabel } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DashboardData } from "@/types/dashboard";

interface InsightsProps {
  data: DashboardData;
}

function buildInsights(data: DashboardData): string[] {
  const insights: string[] = [];

  if (data.stats.totalApplications > 0) {
    const top = [...data.statusDistribution].sort((a, b) => b.count - a.count)[0];
    if (top && top.count > 0) {
      insights.push(`Most applications are currently in ${APPLICATION_STATUS_LABELS[top.status]}.`);
    }
  }

  if (data.stats.upcomingInterviews > 0) {
    const label = data.stats.upcomingInterviews === 1 ? "interview" : "interviews";
    insights.push(`You have ${data.stats.upcomingInterviews} upcoming ${label}.`);
  }

  const busiestMonth = [...data.applicationTrend].sort((a, b) => b.count - a.count)[0];
  if (busiestMonth && busiestMonth.count > 0) {
    insights.push(`Your highest application activity was in ${formatMonthLabel(busiestMonth.date)}.`);
  }

  return insights;
}

export default function Insights({ data }: InsightsProps) {
  const insights = buildInsights(data);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {insights.map((insight) => (
            <li key={insight} className="text-sm text-foreground">
              {insight}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
