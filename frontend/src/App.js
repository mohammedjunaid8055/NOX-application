import React, { useState } from 'react';
import './index.css';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));

  const login = () => setAuthed(true);
  const logout = () => {
    localStorage.clear();
    setAuthed(false);
  };

  return authed ? <FeedPage onLogout={logout} /> : <AuthPage onLogin={login} />;
}