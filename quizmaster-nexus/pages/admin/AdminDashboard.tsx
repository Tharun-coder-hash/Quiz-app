import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, getQuizzesForCourse, deleteCourse } from '../../services/api';
import { Course, Quiz } from '../../types';
import { Plus, Trash2, Edit } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});

  const refresh = async () => {
    const data = await getCourses();
    setCourses(data);
    const qMap: Record<string, Quiz[]> = {};
    for (const c of data) {
      qMap[c.id] = await getQuizzesForCourse(c.id);
    }
    setQuizzes(qMap);
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this course and all its quizzes?')) {
      await deleteCourse(id);
      refresh();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
        <Link to="/admin/course/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> New Course
        </Link>
      </div>

      <div className="grid gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{course.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(course.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-900">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Quizzes</h4>
              <ul className="space-y-2">
                {(quizzes[course.id] || []).map(q => (
                  <li key={q.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded transition-colors">
                    <span className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      {q.title}
                      {q.isComposite && <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] px-1 rounded">COMPOSITE</span>}
                    </span>
                    <Link to={`/admin/quiz/${q.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                      <Edit className="w-3 h-3" /> Edit
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to={`/admin/quiz/new?courseId=${course.id}`} className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 mt-2">
                    <Plus className="w-3 h-3" /> Add Quiz
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};