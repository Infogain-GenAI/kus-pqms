// N-PQMS issue status definitions + size scale.
// Vocabulary = the V4-V5 prototype's own STATUS map, adopted verbatim per the 2026-08-23
// directive that every user interface shows the UX prototype's values (supersedes the
// Phase-1 canonical-8-status decision). Keys/labels/colors from the .dc.html source:
//   open:'Open' #2A6FDB · review:'Investigating' #7C5CDB · monitoring:'Monitoring' #D9A60B ·
//   escalated:'QIR' #D97706 · topissue:'Top Issue' #D92D20 · outofscope:'NASO' #8B5A2B ·
//   closed:'Closed' #344049
// Colors bind to --status-* tokens where the hex matches; QIR orange and NASO brown have no
// token and stay literal. Consumed by StatusBadge, StatusPill, StatusIndicator.

export type StatusKey =
  | 'open'
  | 'review'
  | 'monitoring'
  | 'escalated'
  | 'topissue'
  | 'outofscope'
  | 'closed'

export type StatusSize = 'sm' | 'md' | 'lg'

export interface StatusDef {
  /** Label shown to users (the prototype's own). */
  label: string
  /** The one hue for this status. */
  color: string
  /** Soft background tint (badge). */
  tint: string
  /** Text/foreground on the tint (badge). */
  text: string
}

export const STATUS: Record<StatusKey, StatusDef> = {
  open: { label: 'Open', color: 'var(--status-open)', tint: 'var(--accent-50)', text: 'var(--accent-700)' },
  review: { label: 'Investigating', color: 'var(--status-review)', tint: '#F0EBFB', text: '#5639B5' },
  monitoring: { label: 'Monitoring', color: 'var(--status-monitor)', tint: '#FBF3D6', text: '#8A6D08' },
  escalated: { label: 'QIR', color: '#D97706', tint: '#D977061A', text: '#D97706' },
  topissue: { label: 'Top Issue', color: 'var(--danger-500)', tint: 'var(--danger-50)', text: 'var(--danger-600)' },
  outofscope: { label: 'NASO', color: '#8B5A2B', tint: '#8B5A2B1A', text: '#8B5A2B' },
  closed: { label: 'Closed', color: 'var(--status-closed)', tint: 'var(--neutral-100)', text: 'var(--neutral-700)' },
}

export interface StatusSizeDef {
  h: number
  px: number
  fs: string
  dot: number
}

export const STATUS_SIZES: Record<StatusSize, StatusSizeDef> = {
  sm: { h: 18, px: 7, fs: '11px', dot: 6 },
  md: { h: 22, px: 9, fs: 'var(--fs-caption)', dot: 7 },
  lg: { h: 28, px: 12, fs: 'var(--fs-body-sm)', dot: 8 },
}

/** Ordered status keys (the prototype's STATUS map order). */
export const STATUS_KEYS: StatusKey[] = [
  'open',
  'review',
  'monitoring',
  'escalated',
  'topissue',
  'outofscope',
  'closed',
]
