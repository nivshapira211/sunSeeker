import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import * as postService from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { mockFeedData } from '../../data/mockFeed';

vi.mock('../../services/postService');
vi.mock('../../context/AuthContext');

const mockUseAuth = useAuth as any;
const mockGetFeed = postService.getFeed as any;

const mockUser = {
  id: 'u1',
  name: 'Elena K.',
  email: 'elena@example.com',
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Home Component (Main Feed)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
  });

  it('renders 10 posts from a mocked API response', async () => {
    const largerMockFeed = Array.from({ length: 10 }, (_, i) => ({
      ...mockFeedData[0],
      id: `post-${i}`,
      location: `Location ${i}`,
    }));

    mockGetFeed.mockResolvedValue({ posts: largerMockFeed, hasMore: true });

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(mockGetFeed).toHaveBeenCalledWith(1, 'u1');
    });

    await screen.findByText('Location 0');
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`Location ${i}`)).toBeInTheDocument();
    }
  });

  it('loads more posts when scrolling to bottom', async () => {
    const firstPage = mockFeedData.slice(0, 2);
    const secondPage = mockFeedData.slice(2, 4);

    let observerCallback: any;
    window.IntersectionObserver = class {
      constructor(cb: any) {
        observerCallback = cb;
      }
      observe() { }
      unobserve() { }
      disconnect() { }
    } as any;

    mockGetFeed.mockImplementation(async (pageNumber: number) => {
      if (pageNumber === 1) return { posts: firstPage, hasMore: true };
      return { posts: secondPage, hasMore: false };
    });

    renderWithProviders(<Home />);

    await screen.findByText(firstPage[0].location);
    expect(screen.getByText(firstPage[1].location)).toBeInTheDocument();

    // Simulate scrolling into view
    await act(async () => {
      observerCallback([{ isIntersecting: true }]);
    });

    await waitFor(() => {
      expect(mockGetFeed).toHaveBeenCalledWith(2, 'u1');
    });

    await screen.findByText(secondPage[0].location);
    expect(screen.getByText(secondPage[1].location)).toBeInTheDocument();
  });

  it('allows an author to delete their own post', async () => {
    const userPosts = mockFeedData.filter((p) => p.user.id === mockUser.id);
    mockGetFeed.mockResolvedValue({ posts: userPosts, hasMore: false });

    const mockDeletePost = postService.deletePost as any;
    mockDeletePost.mockResolvedValue(undefined);

    window.confirm = vi.fn(() => true);

    renderWithProviders(<Home />);

    const postToDelete = userPosts[0];
    await screen.findByText(postToDelete.location);

    const deleteButton = screen.getByRole('button', { name: /delete post/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeletePost).toHaveBeenCalledWith(postToDelete.id);
      expect(screen.queryByText(postToDelete.location)).not.toBeInTheDocument();
    });
  });
});
