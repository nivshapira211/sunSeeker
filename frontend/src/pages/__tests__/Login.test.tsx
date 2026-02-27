import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockSocialLogin = authService.socialLogin as jest.Mock;
const mockNavigate = useNavigate as jest.Mock;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component (Google Only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockReturnValue(jest.fn());
  });

  test('renders Google login correctly', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Username')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('••••••••')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/keep me logged in/i)).not.toBeInTheDocument();
  });

  test('successfully logs in via Google and stores the token', async () => {
    const user = { id: '1', name: 'Google User', email: 'google@example.com', avatar: undefined };
    const token = 'fake-google-token';
    const refreshToken = 'fake-google-refresh-token';
    const mockNav = jest.fn();
    mockNavigate.mockReturnValue(mockNav);
    mockSocialLogin.mockResolvedValue({ user, token, refreshToken });

    renderWithProviders(<Login />);

    fireEvent.click(screen.getByText(/continue with google/i));

    await waitFor(() => {
      expect(mockSocialLogin).toHaveBeenCalledWith('google');
    });

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe(token);
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    });
    
    expect(mockNav).toHaveBeenCalledWith('/');
  });

  test('shows an error message when Google login fails', async () => {
    const errorMessage = 'Google login failed.';
    mockSocialLogin.mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<Login />);

    fireEvent.click(screen.getByText(/continue with google/i));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});
