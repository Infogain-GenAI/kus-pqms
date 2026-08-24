# V4-V5 — Standalone HTML export prompt (mirrored `CLAUDE.md`)

> Provenance: faithful mirror of `CLAUDE.md` in the **"Kia N-PQMS V4-V5"** claude.ai/design project
> (`6a717b29-4059-4d43-b115-34f7a7936c8e`), pulled during the 2026-08-22 design-sync refresh.
> This is the design team's **saved prompt** used to regenerate the pixel-perfect self-contained
> standalone HTML export (the family of files that were flattened into `PQMS.zip` →
> `exports/pqms-bundled-page-2026-08-16/`). It is design-tooling working material, not ISM design source —
> retained here only as a record of how the standalone exports are produced.

---

## Saved prompt: Pixel-Perfect Standalone HTML Export (No Missing Assets or Icons)

Prompt: Generate a Pixel-Perfect Standalone HTML Export (No Missing Assets or Icons)

The current Standalone HTML export is much better, but I noticed that some icons are missing in the downloaded HTML file. I need the exported HTML to be an exact, pixel-faithful offline version of the prototype.

### Required Output
Please regenerate the Standalone HTML and ensure it captures everything from the prototype without omission.

### Critical Requirements
Capture 100% of the UI, including:
- All pages
- All layouts
- All navigation
- All interactions
- All sample/demo data
- All tables and rows
- All modals, drawers, overlays, and tooltips
- All sticky headers and scrolling behavior
- All animations (where applicable)

### Icons
Please ensure every icon used in the prototype is preserved in the exported HTML. This includes (but is not limited to):
- Navigation icons
- Action icons
- Status icons
- Badges
- Alert icons
- Filter icons
- Search icons
- Sort icons
- Upload/Download icons
- Edit/Delete icons
- Expand/Collapse icons
- Timeline/Chronology icons
- Score indicators
- Dashboard icons
- Module icons
- Empty-state icons
- Any custom SVGs

There should be no missing icon placeholders or broken icon references.

### Asset Handling
The HTML must be completely self-contained.
- Embed all SVGs, icon fonts, images, CSS, and JavaScript directly within the HTML wherever possible.
- Do not reference external CDNs or assets that may fail when the file is opened offline.
- If the prototype uses an icon library (Lucide, Heroicons, Material Icons, Font Awesome, etc.), ensure all required icons are embedded or inlined so they render correctly offline.

### Fidelity
The exported HTML should be visually identical to the prototype. Nothing should be simplified, approximated, or omitted. Please preserve:
- Typography
- Colors
- Shadows
- Borders
- Icons
- Images
- Illustrations
- Badges
- Chips
- Spacing
- Padding
- Margins
- Border radius
- Hover states
- Active states
- Disabled states
- Focus states

### Functional Fidelity
All implemented functionality should continue to work offline, including:
- Navigation between pages
- Opening/closing modals
- Tabs
- Expand/collapse sections
- Dropdowns
- Tooltips
- Filters
- Search interactions
- Tables
- Sticky headers
- Scrolling behavior
- Demo data interactions

### Validation Before Export
Before generating the HTML, please validate that:
- No icons are missing.
- No broken image or asset references exist.
- No empty placeholders are rendered.
- Every page visually matches the original prototype.
- All sample data is present.
- The HTML opens correctly in a browser without requiring any network connection.

### Expected Outcome
Provide one downloadable standalone HTML file that is a complete offline replica of the Kia N-PQMS V4-V5 → ISM+QIR SE Role - P:C and Kia N-PQMS V4-V5 → ISM SEM Role - P:C prototype, with 100% UI fidelity, 100% interaction fidelity, all icons embedded and rendered correctly, and no missing assets, data, or visual elements.
