# FRONTEND_SESSION.md
## HandyHustle Hub — Frontend Build Plan

> This file contains the ordered Claude Code prompts for the frontend UI library and shell session.
> Execute prompts **in order**. Do not skip steps.
> Add this file to Claude project files for the frontend session.

---

## Design Direction

- **Style:** Linear-inspired — clean, minimal, confident, fast-feeling
- **Theme:** Light + Dark with user toggle (system default)
- **Colors:** To be generated fresh — professional, trade-service appropriate
- **Stack:** React 19 + TypeScript + TanStack Start + shadcn/ui + Tailwind v4
- **Package manager:** Bun (`bun add` — never `npm install`)

---

## Pre-Session Checklist

Before running any prompts, confirm in Claude Code:
- [ ] You are in the repo root (`handyhustle-hub/`)
- [ ] Run `bun install` to ensure deps are installed
- [ ] Run `bun dev` to confirm the app starts
- [ ] Note what Lovable already built — check `src/` folder structure

---

## PROMPT 1 — Audit Existing Components

```
CLAUDE CODE PROMPT — Audit shadcn/ui components
─────────────────────────────────────────
List all files in src/components/ui/ and src/components/.
For each file, output just the filename.
Also output the contents of src/index.css in full.
Do not modify any files.
─────────────────────────────────────────
```

> After this runs: paste the output into chat so we can see what shadcn already installed and what the current CSS looks like before we touch anything.

---

## PROMPT 2 — Design Tokens (Tailwind v4 CSS Config)

> Run AFTER reviewing Prompt 1 output with Claude.

```
CLAUDE CODE PROMPT — Design tokens in Tailwind v4
─────────────────────────────────────────
Update src/index.css to establish the HandyHustle Hub design token system using Tailwind v4 CSS variable syntax.

Design direction: Linear-inspired — clean, minimal, professional. Trade service SaaS. Light + dark theme.

Requirements:
- Define a full set of semantic color tokens for both light and dark themes using @layer base and [data-theme="dark"] or .dark class (use whichever pattern is already in the file — do not change the existing theme toggle mechanism)
- Color palette should feel professional and trustworthy — a cool slate/neutral base with a single strong accent color (suggest a confident blue or teal — pick what works best with the Linear aesthetic)
- Define tokens for: background, foreground, card, border, input, primary, primary-foreground, secondary, muted, muted-foreground, accent, destructive, ring, sidebar-background, sidebar-foreground, sidebar-border, sidebar-accent
- Define typography scale: font-sans (system stack), font-mono
- Preserve any existing tokens already in the file — only add or update, do not delete existing shadcn tokens
- Add a comment block at the top of the custom section: /* HandyHustle Hub Design Tokens */
─────────────────────────────────────────
```

---

## PROMPT 3 — Theme Toggle Component

> Run AFTER Prompt 2 is complete and reviewed.

```
CLAUDE CODE PROMPT — Theme toggle (light/dark)
─────────────────────────────────────────
Create a theme toggle system for HandyHustle Hub.

Requirements:
- Create src/hooks/useTheme.ts — a custom hook that:
  - Reads theme from localStorage (key: 'hhh-theme')
  - Defaults to system preference if no stored value
  - Applies 'dark' class to <html> element
  - Exposes: theme ('light' | 'dark' | 'system'), setTheme, resolvedTheme ('light' | 'dark')
- Create src/components/ui/ThemeToggle.tsx — a button component that:
  - Cycles through light → dark → system
  - Uses lucide-react icons (Sun, Moon, Monitor)
  - Uses existing shadcn Button component
  - Shows the current resolved theme icon
- Apply the theme class in the app root (check src/main.tsx or the root layout file — apply useTheme there so it runs on mount)

Use TypeScript strict mode. No 'any'. Export ThemeToggle as default.
─────────────────────────────────────────
```

---

## PROMPT 4 — App Shell Layout

> Run AFTER Prompt 3 is complete and reviewed.

```
CLAUDE CODE PROMPT — App shell layout
─────────────────────────────────────────
Build the main app shell layout for HandyHustle Hub. This is the wrapper that all authenticated app pages will use.

Design direction: Linear-inspired. Fixed sidebar on left, topbar header, main scrollable content area.

Requirements:
- Create src/components/layout/AppShell.tsx — the root layout wrapper
- Create src/components/layout/Sidebar.tsx — left sidebar with:
  - App logo/wordmark area at top (use "HandyHustle Hub" as placeholder text — we will replace with logo later)
  - Navigation links for all planned modules (use lucide-react icons):
    - Dashboard (LayoutDashboard)
    - CRM (Users)
    - Projects (FolderKanban)
    - Schedule (Calendar)
    - Inventory (Package)
    - Settings (Settings)
  - Active link highlighting using TanStack Router's Link component and useRouterState or isActive pattern
  - Collapsed/icon-only state on mobile (use a hamburger toggle)
  - ThemeToggle at the bottom of the sidebar
  - Sidebar should use sidebar-background, sidebar-foreground, sidebar-border tokens
- Create src/components/layout/Topbar.tsx — top header with:
  - Page title (passed as prop)
  - Right side: user avatar placeholder + tenant name placeholder
  - Uses card/border tokens for bottom border
- AppShell accepts children and renders: Sidebar + Topbar + main content area
- Wire AppShell into the TanStack Start root layout file (check src/routes/__root.tsx or equivalent)

Use TypeScript strict mode. No 'any'. All components get their own file.
─────────────────────────────────────────
```

---

## PROMPT 5 — Custom Trade-Service Components

> Run AFTER Prompt 4 is complete, app shell is confirmed working in browser.

```
CLAUDE CODE PROMPT — Custom component library
─────────────────────────────────────────
Build a set of custom components for HandyHustle Hub that shadcn/ui does not cover. These are trade-service-specific UI patterns.

Create each in src/components/ui/:

1. StatusBadge.tsx
   - Props: status (string), variant mapping to colors
   - Statuses: 'lead' | 'active' | 'completed' | 'cancelled' | 'on-hold'
   - Color map: lead=blue, active=green, completed=slate, cancelled=red, on-hold=yellow
   - Small pill badge, uses design token colors

2. JobCard.tsx
   - Props: id, title, customer, status, date, assignee (all strings), onClick
   - Card component showing a job/project summary
   - Uses StatusBadge, Card from shadcn, lucide-react icons
   - Hover state with subtle shadow lift
   - Designed for use in kanban boards and list views

3. StatCard.tsx
   - Props: label, value, trend ('+12%' etc), trendDirection ('up'|'down'|'neutral'), icon (LucideIcon)
   - Dashboard metric card
   - Shows icon, big value, label, trend indicator with color (green up, red down)
   - Uses design token colors

4. PageHeader.tsx
   - Props: title, description (optional), actions (optional ReactNode)
   - Consistent page-level header used at top of every module page
   - Title + description left, action buttons right (e.g. "New Project" button)

Use TypeScript strict mode. No 'any'. Export each as default.
─────────────────────────────────────────
```

---

## PROMPT 6 — Dashboard Placeholder Page

> Run AFTER Prompt 5. This validates everything works together.

```
CLAUDE CODE PROMPT — Dashboard placeholder page
─────────────────────────────────────────
Create a placeholder Dashboard page that demonstrates the full UI library.

Create src/routes/dashboard/index.tsx (or the correct TanStack Router path — check existing route file patterns in src/routes/).

The page should:
- Use AppShell layout (if not already applied at root level)
- Use PageHeader with title "Dashboard" and a placeholder action button
- Show a row of 4 StatCards with realistic placeholder data:
  - Total Jobs (icon: FolderKanban, value: 142, trend: +8%)
  - Active Leads (icon: Users, value: 37, trend: +12%)
  - Revenue MTD (icon: DollarSign, value: $84,200, trend: +3%)
  - Overdue Tasks (icon: AlertCircle, value: 5, trend: -2, trendDirection: down)
- Show a section "Recent Jobs" with 4 JobCards using placeholder data
- Use a responsive grid layout (2 col mobile, 4 col desktop for stats; 1 col mobile, 2 col desktop for job cards)

Do not connect to any real data. All values are static placeholders.
─────────────────────────────────────────
```

---

## Post-Session Checklist

After all prompts are complete:
- [ ] Run `bun dev` and visually confirm the dashboard looks correct
- [ ] Test light/dark toggle works
- [ ] Test sidebar navigation links render correctly
- [ ] Test mobile sidebar collapse
- [ ] Take a screenshot and share in chat for review
- [ ] Update PROGRESS_LOG.md with what was completed
- [ ] Create UI_LIBRARY.md documenting all components built

---

## Notes for Claude Code

- Always check existing file structure before creating new files — do not duplicate
- TanStack Router uses file-based routing in `src/routes/` — match the existing pattern
- If a shadcn component is needed but not installed, use: `bunx shadcn@latest add <component>`
- Never use `npm` — always `bun`
- Tailwind v4: no tailwind.config.js — all config is in CSS
