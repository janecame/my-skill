# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Skill Progress Tracker** is a full-stack web application for tracking personal learning journeys — skills, projects, and lessons/tasks. See `skill-progress-tracker-plan.md` for the feature roadmap.

## Tech Stack

- **Frontend** (`fe/`): React 18 + Vite + MUI v5 + TanStack Query v5 + Recharts + dnd-kit + TypeScript
- **Backend** (`be/`): Node.js + Express + TypeScript + Supabase JS client
- **Database**: PostgreSQL via Supabase

## Development Commands

Both `fe/` and `be/` are separate npm workspaces — install and run them independently.

```bash
# Backend (port 3001)
cd be && npm install
npm run dev       # nodemon + ts-node, watches src/

# Frontend (port 3000)
cd fe && npm install
npm run dev       # Vite dev server, proxies /api → localhost:3001
npm run build     # tsc + vite build
```

There is no test suite configured.

Backend requires a `.env` file in `be/` with `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Frontend optionally reads `VITE_API_URL` to override the default `/api` base (used in `fe/src/api.ts`).

## Architecture

### Frontend (`fe/src/`)
- `api.ts` — all fetch calls using axios; thin wrappers around `GET/POST/PUT/PATCH/DELETE /api/*`
- `types.ts` — shared TypeScript interfaces (source of truth for FE types)
- `pages/` — one file per route: `OverviewPage`, `SkillsPage`, `ProjectsPage`, `LessonsPage`, `SettingsPage`
- `App.tsx` — router, MUI theme (Google-style, defaults to dark mode), sticky nav header
- `utils/reminders.ts` — `LearnReminder` state is **localStorage-only**, not persisted to Supabase

Vite proxies `/api` to `http://localhost:3001`, so `fe/src/api.ts` uses relative `/api` paths.

The nav tab labelled "Task" maps to the `/lessons` route and `LessonsPage`.

### Backend (`be/src/`)
- `index.ts` — Express app, mounts routers at `/api/{skills,projects,lessons,goals,tech-stack-options}`
- `routes/` — one file per resource; each route queries Supabase directly and shapes the response
- `lib/supabase.ts` — single shared Supabase client

### Database (Supabase)
Key tables and their relational joins used in routes:
- `skills` joined with `skill_goals(goal_id)` and `sub_skills(*)`
- `projects` joined with `project_skills(skill_id)`
- `lessons` joined with `lesson_skills(skill_id)` and `lesson_projects(project_id)`
- `goals`, `tech_stack_options` — reference/lookup tables

Types are duplicated between `be/src/types.ts` and `fe/src/types.ts` — keep them in sync when changing the schema. The FE version is a superset (adds `TechStackOption`, `LearnReminder`, `SubSkillState`, `item_type` on `Lesson`, `github_url`/`remaining_tasks` on `Project`). Note: `be/src/types.ts` currently lags — those extra fields are used in the route handlers even though they're absent from BE types.

## Key Patterns

- Route handlers call `supabase` directly — no ORM, no service layer
- Shape functions (`shapeSkill`, `shapeProject`, `shapeLesson`) in each route file transform raw Supabase rows into the API response shape
- `sub_skills` uses a recursive tree built in `buildSubSkillTree` in `routes/skills.ts`
- Join tables (`project_skills`, `lesson_skills`, `lesson_projects`) are deleted and re-inserted wholesale on update
