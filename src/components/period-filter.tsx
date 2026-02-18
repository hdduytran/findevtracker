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
        <div className="flex flex-col gap-2">
          {/* Shortcuts */}
          <div className="flex gap-2 mb-1 overflow-x-auto pb-1">
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(
                  now.getFullYear(),
                  now.getMonth() - 1,
                  1
                );
                const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                // Adjust fortimezone if needed, but simplistic YYYY-MM-DD is fine
                // To get YYYY-MM-DD strings in local time:
                const offset = now.getTimezoneOffset() * 60000;
                const localFirst = new Date(firstDay.getTime() - offset)
                  .toISOString()
                  .split("T")[0];
                const localLast = new Date(lastDay.getTime() - offset)
                  .toISOString()
                  .split("T")[0];
                setFromDate(localFirst);
                setToDate(localLast);
              }}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs hover:bg-white/10 whitespace-nowrap"
            >
              Tháng trước
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7; // Last Monday
                const monday = new Date(now.setDate(diff));
                const sunday = new Date(now.setDate(monday.getDate() + 6));

                const offset = new Date().getTimezoneOffset() * 60000;
                setFromDate(
                  new Date(monday.getTime() - offset)
                    .toISOString()
                    .split("T")[0]
                );
                setToDate(
                  new Date(sunday.getTime() - offset)
                    .toISOString()
                    .split("T")[0]
                );
              }}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs hover:bg-white/10 whitespace-nowrap"
            >
              Tuần trước
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const to = new Date(now);
                const from = new Date(now.setDate(now.getDate() - 30));

                const offset = new Date().getTimezoneOffset() * 60000;
                setFromDate(
                  new Date(from.getTime() - offset).toISOString().split("T")[0]
                );
                setToDate(
                  new Date(to.getTime() - offset).toISOString().split("T")[0]
                );
              }}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs hover:bg-white/10 whitespace-nowrap"
            >
              30 ngày
            </button>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground">
                Từ ngày
              </label>
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
        </div>
      )}
    </div>
  );
}
