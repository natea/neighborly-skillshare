# High-Level Acceptance Test: Skill Provider Posts a New Skill Offer

**Test ID:** HLT-002
**Test Title/Objective:** Verify that a registered and logged-in user (Skill Provider), leveraging their Supastarter-based account, can successfully post a new Neighborly Skillshare skill offer with all required details, including media.
**Priority:** High
**Version:** 1.1 (Revised for Supastarter Template Integration)
**References:**
*   [`init_docs/blueprint.md (Section 3.1, 3.2)`](../../../init_docs/blueprint.md#L34)
*   [`init_docs/product_requirements.md (Sections 2.2.2, 4.2.2)`](../../../init_docs/product_requirements.md#L121)
*   [`docs/research/high_level_test_strategy_report.md (Section 3.2)`](../../research/high_level_test_strategy_report.md#L51)
*   [`docs/research/github_template_research_report.md`](../../research/github_template_research_report.md)
*   [`docs/template_integration_guide.md`](../../template_integration_guide.md)

## 1. Preconditions
*   The Neighborly Skillshare MVP web application, built upon the Supastarter template, is deployed and accessible in the test environment.
*   Test User Persona: "Maya (34, Graphic Designer)" is registered via Supastarter's auth, email verified, logged in, and has a completed basic Neighborly Skillshare profile. (Data: `maya_provider_supastarter_email@example.com`, `Password123!`)
*   Maya has an image file ready for upload (e.g., `maya_graphic_design_portfolio_sample.jpg`).
*   Relevant `skill_categories` are pre-populated in the database as per [`docs/template_integration_guide.md`](../../template_integration_guide.md).

## 2. Test Steps

| Step | Action                                                                                               | Expected Result                                                                                                                               | AI Verifiable Completion Criterion                                                                                                                                                                                               |
| :--- | :--------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Log in as Maya (`maya_provider_supastarter_email@example.com`) using Supastarter's login flow.       | Maya is successfully logged in and on her Neighborly Skillshare dashboard (which extends Supastarter's dashboard).                                | AI: Verify successful login (e.g., presence of "Logout" button, Maya's name/avatar displayed, consistent with Supastarter's logged-in state). URL is a protected route.                                                              |
| 2    | Navigate to the "Offer a Skill" or "Create New Listing" page (custom Neighborly Skillshare page).      | The skill offer creation form loads with fields for skill title/category, description, pricing/exchange type, availability, service area, media upload. | AI: Verify page title is "Offer a Skill" or similar. Input fields for `skill_title`, `skill_category` (dropdown populated from `skill_categories` table), `description`, `exchange_type`, `availability`, `service_area`, `media_upload` are present. |
| 3    | Enter Skill Title: "Custom Logo Design".                                                             | Input accepted.                                                                                                                               | AI: Verify `skill_title` input field contains "Custom Logo Design".                                                                                                                                                              |
| 4    | Select Skill Category: "Graphic & Web Design" (from predefined list).                                | Category selected.                                                                                                                            | AI: Verify "Graphic & Web Design" is selected in the category dropdown/selector.                                                                                                                                                 |
| 5    | Enter Description: "Professional logo design services for small businesses and startups. Includes 3 initial concepts and 2 rounds of revisions." | Input accepted.                                                                                                                               | AI: Verify `description` textarea contains the entered text.                                                                                                                                                                     |
| 6    | Select Exchange Type: "Paid". Enter Price: "$150".                                                   | Exchange type and price input accepted.                                                                                                       | AI: Verify "Paid" option is selected for exchange type. Price input field (if separate) contains "$150".                                                                                                                        |
| 7    | Set Availability: "Weekdays 9 AM - 5 PM, Weekends by appointment".                                   | Availability input accepted/selected.                                                                                                         | AI: Verify availability selection/input reflects the entered data.                                                                                                                                                               |
| 8    | Define Service Area: "Willow Creek Neighborhood and 5-mile radius".                                  | Service area input accepted/map selection made.                                                                                               | AI: Verify service area input/selection reflects the data.                                                                                                                                                                       |
| 9    | Upload Media: Select `maya_graphic_design_portfolio_sample.jpg`.                                     | Image preview is displayed on the form. File uploaded to Supabase Storage.                                                                  | AI: Verify an `<img>` tag for media preview shows an image. `src` attribute is populated. Database: Supabase Storage contains `maya_graphic_design_portfolio_sample.jpg` linked to this pending offer/user.                            |
| 10   | Review all entered information on the form.                                                          | All information is displayed correctly as entered.                                                                                            | AI: Verify all input fields still reflect the data entered.                                                                                                                                                                      |
| 11   | Click "Post Offer" or "Submit Listing" button.                                                       | The skill offer is successfully submitted. A confirmation message "Skill offer posted successfully!" is displayed. User may be redirected to their listings page or the new offer's page. | AI: Verify success message is displayed. URL changes to "My Skill Offers", the new skill offer's page, or dashboard. Database: A new `skill_offers` record is created for Maya with all specified details and media reference.          |
| 12   | Navigate to "My Skill Offers" or "My Listings" page (custom Neighborly Skillshare page).             | The newly created "Custom Logo Design" offer is visible in Maya's list of active offers.                                                      | AI: Verify a listing with the title "Custom Logo Design" and Maya as the provider is present on the page. Key details like price "$150" should be visible.                                                                      |
| 13   | View the details of the newly posted skill offer.                                                    | The full skill offer page displays all information correctly: title, category, description, price, availability, service area, and uploaded image. | AI: Verify all details ("Custom Logo Design", "Graphic & Web Design", "$150", description text, availability, service area, and the uploaded image) are correctly displayed on the skill offer's dedicated page. Image `<img>` tag has valid `src`. |

## 3. Test Data
*   **User Persona:** Maya (34, Graphic Designer)
    *   Email: `maya_provider_supastarter_email@example.com`
    *   Password: `Password123!`
    *   Logged in: Yes
*   **Skill Offer Details:**
    *   Title: Custom Logo Design
    *   Category: Graphic & Web Design (ensure this exists in `skill_categories` table)
    *   Description: Professional logo design services for small businesses and startups. Includes 3 initial concepts and 2 rounds of revisions.
    *   Exchange Type: Paid
    *   Price: $150
    *   Availability: Weekdays 9 AM - 5 PM, Weekends by appointment
    *   Service Area: Willow Creek Neighborhood and 5-mile radius
    *   Media: `maya_graphic_design_portfolio_sample.jpg`
*   Supabase Storage bucket configured for media.

## 4. Expected Overall Result
A registered and logged-in skill provider (Maya), using her Supastarter-based account, can successfully create and publish a new Neighborly Skillshare skill offer. The new offer is visible on the platform and accurately reflects all provided details in the custom `skill_offers` table and related UI.

## 5. AI Verifiable End Result
*   A new skill offer titled "Custom Logo Design" associated with Maya's Supabase `auth.users` ID exists in the custom `skill_offers` table in the database.
*   The `skill_offers` record contains all specified details: category_id (linking to "Graphic & Web Design"), description, exchange type "Paid", price "$150", availability, service area, and a reference to the uploaded media in Supabase Storage.
*   Maya's "My Skill Offers" page lists the new offer.
*   The dedicated page for the "Custom Logo Design" skill offer displays all these details correctly, including rendering the uploaded image from Supabase Storage.
*   AI can verify by checking for text elements, image presence (`<img>` tag with `src`), and specific data in the `skill_offers` table and confirming file existence in Supabase Storage (if direct API/tool access for verification is available).