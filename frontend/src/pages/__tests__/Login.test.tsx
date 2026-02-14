import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../Login';
import * as authService from '../../services/authService';

jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  socialLogin: jest.fn(),
  refreshToken: jest.fn(),
  updateProfile: jest.fn(),
}));

const mockLogin = authService.login as jest.Mock;

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
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  test('renders login form correctly', () => {
    renderWithProviders(<Login />);

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account?/i)).toBeInTheDocument();
  });

  test('shows an error message for invalid credentials', async () => {
    const errorMessage = 'Invalid username or password';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  test('successfully logs in and stores the token', async () => {
    const user = { id: '1', name: 'Test User', email: 'test@example.com', avatar: undefined };
    const token = 'fake-jwt-token';
    const refreshToken = 'fake-refresh-token';
    mockLogin.mockResolvedValue({ user, token, refreshToken });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'test' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByLabelText(/keep me logged in/i));
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test', 'password');
    });

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe(token);
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    });
  });

  test('validates form fields before submission', async () => {
    renderWithProviders(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
