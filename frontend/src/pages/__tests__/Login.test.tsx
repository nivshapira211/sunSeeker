import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Login from '../Login';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal: any) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Login Component', () => {
  const mockLogin = vi.fn();
  const mockLoginWithGoogle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('renders Google login correctly', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
  });

  test('calls loginWithGoogle when Google button is clicked', () => {
    renderWithProviders(<Login />);
    fireEvent.click(screen.getByText(/sign in with google/i));
    expect(mockLoginWithGoogle).toHaveBeenCalled();
  });

  test('calls normal login with email and password', async () => {
    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email or username/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });

    mockLogin.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
    });
  });
});
