"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { StatsItem } from "@/types";
import moment from "moment";
import "moment/locale/fr";
import { useEffect, useState } from "react";

moment.locales();

interface OverviewProps {
  stats: StatsItem[];
  unit?: string;
}

export function Overview({ stats, unit = "" }: OverviewProps) {
  const [isClient, setIsClient] = useState(false);

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

  return (
    <div style={{ width: '100%', height: '350px', border: '2px solid blue', backgroundColor: '#f0f0f0' }}>
      <p style={{ color: 'black', margin: '10px' }}>Overview Chart - Data items: {data.length}</p>
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
          <Tooltip 
            formatter={(value) => [unit + value, 'Ventes']}
            labelFormatter={(label) => `Mois: ${label}`}
          />
          <Bar 
            dataKey="total" 
            fill="#adfa1d" 
            radius={[4, 4, 0, 0]}
            name="Ventes"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
