import { supabase } from '@/lib/supabase';

// Using UserProfilePlaceholder defined at the end of this file
const PROFILE_PHOTOS_BUCKET = 'profile-photos';

interface ProfileUpdateResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: any;
}

export const ProfileApiService = {
  // --- Existing methods (ensure mocks match these if they exist) ---
  saveBasicProfile: async (userId: string, data: Partial<UserProfilePlaceholder>): Promise<ProfileUpdateResult> => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error saving basic profile:', error);
        return { success: false, message: error.message, error };
      }
      return { success: true, data: profileData };
    } catch (error: any) {
      console.error('Unexpected error in saveBasicProfile:', error);
      return { success: false, message: error.message, error };
    }
  },

  fetchProfile: async (userId: string): Promise<ProfileUpdateResult> => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Resource not found
          return { success: true, data: null, message: 'Profile not found.' };
        }
        console.error('Error fetching profile:', error);
        return { success: false, message: error.message, error };
      }
      return { success: true, data: profileData };
    } catch (error: any) {
      console.error('Unexpected error in fetchProfile:', error);
      return { success: false, message: error.message, error };
    }
  },
  
  getUserProfileStatus: async (userId: string): Promise<{ completed: boolean, step: string | null }> => {
    // This is a placeholder implementation. Adapt based on your actual logic for profile status.
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('profile_setup_completed, last_completed_step')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile status:', error);
            return { completed: false, step: null }; // Or handle error appropriately
        }

        if (!profile) {
            return { completed: false, step: 'basic-info' }; // Example: default to first step if no profile
        }
        
        return { 
            completed: profile.profile_setup_completed || false, 
            step: profile.last_completed_step || 'basic-info' 
        };
    } catch (e) {
        console.error('Unexpected error in getUserProfileStatus:', e);
        return { completed: false, step: null };
    }
  },

  // --- Methods for Profile Photo ---
  saveProfilePhotoUrl: async (userId: string, photoUrl: string): Promise<ProfileUpdateResult> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ profile_photo_url: photoUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('profile_photo_url')
        .single();

      if (error) {
        console.error('Error saving profile photo URL:', error);
        return { success: false, message: error.message, error };
      }
      return { success: true, data };
    } catch (error: any) {
      console.error('Unexpected error in saveProfilePhotoUrl:', error);
      return { success: false, message: error.message, error };
    }
  },

  deleteProfilePhoto: async (userId: string): Promise<ProfileUpdateResult> => {
    try {
      // 1. Get current photo URL to delete from storage
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('profile_photo_url')
        .eq('id', userId)
        .single();

      if (fetchError || !currentProfile) {
        console.warn('Could not fetch profile or profile photo URL for deletion:', fetchError);
        // Proceed to clear DB link even if file URL is missing or profile not found
      }

      const oldPhotoUrl = currentProfile?.profile_photo_url;

      // 2. Update profile to remove photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: null, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('Error clearing profile photo URL in DB:', updateError);
        return { success: false, message: 'Failed to update profile.', error: updateError };
      }

      // 3. Delete the old file from Supabase Storage if URL existed
      if (oldPhotoUrl) {
        try {
          // Extract the file path from the URL.
          // Example URL: https://<project-ref>.supabase.co/storage/v1/object/public/profile-photos/public/<filename>
          const urlParts = oldPhotoUrl.split('/');
          const fileNameWithBucketFolder = urlParts.slice(urlParts.indexOf(PROFILE_PHOTOS_BUCKET) + 1).join('/');
          
          if (fileNameWithBucketFolder) {
            const { error: deleteStorageError } = await supabase.storage
              .from(PROFILE_PHOTOS_BUCKET)
              .remove([fileNameWithBucketFolder]); // .remove expects an array of paths

            if (deleteStorageError) {
              // Log error but don't fail the whole operation if DB update was successful
              console.error('Error deleting photo from Supabase Storage:', deleteStorageError);
              // Potentially return a partial success or warning
            }
          } else {
             console.warn('Could not parse file path from URL for deletion:', oldPhotoUrl);
          }
        } catch (storageError) {
            console.error('Exception during storage file deletion:', storageError);
        }
      }
      
      return { success: true, message: 'Profile photo deleted successfully.' };
    } catch (error: any) {
      console.error('Unexpected error in deleteProfilePhoto:', error);
      return { success: false, message: error.message, error };
    }
  },
};

// Define a basic UserProfile type if not already defined elsewhere
// This is just for illustration; use your actual project's type.
export interface UserProfilePlaceholder {
  id: string;
  username?: string;
  full_name?: string;
  profile_photo_url?: string | null;
  // ... other profile fields
  profile_setup_completed?: boolean;
  last_completed_step?: string;
  updated_at?: string;
}