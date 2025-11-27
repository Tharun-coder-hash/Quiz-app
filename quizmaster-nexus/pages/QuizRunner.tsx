import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizDetails, submitAttempt } from '../services/api';
import { Quiz, RuntimeQuestion, Attempt } from '../types';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const QuizRunner: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<RuntimeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    getQuizDetails(quizId)
      .then(data => {
        setQuiz(data.quiz);
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load quiz");
        navigate('/');
      });
  }, [quizId, navigate]);

  const handleOptionChange = (questionId: string, optionId: string, allowMultiple: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (allowMultiple) {
        if (current.includes(optionId)) return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        return { ...prev, [questionId]: [...current, optionId] };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    if (!quizId) return;
    const attempt = await submitAttempt(quizId, answers);
    setResult(attempt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-center py-20 dark:text-white">Loading assessment...</div>;
  if (!quiz) return null;

  // --- RESULTS VIEW ---
  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center transition-colors">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Completed!</h2>
          <div className="flex justify-center items-end gap-2 mb-6">
            <span className="text-6xl font-black text-indigo-600 dark:text-indigo-400">{result.percentage}%</span>
            <span className="text-gray-500 dark:text-gray-400 mb-2">({result.totalScore} / {result.maxScore} pts)</span>
          </div>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
            Back to Courses
          </button>
        </div>

        <div className="space-y-6">
          {result.results.map((res, idx) => {
            const question = questions.find(q => q.id === res.questionId);
            if (!question) return null;
            
            return (
              <div key={res.questionId} className={`p-6 rounded-xl border-l-4 shadow-sm bg-white dark:bg-gray-800 transition-colors ${res.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                 <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      <span className="text-gray-400 dark:text-gray-500 mr-2">#{idx + 1}</span>
                      {question.text}
                    </h3>
                    {res.isCorrect ? <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" /> : <XCircle className="text-red-500 w-6 h-6 flex-shrink-0" />}
                 </div>

                 <div className="space-y-2 pl-4">
                   {question.options.map(opt => {
                     const isSelected = res.selectedOptionIds.includes(opt.id);
                     const isCorrectAns = opt.isCorrect;
                     
                     let bgClass = "bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300";
                     if (quiz.settings.showCorrectAnswers) {
                        if (isCorrectAns) bgClass = "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300";
                        if (isSelected && !isCorrectAns) bgClass = "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
                     } else {
                        if (isSelected) bgClass = res.isCorrect ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
                     }

                     return (
                       <div key={opt.id} className={`p-3 rounded-lg border text-sm ${bgClass} flex items-center justify-between`}>
                         <span>{opt.text}</span>
                         {isSelected && <span className="text-xs font-bold uppercase px-2 py-1 bg-white/50 dark:bg-black/20 rounded">Selected</span>}
                       </div>
                     );
                   })}
                 </div>
                 <div className="mt-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                   Score: {res.score} / {res.maxPoints}
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- QUIZ TAKING VIEW ---
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 border-b dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{quiz.description}</p>
        <div className="flex gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
           {quiz.settings.timeLimit && (
             <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.settings.timeLimit} mins</span>
           )}
           <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {questions.length} Questions</span>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, idx) => (
          <div key={`${q.sourceQuizId}-${q.id}`} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex justify-between mb-4">
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold">Q{idx + 1}</span>
              <span className="text-xs text-gray-400">{q.points} pts</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">{q.text}</h3>
            
            <div className="space-y-3">
              {q.options.map(opt => (
                <label 
                  key={opt.id} 
                  className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    (answers[q.id] || []).includes(opt.id) 
                      ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <input
                    type={q.allowMultiple ? "checkbox" : "radio"}
                    name={q.id}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    checked={(answers[q.id] || []).includes(opt.id)}
                    onChange={() => handleOptionChange(q.id, opt.id, q.allowMultiple)}
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-6">
          <button 
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Submit Answers
          </button>
        </div>
      </div>
    </div>
  );
};