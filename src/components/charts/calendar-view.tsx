"use client";

import { formatNumber } from "@/lib/utils";

interface DayData {
  date: string; // YYYY-MM-DD
  income: number;
  expense: number;
}

function abbreviateAmount(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
  return amount > 0 ? formatNumber(amount) : "";
}

function getHeatColor(net: number, maxAbs: number): string {
  if (net === 0) return "";
  const intensity = Math.min(Math.abs(net) / maxAbs, 1);
  if (net > 0) {
    // Green shades for net positive (income > expense)
    const alpha = 0.1 + intensity * 0.4;
    return `rgba(16, 185, 129, ${alpha})`;
  }
  // Red shades for net negative (expense > income)
  const alpha = 0.1 + intensity * 0.4;
  return `rgba(244, 63, 94, ${alpha})`;
}

export function CalendarView({
  data,
  month,
  year,
}: {
  data: DayData[];
  month: number;
  year: number;
}) {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build lookup
  const dayLookup: Record<number, DayData> = {};
  let maxAbsNet = 1;
  for (const d of data) {
    const date = new Date(d.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      const day = date.getDate();
      if (!dayLookup[day]) {
        dayLookup[day] = { date: d.date, income: 0, expense: 0 };
      }
      dayLookup[day].income += d.income;
      dayLookup[day].expense += d.expense;
      const net = Math.abs(dayLookup[day].income - dayLookup[day].expense);
      if (net > maxAbsNet) maxAbsNet = net;
    }
  }

  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === month && today.getFullYear() === year;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  return (
    <div>
      <div className="text-center mb-3">
        <p className="text-sm font-semibold">
          {monthNames[month]} {year}
        </p>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {weekdays.map((w) => (
          <div
            key={w}
            className="text-center text-[9px] text-muted-foreground font-medium py-1"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dayData = dayLookup[day];
          const isToday = isCurrentMonth && today.getDate() === day;
          const hasData =
            dayData && (dayData.income > 0 || dayData.expense > 0);
          const net = dayData ? dayData.income - dayData.expense : 0;
          const bgColor = hasData ? getHeatColor(net, maxAbsNet) : undefined;

          return (
            <div
              key={day}
              className={`aspect-square rounded-md flex flex-col items-center justify-center relative transition-colors cursor-pointer group ${
                isToday ? "ring-1 ring-amber" : ""
              }`}
              style={{ backgroundColor: bgColor || undefined }}
              title={
                dayData
                  ? `Thu: ${formatNumber(dayData.income)}đ\nChi: ${formatNumber(
                      dayData.expense
                    )}đ`
                  : undefined
              }
            >
              <span
                className={`text-[9px] font-medium leading-none ${
                  isToday ? "text-amber" : "text-foreground/60"
                }`}
              >
                {day}
              </span>
              {hasData && (
                <div className="flex flex-col items-center mt-0.5 leading-none">
                  {dayData.income > 0 && (
                    <span className="text-[7px] font-medium text-emerald leading-none">
                      +{abbreviateAmount(dayData.income)}
                    </span>
                  )}
                  {dayData.expense > 0 && (
                    <span className="text-[7px] font-medium text-rose leading-none">
                      -{abbreviateAmount(dayData.expense)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.3)" }}
          />
          <span>Thu nhập ròng</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "rgba(244, 63, 94, 0.3)" }}
          />
          <span>Chi tiêu ròng</span>
        </div>
        {isCurrentMonth && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded ring-1 ring-amber" />
            <span>Hôm nay</span>
          </div>
        )}
      </div>
    </div>
  );
}
