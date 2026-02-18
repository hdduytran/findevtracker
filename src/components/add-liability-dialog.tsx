"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function AddLiabilityDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    monthlyDue: "",
    dueDay: "1",
    type: "INSTALLMENT",
    interestRate: "0",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/liabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({
          name: "",
          totalAmount: "",
          monthlyDue: "",
          dueDay: "1",
          type: "INSTALLMENT",
          interestRate: "0",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add liability", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-amber text-slate-900 hover:bg-amber/90 font-medium"
      >
        <Plus className="w-4 h-4 mr-2" /> Thêm mới
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#1E293B] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Thêm nghĩa vụ nợ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label>Tên khoản nợ / Trả góp</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Ví dụ: Mua xe Vision"
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) =>
                    setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-white/10">
                    <SelectItem value="INSTALLMENT">Trả góp / Vay</SelectItem>
                    <SelectItem value="SUBSCRIPTION">
                      Đăng ký dịch vụ
                    </SelectItem>
                    {/* Credit card is better managed via settings to link account */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lãi suất (%)</Label>
                <Input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) =>
                    setFormData({ ...formData, interestRate: e.target.value })
                  }
                  placeholder="0"
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tổng số tiền (Gốc)</Label>
                <Input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: e.target.value })
                  }
                  // Required only for INSTALLMENT
                  required={formData.type === "INSTALLMENT"}
                  placeholder="0"
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
              <div>
                <Label>Trả hàng tháng</Label>
                <Input
                  type="number"
                  value={formData.monthlyDue}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyDue: e.target.value })
                  }
                  required
                  placeholder="0"
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày đến hạn (1-31)</Label>
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
              <div>
                <Label>Ngày kết thúc (dự kiến)</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
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
                disabled={loading}
                className="bg-amber text-slate-900 hover:bg-amber/90"
              >
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
