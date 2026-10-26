/**
 * API Client for BookVault Cloud Backend (Django REST Framework)
 * Reads VITE_API_URL environment variable or falls back to http://localhost:8000
 */

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

// Storage keys
const TOKEN_KEY = 'bookvault_access_token';
const REFRESH_KEY = 'bookvault_refresh_token';
const USER_KEY = 'bookvault_user_info';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token) => localStorage.setItem(REFRESH_KEY, token),
  removeRefresh: () => localStorage.removeItem(REFRESH_KEY),

  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Fetch wrapper with Authorization Bearer header
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = storage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return { status: 204, data: null };
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = new Error(
      (data && (data.error || data.detail || data.message)) || `HTTP ${response.status}: ${response.statusText}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { status: response.status, data };
}

export const api = {
  /**
   * POST /api/login/
   */
  async login(email, password) {
    const res = await request('/api/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const token = res.data.token || res.data.access;
    const refresh = res.data.refresh;
    const user = res.data.user;

    if (token) storage.setToken(token);
    if (refresh) storage.setRefresh(refresh);
    if (user) storage.setUser(user);

    return res.data;
  },

  /**
   * POST /api/register/
   */
  async register(name, email, password, role = 'viewer') {
    const res = await request('/api/register/', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    return res.data;
  },

  /**
   * POST /api/verify/
   */
  async verify(email, pin) {
    const res = await request('/api/verify/', {
      method: 'POST',
      body: JSON.stringify({ email, pin })
    });
    return res.data;
  },

  /**
   * GET /api/profile/
   */
  async getProfile() {
    const res = await request('/api/profile/', { method: 'GET' });
    if (res.data) {
      storage.setUser(res.data);
    }
    return res.data;
  },

  /**
   * GET /api/books/
   */
  async getBooks() {
    const res = await request('/api/books/', { method: 'GET' });
    return res.data;
  },

  /**
   * POST /api/books/
   */
  async createBook(book) {
    const res = await request('/api/books/', {
      method: 'POST',
      body: JSON.stringify(book)
    });
    return res.data;
  },

  /**
   * PUT /api/books/:id/
   */
  async updateBook(id, book) {
    const res = await request(`/api/books/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(book)
    });
    return res.data;
  },

  /**
   * DELETE /api/books/:id/
   */
  async deleteBook(id) {
    const res = await request(`/api/books/${id}/`, {
      method: 'DELETE'
    });
    return res;
  },

  /**
   * Health check / ping backend
   */
  async ping() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/books/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      // 200 or 401 means server is up and responding
      return res.status === 200 || res.status === 401;
    } catch {
      return false;
    }
  }
};
