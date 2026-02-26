# 📦 React Apps — Project README

A collection of 10 React apps built with Vite, served via React Router.

---

## 🗂 Routes

| Path | App |
|------|-----|
| `/` | Study Tracker |
| `/goal-tracker` | Goal Tracker |
| `/journal-app` | Journal App |
| `/kanban-tracker` | Kanban Tracker |
| `/meeting-notes` | Meeting Notes |
| `/recipe-tracker` | Recipe Tracker |
| `/study-tracker` | Study Tracker |
| `/task-flow` | Task Flow |
| `/weekly-calendar` | Weekly Calendar |
| `/workout-dashboard` | Workout Dashboard |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## 📁 File Structure

```
src/
├── main.jsx
├── App.jsx
├── index.css
└── routes/
    ├── StudyTracker.jsx
    ├── GoalTracker.jsx
    ├── JournalApp.jsx
    ├── KanbanTracker.jsx
    ├── MeetingNotes.jsx
    ├── RecipeTracker.jsx
    ├── TaskFlow.jsx
    ├── WeeklyCalendar.jsx
    └── WorkoutDashboard.jsx
```

---
---

# 📚 Study Tracker

**Route:** `/` and `/study-tracker`

A gamified study timer app with a cosmic space aesthetic — dark background, glowing ring timer, XP system and streaks to keep students motivated.

## Features

- **Pomodoro timer** — Focus (25m), Short Break (5m), Long Break (15m), Custom (5–120m)
- **Animated SVG ring** — glowing progress arc with pulsing effect while running
- **Subject selector** — 8 subjects (Math, Science, History, Languages, Comp Sci, Literature, Art, Other)
- **XP & levelling system** — earn 10 XP per minute, level up as you go
- **Daily goal** — set a daily target (60–180m) with a visual progress bar
- **Session log** — full history with subject, topic, duration and XP earned
- **Stats view** — weekly bar chart and subject breakdown
- **7-day streak** tracker
- **Motivational quotes** — rotate every 8 seconds
- **localStorage** persistence

## Tech

- React (hooks: `useState`, `useEffect`, `useRef`, `useCallback`)
- Custom SVG ring timer component
- Google Fonts: Orbitron, Rajdhani

---
---

# 🎯 Goal Tracker

**Route:** `/goal-tracker`

A mission-control style goal tracking dashboard with a dark space aesthetic.

## Features

- Create and manage personal goals with categories
- Progress tracking with visual indicators
- Milestone system — break goals into steps
- Priority levels (High / Medium / Low)
- Filter and search goals
- Archive completed goals
- **localStorage** persistence

## Tech

- React (hooks: `useState`, `useEffect`)
- CSS animations and transitions

---
---

# 📓 Journal App

**Route:** `/journal-app`

A warm candlelit diary app styled like a leather-bound journal with aged parchment textures.

## Features

- **Distraction-free writing** area with subtle lined paper background
- **Auto-save** every 3 seconds as you type
- **Mood tags** — Radiant, Content, Reflective, Anxious, Melancholy, Grateful
- **Writing prompts** — click to get a random spark of inspiration
- **Sidebar** with all entries grouped by month, filterable by mood
- **Search** across all entry titles and bodies
- **Three views** — Browse (list), Write, Read (clean typeset)
- **Word count** per entry and totals
- Preloaded with 3 sample entries
- **localStorage** persistence

## Tech

- React (hooks: `useState`, `useEffect`, `useRef`)
- Google Fonts: Petit Formal Script, Crimson Pro

---
---

# 📋 Kanban Tracker

**Route:** `/kanban-tracker`

A drag-and-drop Kanban board with a soft, rounded aesthetic — cards, columns, filters and priorities.

## Features

- **Drag and drop** cards between columns (Todo → In Progress → Done)
- **Add / edit / delete** cards with a modal editor
- **Priority badges** — Low, Medium, High, Urgent
- **Due dates** with overdue highlighting
- **Assignee avatars** — overlapping team member pills
- **Filter bar** — filter by priority, assignee or search
- **Column card counts**
- **localStorage** persistence

## Tech

- React (hooks: `useState`, `useEffect`, `useRef`)
- Native HTML5 drag-and-drop API
- CSS backdrop blur and shadow system

---
---

# 📝 Meeting Notes

**Route:** `/meeting-notes`

A professional meeting notes editor with a slate-and-sage aesthetic — rich text editing, templates, and action item tracking.

## Features

- **7 meeting types** — Planning, Design, Debrief, Standup, 1:1, All-Hands, Other (color coded)
- **Meeting metadata** — type, date, duration, attendees
- **Templates** — pre-structured sections for Standup, 1:1 and Debrief
- **Action item tracking** — `- [ ]` checkboxes, click to toggle complete
- **Toolbar** — Heading, Bold, Italic, Code, Bullet, Checkbox, Numbered list, Divider
- **Word count** and action item progress live in toolbar
- **Preview mode** — renders markdown cleanly
- **Pin notes** and search across all notes
- Smart Enter key continues checkbox/bullet lists
- **localStorage** persistence

## Tech

- React (hooks: `useState`, `useEffect`, `useRef`)
- Google Fonts: Instrument Serif, Lora, Geist Mono

---
---

# 🍴 Recipe Tracker

**Route:** `/recipe-tracker`

A warm editorial food community app — create, browse and share recipes with other users. Styled like a premium food magazine.

## Features

- **Community sharing** — recipes saved to shared persistent storage, visible to all users
- **User switcher** — switch between 4 users (Sofia, James, Aisha, Tom)
- **Create recipes** — emoji, title, description, category, cuisine, difficulty, prep/cook times, servings, tags, ingredients, step-by-step method
- **Serving scaler** — ×0.5 / ×1 / ×2 multiplier scales all ingredient amounts
- **Likes & saves** — heart and bookmark any recipe
- **Comments** — leave tips and thoughts, visible to everyone
- **Filter bar** — category (Breakfast, Dinner, Baking…) and difficulty
- **Search** across titles, tags and descriptions
- **3 views** — Discover, My Recipes, Saved
- **Persistent shared storage** via `window.storage`

## Tech

- React (hooks: `useState`, `useEffect`)
- Google Fonts: Libre Baskerville, Work Sans
- Shared persistent storage API

---
---

# ✅ Task Flow

**Route:** `/task-flow`

A clean, focused task manager with a distinctive aesthetic for capturing and organising tasks.

## Features

- Add, complete and delete tasks
- Priority levels and categories
- Filter by status (All / Active / Completed)
- Drag to reorder tasks
- Task count and completion stats
- **localStorage** persistence

## Tech

- React (hooks: `useState`, `useEffect`)
- CSS transitions and animations

---
---

# 📅 Weekly Calendar

**Route:** `/weekly-calendar`

A 7-day weekly calendar tracker for scheduling and visualising your week.

## Features

- 7-day grid view with time slots
- Add and remove events with a modal
- Color-coded event categories
- Current time indicator
- Navigate between weeks
- **localStorage** persistence

## Tech

- React (hooks: `useState`, `useEffect`)
- CSS Grid layout

---
---

# 🏋️ Workout Dashboard

**Route:** `/workout-dashboard`

A Spotify-inspired dark fitness dashboard for tracking workouts, weight and progress toward lose weight / build muscle / recompose goals.

## Features

- **Goal selector** — Lose Weight 🔥, Build Muscle 💪, Recompose ⚡ — accent color ripples through the UI
- **Weekly stat cards** — workouts done, calories burned (with 7-day bar chart), current weight (sparkline), streak
- **Weight goal progress** — start → now → target bar
- **Body stats** — height, weight, BMI with health status color coding
- **Log workout** — 2-step form: name/group/duration/calories → exercises with sets, weight, reps
- **Exercise database** — 9 muscle groups × 5 exercises each
- **Log weight** — quick weight entry with recent history
- **Workout detail modal** — full breakdown with sets table and per-exercise volume
- **History tab** — full sortable session list
- **Progress tab** — lifetime stats, muscle group frequency bars, weight history chart
- **localStorage** persistence

## Tech

- React (hooks: `useState`, `useEffect`)
- Custom SVG donut chart and sparkline components
- Google Fonts: DM Sans
- Spotify-inspired dark theme: `#121212` bg, `#1db954` green accent

---

## 🛠 Dependencies

```bash
npm install react-router-dom
```

All apps use only React built-ins and standard browser APIs (localStorage). No additional libraries required.

---

## 📦 Build for Production

```bash
npm run build     # outputs to /dist
npm run preview   # preview production build locally
```