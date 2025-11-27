export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

// A generic item in a quiz (either a direct question or a reference to another quiz)
export type QuizItemType = 'question' | 'quiz_ref';

export interface QuizItem {
  id: string;
  quizId: string;
  type: QuizItemType;
  targetId: string; // ID of the Question OR the ID of the referenced Quiz
  position: number;
}

export interface QuizSettings {
  timeLimit?: number; // in minutes
  showCorrectAnswers: boolean;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  isComposite: boolean;
  settings: QuizSettings;
  createdAt: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  points: number;
  allowMultiple: boolean;
  options: Option[];
}

// The flattened structure used when taking a quiz
export interface RuntimeQuestion extends Question {
  sourceQuizId: string; // To track where this question came from in a composite quiz
}

export interface AttemptResult {
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
  score: number;
  maxPoints: number;
}

export interface Attempt {
  id: string;
  quizId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  results: AttemptResult[];
}