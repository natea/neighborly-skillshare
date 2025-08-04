// This is a placeholder to satisfy TypeScript imports.
// Actual implementation or mocks are handled by Jest in tests.

export const LocationApiService = {
  saveLocation: async (data: any) => {
    console.log('Mock LocationApiService.saveLocation called with:', data);
    return { success: true, data };
  },
  // Add other location-related API methods if needed
};

export default LocationApiService;