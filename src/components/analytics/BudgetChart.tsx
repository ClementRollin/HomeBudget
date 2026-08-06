"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export type BudgetDataPoint = {
  label: string;
  income: number;
  expenses: number;
  balance: number;
};

export default function BudgetChart({ data }: { data: BudgetDataPoint[] }) {
  const fmtK = (v: number) => `${(v / 1000).toFixed(1)}k`;
  const fmtEur = (v: number) =>
    v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtK}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                income: "Revenus",
                expenses: "Charges",
                balance: "Solde",
              };
              return [fmtEur(Number(value)), labels[String(name)] ?? String(name)];
            }}
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#e2e8f0",
            }}
            labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
          />
          <Legend
            formatter={(value: string) => {
              const map: Record<string, string> = { income: "Revenus", expenses: "Charges", balance: "Solde" };
              return map[value] ?? value;
            }}
            wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
          />
          <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#fb7185" radius={[4, 4, 0, 0]} />
          <Bar dataKey="balance" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
