import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Profile from '../Profile';
import * as postService from '../../services/postService';
import * as authService from '../../services/authService';
import { mockFeedData, type Photo } from '../../data/mockFeed';

jest.mock('../../services/postService');
jest.mock('../../services/authService');

const mockGetPostsByUserId = postService.getPostsByUserId as jest.Mock;
const mockUpdateProfile = authService.updateProfile as jest.Mock;

const mockUser = {
  id: 'u1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mockUpdateProfile.mockResolvedValue({ id: mockUser.id, name: mockUser.name, avatar: mockUser.avatar });
    mockGetPostsByUserId.mockResolvedValue(mockFeedData.filter((p: Photo) => p.user.id === mockUser.id));
  });

  it('renders user information correctly when logged in', async () => {
    localStorage.setItem('authToken', 'token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByAltText(mockUser.name)).toHaveAttribute('src', mockUser.avatar);
    });
  });

  it('fetches and displays user posts', async () => {
    localStorage.setItem('authToken', 'token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(mockGetPostsByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    const userPosts = mockFeedData.filter((p: Photo) => p.user.id === mockUser.id);
    for (const post of userPosts) {
      await screen.findByText(post.location);
    }
  });

  it('sends PATCH with updated name and avatar when Save is clicked', async () => {
    localStorage.setItem('authToken', 'token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    mockUpdateProfile.mockResolvedValue({
      id: mockUser.id,
      name: 'Updated User',
      avatar: 'https://example.com/new-avatar.jpg',
    });

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit profile/i })).toBeInTheDocument();
    });

    const newName = 'Updated User';
    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: newName } });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser.id, {
        name: newName,
        avatar: mockUser.avatar,
      });
    });
  });

  it('shows a message if the user has no posts', async () => {
    localStorage.setItem('authToken', 'token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    mockGetPostsByUserId.mockResolvedValue([]);

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/you haven't posted any sunrises yet/i)).toBeInTheDocument();
    });
  });

  it('displays a login prompt if the user is not authenticated', () => {
    renderWithProviders(<Profile />);

    expect(screen.getByText(/please log in to view your profile/i)).toBeInTheDocument();
  });
});
