---
name: feature-roadmap-board
description: Build and maintain a feature status board (功能全景看板 / roadmap page / progress tracker) for a software project — one data registry file where every feature is marked shipped / building / planned / blocked, rendered as a filterable, expandable card page where each card shows its next actions. Use when asked for a roadmap page, feature tracker, "what's done / in progress / stuck / 做了什么没做什么" view, release progress page, 功能看板, 进度跟踪页, or a shared source of truth on project status that humans and AI agents both update on every release.
---

# Feature Roadmap Board

A single-page status board that answers four questions at a glance:

1. **What changed recently?** — a "recent progress" strip driven by per-item
   `updatedAt` + `changeNote`, so readers never re-read the whole registry.
2. **What do we do next?** — non-shipped items auto-sorted: blocked first (they
   usually wait on a user-side action), then building, then planned; same tier
   sorts by `priority` (P0 urgent → P2 normal).
3. **What is shipped?** — with the version/date it went live (`since`).
4. **What is blocked — and by exactly what external action?** — `blockedBy`.

The complete area-grouped registry stays one toggle away, collapsed by default.
Every card expands to show **next actions** (`next[]`), so anyone — founder,
teammate, AI coding agent — can open a card and immediately know what to do next.

## Why this pattern works

- **One data file is the whole system.** `roadmap.data.ts` is the single source of
  truth. The page is a pure function of that file — no CMS, no database, no PM-tool
  export that goes stale.
- **Humans and AI agents share one edit discipline.** The maintenance contract at the
  top of the data file is short enough that any agent (or intern) follows it. Progress
  reporting stops being a chore and becomes a side effect of shipping.
- **Status + blockedBy forces honesty.** A feature is either live (say since when),
  in progress, planned, or blocked by a named external action. There is no "almost
  done" to hide in.
- **The board is a route, not a meeting.** Stakeholders check `/roadmap` instead of
  asking for status updates.

## Quick start

1. Copy `assets/roadmap-data.template.ts` into the project as e.g.
   `src/data/roadmap.ts`. Rename sample areas/items; keep the schema and the
   maintenance-contract header comment intact.
2. Copy `assets/RoadmapPage.template.tsx` into the project as e.g.
   `src/pages/Roadmap.tsx`. Fix the import path to the data file.
3. Register a route (`/roadmap` is the convention). Do **not** add it to the main
   navigation if the board is internal-facing — a direct URL is enough.
4. Fill the registry with the project's real features. Every item needs at minimum
   `id`, `area`, `title`, `status`, `summary`, and `next`.
5. From now on, update the registry **in the same commit/release** as the feature
   work it describes, and bump `ROADMAP_UPDATED`.

Dependencies of the reference page: React, Tailwind CSS, `lucide-react`, and
shadcn-style CSS variables (`bg-background`, `bg-card`, `ring-border`,
`text-primary`, `bg-secondary`, `text-muted-foreground`). If the target project lacks
them, see the porting notes in `references/maintenance.md` — the page is ~150 lines
and ports to vanilla HTML or any framework in one pass.

## Data model

| Field       | Type                                         | Required | Meaning |
| ----------- | -------------------------------------------- | -------- | ------- |
| `id`        | string (kebab-case, stable)                  | yes      | Unique key; never reuse an id for a different feature. |
| `area`      | string                                       | yes      | Section heading the card groups under. Keep 3–7 areas. |
| `title`     | string                                       | yes      | Feature name, short. |
| `status`    | `'shipped' \| 'building' \| 'planned' \| 'blocked'` | yes | See transition rules below. |
| `summary`   | string                                       | yes      | One sentence of current truth, no hype. |
| `detail`    | string                                       | no       | Expanded context: what/why/trade-offs. |
| `next`      | string[]                                     | yes*     | Next actions / tracking items. The reason the board is useful. |
| `blockedBy` | string                                       | blocked-only | The exact external action that unblocks it (often a user-side action). |
| `since`     | string (version or date)                     | shipped-only | When it went live — accountability for "shipped". |
| `updatedAt` | string (YYYY-MM-DD)                          | on change | Last change date; drives the "recent progress" section. |
| `changeNote`| string                                       | on change | One line about what changed, shown next to `updatedAt`. |
| `priority`  | `0 \| 1 \| 2`                                | non-shipped | 0 = urgent (blocks others / severe / user waiting), 1 = important, 2 = normal (default). |

\* `next` is expected on every non-trivial item; a `shipped` item may omit it only
when genuinely nothing follows.

## The maintenance contract (short version)

- Going live → `status: 'shipped'`, fill `since` with the version/date.
- Starting work → `'building'`; decided but not started → `'planned'`.
- Waiting on something outside the team's control → `'blocked'` **and** write
  `blockedBy` as the concrete action that unblocks it.
- Keep `next` items verb-first, checkable, and few (1–4 per card).
- Bump `ROADMAP_UPDATED` every edit; ship board updates with the release.
- In multi-agent projects: edit items surgically, never rewrite the whole registry;
  conflicts are resolved per-area.

The full protocol, status-transition rules, writing guide for good `next` items,
porting notes, and anti-patterns are in `references/maintenance.md`. Read it before
setting up the board for a team.

## Optional enhancements

- Status filter chips double as the legend (already in the reference page).
- A stacked progress bar across the four statuses (already included).
- Generate the registry partially from code (e.g. scan route files for shipped
  surfaces) — but keep human-written `next` and `blockedBy`; they carry the judgment.
- Add a `priority` field if the team needs ordering within `planned`.
- Link `since` versions to release notes / changelogs.
