'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Provider } from '@supabase/supabase-js';
import { FaGoogle, FaGithub } from 'react-icons/fa';

interface SocialLoginButtonsProps {
  onLoading?: (isLoading: boolean) => void;
  onError?: (error: string) => void;
  redirectTo?: string; // Optional redirect path after successful login
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onLoading, onError, redirectTo }) => {
  const handleSocialLogin = async (provider: Provider) => {
    if (onLoading) onLoading(true);
    if (onError) onError(''); // Clear previous errors

    // Construct the redirect URL. If not provided, Supabase default might be used or configured in Supabase dashboard.
    // It's often good to be explicit, especially for different environments.
    // For local development, ensure your Supabase project has http://localhost:3000/* as a valid redirect URI.
    const redirectURL = redirectTo || `${window.location.origin}/auth/callback`; // Ensure /auth/callback is handled

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectURL,
        // queryParams: { access_type: 'offline', prompt: 'consent' }, // Example for Google
      },
    });

    if (error) {
      if (onError) onError(error.message || 'An unknown error occurred during social login.');
      if (onLoading) onLoading(false);
    }
    // If successful, Supabase handles the redirect. No need to call onLoading(false) here as page will change.
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={() => handleSocialLogin('google')}
      >
        <FaGoogle className="mr-2 h-5 w-5" />
        Sign in with Google
      </Button>
      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={() => handleSocialLogin('github')}
      >
        <FaGithub className="mr-2 h-5 w-5" />
        Sign in with GitHub
      </Button>
    </div>
  );
};

export default SocialLoginButtons;