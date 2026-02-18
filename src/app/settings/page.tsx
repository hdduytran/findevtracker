"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Wallet, Layers, CreditCard } from "lucide-react";
import { AccountSettings } from "@/components/settings/account-settings";
import { CategorySettings } from "@/components/settings/category-settings";
import { CreditCardSettings } from "@/components/settings/credit-card-settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("accounts");

  const tabs = [
    { id: "accounts", label: "Tài khoản", icon: Wallet },
    { id: "categories", label: "Danh mục", icon: Layers },
    { id: "credit-cards", label: "Thẻ tín dụng", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Cấu hình <span className="gradient-text">Hệ thống</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Quản lý tài khoản, danh mục và các thiết lập khác
        </p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-xl w-full lg:w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-amber text-slate-900 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 min-h-[500px]">
        {activeTab === "accounts" && <AccountSettings />}
        {activeTab === "categories" && <CategorySettings />}
        {activeTab === "credit-cards" && <CreditCardSettings />}
      </div>
    </div>
  );
}
