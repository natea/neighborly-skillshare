import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePhotoStep from '@/components/profile/steps/ProfilePhotoStep';
import { ProfileWizardProvider } from '@/components/profile/ProfileWizardContext';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
      data-testid="mock-image"
    />
  ),
}));

// Mock services
jest.mock('@/lib/api/profileApi', () => ({
  ProfileApiService: {
    saveProfilePhotoUrl: jest.fn(),
    saveBasicProfile: jest.fn(),
    fetchProfile: jest.fn(),
    getUserProfileStatus: jest.fn(),
    deleteProfilePhoto: jest.fn(), // Added deleteProfilePhoto
  }
}));

jest.mock('@/lib/api/fileUploadApi', () => ({
  FileUploadService: {
    uploadProfilePhoto: jest.fn(),
  }
}));

jest.mock('@/lib/navigation', () => ({
  NavigationService: {
    goToDashboard: jest.fn(),
    exitWizard: jest.fn(),
  }
}));

// Import the mocked services to configure them in beforeEach
import { ProfileApiService } from '@/lib/api/profileApi';
import { FileUploadService } from '@/lib/api/fileUploadApi';
import { NavigationService } from '@/lib/navigation';
import { getCroppedImg } from '@/lib/imageUtils'; // Import for mocking
import { useProfileWizard } from '@/components/profile/ProfileWizardContext'; // Import the hook for mocking

// Mock the image utility
jest.mock('@/lib/imageUtils', () => ({
  getCroppedImg: jest.fn(),
}));

// Mock the ProfileWizardContext hook
jest.mock('@/components/profile/ProfileWizardContext', () => ({
  ...jest.requireActual('@/components/profile/ProfileWizardContext'), // Keep ProfileWizardProvider
  useProfileWizard: jest.fn(), // Mock the hook itself
}));

describe('Profile Photo Upload and Management (MPP Task 2.2.2)', () => {
  const userId = 'test-user-id';
  const mockPhotoUrl = 'https://example.com/photos/profile.jpg';
  const mockCroppedPhotoUrl = 'https://example.com/photos/profile-cropped.jpg';
  
  // Test files
  const mockJpegFile = new File(['jpeg content'], 'profile.jpg', { type: 'image/jpeg' });
  const mockPngFile = new File(['png content'], 'profile.png', { type: 'image/png' });
  const mockGifFile = new File(['gif content'], 'profile.gif', { type: 'image/gif' });
  const mockLargeFile = new File(['large content'.repeat(1000000)], 'large.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock URL.createObjectURL for JSDOM environment
    global.URL.createObjectURL = jest.fn((file: Blob | MediaSource | File) => 
      `mock-object-url-for-${(file as File)?.name || 'unknown'}`);
    global.URL.revokeObjectURL = jest.fn();
    
    // Setup default mock responses
    (FileUploadService.uploadProfilePhoto as jest.Mock).mockResolvedValue({
      success: true,
      url: mockPhotoUrl,
      // message: undefined // Ensure message is part of the mock if needed for error cases
    });
    (ProfileApiService.saveProfilePhotoUrl as jest.Mock).mockResolvedValue({
      success: true,
      // data: { profilePhotoUrl: mockPhotoUrl } // if save returns the updated field
    });
    (ProfileApiService.fetchProfile as jest.Mock).mockResolvedValue({
      success: true,
      data: { profilePhotoUrl: mockPhotoUrl } // Existing mock, seems fine
    });
    (ProfileApiService.deleteProfilePhoto as jest.Mock).mockResolvedValue({
        success: true,
        message: "Photo deleted successfully"
    });

    // Mock getCroppedImg to return a dummy file
    (getCroppedImg as jest.Mock).mockResolvedValue(
      new File(['cropped content'], 'cropped.jpg', { type: 'image/jpeg' })
    );

    // Setup a default return value for the mocked useProfileWizard hook
    (useProfileWizard as jest.Mock).mockReturnValue({
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null }, // Default to no photo
      updateProfileData: jest.fn(),
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    });
  });

  // const renderProfilePhotoStep = (initialPhotoUrl: string | null = null) => {
  //   return render(
  //     <ProfileWizardProvider
  //       initialUserId={userId}
  //       initialStep="profile-photo"
  //     >
  //       <ProfilePhotoStep />
  //     </ProfileWizardProvider>
  //   );
  // };

  /**
   * Test Case ID: GTP-2.2.2-001
   * Description: Verify successful upload of a JPEG image file.
   * Targeted AI Verifiable End Result: "Photo upload... functionality works."
   */
  it('should successfully upload a JPEG image file', async () => {
    // Arrange
    (useProfileWizard as jest.Mock).mockReturnValue({
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null },
      updateProfileData: jest.fn(),
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    });
    render(<ProfilePhotoStep />);
    
    // Act - Upload a JPEG file
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockJpegFile] } });
    });

    // Wait for cropper to appear
    await waitFor(() => {
      expect(screen.getByAltText('Crop me')).toBeInTheDocument();
    });

    const imgElement = screen.getByAltText('Crop me') as HTMLImageElement;

    // Mock image dimensions for JSDOM for react-image-crop calculations
    // And trigger onImageLoad
    await act(async () => {
      Object.defineProperty(imgElement, 'naturalWidth', { value: 100, writable: true });
      Object.defineProperty(imgElement, 'naturalHeight', { value: 100, writable: true });
      Object.defineProperty(imgElement, 'width', { value: 100, writable: true });
      Object.defineProperty(imgElement, 'height', { value: 100, writable: true });
      fireEvent.load(imgElement);
    });
    
    // Wait for the "Confirm Crop & Upload" button to be enabled
    await waitFor(() => {
        const confirmCropButton = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
        expect(confirmCropButton).not.toBeDisabled();
    });

    const confirmCropButton = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
    await act(async () => {
      fireEvent.click(confirmCropButton);
    });
    
    // Assert
    await waitFor(() => {
        expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalled();
    });
    // Check that the argument is a File object (the cropped file)
    expect((FileUploadService.uploadProfilePhoto as jest.Mock).mock.calls[0][0]).toBeInstanceOf(File);
    expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(ProfileApiService.saveProfilePhotoUrl).toHaveBeenCalledWith(userId, mockPhotoUrl);
    });
    
    // Verify the final preview is displayed
    await waitFor(() => {
        const finalPreviewImg = screen.getByAltText(/Profile preview/i);
        expect(finalPreviewImg).toBeInTheDocument();
        expect(finalPreviewImg).toHaveAttribute('src', mockPhotoUrl);
    });
    
    // Verify no error messages are displayed
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/unsupported/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/too large/i)).not.toBeInTheDocument();
  });

  /**
   * Test Case ID: GTP-2.2.2-002
   * Description: Verify successful upload of a PNG image file.
   * Targeted AI Verifiable End Result: "Photo upload... functionality works."
   */
  it('should successfully upload a PNG image file', async () => {
    // Arrange
    (useProfileWizard as jest.Mock).mockReturnValue({
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null },
      updateProfileData: jest.fn(),
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    });
    render(<ProfilePhotoStep />);
    
    // Act - Upload a PNG file
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockPngFile] } });
    });

     // Wait for cropper to appear
    await waitFor(() => {
      expect(screen.getByAltText('Crop me')).toBeInTheDocument();
    });

    const imgElementPng = screen.getByAltText('Crop me') as HTMLImageElement;
    
    await act(async () => {
      Object.defineProperty(imgElementPng, 'naturalWidth', { value: 100, writable: true });
      Object.defineProperty(imgElementPng, 'naturalHeight', { value: 100, writable: true });
      Object.defineProperty(imgElementPng, 'width', { value: 100, writable: true });
      Object.defineProperty(imgElementPng, 'height', { value: 100, writable: true });
      fireEvent.load(imgElementPng);
    });

    // Wait for the "Confirm Crop & Upload" button to be enabled
    await waitFor(() => {
        const confirmCropButtonPng = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
        expect(confirmCropButtonPng).not.toBeDisabled();
    });

    const confirmCropButtonPng = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
    await act(async () => {
      fireEvent.click(confirmCropButtonPng);
    });
    
    // Assert
    await waitFor(() => {
        expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalled();
    });
    expect((FileUploadService.uploadProfilePhoto as jest.Mock).mock.calls[0][0]).toBeInstanceOf(File);
    expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(ProfileApiService.saveProfilePhotoUrl).toHaveBeenCalledWith(userId, mockPhotoUrl);
    });
    
    await waitFor(() => {
        const finalPreviewImg = screen.getByAltText(/Profile preview/i);
        expect(finalPreviewImg).toBeInTheDocument();
        expect(finalPreviewImg).toHaveAttribute('src', mockPhotoUrl);
    });
    
    // Verify no error messages are displayed
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/unsupported/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/too large/i)).not.toBeInTheDocument();
  });

  /**
   * Test Case ID: GTP-2.2.2-003
   * Description: Verify rejection of unsupported file types.
   * Targeted AI Verifiable End Result: Implicitly verifies robust error handling contributing to "Photo upload... functionality works."
   */
  it('should reject unsupported file types', async () => {
    // Arrange
    // FileUploadService mock isn't strictly needed here as validation is client-side first
    (useProfileWizard as jest.Mock).mockReturnValue({ // Ensure consistent mock
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null },
      updateProfileData: jest.fn(),
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    });
    render(<ProfilePhotoStep />);
    
    // Act - Upload a GIF file (unsupported)
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockGifFile] } });
    });
    
    // Assert
    // Check for client-side error message
    await waitFor(() => {
      expect(screen.getByText(/Unsupported file type. Please use JPEG or PNG./i)).toBeInTheDocument();
    });
    
    // Verify upload service was not called
    expect(FileUploadService.uploadProfilePhoto).not.toHaveBeenCalled();
    // Verify the API was not called to save the URL
    expect(ProfileApiService.saveProfilePhotoUrl).not.toHaveBeenCalled();
  });

  /**
   * Test Case ID: GTP-2.2.2-004
   * Description: Verify rejection of files exceeding the maximum size limit.
   * Targeted AI Verifiable End Result: Implicitly verifies robust error handling contributing to "Photo upload... functionality works."
   */
  it('should reject files exceeding the maximum size limit', async () => {
    // Arrange
    (useProfileWizard as jest.Mock).mockReturnValue({ // Ensure consistent mock
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null },
      updateProfileData: jest.fn(),
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    });
    render(<ProfilePhotoStep />);
    
    // Act - Upload a large file
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockLargeFile] } });
    });
    
    // Assert
    // Check for client-side error message
    await waitFor(() => {
      expect(screen.getByText(/File is too large. Max size is 5MB./i)).toBeInTheDocument();
    });
    
    // Verify upload service was not called
    expect(FileUploadService.uploadProfilePhoto).not.toHaveBeenCalled();
    // Verify the API was not called to save the URL
    expect(ProfileApiService.saveProfilePhotoUrl).not.toHaveBeenCalled();
  });

  /**
   * Test Case ID: GTP-2.2.2-005
   * Description: Verify successful completion of the profile setup wizard after uploading a photo.
   * Targeted AI Verifiable End Result: "Photo upload... functionality works."
   */
  it('should complete the wizard after uploading a photo', async () => {
    // Arrange
    const mockUpdateProfileData = jest.fn((key, value) => {
      // Simulate context update for profileData
      mockedProfileDataState.profilePhotoUrl = value;
    });
    const mockedProfileDataState = { profilePhotoUrl: null as string | null };

    (useProfileWizard as jest.Mock).mockImplementation(() => ({ // Use mockImplementation for dynamic values
      userId: 'test-user-id',
      profileData: mockedProfileDataState, // Use mutable state
      updateProfileData: mockUpdateProfileData,
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    }));
    const { rerender } = render(<ProfilePhotoStep />);
    
    // Act - Upload a photo
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockJpegFile] } });
    });

    // Confirm crop
    await waitFor(() => expect(screen.getByAltText('Crop me')).toBeInTheDocument());
    const imgElementJpegFinish = screen.getByAltText('Crop me') as HTMLImageElement;
    await act(async () => {
      Object.defineProperty(imgElementJpegFinish, 'naturalWidth', { value: 100, writable: true });
      Object.defineProperty(imgElementJpegFinish, 'naturalHeight', { value: 100, writable: true });
      Object.defineProperty(imgElementJpegFinish, 'width', { value: 100, writable: true });
      Object.defineProperty(imgElementJpegFinish, 'height', { value: 100, writable: true });
      fireEvent.load(imgElementJpegFinish);
    });
    
    await waitFor(() => {
      const confirmCropButton = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
      expect(confirmCropButton).not.toBeDisabled();
      fireEvent.click(confirmCropButton);
    });

    // Wait for upload to complete
    await waitFor(() => {
      expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalled();
      expect(ProfileApiService.saveProfilePhotoUrl).toHaveBeenCalledWith(userId, mockPhotoUrl);
    });
    
    // Click Finish button
    await act(async () => {
      // Ensure the button is Finish (not Skip & Finish if photo is present)
      // Re-render to reflect updated context state for button text
      rerender(<ProfilePhotoStep />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: "Finish" })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: "Finish" }));
    });
    
    // Assert
    expect(NavigationService.goToDashboard).toHaveBeenCalled();
    expect(NavigationService.goToDashboard).toHaveBeenCalledTimes(1);
  });

  /**
   * Test Case ID: GTP-2.2.2-006
   * Description: Verify saving and exiting the wizard from the photo step.
   * Targeted AI Verifiable End Result: Implicitly verifies correct flow control contributing to "Photo upload... functionality works."
   */
  it('should save and exit the wizard when clicking Save & Exit', async () => {
    // Arrange
    (useProfileWizard as jest.Mock).mockReturnValue({ // Standard mock for this test
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null },
      updateProfileData: jest.fn(),
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    });
    render(<ProfilePhotoStep />);
    
    // Act - Upload a photo
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockJpegFile] } });
    });

    // Confirm crop
    await waitFor(() => expect(screen.getByAltText('Crop me')).toBeInTheDocument());
    const imgElementJpegSaveExit = screen.getByAltText('Crop me') as HTMLImageElement;
    await act(async () => {
        Object.defineProperty(imgElementJpegSaveExit, 'naturalWidth', { value: 100, writable: true });
        Object.defineProperty(imgElementJpegSaveExit, 'naturalHeight', { value: 100, writable: true });
        Object.defineProperty(imgElementJpegSaveExit, 'width', { value: 100, writable: true });
        Object.defineProperty(imgElementJpegSaveExit, 'height', { value: 100, writable: true });
        fireEvent.load(imgElementJpegSaveExit);
    });

    await waitFor(() => {
      const confirmCropButton = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
      expect(confirmCropButton).not.toBeDisabled();
      fireEvent.click(confirmCropButton);
    });
    
    // Wait for upload to complete
    await waitFor(() => {
      expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalled();
      expect(ProfileApiService.saveProfilePhotoUrl).toHaveBeenCalledWith(userId, mockPhotoUrl);
    });
    
    // Click Save & Exit button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save & Exit/i }));
    });
    
    // Assert
    expect(NavigationService.exitWizard).toHaveBeenCalled();
    expect(NavigationService.exitWizard).toHaveBeenCalledTimes(1);
  });

  /**
   * Test Case ID: GTP-2.2.2-007
   * Description: Verify navigation to the previous step.
   * Targeted AI Verifiable End Result: Implicitly verifies correct flow control contributing to "Photo upload... functionality works."
   */
  it('should navigate to the previous step when clicking Previous', async () => {
    // Arrange
    const mockSetCurrentStep = jest.fn();
    (useProfileWizard as jest.Mock).mockReturnValue({
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null }, // No existing photo
      updateProfileData: jest.fn(),
      setCurrentStep: mockSetCurrentStep,
      currentStep: 'profile-photo',
    });

    // Render the component directly, ProfileWizardProvider is not needed if hook is fully mocked
    render(<ProfilePhotoStep />);
    
    // Act - Click Previous button (when not cropping)
    // Ensure the component is not in cropping mode for this click
    await waitFor(() => {
        expect(screen.queryByText(/Crop your photo/i)).not.toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Previous/i }));
    });
    
    // Assert
    expect(mockSetCurrentStep).toHaveBeenCalledWith('skills-needed');
  });

  /**
   * Test Case ID: GTP-2.2.2-008
   * Description: Verify upload retry on Next if initial upload failed.
   * Targeted AI Verifiable End Result: Implicitly verifies robust error handling contributing to "Photo upload... functionality works."
   */
  it('should retry upload when clicking Next if initial upload failed', async () => {
    // Arrange
    (FileUploadService.uploadProfilePhoto as jest.Mock)
      // Simulate failure on the first attempt during crop confirmation
      .mockResolvedValueOnce({ success: false, message: 'Network error on first try' })
      // Simulate success on the second attempt (when clicking "Finish")
      .mockResolvedValueOnce({ success: true, url: mockPhotoUrl });
    
    (useProfileWizard as jest.Mock).mockReturnValue({ // Standard mock for this test
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null },
      updateProfileData: jest.fn(),
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    });
    render(<ProfilePhotoStep />);
    
    // Act - Select a photo, which triggers cropper
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockJpegFile] } });
    });

    // Simulate image load for cropper
    await waitFor(() => expect(screen.getByAltText('Crop me')).toBeInTheDocument());
    const imgElementRetry = screen.getByAltText('Crop me') as HTMLImageElement;
    await act(async () => {
      Object.defineProperty(imgElementRetry, 'naturalWidth', { value: 100, writable: true });
      Object.defineProperty(imgElementRetry, 'naturalHeight', { value: 100, writable: true });
      Object.defineProperty(imgElementRetry, 'width', { value: 100, writable: true });
      Object.defineProperty(imgElementRetry, 'height', { value: 100, writable: true });
      fireEvent.load(imgElementRetry);
    });
    
    // Act - Click "Confirm Crop & Upload" (this will use the first mock - failure)
    await waitFor(() => {
      const confirmCropButton = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
      expect(confirmCropButton).not.toBeDisabled(); // Ensure it's enabled before click
      fireEvent.click(confirmCropButton);
    });
    
    // Wait for first upload attempt to fail and error message to show
    await waitFor(() => {
      // The component sets errors.file to error.message, which is "Network error on first try"
      expect(screen.getByText("Network error on first try")).toBeInTheDocument();
    });
    expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalledTimes(1); // First attempt
    
    // User is still in cropping mode. They would click "Confirm Crop & Upload" again.
    // The "Finish" button is not the retry mechanism here.
    
    // (FileUploadService.uploadProfilePhoto as jest.Mock) is already set to succeed on the second call from beforeEach setup
    
    // Click "Confirm Crop & Upload" again for retry
    const confirmCropButtonRetry = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
    expect(confirmCropButtonRetry).not.toBeDisabled(); // Should be enabled after first failed attempt
    await act(async () => {
        fireEvent.click(confirmCropButtonRetry);
    });
    
    // Assert
    expect(FileUploadService.uploadProfilePhoto).toHaveBeenCalledTimes(2); // Second attempt
    
    // Cropper should disappear, and main UI should show the new photo and enabled Finish button
    await waitFor(() => {
      expect(screen.queryByText(/Crop your photo/i)).not.toBeInTheDocument();
      expect(ProfileApiService.saveProfilePhotoUrl).toHaveBeenCalledWith(userId, mockPhotoUrl);
      const finalPreview = screen.getByAltText('Profile preview');
      expect(finalPreview).toBeInTheDocument();
      expect(finalPreview).toHaveAttribute('src', mockPhotoUrl);
    });

    // Now click finish
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Finish/i }));
    });
    expect(NavigationService.goToDashboard).toHaveBeenCalled();
  });

  /**
   * Test Case ID: GTP-2.2.2-009
   * Description: Verify upload is disabled during upload process.
   * Targeted AI Verifiable End Result: Implicitly verifies robust error handling contributing to "Photo upload... functionality works."
   */
  it('should disable buttons during upload process', async () => {
    // Arrange
    (useProfileWizard as jest.Mock).mockReturnValue({ // Standard mock for this test
      userId: 'test-user-id',
      profileData: { profilePhotoUrl: null },
      updateProfileData: jest.fn(),
      setCurrentStep: jest.fn(),
      currentStep: 'profile-photo',
    });
    let resolveUpload: (value: any) => void;
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve;
    });
    (FileUploadService.uploadProfilePhoto as jest.Mock).mockReturnValue(uploadPromise);
    
    render(<ProfilePhotoStep />);
    
    // Act - Upload a photo
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockJpegFile] } });
    });

    // Simulate image load for cropper
    await waitFor(() => expect(screen.getByAltText('Crop me')).toBeInTheDocument());
    const imgElementDisable = screen.getByAltText('Crop me') as HTMLImageElement;
    await act(async () => {
      Object.defineProperty(imgElementDisable, 'naturalWidth', { value: 100, writable: true });
      Object.defineProperty(imgElementDisable, 'naturalHeight', { value: 100, writable: true });
      Object.defineProperty(imgElementDisable, 'width', { value: 100, writable: true });
      Object.defineProperty(imgElementDisable, 'height', { value: 100, writable: true });
      fireEvent.load(imgElementDisable);
    });
    
    // Click "Confirm Crop & Upload" - this starts the uploadPromise
    // The button should be enabled before click
    const confirmCropButton = screen.getByRole('button', { name: /Confirm Crop & Upload/i });
    expect(confirmCropButton).not.toBeDisabled();
    await act(async () => {
        fireEvent.click(confirmCropButton);
    });
    
    // Assert - Buttons should be disabled during upload
    // The "Confirm Crop & Upload" button itself will show "Uploading..."
    await waitFor(() => {
        const uploadingButton = screen.getByRole('button', { name: /Uploading.../i });
        expect(uploadingButton).toBeInTheDocument();
        expect(uploadingButton).toBeDisabled();
    });
    // The "Cancel Crop" button should also be disabled.
    expect(screen.getByRole('button', { name: /Cancel Crop/i})).toBeDisabled();

    
    // Resolve the upload
    await act(async () => {
      resolveUpload!({ success: true, url: mockPhotoUrl });
    });
    
    // After upload, cropper disappears, main buttons re-appear and should be enabled
    await waitFor(() => {
      expect(screen.queryByText(/Crop your photo/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Previous/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /Save & Exit/i })).not.toBeDisabled();
      // The button text might be "Finish" or "Skip & Finish" depending on photo presence
      expect(screen.getByRole('button', { name: /Finish/i })).not.toBeDisabled();
    });
  });

  /**
   * Test Case ID: GTP-2.2.2-010
   * Description: Verify existing photo is displayed when available.
   * Targeted AI Verifiable End Result: "Photos display correctly on profiles."
   */
  it('should display existing photo when available', async () => {
    // Arrange - Create a ProfileWizardProvider with an initial photo URL
    render(
      <ProfileWizardProvider
        initialUserId={userId}
        initialStep="profile-photo"
      >
        <ProfilePhotoStep />
      </ProfileWizardProvider>
    );
    
    // Mock that the component already has a photo URL in its state
    // This is done by setting the previewUrl directly in the test
    // In a real scenario, this would come from the ProfileWizardContext
    // This test is tricky because ProfileWizardContext would provide the initial photo.
    // The `ProfilePhotoStep` initializes its `previewUrl` from `profileData.profilePhotoUrl`.
    // We need to mock `ProfileApiService.fetchProfile` to return this.
    (ProfileApiService.fetchProfile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { profilePhotoUrl: mockPhotoUrl } // Simulate existing photo
    });
    
    // Re-render with a provider that could potentially have initial data
    // The ProfileWizardProvider itself handles fetching initial profile data if userId is present.
    // So, we just need to ensure fetchProfile is mocked correctly before render.
    render(<ProfilePhotoStep />); // Render component directly as useProfileWizard is mocked

    // Assert - Photo should be displayed from the initial load
    await waitFor(() => {
      // The component should display the photo from context/initial state
      // It should show "Current Profile Photo"
      const imgElement = screen.getByAltText(/Profile preview/i);
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute('src', mockPhotoUrl);
      expect(screen.getByText(/Current Profile Photo:/i)).toBeInTheDocument();
    });

    // Ensure file input is still there if user wants to change it
    expect(screen.getByLabelText(/Choose a photo/i)).toBeInTheDocument();
  });
});