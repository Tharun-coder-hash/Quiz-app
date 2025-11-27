import { Course, Quiz, Question, QuizItem, Option, Attempt, RuntimeQuestion, AttemptResult, User } from '../types';

/**
 * MOCK BACKEND SERVICE
 * 
 * In a real scenario, this file would be replaced by REST API calls to a Node/Express backend.
 * Here, we simulate the Database relationships and Logic (including Composite Flattening)
 * using LocalStorage to provide a fully functional demo.
 */

const STORAGE_KEYS = {
  USERS: 'qm_users',
  COURSES: 'qm_courses',
  QUIZZES: 'qm_quizzes',
  QUIZ_ITEMS: 'qm_quiz_items',
  QUESTIONS: 'qm_questions',
  ATTEMPTS: 'qm_attempts',
};

// --- Seeding Data ---
const seedData = () => {
  if (localStorage.getItem(STORAGE_KEYS.COURSES)) return;

  const courseId = 'c1';
  const quiz1Id = 'q1';
  const quiz2Id = 'q2';
  const compositeQuizId = 'q3';
  const q1_q1 = 'qq1';
  const q2_q1 = 'qq2';

  const courses: Course[] = [{ id: courseId, title: 'Introduction to Computer Science', description: 'Basics of algos and data structures.', createdAt: new Date().toISOString() }];
  
  const quizzes: Quiz[] = [
    { id: quiz1Id, courseId, title: 'Algorithms 101', description: 'Basic sorting.', isComposite: false, settings: { showCorrectAnswers: true }, createdAt: new Date().toISOString() },
    { id: quiz2Id, courseId, title: 'Data Structures 101', description: 'Arrays and Lists.', isComposite: false, settings: { showCorrectAnswers: true }, createdAt: new Date().toISOString() },
    { id: compositeQuizId, courseId, title: 'Midterm Exam (Composite)', description: 'Combined knowledge test.', isComposite: true, settings: { showCorrectAnswers: false, timeLimit: 30 }, createdAt: new Date().toISOString() },
  ];

  const questions: Question[] = [
    { 
      id: q1_q1, text: 'What is the time complexity of Merge Sort?', points: 5, allowMultiple: false, 
      options: [
        { id: 'o1', text: 'O(n)', isCorrect: false },
        { id: 'o2', text: 'O(n log n)', isCorrect: true },
        { id: 'o3', text: 'O(n^2)', isCorrect: false }
      ] 
    },
    { 
      id: q2_q1, text: 'Which data structure uses LIFO?', points: 5, allowMultiple: false, 
      options: [
        { id: 'o4', text: 'Queue', isCorrect: false },
        { id: 'o5', text: 'Stack', isCorrect: true },
        { id: 'o6', text: 'Tree', isCorrect: false }
      ] 
    },
    {
      id: 'qq3', text: 'Select all stable sorting algorithms.', points: 10, allowMultiple: true,
      options: [
         { id: 'o7', text: 'Merge Sort', isCorrect: true },
         { id: 'o8', text: 'Quick Sort', isCorrect: false },
         { id: 'o9', text: 'Bubble Sort', isCorrect: true }
      ]
    }
  ];

  // Link questions to quizzes via items
  const items: QuizItem[] = [
    // Quiz 1 has question 1
    { id: 'i1', quizId: quiz1Id, type: 'question', targetId: q1_q1, position: 0 },
    // Quiz 2 has question 2
    { id: 'i2', quizId: quiz2Id, type: 'question', targetId: q2_q1, position: 0 },
    // Composite Quiz has Quiz 1, Quiz 2, and a new Question 3
    { id: 'i3', quizId: compositeQuizId, type: 'quiz_ref', targetId: quiz1Id, position: 0 },
    { id: 'i4', quizId: compositeQuizId, type: 'quiz_ref', targetId: quiz2Id, position: 1 },
    { id: 'i5', quizId: compositeQuizId, type: 'question', targetId: 'qq3', position: 2 },
  ];

  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  localStorage.setItem(STORAGE_KEYS.QUIZ_ITEMS, JSON.stringify(items));
};

seedData();

// --- Helpers ---
const getStorage = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setStorage = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Public API ---

export const getCourses = async (): Promise<Course[]> => {
  return getStorage<Course>(STORAGE_KEYS.COURSES);
};

export const getCourse = async (id: string): Promise<Course | undefined> => {
  return getStorage<Course>(STORAGE_KEYS.COURSES).find(c => c.id === id);
};

export const getQuizzesForCourse = async (courseId: string): Promise<Quiz[]> => {
  return getStorage<Quiz>(STORAGE_KEYS.QUIZZES).filter(q => q.courseId === courseId);
};

// THE COMPOSITE FLATTENING LOGIC (The "Hard" Part)
// Recursively resolves quizzes
const resolveQuizQuestions = (quizId: string, depth = 0): RuntimeQuestion[] => {
  if (depth > 5) {
    console.warn("Max recursion depth reached for quiz", quizId);
    return [];
  }

  const allItems = getStorage<QuizItem>(STORAGE_KEYS.QUIZ_ITEMS).filter(i => i.quizId === quizId).sort((a, b) => a.position - b.position);
  const allQuestions = getStorage<Question>(STORAGE_KEYS.QUESTIONS);
  
  let resolved: RuntimeQuestion[] = [];

  for (const item of allItems) {
    if (item.type === 'question') {
      const q = allQuestions.find(qu => qu.id === item.targetId);
      if (q) resolved.push({ ...q, sourceQuizId: quizId });
    } else if (item.type === 'quiz_ref') {
      // Recursion
      const nestedQuestions = resolveQuizQuestions(item.targetId, depth + 1);
      resolved = [...resolved, ...nestedQuestions];
    }
  }

  return resolved;
};

export const getQuizDetails = async (quizId: string) => {
  const quiz = getStorage<Quiz>(STORAGE_KEYS.QUIZZES).find(q => q.id === quizId);
  if (!quiz) throw new Error("Quiz not found");
  
  // This mimics the GET /api/quizzes/:id response where backend does the heavy lifting
  const questions = resolveQuizQuestions(quizId);
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return { quiz, questions, totalPoints };
};

export const submitAttempt = async (quizId: string, answers: Record<string, string[]>): Promise<Attempt> => {
  const { questions, totalPoints } = await getQuizDetails(quizId);
  
  let earnedScore = 0;
  const results: AttemptResult[] = [];

  questions.forEach(q => {
    const userSelected = answers[q.id] || [];
    const correctOptions = q.options.filter(o => o.isCorrect).map(o => o.id);
    
    let isCorrect = false;
    // Strict equality check: All correct options selected, and no incorrect options selected
    if (userSelected.length === correctOptions.length && userSelected.every(id => correctOptions.includes(id))) {
      isCorrect = true;
    }

    const qScore = isCorrect ? q.points : 0;
    earnedScore += qScore;

    results.push({
      questionId: q.id,
      selectedOptionIds: userSelected,
      isCorrect,
      score: qScore,
      maxPoints: q.points
    });
  });

  const attempt: Attempt = {
    id: generateId(),
    quizId,
    totalScore: earnedScore,
    maxScore: totalPoints,
    percentage: totalPoints > 0 ? Math.round((earnedScore / totalPoints) * 100) : 0,
    completedAt: new Date().toISOString(),
    results
  };

  const attempts = getStorage<Attempt>(STORAGE_KEYS.ATTEMPTS);
  setStorage(STORAGE_KEYS.ATTEMPTS, [...attempts, attempt]);

  return attempt;
};

// --- Admin API ---

export const adminLogin = async (password: string): Promise<boolean> => {
  // In real app: POST /api/login -> bcrypt.compare()
  // Mock: password defined in env or hardcoded for demo
  return password === "admin123"; 
};

export const createCourse = async (course: Omit<Course, 'id' | 'createdAt'>) => {
  const newCourse = { ...course, id: generateId(), createdAt: new Date().toISOString() };
  const courses = getStorage<Course>(STORAGE_KEYS.COURSES);
  setStorage(STORAGE_KEYS.COURSES, [...courses, newCourse]);
  return newCourse;
};

export const deleteCourse = async (id: string) => {
  let courses = getStorage<Course>(STORAGE_KEYS.COURSES);
  courses = courses.filter(c => c.id !== id);
  setStorage(STORAGE_KEYS.COURSES, courses);
};

export const createQuiz = async (quiz: Omit<Quiz, 'id' | 'createdAt'>) => {
  const newQuiz = { ...quiz, id: generateId(), createdAt: new Date().toISOString() };
  const quizzes = getStorage<Quiz>(STORAGE_KEYS.QUIZZES);
  setStorage(STORAGE_KEYS.QUIZZES, [...quizzes, newQuiz]);
  return newQuiz;
};

export const getAllQuizzes = async () => getStorage<Quiz>(STORAGE_KEYS.QUIZZES);

export const saveQuizItems = async (quizId: string, items: QuizItem[]) => {
  // 1. Remove old items for this quiz
  let allItems = getStorage<QuizItem>(STORAGE_KEYS.QUIZ_ITEMS).filter(i => i.quizId !== quizId);
  // 2. Add new items
  allItems = [...allItems, ...items];
  setStorage(STORAGE_KEYS.QUIZ_ITEMS, allItems);
};

export const createQuestion = async (q: Omit<Question, 'id'>) => {
  const newQ = { ...q, id: generateId() };
  const questions = getStorage<Question>(STORAGE_KEYS.QUESTIONS);
  setStorage(STORAGE_KEYS.QUESTIONS, [...questions, newQ]);
  return newQ;
};

export const getQuizItems = async (quizId: string) => {
  return getStorage<QuizItem>(STORAGE_KEYS.QUIZ_ITEMS).filter(i => i.quizId === quizId).sort((a,b) => a.position - b.position);
};

export const getQuestion = async (qId: string) => {
  return getStorage<Question>(STORAGE_KEYS.QUESTIONS).find(q => q.id === qId);
};