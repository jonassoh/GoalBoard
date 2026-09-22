# GoalBoard

A local-first desktop dashboard for planning and tracking measurable monthly goals.

## What is included

- Home dashboard with weighted goal progress, due dates, and remaining time
- Multi-month goals that remain active from their start month through their due date
- Month navigation for the current month plus the next 11 months
- Goals with multiple measurable milestones (for example Easy, Medium, and Hard problems)
- User-defined categories with editable colors that style assigned goals
- Category filters and automatic category sorting
- Mini calendar with due-date markers and a next-month preview
- Offline persistence through an Electron IPC bridge and a JSON file in Electron's user data directory
- Browser `localStorage` fallback when running through Vite alone

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

The first launch includes a small set of editable starter goals so the dashboard is immediately explorable.
