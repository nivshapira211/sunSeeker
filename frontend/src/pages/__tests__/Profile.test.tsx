import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Profile from '../Profile';
import * as postService from '../../services/postService';
import { mockFeedData, type Photo } from '../../data/mockFeed';

// Mock services
jest.mock('../../services/postService');
jest.mock('../../context/AuthContext');

const mockUseAuth = useAuth as jest.Mock;
const mockGetPostsByUserId = postService.getPostsByUserId as jest.Mock;

const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
};

const renderWithProviders = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Profile Component', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        
        // Setup default mock implementations
        mockUseAuth.mockReturnValue({
            user: mockUser,
            updateProfile: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
        });

        mockGetPostsByUserId.mockResolvedValue(mockFeedData.filter((p: Photo) => p.user.id === mockUser.id));
    });

    it('renders user information correctly', async () => {
        renderWithProviders(<Profile />);

        await waitFor(() => {
            expect(screen.getByText(mockUser.name)).toBeInTheDocument();
            expect(screen.getByText(mockUser.email)).toBeInTheDocument();
            expect(screen.getByAltText(mockUser.name)).toHaveAttribute('src', mockUser.avatar);
        });
    });

    it('fetches and displays user posts', async () => {
        renderWithProviders(<Profile />);

        await waitFor(() => {
            // Check if the service function was called
            expect(mockGetPostsByUserId).toHaveBeenCalledWith(mockUser.id);
        });
        
        // Check if posts are rendered
        // This assumes your FeedCard component renders something identifiable, like the location
        const userPosts = mockFeedData.filter((p: Photo) => p.user.id === mockUser.id);
        for (const post of userPosts) {
            await screen.findByText(post.location);
        }
    });

    it('opens the edit modal and allows editing', async () => {
        renderWithProviders(<Profile />);

        // Open modal
        fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
        
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /edit profile/i })).toBeInTheDocument();
        });

        // Edit fields
        const newName = 'Updated User';
        fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: newName } });
        
        // Save changes
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            // Check if updateProfile was called with the new data
            expect(useAuth().updateProfile).toHaveBeenCalledWith(newName, mockUser.avatar);
            // Check if the modal is closed
            expect(screen.queryByRole('heading', { name: /edit profile/i })).not.toBeInTheDocument();
        });
    });

    it('shows a message if the user has no posts', async () => {
        // Arrange
        mockGetPostsByUserId.mockResolvedValue([]); // Mock response with no posts

        renderWithProviders(<Profile />);

        await waitFor(() => {
            expect(screen.getByText(/you haven't posted any sunrises yet/i)).toBeInTheDocument();
        });
    });

    it('displays a login prompt if the user is not authenticated', () => {
        // Arrange
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
        });

        renderWithProviders(<Profile />);

        expect(screen.getByText(/please log in to view your profile/i)).toBeInTheDocument();
    });
});
