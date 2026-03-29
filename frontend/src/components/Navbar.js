import React from 'react';

export default function Navbar({ anonymousName, onLogout }) {
  const initial = anonymousName ? anonymousName[0].toUpperCase() : '?';
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">Nox 🌙</span>
        <div className="navbar-right">
          <div className="avatar">{initial}</div>
          <span className="navbar-name">@{anonymousName}</span>
          <button className="btn-ghost" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
