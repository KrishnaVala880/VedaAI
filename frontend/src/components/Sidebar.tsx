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

import Image from "next/image";

interface Props {
  active: string;
  onNav: (v: string) => void;
  assignmentCount?: number;
}

const navItems = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "groups", label: "My Groups", icon: Users },
  { id: "assignments", label: "Assignments", icon: FileText, hasBadge: true },
  { id: "toolkit", label: "AI Teacher's Toolkit", icon: ToolkitIcon },
  { id: "library", label: "My Library", icon: BookOpen },
];

export default function Sidebar({ active, onNav, assignmentCount = 0 }: Props) {
  return (
    <aside className="w-[260px] h-screen bg-white border-r border-gray-100 flex flex-col shrink-0 rounded-2xl m-2 shadow-lg">
      {/* Logo */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-2.5">
          <Image src="/vedaai-logo.png" alt="VedaAI Logo" width={40} height={40} className="rounded-xl shadow-md" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">VedaAI</span>
        </div>
      </div>

      {/* Create Assignment — Orange border, shadow, spacing */}
      <div className="px-4 pb-4 pt-4">
        <button
          onClick={() => onNav("create")}
          className="w-full px-4 py-2.5 bg-gradient-to-b from-[#232323] to-[#232323] text-white font-semibold rounded-full text-base flex items-center justify-center gap-2 border-2 border-orange-400 shadow-[0_2px_8px_0_rgba(232,89,60,0.15)] outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          style={{ boxShadow: '0 0 0 4px #fff, 0 2px 8px 0 rgba(232,89,60,0.15)' }}
        >
          <Sparkles className="w-5 h-5 text-white" />
          Create Assignment
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          // Custom icons for Home, Groups, Toolkit, Library if you have SVGs, else use Lucide
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-all duration-150 ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium"
              }`}
            >
              <Icon className={`w-[22px] h-[22px] ${isActive ? "text-gray-700" : "text-gray-400"}`} />
              {item.label}
              {item.hasBadge && assignmentCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-[#E8593C] text-white text-[10px] font-bold flex items-center justify-center">
                  {assignmentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 py-2 mt-2">
        <div
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium text-gray-400 bg-gray-50 cursor-not-allowed select-none"
        >
          <Settings className="w-[22px] h-[22px] text-gray-300" />
          Settings
        </div>
      </div>

      {/* User Profile — avatar image */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center shrink-0 border-2 border-white shadow">
            <Image src="/dps-avata.png" alt="Delhi Public School" width={40} height={40} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-gray-900 truncate">Delhi Public School</p>
            <p className="text-[12px] text-gray-400">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}