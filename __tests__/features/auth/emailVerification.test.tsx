import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react'; // Import fireEvent
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import RegistrationForm from '@/components/auth/RegistrationForm';
import EmailConfirmedPage from '@/app/auth/email-confirmed/page';
import { supabase } from '@/lib/supabase'; // Actual path
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase client
const mockSupabaseInsert = jest.fn();
const mockOnAuthStateChangeCallback = jest.fn();
const mockAuthSubscription = { unsubscribe: jest.fn() };

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      onAuthStateChange: jest.fn().mockImplementation(callback => {
        mockOnAuthStateChangeCallback(callback); // Store it to be called manually or by helper
        return { data: { subscription: mockAuthSubscription } };
      }),
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: mockSupabaseInsert, // Use the stable mock
    })),
  },
}));

// Helper to mock onAuthStateChange behavior by directly invoking the stored callback
const triggerAuthStateChange = (
  event: AuthChangeEvent,
  session: Session | null,
  userOverride?: Partial<User> | null
) => {
  let effectiveSession = session;
  if (session && userOverride !== undefined) {
      effectiveSession = {
          ...session,
          user: userOverride === null ? null : { ...session.user, ...userOverride } as User
      } as Session;
  } else if (session && !session.user && userOverride) {
      effectiveSession = {
          ...session,
          user: userOverride as User
      }
  }

  // Assuming the last registered callback is the one to call for the test
  // This is a simplified assumption; real apps might have multiple listeners.
  // For these tests, we assume one relevant listener from EmailConfirmedPage.
  const lastRegisteredCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock.calls[
    (supabase.auth.onAuthStateChange as jest.Mock).mock.calls.length - 1
  ][0];
  
  if (lastRegisteredCallback) {
    lastRegisteredCallback(event, effectiveSession);
  }
  return mockAuthSubscription;
};


describe('Email Verification Flow', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe('RegistrationForm', () => {
    it('redirects to /auth/check-email on successful registration and profile creation', async () => {
      // Arrange
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      });
      // Removed extra }); here
      (supabase.from('profiles').insert as jest.Mock).mockResolvedValueOnce({
        data: [{ id: 'test-user-id', email: 'test@example.com' }],
        error: null,
        status: 201, // Added status
        count: 1,   // Added count
      });

      render(<RegistrationForm />);
      // Act
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await React.act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
        fireEvent.click(submitButton);
      });
      

      // Assert
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!',
        });
      });
      await waitFor(() => {
        expect(mockSupabaseInsert).toHaveBeenCalledWith({ // Check the stable mockInsert
          id: 'test-user-id',
          email: 'test@example.com',
        });
      });
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/check-email');
      });
    });

    // Add more tests for RegistrationForm error handling if needed (e.g., signUp fails, profile insert fails)
  });

  describe('EmailConfirmedPage', () => {
    const mockSession = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'test-user-id',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'test@example.com',
      } as User,
    } as Session;

    it('shows loading state initially', () => {
      // For this test, onAuthStateChange should not immediately call back and change state
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementationOnce(() => {
        // Does not call callback, allowing checkInitialUser's setTimeout to be tested
        return { data: { subscription: mockAuthSubscription } };
      });
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });

      render(<EmailConfirmedPage />);
      expect(screen.getByText(/Verifying your email.../i)).toBeInTheDocument();
    });
    
    it('displays success message when email is confirmed via onAuthStateChange (SIGNED_IN)', async () => {
      const confirmedUser = { ...mockSession.user, email_confirmed_at: new Date().toISOString() };
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
      
      render(<EmailConfirmedPage />); // Render first, then trigger
      await React.act(async () => {
        triggerAuthStateChange('SIGNED_IN', { ...mockSession, user: confirmedUser });
      });

      await waitFor(() => {
        expect(screen.getByText(/Email Verified!/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Your email address has been successfully verified./i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Proceed to Login/i })).toHaveAttribute('href', '/auth/login');
    });

    it('displays success message when email is confirmed via onAuthStateChange (USER_UPDATED)', async () => {
        const confirmedUser = { ...mockSession.user, email_confirmed_at: new Date().toISOString() };
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
        
        render(<EmailConfirmedPage />);
        await React.act(async () => {
          triggerAuthStateChange('USER_UPDATED', { ...mockSession, user: confirmedUser });
        });
  
        await waitFor(() => {
          expect(screen.getByText(/Email Verified!/i)).toBeInTheDocument();
        });
    });

    it('displays success message when email is confirmed via initial getSession', async () => {
        const confirmedUser = { ...mockSession.user, email_confirmed_at: new Date().toISOString() };
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: { ...mockSession, user: confirmedUser } },
            error: null
        });
         // onAuthStateChange might be set up by default jest.mock, ensure it doesn't interfere negatively
        (supabase.auth.onAuthStateChange as jest.Mock).mockImplementationOnce((callback) => {
            callback('INITIAL_SESSION', { ...mockSession, user: confirmedUser });
            return { data: { subscription: mockAuthSubscription }};
        });


        render(<EmailConfirmedPage />);

        await waitFor(() => {
            expect(screen.getByText(/Email Verified!/i)).toBeInTheDocument();
        });
    });


    it('displays error message for invalid/expired token (no session from onAuthStateChange or getSession)', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
      
      render(<EmailConfirmedPage />);
      await React.act(async () => {
        triggerAuthStateChange('INITIAL_SESSION', null); // Trigger the error condition
      });

      await waitFor(() => {
        expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
      }, { timeout: 3500 }); // Wait for the internal timeout in the component
      expect(screen.getByText(/Invalid or expired verification link/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Go to Login/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Try registering again/i })).toBeInTheDocument();
    });
    
    it('displays error message if getUser returns an error after onAuthStateChange indicates a user but not confirmed', async () => {
        const unconfirmedUser = { ...mockSession.user, email_confirmed_at: undefined };
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: null },
            error: { message: 'Supabase network error', name: 'AuthApiError', status: 500 }
        });

        render(<EmailConfirmedPage />);
        await React.act(async () => {
          triggerAuthStateChange('USER_UPDATED', { ...mockSession, user: unconfirmedUser as User });
        });

        await waitFor(() => {
            expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
        });
        expect(screen.getByText(/Supabase network error/i)).toBeInTheDocument();
    });

    it('displays specific error message if email is still not confirmed after checks', async () => {
        const unconfirmedUser = { ...mockSession.user, email_confirmed_at: undefined };
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: unconfirmedUser as User },
            error: null
        });
        
        render(<EmailConfirmedPage />);
        await React.act(async () => {
          triggerAuthStateChange('USER_UPDATED', { ...mockSession, user: unconfirmedUser as User });
        });

        await waitFor(() => {
            expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
        });
        expect(screen.getByText(/Email confirmation is still pending/i)).toBeInTheDocument();
    });

  });
});