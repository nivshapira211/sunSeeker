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

/** Backend returns user with username; we map to ApiUser (name) for display. */
function toAuthResponse(raw: { user: { id: string; username: string; email: string; avatar?: string }; token: string; refreshToken: string }): AuthResponse {
  return {
    user: {
      id: String(raw.user.id),
      name: raw.user.username,
      email: raw.user.email,
      avatar: raw.user.avatar,
    },
    token: raw.token,
    refreshToken: raw.refreshToken,
  };
}

/**
 * Login: uses real API when VITE_API_BASE_URL is set, otherwise mock.
 */
export const login = async (username: string, password?: string): Promise<AuthResponse> => {
  if (hasApiBaseUrl()) {
    try {
      const data = await request<{ user: { id: string; username: string; email: string; avatar?: string }; token: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: { username: username?.trim(), password },
      });
      return toAuthResponse(data);
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
 * Register: uses real API when base URL is set, otherwise mock. Returns full auth payload when API is used.
 */
export const register = async (
  username: string,
  email: string,
  password?: string,
  avatar?: File | null
): Promise<AuthResponse> => {
  if (hasApiBaseUrl()) {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      if (password) formData.append('password', password);
      if (avatar) formData.append('avatar', avatar);
      const data = await request<{ user: { id: string; username: string; email: string; avatar?: string }; token: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: formData,
        headers: {},
      });
      return toAuthResponse(data);
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
  return {
    user: newUser,
    token: 'mock_jwt_token_string',
    refreshToken: 'mock_refresh_token_string',
  };
};

/**
 * Social login placeholder. When backend exists, replace with OAuth flow.
 */
export const socialLogin = async (
  provider: 'google' | 'facebook'
): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  if (provider === 'google') {
    const mockUser: ApiUser = {
      id: 'google-1',
      name: 'Google User',
      email: 'google@example.com',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    };
    return {
      user: mockUser,
      token: 'mock_google_jwt_token',
      refreshToken: 'mock_google_refresh_token',
    };
  }
  
  throw new Error('Social login for ' + provider + ' is not supported on this platform.');
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
 * Update profile (PATCH /users/me). Sends multipart FormData: username and optional avatar File.
 */
export const updateProfile = async (
  userId: string,
  data: { name?: string; avatar?: File | string | null }
): Promise<ApiUser> => {
  if (hasApiBaseUrl()) {
    const token = getStoredToken();
    const formData = new FormData();
    if (data.name != null) formData.append('username', data.name);
    if (data.avatar instanceof File) formData.append('avatar', data.avatar);
    const updated = await request<{ id: string; username: string; email: string; avatar?: string }>('/users/me', {
      method: 'PATCH',
      body: formData,
      headers: {},
      token,
    });
    return {
      id: updated.id,
      name: updated.username,
      email: updated.email,
      avatar: updated.avatar,
    };
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    id: userId,
    name: data.name ?? '',
    email: '',
    avatar: data.avatar instanceof File ? undefined : data.avatar ?? undefined,
  } as ApiUser;
};
