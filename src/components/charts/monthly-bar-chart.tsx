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
import { formatCurrency } from "@/lib/utils";

interface MonthData {
  month: string; // "T1", "T2", etc.
  income: number;
  expense: number;
}

export function MonthlyBarChart({ data }: { data: MonthData[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Chưa có dữ liệu
      </p>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, bottom: 5, left: -15 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => {
              if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
              if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
              return String(v);
            }}
          />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              return (
                <div className="bg-[#1E293B] rounded-lg px-3 py-2 text-sm border border-white/10 shadow-lg">
                  <p className="font-medium text-foreground mb-1">{label}</p>
                  {payload.map((entry) => (
                    <p key={entry.name} style={{ color: entry.color }}>
                      {entry.name === "income" ? "Thu nhập" : "Chi tiêu"}:{" "}
                      {formatCurrency(entry.value as number)}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            formatter={(value: string) =>
              value === "income" ? "Thu nhập" : "Chi tiêu"
            }
            wrapperStyle={{ fontSize: "11px" }}
          />
          <Bar
            dataKey="income"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            stackId="stack"
          />
          <Bar
            dataKey="expense"
            fill="#F43F5E"
            radius={[4, 4, 0, 0]}
            stackId="stack"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
