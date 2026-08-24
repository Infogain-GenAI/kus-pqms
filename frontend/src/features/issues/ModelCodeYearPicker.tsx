import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, Checkbox, SearchField } from '@/components'
import { Icon } from '@/icons/Icon'
import { ULabel } from '@/app/chrome'
import { MODEL_CODES, modelYearsFor, type ModelCodeEntry } from '@/data/modelCodes'

/**
 * Model Code (multi-select) + per-code Model Year checkboxes — the V4-V5 Issue Entry
 * vehicle picker. Shared by Issue Entry and by Issue Detail's in-tab edit mode, which
 * reuses the same form.
 *
 * Two prototype behaviours are easy to get wrong and are deliberate here:
 *
 * 1. The year universe for a code is the **union** of the code's nominal MC_MASTER range
 *    and the years actually recorded on the issue. A stored year outside the nominal range
 *    must still appear (checked) rather than silently vanish.
 * 2. Deselecting every year for a code is a legitimate state (`none`), distinct from the
 *    default of "all years selected". It is surfaced, because an empty year set is almost
 *    always a mistake but the prototype does not block it.
 */

export interface ModelCodeSelection {
  /** Selected codes, ordered by the master list. First is the anchor (drives model name). */
  codes: string[]
  /** code → selected years. A code absent from the map means "all of its years". */
  yearsByCode: Record<string, string[]>
}

export function ModelCodeYearPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: ModelCodeSelection
  onChange: (next: ModelCodeSelection) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const { codes, yearsByCode } = value

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MODEL_CODES
    return MODEL_CODES.filter((m) => `${m.code} ${m.name}`.toLowerCase().includes(q))
  }, [query])

  /** Keep codes in master order so the anchor is stable regardless of click order. */
  const order = (list: string[]) => {
    const idx = new Map(MODEL_CODES.map((m, i) => [m.code, i]))
    return [...new Set(list)].filter((c) => idx.has(c)).sort((a, b) => idx.get(a)! - idx.get(b)!)
  }

  const toggleCode = (code: string) => {
    const next = codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code]
    const nextYears = { ...yearsByCode }
    if (!next.includes(code)) delete nextYears[code]
    onChange({ codes: order(next), yearsByCode: nextYears })
  }

  const removeRow = (code: string) => {
    const nextYears = { ...yearsByCode }
    delete nextYears[code]
    onChange({ codes: codes.filter((c) => c !== code), yearsByCode: nextYears })
  }

  /** Selected years for a code, defaulting to its whole universe. */
  const selectedYears = (entry: ModelCodeEntry) => yearsByCode[entry.code] ?? modelYearsFor(entry.code)

  const toggleYear = (entry: ModelCodeEntry, year: string) => {
    const cur = selectedYears(entry)
    const next = cur.includes(year) ? cur.filter((y) => y !== year) : [...cur, year]
    onChange({ codes, yearsByCode: { ...yearsByCode, [entry.code]: next.sort((a, b) => +a - +b) } })
  }

  const toggleAllYears = (entry: ModelCodeEntry, universe: string[]) => {
    const cur = selectedYears(entry)
    const all = universe.length > 0 && universe.every((y) => cur.includes(y))
    onChange({ codes, yearsByCode: { ...yearsByCode, [entry.code]: all ? [] : [...universe] } })
  }

  const totalYears = codes.reduce((a, c) => {
    const entry = MODEL_CODES.find((m) => m.code === c)
    return a + (entry ? selectedYears(entry).length : 0)
  }, 0)

  return (
    <div>
      <ULabel>Model code *</ULabel>
      <SearchField
        aria-label="Search model code"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={codes.length ? 'Search to add or remove…' : 'Search model code… (e.g. KA, DL, CV)'}
        disabled={disabled}
      />

      {/* Code options — checkbox list, multi-select */}
      <div
        style={{
          marginTop: 'var(--space-2)',
          maxHeight: 168,
          overflowY: 'auto',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-3)', color: 'var(--text-muted)', fontSize: 'var(--fs-body-sm)' }}>
            No model code matches “{query}”.
          </div>
        ) : (
          filtered.map((m, i) => (
            <div
              key={m.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                padding: '7px var(--space-3)',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                background: codes.includes(m.code) ? 'var(--hover-overlay)' : 'transparent',
              }}
            >
              <Checkbox
                checked={codes.includes(m.code)}
                disabled={disabled}
                onChange={() => toggleCode(m.code)}
                label={
                  <span style={{ fontSize: 'var(--fs-body-sm)' }}>
                    <span className="ism-mono" style={{ fontWeight: 600 }}>{m.code}</span> · {m.name}
                  </span>
                }
              />
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>MY{m.range}</span>
            </div>
          ))
        )}
      </div>

      {/* Per-code model-year rows */}
      {codes.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <ULabel>Model year(s) per model code</ULabel>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              {codes.length} code{codes.length === 1 ? '' : 's'} · {totalYears} year{totalYears === 1 ? '' : 's'} selected
            </span>
          </div>

          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {codes.map((code, ix) => {
              const entry = MODEL_CODES.find((m) => m.code === code)
              if (!entry) return null
              const sel = selectedYears(entry)
              // Union: nominal range ∪ actually-selected, so a stored out-of-range year shows.
              const universe = [...new Set([...modelYearsFor(code), ...sel])].sort((a, b) => +a - +b)
              const allChecked = universe.length > 0 && universe.every((y) => sel.includes(y))
              const none = sel.length === 0
              return (
                <div
                  key={code}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '186px minmax(0,1fr)',
                    alignItems: 'stretch',
                    borderTop: ix === 0 ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      background: 'var(--surface-sunken)',
                      borderRight: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span className="ism-mono" style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 600 }}>{code}</span>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => removeRow(code)}
                          aria-label={`Remove model code ${code}`}
                          style={{ border: 'none', background: 'none', padding: 2, color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex' }}
                        >
                          <Icon icon={Trash2} size={13} />
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-secondary)' }}>{entry.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>MY{entry.range}</div>
                  </div>

                  <div style={{ padding: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
                      <Button variant="ghost" size="sm" disabled={disabled} onClick={() => toggleAllYears(entry, universe)}>
                        {allChecked ? 'Clear all' : 'Select all'}
                      </Button>
                      {universe.map((y) => (
                        <Checkbox
                          key={y}
                          checked={sel.includes(y)}
                          disabled={disabled}
                          onChange={() => toggleYear(entry, y)}
                          label={<span style={{ fontSize: 12.5 }}>{y}</span>}
                        />
                      ))}
                    </div>
                    {none && (
                      <div role="status" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--fs-caption)', color: 'var(--warning-600)' }}>
                        No model year selected for {code}.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
