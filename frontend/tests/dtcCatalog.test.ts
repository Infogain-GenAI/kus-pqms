import { describe, it, expect } from 'vitest'
import { DTC_CATALOG, dtcEntry, dtcSuggestions } from '@/data/dtcCatalog'
import { dtcCategory } from '@/data/dtcCategory'
import { resolveSourceChannels } from '@/data/sourceChannels'
import type { Issue } from '@/data/types'

/**
 * The DTC catalogue and the sourceless-issue path.
 *
 * Both were verified by hand in a browser when they landed and by nothing since.
 * These pin the parts where a regression is silent — a suggestion list that
 * quietly stops matching descriptions looks identical to one with no matches,
 * and a sourceless issue that stops degrading cleanly is a crash.
 */

describe('dtcSuggestions searches code OR description', () => {
  it('matches on description — the capability the old implementation lacked', () => {
    // The whole reason the catalogue exists. Suggesting from codes already on
    // issues could never do this, because it held no descriptions.
    const hits = dtcSuggestions('misfire')
    expect(hits.map((d) => d.code)).toEqual(['P0301', 'P0302'])
    expect(hits[0].description).toContain('Misfire')
  })

  it('matches on code, case-insensitively', () => {
    expect(dtcSuggestions('u01').map((d) => d.code)).toEqual(['U0100', 'U0155'])
  })

  it('returns nothing for an empty term rather than the whole catalogue', () => {
    // Both references behave this way: the field is for entering a code you
    // already have, and opening a list unprompted would suggest otherwise.
    expect(dtcSuggestions('')).toEqual([])
    expect(dtcSuggestions('   ')).toEqual([])
  })

  it('excludes codes already committed as chips', () => {
    const all = dtcSuggestions('misfire').map((d) => d.code)
    expect(all).toContain('P0301')
    expect(dtcSuggestions('misfire', ['P0301']).map((d) => d.code)).toEqual(['P0302'])
  })

  it('excludes case-insensitively, so a hand-typed lowercase chip still filters', () => {
    // Chips are upper-cased on commit, but the exclude list is caller-supplied;
    // matching case-sensitively would silently re-offer a code already added.
    expect(dtcSuggestions('misfire', ['p0301']).map((d) => d.code)).toEqual(['P0302'])
  })

  it('caps the list', () => {
    // "0" appears in most codes — without a cap this returns most of the
    // catalogue and the panel outgrows its max-height.
    expect(dtcSuggestions('0').length).toBeLessThanOrEqual(6)
    expect(dtcSuggestions('0', [], 2)).toHaveLength(2)
  })
})

describe('dtcEntry: a code outside the catalogue is legitimate, not an error', () => {
  it('finds a catalogue code regardless of case or padding', () => {
    expect(dtcEntry(' p0420 ')?.description).toBe('Catalyst System Efficiency Below Threshold')
  })

  it('returns undefined for an unknown code', () => {
    // A technician may enter a real code this fixture does not carry. The form
    // must accept it, which is why the chip falls back to first-character
    // inference rather than refusing the value.
    expect(dtcEntry('P9999')).toBeUndefined()
    expect(dtcCategory('P9999')).toBe('P')
  })
})

describe('the catalogue is internally consistent', () => {
  it("every entry's declared category matches its own first character", () => {
    // Not a tautology: the category is DATA here, so an entry could disagree
    // with its code. If one ever does, the chip's colour and its label would
    // come from different sources and drift.
    for (const d of DTC_CATALOG) {
      expect(dtcCategory(d.code), `${d.code} declares ${d.category}`).toBe(d.category)
    }
  })
})

describe('an issue with no source degrades rather than throwing', () => {
  // Issue Entry no longer captures a source, so this is the NORMAL shape of a
  // newly-registered issue — not an edge case.
  const sourceless = { id: 'EE-260999' } as unknown as Issue

  it('resolves to zero channels', () => {
    expect(resolveSourceChannels(sourceless)).toEqual([])
  })

  it('still resolves channels when a source IS present', () => {
    expect(resolveSourceChannels({ id: 'X', source: 'warranty' } as unknown as Issue)).toHaveLength(1)
  })

  it('prefers the multi-channel list when both are present', () => {
    const both = { id: 'X', source: 'warranty', sources: ['warranty', 'techline'] } as unknown as Issue
    expect(resolveSourceChannels(both)).toHaveLength(2)
  })
})
