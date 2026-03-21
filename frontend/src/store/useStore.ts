import { create } from "zustand";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface QuestionTypeConfig {
  type: "mcq" | "short_answer" | "long_answer" | "true_false" | "fill_blanks" | "diagram" | "numerical";
  count: number;
  marksEach: number;
}

export interface FormData {
  title: string;
  subject: string;
  grade: string;
  board: string;
  school: string;
  dueDate: string;
  duration: number;
  totalMarks: number;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
}

export interface Question {
  questionNumber: number;
  text: string;
  type: string;
  options?: string[];
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  expectedAnswer?: string;
}

export interface Section {
  sectionLabel: string;
  title: string;
  instructions: string;
  questionType: string;
  questions: Question[];
}

export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  title: string;
  subject: string;
  grade: string;
  board: string;
  duration: number;
  totalMarks: number;
  sections: Section[];
  generalInstructions: string[];
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  status: "draft" | "processing" | "completed" | "failed";
  totalMarks: number;
  duration: number;
  dueDate: string;
  createdAt: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
}

export interface Progress {
  status: string;
  message: string;
  progress: number;
  questionPaperId?: string;
}

export const SUBJECTS = [
  "Mathematics", "Science", "English", "Hindi", "History",
  "Geography", "Physics", "Chemistry", "Biology", "Computer Science",
  "Economics", "Political Science", "Accountancy",
];

export const GRADES = ["1","2","3","4","5","6","7","8","9","10","11","12"];

interface Store {
  form: FormData;
  assignments: Assignment[];
  paper: QuestionPaper | null;
  progress: Progress | null;
  loading: boolean;

  setField: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
  addQuestionType: () => void;
  removeQuestionType: (i: number) => void;
  updateQuestionType: <K extends keyof QuestionTypeConfig>(i: number, key: K, val: QuestionTypeConfig[K]) => void;
  resetForm: () => void;
  setProgress: (p: Progress | null) => void;

  fetchAssignments: () => Promise<void>;
  createAssignment: (file?: File | null) => Promise<string>;
  fetchPaper: (id: string) => Promise<void>;
  regenerate: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<boolean>;
  duplicateAssignment: (id: string) => void;
}

const defaultForm: FormData = {
  title: "",
  subject: "",
  grade: "",
  board: "CBSE",
  school: "Delhi Public School",
  dueDate: "",
  duration: 45,
  totalMarks: 20,
  questionTypes: [{ type: "mcq", count: 4, marksEach: 1 }],
  additionalInstructions: "",
};

export const useStore = create<Store>((set, get) => ({
  form: { ...defaultForm },
  assignments: [],
  paper: null,
  progress: null,
  loading: false,

  setField: (key, val) => set((s) => ({ form: { ...s.form, [key]: val } })),

  addQuestionType: () =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: [...s.form.questionTypes, { type: "short_answer" as const, count: 3, marksEach: 2 }],
      },
    })),

  removeQuestionType: (i) =>
    set((s) => ({
      form: { ...s.form, questionTypes: s.form.questionTypes.filter((_, idx) => idx !== i) },
    })),

  updateQuestionType: (i, key, val) =>
    set((s) => {
      const arr = [...s.form.questionTypes];
      arr[i] = { ...arr[i], [key]: val };
      return { form: { ...s.form, questionTypes: arr } };
    }),

  resetForm: () => set({ form: { ...defaultForm } }),
  setProgress: (progress) => set({ progress }),

  fetchAssignments: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`${API}/assignments`);
      set({ assignments: data.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createAssignment: async (file) => {

    set({ loading: true });
    const { form } = get();
    // Convert DD-MM-YYYY to ISO string if needed
    let dueDate = form.dueDate;
    if (/^\d{2}-\d{2}-\d{4}$/.test(dueDate)) {
      const [dd, mm, yyyy] = dueDate.split("-");
      const iso = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`).toISOString();
      dueDate = iso;
    }
    const fd = new window.FormData();
    fd.append("title", form.title || `Quiz on ${form.subject || "General"}`);
    fd.append("subject", form.subject || "General");
    fd.append("grade", form.grade || "5");
    fd.append("board", form.board);
    fd.append("dueDate", dueDate || new Date(Date.now() + 7 * 86400000).toISOString());
    fd.append("duration", String(form.duration));
    fd.append("totalMarks", String(form.totalMarks));
    fd.append("questionTypes", JSON.stringify(form.questionTypes));
    fd.append("additionalInstructions", form.additionalInstructions);
    if (file) fd.append("file", file);

    const { data } = await axios.post(`${API}/assignments`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    set({
      loading: false,
      progress: { status: "processing", message: "Starting generation...", progress: 5 },
    });

    return data.data._id;
  },

  fetchPaper: async (assignmentId) => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`${API}/question-papers/assignment/${assignmentId}`);
      set({ paper: data.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  // FIXED: Regenerate properly
  regenerate: async (assignmentId) => {
    try {
      set({
        paper: null,
        progress: { status: "processing", message: "Regenerating question paper...", progress: 0 },
      });
      await axios.post(`${API}/assignments/${assignmentId}/regenerate`);
    } catch (err: any) {
      set({
        progress: { status: "failed", message: err.message || "Regeneration failed", progress: 0 },
      });
    }
  },

  // FIXED: Delete properly with API call
  deleteAssignment: async (id) => {
    try {
      await axios.delete(`${API}/assignments/${id}`);
      set((s) => ({
        assignments: s.assignments.filter((a) => a._id !== id),
      }));
      return true;
    } catch {
      // Even if API fails, remove from local state
      set((s) => ({
        assignments: s.assignments.filter((a) => a._id !== id),
      }));
      return false;
    }
  },

  duplicateAssignment: (id) => {
    const { assignments } = get();
    const a = assignments.find((x) => x._id === id);
    if (!a) return;
    set({
      form: {
        title: `${a.title} (Copy)`,
        subject: a.subject || "",
        grade: a.grade || "",
        board: "CBSE",
        school: "Delhi Public School",
        dueDate: "",
        duration: a.duration || 45,
        totalMarks: a.totalMarks || 20,
        questionTypes: a.questionTypes || [{ type: "mcq", count: 4, marksEach: 1 }],
        additionalInstructions: a.additionalInstructions || "",
      },
    });
  },
}));