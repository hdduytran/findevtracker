import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  Vault,
  ArrowUpRight,
} from "lucide-react";
import { PeriodFilter } from "@/components/period-filter";
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

      {/* Crypto Spot Log */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Bitcoin className="w-4 h-4 text-amber" />
          Crypto Spot Log ({getPeriodLabel(period)})
        </h2>
        {cryptoWithPnL.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Không có giao dịch crypto {getPeriodLabel(period)}
          </p>
        ) : (
          <div className="space-y-3">
            {cryptoWithPnL.map((h) => (
              <div
                key={h.id}
                className="glass rounded-xl p-4 glass-hover cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-amber">
                        {h.symbol}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{h.coin}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.quantity} {h.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(h.currentValue)}
                    </p>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        h.pnl >= 0 ? "text-emerald" : "text-rose"
                      }`}
                    >
                      {h.pnl >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {h.pnlPercent >= 0 ? "+" : ""}
                        {h.pnlPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-muted-foreground">Giá mua</p>
                    <p className="font-medium mt-0.5">
                      {formatCurrency(h.entryPrice)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-muted-foreground">Giá hiện tại</p>
                    <p className="font-medium mt-0.5">
                      {formatCurrency(h.currentPrice)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-muted-foreground">PnL</p>
                    <p
                      className={`font-medium mt-0.5 ${
                        h.pnl >= 0 ? "text-emerald" : "text-rose"
                      }`}
                    >
                      {h.pnl >= 0 ? "+" : ""}
                      {formatCurrency(h.pnl)}
                    </p>
                  </div>
                </div>
                {h.note && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {h.note} • {formatDate(h.buyDate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2026 Stock Fund Vault */}
      {stockFund && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Vault className="w-4 h-4 text-violet" />
            Quỹ Đầu tư Cổ phiếu 2026
          </h2>
          <div className="space-y-4">
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
