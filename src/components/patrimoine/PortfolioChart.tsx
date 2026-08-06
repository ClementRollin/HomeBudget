"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { formatCurrency } from "@/lib/format";

export type PortfolioDataPoint = {
  label: string;
  total: number;
};

const PortfolioChart = ({ data }: { data: PortfolioDataPoint[] }) => {
  if (data.length < 2) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
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
            width={44}
          />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? formatCurrency(value) : String(value ?? ""),
              "Patrimoine brut",
            ]}
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#e2e8f0",
            }}
            labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#2dd4bf"
            strokeWidth={2}
            dot={{ fill: "#2dd4bf", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;
