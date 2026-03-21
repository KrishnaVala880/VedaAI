// import OpenAI from 'openai';
// import { IAssignment } from '../models/Assignment';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// /**
//  * Builds a structured prompt from assignment data.
//  * This is the KEY part - we tell the AI exactly what JSON format to return.
//  */
// function buildPrompt(assignment: IAssignment): string {
//   // Convert question type codes to readable descriptions
//   const typeDescriptions = assignment.questionTypes
//     .map((qt) => {
//       const names: Record<string, string> = {
//         mcq: 'Multiple Choice Questions (4 options each)',
//         short_answer: 'Short Answer Questions (2-3 sentence answers)',
//         long_answer: 'Long Answer / Essay Questions (detailed answers)',
//         true_false: 'True or False Questions',
//         fill_blanks: 'Fill in the Blanks Questions',
//       };
//       return `- ${names[qt.type]}: ${qt.count} questions, ${qt.marksEach} marks each`;
//     })
//     .join('\n');

//   // Include uploaded file text if available (truncated)
//   const fileContext = assignment.fileText
//     ? `\n\nReference Material:\n${assignment.fileText.substring(0, 3000)}`
//     : '';

//   return `You are an expert exam paper creator. Generate a structured question paper.

// Subject: ${assignment.subject}
// Grade/Class: ${assignment.grade}
// Board: ${assignment.board || 'CBSE'}
// Title: ${assignment.title}
// Duration: ${assignment.duration} minutes
// Total Marks: ${assignment.totalMarks}

// Question Types Required:
// ${typeDescriptions}

// Teacher Instructions: ${assignment.additionalInstructions || 'None'}
// ${fileContext}

// IMPORTANT INSTRUCTIONS FOR EACH QUESTION TYPE:
// - MCQ: Each question must have 4 unique, plausible options. Only one correct answer. Do not repeat questions or options.
// - Short Answer: Require 2-3 sentences, not one-word answers. Avoid MCQ-style questions.
// - Long Answer: Require detailed, multi-sentence explanations or essays.
// - Diagram/Graph-Based: Ask for drawing, labeling, or interpreting diagrams/graphs. Example: "Draw and label a plant cell." or "Interpret the given bar graph."
// - Numerical: Require calculation, show all steps and the final answer. Example: "Calculate the area of a rectangle with length 5cm and width 3cm."
// - True/False: Clearly state the statement to be marked true or false.
// - Fill in the Blanks: Provide a sentence with a blank to be filled.

// RESPOND WITH VALID JSON ONLY. No markdown, no code blocks, just raw JSON:

// {
//   "title": "${assignment.title}",
//   "subject": "${assignment.subject}",
//   "grade": "${assignment.grade}",
//   "board": "${assignment.board || 'CBSE'}",
//   "duration": ${assignment.duration},
//   "totalMarks": ${assignment.totalMarks},
//   "generalInstructions": [
//     "All questions are compulsory.",
//     "Read each question carefully before answering.",
//     "Marks for each question are indicated against it.",
//     "Write neat and legible answers."
//   ],
//   "sections": [ ... ]
// }

// RULES:
// 1. Questions MUST be relevant to ${assignment.subject} for Grade ${assignment.grade}
// 2. Difficulty: ~30% easy, ~50% medium, ~20% hard
// 3. Sections labeled A, B, C, D sequentially
// 4. Question numbers sequential ACROSS all sections
// 5. MCQs MUST have exactly 4 options
// 6. Total marks MUST equal ${assignment.totalMarks}
// 7. Generate EXACTLY the specified count per type
// 8. Questions should be grade-appropriate, type-appropriate, and academically sound
// 9. Do NOT repeat questions or answers across the paper.`;
// }

// export interface GeneratedPaperData {
//   title: string;
//   subject: string;
//   grade: string;
//   board: string;
//   duration: number;
//   totalMarks: number;
//   sections: any[];
//   generalInstructions: string[];
// }

// export async function generateQuestionPaper(
//   assignment: IAssignment
// ): Promise<GeneratedPaperData> {
//   const prompt = buildPrompt(assignment);

//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [
//         {
//           role: 'system',
//           content:
//             'You are a professional exam paper generator for Indian school boards. Always respond with valid JSON only. No markdown.',
//         },
//         { role: 'user', content: prompt },
//       ],
//       temperature: 0.7,
//       max_tokens: 4096,
//       response_format: { type: 'json_object' },
//     });

//     const content = response.choices[0]?.message?.content;
//     if (!content) throw new Error('Empty AI response');

//     // Clean up response
//     let cleaned = content.trim();
//     if (cleaned.startsWith('```')) {
//       cleaned = cleaned
//         .replace(/```json?\n?/g, '')
//         .replace(/```\s*$/g, '')
//         .trim();
//     }

//     // Parse JSON
//     const parsed = JSON.parse(cleaned);

//     // Validate structure
//     if (!parsed.sections || !Array.isArray(parsed.sections)) {
//       throw new Error('Invalid: missing sections array');
//     }

//     // Post-process: fix sequential numbering, validate difficulties, ensure type field
//     let questionCounter = 1;
//     // Map for normalizing type values
//     const typeMap: Record<string, string> = {
//       'mcq': 'mcq',
//       'short answer': 'short_answer',
//       'short_answer': 'short_answer',
//       'long answer': 'long_answer',
//       'long_answer': 'long_answer',
//       'true false': 'true_false',
//       'true_false': 'true_false',
//       'fill blanks': 'fill_blanks',
//       'fill_blanks': 'fill_blanks',
//       'diagram': 'diagram',
//       'diagram/graph': 'diagram',
//       'diagram/graph-based': 'diagram',
//       'diagram/graph based': 'diagram',
//       'numerical': 'numerical',
//       'numerical problems': 'numerical',
//     };
//     for (const section of parsed.sections) {
//       if (!section.questions) section.questions = [];
//       for (const question of section.questions) {
//         question.questionNumber = questionCounter++;
//         // Ensure every question has a 'type' field
//         if (!question.type && section.questionType) {
//           question.type = section.questionType;
//         }
//         // Normalize type value
//         if (question.type && typeMap[question.type]) {
//           question.type = typeMap[question.type];
//         }
//         if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
//           question.difficulty = 'medium';
//         }
//         if (
//           question.type === 'mcq' &&
//           (!question.options || question.options.length !== 4)
//         ) {
//           question.options = [
//             'Option A',
//             'Option B',
//             'Option C',
//             'Option D',
//           ];
//         }
//       }
//     }

//     return {
//       title: parsed.title || assignment.title,
//       subject: parsed.subject || assignment.subject,
//       grade: parsed.grade || assignment.grade,
//       board: parsed.board || 'CBSE',
//       duration: parsed.duration || assignment.duration,
//       totalMarks: parsed.totalMarks || assignment.totalMarks,
//       sections: parsed.sections,
//       generalInstructions: parsed.generalInstructions || [
//         'All questions are compulsory.',
//         'Marks are indicated against each question.',
//         'Write neat and legible answers.',
//       ],
//     };
//   } catch (error: any) {
//     console.error('AI generation error:', error.message);
//     // If API fails, return a fallback paper
//     return generateFallback(assignment);
//   }
// }

// /**
//  * Fallback: generates placeholder paper when AI is unavailable.
//  * Useful for testing without an API key.
//  */
// function generateFallback(a: IAssignment): GeneratedPaperData {
//   const labels = ['A', 'B', 'C', 'D', 'E'];
//   const typeNames: Record<string, string> = {
//     mcq: 'Multiple Choice Questions',
//     short_answer: 'Short Answer Questions',
//     long_answer: 'Long Answer Questions',
//     true_false: 'True or False',
//     fill_blanks: 'Fill in the Blanks',
//   };
//   const typeInstructions: Record<string, string> = {
//     mcq: 'Select the correct option for each question.',
//     short_answer: 'Answer in 2-3 sentences.',
//     long_answer: 'Answer in detail with proper explanation.',
//     true_false: 'Write True or False for each statement.',
//     fill_blanks: 'Fill in the blanks with correct words.',
//   };
//   const diffs: Array<'easy' | 'medium' | 'hard'> = [
//     'easy',
//     'medium',
//     'hard',
//   ];

//   let counter = 1;
//   const sections = a.questionTypes.map((qt, idx) => {
//     const questions = Array.from({ length: qt.count }, (_, i) => {
//       const q: any = {
//         questionNumber: counter++,
//         text: `Sample ${typeNames[qt.type]} question ${i + 1} about ${a.subject} for Class ${a.grade}.`,
//         type: qt.type,
//         difficulty: diffs[i % 3],
//         marks: qt.marksEach,
//       };
//       if (qt.type === 'mcq') {
//         q.options = ['Option A', 'Option B', 'Option C', 'Option D'];
//         q.expectedAnswer = 'Option B';
//       }
//       return q;
//     });

//     return {
//       sectionLabel: labels[idx] || String.fromCharCode(65 + idx),
//       title: `Section ${labels[idx]} - ${typeNames[qt.type]}`,
//       instructions: typeInstructions[qt.type] || 'Attempt all questions.',
//       questionType: qt.type,
//       questions,
//     };
//   });

//   return {
//     title: a.title,
//     subject: a.subject,
//     grade: a.grade,
//     board: a.board || 'CBSE',
//     duration: a.duration,
//     totalMarks: a.totalMarks,
//     sections,
//     generalInstructions: [
//       'All questions are compulsory.',
//       'Marks are indicated against each question.',
//       'Write neat and legible answers.',
//       `Time allowed: ${a.duration} minutes.`,
//     ],
//   };
// }

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