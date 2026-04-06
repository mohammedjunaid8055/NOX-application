import React, { useState } from 'react';
import { postConfession } from '../services/api';

const MAX = 280;

export default function PostBox({ anonymousName, onPost }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const initial = anonymousName ? anonymousName[0].toUpperCase() : '?';
  const left = MAX - text.length;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800; // Efficient size for feed
          let w = img.width;
          let h = img.height;
          if (w > h && w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; }
          else if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          setImage(canvas.toDataURL('image/jpeg', 0.6)); // High compression for efficiency
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = async () => {
    if (!text.trim() || left < 0 || loading) return;
    setLoading(true);
    try {
      const data = await postConfession(text.trim(), image);
      if (data.confession) {
        onPost(data.confession);
        setText('');
        setImage('');
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
          {image && (
            <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
              <img src={image} alt="upload preview" style={{ maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
              <button 
                onClick={() => setImage('')} 
                style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
          )}
          <div className="post-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--accent2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>
              <span className={`char-count ${left < 40 ? 'char-warn' : ''} ${left < 0 ? 'char-over' : ''}`}>
                {left}
              </span>
            </div>
            <button className="btn-post" onClick={submit} disabled={!text.trim() || left < 0 || loading}>
              {loading ? 'Posting…' : 'Whisper'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
