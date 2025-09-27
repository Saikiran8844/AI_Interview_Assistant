export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeText?: string;
  status: 'incomplete' | 'in_progress' | 'completed';
  currentQuestionIndex: number;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  summary: string;
  answers: Answer[];
  timeRemaining?: number;
  isPaused: boolean;
}

export interface Answer {
  questionId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  timeUsed: number;
  score: number;
  feedback: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

export interface InterviewSession {
  candidateId: string;
  currentStep: 'upload' | 'info_collection' | 'interview' | 'completed';
  missingFields: string[];
  questions: Question[];
}