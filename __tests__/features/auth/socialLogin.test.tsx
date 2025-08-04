import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// MSW for mocking API calls if needed for Supabase client interactions
// import { rest } from 'msw';
// import { setupServer } from 'msw/node';

// Mock Supabase client
const mockSignInWithOAuth = jest.fn();
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockUnsubscribe = jest.fn();
const mockOnAuthStateChange = jest.fn((callback) => {
  // This mock will be controlled per test by using mockImplementationOnce
  return {
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  };
});
const mockGetSession = jest.fn();


jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: any[]) => mockSignInWithOAuth(...args),
      onAuthStateChange: (callback: any) => mockOnAuthStateChange(callback),
      getSession: (...args: any[]) => mockGetSession(...args),
    },
    from: jest.fn((table: string) => ({
      insert: (...args: any[]) => mockInsert(...args),
      select: (...args: any[]) => mockSelect(...args),
    })),
  },
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Import components to be tested
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import LoginPage from '@/app/auth/login/page';
import SignupPage from '@/app/auth/signup/page';
import AuthCallbackPage from '@/app/auth/callback/page'; // Import the callback page

describe('Social Login Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful mock for signInWithOAuth unless overridden in a specific test
    mockSignInWithOAuth.mockResolvedValue({ data: { user: {}, session: {} as any }, error: null });
    // Default successful mock for getSession unless overridden
    mockGetSession.mockResolvedValue({ data: { session: {} as any }, error: null });
    // Default mock for onAuthStateChange (can be overridden per test using mockImplementationOnce)
    mockOnAuthStateChange.mockImplementation((callback: any) => {
      // For most tests, we might not need an immediate callback trigger from here,
      // or we might simulate an INITIAL_SESSION with no user.
      // Specific tests for AuthCallbackPage will provide their own mockImplementationOnce.
      // callback('INITIAL_SESSION', null); // Example: simulate initial state with no session
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });
  });

  describe('UI Rendering', () => {
    test('should render Google and GitHub login buttons on the Login page', () => {
      render(<LoginPage />);
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
    });

    test('should render Google and GitHub login buttons on the Signup page', () => {
      render(<SignupPage />);
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
    });
  });

  describe('SocialLoginButtons Component Actions', () => {
    test('should call Supabase signInWithOAuth with Google provider', async () => {
      render(<SocialLoginButtons />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      });
    });

    test('should call Supabase signInWithOAuth with GitHub provider', async () => {
      render(<SocialLoginButtons />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with github/i }));
      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'github',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      });
    });

    test('should call onError prop if Supabase signInWithOAuth fails for Google', async () => {
      const errorMessage = 'Google OAuth Error';
      mockSignInWithOAuth.mockResolvedValueOnce({ error: { message: errorMessage } as any }); // Cast to any for simplified error mock
      const mockOnErrorCallback = jest.fn();
      render(<SocialLoginButtons onError={mockOnErrorCallback} />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
      await waitFor(() => expect(mockOnErrorCallback).toHaveBeenCalledWith(errorMessage));
    });

    test('should call onError prop if Supabase signInWithOAuth fails for GitHub', async () => {
      const errorMessage = 'GitHub OAuth Error';
      mockSignInWithOAuth.mockResolvedValueOnce({ error: { message: errorMessage } as any }); // Cast to any for simplified error mock
      const mockOnErrorCallback = jest.fn();
      render(<SocialLoginButtons onError={mockOnErrorCallback} />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with github/i }));
      await waitFor(() => expect(mockOnErrorCallback).toHaveBeenCalledWith(errorMessage));
    });
  });
  
  describe('AuthCallbackPage Logic', () => {
    const mockUser = {
      id: 'test-user-id-123',
      email: 'new.social.user@example.com',
      user_metadata: { full_name: 'Social User FullName', name: 'SocialName' },
    };
    const mockSession = { user: mockUser, access_token: 'valid-token', refresh_token: 'valid-refresh' };

    test('creates profile and redirects for a new user (e.g., Google/GitHub)', async () => {
      mockOnAuthStateChange.mockImplementationOnce((callback) => {
        callback('SIGNED_IN', mockSession as any); // Simulate user signed in via OAuth
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
      mockGetSession.mockResolvedValue({ data: { session: mockSession as any } }); // Ensure getSession also returns the session
      mockSelect.mockReturnValueOnce({ // Simulate profile does not exist
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });
      mockInsert.mockResolvedValueOnce({ error: null }); // Simulate successful profile creation

      render(<AuthCallbackPage />);

      await waitFor(() => expect(mockSelect).toHaveBeenCalledWith('*'));
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            full_name: mockUser.user_metadata.full_name,
          })
        );
      });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    test('redirects an existing user without creating a profile', async () => {
      mockOnAuthStateChange.mockImplementationOnce((callback) => {
        callback('SIGNED_IN', mockSession as any);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
      mockGetSession.mockResolvedValue({ data: { session: mockSession as any } });
      mockSelect.mockReturnValueOnce({ // Simulate profile exists
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: mockUser.id, email: mockUser.email }, error: null }),
      });

      render(<AuthCallbackPage />);

      await waitFor(() => expect(mockSelect).toHaveBeenCalledWith('*'));
      expect(mockInsert).not.toHaveBeenCalled();
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
    
    test('handles profile fetch error gracefully', async () => {
      const fetchErrorMessage = 'Failed to fetch profile data';
      mockOnAuthStateChange.mockImplementationOnce((callback) => {
        callback('SIGNED_IN', mockSession as any);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
      mockGetSession.mockResolvedValue({ data: { session: mockSession as any } });
      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: fetchErrorMessage, code: 'SOME_DB_ERROR' } }),
      });

      render(<AuthCallbackPage />);

      await waitFor(() => expect(screen.getByText(new RegExp(fetchErrorMessage, 'i'))).toBeInTheDocument());
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith('/');
    });

    test('handles profile creation error gracefully', async () => {
      const insertErrorMessage = 'Failed to create new profile';
      mockOnAuthStateChange.mockImplementationOnce((callback) => {
        callback('SIGNED_IN', mockSession as any);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
      mockGetSession.mockResolvedValue({ data: { session: mockSession as any } });
      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });
      mockInsert.mockResolvedValueOnce({ error: { message: insertErrorMessage } as any });

      render(<AuthCallbackPage />);

      await waitFor(() => expect(screen.getByText(new RegExp(insertErrorMessage, 'i'))).toBeInTheDocument());
      expect(mockPush).not.toHaveBeenCalledWith('/');
    });
    
    test('handles SIGNED_OUT event by redirecting to login with error', async () => {
      mockOnAuthStateChange.mockImplementationOnce((callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
      mockGetSession.mockResolvedValue({ data: { session: null } });

      render(<AuthCallbackPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/error: authentication failed or session expired/i)).toBeInTheDocument();
      });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login?error=auth_failed'), { timeout: 2500 });
    });
    
    test('uses email prefix as full_name if provider data is missing full_name and name', async () => {
      const userWithoutProviderName = {
        ...mockUser,
        email: 'prefixonly@example.com',
        user_metadata: {},
      };
      const sessionWithoutProviderName = { ...mockSession, user: userWithoutProviderName };

      mockOnAuthStateChange.mockImplementationOnce((callback) => {
        callback('SIGNED_IN', sessionWithoutProviderName as any);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });
      mockGetSession.mockResolvedValue({ data: { session: sessionWithoutProviderName as any } });
      mockSelect.mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });
      mockInsert.mockResolvedValueOnce({ error: null });

      render(<AuthCallbackPage />);

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            full_name: 'prefixonly',
          })
        );
      });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
    });
  });
});