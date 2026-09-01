// Per-channel evidence field schemas.
//
// ─── WHY THESE, AND WHY NOT AS COVERAGE PADDING ──────────────────────────────
//
// `SOURCE_CHANNEL_FIELDS` is a map of channel → field-builder, and every builder
// was unexercised: nothing in the suite asked any channel for its schema, so the
// per-channel field lists, their required flags and their read-only flags were
// all unverified. That surfaced as uncovered functions, but the reason to test
// them is that each one encodes a documented contract nothing else checks.
//
// ⚠️ SO THESE ASSERT THE CONTRACTS, NOT THE EXECUTION. A coverage-motivated test
// is the most likely kind to call a function and assert nothing about it — which
// moves the number while proving nothing. Each assertion below would fail on a
// real defect: a channel losing its fields, a system-populated field becoming
// editable, a required field with no label, or a label restated instead of read
// from the shared registry.
import { describe, it, expect } from 'vitest'
import { SOURCE, SOURCE_KEYS } from '@pqms/ui-library'
import { SOURCE_CHANNEL_FIELDS, channelLabel } from '@/data/sourceChannels'

describe('every channel can describe its own evidence fields', () => {
  it('builds a non-empty schema for every channel in the vocabulary', () => {
    // The vocabulary is the domain fact (see `sourceVocabulary.test.ts`); this
    // pins that the field map covers ALL of it, so adding a channel key without
    // a schema fails here rather than rendering an empty evidence panel.
    for (const key of SOURCE_KEYS) {
      const build = SOURCE_CHANNEL_FIELDS[key]
      expect(build, `${key} has no field builder`).toBeTypeOf('function')
      const fields = build()
      expect(fields.length, `${key} built an empty schema`).toBeGreaterThan(0)
    }
  })

  it('gives every field a label — a blank one renders an unnamed input', () => {
    for (const key of SOURCE_KEYS) {
      for (const [i, f] of SOURCE_CHANNEL_FIELDS[key]().entries()) {
        expect(f.label.trim(), `${key} field ${i} has no label`).not.toBe('')
      }
    }
  })

  it('SYSTEM-POPULATED FIELDS ARE READ-ONLY AND NEVER REQUIRED', () => {
    /*
     * The module's own note: "The three system-populated fields — blank, never
     * fabricated." A read-only field the user cannot fill but which is marked
     * required would make its form permanently unsubmittable, and that is
     * invisible until someone tries to submit it.
     */
    let readOnlySeen = 0
    for (const key of SOURCE_KEYS) {
      for (const f of SOURCE_CHANNEL_FIELDS[key]()) {
        if (!f.readOnly) continue
        readOnlySeen++
        expect(f.required, `${key}/${f.label} is read-only AND required`).toBe(false)
        expect(f.value, `${key}/${f.label} ships a fabricated value`).toBe('')
      }
    }
    // Guards the loop against passing because no channel has read-only fields at
    // all — the assertion above would then be vacuous.
    expect(readOnlySeen, 'no read-only fields found; the loop proved nothing').toBeGreaterThan(0)
  })

  it('every select field offers options, or it cannot be answered', () => {
    let selectsSeen = 0
    for (const key of SOURCE_KEYS) {
      for (const f of SOURCE_CHANNEL_FIELDS[key]()) {
        if (f.type !== 'select') continue
        selectsSeen++
        expect(f.options?.length, `${key}/${f.label} is a select with no options`).toBeGreaterThan(0)
      }
    }
    expect(selectsSeen, 'no select fields found; the loop proved nothing').toBeGreaterThan(0)
  })
})

describe('channelLabel reads the registry rather than restating it', () => {
  it('matches SOURCE for every channel', () => {
    // The function's own contract: "read from the shared registry, never
    // restated." A second copy of these labels is how one drifts.
    for (const key of SOURCE_KEYS) {
      expect(channelLabel(key), `${key} label`).toBe(SOURCE[key].label)
    }
  })

  it('returns a non-empty label for every channel', () => {
    // Catches a registry entry added with a blank label, which the equality
    // above would happily accept ('' === '').
    for (const key of SOURCE_KEYS) {
      expect(channelLabel(key).trim(), `${key} label is blank`).not.toBe('')
    }
  })
})
