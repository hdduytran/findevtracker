"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  icon: string | null;
  color: string | null;
  isActive: boolean;
}

export function AccountSettings() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "CASH",
    balance: "",
    icon: "wallet",
    color: "#10B981",
    isActive: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpen(account?: Account) {
    if (account) {
      setEditingId(account.id);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        icon: account.icon || "wallet",
        color: account.color || "#10B981",
        isActive: account.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        type: "CASH",
        balance: "0",
        icon: "wallet",
        color: "#10B981",
        isActive: true,
      });
    }
    setIsOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/accounts";
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...formData, id: editingId } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsOpen(false);
        fetchAccounts();
        router.refresh(); // Refresh server components if any
      }
    } catch (error) {
      console.error("Failed to save account", error);
    } finally {
      setLoading(false);
    }
  }

  const accountTypes = [
    { value: "CASH", label: "Tiền mặt" },
    { value: "BANK", label: "Ngân hàng" },
    { value: "CREDIT", label: "Thẻ tín dụng" },
    { value: "CRYPTO", label: "Crypto" },
    { value: "INVESTMENT", label: "Đầu tư" },
  ];

  if (loading && accounts.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Danh sách tài khoản</h2>
        <Button
          onClick={() => handleOpen()}
          className="bg-amber text-slate-900 hover:bg-amber/90"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm tài khoản
        </Button>
      </div>

      <div className="grid gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
              acc.isActive
                ? "bg-white/5 border-white/10"
                : "bg-white/0 border-white/5 opacity-60"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-900 font-bold"
                style={{ backgroundColor: acc.color || "#555" }}
              >
                {acc.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  {acc.name}
                  {!acc.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose/20 text-rose border border-rose/20">
                      Đã ẩn
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {accountTypes.find((t) => t.value === acc.type)?.label} •{" "}
                  {formatCurrency(acc.balance)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpen(acc)}
              className="opacity-0 group-hover:opacity-100 hover:bg-white/10"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#1E293B] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label>Tên tài khoản</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
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
                    {accountTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Số dư ban đầu</Label>
                <Input
                  type="number"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value })
                  }
                  required
                  className="bg-white/5 border-white/10 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Màu sắc</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-12 h-10 p-1 bg-white/5 border-white/10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              {editingId && (
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 bg-white/5"
                    />
                    Đang hoạt động
                  </label>
                </div>
              )}
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
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
