import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '@pqms/ui-library'

// Shared page chrome primitives styled to the UX prototype (PQMS_SE.html):
// breadcrumb row, page container, section cards with icon chips, outlined meta
// chips, toggle groups (light / dark active pill), uppercase field labels, modal.

/**
 * One shared rail for header + every screen, matching the prototype's fluid
 * full-window behavior: max-width 1800, 40px side padding (→ 1200 content at
 * 1280w, ~1720 at 1920w — verified against PQMS_SE.html at both widths).
 */
export function PageContainer({ children, style }: { children: ReactNode; wide?: boolean; style?: CSSProperties }) {
  return <div style={{ maxWidth: 1800, margin: '0 auto', padding: '0 var(--space-10) var(--space-10)', ...style }}>{children}</div>
}

export interface Crumb {
  label: ReactNode
  to?: string
  mono?: boolean
}

/** Breadcrumb row under the header: optional back circle + "Section › Page". */
export function PageCrumb({ trail, backTo }: { trail: Crumb[]; backTo?: string }) {
  const nav = useNavigate()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-5) 0 var(--space-4)' }}>
      {backTo && (
        <button
          aria-label="Back"
          onClick={() => nav(backTo)}
          style={{ width: 26, height: 26, borderRadius: '50%', border: 'var(--border-width) solid var(--border-subtle)', background: 'var(--surface-card)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}
        >
          <Icon icon={ArrowLeft} size={13} />
        </button>
      )}
      {trail.map((c, i) => {
        const last = i === trail.length - 1
        const inner = (
          <span
            style={{
              font: `${last ? 'var(--fw-semibold)' : 'var(--fw-regular)'} var(--fs-body-sm)/1 ${c.mono ? 'var(--font-mono)' : 'var(--font-body)'}`,
              color: last ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {c.label}
          </span>
        )
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            {c.to ? (
              <button onClick={() => nav(c.to!)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                {inner}
              </button>
            ) : (
              inner
            )}
            {!last && <Icon icon={ChevronRight} size={13} style={{ color: 'var(--neutral-300)' }} />}
          </span>
        )
      })}
    </div>
  )
}

export function SectionCard({ children, style, pad = true }: { children: ReactNode; style?: CSSProperties; pad?: boolean }) {
  return (
    <section
      style={{
        background: 'var(--surface-card)',
        border: 'var(--border-width) solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xs)',
        padding: pad ? 'var(--space-5)' : 0,
        ...style,
      }}
    >
      {children}
    </section>
  )
}

/** Tinted rounded-square icon chip used in card headers / list entries. */
export function IconChip({ icon, tint = 'var(--accent-50)', color = 'var(--accent-600)', size = 40, iconSize }: { icon: LucideIcon; tint?: string; color?: string; size?: number; iconSize?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), background: tint, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
    >
      <Icon icon={icon} size={iconSize ?? Math.round(size * 0.5)} />
    </span>
  )
}

/** Card header: icon chip + title (+ optional subtitle) + right slot. */
export function CardHead({ icon, tint, color, title, subtitle, right }: { icon?: LucideIcon; tint?: string; color?: string; title: ReactNode; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: subtitle ? 'flex-start' : 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
      {icon && <IconChip icon={icon} tint={tint} color={color} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--fw-semibold) var(--fs-h4)/1.25 var(--font-body)', color: 'var(--text-primary)' }}>{title}</div>
        {subtitle && <div style={{ marginTop: 2, font: 'var(--fw-regular) var(--fs-body-sm)/1.35 var(--font-body)', color: 'var(--text-disabled)' }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}

/** Small outlined chip with an icon (workspace header meta row). */
export function MetaChip({ icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 'var(--control-sm)', padding: '0 10px', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', color: 'var(--text-secondary)', font: 'var(--fw-medium) var(--fs-caption)/1 var(--font-body)', whiteSpace: 'nowrap' }}
    >
      {icon && <Icon icon={icon} size={13} />}
      {children}
    </span>
  )
}

export interface ToggleOption {
  key: string
  label: ReactNode
  icon?: LucideIcon
  badge?: ReactNode
}

export type ToggleVariant = 'light' | 'dark'
export type ToggleSize = 'sm' | 'md'

/*
 * ─── THE SEGMENTED-CONTROL STYLE IS EXPORTED, NOT INLINE. WHY ─────────────────
 *
 * The Issue Workspace tab strip is NAVIGATION, not state: per
 * 07-routing-and-layouts.md each section tab is a `NavLink` to a sibling route,
 * which is what makes `aria-current` correct for free and browser Back step
 * between sections. But ONE tab — Issue Priority — is still local state by
 * explicit decision (the Scoring question is open, owned by PQM, per 18:219), so
 * the strip is genuinely mixed: five anchors and one button.
 *
 * The requirement is that the user cannot tell. Rather than restyle a NavLink to
 * "look like" a ToggleGroup button — which is the version that drifts the first
 * time either side is touched — the three style pieces below are shared by BOTH
 * renderers, so visual identity holds BY CONSTRUCTION rather than by inspection.
 *
 * There is a second, harder constraint that rules out the copy-paste version
 * outright: `scripts/ds-gate.mjs` runs at zero headroom — the ceilings live in
 * `.ds-ceilings.json` and are NOT quoted here on purpose, because the gate
 * rewrites them downward automatically whenever a count drops, so any number
 * copied into a comment rots by design. Read the file.
 * A duplicated pill would re-declare `gap: 7`, `padding: '0 14px'`,
 * `borderRadius: 10`, `minWidth: 18`, `height: 18`, `padding: '0 5px'` and two
 * font literals — every one of which the gate counts. Copying the styles would
 * fail the build. Sharing them cannot.
 *
 * These are a PURE MOVE of the values that were inline in `ToggleGroup`. The one
 * addition is `textDecoration: 'none'`, needed because a `NavLink` renders an
 * `<a>`; it is a no-op on the `<button>`.
 */

/** The pill itself — active/inactive, per variant and size. */
export function togglePillStyle(active: boolean, variant: ToggleVariant, size: ToggleSize): CSSProperties {
  const h = size === 'sm' ? 30 : 36
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    height: h,
    padding: '0 14px',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    background: active ? (variant === 'dark' ? 'var(--kia-midnight)' : 'var(--surface-card)') : 'transparent',
    color: active ? (variant === 'dark' ? '#fff' : 'var(--text-primary)') : 'var(--text-secondary)',
    font: `${active ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-sm)/1 var(--font-body)`,
    boxShadow: active && variant === 'light' ? 'var(--shadow-sm)' : 'none',
    transition: 'background var(--dur-fast) var(--ease-standard)',
  }
}

/** The group container that holds the pills. */
export function toggleGroupStyle(variant: ToggleVariant): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: variant === 'light' ? 4 : 0,
    background: variant === 'light' ? 'var(--neutral-50)' : 'transparent',
    border: variant === 'light' ? 'var(--border-width) solid var(--border-subtle)' : 'none',
    borderRadius: 10,
  }
}

/**
 * A pill's contents: optional icon, label, optional count badge. Shared so that
 * the anchor and the button render byte-identical children, not merely similar
 * ones.
 */
export function TogglePillContent({ icon, label, badge, active, variant }: { icon?: LucideIcon; label: ReactNode; badge?: ReactNode; active: boolean; variant: ToggleVariant }) {
  return (
    <>
      {icon && <Icon icon={icon} size={15} />}
      {label}
      {badge != null && (
        <span
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 'var(--radius-pill)', background: active ? (variant === 'dark' ? 'rgba(255,255,255,0.18)' : 'var(--neutral-100)') : 'var(--neutral-100)', color: active && variant === 'dark' ? '#fff' : 'var(--text-secondary)', font: 'var(--fw-bold) 10.5px/1 var(--font-body)' }}
        >
          {badge}
        </span>
      )}
    </>
  )
}

/**
 * ToggleGroup — segmented control, for tab strips that ARE state.
 * variant 'light': gray group container, active = white pill + shadow (sub-tabs).
 * variant 'dark': transparent container, active = Kia-Midnight pill (composer type).
 *
 * Still correct for genuine in-screen state — Investigation's
 * Activities/Parts switch, History's All/Lifecycle/Audit filter, the composer's
 * Internal/External toggle. It is NOT what the Workspace section strip uses any
 * more; that is `WorkspaceTabStrip`, because a section is a place, not a filter.
 */
export function ToggleGroup({ options, value, onChange, variant = 'light', size = 'md' }: { options: ToggleOption[]; value: string; onChange: (k: string) => void; variant?: ToggleVariant; size?: ToggleSize }) {
  return (
    <div role="tablist" style={toggleGroupStyle(variant)}>
      {options.map((o) => {
        const active = o.key === value
        return (
          <button key={o.key} role="tab" aria-selected={active} onClick={() => onChange(o.key)} style={togglePillStyle(active, variant, size)}>
            <TogglePillContent icon={o.icon} label={o.label} badge={o.badge} active={active} variant={variant} />
          </button>
        )
      })}
    </div>
  )
}

export const fieldLabel: CSSProperties = {
  display: 'block',
  font: 'var(--fw-bold) 11px/1.3 var(--font-body)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--text-disabled)',
  marginBottom: 6,
}

/** Uppercase micro-label (proto field/section labels). */
export function ULabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...fieldLabel, marginBottom: 6, ...style }}>{children}</div>
}

/**
 * Single-level modal dialog (depth-1 per EXPERIENCE.md). Esc closes. `align` defaults to
 * the established top-anchored position; pass 'center' to vertically center instead.
 *
 * ─── `bare` — THE DIALOG WITHOUT ITS FURNITURE ───────────────────────────────
 *
 * The standard shape is one padded box: a title row, a scrolling body, a footer
 * row, all inside `--space-6`. Manage Related Issues is not that shape — the
 * prototype gives it EDGE-TO-EDGE BANDS: a ruled header, a scrolling body, a
 * tinted impact band and a ruled footer, each with its own padding and its own
 * background. A single padded container cannot express a band that reaches the
 * dialog's edge.
 *
 * `bare` hands the whole SURFACE to the caller: no background, no radius, no
 * shadow, no padding, no title/footer wrappers and no `maxHeight`, so the panel
 * and its bands are the caller's own stylesheet. What stays here is everything
 * that must not diverge between dialogs — Escape, the overlay click, the
 * z-index, the scrim and `role="dialog"`.
 *
 * It changes NOTHING for the other callers: the flag defaults off and the
 * standard branch is untouched. Additive rather than a second Modal component,
 * because duplicating the dismissal logic to get a different padding is how two
 * dialogs end up closing differently.
 */
export function Modal({ open, onClose, title, children, footer, width = 540, align = 'top', bare = false }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; width?: number; align?: 'top' | 'center'; bare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)' as unknown as number,
        background: 'rgba(5,20,31,0.5)',
        display: 'flex',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        justifyContent: 'center',
        padding: align === 'center' ? 'var(--space-4)' : '9vh var(--space-4) var(--space-4)',
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        style={
          bare
            ? { width, maxWidth: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }
            : { width, maxWidth: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 'var(--space-6)' }
        }
      >
        {bare ? (
          children
        ) : (
          <>
            <div style={{ font: 'var(--fw-semibold) var(--fs-h4)/1.25 var(--font-body)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', flex: 'none' }}>{title}</div>
            <div style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>{children}</div>
            {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)', flex: 'none' }}>{footer}</div>}
          </>
        )}
      </div>
    </div>
  )
}

/** Uppercase tag chip (EWS FLAGGED / AUDIT LOG / LIFECYCLE …). Pass `style` to opt a sentence-case status pill out of the uppercase transform (e.g. Disposition / Related QIR). */
export function TagChip({ children, tint = 'var(--neutral-100)', color = 'var(--neutral-600)', style }: { children: ReactNode; tint?: string; color?: string; style?: CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 7px', borderRadius: 'var(--radius-sm)', background: tint, color, font: 'var(--fw-bold) 10px/1 var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', ...style }}>
      {children}
    </span>
  )
}
