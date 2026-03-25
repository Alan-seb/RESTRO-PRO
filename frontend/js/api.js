// API Base URL - change this to your deployed backend URL
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : '/api'; // When served from same Vercel deployment

const api = {
  _getToken: () => localStorage.getItem('rms_token'),

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    const token = this._getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  async request(method, path, body = null) {
    const opts = { method, headers: this._headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get:    (path)        => api.request('GET',    path),
  post:   (path, body)  => api.request('POST',   path, body),
  put:    (path, body)  => api.request('PUT',    path, body),
  patch:  (path, body)  => api.request('PATCH',  path, body),
  delete: (path)        => api.request('DELETE', path),
};

// Auth helpers
const Auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getUser: () => {
    const token = localStorage.getItem('rms_token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
  },
  logout: () => {
    localStorage.removeItem('rms_token');
    localStorage.removeItem('rms_user');
    window.location.href = '/index.html';
  },
  isLoggedIn: () => !!localStorage.getItem('rms_token'),
  requireAuth: () => {
    if (!Auth.isLoggedIn()) window.location.href = '/index.html';
  }
};

// Toast notifications
const Toast = {
  show(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },
  success: (m) => Toast.show(m, 'success'),
  error:   (m) => Toast.show(m, 'error'),
  info:    (m) => Toast.show(m, 'info'),
};

// Format currency (INR)
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// Format date
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
