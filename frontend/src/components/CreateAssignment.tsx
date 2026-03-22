"use client";

import React, { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import TopBar from "./TopBar";
import toast from "react-hot-toast";
import {
  CloudUpload, Plus, X, ChevronRight, ChevronLeft, ChevronDown,
} from "lucide-react";

const QT_OPTIONS = [
  { value: "mcq", label: "Multiple Choice Questions" },
  { value: "short_answer", label: "Short Questions" },
  { value: "diagram", label: "Diagram/Graph-Based Questions" },
  { value: "numerical", label: "Numerical Problems" },
];

export default function CreateAssignment({ onSubmit, onBack }: any) {
  const {
    form, setField, addQuestionType, removeQuestionType,
    updateQuestionType, createAssignment, loading,
  } = useStore();

  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    try {
      const id = await createAssignment(file);
      toast.success("Generating...");
      onSubmit(id);
    } catch (err: any) {
      toast.error("Failed");
    }
  };

  const totalQuestions = form.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = form.questionTypes.reduce((s, q) => s + q.count * q.marksEach, 0);

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6]">
      <TopBar title="Assignment" onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Create Assignment
              </h1>
              <p className="text-sm text-gray-500">
                Set up a new assignment for your students.
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex mb-8">
            <div className="h-1.5 w-2/5 bg-gray-900 rounded-full" />
            <div className="h-1.5 flex-1 bg-gray-300 rounded-full ml-2" />
          </div>

          {/* Card */}
          <div className="bg-[#f8f8fa] rounded-3xl shadow-lg p-10 border border-gray-200">

            <h2 className="font-semibold text-gray-900 mb-1">
              Assignment Details
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Basic information about your assignment
            </p>

            {/* Upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-gray-400 transition cursor-pointer mb-6"
            >
              <CloudUpload className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-700">
                Choose a file or drag & drop it here
              </p>
              <p className="text-xs text-gray-400">
                JPEG, PNG, upto 10MB
              </p>
              <button className="mt-4 px-5 py-1.5 border rounded-full text-sm bg-white hover:bg-gray-50">
                Browse Files
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Due Date */}
<div className="mb-6">
  <label className="text-sm font-medium text-gray-900">
    Due Date
  </label>

  <div className="relative mt-2">
    {/* Visible Input */}
    <input
      type="text"
      placeholder="DD-MM-YYYY"
      value={form.dueDate}
      onChange={(e) => setField("dueDate", e.target.value)}
      className="w-full px-5 py-3 rounded-full border border-gray-200 bg-white pr-12 focus:outline-none focus:ring-2 focus:ring-gray-300"
    />

    {/* Hidden Date Picker */}
    <input
      type="date"
      ref={(el) => {
        if (el) (window as any).datePicker = el;
      }}
      className="absolute opacity-0 pointer-events-none"
      onChange={(e) => {
        const value = e.target.value;
        if (value) {
          const [y, m, d] = value.split("-");
          setField("dueDate", `${d}-${m}-${y}`);
        }
      }}
    />

    {/* Custom Calendar Icon */}
    <button
      type="button"
      onClick={() => (window as any).datePicker?.showPicker()}
      className="absolute right-3 top-1/2 -translate-y-1/2"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        {/* Outer box */}
        <rect
          x="3"
          y="5"
          width="16"
          height="14"
          rx="4"
          stroke="#9CA3AF"
          strokeWidth="1.5"
        />
        {/* Top bar */}
        <line
          x1="3"
          y1="9"
          x2="19"
          y2="9"
          stroke="#9CA3AF"
          strokeWidth="1.5"
        />
        {/* Dots */}
        <circle cx="7" cy="12.5" r="1" fill="#9CA3AF" />
        <circle cx="11" cy="12.5" r="1" fill="#9CA3AF" />
        <circle cx="15" cy="12.5" r="1" fill="#9CA3AF" />
      </svg>
    </button>
  </div>
</div>

            {/* Question Types */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-700 mb-3">
                <span>Question Type</span>
                <div className="flex gap-16 pr-2">
                  <span>No. of Questions</span>
                  <span>Marks</span>
                </div>
              </div>

              {form.questionTypes.map((qt, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">

                  {/* Dropdown */}
                  <div className="flex-1 relative">
                    <select
                      className="w-full px-5 py-3 rounded-full bg-gray-100 border border-gray-200 appearance-none text-sm"
                      value={qt.type}
                      onChange={(e) =>
                        updateQuestionType(i, "type", e.target.value)
                      }
                    >
                      {QT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Remove */}
                  <X
                    className="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500"
                    onClick={() => removeQuestionType(i)}
                  />

                  {/* Count */}
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 gap-2">
                    <button
                      className="text-gray-500 hover:text-black"
                      onClick={() =>
                        updateQuestionType(i, "count", Math.max(1, qt.count - 1))
                      }
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center">
                      {qt.count}
                    </span>
                    <button
                      className="text-gray-500 hover:text-black"
                      onClick={() =>
                        updateQuestionType(i, "count", qt.count + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  {/* Marks */}
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 gap-2">
                    <button
                      className="text-gray-500 hover:text-black"
                      onClick={() =>
                        updateQuestionType(i, "marksEach", Math.max(1, qt.marksEach - 1))
                      }
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center">
                      {qt.marksEach}
                    </span>
                    <button
                      className="text-gray-500 hover:text-black"
                      onClick={() =>
                        updateQuestionType(i, "marksEach", qt.marksEach + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                </div>
              ))}

              {/* Add */}
              <button
                onClick={addQuestionType}
                className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-900 hover:text-black"
              >
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-sm">
                  <Plus size={14} />
                </div>
                Add Question Type
              </button>

              {/* Totals */}
              <div className="text-right mt-5 text-sm text-gray-700">
                <p>Total Questions : {totalQuestions}</p>
                <p>Total Marks : {totalMarks}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <label className="text-sm font-medium text-gray-900">
                Additional Information (For better output)
              </label>
              <textarea
                className="w-full mt-2 p-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                value={form.additionalInstructions}
                onChange={(e) =>
                  setField("additionalInstructions", e.target.value)
                }
              />
            </div>
          </div>

          {/* Bottom Buttons */}
<div className="flex justify-between mt-8 max-w-4xl mx-auto">

  {/* Previous */}
  <button
    onClick={onBack}
    className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
  >
    <ChevronLeft className="w-4 h-4" />
    Previous
  </button>

  {/* Next */}
  <button
    onClick={submit}
    disabled={loading}
    className="flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white hover:bg-gray-900 transition"
  >
    Next
    <ChevronRight className="w-4 h-4" />
  </button>

</div>

        </div>
      </div>
    </div>
  );
}