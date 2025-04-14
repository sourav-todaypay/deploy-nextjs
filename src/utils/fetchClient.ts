import { ACCESS_TOKEN_KEY } from '@/constants/authConstants';
import Store from './store';

const store = new Store();
const TIMEOUT = 30000;

const getAPIBaseURL = () => {
  let environment = '';
  let apiBase = 'api';

  if (process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase() === 'staging') {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase() !== 'production') {
    environment = process.env.NEXT_PUBLIC_ENVIRONMENT!.toLowerCase();
  }

  if (environment) {
    apiBase += `-${environment}`;
  }

  return `https://${apiBase}.${window.location.host}/v1`;
};

const getHeaders = (useAuth: boolean, customHeaders?: HeadersInit) => {
  const headers = new Headers(customHeaders);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (useAuth) {
    const token = store.get(ACCESS_TOKEN_KEY);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
};

const fetchAPI = async (
  path: string,
  method: string,
  body?: Record<string, unknown> | Record<string, unknown>[] | FormData | null,
  useAuth: boolean = false,
  customHeaders?: HeadersInit,
) => {
  const baseUrl = getAPIBaseURL();
  const url = `${baseUrl}${path}`;
  const isFormData = body instanceof FormData;
  const headers = getHeaders(useAuth, customHeaders);
  if (isFormData) {
    headers.delete('Content-Type');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    if (data.access_token) {
      store.save(ACCESS_TOKEN_KEY, data.access_token);
    }

    return { status: response.status, data };
  } catch (error) {
    throw error;
  }
};

export default fetchAPI;
