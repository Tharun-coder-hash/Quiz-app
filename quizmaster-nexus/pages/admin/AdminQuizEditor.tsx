import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { createQuiz, saveQuizItems, getAllQuizzes, createQuestion, getQuizDetails, getQuizItems, getQuestion } from '../../services/api';
import { Quiz, QuizItem, Question, Option } from '../../types';
import { Plus, Trash, Save, Layout, FileQuestion } from 'lucide-react';

export const AdminQuizEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { quizId } = useParams(); // If editing existing
  
  const courseIdParam = searchParams.get('courseId');

  // Quiz Metadata State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isComposite, setIsComposite] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(0);

  // Items State
  const [items, setItems] = useState<QuizItem[]>([]);
  
  // Available Quizzes to add (for composite)
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  
  // Modal for new Question
  const [showQModal, setShowQModal] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQPoints, setNewQPoints] = useState(5);
  const [newQOpts, setNewQOpts] = useState<Option[]>([{ id: '1', text: '', isCorrect: false }, { id: '2', text: '', isCorrect: false }]);

  useEffect(() => {
    // Load available quizzes for composition
    getAllQuizzes().then(qs => setAvailableQuizzes(qs.filter(q => q.id !== quizId))); // Don't allow self-include

    if (quizId) {
        // Load existing
        getQuizDetails(quizId).then(({quiz}) => {
            setTitle(quiz.title);
            setDescription(quiz.description);
            setIsComposite(quiz.isComposite);
            setTimeLimit(quiz.settings.timeLimit || 0);
        });
        getQuizItems(quizId).then(setItems);
    }
  }, [quizId]);

  const handleSaveQuiz = async () => {
    if (!title) return alert("Title required");
    
    // Create Quiz Object
    const quizPayload = {
        courseId: courseIdParam!, // Warning: Simplified for demo (assume new quiz always has param)
        title,
        description,
        isComposite,
        settings: { timeLimit: timeLimit || undefined, showCorrectAnswers: true }
    };

    let targetId = quizId;
    
    if (!targetId) {
        if (!courseIdParam) return alert("Missing course ID");
        const newQuiz = await createQuiz(quizPayload);
        targetId = newQuiz.id;
    }

    // Save Items
    // Ensure all items have the correct quizId
    const itemsToSave = items.map((i, idx) => ({ ...i, quizId: targetId!, position: idx }));
    await saveQuizItems(targetId!, itemsToSave);

    alert("Quiz Saved!");
    navigate('/admin/dashboard');
  };

  const handleAddQuestion = async () => {
     // Validate
     if (!newQOpts.some(o => o.isCorrect)) return alert("Mark at least one correct option");
     
     const q = await createQuestion({
         text: newQText,
         points: newQPoints,
         allowMultiple: newQOpts.filter(o => o.isCorrect).length > 1,
         options: newQOpts.map(o => ({ ...o, id: Math.random().toString(36).substr(2, 5) })) // simple ID gen
     });

     const newItem: QuizItem = {
         id: Math.random().toString(36),
         quizId: '', // set on save
         type: 'question',
         targetId: q.id,
         position: items.length
     };
     
     setItems([...items, newItem]);
     setShowQModal(false);
     setNewQText('');
     setNewQOpts([{ id: '1', text: '', isCorrect: false }, { id: '2', text: '', isCorrect: false }]);
  };

  const addQuizReference = (qId: string) => {
    const newItem: QuizItem = {
        id: Math.random().toString(36),
        quizId: '',
        type: 'quiz_ref',
        targetId: qId,
        position: items.length
    };
    setItems([...items, newItem]);
  };

  // --- Sub-renderers ---
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{quizId ? 'Edit Quiz' : 'New Quiz'}</h2>
        <button onClick={handleSaveQuiz} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" /> Save Quiz
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 transition-colors">
        <input 
          className="w-full text-lg font-bold border-b border-gray-200 dark:border-gray-700 pb-2 focus:outline-none bg-transparent text-gray-900 dark:text-white" 
          placeholder="Quiz Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
        <textarea 
          className="w-full text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded p-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500" 
          rows={2} 
          placeholder="Description" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
        />
        
        <div className="flex gap-6 items-center pt-2 text-gray-900 dark:text-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isComposite} onChange={e => setIsComposite(e.target.checked)} className="rounded text-indigo-600" />
                <span className="text-sm font-medium">Composite Quiz</span>
            </label>
            <div className="flex items-center gap-2">
                <span className="text-sm">Time Limit (mins):</span>
                <input type="number" className="w-16 border dark:border-gray-700 rounded p-1 text-sm bg-white dark:bg-gray-700" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Quiz Content</h3>
            {items.length === 0 && <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-400">Empty Quiz</div>}
            
            {items.map((item, idx) => {
               const refQuiz = availableQuizzes.find(q => q.id === item.targetId);
               return (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-bold text-gray-500 dark:text-gray-400">{idx + 1}</span>
                        {item.type === 'quiz_ref' ? (
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                <Layout className="w-4 h-4" />
                                <span className="font-medium">Includes Quiz: {refQuiz?.title || item.targetId}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <FileQuestion className="w-4 h-4" />
                                <span className="font-medium">Question ID: {item.targetId.substring(0,6)}...</span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-600">
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
               );
            })}
            
            <div className="flex gap-2">
                <button onClick={() => setShowQModal(true)} className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-500 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors flex justify-center items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Question
                </button>
            </div>
          </div>

          <div className="col-span-1">
             {isComposite && (
                 <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                     <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-3">Add Existing Quiz</h4>
                     <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableQuizzes.map(q => (
                            <button key={q.id} onClick={() => addQuizReference(q.id)} className="w-full text-left bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900/40">
                                {q.title}
                            </button>
                        ))}
                     </div>
                 </div>
             )}
             {!isComposite && (
                 <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded text-sm text-gray-500 dark:text-gray-400 italic">
                     Enable "Composite Quiz" to embed other quizzes inside this one.
                 </div>
             )}
          </div>
      </div>

      {/* NEW QUESTION MODAL */}
      {showQModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 w-full max-w-2xl p-6 rounded-xl shadow-2xl transition-colors">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Create Question</h3>
                  <div className="space-y-4">
                      <input 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                        placeholder="Question Text" 
                        value={newQText} 
                        onChange={e => setNewQText(e.target.value)} 
                      />
                      <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                          <span className="text-sm">Points:</span>
                          <input 
                            type="number" 
                            className="border border-gray-300 dark:border-gray-600 p-1 w-16 rounded bg-white dark:bg-gray-700" 
                            value={newQPoints} 
                            onChange={e => setNewQPoints(Number(e.target.value))} 
                          />
                      </div>
                      
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Options (Check correct ones)</label>
                          {newQOpts.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                  <input type="checkbox" checked={opt.isCorrect} onChange={e => {
                                      const newOpts = [...newQOpts];
                                      newOpts[idx].isCorrect = e.target.checked;
                                      setNewQOpts(newOpts);
                                  }} />
                                  <input 
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    value={opt.text} 
                                    placeholder={`Option ${idx + 1}`} 
                                    onChange={e => {
                                      const newOpts = [...newQOpts];
                                      newOpts[idx].text = e.target.value;
                                      setNewQOpts(newOpts);
                                  }} />
                              </div>
                          ))}
                          <button onClick={() => setNewQOpts([...newQOpts, { id: Math.random().toString(), text: '', isCorrect: false }])} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                              + Add Option
                          </button>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                          <button onClick={() => setShowQModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">Cancel</button>
                          <button onClick={handleAddQuestion} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">Add Question</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};