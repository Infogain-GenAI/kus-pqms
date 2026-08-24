---
name: Kia N-PQMS
description: Enterprise design system for N-PQMS — a high-density, audit-ready quality-management UI. Own component library (KiaNPQMSDesignSystem); Kia Midnight brand anchor with a single interactive accent blue.
status: final
created: 2026-08-20
updated: 2026-08-20
sources:
  - _bmad-output/planning-artifacts/prds/prd-kus-pqms-2026-08-20/prd.md
  - _bmad-output/planning-artifacts/ux/design-source/  # synced Kia N-PQMS design system + ISM SE-role spec
colors:
  # ---- Brand ----
  kia-midnight: '#05141F'
  kia-midnight-90: '#142733'
  kia-midnight-80: '#25404F'
  kia-midnight-70: '#3A586B'
  # ---- Neutral ramp (cool gray, anchored to Midnight) ----
  neutral-0: '#FFFFFF'
  neutral-25: '#FAFBFC'
  neutral-50: '#F4F6F8'
  neutral-100: '#ECEFF2'
  neutral-200: '#DCE1E6'
  neutral-300: '#C3CBD2'
  neutral-400: '#9AA5AE'
  neutral-500: '#6B7681'
  neutral-600: '#4A555F'
  neutral-700: '#2E3942'
  neutral-800: '#1A1A1A'
  neutral-900: '#05141F'
  # ---- Accent (interactive blue) ----
  accent-50: '#EAF2FB'
  accent-100: '#CFE0F6'
  accent-300: '#6FA4E6'
  accent-500: '#2A6FDB'
  accent-600: '#1F58B5'
  accent-700: '#18468F'
  # ---- Lifecycle status hues (one hue per status) ----
  status-draft: '#6B7681'
  status-open: '#2A6FDB'
  status-in-review: '#7C5CDB'
  status-pending-approval: '#E2820B'
  status-disposed: '#0E9384'
  status-monitoring: '#D9A60B'
  status-closed: '#344049'
  status-escalated: '#D92D20'
  # ---- Feedback ----
  success-500: '#1F8A5B'
  warning-500: '#E2820B'
  danger-500: '#D92D20'
  info-500: '#2A6FDB'
  # ---- Semantic aliases (resolved) ----
  bg-app: '#FAFBFC'
  surface-card: '#FFFFFF'
  surface-sunken: '#F4F6F8'
  surface-inverse: '#05141F'
  text-primary: '#1A1A1A'
  text-secondary: '#4A555F'
  text-muted: '#6B7681'
  text-disabled: '#9AA5AE'
  text-inverse: '#FFFFFF'
  text-link: '#2A6FDB'
  border-subtle: '#DCE1E6'
  border-default: '#C3CBD2'
  border-strong: '#9AA5AE'
  focus-ring: '#2A6FDB'
  selected-bg: '#EAF2FB'
typography:
  display:
    fontFamily: 'Kia Signature Fix'
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  h1:
    fontFamily: 'Kia Signature Fix'
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: 'Inter'
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  h3:
    fontFamily: 'Inter'
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h4:
    fontFamily: 'Inter'
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: 'Inter'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: 'Inter'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: 'Inter'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  caption:
    fontFamily: 'Inter'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label:
    fontFamily: 'Inter'
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  mono:
    fontFamily: '"SF Mono", ui-monospace, Menlo, Consolas, monospace'  # --font-mono token; .ism-mono resolves to this
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  pill: 999px
  full: 50%
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
  '20': 80px
  sidenav-width: 260px
  sidenav-collapsed: 64px
  header-height: 60px
  row-height-compact: 40px
  row-height-default: 48px
  container-lg: 1280px
  container-xl: 1600px
components:
  button-primary:
    background: '{colors.accent-500}'
    foreground: '{colors.neutral-0}'
    radius: '{rounded.md}'
    hover: '{colors.accent-600}'
    pressed: '{colors.accent-700}'
  button-secondary:
    background: '{colors.neutral-0}'
    foreground: '{colors.text-primary}'
    border: '{colors.border-default}'
    radius: '{rounded.md}'
  status-pill:
    radius: '{rounded.pill}'
    typography: '{typography.label}'
    # fill/border derive from the status-* hue for the record's status
  data-table-row:
    height: '{spacing.row-height-default}'
    height-compact: '{spacing.row-height-compact}'
    hover: '{colors.neutral-50}'
    selected: '{colors.selected-bg}'
    selected-rule: '{colors.accent-500}'  # 3px inset left rule
  card:
    background: '{colors.surface-card}'
    border: '{colors.border-subtle}'
    radius: '{rounded.xl}'
    shadow: shadow-sm
  input:
    background: '{colors.neutral-0}'
    border: '{colors.border-default}'
    radius: '{rounded.md}'
    focus-ring: '{colors.focus-ring}'
    height: '{spacing.row-height-compact}'
  sidenav:
    width: '{spacing.sidenav-width}'
    collapsed: '{spacing.sidenav-collapsed}'
    background: '{colors.kia-midnight}'
    foreground: '{colors.text-inverse}'
  header:
    height: '{spacing.header-height}'
    background: '{colors.surface-card}'
    border-bottom: '{colors.border-subtle}'
  source-badge:
    radius: '{rounded.sm}'
    typography: '{typography.caption}'
  approval-bar:
    background: '{colors.surface-sunken}'
    border: '{colors.border-subtle}'
---

# Kia N-PQMS — Design Spine

> Own design system (`KiaNPQMSDesignSystem_e334a0`). This DESIGN.md is the canonical visual identity for the N-PQMS **Issue & Signal Management (ISM)** module and its siblings. Token values are mirrored from the synced source at `../../ux/design-source/design-system/tokens/*.css`; the source `readme.md` and `specs/ISM SE Role - Spec.md` inform the prose. Spine wins on conflict with any mock, prototype, or import.

## Brand & Style

N-PQMS reads as **instrument-panel-meets-enterprise-software**: cool, dark-anchored, precise. It is a data product for quality and engineering operators doing repetitive, high-stakes work — so every decision serves **data clarity over decoration**. Deep midnight navigation frames crisp white data surfaces; a single restrained accent blue carries all interactivity; a disciplined status-color language does the semantic work.

The posture is **calm, authoritative, audit-ready** — copy and chrome should read like they could appear in a compliance log. Restraint in color, shadow, and motion is the brand: nothing bounces, nothing glows, nothing competes with the data. The system is built for **long operational sessions** with comfortable density and durable, always-visible focus states.

## Colors

- **Kia Midnight `#05141F`** — the brand anchor. Near-black with a faint blue cast (never pure black). Owns primary navigation, the side rail, and brand moments. Not a text color on light surfaces (use `{colors.text-primary}`).
- **Accent Blue `#2A6FDB`** (`accent-500`, hover `600`, pressed `700`) — the *single* interactive color. Links, primary buttons, focus rings, selection, active nav. Resist adding any second accent hue.
- **Neutral ramp** — cool grays from Polar White `#FFFFFF` surfaces on a faint `#FAFBFC` app background down to Deep Black `#1A1A1A` primary text. Borders are hairline cool-gray (`border-subtle #DCE1E6`, `border-default #C3CBD2`).
- **Lifecycle status hues — one hue per status, never hand-colored:** Draft `#6B7681` · Open `#2A6FDB` · In Review `#7C5CDB` · Pending Approval `#E2820B` · Disposed `#0E9384` · Monitoring `#D9A60B` · Closed `#344049` · **Escalated `#D92D20`** (red, highest urgency, intentionally distinct from Draft gray). These map 1:1 to the canonical lifecycle and are the single source of truth for status color across pills, dots, and charts.
- **Feedback** — success `#1F8A5B`, warning `#E2820B`, danger `#D92D20`, info `#2A6FDB`, each with a `-50` tint for backgrounds.

Avoid: additional accent hues, gradient surfaces (except a subtle legibility scrim on dark imagery), colored shadows (except the focus ring), warm/lifestyle imagery.

> `[ASSUMPTION]` The synced SE prototype used a marginally cooler app background (`#F6F8FA`) and primary text (`#1A2430`) than the design-system tokens (`#FAFBFC` / `#1A1A1A`). This spine treats the **design-system tokens as canonical** (the source readme states "tokens are the contract"). Confirm.

## Typography

- **Display face — Kia Signature Fix** (Light/Regular/Bold): page titles, H1, and big metric numerals only. Geometric, confident, slightly condensed. Headings tighten tracking (−0.01 to −0.02em).
- **UI/body face — Inter**: everything dense — tables, forms, body, and captions; also H2–H4, for legibility in data views.
- **Mono — `--font-mono`** (`"SF Mono", ui-monospace, Menlo, Consolas, monospace`, applied via the `.ism-mono` class): IDs and numeric/technical values (`EE-260001`, part numbers, counts). Right-align numeric table columns. *(The source SE-spec prose calls this "JetBrains Mono", but no token or prototype CSS defines it — `.ism-mono` resolves to the `--font-mono` token, which is canonical here.)*
- **Uppercase labels** (`label` role): table headers, field labels, and eyebrows — sentence case everywhere else, including buttons ("Submit for review"). Uppercase labels open tracking to +0.04em.

Type ramp: Display 44 · H1 32 · H2 26 · H3 20 · H4 17 · Body 16/14/13 · Caption 12 · Label 12.

## Layout & Spacing

Strict **4px base grid** (`spacing.1`–`spacing.20` = 4→80px). Chrome: a fixed **260px side navigation** (collapsible to 64px) on Kia Midnight, and a sticky **60px top header** on white with a bottom hairline. Content sits on a **1280–1600px** container. Tables run **compact (40px)** or **default (48px)** rows. Card gaps of 16/20/24px between blocks.

A single scroll region owns the page; the Issue Workspace uses a self-sizing inner scroll region so only that panel scrolls.

## Elevation & Depth

Soft, cool-tinted, low-spread shadows (rgba of Midnight, never black):
- `shadow-xs` `0 1px 2px rgba(5,20,31,.06)` / `shadow-sm` `0 1px 3px rgba(5,20,31,.08), 0 1px 2px rgba(5,20,31,.04)` — cards (border + subtle shadow preferred over heavy elevation).
- `shadow-md` `0 4px 12px rgba(5,20,31,.10), 0 2px 4px rgba(5,20,31,.06)` — dropdowns, popovers, the "+N" overflow popover.
- `shadow-lg` `0 12px 28px rgba(5,20,31,.14), 0 4px 8px rgba(5,20,31,.06)` — modals and the notification panel.
- **Focus ring** — `0 0 0 3px rgba(42,111,219,.30)`, always visible, never removed.

Elevation is not a hierarchy device; hairline borders define structure. Modal scrim is `rgba(5,20,31,0.5)`.

## Shapes

Small, consistent radii — this is a data product, not a consumer app:
- **`rounded.sm` 4px** — source badges, tags, small chips.
- **`rounded.md` 6px** — inputs, buttons.
- **`rounded.lg` 8px** — modals, larger surfaces.
- **`rounded.xl` 12px** — cards.
- **`rounded.pill` 999px** — status pills, count badges only.

> `[ASSUMPTION]` The SE prototype rendered softer radii than the token scale — cards at 14–16px (token `xl` = 12px) and inputs/buttons at ~8–9px (token `md` = 6px). Canonical = token scale (12px / 6px); confirm if the softer prototype radii are preferred.

## Components

Compose the Kia N-PQMS component library — do not restyle raw HTML to imitate it. Behavioral rules live in `EXPERIENCE.md`; visual specs here.

- **Button** — primary (`accent-500` fill, white text, `md` radius, hover `600` / pressed `700`); secondary (white fill, `border-default`, primary text); ghost (transparent, gray hover wash). Sizes sm/md/lg (`control-sm 28` / `md 36` / `lg 44`). All states visible; disabled = `neutral-100` bg / `neutral-400` text.
- **StatusBadge / StatusPill / StatusIndicator** — render a lifecycle status; fill/label looked up from the single status map by status name; pill uses `label` type + the matching `status-*` hue. Never paraphrase or hand-color.
- **SourceBadge** — one Lucide icon per source channel (Warranty `file-warning` · Weibull `activity` · Comeback `rotate-ccw` · Techline `headset` · FPQR `clipboard-list` · EWS `shield-alert` · GQIS `globe`).
- **DataTable** — compact/default rows; sortable headers (uppercase `label`); hover = `neutral-50` wash + 1px lift; selected row = `selected-bg` with a 3px inset accent left rule; multi-value cells show the first value + a hover/focus **"+N" popover** (consecutive years collapse to a range).
- **Card / IssueCard** — white surface, `border-subtle`, `xl` radius, `shadow-sm`; hover lifts to `shadow-md`.
- **Forms** (Input, Textarea, Select, SearchField, Checkbox, Radio, Switch) — `md` radius, `border-default`, accent focus ring; errors name the field + fix.
- **SideNav / Header / Breadcrumb / Tabs / Pagination** — Midnight side rail with accent left-rule on the selected item; white sticky header with logo, primary nav, help, notification bell + unread badge, and user identity.
- **Timeline / CommentCard** — chronology and communication entries with role/name badge, timestamp, and attachment previews.
- **ApprovalBar** — the review/approve affordance for override roles (ASM/PQM), sunken surface with primary + reject actions and a mandatory-reason field.
- **Feedback** — Toast (outcome + ID, e.g. "Issue EE-260001 submitted for review."), Tooltip, EmptyState (factual, actionable), Spinner.
- **Core primitives** — Logo (Kia PQMS mark, light/dark tones), Avatar (initials/photo), Badge & Tag (counts and labels), IconButton (icon-only actions) — the small building blocks the composites above are built from.

> **Out of scope:** the source library ships `SeverityIndicator` / `SeverityBar` (score-driven). Issue scoring & severity are out of scope for this build — do **not** use these components in ISM screens.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use the single accent blue for all interactivity | Introduce a second accent hue |
| Look up status color/label from the status map | Hand-color a status or paraphrase its name |
| Prefer hairline border + `shadow-sm` on cards | Use heavy or colored elevation |
| Keep motion functional (120–240ms fades/short slides) | Bounce, loop, or animate decoratively |
| Mono for IDs; right-align numerics | Set IDs/numbers in the body face, left-aligned |
| Sentence case (incl. buttons); uppercase only for labels | Title Case buttons; sentence-case table headers |
| Keep density comfortable for long sessions | Add whitespace that pushes data below the fold |
| Honor `prefers-reduced-motion` and always show focus rings | Remove focus outlines for "cleanliness" |
| Treat Severity/scoring components as reference-only | Build issue scoring or score-driven severity |
