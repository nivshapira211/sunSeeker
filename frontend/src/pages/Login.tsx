import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '80vh' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Email Adress</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="hover-brightness"
                        style={{
                            marginTop: 'var(--spacing-md)',
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: 'var(--gradient-sunset)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
