// Tests for the Investigation domain helpers.
//
// These four functions decide what the Add-activity form RENDERS and what the
// change-request modal CALLS things. Both are open-ended by design — a user can
// request a new activity type — so the behaviour worth pinning is the fallback
// path as much as the mapped one: an unmapped type must render a usable form,
// not an empty one.
import { describe, it, expect } from 'vitest'
import {
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_FORM_FALLBACK,
  CHANGE_REQUEST_FIELDS,
  activityTint,
  activityTypeForm,
  changeRequestControl,
  changeRequestFieldLabel,
  typeHasField,
} from '@/data/investigation'

describe('activityTint', () => {
  it('returns the evidenced tint for a mapped type', () => {
    expect(activityTint('PQ Evaluation')).toBe('blue')
    expect(activityTint('Joint Investigation')).toBe('purple')
    expect(activityTint('Dealer Investigation')).toBe('teal')
  })

  // The map cannot be total — a requested type will occur in production — so
  // the fallback is what stops an unknown type rendering unstyled.
  it('falls back to neutral for any unmapped type', () => {
    expect(activityTint('Field Inspection')).toBe('neutral')
    expect(activityTint('Something Approved Next Quarter')).toBe('neutral')
  })
})

describe('activityTypeForm', () => {
  it('gives PQ Evaluation its evaluation-type and parts fields', () => {
    const form = activityTypeForm('PQ Evaluation')
    expect(form.fields).toEqual(['evaluationType', 'parts'])
    expect(form.detailsLabel).toBe('Evaluation details')
  })

  it('gives the two investigations their own field sets and a shared label', () => {
    expect(activityTypeForm('Dealer Investigation').fields).toEqual(['vins', 'dealerCode'])
    expect(activityTypeForm('Joint Investigation').fields).toEqual(['members'])
    expect(activityTypeForm('Dealer Investigation').detailsLabel).toBe('Investigation details')
    expect(activityTypeForm('Joint Investigation').detailsLabel).toBe('Investigation details')
  })

  // An unmapped type must still produce a form someone can complete: details
  // and attachments are the only elements every captured type shares, so they
  // are the only safe default. Conditional fields would be a guess.
  it('falls back to no conditional fields, but a usable details field', () => {
    const form = activityTypeForm('Bench Test')
    expect(form.fields).toEqual([])
    expect(form.detailsLabel).toBe(ACTIVITY_TYPE_FORM_FALLBACK.detailsLabel)
    expect(form.detailsPlaceholder).toBeTruthy()
  })
})

describe('typeHasField', () => {
  it('is true only for a field the type actually renders', () => {
    expect(typeHasField('PQ Evaluation', 'parts')).toBe(true)
    expect(typeHasField('PQ Evaluation', 'vins')).toBe(false)
    expect(typeHasField('Dealer Investigation', 'dealerCode')).toBe(true)
    expect(typeHasField('Note', 'members')).toBe(false)
  })
})

describe('changeRequestFieldLabel', () => {
  // The whole point: `details` is not a constant. The guard copy interpolates
  // this name into "you've already raised a request to update the {field}", so
  // if it said "Details" while the select said "Evaluation Details", the guard
  // would name a field the user never saw.
  it('resolves `details` against the activity type', () => {
    expect(changeRequestFieldLabel('details', 'PQ Evaluation')).toBe('Evaluation Details')
    expect(changeRequestFieldLabel('details', 'Dealer Investigation')).toBe('Investigation Details')
    expect(changeRequestFieldLabel('details', 'Note')).toBe('Details')
  })

  it('leaves the static fields alone whatever the type', () => {
    expect(changeRequestFieldLabel('activityDate', 'PQ Evaluation')).toBe('Change Activity Date')
    expect(changeRequestFieldLabel('partNumber', 'Joint Investigation')).toBe('Part Number')
  })
})

describe('changeRequestControl', () => {
  // Three genuinely different controls, not one textarea with variants — a date
  // typed as free text is a date nothing can validate.
  it('types the proposed-change control to the field', () => {
    expect(changeRequestControl('details')).toBe('textarea')
    expect(changeRequestControl('activityDate')).toBe('date')
    expect(changeRequestControl('partNumber')).toBe('parts')
  })
})

describe('the vocabularies', () => {
  it('keeps this app’s five original types selectable alongside the three ported ones', () => {
    for (const t of ['Field Inspection', 'Bench Test', 'Data Analysis', 'Supplier Review', 'Note']) {
      expect(ACTIVITY_TYPES).toContain(t)
    }
    for (const t of ['PQ Evaluation', 'Dealer Investigation', 'Joint Investigation']) {
      expect(ACTIVITY_TYPES).toContain(t)
    }
  })

  it('offers exactly the three correctable fields', () => {
    expect([...CHANGE_REQUEST_FIELDS]).toEqual(['details', 'activityDate', 'partNumber'])
  })
})
