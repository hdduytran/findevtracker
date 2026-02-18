"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { PiggyBank, CreditCard, Wallet } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Liability {
  id: string;
  name: string;
  type: string;
  monthlyDue: number;
  currentDebt?: number;
  totalAmount?: number;
  linkedAccountId?: string | null;
}

interface PayLiabilityDialogProps {
  liability: Liability;
  accounts: Account[];
  trigger?: React.ReactNode;
}

export function PayLiabilityDialog({
  liability,
  accounts,
  trigger,
}: PayLiabilityDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Default amount logic
  const defaultAmount =
    liability.type === "CREDIT_CARD"
      ? liability.currentDebt || 0
      : liability.monthlyDue;

  const [formData, setFormData] = useState({
    amount: defaultAmount > 0 ? defaultAmount.toString() : "",
    accountId: "", // Source
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const isCreditCard = liability.type === "CREDIT_CARD";
  const sourceAccounts = accounts.filter((a) =>
    ["BANK", "CASH"].includes(a.type)
  );

  useEffect(() => {
    if (open && !isCreditCard) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) =>
          setCategories(data.filter((c: Category) => c.type === "EXPENSE"))
        )
        .catch((err) => console.error(err));
    }
  }, [open, isCreditCard]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.accountId) return;
    setLoading(true);

    try {
      const type = isCreditCard ? "TRANSFER" : "EXPENSE";

      const body: any = {
        amount: parseFloat(formData.amount),
        type,
        accountId: formData.accountId,
        note: `Thanh toán ${liability.name}`,
        date: new Date(formData.date),
        liabilityId: liability.id,
      };

      if (isCreditCard) {
        // If it's a credit card payment, it's a TRANSFER from Source -> Linked Credit Account
        if (liability.linkedAccountId) {
          body.toAccountId = liability.linkedAccountId;
          // For Transfer, categoryId is usually not required, but strict schema might need it.
          // Adjust based on your schema. Assuming optional for transfers.
        } else {
          // If no linked account ID found (shouldn't happen for valid CC), treat as Expense?
          // Or error out.
          console.error("No linked account for credit card liability");
          alert("Không tìm thấy tài khoản thẻ tín dụng liên kết.");
          setLoading(false);
          return;
        }
      } else {
        // Installment -> EXPENSE
        if (!formData.categoryId) {
          alert("Vui lòng chọn danh mục chi tiêu/trả nợ.");
          setLoading(false);
          return;
        }
        body.categoryId = formData.categoryId;
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Payment failed", error);
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="border-emerald text-emerald hover:bg-emerald/10"
          >
            Thanh toán
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#1E293B] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thanh toán {liability.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Số tiền</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
            <div>
              <Label>Ngày</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Nguồn tiền (Từ tài khoản)</Label>
            <Select
              value={formData.accountId}
              onValueChange={(val) =>
                setFormData({ ...formData, accountId: val })
              }
              required
            >
              <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                <SelectValue placeholder="Chọn tài khoản..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-white/10">
                {sourceAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isCreditCard && (
            <div>
              <Label>Danh mục (Trả nợ / Chi tiêu)</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(val) =>
                  setFormData({ ...formData, categoryId: val })
                }
                required
              >
                <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                  <SelectValue placeholder="Chọn danh mục..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-white/10">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald text-white hover:bg-emerald/90"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
