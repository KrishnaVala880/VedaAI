"use client";

import {
  Home as HomeIcon,
  Users,
  FileText,
  BookOpen,
  Settings,
  Sparkles,
} from "lucide-react";
import { Lightbulb as ToolkitIcon } from "lucide-react";

interface Props {
  active: string;
  onNav: (v: string) => void;
  assignmentCount?: number;
}

const navItems = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "groups", label: "Groups", icon: Users },
  { id: "assignments", label: "Assignments", icon: FileText, hasBadge: true },
  { id: "toolkit", label: "Toolkit", icon: ToolkitIcon },
  { id: "library", label: "Library", icon: BookOpen },
];

export default function MobileNavBar({ active, onNav, assignmentCount = 0 }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-16 md:hidden shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full text-xs ${
              isActive ? "text-orange-500 font-bold" : "text-gray-500"
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
            {item.label}
            {item.hasBadge && assignmentCount > 0 && (
              <span className="absolute top-2 right-4 min-w-[18px] h-4 px-1 rounded-full bg-[#E8593C] text-white text-[10px] font-bold flex items-center justify-center">
                {assignmentCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
