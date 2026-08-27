import { Outlet } from 'react-router-dom'

/**
 * `BlankLayout` — no chrome. Per 07-routing-and-layouts.md: "No header, no
 * `<main>` wrapper beyond what the page provides. Used for the catch-all 404
 * route, where app chrome around a 'not found' message is noise."
 *
 * SO THIS COMPONENT DELIBERATELY DOES NOT RENDER A `<main>`. The child screen
 * owns its own `<main id="main-content">`, which keeps the "exactly one
 * `id="main-content"` per rendered page" rule true here as everywhere else. A
 * `<main>` added here would produce two.
 *
 * `AuthLayout` is NOT built, and its absence is specified rather than pending:
 * 07 states no route uses it and no route is specified that would, because this
 * app has no login screen — the entire authentication surface is Entra's own
 * hosted sign-in UI, reached by redirect. Building it needs 08 to settle the MSAL
 * `redirectUri` question first.
 */
export function BlankLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Outlet />
    </div>
  )
}
