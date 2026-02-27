import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  Share2,
  Info,
  Camera,
  Aperture,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import type { Photo } from '../../data/mockFeed';
import {
  updatePost,
  deletePost,
  toggleLike as toggleLikeService,
  getComments,
  addComment as addCommentService,
  type Comment,
} from '../../services/postService';
import { useAuth } from '../../context/AuthContext';

interface FeedCardProps {
  photo: Photo;
  currentUserId?: string | null;
  onDeleted?: (postId: string) => void;
  onUpdated?: (post: Photo) => void;
  onLikeChange?: (postId: string, likes: number) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({
  photo,
  currentUserId,
  onDeleted,
  onUpdated,
  onLikeChange,
}) => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCaption, setEditCaption] = useState(photo.caption ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(photo.likes);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const isOwner = Boolean(currentUserId && photo.user.id === currentUserId);

  useEffect(() => {
    setLikeCount(photo.likes);
  }, [photo.likes]);

  useEffect(() => {
    if (showCommentsModal) {
      setCommentsLoading(true);
      getComments(photo.id)
        .then(setComments)
        .finally(() => setCommentsLoading(false));
    }
  }, [showCommentsModal, photo.id]);

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const updated = await updatePost(photo.id, { caption: editCaption });
      onUpdated?.(updated);
      setIsEditOpen(false);
    } catch {
      // Error could be shown in modal
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setIsDeleting(true);
    try {
      await deletePost(photo.id);
      onDeleted?.(photo.id);
    } catch {
      // Error could be shown
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeClick = async () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    onLikeChange?.(photo.id, likeCount + (liked ? -1 : 1));
    try {
      const result = await toggleLikeService(photo.id);
      setLiked(result.liked);
      setLikeCount(result.likes);
      onLikeChange?.(photo.id, result.likes);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      onLikeChange?.(photo.id, prevCount);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setSubmittingComment(true);
    try {
      const newComment = await addCommentService(
        photo.id,
        commentText.trim(),
        user.id,
        user.name,
        user.avatar
      );
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <>
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: 'var(--spacing-xl)',
          position: 'relative',
          transition: 'var(--transition-base)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--spacing-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            position: 'relative',
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <img
              src={photo.user.avatar}
              alt={photo.user.name}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{photo.user.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                {photo.location}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditCaption(photo.caption ?? '');
                    setIsEditOpen(true);
                  }}
                  className="glass-button-hover"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                  }}
                  aria-label="Edit post"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="glass-button-hover"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-danger)',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                  }}
                  aria-label="Delete post"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <div
              className="badge"
              style={{
                background:
                  photo.type === 'sunrise'
                    ? 'rgba(255, 126, 95, 0.2)'
                    : 'rgba(106, 5, 114, 0.2)',
                border: `1px solid ${photo.type === 'sunrise' ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                color:
                  photo.type === 'sunrise' ? 'var(--color-primary)' : '#d685e8',
              }}
            >
              {photo.type}
            </div>
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
              display: 'block',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '40px var(--spacing-md) var(--spacing-md)',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'end',
            }}
          >
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

        {photo.caption && (
          <div
            style={{
              padding: '0 var(--spacing-md) var(--spacing-sm)',
              fontSize: '0.95rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            {photo.caption}
          </div>
        )}

        {/* EXIF Details Expandable Section */}
        {showDetails && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(0,0,0,0.3)',
              padding: 'var(--spacing-md)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-md)',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={16} />
              <span>{photo.exif.camera}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Aperture size={16} />
              <span>{photo.exif.aperture}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: '1px solid currentColor',
                  borderRadius: '3px',
                  padding: '0 2px',
                }}
              >
                ISO
              </span>
              <span>{photo.exif.iso}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} />
              <span>{photo.exif.shutter}</span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div
          style={{
            padding: 'var(--spacing-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
            <button
              type="button"
              onClick={handleLikeClick}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: liked ? 'var(--color-primary)' : 'var(--color-text-primary)',
              }}
              className="glass-button-hover active-scale"
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
              <span style={{ fontWeight: 600 }}>{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCommentsModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-text-primary)',
              }}
              className="glass-button-hover active-scale"
              aria-label="Comments"
            >
              <MessageCircle size={24} />
              <span style={{ fontWeight: 600 }}>{photo.comments}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button
              type="button"
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
                color: showDetails
                  ? 'var(--color-primary)'
                  : 'var(--color-text-primary)',
                transition: 'var(--transition-base)',
              }}
            >
              <Info size={24} />
            </button>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
              }}
              className="glass-button-hover active-scale"
            >
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <div
          className="edit-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          role="dialog"
          aria-label="Edit post"
        >
          <div
            className="glass-panel"
            style={{
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Edit post</h3>
            <label htmlFor="edit-caption" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
              Caption
            </label>
            <textarea
              id="edit-caption"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="auth-input"
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-lg)',
              }}
            >
              <button
                type="button"
                className="glass-button glass-button-hover"
                style={{ flex: 1 }}
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="auth-button"
                style={{ flex: 1 }}
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCommentsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          role="dialog"
          aria-label="Comments"
        >
          <div
            className="glass-panel"
            style={{
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '420px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3>Comments</h3>
              <button
                type="button"
                onClick={() => setShowCommentsModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '4px' }}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            {commentsLoading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading comments...</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 'var(--spacing-lg)' }}>
                {comments.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      padding: 'var(--spacing-sm) 0',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <strong style={{ fontSize: '0.9rem' }}>{c.userName}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{c.text}</p>
                  </li>
                ))}
                {comments.length === 0 && !commentsLoading && (
                  <li style={{ color: 'var(--color-text-muted)', padding: 'var(--spacing-md) 0' }}>No comments yet.</li>
                )}
              </ul>
            )}
            {user && (
              <form onSubmit={handleAddComment}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="auth-input"
                  rows={2}
                  style={{ width: '100%', resize: 'vertical', marginBottom: 'var(--spacing-sm)' }}
                />
                <button type="submit" className="auth-button" disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? 'Sending...' : 'Post comment'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedCard;
