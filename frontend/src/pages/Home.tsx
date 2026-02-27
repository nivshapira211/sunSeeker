import React, { useState, useEffect, useCallback } from 'react';
import FeedCard from '../components/feed/FeedCard';
import { getFeed } from '../services/postService';
import type { Photo } from '../data/mockFeed';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (pageNum: number, append: boolean) => {
    setError(null);
    try {
      const { posts: nextPosts, hasMore: nextHasMore } = await getFeed(pageNum);
      setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
      setHasMore(nextHasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPage(1, false);
  }, [loadPage]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage, true);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updated: Photo) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1 className="text-gradient">Sunrise & Sunset Feed</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-md)' }}>
          Discover beautiful moments from around the world.
        </p>
      </div>

      {error && (
        <p style={{ color: 'var(--color-danger)', textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
          {error}
        </p>
      )}

      <div
        className="grid-responsive"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xl)',
        }}
      >
        {posts.map((photo) => (
          <FeedCard
            key={photo.id}
            photo={photo}
            currentUserId={user?.id}
            onDeleted={handlePostDeleted}
            onUpdated={handlePostUpdated}
          />
        ))}
      </div>

      {loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
          Loading...
        </div>
      )}

      {hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', margin: 'var(--spacing-xl) 0' }}>
          <button
            type="button"
            className="glass-button glass-button-hover"
            onClick={loadMore}
            disabled={loading}
            style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', margin: 'var(--spacing-2xl) 0', color: 'var(--color-text-muted)' }}>
          <p>You&apos;ve reached the end for now.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
