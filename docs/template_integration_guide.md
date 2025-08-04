# Template Integration Guide: Neighborly Skillshare MVP

**Date:** May 20, 2025
**Prepared by:** AI GitHub Template Scout
**Project:** Neighborly Skillshare
**Integrated Template:** "Supastarter" (Generic Next.js/Supabase SaaS Starter)
**Assumed Source URL (Example):** `https://github.com/some-community/supastarter-nextjs-tailwind`
**Assumed Local Path:** `template_Supastarter/`

## 1. Introduction

This document provides a guide for integrating the chosen "Supastarter" template into the Neighborly Skillshare MVP project. It outlines the template's original structure, its alignment with project requirements, and a comprehensive list of specific changes, alterations, or extensions required to make it fully usable and optimized for the project.

This guide is intended for developers and architects who will be working on adapting the template and building out the unique features of Neighborly Skillshare. It is based on the findings in the [`docs/research/github_template_research_report.md`](./research/github_template_research_report.md).

## 2. Integrated Template Overview

### 2.1 Template Source and Version

*   **Name:** "Supastarter" (representing a generic, comprehensive Next.js/Supabase/TypeScript SaaS starter kit)
*   **Hypothetical Source Repository URL:** `https://github.com/some-community/supastarter-nextjs-tailwind` (Note: This is a placeholder. The actual URL would be to the specific chosen template.)
*   **Version/Commit:** (Specify commit hash if a specific version was pulled)
*   **License:** (Typically MIT for such starters)

### 2.2 Original Template Structure (High-Level)

A typical "Supastarter" template structure might include:

```
template_Supastarter/
├── apps/
│   └── web/                        // Next.js application
│       ├── app/                    // App Router
│       │   ├── (auth)/             // Auth routes (login, signup)
│       │   ├── (dashboard)/        // Protected dashboard routes
│       │   │   ├── account/
│       │   │   └── settings/
│       │   └── layout.tsx
│       │   └── page.tsx
│       ├── components/             // UI components (often Shadcn UI)
│       │   ├── auth/
│       │   └── ui/
│       ├── lib/                    // Helper functions, Supabase client
│       ├── public/                 // Static assets
│       ├── styles/                 // Global styles, Tailwind config
│       ├── next.config.js
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── db/                       // Supabase schema, migrations, types
│   ├── ui/                       // Shared UI components (if monorepo)
│   └── config/                   // Shared configurations
├── .eslintrc.js
├── .gitignore
├── README.md
└── (other config files like prettier, turbo.json if monorepo)
```

### 2.3 Intended Use of the Original Template

These templates are generally designed as starting points for building Software-as-a-Service (SaaS) applications. Key features usually include:
*   User authentication (email/password, social logins, magic links)
*   User profile management and account settings
*   Protected routes and dashboards
*   Integration with Supabase for database, auth, and storage
*   Modern Next.js features (App Router, Server Components)
*   Styling with TailwindCSS and often a component library like Shadcn UI
*   Database schema management and type safety for Supabase interactions

## 3. Alignment with Neighborly Skillshare Requirements

### 3.1 Strengths & Alignment:

*   **Core Technology Stack:** Perfectly aligns (Next.js, TypeScript, Supabase, TailwindCSS).
*   **User Authentication & Profiles:** Provides a robust and secure foundation for user registration, login, and profile management, including RLS. This saves significant development time.
*   **Application Structure:** Offers a well-organized project structure following Next.js best practices.
*   **UI Foundation:** The inclusion of TailwindCSS and often Shadcn UI provides a good base for creating the desired "clean, friendly, and trustworthy" interface.
*   **Database Integration:** Pre-configured Supabase client, examples of database interactions, and often type generation for Supabase schema.
*   **Developer Experience:** Typically includes linting, formatting, and sometimes basic testing configurations.

### 3.2 Gaps & Deviations:

*   **Marketplace-Specific Features:** Lacks out-of-the-box support for skill listings, offer/request management, and exchange workflows.
*   **Geolocation:** No built-in geolocation search, map integration, or PostGIS setup.
*   **Messaging System:** While Supabase Realtime might be used for some notifications, a full in-app messaging system is absent.
*   **Ratings & Reviews:** This system needs to be custom-built.
*   **Hyperlocal & Community Focus:** The generic SaaS structure needs to be adapted to emphasize neighborhood connections and community building.
*   **Specific Business Logic:** Logic for various exchange types (paid, barter, free) is not present.
*   **Potential Over-Engineering:** Some SaaS features (e.g., complex subscription models, team management if present) might be unnecessary and require removal or simplification.

## 4. Required Modifications & Extensions for Neighborly Skillshare

The following is a comprehensive list of changes needed to adapt the "Supastarter" template for Neighborly Skillshare.

### 4.1 Database Schema (`packages/db/` or `supabase/migrations/`)

1.  **New Tables:**
    *   `skill_categories` (id, name, parent_category_id)
    *   `skill_offers` (id, user_id, title, description, category_id, exchange_type (enum: 'paid', 'barter', 'free'), price, currency, availability_details, service_area_type (enum: 'local', 'radius'), service_radius_km, media_urls (jsonb), status (enum: 'active', 'paused', 'completed', 'deleted'), created_at, updated_at)
    *   `skill_requests` (id, user_id, title, description, category_id, exchange_type, preferred_timeframe, status, created_at, updated_at)
    *   `user_locations` (user_id, address_text, latitude, longitude, geom (PostGIS geography point), is_primary, created_at, updated_at)
    *   `exchanges` (id, offer_id, request_id, provider_id, seeker_id, status (enum: 'pending', 'accepted', 'declined', 'completed', 'cancelled'), agreed_terms, completed_at, created_at, updated_at)
    *   `reviews` (id, exchange_id, reviewer_id, reviewee_id, rating (int 1-5), comment, created_at, updated_at)
    *   `messages` (id, conversation_id, sender_id, content, created_at, read_at)
    *   `conversations` (id, created_at)
    *   `conversation_participants` (conversation_id, user_id)
    *   `reports` (id, reported_by_user_id, reported_user_id, reported_offer_id, reported_request_id, reported_message_id, reason, details, status (enum: 'pending', 'reviewed', 'action_taken'), created_at, updated_at)
2.  **Modify Existing Tables:**
    *   `profiles` (or `users`): Add fields like `average_rating`, `bio`, `profile_picture_url`, `is_verified_email` (if not already distinct from Supabase auth.users). Ensure a clear link to `user_locations`.
3.  **Enable PostGIS:** Ensure the PostGIS extension is enabled in Supabase for `user_locations.geom` and `skill_offers.geom` (if storing offer locations directly).
4.  **Row Level Security (RLS):**
    *   Review and adapt existing RLS policies for `profiles`.
    *   Implement strict RLS policies for all new tables (e.g., users can only edit their own offers/requests, participants can view their messages/exchanges, etc.).
5.  **Database Functions/Triggers (Optional but Recommended):**
    *   Function to calculate average rating for a user.
    *   Trigger to update average rating when a new review is submitted.
    *   Functions for geospatial queries (e.g., finding skills within a radius).

### 4.2 Backend Logic (Next.js API Routes or Server Actions in `apps/web/app/`)

1.  **Skill Offer/Request Management:**
    *   CRUD API endpoints/Server Actions for `skill_offers` and `skill_requests`.
    *   Logic for handling media uploads (interfacing with Supabase Storage).
2.  **Search & Geolocation:**
    *   API endpoint/Server Action for searching skills, incorporating:
        *   Keyword search (on title, description).
        *   Category filtering.
        *   Geospatial filtering (skills within X km of user's location or a specified point) using PostGIS functions.
        *   Filtering by exchange type, price range, etc.
3.  **Exchange Management:**
    *   API endpoints/Server Actions for initiating, accepting, completing, and canceling exchanges.
4.  **Messaging System:**
    *   API endpoints/Server Actions for sending messages, fetching conversations, and messages within a conversation.
    *   Leverage Supabase Realtime for new message notifications.
5.  **Ratings & Reviews:**
    *   API endpoints/Server Actions for submitting reviews and fetching reviews for a user/skill.
6.  **User Profile Enhancements:**
    *   API endpoints/Server Actions for updating extended profile information (skills, detailed bio, location management).
7.  **Reporting System:**
    *   API endpoints/Server Actions for submitting reports.

### 4.3 Frontend UI & UX (`apps/web/app/` & `apps/web/components/`)

1.  **New Pages/Routes:**
    *   `/offers/new` (Create Skill Offer)
    *   `/offers/[id]` (View Skill Offer Detail)
    *   `/requests/new` (Create Skill Request)
    *   `/requests/[id]` (View Skill Request Detail)
    *   `/search` (Main search page with filters and map/list view)
    *   `/messages` (List of conversations)
    *   `/messages/[conversationId]` (Chat interface)
    *   `/users/[userId]` (Public User Profile, showing skills, reviews)
    *   `/dashboard/my-offers`
    *   `/dashboard/my-requests`
    *   `/dashboard/my-exchanges`
    *   `/dashboard/reviews-to-leave`
2.  **Component Development/Adaptation:**
    *   **Skill Card Component:** For displaying skill offers/requests in search results and lists.
    *   **Forms:** For creating/editing profiles, skill offers, skill requests, reviews.
    *   **Map Component:** Integrate Leaflet or React Map GL for displaying locations and search results.
    *   **Chat Interface:** Components for conversation list, message bubbles, message input.
    *   **Star Rating Component:** For submitting and displaying ratings.
    *   **Notification System:** UI for displaying real-time notifications.
    *   **Profile Sections:** Add sections for "Skills Offered," "Skills Needed," "Reviews" to user profile pages.
3.  **UI/UX Styling:**
    *   Adapt TailwindCSS configuration and existing components (e.g., from Shadcn UI) to match Neighborly Skillshare's "clean, friendly, trustworthy" aesthetic.
    *   Ensure mobile-first responsiveness for all new pages and components.
4.  **Client-Side Logic:**
    *   State management for forms, search filters, messaging UI.
    *   Fetching data using React Query, SWR, or Server Components with client-side interactions.
    *   Handling Supabase Realtime subscriptions for messages and notifications.

### 4.4 Authentication & Authorization

1.  **Review RLS:** Ensure all new data access patterns are covered by appropriate RLS policies in Supabase.
2.  **Protected Routes:** Extend route protection (likely already present in the starter) to all new dashboard sections and actions requiring authentication.

### 4.5 Configuration & Deployment (`apps/web/`, root)

1.  **Environment Variables:** Add new environment variables for any third-party services (e.g., API keys for mapping services).
2.  **Supabase Client:** Ensure the Supabase client in `lib/supabaseClient.ts` (or similar) is correctly configured and used throughout.
3.  **Vercel Deployment:** Update any Vercel deployment configurations if necessary (e.g., for new environment variables).

### 4.6 Stripping Unnecessary Features

*   Identify any SaaS-specific features in the template that are not relevant to Neighborly Skillshare (e.g., complex subscription billing, team management if not adaptable for "neighborhood groups" later, advanced admin dashboards beyond basic user management).
*   Carefully remove or disable these features, ensuring no broken dependencies. This might involve removing UI components, API routes, and database tables.

### 4.7 Testing

*   If the template includes a testing setup (e.g., Playwright, Jest), adapt it to cover the new features.
*   Write unit tests for critical helper functions and UI components.
*   Write integration tests for API endpoints/Server Actions.
*   Write E2E tests for key user flows (registration, posting a skill, searching, messaging, leaving a review).

## 5. Integration Steps & Best Practices

1.  **Understand the Template:** Before making major changes, thoroughly explore the existing template. Understand its structure, auth flow, data fetching patterns, and state management. Run it locally.
2.  **Version Control:** Create a new branch for the integration work. Commit changes frequently with clear messages.
3.  **Incremental Changes:** Implement the modifications in small, manageable chunks. Start with database schema changes, then backend logic, then frontend UI.
4.  **Database First:** Define and implement new Supabase tables and RLS policies early. Use Supabase Studio and local CLI for schema management.
5.  **Type Safety:** Leverage TypeScript throughout. Ensure Supabase client generates types for your schema and use them.
6.  **Component Reusability:** Build generic UI components where possible.
7.  **Mobile-First:** Continuously test on various screen sizes.
8.  **Regularly Test:** Test each new piece of functionality as it's built.
9.  **Documentation:** Document any significant architectural decisions or complex logic added.
10. **Code Review:** If working in a team, ensure code reviews for all major changes.

## 6. Conclusion

Integrating the "Supastarter" template provides a significant head start for the Neighborly Skillshare MVP. However, careful planning and execution of the modifications outlined above are crucial for successfully adapting the template to meet the project's unique requirements. By following an incremental approach and focusing on the core hyperlocal marketplace features, the development team can leverage the template's strengths while building a tailored and effective platform.