import { NavLink } from 'react-router'
import { Gauge, GitBranch, History as HistoryIcon, LayoutPanelLeft, MessagesSquare, Microscope, Share2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TogglePillContent, toggleGroupStyle, togglePillStyle } from '@/app/chrome'
import { useRole } from '@/data/roles'

/**
 * The Workspace tab strip. FIVE NAVLINKS AND ONE BUTTON, and the user must not be
 * able to tell which is which.
 *
 * ─── WHY IT IS MIXED ──────────────────────────────────────────────────────────
 * Per 07-routing-and-layouts.md the five real sections are ROUTES: "The tab strip
 * is navigation, not state. Each tab is a `NavLink` to its sibling route, which
 * means `aria-current` is correct for free and browser Back moves between
 * sections — both of which a component-state tab strip has to reimplement badly."
 *
 * Issue Priority is the exception and stays local state, by explicit decision:
 * whether Scoring is a sixth section, a sub-route of Detail, or a modal is an OPEN
 * QUESTION owned by PQM (18-project-context-and-implementation-status.md:219).
 * Routing it now would silently answer that question. Worth knowing while it is
 * open: the Vue predecessor's V5 tab model folded Scoring into Overview entirely
 * rather than keeping it as any kind of tab (`LEGACY_TAB_REMAP`'s
 * `scoring: "overview"`), so this app's standalone Priority tab does not match
 * that lineage either. Left exactly as it is until PQM decides.
 *
 * ─── THE CONSEQUENCE, RECORDED RATHER THAN HIDDEN ─────────────────────────────
 * Opening Priority does NOT change the URL, so while it is open the address bar
 * says `/issues/:id/detail` (or whichever section was last active) while Priority
 * is on screen. That is inherent to keeping Priority unrouted and is not
 * fixable here — it is a direct cost of the open decision above, and it is exactly
 * the deep-linkability that BRD NAV-01 requires of the other five.
 *
 * ─── ONE ACTIVE PILL, NOT TWO ─────────────────────────────────────────────────
 * `priorityOpen` mutes the NavLinks' active styling. Without it the strip would
 * show two active pills at once, because the section route is still matched
 * underneath while Priority renders over it.
 *
 * ─── VISUAL IDENTITY IS STRUCTURAL, NOT COPIED ────────────────────────────────
 * Both branches render `togglePillStyle` + `TogglePillContent` from chrome.tsx,
 * the same helpers `ToggleGroup` itself uses. Nothing about the pill is
 * re-authored here, so the anchor and the button cannot drift apart, and the
 * strip is byte-identical to the `ToggleGroup variant="dark"` it replaces.
 *
 * ─── WHAT CHANGES FOR ASSISTIVE TECH, AND WHY IT IS AN IMPROVEMENT ────────────
 * These were `role="tab"` inside `role="tablist"`, with `aria-selected`. Five are
 * now plain links in a `<nav>`, carrying `aria-current="page"` (NavLink's own
 * behaviour). That is the honest description: they change the URL, so they are
 * links, and the tab pattern promises keyboard semantics this strip never
 * implemented. This DID break `scripts/fidelity-gate.mjs`, which reached four
 * captures via `getByRole('tab')` — that script now navigates by URL instead.
 */

export type WorkspaceSection = 'detail' | 'investigation' | 'resolution' | 'communication' | 'history' | 'sharing'

/** Order is the prototype's and is load-bearing for pixel fidelity — Priority sits third. */
const SECTIONS: { to: WorkspaceSection; label: string; icon: LucideIcon; capability?: 'approve' }[] = [
  { to: 'detail', label: 'Issue Detail', icon: LayoutPanelLeft },
  { to: 'investigation', label: 'Investigation', icon: Microscope },
  { to: 'resolution', label: 'Resolution', icon: GitBranch },
  { to: 'communication', label: 'Communication', icon: MessagesSquare },
  { to: 'history', label: 'History', icon: HistoryIcon },
  // ASM/PQM only — see SharingSection for why the gate is repeated there too.
  { to: 'sharing', label: 'Sharing', icon: Share2, capability: 'approve' },
]

/** Where Issue Priority sits in the rendered order (after Investigation). */
const PRIORITY_AFTER: WorkspaceSection = 'investigation'

export function WorkspaceTabStrip({ issueId, commentCount, priorityOpen, onOpenPriority }: { issueId: string; commentCount: number; priorityOpen: boolean; onOpenPriority: () => void }) {
  // Section visibility is a CAPABILITY check, never a role comparison (Tier 0's
  // RBAC rule). Sharing is the only gated section today; the filter is written
  // over `capability` so a second one needs no change here.
  const { can } = useRole()
  const priorityPill = (
    <button
      key="priority"
      type="button"
      aria-pressed={priorityOpen}
      onClick={onOpenPriority}
      style={togglePillStyle(priorityOpen, 'dark', 'md')}
    >
      <TogglePillContent icon={Gauge} label="Issue Priority" active={priorityOpen} variant="dark" />
    </button>
  )

  /*
   * FLAT CHILDREN, DELIBERATELY — `flatMap`, not a wrapper element per tab.
   * The container is a flex row with `gap: var(--space-1)`, so gap applies
   * BETWEEN ITS DIRECT CHILDREN. Wrapping each tab in a <span> to splice
   * Priority in beside Investigation would put those two inside one child and
   * drop the gap between them, moving every pill after it. Splicing into a flat
   * array keeps all six as direct children and the spacing exact.
   *
   * On `aria-current`: NavLink applies it to whichever section the URL matches,
   * and that is left alone even while Priority is open — NavLink sets it after
   * spread props, so it cannot be overridden from here anyway. It is also the
   * honest answer: the URL genuinely still points at that section, which is the
   * same asymmetry noted above, not a second defect.
   *
   * ⚠️ KNOWN AND ACCEPTED CONSEQUENCE — A VISUAL/ASSISTIVE DIVERGENCE. While
   * Priority is open, the NavLinks' *visual* active state is muted (see
   * `isActive && !priorityOpen` below) but `aria-current` cannot be. So a sighted
   * user sees no section pill active, while a screen-reader user hears "Issue
   * Detail, current page" alongside "Issue Priority, pressed". Both descriptions
   * are individually true — the URL is still that section, and the button really
   * is pressed — but they do not agree on what looks selected.
   *
   * This is an inherent cost of Priority being unrouted, not something fixable in
   * this component: the only way to make the two agree is to give Priority a URL,
   * which is exactly the open question PQM owns. Recorded so that whoever picks up
   * the Scoring decision sees this was known and accepted rather than missed.
   */
  return (
    <nav aria-label="Issue sections" style={toggleGroupStyle('dark')}>
      {SECTIONS.filter((s) => !s.capability || can(s.capability)).flatMap((s) => {
        const link = (
          <NavLink
            key={s.to}
            to={`/issues/${issueId}/${s.to}`}
            // `end` is not strictly needed (these are leaf paths) but is
            // explicit: it pins the match to this exact section rather than to
            // any future descendant of it.
            end
            style={({ isActive }) => togglePillStyle(isActive && !priorityOpen, 'dark', 'md')}
          >
            {({ isActive }: { isActive: boolean }) => (
              <TogglePillContent
                icon={s.icon}
                label={s.label}
                badge={s.to === 'communication' ? commentCount || undefined : undefined}
                active={isActive && !priorityOpen}
                variant="dark"
              />
            )}
          </NavLink>
        )
        return s.to === PRIORITY_AFTER ? [link, priorityPill] : [link]
      })}
    </nav>
  )
}
