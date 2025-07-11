"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { StatsItem } from "@/types";
import moment from "moment";
import "moment/locale/fr";

moment.locales();

interface OverviewProps {
  stats: StatsItem[];
  unit?: string;
}

export function Overview({ stats, unit = "" }: OverviewProps) {

  const data = stats.map((state) => ({
    name: moment()
      .month(state.month - 1)
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
        <Tooltip />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
