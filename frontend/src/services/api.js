/**
 * API Service for CV Insight AI
 * Interacts directly with the Node.js / Express backend with cookie credentials
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJson(url, options = {}) {
  try {
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${url}`, {
      credentials: 'include',
      headers,
      ...options,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${url}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  login: async (credentials) => {
    return fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  signup: async (userData) => {
    return fetchJson('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return fetchJson('/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async () => {
    return fetchJson('/auth/me');
  },

  changePassword: async (passwords) => {
    return fetchJson('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    });
  },

  updatePrivacySettings: async (settings) => {
    return fetchJson('/auth/privacy-settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  exportUserData: async () => {
    const response = await fetch(`${API_BASE}/auth/export-data`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to export user archive');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv_insight_archive_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  deleteAccount: async (confirmEmail) => {
    return fetchJson('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ confirmEmail }),
    });
  },

  // Health Check
  getHealth: async () => {
    return fetchJson('/health');
  },

  // Dashboard Aggregates
  getStats: async () => {
    return fetchJson('/stats');
  },

  // Resumes
  getResumes: async () => {
    return fetchJson('/resumes');
  },

  getResumeById: async (id) => {
    return fetchJson(`/resumes/${id}`);
  },

  uploadAndAnalyzeResume: async (payloadOrFormData) => {
    const isFormData = payloadOrFormData instanceof FormData;
    return fetchJson('/resumes', {
      method: 'POST',
      body: isFormData ? payloadOrFormData : JSON.stringify(payloadOrFormData),
    });
  },

  deleteResume: async (id) => {
    return fetchJson(`/resumes/${id}`, {
      method: 'DELETE',
    });
  },

  // Analysis & Job Matching
  getLatestAnalysis: async () => {
    return fetchJson('/analysis/latest');
  },

  getAnalysisById: async (id) => {
    return fetchJson(`/analysis/${id}`);
  },

  deleteAnalysis: async (id) => {
    return fetchJson(`/analysis/${id}`, {
      method: 'DELETE',
    });
  },

  compareAnalyses: async (id1, id2) => {
    return fetchJson(`/analysis/compare/${id1}/${id2}`);
  },

  rematchJobDescription: async (resumeId, payload) => {
    return fetchJson(`/analysis/${resumeId}/match-jd`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAnalysisHistory: async () => {
    return fetchJson('/analysis/history');
  },

  clearAnalysisHistory: async () => {
    return fetchJson('/analysis/history/clear', {
      method: 'DELETE',
    });
  },

  downloadAnalysisPdf: async (id, fileName = 'CV_Insight_Report.pdf') => {
    const response = await fetch(`${API_BASE}/analysis/${id}/pdf`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to download PDF (${response.status})`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  previewAnalysis: async (payload) => {
    return fetchJson('/analysis/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // User Profile
  getProfile: async () => {
    return fetchJson('/profile');
  },

  updateProfile: async (data) => {
    return fetchJson('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // AI Career Assistant Chatbot
  sendChatMessage: async ({ resumeId, message }) => {
    return fetchJson('/chat', {
      method: 'POST',
      body: JSON.stringify({ resumeId, message }),
    });
  },

  getChatHistory: async (resumeId = 'all') => {
    return fetchJson(`/chat/history/${resumeId}`);
  },

  clearChatHistory: async (resumeId = 'all') => {
    return fetchJson(`/chat/history/${resumeId}`, {
      method: 'DELETE',
    });
  },

  // Generative AI Resume Builder & Optimizer
  getBuilderResumes: async () => {
    return fetchJson('/builder');
  },

  getBuilderResume: async (id) => {
    return fetchJson(`/builder/${id}`);
  },

  createBuilderResume: async (data = {}) => {
    return fetchJson('/builder', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  importBuilderResume: async (resumeId) => {
    return fetchJson(`/builder/import/${resumeId}`, {
      method: 'POST',
    });
  },

  updateBuilderResume: async (id, data) => {
    return fetchJson(`/builder/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  autosaveBuilderResume: async (id, data) => {
    return fetchJson(`/builder/${id}/autosave`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  duplicateBuilderResume: async (id) => {
    return fetchJson(`/builder/${id}/duplicate`, {
      method: 'POST',
    });
  },

  deleteBuilderResume: async (id) => {
    return fetchJson(`/builder/${id}`, {
      method: 'DELETE',
    });
  },

  saveBuilderVersion: async (id, versionName) => {
    return fetchJson(`/builder/${id}/version`, {
      method: 'POST',
      body: JSON.stringify({ versionName }),
    });
  },

  getBuilderVersions: async (id) => {
    return fetchJson(`/builder/${id}/versions`);
  },

  restoreBuilderVersion: async (id, versionId) => {
    return fetchJson(`/builder/${id}/restore/${versionId}`, {
      method: 'POST',
    });
  },

  improveBuilderText: async (payload) => {
    return fetchJson('/builder/ai/improve-text', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  optimizeBuilderForJob: async (payload) => {
    return fetchJson('/builder/ai/optimize-for-job', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  downloadBuilderPdf: async (id, options = {}) => {
    const params = new URLSearchParams();
    if (options.template) params.append('template', options.template);
    if (options.fontFamily) params.append('fontFamily', options.fontFamily);
    if (options.fontSize) params.append('fontSize', options.fontSize);
    if (options.accentColor) params.append('accentColor', options.accentColor);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE}/builder/${id}/export/pdf${queryString}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to download PDF (${response.status})`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = options.fileName || `Resume_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

export default api;
