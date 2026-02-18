"use client";

import * as Icons from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const iconNames = [
  "Wallet",
  "Banknote",
  "CreditCard",
  "Bitcoin",
  "TrendingUp",
  "PiggyBank",
  "Building2",
  "Smartphone",
  "DollarSign",
  "Euro",
  "PoundSterling",
  "JapaneseYen",
  "Home",
  "Car",
  "ShoppingBag",
  "Utensils",
  "Coffee",
  "Gamepad2",
  "HeartPulse",
  "Stethoscope",
  "Briefcase",
  "Code",
  "GraduationCap",
  "Plane",
  "Gift",
  "Zap",
  "Wifi",
  "Shield",
  "Lock",
  "Key",
  "Hammer",
  "Wrench",
  "Bus",
  "Train",
  "Music",
  "Video",
  "Film",
  "Camera",
  "Image",
  "Cloud",
  "Sun",
  "Moon",
  "Star",
  "Award",
  "Trophy",
  "Medal",
  "Flag",
  "MapPin",
  "Navigation",
  "Compass",
  "Fuel",
  "Server",
  "Repeat",
  "ArrowRightLeft",
  "Layers",
  "MoreHorizontal",
  "Plus",
  "Trash2",
  "Edit",
  "Settings",
  "User",
  "Users",
  "Phone",
  "Mail",
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = (Icons as any)[value] || Icons.HelpCircle;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 p-0 rounded-lg border-white/10 bg-white/5 hover:bg-white/10"
        >
          <SelectedIcon className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1E293B] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn biểu tượng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/10"
          />
          <div className="h-[300px] overflow-y-auto grid grid-cols-6 gap-2 p-2">
            {filteredIcons.map((name) => {
              const Icon = (Icons as any)[name];
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  onClick={() => {
                    onChange(name); // Pass original case component name e.g. "Banknote"
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-white/10",
                    value === name
                      ? "bg-amber text-slate-900"
                      : "text-muted-foreground"
                  )}
                  title={name}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
