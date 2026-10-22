/**
 * Feature roadmap registry — the single source of truth for the status board.
 *
 * Maintenance contract (humans and AI agents alike):
 * - shipped  → set `since` (version or date) the moment it goes live.
 * - building → actively being worked on right now.
 * - planned  → decided, not started.
 * - blocked  → waiting on an external condition; ALWAYS fill `blockedBy` with the
 *              concrete action that unblocks it (often a user-side action).
 * - Every item carries `next` (next actions / tracking items) so the board answers
 *   "what do we do next" when a card is opened. Verb-first, checkable, 1–4 items.
 * - Any status/content change → also set `updatedAt` (YYYY-MM-DD) and a one-line
 *   `changeNote`; the "Recent progress" section is driven by these so readers
 *   never have to re-read the whole registry.
 * - Non-shipped items get `priority`: 0 = most urgent (blocks other modules /
 *   severe defect / user is waiting), 1 = important main-path, 2 = normal (default).
 * - Bump ROADMAP_UPDATED on every change; ship board updates with the release.
 * - Multi-agent projects: edit items surgically by id; never rewrite the registry.
 */

export type RoadmapStatus = 'shipped' | 'building' | 'planned' | 'blocked'

export interface RoadmapItem {
  id: string
  /** Section heading the card groups under. Keep 3–7 areas total. */
  area: string
  title: string
  status: RoadmapStatus
  /** One sentence of current truth, no hype. */
  summary: string
  /** Expanded context: what / why / trade-offs. */
  detail?: string
  /** Next actions / tracking items. */
  next?: string[]
  /** The exact external action that unblocks a blocked item. */
  blockedBy?: string
  /** Version or date the feature went live. Required for shipped. */
  since?: string
  /** Last change date (YYYY-MM-DD). Drives the "Recent progress" section. */
  updatedAt?: string
  /** One line about what changed (shown next to updatedAt). */
  changeNote?: string
  /** Priority for non-shipped items: 0 = urgent, 1 = important, 2 = normal (default). */
  priority?: 0 | 1 | 2
}

/** Shown in the page header/footer. Rename for your project. */
export const BOARD_BRAND = 'My Project'
export const BOARD_TITLE = '功能全景' // or 'Feature Board'
export const BOARD_SUBTITLE = '内部看板' // or 'Status Board'

export const ROADMAP_UPDATED = '2026-01-01'

/** Status labels/colors. Swap `label` values to English if your team prefers. */
export const STATUS_META: Record<RoadmapStatus, { label: string; dot: string; chip: string }> = {
  shipped: { label: '已上线', dot: 'bg-emerald-500', chip: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300' },
  building: { label: '进行中', dot: 'bg-amber-500', chip: 'bg-amber-500/10 text-amber-700 ring-amber-500/30 dark:text-amber-300' },
  planned: { label: '待做', dot: 'bg-sky-500', chip: 'bg-sky-500/10 text-sky-700 ring-sky-500/30 dark:text-sky-300' },
  blocked: { label: '阻塞', dot: 'bg-rose-500', chip: 'bg-rose-500/10 text-rose-700 ring-rose-500/30 dark:text-rose-300' },
}

/** Priority chips, shown only on non-shipped items. */
export const PRIORITY_META: Record<0 | 1 | 2, { label: string; chip: string }> = {
  0: { label: 'P0 关键', chip: 'bg-rose-500/10 text-rose-700 ring-rose-500/30 dark:text-rose-300' },
  1: { label: 'P1 重要', chip: 'bg-amber-500/10 text-amber-700 ring-amber-500/30 dark:text-amber-300' },
  2: { label: 'P2 常规', chip: 'bg-secondary text-muted-foreground ring-border' },
}

/** Replace with your project's real feature areas (3–7 recommended). */
export const ROADMAP_AREAS = ['核心体验', '增长', '平台与基建'] as const

/**
 * Sample entries demonstrating all four statuses — replace with real features.
 * Keep at least one blocked item honest: a board with nothing blocked is usually
 * a board that isn't telling the truth.
 */
export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: 'example-shipped', area: '核心体验', title: '示例：已上线功能', status: 'shipped', since: '0.1.0',
    updatedAt: '2026-01-01', changeNote: '0.1.0 上线',
    summary: '一句话说清它现在在线上做什么。',
    detail: '可展开写背景、关键设计取舍。',
    next: ['后续跟踪项，例如：观察某指标两周'],
  },
  {
    id: 'example-building', area: '核心体验', title: '示例：进行中的功能', status: 'building', priority: 1,
    updatedAt: '2026-01-01', changeNote: '开工，完成骨架',
    summary: '一句话说清当前进展到什么程度。',
    next: ['下一步具体动作一', '下一步具体动作二'],
  },
  {
    id: 'example-planned', area: '增长', title: '示例：已决定未动工', status: 'planned', priority: 2,
    summary: '为什么值得做，一句话。',
    next: ['动工前需要先想清楚的第一件事'],
  },
  {
    id: 'example-blocked', area: '平台与基建', title: '示例：被外部条件卡住', status: 'blocked', priority: 0,
    summary: '技术上都准备好了，卡在一个外部动作上。',
    detail: '写清为什么卡住、解开后第一步做什么。被依赖多的阻塞项给 P0。',
    next: ['解开后的第一步'],
    blockedBy: '用户侧动作：开通某服务 / 提供某资质（写清楚是谁的什么动作）',
  },
]
