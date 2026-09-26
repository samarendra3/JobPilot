"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from "@/constants/application-status";
import type { StatusDistributionEntry } from "@/types/dashboard";

interface ApplicationStatusChartProps {
  data: StatusDistributionEntry[];
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SAVED: "#94a3b8",
  APPLIED: "#3b82f6",
  SCREENING: "#f59e0b",
  INTERVIEW: "#a855f7",
  OFFER: "#10b981",
  REJECTED: "#ef4444",
  WITHDRAWN: "#64748b",
};

export default function ApplicationStatusChart({ data }: ApplicationStatusChartProps) {
  const nonZero = data.filter((entry) => entry.count > 0);
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm font-medium text-foreground">No application data yet</p>
        <p className="text-sm text-muted-foreground">Add applications to see your status breakdown.</p>
      </div>
    );
  }

  const summary = nonZero
    .map((entry) => `${entry.count} ${APPLICATION_STATUS_LABELS[entry.status].toLowerCase()}`)
    .join(", ");

  return (
    <div>
      <p className="sr-only">Applications by status: {summary}.</p>
      <div className="h-64" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={nonZero}
              dataKey="count"
              nameKey="status"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
            >
              {nonZero.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, APPLICATION_STATUS_LABELS[name as ApplicationStatus]]}
              contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)" }}
              labelStyle={{ color: "var(--popover-foreground)" }}
              itemStyle={{ color: "var(--popover-foreground)" }}
            />
            <Legend
              formatter={(value: string) => APPLICATION_STATUS_LABELS[value as ApplicationStatus]}
              wrapperStyle={{ color: "var(--muted-foreground)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground sm:grid-cols-3">
        {nonZero.map((entry) => (
          <li key={entry.status} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[entry.status] }}
            />
            {APPLICATION_STATUS_LABELS[entry.status]}: {entry.count}
          </li>
        ))}
      </ul>
    </div>
  );
}
