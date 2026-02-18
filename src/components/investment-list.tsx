"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, Plus, Pencil } from "lucide-react";
import { InvestmentDialog } from "@/components/investment-dialog";
import { Button } from "@/components/ui/button";

interface CryptoHolding {
  id: string;
  coin: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  buyDate: Date | string;
  note?: string | null;
  // Enriched
  currentValue: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface InvestmentListProps {
  holdings: CryptoHolding[];
}

export function InvestmentList({ holdings }: InvestmentListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<CryptoHolding | null>(null);

  const handleEdit = (h: CryptoHolding) => {
    setSelected(h);
    setIsOpen(true);
  };

  const handleAdd = () => {
    setSelected(null);
    setIsOpen(true);
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber" />
          Danh mục đầu tư
        </h2>
        <Button
          size="sm"
          onClick={handleAdd}
          className="bg-amber/10 text-amber hover:bg-amber/20 h-8"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm mới
        </Button>
      </div>

      {holdings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có khoản đầu tư nào
        </p>
      ) : (
        <div className="space-y-3">
          {holdings.map((h) => (
            <div
              key={h.id}
              onClick={() => handleEdit(h)}
              className="glass rounded-xl p-4 glass-hover cursor-pointer group"
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

      <InvestmentDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        initialData={selected}
      />
    </div>
  );
}
