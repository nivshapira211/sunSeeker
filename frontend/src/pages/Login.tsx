import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login: React.FC = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!emailOrUsername.trim() || !password) {
            setError('Please enter your email or username and password.');
            return;
        }

        setIsLoading(true);
        try {
            await login(emailOrUsername.trim(), password);
            navigate('/');
        } catch (err) {
            setError((err as Error).message || 'Sign in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel" style={{ maxWidth: '420px' }}>
                <div className="auth-header">
                    <h2 className="text-gradient">Welcome Back</h2>
                    <p>Sign in to continue your journey</p>
                </div>

                <div className="social-login" style={{ marginBottom: '1rem' }}>
                    <button
                        type="button"
                        className="social-button"
                        onClick={loginWithGoogle}
                        style={{ flex: 1 }}
                    >
                        <Chrome size={20} />
                        <span>Sign in with Google</span>
                    </button>
                </div>

                <div className="divider">Or</div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {error && (
                        <p style={{ color: 'var(--color-danger)', textAlign: 'center', marginBottom: 0 }}>
                            {error}
                        </p>
                    )}

                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="text"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            placeholder="Email or username"
                            autoComplete="username"
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                            className="auth-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="auth-button hover-brightness"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account? <Link to="/register" className="auth-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
