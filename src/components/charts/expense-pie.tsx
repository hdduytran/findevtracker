"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#F43F5E",
  "#8B5CF6",
  "#F59E0B",
  "#06B6D4",
  "#10B981",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
];

interface ExpenseData {
  name: string;
  value: number;
}

export function ExpensePieChart({ data }: { data: ExpenseData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Chưa có dữ liệu chi tiêu
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const item = payload[0];
                const pct =
                  total > 0
                    ? (((item.value as number) / total) * 100).toFixed(1)
                    : "0";
                return (
                  <div className="bg-[#1E293B] rounded-lg px-3 py-2 text-sm border border-white/10">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-rose">
                      {formatCurrency(item.value as number)}
                    </p>
                    <p className="text-muted-foreground text-xs">{pct}%</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Tổng chi</p>
          <p className="text-sm font-bold text-rose">{formatCurrency(total)}</p>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 gap-1.5 w-full">
        {data.map((item, i) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
          return (
            <div
              key={item.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-muted-foreground truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{pct}%</span>
                <span className="font-medium text-xs">
                  {formatCurrency(item.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
