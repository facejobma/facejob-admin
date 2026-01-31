"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { StatsItem } from "@/types";
import moment from "moment";
import "moment/locale/fr";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

moment.locales();

interface OverviewProps {
  stats: StatsItem[];
  unit?: string;
}

export function Overview({ stats, unit = "" }: OverviewProps) {
  const [isClient, setIsClient] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  console.log("Overview component received stats:", stats);

  // Vérifier si stats est un tableau valide
  if (!Array.isArray(stats) || stats.length === 0) {
    console.log("No valid stats data provided");
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  const data = stats.map((state) => {
    const monthName = moment().month(state.month - 1).format("MMM");
    const total = Number(state.sum) || 0;
    
    console.log(`Processing: Month ${state.month} -> ${monthName}, Sum: ${state.sum} -> ${total}`);
    
    return {
      name: monthName,
      total: total
    };
  });

  console.log("Transformed data for chart:", data);
  console.log("Data length:", data.length);
  console.log("Sample data item:", data[0]);

  // Vérifier si nous avons des données valides
  const hasValidData = data.some(item => item.total > 0);
  console.log("Has valid data (total > 0):", hasValidData);

  if (!hasValidData) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        Toutes les valeurs sont à zéro
      </div>
    );
  }

  // Ne pas rendre le graphique côté serveur
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        Chargement du graphique...
      </div>
    );
  }

  // Couleurs basées sur le thème
  const isDark = resolvedTheme === 'dark';
  const axisColor = isDark ? "#9CA3AF" : "#888888";
  const barColor = isDark ? "#10B981" : "#059669";
  const tooltipBg = isDark ? "#374151" : "#FFFFFF";
  const tooltipBorder = isDark ? "#6B7280" : "#E5E7EB";

  return (
    <div className="w-full h-[350px] p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Graphique des ventes - {data.length} mois de données
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="name"
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => unit + value}
          />
          <Tooltip 
            formatter={(value) => [unit + value, 'Ventes']}
            labelFormatter={(label) => `Mois: ${label}`}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '8px',
              color: isDark ? '#F9FAFB' : '#111827'
            }}
          />
          <Bar 
            dataKey="total" 
            fill={barColor}
            radius={[4, 4, 0, 0]}
            name="Ventes"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
