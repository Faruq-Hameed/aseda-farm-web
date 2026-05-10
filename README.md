# ASEDA Farm — Farm Management Dashboard

A full-featured Next.js web application for managing farm operations end-to-end. Built for ASEDA to track crop batches through their full lifecycle, log daily activities, manage tasks with calendar scheduling, record harvests and expenses, and visualise revenue trends through analytics charts.

---

## Features

- **Batch Management** — Create and track crop batches from planting date to harvest. Each batch shows plant count, growth status (growing / harvesting / completed), linked tasks, activity logs, and total revenue from harvests.
- **Dashboard** — Live overview of active batches, total plants, tasks due this week, total revenue, overdue task alerts, batch progress cards, and a monthly revenue chart.
- **Activity Log** — Record daily farm activities (watering, fertilising, pest control, pruning, etc.) with date, type, and notes per batch.
- **Task Manager** — Create and assign tasks with due dates, priority levels, and status tracking (pending / in-progress / completed / overdue). View tasks filtered by status.
- **Harvests** — Log harvest records per batch with quantity, quality grade, revenue, and harvest date. Revenue is aggregated up to the dashboard.
- **Expenses** — Track farm expenses by category with date and description.
- **Members** — Team member management for the farm.
- **Analytics** — Monthly revenue bar charts built with Recharts, activity frequency graphs, and harvest trends over time.
- **Auth** — Login and registration with protected dashboard routes.

---

## Tech Stack

| Layer       | Technology                                         |
|-------------|----------------------------------------------------|
| Framework   | Next.js (App Router) + TypeScript                  |
| Styling     | Tailwind CSS                                       |
| Charts      | Recharts                                           |
| Forms       | React Hook Form + Zod                              |
| Date Utils  | date-fns, moment                                   |
| Calendar    | react-big-calendar                                 |
| Icons       | lucide-react                                       |

---

## Project Structure

```
aseda-farm/
├── app/
│   ├── (auth)/
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   └── (dashboard)/
│       ├── dashboard/        # Main overview page
│       ├── batches/          # Batch list + detail + new batch
│       ├── activities/       # Activity log + new entry
│       ├── tasks/            # Task list + new task
│       ├── harvests/         # Harvest records + new harvest
│       ├── expenses/         # Expense tracker
│       ├── members/          # Team members
│       ├── analytics/        # Revenue + activity charts
│       └── settings/         # App settings
├── components/
│   ├── layout/               # Header, sidebar, nav
│   └── dashboard/            # StatsCards, BatchProgress, Charts, etc.
└── lib/
    └── api.ts                # API client for backend calls
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set the backend API URL in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## Pages Overview

| Route             | Description                                      |
|-------------------|--------------------------------------------------|
| `/dashboard`      | Overview stats, batch progress, upcoming tasks   |
| `/batches`        | All batches with task/activity/revenue summary   |
| `/batches/[id]`   | Batch detail — tasks, activities, harvests       |
| `/batches/new`    | Create new crop batch                            |
| `/activities`     | Full activity log with filters                   |
| `/activities/new` | Log a new farm activity                          |
| `/tasks`          | Task board — filter by status, overdue alerts    |
| `/tasks/new`      | Create new task with due date and priority       |
| `/harvests`       | All harvest records                              |
| `/harvests/new`   | Record a new harvest                             |
| `/expenses`       | Expense ledger                                   |
| `/analytics`      | Revenue and activity charts                      |
