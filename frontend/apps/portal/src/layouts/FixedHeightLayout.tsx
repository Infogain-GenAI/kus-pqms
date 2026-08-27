import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/app/AppHeader'

/**
 * `FixedHeightLayout` — viewport-locked, internally scrolling. Per
 * 07-routing-and-layouts.md, and a SIBLING of `DefaultLayout`, never nested
 * inside it: a screen gets exactly one layout. Nesting the two would render two
 * app headers, two elements carrying `id="main-content"` (invalid HTML), and
 * `height: 100vh` inside `min-height: 100vh` — the nested-scrollbar regression
 * 07 exists to prevent.
 *
 * `height: 100vh`, not `min-height` — the layout is exactly one viewport tall,
 * and `<main>` IS THE FIXED FRAME: it does not scroll. `overflow: hidden` is
 * what makes that true rather than aspirational — without it, overflowing
 * content escapes the frame and the document scrolls after all, which is the
 * failure this layout exists to rule out.
 *
 * THE SCROLLING REGION IS THE CHILD SCREEN'S RESPONSIBILITY. A screen rendered
 * here MUST provide its own `overflow-y: auto` region, or its content will be
 * clipped at one viewport. That is a deliberate, loud failure mode rather than a
 * silent fallback to document scroll — a screen that forgets is visibly broken
 * instead of quietly inconsistent with the layout's contract.
 *
 * WHICH SCREEN USES THIS, AND WHY IT IS NOT THE ISSUE LIST: 07 contradicts
 * itself here — its normative route tree (07:235-237) puts only Issue Entry
 * under this layout, while 07:697-722 argues the Issue List needs it. Verified
 * against both screens: `CreateIssueScreen` has no sticky/100vh/overflow
 * behaviour at all, and `IssueListScreen`'s only internal scroll is its filter
 * drawer. Neither has the property 07's rationale describes, so BOTH readings of
 * 07 were wrong for this application and both screens stay on `DefaultLayout`.
 *
 * It is the ISSUE WORKSPACE that has the requirement, resolved by Yogesh
 * (2026-08-27): "Navigating to a Workspace section resets scroll to the top of
 * the scrolling region. Only the workspace body scrolls; the page itself never
 * does." The workspace shell's crumb, header card, tab strip and approval banner
 * are the pinned region; the section `<Outlet />` is the only scrolling one.
 */
export function FixedHeightLayout() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <AppHeader />
      {/* `minHeight: 0` is load-bearing: without it a flex child refuses to
          shrink below its content size, the frame grows past the viewport, and
          the document scrolls — defeating the entire layout. */}
      <main id="main-content" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}
