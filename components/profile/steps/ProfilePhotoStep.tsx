'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useProfileWizard } from '../ProfileWizardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '@/lib/imageUtils'; // Import the utility

// Services
import { ProfileApiService } from '@/lib/api/profileApi';
import { FileUploadService } from '@/lib/api/fileUploadApi';
import { NavigationService } from '@/lib/navigation';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

// getCroppedImg is now imported from '@/lib/imageUtils'

const ProfilePhotoStep: React.FC = () => {
  const { userId, profileData, updateProfileData, setCurrentStep } = useProfileWizard();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string>(''); // For react-image-crop
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Initialize to null
  const [isUploading, setIsUploading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Sync previewUrl with profileData from context
    if (profileData && profileData.profilePhotoUrl) {
      setPreviewUrl(profileData.profilePhotoUrl);
    } else {
      // If there's no photo in context (e.g., after deletion or initial load without photo),
      // and we are not in cropping mode, ensure previewUrl is null.
      if (!isCropping && !imgSrc) { // Avoid clearing preview if user is about to crop a new image
          setPreviewUrl(null);
      }
    }
  }, [profileData, profileData?.profilePhotoUrl, isCropping, imgSrc]);


  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1 / 1, // Aspect ratio 1:1 for square
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
    setCompletedCrop(newCrop); // Initialize completedCrop
  };


  const uploadPhoto = useCallback(async (fileToUpload: File): Promise<string | null> => {
    if (!userId) {
      console.error("User ID is missing for photo upload");
      setErrors({ file: "User session error. Please try again." });
      return null;
    }
    setIsUploading(true);
    setErrors({});
    try {
      const uploadResult = await FileUploadService.uploadProfilePhoto(fileToUpload);
      if (!uploadResult?.success) { // If not successful, there should be a message
        throw new Error(uploadResult?.message || "File upload failed. Please try again.");
      }
      // If successful, URL must be present
      if (!uploadResult.url) {
          console.error("File upload succeeded but URL is missing", uploadResult);
          throw new Error("File upload succeeded but URL was not returned. Please try again.");
      }
      const photoUrl = uploadResult.url;
      
      await ProfileApiService.saveProfilePhotoUrl(userId, photoUrl);
      updateProfileData('profile-photo', photoUrl);
      setPreviewUrl(photoUrl);
      setIsCropping(false); // Done with cropping and uploading
      setImgSrc(''); // Clear cropper image
      setSelectedFile(null); // Clear selected file
      return photoUrl;
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      setErrors({ file: error.message || "Failed to upload photo. Please try again." });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [userId, updateProfileData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setErrors({});

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setErrors({ file: `Unsupported file type. Please use JPEG or PNG.` });
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrors({ file: `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.` });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(null); // Clear old final preview
      setCrop(undefined); // Reset crop
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
      setIsCropping(true);
    }
  };

  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current || !selectedFile) {
      setErrors({ file: "Cropping error or no file selected." });
      return;
    }
    const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop, selectedFile.name);
    if (croppedImageFile) {
      await uploadPhoto(croppedImageFile);
    } else {
      setErrors({ file: "Could not crop image."});
    }
  };

  const handleDeletePhoto = async () => {
    if (!userId) {
      setErrors({ file: "User session error." });
      return;
    }
    setIsUploading(true);
    setErrors({});
    try {
      // Assuming ProfileApiService.deleteProfilePhoto handles DB update and Supabase storage deletion
      const result = await ProfileApiService.deleteProfilePhoto(userId);
      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to delete photo.');
      }
      updateProfileData('profile-photo', null);
      setPreviewUrl(null);
      setSelectedFile(null);
      setImgSrc('');
      setIsCropping(false);
      setCrop(undefined);
       setErrors({});
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      setErrors({ file: error.message || "Failed to delete photo." });
    } finally {
      setIsUploading(false);
    }
  };


  const handleNext = async () => {
    setErrors({});
    if (isCropping && selectedFile) { // If in cropping mode, user must confirm or cancel
        setErrors({ file: "Please confirm or cancel cropping before proceeding."});
        return;
    }
    // If not cropping and no errors, proceed
    if (!profileData.profilePhotoUrl && errors.file) { // Check if there was a persistent error from a previous attempt
        // This case should ideally be handled by disabling Next or clearing error on new file select
        // For now, just show the error again if trying to proceed with it.
        return;
    }
    NavigationService.goToDashboard();
  };

  const handlePrevious = () => {
    if (isCropping) { // If cropping, cancel it
        setIsCropping(false);
        setImgSrc('');
        setSelectedFile(null);
        setCrop(undefined);
        setErrors({});
        // Restore previous preview if available
        if (profileData.profilePhotoUrl) setPreviewUrl(profileData.profilePhotoUrl);
        return;
    }
    setCurrentStep('skills-needed');
  };

  const handleSaveAndExit = async () => {
    if (isCropping && selectedFile) {
        setErrors({ file: "Please confirm or cancel cropping before saving."});
        return;
    }
    NavigationService.exitWizard();
  };
  
  const handleCancelCrop = () => {
    setIsCropping(false);
    setImgSrc('');
    setSelectedFile(null);
    setCrop(undefined);
    setErrors({});
    // Restore previous preview if available
    if (profileData.profilePhotoUrl) {
        setPreviewUrl(profileData.profilePhotoUrl);
    } else {
        setPreviewUrl(null); // Or clear it if there was no previous photo
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a photo for your profile (JPEG/PNG, max {MAX_FILE_SIZE_MB}MB). This helps build trust in the community.
      </p>
      <div className="space-y-4">
        {!isCropping && (
          <div>
            <Label htmlFor="profilePhoto" className="block mb-2">Choose a photo</Label>
            <Input
              type="file"
              name="profilePhoto"
              id="profilePhoto"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
          </div>
        )}

        {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}

        {isCropping && imgSrc && (
          <div className="mt-4">
            <p className="text-sm mb-2 font-semibold">Crop your photo (Square):</p>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Square aspect ratio
              minWidth={100} // Minimum crop width in pixels
              minHeight={100} // Minimum crop height in pixels
              circularCrop={true} // Optional: for circular preview appearance
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </ReactCrop>
            <div className="mt-4 flex justify-center space-x-2">
              <Button onClick={handleCropAndUpload} disabled={isUploading || !completedCrop}>
                {isUploading ? 'Uploading...' : 'Confirm Crop & Upload'}
              </Button>
              <Button variant="outline" onClick={handleCancelCrop} disabled={isUploading}>
                Cancel Crop
              </Button>
            </div>
          </div>
        )}

        {!isCropping && previewUrl && (
          <div className="mt-4 text-center">
            <p className="text-sm mb-2">Current Profile Photo:</p>
            <Image
              src={previewUrl}
              alt="Profile preview"
              width={150}
              height={150}
              className="rounded-full mx-auto object-cover"
            />
            <Button 
              variant="link" 
              onClick={handleDeletePhoto} 
              disabled={isUploading}
              className="text-red-500 hover:text-red-700 mt-2"
            >
              Delete Photo
            </Button>
          </div>
        )}
         {!isCropping && !previewUrl && !imgSrc && (
            <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">No profile photo uploaded yet.</p>
            </div>
        )}
      </div>

      {!isCropping && (
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={isUploading}>Previous</Button>
          <Button variant="outline" onClick={handleSaveAndExit} disabled={isUploading}>Save & Exit</Button>
          <Button onClick={handleNext} disabled={isUploading}>
            {isUploading ? 'Processing...' : (profileData.profilePhotoUrl ? 'Finish' : 'Skip & Finish')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoStep;