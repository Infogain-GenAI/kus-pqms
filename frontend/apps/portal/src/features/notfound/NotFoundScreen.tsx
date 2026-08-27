import { useNavigate } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Button } from '@pqms/ui-library'
import { IconChip, PageContainer } from '@/app/chrome'

/**
 * The catch-all 404 screen, rendered under `BlankLayout` per
 * 07-routing-and-layouts.md's route tree.
 *
 * THIS REPLACES A SILENT REDIRECT. Until now `path="*"` navigated to /dashboard,
 * so a mistyped or dead URL quietly landed the user on the Overview with no
 * indication anything had gone wrong. That is a real behaviour change and was
 * approved as such rather than slipped in — 07 specifies a `NotFoundPage`, and
 * `BlankLayout` has no other route to justify its existence.
 *
 * NO NEW VISUAL LANGUAGE IS INVENTED HERE. The composition — `IconChip` +
 * heading + description + one recovery action — is the app's established
 * empty-state pattern, lifted from `IssueWorkspaceScreen`'s "No disposition
 * recorded" and `HistoryTab`'s "No activities match". That is not only a
 * consistency preference: `scripts/ds-gate.mjs` sits at ZERO HEADROOM on all
 * three families (values 333/333, numeric 207/207, imports 0/0), so this screen —
 * the one piece of genuinely new UI in this pass — can introduce no raw px, no
 * raw hex and no numeric dimension without failing the build. Every value below
 * is an existing token, reused rather than authored. If a future edit here needs
 * a value with no token, that is the ~353-value decision recorded in STATUS.md
 * and it is not resolvable inside a screen file.
 *
 * `<main id="main-content">` is rendered HERE rather than by `BlankLayout`,
 * because 07 gives that layout "no `<main>` wrapper beyond what the page
 * provides". One landmark per rendered page, and this is it.
 */
export function NotFoundScreen() {
  const nav = useNavigate()
  return (
    <main id="main-content">
      <PageContainer>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'var(--space-10) var(--space-6)',
          }}
        >
          <IconChip icon={SearchX} tint="var(--neutral-100)" color="var(--neutral-500)" size={48} />
          <h1
            style={{
              margin: 'var(--space-4) 0 var(--space-1)',
              font: 'var(--fw-bold) var(--fs-h4)/1.25 var(--font-display)',
              color: 'var(--text-primary)',
            }}
          >
            Page not found
          </h1>
          <p
            style={{
              margin: '0 0 var(--space-5)',
              font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)',
              color: 'var(--text-muted)',
            }}
          >
            The address you followed does not match any screen in PQMS. It may have been moved, or the link may be
            incomplete.
          </p>
          <Button variant="secondary" size="sm" onClick={() => nav('/dashboard')}>
            Back to Overview
          </Button>
        </div>
      </PageContainer>
    </main>
  )
}
