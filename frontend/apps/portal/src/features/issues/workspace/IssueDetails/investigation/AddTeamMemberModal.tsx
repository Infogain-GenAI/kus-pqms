import { MultiRowDraftModal, type MultiRowColumn, type MultiRowDraft } from './MultiRowDraftModal'

/**
 * "Add team member" — the second consumer of `MultiRowDraftModal`. Ported from
 * `AddTeamMemberModal.vue`: identical mechanics to the parts modal, three
 * columns instead of two.
 *
 * ⚠️ IF YOU ARE ABOUT TO ADD LOGIC HERE, ADD IT TO THE PRIMITIVE.
 *
 * ─── ROLE AND COMPANY ARE NOT OPTIONAL EXTRAS ────────────────────────────────
 *
 * The members picker renders `role · company` as each option's detail line, and
 * a team on an investigation routinely includes people from a supplier as well
 * as from Kia. A name on its own — all `ValuePicker`'s inline manual entry could
 * capture — puts an unattributed person next to fully attributed colleagues, on
 * a record whose whole purpose is evidence.
 */

export interface TeamMemberDraftRow {
  name: string
  role: string
  company: string
}

const COLUMNS: MultiRowColumn[] = [
  { key: 'name', label: 'Name', placeholder: 'Full name' },
  { key: 'role', label: 'Role', placeholder: 'e.g. SE, TE, DE' },
  { key: 'company', label: 'Company', placeholder: 'e.g. Kia, Mando' },
]

const makeRow = (): MultiRowDraft => ({ name: '', role: '', company: '' })

export function AddTeamMemberModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (rows: TeamMemberDraftRow[]) => void
}) {
  return (
    <MultiRowDraftModal
      open={open}
      title="Add team member"
      subtitle="For people not in the directory. They become selectable for this issue's activities."
      columns={COLUMNS}
      makeRow={makeRow}
      addMoreLabel="Add another member"
      submitLabel="Add members"
      counterLabel="%n member row(s)"
      emptyGuardTitle="Nothing to add"
      emptyGuardBody="Add at least one member row before submitting."
      incompleteGuardTitle="Some rows are incomplete"
      incompleteGuardBody="Every member needs a name, a role and a company."
      removeRowLabel="Remove member row"
      onClose={onClose}
      onSubmit={(rows) =>
        onSubmit(rows.map((r) => ({ name: r.name ?? '', role: r.role ?? '', company: r.company ?? '' })))
      }
    />
  )
}
