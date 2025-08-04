# High-Level Acceptance Test: User Registration and Profile Completion

**Test ID:** HLT-001
**Test Title/Objective:** Verify that a new user can successfully register (leveraging Supastarter's auth flow), verify their email, complete their Neighborly Skillshare-specific profile including adding skills, and manage basic privacy settings.
**Priority:** High
**Version:** 1.1 (Revised for Supastarter Template Integration)
**References:**
*   [`init_docs/blueprint.md (Section 3.1)`](../../../init_docs/blueprint.md#L34)
*   [`init_docs/product_requirements.md (Sections 2.2.1, 4.2.1)`](../../../init_docs/product_requirements.md#L103)
*   [`docs/research/high_level_test_strategy_report.md (Sections 3.1, 4.1)`](../../research/high_level_test_strategy_report.md#L43)
*   [`docs/research/github_template_research_report.md`](../../research/github_template_research_report.md)
*   [`docs/template_integration_guide.md`](../../template_integration_guide.md)

## 1. Preconditions
*   The Neighborly Skillshare MVP web application, built upon the Supastarter template, is deployed and accessible in the test environment.
*   Supabase Auth (via Supastarter) and the email service for verification are functional.
*   Test User Persona: "James (27, Graduate Student)" - new to the platform. (Data: `james_newuser_supastarter_email@example.com`, `Password123!`)

## 2. Test Steps

| Step | Action                                                                                                | Expected Result                                                                                                                                  | AI Verifiable Completion Criterion                                                                                                                                                                                                                            |
| :--- | :---------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Navigate to the registration page (likely provided by Supastarter, e.g., `/signup` or `/register`).     | The registration page loads successfully, displaying fields for email, password, and confirm password, consistent with Supastarter's UI.        | AI: Verify page title is "Sign Up" or "Register". Required input fields (`email`, `password`, `confirmPassword` or similar, as per Supastarter convention) are present and visible.                                                                  |
| 2    | Enter valid registration details (email: `james_newuser_supastarter_email@example.com`, password: `Password123!`). | User input is accepted. "Sign Up" or "Register" button is enabled.                                                                             | AI: Verify input fields contain the entered data. Button with text "Sign Up" or "Register" (as per Supastarter) is enabled.                                                                                                                            |
| 3    | Click the "Sign Up" or "Register" button.                                                             | User is redirected to an email verification pending page (common in Supastarter flows) or shown a message indicating an email has been sent. A verification email is received. | AI: Verify URL changes to a verification pending page OR a success message "Verification email sent" (or similar) is displayed. (Email receipt is manually verified or mocked). Database: User record created in Supabase `auth.users` table with `email_confirmed_at` as null. |
| 4    | Open the verification email and click the verification link.                                          | The link directs the user to the platform, and their email is marked as verified. User is likely redirected to login or a Supastarter dashboard/welcome page.             | AI: Verify URL changes to login page or dashboard. A success message "Email successfully verified" (or similar) is displayed. Database: User record for `james_newuser_supastarter_email@example.com` in `auth.users` has `email_confirmed_at` populated. |
| 5    | Log in with the verified credentials (e.g., via `/login` page from Supastarter).                      | User is successfully logged in and redirected to their dashboard or a profile completion prompt for Neighborly Skillshare specific details.          | AI: Verify successful login (e.g., presence of a "Logout" button or user-specific element from Supastarter, or URL change to a protected route like `/dashboard`).                                                                        |
| 6    | Navigate to the "Edit Profile" or "Complete Your Skillshare Profile" section (this part is custom to Neighborly Skillshare, extending Supastarter's profile). | The profile editing page loads with fields for Neighborly Skillshare specifics: name (may pre-fill from Supastarter), bio, location, profile picture upload, and skill listings. | AI: Verify page title is "Edit Profile" or "Complete Your Skillshare Profile". Input fields for `name`, `bio`, `location`, `profile_picture_upload`, `skills_offered`, `skills_needed` are present.                                               |
| 7    | Enter/confirm profile details: Name: "James Miller", Bio: "Grad student looking to share tutoring skills.", Location: "Willow Creek Neighborhood". | Input is accepted.                                                                                                                               | AI: Verify input fields contain the entered data.                                                                                                                                                                                                             |
| 8    | Upload a profile picture (e.g., `james_avatar.png`).                                                    | Profile picture preview is displayed.                                                                                                            | AI: Verify an `<img>` tag associated with the profile picture displays an image (focus on presence of `src` attribute). Supabase Storage should receive the file.                                                                                 |
| 9    | Add "Skills Offered": Skill: "Math Tutoring (Algebra, Calculus)", Description: "Patient and experienced tutor for high school and early college math.", Exchange Type: Barter/Paid. | The skill is added to a list of offered skills on the profile form.                                                                              | AI: Verify the skill "Math Tutoring (Algebra, Calculus)" appears in a list identified as "Skills Offered" with associated details.                                                                                                                          |
| 10   | Add "Skills Needed": Skill: "Basic Home Maintenance (Leaky Faucet)", Exchange Type: Barter.           | The skill is added to a list of needed skills on the profile form.                                                                               | AI: Verify the skill "Basic Home Maintenance (Leaky Faucet)" appears in a list identified as "Skills Needed".                                                                                                                                              |
| 11   | Review and Save Profile changes.                                                                      | A success message "Profile updated successfully" is displayed. The user is redirected to their viewable Neighborly Skillshare profile page or dashboard. | AI: Verify success message is displayed. URL changes to profile view page or dashboard. Database: Custom `profiles` table (linked to `auth.users`) for `james_newuser_supastarter_email@example.com` is updated/created with name, bio, location, skills. |
| 12   | View the completed Neighborly Skillshare profile.                                                       | The profile page displays all entered information correctly: Name, Bio, Location, Profile Picture, Skills Offered, Skills Needed.                | AI: Verify text "James Miller", "Grad student...", "Willow Creek...", "Math Tutoring...", "Basic Home Maintenance..." are present on the page. Profile picture `<img>` tag has a valid `src`.                                                                   |
| 13   | Navigate to "Privacy Settings" (if a distinct section, may leverage Supastarter's account settings and be extended). | Privacy settings page loads, showing options for profile visibility, location sharing precision, etc.                                            | AI: Verify page title is "Privacy Settings" or "Account Settings". Presence of controls related to Neighborly Skillshare-specific privacy options (e.g., skill visibility, location precision for skills).                                      |
| 14   | Adjust a privacy setting (e.g., change location sharing from "Precise" to "Neighborhood Only").       | The setting change is accepted and saved. A confirmation message may appear.                                                                     | AI: Verify the selected privacy option is active/highlighted. Success message "Privacy settings updated" displayed. Database: Relevant privacy setting in custom `profiles` table is updated.                                                           |

## 3. Test Data
*   **User Persona:** James (27, Graduate Student)
    *   Email: `james_newuser_supastarter_email@example.com`
    *   Password: `Password123!`
    *   Name: James Miller
    *   Bio: Grad student looking to share tutoring skills.
    *   Location: Willow Creek Neighborhood (Test with a specific mock address if geolocation precision is tested, e.g., 123 Main St, Willow Creek)
    *   Profile Picture: `james_avatar.png` (a generic placeholder image file)
    *   Skills Offered:
        *   Skill: Math Tutoring (Algebra, Calculus)
        *   Description: Patient and experienced tutor for high school and early college math.
        *   Exchange Type: Barter/Paid
    *   Skills Needed:
        *   Skill: Basic Home Maintenance (Leaky Faucet)
        *   Exchange Type: Barter
*   Verification Email Content (template expected, likely from Supabase Auth via Supastarter)

## 4. Expected Overall Result
A new user can seamlessly register using the Supastarter-provided authentication flow, verify their account, complete their custom Neighborly Skillshare profile with essential information and skill listings, and manage basic privacy settings. All entered data is accurately stored in the respective Supabase tables (`auth.users` and custom `profiles` or similar, and related skill tables) and displayed correctly in the UI. The user is ready to participate in the skill-sharing platform.

## 5. AI Verifiable End Result
*   A new user account for `james_newuser_supastarter_email@example.com` exists in the Supabase `auth.users` table with `email_confirmed_at` populated.
*   The user's related record in the custom `profiles` table (or equivalent as per [`docs/template_integration_guide.md`](../../template_integration_guide.md)) contains the name "James Miller", the specified bio, location.
*   Separate database records for skills offered ("Math Tutoring (Algebra, Calculus)") and skills needed ("Basic Home Maintenance (Leaky Faucet)") are linked to the user.
*   The UI of the user's Neighborly Skillshare profile page correctly displays this information.
*   A change in a privacy setting (e.g., location sharing) is reflected in the database for the user.
*   AI can check for the presence of specific text elements on pages, enabled/disabled states of buttons, URL changes, and specific data values in user-related tables in Supabase.