"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Sales } from "@/types";
import moment from "moment";

// const data = [
//   {
//     name: "Jan",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Feb",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Mar",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Apr",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "May",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Jun",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Jul",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Aug",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Sep",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Oct",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Nov",
//     total: Math.floor(Math.random() * 5000) + 1000
//   },
//   {
//     name: "Dec",
//     total: Math.floor(Math.random() * 5000) + 1000
//   }
// ];

interface OverviewProps {
  sales: Sales[];
}

export function Overview({ sales }: OverviewProps) {
  // group sales by month
  const groupedSales = sales.reduce((acc, sale) => {
    const month = moment(sale.created_at).format("MMM");
    const total = parseInt(sale.amount, 10);

    if (acc[month]) {
      acc[month] += total;
    } else {
      acc[month] = total;
    }

    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(groupedSales).map(([name, total]) => ({ name, total }));


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
          tickFormatter={(value) => `DH${value}`}
        />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
