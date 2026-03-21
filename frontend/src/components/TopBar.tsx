"use client";

import { ChevronLeft, Bell, ChevronDown, LayoutGrid, Sparkles } from "lucide-react";

interface Props {
  title: string;
  onBack?: () => void;
  icon?: "grid" | "sparkle";
}

export default function TopBar({ title, onBack, icon = "grid" }: Props) {
  return (
    <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
        {icon === "sparkle" ? (
          <Sparkles className="w-4 h-4 text-gray-400" />
        ) : (
          <LayoutGrid className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-sm text-gray-500 font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-[18px] h-[18px] text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E8593C] rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
            <span className="text-[10px] font-bold text-orange-800">JD</span>
          </div>
          <span className="text-sm font-medium text-gray-700">John Doe</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}