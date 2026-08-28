import { ClipboardList, Megaphone, Wrench, type LucideIcon } from 'lucide-react'

/**
 * Resolution workstreams — the segmented selector's model.
 *
 * PORTED FROM `resolution/resolution.types.ts` — the same three workstreams, in
 * the same order, with the same default.
 *
 * ─── DISPOSITION IS PARKED, NOT DELETED (removed on request) ─────────────────
 *
 * A fourth `disposition` card was here briefly. It is out of the list, so the
 * selector shows Vue's three; the union member and `DispositionPanel` are kept
 * so restoring it is a one-line change rather than a rebuild.
 *
 * WHAT THAT COSTS, stated because it is not nothing: this was the only place an
 * issue's recorded outcome and its `monitoringNextReview` date were displayed.
 * Proposing and approving a disposition still works — the shell header's
 * "Change status" button and `ApprovalBanner` are untouched — but once approved,
 * the outcome no longer appears anywhere in the workspace. To restore, add the
 * commented entry back to `RESOLUTION_WORKSTREAMS` and set the default below.
 *
 * ORDER IS DATA, NOT TEMPLATE ORDER, so the selector cannot silently drift from
 * it, and the default selection is stated rather than implied by position.
 */
export type ResolutionWorkstream = 'disposition' | 'qir' | 'cm' | 'pub'

/**
 * Per-workstream tone, shared by a selector card and its panel header so the two
 * can never disagree — they render the same tinted tile in two places.
 *
 * `mint` is this app's existing Disposition pair, carried over unchanged. The
 * other three are Vue's. They are portal-local rather than design tokens for the
 * reason both codebases already record: the shared set is a neutral/accent
 * palette with no violet or teal, and widening a package every screen depends on
 * to carry three Issue-domain chrome colours is the wrong blast radius.
 */
export type ResolutionTone = 'mint' | 'violet' | 'green' | 'teal'

export interface ResolutionWorkstreamOption {
  key: ResolutionWorkstream
  tone: ResolutionTone
  icon: LucideIcon
  title: string
  description: string
  /**
   * The empty-state pill. Three DIFFERENT strings for what is arguably one
   * condition — "None yet" / "Not linked" / "None" — because that is what the
   * design renders. Kept per-card rather than derived, so a future copy ruling
   * collapses them in one edit instead of hunting three call sites.
   */
  stateLabel: string
}

export const RESOLUTION_WORKSTREAMS: readonly ResolutionWorkstreamOption[] = [
  // Parked — see the note above. Restoring it is this entry plus the default.
  // {
  //   key: 'disposition',
  //   tone: 'mint',
  //   icon: ShieldCheck,
  //   title: 'Disposition',
  //   description: 'Outcome recorded for this issue',
  //   stateLabel: 'None yet',
  // },
  {
    key: 'qir',
    tone: 'violet',
    icon: ClipboardList,
    title: 'Related QIR',
    description: 'Associated Quality Issue Reports',
    stateLabel: 'Not linked',
  },
  {
    key: 'cm',
    tone: 'green',
    icon: Wrench,
    title: 'Countermeasure',
    description: 'Corrective actions',
    stateLabel: 'None yet',
  },
  {
    key: 'pub',
    tone: 'teal',
    icon: Megaphone,
    title: 'Related Publication',
    description: 'Associated TSB / Publication',
    stateLabel: 'None',
  },
]

export const DEFAULT_RESOLUTION_WORKSTREAM: ResolutionWorkstream = 'qir'
