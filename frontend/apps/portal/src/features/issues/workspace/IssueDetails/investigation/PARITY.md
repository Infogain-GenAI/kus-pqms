# investigation/ — Vue ↔ React parity

Component-by-component comparison against
`components/IssueManagement/IssueDetails/investigation/` in the Vue app
(`C:\workspace\kus-pqms\frontend\apps\pqms-portal`). Vue has 24 `.vue` files;
React has 11 components. **Fewer files is not less behaviour** — the table says
which, for each one.

Reviewed 2026-08-31. If you add a Vue component, add a row.

## Ported

| Vue | React | Note |
| --- | --- | --- |
| `AddActivityForm` | `AddActivityForm.tsx` | Type-conditional field set, submit-time validation. |
| `InvestigationActivities` | `InvestigationActivities.tsx` | |
| `FindingCard` | `FindingCard.tsx` | |
| `FindingChangeRequestPanel` | `ChangeRequestPanel.tsx` | |
| `RequestActivityUpdateModal` | `ChangeRequestModals.tsx` → `RequestUpdateModal` | |
| `RejectUpdateRequestModal` | `ChangeRequestModals.tsx` → `RejectRequestModal` | Two modals in one file; they share a shape and are never used apart. |
| `PartRequestsSection` | `PartRequestsSection.tsx` | |
| `PartRequestForm` | `PartRequestsSection.tsx` | Inlined — the form has one consumer and no independent state. |
| `PartRequestHistory` | `PartRequestsSection.tsx` + `PartRequestHistory.module.css` | Same. |
| `AttachmentsDropzone` | `AttachmentsDropzone.tsx` | |
| `ActivityTypeBadge` | `primitives.tsx` → `ActivityTypeBadge` | |
| `InvestigationFieldLabel` | `primitives.tsx` → `FieldLabel` | |
| `InvestigationSectionHeader` | `tabs/InvestigationTab/InvestigationTab.tsx` | The header is full-width above the workstream split, so it lives with the thing that owns the split. |
| **`MultiRowDraftModal`** | **`MultiRowDraftModal.tsx`** | **Added 2026-08-31.** |
| **`AddPartsManuallyModal`** | **`AddPartsManuallyModal.tsx`** | **Added 2026-08-31.** |
| **`AddTeamMemberModal`** | **`AddTeamMemberModal.tsx`** | **Added 2026-08-31.** |

## Collapsed into `ValuePicker`

Vue has a behavioural core (`SearchablePicker`) plus a thin wrapper per field,
which is reasonable there because each wrapper also carries its own i18n file.
Here the differences reduce to props.

| Vue | Covered by | Note |
| --- | --- | --- |
| `SearchablePicker` | `ValuePicker.tsx` | The core: multi-select, chips, in-panel add trigger. |
| `PartsPicker` | `ValuePicker` + `AddPartsManuallyModal` | `mono`, `qty` in the option meta, `manual` badge. |
| `TeamMembersPicker` | `ValuePicker` + `AddTeamMemberModal` | `role · company` as the option detail. |
| `DealerCodePicker` | `ValuePicker` | Single-valued: `onChange` keeps the last pick. Searchable by code **or name**, which the placeholder promises. |
| `VinsPicker` | `ValuePicker` | See the divergence below. |

## Not ported, with the reason

| Vue | Why not |
| --- | --- |
| `InvestigationModalHeader` | Presentational only — a title/subtitle block. `Modal`'s own `title` slot takes a node, so every modal here passes the same two lines directly. A component for it would be indirection with no behaviour. |
| `EvidenceList` | Its behaviour is the staged-attachment list, which `AttachmentsDropzone` already renders — add, name, size, remove. Vue splits them because `EvidenceList` is also mounted by `FindingCard` for **recorded** evidence; React's `FindingCard` renders that inline from `activity.attachments`. Worth extracting if a third consumer appears. |
| `RequestNewActivityTypeModal` | **A real gap, still open.** See below. |

## Known divergences

**`VinsPicker` — React is MORE permissive than Vue, deliberately.**
Vue's file is explicit that it *replaced* a comma-separated text input because
"free text let a user invent a VIN the Issue does not cover", and it offers no
manual path at all. React keeps one, because `vinOptionsFor()` returns an empty
list — this app's seed has no VIN data, and fabricating plausible VINs would put
invented vehicles on real findings. So the manual path is the only way to enter
a VIN here.

⚠️ **When real VIN data arrives, revisit this.** The right end state is probably
Vue's: options from the issue's own vehicles, and no free text.

**`RequestNewActivityTypeModal` — not ported, and the control is dead.**
`AddActivityForm` renders "Can't find the required Activity? **Request New**",
and the button is permanently `disabled` because `onRequestNewType` is never
passed by `InvestigationActivities`. A rendered control that can never be
pressed is worse than an absent one.

The app already has the right model for this — `classification/RequestNewSystemModal`
plus `store.requestClassification()`, which adds the node immediately with
`pendingApproval: true` so the requester can select what they just asked for.
Porting this is that pattern applied to activity types, and it needs
`ACTIVITY_TYPES` to become store state rather than a module constant.

## What the three new modals changed

Before, "Add parts manually" and "Add a team member" opened `ValuePicker`'s
**inline single-value input**: one string, into the current field, forgotten
afterwards. That lost two things.

1. **The other columns.** A part has a quantity and a member has a role and a
   company — both rendered in the picker for catalogued rows, both blank for
   anything typed in.
2. **Reuse.** A value entered inline was used by that activity and no other. Rows
   submitted through the modals join the session directory (`store.partOptions()`
   / `store.teamDirectory()`), are badged `manual`, and become options for every
   later activity.

The directories are **session-scoped and not persisted**. A manually added part
records that this activity cites something the catalogue does not carry; making
it permanent master data is a different feature with an approval flow behind it,
which is what "Request new" is for.
