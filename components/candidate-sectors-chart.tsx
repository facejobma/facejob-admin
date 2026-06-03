"use client";

import { SectorCountItem } from "@/types";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CandidateSectorsChartProps {
  stats: SectorCountItem[];
}

export function CandidateSectorsChart({ stats }: CandidateSectorsChartProps) {
  const { resolvedTheme } = useTheme();

  if (!Array.isArray(stats) || stats.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center text-muted-foreground">
        Aucune donnee de secteur disponible
      </div>
    );
  }

  const data = stats
    .map((item) => ({
      name: item.name || "Sans secteur",
      total: Number(item.total) || 0,
    }))
    .filter((item) => item.total > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center text-muted-foreground">
        Toutes les valeurs sont a zero
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#9CA3AF" : "#6B7280";
  const gridColor = isDark ? "#374151" : "#E5E7EB";
  const tooltipBg = isDark ? "#111827" : "#FFFFFF";
  const tooltipBorder = isDark ? "#374151" : "#E5E7EB";

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 8,
            right: 24,
            left: 12,
            bottom: 8,
          }}
        >
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              String(value).length > 22 ? `${String(value).slice(0, 22)}...` : String(value)
            }
          />
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString("fr-FR"), "Candidats"]}
            labelFormatter={(label) => `Secteur : ${label}`}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "8px",
              color: isDark ? "#F9FAFB" : "#111827",
            }}
          />
          <Bar dataKey="total" name="Candidats" fill="#7C3AED" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
