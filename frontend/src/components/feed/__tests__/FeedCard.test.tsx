import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FeedCard from '../FeedCard';
import { useAuth } from '../../../context/AuthContext';
import * as postService from '../../../services/postService';
import { mockFeedData } from '../../../data/mockFeed';

jest.mock('../../../context/AuthContext');
jest.mock('../../../services/postService');

const mockUseAuth = useAuth as jest.Mock;
const mockGetComments = postService.getComments as jest.Mock;

const photo = mockFeedData[0];

describe('FeedCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'u1', name: 'Test', avatar: '' } });
    mockGetComments.mockResolvedValue([]);
  });

  it('opens comments view when comment button is clicked', async () => {
    render(
      <BrowserRouter>
        <FeedCard photo={photo} currentUserId="u1" />
      </BrowserRouter>
    );

    const commentButton = screen.getByRole('button', { name: /comments/i });
    fireEvent.click(commentButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /comments/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: /comments/i })).toBeInTheDocument();
  });
});
