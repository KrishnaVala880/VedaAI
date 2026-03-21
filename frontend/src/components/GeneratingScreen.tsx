"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  assignmentId: string;
  onComplete: () => void;
}

export default function GeneratingScreen({
  assignmentId,
  onComplete,
}: Props) {
  const { progress, paper, fetchPaper } = useStore();
  useWebSocket(assignmentId);

  useEffect(() => {
    if (progress?.status === "completed") fetchPaper(assignmentId);
  }, [progress?.status, assignmentId, fetchPaper]);

  useEffect(() => {
    if (paper && paper.assignmentId === assignmentId) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [paper, assignmentId, onComplete]);

  const p = progress?.progress || 0;
  const status = progress?.status || "processing";
  const msg = progress?.message || "Initializing...";

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F8FA] p-8">
      <div className="card p-10 max-w-md w-full text-center shadow-sm">
        <div className="mb-6">
          {status === "failed" ? (
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          ) : status === "completed" ? (
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-[#E8593C] animate-spin" />
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {status === "completed"
            ? "Paper Generated!"
            : status === "failed"
            ? "Generation Failed"
            : "Generating Question Paper"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">{msg}</p>

        {status !== "failed" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Progress</span>
              <span>{Math.round(p)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#E8593C] transition-all duration-500"
                style={{ width: `${p}%` }}
              />
            </div>
          </div>
        )}

        {status === "failed" && (
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mx-auto mt-2"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}