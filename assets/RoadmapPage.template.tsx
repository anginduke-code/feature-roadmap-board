/**
 * /roadmap —— feature status board page (internal-facing; public route is fine,
 * just keep it out of the main navigation).
 *
 * Three sections so readers never re-read the whole registry:
 *  1. Recent progress — items whose `updatedAt` falls in the last RECENT_DAYS days;
 *  2. Up next — non-shipped items sorted blocked → building → planned, then P0→P2;
 *  3. Full registry — the complete area-grouped list, collapsed by default.
 *
 * Pure function of the registry file — ALL content lives in the data file.
 * Fix the import below to wherever you placed roadmap-data.template.ts.
 *
 * Dependencies: React, Tailwind CSS, lucide-react, and shadcn-style CSS variables
 * (bg-background / bg-card / bg-secondary / ring-border / text-primary /
 * text-muted-foreground). No shadcn? Map them to your own tokens or plain colors —
 * see references/maintenance.md §Porting.
 * `font-title` below is optional — delete that class if your project lacks it.
 */
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Hammer,
  History,
  ListTodo,
  Rocket,
} from 'lucide-react'
import {
  BOARD_BRAND,
  BOARD_SUBTITLE,
  BOARD_TITLE,
  PRIORITY_META,
  ROADMAP_AREAS,
  ROADMAP_ITEMS,
  ROADMAP_UPDATED,
  STATUS_META,
  type RoadmapItem,
  type RoadmapStatus,
} from '@/data/roadmap'

const STATUS_ICON: Record<RoadmapStatus, typeof CheckCircle2> = {
  shipped: CheckCircle2,
  building: Hammer,
  planned: CircleDashed,
  blocked: AlertTriangle,
}

/** Up-next ordering: blocked first (usually waits on a user-side action), then
 *  building, then planned; same tier sorts P0 → P2. */
const STATUS_RANK: Record<RoadmapStatus, number> = { blocked: 0, building: 1, planned: 2, shipped: 3 }

const RECENT_DAYS = 7

function PriorityChip({ item }: { item: RoadmapItem }) {
  if (item.status === 'shipped') return null
  const meta = PRIORITY_META[item.priority ?? 2]
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.chip}`}>
      {meta.label}
    </span>
  )
}

function ItemCard({
  item, open, onToggle, showArea,
}: {
  item: RoadmapItem
  open: boolean
  onToggle: () => void
  showArea?: boolean
}) {
  const meta = STATUS_META[item.status]
  const Icon = STATUS_ICON[item.status]
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full rounded-2xl bg-card p-4 text-left ring-1 ring-border transition hover:ring-primary/40"
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{item.title}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.chip}`}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
            <PriorityChip item={item} />
            {showArea && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{item.area}</span>}
            {item.since && <span className="text-[11px] text-muted-foreground">{item.since}</span>}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>

          {/* Expanded: detail + next + blockedBy */}
          <div className={`grid transition-all ${open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              {item.detail && <p className="text-sm leading-relaxed">{item.detail}</p>}
              {item.next && item.next.length > 0 && (
                <div className="mt-2 rounded-xl bg-secondary/60 p-3">
                  <p className="text-xs font-bold text-muted-foreground">下一步 / 跟踪项</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {item.next.map((n) => (
                      <li key={n} className="flex items-start gap-2 text-sm">
                        <CircleDashed className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {item.blockedBy && (
                <p className="mt-2 flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 ring-1 ring-rose-500/30 dark:text-rose-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {item.blockedBy}
                </p>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
    </button>
  )
}

export default function Roadmap() {
  const [filter, setFilter] = useState<RoadmapStatus | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const counts = useMemo(() => {
    const c: Record<RoadmapStatus, number> = { shipped: 0, building: 0, planned: 0, blocked: 0 }
    for (const it of ROADMAP_ITEMS) c[it.status] += 1
    return c
  }, [])

  /** Items changed within RECENT_DAYS, newest first. */
  const recent = useMemo(() => {
    const cutoff = Date.now() - RECENT_DAYS * 86400_000
    return ROADMAP_ITEMS
      .filter((it) => it.updatedAt && +new Date(it.updatedAt) >= cutoff)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  }, [])

  /** Non-shipped items: blocked → building → planned, then P0 → P2. */
  const todoItems = useMemo(
    () =>
      ROADMAP_ITEMS.filter((it) => it.status !== 'shipped').sort(
        (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || (a.priority ?? 2) - (b.priority ?? 2),
      ),
    [],
  )

  const shippedPct = Math.round((counts.shipped / ROADMAP_ITEMS.length) * 100)
  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id))

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        {/* Header */}
        <p className="text-sm tracking-widest text-muted-foreground">{BOARD_BRAND} · {BOARD_SUBTITLE}</p>
        <h1 className="mt-2 font-title text-3xl font-bold">{BOARD_TITLE}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          更新于 {ROADMAP_UPDATED} · 共 {ROADMAP_ITEMS.length} 项 · 点开任意卡片看下一步要做什么
        </p>

        {/* Overall progress */}
        <div className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-border">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-bold"><Rocket className="h-4 w-4 text-primary" /> 已上线 {counts.shipped} 项</span>
            <span className="text-muted-foreground">{shippedPct}%</span>
          </div>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="bg-emerald-500" style={{ width: `${(counts.shipped / ROADMAP_ITEMS.length) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(counts.building / ROADMAP_ITEMS.length) * 100}%` }} />
            <div className="bg-sky-500" style={{ width: `${(counts.planned / ROADMAP_ITEMS.length) * 100}%` }} />
            <div className="bg-rose-500" style={{ width: `${(counts.blocked / ROADMAP_ITEMS.length) * 100}%` }} />
          </div>
        </div>

        {/* Recent progress — what changed lately, without re-reading everything */}
        {recent.length > 0 && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <History className="h-4 w-4 text-primary" />
              最近进展
              <span className="text-xs font-normal text-muted-foreground">近 {RECENT_DAYS} 天 · {recent.length} 项</span>
            </h2>
            <div className="mt-3 space-y-2">
              {recent.map((it) => {
                const meta = STATUS_META[it.status]
                return (
                  <div key={it.id} className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-bold">{it.title}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.chip}`}>{meta.label}</span>
                        <span className="text-[11px] text-muted-foreground">{it.updatedAt}</span>
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{it.changeNote || it.summary}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Up next — prioritized non-shipped items */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ListTodo className="h-4 w-4 text-primary" />
            接下来做什么
            <span className="text-xs font-normal text-muted-foreground">{todoItems.length} 项 · 阻塞优先，同级按 P0→P2</span>
          </h2>
          <div className="mt-3 space-y-2">
            {todoItems.map((it) => (
              <ItemCard key={it.id} item={it} open={openId === it.id} onToggle={() => toggle(it.id)} showArea />
            ))}
          </div>
        </section>

        {/* Full registry — collapsed by default */}
        <section className="mt-10">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl bg-card p-4 ring-1 ring-border transition hover:ring-primary/40"
          >
            <span className="font-bold">全部功能 · {ROADMAP_ITEMS.length} 项分区清单</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>

          {showAll && (
            <>
              {/* Filter chips double as the legend */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(['all', 'shipped', 'building', 'planned', 'blocked'] as const).map((s) => {
                  const active = filter === s
                  const label = s === 'all' ? `全部 ${ROADMAP_ITEMS.length}` : `${STATUS_META[s].label} ${counts[s]}`
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilter(s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                        active ? 'bg-primary text-primary-foreground ring-primary' : 'bg-card text-muted-foreground ring-border hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {ROADMAP_AREAS.map((area) => {
                const items = ROADMAP_ITEMS.filter((it) => it.area === area && (filter === 'all' || it.status === filter))
                if (!items.length) return null
                return (
                  <section key={area} className="mt-6">
                    <h3 className="flex items-baseline gap-2 text-base font-bold">
                      {area}
                      <span className="text-xs font-normal text-muted-foreground">{items.length} 项</span>
                    </h3>
                    <div className="mt-3 space-y-2">
                      {items.map((it) => (
                        <ItemCard key={it.id} item={it} open={openId === it.id} onToggle={() => toggle(it.id)} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </>
          )}
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          {BOARD_BRAND}{BOARD_TITLE} · 数据源是单一注册表文件 · 每次发版更新
        </p>
      </div>
    </div>
  )
}
