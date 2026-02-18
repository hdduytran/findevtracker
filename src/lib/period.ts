/**
 * Period filtering utilities shared across all pages
 */

export type Period = "day" | "week" | "month" | "custom" | "all";

export function getPeriodRange(
  period: Period,
  from?: string,
  to?: string
): Date {
  const now = new Date();
  switch (period) {
    case "day":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "custom":
      return from ? new Date(from) : new Date(0);
    default:
      return new Date(0);
  }
}

export function getPeriodLabel(
  period: Period,
  from?: string,
  to?: string
): string {
  switch (period) {
    case "day":
      return "hôm nay";
    case "week":
      return "7 ngày qua";
    case "month":
      return "tháng này";
    case "custom":
      return `${from || "?"} - ${to || "?"}`;
    default:
      return "tất cả";
  }
}

export function parsePeriod(param?: string): Period {
  if (
    param === "day" ||
    param === "week" ||
    param === "month" ||
    param === "custom" ||
    param === "all"
  ) {
    return param;
  }
  return "month";
}
