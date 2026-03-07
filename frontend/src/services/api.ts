/**
 * Central API client. Uses VITE_API_BASE_URL when set (e.g. for a real backend).
 * When empty, callers use mock implementations.
 * Base URL is set from env in main.tsx so this file stays Jest-safe (no import.meta).
 */

let baseUrl = '';

/** Handler called on 401 to refresh the access token. Returns new token or null. */
let authRefreshHandler: (() => Promise<string | null>) | null = null;

export function setApiBaseUrl(url: string): void {
  baseUrl = url ?? '';
}

export function setAuthRefreshHandler(handler: (() => Promise<string | null>) | null): void {
  authRefreshHandler = handler;
}

function getBaseUrl(): string {
  return baseUrl;
}

/** True when a backend base URL is configured; otherwise services use mocks. */
export const hasApiBaseUrl = (): boolean => Boolean(getBaseUrl());

/** Origin for upload URLs (e.g. http://localhost:3000). Strips /api from base URL. */
export function getUploadsBaseUrl(): string {
  const b = getBaseUrl();
  if (!b) return '';
  return b.replace(/\/api\/?$/i, '').replace(/\/$/, '') || b;
}

/** Resolve relative upload path or full URL to absolute backend URL for img src. */
export function getAbsoluteUploadUrl(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  const base = getUploadsBaseUrl();
  if (!base) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl;
  return base + path;
}

export class ApiError extends Error {
  status?: number;
  body?: unknown;
  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
  /** When true, do not attempt token refresh on 401 (e.g. for /auth/refresh). */
  skipAuthRetry?: boolean;
};

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, token, skipAuthRetry = false } = options;
  const BASE_URL = getBaseUrl();
  const url = BASE_URL ? `${BASE_URL.replace(/\/$/, '')}${path}` : '';

  const requestHeaders: Record<string, string> = {
    ...headers,
  };
  if (body !== undefined && body !== null && typeof body === 'object' && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!url) {
    return Promise.reject(new ApiError('No API base URL configured. Use mock services.'));
  }

  const doFetch = async (authToken: string | null): Promise<Response> => {
    const h = { ...requestHeaders };
    if (authToken) {
      h['Authorization'] = `Bearer ${authToken}`;
    }
    return fetch(url, {
      method,
      headers: h,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  };

  try {
    let response = await doFetch(token ?? null);

    const contentType = response.headers.get('Content-Type');
    const isJson = contentType?.includes('application/json');
    const responseBody = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (
        response.status === 401 &&
        token &&
        !skipAuthRetry &&
        authRefreshHandler
      ) {
        const newToken = await authRefreshHandler();
        if (newToken) {
          response = await doFetch(newToken);
          const retryContentType = response.headers.get('Content-Type');
          const retryIsJson = retryContentType?.includes('application/json');
          const retryBody = retryIsJson ? await response.json() : await response.text();
          if (!response.ok) {
            const message =
              typeof retryBody === 'object' && retryBody !== null && 'message' in retryBody
                ? String((retryBody as { message: string }).message)
                : `Request failed with status ${response.status}`;
            throw new ApiError(message, response.status, retryBody);
          }
          return retryBody as T;
        }
      }
      const message =
        typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
          ? String((responseBody as { message: string }).message)
          : `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, responseBody);
    }

    return responseBody as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new ApiError('Network error. Please check your connection and try again.');
    }
    throw new ApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
  }
}
