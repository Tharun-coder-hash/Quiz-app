import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCourses, getQuizzesForCourse } from '../services/api';
import { Course, Quiz } from '../types';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzesByCourse, setQuizzesByCourse] = useState<Record<string, Quiz[]>>({});
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';

  useEffect(() => {
    const fetchData = async () => {
      const allCourses = await getCourses();
      setCourses(allCourses);

      const quizMap: Record<string, Quiz[]> = {};
      for (const course of allCourses) {
        quizMap[course.id] = await getQuizzesForCourse(course.id);
      }
      setQuizzesByCourse(quizMap);
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(query) || 
    quizzesByCourse[c.id]?.some(q => q.title.toLowerCase().includes(query))
  );

  return (
    <div className="space-y-8">
      <div className="text-center py-10 bg-indigo-900 dark:bg-indigo-950 rounded-3xl text-white shadow-xl overflow-hidden relative transition-colors">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4">Master Your Knowledge</h2>
            <p className="text-indigo-200 max-w-2xl mx-auto text-lg">
              Explore our curated courses and challenge yourself with our advanced composite quizzes.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
            <div className="p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{course.description}</p>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Available Quizzes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(quizzesByCourse[course.id] || []).filter(q => !query || q.title.toLowerCase().includes(query)).map(quiz => (
                  <Link 
                    key={quiz.id} 
                    to={`/quiz/${quiz.id}`}
                    className="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-indigo-500 dark:hover:border-indigo-400 hover:ring-1 hover:ring-indigo-500 dark:hover:ring-indigo-400 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h5 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {quiz.title}
                      </h5>
                      {quiz.isComposite && (
                        <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full uppercase">Composite</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                      {quiz.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-auto">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quiz.settings.timeLimit ? `${quiz.settings.timeLimit}m` : 'No Limit'}
                      </div>
                      <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Start Quiz <PlayCircle className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
                {(quizzesByCourse[course.id] || []).length === 0 && (
                  <div className="text-gray-400 text-sm italic py-2">No quizzes available yet.</div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredCourses.length === 0 && (
           <div className="text-center py-12 text-gray-500 dark:text-gray-400">
             No courses found matching your search.
           </div>
        )}
      </div>
    </div>
  );
};