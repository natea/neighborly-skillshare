'use client';

import React, { useState } from 'react';
import { useProfileWizard } from '../ProfileWizardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react'; // For remove button icon

// Services - these will be mocked by Jest in the test environment
import { ValidationService } from '@/lib/validation';
import { SkillApiService } from '@/lib/api/skillApi';
import { NavigationService } from '@/lib/navigation';

interface SkillOffer {
  id?: string; // Optional: if skill already exists and has an ID from DB
  title: string;
  description: string;
  exchange_type: 'barter' | 'volunteer' | 'paid'; // Example types
  // Add other fields like category, experience_level, etc.
}

const SkillsOfferedStep: React.FC = () => {
  const { userId, profileData, updateProfileData, setCurrentStep } = useProfileWizard();
  const [skills, setSkills] = useState<SkillOffer[]>(profileData.skillsOffered || []);
  const [currentSkill, setCurrentSkill] = useState<Partial<SkillOffer>>({
    title: '',
    description: '',
    exchange_type: 'barter',
  });
  const [errors, setErrors] = useState<any>({}); // More complex error state for list of skills

  const handleCurrentSkillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentSkill(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    // Basic validation for current skill before adding
    if (!currentSkill.title || !currentSkill.description) {
      setErrors({ ...errors, currentSkill: "Title and description are required for each skill." });
      return;
    }
    setSkills(prev => [...prev, currentSkill as SkillOffer]);
    setCurrentSkill({ title: '', description: '', exchange_type: 'barter' }); // Reset form
    setErrors({ ...errors, currentSkill: undefined });
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    const validationResult = ValidationService.validateSkillsOffered(skills);
    if (!validationResult.isValid) {
      // The mock returns errors as an object, but this step might need array-based errors or a general form error
      setErrors(validationResult.errors || { form: "Validation failed for skills offered." });
      return;
    }
    setErrors({});

    if (!userId) {
      console.error("User ID is missing");
      setErrors({ form: "User ID not found. Cannot save." });
      return;
    }

    try {
      await SkillApiService.saveSkillOffers({ user_id: userId, skills });
      updateProfileData('skills-offered', skills);
      setCurrentStep('skills-needed');
    } catch (error) {
      console.error("Error saving skills offered:", error);
      setErrors({ form: "Failed to save skills offered. Please try again." });
    }
  };

  const handlePrevious = () => {
    setCurrentStep('location');
  };

  const handleSaveAndExit = async () => {
    if (!userId) {
        console.error("User ID is missing");
        setErrors({ form: "User ID not found. Cannot save." });
        return;
    }
    const validationResult = ValidationService.validateSkillsOffered(skills);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors || { form: "Validation failed for skills offered." });
      return;
    }
    setErrors({});
    try {
        await SkillApiService.saveSkillOffers({ user_id: userId, skills });
        updateProfileData('skills-offered', skills);
        NavigationService.exitWizard();
        // alert("Data saved! Exiting wizard (actual navigation to be implemented).");
    } catch (error) {
        console.error("Error saving skills offered on exit:", error);
        setErrors({ form: "Failed to save skills offered on exit. Please try again." });
    }
  };


  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Skills You Can Offer</h2>
      <p className="text-sm text-muted-foreground mb-4">
        List skills you're willing to share with your community.
      </p>

      <div className="space-y-4 mb-6 p-4 border rounded-md">
        <h3 className="text-lg font-medium">Add a New Skill to Offer</h3>
        <div>
          <Label htmlFor="skillTitle">Skill Title</Label>
          <Input
            type="text"
            name="title"
            id="skillTitle"
            value={currentSkill.title || ''}
            onChange={handleCurrentSkillChange}
            placeholder="e.g., Web Development, Gardening, Tutoring"
          />
        </div>
        <div>
          <Label htmlFor="skillDescription">Description</Label>
          <Textarea
            name="description"
            id="skillDescription"
            value={currentSkill.description || ''}
            onChange={handleCurrentSkillChange}
            placeholder="Briefly describe your skill and experience"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="exchangeType">Exchange Type</Label>
          <select
            name="exchange_type"
            id="exchangeType"
            value={currentSkill.exchange_type || 'barter'}
            onChange={handleCurrentSkillChange}
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="barter">Barter (Trade for other skills/goods)</option>
            <option value="volunteer">Volunteer (Offer for free)</option>
            <option value="paid">Paid (Specify your rate if applicable)</option>
          </select>
        </div>
        {errors.currentSkill && <p className="text-red-500 text-sm mt-1">{errors.currentSkill}</p>}
        <Button onClick={handleAddSkill} variant="outline" size="sm">Add Skill to List</Button>
      </div>

      {skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Your Offered Skills:</h3>
          <ul className="space-y-2">
            {skills.map((skill, index) => (
              <li key={index} className="p-3 border rounded-md flex justify-between items-center bg-slate-50">
                <div>
                  <p className="font-semibold">{skill.title} <span className="text-xs font-normal text-gray-600">({skill.exchange_type})</span></p>
                  <p className="text-sm text-gray-700">{skill.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveSkill(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>} */}


      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={handlePrevious}>Previous</Button>
        <Button variant="outline" onClick={handleSaveAndExit}>Save & Exit</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
};

export default SkillsOfferedStep;