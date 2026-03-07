import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { request, hasApiBaseUrl } from '../services/api';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'sunseeker_user';

interface BackendUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

function storeSession(token: string, refreshToken: string, user: { id: string; name: string; email: string; avatar?: string }): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

const AuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (!token || !refreshToken) {
      navigate('/login?error=auth_missing', { replace: true });
      return;
    }

    if (!hasApiBaseUrl()) {
      storeSession(token, refreshToken, { id: 'oauth', name: 'User', email: '', avatar: undefined });
      window.location.href = '/';
      return;
    }

    const finishLogin = async () => {
      try {
        const user = await request<BackendUser>('/users/me', {
          method: 'GET',
          token,
        });
        const frontendUser = {
          id: String(user.id),
          name: user.username,
          email: user.email,
          avatar: user.avatar,
        };
        storeSession(token, refreshToken, frontendUser);
        window.location.href = '/';
      } catch {
        setStatus('error');
      }
    };

    finishLogin();
  }, [searchParams, navigate]);

  if (status === 'error') {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--color-danger)' }}>Could not complete sign-in. Please try again.</p>
        <button type="button" className="auth-button" onClick={() => navigate('/login', { replace: true })}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container flex-center" style={{ minHeight: '60vh' }}>
      <p>Completing sign-in...</p>
    </div>
  );
};

export default AuthSuccess;
