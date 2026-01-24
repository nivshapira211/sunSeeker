import React from 'react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
    return (
        <div className="container flex-center" style={{ minHeight: '80vh' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Join SunSeeker</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Begin your sunrise chasing journey</p>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        className="text-gradient"
                        style={{
                            marginTop: 'var(--spacing-md)',
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: 'var(--gradient-sunset)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Create Account
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
