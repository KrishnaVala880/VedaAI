"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import TopBar from "./TopBar";
import {
  FileText, Search, Download, Eye, Trash2,
  BookOpen, FolderOpen, Clock, Star, StarOff,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Props {
  onView: (id: string) => void;
}

export default function MyLibrary({ onView }: Props) {
  const { assignments, fetchAssignments } = useStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "starred">("all");
  const [starred, setStarred] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const completed = assignments.filter((a) => a.status === "completed");
  const filtered = completed
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => tab === "all" || starred.has(a._id));

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success("Removed from favorites");
      } else {
        next.add(id);
        toast.success("Added to favorites");
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="My Library" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#E8593C]" />
              My Library
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              All your generated question papers in one place.
            </p>
          </div>

          {/* Tabs + Search */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {(["all", "starred"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    tab === t
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "all" ? `All Papers (${completed.length})` : `Favorites (${starred.size})`}
                </button>
              ))}
            </div>
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search papers..."
                className="input-field pl-9 !py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Papers List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {tab === "starred" ? "No favorites yet" : "No papers found"}
              </h3>
              <p className="text-sm text-gray-500">
                {tab === "starred"
                  ? "Star papers to add them to your favorites"
                  : "Generate question papers to see them here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => (
                <div
                  key={a._id}
                  className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{a.title}</h3>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                      <span>{a.subject}</span>
                      <span>•</span>
                      <span>Class {a.grade}</span>
                      <span>•</span>
                      <span>{a.totalMarks} marks</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(a.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleStar(a._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title={starred.has(a._id) ? "Unfavorite" : "Favorite"}
                    >
                      {starred.has(a._id) ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => onView(a._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}