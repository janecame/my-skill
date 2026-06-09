# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Skill Progress Tracker** is a full-stack web application for visualizing and tracking personal learning journeys, including skill progression, project milestones, and lessons learned.

See `skill-progress-tracker-plan.md` for the complete feature roadmap and implementation phases.

## Tech Stack

- **Frontend**: MUI + TanStack Query + Zustand + React Hook Form + Zod + TypeScript
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL via Supabase
- **Testing**: Playwright (for end-to-end tests)

## Key Database Tables

```
skills: id, name, category, proficiency (0-100%), started_date, notes
projects: id, name, description, status (0-100%), tech_stack, skills_used, start/end_date, url
lessons: id, title, content, skills_tagged, projects_tagged, date_learned, importance
progress_history: id, skill_id, old_value, new_value, updated_at
```

See the plan document for the full schema.

## Development Commands

_To be added once the project is initialized. Expected setup:_
```bash
npm install
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
npm run test:watch   # Watch mode for development
```

## Architecture Notes

- **API Layer**: Use Next.js API routes in `/app/api` for all backend operations
- **Database Access**: Leverage Supabase client throughout the app; consider creating utility functions in `/lib/supabase.ts` for common queries
- **Components**: Keep UI components in `/app/components`, organized by feature (e.g., `/components/skills`, `/components/projects`)
- **State Management**: Use React hooks and context as needed; avoid external state libraries initially for simplicity
- **Charts/Visualization**: Recharts components should be isolated in their own component files for easy testing and reuse

## Implementation Strategy

Follow the phases defined in the plan:
1. **Phase 1 (MVP)**: Dashboard layout, CRUD for skills/projects, progress bars
2. **Phase 2**: Learning journal, progress charts, filtering
3. **Phase 3**: Polish and mobile responsiveness
4. **Phase 4**: Advanced features (export/import, analytics, etc.)

Start with static/hardcoded data to build the UI, then wire up Supabase.

## Common Workflows

- **Adding a new feature**: Create new components, define Supabase queries in `/lib`, wire up in the relevant page
- **Testing**: Write Playwright tests in `/e2e` directory; test critical user flows (add skill, create project, etc.)
- **Data changes**: Update the Supabase schema first, then update TypeScript types in `/lib/types.ts`

## Important Patterns

- Always validate user input on the backend (even if you validate on the frontend)
- Use TypeScript for all code—define types for database entities in `/lib/types.ts`
- Keep Supabase credentials in environment variables (`.env.local`)
- Use SQL `created_at` and `updated_at` timestamps on all tables for audit trails
