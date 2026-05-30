/**
 * EduAssist Frontend API Client
 * Place this file at: frontend/src/api/client.js
 *
 * Usage: import api from '@/api/client'
 */

import axios from 'axios';
import { getAuth } from 'firebase/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s for large file operations
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach Firebase ID token ────────────────────────────
api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn('Could not get Firebase token:', e.message);
  }
  return config;
});

// ── Response interceptor — normalize errors ────────────────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ────────────────────────────────────────────────────────────────────────────
// AUTH API
// ────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: () => api.post('/auth/login'),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  deleteAccount: () => api.delete('/auth/account'),
};

// ────────────────────────────────────────────────────────────────────────────
// AI API
// ────────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  /**
   * Generate study content from text or file.
   * @param {Object} params
   * @param {string} [params.inputText]     - Raw text to analyze
   * @param {File}   [params.file]          - PDF or image file
   * @param {string[]} params.requestedTypes - ['summary','mcq','shortq',...]
   * @param {string} [params.provider]      - 'anthropic' | 'openai'
   * @param {string} [params.title]
   * @param {function} [params.onProgress]  - progress callback (0–100)
   */
  generate: ({ inputText, file, requestedTypes, provider, title, onProgress }) => {
    const formData = new FormData();
    formData.append('requestedTypes', JSON.stringify(requestedTypes));
    if (inputText) formData.append('inputText', inputText);
    if (file) formData.append('file', file);
    if (provider) formData.append('provider', provider);
    if (title) formData.append('title', title);

    return api.post('/ai/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
        : undefined,
    });
  },

  getHistory: (params = {}) => api.get('/ai/history', { params }),
  getSession: (id) => api.get(`/ai/history/${id}`),
  updateSession: (id, data) => api.patch(`/ai/history/${id}`, data),
  deleteSession: (id) => api.delete(`/ai/history/${id}`),
};

// ────────────────────────────────────────────────────────────────────────────
// PDF API
// ────────────────────────────────────────────────────────────────────────────
export const pdfAPI = {
  /**
   * Convert images to PDF.
   * @param {File[]} images
   * @param {Object} options - pageSize, orientation, addMargin
   */
  imageToPdf: (images, options = {}, onProgress) => {
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    Object.entries(options).forEach(([k, v]) => formData.append(k, v));
    return api.post('/pdf/image-to-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
        : undefined,
    });
  },

  /**
   * Merge multiple PDFs.
   * @param {File[]} files
   */
  merge: (files, options = {}, onProgress) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    Object.entries(options).forEach(([k, v]) => formData.append(k, v));
    return api.post('/pdf/merge', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded / e.total) * 100))
        : undefined,
    });
  },

  /** Compress a single PDF. */
  compress: (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(options).forEach(([k, v]) => formData.append(k, v));
    return api.post('/pdf/compress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Convert PDF to Word/text. */
  toWord: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/to-word', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Get download URL for a processed file. */
  downloadUrl: (filename) => `${BASE_URL}/pdf/download/${filename}`,
};

// ────────────────────────────────────────────────────────────────────────────
// CV API
// ────────────────────────────────────────────────────────────────────────────
export const cvAPI = {
  create: (data) => api.post('/cv', data),
  list: (params = {}) => api.get('/cv', { params }),
  get: (id) => api.get(`/cv/${id}`),
  getPublic: (slug) => api.get(`/cv/public/${slug}`),
  update: (id, data) => api.put(`/cv/${id}`, data),
  togglePublish: (id) => api.patch(`/cv/${id}/publish`),
  delete: (id) => api.delete(`/cv/${id}`),
  exportPdf: (id) =>
    api.post(`/cv/${id}/export`, {}, { responseType: 'blob' }).then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cv.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    }),
};

// ────────────────────────────────────────────────────────────────────────────
// FILES API
// ────────────────────────────────────────────────────────────────────────────
export const filesAPI = {
  list: (params = {}) => api.get('/files', { params }),
  storageInfo: () => api.get('/files/storage'),
  save: (id) => api.patch(`/files/${id}/save`),
  delete: (id) => api.delete(`/files/${id}`),
  clearTemp: () => api.delete('/files/clear-temp'),
};

// ────────────────────────────────────────────────────────────────────────────
// DASHBOARD API
// ────────────────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  overview: () => api.get('/dashboard/overview'),
  search: (q) => api.get('/dashboard/search', { params: { q } }),
};

export default api;
