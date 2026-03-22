"use client";

import { useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store/useStore";

// const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws";
if (!process.env.NEXT_PUBLIC_WS_URL) {
  throw new Error("WS URL not defined");
}
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export function useWebSocket(assignmentId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<NodeJS.Timeout>();
  const setProgress = useStore((s) => s.setProgress);
  const fetchPaper = useStore((s) => s.fetchPaper);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (assignmentId) {
        ws.send(JSON.stringify({ type: "subscribe", assignmentId }));
      }
    };

    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === "progress") {
          setProgress({
            status: d.status,
            message: d.message,
            progress: d.progress,
          });
        } else if (d.type === "completed") {
          setProgress({
            status: "completed",
            message: d.message,
            progress: 100,
            questionPaperId: d.questionPaperId,
          });
          if (d.assignmentId) fetchPaper(d.assignmentId);
        } else if (d.type === "failed") {
          setProgress({
            status: "failed",
            message: d.message,
            progress: 0,
          });
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      retryRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {};
  }, [assignmentId, setProgress, fetchPaper]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    if (assignmentId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "subscribe", assignmentId })
      );
    }
  }, [assignmentId]);
}