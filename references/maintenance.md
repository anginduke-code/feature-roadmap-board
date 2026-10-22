# Roadmap board maintenance protocol

The board is only as good as the discipline around the registry file. This document
is the full contract; the header comment in the data file is the short version.

## Status transition rules

| From → To        | When                                                    | Must also do |
| ---------------- | ------------------------------------------------------- | ------------ |
| * → `planned`    | The team decided this will be built. Not started.       | Write at least one `next` item (the first thing to figure out). |
| * → `building`   | Real work has started (branch, spike, design, API…).    | Update `summary` to say how far along it is. |
| * → `shipped`    | Users can touch it in production.                       | Fill `since` (version or date). Remove stale `blockedBy`. Keep one `next` tracking item if follow-up exists. |
| * → `blocked`    | Progress waits on something outside the team's control. | Write `blockedBy` naming the exact action and whose action it is. |
| `blocked` → *    | The external condition resolved.                        | Delete `blockedBy`, set the new status honestly. |

Rules of thumb:

- **No "almost done".** If users can't touch it, it's not `shipped`.
- **A board with zero `blocked` items for months is usually lying.** Name the
  blockage; that is what unblocks projects.
- **Never delete a shipped item.** Shipped items are the project's memory. Obsolete
  features get a `summary` update ("已下线 / deprecated since …"), not deletion.
- **Never recycle an `id`.** Ids are stable anchors other docs may reference.

## Writing good `next` items

`next` is the reason the board exists — it is what lets a person or an AI agent open
a card and continue the work without a meeting.

- Verb-first and checkable: "申请微信同声传译插件", "云函数出网白名单方案落地",
  not "推进小程序" (unverifiable).
- 1–4 items per card. More means the card is secretly an epic — split it.
- Each item should be small enough to finish in one work session.
- When a `next` item is done, delete it and add what reality revealed next.

## Writing good `blockedBy`

Format: **whose action + what action + (optionally) why it's safe/cheap**.

Good: `用户侧动作：Cloudflare Dashboard 开通 R2（一次性，免费额度 10GB/月）`
Bad:  `等待基础设施` (who? what? when?)

If the blocker is a decision, not an action, say so: `需要拍板：付费 API 过渡，
还是等开源自建` — and put the options in `next`.

## Release checklist

Every release that changes any feature's status:

1. Update the affected items in the registry (status / since / next / blockedBy).
2. Bump `ROADMAP_UPDATED` to release day.
3. Ship the registry update **in the same release/PR** as the feature work.
   A board that lags the product rots within weeks.
4. Skim all `blocked` items: still blocked? still the same blocker?

## Multi-agent / multi-team use

When several people or AI coding agents share the registry:

- **Edit surgically by `id`.** Never rewrite the whole file to "clean it up" —
  that destroys other agents' in-flight edits and the file's merge-ability.
- **One agent, one area per commit** where possible; conflicts resolve per-area.
- The registry is the hand-off surface between agents: your commit updates the
  items you touched; the next agent reads the board to know where things stand.
- Keep the file human-readable: order items within an area by importance, keep the
  section comments, no generated noise.

## Porting the reference page

The reference page (`assets/RoadmapPage.template.tsx`) is ~150 lines of presentational
React with zero logic beyond filter + expand. Porting is mechanical:

- **No shadcn tokens?** Map `bg-background` → your page bg, `bg-card` → card bg,
  `ring-border` → border color, `text-primary` → accent, `bg-secondary` → subtle
  fill, `text-muted-foreground` → secondary text. Plain Tailwind palette colors
  (e.g. `bg-white`, `ring-slate-200`, `text-indigo-600`) work fine.
- **No lucide-react?** Any icon set with check / hammer / circle / warning /
  chevron works. Emoji (✅ 🔨 ⭕ ⚠️) works in a pinch.
- **No React?** The page is: compute four counts → render a stacked bar → render
  chips → render areas → render cards with a toggle. A single vanilla HTML file
  with `<details>`/`<summary>` for the expand behavior gets 90% of the value.
- **Not TypeScript?** Drop the types; keep the field names identical.

What must survive every port: the four statuses, `next[]` on every card, `blockedBy`
on blocked cards, `since` on shipped cards, and the maintenance contract header.

## Anti-patterns

- **Board drift**: page says shipped, prod says otherwise → trust dies. Fix by
  updating in the same commit as the feature.
- **Hype summaries**: `summary` is for current truth, not marketing copy.
- **Epic cards**: a card with 9 `next` items is a project, not a feature — split it.
- **Status soup**: adding a fifth status ("testing", "review") fragments the honest
  four-bucket signal. Fold nuance into `summary`.
- **Nav placement for internal boards**: if the audience is the team, keep the route
  public-but-unlisted; putting it in the main nav invites polish pressure that
  slows updates.
