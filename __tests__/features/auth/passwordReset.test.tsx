import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import ForgotPasswordPage from '@/app/auth/forgot-password/page';
import ResetPasswordPage from '@/app/auth/reset-password/page';
import CheckEmailPasswordResetPage from '@/app/auth/check-email-password-reset/page';
import { supabase } from '@/lib/supabase'; // Actual instance for mocking
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

// Mock environment variable
const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules(); // Most important - it clears the cache
  process.env = { ...OLD_ENV }; // Make a copy
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
});

afterAll(() => {
  process.env = OLD_ENV; // Restore old environment
});


describe('Password Reset Flow', () => {
  describe('ForgotPasswordForm Component', () => {
    it('renders the forgot password form correctly', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByLabelText(/^email address$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('shows validation error for invalid email', async () => {
      render(<ForgotPasswordForm />);
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/^email address$/i), { target: { value: 'invalid-email' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
      });
      // Explicitly wait for the specific text to appear
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });
    it('calls supabase.auth.resetPasswordForEmail on valid submission and redirects', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({ data: {}, error: null });

      render(<ForgotPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^email address$/i), { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
          redirectTo: 'http://localhost:3000/auth/reset-password',
        });
      });
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/check-email-password-reset');
      });
    });

     it('displays an error message if supabase.auth.resetPasswordForEmail fails', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Supabase error!' },
      });

      render(<ForgotPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^email address$/i), { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

      expect(await screen.findByText(/supabase error!/i)).toBeInTheDocument();
    });
  });

  describe('ResetPasswordForm Component', () => {
     beforeEach(() => {
      // Reset mocks for each test in this describe block
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((clientCallback) => {
        // Simulate the PASSWORD_RECOVERY event with a mock session
        // To properly test the form, we assume the link was valid and session established
        Promise.resolve().then(() => clientCallback('PASSWORD_RECOVERY', { user: { id: '123' } } as any)); // Cast session for mock simplicity
        return {
          data: {
            subscription: {
              id: 'default-suite-subscription-id',
              callback: clientCallback,
              unsubscribe: jest.fn()
            }
          }
        };
      });
       (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { user: { id: '123' }} }, error: null });
    });

    it('renders the reset password form correctly after session check', async () => {
      render(<ResetPasswordForm />);
      // Wait for "Verifying reset link..." to disappear
      await waitFor(() => {
        expect(screen.queryByText(/verifying reset link.../i)).not.toBeInTheDocument();
      });
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('shows validation error for password mismatch', async () => {
      render(<ResetPasswordForm />);
      await waitFor(() => expect(screen.queryByText(/verifying reset link.../i)).not.toBeInTheDocument());

      fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'Password124' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument();
    });

    it('shows validation errors for password complexity', async () => {
      render(<ResetPasswordForm />);
      await waitFor(() => expect(screen.queryByText(/verifying reset link.../i)).not.toBeInTheDocument());

      // Test min length
      fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'Pass1' } });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'Pass1' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(await screen.findAllByText(/password must be at least 8 characters long/i)).toHaveLength(2);

      // Test lowercase
      fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'PASSWORD123' } });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'PASSWORD123' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(await screen.findAllByText(/password must contain at least one lowercase letter/i)).toHaveLength(2);

      // Test uppercase
      fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(await screen.findAllByText(/password must contain at least one uppercase letter/i)).toHaveLength(2);

       // Test number
      fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'PasswordABC' } });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'PasswordABC' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(await screen.findAllByText(/password must contain at least one number/i)).toHaveLength(2);
    });


    it('calls supabase.auth.updateUser on valid submission and redirects', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({ data: { user: {} }, error: null });
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });


      render(<ResetPasswordForm />);
      await waitFor(() => expect(screen.queryByText(/verifying reset link.../i)).not.toBeInTheDocument());

      fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'NewPassword123' } });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'NewPassword123' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'NewPassword123' });
      });
      expect(await screen.findByText(/your password has been reset successfully/i)).toBeInTheDocument();
      await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalled());
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'), { timeout: 3500 }); // Wait for timeout
    });

    it('displays an error message if supabase.auth.updateUser fails', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Update user error!' },
      });

      // Mock window.location.hash to simulate being in a recovery flow
      // This helps prevent the component from setting an initial error that disables the button.
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { hash: '#type=recovery&access_token=some_token' },
        writable: true,
        configurable: true,
      });

      const onAuthStateChangeSpy = jest.spyOn(supabase.auth, 'onAuthStateChange');
      // For this test, make onAuthStateChange effectively a no-op regarding error state changes.
      // The component's useEffect will subscribe, but the callback it gets from this spy
      // will do nothing, preventing interference with the error state we want to test.
      onAuthStateChangeSpy.mockImplementation(() => {
        return {
          data: {
            subscription: {
              id: 'test-specific-subscription-id-no-op-hash',
              callback: () => {}, // A true no-op callback
              unsubscribe: jest.fn()
            }
          }
        };
      });
      // The getSession mock from beforeEach (line 114) is active and should provide initial session.

      render(<ResetPasswordForm />);

      // Wait for "Verifying reset link..." to disappear. This ensures getSession has resolved
      // and isSessionVerified is true (or recovery via hash is acknowledged), enabling the form.
      await waitFor(() => expect(screen.queryByText(/verifying reset link.../i)).not.toBeInTheDocument());
      
      // Form should be enabled now.
      expect(screen.getByRole('button', { name: /reset password/i })).not.toBeDisabled();

      fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'NewPassword123' } });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'NewPassword123' } });
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      });

      // Now, 'Update user error!' should be set by onSubmit and should stick.
      await waitFor(() => {
        expect(screen.getByText(/update user error!/i)).toBeInTheDocument();
      });

      onAuthStateChangeSpy.mockRestore();
      Object.defineProperty(window, 'location', originalLocation); // Restore original window.location
    });

    it('displays an error and keeps form enabled if onAuthStateChange reports no session for PASSWORD_RECOVERY', async () => {
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        Promise.resolve().then(() => callback('PASSWORD_RECOVERY', null)); // No session
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });

      render(<ResetPasswordForm />);
      
      // Wait for the "Verifying reset link..." message to disappear
      await waitFor(() => {
        expect(screen.queryByText(/verifying reset link.../i)).not.toBeInTheDocument();
      });
      
      expect(await screen.findByText(/Invalid or expired password reset link. Please try requesting a new one./i)).toBeInTheDocument();
      
      // Form fields should still be visible if an error occurs that doesn't hide the form
      // The button should be disabled due to the error state.
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();
    });

     it('displays an error and keeps form enabled if initial getSession finds no session and no token in hash', async () => {
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((_event, _session) => {
        // Simulate no immediate PASSWORD_RECOVERY event, rely on getSession
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
      
      Object.defineProperty(window, 'location', {
        value: { hash: '' }, // No tokens
        writable: true,
      });

      render(<ResetPasswordForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid or expired password reset link. This page should be accessed via the link sent to your email./i)).toBeInTheDocument();
      });
      // Form fields should still be visible, button disabled by `!!error`
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();
    });
  });

  describe('Page Components', () => {
    it('renders ForgotPasswordPage with the form', () => {
      render(<ForgotPasswordPage />);
      expect(screen.getByLabelText(/^email address$/i)).toBeInTheDocument();
    });

    it('renders ResetPasswordPage with the form (wrapped in Suspense)', async () => {
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        Promise.resolve().then(() => callback('PASSWORD_RECOVERY', { user: { id: '123' } }));
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { user: { id: '123' }} }, error: null });

      render(<ResetPasswordPage />);
      await waitFor(() => {
        expect(screen.queryByText(/verifying reset link.../i)).not.toBeInTheDocument();
        expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
      });
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    });

    it('renders CheckEmailPasswordResetPage correctly', () => {
      render(<CheckEmailPasswordResetPage />);
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/if an account exists for the email address you provided/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
    });
  });
});