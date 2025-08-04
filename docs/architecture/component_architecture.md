# Component Architecture: Neighborly Skillshare

## Overview

This document outlines the component architecture for the Neighborly Skillshare platform, based on the Supastarter Next.js/Supabase template. It describes the initial high-level component structure and identifies where custom components for Neighborly Skillshare will reside.

## Component Organization

The component architecture follows a modular approach, separating UI components from feature-specific components and layouts. This organization promotes reusability, maintainability, and a clear separation of concerns.

```
components/
├── ui/                  # Base UI components (from shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── auth/                # Authentication components
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── ...
├── layout/              # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   └── ...
├── skills/              # Skill-related components
│   ├── skill-card.tsx
│   ├── skill-form.tsx
│   ├── skill-detail.tsx
│   └── ...
├── profiles/            # Profile-related components
│   ├── profile-card.tsx
│   ├── profile-form.tsx
│   ├── profile-header.tsx
│   └── ...
├── search/              # Search-related components
│   ├── search-filters.tsx
│   ├── search-results.tsx
│   ├── map-view.tsx
│   └── ...
├── messaging/           # Messaging components
│   ├── conversation-list.tsx
│   ├── message-thread.tsx
│   ├── message-composer.tsx
│   └── ...
└── reviews/             # Review components
    ├── review-card.tsx
    ├── review-form.tsx
    ├── star-rating.tsx
    └── ...
```

## Core Component Types

### 1. UI Components (`components/ui/`)

These are foundational UI elements based on shadcn/ui, providing a consistent design language across the application. They are highly reusable and have no business logic.

Examples:
- `Button`: Various button styles (primary, secondary, ghost, etc.)
- `Input`: Text input fields
- `Card`: Container for content with consistent styling
- `Modal`: Popup dialogs
- `Select`: Dropdown selection components
- `Textarea`: Multi-line text input

### 2. Layout Components (`components/layout/`)

These components define the overall structure of the application and are used across multiple pages.

Examples:
- `Header`: Main navigation header with logo, menu, and user controls
- `Footer`: Site footer with links and information
- `Sidebar`: Navigation sidebar for dashboard views
- `DashboardShell`: Layout wrapper for dashboard pages

### 3. Feature-Specific Components

These components are organized by feature domain and implement specific functionality for the Neighborly Skillshare platform.

#### Authentication Components (`components/auth/`)

Leveraged from Supastarter, these handle user authentication flows.

Examples:
- `LoginForm`: Email/password login form
- `RegisterForm`: User registration form
- `ResetPasswordForm`: Password reset functionality

#### Skill Components (`components/skills/`)

Custom components for Neighborly Skillshare's core skill exchange functionality.

Examples:
- `SkillCard`: Displays a skill offer/request in list and grid views
- `SkillForm`: Form for creating/editing skill offers and requests
- `SkillDetail`: Detailed view of a skill with actions
- `SkillCategorySelector`: Component for selecting skill categories

#### Profile Components (`components/profiles/`)

Components for user profile management and display.

Examples:
- `ProfileCard`: Compact user profile display
- `ProfileHeader`: User profile header with avatar and key information
- `ProfileForm`: Form for editing user profile information
- `SkillList`: List of skills offered/requested by a user

#### Search Components (`components/search/`)

Components for discovering skills and users.

Examples:
- `SearchFilters`: Filters for refining search results
- `SearchResults`: Display of search results in list form
- `MapView`: Geospatial view of skills in the neighborhood
- `LocationSelector`: Component for selecting a location or radius

#### Messaging Components (`components/messaging/`)

Components for the in-app messaging system.

Examples:
- `ConversationList`: List of user conversations
- `MessageThread`: Display of messages in a conversation
- `MessageComposer`: Interface for composing and sending messages
- `UnreadIndicator`: Indicator for unread messages

#### Review Components (`components/reviews/`)

Components for the ratings and reviews system.

Examples:
- `ReviewCard`: Display of a user review
- `ReviewForm`: Form for submitting reviews
- `StarRating`: Interactive and display-only star rating component
- `ReviewsList`: List of reviews for a user

## Page Structure

The application uses Next.js App Router, organizing pages in the `app/` directory:

```
app/
├── (auth)/              # Authentication routes
│   ├── login/
│   ├── register/
│   └── reset-password/
├── (dashboard)/         # Protected dashboard routes
│   ├── account/
│   ├── settings/
│   ├── offers/
│   ├── requests/
│   └── messages/
├── offers/              # Public skill offer routes
│   ├── [id]/
│   └── new/
├── requests/            # Public skill request routes
│   ├── [id]/
│   └── new/
├── search/              # Search functionality
├── users/               # User profile routes
│   └── [id]/
├── api/                 # API routes
│   ├── skills/
│   ├── users/
│   └── messages/
└── ...
```

## Component Interaction Patterns

1. **Data Fetching**: Components use a combination of:
   - Server Components for initial data loading
   - React Query or SWR for client-side data fetching and caching
   - Server Actions for form submissions and data mutations

2. **State Management**:
   - Local component state for UI-specific state
   - React Context for shared state across component trees
   - Server Components for initial state

3. **Component Composition**:
   - Higher-order components for shared functionality
   - Composition over inheritance
   - Props for component configuration

## Styling Approach

The application uses TailwindCSS for styling, with:
- Consistent use of utility classes
- Component-specific styles defined using the `cn` utility
- Responsive design with mobile-first approach
- Dark mode support

## Future Component Development

As the Neighborly Skillshare platform evolves, additional components will be developed for:

1. **Trust and Safety**:
   - Verification badges
   - Safety guidelines
   - Reporting interfaces

2. **Community Features**:
   - Neighborhood groups
   - Community events
   - Skill sharing circles

3. **Enhanced Geolocation**:
   - Interactive service area selection
   - Proximity visualization
   - Location-based notifications

## Conclusion

This component architecture provides a solid foundation for the Neighborly Skillshare platform, leveraging the strengths of the Supastarter template while extending it with custom components for the unique features of a hyperlocal skill exchange marketplace. The modular approach ensures that components can be developed, tested, and maintained independently, while the consistent organization makes it easy for developers to locate and understand the codebase.