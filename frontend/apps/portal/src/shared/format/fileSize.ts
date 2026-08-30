/**
 * Human-readable byte formatting.
 *
 * Ported from `shared/format/file-size.ts` in the Vue app, whose own header
 * records why it was extracted there: the same three-branch B/KB/MB logic had
 * been copied into three components, and "three copies of a formatter that must
 * agree is a drift risk for no benefit" — the same file's size is shown in a
 * form, in an evidence list, and in an append-only audit entry.
 *
 * This app had ONE copy, inside `SourceFieldAttachments.tsx`, whose comment said
 * plainly: "Vue reads this from a `shared/format/file-size` module, which this
 * app has no equivalent of yet… 21's formatting module is the right home."
 * That module now exists, so the local copy is gone and this is it.
 *
 * ⚠️ THE KB BRANCH ROUNDS; IT DOES NOT SHOW A DECIMAL — and that is this app's
 * existing behaviour, kept deliberately. Vue renders `1.5 KB`; this renders
 * `2 KB`. Adopting Vue's `toFixed(1)` would have changed what every attachment
 * row on screen says, which is a visible change nobody asked for in a pass about
 * removing a duplicate. MB keeps one decimal in both apps.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
