import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    ()     => api.post('/auth/login'),
  me:       ()     => api.get('/auth/me'),
  logout:   ()     => api.post('/auth/logout'),
  updateProfile: (d) => api.patch('/auth/profile', d),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  overview: () => api.get('/dashboard/overview'),
  search:   (q) => api.get('/dashboard/search', { params: { q } }),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  generate: ({ inputText, file, requestedTypes, provider, title, onProgress }) => {
    const form = new FormData();
    form.append('requestedTypes', JSON.stringify(requestedTypes));
    if (inputText) form.append('inputText', inputText);
    if (file)      form.append('file', file);
    if (provider)  form.append('provider', provider);
    if (title)     form.append('title', title);
    return api.post('/ai/generate', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
        : undefined,
    });
  },
  getHistory:    (p)     => api.get('/ai/history', { params: p }),
  getSession:    (id)    => api.get(`/ai/history/${id}`),
  updateSession: (id, d) => api.patch(`/ai/history/${id}`, d),
  deleteSession: (id)    => api.delete(`/ai/history/${id}`),
};

// ── PDF ───────────────────────────────────────────────────────────────────────
export const pdfAPI = {
  imageToPdf: (images, opts = {}, onProgress) => {
    const form = new FormData();
    images.forEach((f) => form.append('images', f));
    Object.entries(opts).forEach(([k, v]) => form.append(k, v));
    return api.post('/pdf/image-to-pdf', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress ? (e) => onProgress(Math.round((e.loaded / e.total) * 100)) : undefined,
    });
  },
  merge: (files, opts = {}, onProgress) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    Object.entries(opts).forEach(([k, v]) => form.append(k, v));
    return api.post('/pdf/merge', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress ? (e) => onProgress(Math.round((e.loaded / e.total) * 100)) : undefined,
    });
  },
  compress: (file, opts = {}) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(opts).forEach(([k, v]) => form.append(k, v));
    return api.post('/pdf/compress', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  toWord: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/pdf/to-word', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  downloadUrl: (filename) => `${BASE_URL.replace('/api/v1', '')}/processed/${filename}`,
};

// ── CV ────────────────────────────────────────────────────────────────────────
export const cvAPI = {
exportPdf: async (id) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not logged in');
  }

  const token = await user.getIdToken();

  return axios.post(`${BASE_URL}/cv/${id}/export`, {}, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res.data]));

    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv.pdf';

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  });
},
};

// ── Files ─────────────────────────────────────────────────────────────────────
export const filesAPI = {
  list:      (p)  => api.get('/files', { params: p }),
  storage:   ()   => api.get('/files/storage'),
  save:      (id) => api.patch(`/files/${id}/save`),
  delete:    (id) => api.delete(`/files/${id}`),
  clearTemp: ()   => api.delete('/files/clear-temp'),
};

export default api;
