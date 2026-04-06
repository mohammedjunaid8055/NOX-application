import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import PostBox from '../components/PostBox';
import ConfessionCard from '../components/ConfessionCard';
import { getConfessions, likeConfession, replyToConfession, editConfession, deleteConfession, updateProfile } from '../services/api';

export default function FeedPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  
  const currentUserId = localStorage.getItem('userId');
  const [anonymousName, setAnonymousName] = useState(localStorage.getItem('anonymousName') || '');
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem('avatar') || '');

  // For Profile editing
  const [avatarUrl, setAvatarUrl] = useState(userAvatar);
  const [newName, setNewName] = useState(anonymousName);
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchFeed = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await getConfessions(pageNum, 15); // Smaller page size is faster
      if (data && Array.isArray(data.confessions)) {
        if (pageNum === 1) setConfessions(data.confessions);
        else setConfessions((prev) => [...prev, ...data.confessions]);
        
        setHasMore(data.page < data.pages);
        setPage(data.page);
      } else {
        setError('Failed to load confessions.');
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchFeed(1); }, [fetchFeed]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(page + 1);
    }
  };

  const handlePost = (confession) => setConfessions((prev) => [confession, ...prev]);

  const handleLike = async (id) => {
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
      fetchFeed();
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

  const handleEdit = async (id, newContent) => {
    try {
      const data = await editConfession(id, newContent);
      if (data.confession) {
        setConfessions(prev => prev.map(c => c._id === id ? data.confession : c));
      }
    } catch (err) {
      alert('Edit failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteConfession(id);
      setConfessions(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const data = await updateProfile(avatarUrl, newName);
      if (data.user) {
        localStorage.setItem('avatar', data.user.avatar || '');
        localStorage.setItem('anonymousName', data.user.anonymousName || '');
        if (data.token) localStorage.setItem('token', data.token);
        
        setUserAvatar(data.user.avatar);
        setAnonymousName(data.user.anonymousName);
        alert('Profile saved!');
        fetchFeed(); // Refresh to update feed usernames
      }
    } catch (e) {
      alert('Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400; // Profile pics don't need to be huge
          let w = img.width;
          let h = img.height;
          if (w > h && w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; }
          else if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          setAvatarUrl(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% jpeg
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredConfessions = useMemo(() => {
    if (activeTab === 'explore') {
      return [...confessions].sort((a, b) => (b.likes.length || 0) - (a.likes.length || 0));
    }
    if (activeTab === 'profile') {
      return confessions.filter(c => {
        const cUserId = typeof c.userId === 'object' && c.userId ? c.userId._id : c.userId;
        return cUserId === currentUserId;
      });
    }
    if (activeTab === 'notifications') {
      return confessions.filter(c => {
        const cUserId = typeof c.userId === 'object' && c.userId ? c.userId._id : c.userId;
        // User's confessions that have replies
        return cUserId === currentUserId && c.replies && c.replies.length > 0;
      });
    }
    return confessions; // 'home'
  }, [confessions, activeTab, currentUserId]);

  return (
    <>
      <Navbar anonymousName={anonymousName} avatar={userAvatar} onLogout={onLogout} onLogoClick={() => setActiveTab('home')} />
      <div className="layout">
        {/* Left Sidebar */}
        <aside className="sidebar-l">
          <div className="sidebar-l-logo">Nox 🌙</div>
          <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <span className="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>
            <span className="nav-text">Home</span>
          </div>
          <div className={`nav-item ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => setActiveTab('explore')}>
            <span className="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
            <span className="nav-text">Explore</span>
          </div>
          <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <span className="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span>
            <span className="nav-text">Notifications</span>
          </div>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <span className="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
            <span className="nav-text">Profile</span>
          </div>
        </aside>

        {/* Feed */}
        <main className="feed-col">
          {activeTab === 'home' && <PostBox anonymousName={anonymousName} avatar={userAvatar} onPost={handlePost} />}

          {activeTab === 'explore' && <div className="post-box"><h2 style={{color: 'var(--t1)'}}>Trending 🔥</h2><p style={{color: 'var(--t2)', fontSize: '0.9rem'}}>Most liked confessions across Nox</p></div>}
          
          {activeTab === 'notifications' && <div className="post-box"><h2 style={{color: 'var(--t1)'}}>Your Interactions 🔔</h2><p style={{color: 'var(--t2)', fontSize: '0.9rem'}}>Posts of yours that received replies</p></div>}

          {activeTab === 'profile' && (
            <div className="post-box" style={{ background: 'var(--surface)' }}>
              <h2 style={{color: 'var(--t1)', marginBottom: 16}}>Edit Profile Settings</h2>
              
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                 {avatarUrl ? (
                   <img src={avatarUrl} alt="avatar preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
                 ) : (
                   <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                     {newName ? newName[0].toUpperCase() : '?'}
                   </div>
                 )}
              </div>

              <div className="form-group">
                <label className="form-label">Anonymous Name</label>
                <input type="text" className="form-input" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Profile Image Option (Choose file)</label>
                <input type="file" accept="image/*" className="form-input" onChange={handleImageUpload} style={{ padding: '10px' }} />
              </div>

              <button className="btn-primary" onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {loading && (
            <div className="spinner-wrap"><div className="spinner" /></div>
          )}
          {!loading && error && (
            <div className="feed-empty"><h3>😶 {error}</h3></div>
          )}
          {!loading && !error && filteredConfessions.length === 0 && (
            <div className="feed-empty">
              <h3>Nothing here yet</h3>
              <p>{activeTab === 'home' ? 'Be the first to share something…' : 'No confessions match this view.'}</p>
            </div>
          )}
          {!loading && filteredConfessions.map((c) => (
            <ConfessionCard 
              key={c._id} 
              confession={c} 
              currentUserId={currentUserId} 
              onLike={handleLike} 
              onReply={handleReply} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
            />
          ))}

          {!loading && !error && hasMore && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <button className="btn-primary" onClick={loadMore} disabled={loadingMore} style={{ width: 'auto', padding: '10px 24px' }}>
                {loadingMore ? 'Loading...' : 'Load more sessions'}
              </button>
            </div>
          )}
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
