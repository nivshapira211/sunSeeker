import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { Chrome } from 'lucide-react';
import './Auth.css';

const Login: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await authService.socialLogin('google');
            // Defaulting to localStorage for persistence
            localStorage.setItem('authToken', res.token);
            localStorage.setItem('refreshToken', res.refreshToken);
            localStorage.setItem('user', JSON.stringify(res.user));
            navigate('/');
        } catch (err) {
            setError((err as Error).message || 'Google login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel">
                <div className="auth-header">
                    <h2 className="text-gradient">Welcome to SunSeeker</h2>
                    <p>Connect with your Google account to continue</p>
                </div>

                {error && (
                    <p className="error-message" style={{ color: 'var(--color-danger)', textAlign: 'center', marginBottom: '1rem' }}>
                        {error}
                    </p>
                )}

                <div className="social-login" style={{ marginTop: '2rem' }}>
                    <button
                        type="button"
                        className="social-button google-only-button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        style={{ width: '100%', justifyContent: 'center', gap: '1rem', padding: '1rem' }}
                    >
                        <Chrome size={24} />
                        <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
                    </button>
                </div>

                <p className="auth-footer" style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default Login;
