const BASE = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('fde_token');
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(BASE + url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('fde_token');
    localStorage.removeItem('fde_user');
    window.location.href = '/login';
    throw new Error('请先登录');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

// Auth API
export const authAPI = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  changePassword: (body) => request('/auth/password', { method: 'PUT', body: JSON.stringify(body) }),
  listUsers: () => request('/auth/users'),
  changeRole: (id, role) => request(`/auth/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
};

// FDE Profiles API
export const fdeAPI = {
  list: (city) => request('/fde' + (city ? `?city=${encodeURIComponent(city)}` : '')),
  cities: () => request('/fde/cities'),
  get: (userId) => request(`/fde/${userId}`),
  update: (userId, body) => request(`/fde/${userId}`, { method: 'PUT', body: JSON.stringify(body) }),
  uploadAvatar: (userId, file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return request(`/fde/${userId}/avatar`, { method: 'POST', body: fd });
  },
  uploadQrCode: (userId, file) => {
    const fd = new FormData();
    fd.append('qrcode', file);
    return request(`/fde/${userId}/qrcode`, { method: 'POST', body: fd });
  },
  // Review endpoints
  getMyPending: () => request('/fde/my-pending'),
  getReviews: () => request('/fde/reviews'),
  approveReview: (id) => request(`/fde/reviews/${id}/approve`, { method: 'POST' }),
  rejectReview: (id) => request(`/fde/reviews/${id}/reject`, { method: 'POST' }),
  updateReview: (id, body) => request(`/fde/reviews/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (userId) => request(`/fde/${userId}`, { method: 'DELETE' }),
};

// Articles API
export const articlesAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('/articles' + (qs ? '?' + qs : ''));
  },
  categories: () => request('/articles/categories'),
  get: (id) => request(`/articles/${id}`),
  create: (body) => request('/articles', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/articles/${id}`, { method: 'DELETE' }),
  uploadCover: (file) => {
    const fd = new FormData();
    fd.append('cover', file);
    return request('/articles/upload-cover', { method: 'POST', body: fd });
  },
};

// Enterprise Resources API
export const resourcesAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('/resources' + (qs ? '?' + qs : ''));
  },
  categories: () => request('/resources/categories'),
  get: (id) => request(`/resources/${id}`),
  create: (body) => request('/resources', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/resources/${id}`, { method: 'DELETE' }),
  uploadCover: (file) => {
    const fd = new FormData();
    fd.append('cover', file);
    return request('/resources/upload-cover', { method: 'POST', body: fd });
  },
};

export function getAssetUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return url;
}
