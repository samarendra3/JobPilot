"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatMonthLabel } from "@/lib/utils";
import type { TrendPoint } from "@/types/dashboard";

interface InterviewTrendChartProps {
  data: TrendPoint[];
}

export default function InterviewTrendChart({ data }: InterviewTrendChartProps) {
  const total = data.reduce((sum, point) => sum + point.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm font-medium text-foreground">No interview activity yet</p>
        <p className="text-sm text-muted-foreground">Interviews you schedule will show up here over time.</p>
      </div>
    );
  }

  const chartData = data.map((point) => ({ ...point, label: formatMonthLabel(point.date) }));
  const summary = chartData.map((point) => `${point.label}: ${point.count}`).join(", ");

  return (
    <div>
      <p className="sr-only">Interviews scheduled per month: {summary}.</p>
      <div className="h-64" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} stroke="var(--border)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} stroke="var(--border)" width={28} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)" }}
              labelStyle={{ color: "var(--popover-foreground)" }}
              itemStyle={{ color: "var(--popover-foreground)" }}
            />
            <Bar dataKey="count" name="Interviews" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
