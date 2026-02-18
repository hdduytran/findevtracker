import { prisma } from "@/lib/db";
import { formatCurrency, daysUntil } from "@/lib/utils";
import {
  Wallet,
  Banknote,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CalendarDays,
  PieChart as PieChartIcon,
  BarChart,
} from "lucide-react";
import { IncomeDonutChart } from "@/components/charts/income-donut";
import { ExpensePieChart } from "@/components/charts/expense-pie";
import { CalendarView } from "@/components/charts/calendar-view";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import { PeriodFilter } from "@/components/period-filter";
import { parsePeriod, getPeriodRange, getPeriodLabel } from "@/lib/period";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getDashboardData(period: string, from?: string, to?: string) {
  const startDate = getPeriodRange(parsePeriod(period), from, to);
  const endDate = period === "custom" && to ? new Date(to) : undefined;
  // If custom period has end date, use it. Otherwise for other periods it's just 'gte startDate'

  const [accounts, liabilities, goals] = await Promise.all([
    prisma.account.findMany(),
    prisma.liability.findMany(),
    prisma.goal.findMany(),
  ]);

  // Net Worth
  const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Real Cash
  const cashAccounts = accounts.filter(
    (a) => a.type === "CASH" || a.type === "BANK"
  );
  const totalCash = cashAccounts.reduce((sum, a) => sum + a.balance, 0);
  const upcomingDues = liabilities.reduce((sum, l) => sum + l.monthlyDue, 0);
  const realCash = totalCash - upcomingDues;

  // Period-filtered transactions
  const whereDate: any = {};
  if (period !== "all") {
    whereDate.date = { gte: startDate };
    if (endDate) {
      // Set end date to end of day
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      whereDate.date.lte = e;
    }
  }

  const [incomeTx, expenseTx, recentTx, allPeriodTx] = await Promise.all([
    prisma.transaction.findMany({
      where: { ...whereDate, type: "INCOME" },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { ...whereDate, type: "EXPENSE" },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: whereDate,
      include: { category: true, account: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.transaction.findMany({
      where: whereDate,
      include: { category: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Income by category
  const incomeByCategory: Record<string, number> = {};
  for (const tx of incomeTx) {
    const cat = tx.category.name;
    incomeByCategory[cat] = (incomeByCategory[cat] || 0) + tx.amount;
  }
  const incomeData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Expense by category (for pie chart)
  const expenseByCategory: Record<string, number> = {};
  for (const tx of expenseTx) {
    const cat = tx.category.name;
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + tx.amount;
  }
  const expenseData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenseTx.reduce((s, t) => s + t.amount, 0);

  // Calendar data: aggregate by day
  const calendarData: Record<string, { income: number; expense: number }> = {};
  for (const tx of allPeriodTx) {
    const dateKey = tx.date.toISOString().split("T")[0];
    if (!calendarData[dateKey])
      calendarData[dateKey] = { income: 0, expense: 0 };
    if (tx.type === "INCOME") calendarData[dateKey].income += tx.amount;
    else if (tx.type === "EXPENSE") calendarData[dateKey].expense += tx.amount;
  }
  const calendarDays = Object.entries(calendarData).map(([date, d]) => ({
    date,
    income: d.income,
    expense: d.expense,
  }));

  // Monthly breakdown for bar chart
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  for (const tx of allPeriodTx) {
    const d = new Date(tx.date);
    const key = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`; // T2/26
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
    if (tx.type === "INCOME") monthlyData[key].income += tx.amount;
    else if (tx.type === "EXPENSE") monthlyData[key].expense += tx.amount;
  }
  const monthlyBarData = Object.entries(monthlyData).map(([month, d]) => ({
    month,
    income: d.income,
    expense: d.expense,
  }));

  // Upcoming liabilities
  const upcomingLiabilities = liabilities
    .map((l) => ({ ...l, daysLeft: daysUntil(l.dueDay) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  return {
    netWorth,
    realCash,
    totalIncome,
    totalExpenses,
    incomeData,
    expenseData,
    calendarDays,
    monthlyBarData,
    transactions: recentTx,
    upcomingLiabilities,
    goals,
    accounts,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const { period: periodParam, from, to } = await searchParams;
  const period = parsePeriod(periodParam);
  const data = await getDashboardData(period, from, to);
  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Command <span className="gradient-text">Center</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tổng quan sức khỏe tài chính của bạn
        </p>
      </div>

      {/* Period Filter */}
      <Suspense>
        <PeriodFilter />
      </Suspense>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="glass glass-hover rounded-2xl p-4 lg:p-5 cursor-pointer col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-amber" />
            </div>
            <span className="text-xs text-muted-foreground">Tổng tài sản</span>
          </div>
          <p className="text-xl lg:text-2xl font-bold gradient-text">
            {formatCurrency(data.netWorth)}
          </p>
        </div>

        <div className="glass glass-hover rounded-2xl p-4 lg:p-5 cursor-pointer col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-emerald" />
            </div>
            <span className="text-xs text-muted-foreground">
              Tiền thực chi được
            </span>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-emerald">
            {formatCurrency(data.realCash)}
          </p>
        </div>

        <div className="glass glass-hover rounded-2xl p-4 lg:p-5 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-violet" />
            </div>
            <span className="text-xs text-muted-foreground">
              Thu nhập ({getPeriodLabel(period, from, to)})
            </span>
          </div>
          <p className="text-lg font-bold text-violet">
            {formatCurrency(data.totalIncome)}
          </p>
        </div>

        <div className="glass glass-hover rounded-2xl p-4 lg:p-5 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose/10 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-rose" />
            </div>
            <span className="text-xs text-muted-foreground">
              Chi tiêu ({getPeriodLabel(period, from, to)})
            </span>
          </div>
          <p className="text-lg font-bold text-rose">
            {formatCurrency(data.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Calendar + Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Calendar View */}
        <div className="glass rounded-2xl p-5 lg:col-span-1 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber" />
              Lịch thu chi
            </h2>
            <CalendarView
              data={data.calendarDays}
              month={now.getMonth()}
              year={now.getFullYear()}
            />
          </div>

          {/* Monthly Bar Chart (visible for all periods as requested, but most useful for custom/all) */}
          <div>
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-cyan" />
              Biểu đồ tháng
            </h2>
            <MonthlyBarChart data={data.monthlyBarData} />
          </div>
        </div>

        {/* Income Splitter + Expense Pie */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald" />
              Nguồn thu nhập
            </h2>
            {data.incomeData.length > 0 ? (
              <IncomeDonutChart data={data.incomeData} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có dữ liệu {getPeriodLabel(period, from, to)}
              </p>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-rose" />
              Chi tiêu theo danh mục
            </h2>
            <ExpensePieChart data={data.expenseData} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-amber" />
          Giao dịch gần đây
        </h2>
        <div className="space-y-2">
          {data.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Không có giao dịch {getPeriodLabel(period, from, to)}
            </p>
          ) : (
            data.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === "INCOME"
                        ? "bg-emerald/10"
                        : tx.type === "EXPENSE"
                        ? "bg-rose/10"
                        : "bg-cyan/10"
                    }`}
                  >
                    {tx.type === "INCOME" ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald" />
                    ) : tx.type === "EXPENSE" ? (
                      <ArrowDownRight className="w-4 h-4 text-rose" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-cyan" />
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
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber" />
            Sắp đến hạn
          </h2>
          <div className="space-y-3">
            {data.upcomingLiabilities.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      l.daysLeft <= 3 ? "bg-rose/20" : "bg-amber/10"
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        l.daysLeft <= 3 ? "text-rose" : "text-amber"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Ngày {l.dueDay} hàng tháng
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber">
                    {formatCurrency(l.monthlyDue)}
                  </p>
                  <p
                    className={`text-xs ${
                      l.daysLeft <= 3
                        ? "text-rose font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {l.daysLeft === 0 ? "Hôm nay!" : `Còn ${l.daysLeft} ngày`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet" />
            Mục tiêu tài chính
          </h2>
          <div className="space-y-4">
            {data.goals.map((goal) => {
              const pct = Math.round(
                (goal.currentAmount / goal.targetAmount) * 100
              );
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{goal.name}</p>
                    <span className="text-xs text-amber font-semibold">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber to-yellow-300 progress-animated"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
