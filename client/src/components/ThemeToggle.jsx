import { useEffect, useState } from 'react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(prev => !prev)}
      className="ml-auto p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
    >
      <span className="material-icons text-black dark:text-white">
        {isDark ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
}

export default ThemeToggle;
