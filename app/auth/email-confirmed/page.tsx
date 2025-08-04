'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Import the initialized client
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function EmailConfirmedPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const supabase = createClient(); // No longer needed, supabase is imported directly

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user?.email_confirmed_at) {
          setVerificationStatus('success');
        } else if (session?.user) {
          // User is signed in but email might not be confirmed yet, or this event fired before confirmation registered
          // We can try to refresh the user session or check again
          const { data: { user }, error } = await supabase.auth.getUser();
          if (user?.email_confirmed_at) {
            setVerificationStatus('success');
          } else if (error) {
            setVerificationStatus('error');
            setErrorMessage(error.message || 'Could not verify email. Please try again.');
          } else {
            // Still not confirmed, could be a delay or an issue.
            // For now, we'll assume if the user is on this page after clicking the link,
            // and the session is active, it *should* be confirmed soon.
            // A more robust solution might involve a timeout or manual refresh.
            // Setting to error for now if not immediately confirmed after a refresh.
            setVerificationStatus('error');
            setErrorMessage('Email confirmation is still pending. Please wait a moment and refresh, or contact support if the issue persists.');
          }
        }
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session load if user is already logged in and confirmed
        if (session?.user?.email_confirmed_at) {
          setVerificationStatus('success');
        } else if (session?.user) {
            // If there's a session but email not confirmed, it's an odd state for this page.
            // This page is meant to be hit *after* clicking the confirmation link.
            // Supabase should handle the token and update the user.
            // Let's try to get user again to be sure.
            const { data: { user }, error } = await supabase.auth.getUser();
            if (user?.email_confirmed_at) {
                setVerificationStatus('success');
            } else {
                setVerificationStatus('error');
                setErrorMessage('Verification link may be invalid or expired, or email is not yet confirmed.');
            }
        } else {
          // No session, likely an invalid or expired token if they hit this page directly without Supabase magic.
          // Supabase handles the token exchange in the URL usually before this page fully loads client-side.
          // If there's no session after onAuthStateChange, it's likely an error.
          setVerificationStatus('error');
          setErrorMessage('Invalid or expired verification link. Please try registering again or request a new verification email.');
        }
      }
    });

    // Check initial user state as well, in case onAuthStateChange doesn't fire as expected for redirects
    const checkInitialUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setVerificationStatus('error');
        setErrorMessage('Error fetching session. Please try again.');
        return;
      }

      if (session?.user?.email_confirmed_at) {
        setVerificationStatus('success');
      } else if (session?.user) {
        // If session exists but not confirmed, this implies the link worked to create a session but not confirm.
        // This could happen if the user navigates here *after* Supabase processes the token but before our listener picks it up,
        // or if there's a genuine issue.
        const { data: { user }, error: userError } = await supabase.auth.getUser(); // Refresh to be sure
        if (user?.email_confirmed_at) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          setErrorMessage(userError?.message || 'Email not confirmed. The link may be invalid or expired.');
        }
      } else {
        // No active session, and onAuthStateChange might handle it.
        // If after a short delay there's still no success, assume error.
        // This timeout is a fallback.
        setTimeout(() => {
          if (verificationStatus === 'loading') {
            setVerificationStatus('error');
            setErrorMessage('Verification failed. The link may be invalid or expired. Please try registering again.');
          }
        }, 3000); // Wait 3 seconds for Supabase to process
      }
    };

    checkInitialUser();


    return () => {
      if (authListener && authListener.subscription && typeof authListener.subscription.unsubscribe === 'function') {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase, verificationStatus]); // Added verificationStatus to dependencies to avoid stale closure issues with the timeout

  if (verificationStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Verifying your email...</h2>
          <p className="text-gray-600">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-red-600">Verification Failed</h2>
          <p className="text-gray-600">{errorMessage || 'An unknown error occurred.'}</p>
          <div className="mt-6">
            <Link href="/auth/login" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Go to Login
            </Link>
          </div>
           <div className="mt-4">
            <Link href="/auth/signup" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Try registering again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md text-center">
        <div>
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verified!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email address has been successfully verified.
          </p>
        </div>
        <div className="mt-6">
          <Link href="/auth/login" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Proceed to Login
          </Link>
        </div>
      </div>
    </div>
  );
}