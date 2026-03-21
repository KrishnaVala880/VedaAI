"use client";

import {
  FileText,
  Users,
  Brain,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Zap,
  CalendarDays,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";
import TopBar from "./TopBar";

interface Props {
  onNav: (v: string) => void;
}

export default function HomePage({ onNav }: Props) {
  const { assignments, fetchAssignments } = useStore();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const stats = {
    total: assignments.length,
    completed: assignments.filter((a) => a.status === "completed").length,
    processing: assignments.filter((a) => a.status === "processing").length,
    totalQuestions: assignments.reduce((s, a) =>
      s + (a.questionTypes?.reduce((qs, qt) => qs + qt.count, 0) || 0), 0
    ),
  };

  const recentCompleted = assignments
    .filter((a) => a.status === "completed")
    .slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Home" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, John! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Here&apos;s what&apos;s happening with your assessments today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Papers",
                value: stats.total,
                icon: FileText,
                color: "text-blue-600",
                bg: "bg-blue-50",
                change: "+2 this week",
              },
              {
                label: "Completed",
                value: stats.completed,
                icon: CheckCircle2,
                color: "text-green-600",
                bg: "bg-green-50",
                change: "100% success",
              },
              {
                label: "In Progress",
                value: stats.processing,
                icon: Clock,
                color: "text-amber-600",
                bg: "bg-amber-50",
                change: "generating...",
              },
              {
                label: "Questions Generated",
                value: stats.totalQuestions,
                icon: Brain,
                color: "text-purple-600",
                bg: "bg-purple-50",
                change: "across all papers",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-300" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{stat.change}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    title: "Create Assessment",
                    desc: "Generate a new AI-powered question paper",
                    icon: Plus,
                    color: "bg-[#E8593C]",
                    textColor: "text-white",
                    action: () => onNav("create"),
                  },
                  {
                    title: "View Assignments",
                    desc: "Browse all your created assignments",
                    icon: FileText,
                    color: "bg-blue-50",
                    textColor: "text-blue-700",
                    action: () => onNav("assignments"),
                  },
                  {
                    title: "AI Toolkit",
                    desc: "Explore AI tools for teaching",
                    icon: Sparkles,
                    color: "bg-purple-50",
                    textColor: "text-purple-700",
                    action: () => onNav("toolkit"),
                  },
                  {
                    title: "My Library",
                    desc: "Access saved papers and templates",
                    icon: BookOpen,
                    color: "bg-amber-50",
                    textColor: "text-amber-700",
                    action: () => onNav("library"),
                  },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={action.action}
                      className={`${i === 0 ? action.color : "card"} p-4 rounded-xl text-left hover:shadow-md transition-all group`}
                    >
                      <div className={`w-9 h-9 rounded-lg ${i === 0 ? "bg-white/20" : action.color} flex items-center justify-center mb-3`}>
                        <Icon className={`w-4.5 h-4.5 ${i === 0 ? "text-white" : action.textColor}`} />
                      </div>
                      <h3 className={`text-sm font-semibold ${i === 0 ? "text-white" : "text-gray-900"}`}>
                        {action.title}
                      </h3>
                      <p className={`text-xs mt-0.5 ${i === 0 ? "text-white/70" : "text-gray-500"}`}>
                        {action.desc}
                      </p>
                      <ArrowRight className={`w-4 h-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${i === 0 ? "text-white" : "text-gray-400"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="card p-4">
                {recentCompleted.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first assessment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCompleted.map((a) => (
                      <div
                        key={a._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onNav("assignments")}
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                          <p className="text-[11px] text-gray-400">{a.subject} • {a.totalMarks} marks</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tip Card */}
              <div className="mt-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">Pro Tip</span>
                </div>
                <p className="text-xs text-purple-600 leading-relaxed">
                  Add detailed instructions when creating assignments to get more relevant and
                  accurate questions from the AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}