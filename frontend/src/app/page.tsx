"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import Sidebar from "@/components/Sidebar";
import HomePage from "@/components/HomePage";
import Dashboard from "@/components/Dashboard";
import CreateAssignment from "@/components/CreateAssignment";
import GeneratingScreen from "@/components/GeneratingScreen";
import QuestionPaperOutput from "@/components/QuestionPaperOutput";
import MyGroups from "@/components/MyGroups";
import AIToolkit from "@/components/AIToolkit";
import MyLibrary from "@/components/MyLibrary";
import SettingsPage from "@/components/SettingsPage";

type View = "home" | "assignments" | "create" | "generating" | "view" | "groups" | "toolkit" | "library" | "settings";

export default function Page() {
  const [view, setView] = useState<View>("home");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { progress, paper, duplicateAssignment, resetForm, assignments } = useStore();

  useEffect(() => {
    if (progress?.status === "completed" && paper && view === "generating") setView("view");
  }, [progress?.status, paper, view]);

  const handleNav = (v: string) => {
    if (v === "create") { resetForm(); setView("create"); }
    else setView(v as View);
  };

  const handleViewPaper = (id: string) => { setActiveId(id); setView("view"); };
  const handleDuplicate = (id: string) => { duplicateAssignment(id); setView("create"); };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F8FA]">
      <Sidebar active={view} onNav={handleNav} assignmentCount={assignments.length} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {view === "home" && <HomePage onNav={handleNav} />}
        {view === "assignments" && <Dashboard onCreate={() => { resetForm(); setView("create"); }} onView={handleViewPaper} onDuplicate={handleDuplicate} />}
        {view === "create" && <CreateAssignment onSubmit={(id: string) => { setActiveId(id); setView("generating"); }} onBack={() => setView("assignments")} />}
        {view === "generating" && activeId && <GeneratingScreen assignmentId={activeId} onComplete={() => setView("view")} />}
        {view === "view" && activeId && <QuestionPaperOutput assignmentId={activeId} onBack={() => setView("assignments")} />}
        {view === "groups" && <MyGroups />}
        {view === "toolkit" && <AIToolkit onNav={handleNav} />}
        {view === "library" && <MyLibrary onView={handleViewPaper} />}
        {view === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}