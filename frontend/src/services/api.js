const API = 'http://localhost:5000/api';

const headers = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const registerUser = (email, password, anonymousName) =>
  fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, anonymousName }),
  }).then((r) => r.json());

export const loginUser = (email, password) =>
  fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());

export const updateProfile = (avatar, anonymousName) =>
  fetch(`${API}/auth/profile`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ avatar, anonymousName }),
  }).then((r) => r.json());

export const getConfessions = () =>
  fetch(`${API}/confessions`, { headers: headers() }).then((r) => r.json());

export const postConfession = (content, image) =>
  fetch(`${API}/confessions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content, image }),
  }).then((r) => r.json());

export const editConfession = (id, content) =>
  fetch(`${API}/confessions/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ content }),
  }).then((r) => r.json());

export const deleteConfession = (id) =>
  fetch(`${API}/confessions/${id}`, {
    method: 'DELETE',
    headers: headers(),
  }).then((r) => r.json());

export const likeConfession = (id) =>
  fetch(`${API}/confessions/like/${id}`, {
    method: 'POST',
    headers: headers(),
  }).then((r) => r.json());

export const replyToConfession = (id, content) =>
  fetch(`${API}/confessions/${id}/reply`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content }),
  }).then((r) => r.json());
