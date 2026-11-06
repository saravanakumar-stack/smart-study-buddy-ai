import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '5mb' }));

const port = Number(process.env.PORT) || 3000;

// Initialize Google GenAI with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Smart Study Buddy AI',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Helper for cleaning markdown code fences from JSON output
function parseJsonSafely<T>(rawText: string | undefined, fallback: T): T {
  if (!rawText) return fallback;
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse JSON from Gemini:', err, 'Raw:', rawText);
    return fallback;
  }
}

// Resilient wrapper with exponential backoff for transient 503/429 spikes
async function generateWithRetry(params: any, retries = 2, delayMs = 2500): Promise<any> {
  let attempt = 0;
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('429');

      if (attempt <= retries && isTransient) {
        console.warn(`Transient Gemini error (attempt ${attempt}/${retries}). Retrying in ${delayMs * attempt}ms...`);
        await new Promise((r) => setTimeout(r, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

function formatGeminiErrorMessage(error: any): string {
  const msg = error?.message || String(error);
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('limit: 5')) {
    return 'AI rate limit reached (Free tier allows 5 requests/minute). Please wait 10-15 seconds and click again.';
  }
  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
    return 'The Gemini model is experiencing a high-demand spike. Retrying in a few seconds usually works.';
  }
  if (msg.includes('403') || msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED')) {
    return 'Gemini API key is invalid or lacks permissions. Please check the Settings > Secrets panel.';
  }
  return error?.message || 'Error communicating with Gemini AI. Please try again.';
}

// 1. AI Notes Generator
app.post('/api/study/notes', async (req: Request, res: Response) => {
  try {
    const { topic, detailLevel = 'standard', academicYear = '1st Year', includeExamples = true } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please enter a valid study topic.' });
    }

    const prompt = `You are an expert college professor and tutor for ${academicYear} undergraduate students.
Generate comprehensive, crystal-clear, structured study notes on the topic: "${topic.trim()}".
Detail level requested: ${detailLevel}.
Include real-world examples: ${includeExamples ? 'Yes' : 'No'}.

Format the response strictly as valid JSON matching this schema:
{
  "title": "Title of the topic",
  "subjectCategory": "Probable college subject (e.g., Computer Science, Mathematics, Physics, Electronics)",
  "overview": "2-3 sentence introduction explaining what it is and why it matters in college curriculum",
  "formalDefinition": "Precise, textbook-grade definition",
  "simplifiedExplanation": "Beginner-friendly explanation using clear language without unnecessary jargon",
  "keyConcepts": [
    {
      "heading": "Concept Name",
      "explanation": "Detailed explanation with sub-points",
      "example": "Practical code, mathematical, or real-life concrete example"
    }
  ],
  "visualOrSyntaxSummary": "ASCII diagram, formula list, or syntax blueprint illustrating the concept",
  "commonExamMistakes": [
    "Common misconception or error students make in college exams"
  ],
  "quickRevisionPoints": [
    "High-yield bullet point for 2 minutes before exam"
  ],
  "selfTestQuestions": [
    "Thought-provoking question to verify understanding"
  ]
}

Return ONLY the JSON object without markdown fences if possible.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonSafely<any>(response.text, null);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to format study notes. Please try again.' });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Notes generation error:', error);
    res.status(500).json({
      error: formatGeminiErrorMessage(error),
    });
  }
});

// 2. Simple Concept Explainer
app.post('/api/study/explain-concept', async (req: Request, res: Response) => {
  try {
    const { concept, analogyStyle = 'everyday-life', academicLevel = 'beginner' } = req.body;
    if (!concept || typeof concept !== 'string' || !concept.trim()) {
      return res.status(400).json({ error: 'Please provide a concept to explain.' });
    }

    const prompt = `You are a legendary teacher known for explaining difficult college engineering and science topics to freshers with zero prior background.
Explain this concept: "${concept.trim()}".
Style of analogy: ${analogyStyle} (e.g. daily life, smartphone apps, cooking, sports, gaming).
Academic level: ${academicLevel}.

Return strictly valid JSON with this structure:
{
  "concept": "${concept.trim()}",
  "oneLineSummary": "A memorable 1-sentence TL;DR explanation",
  "relatableAnalogy": {
    "scenario": "Story or metaphor comparing the concept to something very familiar",
    "mapping": [
      { "analogyPart": "The real world thing (e.g., Postman / Kitchen counter)", "conceptPart": "The technical counterpart (e.g., Router / RAM)", "explanation": "Why they match" }
    ]
  },
  "stepByStepBreakdown": [
    { "step": 1, "title": "Step Title", "detail": "Simple explanation of this stage" }
  ],
  "whyItMatters": "Why professors love asking this and how engineers/scientists use it in the real world",
  "faq": [
    { "question": "Common beginner question/doubt", "answer": "Clear, reassuring answer" }
  ],
  "memoryAcroynmOrTip": "A clever mnemonic or mental trick to remember this forever"
}

Return ONLY valid JSON.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonSafely<any>(response.text, null);
    if (!parsed) {
      return res.status(500).json({ error: 'Could not generate explanation. Please try again.' });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Concept explanation error:', error);
    res.status(500).json({
      error: formatGeminiErrorMessage(error),
    });
  }
});

// 3. AI Quiz Generator (5 MCQs with 4 options, correct answer and explanations)
app.post('/api/study/quiz', async (req: Request, res: Response) => {
  try {
    const { topic, difficulty = 'balanced' } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please provide a quiz topic.' });
    }

    const prompt = `You are a university examiner creating a 5-question multiple choice test for 1st/2nd year college students.
Topic: "${topic.trim()}"
Difficulty: ${difficulty}.

Generate EXACTLY 5 high-quality, conceptual multiple-choice questions.
Each question MUST have exactly 4 choices (index 0, 1, 2, 3), one unambiguously correct answer, a helpful hint, and a comprehensive explanation explaining why the correct choice is right and why other choices are wrong.

Return strictly valid JSON matching this schema:
{
  "topic": "${topic.trim()}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Clear, specific question text",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctOptionIndex": 0,
      "explanation": "Detailed explanation of the correct answer and contrast with wrong options",
      "hint": "Gentle nudge without revealing the letter directly",
      "conceptTested": "Core subtopic or rule being assessed"
    }
  ]
}

Return ONLY JSON. Ensure questions has exactly 5 items.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonSafely<any>(response.text, null);
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.status(500).json({ error: 'Failed to generate quiz questions. Please retry.' });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      error: formatGeminiErrorMessage(error),
    });
  }
});

// 4. Important Question Generator (Revision practice questions, not guaranteed exam questions)
app.post('/api/study/questions', async (req: Request, res: Response) => {
  try {
    const { subject, topic } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please enter a topic or subject.' });
    }

    const prompt = `You are a college exam preparation advisor for college students.
Topic / Subject: "${topic.trim()}" ${subject ? `(Subject: ${subject})` : ''}

Generate structured revision practice questions designed for college exams.
IMPORTANT: Emphasize that these are revision and practice questions to master the syllabus concepts, NOT guaranteed exam leaks.

Return strictly valid JSON:
{
  "topic": "${topic.trim()}",
  "disclaimer": "⚠️ Practice & Revision Guide: These questions are curated to reinforce core syllabus concepts for self-assessment and exam readiness. They are not guaranteed or leaked exam questions.",
  "shortAnswerQuestions": [
    {
      "marks": 2,
      "question": "Precise short question (definitions, differences, 2-line reason)",
      "idealAnswerKey": "Concise 2-3 line model answer or bullet points",
      "frequentlyTested": true
    }
  ],
  "mediumAnswerQuestions": [
    {
      "marks": 5,
      "question": "Medium explanatory question (derivation, working mechanism, comparison table, pseudo-code)",
      "keyPointsToInclude": [
        "Point 1 to mention",
        "Point 2 to mention",
        "Diagram/Equation needed"
      ],
      "modelOutline": "Brief structural guide on how to answer"
    }
  ],
  "longAnswerQuestions": [
    {
      "marks": 10,
      "question": "Comprehensive in-depth application/analytical essay or problem",
      "structuredBreakdown": [
        "Section 1: Introduction & Principle",
        "Section 2: Architecture / Working Details",
        "Section 3: Advantages & Real-world Applications"
      ],
      "scoringTip": "Tip on how evaluators award marks for this type of question"
    }
  ],
  "highYieldKeyTerms": [
    "Crucial technical term 1",
    "Crucial technical term 2"
  ]
}

Return ONLY valid JSON. Provide at least 4 short questions, 3 medium questions, and 2 long questions.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonSafely<any>(response.text, null);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to generate practice questions.' });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Questions generation error:', error);
    res.status(500).json({
      error: formatGeminiErrorMessage(error),
    });
  }
});

// 5. Code Explainer (Line-by-line breakdown for Python, Java, C, and HTML)
app.post('/api/study/explain-code', async (req: Request, res: Response) => {
  try {
    const { code, language = 'python' } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Please enter code to explain.' });
    }

    const prompt = `You are an expert programming tutor for first and second year university students.
The student submitted code in: ${language.toUpperCase()}.
Code snippet:
\`\`\`${language}
${code.trim()}
\`\`\`

Provide an in-depth line-by-line explanation, beginner pitfalls, and execution overview.
Return strictly valid JSON with this structure:
{
  "language": "${language}",
  "overallSummary": "What this program does in plain, encouraging words",
  "mainConcepts": [
    "Key programming concept used (e.g. recursion, pointers, DOM element, dynamic memory, loops)"
  ],
  "lineByLine": [
    {
      "lineNumber": 1,
      "codeSnippet": "code on this line or block",
      "explanation": "Clear explanation of what happens in memory, syntax rules, and purpose",
      "isImportant": true
    }
  ],
  "executionFlow": "Walkthrough of what happens when the computer executes this from start to finish",
  "sampleOutputOrBehavior": "The expected console output or rendered HTML result",
  "commonBeginnerPitfalls": [
    "Common mistake students make with this exact syntax or logic (e.g. off-by-one, semicolon, indentation, memory leak)"
  ],
  "bestPractices": [
    "Advice to write cleaner, more idiomatic ${language} code"
  ]
}

Return ONLY valid JSON.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonSafely<any>(response.text, null);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to parse code explanation.' });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Code explanation error:', error);
    res.status(500).json({
      error: formatGeminiErrorMessage(error),
    });
  }
});

// 6. Study Planner (Realistic timetable based on subjects and available study time)
app.post('/api/study/planner', async (req: Request, res: Response) => {
  try {
    const {
      subjects = [],
      dailyHours = 4,
      totalDays = 7,
      targetGoal = 'Semester Exam Prep',
      weakAreas = '',
      preferredStudyTime = 'afternoon',
    } = req.body;

    if (!subjects || (Array.isArray(subjects) && subjects.length === 0) || (typeof subjects === 'string' && !subjects.trim())) {
      return res.status(400).json({ error: 'Please enter at least one subject.' });
    }

    const subjectsList = Array.isArray(subjects) ? subjects.join(', ') : subjects;

    const prompt = `You are an academic coach specializing in effective learning schedules for university students.
Generate a realistic, sustainable, and highly structured study timetable.

Student Parameters:
- Subjects: ${subjectsList}
- Available Daily Study Hours: ${dailyHours} hours/day
- Plan Duration: ${totalDays} days
- Target Goal: ${targetGoal}
- Student's Weak / Priority Topics: ${weakAreas || 'None specified (balance evenly)'}
- Preferred Peak Focus Window: ${preferredStudyTime}

Include realistic rest intervals (e.g. 50/10 Pomodoro or 45/15), active recall sessions, and review buffers to prevent burnout.

Return strictly valid JSON:
{
  "planTitle": "${totalDays}-Day Mastery Plan: ${targetGoal}",
  "totalStudyHours": ${Number(dailyHours) * Number(totalDays)},
  "strategyOverview": "Why this realistic timetable works and how it avoids fatigue",
  "subjectAllocation": [
    {
      "subject": "Subject Name",
      "hoursPerWeek": 10,
      "priorityLevel": "High | Medium | Moderate",
      "focusFocusReason": "Why this time was allocated"
    }
  ],
  "idealDailyScheduleTemplate": [
    {
      "timeSlot": "e.g. 09:00 AM - 10:30 AM",
      "activity": "Deep Work Session 1",
      "suggestedContent": "Heavy conceptual learning / Math / Algorithms",
      "type": "study"
    },
    {
      "timeSlot": "e.g. 10:30 AM - 10:50 AM",
      "activity": "Hydration & Physical Break",
      "suggestedContent": "Walk around, rest eyes, stretch",
      "type": "break"
    }
  ],
  "dayByDayRoadmap": [
    {
      "dayNumber": 1,
      "focusTheme": "Day theme (e.g., Foundations & Core Concepts)",
      "tasks": [
        { "subject": "Subject", "duration": "1.5 hrs", "objective": "Specific milestone to complete" }
      ],
      "endOfDayReview": "15-minute active recall self-test"
    }
  ],
  "studyHacks": [
    "Practical science-backed tip (e.g., Feynman technique, blurting method, flashcards)"
  ],
  "burnoutPreventionTips": [
    "Realistic advice for college students"
  ]
}

Return ONLY valid JSON. Limit dayByDayRoadmap to ${Math.min(Number(totalDays) || 7, 7)} days to ensure thorough quality.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonSafely<any>(response.text, null);
    if (!parsed) {
      return res.status(500).json({ error: 'Failed to create study plan.' });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Planner error:', error);
    res.status(500).json({
      error: formatGeminiErrorMessage(error),
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Smart Study Buddy AI server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
