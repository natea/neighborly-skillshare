import { supabase } from '@/lib/supabase';

const PROFILE_PHOTOS_BUCKET = 'profile-photos';

interface FileUploadResult {
  success: boolean;
  url?: string;
  message?: string;
  error?: any;
}

export const FileUploadService = {
  uploadProfilePhoto: async (file: File): Promise<FileUploadResult> => {
    try {
      if (!file) {
        return { success: false, message: 'No file provided for upload.' };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`; // 'public' folder within the bucket for public access

      const { data, error: uploadError } = await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: true, // Overwrite if file with same name exists (though unlikely with timestamp)
        });

      if (uploadError) {
        console.error('Error uploading file to Supabase Storage:', uploadError);
        return { success: false, message: uploadError.message || 'Supabase storage upload failed.', error: uploadError };
      }

      if (!data?.path) {
        console.error('Supabase storage upload returned no path:', data);
        return { success: false, message: 'Supabase storage upload returned no path.' };
      }
      
      // Construct the public URL
      // Note: Ensure RLS policies on Supabase allow public read access to this bucket/path
      const { data: urlData } = supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        console.error('Failed to get public URL for uploaded file:', data.path);
        return { success: false, message: 'Failed to get public URL for uploaded file.' };
      }
      
      return { success: true, url: urlData.publicUrl };

    } catch (error: any) {
      console.error('Unexpected error in uploadProfilePhoto:', error);
      return { success: false, message: error.message || 'An unexpected error occurred during file upload.', error };
    }
  },
};