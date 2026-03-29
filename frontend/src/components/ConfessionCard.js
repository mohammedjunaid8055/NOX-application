import React, { useState } from 'react';

function ago(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function ConfessionCard({ confession, currentUserId, onLike, onReply }) {
  const { _id, content, anonymousName, likes = [], replies = [], createdAt } = confession;
  const isLiked = likes.map(String).includes(String(currentUserId));
  const initial = anonymousName ? anonymousName[0].toUpperCase() : '?';

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await onReply(_id, replyText);
    setReplyText("");
    setShowReplyForm(false);
  };

  return (
    <article className="card">
      <div className="card-head">
        <div className="avatar">{initial}</div>
        <div className="card-meta">
          <div className="card-name">{anonymousName || 'Anonymous'}</div>
          <div className="card-handle">@{(anonymousName || 'anonymous').toLowerCase().replace(/\s+/g, '')}</div>
        </div>
        <span className="card-time">{ago(createdAt)}</span>
      </div>
      <p className="card-body">{content}</p>
      
      <div className="card-actions">
        <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={() => onLike(_id)}>
          {isLiked ? '❤️' : '🤍'} {likes.length}
        </button>
        <button className="reply-btn" onClick={() => setShowReplyForm(!showReplyForm)}>
          💬 {replies.length}
        </button>
      </div>

      {(showReplyForm || replies.length > 0) && (
        <div className="replies-section">
          {replies.map((r, i) => (
            <div key={i} className="reply-item">
              <div className="reply-head">
                <span className="reply-name">{r.anonymousName || 'Anonymous'}</span>
                <span className="reply-time">{ago(r.createdAt || Date.now())}</span>
              </div>
              <p className="reply-content">{r.content}</p>
            </div>
          ))}

          {showReplyForm && (
            <div className="reply-form">
              <input 
                type="text" 
                placeholder="Write a reply..." 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                className="reply-input"
                autoFocus
              />
              <button 
                className="btn-reply-submit" 
                onClick={submitReply}
                disabled={!replyText.trim()}
              >
                Reply
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
