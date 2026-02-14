/**
 * Central API client. Uses VITE_API_BASE_URL when set (e.g. for a real backend).
 * When empty, callers use mock implementations.
 * Base URL is set from env in main.tsx so this file stays Jest-safe (no import.meta).
 */

let baseUrl = '';

export function setApiBaseUrl(url: string): void {
  baseUrl = url ?? '';
}

function getBaseUrl(): string {
  return baseUrl;
}

/** True when a backend base URL is configured; otherwise services use mocks. */
export const hasApiBaseUrl = (): boolean => Boolean(getBaseUrl());

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
};

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;
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

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('Content-Type');
    const isJson = contentType?.includes('application/json');
    const responseBody = isJson ? await response.json() : await response.text();

    if (!response.ok) {
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
