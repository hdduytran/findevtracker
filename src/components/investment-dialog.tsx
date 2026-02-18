"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface CryptoHolding {
  id: string;
  coin: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  buyDate: Date | string;
  note?: string | null;
}

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CryptoHolding | null;
}

export function InvestmentDialog({
  open,
  onOpenChange,
  initialData,
}: InvestmentDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    coin: initialData?.coin || "",
    symbol: initialData?.symbol || "",
    quantity: initialData?.quantity?.toString() || "",
    entryPrice: initialData?.entryPrice?.toString() || "",
    buyDate: initialData
      ? new Date(initialData.buyDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    note: initialData?.note || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData ? "/api/investments" : "/api/investments"; // Same route, PATCH vs POST
      const method = initialData ? "PATCH" : "POST";
      const body = initialData ? { ...formData, id: initialData.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onOpenChange(false);
        router.refresh(); // Refresh server component to show new data
      }
    } catch (error) {
      console.error("Failed to save investment", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initialData || !confirm("Bạn có chắc chắn muốn xóa khoản đầu tư này?"))
      return;
    setLoading(true);
    try {
      await fetch(`/api/investments?id=${initialData.id}`, {
        method: "DELETE",
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E293B] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Sửa khoản đầu tư" : "Thêm khoản đầu tư"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tên tài sản</Label>
              <Input
                placeholder="Bitcoin, Vàng..."
                value={formData.coin}
                onChange={(e) =>
                  setFormData({ ...formData, coin: e.target.value })
                }
                required
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
            <div>
              <Label>Mã (Symbol)</Label>
              <Input
                placeholder="BTC, XAU..."
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    symbol: e.target.value.toUpperCase(),
                  })
                }
                required
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Số lượng</Label>
              <Input
                type="number"
                step="any"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
            <div>
              <Label>Giá mua (VND)</Label>
              <Input
                type="number"
                step="any"
                placeholder="1000000"
                value={formData.entryPrice}
                onChange={(e) =>
                  setFormData({ ...formData, entryPrice: e.target.value })
                }
                required
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Ngày đầu tư</Label>
            <Input
              type="date"
              value={formData.buyDate}
              onChange={(e) =>
                setFormData({ ...formData, buyDate: e.target.value })
              }
              required
              className="bg-white/5 border-white/10 mt-1"
            />
          </div>

          <div>
            <Label>Ghi chú</Label>
            <Input
              placeholder="Sàn Binance..."
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="bg-white/5 border-white/10 mt-1"
            />
          </div>

          <DialogFooter className="flex justify-between sm:justify-between items-center mt-6">
            {initialData ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                size="icon"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-emerald text-white hover:bg-emerald/90"
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
