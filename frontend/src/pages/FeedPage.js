import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import PostBox from '../components/PostBox';
import ConfessionCard from '../components/ConfessionCard';
import { getConfessions, likeConfession, replyToConfession } from '../services/api';

export default function FeedPage({ onLogout }) {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const anonymousName = localStorage.getItem('anonymousName');
  const currentUserId = localStorage.getItem('userId');

  const fetchFeed = useCallback(async () => {
    try {
      const data = await getConfessions();
      if (Array.isArray(data)) setConfessions(data);
      else setError('Failed to load confessions.');
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const handlePost = (confession) => setConfessions((prev) => [confession, ...prev]);

  const handleLike = async (id) => {
    // Optimistic update
    setConfessions((prev) =>
      prev.map((c) => {
        if (c._id !== id) return c;
        const liked = c.likes.map(String).includes(String(currentUserId));
        return {
          ...c,
          likes: liked
            ? c.likes.filter((uid) => String(uid) !== String(currentUserId))
            : [...c.likes, currentUserId],
        };
      })
    );
    try {
      await likeConfession(id);
    } catch (e) {
      fetchFeed(); // revert on failure
    }
  };

  const handleReply = async (id, content) => {
    try {
      const data = await replyToConfession(id, content);
      if (data.reply) {
        setConfessions((prev) =>
          prev.map((c) => {
            if (c._id !== id) return c;
            return {
              ...c,
              replies: [...(c.replies || []), data.reply],
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
      alert('Failed to post reply.');
    }
  };

  return (
    <>
      <Navbar anonymousName={anonymousName} onLogout={onLogout} />
      <div className="layout">
        {/* Left Sidebar */}
        <aside className="sidebar-l">
          <div className="sidebar-l-logo">Nox 🌙</div>
          <div className="nav-item active"><span className="nav-icon">🏠</span> Home</div>
          <div className="nav-item"><span className="nav-icon">🔍</span> Explore</div>
          <div className="nav-item"><span className="nav-icon">🔔</span> Notifications</div>
          <div className="nav-item"><span className="nav-icon">👤</span> Profile</div>
        </aside>

        {/* Feed */}
        <main className="feed-col">
          <PostBox anonymousName={anonymousName} onPost={handlePost} />

          {loading && (
            <div className="spinner-wrap"><div className="spinner" /></div>
          )}
          {!loading && error && (
            <div className="feed-empty"><h3>😶 {error}</h3></div>
          )}
          {!loading && !error && confessions.length === 0 && (
            <div className="feed-empty">
              <h3>Nothing here yet</h3>
              <p>Be the first to share something…</p>
            </div>
          )}
          {!loading && confessions.map((c) => (
            <ConfessionCard key={c._id} confession={c} currentUserId={currentUserId} onLike={handleLike} onReply={handleReply} />
          ))}
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar-r">
          <div className="widget">
            <h3 className="widget-title">Trending</h3>
            <div className="trend">
              <div className="trend-label">Trending in Confessions</div>
              <div className="trend-name">#Anonymous</div>
            </div>
            <div className="trend">
              <div className="trend-label">Popular today</div>
              <div className="trend-name">#Secrets</div>
            </div>
            <div className="trend">
              <div className="trend-label">New</div>
              <div className="trend-name">#Nox</div>
            </div>
          </div>
          <div className="widget">
            <h3 className="widget-title">About Nox</h3>
            <p style={{ color: 'var(--t2)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              A safe space to share your thoughts anonymously. Your identity stays hidden — always.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
