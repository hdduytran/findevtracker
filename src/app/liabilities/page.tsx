import { prisma } from "@/lib/db";
import { formatCurrency, daysUntil, getProgressPercentage } from "@/lib/utils";
import {
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  Server,
  Calendar,
} from "lucide-react";
import { PeriodFilter } from "@/components/period-filter";
import { parsePeriod, getPeriodLabel } from "@/lib/period";
import { Suspense } from "react";
import { AddLiabilityDialog } from "@/components/add-liability-dialog";

export const dynamic = "force-dynamic";

export default async function LiabilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);

  const liabilities = await prisma.liability.findMany({
    orderBy: { dueDay: "asc" },
  });

  // Filter by period for timeline
  let maxDays: number;
  switch (period) {
    case "day":
      maxDays = 1;
      break;
    case "week":
      maxDays = 7;
      break;
    case "month":
      maxDays = 30;
      break;
    default:
      maxDays = 365;
  }

  const withDays = liabilities.map((l) => ({
    ...l,
    daysLeft: daysUntil(l.dueDay),
    progress:
      l.type === "INSTALLMENT"
        ? getProgressPercentage(l.paidAmount, l.totalAmount)
        : null,
    installmentsDone:
      l.type === "INSTALLMENT" && l.monthlyDue > 0
        ? Math.round(l.paidAmount / l.monthlyDue)
        : null,
    totalInstallments:
      l.type === "INSTALLMENT" && l.monthlyDue > 0
        ? Math.round(l.totalAmount / l.monthlyDue)
        : null,
  }));

  const filteredTimeline = withDays
    .filter((l) => l.daysLeft <= maxDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const totalMonthlyDue = liabilities.reduce((s, l) => s + l.monthlyDue, 0);
  const totalFilteredDue = filteredTimeline.reduce(
    (s, l) => s + l.monthlyDue,
    0
  );
  const urgent = withDays.filter((l) => l.daysLeft <= 3);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CREDIT_CARD":
        return CreditCard;
      case "INSTALLMENT":
        return Calendar;
      case "SUBSCRIPTION":
        return Server;
      default:
        return Clock;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CREDIT_CARD":
        return "Thẻ tín dụng";
      case "INSTALLMENT":
        return "Trả góp";
      case "SUBSCRIPTION":
        return "Đăng ký dịch vụ";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Nghĩa vụ <span className="gradient-text">nợ</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Theo dõi tất cả các khoản thanh toán định kỳ
          </p>
        </div>
        <AddLiabilityDialog />
      </div>

      {/* Period Filter */}
      <Suspense>
        <PeriodFilter />
      </Suspense>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Tổng/tháng</p>
          <p className="text-lg font-bold text-amber">
            {formatCurrency(totalMonthlyDue)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">
            Đến hạn ({getPeriodLabel(period)})
          </p>
          <p className="text-lg font-bold text-violet">
            {formatCurrency(totalFilteredDue)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3 text-rose" />
            <p className="text-xs text-muted-foreground">Khẩn cấp</p>
          </div>
          <p className="text-lg font-bold text-rose">{urgent.length} khoản</p>
        </div>
      </div>

      {/* Urgent alerts */}
      {urgent.length > 0 && (
        <div className="space-y-2">
          {urgent.map((l) => (
            <div
              key={l.id}
              className="glass rounded-2xl p-4 border border-rose/30 bg-rose/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{l.name}</p>
                  <p className="text-xs text-rose">
                    {l.daysLeft === 0
                      ? "⚠ Đến hạn hôm nay!"
                      : `⚠ Còn ${l.daysLeft} ngày đến hạn`}
                  </p>
                </div>
                <p className="text-sm font-bold text-rose">
                  {formatCurrency(l.monthlyDue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber" />
          Lịch thanh toán ({getPeriodLabel(period)})
        </h2>
        {filteredTimeline.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Không có khoản nào đến hạn {getPeriodLabel(period)}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredTimeline.map((l) => {
              const Icon = getTypeIcon(l.type);
              return (
                <div
                  key={l.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        l.daysLeft <= 3 ? "bg-rose/20" : "bg-amber/10"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          l.daysLeft <= 3 ? "text-rose" : "text-amber"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTypeLabel(l.type)} • Ngày {l.dueDay}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(l.monthlyDue)}
                    </p>
                    <p
                      className={`text-xs ${
                        l.daysLeft <= 3
                          ? "text-rose font-bold"
                          : l.daysLeft <= 7
                          ? "text-amber"
                          : "text-muted-foreground"
                      }`}
                    >
                      {l.daysLeft === 0 ? "Hôm nay" : `${l.daysLeft} ngày`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Installment Progress */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet" />
          Tiến trình trả góp
        </h2>
        <div className="space-y-5">
          {withDays
            .filter((l) => l.type === "INSTALLMENT")
            .map((l) => (
              <div key={l.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{l.name}</p>
                  <span className="text-xs text-muted-foreground">
                    Kỳ {l.installmentsDone}/{l.totalInstallments}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet to-purple-400 progress-animated"
                    style={{ width: `${l.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Đã trả: {formatCurrency(l.paidAmount)}</span>
                  <span>Tổng: {formatCurrency(l.totalAmount)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Credit Card Safety */}
      {withDays
        .filter((l) => l.type === "CREDIT_CARD")
        .map((l) => (
          <div key={l.id} className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan" />
              {l.name}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">
                  Ngày chốt sao kê
                </p>
                <p className="text-lg font-bold">
                  {l.statementDay ? `Ngày ${l.statementDay}` : "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Ngày thanh toán</p>
                <p className="text-lg font-bold">Ngày {l.dueDay}</p>
              </div>
            </div>
            <div
              className={`mt-3 rounded-xl p-3 flex items-center gap-2 ${
                l.daysLeft <= 3
                  ? "bg-rose/10 border border-rose/30"
                  : "bg-emerald/10 border border-emerald/30"
              }`}
            >
              {l.daysLeft <= 3 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose" />
                  <span className="text-sm text-rose font-medium">
                    {l.daysLeft === 0
                      ? "Hạn thanh toán hôm nay!"
                      : `Còn ${l.daysLeft} ngày - Thanh toán ngay!`}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald" />
                  <span className="text-sm text-emerald font-medium">
                    Còn {l.daysLeft} ngày đến hạn
                  </span>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground">Dư nợ hiện tại</p>
                <p className="text-lg font-bold text-amber">
                  {formatCurrency(l.currentDebt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Thanh toán tối thiểu
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(l.monthlyDue)}
                </p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
