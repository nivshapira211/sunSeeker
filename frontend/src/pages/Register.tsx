import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, FileImage } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { register } = useAuth();

    const validateForm = (): boolean => {
        if (!username.trim() || !email.trim() || !password) {
            setError('Please fill in all required fields.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        if (password !== confirmPassword) {
            setError("Passwords don't match.");
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
            await register(username, email, password, profilePic);
            // Optionally, show a success message before navigating
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            setError((err as Error).message || 'Registration failed. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel" style={{ maxWidth: '450px' }}>
                <div className="auth-header">
                    <h2 className="text-gradient">Join SunSeeker</h2>
                    <p>Begin your sunrise chasing journey</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {error && <p style={{ color: 'var(--color-danger)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                    <div className="input-group">
                        <User size={18} className="input-icon" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="auth-input"
                        />
                    </div>
                    
                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password (min. 6 characters)"
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="profile-pic" className="file-input-label">
                            <FileImage size={18} />
                            <span>
                                {profilePic ? profilePic.name : 'Upload Profile Picture (Optional)'}
                            </span>
                        </label>
                        <input
                            id="profile-pic"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="auth-button hover-brightness"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
