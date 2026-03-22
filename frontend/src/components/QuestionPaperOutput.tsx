"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import TopBar from "./TopBar";
import { Download, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Props {
  assignmentId: string;
  onBack: () => void;
}

export default function QuestionPaperOutput({ assignmentId, onBack }: Props) {
  const { paper, fetchPaper, regenerate, progress } = useStore();
  // Removed PDF download feature
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useWebSocket(assignmentId);

  useEffect(() => {
    setLocalLoading(true);
    fetchPaper(assignmentId).finally(() => setLocalLoading(false));
  }, [assignmentId, fetchPaper]);

  useEffect(() => {
    if (progress?.status === "completed" && isRegenerating) {
      setIsRegenerating(false);
      fetchPaper(assignmentId);
      toast.success("Paper regenerated!");
    }
    if (progress?.status === "failed" && isRegenerating) {
      setIsRegenerating(false);
      toast.error("Regeneration failed");
    }
  }, [progress?.status, isRegenerating, assignmentId, fetchPaper]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regenerate(assignmentId);
    } catch {
      setIsRegenerating(false);
      toast.error("Failed");
    }
  };

  // Removed PDF download feature

  const diffLabel = (d: string) => ({ easy: "Easy", medium: "Moderate", hard: "Challenging" }[d] || d);
  const diffClass = (d: string) => ({ easy: "tag-easy", medium: "tag-moderate", hard: "tag-challenging" }[d] || "tag-moderate");

  if (isRegenerating) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Generate Now" onBack={onBack} icon="sparkle" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700">Regenerating paper...</p>
            <p className="text-xs text-gray-400 mt-1">{progress?.message || "Please wait"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (localLoading || !paper) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Generate Now" onBack={onBack} icon="sparkle" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Generate Now" onBack={onBack} icon="sparkle" />
      <div className="flex-1 overflow-y-auto p-6">

        <div className="max-w-3xl mx-auto">
          {/* Regenerate button */}
          <button onClick={handleRegenerate} className="btn-outline text-[13px] mb-5">
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>

          {/* Paper */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-10 py-10">
              {/* Header */}
              <div className="text-center mb-5">
                <h1 className="text-[17px] font-bold text-gray-900">Delhi Public School, Sector-4, Bokaro</h1>
                <p className="text-sm text-gray-600 mt-1">Subject: {paper.subject}</p>
                <p className="text-sm text-gray-600">Class: {paper.grade}th</p>
              </div>

              <div className="flex justify-between text-sm text-gray-700 mb-3">
                <span><span className="font-semibold">Time Allowed:</span> {paper.duration} minutes</span>
                <span><span className="font-semibold">Maximum Marks:</span> {paper.totalMarks}</span>
              </div>

              <p className="text-sm text-gray-600 mb-5">All questions are compulsory unless stated otherwise.</p>

              {/* Student info */}
              <div className="space-y-2.5 mb-8">
                {[["Name", ""], ["Roll Number", ""], ["Class 5th Section", ""]].map(([label]) => (
                  <div key={label} className="flex items-center">
                    <span className="text-sm text-gray-700 w-36 shrink-0">{label} : </span>
                    <div className="flex-1 border-b border-gray-400" />
                  </div>
                ))}
              </div>

              {/* Sections */}
              {paper.sections.map((section) => (
                <div key={section.sectionLabel} className="mb-7">
                  <h2 className="text-center text-[15px] font-bold text-gray-900 mb-2">
                    Section {section.sectionLabel}
                  </h2>
                  <p className="text-sm font-bold text-gray-900">{section.title.replace(`Section ${section.sectionLabel} - `, "").replace(`Section ${section.sectionLabel}`, "")}</p>
                  <p className="text-xs text-gray-500 mb-3">{section.instructions}</p>

                  <div className="space-y-4">
                    {section.questions.map((q) => (
                      <div key={q.questionNumber} className="text-sm text-gray-800 leading-relaxed">
                        <div>
                          <span className="font-semibold">{q.questionNumber}.</span> <span className={diffClass(q.difficulty)}>[{diffLabel(q.difficulty)}]</span>{" "}
                          {q.text} [{q.marks} Mark{q.marks > 1 ? "s" : ""}]
                        </div>
                        {q.type === "mcq" && q.options && (
                          <ol className="list-[upper-alpha] pl-6 mt-1">
                            {q.options.map((opt, idx) => (
                              <li key={idx} className="mb-0.5">{opt}</li>
                            ))}
                          </ol>
                        )}
                        {q.type === "diagram" && (
                          <div className="italic text-blue-700 mt-1">(Draw and label as instructed above.)</div>
                        )}
                        {q.type === "numerical" && (
                          <div className="italic text-green-700 mt-1">(Show all steps and final answer.)</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <p className="text-center text-sm font-bold text-gray-900 mt-6 mb-6">End of Question Paper</p>

              {/* Answer Key */}
              {paper.sections.some((s) => s.questions.some((q) => q.expectedAnswer)) && (
                <div className="pt-5 border-t-2 border-gray-800">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-3 underline">Answer Key:</h3>
                  {paper.sections.flatMap((s) =>
                    s.questions.filter((q) => q.expectedAnswer).map((q) => (
                      <p key={q.questionNumber} className="text-sm text-gray-700 mb-2 leading-relaxed">
                        {q.questionNumber}. {q.expectedAnswer}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}