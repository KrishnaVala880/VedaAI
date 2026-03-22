"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import TopBar from "./TopBar";
import { Plus, Search, Filter, MoreVertical, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Props {
  onCreate: () => void;
  onView: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function Dashboard({ onCreate, onView }: Props) {
  const { assignments, fetchAssignments, loading, deleteAssignment } = useStore();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filtered = assignments.filter((a) =>
    [a.title, a.subject, a.grade]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await deleteAssignment(id);
    toast.success("Assignment deleted");
    setConfirmDelete(null);
    setMenuOpen(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f7fb]">
      <TopBar title="Assignment" onBack={() => {}} />

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Assignments
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-4">
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Filter + Search */}
        <div className="flex items-center gap-3 mb-6">
          <button className="px-4 py-2 bg-white rounded-lg text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filter By
          </button>

          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Assignment"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                {filtered.map((assignment) => (
                  <div
                    key={assignment._id}
                    onClick={() =>
                      assignment.status === "completed" && onView(assignment._id)
                    }
                    className={`bg-[#f5f5f7] rounded-2xl p-5 shadow-sm transition-all relative group
                      ${
                        assignment.status === "completed"
                          ? "cursor-pointer hover:shadow-md"
                          : "opacity-70 cursor-not-allowed"
                      }`}
                  >
                    {/* Menu */}
                    <div
                      className="absolute top-3 right-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setMenuOpen(
                            menuOpen === assignment._id ? null : assignment._id
                          )
                        }
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {menuOpen === assignment._id && (
                        <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-1 z-20">
                          <button
                            onClick={() => {
                              onView(assignment._id);
                              setMenuOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            View Assignment
                          </button>

                          <button
                            onClick={() => {
                              setConfirmDelete(assignment._id);
                              setMenuOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[16px] font-semibold text-gray-900 mb-2 pr-6">
                      {assignment.title}
                    </h3>

                    {/* Dates */}
                    <div className="flex justify-between text-[12px] text-gray-500">
                      <span>
                        <span className="font-medium text-gray-600">
                          Assigned on:
                        </span>{" "}
                        {format(new Date(assignment.createdAt), "dd-MM-yyyy")}
                      </span>

                      {assignment.dueDate && (
                        <span>
                          <span className="font-medium text-gray-600">
                            Due:
                          </span>{" "}
                          {format(new Date(assignment.dueDate), "dd-MM-yyyy")}
                        </span>
                      )}
                    </div>

                    {/* Processing */}
                    {assignment.status === "processing" && (
                      <div className="mt-3 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                        <span className="text-xs text-orange-500 font-medium">
                          Generating...
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* No results */}
            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No assignments found
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Button */}
      <button
        onClick={onCreate}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full shadow-lg hover:bg-gray-900 transition-all"
      >
        <Plus className="w-4 h-4" />
        Create Assignment
      </button>

      {/* Delete Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-500" />
            </div>

            <h3 className="text-base font-bold text-gray-900 text-center mb-2">
              Delete Assignment?
            </h3>

            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}