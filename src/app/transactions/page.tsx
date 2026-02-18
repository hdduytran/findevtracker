import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react";
import { AddTransactionFAB } from "@/components/add-transaction-fab";
import { PeriodFilter } from "@/components/period-filter";
import { parsePeriod, getPeriodRange, getPeriodLabel } from "@/lib/period";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  const fromDate = getPeriodRange(period);

  const [transactions, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: period !== "all" ? { date: { gte: fromDate } } : undefined,
      include: { category: true, account: true },
      orderBy: { date: "desc" },
    }),
    prisma.account.findMany(),
    prisma.category.findMany(),
  ]);

  // Group by date
  const grouped: Record<string, typeof transactions> = {};
  for (const tx of transactions) {
    const key = formatDate(tx.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  }

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Giao <span className="gradient-text">dịch</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Lịch sử thu chi và chuyển khoản
        </p>
      </div>

      {/* Period Filter */}
      <Suspense>
        <PeriodFilter />
      </Suspense>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">
            Thu nhập ({getPeriodLabel(period)})
          </p>
          <p className="text-lg font-bold text-emerald">
            +{formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">
            Chi tiêu ({getPeriodLabel(period)})
          </p>
          <p className="text-lg font-bold text-rose">
            -{formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {Object.keys(grouped).length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Không có giao dịch nào trong khoảng {getPeriodLabel(period)}
            </p>
          </div>
        )}
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-1">
              {date}
            </h3>
            <div className="glass rounded-2xl divide-y divide-white/5">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 px-4 hover:bg-white/5 transition-colors cursor-pointer first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === "INCOME"
                          ? "bg-emerald/10"
                          : tx.type === "EXPENSE"
                          ? "bg-rose/10"
                          : "bg-cyan/10"
                      }`}
                    >
                      {tx.type === "INCOME" ? (
                        <ArrowUpRight className="w-5 h-5 text-emerald" />
                      ) : tx.type === "EXPENSE" ? (
                        <ArrowDownRight className="w-5 h-5 text-rose" />
                      ) : (
                        <ArrowRightLeft className="w-5 h-5 text-cyan" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {tx.note || tx.category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category.name} • {tx.account.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === "INCOME"
                        ? "text-emerald"
                        : tx.type === "EXPENSE"
                        ? "text-rose"
                        : "text-cyan"
                    }`}
                  >
                    {tx.type === "INCOME"
                      ? "+"
                      : tx.type === "EXPENSE"
                      ? "-"
                      : ""}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <AddTransactionFAB accounts={accounts} categories={categories} />
    </div>
  );
}
