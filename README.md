# Spacing QA — published copy

A complete, static copy of the Spacing QA report site: it needs no server. It compares
the spacing of every Google Fonts family with Kinetikern2's tight, standard and loose
presets (with its designer harness) and with the library's own norms.

- **Open it:** double-click `index.html` (any current browser).
- **Publish it:** put the contents of this folder in a GitHub repository and turn on
  GitHub Pages (Settings → Pages → Deploy from a branch → the branch, `/ (root)`).
  Any static host works the same way.

Fonts checked on the page — uploads under *Check a font*, and a family's *Re-check* —
are checked in the browser by `spacingqa-wasm.js` (the same Rust code as the server,
compiled to WebAssembly). Nothing is uploaded.

Built 2026-10-10T17:35:14Z from a live scan of fonts.google.com: 1950 families, 1950 reports.
The exports for the Google Fonts tagging initiative and the Markdown reports are in
`data/exports/` (see its README.md).

A scheduled job rebuilds it every day from fonts.google.com.
