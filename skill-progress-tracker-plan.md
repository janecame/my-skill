# Skill Progress Tracker - Project Plan

## Overview
A web app to visualize and track your personal learning journey, including skill progression, project milestones, and lessons learned.

---

## Core Features

### 1. Dashboard
- **Skills Overview**: Display all skills with progress bars
- **Project Timeline**: Visual timeline of completed/in-progress projects
- **Learning Stats**: Total hours learned, skills acquired, projects completed
- **Recent Activities**: Latest skill updates, projects, and lessons

### 2. Skills Management
- Add/edit skills with proficiency levels (Beginner → Expert)
- Track progress with percentage or level system
- Associate skills with projects
- View skill growth over time (graph/chart)

### 3. Projects Tracking
- Create projects with:
  - Name, description, status (0-100%)
  - Tech stack used
  - Skills applied
  - Start/end dates
- Show project dependencies and relationships
- Link to portfolio/repos

### 4. Learning Journal
- Log what you learned (daily/weekly)
- Tag lessons with relevant skills/projects
- Search and filter past learnings
- Track "aha moments" and breakthroughs

### 5. Analytics & Insights
- Skill growth trends over time
- Most active learning periods
- Skills paired frequently together
- Project completion rate

---

## Tech Stack (Suggested)

**Frontend:**
- React (component-based UI)
- Next.js (optional: full-stack, better performance)

**Backend:**
- Node.js + Express or Next.js API routes
- Alternative: Supabase (you already use this!)

**Database:**
- PostgreSQL (via Supabase)
- Simple schema: skills, projects, lessons, progress_history

**Visualization:**
- Chart.js or Recharts (progress charts)
- React Calendar (timeline view)

**Styling:**
- Tailwind CSS (matches your portfolio approach)

---

## Database Schema (Draft)

```
skills
├── id
├── name
├── category (frontend, backend, tools, etc.)
├── proficiency (0-100%)
├── started_date
├── notes

projects
├── id
├── name
├── description
├── status (0-100%)
├── tech_stack (array/relation)
├── skills_used (relation to skills)
├── start_date
├── end_date
├── url/repo_link

lessons
├── id
├── title
├── content
├── skills_tagged (array/relation)
├── projects_tagged (relation)
├── date_learned
├── importance (1-5)

progress_history
├── id
├── skill_id
├── old_value
├── new_value
├── updated_at
```

---

## Implementation Phases

### Phase 1: MVP (Foundation)
- [ ] Setup: Next.js + Supabase + Tailwind
- [ ] Basic dashboard layout
- [ ] CRUD for skills (add, edit, delete, view)
- [ ] CRUD for projects
- [ ] Simple progress bars

### Phase 2: Enhancement
- [ ] Learning journal / lessons module
- [ ] Progress history & trends (charts)
- [ ] Skill-project associations
- [ ] Basic filtering/search

### Phase 3: Polish
- [ ] Analytics dashboard
- [ ] Data visualization improvements
- [ ] Mobile responsiveness
- [ ] Dark mode (nice-to-have)

### Phase 4: Advanced
- [ ] Export/import data
- [ ] Public portfolio view option
- [ ] Integration with your other projects
- [ ] AI-powered insights (optional)

---

## Quick Wins (Start Here)
1. **Data Structure**: Define your skills/projects list in JSON first
2. **Static Dashboard**: Build UI with hardcoded data
3. **Add Interactivity**: Connect to Supabase for real data
4. **One Feature**: Implement skill progress tracking fully first

---

## Success Criteria
- ✅ Can add/update skills and see progress
- ✅ Can create projects and track completion
- ✅ Dashboard shows meaningful stats at a glance
- ✅ Can filter and search across all data
- ✅ Mobile-friendly interface

---

## Notes
- Reuse skills you already have: Playwright for testing, Supabase MCP for DB
- Keep it simple initially—add features based on what you actually use
- This project itself demonstrates full-stack development (add to portfolio!)
