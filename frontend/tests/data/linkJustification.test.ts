// The link/unlink justification rule.
//
// One module now backs four surfaces (Issue Entry, Manage Links, the edit form,
// the issue-list modal), so a change here moves all of them — which is the point,
// and the reason it is worth pinning at the boundaries rather than in the middle.
//
// Every number is the canonical prototype's: `>= 20` on the trimmed text, a 500
// cap applied on input, and the error sentence verbatim from `mrApplyUnlink`.
import { describe, it, expect } from 'vitest'
import {
  JUSTIFICATION_MAX,
  JUSTIFICATION_MIN,
  clampJustification,
  isJustificationValid,
  justificationCounterCompact,
  justificationCounterVerbose,
  justificationError,
  justificationLength,
} from '@/data/linkJustification'

const chars = (n: number) => 'x'.repeat(n)

describe('the specified values, pinned as literals', () => {
  /*
   * ⚠️ THE ONLY PLACE A LITERAL BELONGS, AND IT WAS MISSING.
   *
   * Every other assertion in this file and in the UI gate suite derives its
   * fixtures FROM these constants — `chars(JUSTIFICATION_MIN - 1)` and so on. So
   * they prove the code enforces WHATEVER the constants say, and nothing proved
   * the constants say what the design says.
   *
   * Found by mutation: changing the floor from 20 to 1 left all 11 UI gate tests
   * and every test below GREEN. A governance control whose entire specification
   * is "at least 20 characters" was free to become "at least 1" silently.
   *
   * 20 and 500 are the canonical prototype's own numbers — `mrApplyUnlink` tests
   * `text.length < 20` and `mrUnlinkText` applies `.slice(0, 500)`. Changing
   * either is a change to the specification, and should have to edit this line.
   */
  it('floor is 20 and cap is 500, per the prototype', () => {
    expect(JUSTIFICATION_MIN).toBe(20)
    expect(JUSTIFICATION_MAX).toBe(500)
  })
})

describe('the governance floor', () => {
  it('rejects one character below the threshold and accepts it exactly', () => {
    // Asserted AT the boundary in both directions. A test at 5 and 50 passes for
    // any threshold between them and pins nothing.
    expect(isJustificationValid(chars(JUSTIFICATION_MIN - 1))).toBe(false)
    expect(isJustificationValid(chars(JUSTIFICATION_MIN))).toBe(true)
  })

  it('rejects an empty string', () => {
    // The residual hole the required parameter cannot close on its own: nothing
    // in the type system stops a caller passing ''. Every UI surface asks this
    // function first, so this is the assertion that keeps that meaningful.
    expect(isJustificationValid('')).toBe(false)
  })

  it('WHITESPACE CANNOT BUY THE THRESHOLD', () => {
    // 20 spaces is not a reason. The cap counts what you typed; the floor counts
    // what you actually said — see the module's note on why those differ.
    expect(isJustificationValid(' '.repeat(JUSTIFICATION_MIN + 5))).toBe(false)
    expect(justificationLength('   hello   ')).toBe(5)
  })
})

describe('the error sentence', () => {
  it('is null exactly when the text is valid', () => {
    expect(justificationError(chars(JUSTIFICATION_MIN))).toBeNull()
    expect(justificationError(chars(JUSTIFICATION_MIN - 1))).not.toBeNull()
  })

  it('reports the TRIMMED count, so padding does not inflate the number', () => {
    // A box holding only spaces must read "0 entered". Reporting the raw length
    // there would tell the user they had typed 25 characters while refusing them.
    const padded = ' '.repeat(25)
    expect(justificationError(padded)).toContain('0 entered')
    expect(justificationError('  abc  ')).toContain('3 entered')
  })

  it('names the threshold from the constant, not a second copy of the number', () => {
    expect(justificationError('')).toBe(
      `Enter a justification of at least ${JUSTIFICATION_MIN} characters. 0 entered.`,
    )
  })
})

describe('the storage cap', () => {
  it('truncates on input at the maximum', () => {
    expect(clampJustification(chars(JUSTIFICATION_MAX + 50))).toHaveLength(JUSTIFICATION_MAX)
  })

  it('leaves anything shorter untouched', () => {
    expect(clampJustification('short')).toBe('short')
  })
})

describe('the two counter formats are deliberately different', () => {
  // Issue Entry renders `20/500`; the workspace renders `20 / 500 characters`.
  // The design's own divergence, and the concrete reason the RULE is shared while
  // the presentation is not. Pinned so neither gets tidied into the other.
  it('renders each surface own wording', () => {
    expect(justificationCounterCompact(chars(20))).toBe(`20/${JUSTIFICATION_MAX}`)
    expect(justificationCounterVerbose(chars(20))).toBe(`20 / ${JUSTIFICATION_MAX} characters`)
  })

  it('really are distinct strings for the same input', () => {
    // Guards the pair against being collapsed to one implementation, which would
    // silently change one screen's copy.
    expect(justificationCounterCompact(chars(7))).not.toBe(justificationCounterVerbose(chars(7)))
  })

  it('counts the RAW length, unlike the floor', () => {
    // The counter tracks the cap, so it counts every character typed.
    expect(justificationCounterCompact('   ')).toBe(`3/${JUSTIFICATION_MAX}`)
  })
})
