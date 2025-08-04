# Granular Test Plan: Implement Profile Photo Upload and Management

**Feature Name:** Implement profile photo upload and management
**Master Project Plan Task ID:** 2.2.2
**Version:** 1.0
**Date:** May 20, 2025

## 1. Introduction and Scope

This Granular Test Plan (GTP) details the testing strategy and specific test cases for the "Implement profile photo upload and management" feature, as defined in the [Feature Overview Specification: Profile Photo Upload and Management](docs/specs/feature_2_2_2_profile_photo_upload.md). This feature is a key component of the User Management System phase (Phase 2) in the [Master Project Plan (MPP)](docs/master_project_plan.md), specifically addressing Task ID 2.2.2.

The scope of this test plan is to verify the correct implementation and behavior of the components responsible for handling profile photo uploads, basic cropping, secure storage, display, replacement, and deletion.

This test plan directly targets the verification of the following AI Verifiable End Result from the Master Project Plan:

*   **MPP Task ID 2.2.2:** "Photo upload, cropping, and storage functionality works. Photos display correctly on profiles."

By successfully executing the test cases outlined in this document, we will gain confidence that the granular components and interactions related to profile photo management are functioning as expected, contributing to the achievement of the higher-level AI Verifiable End Result for MPP Task 2.2.2 and ultimately supporting the [HLT-001: User Registration and Profile Completion](docs/testing/high_level_acceptance_tests/hlt_user_registration_and_profile_completion.md) acceptance test.

## 2. Test Strategy

The testing strategy for this feature adheres to the principles of the London School of Test-Driven Development (TDD). This approach emphasizes testing the behavior of a unit (e.g., a component, a service function, an API handler) through its interactions with its collaborators.

Key aspects of this strategy include:

*   **Interaction Testing:** Tests will focus on verifying that a unit makes the correct calls to its dependencies (collaborators) with the expected arguments and handles the responses appropriately.
*   **Mocking Collaborators:** Dependencies (such as API services, storage clients, utility functions) will be replaced with mocks or stubs during unit testing. This isolates the unit under test, ensuring that tests fail only if the unit's logic or interactions are incorrect, not due to issues in its dependencies.
*   **Verifying Observable Outcomes:** Tests will assert on the observable outcomes of the unit's behavior, such as:
    *   State changes within the unit or related data structures.
    *   Return values from the unit's methods.
    *   Side effects resulting from interactions with mocked collaborators (e.g., verifying that a specific API call was made).
    *   Rendering changes in UI components based on props or state (for component tests).
*   **Focus on AI Verifiable End Results:** Each test case is designed to contribute to verifying a specific aspect of the AI Verifiable End Result for MPP Task 2.2.2. The successful execution of these tests provides concrete, verifiable evidence that the feature is meeting its defined outcomes at a granular level.

This granular testing, focused on unit and integration tests using mocking, forms a critical layer beneath the higher-level acceptance tests. Passing these granular tests provides confidence in the building blocks before validating the complete user flows.

## 3. Recursive Testing Strategy (Frequent Regression)

A comprehensive recursive testing strategy is crucial to ensure the ongoing stability of the profile photo management feature as the project evolves. This involves frequently re-executing relevant test suites or subsets thereof at various points in the Software Development Lifecycle (SDLC).

### 3.1 Triggers for Re-testing

Regression testing for this feature will be triggered by the following events:

*   **Code Commits to Feature Branch:** All unit tests for the profile photo module should run on every commit to the feature branch.
*   **Pull Request Creation/Updates:** The full suite of granular tests for this feature, along with relevant integration tests and potentially a subset of related feature tests (e.g., profile setup wizard tests), should run on every pull request targeting the development or main branch.
*   **Merges to Development Branch:** A broader set of regression tests, including all tests for the User Management System phase (Phase 2) and key end-to-end acceptance tests ([HLT-001](docs/testing/high_level_acceptance_tests/hlt_user_registration_and_profile_completion.md)), should run.
*   **Scheduled CI/CD Builds (e.g., nightly):** The complete suite of all granular tests across the project, along with all high-level acceptance tests, should run to catch any regressions introduced anywhere in the system.
*   **Changes in Dependent Modules:** If changes are made to modules that the profile photo feature depends on (e.g., Supabase client wrapper, file upload utility, user profile API endpoints), the granular tests for this feature should be re-run.
*   **Refactoring of Profile Photo Module Code:** Any significant refactoring within the profile photo upload and management code necessitates a full re-run of all tests within this granular test plan.

### 3.2 Test Prioritization and Tagging

Tests will be tagged to facilitate selection for different regression triggers:

*   **`@unit:profile-photo`:** Unit tests specifically for components/functions within the profile photo module. (Run on every commit)
*   **`@integration:profile-photo`:** Integration tests verifying interactions between profile photo components and their immediate collaborators (e.g., frontend component interacting with the profile photo API client). (Run on PRs, Development merges)
*   **`@feature:profile-photo`:** Tests covering the end-to-end flow within the profile photo feature itself (e.g., uploading, cropping, saving, then verifying display). (Run on PRs, Development merges)
*   **`@regression:phase2`:** Tests covering all features within the User Management System phase (Phase 2), including profile photo. (Run on Development merges, Scheduled builds)
*   **`@regression:all`:** All granular tests across the project. (Run on Scheduled builds)
*   **`@acceptance:HLT-001`:** The high-level acceptance test for User Registration and Profile Completion. (Run on Development merges, Scheduled builds)

### 3.3 Test Selection for Regression Triggers

Based on the triggers and tagging:

*   **Commit:** Run tests tagged `@unit:profile-photo`.
*   **Pull Request:** Run tests tagged `@unit:profile-photo`, `@integration:profile-photo`, and `@feature:profile-photo`.
*   **Development Merge:** Run tests tagged `@regression:phase2` and `@acceptance:HLT-001`.
*   **Scheduled Build:** Run tests tagged `@regression:all` and all `@acceptance:*` tests.
*   **Dependent Module Change:** Re-run tests tagged `@feature:profile-photo` and relevant integration tests from the dependent module.
*   **Refactoring:** Run all tests defined in this granular test plan (`@unit:profile-photo`, `@integration:profile-photo`, `@feature:profile-photo`).

This layered approach ensures that changes are verified quickly at the unit level, integrated components are checked frequently, and the overall system stability is validated regularly through broader regression suites and high-level acceptance tests.

## 4. Test Cases

The following test cases are defined to verify the functionality of the "Implement profile photo upload and management" feature, focusing on interactions and observable outcomes, and mapping directly to the AI Verifiable End Result for MPP Task 2.2.2.

Each test case includes:
*   **Targeted AI Verifiable End Result:** The specific part of the MPP 2.2.2 outcome being verified.
*   **Test Description:** A natural language description of the test scenario.
*   **Interactions to Test (Unit Focus):** The specific calls and behaviors of the unit under test.
*   **Collaborators to Mock & Expected Interactions:** The dependencies that need to be mocked and how the unit is expected to interact with them.
*   **Observable Outcome (AI Verifiable):** The concrete, verifiable result that confirms the test passes and contributes to the AI Verifiable End Result.
*   **Recursive Testing Scope:** The tags indicating when this test should be included in regression runs.

---

### Test Case 4.1: Successful Photo Upload (JPEG)

*   **Targeted AI Verifiable End Result:** "Photo upload... functionality works."
*   **Test Description:** Verify that a user can successfully upload a valid JPEG image file.
*   **Interactions to Test (Unit Focus):** The photo upload component/service should correctly handle file selection, validate the file type and size, and initiate the upload process via the API client.
*   **Collaborators to Mock & Expected Interactions:**
    *   `FileUploadApiClient`: Mock the API client responsible for sending the file to the backend. Expect a call to a method like `uploadProfilePhoto(file, userId)` with the selected file and the current user's ID. Mock the response to simulate a successful upload with a temporary file identifier or URL for cropping.
    *   File validation utility: Mock if file validation is handled by a separate utility. Expect calls to validate file type and size.
*   **Observable Outcome (AI Verifiable):**
    *   The `FileUploadApiClient.uploadProfilePhoto` method is called exactly once with the correct file object and user ID.
    *   The component/service transitions to a "cropping" or "preview" state, indicating the file was accepted for the next step.
    *   No error messages related to file type or size are displayed.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.2: Successful Photo Upload (PNG)

*   **Targeted AI Verifiable End Result:** "Photo upload... functionality works."
*   **Test Description:** Verify that a user can successfully upload a valid PNG image file.
*   **Interactions to Test (Unit Focus):** Similar to Test Case 4.1, but with a PNG file.
*   **Collaborators to Mock & Expected Interactions:**
    *   `FileUploadApiClient`: Mock the API client. Expect a call to `uploadProfilePhoto(file, userId)` with a PNG file. Mock a successful response.
    *   File validation utility: Expect calls to validate file type and size.
*   **Observable Outcome (AI Verifiable):**
    *   The `FileUploadApiClient.uploadProfilePhoto` method is called exactly once with the correct PNG file object and user ID.
    *   The component/service transitions to a "cropping" or "preview" state.
    *   No error messages related to file type or size are displayed.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.3: Upload Failed - Unsupported File Type

*   **Targeted AI Verifiable End Result:** Implicitly verifies robust error handling contributing to "Photo upload... functionality works."
*   **Test Description:** Verify that the system rejects unsupported file types (e.g., GIF, TXT).
*   **Interactions to Test (Unit Focus):** The photo upload component/service should validate the file type immediately after selection and prevent the upload API call.
*   **Collaborators to Mock & Expected Interactions:**
    *   `FileUploadApiClient`: Mock the API client. Expect that the `uploadProfilePhoto` method is *not* called.
    *   File validation utility: Expect a call to validate file type, which should return a validation error.
*   **Observable Outcome (AI Verifiable):**
    *   The `FileUploadApiClient.uploadProfilePhoto` method is called zero times.
    *   An error message indicating an unsupported file type is displayed to the user.
    *   The component remains in the file selection state.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.4: Upload Failed - File Too Large

*   **Targeted AI Verifiable End Result:** Implicitly verifies robust error handling contributing to "Photo upload... functionality works."
*   **Test Description:** Verify that the system rejects files exceeding the maximum size limit (5MB).
*   **Interactions to Test (Unit Focus):** The photo upload component/service should validate the file size immediately after selection and prevent the upload API call.
*   **Collaborators to Mock & Expected Interactions:**
    *   `FileUploadApiClient`: Mock the API client. Expect that the `uploadProfilePhoto` method is *not* called.
    *   File validation utility: Expect a call to validate file size, which should return a validation error.
*   **Observable Outcome (AI Verifiable):**
    *   The `FileUploadApiClient.uploadProfilePhoto` method is called zero times.
    *   An error message indicating the file is too large is displayed to the user.
    *   The component remains in the file selection state.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.5: Successful Cropping and Saving

*   **Targeted AI Verifiable End Result:** "Photo... cropping, and storage functionality works."
*   **Test Description:** Verify that a user can crop an uploaded photo and save the cropped version.
*   **Interactions to Test (Unit Focus):** The cropping component/service should receive the temporary file/identifier, allow the user to define a crop area, and initiate the save process via the API client with the cropping parameters.
*   **Collaborators to Mock & Expected Interactions:**
    *   `FileUploadApiClient`: Mock the API client. Expect a call to a method like `saveCroppedPhoto(tempFileId, cropParameters, userId)` with the temporary file identifier, the defined crop coordinates/dimensions, and the user ID. Mock the response to simulate a successful save, returning the final stored photo URL.
    *   Cropping library/utility: Mock the interaction with the cropping library to ensure it provides the correct crop parameters based on user input.
*   **Observable Outcome (AI Verifiable):**
    *   The `FileUploadApiClient.saveCroppedPhoto` method is called exactly once with valid parameters.
    *   The component/service transitions from the cropping state to a state indicating success or displaying the newly saved profile photo.
    *   No error messages related to saving are displayed.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.6: Cropping Cancelled

*   **Targeted AI Verifiable End Result:** Implicitly verifies correct flow control contributing to "Photo upload... functionality works."
*   **Test Description:** Verify that cancelling the cropping process discards the uploaded photo and reverts the state.
*   **Interactions to Test (Unit Focus):** The cropping component/service should handle the cancel action by discarding the temporary file/identifier and returning to the initial file selection state.
*   **Collaborators to Mock & Expected Interactions:**
    *   `FileUploadApiClient`: Mock the API client. Expect that the `saveCroppedPhoto` method is *not* called. Optionally, expect a call to a `cancelUpload(tempFileId)` method if the backend supports explicit cancellation and cleanup of temporary files.
*   **Observable Outcome (AI Verifiable):**
    *   The `FileUploadApiClient.saveCroppedPhoto` method is called zero times.
    *   The component/service returns to the initial file selection state.
    *   No profile photo is updated or displayed as a result of this action.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.7: Profile Photo Displays Correctly

*   **Targeted AI Verifiable End Result:** "Photos display correctly on profiles."
*   **Test Description:** Verify that the saved profile photo is displayed on the user's profile page and other relevant UI elements.
*   **Interactions to Test (Unit Focus):** The profile display component should fetch the user's profile data (including the photo URL) and render an image element with the correct source.
*   **Collaborators to Mock & Expected Interactions:**
    *   `ProfileApiClient`: Mock the API client responsible for fetching user profile data. Expect a call to a method like `getUserProfile(userId)`. Mock the response to return user data including a valid profile photo URL.
*   **Observable Outcome (AI Verifiable):**
    *   The `ProfileApiClient.getUserProfile` method is called exactly once with the correct user ID.
    *   An `<img>` element is rendered with its `src` attribute set to the mocked profile photo URL.
    *   (For integration/end-to-end tests) The image is visually displayed on the screen.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@integration:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.8: Default Placeholder Displays When No Photo

*   **Targeted AI Verifiable End Result:** Implicitly verifies correct display logic contributing to "Photos display correctly on profiles."
*   **Test Description:** Verify that a default placeholder image is displayed when a user does not have a profile photo.
*   **Interactions to Test (Unit Focus):** The profile display component should fetch the user's profile data and render the default placeholder if no photo URL is present.
*   **Collaborators to Mock & Expected Interactions:**
    *   `ProfileApiClient`: Mock the API client. Expect a call to `getUserProfile(userId)`. Mock the response to return user data *without* a profile photo URL (or with a null/empty value for the photo field).
*   **Observable Outcome (AI Verifiable):**
    *   The `ProfileApiClient.getUserProfile` method is called exactly once with the correct user ID.
    *   An `<img>` element (or equivalent placeholder component) is rendered with its `src` attribute set to the default placeholder image URL.
    *   No user-uploaded photo is displayed.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@integration:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.9: Replacing Existing Photo

*   **Targeted AI Verifiable End Result:** "Photo upload... and management functionality works."
*   **Test Description:** Verify that uploading a new photo successfully replaces the existing one.
*   **Interactions to Test (Unit Focus):** The upload process should follow the standard flow (selection, validation, upload, cropping, save). The save operation should correctly update the user's profile with the new photo URL and potentially trigger deletion of the old file.
*   **Collaborators to Mock & Expected Interactions:**
    *   `FileUploadApiClient`: Mock the API client. Expect calls for both the initial upload (`uploadProfilePhoto`) and the final save (`saveCroppedPhoto`). Mock the save response to return the *new* photo URL. Optionally, expect a call to a `deleteProfilePhoto(oldPhotoUrl)` method if the frontend is responsible for triggering old photo deletion.
    *   `ProfileApiClient`: Mock the API client. Expect a call to `getUserProfile` to initially display the old photo, and potentially a call to update the profile record if the save operation is handled separately from the file upload service.
*   **Observable Outcome (AI Verifiable):**
    *   The `FileUploadApiClient.saveCroppedPhoto` method is called exactly once with the new photo data.
    *   The user's profile data (as fetched by `ProfileApiClient`) is updated to reference the new photo URL.
    *   The profile display component renders the *new* photo.
    *   (If applicable) The `FileUploadApiClient.deleteProfilePhoto` method is called with the URL of the *old* photo.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

### Test Case 4.10: Deleting Existing Photo

*   **Targeted AI Verifiable End Result:** "Photo... management functionality works."
*   **Test Description:** Verify that a user can delete their current profile photo.
*   **Interactions to Test (Unit Focus):** The profile management component should provide a delete option and, upon confirmation, call the API client to initiate the deletion process.
*   **Collaborators to Mock & Expected Interactions:**
    *   `ProfileApiClient`: Mock the API client. Expect a call to a method like `deleteProfilePhoto(userId)`. Mock the response to simulate a successful deletion. Expect a subsequent call to `getUserProfile` which should return user data *without* a profile photo URL.
    *   Storage service interaction (backend): While the test mocks the API client, the backend implementation should interact with the storage service (Supabase Storage) to delete the actual file. This interaction would be verified in backend unit/integration tests.
*   **Observable Outcome (AI Verifiable):**
    *   The `ProfileApiClient.deleteProfilePhoto` method is called exactly once with the correct user ID.
    *   The user's profile data (as fetched by `ProfileApiClient`) is updated to no longer reference a profile photo.
    *   The profile display component renders the default placeholder image.
    *   No error messages related to deletion are displayed.
*   **Recursive Testing Scope:** `@unit:profile-photo`, `@feature:profile-photo`, `@regression:phase2`, `@regression:all`

---

## 5. Test Data and Mock Configurations

### 5.1 Test Data

*   **Valid JPEG Image:** A small (e.g., <1MB) JPEG file with standard dimensions.
*   **Valid PNG Image:** A small (e.g., <1MB) PNG file with standard dimensions.
*   **Unsupported File Type:** A file with a `.gif` or `.txt` extension.
*   **Oversized Image:** A JPEG or PNG file larger than 5MB.
*   **User Data (with photo):** Mocked user profile data including a valid profile photo URL.
*   **User Data (without photo):** Mocked user profile data where the profile photo URL is null or empty.
*   **Temporary File Identifier/URL:** A mocked identifier or URL returned by the initial upload API call, representing the file staged for cropping.
*   **Crop Parameters:** Mocked coordinates and dimensions representing a valid square crop area within the uploaded image.
*   **Final Photo URL:** A mocked URL representing the location of the saved, cropped profile photo in storage.

### 5.2 Mock Configurations

Mocks for collaborators (`FileUploadApiClient`, `ProfileApiClient`, file validation utility, cropping library interaction) will be configured using a testing framework (e.g., Jest with `jest.fn()`).

Key mock configurations will include:

*   **`FileUploadApiClient.uploadProfilePhoto`:**
    *   Successful case: Resolve with a mocked temporary file identifier/URL.
    *   Error cases (simulating backend validation): Reject with specific error objects indicating unsupported type or size.
*   **`FileUploadApiClient.saveCroppedPhoto`:**
    *   Successful case: Resolve with a mocked final photo URL.
    *   Error cases: Reject with error objects simulating storage or processing failures.
*   **`FileUploadApiClient.deleteProfilePhoto` (if frontend-triggered):**
    *   Successful case: Resolve with a success status.
    *   Error cases: Reject with error objects.
*   **`ProfileApiClient.getUserProfile`:**
    *   Case with photo: Resolve with mocked user data including a photo URL.
    *   Case without photo: Resolve with mocked user data where the photo field is null/empty.
    *   Error cases: Reject with error objects (e.g., user not found).
*   **File validation utility:**
    *   Configure return values to simulate valid or invalid file types/sizes.
*   **Cropping library interaction:**
    *   Configure to return predefined crop parameters based on test input.

These mock configurations allow tests to isolate the unit's logic and verify its behavior and interactions without relying on actual external services or complex setup.

## 6. AI Verifiable Completion Criteria for this Plan

The AI Verifiable Completion Criterion for this task is the successful creation and saving of this Markdown document at the specified path: `docs/testing/granular_test_plans/gtp_feature_2_2_2_profile_photo_upload.md`. The content of the document must include:

*   A clear introduction and scope linking to the MPP and Feature Spec.
*   Identification of the targeted AI Verifiable End Result (MPP 2.2.2).
*   A detailed test strategy based on London School TDD principles (interaction testing, mocking, observable outcomes).
*   A comprehensive recursive testing strategy outlining triggers, tagging, and selection for regression.
*   Detailed test cases mapping to the targeted AI Verifiable End Result, specifying interactions, mocks, and observable outcomes.
*   AI verifiable outcomes defined for each test case.
*   Details on necessary test data and mock configurations.

The presence of this file at the specified path, containing the structured information outlined above, serves as the AI verifiable proof that this granular test planning task has been completed according to the requirements.