# PROGRESS_LOG.md — BearingPro

> Read this + PROJECT_CONTEXT.md at the start of every session before touching code.

---

## Current Status

**Phase:** Backend — Foundation complete, auth live, first real data connections next
**Last Updated:** Session 018
**Live URL:** https://bearingpro.tech (Vercel + Cloudflare DNS)
**Supabase Project:** `erdtfwelbdlvammfdtgz`

---

## What's Next

1. **Schema sprint** — migrations for all remaining modules (companies, contacts, projects, etc.)
2. **Replace demo data module by module** — starting with CRM after schema is in place
3. **Team page invite flow** — admin invites teammates via email; trigger already handles joining existing tenant
4. **Sidebar company name** — currently hardcoded "Port City Sound & Security"; needs to read from `tenants` table

---

## Open Questions / Blockers

- Demo data still needs consolidation into `src/data/index.ts` before large-scale backend wiring
- Quote Builder deferred — needs backend (catalog + projects)
- Planner/Gantt deferred — needs backend (phases + team assignments)
- D-Tools SI integration: needs real license key from SI software (Control Panel → Manage Integrations)

---

## Module Status

| Module | Status | Notes |
|---|---|---|
| UI Shell / Layout | ✅ Complete | AppShell, sidebar, topbar, PageMetaContext |
| Theme System | ✅ Complete | Light/dark/system toggle, no flash |
| Dashboard | ✅ Complete (demo) | Owner dashboard, demo data |
| Auth | ✅ Complete | Login/signup, session guard, sign-out popover |
| Supabase Client | ✅ Complete | Browser + server clients, typed Database |
| DB: tenants + user_profiles | ✅ Live | RLS + handle_new_user trigger |
| Vercel Deployment | ✅ Live | bearingpro.tech, nitro vercel preset |
| CRM (Contacts/Companies) | 🟡 Demo data | Full UI built, needs schema + data wiring |
| Sales (Lead Inbox, Opps, Quotes) | 🟡 Demo data | Full UI built |
| Operations (Projects, Work Orders, Team, Scheduling) | 🟡 Demo data | Full UI built |
| Service (Tickets, Plans) | 🟡 Demo data | Full UI built |
| Inventory (Catalog, Stock, POs, Vendors) | 🟡 Demo data | Full UI built |
| Finance (Invoices, Payments) | 🟡 Demo data | Full UI built |
| Reports | 🟡 Placeholder | 27-report catalog defined, all coming soon |
| Settings (Company, Tiers, Integrations) | ✅ Company live | Company Profile reads/writes `tenants` table; Tiers + Integrations still demo |
| Quote Builder | ⏸ Deferred | Needs backend |
| Planner / Gantt | ⏸ Deferred | Needs backend |

---

## Backend Schema (Migrations Applied)

| Migration | Tables | Status |
|---|---|---|
| `20260608000001_init` | `tenants`, `user_profiles`, `current_tenant_id()` RLS helper | ✅ Live |
| `20260608000002_auth_trigger` | `handle_new_user()` trigger on `auth.users` | ✅ Live |

**Trigger logic:** New signup → creates `tenants` row + `user_profiles` row (role: admin). Invited user (has `tenant_id` in metadata) → joins existing tenant instead.

---

## Key Decisions (Permanent)

- **Schema follows UI** — build the page first, derive the schema from what it needs
- **Invite-only for existing companies** — signup creates new tenant; teammates join via invite link (tenant_id in metadata)
- **Stripe** for payments — card + ACH, payment links for commercial NET 30 clients
- **Email confirmation disabled** in dev (`mailer_autoconfirm: true` via Management API)
- **Nitro preset: `vercel`** — set in `vite.config.ts`; Lovable config defaults to cloudflare and skips nitro outside sandbox
- **`.npmrc`** — `legacy-peer-deps=true` required for Vercel installs
- **`stat bar → tabs → filter bar`** — locked layout order on every list page
- **View-before-edit** — row click = view panel, hover Edit = shortcut to edit form

---

## Session Archive (001–017)

Sessions 001–015 established the full frontend UI: all module pages, shared component library (`page-components.tsx`), command palette, settings module, reports placeholder, theme system, Linear-inspired design.

Session 016: Command palette wired, inbox alignment fixed, full Settings module (Company Profile, Service Plan Tiers, Integrations), gear icon → `/settings/company`.

Session 017: Reports page — 27-report catalog across 6 categories + custom report builder teaser (post-launch).

---

## Session 018 — Supabase Backend Foundation + Auth + Deployment

**Date:** June 8, 2026

**Completed:**

- Installed `@supabase/supabase-js` + `@supabase/ssr`; created `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (SSR)
- `supabase init` + `supabase link` to project `erdtfwelbdlvammfdtgz`
- Migration 001: `tenants`, `user_profiles`, RLS policies, `current_tenant_id()` helper
- Migration 002: `handle_new_user()` trigger — auto-creates tenant + profile on signup
- Auth: `AuthContext`, login/signup pages, `ProtectedApp` guard in `__root.tsx`, sign-out popover
- Vercel deployment: `.npmrc` for peer deps, `nitro: { preset: "vercel" }` in `vite.config.ts`
- Custom domain `bearingpro.tech` via Cloudflare DNS → Vercel (DNS-only, no proxy)
- Supabase config: `site_url` → `bearingpro.tech`, `mailer_autoconfirm: true`, allowed origins set
- Rebranded auth pages to BearingPro (BP badge, correct copy)
- Theme toggle added to auth pages; sign-out changed to confirmation popover
- Investigated D-Tools SI API — example key in docs is illustrative only, not functional; needs real SI license

**Schema notes:** `tenants` and `user_profiles` are live. All future tables need `tenant_id uuid not null references tenants(id)` + RLS policy using `current_tenant_id()`.

---

## Session 019 — Settings Company Profile Wired

**Date:** June 8, 2026

**Completed:**

- Settings → Company Profile reads from and writes to the live `tenants` table
- Fixed form-reset bug: `useRef` guard prevents `useEffect` from re-populating the form on every refetch (was overwriting typed values with DB nulls after save)
- `onSuccess` uses `setQueryData` instead of `invalidateQueries` — cache updated directly, no round-trip refetch
- Added `.select().single()` to update call so 0-row updates (RLS mismatch) surface as errors instead of false success

**Pattern to follow for future data pages:** `useRef` initialized flag + `setQueryData` on save instead of invalidate.
