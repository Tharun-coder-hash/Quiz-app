import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';
import { SECRET_SEARCH_CODE, ADMIN_ROUTE } from '../constants';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  
  // Initialize from local storage or system preference
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const isAdminSection = location.pathname.startsWith('/admin');

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim() === SECRET_SEARCH_CODE) {
      navigate(ADMIN_ROUTE);
      setSearch('');
    } else {
      navigate(`/?q=${encodeURIComponent(search)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">
              QuizMaster Nexus
            </h1>
          </div>

          <div className="flex-1 max-w-lg mx-4">
            {!isAdminSection ? (
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                           border border-gray-300 bg-white text-gray-900 placeholder-gray-500
                           dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-400" />
              </form>
            ) : (
              <div className="flex justify-end items-center">
                 <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">Admin Mode</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAdminSection && (
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Exit
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400 space-y-4 leading-relaxed">
          <p className="font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Disclaimer</p>
          <p>
            This website provides quiz questions inspired by NPTEL courses only for educational and practice purposes. 
            All course names, materials, and references belong to their respective owners and original copyright holders. 
            We do not claim any ownership of NPTEL content.
          </p>
          <p>
            The information, questions, explanations, and results on this platform may contain errors or inaccuracies. 
            We make no guarantees about the correctness, completeness, or reliability of the content.
          </p>
          <p>
            By using this site, you agree that the creators/operators of this platform are not responsible for: 
            any academic loss, exam performance issues, misunderstandings, or consequences arising from using this quiz material.
          </p>
          <p>
            For official and accurate course content, always refer to the NPTEL website and original course materials.
          </p>
        </div>
      </footer>
    </div>
  );
};