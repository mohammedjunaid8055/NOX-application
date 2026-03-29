import React, { useState } from 'react';
import { postConfession } from '../services/api';

const MAX = 280;

export default function PostBox({ anonymousName, onPost }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const initial = anonymousName ? anonymousName[0].toUpperCase() : '?';
  const left = MAX - text.length;

  const submit = async () => {
    if (!text.trim() || left < 0 || loading) return;
    setLoading(true);
    try {
      const data = await postConfession(text.trim());
      if (data.confession) {
        onPost(data.confession);
        setText('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-box">
      <div className="post-box-row">
        <div className="avatar avatar-lg">{initial}</div>
        <div className="post-box-body">
          <textarea
            className="post-textarea"
            placeholder="What's your confession?"
            value={text}
            rows={3}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="post-footer">
            <span className={`char-count ${left < 40 ? 'char-warn' : ''} ${left < 0 ? 'char-over' : ''}`}>
              {left}
            </span>
            <button className="btn-post" onClick={submit} disabled={!text.trim() || left < 0 || loading}>
              {loading ? 'Posting…' : 'Whisper'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
