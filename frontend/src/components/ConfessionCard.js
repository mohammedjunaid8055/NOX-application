import React, { useState } from 'react';

function ago(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function ConfessionCard({ confession, currentUserId, onLike, onReply, onEdit, onDelete }) {
  const { _id, content, image, anonymousName, userId, likes = [], replies = [], createdAt } = confession;
  
  // Safe extraction of populated user or string ID
  const authorId = typeof userId === 'object' && userId ? userId._id : userId;
  const authorAvatar = typeof userId === 'object' && userId ? userId.avatar : undefined;

  const isLiked = likes.map(String).includes(String(currentUserId));
  const isMine = String(authorId) === String(currentUserId);
  const initial = anonymousName ? anonymousName[0].toUpperCase() : '?';

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await onReply(_id, replyText);
    setReplyText("");
    setShowReplyForm(false);
  };

  const submitEdit = async () => {
    if (!editText.trim() || editText === content) {
      setIsEditing(false);
      return;
    }
    await onEdit(_id, editText);
    setIsEditing(false);
  };

  return (
    <article className="card">
      <div className="card-head">
        {authorAvatar ? (
          <img src={authorAvatar} alt="avatar" className="avatar img-avatar" />
        ) : (
          <div className="avatar">{initial}</div>
        )}
        <div className="card-meta">
          <div className="card-name">{anonymousName || 'Anonymous'}</div>
          <div className="card-handle">@{(anonymousName || 'anonymous').toLowerCase().replace(/\s+/g, '')}</div>
        </div>
        <span className="card-time">{ago(createdAt)}</span>
      </div>

      {isEditing ? (
        <div className="edit-form">
          <textarea
            className="post-textarea"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn-reply-submit" onClick={submitEdit}>Save</button>
            <button className="btn-ghost" onClick={() => { setIsEditing(false); setEditText(content); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="card-body">
          <p>{content}</p>
          {image && (
            <img src={image} alt="confession" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, marginTop: 12, objectFit: 'contain' }} />
          )}
        </div>
      )}
      
      <div className="card-actions">
        <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={() => onLike(_id)}>
          {isLiked ? '❤️' : '🤍'} {likes.length}
        </button>
        <button className="reply-btn" onClick={() => setShowReplyForm(!showReplyForm)}>
          💬 Reply
        </button>
        {replies.length > 0 && (
          <button className="reply-btn" onClick={() => setShowReplies(!showReplies)}>
            {showReplies ? '▲' : '▼'} {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </button>
        )}
        {isMine && !isEditing && (
          <>
            <button className="reply-btn" onClick={() => setIsEditing(true)}>✏️ Edit</button>
            <button className="reply-btn" onClick={() => { if(window.confirm('Delete this confession?')) onDelete(_id); }}>🗑️ Delete</button>
          </>
        )}
      </div>

      {(showReplyForm || showReplies) && (
        <div className="replies-section">
          {showReplies && replies.map((r, i) => {
            const rAvatar = typeof r.userId === 'object' && r.userId ? r.userId.avatar : undefined;
            const rInit = r.anonymousName ? r.anonymousName[0].toUpperCase() : '?';

            return (
              <div key={i} className="reply-item">
                <div className="reply-head" style={{ alignItems: 'center' }}>
                  {rAvatar ? (
                    <img src={rAvatar} alt="avatar" style={{width: 20, height: 20, borderRadius: '50%', objectFit: 'cover'}} />
                  ) : (
                    <div style={{width: 20, height: 20, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>{rInit}</div>
                  )}
                  <span className="reply-name">{r.anonymousName || 'Anonymous'}</span>
                  <span className="reply-time">{ago(r.createdAt || Date.now())}</span>
                </div>
                <p className="reply-content">{r.content}</p>
              </div>
            );
          })}

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
