import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', anonymousName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.password) return setError('Email and password are required.');
    if (mode === 'register' && !form.anonymousName.trim())
      return setError('Choose your anonymous name.');

    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await loginUser(form.email, form.password);
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('anonymousName', data.anonymousName);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('avatar', data.avatar || '');
          onLogin();
        } else {
          setError(data.message || 'Login failed. Try again.');
        }
      } else {
        const data = await registerUser(form.email, form.password, form.anonymousName);
        if (data.message === 'User registered successfully') {
          setSuccess('Account created! You can now log in.');
          switchMode('login');
          setForm((f) => ({ ...f, anonymousName: '' }));
        } else {
          setError(data.message || 'Registration failed.');
        }
      }
    } catch {
      setError('Cannot reach server. Is the backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">Nox 🌙</div>
        <p className="auth-sub">Share anonymously. Be heard.</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
            Login
          </button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={change} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="••••••••"
              value={form.password} onChange={change}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Anonymous Name</label>
              <input className="form-input" type="text" name="anonymousName"
                placeholder="e.g. ShadowFox, BlueGhost…"
                value={form.anonymousName} onChange={change} />
            </div>
          )}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
