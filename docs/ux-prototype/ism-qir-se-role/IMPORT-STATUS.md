# ISM + QIR SE Role — design import status

Source: Claude Design project **Kia N-PQMS V4-V5** (`6a717b29-4059-4d43-b115-34f7a7936c8e`),
file `ISM + QIR SE Role - P:C.dc.html`. Imported via the `claude_design` MCP.

## Imported complete

| Local path | Bytes |
|---|---|
| `support.js` — dc-runtime | 69,150 |
| `lucide-local.js` — offline Lucide subset | 43,089 |
| `_ds/.../_ds_bundle.js` — Kia N-PQMS component bundle | 103,687 |
| `_ds/.../styles.css` + `tokens/{colors,typography,spacing,elevation,fonts}.css` | 10,973 |

Planning inputs are under `_bmad-output/planning-artifacts/ism-qir-se-role/`:
the full page specification, the SE-role BRD, and the design project's export requirements.

## Blocked — must be supplied manually

The MCP's `get_file` caps reads at 256 KiB. These files exceed it and came back truncated,
so they are **not usable** and are marked `.TRUNCATED-*`:

- `ISM + QIR SE Role - P-C.dc.html` — got 262,144 bytes; cuts off mid-attribute inside the
  `<x-dc>` template, before `</x-dc>` and before the `<script data-dc-script>` block that
  holds all application logic.
- `exports/ISM-QIR-SE-Role-PC-standalone.html` — truncates identically.
- `_ds/.../assets/fonts/KiaSignatureFix-{Light,Regular,Bold}.ttf` — ~2.7 MB each. Not
  imported. Until they are, `--font-display` falls back to Inter.

**To unblock:** download the file from
<https://claude.ai/design/p/6a717b29-4059-4d43-b115-34f7a7936c8e?file=ISM+%2B+QIR+SE+Role+-+P%3AC.dc.html>
and place it in this directory. Either form works:

- the `.dc.html` source — pairs with the `support.js`, `lucide-local.js` and `_ds/` files
  already here (note: Windows cannot hold the `:` in the original filename; use `P-C`), or
- the standalone offline export — self-contained, needs nothing else here.
