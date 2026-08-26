import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

/**
 * Timeline — vertical activity / audit trail.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/pqms/Timeline.jsx).
 * items: [{ icon?, title, meta?, time, tone? }]  tone: default|accent|success|warning|danger
 * NOTE: `icon` is part of the documented item shape but the DS render never draws it — kept for parity.
 */
export type TimelineTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export interface TimelineItem {
  /** Documented in the DS item shape but not rendered by the DS source. */
  icon?: ReactNode
  title?: ReactNode
  meta?: ReactNode
  time?: ReactNode
  tone?: TimelineTone
}

export interface TimelineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  items?: TimelineItem[]
  style?: CSSProperties
}

export function Timeline({ items = [], style, ...rest }: TimelineProps) {
  const tones: Record<TimelineTone, string> = {
    default: 'var(--neutral-400)',
    accent: 'var(--accent-500)',
    success: 'var(--success-500)',
    warning: 'var(--warning-500)',
    danger: 'var(--danger-500)',
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...rest}
    >
      {items.map((it, i) => {
        const last = i === items.length - 1
        const dot = (it.tone && tones[it.tone]) || tones.default
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 'none',
              }}
            >
              <span
                style={{
                  width: 'var(--icon-xs)',
                  height: 'var(--icon-xs)',
                  borderRadius: '50%',
                  background: 'var(--surface-card)',
                  border: `2.5px solid ${dot}`,
                  marginTop: 3,
                  flex: 'none',
                }}
              />
              {!last && (
                <span
                  style={{
                    width: 2,
                    flex: 1,
                    background: 'var(--border-subtle)',
                    minHeight: 'var(--icon-md)',
                  }}
                />
              )}
            </div>
            <div
              style={{
                paddingBottom: last ? 0 : 18,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  font: `var(--fw-medium) var(--fs-body-md)/1.4 var(--font-body)`,
                  color: 'var(--text-primary)',
                }}
              >
                {it.title}
              </div>
              {it.meta && (
                <div
                  style={{
                    font: `var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)`,
                    color: 'var(--text-secondary)',
                    marginTop: 2,
                  }}
                >
                  {it.meta}
                </div>
              )}
              <div
                style={{
                  font: `var(--fw-regular) var(--fs-caption)/1 var(--font-body)`,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}
              >
                {it.time}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
