import React, { useState, useEffect } from 'react';
import './index.css';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = () => setAuthed(true);
  const logout = () => {
    localStorage.clear();
    setAuthed(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <>
      <div className={`theme-toggle ${theme}`} onClick={toggleTheme}>
        <div className="toggle-thumb">{theme === 'dark' ? '🌙' : '☀️'}</div>
      </div>
      {authed ? <FeedPage onLogout={logout} /> : <AuthPage onLogin={login} />}
    </>
  );
}