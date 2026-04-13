const API = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : `http://${window.location.hostname}:5000/api`;

console.log(`[API Service] Using base URL: ${API} (Env: ${process.env.NODE_ENV})`);

const headers = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  console.log(`[API Request] Attempting: ${url}`);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`[API Error] Request timed out after ${timeout}ms: ${url}`);
      throw new Error(`Connection timed out. The server might be sleeping or busy.`);
    }
    console.error(`[API Error] Fetch failed for ${url}:`, error);
    throw error;
  }
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    console.warn(`[API Response] HTTP ${res.status} error:`, data);
    const errorMessage = (typeof data === 'object' && (data.message || data.error)) 
      ? (data.message || data.error) 
      : (typeof data === 'string' ? data.substring(0, 100) : `Status ${res.status}`);
    throw new Error(errorMessage);
  }
  return data;
};

export const registerUser = (email, password, anonymousName) =>
  fetchWithTimeout(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, anonymousName }),
  }).then(handleResponse);

export const loginUser = (email, password) =>
  fetchWithTimeout(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const updateProfile = (avatar, anonymousName) =>
  fetchWithTimeout(`${API}/auth/profile`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ avatar, anonymousName }),
  }).then(handleResponse);

export const getConfessions = (page = 1, limit = 20) =>
  fetchWithTimeout(`${API}/confessions?page=${page}&limit=${limit}`, { headers: headers() }).then(handleResponse);

export const postConfession = (content, image) =>
  fetchWithTimeout(`${API}/confessions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content, image }),
  }).then(handleResponse);

export const editConfession = (id, content) =>
  fetchWithTimeout(`${API}/confessions/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ content }),
  }).then(handleResponse);

export const deleteConfession = (id) =>
  fetchWithTimeout(`${API}/confessions/${id}`, {
    method: 'DELETE',
    headers: headers(),
  }).then(handleResponse);

export const likeConfession = (id) =>
  fetchWithTimeout(`${API}/confessions/like/${id}`, {
    method: 'POST',
    headers: headers(),
  }).then(handleResponse);

export const replyToConfession = (id, content) =>
  fetchWithTimeout(`${API}/confessions/${id}/reply`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content }),
  }).then(handleResponse);
