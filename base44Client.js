
const apiUrl = import.meta.env.VITE_API_URL;
const appId = import.meta.env.VITE_APP_ID;
 
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token') || window.localStorage.getItem('access_token');
};
 
const buildHeaders = (extra = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (appId) headers['X-App-Id'] = appId;
  return headers;
};
 
const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
};
 
const request = async (path, options = {}) => {
  const url = path.startsWith('http') ? path : `${apiUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const opts = {
    headers: buildHeaders(options.headers || {}),
    method: options.method || 'GET',
  };
  if (options.body) {
    if (options.isFormData) {
      delete opts.headers['Content-Type'];
      opts.body = options.body;
    } else {
      opts.body = JSON.stringify(options.body);
    }
  }
  const res = await fetch(url, opts);
  const data = await safeJson(res);
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};
 
const entities = {
  Session: {
    list: async (sort = '') => {
      const q = sort ? `?sort=${encodeURIComponent(sort)}` : '';
      return await request(`/sessions${q}`);
    },
    create: async (body) => await request(`/sessions`, { method: 'POST', body }),
    update: async (id, body) => await request(`/sessions/${id}`, { method: 'PATCH', body }),
    delete: async (id) => await request(`/sessions/${id}`, { method: 'DELETE' }),
  },
  Message: {
    filter: async (filter = {}, sort = '', limit) => {
      const params = new URLSearchParams();
      if (filter && Object.keys(filter).length) params.set('filter', JSON.stringify(filter));
      if (sort) params.set('sort', sort);
      if (limit) params.set('limit', String(limit));
      const q = params.toString() ? `?${params.toString()}` : '';
      return await request(`/messages${q}`);
    },
    create: async (body) => await request(`/messages`, { method: 'POST', body }),
    delete: async (id) => await request(`/messages/${id}`, { method: 'DELETE' }),
  },
  JournalEntry: {
    list: async (sort = '') => {
      const q = sort ? `?sort=${encodeURIComponent(sort)}` : '';
      return await request(`/journal-entries${q}`);
    },
    create: async (body) => await request(`/journal-entries`, { method: 'POST', body }),
    update: async (id, body) => await request(`/journal-entries/${id}`, { method: 'PATCH', body }),
    delete: async (id) => await request(`/journal-entries/${id}`, { method: 'DELETE' }),
  }
};
 
const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      const fd = new FormData();
      fd.append('file', file);
      return await request(`/integrations/upload`, { method: 'POST', body: fd, isFormData: true });
    },
    ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
      return await request(`/integrations/extract`, { method: 'POST', body: { file_url, json_schema } });
    },
    InvokeLLM: async ({ prompt, add_context_from_internet = false }) => {
      const res = await request(`/integrations/invoke`, { method: 'POST', body: { prompt, add_context_from_internet } });
      return typeof res === 'string' ? res : res?.output || '';
    },
    TranscribeAudio: async ({ audio_url }) => {
      const res = await request(`/integrations/transcribe`, { method: 'POST', body: { audio_url } });
      return res?.transcript || (typeof res === 'string' ? res : '');
    }
  }
};
 
const auth = {
  me: async () => await request(`/auth/me`),
  logout: (redirect) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('access_token');
      if (redirect) window.location.href = redirect;
    }
  },
  redirectToLogin: (redirect) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/login?redirect=${encodeURIComponent(redirect || window.location.href)}`;
    }
  }
};
 
export const api = { entities, integrations, auth };
