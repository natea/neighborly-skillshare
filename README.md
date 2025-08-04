# Neighborly Skillshare

A hyperlocal platform connecting neighbors to exchange skills and services, fostering stronger community bonds and mutual support.

## Overview

Neighborly Skillshare enables users to:
- Offer and request skills within their neighborhood
- Search for skills based on location and categories
- Communicate securely with other users
- Build trust through ratings and reviews

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS, Shadcn UI
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Database**: PostgreSQL with PostGIS for geolocation
- **Deployment**: Vercel (frontend), Supabase Cloud (backend)

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Supabase account and CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/neighborly-skillshare.git
   cd neighborly-skillshare
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials.

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start Supabase locally:
   ```bash
   supabase start
   ```

3. Apply migrations:
   ```bash
   supabase db reset
   ```

4. Generate TypeScript types:
   ```bash
   npm run supabase:gen-types
   # or
   yarn supabase:gen-types
   ```

## Project Structure

```
neighborly-skillshare/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── api/                # API routes
│   └── ...
├── components/             # React components
│   ├── ui/                 # Base UI components
│   ├── auth/               # Auth components
│   ├── skills/             # Skill components
│   └── ...
├── lib/                    # Utility functions
├── public/                 # Static assets
├── supabase/               # Supabase migrations and schema
└── ...
```

## Features

- **User Authentication**: Registration, login, profile management
- **Skill Marketplace**: Post offers and requests, search by location and category
- **Geolocation**: Find skills in your neighborhood
- **Messaging**: Secure in-app communication
- **Reviews & Ratings**: Build trust within the community

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## How this was built

This app was vibe coded live at an AI Tinkerers meetup to demonstrate the research and product specificiation capabilities of Roo Code. The idea was chosen rather randomly from this [collection of 200+ project ideas](https://github.com/DafnckStudio/DafnckMachine---AGF-2.0/blob/main/01_AI-RUN/Template/Inspiration.md#2-hyperlocal-community-skill-exchange-platform).

Look in the `quick_wizard_templates` folder for examples of the templates that were used by Roo Code to generate the documents in the `init_docs` folder.

The `quickstart-wizard` custom mode in `.roomodes` is what's used to prompt the user for a high level idea, which then triggers the process to generate the `concept.md` which feeds into the `blueprint.md` file, which ultimately results in a `product_requirements.md` file.

This product requirements doc (PRD) is used later to build out the `docs/master_project_plan.md` and high level tests as described in the `docs/testing/high_level_acceptance_tests` folder and `docs/testing/master_acceptance_test_plan.md`.

You can also find extensive research that Roo Code conducted using the Gemini MCP server in the `docs/research/neighborly_skillshare` folder.

In order for this to work, you need to add your Gemini API key to your global VSCode `mcp_settings.json` file or a project specific `.roo/mcp.json` file. See `mcp/gemini_mcp.json` for an example.