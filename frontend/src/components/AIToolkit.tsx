"use client";

import TopBar from "./TopBar";
import {
  Sparkles, FileText, BookOpen, MessageSquare, Languages,
  BarChart3, PenTool, Lightbulb, ArrowRight, Lock, CheckCircle2,
} from "lucide-react";

interface Props {
  onNav: (v: string) => void;
}

const tools = [
  {
    id: "quiz",
    name: "Question Paper Generator",
    desc: "Create AI-powered question papers from any topic or syllabus",
    icon: FileText,
    color: "bg-[#E8593C]",
    iconColor: "text-white",
    active: true,
    tag: "Most Used",
  },
  {
    id: "summarize",
    name: "Content Summarizer",
    desc: "Summarize long chapters and texts into key points for students",
    icon: BookOpen,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    active: false,
    tag: "Coming Soon",
  },
  {
    id: "rubric",
    name: "Rubric Generator",
    desc: "Auto-generate grading rubrics based on assignment objectives",
    icon: BarChart3,
    color: "bg-green-50",
    iconColor: "text-green-600",
    active: false,
    tag: "Coming Soon",
  },
  {
    id: "feedback",
    name: "Student Feedback Writer",
    desc: "Generate personalized feedback for student performance",
    icon: MessageSquare,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    active: false,
    tag: "Coming Soon",
  },
  {
    id: "translate",
    name: "Multi-Language Translator",
    desc: "Translate question papers into Hindi, Tamil, and other languages",
    icon: Languages,
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    active: false,
    tag: "Coming Soon",
  },
  {
    id: "lesson",
    name: "Lesson Plan Creator",
    desc: "Generate structured lesson plans with learning objectives",
    icon: PenTool,
    color: "bg-pink-50",
    iconColor: "text-pink-600",
    active: false,
    tag: "Coming Soon",
  },
];

export default function AIToolkit({ onNav }: Props) {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="AI Teacher's Toolkit" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#E8593C]" />
              <h1 className="text-xl font-bold text-gray-900">AI Teacher&apos;s Toolkit</h1>
            </div>
            <p className="text-sm text-gray-500">
              Powerful AI tools designed to save teachers time and improve student outcomes.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    if (tool.active) onNav("create");
                  }}
                  className={`card p-5 transition-all relative group ${
                    tool.active
                      ? "hover:shadow-lg cursor-pointer hover:border-[#E8593C]/30"
                      : "opacity-70 cursor-not-allowed"
                  }`}
                >
                  {/* Tag */}
                  <div className="absolute top-3 right-3">
                    {tool.active ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {tool.tag}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        {tool.tag}
                      </span>
                    )}
                  </div>

                  <div className={`w-11 h-11 rounded-xl ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{tool.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>

                  {tool.active && (
                    <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#E8593C] opacity-0 group-hover:opacity-100 transition-opacity">
                      Open tool <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Banner */}
          <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">More tools coming soon!</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  We&apos;re building more AI-powered tools to help teachers with grading,
                  lesson planning, parent communication, and student analytics. Stay tuned!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}