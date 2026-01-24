import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, X, MapPin, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Upload: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    // const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const removeFile = () => {
        // setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock upload
        setTimeout(() => {
            navigate('/');
        }, 1000);
    }

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) 0', maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h1 className="text-gradient">Share Your Moment</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                    Upload your sunrise or sunset photo to inspire others.
                </p>
            </div>

            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
                <form onSubmit={handleSubmit} onDragEnter={handleDrag}>

                    {/* File Drop Zone */}
                    {!previewUrl ? (
                        <div
                            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            style={{
                                border: '2px dashed',
                                borderColor: dragActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-2xl)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: dragActive ? 'rgba(255, 126, 95, 0.1)' : 'rgba(0,0,0,0.2)',
                                transition: 'var(--transition-base)',
                                minHeight: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--spacing-md)'
                            }}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                id="input-file-upload"
                                multiple={false}
                                onChange={handleChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)'
                            }}>
                                <UploadIcon size={32} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Drag and drop your image here</p>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                                    or click to browse from your device
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: '300px', background: '#000' }}>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '500px', display: 'block' }}
                            />
                            <button
                                type="button"
                                onClick={removeFile}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: 'none',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {/* Metadata Form */}
                    <div style={{ marginTop: 'var(--spacing-xl)', display: 'grid', gap: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Date</label>
                                <div className="input-with-icon" style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                    <input type="date" className="glass-input" style={{ width: '100%', padding: '10px 10px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Time</label>
                                <div className="input-with-icon" style={{ position: 'relative' }}>
                                    <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                    <input type="time" className="glass-input" style={{ width: '100%', padding: '10px 10px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Location</label>
                            <div className="input-with-icon" style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input type="text" placeholder="e.g. Haleakalā, Maui" className="glass-input" style={{ width: '100%', padding: '10px 10px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Type</label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="radio" name="type" value="sunrise" defaultChecked />
                                    <span>Sunrise</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="radio" name="type" value="sunset" />
                                    <span>Sunset</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="hover-brightness"
                            style={{
                                marginTop: 'var(--spacing-md)',
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: 'var(--gradient-sunset)',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Publish Moment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Upload;
