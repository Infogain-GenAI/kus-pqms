import { useEffect, useRef, useState } from 'react'
import { Calendar, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button, Icon } from '@pqms/ui-library'
import { useTranslation } from 'react-i18next'
import { NS } from '../IssueDetail.i18n'
import {
  QUICK_RANGES,
  activeQuickRange,
  quickRangeValue,
  type DateRange,
  type QuickRangeKey,
} from './history'
import styles from './HistoryDateFilter.module.css'

/**
 * HISTORY DATE FILTER — six quick ranges plus a custom from/to.
 *
 * Ported from Vue's `tabs/HistoryTab/HistoryDateFilter.vue`.
 *
 * ─── ⚠️ DOCUMENTED DEVIATION: NATIVE DATE INPUTS, NOT A CALENDAR ─────────────
 *
 * Vue composes `BaseDateRangePicker` from its shipped component library, and its
 * own header records that as a deviation from a design that draws a bespoke
 * inline two-month calendar — one implementation to maintain rather than two.
 *
 * This library has NO date picker at all. So this composes two
 * `<input type="date">` instead, and the same reasoning carries one step
 * further: building a calendar inside a feature folder would put a component
 * that belongs in `packages/ui-library` somewhere no other screen can reach it,
 * and it would be the second thing to replace when a real picker lands.
 *
 * What is preserved exactly: the same from/to semantics, the same `max` bound,
 * the quick-range rail, the Clear/Apply footer, and Apply disabled until BOTH
 * endpoints are chosen.
 *
 * ⚠️ `max={today}` IS UNCONDITIONAL, AND IT IS A RULE RATHER THAN A DEFAULT. A
 * history log has no forward extent, so no future date is selectable. Vue states
 * the same and notes the bound is theirs, not the picker's.
 *
 * ─── `today` IS INJECTED, NEVER READ FROM THE CLOCK ──────────────────────────
 *
 * Same as the pure module behind it. A component that calls `new Date()` cannot
 * be tested for "last 30 days" without freezing time, and this app already pins
 * a fixed `NOW` anchor so the feed's buckets and its filter can never disagree
 * about what today is.
 */

export interface HistoryDateFilterProps {
  /** The applied range. `{}` means no constraint. */
  value: DateRange
  onChange: (next: DateRange) => void
  /** ISO `yyyy-mm-dd`. Injected so the component stays deterministic. */
  today: string
}

export function HistoryDateFilter({ value, onChange, today }: HistoryDateFilterProps) {
  const { t } = useTranslation(NS)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const rootRef = useRef<HTMLDivElement>(null)

  /*
   * Close on a click outside.
   *
   * ⚠️ THE LISTENER IS ONLY ATTACHED WHILE OPEN, and the effect's cleanup
   * removes it. A permanently-attached document listener is a leak that survives
   * unmount, and this panel lives inside a routed section that unmounts on every
   * tab change.
   *
   * `mousedown`, not `click`: a `click` listener fires after the trigger's own
   * handler on the same gesture, so opening the panel would immediately close it.
   */
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const active = activeQuickRange(value, today)

  const activePreset = QUICK_RANGES.find((range) => range.key === active)
  const triggerLabel = activePreset
    ? t(activePreset.labelKey)
    : `${value.from ?? ''} – ${value.to ?? ''}`

  /** Apply stays disabled until BOTH endpoints are chosen — Vue's AC5. */
  const canApply = Boolean(draft.from && draft.to)

  function selectQuickRange(key: QuickRangeKey) {
    // The custom draft is discarded, not merged: a user who picks "Last 7 days"
    // after typing a half-finished custom range means the preset, and leaving the
    // draft would re-apply it the next time they opened the panel.
    setDraft({ from: '', to: '' })
    onChange(quickRangeValue(key, today))
    setOpen(false)
  }

  function applyCustom() {
    if (!canApply) return
    onChange({ from: draft.from, to: draft.to })
    setOpen(false)
  }

  /*
   * Clear resets to "no constraint" and — deliberately — LEAVES THE PANEL OPEN.
   * Vue does the same: clearing is a step towards choosing something else, so
   * closing would make the common case two extra clicks.
   */
  function clear() {
    setDraft({ from: '', to: '' })
    onChange({})
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="dialog"
        data-testid="history-date-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.triggerLabel}>{t('historyDateLabel')}</span>
        <span className={styles.triggerValue}>{triggerLabel}</span>
        <Icon icon={Calendar} size={14} />
        <Icon icon={open ? ChevronUp : ChevronDown} size={14} />
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label={t('historyDateRangeDialog')} data-testid="history-date-panel">
          <ul className={styles.quick}>
            <li className={styles.quickHeading}>{t('historyQuickRanges')}</li>
            {QUICK_RANGES.map((range) => (
              <li key={range.key}>
                <button
                  type="button"
                  className={`${styles.quickItem} ${active === range.key ? styles.quickItemActive : ''}`}
                  // `aria-pressed` rather than only a class: the active state is
                  // information, and a colour change alone is invisible to a
                  // screen reader and to anyone who cannot distinguish it.
                  aria-pressed={active === range.key}
                  data-testid={`history-date-quick-${range.key}`}
                  onClick={() => selectQuickRange(range.key)}
                >
                  <span>{t(range.labelKey)}</span>
                  {active === range.key && <Icon icon={Check} size={14} />}
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.custom}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="history-date-from">
                {t('historyDateFrom')}
              </label>
              <input
                id="history-date-from"
                type="date"
                className={styles.input}
                value={draft.from}
                max={today}
                data-testid="history-date-from"
                onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="history-date-to">
                {t('historyDateTo')}
              </label>
              <input
                id="history-date-to"
                type="date"
                className={styles.input}
                value={draft.to}
                /*
                 * ⚠️ BOUNDED BELOW BY `from` AS WELL AS ABOVE BY `today`. Without
                 * the lower bound a user can select a `to` before their `from`,
                 * which Apply accepts and which then matches nothing — an empty
                 * feed that looks like missing data rather than an impossible
                 * range.
                 */
                min={draft.from || undefined}
                max={today}
                data-testid="history-date-to"
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
              />
            </div>

            <div className={styles.footer}>
              <p className={styles.hint}>{t('historyDateHint')}</p>
              <div className={styles.actions}>
                <Button variant="secondary" size="sm" data-testid="history-date-clear" onClick={clear}>
                  {t('historyDateClear')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canApply}
                  data-testid="history-date-apply"
                  onClick={applyCustom}
                >
                  {t('historyDateApply')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
