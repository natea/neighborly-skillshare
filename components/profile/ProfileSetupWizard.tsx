'use client';

import React, { useEffect } from 'react';
import { ProfileWizardProvider, useProfileWizard, ProfileStep } from './ProfileWizardContext';
import BasicInfoStep from './steps/BasicInfoStep';
import LocationStep from './steps/LocationStep';
import SkillsOfferedStep from './steps/SkillsOfferedStep';
import SkillsNeededStep from './steps/SkillsNeededStep';
import ProfilePhotoStep from './steps/ProfilePhotoStep';
// import ConfirmationStep from './steps/ConfirmationStep'; // If needed

// Mocked services, replace with actual imports if they exist or create them
// For now, using the mocks defined in the test file structure
import { ProfileApiService } from '@/lib/api/profileApi'; // Assuming this path based on tests
import { NavigationService } from '@/lib/navigation'; // Assuming this path

interface ProfileSetupWizardProps {
  userId: string;
  initialStep?: ProfileStep;
}

const ProfileSetupWizardInternal: React.FC = () => {
  const { currentStep, userId, setCurrentStep } = useProfileWizard();

  useEffect(() => {
    if (!userId) {
      // Handle case where userId is not available, perhaps redirect or show error
      console.error("User ID is not available for Profile Setup Wizard.");
      // Potentially redirect to login or show an error message
      // NavigationService.exitWizard(); // Or similar
      return;
    }

    // Optional: Fetch initial profile status to determine starting point or if wizard is needed
    // This logic might be better placed in the page component that renders the wizard
    const checkProfileStatus = async () => {
      try {
        // const status = await ProfileApiService.getUserProfileStatus(userId);
        // if (status.isComplete) {
        //   NavigationService.goToDashboard();
        // } else if (status.lastCompletedStep) {
        //   // setCurrentStep(determineNextStep(status.lastCompletedStep));
        // }
      } catch (error) {
        console.error("Error fetching profile status:", error);
        // Handle error, maybe show a notification
      }
    };
    // checkProfileStatus();
  }, [userId, setCurrentStep]);


  const renderStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return <BasicInfoStep />;
      case 'location':
        return <LocationStep />;
      case 'skills-offered':
        return <SkillsOfferedStep />;
      case 'skills-needed':
        return <SkillsNeededStep />;
      case 'profile-photo':
        return <ProfilePhotoStep />;
      // case 'confirmation':
      //   return <ConfirmationStep />;
      default:
        // setCurrentStep('basic-info'); // Reset to first step if currentStep is invalid
        return <BasicInfoStep />; // Or some error/fallback UI
    }
  };

  if (!userId) {
    return <div>Loading or User ID not found...</div>; // Or redirect
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h1>
      {/* Progress Bar could go here */}
      <div className="p-6 border rounded-lg shadow-md bg-white">
        {renderStep()}
      </div>
    </div>
  );
};

const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({ userId, initialStep }) => {
  return (
    <ProfileWizardProvider initialUserId={userId} initialStep={initialStep}>
      <ProfileSetupWizardInternal />
    </ProfileWizardProvider>
  );
};

export default ProfileSetupWizard;