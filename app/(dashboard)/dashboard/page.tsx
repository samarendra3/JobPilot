import type { Metadata } from "next";
import { Briefcase, CalendarClock, Trophy, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/services/dashboard.service";
import WelcomeHeader from "@/components/dashboard/welcome-header";
import StatCard from "@/components/dashboard/stat-card";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentApplications from "@/components/dashboard/recent-applications";
import UpcomingInterviews from "@/components/dashboard/upcoming-interviews";
import ApplicationStatusChart from "@/components/analytics/application-status-chart";
import ApplicationTrendChart from "@/components/analytics/application-trend-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard | JobPilot",
  description: "Your job search overview.",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user._id);

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHeader name={user.name} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Applications"
          value={data.stats.totalApplications}
          hint={data.stats.totalApplications === 0 ? "Start tracking your applications" : "Total applications"}
          icon={Briefcase}
        />
        <StatCard
          label="Interviews"
          value={data.stats.totalInterviews}
          hint={data.stats.upcomingInterviews > 0 ? `${data.stats.upcomingInterviews} upcoming` : "No interviews scheduled"}
          icon={CalendarClock}
        />
        <StatCard
          label="Offers"
          value={data.stats.offer}
          hint={data.stats.offer === 0 ? "No offers yet" : "Offers received"}
          icon={Trophy}
        />
        <StatCard
          label="Rejected"
          value={data.stats.rejected}
          hint={data.stats.rejected === 0 ? "No rejected applications" : "Applications rejected"}
          icon={XCircle}
        />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application status</CardTitle>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentApplications applications={data.recentApplications} />
        <UpcomingInterviews interviews={data.upcomingInterviews} />
      </div>
    </div>
  );
}
