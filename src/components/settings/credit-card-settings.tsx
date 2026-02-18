"use client";

import { useState, useEffect } from "react";
import { Plus, CreditCard, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

interface Liability {
  id: string;
  name: string;
  totalAmount: number; // Limit
  monthlyDue: number; // Min pay
  dueDay: number;
  statementDay: number | null;
  type: string;
}

export function CreditCardSettings() {
  const [cards, setCards] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    limit: "",
    monthlyDue: "0",
    statementDay: "1",
    dueDay: "15",
    description: "",
  });

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    try {
      const res = await fetch("/api/liabilities");
      const data = await res.json();
      // Filter only CREDIT_CARD
      setCards(data.filter((l: Liability) => l.type === "CREDIT_CARD"));
    } catch (error) {
      console.error("Failed to fetch cards", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/liabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "CREDIT_CARD",
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        fetchCards();
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add card", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && cards.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Danh sách thẻ tín dụng</h2>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-amber text-slate-900 hover:bg-amber/90"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm thẻ mới
        </Button>
      </div>

      <div className="grid gap-4">
        {cards.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            Chưa có thẻ tín dụng nào.
          </p>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="p-4 rounded-xl border bg-white/5 border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform rotate-[-5deg]">
                  <CreditCard className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <p className="font-medium">{card.name}</p>
                  <p className="text-xs text-muted-foreground flex gap-3 mt-1">
                    <span>Hạn mức: {formatCurrency(card.totalAmount)}</span>
                    <span>Sao kê: {card.statementDay}</span>
                    <span>Thanh toán: {card.dueDay}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-amber/10 border border-amber/20 rounded-xl p-4 mt-8 flex gap-3">
        <Info className="w-5 h-5 text-amber shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber mb-1">Cơ chế hoạt động</p>
          <p className="text-muted-foreground">
            Khi thêm thẻ tín dụng mới, hệ thống sẽ tự động tạo một{" "}
            <strong>Tài khoản (Account)</strong> để ghi nhận giao dịch chi tiêu
            và một <strong>Nghĩa vụ nợ (Liability)</strong> để theo dõi dư nợ và
            ngày thanh toán.
          </p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#1E293B] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Thêm thẻ tín dụng mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label>Tên thẻ (Ngân hàng & Loại thẻ)</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Ví dụ: VPBank Platinum"
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hạn mức tín dụng</Label>
                <Input
                  type="number"
                  value={formData.limit}
                  onChange={(e) =>
                    setFormData({ ...formData, limit: e.target.value })
                  }
                  required
                  placeholder="50000000"
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
              <div>
                <Label>Thanh toán tối thiểu</Label>
                <Input
                  type="number"
                  value={formData.monthlyDue}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyDue: e.target.value })
                  }
                  placeholder="0"
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày sao kê (1-31)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.statementDay}
                  onChange={(e) =>
                    setFormData({ ...formData, statementDay: e.target.value })
                  }
                  required
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
              <div>
                <Label>Hạn thanh toán (1-31)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDay: e.target.value })
                  }
                  required
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-amber text-slate-900 hover:bg-amber/90"
              >
                Tạo thẻ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
