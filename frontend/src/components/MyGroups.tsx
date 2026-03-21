"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import {
  Plus,
  Users,
  MoreVertical,
  UserPlus,
  Mail,
  Search,
  GraduationCap,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface Group {
  id: string;
  name: string;
  grade: string;
  section: string;
  studentCount: number;
  color: string;
}

const COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-amber-500", "bg-pink-500", "bg-teal-500",
];

export default function MyGroups() {
  const [groups, setGroups] = useState<Group[]>([
    { id: "1", name: "Science A", grade: "10", section: "A", studentCount: 32, color: "bg-blue-500" },
    { id: "2", name: "Mathematics", grade: "9", section: "B", studentCount: 28, color: "bg-green-500" },
    { id: "3", name: "English Literature", grade: "11", section: "A", studentCount: 35, color: "bg-purple-500" },
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", grade: "", section: "" });
  const [search, setSearch] = useState("");

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newGroup.name || !newGroup.grade) {
      toast.error("Name and Grade are required");
      return;
    }
    const group: Group = {
      id: Date.now().toString(),
      name: newGroup.name,
      grade: newGroup.grade,
      section: newGroup.section || "A",
      studentCount: 0,
      color: COLORS[groups.length % COLORS.length],
    };
    setGroups([...groups, group]);
    setNewGroup({ name: "", grade: "", section: "" });
    setShowCreate(false);
    toast.success(`Group "${group.name}" created!`);
  };

  const handleDelete = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
    toast.success("Group deleted");
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="My Groups" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Groups</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your classes and student groups.
              </p>
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1 self-center">
              <Plus className="w-4 h-4" />
              New Group
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-xs mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              className="input-field pl-9 !py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Groups Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No groups yet</h3>
              <p className="text-sm text-gray-500 mb-4">Create a group to organize your students</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((group) => (
                <div key={group.id} className="card p-5 hover:shadow-md transition-shadow group relative">
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Color bar */}
                  <div className={`w-10 h-10 rounded-xl ${group.color} flex items-center justify-center mb-3`}>
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Class {group.grade} • Section {group.section}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {group.studentCount} students
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Add student">
                        <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Send email">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Create New Group</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                <input className="input-field" placeholder="e.g., Science A" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <select className="input-field" value={newGroup.grade} onChange={(e) => setNewGroup({ ...newGroup, grade: e.target.value })}>
                    <option value="">Select</option>
                    {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1)}>Class {i + 1}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input className="input-field" placeholder="A" value={newGroup.section} onChange={(e) => setNewGroup({ ...newGroup, section: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-outline flex-1 justify-center">Cancel</button>
              <button onClick={handleCreate} className="btn-primary flex-1 justify-center">Create Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}