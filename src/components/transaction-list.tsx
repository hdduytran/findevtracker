"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string | Date; // API returns string, Prisma returns Date
  note?: string | null;
  category: { name: string; icon?: string | null; color?: string | null };
  account: { name: string };
  // ... other fields
}

interface TransactionListProps {
  initialTransactions: Transaction[];
}

export function TransactionList({ initialTransactions }: TransactionListProps) {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [offset, setOffset] = useState(initialTransactions.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTransactions.length >= 20); // Assume page size 20

  const loadMore = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", "20");
      params.set("skip", offset.toString());
      // Period params are already in searchParams

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const newTxs: Transaction[] = await res.json();
        if (newTxs.length < 20) setHasMore(false);
        setTransactions((prev) => [...prev, ...newTxs]);
        setOffset((prev) => prev + newTxs.length);
      }
    } catch (error) {
      console.error("Failed to load more transactions", error);
    } finally {
      setLoading(false);
    }
  };

  // Group by date
  const grouped: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const dateObj = new Date(tx.date);
    const key = formatDate(dateObj); // Ensure formatDate handles Date object or string
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  }

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center mt-4">
        <p className="text-muted-foreground text-sm">Không có giao dịch nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            ) : null}
            {loading ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}
    </div>
  );
}
