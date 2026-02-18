"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

const periods = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "custom", label: "Tùy chỉnh" },
];

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("period") || "month";
  const [showCustom, setShowCustom] = useState(current === "custom");
  const [fromDate, setFromDate] = useState(searchParams.get("from") || "");
  const [toDate, setToDate] = useState(searchParams.get("to") || "");

  function handleChange(period: string) {
    if (period === "custom") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const params = new URLSearchParams();
    params.set("period", period);
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyCustomRange() {
    if (!fromDate || !toDate) return;
    const params = new URLSearchParams();
    params.set("period", "custom");
    params.set("from", fromDate);
    params.set("to", toDate);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => handleChange(p.value)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              current === p.value || (p.value === "custom" && showCustom)
                ? "bg-amber/15 text-amber border border-amber/25 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {showCustom && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground">
              Đến ngày
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground"
            />
          </div>
          <button
            onClick={applyCustomRange}
            className="px-4 py-1.5 rounded-lg bg-amber text-slate-900 text-sm font-medium hover:bg-amber/90 transition-colors cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
}
