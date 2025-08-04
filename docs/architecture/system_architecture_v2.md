# High-Level System Architecture: Neighborly Skillshare MVP (v2 - Supastarter Integration)

**Version:** 2.0
**Date:** May 20, 2025
**Prepared by:** AI Architect

## 1. Introduction

### 1.1 Purpose
This document outlines the high-level system architecture for the Neighborly Skillshare Minimum Viable Product (MVP). This version (v2) specifically details the architecture incorporating the "Supastarter" Next.js/Supabase SaaS template, as recommended in the [`docs/research/github_template_research_report.md`](../research/github_template_research_report.md) and detailed in the [`docs/template_integration_guide.md`](../template_integration_guide.md).

The architecture aims to provide a scalable, maintainable, and secure foundation for the platform, enabling the core functionalities defined in the [`init_docs/product_requirements.md`](../../init_docs/product_requirements.md) and [`init_docs/blueprint.md`](../../init_docs/blueprint.md). It directly supports the AI-verifiable tasks outlined in the [`docs/master_project_plan.md`](../master_project_plan.md) and is designed to facilitate passing all High-Level Acceptance Tests (HLTs) found in [`docs/testing/high_level_acceptance_tests/`](../testing/high_level_acceptance_tests/).

### 1.2 Scope
This document covers the overall system structure, key components, technology stack, data flow, and interactions. It focuses on how the Supastarter template is leveraged and extended to meet Neighborly Skillshare's unique requirements.

## 2. Guiding Architectural Principles

The architecture adheres to the following principles, derived from project documentation:

*   **Leverage Template Strengths:** Maximize the use of Supastarter's robust features (auth, user management, UI foundation) to accelerate development.
*   **Modular Design:** Develop custom Neighborly Skillshare features as distinct modules that integrate cleanly with the template.
*   **User-Centric:** Prioritize features and design choices that enhance user experience, trust, and community building.
*   **Scalability:** Design components with future growth in mind, leveraging Supabase's scalable infrastructure.
*   **Security by Design:** Integrate security best practices from the outset, building upon Supabase's security features (RLS, Auth).
*   **Maintainability:** Promote clean code, clear separation of concerns, and good documentation.
*   **Mobile-First:** Ensure the design and components are responsive and optimized for mobile users.
*   **Hyperlocal Focus:** Architectural decisions should support and enhance the neighborhood-level connection aspect.
*   **AI-Verifiable Outcomes:** The architecture must enable the AI-verifiable tasks specified in the Master Project Plan.

## 3. System Overview

Neighborly Skillshare will be a web application built on a modern Jamstack architecture, heavily leveraging the Supastarter template.

**Core Layers:**

1.  **Presentation Layer (Frontend):** A Next.js (App Router) application, built upon the Supastarter UI foundation (likely TailwindCSS and a component library like Shadcn UI). This layer is responsible for rendering the user interface, handling user interactions, and managing client-side state.
2.  **Application Logic Layer:** Resides within both the Next.js frontend (client-side logic, Server Components, API Routes/Server Actions) and Supabase (database functions, triggers, RLS policies).
3.  **Backend Services (BaaS - Supabase):** Supabase provides core backend functionalities:
    *   **Authentication:** Supabase Auth for user registration, login, session management.
    *   **Database:** Supabase PostgreSQL for storing all application data (user profiles, skills, messages, etc.), with PostGIS enabled for geolocation.
    *   **Storage:** Supabase Storage for user-generated content like profile pictures and skill media.
    *   **Realtime:** Supabase Realtime for live messaging and notifications.
    *   **Serverless Functions:** Supabase Edge Functions can be used for more complex backend logic if needed.
4.  **Third-Party Services:** Integration with mapping services (e.g., Mapbox, Leaflet with OpenStreetMap) for geolocation visualization.

**Diagrammatic Representation (Conceptual):**

```
+------------------------------------------------------------------------+
|                        User (Web Browser)                              |
+------------------------------------------------------------------------+
                                  |
                                  V
+------------------------------------------------------------------------+
|                   Presentation Layer (Next.js Frontend)                |
|  (Built on Supastarter: UI Components, Routing, Client-Side State)     |
|  +-------------------------+  +-------------------------------------+  |
|  |   Auth & User Mgmt      |  |  Neighborly Skillshare Custom Modules |  |
|  |   (Leverages Supastarter)|  |  - Skill Listings & Management      |  |
|  |   Profile Mgmt          |  |  - Search & Discovery (Geolocation) |  |
|  |   (Extends Supastarter) |  |  - Messaging (Realtime)             |  |
|  +-------------------------+  |  - Ratings & Reviews                |  |
|                             |  +-------------------------------------+  |
+------------------------------------------------------------------------+
           | (API Calls: Next.js API Routes/Server Actions) |
           V                                                V
+-----------------------------+      +-----------------------------------+
|   Application Logic Layer   |----->|   Backend Services (Supabase)     |
| (Next.js Server / Supabase  |      |  +------------------------------+ |
|  Functions, Triggers, RLS)  |      |  | Supabase Auth                | |
+-----------------------------+      |  +------------------------------+ |
                                     |  | Supabase Database (PostgreSQL | |
                                     |  |  + PostGIS)                  | |
                                     |  +------------------------------+ |
                                     |  | Supabase Storage             | |
                                     |  +------------------------------+ |
                                     |  | Supabase Realtime            | |
                                     |  +------------------------------+ |
                                     |  | Supabase Edge Functions (opt)| |
                                     |  +------------------------------+ |
                                     +-----------------------------------+
                                                      |
                                                      V
                                     +-----------------------------------+
                                     | Third-Party Services (e.g., Maps) |
                                     +-----------------------------------+
```

## 4. Technology Stack

*   **Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS (likely via Supastarter).
*   **Component Library:** Shadcn UI or similar (as provided/recommended by Supastarter).
*   **Backend-as-a-Service (BaaS):** Supabase
    *   Database: PostgreSQL (with PostGIS extension)
    *   Authentication: Supabase Auth
    *   Storage: Supabase Storage
    *   Realtime: Supabase Realtime
    *   Serverless Functions: Supabase Edge Functions (optional)
*   **Deployment:** Vercel (for Next.js frontend), Supabase Cloud.
*   **Version Control:** Git (repository structure as per Supastarter, e.g., `apps/web`, `packages/db`).

## 5. Key Architectural Components & Modules

### 5.1 Frontend (Next.js Application - `apps/web/`)

The frontend will be structured around the Next.js App Router, leveraging Server Components and Client Components appropriately.

#### 5.1.1 Authentication & User Management
*   **Leverages:** Supastarter's existing authentication pages (login, signup, password reset) and Supabase Auth integration.
*   **Functionality:** User registration, email verification, login/logout, session management.
*   **MPP Task Support:** Phase 1.3.1, Phase 2.1.
*   **HLT Alignment:** HLT-001.

#### 5.1.2 Profile Management
*   **Extends:** Supastarter's basic profile/account pages.
*   **Custom Additions:** Fields for bio, Neighborly Skillshare specific skills (offered/needed), links to user locations, display of average ratings and reviews.
*   **Backend Interaction:** CRUD operations on the `profiles` and related custom tables (`user_locations`, `user_skills` if normalized) via Next.js API Routes/Server Actions.
*   **MPP Task Support:** Phase 2.2.
*   **HLT Alignment:** HLT-001.

#### 5.1.3 Skill Listing & Management (Custom Module)
*   **Functionality:** Creating, viewing, editing, and deleting skill offers and requests. Includes forms for input, display cards, and detail pages. Media uploads for listings.
*   **Backend Interaction:** CRUD operations on `skill_offers` and `skill_requests` tables. Supabase Storage for media.
*   **MPP Task Support:** Phase 3.1, 3.2, 3.4.
*   **HLT Alignment:** HLT-002, HLT-003.

#### 5.1.4 Search & Discovery (Custom Module)
*   **Functionality:**
    *   Keyword search, category filtering.
    *   Geolocation-based search (integrating with `user_locations` and `skill_offers` PostGIS data).
    *   Display of results in list and map views (using a mapping library like Leaflet or React Map GL).
*   **Backend Interaction:** Complex queries to Supabase database, potentially via dedicated API Routes/Server Actions that perform PostGIS queries.
*   **MPP Task Support:** Phase 1.3.2, Phase 3.3.
*   **HLT Alignment:** HLT-004.

#### 5.1.5 Messaging (Custom Module)
*   **Functionality:** Real-time in-app messaging between users. Conversation list, chat interface, unread message indicators, notifications.
*   **Backend Interaction:** Supabase Realtime for message delivery and notifications. `messages`, `conversations`, `conversation_participants` tables for persistence.
*   **MPP Task Support:** Phase 4.1, 4.2.
*   **HLT Alignment:** HLT-005.

#### 5.1.6 Ratings & Reviews (Custom Module)
*   **Functionality:** Submitting star ratings and textual reviews for completed exchanges. Displaying aggregated ratings and individual reviews on user profiles.
*   **Backend Interaction:** CRUD operations on the `reviews` table. Logic (possibly DB triggers/functions) to update `average_rating` on `profiles` table.
*   **MPP Task Support:** Phase 5.1.
*   **HLT Alignment:** HLT-006.

#### 5.1.7 UI Components
*   **Leverages:** Supastarter's chosen UI library (e.g., Shadcn UI) for common elements (buttons, forms, modals).
*   **Custom Additions:** Specific components for skill cards, map views, chat interfaces, review displays, etc., styled with TailwindCSS to match Neighborly Skillshare's branding.
*   **MPP Task Support:** Phase 1.3.5.

### 5.2 Backend (Supabase)

#### 5.2.1 Database Schema
*   As detailed in [`docs/template_integration_guide.md#L95`](../template_integration_guide.md:95). This includes tables like `profiles` (extending Supastarter's user concept), `skill_categories`, `skill_offers`, `skill_requests`, `user_locations` (with PostGIS `geom` column), `exchanges`, `reviews`, `messages`, `conversations`, `conversation_participants`, and `reports`.
*   **RLS Policies:** Strict Row Level Security policies will be implemented for all tables to ensure data privacy and authorized access.
*   **MPP Task Support:** Phase 1.2.1.

#### 5.2.2 Authentication (Supabase Auth)
*   Managed by Supabase Auth, integrated via Supastarter. Handles user sign-up, login, password recovery, email verification, and session management.

#### 5.2.3 Storage (Supabase Storage)
*   Used for storing user-uploaded media: profile pictures, images/videos for skill listings.
*   Access controls configured via Supabase Storage policies.
*   **MPP Task Support:** Phase 1.3.3.

#### 5.2.4 Realtime (Supabase Realtime)
*   Powers the in-app messaging system for instant message delivery.
*   Used for real-time notifications for new messages, skill matches, etc.
*   **MPP Task Support:** Phase 4.1.1, 4.2.2.

#### 5.2.5 Serverless Functions (Supabase Edge Functions - Optional)
*   May be used for:
    *   Complex backend logic that cannot be efficiently handled by RLS or client-side calls (e.g., advanced matching algorithms post-MVP).
    *   Integrations with third-party services requiring secure API key management.
    *   Periodic tasks or data processing.

### 5.3 API Layer (Next.js API Routes / Server Actions)

*   Custom backend logic for Neighborly Skillshare features will be implemented primarily using Next.js API Routes or Server Actions.
*   These will handle CRUD operations for custom entities (skills, exchanges, reviews), complex search queries, and interactions with Supabase services.
*   All API endpoints will enforce authentication and authorization.
*   **MPP Task Support:** Phase 1.2.4.

## 6. Data Model

The detailed data model and table structures are defined in the [`docs/template_integration_guide.md#L95`](../template_integration_guide.md:95). Key entities include:

*   **Users/Profiles:** Core user information, extended from Supastarter.
*   **Skill Categories:** Hierarchical categories for skills.
*   **Skill Offers & Requests:** The core listings on the platform.
*   **User Locations:** Manages user addresses and PostGIS geometry for geospatial queries.
*   **Exchanges:** Records interactions between users for skill sharing.
*   **Reviews:** User-submitted ratings and comments.
*   **Messages & Conversations:** Data for the real-time chat system.
*   **Reports:** For user-flagged content or behavior.

Relationships are established using foreign keys, and data integrity is maintained through database constraints and RLS.

## 7. Integration with Supastarter Template

The Supastarter template provides the foundational scaffolding:

*   **Project Structure:** Adopts the Next.js monorepo-like structure (if applicable from template) or standard Next.js App Router structure.
*   **Authentication:** Core auth flows, UI pages for login/signup, and Supabase client setup are used directly.
*   **User Profiles:** Basic user account pages are extended with Neighborly Skillshare-specific fields and functionalities.
*   **UI Library & Styling:** TailwindCSS and components (e.g., Shadcn UI) from the template are used as a base, customized and extended for Neighborly Skillshare's branding and unique components.
*   **Database Setup:** Initial Supabase project setup, migrations (if part of the template), and type generation for Supabase client are leveraged.
*   **Deployment Configuration:** Vercel deployment settings are adapted.

Custom modules for skill listings, search, messaging, and reviews are built as new features within this templated environment, following similar patterns for data fetching, state management, and API interaction.

## 8. Support for AI Verifiable Tasks (MPP)

This architecture directly supports the AI-verifiable tasks in the [`docs/master_project_plan.md`](../master_project_plan.md) by:

*   **Task 1.1.1 (Next.js Setup):** Provided by Supastarter.
*   **Task 1.1.2 (Supabase Setup):** Provided by Supastarter and extended per [`docs/template_integration_guide.md`](../template_integration_guide.md). Verifiable by Supabase project existence and DB connectivity.
*   **Task 1.2.1 (DB Schema):** Defined architecture includes specific tables. Verifiable by migration files and Supabase schema inspection.
*   **Task 1.2.2 (Component Architecture):** Modular design with Supastarter base and custom components. Verifiable by code structure.
*   **Task 1.2.4 (API Structure):** Next.js API Routes/Server Actions for defined functionalities. Verifiable by route definitions and successful API calls.
*   **Task 1.3.1 (Auth Infra):** Leverages Supastarter & Supabase Auth. Verifiable by functional auth endpoints.
*   **Task 1.3.2 (Geolocation Services):** Integration of PostGIS and mapping libraries. Verifiable by API returning geo-data.
*   **Task 1.3.3 (Storage):** Supabase Storage configuration. Verifiable by successful file uploads/downloads.
*   **Subsequent Phase Tasks:** Each custom module (User Management, Skill Exchange, Communication, Trust & Safety) corresponds to architectural components whose implementation and database interactions are verifiable. For instance, creating a skill offer (Task 3.1.2) involves UI forms, API calls, and database record creation, all verifiable.

## 9. Alignment with High-Level Acceptance Tests (HLTs)

The architecture is designed to pass all HLTs:

*   **HLT-001 (User Registration & Profile):** Supported by Supastarter's auth, extended profile components, and custom profile tables in Supabase.
*   **HLT-002 (Skill Provider Posts Offer):** Supported by the Skill Listing module, forms, API for offer creation, and `skill_offers` table.
*   **HLT-003 (Skill Seeker Posts Request):** Supported by the Skill Listing module, forms, API for request creation, and `skill_requests` table.
*   **HLT-004 (Search Skills):** Supported by the Search & Discovery module, PostGIS queries, and UI for displaying results.
*   **HLT-005 (Secure In-App Messaging):** Supported by the Messaging module, Supabase Realtime, and `messages`/`conversations` tables.
*   **HLT-006 (Ratings and Reviews):** Supported by the Ratings & Reviews module, API for submission, and `reviews` table, with updates to `profiles`.

## 10. Deployment

*   **Frontend (Next.js):** Deployed to Vercel, leveraging its tight integration with Next.js for CI/CD, preview deployments, and global CDN.
*   **Backend (Supabase):** Utilizes Supabase's managed cloud infrastructure for database, auth, storage, and realtime services.
*   **MPP Task Support:** Task 1.1.4.

## 11. Scalability, Security, and Performance Considerations

*   **Scalability:**
    *   Supabase is designed for scalability.
    *   Next.js on Vercel scales automatically.
    *   Database queries will be optimized, and indexing strategies applied (PostGIS spatial indexes are crucial).
    *   Stateless API design where possible.
*   **Security:**
    *   Leverages Supabase Auth and RLS for data protection.
    *   HTTPS enforced.
    *   Standard web security practices (XSS prevention, CSRF protection - often handled by Next.js/Vercel).
    *   Input validation on client and server.
    *   Regular dependency updates.
*   **Performance:**
    *   Next.js ISR/SSR/SSG capabilities for fast page loads.
    *   Image optimization.
    *   Code splitting via Next.js.
    *   Efficient database queries and indexing.
    *   Client-side rendering for dynamic parts where appropriate.
    *   Caching strategies (Vercel CDN, potentially data caching).

This architecture provides a solid, modern foundation for Neighborly Skillshare, balancing rapid development through template integration with the flexibility to build out its unique, community-focused features.