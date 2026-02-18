import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Vault, ArrowUpRight } from "lucide-react";
import { PeriodFilter } from "@/components/period-filter";
import { InvestmentList } from "@/components/investment-list";
import { EditGoalDialog } from "@/components/edit-goal-dialog";
import { parsePeriod, getPeriodRange, getPeriodLabel } from "@/lib/period";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  const fromDate = getPeriodRange(period);

  const [cryptoHoldings, goals] = await Promise.all([
    prisma.cryptoHolding.findMany({
      where: period !== "all" ? { buyDate: { gte: fromDate } } : undefined,
      orderBy: { buyDate: "desc" },
    }),
    prisma.goal.findMany(),
  ]);

  // Also get all holdings for total portfolio value
  const allHoldings = await prisma.cryptoHolding.findMany();

  // Simulated current prices (VND) for demo
  const currentPrices: Record<string, number> = {
    BTC: 2600000000,
    ETH: 85000000,
    SOL: 5200000,
  };

  const calcPnL = (h: (typeof allHoldings)[0]) => {
    const currentPrice = currentPrices[h.symbol] || h.entryPrice;
    const currentValue = h.quantity * currentPrice;
    const costBasis = h.quantity * h.entryPrice;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPercent };
  };

  const cryptoWithPnL = cryptoHoldings.map(calcPnL);
  const allWithPnL = allHoldings.map(calcPnL);

  const totalCryptoValue = allWithPnL.reduce((s, c) => s + c.currentValue, 0);
  const totalCryptoPnL = allWithPnL.reduce((s, c) => s + c.pnl, 0);
  const periodPnL = cryptoWithPnL.reduce((s, c) => s + c.pnl, 0);

  const stockFund = goals.find((g) => g.name.includes("cổ phiếu"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Đầu <span className="gradient-text-violet">tư</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Theo dõi danh mục Crypto và quỹ tích lũy
        </p>
      </div>

      {/* Period Filter */}
      <Suspense>
        <PeriodFilter />
      </Suspense>

      {/* Crypto Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Tổng Crypto</p>
          <p className="text-lg font-bold gradient-text-violet">
            {formatCurrency(totalCryptoValue)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Tổng PnL</p>
          <p
            className={`text-lg font-bold ${
              totalCryptoPnL >= 0 ? "text-emerald" : "text-rose"
            }`}
          >
            {totalCryptoPnL >= 0 ? "+" : ""}
            {formatCurrency(totalCryptoPnL)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">
            PnL ({getPeriodLabel(period)})
          </p>
          <p
            className={`text-lg font-bold ${
              periodPnL >= 0 ? "text-emerald" : "text-rose"
            }`}
          >
            {periodPnL >= 0 ? "+" : ""}
            {formatCurrency(periodPnL)}
          </p>
        </div>
      </div>

      {/* Investment Portfolio */}
      <InvestmentList holdings={cryptoWithPnL} />

      {/* 2026 Stock Fund Vault */}
      {stockFund && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Vault className="w-4 h-4 text-violet" />
            Quỹ Đầu tư Cổ phiếu 2026
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center -mt-2 mb-2">
              <p className="text-xs text-muted-foreground font-medium">
                Tiến độ
              </p>
              <EditGoalDialog goal={stockFund} />
            </div>
            <div className="relative w-full h-40 rounded-2xl bg-gradient-to-b from-violet/5 to-violet/20 border border-violet/20 overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-violet/40 to-violet/10 transition-all duration-1000"
                style={{
                  height: `${
                    (stockFund.currentAmount / stockFund.targetAmount) * 100
                  }%`,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-violet/60 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <ArrowUpRight className="w-8 h-8 text-violet mb-2" />
                <p className="text-2xl font-bold gradient-text-violet">
                  {Math.round(
                    (stockFund.currentAmount / stockFund.targetAmount) * 100
                  )}
                  %
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stockFund.currentAmount)} /{" "}
                  {formatCurrency(stockFund.targetAmount)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Còn thiếu{" "}
                <span className="text-violet font-semibold">
                  {formatCurrency(
                    stockFund.targetAmount - stockFund.currentAmount
                  )}
                </span>{" "}
                để đạt mục tiêu
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
