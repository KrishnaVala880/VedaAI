import OpenAI from 'openai';
import { IAssignment } from '../models/Assignment';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 🔥 STRONG PROMPT (forces correct schema)
 */
function buildPrompt(assignment: IAssignment): string {
  const typeDescriptions = assignment.questionTypes
    .map((qt) => {
      const names: Record<string, string> = {
        mcq: 'Multiple Choice Questions (4 options each)',
        short_answer: 'Short Answer Questions (2-3 sentences)',
        long_answer: 'Long Answer Questions (detailed)',
        true_false: 'True/False Questions',
        fill_blanks: 'Fill in the Blanks',
        diagram: 'Diagram/Graph Based',
        numerical: 'Numerical Problems',
      };
      return `- ${names[qt.type]}: ${qt.count} questions, ${qt.marksEach} marks each`;
    })
    .join('\n');

  const fileContext = assignment.fileText
    ? `\nReference:\n${assignment.fileText.substring(0, 2000)}`
    : '';

  return `
Generate a COMPLETE exam paper in STRICT JSON format.

IMPORTANT: Follow this EXACT schema. Do NOT skip fields.

{
  "title": string,
  "subject": string,
  "grade": string,
  "board": string,
  "duration": number,
  "totalMarks": number,
  "generalInstructions": string[],
  "sections": [
    {
      "sectionLabel": "A",
      "title": string,
      "instructions": string,
      "questionType": "mcq | short_answer | long_answer | true_false | fill_blanks | diagram | numerical",
      "questions": [
        {
          "questionNumber": number,
          "type": string,
          "text": string,
          "marks": number,
          "difficulty": "easy | medium | hard",
          "options": string[], 
          "expectedAnswer": string
        }
      ]
    }
  ]
}

RULES:
- ALL fields are REQUIRED
- NO null / undefined
- MCQ must have EXACTLY 4 options
- Questions MUST match their section type
- Total marks must equal ${assignment.totalMarks}
- Section labels: A, B, C, D...

DETAILS:
Subject: ${assignment.subject}
Grade: ${assignment.grade}
Board: ${assignment.board || 'CBSE'}
Title: ${assignment.title}
Duration: ${assignment.duration}
Marks: ${assignment.totalMarks}

Question Requirements:
${typeDescriptions}

${fileContext}
`;
}

export interface GeneratedPaperData {
  title: string;
  subject: string;
  grade: string;
  board: string;
  duration: number;
  totalMarks: number;
  sections: any[];
  generalInstructions: string[];
}

/**
 * 🔥 MAIN FUNCTION
 */
export async function generateQuestionPaper(
  assignment: IAssignment
): Promise<GeneratedPaperData> {
  const prompt = buildPrompt(assignment);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You generate strictly valid JSON for exam papers. No markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);

    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Invalid AI response: sections missing');
    }

    // 🔥 TYPE NORMALIZATION MAP
    const typeMap: Record<string, string> = {
      mcq: 'mcq',
      'short answer': 'short_answer',
      short_answer: 'short_answer',
      'long answer': 'long_answer',
      long_answer: 'long_answer',
      'true false': 'true_false',
      true_false: 'true_false',
      'fill blanks': 'fill_blanks',
      fill_blanks: 'fill_blanks',
      diagram: 'diagram',
      numerical: 'numerical',
    };

    let questionCounter = 1;

    // 🔥 HARD VALIDATION + AUTO FIX
    parsed.sections.forEach((section: any, sIndex: number) => {
      // ✅ Section fixes
      section.sectionLabel =
        section.sectionLabel || String.fromCharCode(65 + sIndex);

      section.title =
        section.title || `Section ${section.sectionLabel}`;

      section.instructions =
        section.instructions || 'Attempt all questions';

      section.questionType =
        typeMap[section.questionType] || section.questionType || 'mcq';

      if (!section.questions) section.questions = [];

      // ✅ Question fixes
      section.questions.forEach((q: any, qIndex: number) => {
        q.questionNumber = questionCounter++;

        q.type =
          typeMap[q.type] ||
          section.questionType ||
          'mcq';

        q.text =
          q.text || `Sample question ${qIndex + 1}`;

        q.marks = q.marks || 1;

        q.difficulty =
          ['easy', 'medium', 'hard'].includes(q.difficulty)
            ? q.difficulty
            : 'medium';

        // ✅ MCQ safety
        if (q.type === 'mcq') {
          if (!q.options || q.options.length !== 4) {
            q.options = [
              'Option A',
              'Option B',
              'Option C',
              'Option D',
            ];
          }
          q.expectedAnswer = q.expectedAnswer || q.options[0];
        }
      });
    });

    // 🔍 DEBUG (keep this while testing)
    console.log(
      '✅ FINAL CLEANED OUTPUT:',
      JSON.stringify(parsed, null, 2)
    );

    return {
      title: parsed.title || assignment.title,
      subject: parsed.subject || assignment.subject,
      grade: parsed.grade || assignment.grade,
      board: parsed.board || 'CBSE',
      duration: parsed.duration || assignment.duration,
      totalMarks: parsed.totalMarks || assignment.totalMarks,
      sections: parsed.sections,
      generalInstructions: parsed.generalInstructions || [
        'All questions are compulsory.',
        'Write neatly.',
      ],
    };
  } catch (error: any) {
    console.error('❌ AI ERROR:', error.message);
    return generateFallback(assignment);
  }
}

/**
 * ✅ FALLBACK (unchanged but safe)
 */
function generateFallback(a: IAssignment): GeneratedPaperData {
  const labels = ['A', 'B', 'C', 'D'];

  let counter = 1;

  const sections = a.questionTypes.map((qt, idx) => ({
    sectionLabel: labels[idx],
    title: `Section ${labels[idx]}`,
    instructions: 'Attempt all questions',
    questionType: qt.type,
    questions: Array.from({ length: qt.count }, (_, i) => ({
      questionNumber: counter++,
      text: `Sample question ${i + 1}`,
      type: qt.type,
      marks: qt.marksEach,
      difficulty: ['easy', 'medium', 'hard'][i % 3],
      options:
        qt.type === 'mcq'
          ? ['A', 'B', 'C', 'D']
          : undefined,
      expectedAnswer:
        qt.type === 'mcq' ? 'A' : undefined,
    })),
  }));

  return {
    title: a.title,
    subject: a.subject,
    grade: a.grade,
    board: a.board || 'CBSE',
    duration: a.duration,
    totalMarks: a.totalMarks,
    sections,
    generalInstructions: [
      'All questions are compulsory.',
    ],
  };
}