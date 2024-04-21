"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { StatsItem } from "@/types";
import moment from "moment";

interface OverviewProps {
  stats: StatsItem[];
  unit?: string;
}

export function Overview({ stats, unit = "" }: OverviewProps) {

  const data = stats.map((state) => ({
    name: moment()
      .month(state.month)
      .format("MMM"),
    total: state.sum
  }));


  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => unit + value}
        />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
