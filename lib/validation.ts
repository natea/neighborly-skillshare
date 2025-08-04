// This is a placeholder to satisfy TypeScript imports.
// Actual implementation or mocks are handled by Jest in tests.

interface ValidationResult {
  isValid: boolean;
  errors: any; // Replace 'any' with a more specific error type if possible
}

export const ValidationService = {
  validateBasicInfo: (data: any): ValidationResult => {
    console.log('Mock ValidationService.validateBasicInfo called with:', data);
    const errors: any = {};
    if (!data.full_name) errors.full_name = "Full name is required.";
    // Add more validation rules as needed
    return { isValid: Object.keys(errors).length === 0, errors };
  },
  validateLocation: (data: any): ValidationResult => {
    console.log('Mock ValidationService.validateLocation called with:', data);
    const errors: any = {};
    if (!data.address_text) errors.address_text = "Address is required.";
    // Add more validation rules
    return { isValid: Object.keys(errors).length === 0, errors };
  },
  validateSkillsOffered: (data: any[]): ValidationResult => {
    console.log('Mock ValidationService.validateSkillsOffered called with:', data);
    // Example: ensure at least one skill is offered, or validate individual skills
    const errors: any = {};
    if (data.length === 0) errors.form = "Please offer at least one skill.";
    return { isValid: Object.keys(errors).length === 0, errors };
  },
  validateSkillsNeeded: (data: any[]): ValidationResult => {
    console.log('Mock ValidationService.validateSkillsNeeded called with:', data);
    const errors: any = {};
    if (data.length === 0) errors.form = "Please list at least one skill you need.";
    return { isValid: Object.keys(errors).length === 0, errors };
  },
  validateLastStep: (data: any): ValidationResult => { // e.g. for profile photo or confirmation
    console.log('Mock ValidationService.validateLastStep called with:', data);
    const errors: any = {};
    // if (!data.photoUrl) errors.photo = "Profile photo is recommended."; // Example
    return { isValid: Object.keys(errors).length === 0, errors };
  },
};

export default ValidationService;