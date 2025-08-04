'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const AuthCallbackPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscriptionListener: any = null; // Define subscription variable here

    const processAuth = async (sessionUser: User) => {
      try {
        setMessage('Authentication successful. Checking profile...');
        // 1. Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 'single' row not found
          throw new Error(`Error fetching profile: ${profileError.message}`);
        }

        if (!profile) {
          setMessage('No profile found. Creating new profile...');
          // 2. Create profile if it doesn't exist
          const newUserProfile = {
            id: sessionUser.id,
            email: sessionUser.email,
            // Attempt to get full_name from common user_metadata fields
            full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
            // avatar_url: sessionUser.user_metadata?.avatar_url, // Optional
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newUserProfile);

          if (insertError) {
            throw new Error(`Error creating profile: ${insertError.message}`);
          }
          setMessage('Profile created successfully.');
        } else {
          setMessage('Profile found.');
        }

        // 3. Redirect to dashboard
        setMessage('Redirecting to dashboard...');
        router.push('/'); // Or a more specific dashboard URL
      } catch (e: any) {
        console.error('Error during auth callback processing:', e);
        setError(e.message || 'An unexpected error occurred during profile setup.');
        setMessage(''); // Clear processing message
        // Optionally redirect to login with error after a delay, or show error on this page
        // setTimeout(() => router.push('/auth/login?error=' + encodeURIComponent(e.message)), 3000);
      }
    };

    // Supabase client handles the session automatically after redirect.
    // We listen for the signed-in event or check current session.
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        processAuth(session.user);
        subscriptionListener?.unsubscribe(); // Process once
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        // Handle case where user is already signed in when landing here (less likely for OAuth callback)
        processAuth(session.user);
        subscriptionListener?.unsubscribe();
      } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        // If for some reason user is signed out or no session, redirect to login
        setError('Authentication failed or session expired.');
        setMessage('');
        setTimeout(() => router.push('/auth/login?error=auth_failed'), 2000);
        subscriptionListener?.unsubscribe();
      }
    });
    subscriptionListener = authListener.data.subscription; // Assign to the hoisted variable
    
    // Fallback check if onAuthStateChange doesn't fire immediately or as expected
    // This might be redundant if onAuthStateChange is reliable.
    (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            // Check if already processed by onAuthStateChange
            if (message === 'Processing authentication...') {
                // processAuth(session.user); // This could lead to double processing if onAuthStateChange also fires
            }
        } else if (message === 'Processing authentication...') {
            // If no session after a brief moment and still "Processing", it might be an issue.
            // This logic is tricky and might be better handled by a longer timeout on the page
            // or clearer user instruction if stuck.
            // setTimeout(() => {
            //     if (message === 'Processing authentication...') {
            //         setError('Could not retrieve session after a delay.');
            //         setMessage('');
            //         // router.push('/auth/login?error=session_retrieval_failed_delayed');
            //     }
            // }, 5000); // Increased delay for fallback
        }
    })();


    return () => {
      subscriptionListener?.unsubscribe();
    };
  }, [router, message]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        {message && <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{message}</p>}
        {error && <p className="mt-4 text-red-500 dark:text-red-400">Error: {error}</p>}
        {!error && !message.includes('Redirecting') && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait...</p>
          </div>
        )}
         {error && (
            <button 
                onClick={() => router.push('/auth/login')}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Go to Login
            </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;