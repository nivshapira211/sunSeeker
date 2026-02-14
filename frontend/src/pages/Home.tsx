import React from 'react';
import FeedCard from '../components/feed/FeedCard';
import { mockFeedData } from '../data/mockFeed';

const Home: React.FC = () => {
  return (
    <div className="container" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1 className="text-gradient">Sunrise & Sunset Feed</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-md)' }}>
          Discover beautiful moments from around the world.
        </p>
      </div>

      <div className="grid-responsive" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
        {mockFeedData.map(photo => (
          <FeedCard key={photo.id} photo={photo} />
        ))}
      </div>

      {/* Loading Sentinel / Infinite Scroll Placeholder */}
      <div style={{ textAlign: 'center', margin: 'var(--spacing-2xl) 0', color: 'var(--color-text-muted)' }}>
        <p>You've reached the end for now.</p>
      </div>
    </div>
  );
};

export default Home;
