import { RoutedOutlet } from '@/app/RoutedOutlet'
import { AppHeader } from '@/app/AppHeader'

/**
 * `AdminLayout` — a THIRD SIBLING of `DefaultLayout` and `FixedHeightLayout`,
 * per 07-routing-and-layouts.md. It exists so that the route branch is
 * unambiguous: admin screens attach HERE, never under `DefaultLayout`. 07 keeps
 * it in the tree rather than omitting it precisely because leaving it out would
 * force whoever adds the next admin screen to infer where it goes, and the
 * likely wrong guess is `DefaultLayout`.
 *
 * ITS CHROME IS DELIBERATELY IDENTICAL TO `DefaultLayout` FOR NOW, and that is
 * not an oversight. 07:150-156 and
 * 18-project-context-and-implementation-status.md:206 both carry the same open
 * placeholder — whether admin screens need chrome distinct from `DefaultLayout`,
 * or whether this layout is purely a route-tree branch, is UNSPECIFIED, with the
 * trigger recorded as "the first admin screen" and the owner as Frontend Lead.
 *
 * NOTE THE TRIGGER HAS ALREADY FIRED: `/admin` (`AdminScreen`) is built and
 * shipping. So the placeholder is live, not future. Changing this layout's chrome
 * is nevertheless a separate decision from this routing pass, so the branch is
 * created and the chrome is left pass-through. Do not read the duplication below
 * as an invitation to "deduplicate" it back into `DefaultLayout` — the branch is
 * the point, and merging them re-creates exactly the ambiguity 07 wrote this
 * layout to remove.
 */
export function AdminLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <AppHeader />
      <main id="main-content" style={{ flex: 1 }}>
        <RoutedOutlet />
      </main>
    </div>
  )
}
