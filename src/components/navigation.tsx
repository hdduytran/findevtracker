"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Giao dịch", icon: ArrowRightLeft },
  { href: "/liabilities", label: "Nghĩa vụ nợ", icon: AlertTriangle },
  { href: "/investments", label: "Đầu tư", icon: TrendingUp },
  { href: "/achievements", label: "Thành tựu", icon: Trophy },
  { href: "/settings", label: "Cấu hình", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 glass border-r border-white/10 z-40">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber to-yellow-300 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">FinDev</h1>
            <p className="text-xs text-muted-foreground">Command Center</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer",
                  isActive
                    ? "bg-amber/10 text-amber border border-amber/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Phiên bản</p>
            <p className="text-sm font-semibold gradient-text">v1.0 Beta</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 rounded-xl min-w-[56px] transition-colors duration-200 cursor-pointer",
                  isActive ? "text-amber" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-amber absolute -bottom-0" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
