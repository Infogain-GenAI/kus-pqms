import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { StatusBadge } from '../core/Status'
import { type StatusKey } from '../core/statusMap'
import { SourceBadge } from './SourceBadge'
import { type SourceKey } from './sourceMap'

/**
 * IssueCard — summary card for a quality issue. Composes StatusBadge + SourceBadge.
 * Ported verbatim from the design-system source (_ds_bundle.js → components/pqms/IssueCard.jsx),
 * EXCEPT the severity display (DS composed the out-of-scope SeverityBar) is omitted — see below.
 * Selectable / clickable; hover is JS-driven (as in the DS source).
 */
export interface IssueCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'title' | 'id' | 'part'> {
  id?: ReactNode
  title?: ReactNode
  part?: ReactNode
  status?: StatusKey
  source?: SourceKey
  assignee?: string
  age?: ReactNode
  selected?: boolean
  style?: CSSProperties
}

export function IssueCard({
  id,
  title,
  part,
  status = 'open',
  source = 'warranty',
  assignee,
  age,
  selected = false,
  onClick,
  style,
  ...rest
}: IssueCardProps) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        background: 'var(--surface-card)',
        border: `1px solid ${selected ? 'var(--accent-300)' : 'var(--border-subtle)'}`,
        borderLeft: `3px solid ${selected ? 'var(--accent-500)' : 'transparent'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow var(--dur-base), border-color var(--dur-base)',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                font: `var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)`,
                color: 'var(--text-muted)',
              }}
            >
              {id}
            </span>
            <SourceBadge source={source} size="sm" />
          </div>
          <div
            style={{
              font: `var(--fw-semibold) var(--fs-body-md)/1.35 var(--font-body)`,
              color: 'var(--text-primary)',
              textWrap: 'pretty',
            }}
          >
            {title}
          </div>
          {part && (
            <div
              style={{
                font: `var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)`,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              {part}
            </div>
          )}
        </div>
        <StatusBadge status={status} size="sm" />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* Severity display omitted: the DS source rendered a "Severity" caption + SeverityBar
            here, but SeverityBar is out of DS-port scope. This empty column preserves the
            space-between layout so age/assignee stay right-aligned, with no style values changed. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {age && (
            <span
              style={{
                font: `var(--fw-regular) var(--fs-caption)/1 var(--font-body)`,
                color: 'var(--text-muted)',
              }}
            >
              {age}
            </span>
          )}
          {assignee && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                font: `var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)`,
                color: 'var(--text-secondary)',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--kia-midnight-70)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: 'var(--fw-semibold) 9px/1 var(--font-body)',
                }}
              >
                {assignee
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </span>
              {assignee}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
