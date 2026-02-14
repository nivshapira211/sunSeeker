import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Upload, MessageCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="glass-panel" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderRadius: 0,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none'
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '70px'
            }}>
                {/* Logo */}
                <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Sun className="text-gradient" size={28} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                        SunSeeker
                    </span>
                </NavLink>

                {/* Navigation Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? "text-gradient" : ""}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontWeight: 500, color: 'var(--color-text-primary)' }}
                    >
                        <Sun size={18} />
                        <span className="hidden-mobile">Feed</span>
                    </NavLink>

                    <NavLink
                        to="/assistant"
                        className={({ isActive }) => isActive ? "text-gradient" : ""}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontWeight: 500, color: 'var(--color-text-primary)' }}
                    >
                        <MessageCircle size={18} />
                        <span className="hidden-mobile">Assistant</span>
                    </NavLink>

                    <NavLink
                        to="/upload"
                        className={({ isActive }) => isActive ? "text-gradient" : ""}
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontWeight: 500, color: 'var(--color-text-primary)' }}
                    >
                        <Upload size={18} />
                        <span className="hidden-mobile">Upload</span>
                    </NavLink>
                </div>

                {/* Auth Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <NavLink to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', textDecoration: 'none', color: 'inherit' }}>
                                <span className="hidden-mobile" style={{ fontSize: '0.9rem' }}>{user.name}</span>
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-primary)' }}
                                />
                            </NavLink>
                            <button
                                onClick={logout}
                                style={{
                                    background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginLeft: 'var(--spacing-xs)'
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <NavLink to="/login" className="glass-button" style={{
                            padding: 'var(--spacing-xs) var(--spacing-md)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            fontSize: '0.9rem',
                            textDecoration: 'none'
                        }}>
                            <LogIn size={16} />
                            <span>Login</span>
                        </NavLink>
                    )}
                </div>
            </div>

            {/* Mobile styles inline for now, ideally in CSS module or index.css */}
            <style>{`
        @media (max-width: 600px) {
          .hidden-mobile {
            display: none;
          }
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
