import { MultiRowDraftModal, type MultiRowColumn, type MultiRowDraft } from './MultiRowDraftModal'

/**
 * "Add parts manually" — a thin copy-supplying wrapper over
 * `MultiRowDraftModal`. Ported from `AddPartsManuallyModal.vue`, which is the
 * same shape: all mechanics live in the primitive, this file owns only the
 * columns and the strings.
 *
 * ⚠️ IF YOU ARE ABOUT TO ADD LOGIC HERE, ADD IT TO THE PRIMITIVE. The Vue
 * original says the same on its sibling, and it is the whole reason there are
 * two wrappers rather than two modals.
 *
 * ─── WHY A QUANTITY COLUMN ───────────────────────────────────────────────────
 *
 * Because a part cited on a finding is cited in some number, and the picker
 * already renders `qty` as an option's meta line. Capturing the part number
 * alone — which is all `ValuePicker`'s inline manual entry could do — produced a
 * directory row with a blank quantity beside every catalogued row that had one.
 */

export interface ManualPartDraftRow {
  partNo: string
  qty: string
}

const COLUMNS: MultiRowColumn[] = [
  { key: 'partNo', label: 'Part number', placeholder: 'e.g. 0K2A1-58-810', width: '2fr' },
  { key: 'qty', label: 'Qty', placeholder: '1', width: '1fr' },
]

const makeRow = (): MultiRowDraft => ({ partNo: '', qty: '' })

export function AddPartsManuallyModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (rows: ManualPartDraftRow[]) => void
}) {
  return (
    <MultiRowDraftModal
      open={open}
      title="Add parts manually"
      subtitle="For parts not in the eligible list. They become selectable for this issue's activities."
      columns={COLUMNS}
      makeRow={makeRow}
      addMoreLabel="Add another part"
      submitLabel="Add parts"
      counterLabel="%n part row(s)"
      emptyGuardTitle="Nothing to add"
      emptyGuardBody="Add at least one part row before submitting."
      incompleteGuardTitle="Some rows are incomplete"
      incompleteGuardBody="Every part needs both a part number and a quantity."
      removeRowLabel="Remove part row"
      onClose={onClose}
      // The primitive's loose rows mapped back to this modal's typed shape.
      onSubmit={(rows) => onSubmit(rows.map((r) => ({ partNo: r.partNo ?? '', qty: r.qty ?? '' })))}
    />
  )
}
