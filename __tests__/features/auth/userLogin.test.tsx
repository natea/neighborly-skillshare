import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Adjust if your Supabase client path is different
import LoginForm from '@/components/auth/LoginForm'; // This component will be created

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('LoginForm Component', () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      // Zod's .email() fires before .min(1) for an empty string
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      // Zod's .min(6) fires before .min(1) for an empty string if min(1) is also present
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email format', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i); // Get password input

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(emailInput).toHaveValue('invalid-email'); // Verify input value changed

    // Password field is left empty, trigger blur to ensure validation runs with mode: 'all'
    fireEvent.blur(passwordInput);

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // findByText returns a promise and waits for the element to appear
    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    // Password should also show its validation error
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  test('shows validation error for short password', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'short' } }); // Assuming min 6 chars
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      // Assuming a password length requirement of at least 6 characters
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  test('handles successful login and redirects', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: '123', email: 'test@example.com' }, session: {} },
      error: null,
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/'); // Redirect to main app page
    });
  });

  test('handles login error: invalid credentials', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  test('handles login error: email not confirmed (example)', async () => {
    // This error message might vary based on Supabase's actual response for unverified emails
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed', name: 'AuthApiError', status: 400 },
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'unverified@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'unverified@example.com',
        password: 'password123',
      });
      expect(screen.getByText(/email not confirmed/i)).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  test('conceptual session persistence: Supabase client methods called', async () => {
    // This test is conceptual as direct session testing in JSDOM is complex.
    // We verify that the Supabase call, which handles session, is made.
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: '123', email: 'test@example.com' }, session: { access_token: 'fake-token'} },
      error: null,
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'persist@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'persist@example.com',
        password: 'password123',
      });
      // Further checks could involve mocking `onAuthStateChange` if used directly
      // or verifying user context updates if applicable.
      // For now, successful signInWithPassword implies session handling by Supabase client.
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

});