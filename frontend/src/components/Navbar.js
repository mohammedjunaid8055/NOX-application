import React, { useState } from 'react';

export default function Navbar({ anonymousName, avatar, onLogout, onLogoClick }) {
  const initial = anonymousName ? anonymousName[0].toUpperCase() : '?';
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand" style={{ cursor: 'pointer' }} onClick={onLogoClick}>Nox 🌙</span>
        <div className="navbar-right">
          {avatar ? (
            <img src={avatar} alt="avatar" className="avatar img-avatar" />
          ) : (
            <div className="avatar">{initial}</div>
          )}
          <span className="navbar-name">@{anonymousName}</span>
          <button className="btn-ghost" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
