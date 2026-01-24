import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Heart, MessageCircle, Share2, Settings, Edit } from 'lucide-react';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

    // Mock data for posts
    const mockPosts = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        image: `https://source.unsplash.com/random/800x800?sunset,sunrise&sig=${i}`,
        location: ['Malibu, CA', 'Santorini, Greece', 'Kyoto, Japan', 'Cape Town, SA', 'Maui, HI', 'Bali, Indonesia'][i],
        date: '2 hours ago',
        likes: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 50) + 5
    }));

    if (!user) {
        return (
            <div className="container flex-center" style={{ minHeight: '60vh' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
            {/* Profile Header */}
            <div className="glass-panel" style={{
                marginTop: 'var(--spacing-xl)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decorative element */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(255,126,95,0.1) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>

                <div className="profile-header-content" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

                    {/* Top Row: Avatar & Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--spacing-lg)' }}>
                        {/* Avatar */}
                        <div style={{
                            position: 'relative',
                            padding: '4px',
                            background: 'var(--gradient-sunset)',
                            borderRadius: '50%'
                        }}>
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=FF7E5F&color=fff`}
                                alt={user.name}
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    border: '4px solid var(--color-bg-card)',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                        </div>

                        {/* User Info */}
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>{user.name}</h1>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>@{user.name.toLowerCase().replace(/\s+/g, '')}</p>

                            <p style={{ maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                                Values sunrise chaser 🌅 | Photography enthusiast 📸 | Seeking the perfect light everywhere I go.
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--spacing-md)',
                                marginTop: 'var(--spacing-md)',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.9rem'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={16} /> Global Nomad
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={16} /> Joined Jan 2026
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <button className="glass-button glass-button-hover" style={{
                                padding: '8px 24px',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Edit size={16} /> Edit Profile
                            </button>
                            <button className="glass-button glass-button-hover" style={{
                                padding: '8px',
                                borderRadius: '50%'
                            }}>
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 'var(--spacing-2xl)',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: 'var(--spacing-lg)',
                        marginTop: 'var(--spacing-sm)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>42</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Sunrises</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>1.2k</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Followers</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>350</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Following</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div style={{
                marginTop: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-lg)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: 'var(--spacing-xl)'
            }}>
                <button
                    onClick={() => setActiveTab('posts')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: 'var(--spacing-md) 0',
                        color: activeTab === 'posts' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        borderBottom: activeTab === 'posts' ? '2px solid var(--color-accent)' : '2px solid transparent',
                        fontWeight: 500,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    My Sunrises
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: 'var(--spacing-md) 0',
                        color: activeTab === 'saved' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        borderBottom: activeTab === 'saved' ? '2px solid var(--color-accent)' : '2px solid transparent',
                        fontWeight: 500,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Saved
                </button>
            </div>

            {/* Posts Grid */}
            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
                {mockPosts.map((post) => (
                    <div key={post.id} className="glass-panel" style={{
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ position: 'relative', paddingTop: '100%' }}>
                            <img
                                src={post.image}
                                alt="Sunrise"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(4px)',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                color: 'white'
                            }}>
                                <Share2 size={12} />
                            </div>
                        </div>
                        <div style={{ padding: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{post.location}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                <span>{post.date}</span>
                                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Heart size={14} /> {post.likes}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MessageCircle size={14} /> {post.comments}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
