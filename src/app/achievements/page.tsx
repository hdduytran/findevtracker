import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  Trophy,
  Crown,
  Coffee,
  Sword,
  Flame,
  Rocket,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle,
} from "lucide-react";
import { formatCurrency, getProgressPercentage } from "@/lib/utils";
import { PeriodFilter } from "@/components/period-filter";
import { parsePeriod, getPeriodRange, getPeriodLabel } from "@/lib/period";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ElementType> = {
  crown: Crown,
  coffee: Coffee,
  sword: Sword,
  flame: Flame,
  rocket: Rocket,
  "shield-check": ShieldCheck,
  trophy: Trophy,
  zap: Zap,
};

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  const fromDate = getPeriodRange(period);

  const [achievements, goals] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.goal.findMany(),
  ]);

  // Filter unlocked achievements by period
  const unlocked = achievements.filter((a) => {
    if (!a.isUnlocked) return false;
    if (period === "all") return true;
    if (!a.unlockedAt) return true;
    return a.unlockedAt >= fromDate;
  });
  const locked = achievements.filter((a) => !a.isUnlocked);
  const totalUnlocked = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Thành <span className="gradient-text">tựu</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Biến quản lý tài chính thành game cày cấp
        </p>
      </div>

      {/* Period Filter */}
      <Suspense>
        <PeriodFilter />
      </Suspense>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold gradient-text">{totalUnlocked}</p>
          <p className="text-xs text-muted-foreground mt-1">Tổng đã mở</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald">{unlocked.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Mở ({getPeriodLabel(period)})
          </p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-muted-foreground">
            {locked.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Chưa đạt</p>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald" />
            Đã mở khóa ({getPeriodLabel(period)})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unlocked.map((a) => {
              const Icon = iconMap[a.icon] || Trophy;
              return (
                <div
                  key={a.id}
                  className="glass rounded-2xl p-4 glass-hover cursor-pointer border border-amber/20 bg-amber/5 achievement-unlock"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber to-yellow-300 flex items-center justify-center glow-amber">
                      <Icon className="w-6 h-6 text-slate-900" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold gradient-text">
                        {a.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.description}
                      </p>
                      {a.unlockedAt && (
                        <p className="text-[10px] text-amber/60 mt-1">
                          Mở khóa: {formatDate(a.unlockedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Chưa mở khóa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {locked.map((a) => {
            const Icon = iconMap[a.icon] || Trophy;
            return (
              <div
                key={a.id}
                className="glass rounded-2xl p-4 opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-muted-foreground">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {a.description}
                    </p>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Visualizer */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber" />
          Mục tiêu tài chính
        </h2>
        <div className="space-y-6">
          {goals.map((goal) => {
            const pct = getProgressPercentage(
              goal.currentAmount,
              goal.targetAmount
            );
            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{goal.name}</p>
                  <span
                    className={`text-sm font-bold ${
                      pct >= 80 ? "text-emerald" : "text-amber"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="relative w-full h-8 rounded-xl bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-xl progress-animated ${
                      pct >= 80
                        ? "bg-gradient-to-r from-emerald to-green-400"
                        : "bg-gradient-to-r from-amber to-yellow-300"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {formatCurrency(goal.currentAmount)} /{" "}
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                </div>
                {goal.deadline && (
                  <p className="text-xs text-muted-foreground">
                    Hạn: {formatDate(goal.deadline)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
