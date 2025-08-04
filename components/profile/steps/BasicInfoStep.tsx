'use client';

import React, { useState } from 'react';
import { useProfileWizard } from '../ProfileWizardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea component exists
import { Label } from '@/components/ui/label';

// Services - these will be mocked by Jest in the test environment
import { ValidationService } from '@/lib/validation';
import { ProfileApiService } from '@/lib/api/profileApi';
import { NavigationService } from '@/lib/navigation';


interface BasicInfoData {
  full_name: string;
  bio: string;
  // Add other fields as per actual requirements/database schema
}

const BasicInfoStep: React.FC = () => {
  const { userId, profileData, updateProfileData, setCurrentStep, setUserId } = useProfileWizard();
  const [formData, setFormData] = useState<BasicInfoData>({
    full_name: profileData.basicInfo?.full_name || '',
    bio: profileData.basicInfo?.bio || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BasicInfoData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof BasicInfoData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNext = async () => {
    const validationResult = ValidationService.validateBasicInfo(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    
    setErrors({}); // Clear previous errors

    if (!userId) {
      console.error("User ID is missing");
      setErrors({ form: "User ID not found. Cannot save." } as any); // Show form-level error
      return;
    }

    try {
      await ProfileApiService.saveBasicProfile({ id: userId, ...formData });
      updateProfileData('basic-info', formData);
      setCurrentStep('location');
    } catch (error) {
      console.error("Error saving basic info:", error);
      setErrors({ form: "Failed to save basic information. Please try again." } as any);
    }
  };

  const handleSaveAndExit = async () => {
    if (!userId) {
        console.error("User ID is missing for save and exit");
        setErrors({ form: "User ID not found. Cannot save." } as any);
        return;
    }
    const validationResult = ValidationService.validateBasicInfo(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    setErrors({});
    try {
        await ProfileApiService.saveBasicProfile({ id: userId, ...formData });
        updateProfileData('basic-info', formData);
        NavigationService.exitWizard(); // Call the mocked navigation service
        // alert("Data saved! Exiting wizard (actual navigation to be implemented via context or router).");
    } catch (error) {
        console.error("Error saving basic info on exit:", error);
        setErrors({ form: "Failed to save basic information on exit. Please try again." } as any);
    }
  };


  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            type="text"
            name="full_name"
            id="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="e.g., Jane Doe"
            className={errors.full_name ? 'border-red-500' : ''}
          />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            name="bio"
            id="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a little about yourself..."
            rows={4}
            className={errors.bio ? 'border-red-500' : ''}
          />
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
        </div>
        {/* {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>} */}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={handleSaveAndExit}>Save & Exit</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;