// Tests for the rich-text editor.
//
// WHAT THESE PIN, and why it needed a real editor to be true: pressing Bold must
// produce BOLD TEXT, not the characters `**`. Two earlier versions of this
// composer failed that — one had a decorative toolbar wired to nothing, the next
// wrapped the selection in markdown that never rendered. Both looked correct in
// a screenshot.
//
// So the assertions are on the DOCUMENT TipTap emits (`<strong>`, `<ol>`, `<ul>`),
// not on the input string, because the document is the thing the user sees and
// the thing that gets stored.
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MarkdownEditor } from '@pqms/ui-library/markdown-editor'

/** Renders with a controlled value that actually updates, as the composer does. */
function setup(initial = '', opts: { disabled?: boolean } = {}) {
  const onChange = vi.fn()
  const utils = render(
    <MarkdownEditor value={initial} onChange={onChange} placeholder="Write…" aria-label="Comment" {...opts} />,
  )
  const surface = () => document.querySelector('.ProseMirror') as HTMLElement
  const tool = (name: RegExp) => screen.getByRole('button', { name })
  return { onChange, surface, tool, ...utils }
}

/**
 * Selects the whole document through ProseMirror's OWN keymap.
 *
 * Setting a DOM Range directly does not work: ProseMirror keeps its selection in
 * editor state, not in the DOM, and only reads the DOM selection on events it
 * handles. Ctrl+A hits its base keymap's selectAll, which is both the real user
 * gesture and the only way to get a non-empty selection a mark can apply to.
 *
 * (Block commands like toggleOrderedList work without this — they act on the
 * caret's own block. Marks need a range, which is why only these tests need it.)
 */
function selectAll(el: HTMLElement) {
  fireEvent.keyDown(el, { key: 'a', ctrlKey: true })
}

describe('the toolbar exists as real controls', () => {
  it('renders every formatting action as a button, not decoration', async () => {
    const { tool } = setup()
    await waitFor(() => expect(document.querySelector('.ProseMirror')).toBeTruthy())
    for (const name of [/^Bold$/, /^Italic$/, /^Bullet list$/, /^Numbered list$/, /^Quote$/]) {
      expect(tool(name).tagName).toBe('BUTTON')
    }
  })

  it('exposes the editing surface to assistive tech', async () => {
    setup()
    await waitFor(() => expect(document.querySelector('.ProseMirror')).toBeTruthy())
    const surface = document.querySelector('.ProseMirror')!
    expect(surface.getAttribute('role')).toBe('textbox')
    expect(surface.getAttribute('aria-multiline')).toBe('true')
    expect(surface.getAttribute('aria-label')).toBe('Comment')
  })

  it('disables every action when the editor is disabled', async () => {
    const { tool } = setup('<p>text</p>', { disabled: true })
    await waitFor(() => expect(document.querySelector('.ProseMirror')).toBeTruthy())
    expect(tool(/^Bold$/).hasAttribute('disabled')).toBe(true)
    expect(tool(/^Numbered list$/).hasAttribute('disabled')).toBe(true)
  })
})

describe('formatting produces real formatting', () => {
  it('Bold emits <strong>, not asterisks', async () => {
    const { onChange, surface, tool } = setup('<p>hello</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    selectAll(surface())

    fireEvent.mouseDown(tool(/^Bold$/))

    await waitFor(() => {
      const html = onChange.mock.calls.at(-1)?.[0] ?? ''
      expect(html).toContain('<strong>')
      expect(html).not.toContain('**')
    })
  })

  it('Italic emits <em>', async () => {
    const { onChange, surface, tool } = setup('<p>hello</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    selectAll(surface())

    fireEvent.mouseDown(tool(/^Italic$/))

    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0] ?? '').toContain('<em>'))
  })

  it('Numbered list emits <ol>, and bullet list emits <ul>', async () => {
    const { onChange, surface, tool } = setup('<p>one</p>')
    await waitFor(() => expect(surface()).toBeTruthy())

    selectAll(surface())
    fireEvent.mouseDown(tool(/^Numbered list$/))
    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0] ?? '').toContain('<ol>'))

    selectAll(surface())
    fireEvent.mouseDown(tool(/^Bullet list$/))
    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0] ?? '').toContain('<ul>'))
  })

  it('the list is a real list node with items, not indented text', async () => {
    const { onChange, surface, tool } = setup('<p>one</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    selectAll(surface())
    fireEvent.mouseDown(tool(/^Numbered list$/))

    await waitFor(() => {
      const html = onChange.mock.calls.at(-1)?.[0] ?? ''
      expect(html).toContain('<li>')
    })
  })
})

describe('the toolbar reports the caret, not just the click', () => {
  // Without this a user cannot tell bold-on from bold-off without typing a
  // character to find out.
  it('marks Bold pressed once the selection is bold', async () => {
    const { surface, tool } = setup('<p>hello</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    expect(tool(/^Bold$/).getAttribute('aria-pressed')).toBe('false')

    selectAll(surface())
    fireEvent.mouseDown(tool(/^Bold$/))

    await waitFor(() => expect(tool(/^Bold$/).getAttribute('aria-pressed')).toBe('true'))
  })

  it('undo and redo carry no pressed state — they are not modes', async () => {
    const { tool } = setup('<p>x</p>')
    await waitFor(() => expect(document.querySelector('.ProseMirror')).toBeTruthy())
    expect(tool(/^Undo$/).getAttribute('aria-pressed')).toBeNull()
  })
})

describe('the security property', () => {
  // Safety here is SCHEMA-BASED: TipTap's schema constrains which nodes and
  // marks can exist at all, so unsafe markup cannot be represented — it is not
  // escaped after the fact. This proves the schema drops what is not in it.
  it('drops a script tag rather than storing or rendering it', async () => {
    const { surface } = setup('<p>safe</p><script>window.__pwned = 1</script>')
    await waitFor(() => expect(surface()).toBeTruthy())

    expect(surface().querySelector('script')).toBeNull()
    expect(surface().innerHTML).not.toContain('<script')
    expect((window as unknown as Record<string, unknown>).__pwned).toBeUndefined()
  })

  it('drops an inline event handler attribute', async () => {
    const { surface } = setup('<p onclick="window.__pwned = 1">text</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    expect(surface().innerHTML).not.toContain('onclick')
  })
})

describe('links', () => {
  const openPrompt = async (tool: (n: RegExp) => HTMLElement) => {
    fireEvent.mouseDown(tool(/^Insert link$/))
    return await screen.findByRole('textbox', { name: /link url/i })
  }

  it('offers a link action that opens a URL prompt', async () => {
    const { surface, tool } = setup('<p>docs</p>')
    await waitFor(() => expect(surface()).toBeTruthy())

    // The prompt is not there until asked for — a permanently open URL field
    // would take a third of a seven-control toolbar.
    expect(screen.queryByRole('textbox', { name: /link url/i })).toBeNull()
    const input = await openPrompt(tool)
    expect(input).toBeTruthy()
  })

  it('applies a link to the selection and emits an <a href>', async () => {
    const { onChange, surface, tool } = setup('<p>docs</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    selectAll(surface())

    const input = await openPrompt(tool)
    fireEvent.change(input, { target: { value: 'https://example.com/spec' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      const html = onChange.mock.calls.at(-1)?.[0] ?? ''
      expect(html).toContain('<a')
      expect(html).toContain('href="https://example.com/spec"')
    })
  })

  it('adds https to a bare domain rather than dropping the link', async () => {
    // A user types "example.com". Without a default protocol that is not a
    // valid URI and the link is silently discarded — the worst outcome, because
    // the text looks linked in the box and is not in the output.
    const { onChange, surface, tool } = setup('<p>docs</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    selectAll(surface())

    const input = await openPrompt(tool)
    fireEvent.change(input, { target: { value: 'example.com' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0] ?? '').toContain('href="https://example.com"'))
  })

  it('Escape closes the prompt without linking', async () => {
    const { onChange, surface, tool } = setup('<p>docs</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    selectAll(surface())

    const input = await openPrompt(tool)
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    await waitFor(() => expect(screen.queryByRole('textbox', { name: /link url/i })).toBeNull())
    expect(onChange.mock.calls.map((c) => c[0]).join('')).not.toContain('<a')
  })

  it('exposes Remove link only once the caret is in a link', async () => {
    const { surface, tool } = setup('<p>docs</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    expect(screen.queryByRole('button', { name: /^Remove link$/ })).toBeNull()

    selectAll(surface())
    const input = await openPrompt(tool)
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => expect(screen.getByRole('button', { name: /^Remove link$/ })).toBeTruthy())
  })

  // The security case. A link is the ONLY mark in this schema that carries a
  // URL, so it is the only one that can carry an attack.
  it('refuses a javascript: URL — the schema will not represent it', async () => {
    const { onChange, surface, tool } = setup('<p>docs</p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    selectAll(surface())

    const input = await openPrompt(tool)
    fireEvent.change(input, { target: { value: 'javascript:alert(1)' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => expect(screen.queryByRole('textbox', { name: /link url/i })).toBeNull())
    const all = onChange.mock.calls.map((c) => c[0]).join('')
    expect(all).not.toContain('javascript:')
    expect(surface().innerHTML).not.toContain('javascript:')
  })

  it('strips a javascript: href arriving in the initial value', async () => {
    const { surface } = setup('<p><a href="javascript:alert(1)">click</a></p>')
    await waitFor(() => expect(surface()).toBeTruthy())
    expect(surface().innerHTML).not.toContain('javascript:')
  })
})
