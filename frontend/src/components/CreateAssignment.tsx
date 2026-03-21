// "use client";

// import React, { useState, useRef } from "react";
// import { useStore, SUBJECTS, GRADES } from "@/store/useStore";
// import TopBar from "./TopBar";
// import toast from "react-hot-toast";
// import {
//   CloudUpload, Calendar, Plus, X, ChevronRight, ChevronLeft,
//   ChevronDown, Minus, FileText, Sparkles,
// } from "lucide-react";

// const QT_OPTIONS = [
//   { value: "mcq", label: "Multiple Choice Questions" },
//   { value: "short_answer", label: "Short Questions" },
//   { value: "long_answer", label: "Long Answer Questions" },
//   { value: "diagram", label: "Diagram/Graph Based Questions" },
//   { value: "numerical", label: "Numerical Problems" },
//   { value: "true_false", label: "True/False Questions" },
//   { value: "fill_blanks", label: "Fill in the Blanks" },
// ];

// interface Props {
//   onSubmit: (id: string) => void;
//   onBack: () => void;
// }

// export default function CreateAssignment({ onSubmit, onBack }: Props) {
//   const {
//     form, setField, addQuestionType, removeQuestionType,
//     updateQuestionType, createAssignment, loading,
//   } = useStore();

//   const [file, setFile] = useState<File | null>(null);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const fileRef = useRef<HTMLInputElement>(null);

//   const validate = (): boolean => {
//     const e: Record<string, string> = {};
//     if (!form.questionTypes.length) e.qt = "Add at least one question type";
//     form.questionTypes.forEach((qt, i) => {
//       if (qt.count < 1) e[`c${i}`] = "Min 1";
//       if (qt.marksEach < 1) e[`m${i}`] = "Min 1";
//     });
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const submit = async () => {
//     if (!validate()) return;
//     try {
//       const id = await createAssignment(file);
//       toast.success("Generating question paper...");
//       onSubmit(id);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || err.message || "Failed");
//     }
//   };

//   const totalQuestions = form.questionTypes.reduce((s, q) => s + q.count, 0);
//   const totalMarks = form.questionTypes.reduce((s, q) => s + q.count * q.marksEach, 0);

//   return (
//     <div className="flex flex-col h-full" style={{ background: '#ececec' }}>
//       <TopBar title="Assignment" onBack={onBack} />
//       <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center relative">
//         {/* Header absolutely positioned in top left */}
//         <div className="absolute left-0 top-0 mt-10 ml-12 flex items-center gap-3 z-10">
//           <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow text-white font-bold text-base">✓</div>
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">Create Assignment</h1>
//             <p className="text-[13px] text-gray-500 mt-0.5">Set up a new assignment for your students.</p>
//           </div>
//         </div>
//         {/* Progress bar centered below header */}
//           {/* Progress bar full width, left-aligned under header */}
//           <div className="w-full max-w-5xl" style={{ marginTop: '90px', marginLeft: '0' }}>
//             <div className="w-full flex items-center mb-7">
//               <div className="h-1.5 w-2/5 bg-gray-900 rounded-l-full" />
//               <div className="h-1.5 flex-1 bg-gray-200 rounded-r-full" />
//             </div>
//           <div className="rounded-2xl bg-[#f7f7f9] shadow-xl p-8 space-y-8 border border-[#e0e0e0] w-full min-h-[600px]">
//             <div>
//               <h2 className="text-[15px] font-bold text-gray-900">Assignment Details</h2>
//               <p className="text-xs text-gray-400 mt-0.5">Basic information about your assignment</p>
//             </div>

//             {/* File Upload — matching Figma with cloud icon */}
//             <div>
//               <div
//                 onClick={() => fileRef.current?.click()}
//                 className="border-4 border-dashed border-gray-300 rounded-2xl py-10 px-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
//                 style={{ borderStyle: 'dashed', borderWidth: '4px' }}
//               >
//                 {file ? (
//                   <div className="flex items-center justify-center gap-3">
//                     <FileText className="w-8 h-8 text-[#E8593C]" />
//                     <div className="text-left">
//                       <p className="text-sm font-medium text-gray-900">{file.name}</p>
//                       <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
//                     </div>
//                     <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 rounded-full hover:bg-gray-100">
//                       <X className="w-4 h-4 text-gray-400" />
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <CloudUpload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//                     <p className="text-base text-gray-700 font-medium">Choose a file or drag & drop it here</p>
//                     <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, and PDF, (max 10MB)</p>
//                     <button type="button" className="mt-4 px-6 py-2 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
//                       Browse Files
//                     </button>
//                   </>
//                 )}
//               </div>
//               <p className="text-xs text-gray-400 mt-2 text-center">
//                 Upload images of your preferred document/image
//               </p>
//               <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => {
//                 const f = e.target.files?.[0];
//                 if (f && f.size <= 10485760) setFile(f); else if (f) toast.error("Max 10MB");
//               }} className="hidden" />
//             </div>

//             {/* Due Date — matching Figma */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-900 mb-1.5">Due Date</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   className="input-field pr-10"
//                   placeholder="DD-MM-YYYY"
//                   value={form.dueDate}
//                   onChange={(e) => setField("dueDate", e.target.value)}
//                   maxLength={10}
//                 />
//                 {/* Custom calendar icon (rounded, single) */}
//                 <span className="absolute right-3 top-1/2 -translate-y-1/2">
//                   <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="3" y="6" width="16" height="12" rx="3" fill="#fff" stroke="#BDBDBD" strokeWidth="1.5"/><rect x="7" y="10" width="2" height="2" rx="1" fill="#BDBDBD"/><rect x="11" y="10" width="2" height="2" rx="1" fill="#BDBDBD"/><rect x="15" y="10" width="2" height="2" rx="1" fill="#BDBDBD"/></svg>
//                 </span>
//               </div>
//             </div>

//             {/* Question Type — matching Figma exactly */}
//             <div>
//               <div className="flex items-end mb-3">
//                 <span className="text-sm font-semibold text-gray-900 flex-1">Question Type</span>
//                 <span className="text-sm font-semibold text-gray-900 w-[100px] text-center">No. of Questions</span>
//                 <span className="text-sm font-semibold text-gray-900 w-[80px] text-center">Marks</span>
//               </div>

//               {errors.qt && <p className="text-xs text-red-500 mb-2">{errors.qt}</p>}

//               <div className="space-y-2.5">
//                 {form.questionTypes.map((qt, i) => (
//                   <div key={i} className="flex items-center gap-2">
//                     {/* Dropdown */}
//                     <div className="flex-1 relative">
//                       <select
//                         className="input-field-sm appearance-none pr-8 text-[13px]"
//                         value={qt.type}
//                         onChange={(e) => updateQuestionType(i, "type", e.target.value as any)}
//                       >
//                         {QT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
//                       </select>
//                       <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                     </div>

//                     {/* X remove */}
//                     <button
//                       onClick={() => removeQuestionType(i)}
//                       className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>

//                     {/* Count: - N + */}
//                     <div className="w-[100px] flex items-center justify-center gap-0">
//                       <button
//                         onClick={() => updateQuestionType(i, "count", Math.max(1, qt.count - 1))}
//                         className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
//                       >
//                         <span className="text-lg leading-none">−</span>
//                       </button>
//                       <span className="w-8 text-center text-sm font-semibold text-gray-900">{qt.count}</span>
//                       <button
//                         onClick={() => updateQuestionType(i, "count", qt.count + 1)}
//                         className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
//                       >
//                         <span className="text-lg leading-none">+</span>
//                       </button>
//                     </div>

//                     {/* Marks: - N + */}
//                     <div className="w-[80px] flex items-center justify-center gap-0">
//                       <button
//                         onClick={() => updateQuestionType(i, "marksEach", Math.max(1, qt.marksEach - 1))}
//                         className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
//                       >
//                         <span className="text-lg leading-none">−</span>
//                       </button>
//                       <span className="w-8 text-center text-sm font-semibold text-gray-900">{qt.marksEach}</span>
//                       <button
//                         onClick={() => updateQuestionType(i, "marksEach", qt.marksEach + 1)}
//                         className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
//                       >
//                         <span className="text-lg leading-none">+</span>
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Question Type — blue/orange circle + text */}
//               <button
//                 onClick={addQuestionType}
//                 className="flex items-center gap-2 mt-4 text-sm font-semibold text-black hover:text-[#E8593C] transition-colors"
//               >
//                 <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
//                   <Plus className="w-3.5 h-3.5 text-white" />
//                 </div>
//                 Add Question Type
//               </button>

//               {/* Totals — right aligned */}
//               <div className="mt-4 text-right space-y-0.5">
//                 <p className="text-sm text-gray-600">
//                   Total Questions : <span className="font-bold text-gray-900">{totalQuestions}</span>
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Total Marks : <span className="font-bold text-gray-900">{totalMarks}</span>
//                 </p>
//               </div>
//             </div>

//             {/* Additional Information */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-900 mb-1.5">
//                 Additional Information (For better output)
//               </label>
//               <div className="relative">
//                 <textarea
//                   className="input-field min-h-[80px] resize-none pr-10 text-[13px]"
//                   placeholder="e.g Generate a question paper for 5 base exam duration..."
//                   value={form.additionalInstructions}
//                   onChange={(e) => setField("additionalInstructions", e.target.value)}
//                 />
//                 <Sparkles className="absolute right-3 bottom-3 w-4 h-4 text-gray-300" />
//               </div>
//             </div>
//           </div>

//           {/* Bottom Buttons — matching Figma: outline "Previous" + dark "Next" */}
//           <div className="flex items-center justify-between mt-8 pb-2">
//             <button onClick={onBack} className="flex items-center gap-2 px-7 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-100 transition-all">
//               <ChevronLeft className="w-5 h-5" />
//               Previous
//             </button>
//             <button onClick={submit} disabled={loading} className="flex items-center gap-2 px-7 py-2 rounded-full bg-black text-white font-semibold shadow hover:bg-gray-900 transition-all">
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Generating...
//                 </>
//               ) : (
//                 <>
//                   Next
//                   <ChevronRight className="w-5 h-5" />
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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