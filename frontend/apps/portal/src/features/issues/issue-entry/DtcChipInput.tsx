import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { dtcCategory, dtcCategoryName } from '@/data/dtcCategory'
import { dtcEntry, dtcSuggestions } from '@/data/dtcCatalog'
import styles from './DtcChipInput.module.css'

/**
 * DTC / trouble-code entry — tokenised chips, not a comma-separated text box.
 *
 * ─── WHAT THIS REPLACES, AND WHY IT MATTERED ────────────────────────────────
 * Issue Entry used a single `<input>` whose value was split on commas at submit.
 * That is one control doing three jobs badly: nothing is validated until submit,
 * a typo is invisible until then, individual codes cannot be removed without
 * editing a string, and no category is ever shown. The design instead commits
 * each code to a chip as it is entered.
 *
 * ─── COMMIT KEYS ────────────────────────────────────────────────────────────
 * Enter, comma and Tab all commit; blur commits whatever is pending. Comma is
 * included deliberately — it is what a user migrating from the old field will
 * type out of habit, and silently accepting it costs nothing.
 *
 * Backspace on an EMPTY input removes the last chip. That is the conventional
 * behaviour of every chip input, and without it the only way to correct the most
 * recent entry is to reach for the mouse.
 *
 * ─── CATEGORY ───────────────────────────────────────────────────────────────
 * LOOKED UP from the catalogue when the code is in it, and only FALLING BACK to
 * `@/data/dtcCategory`'s first-character inference for a hand-typed code that is
 * not. That module keeps its job — letter → name, and letter → colour via
 * `data-cat` — it just stops guessing where real data exists.
 *
 * The colour is resolved in CSS from `data-cat`, mirroring
 * `issue-detail/fields.module.css`: no hex reaches the TS side, which keeps this
 * off ds-gate's `values` ceiling, and the tint is mixed from `currentColor` so it
 * cannot drift from the text colour.
 *
 * ─── SUGGESTIONS: A CATALOGUE, SEARCHED BY CODE **OR** DESCRIPTION ──────────
 * From `@/data/dtcCatalog`. An earlier version of this component suggested from
 * codes already recorded on other issues and documented that as a deliberate
 * limit. THAT WAS THE WRONG LIMIT, and the investigation that established it is
 * worth keeping rather than just the correction:
 *
 * · The UX prototype filters a `DTC_CODES()` array on code OR description. Its
 *   seven entries are demo data — dealer names, regions, repair-order counts —
 *   but its SHAPE is the spec.
 * · The Vue predecessor calls `masterDataService.dtcCodes()` behind a
 *   `VITE_USE_FIXTURES` flag: DTC is master data behind a service there, an
 *   architecture rather than a list.
 *
 * The capability we lacked entirely was DESCRIPTION SEARCH — "misfire" returns
 * `P0301 Cylinder 1 Misfire Detected` in both references and returned nothing
 * here. The description is rendered in each suggestion row, because searching a
 * field you cannot see is a strange experience.
 *
 * No service call and no fixture flag: there is no backend to call, and building
 * the seam would commit us to an endpoint that does not exist. See
 * `dtcCatalog.ts` for why the shape is the Vue app's `DtcOption`.
 */
/** Matches `.panel`'s `max-height` — the two must move together. */
const PANEL_MAX_HEIGHT_PX = 236

export function DtcChipInput({
  codes,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}: {
  codes: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
  'aria-label'?: string
}) {
  const [draft, setDraft] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const [openUpward, setOpenUpward] = useState(false)

  /** Uppercased, de-duplicated, and never the empty string. */
  const commit = (raw: string) => {
    const next = raw.trim().toUpperCase()
    setDraft('')
    if (!next || codes.includes(next)) return
    onChange([...codes, next])
  }

  const remove = (code: string) => onChange(codes.filter((c) => c !== code))

  const matches = useMemo(() => dtcSuggestions(draft, codes), [draft, codes])

  const showSuggestions = focused && matches.length > 0

  /**
   * ─── THE PANEL FLIPS ABOVE THE ROW WHEN THERE IS NOT ROOM BELOW ────────────
   *
   * ⚠️ IT FLIPS. It does not open upward unconditionally. A panel pinned above
   * would clip at the TOP of the scroll region for exactly the same reason it
   * clipped at the bottom — the fix has to be conditional or it just moves the
   * bug.
   *
   * WHAT WENT WRONG WITHOUT THIS. The panel is absolutely positioned in-document,
   * and Issue Entry renders inside `FixedHeightLayout`'s `overflow-y: auto`
   * scroll port. With the field 60px above the port's bottom edge, 168px of a
   * 216px panel was clipped — 48 visible pixels, roughly one row. It read as
   * "the dropdown doesn't appear".
   *
   * ⚠️ VERIFYING THIS NEEDS A MID-SCROLL POSITION, NOT AN EXTREME ONE. Scrolling
   * the port fully to its end puts this field comparatively HIGH — it is the last
   * field, so there is ~246px beneath it — and the panel then fits at every
   * viewport height tested (900 / 760 / 650 all returned zero clipped pixels).
   * The reflex check reports success. Position the field mid-port instead, and
   * measure clipped PIXELS: a 48px sliver of panel is still "visible" by every
   * ordinary definition, which is precisely how this passed unnoticed.
   *
   * ⚠️ NO PROTOTYPE PRECEDENT — this is a deliberate improvement over the design,
   * not a fidelity fix. Ported from the Vue app's `DtcTypeahead.vue`, whose own
   * note reads "Considered decision, no V5 precedent (V5 has the same
   * limitation)". A future reader comparing against the prototype will find them
   * disagreeing; that disagreement is intended.
   *
   * ONE DELIBERATE REFINEMENT ON VUE: it measures room against the VIEWPORT. We
   * walk to the nearest CLIPPING ancestor — `overflow-y` of `auto`, `scroll` OR
   * `hidden` — and fall back to the viewport if there is none.
   *
   * `hidden` is in that list on purpose, and it turns out to be the one that
   * matters. Measured on this screen: the first clipping ancestor is NOT the
   * scroll port at all. It is `.formCard`, whose `overflow: hidden` exists to
   * keep the section backgrounds inside the card's rounded corners — and it ends
   * roughly 30px below this field, because DTC is the card's last control. The
   * scroll port is a further ~220px below that and never gets a say.
   *
   * So in practice this field flips upward almost always, and that is correct
   * rather than over-eager: a downward panel could not escape the card whatever
   * the port did. An implementation that only looked for scrollable ancestors
   * would measure the port, find room, open downward, and be clipped by the card
   * instead — the same bug wearing a different ancestor.
   *
   * Measured once per open, against the ROW — its geometry does not depend on
   * the panel, which is absolutely positioned and out of flow.
   */
  useLayoutEffect(() => {
    if (!showSuggestions) return
    const row = rowRef.current
    if (!row) return

    let clipBottom = window.innerHeight
    for (let el = row.parentElement; el; el = el.parentElement) {
      const oy = getComputedStyle(el).overflowY
      if (oy === 'auto' || oy === 'scroll' || oy === 'hidden') {
        clipBottom = Math.min(clipBottom, el.getBoundingClientRect().bottom)
        break
      }
    }
    setOpenUpward(clipBottom - row.getBoundingClientRect().bottom < PANEL_MAX_HEIGHT_PX)
  }, [showSuggestions])

  return (
    // ⚠️ TWO SIBLINGS, NOT ONE WRAPPER. `.wrap` is the panel's positioning
    // context and must contain the control ALONE. The help text is a sibling
    // outside it, because `.panel` anchors at `top/bottom: calc(100% + 5px)` of
    // `.wrap` — fold the help text in and 100% grows to include it, pushing the
    // panel down the page (opening) or leaving a gap (flipped). The Vue
    // implementation records making exactly this mistake and reverting it.
    <>
      <div className={styles.wrap}>
      {/*
        Clicking anywhere in the field focuses the input, including the padding
        between chips — without this the control has dead zones that look
        clickable and are not.
      */}
      {/* `position: relative` is scoped to THIS row, not the outer wrapper —
          the panel anchors to the control alone. The Vue implementation records
          getting this wrong once: anchoring to the whole field pulled the label
          and help text into the reference box and pushed the panel far down the
          page. Our wrapper is already tight; keep it that way. */}
      <div
        ref={rowRef}
        className={disabled ? `${styles.field} ${styles.fieldDisabled}` : styles.field}
        onClick={() => inputRef.current?.focus()}
      >
        {codes.map((code) => {
          const cat = dtcEntry(code)?.category ?? dtcCategory(code)
          return (
            <span key={code} className={styles.chip} data-cat={cat}>
              {code}
              <span className={styles.chipCat}>{dtcCategoryName(cat)}</span>
              {!disabled && (
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={(e) => { e.stopPropagation(); remove(code) }}
                  aria-label={`Remove ${code}`}
                  title={`Remove ${code}`}
                >
                  <Icon icon={X} size={12} />
                </button>
              )}
            </span>
          )
        })}
        <input
          ref={inputRef}
          className={styles.input}
          value={draft}
          disabled={disabled}
          aria-label={ariaLabel}
          // UNCONDITIONAL, in both references — the prototype's markup has no
          // condition on it and Vue binds `t('placeholder')` outright. Ours hid
          // it once a chip existed, so the input went blank as it shrank and
          // stopped saying what it wanted.
          placeholder="e.g. P0A0F, C1234, B1020"
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          // Committing on blur rather than discarding: a half-typed code that
          // vanishes when the user clicks away is a silent data loss.
          onBlur={() => { setFocused(false); commit(draft) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
              if (!draft.trim()) return
              e.preventDefault()
              commit(draft)
            } else if (e.key === 'Backspace' && !draft && codes.length > 0) {
              remove(codes[codes.length - 1])
            }
          }}
        />
      </div>

      {showSuggestions && (
        <div className={openUpward ? `${styles.panel} ${styles.panelUp}` : styles.panel} role="listbox">
          {matches.map((d) => (
            <button
              key={d.code}
              type="button"
              role="option"
              aria-selected={false}
              className={styles.option}
              // `onMouseDown` + preventDefault, not onClick: the input's blur
              // fires first on a plain click, committing the draft and closing
              // the panel before the handler runs. Same trap as the combobox
              // bulk actions.
              onMouseDown={(e) => { e.preventDefault(); commit(d.code) }}
            >
              <span className={styles.optionCode}>{d.code}</span>
              {/* The description is what makes "misfire" a usable query, so it
                  has to be visible — searching an invisible field is a strange
                  experience. It takes the remaining width and truncates. */}
              <span className={styles.optionDesc}>{d.description}</span>
              <span className={styles.optionCat}>{dtcCategoryName(d.category)}</span>
            </button>
          ))}
        </div>
      )}
      </div>

      {/*
        The help text is not decoration: it does two jobs the control cannot do
        for itself. It tells the user that free entry is allowed alongside search
        — otherwise a code absent from the catalogue looks unenterable — and it is
        the ONLY place the four category letters are explained. Without it the
        coloured "Powertrain"/"Body" tags on the chips have no legend.
      */}
      <p className={styles.help}>
        Type to search codes, or enter your own separated by commas. P·Powertrain B·Body C·Chassis U·Network.
      </p>
    </>
  )
}
