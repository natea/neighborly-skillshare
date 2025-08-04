import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ProfileStep = 'basic-info' | 'location' | 'skills-offered' | 'skills-needed' | 'profile-photo' | 'confirmation';

interface ProfileWizardState {
  currentStep: ProfileStep;
  userId: string | null;
  profileData: {
    basicInfo: any; // Replace 'any' with specific type later
    location: any; // Replace 'any' with specific type later
    skillsOffered: any[]; // Replace 'any' with specific type later
    skillsNeeded: any[]; // Replace 'any' with specific type later
    profilePhotoUrl?: string;
  };
}

interface ProfileWizardContextType extends ProfileWizardState {
  setCurrentStep: (step: ProfileStep) => void;
  setUserId: (userId: string) => void;
  updateProfileData: (step: ProfileStep, data: any) => void; // Replace 'any' with specific type later
  resetWizard: () => void;
}

const initialProfileWizardState: ProfileWizardState = {
  currentStep: 'basic-info',
  userId: null,
  profileData: {
    basicInfo: {},
    location: {},
    skillsOffered: [],
    skillsNeeded: [],
    profilePhotoUrl: undefined,
  },
};

const ProfileWizardContext = createContext<ProfileWizardContextType | undefined>(undefined);

export const ProfileWizardProvider: React.FC<{ children: ReactNode; initialUserId?: string; initialStep?: ProfileStep }> = ({ children, initialUserId, initialStep }) => {
  const [state, setState] = useState<ProfileWizardState>({
    ...initialProfileWizardState,
    userId: initialUserId || null,
    currentStep: initialStep || initialProfileWizardState.currentStep,
  });

  const setCurrentStep = (step: ProfileStep) => {
    setState(prevState => ({ ...prevState, currentStep: step }));
  };

  const setUserId = (userId: string) => {
    setState(prevState => ({ ...prevState, userId }));
  };

  const updateProfileData = (step: ProfileStep, data: any) => {
    setState(prevState => ({
      ...prevState,
      profileData: {
        ...prevState.profileData,
        [getProfileDataKey(step)]: data,
      },
    }));
  };

  const resetWizard = () => {
    setState(initialProfileWizardState);
  };

  const getProfileDataKey = (step: ProfileStep): keyof ProfileWizardState['profileData'] => {
    switch (step) {
      case 'basic-info':
        return 'basicInfo';
      case 'location':
        return 'location';
      case 'skills-offered':
        return 'skillsOffered';
      case 'skills-needed':
        return 'skillsNeeded';
      case 'profile-photo':
        return 'profilePhotoUrl';
      default:
        throw new Error(`Invalid step for profile data: ${step}`);
    }
  };


  return (
    <ProfileWizardContext.Provider value={{ ...state, setCurrentStep, setUserId, updateProfileData, resetWizard }}>
      {children}
    </ProfileWizardContext.Provider>
  );
};

export const useProfileWizard = (): ProfileWizardContextType => {
  const context = useContext(ProfileWizardContext);
  if (!context) {
    throw new Error('useProfileWizard must be used within a ProfileWizardProvider');
  }
  return context;
};