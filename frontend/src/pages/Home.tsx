import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import FeedCard from '../components/feed/FeedCard';
import { getFeed, semanticSearch } from '../services/postService';
import type { Photo } from '../data/mockFeed';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Semantic search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Photo[] | null>(null);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadPage = useCallback(async (pageNum: number, append: boolean) => {
    setError(null);
    try {
      const { posts: nextPosts, hasMore: nextHasMore } = await getFeed(pageNum, user?.id);
      setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
      setHasMore(nextHasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    loadPage(1, false);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage, true);
  }, [loading, hasMore, page, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !loading) loadMore();
      },
      { rootMargin: '100px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (searchResults) {
      setSearchResults((prev) => prev?.filter((p) => p.id !== postId) ?? null);
    }
  };

  const handlePostUpdated = (updated: Photo) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (searchResults) {
      setSearchResults((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? null);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const results = await semanticSearch(query.trim(), user?.id);
      setSearchResults(results);
    } catch (err) {
      setError('Semantic search failed. Try again.');
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  }, [user?.id]);

  const onSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => handleSearch(value), 600);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const displayPosts = searchResults ?? posts;
  const isSearchMode = searchResults !== null;

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1 className="text-gradient">Sunrise & Sunset Feed</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-md)' }}>
          Discover beautiful moments from around the world.
        </p>
      </div>

      {/* Semantic Search Bar */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto var(--spacing-xl)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Sparkles
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              color: 'var(--color-primary)',
              zIndex: 1,
            }}
          />
          <input
            type="text"
            placeholder="AI Search — try 'golden hour over the ocean' or 'dramatic clouds'..."
            value={searchQuery}
            onChange={(e) => onSearchInputChange(e.target.value)}
            className="glass-input"
            style={{
              width: '100%',
              padding: '14px 44px 14px 44px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-lg)',
              color: 'white',
              fontSize: '1rem',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                handleSearch(searchQuery);
              }
            }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
        {isSearchMode && !searching && (
          <div
            style={{
              marginTop: '8px',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Search size={14} />
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </div>
        )}
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
        {displayPosts.map((photo) => (
          <FeedCard
            key={photo.id}
            photo={photo}
            currentUserId={user?.id}
            onDeleted={handlePostDeleted}
            onUpdated={handlePostUpdated}
          />
        ))}
      </div>

      {!isSearchMode && hasMore && posts.length > 0 && <div ref={sentinelRef} style={{ height: 1, minHeight: 1 }} aria-hidden="true" />}

      {(loading || searching) && displayPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
          {searching ? 'Searching with AI...' : 'Loading...'}
        </div>
      )}

      {searching && displayPosts.length > 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--color-text-muted)' }}>
          Searching with AI...
        </div>
      )}

      {!isSearchMode && loading && posts.length > 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--color-text-muted)' }}>
          Loading more...
        </div>
      )}

      {!loading && !searching && displayPosts.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-secondary)' }}>
          <p>{isSearchMode ? 'No matching posts found. Try a different query!' : 'No posts yet. Share a sunrise or sunset!'}</p>
        </div>
      )}

      {!isSearchMode && !hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', margin: 'var(--spacing-2xl) 0', color: 'var(--color-text-muted)' }}>
          <p>You&apos;ve reached the end for now.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
