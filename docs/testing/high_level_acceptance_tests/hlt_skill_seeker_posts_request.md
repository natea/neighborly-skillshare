# High-Level Acceptance Test: Skill Seeker Posts a New Skill Request

**Test ID:** HLT-003
**Test Title/Objective:** Verify that a registered and logged-in user (Skill Seeker), leveraging their Supastarter-based account, can successfully post a new Neighborly Skillshare skill request with all required details.
**Priority:** High
**Version:** 1.1 (Revised for Supastarter Template Integration)
**References:**
*   [`init_docs/blueprint.md (Section 3.1)`](../../../init_docs/blueprint.md#L34)
*   [`init_docs/product_requirements.md (Section 2.2.2)`](../../../init_docs/product_requirements.md#L121)
*   [`docs/research/high_level_test_strategy_report.md (Section 3.2)`](../../research/high_level_test_strategy_report.md#L51)
*   [`docs/research/github_template_research_report.md`](../../research/github_template_research_report.md)
*   [`docs/template_integration_guide.md`](../../template_integration_guide.md)

## 1. Preconditions
*   The Neighborly Skillshare MVP web application, built upon the Supastarter template, is deployed and accessible in the test environment.
*   Test User Persona: "Robert (58, Retired Teacher)" is registered via Supastarter's auth, email verified, logged in, and has a completed basic Neighborly Skillshare profile. (Data: `robert_seeker_supastarter_email@example.com`, `Password123!`)
*   Relevant `skill_categories` are pre-populated in the database.

## 2. Test Steps

| Step | Action                                                                                                | Expected Result                                                                                                                                | AI Verifiable Completion Criterion                                                                                                                                                                                              |
| :--- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Log in as Robert (`robert_seeker_supastarter_email@example.com`) using Supastarter's login flow.      | Robert is successfully logged in and on his Neighborly Skillshare dashboard.                                                                   | AI: Verify successful login (e.g., presence of "Logout" button, Robert's name/avatar displayed, consistent with Supastarter's logged-in state).                                                                                  |
| 2    | Navigate to the "Request a Skill" or "Create New Request" page (custom Neighborly Skillshare page).   | The skill request creation form loads with fields for skill needed (title, category), description/requirements, timeframe, location, and exchange preference. | AI: Verify page title is "Request a Skill" or similar. Input fields for `skill_needed_title`, `skill_category` (dropdown), `description`, `timeframe`, `location`, `exchange_preference` are present.                               |
| 3    | Enter Skill Needed Title: "Gardening Help - Weeding Flower Beds". Select Category: "Home & Garden".    | Input accepted.                                                                                                                                | AI: Verify `skill_needed_title` input field contains "Gardening Help - Weeding Flower Beds". Verify "Home & Garden" is selected in `skill_category`.                                                                              |
| 4    | Enter Description/Requirements: "Need help weeding my front yard flower beds. Approximately 2-3 hours of work. Tools provided." | Input accepted.                                                                                                                                | AI: Verify `description` textarea contains the entered text.                                                                                                                                                                    |
| 5    | Set Preferred Timeframe: "Next weekend (Saturday or Sunday)".                                         | Timeframe input accepted/selected.                                                                                                             | AI: Verify timeframe selection/input reflects the entered data.                                                                                                                                                                 |
| 6    | Confirm Location: "My Home - Willow Creek Neighborhood" (should default from profile or allow input). | Location confirmed/input accepted.                                                                                                             | AI: Verify location input/display shows "Willow Creek Neighborhood" or the specific address from Robert's profile.                                                                                                            |
| 7    | Select Exchange Preference: "Paid" (Offer to pay: "$50").                                             | Exchange preference and offered payment accepted.                                                                                              | AI: Verify "Paid" option is selected. Offered payment input (if applicable for requests) contains "$50".                                                                                                                       |
| 8    | Review all entered information on the form.                                                           | All information is displayed correctly as entered.                                                                                             | AI: Verify all input fields still reflect the data entered.                                                                                                                                                                     |
| 9    | Click "Post Request" or "Submit Request" button.                                                      | The skill request is successfully submitted. A confirmation message "Skill request posted successfully!" is displayed. User may be redirected to "My Requests" or dashboard. | AI: Verify success message is displayed. URL changes to "My Skill Requests", or dashboard. Database: A new `skill_requests` record is created for Robert with all specified details.                                               |
| 10   | Navigate to "My Skill Requests" page (custom Neighborly Skillshare page, if not already there).       | The newly created "Gardening Help - Weeding Flower Beds" request is visible in Robert's list of active requests.                                 | AI: Verify a listing with the title "Gardening Help - Weeding Flower Beds" and Robert as the requester is present on the page. Key details like offered payment "$50" should be visible if applicable.                             |
| 11   | View the details of the newly posted skill request.                                                   | The full skill request page displays all information correctly: skill needed title, category, description, timeframe, location, and exchange preference. | AI: Verify all details ("Gardening Help - Weeding Flower Beds", "Home & Garden", description text, timeframe, location, exchange preference "Paid", offered payment "$50") are correctly displayed on the skill request's dedicated page. |

## 3. Test Data
*   **User Persona:** Robert (58, Retired Teacher)
    *   Email: `robert_seeker_supastarter_email@example.com`
    *   Password: `Password123!`
    *   Logged in: Yes
    *   Profile Location: Willow Creek Neighborhood (e.g., 456 Oak Avenue, Willow Creek)
*   **Skill Request Details:**
    *   Skill Needed Title: Gardening Help - Weeding Flower Beds
    *   Category: Home & Garden (ensure this exists in `skill_categories` table)
    *   Description/Requirements: Need help weeding my front yard flower beds. Approximately 2-3 hours of work. Tools provided.
    *   Preferred Timeframe: Next weekend (Saturday or Sunday)
    *   Location: My Home - Willow Creek Neighborhood
    *   Exchange Preference: Paid
    *   Offer to pay: $50

## 4. Expected Overall Result
A registered and logged-in skill seeker (Robert), using his Supastarter-based account, can successfully create and publish a new Neighborly Skillshare skill request. The new request is visible on the platform and accurately reflects all provided details in the custom `skill_requests` table and related UI.

## 5. AI Verifiable End Result
*   A new skill request titled "Gardening Help - Weeding Flower Beds" associated with Robert's Supabase `auth.users` ID exists in the custom `skill_requests` table in the database.
*   The `skill_requests` record contains all the specified details: category_id (linking to "Home & Garden"), description, timeframe, location, exchange preference "Paid", and offered payment "$50".
*   Robert's "My Skill Requests" page lists the new request.
*   The dedicated page for the "Gardening Help - Weeding Flower Beds" skill request displays all these details correctly.
*   AI can verify by checking for text elements on pages, and specific data in the `skill_requests` table and user associations.