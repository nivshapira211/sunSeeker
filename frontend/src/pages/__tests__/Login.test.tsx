import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../Login';

// Mock the auth service
jest.mock('../../services/authService', () => ({
    login: jest.fn(),
}));

// Mock the useAuth hook to provide a mock implementation
const mockLogin = jest.fn();
jest.mock('../../context/AuthContext', () => ({
    ...jest.requireActual('../../context/AuthContext'),
    useAuth: () => ({
        login: mockLogin,
    }),
}));

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        // Clear mock history before each test
        jest.clearAllMocks();
    });

    test('renders login form correctly', () => {
        renderWithProviders(<Login />);

        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByText(/don't have an account?/i)).toBeInTheDocument();
    });

    test('shows an error message for invalid credentials', async () => {
        // Arrange
        const errorMessage = 'Invalid username or password';
        mockLogin.mockRejectedValue(new Error(errorMessage));
        
        renderWithProviders(<Login />);
        
        // Act
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wronguser' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
        expect(window.localStorage.getItem('authToken')).toBeNull();
    });

    test('successfully logs in and stores the token', async () => {
        // Arrange
        const user = { id: '1', name: 'Test User', email: 'test@example.com' };
        const token = 'fake-token';
        const keepLoggedIn = true;

        // Mock the login function to resolve successfully
        mockLogin.mockResolvedValue({ user, token, keepLoggedIn });

        renderWithProviders(<Login />);

        // Act
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'test' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
        fireEvent.click(screen.getByLabelText(/keep me logged in/i));
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert
        await waitFor(() => {
            // Check if login function was called with correct arguments
            expect(mockLogin).toHaveBeenCalledWith('test', 'password', true);
        });

    });

    test('validates form fields before submission', async () => {
        renderWithProviders(<Login />);

        // Click sign-in without filling out the form
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Assert that an error message is shown
        await waitFor(() => {
            expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        });

        // Fill in username but not password
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
    });
});
