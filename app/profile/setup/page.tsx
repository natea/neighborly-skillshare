'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProfileSetupWizard from '@/components/profile/ProfileSetupWizard';
// import { supabase } from '@/lib/supabase'; // For fetching user session
// import { ProfileApiService } from '@/lib/api/profileApi'; // For checking profile status

// A mock or placeholder for getting the current user's ID
// In a real app, this would come from Supabase auth or similar
const getCurrentUserId = async (): Promise<string | null> => {
  // const { data: { session } } = await supabase.auth.getSession();
  // return session?.user?.id || null;
  return 'test-user-id'; // Placeholder for now, as per test data
};

// A mock or placeholder for checking if profile setup is required
const checkProfileSetupRequired = async (userId: string): Promise<boolean> => {
    // try {
    //     const status = await ProfileApiService.getUserProfileStatus(userId);
    //     return !status.isComplete;
    // } catch (error) {
    //     console.error("Error checking profile status, assuming setup is required:", error);
    //     return true; // Default to requiring setup if status check fails
    // }
    return true; // Placeholder: always require setup for now for this page
};


const ProfileSetupPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const currentId = await getCurrentUserId();
      if (!currentId) {
        router.push('/auth/login'); // Redirect if no user
        return;
      }
      setUserId(currentId);

      const setupRequired = await checkProfileSetupRequired(currentId);
      if (setupRequired) {
        setShowWizard(true);
      } else {
        // If profile is complete, redirect to dashboard or profile view page
        router.push('/dashboard'); // Assuming a dashboard page exists
      }
      setIsLoading(false);
    };

    initialize();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading profile information...</p>
        {/* Add a spinner or loading animation here */}
      </div>
    );
  }

  if (!userId || !showWizard) {
    // This case should ideally be handled by redirects in useEffect,
    // but as a fallback:
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Your profile is already complete, or an error occurred.</p>
            {/* Optionally, a button to go to dashboard */}
        </div>
    );
  }

  // Potentially get initial step from query params if needed
  // const initialStepParam = searchParams.get('step') as ProfileStep | undefined;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <ProfileSetupWizard userId={userId} /* initialStep={initialStepParam} */ />
    </div>
  );
};

export default ProfileSetupPage;