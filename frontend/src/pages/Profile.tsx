import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Mail, Edit, Settings } from 'lucide-react';
import { getPostsByUserId } from '../services/postService'; // Import the service
import { type Photo } from '../data/mockFeed'; // Import the Photo type
import FeedCard from '../components/feed/FeedCard';
import './Profile.css';

const Profile: React.FC = () => {
    const { user, updateProfile, isLoading: authIsLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
    const [isEditing, setIsEditing] = useState(false);
    
    // State for profile edits
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // State for user's posts
    const [userPosts, setUserPosts] = useState<Photo[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    // Fetch user's posts when the component mounts or the user changes
    useEffect(() => {
        const fetchUserPosts = async () => {
            if (user) {
                setPostsLoading(true);
                try {
                    // The service currently returns the entire mock feed, let's filter it client-side
                    const allPosts = await getPostsByUserId(user.id);
                    setUserPosts(allPosts);
                } catch {
                    // Error state could be shown in UI
                } finally {
                    setPostsLoading(false);
                }
            }
        };
        fetchUserPosts();
    }, [user]);

    // Initialize edit form when the modal is opened
    useEffect(() => {
        if (isEditing && user) {
            setEditName(user.name);
            setEditAvatar(user.avatar);
        }
    }, [isEditing, user]);

    const handleSaveProfile = async () => {
        if (user && !isSaving) {
            setSaveError(null);
            setIsSaving(true);
            try {
                await updateProfile(editName, editAvatar);
                setIsEditing(false);
            } catch (err) {
                setSaveError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setEditAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    if (authIsLoading) {
        return <div className="container flex-center" style={{ minHeight: '60vh' }}>Loading profile...</div>;
    }

    if (!user) {
        return (
            <div className="container flex-center" style={{ minHeight: '60vh' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="profile-container container">
            <header className="profile-header-panel glass-panel">
                <div className="profile-bg-decorative"></div>
                <div className="profile-header-content">
                    <div className="profile-main-info">
                         <div className="profile-avatar-wrapper">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                alt={user.name}
                                className="profile-avatar"
                            />
                        </div>

                        <div className="profile-user-details">
                            <h1>{user.name}</h1>
                            <p className="username">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>
                            <p className="email flex-center" style={{ gap: 'var(--spacing-xs)' }}><Mail size={14} /> {user.email}</p>
                            <p className="profile-bio">
                                Sunrise chaser 🌅 | Photography enthusiast 📸 | Seeking the perfect light.
                            </p>
                            <div className="profile-meta">
                                <span className="profile-meta-item"><MapPin size={16} /> Global Nomad</span>
                                <span className="profile-meta-item"><Calendar size={16} /> Joined Jan 2026</span>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="glass-button glass-button-hover" onClick={() => setIsEditing(true)}>
                                <Edit size={16} /> Edit Profile
                            </button>
                            <button className="glass-button glass-button-hover" style={{ padding: '8px', borderRadius: '50%' }}>
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="profile-stats">
                        <div className="profile-stat-item">
                            <div className="stat-number text-gradient">{postsLoading ? '...' : userPosts.length}</div>
                            <div className="stat-label">Sunrises</div>
                        </div>
                        <div className="profile-stat-item">
                            <div className="stat-number text-gradient">1.2k</div>
                            <div className="stat-label">Followers</div>
                        </div>
                        <div className="profile-stat-item">
                            <div className="stat-number text-gradient">350</div>
                            <div className="stat-label">Following</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="profile-tabs">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`profile-tab ${activeTab === 'posts' ? 'active' : 'inactive'}`}
                >
                    My Sunrises
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`profile-tab ${activeTab === 'saved' ? 'active' : 'inactive'}`}
                >
                    Saved
                </button>
            </div>

            {postsLoading ? (
                <div className="flex-center" style={{ minHeight: '200px' }}>Loading posts...</div>
            ) : (
                <div className="grid-responsive">
                    {activeTab === 'posts' && userPosts.map((photo) => (
                        <FeedCard
                            key={photo.id}
                            photo={photo}
                            currentUserId={user?.id}
                            onDeleted={(id) => setUserPosts((prev) => prev.filter((p) => p.id !== id))}
                            onUpdated={(updated) => setUserPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
                        />
                    ))}
                    {activeTab === 'posts' && userPosts.length === 0 && (
                        <p>You haven't posted any sunrises yet.</p>
                    )}
                    {/* Add a section for saved posts if needed */}
                </div>
            )}

            {isEditing && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-panel glass-panel">
                        <h2>Edit Profile</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            {saveError && (
                        <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{saveError}</p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <img
                                    src={editAvatar || user.avatar}
                                    alt="Preview"
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <label className="glass-button glass-button-hover">
                                    Change Photo
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                </label>
                            </div>
                            <div>
                                <label htmlFor="edit-name">Display Name</label>
                                <input
                                    id="edit-name"
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="auth-input"
                                />
                            </div>
                             <div>
                                <label htmlFor="edit-email" style={{ color: 'var(--color-text-muted)' }}>Email (cannot be changed)</label>
                                <input
                                    id="edit-email"
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="auth-input"
                                    style={{ background: 'rgba(0,0,0,0.2)', cursor: 'not-allowed' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                <button onClick={() => setIsEditing(false)} className="glass-button glass-button-hover" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button onClick={handleSaveProfile} disabled={isSaving} className="auth-button" style={{ flex: 1 }}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
