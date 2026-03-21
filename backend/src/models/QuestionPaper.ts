import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  questionNumber: number;
  text: string;
  type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blanks';
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  expectedAnswer?: string;
}

export interface ISection {
  sectionLabel: string;
  title: string;
  instructions: string;
  questionType: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  grade: string;
  board: string;
  duration: number;
  totalMarks: number;
  sections: ISection[];
  generalInstructions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blanks', 'diagram', 'numerical'],
    required: true,
  },
  options: [{ type: String }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  marks: { type: Number, required: true },
  expectedAnswer: { type: String },
});

const SectionSchema = new Schema<ISection>({
  sectionLabel: { type: String, required: true },
  title: { type: String, required: true },
  instructions: { type: String, required: true },
  questionType: { type: String, required: true },
  questions: [QuestionSchema],
});

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    board: { type: String, default: 'CBSE' },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    sections: [SectionSchema],
    generalInstructions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);