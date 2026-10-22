# feature-roadmap-board

An AI-agent skill that gives any software project a **feature status board** (功能全景看板):
one data registry file where every feature is marked `shipped` / `building` / `planned` / `blocked`,
rendered as a filterable, expandable card page where each card shows **what to do next**.

Born from a real product ([拾声 shisheng.life](https://shisheng.life/roadmap)) where the founder
asked: *"show me everything that's done, not done, and stuck — and make it pretty."*
The result became the shared source of truth between the human owner and multiple AI coding agents.

![statuses](https://img.shields.io/badge/statuses-shipped%20%C2%B7%20building%20%C2%B7%20planned%20%C2%B7%20blocked-blue)

## What you get

```
┌─────────────────────────────────────────────┐
│ My Project · Status Board                   │
│ Feature Board                               │
│ Updated 2026-01-01 · 24 items               │
│                                             │
│ 🚀 Shipped 12        50%                    │
│ [████████ shipped | ███ building | ██ plan] │
│ (All 24) (Shipped 12) (Building 6) ...      │
│                                             │
│ Core Experience                             │
│ ● Voice cloning engine        [Shipped] v1.2│
│   ▶ One-line summary...                     │
│ ● Emotion control             [Planned]     │
│   ▼ Detail + next actions:                  │
│     ○ Pick scenes that need it              │
│     ○ Regression test with flag on          │
│ ● Mini-program release        [Blocked]     │
│   ⚠ User-side action: register the entity   │
└─────────────────────────────────────────────┘
```

- **One data file is the whole system** — the page is a pure function of `roadmap.data.ts`.
  No CMS, no database, no PM-tool export that goes stale.
- **Every card answers "what's next"** — open a card, continue the work, no meeting needed.
- **A short maintenance contract** humans and AI agents both follow, so the board
  updates as a side effect of shipping, not as a separate chore.

## Install (Codex / Claude / Kimi / compatible agents)

Download [`dist/feature-roadmap-board.skill`](dist/feature-roadmap-board.skill)
(it's a zip of this skill) and install per your agent's
skill-loading convention, e.g.:

- **Codex**: unzip into `~/.codex/skills/` → `~/.codex/skills/feature-roadmap-board/SKILL.md`
- **Claude Code**: unzip into `~/.claude/skills/`
- **Kimi Work**: place the `.skill` where the agent indexes skills, or copy the folder
  into the managed skills directory

Or just read `SKILL.md` — the skill is self-contained markdown + two template files.

## Use

> "给我做一个功能看板" / "Build a roadmap page showing what's done and what's stuck"

The agent will:

1. Copy `assets/roadmap-data.template.ts` → your `src/data/roadmap.ts` (the registry)
2. Copy `assets/RoadmapPage.template.tsx` → your `src/pages/Roadmap.tsx` (the page)
3. Register a `/roadmap` route (public-but-unlisted for internal boards)
4. Fill the registry with your real features and wire the maintenance contract
   into your release flow

The reference page is React + Tailwind + lucide-react + shadcn tokens, ~150 lines.
Porting notes for other stacks are in `references/maintenance.md`.

## Repo layout

```
SKILL.md                        # the skill definition (name, triggers, method)
assets/
  roadmap-data.template.ts      # data registry: schema + contract header + samples
  RoadmapPage.template.tsx      # reference page (React + Tailwind + lucide)
references/
  maintenance.md                # full protocol: transitions, writing next/blockedBy,
                                # release checklist, multi-agent rules, porting, anti-patterns
```

## Design principles

- **Four statuses, no more.** "Testing"/"review" fragments the honest signal; nuance
  goes in `summary`.
- **`blocked` always names the unblocking action** — usually a user-side one.
  A board with zero blocked items for months is usually lying.
- **`since` on every shipped item** — accountability for the word "done".
- **Surgical edits by `id`, never rewrite the registry** — that's what makes it safe
  for multiple AI agents to share as a hand-off surface.

## License

MIT — see [LICENSE](LICENSE).
