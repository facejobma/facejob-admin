"use client";
import { StatsItem } from "@/types";
import moment from "moment";
import "moment/locale/fr";

moment.locale("fr");

interface SimpleBarChartProps {
  stats: StatsItem[];
  unit?: string;
  title?: string;
  color?: string;
}

export function SimpleBarChart({ 
  stats, 
  unit = "", 
  title = "Graphique", 
  color = "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500" 
}: SimpleBarChartProps) {
  if (!Array.isArray(stats) || stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  // Transformer les données
  const data = stats.map((state) => ({
    name: moment().month(state.month - 1).format("MMM"),
    total: Number(state.sum) || 0,
    month: state.month
  }));

  // Trouver la valeur maximale pour la mise à l'échelle
  const maxValue = Math.max(...data.map(item => item.total));
  
  if (maxValue === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        Toutes les valeurs sont à zéro
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h3>
      <div className="flex items-end justify-between h-64 border-b border-l border-gray-300 dark:border-gray-600">
        {data.map((item, index) => {
          const height = (item.total / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div className="relative group">
                <div
                  className={`${color} transition-colors duration-200 w-full min-w-[30px] rounded-t`}
                  style={{ height: `${height * 2}px` }}
                ></div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                  {unit}{item.total.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{item.name}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Évolution par mois {unit && `(en ${unit})`}
      </div>
    </div>
  );
}