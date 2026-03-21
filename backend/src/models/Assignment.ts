import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionTypeConfig {
  type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blanks';
  count: number;
  marksEach: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  board: string;
  dueDate: Date;
  duration: number;
  totalMarks: number;
  questionTypes: IQuestionTypeConfig[];
  additionalInstructions: string;
  fileUrl?: string;
  fileText?: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeConfigSchema = new Schema<IQuestionTypeConfig>({
  type: {
    type: String,
    enum: ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blanks', 'diagram', 'numerical'],
    required: true,
  },
  count: { type: Number, required: true, min: 1 },
  marksEach: { type: Number, required: true, min: 1 },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    board: { type: String, default: 'CBSE', trim: true },
    dueDate: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    questionTypes: { type: [QuestionTypeConfigSchema], required: true },
    additionalInstructions: { type: String, default: '' },
    fileUrl: { type: String },
    fileText: { type: String },
    status: {
      type: String,
      enum: ['draft', 'processing', 'completed', 'failed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);