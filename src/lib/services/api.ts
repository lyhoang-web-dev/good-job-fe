import axios from 'axios';
import axiosRetry from 'axios-retry';

import {
  getSessionAccessToken,
  setSessionAccessToken,
} from '@/lib/services/sessionAccessToken';

const API_ENVELOPE_KEYS = new Set(['data', 'message', 'accessToken']);

function isApiSuccessEnvelope(body: unknown): body is {
  data: unknown;
  message?: string;
  accessToken?: string;
} {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  const keys = Object.keys(body as object);
  if (!keys.includes('data')) {
    return false;
  }
  return keys.every((k) => API_ENVELOPE_KEYS.has(k));
}

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    if (error.response?.status === 401) {
      return false;
    }
    return (
      axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error)
    );
  },
});

api.interceptors.request.use((config) => {
  const key = config.headers['X-Idempotency-Key'];
  if (!key && ['post', 'put', 'patch'].includes(config.method ?? '')) {
    config.headers['X-Idempotency-Key'] = crypto.randomUUID();
  }
  const token = getSessionAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (isApiSuccessEnvelope(response.data)) {
      const envelope = response.data;
      if (typeof envelope.accessToken === 'string') {
        setSessionAccessToken(envelope.accessToken);
      }
      response.data = envelope.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      setSessionAccessToken(null);
      const path = window.location.pathname;
      if (!path.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
