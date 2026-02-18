"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface AssetAllocationDonutProps {
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    color?: string | null;
  }[];
}

const COLORS: Record<string, string> = {
  CASH: "#10B981", // Emerald
  BANK: "#3B82F6", // Blue
  INVESTMENT: "#8B5CF6", // Violet
  CRYPTO: "#F59E0B", // Amber
  CREDIT: "#EF4444", // Rose (only if positive)
  OTHER: "#64748B",
};

const LABELS: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK: "Ngân hàng",
  INVESTMENT: "Đầu tư",
  CRYPTO: "Crypto",
  CREDIT: "Thẻ tín dụng (Dư)",
};

export function AssetAllocationDonut({ accounts }: AssetAllocationDonutProps) {
  // Aggregate by type
  const typeMap: Record<string, number> = {};

  accounts.forEach((acc) => {
    // If credit card has negative balance, ignore (liability)
    if (acc.type === "CREDIT" && acc.balance <= 0) return;

    // Sum positive balances
    if (acc.balance > 0) {
      typeMap[acc.type] = (typeMap[acc.type] || 0) + acc.balance;
    }
  });

  const data = Object.entries(typeMap)
    .map(([type, value]) => ({
      name: LABELS[type] || type,
      value,
      color: COLORS[type] || COLORS.OTHER,
    }))
    .sort((a, b) => b.value - a.value);

  const totalAsset = data.reduce((sum, item) => sum + item.value, 0);

  if (totalAsset === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground w-full">
        <p>Chưa có dữ liệu tài sản</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val: number | string | undefined) =>
              formatCurrency(Number(val || 0))
            }
            contentStyle={{
              backgroundColor: "rgba(30, 41, 59, 0.9)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              color: "#fff",
            }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(val: string) => (
              <span className="text-sm font-medium text-slate-300 ml-1">
                {val}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
