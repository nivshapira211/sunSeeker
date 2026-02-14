import React, { useState } from 'react';
import { Heart, MessageCircle, MapPin, Clock, Share2, Info, Camera, Aperture, Eye } from 'lucide-react';
import type { Photo } from '../../data/mockFeed';

interface FeedCardProps {
    photo: Photo;
}

const FeedCard: React.FC<FeedCardProps> = ({ photo }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: 'var(--spacing-xl)',
            position: 'relative',
            transition: 'var(--transition-base)'
        }}>
            {/* Header */}
            <div style={{
                padding: 'var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10,
                position: 'relative',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <img
                        src={photo.user.avatar}
                        alt={photo.user.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }}
                    />
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{photo.user.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{photo.location}</p>
                    </div>
                </div>
                <div className="badge" style={{
                    background: photo.type === 'sunrise' ? 'rgba(255, 126, 95, 0.2)' : 'rgba(106, 5, 114, 0.2)',
                    border: `1px solid ${photo.type === 'sunrise' ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    color: photo.type === 'sunrise' ? 'var(--color-primary)' : '#d685e8'
                }}>
                    {photo.type}
                </div>
            </div>

            {/* Image Container */}
            <div style={{ position: 'relative', minHeight: '400px' }}>
                <img
                    src={photo.imageUrl}
                    alt={`${photo.type} at ${photo.location}`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        aspectRatio: '4/5',
                        display: 'block'
                    }}
                />

                {/* Overlay for Time & Location */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '40px var(--spacing-md) var(--spacing-md)',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'end'
                }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={16} color="var(--color-text-primary)" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{photo.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={16} color="var(--color-text-primary)" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{photo.date}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* EXIF Details Expandable Section */}
            {showDetails && (
                <div className="animate-fade-in" style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: 'var(--spacing-md)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--spacing-md)',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Camera size={16} />
                        <span>{photo.exif.camera}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Aperture size={16} />
                        <span>{photo.exif.aperture}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', border: '1px solid currentColor', borderRadius: '3px', padding: '0 2px' }}>ISO</span>
                        <span>{photo.exif.iso}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Eye size={16} />
                        <span>{photo.exif.shutter}</span>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div style={{ padding: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                    <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-primary)' }} className="glass-button-hover active-scale">
                        <Heart size={24} />
                        <span style={{ fontWeight: 600 }}>{photo.likes}</span>
                    </button>
                    <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-primary)' }} className="glass-button-hover active-scale">
                        <MessageCircle size={24} />
                        <span style={{ fontWeight: 600 }}>{photo.comments}</span>
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        style={{
                            background: showDetails ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            color: showDetails ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            transition: 'var(--transition-base)'
                        }}
                    >
                        <Info size={24} />
                    </button>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)' }} className="glass-button-hover active-scale">
                        <Share2 size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedCard;
