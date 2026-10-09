# TaskFlow — Modern Task Manager

TaskFlow is a high-performance, dark-mode task management web application engineered with modern React, Vite, Tailwind CSS, and Framer Motion. Built to match a sleek obsidian-and-electric-blue design system, it provides intuitive task orchestration, real-time sprint velocity tracking, smooth squircle geometry, and an interactive zoomable calendar.

---

## 📸 Preview

<!-- Screenshot placeholder -->
![TaskFlow Dashboard Screenshot](https://raw.githubusercontent.com/Infinus06/taskFlow/main/docs/preview.png)
*(Replace with your deployed or captured application screenshot)*

---

## ✨ Features

### 🎯 Core Capabilities (Must-Have)
- **Modal-Based Task Creation**: Create new tasks with title, description, priority, due date, and workspace category tag. Features instant autofocus, Enter-to-submit, and validation preventing empty or whitespace-only submissions.
- **Task List View**: Overview of all tasks displaying title, workspace chip, priority badge, due date with relative countdown, and quick actions.
- **Interactive Completion**: Toggle tasks between Open and Done states with immediate visual feedback (strikethrough styling, muted tones, and celebration particle accents).
- **Safe Deletion with Undo Toast**: Delete tasks with an instant, interactive floating Undo toast notification that permits 1-click restoration before timeout.

### 🔍 Organization & Filtering (Should-Have)
- **Status Filter Tabs**: Seamless tab navigation (`All`, `Open`, `Done`) with dynamic badge counters and glowing active indicators.
- **Priority Filtering**: Filter views by priority (`High`, `Medium`, `Low`).
- **Flexible Sorting**: Sort tasks by Due Date (soonest first), Priority level (High to Low), Date Created, or Alphabetical title with direction toggling.
- **Timeframe Filtering**: Filter by All Tasks, Due This Week, Due Today, or Overdue.

### 📅 Deadlines, Velocity & Calendar (Could-Have)
- **Calendar Preview Widget**: Compact month widget with Monday start, today indicator, color-coded deadline dots under day numbers (Red: High, Amber: Medium, Green: Low), and an "Upcoming Deadlines" countdown of the next 3 open tasks.
- **Shared-Element Zoom Animation**: Clicking the calendar widget initiates a silky 450ms zoom-in expansion powered by Framer Motion, expanding from the clicked card's exact viewport geometry into a full-screen centered dialog while dimming and blurring the background. Reversing the modal returns smoothly to the card's position.
- **Full Month Interactive View**:
  - 7-column month grid displaying detailed task deadline chips with priority indicators, completion checkmarks, and "+N more" overflow badges.
  - Interactive day selection opening an integrated day tasks drawer where tasks can be toggled or deleted in real time.
  - "Add task for this day" button with pre-filled due date integration.
  - Color-coded priority legend and overdue task highlights in red.
  - Fully accessible with keyboard navigation, Esc-to-close, focus lock, and `prefers-reduced-motion` support.
- **Circular Velocity Gauge**: Circular SVG progress gauge showing real-time task completion percentage with smooth stroke transitions, concentric track dots, and unclipped Done / Open / Overdue status breakdown tiles.
- **Sprint Overview Card**: Summary metrics breakdown (Total, Open, Completed, Overdue) paired with status insights.
- **Relative Seed Data**: First load automatically seeds 5 sample tasks spread across the month relative to today's date. Stores a `taskflow_seeded_v2` flag in `localStorage` so tasks are never re-seeded if deleted.

### 👤 Profile & Category Management (New)
- **Interactive Greeting Card**:
  - Enlarger circular gradient avatar (68px) with bold initial and scaled active status indicator.
  - "Hi, {name}" in 26px typography with blue accent and 14px contextual status subtext.
  - Smooth 220ms hover and press micro-animations: scale 1.03, translateY -2px, ambient blue glow, pulsing avatar ring, and 4px sliding chevron.
  - Full keyboard focus-ring accessibility and `prefers-reduced-motion` compliance.
- **Dedicated Profile Page (`#/profile`)**:
  - Routed with `react-router-dom` `HashRouter` for zero-configuration static hosting.
  - **Personal Details Card**: Name (1-30 chars, replacing 'User' across the app), Date of Birth (validated 1900 to today), Read-only auto-calculated Age, Email (strict format validation), and searchable Country combobox. Persisted to `localStorage` (`taskflow:profile:v1`).
  - **Category Manager Card**: Organize tasks with custom categories, inline renaming, color picker with 10 presets, task count indicators, and safe deletion (tasks are unassigned to Uncategorized rather than deleted). Persisted to `taskflow:categories:v1`.
  - **New Task Integration**: Category dropdown with colored dots and Uncategorized default; task rows and calendar preview display category chips.
  - **Idempotent Migration**: Automatically converts legacy tag strings to structured categories on initial load without data loss.

---

## 🎨 Design System & Squircle Geometry

### Squircle Shapes
In alignment with modern industrial design principles, every card, modal, button, input, tab, pill, checkbox, and toast uses **squircle** (smooth superellipse corner) geometry rather than conventional circular border radii.
- **Progressive Enhancement**: Employs `corner-shape: squircle` and `corner-shape: superellipse(2)` where supported, while providing graceful standard `border-radius` fallback tokens across legacy browsers.
- **Preserved Border Integrity**: Utilizes native CSS layout tokens rather than invasive clip paths to preserve 1px translucent borders and inner ambient glow.
- **Circular Exceptions**: Pure circular elements (user avatars and the velocity gauge itself) remain circular as intended.

### Color Tokens
- **Background**: Near-black obsidian (`#141416`)
- **Card Surface**: Charcoal layer (`#1c1c1f`) with subtle 1px border (`rgba(255, 255, 255, 0.08)`) and soft inner glow
- **Primary Accent**: Vivid Electric Blue (`#0A6CFF`) with radiant glow
- **Priorities**: High (Rose), Medium (Amber), Low (Emerald)

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Animations**: Framer Motion + Canvas Confetti
- **Styling**: Tailwind CSS + CSS Custom Properties (Design Tokens)
- **Icons**: Lucide React
- **State & Storage**: React hooks with localized `localStorage` persistence layer
- **Date Handling**: Plain Date utilities with manual part extraction in `src/lib/dateUtils.js` to eliminate timezone skew

---

## 💾 Frontend-Only & Data Persistence Notice

> **Note**: This build is **Frontend Only**.
> - It does not require a backend API server, Supabase, or database configuration.
> - No environment variables or `.env` files are needed to run this application.
> - All task data is stored in React state and automatically synchronized to `localStorage` (`taskflow_tasks_v2`).
> - Data access is encapsulated inside [`src/lib/taskStore.js`](frontend/src/lib/taskStore.js) for drop-in backend API integration in future releases.
> - Initial launch seeds 5 sample tasks relative to current date, with a persistent seed flag preventing re-seeding on deletion.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the local development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

### Building for Production
```bash
npm run build
```
The compiled, production-ready assets will be located in `frontend/dist/`.
