# Granular Test Plan: Feature 2.2.1 - Create Profile Setup Wizard

**Feature Name:** Create profile setup wizard
**Master Project Plan Task ID:** 2.2.1
**AI Verifiable Outcome for MPP Task 2.2.1 (Targeted by this Plan):** "Multi-step profile creation flow exists and saves data at each step."

**Document Path:** [`docs/testing/granular_test_plans/gtp_feature_2_2_1_profile_setup_wizard.md`](docs/testing/granular_test_plans/gtp_feature_2_2_1_profile_setup_wizard.md)

## 1. Introduction

This document outlines the granular test plan for the "Create profile setup wizard" feature (MPP Task 2.2.1). This wizard is a critical component for onboarding new users, guiding them through the process of completing their profile information. The tests defined herein are designed to verify the successful implementation of this feature, specifically targeting the AI Verifiable End Result for MPP Task 2.2.1: "Multi-step profile creation flow exists and saves data at each step."

This test plan adopts the principles of the London School of Test Driven Development (TDD), focusing on interaction testing and the use of mocks/stubs to isolate the unit under test and verify its behavior through its interactions with collaborators.

## 2. Test Scope

The scope of this granular test plan is strictly limited to verifying the AI Verifiable End Result for MPP Task 2.2.1. This includes:

*   Verification of the correct sequencing and presentation of each step in the profile setup wizard.
*   Verification that data entered at each step is correctly captured and passed to the appropriate data persistence mechanisms (mocked collaborators representing API calls to Supabase).
*   Verification of navigation logic within the wizard (Next, Previous, Save & Exit).
*   Verification that the wizard is correctly triggered for users with incomplete profiles.
*   Verification of basic input validation within the wizard forms.

This plan does *not* cover the end-to-end flow from initial registration to full profile completion (which is covered by High-Level Acceptance Test [`HLT-001`](docs/testing/high_level_acceptance_tests/hlt_user_registration_and_profile_completion.md)), nor does it cover the detailed implementation of related features like photo upload (MPP Task 2.2.2), location services (MPP Task 2.2.3), or the skill listing interface (MPP Task 2.2.4) themselves. Instead, it focuses on the wizard's role in orchestrating these steps and saving the collected data.

## 3. Test Strategy: London School TDD & Recursive Testing

### 3.1 London School TDD Principles

Testing for the Profile Setup Wizard will adhere to the London School of TDD. This means:

*   **Focus on Interactions:** Tests will verify that the unit under test (likely the wizard component or a service/hook managing the wizard state and data flow) correctly interacts with its collaborators.
*   **Mocking Collaborators:** External dependencies such as API services (for saving data to Supabase), navigation utilities, validation functions, and potentially services for photo upload, geolocation, and skill selection will be mocked or stubbed.
*   **Verifying Outcomes via Interactions:** Instead of inspecting the internal state of the unit under test, tests will assert that the correct methods on the mocked collaborators were called with the expected arguments, and that the unit under test reacts appropriately to the mocked responses (e.g., navigates to the next step).

This approach ensures that tests are focused, fast, and less brittle to internal implementation details, promoting a clear separation of concerns.

### 3.2 Recursive Testing Strategy

A comprehensive recursive testing strategy will be employed to ensure the ongoing stability of the Profile Setup Wizard feature and catch regressions early.

*   **Test Prioritization and Tagging:**
    *   `@critical`: Tests covering the core multi-step flow and basic data saving interactions for essential fields. These are high priority.
    *   `@functional`: Tests covering all specific step data saves, navigation edge cases, and the trigger for displaying the wizard.
    *   `@validation`: Tests specifically for input validation rules at each step.
    *   `@regression`: All tests defined in this granular test plan.

*   **Regression Triggers and Test Subset Selection:**
    *   **Every Code Commit (Feature Branch):** Run `@critical` and `@validation` tests for this feature. This provides rapid feedback on core functionality and input integrity during active development.
    *   **Merge/Push to `develop` or `main`:** Run all `@regression` tests for this feature. This ensures the entire wizard functionality is verified before integration.
    *   **Completion of Related MPP Tasks (2.2.2, 2.2.3, 2.2.4):** Run `@functional` tests specifically related to the completed task's step (e.g., run Location step tests after 2.2.3, Photo tests after 2.2.2, Skills tests after 2.2.4). This verifies integration points.
    *   **Changes to `public.profiles`, `public.user_locations`, `public.skill_offers`, `public.skill_requests` schema or related API endpoints:** Run all `@regression` tests for this feature. This is a critical trigger as data persistence is a core outcome.
    *   **Changes to Core Authentication or User State Logic:** Run `@functional` tests verifying the wizard trigger mechanism.

This layered approach ensures that the most critical tests are run frequently, while more comprehensive regression suites are executed at key integration points or when related dependencies change.

## 4. Test Cases

Each test case below maps directly to the AI Verifiable End Result for MPP Task 2.2.1 ("Multi-step profile creation flow exists and saves data at each step.") by verifying a specific part of the flow or data saving mechanism.

---

**Test Case ID:** GTP-2.2.1-001
**Description:** Verify wizard is displayed for a new user with an incomplete profile.
**Maps to MPP Outcome:** "Multi-step profile creation flow exists..."
**Unit Under Test (UUT):** Component or hook responsible for determining if the wizard should be shown.
**Interactions to Test:**
*   UUT checks user's profile status (via a mocked user service or API call).
*   UUT determines profile is incomplete.
**Collaborators to Mock:**
*   `UserService` or `ProfileApiService`: Mock method to return a user object with an incomplete profile state.
**Expected Interactions with Mocks:**
*   `UserService.getUserProfileStatus()` or `ProfileApiService.fetchProfile()` is called.
*   Mock returns a predefined incomplete profile status.
**Observable Outcome (AI Verifiable):** The Profile Setup Wizard component is rendered and visible on the screen.
**Recursive Testing Scope:** `@critical`, `@functional`, `@regression`. Run on every commit and merge.
**Test Data/Mock Config:** Mock user profile data indicating missing required fields (e.g., `full_name` is null, no `user_locations` entry).

---

**Test Case ID:** GTP-2.2.1-002
**Description:** Verify navigation from Basic Info step to Location step on "Next".
**Maps to MPP Outcome:** "...Multi-step profile creation flow exists..."
**Unit Under Test (UUT):** Basic Info step component or the wizard container component.
**Interactions to Test:**
*   User fills required fields in Basic Info form.
*   User clicks "Next" button.
*   UUT triggers data validation and saving for the current step.
*   UUT triggers navigation to the next step.
**Collaborators to Mock:**
*   `ValidationService`: Mock method to simulate successful validation.
*   `ProfileApiService`: Mock method for saving basic profile data.
*   `NavigationService` or Router utility: Mock method for navigating to a specific route/step.
**Expected Interactions with Mocks:**
*   `ValidationService.validateBasicInfo(formData)` is called with form data.
*   `ProfileApiService.saveBasicProfile(formData)` is called with form data.
*   `NavigationService.goToStep('location')` or equivalent is called.
**Observable Outcome (AI Verifiable):** The UI transitions from the Basic Info step view to the Location step view.
**Recursive Testing Scope:** `@critical`, `@functional`, `@regression`. Run on every commit and merge.
**Test Data/Mock Config:** Valid form data for the Basic Info step. Mock API calls to return success.

---

**Test Case ID:** GTP-2.2.1-003
**Description:** Verify data entered in Basic Info step is saved via API call.
**Maps to MPP Outcome:** "...saves data at each step."
**Unit Under Test (UUT):** Basic Info step component or the wizard container component.
**Interactions to Test:**
*   User fills required fields in Basic Info form.
*   User clicks "Next" or "Save & Exit".
*   UUT triggers data saving for the current step.
**Collaborators to Mock:**
*   `ProfileApiService`: Mock method for saving basic profile data (`public.profiles`).
**Expected Interactions with Mocks:**
*   `ProfileApiService.saveBasicProfile(formData)` is called exactly once with the form data entered by the user.
**Observable Outcome (AI Verifiable):** The mock `ProfileApiService.saveBasicProfile` method is called with the expected data payload.
**Recursive Testing Scope:** `@critical`, `@functional`, `@regression`. Run on every commit and merge.
**Test Data/Mock Config:** Valid form data for the Basic Info step.

---

**Test Case ID:** GTP-2.2.1-004
**Description:** Verify navigation from Location step to Skills Offered step on "Next".
**Maps to MPP Outcome:** "...Multi-step profile creation flow exists..."
**Unit Under Test (UUT):** Location step component or the wizard container component.
**Interactions to Test:**
*   User fills required fields in Location form.
*   User clicks "Next" button.
*   UUT triggers data validation and saving for the current step.
*   UUT triggers navigation to the next step.
**Collaborators to Mock:**
*   `ValidationService`: Mock method to simulate successful validation.
*   `LocationApiService`: Mock method for saving location data (`public.user_locations`).
*   `NavigationService` or Router utility: Mock method for navigating to a specific route/step.
**Expected Interactions with Mocks:**
*   `ValidationService.validateLocation(formData)` is called with form data.
*   `LocationApiService.saveLocation(formData)` is called with form data.
*   `NavigationService.goToStep('skills-offered')` or equivalent is called.
**Observable Outcome (AI Verifiable):** The UI transitions from the Location step view to the Skills Offered step view.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge and when MPP Task 2.2.3 is completed or related schema/API changes occur.
**Test Data/Mock Config:** Valid form data for the Location step (including simulated geocoding results if applicable). Mock API calls to return success.

---

**Test Case ID:** GTP-2.2.1-005
**Description:** Verify data entered in Location step is saved via API call.
**Maps to MPP Outcome:** "...saves data at each step."
**Unit Under Test (UUT):** Location step component or the wizard container component.
**Interactions to Test:**
*   User fills required fields in Location form.
*   User clicks "Next" or "Save & Exit".
*   UUT triggers data saving for the current step.
**Collaborators to Mock:**
*   `LocationApiService`: Mock method for saving location data (`public.user_locations`).
**Expected Interactions with Mocks:**
*   `LocationApiService.saveLocation(formData)` is called exactly once with the form data entered by the user (including latitude/longitude/geom).
**Observable Outcome (AI Verifiable):** The mock `LocationApiService.saveLocation` method is called with the expected data payload.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge and when MPP Task 2.2.3 is completed or related schema/API changes occur.
**Test Data/Mock Config:** Valid form data for the Location step, including simulated geocoding results.

---

**Test Case ID:** GTP-2.2.1-006
**Description:** Verify navigation from Skills Offered step to Skills Needed step on "Next".
**Maps to MPP Outcome:** "...Multi-step profile creation flow exists..."
**Unit Under Test (UUT):** Skills Offered step component or the wizard container component.
**Interactions to Test:**
*   User selects/adds skills offered.
*   User clicks "Next" button.
*   UUT triggers data validation and saving for the current step.
*   UUT triggers navigation to the next step.
**Collaborators to Mock:**
*   `ValidationService`: Mock method to simulate successful validation.
*   `SkillApiService`: Mock method for saving skill offers data (`public.skill_offers`).
*   `NavigationService` or Router utility: Mock method for navigating to a specific route/step.
**Expected Interactions with Mocks:**
*   `ValidationService.validateSkillsOffered(formData)` is called with form data.
*   `SkillApiService.saveSkillOffers(formData)` is called with form data.
*   `NavigationService.goToStep('skills-needed')` or equivalent is called.
**Observable Outcome (AI Verifiable):** The UI transitions from the Skills Offered step view to the Skills Needed step view.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge and when MPP Task 2.2.4 is completed or related schema/API changes occur.
**Test Data/Mock Config:** Valid data for skills offered. Mock API calls to return success.

---

**Test Case ID:** GTP-2.2.1-007
**Description:** Verify data entered in Skills Offered step is saved via API call.
**Maps to MPP Outcome:** "...saves data at each step."
**Unit Under Test (UUT):** Skills Offered step component or the wizard container component.
**Interactions to Test:**
*   User selects/adds skills offered.
*   User clicks "Next" or "Save & Exit".
*   UUT triggers data saving for the current step.
**Collaborators to Mock:**
*   `SkillApiService`: Mock method for saving skill offers data (`public.skill_offers`).
**Expected Interactions with Mocks:**
*   `SkillApiService.saveSkillOffers(formData)` is called exactly once with the data entered by the user.
**Observable Outcome (AI Verifiable):** The mock `SkillApiService.saveSkillOffers` method is called with the expected data payload.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge and when MPP Task 2.2.4 is completed or related schema/API changes occur.
**Test Data/Mock Config:** Valid data for skills offered.

---

**Test Case ID:** GTP-2.2.1-008
**Description:** Verify navigation from Skills Needed step to Profile Photo step on "Next".
**Maps to MPP Outcome:** "...Multi-step profile creation flow exists..."
**Unit Under Test (UUT):** Skills Needed step component or the wizard container component.
**Interactions to Test:**
*   User selects/adds skills needed.
*   User clicks "Next" button.
*   UUT triggers data validation and saving for the current step.
*   UUT triggers navigation to the next step.
**Collaborators to Mock:**
*   `ValidationService`: Mock method to simulate successful validation.
*   `SkillApiService`: Mock method for saving skill requests data (`public.skill_requests`).
*   `NavigationService` or Router utility: Mock method for navigating to a specific route/step.
**Expected Interactions with Mocks:**
*   `ValidationService.validateSkillsNeeded(formData)` is called with form data.
*   `SkillApiService.saveSkillRequests(formData)` is called with form data.
*   `NavigationService.goToStep('profile-photo')` or equivalent is called.
**Observable Outcome (AI Verifiable):** The UI transitions from the Skills Needed step view to the Profile Photo step view.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge and when MPP Task 2.2.4 is completed or related schema/API changes occur.
**Test Data/Mock Config:** Valid data for skills needed. Mock API calls to return success.

---

**Test Case ID:** GTP-2.2.1-009
**Description:** Verify data entered in Skills Needed step is saved via API call.
**Maps to MPP Outcome:** "...saves data at each step."
**Unit Under Test (UUT):** Skills Needed step component or the wizard container component.
**Interactions to Test:**
*   User selects/adds skills needed.
*   User clicks "Next" or "Save & Exit".
*   UUT triggers data saving for the current step.
**Collaborators to Mock:**
*   `SkillApiService`: Mock method for saving skill requests data (`public.skill_requests`).
**Expected Interactions with Mocks:**
*   `SkillApiService.saveSkillRequests(formData)` is called exactly once with the data entered by the user.
**Observable Outcome (AI Verifiable):** The mock `SkillApiService.saveSkillRequests` method is called with the expected data payload.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge and when MPP Task 2.2.4 is completed or related schema/API changes occur.
**Test Data/Mock Config:** Valid data for skills needed.

---

**Test Case ID:** GTP-2.2.1-010
**Description:** Verify Profile Photo selection triggers upload and saves URL.
**Maps to MPP Outcome:** "...saves data at each step."
**Unit Under Test (UUT):** Profile Photo step component or the wizard container component.
**Interactions to Test:**
*   User selects a file for their profile photo.
*   UUT triggers the file upload process.
*   Upon successful upload, UUT triggers saving the resulting URL to the profile.
**Collaborators to Mock:**
*   `FileUploadService`: Mock method for uploading the file.
*   `ProfileApiService`: Mock method for saving the profile photo URL (`public.profiles.profile_picture_url`).
**Expected Interactions with Mocks:**
*   `FileUploadService.uploadProfilePhoto(file)` is called with the selected file.
*   Mock `FileUploadService` returns a mock URL.
*   `ProfileApiService.saveProfilePhotoUrl(userId, mockUrl)` is called with the user ID and the mock URL.
**Observable Outcome (AI Verifiable):** The mock `FileUploadService.uploadProfilePhoto` and `ProfileApiService.saveProfilePhotoUrl` methods are called with the expected arguments.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge and when MPP Task 2.2.2 is completed or related schema/API changes occur.
**Test Data/Mock Config:** A mock `File` object. Mock `FileUploadService` to return a predefined URL.

---

**Test Case ID:** GTP-2.2.1-011
**Description:** Verify navigation from any step to the previous step on "Previous".
**Maps to MPP Outcome:** "...Multi-step profile creation flow exists..."
**Unit Under Test (UUT):** Any step component or the wizard container component.
**Interactions to Test:**
*   User clicks "Previous" button.
*   UUT triggers navigation to the previous step.
**Collaborators to Mock:**
*   `NavigationService` or Router utility: Mock method for navigating to the previous route/step.
**Expected Interactions with Mocks:**
*   `NavigationService.goToPreviousStep()` or equivalent is called.
**Observable Outcome (AI Verifiable):** The UI transitions from the current step view to the previous step view.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge.
**Test Data/Mock Config:** N/A.

---

**Test Case ID:** GTP-2.2.1-012
**Description:** Verify clicking "Save & Exit" saves current step data and exits wizard.
**Maps to MPP Outcome:** "...saves data at each step."
**Unit Under Test (UUT):** Any step component or the wizard container component.
**Interactions to Test:**
*   User clicks "Save & Exit" button.
*   UUT triggers data validation and saving for the current step.
*   UUT triggers exit from the wizard flow.
**Collaborators to Mock:**
*   `ValidationService`: Mock method to simulate successful validation.
*   Appropriate ApiService (e.g., `ProfileApiService`, `LocationApiService`, `SkillApiService`): Mock method for saving current step data.
*   `NavigationService` or Router utility: Mock method for navigating away from the wizard.
**Expected Interactions with Mocks:**
*   `ValidationService.validateCurrentStep(formData)` is called.
*   The relevant ApiService save method is called with current step data.
*   `NavigationService.exitWizard()` or equivalent is called.
**Observable Outcome (AI Verifiable):** The relevant mock ApiService save method is called, and the UI navigates away from the wizard component.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge.
**Test Data/Mock Config:** Valid form data for the current step. Mock API calls to return success.

---

**Test Case ID:** GTP-2.2.1-013
**Description:** Verify required field validation prevents navigation on "Next".
**Maps to MPP Outcome:** "Multi-step profile creation flow exists..." (by ensuring flow integrity)
**Unit Under Test (UUT):** Any step component or the wizard container component.
**Interactions to Test:**
*   User leaves a required field empty.
*   User clicks "Next" button.
*   UUT triggers data validation.
**Collaborators to Mock:**
*   `ValidationService`: Mock method to simulate validation failure.
*   `NavigationService` or Router utility: Mock method for navigation (should *not* be called).
**Expected Interactions with Mocks:**
*   `ValidationService.validateCurrentStep(formData)` is called.
*   Mock `ValidationService` returns a validation error.
*   `NavigationService.goToNextStep()` or equivalent is *not* called.
**Observable Outcome (AI Verifiable):** A validation error message is displayed on the UI for the empty required field, and the UI remains on the current step.
**Recursive Testing Scope:** `@critical`, `@validation`, `@regression`. Run on every commit and merge.
**Test Data/Mock Config:** Form data with a required field missing. Mock `ValidationService` to return an error.

---

**Test Case ID:** GTP-2.2.1-014
**Description:** Verify data format validation prevents saving/navigation.
**Maps to MPP Outcome:** "...saves data at each step." (by ensuring data integrity)
**Unit Under Test (UUT):** Any step component or the wizard container component.
**Interactions to Test:**
*   User enters data in an incorrect format (e.g., invalid email, non-numeric age if applicable).
*   User clicks "Next" or "Save & Exit".
*   UUT triggers data validation.
**Collaborators to Mock:**
*   `ValidationService`: Mock method to simulate validation failure.
*   Appropriate ApiService: Mock save method (should *not* be called).
*   `NavigationService` or Router utility: Mock navigation method (should *not* be called).
**Expected Interactions with Mocks:**
*   `ValidationService.validateCurrentStep(formData)` is called.
*   Mock `ValidationService` returns a validation error.
*   The relevant ApiService save method is *not* called.
*   Navigation method is *not* called.
**Observable Outcome (AI Verifiable):** A validation error message is displayed on the UI for the incorrectly formatted field, and the UI remains on the current step.
**Recursive Testing Scope:** `@validation`, `@regression`. Run on every commit and merge.
**Test Data/Mock Config:** Form data with data in an incorrect format. Mock `ValidationService` to return an error.

---

**Test Case ID:** GTP-2.2.1-015
**Description:** Verify wizard completes successfully after the last step and redirects user.
**Maps to MPP Outcome:** "Multi-step profile creation flow exists..."
**Unit Under Test (UUT):** The last step component or the wizard container component.
**Interactions to Test:**
*   User completes the last step.
*   User clicks "Finish" or equivalent.
*   UUT triggers final data saving.
*   UUT triggers navigation to the post-completion destination (e.g., dashboard).
**Collaborators to Mock:**
*   `ValidationService`: Mock method to simulate successful validation.
*   Appropriate ApiService(s): Mock method(s) for saving final step data.
*   `NavigationService` or Router utility: Mock method for navigating away from the wizard.
**Expected Interactions with Mocks:**
*   `ValidationService.validateLastStep(formData)` is called.
*   Relevant ApiService save method(s) are called.
*   `NavigationService.goToDashboard()` or equivalent is called.
**Observable Outcome (AI Verifiable):** The UI navigates away from the wizard component to the expected post-completion page.
**Recursive Testing Scope:** `@functional`, `@regression`. Run on merge.
**Test Data/Mock Config:** Valid form data for the last step. Mock API calls to return success.

## 5. Test Data

Test data will be generated or mocked within the test environment for each test case. This includes:

*   Mock user objects with varying states of profile completion.
*   Valid and invalid form data payloads for each wizard step (Basic Info, Location, Skills Offered, Skills Needed, Profile Photo).
*   Mock file objects for profile photo upload tests.
*   Predefined mock responses from API service collaborators (success, validation errors, network errors - though error handling is not the primary focus of these outcome-driven tests).

## 6. Test Environment and Mock Configuration

Tests will be executed in a standard JavaScript/TypeScript testing environment (e.g., Jest, React Testing Library). Key aspects of the test environment setup include:

*   **Rendering Environment:** Components will be rendered in a testing environment that simulates a browser DOM (e.g., JSDOM).
*   **Mocking Framework:** A mocking library (e.g., Jest mocks) will be used to create spies and stubs for collaborator dependencies.
*   **Collaborator Mocks:** Dedicated mock implementations will be created for:
    *   API services (`ProfileApiService`, `LocationApiService`, `SkillApiService`, `FileUploadService`) to control data saving outcomes and verify calls.
    *   Navigation utilities (`NavigationService` or router mocks) to verify route transitions.
    *   Validation utilities (`ValidationService`) to control validation outcomes.
*   **State Management Mocks (if applicable):** If the wizard uses a state management solution (e.g., Zustand, Redux), relevant hooks or store interactions will be mocked to control the wizard's state and verify state updates, while still prioritizing interaction testing with collaborators.

## 7. AI Verifiable Completion Criteria Summary

Every test case defined in Section 4 includes a specific "Observable Outcome (AI Verifiable)" field. These outcomes are concrete, observable results of the unit under test's behavior or its interactions with mocked collaborators. An automated testing agent can verify these outcomes by:

*   Checking if specific mock functions were called with the expected arguments (e.g., `expect(mockApiService.saveData).toHaveBeenCalledWith(expectedData)`).
*   Asserting changes in the rendered UI (e.g., `expect(screen.getByText('Location Step')).toBeVisible()`, `expect(screen.getByText('Validation Error')).toBeVisible()`).
*   Verifying that certain mock functions were *not* called when expected (e.g., `expect(mockNavigationService.goToNextStep).not.toHaveBeenCalled()`).

Successful execution of all test cases defined in this plan, with their AI verifiable outcomes confirmed, will collectively demonstrate that the "Multi-step profile creation flow exists and saves data at each step," thus verifying the AI Verifiable End Result for MPP Task 2.2.1.