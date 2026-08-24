# Kia N-PQMS Design System

An enterprise design system for **Kia N-PQMS** — the Next-generation Parts Quality Management System / Quality Management Platform. The system supports a high-density automotive enterprise application used across multiple PQMS modules, by quality and engineering roles: **QE** (Quality Engineer), **TE** (Test Engineer), **ASM** (After-Sales Manager), and **PQM** (Product Quality Manager).

It is built to be premium, professional, and aligned with Kia's automotive-technology ecosystem, while prioritizing data clarity, scalability, accessibility, and consistency over decoration.

## Source materials

Provided by the user (stored in `assets/`):
- **Kia PQMS Logo — Dark** (`assets/logos/kia-pqms-dark.svg`) — dark-ink mark (`#05141F`) for light backgrounds.
- **Kia PQMS Logo — Light** (`assets/logos/kia-pqms-light.svg`) — white mark for dark backgrounds.
- **Kia Signature Fix** font family (Light / Regular / Bold), provided as OTF + TTF. TTFs extracted to `assets/fonts/`.

No codebase or Figma file was provided; the components are built from the written specification and enterprise QMS best practice.

---

## Design principles

1. **Enterprise first** — every decision serves operators doing repetitive, high-stakes work.
2. **Data clarity over decoration** — restraint in color, shadow, and motion so data reads first.
3. **Reduce cognitive load** — consistent placement, predictable states, minimal surprise.
4. **Support long operational workflows** — comfortable density, durable focus states, no fatigue-inducing animation.
5. **Usability for QE / TE / ASM / PQM** — role-aware language and status vocabulary.
6. **Consistency across modules** — one token set, one component library, one voice.

---

## CONTENT FUNDAMENTALS

**Voice.** Plain, precise, operational. The product speaks like a competent colleague — never playful, never marketing-y. Sentences are short and declarative.

- **Casing:** Sentence case for everything except SHORT UPPERCASE LABELS used on field labels, table headers, and metadata eyebrows (tracked +0.04em). Buttons are sentence case ("Submit for review", not "Submit For Review").
- **Person:** Address the user as **you** ("You have 3 issues pending approval"). The system refers to itself in the third person sparingly ("N-PQMS will notify the approver").
- **Status vocabulary is canonical** — always use the exact status names: Draft, Open, In Review, Pending Approval, Disposed, Closed, Monitoring, Escalated. Never paraphrase ("being reviewed" ✗ → "In Review" ✓).
- **Numbers & units:** Always show units and IDs explicitly — `ISS-20418`, `Severity 8.4`, `12 parts affected`, `3 days overdue`. Right-align numeric columns.
- **Empty / error copy:** Factual and actionable. "No issues match these filters. Clear filters to see all 1,204 issues." Errors name the field and the fix: "Enter a part number (e.g. 0K2A1-58-810)."
- **Emoji:** Never. **Exclamation marks:** Avoid. **Tone words** ("Oops!", "Great!"): Avoid.
- **Vibe:** Calm, authoritative, audit-ready. Copy should read like it could appear in a compliance log.

Examples:
- Toast: "Issue ISS-20418 submitted for review."
- Confirmation: "Close this issue? Closed issues are read-only and cannot be reopened."
- Helper text: "Severity is auto-calculated from impact, detectability, and occurrence."

---

## VISUAL FOUNDATIONS

**Overall feel.** Cool, dark-anchored, precise. The system reads as instrument-panel-meets-enterprise-software: deep midnight navigation, crisp white data surfaces, restrained accent blue, and a disciplined status-color language.

**Color.**
- Brand anchor is **Kia Midnight Black `#05141F`** — used for primary navigation, headers, and brand moments. It is near-black with a faint blue cast, never pure black.
- Text is **Deep Black `#1A1A1A`** on white; secondary/muted text steps down a cool-gray ramp.
- Surfaces are **Polar White `#FFFFFF`** cards on a faint cool-gray app background (`#FAFBFC`).
- A single interactive **accent blue `#2A6FDB`** carries links, primary actions, focus, and selection. Resist introducing additional accent hues.
- **Status colors** are a fixed, semantic set (see Colors group) — each status maps to exactly one hue and is used consistently across badges, pills, dots, and chart series.
- Imagery, when present, skews cool and technical (engineering, parts, plant) — never warm lifestyle photography.

**Type.** Display face **Kia Signature Fix** (Light/Regular/Bold) for page titles, H1, and brand moments — geometric, confident, slightly condensed. Body/UI face **Inter** for everything dense: tables, forms, body, captions. Headings tighten tracking (−0.01 to −0.02em); uppercase labels open it up (+0.04em).

**Spacing & layout.** Strict **4px grid**. Fixed 260px side navigation (collapsible to 64px), 60px top header. Tables run compact (40px) or default (48px) row heights. Content sits on a 1280–1600px container.

**Corner radius.** Small and consistent: 4–6px on inputs, buttons, and cards; 8px on modals/large surfaces; full pills only for status pills and tags. Nothing is heavily rounded — this is a data product, not a consumer app.

**Borders.** Hairline 1px cool-gray borders (`#DCE1E6` subtle, `#C3CBD2` default) define structure. Cards prefer **border + subtle shadow** over heavy elevation. Dividers are 1px `#DCE1E6`.

**Elevation / shadows.** Soft, cool-tinted, low-spread shadows (rgba of midnight, not black). Cards use `--shadow-sm`; dropdowns/popovers `--shadow-md`; modals `--shadow-lg`. No glow, no neon, no colored shadows except the focus ring.

**Focus & states.**
- **Focus:** 3px accent-blue ring at 30% opacity (`--shadow-focus`) — always visible, never removed.
- **Hover:** Subtle gray surface wash (`--neutral-50`) for rows/ghost buttons; one step darker for filled buttons.
- **Pressed:** One step darker again (no scale/bounce — enterprise restraint).
- **Disabled:** `--neutral-100` background, `--neutral-400` text, no shadow, `cursor: not-allowed`.
- **Selected:** Accent-tinted background (`--accent-50`) with optional left accent rule on nav.

**Motion.** Minimal and functional. 120–240ms, `cubic-bezier(0.2,0,0,1)` standard easing. Fades and short slides only — no bounces on content, no infinite loops, no decorative motion. Respect `prefers-reduced-motion`.

**Transparency / blur.** Used sparingly — modal scrim (`rgba(5,20,31,0.5)`) and the occasional sticky-header backdrop. No frosted-glass decoration.

**Gradients.** Avoided as decoration. The only acceptable gradient is a subtle protection gradient on dark hero/nav imagery for text legibility.

---

## ICONOGRAPHY

- **System:** [Lucide](https://lucide.dev) — clean, consistent, open-source line icons. Loaded from CDN (`lucide@latest`); no icons are committed to the repo. *(Substitution note: no icon set was supplied with the brand assets, so Lucide is the documented standard for this system — flagged for confirmation.)*
- **Style:** Stroke-only (no fills), **1.75px stroke** at 24px (`--icon-stroke`), round caps/joins. Keep stroke weight visually consistent across sizes.
- **Size tokens:** `--icon-xs 12` · `--icon-sm 16` · `--icon-md 20` · `--icon-lg 24` · `--icon-xl 32`. 16px is the default inline/table size; 20px in buttons; 24px in nav.
- **Alignment:** Optically center icons with adjacent text; icon + label gap is `--space-2` (8px). Icons inherit `currentColor`.
- **Usage:** Functional only — status, actions, navigation, severity. Never decorative. **No emoji. No Unicode-glyph icons.** One icon per meaning, used consistently (e.g. always `alert-triangle` for Escalated).
- The brand logos are committed SVGs in `assets/logos/` — use the `Logo` component (`Kia_PQMS`) rather than embedding raw SVG.

---

## Index / manifest

**Root**
- `styles.css` — global entry (import-only)
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `fonts.css`
- `assets/` — `logos/` (dark + light SVG), `fonts/` (Kia Signature Fix TTFs)
- `readme.md` — this file
- `SKILL.md` — portable Agent Skill manifest

**Components** (`components/`)
- `brand/` — `Logo` (Kia_PQMS: default / compact / icon, light + dark)
- `core/` — `Button`, `IconButton`, `Badge`, `Tag`, `Avatar`, `StatusBadge`, `StatusPill`, `StatusIndicator`
- `forms/` — `Input`, `Textarea`, `Select`, `SearchField`, `Checkbox`, `Radio`, `Switch`
- `navigation/` — `SideNav`, `Header`, `Breadcrumb`, `Tabs`, `Pagination`
- `feedback/` — `Tooltip`, `Toast`, `EmptyState`, `Spinner`
- `pqms/` — `SeverityIndicator`, `SeverityBar`, `SourceBadge`, `IssueCard`, `Timeline`, `CommentCard`, `ApprovalBar`, `DataTable`

**Skill** (`SKILL.md`) — portable Agent Skill manifest for use in Claude Code.

**Foundation cards** populate the Design System tab (groups: Brand, Colors, Type, Spacing, Components).

---

## Decisions (confirmed) & notes
- **"Escalated" color:** the spec listed Escalated as *Gray*, but that would make it indistinguishable from Draft. **Confirmed: Escalated uses Red `#D92D20`** — the highest-urgency status.
- **Inter** is loaded from Google Fonts (confirmed) as the secondary UI face.
- **Lucide** is the confirmed icon set, loaded directly from its CDN (`unpkg.com/lucide`) — no local assets needed; stroke 1.75.
- No Figma/codebase was provided; components reflect the spec + QMS best practice rather than an existing implementation.
