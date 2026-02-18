"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Layers } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";
import * as Icons from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  type: string;
  group: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
}

export function CategorySettings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE",
    group: "DAILY_FUEL",
    icon: "tag",
    color: "#F59E0B",
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpen(category?: Category) {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        type: category.type,
        group: category.group || "DAILY_FUEL",
        icon: category.icon || "tag",
        color: category.color || "#F59E0B",
        isActive: category.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        type: "EXPENSE",
        group: "DAILY_FUEL",
        icon: "tag",
        color: "#F59E0B",
        isActive: true,
      });
    }
    setIsOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/categories";
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...formData, id: editingId } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsOpen(false);
        fetchCategories();
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save category", error);
    } finally {
      setLoading(false);
    }
  }

  const catTypes = [
    { value: "INCOME", label: "Thu nhập" },
    { value: "EXPENSE", label: "Chi tiêu" },
    { value: "TRANSFER", label: "Chuyển khoản" },
  ];

  const catGroups = [
    { value: "DAILY_FUEL", label: "Hàng ngày (Daily Fuel)" },
    { value: "OPEX", label: "Vận hành (Opex)" },
    { value: "LIFESTYLE", label: "Phong cách sống (Lifestyle)" },
    { value: "SALARY", label: "Lương" },
    { value: "BUSINESS", label: "Kinh doanh" },
    { value: "INVESTMENT", label: "Đầu tư" },
    { value: "DEBT", label: "Nợ/Trả góp" },
  ];

  if (loading && categories.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Danh sách danh mục</h2>
        <Button
          onClick={() => handleOpen()}
          className="bg-amber text-slate-900 hover:bg-amber/90"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
        </Button>
      </div>

      <div className="grid gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
              cat.isActive
                ? "bg-white/5 border-white/10"
                : "bg-white/0 border-white/5 opacity-60"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-900 font-bold text-xs"
                style={{ backgroundColor: cat.color || "#555" }}
              >
                {(() => {
                  const Icon = (Icons as any)[cat.icon || "Tag"] || Layers;
                  return <Icon className="w-4 h-4" />;
                })()}
              </div>
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  {cat.name}
                  {!cat.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose/20 text-rose border border-rose/20">
                      Đã ẩn
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {catTypes.find((t) => t.value === cat.type)?.label}
                  {cat.group &&
                    ` • ${
                      catGroups.find((g) => g.value === cat.group)?.label ||
                      cat.group
                    }`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpen(cat)}
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
              {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label>Tên danh mục</Label>
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
                    {catTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nhóm</Label>
                <Select
                  value={formData.group}
                  onValueChange={(val) =>
                    setFormData({ ...formData, group: val })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-white/10">
                    {catGroups.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <Label className="mb-2 block">Biểu tượng</Label>
              <IconPicker
                value={formData.icon}
                onChange={(val) => setFormData({ ...formData, icon: val })}
              />
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
