import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Note: The actual component imports will be added once the components are created
import ProfileSetupWizard from '@/components/profile/ProfileSetupWizard'; // Corrected path
// import { ProfileWizardProvider } from '@/components/profile/ProfileWizardContext'; // Provider is in Wizard

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(),
      update: jest.fn(),
      select: jest.fn(),
      eq: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));
// --- Mock Implementations ---

// It's important that the mock factory functions DO NOT reference variables 
// defined in the test file's outer scope that might not be initialized yet due to hoisting.
// So, we define the jest.fn() calls directly within the factory.

jest.mock('@/lib/validation', () => ({
  ValidationService: {
    validateBasicInfo: jest.fn(),
    validateLocation: jest.fn(),
    validateSkillsOffered: jest.fn(),
    validateSkillsNeeded: jest.fn(),
    validateLastStep: jest.fn(),
  }
}));

jest.mock('@/lib/api/profileApi', () => ({
  ProfileApiService: {
    saveBasicProfile: jest.fn(),
    fetchProfile: jest.fn(),
    getUserProfileStatus: jest.fn(),
    saveProfilePhotoUrl: jest.fn(),
  }
}));

jest.mock('@/lib/api/locationApi', () => ({
  LocationApiService: {
    saveLocation: jest.fn(),
  }
}));

jest.mock('@/lib/api/skillApi', () => ({
  SkillApiService: {
    saveSkillOffers: jest.fn(),
    saveSkillRequests: jest.fn(),
  }
}));

jest.mock('@/lib/api/fileUploadApi', () => ({
  FileUploadService: {
    uploadProfilePhoto: jest.fn(),
  }
}));

jest.mock('@/lib/navigation', () => ({
  NavigationService: {
    goToStep: jest.fn(),
    goToPreviousStep: jest.fn(),
    exitWizard: jest.fn(),
    goToDashboard: jest.fn(),
  }
}));

// --- End Mock Implementations ---

// Import the mocked services to configure them in beforeEach
// These imports will retrieve the mocked versions defined above.
import { ValidationService } from '@/lib/validation';
import { ProfileApiService } from '@/lib/api/profileApi';
import { LocationApiService } from '@/lib/api/locationApi';
import { SkillApiService } from '@/lib/api/skillApi';
import { FileUploadService } from '@/lib/api/fileUploadApi';
import { NavigationService } from '@/lib/navigation'; // Import for GTP-2.2.1-012

// Test data
describe('Profile Setup Wizard (MPP Task 2.2.1)', () => {
  let mockRouterPush: jest.Mock;
  
  const userId = 'test-user-id';
  const validBasicInfoData = {
    full_name: 'John Doe',
    bio: 'Test bio information',
  };
  
  const validLocationData = {
    address_text: '123 Main St, Anytown, USA',
    latitude: 40.7128,
    longitude: -74.0060,
  };
  
  const validSkillsOfferedData = [
    {
      title: 'Gardening',
      description: 'Expert gardener with 5 years experience',
      exchange_type: 'barter',
    },
  ];
  
  const validSkillsNeededData = [
    {
      title: 'Home Repair',
      description: 'Need help with basic home repairs',
      exchange_type: 'barter',
    },
  ];
  
  const mockFile = new File(['dummy content'], 'profile.png', { type: 'image/png' });
  const mockPhotoUrl = 'https://example.com/photos/profile.png';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks(); // This should clear all functions mocked with jest.fn()

    // Setup router mock
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

    // Mock URL.createObjectURL for JSDOM environment
    global.URL.createObjectURL = jest.fn((file: Blob | MediaSource | File) => `mock-object-url-for-${(file as File)?.name || 'unknown'}`);
    global.URL.revokeObjectURL = jest.fn();
    
    // Setup default mock responses using the imported mocked services
    (ProfileApiService.getUserProfileStatus as jest.Mock).mockResolvedValue({ isComplete: false, lastCompletedStep: null });
    (ValidationService.validateBasicInfo as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
    (ValidationService.validateLocation as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
    (ValidationService.validateSkillsOffered as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
    (ValidationService.validateSkillsNeeded as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
    (ValidationService.validateLastStep as jest.Mock).mockReturnValue({ isValid: true, errors: {} });
    
    (ProfileApiService.saveBasicProfile as jest.Mock).mockResolvedValue({ success: true, data: {} });
    (LocationApiService.saveLocation as jest.Mock).mockResolvedValue({ success: true, data: {} });
    (SkillApiService.saveSkillOffers as jest.Mock).mockResolvedValue({ success: true, data: {} });
    (SkillApiService.saveSkillRequests as jest.Mock).mockResolvedValue({ success: true, data: {} });
    (FileUploadService.uploadProfilePhoto as jest.Mock).mockResolvedValue({ success: true, url: mockPhotoUrl });
    (ProfileApiService.saveProfilePhotoUrl as jest.Mock).mockResolvedValue({ success: true });
    (NavigationService.exitWizard as jest.Mock).mockImplementation(() => console.log("Mock NavigationService.exitWizard called"));
    (NavigationService.goToDashboard as jest.Mock).mockImplementation(() => console.log("Mock NavigationService.goToDashboard called"));
  });

  /**
   * Test Case ID: GTP-2.2.1-001
   * Description: Verify wizard is displayed for a new user with an incomplete profile.
   */
  // /*
  it('should display the wizard for users with incomplete profiles', async () => {
    // Arrange
    // This mock is now part of the default beforeEach (mockGetUserProfileStatus)
    
    // Act
    render(<ProfileSetupWizard userId={userId} />);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Complete Your Profile/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Basic Information/i)).toBeInTheDocument(); 
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-002
   * Description: Verify navigation from Basic Info step to Location step on "Next".
   */
  // /*
  it('should navigate from Basic Info step to Location step when clicking Next', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} />); 
    
    // Act - Fill the form and click Next
    await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: validBasicInfoData.full_name } });
    fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: validBasicInfoData.bio } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    expect(ValidationService.validateBasicInfo).toHaveBeenCalledWith( 
      expect.objectContaining(validBasicInfoData)
    );
    expect(ProfileApiService.saveBasicProfile).toHaveBeenCalledWith( 
      expect.objectContaining({ id: userId, ...validBasicInfoData })
    );

    await waitFor(() => {
      expect(screen.getByText(/Your Location/i)).toBeInTheDocument();
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-003
   * Description: Verify data entered in Basic Info step is saved via API call.
   */
  // /*
  it('should save Basic Info data via API when clicking Next', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} />);
    
    // Act - Fill the form and click Next
    await waitFor(() => screen.getByLabelText(/Full Name/i));
    
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: validBasicInfoData.full_name } });
    fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: validBasicInfoData.bio } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    expect(ValidationService.validateBasicInfo).toHaveBeenCalledWith(
      expect.objectContaining(validBasicInfoData)
    );

    await waitFor(() => {
      expect(ProfileApiService.saveBasicProfile).toHaveBeenCalledWith( 
        expect.objectContaining({
          id: userId,
          ...validBasicInfoData
        })
      );
      expect(ProfileApiService.saveBasicProfile).toHaveBeenCalledTimes(1); 
    });
    await waitFor(() => {
        expect(screen.getByText(/Your Location/i)).toBeInTheDocument();
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-004
   * Description: Verify navigation from Location step to Skills Offered step on "Next".
   */
  // /*
  it('should navigate from Location step to Skills Offered step when clicking Next', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="location" />);
    
    // Act - Fill the form and click Next
    await waitFor(() => expect(screen.getByLabelText(/Address/i)).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: validLocationData.address_text } });
    
    await waitFor(() => {
      expect(screen.getByText(`Latitude: ${validLocationData.latitude}`)).toBeInTheDocument();
      expect(screen.getByText(`Longitude: ${validLocationData.longitude}`)).toBeInTheDocument();
    }, { timeout: 1500 }); 
    
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    await waitFor(() => {
      expect(ValidationService.validateLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          address_text: validLocationData.address_text,
          latitude: validLocationData.latitude, 
          longitude: validLocationData.longitude
        })
      );
      expect(LocationApiService.saveLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          address_text: validLocationData.address_text,
          latitude: validLocationData.latitude,
          longitude: validLocationData.longitude,
          is_primary: true 
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Skills You Can Offer/i)).toBeInTheDocument();
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-005
   * Description: Verify data entered in Location step is saved via API call.
   */
  // /*
  it('should save Location data via API when clicking Next', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="location" />);
    
    // Act - Fill the form and click Next
    await waitFor(() => expect(screen.getByLabelText(/Address/i)).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: validLocationData.address_text } });

    await waitFor(() => {
      expect(screen.getByText(`Latitude: ${validLocationData.latitude}`)).toBeInTheDocument();
      expect(screen.getByText(`Longitude: ${validLocationData.longitude}`)).toBeInTheDocument();
    }, { timeout: 1500 });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    expect(ValidationService.validateLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          address_text: validLocationData.address_text,
          latitude: validLocationData.latitude,
          longitude: validLocationData.longitude
        })
    );

    await waitFor(() => {
      expect(LocationApiService.saveLocation).toHaveBeenCalledWith(expect.objectContaining({ 
        user_id: userId,
        address_text: validLocationData.address_text,
        latitude: validLocationData.latitude,
        longitude: validLocationData.longitude,
        is_primary: true
      }));
      expect(LocationApiService.saveLocation).toHaveBeenCalledTimes(1); 
    });

    await waitFor(() => {
      expect(screen.getByText(/Skills You Can Offer/i)).toBeInTheDocument();
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-006
   * Description: Verify navigation from Skills Offered step to Skills Needed step on "Next".
   */
  // /*
  it('should navigate from Skills Offered step to Skills Needed step when clicking Next', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="skills-offered" />);
    
    // Act - Fill the form for a skill and add it
    await waitFor(() => expect(screen.getByText(/Skills You Can Offer/i)).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Skill Title/i), { target: { value: validSkillsOfferedData[0].title } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: validSkillsOfferedData[0].description } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add Skill to List/i }));
    });

    await waitFor(() => {
        expect(screen.getByText(validSkillsOfferedData[0].title)).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    expect(ValidationService.validateSkillsOffered).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(validSkillsOfferedData[0])
      ])
    );

    await waitFor(() => {
      expect(SkillApiService.saveSkillOffers).toHaveBeenCalledWith(expect.objectContaining({
        user_id: userId,
        skills: expect.arrayContaining([
          expect.objectContaining(validSkillsOfferedData[0])
        ])
      }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Skills You're Looking For/i)).toBeInTheDocument();
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-007
   * Description: Verify data entered in Skills Offered step is saved via API call.
   */
  // /*
  it('should save Skills Offered data via API when clicking Next', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="skills-offered" />);
    
    // Act - Fill the form for a skill, add it, and click Next
    await waitFor(() => expect(screen.getByText(/Skills You Can Offer/i)).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Skill Title/i), { target: { value: validSkillsOfferedData[0].title } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: validSkillsOfferedData[0].description } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add Skill to List/i }));
    });

    await waitFor(() => {
        expect(screen.getByText(validSkillsOfferedData[0].title)).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    expect(ValidationService.validateSkillsOffered).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(validSkillsOfferedData[0])
      ])
    );

    await waitFor(() => {
      expect(SkillApiService.saveSkillOffers).toHaveBeenCalledWith(expect.objectContaining({ 
        user_id: userId,
        skills: expect.arrayContaining([
          expect.objectContaining({
            title: validSkillsOfferedData[0].title,
            description: validSkillsOfferedData[0].description,
            exchange_type: validSkillsOfferedData[0].exchange_type
          })
        ])
      }));
      expect(SkillApiService.saveSkillOffers).toHaveBeenCalledTimes(1); 
    });

    await waitFor(() => {
      expect(screen.getByText(/Skills You're Looking For/i)).toBeInTheDocument();
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-008
   * Description: Verify navigation from Skills Needed step to Profile Photo step on "Next".
   */
  // /*
  it('should navigate from Skills Needed step to Profile Photo step when clicking Next', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="skills-needed" />);
    
    // Act - Fill the form for a skill and add it
    await waitFor(() => expect(screen.getByText(/Skills You're Looking For/i)).toBeInTheDocument()); 
    
    fireEvent.change(screen.getByLabelText("Skill Title"), { target: { value: validSkillsNeededData[0].title } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: validSkillsNeededData[0].description } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add Skill to List/i }));
    });

    await waitFor(() => {
        expect(screen.getByText(validSkillsNeededData[0].title)).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    expect(ValidationService.validateSkillsNeeded).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(validSkillsNeededData[0])
      ])
    );

    await waitFor(() => {
      expect(SkillApiService.saveSkillRequests).toHaveBeenCalledWith(expect.objectContaining({
        user_id: userId,
        skills: expect.arrayContaining([
          expect.objectContaining(validSkillsNeededData[0])
        ])
      }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Profile Photo/i)).toBeInTheDocument(); 
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-009
   * Description: Verify data entered in Skills Needed step is saved via API call.
   */
  // /*
  it('should save Skills Needed data via API when clicking Next', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="skills-needed" />);
    
    // Act - Fill the form for a skill, add it, and click Next
    await waitFor(() => expect(screen.getByText(/Skills You're Looking For/i)).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Skill Title/i), { target: { value: validSkillsNeededData[0].title } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: validSkillsNeededData[0].description } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add Skill to List/i }));
    });

    await waitFor(() => {
        expect(screen.getByText(validSkillsNeededData[0].title)).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    expect(ValidationService.validateSkillsNeeded).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(validSkillsNeededData[0])
      ])
    );

    await waitFor(() => {
      expect(SkillApiService.saveSkillRequests).toHaveBeenCalledWith(expect.objectContaining({
        user_id: userId,
        skills: expect.arrayContaining([
          expect.objectContaining({
            title: validSkillsNeededData[0].title,
            description: validSkillsNeededData[0].description,
            exchange_type: validSkillsNeededData[0].exchange_type
          })
        ])
      }));
      expect(SkillApiService.saveSkillRequests).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/Profile Photo/i)).toBeInTheDocument();
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-010
   * Description: Verify Profile Photo selection triggers upload and saves URL.
   */
  // /*
  it('should upload profile photo and save URL when photo is selected', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="profile-photo" />);
    
    // Act - Upload a photo
    await waitFor(() => expect(screen.getByText(/Profile Photo/i)).toBeInTheDocument());
    
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
    });
    
    // Assert
    await waitFor(() => {
      expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalledWith(mockFile);
    });
    await waitFor(() => {
      expect(ProfileApiService.saveProfilePhotoUrl).toHaveBeenCalledWith(
        userId,
        mockPhotoUrl 
      );
    });

    await waitFor(() => {
      const imgElement = screen.getByAltText(/Profile preview/i);
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute('src', mockPhotoUrl);
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-011
   * Description: Verify navigation from any step to the previous step on "Previous".
   */
  // /*
  it('should navigate to the previous step when clicking Previous button', async () => {
    // Arrange: Start on Location step
    render(<ProfileSetupWizard userId={userId} initialStep="location" />);
    await waitFor(() => expect(screen.getByText(/Your Location/i)).toBeInTheDocument()); 

    // Act: Click Previous
    await act(async () => { 
      fireEvent.click(screen.getByRole('button', { name: /Previous/i }));
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Basic Information/i)).toBeInTheDocument();
    });
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-012
   * Description: Verify clicking "Save & Exit" saves current step data and exits wizard.
   */
  // /*
  it('should save current step data and exit wizard when clicking Save & Exit', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="basic-info" />);
    
    // Act - Fill the form and click Save & Exit
    await waitFor(() => expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: validBasicInfoData.full_name } });
    fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: validBasicInfoData.bio } });
    
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Save & Exit/i }));
    });
    
    // Assert
    expect(ValidationService.validateBasicInfo).toHaveBeenCalledWith(expect.objectContaining(validBasicInfoData));
    await waitFor(() => {
      expect(ProfileApiService.saveBasicProfile).toHaveBeenCalledWith(expect.objectContaining({
        id: userId,
        ...validBasicInfoData
      }));
    });
    expect(NavigationService.exitWizard).toHaveBeenCalled();
    expect(NavigationService.exitWizard).toHaveBeenCalledTimes(1);
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-013
   * Description: Verify required field validation prevents navigation on "Next".
   */
  // /*
  it('should prevent navigation when required fields are empty', async () => {
    // Arrange
    (ValidationService.validateBasicInfo as jest.Mock).mockReturnValue({
      isValid: false,
      errors: { full_name: 'Full name is required' }
    });
    render(<ProfileSetupWizard userId={userId} initialStep="basic-info" />);
    await waitFor(() => screen.getByLabelText(/Full Name/i)); 
    
    // Act: Try to click Next without filling the form (or with invalid data based on mock)
    // Full name is intentionally left empty or not changed from initial empty state.
    fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: "Some bio" } }); 
    
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
    });
    expect(screen.getByText(/Basic Information/i)).toBeInTheDocument();
    expect(ProfileApiService.saveBasicProfile).not.toHaveBeenCalled();
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-014
   * Description: Verify data format validation prevents saving/navigation.
   */
  // /*
  it('should prevent navigation when data format is invalid', async () => {
    // Arrange
    // Simulate a format error for the bio field for this test
    const invalidBioData = { full_name: 'John Doe', bio: 'Short' };
    const bioFormatError = 'Bio is too short or contains invalid characters.';
    (ValidationService.validateBasicInfo as jest.Mock).mockImplementation((data) => {
      if (data.bio === 'Short') {
        return { isValid: false, errors: { bio: bioFormatError } };
      }
      return { isValid: true, errors: {} }; // Default to valid for other calls in the same test if any
    });

    render(<ProfileSetupWizard userId={userId} initialStep="basic-info" />);
    await waitFor(() => screen.getByLabelText(/Full Name/i)); 
    
    // Act: Fill form with data that would trigger format validation error
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: invalidBioData.full_name } });
    fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: invalidBioData.bio } });
    
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(bioFormatError)).toBeInTheDocument();
    });
    expect(screen.getByText(/Basic Information/i)).toBeInTheDocument();
    expect(ProfileApiService.saveBasicProfile).not.toHaveBeenCalled();
  });
  // */

  /**
   * Test Case ID: GTP-2.2.1-015
   * Description: Verify wizard completes successfully after the last step and redirects user.
   */
  // /*
  it('should complete wizard and redirect to dashboard after final step', async () => {
    // Arrange
    render(<ProfileSetupWizard userId={userId} initialStep="profile-photo" />);
    await waitFor(() => screen.getByText(/Profile Photo/i));

    // Act: Simulate completing the last step (e.g., selecting a photo which auto-uploads)
    // and then clicking "Finish" (which is "Next" on the last step in current ProfilePhotoStep)
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
    });

    // Wait for upload and save to be called from handleFileChange
    await waitFor(() => {
      expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalledWith(mockFile);
      expect(ProfileApiService.saveProfilePhotoUrl).toHaveBeenCalledWith(userId, mockPhotoUrl);
    });
    
    // Click "Finish" button
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Finish/i }));
    });
    
    expect(NavigationService.goToDashboard).toHaveBeenCalled();
    expect(NavigationService.goToDashboard).toHaveBeenCalledTimes(1);
  });
  // */
});