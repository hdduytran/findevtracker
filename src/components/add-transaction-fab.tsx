"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  group: string | null;
}

export function AddTransactionFAB({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("EXPENSE");
  const router = useRouter();

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      amount: parseFloat(formData.get("amount") as string),
      type,
      accountId: formData.get("accountId") as string,
      categoryId: formData.get("categoryId") as string,
      note: formData.get("note") as string,
      toAccountId:
        type === "TRANSFER"
          ? (formData.get("toAccountId") as string)
          : undefined,
    };

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber to-yellow-300 text-slate-900 flex items-center justify-center shadow-lg fab-pulse cursor-pointer z-50 hover:scale-105 transition-transform duration-200"
        aria-label="Thêm giao dịch"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#1E293B] border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold gradient-text">
              Thêm giao dịch
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Type selector */}
            <div className="flex gap-2">
              {[
                {
                  value: "EXPENSE",
                  label: "Chi tiêu",
                  color: "bg-rose/20 text-rose border-rose/30",
                },
                {
                  value: "INCOME",
                  label: "Thu nhập",
                  color: "bg-emerald/20 text-emerald border-emerald/30",
                },
                {
                  value: "TRANSFER",
                  label: "Chuyển",
                  color: "bg-cyan/20 text-cyan border-cyan/30",
                },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                    type === t.value
                      ? t.color
                      : "border-white/10 text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="text-xs text-muted-foreground">
                Số tiền (VND)
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                required
                placeholder="0"
                className="text-2xl font-bold h-14 bg-white/5 border-white/10 mt-1"
              />
            </div>

            {/* Account */}
            <div>
              <Label className="text-xs text-muted-foreground">Tài khoản</Label>
              <Select name="accountId" required>
                <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Account (for transfers) */}
            {type === "TRANSFER" && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  Chuyển đến
                </Label>
                <Select name="toAccountId" required>
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                    <SelectValue placeholder="Chọn tài khoản đích" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category */}
            <div>
              <Label className="text-xs text-muted-foreground">Danh mục</Label>
              <Select name="categoryId" required>
                <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.group && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({c.group})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div>
              <Label htmlFor="note" className="text-xs text-muted-foreground">
                Ghi chú
              </Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Mô tả giao dịch..."
                className="bg-white/5 border-white/10 mt-1 min-h-[60px]"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber to-yellow-300 text-slate-900 font-semibold hover:opacity-90 cursor-pointer h-12"
            >
              {loading ? "Đang lưu..." : "Lưu giao dịch"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
