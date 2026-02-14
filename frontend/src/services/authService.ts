// src/services/authService.ts
import { request, hasApiBaseUrl, ApiError } from './api';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
  refreshToken: string;
}

function getStoredToken(): string | null {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

/**
 * Login: uses real API when VITE_API_BASE_URL is set, otherwise mock.
 */
export const login = async (username: string, password?: string): Promise<AuthResponse> => {
  if (hasApiBaseUrl()) {
    try {
      const data = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      return data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Invalid username or password';
      throw new Error(message);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (username === 'test' && password === 'password') {
    const mockUser: ApiUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Test+User&background=random',
    };
    return {
      user: mockUser,
      token: 'mock_jwt_token_string',
      refreshToken: 'mock_refresh_token_string',
    };
  }
  throw new Error('Invalid username or password');
};

/**
 * Register: uses real API when base URL is set, otherwise mock.
 */
export const register = async (
  username: string,
  email: string,
  password?: string,
  avatar?: File | null
): Promise<ApiUser> => {
  if (hasApiBaseUrl()) {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      if (password) formData.append('password', password);
      if (avatar) formData.append('avatar', avatar);
      const data = await request<ApiUser>('/auth/register', {
        method: 'POST',
        body: formData,
        headers: {},
      });
      return data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
      throw new Error(message);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));
  const newUser: ApiUser = {
    id: Date.now().toString(),
    name: username,
    email,
    avatar: avatar ? URL.createObjectURL(avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
  };
  return newUser;
};

/**
 * Social login placeholder. When backend exists, replace with OAuth flow.
 */
export const socialLogin = async (
  _provider: 'google' | 'facebook'
): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  throw new Error('Social login coming soon.');
};

/**
 * Refresh token. Uses API when base URL is set.
 */
export const refreshToken = async (
  currentRefreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  if (hasApiBaseUrl()) {
    const data = await request<{ token: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: currentRefreshToken },
    });
    return data;
  }
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    token: 'new_mock_jwt_token_string',
    refreshToken: 'new_mock_refresh_token_string',
  };
};

/**
 * Update profile (PATCH /users/me). Used by Profile save.
 */
export const updateProfile = async (
  userId: string,
  data: { name?: string; avatar?: string }
): Promise<ApiUser> => {
  if (hasApiBaseUrl()) {
    const token = getStoredToken();
    const updated = await request<ApiUser>('/users/me', {
      method: 'PATCH',
      body: data,
      token,
    });
    return updated;
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    id: userId,
    name: data.name ?? '',
    email: '',
    avatar: data.avatar,
  } as ApiUser;
};
