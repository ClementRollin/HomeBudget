"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { formatCurrency } from "@/lib/format";

export type ChartDataPoint = {
  label: string; // "Jan 2025"
  revenus: number;
  charges: number;
  solde: number;
};

const MonthlyChart = ({ data }: { data: ChartDataPoint[] }) => {
  if (data.length === 0) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? formatCurrency(value) : String(value ?? ""),
              "",
            ]}
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#e2e8f0",
            }}
            labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
          />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
          <Bar dataKey="revenus" name="Revenus" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
          <Bar dataKey="charges" name="Charges" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="solde" name="Solde" fill="#818cf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
