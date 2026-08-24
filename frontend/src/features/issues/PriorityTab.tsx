import { useMemo, useState } from 'react'
import { Gauge, RotateCcw, Save, X } from 'lucide-react'
import { Icon } from '@/icons/Icon'
import { Button } from '@/components'
import { CardHead, SectionCard, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import {
  PRIORITY_BANDS,
  PRIORITY_INFO,
  PRIORITY_SCORE_CAP,
  PRI_MATRIX,
  priorityLetter,
  priorityTotal,
  type PriorityLetter,
} from '@/data/priorityMatrix'

/**
 * Issue Priority — the manual scoring matrix added in the V4-V5 prototype.
 *
 * Three categories of items; picking an option awards its points, re-picking the same
 * option clears it. The total maps to a calculated letter, which a user may override.
 * Nothing persists until Save, so the draft lives in local state and `dirty` drives both
 * the Save button and the "not yet saved" reminder — matching the prototype, where an
 * unsaved matrix still reads as unscored and therefore still blocks QIR creation.
 */

type Draft = { scores: Record<string, number>; selIdx: Record<string, number>; manualFinal: PriorityLetter | null }

export function PriorityTab({ issueId }: { issueId: string }) {
  const store = useStore()
  const { user, role } = useRole()
  const saved = store.priorityFor(issueId)

  // Re-seed the draft when the issue changes — a stale draft would leak one issue's
  // scoring onto another, which is the class of bug V4-V5's _resetPageState() fixes.
  const [draftById, setDraftById] = useState<Record<string, Draft>>({})
  const draft: Draft = draftById[issueId] ?? { scores: { ...saved.scores }, selIdx: { ...saved.selIdx }, manualFinal: saved.manualFinal }
  const setDraft = (next: Draft) => setDraftById((m) => ({ ...m, [issueId]: next }))

  const total = priorityTotal(draft.scores)
  const calc = priorityLetter(total)
  const finalLetter = draft.manualFinal ?? calc
  const isOverride = !!draft.manualFinal && draft.manualFinal !== calc
  const pct = Math.max(0, Math.min(100, (total / PRIORITY_SCORE_CAP) * 100))

  const dirty = useMemo(
    () =>
      JSON.stringify(draft.scores) !== JSON.stringify(saved.scores) ||
      (draft.manualFinal ?? null) !== (saved.manualFinal ?? null),
    [draft, saved],
  )
  // Saved-and-clean is the only state that reads as settled.
  const settled = saved.scored && !dirty

  const toggle = (itemKey: string, optIdx: number, pts: number) => {
    const scores = { ...draft.scores }
    const selIdx = { ...draft.selIdx }
    if (selIdx[itemKey] === optIdx) {
      delete scores[itemKey]
      delete selIdx[itemKey]
    } else {
      scores[itemKey] = pts
      selIdx[itemKey] = optIdx
    }
    setDraft({ ...draft, scores, selIdx })
  }

  const clearItem = (itemKey: string) => {
    const scores = { ...draft.scores }
    const selIdx = { ...draft.selIdx }
    delete scores[itemKey]
    delete selIdx[itemKey]
    setDraft({ ...draft, scores, selIdx })
  }

  const resetCategory = (sectionKey: string) => {
    const sec = PRI_MATRIX.find((x) => x.key === sectionKey)
    if (!sec) return
    const scores = { ...draft.scores }
    const selIdx = { ...draft.selIdx }
    for (const it of sec.items) {
      delete scores[it.key]
      delete selIdx[it.key]
    }
    setDraft({ ...draft, scores, selIdx })
  }

  const cancel = () => setDraft({ scores: { ...saved.scores }, selIdx: { ...saved.selIdx }, manualFinal: saved.manualFinal })
  const save = () => {
    store.savePriority(issueId, draft.scores, draft.selIdx, draft.manualFinal, { name: user.name, role })
    setDraftById((m) => {
      const next = { ...m }
      delete next[issueId]
      return next
    })
  }

  const band = PRIORITY_BANDS[finalLetter]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 336px', gap: 'var(--space-5)', alignItems: 'start' }}>
      {/* ---- matrix ---- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {PRI_MATRIX.map((sec) => (
          <SectionCard key={sec.key}>
            <CardHead
              icon={Gauge}
              title={sec.title}
              right={
                <Button variant="ghost" size="sm" onClick={() => resetCategory(sec.key)}>
                  Reset category
                </Button>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
              {sec.items.map((it) => {
                const hasSel = draft.selIdx[it.key] != null
                return (
                  <div key={it.key}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <ULabel>{it.label}</ULabel>
                      {hasSel && (
                        <button
                          type="button"
                          onClick={() => clearItem(it.key)}
                          aria-label={`Clear ${it.label}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            border: 'none',
                            background: 'none',
                            padding: 0,
                            fontSize: 11.5,
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon icon={X} size={12} /> Clear
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {it.options.map((op, opIdx) => {
                        const sel = draft.selIdx[it.key] === opIdx
                        return (
                          <button
                            key={`${it.key}_${opIdx}`}
                            type="button"
                            aria-pressed={sel}
                            onClick={() => toggle(it.key, opIdx, op.pts)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 13px',
                              borderRadius: 9,
                              cursor: 'pointer',
                              fontFamily: 'var(--font-body)',
                              fontSize: 12.5,
                              fontWeight: 600,
                              border: `1.5px solid ${sel ? 'var(--accent-600)' : '#DDE3E9'}`,
                              background: sel ? 'var(--accent-50)' : 'var(--surface-card)',
                              color: sel ? 'var(--accent-700)' : 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {op.label}
                            <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>+{op.pts} pts</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        ))}
      </div>

      {/* ---- score + final priority rail ---- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 0 }}>
        <SectionCard>
          <CardHead icon={Gauge} title="Priority score" />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 44,
                height: 44,
                padding: '0 var(--space-3)',
                borderRadius: 11,
                background: band.tint,
                color: band.color,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 19,
                border: `1px solid ${band.color}33`,
                flex: 'none',
              }}
            >
              {finalLetter}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {settled ? 'Score' : 'Current score'}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>
                {total}
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}> / {PRIORITY_SCORE_CAP} pts</span>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', height: 6, borderRadius: 99, background: 'var(--neutral-100)', margin: '14px 0 6px' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, borderRadius: 99, background: band.color }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {settled ? 'Issue Priority' : 'Calculated priority'}: <strong>Priority {calc}</strong> · {band.band}
          </div>

          {!settled && (
            <div
              role="status"
              style={{
                marginTop: 12,
                padding: '9px 11px',
                borderRadius: 8,
                background: 'var(--warning-50)',
                color: 'var(--warning-600)',
                fontSize: 12.5,
              }}
            >
              {saved.scored
                ? 'Unsaved changes — save to update this issue’s priority.'
                : 'Not scored yet. Save the matrix to set this issue’s priority and enable QIR creation.'}
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <CardHead
            icon={Gauge}
            title="Final priority"
            subtitle={isOverride ? `Manual override · calculated was ${calc}` : 'Calculated from the score'}
            right={
              isOverride ? (
                <Button variant="ghost" size="sm" iconLeft={<Icon icon={RotateCcw} size={13} />} onClick={() => setDraft({ ...draft, manualFinal: null })}>
                  Reset
                </Button>
              ) : undefined
            }
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {(['A', 'B', 'C'] as PriorityLetter[]).map((l) => {
              const on = finalLetter === l
              return (
                <button
                  key={l}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setDraft({ ...draft, manualFinal: l })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    height: 38,
                    padding: '0 15px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1.5px solid ${on ? PRIORITY_BANDS[l].color : '#DDE3E9'}`,
                    background: on ? PRIORITY_BANDS[l].tint : 'var(--surface-card)',
                    color: on ? PRIORITY_BANDS[l].color : 'var(--text-primary)',
                  }}
                >
                  Priority {l}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Button variant="primary" iconLeft={<Icon icon={Save} size={14} />} onClick={save} disabled={!dirty}>
              Save priority
            </Button>
            <Button variant="secondary" onClick={cancel} disabled={!dirty}>
              Cancel
            </Button>
          </div>
        </SectionCard>

        <SectionCard>
          <CardHead icon={Gauge} title="Rating bands" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {PRIORITY_INFO.map((r) => (
              <div key={r.letter} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: PRIORITY_BANDS[r.letter].tint,
                    color: PRIORITY_BANDS[r.letter].color,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 14,
                    flex: 'none',
                  }}
                >
                  {r.letter}
                </span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Score {r.score}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
