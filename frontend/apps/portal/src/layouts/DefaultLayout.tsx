import { RoutedOutlet } from '@/app/RoutedOutlet'
import { AppHeader } from '@/app/AppHeader'

/**
 * `DefaultLayout` — the standard app chrome, per
 * 07-routing-and-layouts.md's "The layout components".
 *
 * `min-height: 100vh` — the page grows naturally and THE WINDOW SCROLLS. That is
 * the normal behaviour, and it is the half of the contract that matters: the
 * document owns the scroll container here, so sticky positioning, focus
 * restoration and `scrollIntoView` all resolve against the viewport.
 *
 * This markup is a verbatim move of the former `AppShell.tsx` wrapper, so every
 * screen that used to render under `AppShell` renders pixel-identically here.
 * The one addition is `id="main-content"` — see below.
 *
 * DO NOT ADD A `fixedHeight` PROP TO THIS COMPONENT. 07 is emphatic about this
 * and gives the provenance: in `kus-pqms` the viewport-locked behaviour was
 * applied to the shared default layout and broke Issue List's scrolling by
 * introducing a nested scrollbar on every screen sharing the layout. It was
 * reverted and rebuilt as a separate opt-in layout — which is what
 * `FixedHeightLayout` is. A boolean that relocates the scroll container is not a
 * variant.
 */
export function DefaultLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <AppHeader />
      {/*
        EXACTLY ONE `id="main-content"` PER RENDERED PAGE. It is the <main>
        landmark's own id and, per 11-accessibility-standards.md, the skip-link
        target. It is NOT what 11's route-change focus hook targets — that moves
        focus to the new route's main heading. 07 records that an earlier
        revision of its own text got this wrong.

        A skip-link pointing here is 11's requirement and is NOT implemented by
        this pass — no layout renders one yet. Flagged, not silently adopted.
      */}
      <main id="main-content" style={{ flex: 1 }}>
        <RoutedOutlet />
      </main>
    </div>
  )
}
