import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Chrome, Facebook } from 'lucide-react';
import './Auth.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validateForm = () => {
        if (!username.trim()) {
            setError('Username is required.');
            return false;
        }
        if (!password) {
            setError('Password is required.');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        try {
            await login(username, password, keepLoggedIn);
            navigate('/');
        } catch (err) {
            setError((err as Error).message || 'Login failed. Please check your credentials.');
            console.error('Login failed', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel">
                <div className="auth-header">
                    <h2 className="text-gradient">Welcome Back</h2>
                    <p>Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {error && <p style={{ color: 'var(--color-danger)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                    
                    <div className="input-group">
                        <User size={18} className="input-icon" />
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="auth-input"
                        />
                    </div>

                    <div className="auth-options">
                        <div className="checkbox-group">
                            <input type="checkbox" id="keep-logged-in" checked={keepLoggedIn} onChange={(e) => setKeepLoggedIn(e.target.checked)} />
                            <label htmlFor="keep-logged-in">Keep me logged in</label>
                        </div>
                        <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="auth-button hover-brightness"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="divider">Or continue with</div>

                <div className="social-login">
                    <button className="social-button">
                        <Chrome size={20} />
                        <span>Google</span>
                    </button>
                    <button className="social-button">
                        <Facebook size={20} />
                        <span>Facebook</span>
                    </button>
                </div>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
