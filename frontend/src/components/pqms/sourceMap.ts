import type { LucideIcon } from 'lucide-react'
import { Activity, ClipboardList, FileWarning, Globe, Headset, RotateCcw, ShieldAlert } from 'lucide-react'

// Issue source channels → label + Lucide icon.
// Ported verbatim from the design-system source (SOURCE map; matches DESIGN.md exactly).
export type SourceKey = 'warranty' | 'weibull' | 'comeback' | 'techline' | 'fpqr' | 'ews' | 'gqis'

export interface SourceDef {
  label: string
  icon: LucideIcon
}

export const SOURCE: Record<SourceKey, SourceDef> = {
  warranty: { label: 'Warranty', icon: FileWarning },
  weibull: { label: 'Weibull', icon: Activity },
  comeback: { label: 'Comeback', icon: RotateCcw },
  techline: { label: 'Techline', icon: Headset },
  fpqr: { label: 'FPQR', icon: ClipboardList },
  ews: { label: 'EWS', icon: ShieldAlert },
  gqis: { label: 'GQIS', icon: Globe },
}

export const SOURCE_KEYS: SourceKey[] = ['warranty', 'weibull', 'comeback', 'techline', 'fpqr', 'ews', 'gqis']
