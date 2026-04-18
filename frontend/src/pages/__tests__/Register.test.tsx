import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Register from '../Register';

vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  socialLogin: vi.fn(),
  refreshToken: vi.fn(),
  updateProfile: vi.fn(),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form with all fields', () => {
    renderWithProviders(<Register />);
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password \(min\. 6 characters\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates required fields and email format', async () => {
    renderWithProviders(<Register />);
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user1' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByPlaceholderText(/password \(min\. 6 characters\)/i), {
      target: { value: 'password' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });
});
