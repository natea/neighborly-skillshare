# Feature Overview Specification: Profile Photo Upload and Management

**Feature Name:** Implement profile photo upload and management
**Master Project Plan Task ID:** 2.2.2
**Version:** 1.0
**Date:** May 20, 2025

## 1. Feature Overview

This document outlines the specifications for the "Profile Photo Upload and Management" feature. This feature will allow users to upload, crop, display, and manage a personal photo for their user profile within the Neighborly Skillshare platform. The goal is to enhance user profiles, making them more personal and recognizable, thereby fostering a greater sense of community and trust.

This feature aligns with the Master Project Plan task 2.2.2: "Implement profile photo upload and management," which has the AI-Verifiable End Result: "Photo upload, cropping, and storage functionality works. Photos display correctly on profiles."

## 2. User Stories

*   **As a new user,** I want to upload a profile photo during the profile setup process so that other users can easily identify me.
*   **As an existing user,** I want to upload a new profile photo to replace my current one so that my profile reflects my current appearance.
*   **As a user,** I want to crop my uploaded photo to ensure the main subject is centered and fits a standard aspect ratio (e.g., square) so that my profile picture looks professional and consistent across the platform.
*   **As a user,** I want to see my profile photo displayed on my profile page and in other relevant areas (e.g., message headers, search results) so that my identity is visually represented.
*   **As a user,** I want to delete my current profile photo if I no longer wish to display one, so I have control over my personal information.
*   **As a user,** I want to be informed about supported image formats and maximum file sizes so I can successfully upload a photo.

## 3. Acceptance Criteria

*   Users can successfully upload an image file in JPEG or PNG format.
*   The system prevents uploads of files exceeding 5MB.
*   Users are presented with a basic cropping tool (e.g., square aspect ratio) after uploading a photo.
*   Cropped photos are saved and stored securely (e.g., using Supabase Storage).
*   The user's chosen profile photo is displayed on their profile page.
*   The user's profile photo is displayed in other relevant UI components where user identification is needed (e.g., next to their name in search results, message threads).
*   Users can replace their existing profile photo with a new one.
*   Users can delete their current profile photo, reverting to a default placeholder if applicable.
*   Appropriate error messages are displayed for failed uploads (e.g., unsupported format, file too large).
*   The photo upload interface clearly indicates supported file formats and size limits.

## 4. Functional Requirements

### 4.1 Photo Upload
*   **FR1.1:** The system MUST allow users to select an image file from their local device.
*   **FR1.2:** The system MUST support JPEG and PNG image formats.
*   **FR1.3:** The system MUST enforce a maximum file size limit of 5MB.
*   **FR1.4:** The system MUST provide clear feedback to the user regarding supported formats and file size limits before or during the upload process.
*   **FR1.5:** The system MUST display an error message if the user attempts to upload an unsupported file format or a file exceeding the size limit.
*   **FR1.6:** A preview of the selected image should be displayed before final upload/cropping.

### 4.2 Basic Cropping Functionality
*   **FR2.1:** After a successful image selection, the system MUST present a basic cropping interface.
*   **FR2.2:** The cropping tool MUST enforce a square aspect ratio for the final profile photo.
*   **FR2.3:** Users MUST be able to adjust the crop area (e.g., move and resize the selection within the uploaded image, maintaining the square aspect ratio).
*   **FR2.4:** The system MUST provide a preview of the cropped image.
*   **FR2.5:** Users MUST be able to confirm or cancel the cropping operation.

### 4.3 Storage Considerations
*   **FR3.1:** Cropped profile photos MUST be stored securely. Supabase Storage is the designated storage solution.
*   **FR3.2:** Stored photos MUST be associated with the correct user account.
*   **FR3.3:** The system SHOULD optimize images for web display (e.g., compression, appropriate resolution) before storing, to save storage space and improve loading times, while maintaining acceptable visual quality.
*   **FR3.4:** Access to stored photos MUST be appropriately restricted (e.g., users can only manage their own photos, public read access for display).

### 4.4 Display on User Profiles
*   **FR4.1:** The user's current profile photo MUST be displayed prominently on their main profile page.
*   **FR4.2:** The profile photo MUST also be displayed in other relevant parts of the application where user identification is beneficial, such as:
    *   User avatars in message lists and conversation views.
    *   User avatars in search results for skills or users.
    *   User avatars next to reviews or comments.
*   **FR4.3:** If a user has not uploaded a profile photo, a default placeholder image/icon MUST be displayed.

### 4.5 Deletion/Replacement of Profile Photos
*   **FR5.1:** Users MUST be able to upload a new photo to replace their existing profile photo. The new photo will go through the same upload and cropping process.
*   **FR5.2:** Users MUST be able to delete their current profile photo.
*   **FR5.3:** Upon deletion, the system SHOULD revert to displaying the default placeholder image for that user.
*   **FR5.4:** The actual image file in storage associated with the deleted photo SHOULD be removed or marked for removal according to data retention policies.

## 5. Non-Functional Requirements

### 5.1 Performance
*   **NFR1.1:** Photo upload process (including selection, preview, and initial transfer) should feel responsive, ideally completing initial upload to server for cropping within 5-10 seconds for a 5MB file on a typical broadband connection.
*   **NFR1.2:** Cropping interface should be smooth and responsive to user interactions.
*   **NFR1.3:** Profile photos should load quickly on profile pages and other UI elements (e.g., <1 second for the image itself after page load).

### 5.2 Security
*   **NFR2.1:** Uploaded files should be scanned for potential malware or malicious content if feasible.
*   **NFR2.2:** Only authenticated users should be able to upload, change, or delete their own profile photo.
*   **NFR2.3:** Direct access to image files in storage should be appropriately controlled to prevent unauthorized access or enumeration.

### 5.3 Usability
*   **NFR3.1:** The photo upload and management process should be intuitive and require minimal instruction.
*   **NFR3.2:** Clear visual feedback should be provided during upload, processing, and saving.
*   **NFR3.3:** Error messages should be user-friendly and guide the user on how to resolve the issue.
*   **NFR3.4:** The feature should be accessible, adhering to WCAG AA guidelines where applicable (e.g., keyboard navigation for controls, alt text for images where appropriate, though profile images are often decorative).

### 5.4 Scalability
*   **NFR4.1:** The storage solution (Supabase Storage) must be able to handle a growing number of user photos without performance degradation.

### 5.5 Data Integrity
*   **NFR5.1:** The link between a user and their profile photo must be maintained accurately in the database.
*   **NFR5.2:** Old profile photos should be properly handled (e.g., deleted from storage) when a new photo is uploaded or the photo is deleted, to avoid orphaned files, unless a history feature is explicitly planned (which is out of scope for this MVP task).

## 6. Scope

### 6.1 In Scope
*   Uploading JPEG and PNG images.
*   Maximum file size of 5MB.
*   Basic square aspect ratio cropping.
*   Storing photos in Supabase Storage.
*   Displaying photos on user profiles and other relevant UI locations.
*   Replacing an existing profile photo.
*   Deleting a profile photo (reverting to default).
*   Error handling for upload issues.
*   Frontend UI for all the above interactions.
*   Backend API endpoints to support these functionalities.

### 6.2 Out of Scope
*   Advanced image editing features (filters, rotation, brightness/contrast adjustments, etc.).
*   Support for animated GIFs or other image formats beyond JPEG/PNG.
*   Profile photo approval/moderation workflow (unless specified elsewhere as a platform-wide trust & safety feature).
*   Storing a history of previous profile photos.
*   Automatic face detection for centering.
*   Bulk photo uploads.
*   Using photos from external services (e.g., social media import).

## 7. Dependencies

*   **User Authentication System (Task 2.1.x):** Users must be authenticated to manage their profile photos.
*   **Profile Creation & Management (Task 2.2.x):** This feature is an integral part of user profile management.
*   **Supabase Infrastructure (Task 1.1.2, 1.3.3):** Supabase project and storage buckets must be configured and accessible.
*   **Frontend UI Component Library (Task 1.3.5):** May leverage existing UI components for buttons, modals, etc.
*   **API Infrastructure (Task 1.2.4):** Backend APIs will be needed to handle uploads and data persistence.

## 8. UI/UX Considerations (High-Level)

*   The upload interface should be easily discoverable within the profile editing section and potentially during the profile setup wizard ([`components/profile/steps/ProfilePhotoStep.tsx`](components/profile/steps/ProfilePhotoStep.tsx) seems relevant).
*   Provide a clear call-to-action (e.g., "Upload Photo," "Change Photo").
*   Visual feedback during upload (e.g., progress bar) is important.
*   The cropping tool should be simple and intuitive, with clear "Save" and "Cancel" actions.
*   Display a preview of the photo as it will appear on the profile before final confirmation.
*   Consider how the photo will look in various sizes and contexts (e.g., small avatar, larger profile display).
*   Ensure the interface is responsive and works well on both desktop and mobile devices.

## 9. API Design Notes (High-Level)

*   **`POST /api/users/profile/photo`**:
    *   Handles new photo uploads.
    *   Expects multipart/form-data with the image file.
    *   Authenticates the user.
    *   Validates file type and size.
    *   Temporarily stores the uploaded image for cropping if client-side cropping isn't sufficient or if server-side processing is preferred for optimization/security.
    *   If cropping is handled server-side, this endpoint might take crop parameters.
    *   Saves the final (potentially cropped and optimized) image to Supabase Storage.
    *   Updates the user's profile record in the database with the URL or identifier of the new photo.
    *   Returns the URL of the new photo or a success status.
*   **`DELETE /api/users/profile/photo`**:
    *   Deletes the current user's profile photo.
    *   Authenticates the user.
    *   Removes the photo reference from the user's profile record in the database.
    *   Deletes the actual image file from Supabase Storage.
    *   Returns a success status.

(Note: Specific implementation details, such as whether cropping parameters are sent with the initial upload or in a subsequent call after client-side cropping, will be determined during detailed design and implementation.)