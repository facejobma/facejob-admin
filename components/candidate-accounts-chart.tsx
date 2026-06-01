"use client";

import { StatsItem } from "@/types";
import moment from "moment";
import "moment/locale/fr";
import { useTheme } from "next-themes";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

moment.locale("fr");

interface CandidateAccountsChartProps {
  stats: StatsItem[];
}

export function CandidateAccountsChart({ stats }: CandidateAccountsChartProps) {
  const { resolvedTheme } = useTheme();

  if (!Array.isArray(stats) || stats.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-muted-foreground">
        Aucune donnée candidat disponible
      </div>
    );
  }

  const data = [...stats]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((item) => {
      const total = Number(item.sum) || 0;
      const date = moment({ year: item.year, month: item.month - 1 });

      return {
        label: date.format("MMM YYYY"),
        total,
      };
    });

  const hasData = data.some((item) => item.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-[320px] items-center justify-center text-muted-foreground">
        Toutes les valeurs sont à zéro
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#9CA3AF" : "#6B7280";
  const gridColor = isDark ? "#374151" : "#E5E7EB";
  const tooltipBg = isDark ? "#111827" : "#FFFFFF";
  const tooltipBorder = isDark ? "#374151" : "#E5E7EB";

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 12,
            right: 24,
            left: 0,
            bottom: 8,
          }}
        >
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString("fr-FR"), "Comptes créés"]}
            labelFormatter={(label) => `Période : ${label}`}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "8px",
              color: isDark ? "#F9FAFB" : "#111827",
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Comptes créés"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
