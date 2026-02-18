import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react";
import { AddTransactionFAB } from "@/components/add-transaction-fab";
import { TransactionList } from "@/components/transaction-list";
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
      take: 20,
    }),
    prisma.account.findMany(),
    prisma.category.findMany(),
  ]);

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
      <TransactionList initialTransactions={transactions} />

      {/* FAB */}
      <AddTransactionFAB accounts={accounts} categories={categories} />
    </div>
  );
}
