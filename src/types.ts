export type FeatureId =
  | 'dashboard'
  | 'notes'
  | 'concept'
  | 'quiz'
  | 'questions'
  | 'code'
  | 'planner';

// 1. AI Notes
export interface NoteConcept {
  heading: string;
  explanation: string;
  example?: string;
}

export interface NotesResponse {
  title: string;
  subjectCategory: string;
  overview: string;
  formalDefinition: string;
  simplifiedExplanation: string;
  keyConcepts: NoteConcept[];
  visualOrSyntaxSummary?: string;
  commonExamMistakes?: string[];
  quickRevisionPoints?: string[];
  selfTestQuestions?: string[];
}

// 2. Concept Explainer
export interface ConceptMapping {
  analogyPart: string;
  conceptPart: string;
  explanation: string;
}

export interface ConceptStep {
  step: number;
  title: string;
  detail: string;
}

export interface ConceptFaq {
  question: string;
  answer: string;
}

export interface ConceptResponse {
  concept: string;
  oneLineSummary: string;
  relatableAnalogy: {
    scenario: string;
    mapping: ConceptMapping[];
  };
  stepByStepBreakdown: ConceptStep[];
  whyItMatters: string;
  faq: ConceptFaq[];
  memoryAcroynmOrTip: string;
}

// 3. Quiz
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint: string;
  conceptTested?: string;
}

export interface QuizResponse {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

// 4. Important Questions
export interface ShortQuestion {
  marks: number;
  question: string;
  idealAnswerKey: string;
  frequentlyTested?: boolean;
}

export interface MediumQuestion {
  marks: number;
  question: string;
  keyPointsToInclude: string[];
  modelOutline?: string;
}

export interface LongQuestion {
  marks: number;
  question: string;
  structuredBreakdown: string[];
  scoringTip?: string;
}

export interface QuestionsResponse {
  topic: string;
  disclaimer: string;
  shortAnswerQuestions: ShortQuestion[];
  mediumAnswerQuestions: MediumQuestion[];
  longAnswerQuestions: LongQuestion[];
  highYieldKeyTerms?: string[];
}

// 5. Code Explainer
export interface CodeLineExplanation {
  lineNumber: number;
  codeSnippet: string;
  explanation: string;
  isImportant?: boolean;
}

export interface CodeExplainerResponse {
  language: string;
  overallSummary: string;
  mainConcepts: string[];
  lineByLine: CodeLineExplanation[];
  executionFlow: string;
  sampleOutputOrBehavior?: string;
  commonBeginnerPitfalls: string[];
  bestPractices?: string[];
}

// 6. Study Planner
export interface SubjectAllocation {
  subject: string;
  hoursPerWeek: number;
  priorityLevel: string;
  focusFocusReason: string;
}

export interface DailyScheduleSlot {
  timeSlot: string;
  activity: string;
  suggestedContent: string;
  type: 'study' | 'break';
}

export interface DayTask {
  subject: string;
  duration: string;
  objective: string;
}

export interface DayRoadmap {
  dayNumber: number;
  focusTheme: string;
  tasks: DayTask[];
  endOfDayReview: string;
}

export interface PlannerResponse {
  planTitle: string;
  totalStudyHours: number;
  strategyOverview: string;
  subjectAllocation: SubjectAllocation[];
  idealDailyScheduleTemplate: DailyScheduleSlot[];
  dayByDayRoadmap: DayRoadmap[];
  studyHacks: string[];
  burnoutPreventionTips: string[];
}

// History & Bookmark saved items
export interface SavedItem {
  id: string;
  feature: FeatureId;
  title: string;
  timestamp: number;
  data: any;
}
