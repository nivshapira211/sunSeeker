import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, X, Calendar, Clock, Sparkles, Sun, Sunset } from 'lucide-react';
import LocationPicker, { type LocationPickerValue } from '../components/LocationPicker';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createPost } from '../services/postService';
import { getCaptionSuggestion } from '../services/recommendationService';
import { request } from '../services/api';

const inputStyle = {
  width: '100%' as const,
  padding: '10px 10px 10px 40px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 'var(--radius-md)',
  color: 'white',
};

const Upload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestingCaption, setIsSuggestingCaption] = useState(false);
  const [postType, setPostType] = useState<'sunrise' | 'sunset'>('sunrise');
  const [isDetectingType, setIsDetectingType] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

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
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-detect sunrise/sunset type via AI
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsDetectingType(true);
      setError('');
      const formData = new FormData();
      formData.append('image', file);
      request<{ type: 'sunrise' | 'sunset' | 'unknown' }>('/posts/detect-type', {
        method: 'POST',
        body: formData,
        token,
      })
        .then((data) => {
          if (data.type === 'sunrise' || data.type === 'sunset') {
            setPostType(data.type);
          } else {
            // Reject non-sunrise/sunset images immediately
            setError('Only sunrise or sunset photos are allowed. Please upload a valid image.');
            setSelectedFile(null);
            if (url) URL.revokeObjectURL(url);
            setPreviewUrl(null);
          }
        })
        .catch(() => { })
        .finally(() => setIsDetectingType(false));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSuggestCaption = async () => {
    setError('');
    setIsSuggestingCaption(true);
    try {
      const suggestion = await getCaptionSuggestion({
        location: location || undefined,
        type: 'sunrise',
        image: selectedFile || undefined,
      });
      const isUnavailable = /unavailable|rate limit|quota/i.test(suggestion);
      if (isUnavailable) {
        showToast(suggestion);
      } else if (suggestion) {
        setCaption(suggestion);
      }
    } catch {
      const msg = 'Could not get suggestion. Try again.';
      setError(msg);
      showToast(msg);
    } finally {
      setIsSuggestingCaption(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!caption.trim()) {
      setError('Caption is required.');
      return;
    }
    if (!selectedFile) {
      setError('Please select an image.');
      return;
    }
    if (!user) {
      setError('Please log in to create a post.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createPost({
        text: caption.trim(),
        image: selectedFile,
        location: location || 'Unknown',
        coordinates,
        date: date || new Date().toLocaleDateString(),
        time: time || '00:00',
        type: postType,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl) 0', maxWidth: '800px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Please log in to share a moment.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl) 0', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 className="text-gradient">Share Your Moment</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
          Upload your photo to inspire others.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
        <form onSubmit={handleSubmit} onDragEnter={handleDrag}>
          {error && (
            <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>
          )}

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
                gap: 'var(--spacing-md)',
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
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-primary)',
                }}
              >
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
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                minHeight: '300px',
                background: '#000',
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  maxHeight: '500px',
                  display: 'block',
                }}
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
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
          )}
          {/* Type Toggle */}
          {previewUrl && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                }}
              >
                Type {isDetectingType && <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>(AI detecting...)</span>}
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPostType('sunrise')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: postType === 'sunrise' ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                    background: postType === 'sunrise' ? 'rgba(255,126,95,0.15)' : 'rgba(255,255,255,0.05)',
                    color: postType === 'sunrise' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontWeight: postType === 'sunrise' ? 600 : 400,
                    transition: 'var(--transition-base)',
                  }}
                >
                  <Sun size={20} />
                  Sunrise
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('sunset')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: postType === 'sunset' ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
                    background: postType === 'sunset' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                    color: postType === 'sunset' ? '#f97316' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontWeight: postType === 'sunset' ? 600 : 400,
                    transition: 'var(--transition-base)',
                  }}
                >
                  <Sunset size={20} />
                  Sunset
                </button>
              </div>
            </div>
          )}

          {/* Metadata Form */}
          <div style={{ marginTop: 'var(--spacing-xl)', display: 'grid', gap: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem',
                  }}
                >
                  Caption (required)
                </label>
                <button
                  type="button"
                  onClick={handleSuggestCaption}
                  disabled={isSuggestingCaption}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--color-primary)',
                    cursor: isSuggestingCaption ? 'not-allowed' : 'pointer',
                    opacity: isSuggestingCaption ? 0.7 : 1,
                  }}
                >
                  <Sparkles size={16} />
                  {isSuggestingCaption ? 'Suggesting...' : 'Suggest with AI'}
                </button>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your moment..."
                required
                className="auth-input"
                rows={3}
                style={{ width: '100%', resize: 'vertical', padding: '10px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem',
                  }}
                >
                  Date
                </label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <Calendar
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                    }}
                  />
                  <input
                    type="date"
                    className="glass-input"
                    style={inputStyle}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem',
                  }}
                >
                  Time
                </label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <Clock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                    }}
                  />
                  <input
                    type="time"
                    className="glass-input"
                    style={inputStyle}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                }}
              >
                Location
              </label>
              <LocationPicker
                value={location ? { location, coordinates } : undefined}
                onChange={(val: LocationPickerValue) => {
                  setLocation(val.location);
                  setCoordinates(val.coordinates);
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
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
                width: '100%',
              }}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Moment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
