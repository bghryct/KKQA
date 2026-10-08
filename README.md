# Spacing QA — published copy

A complete, static copy of the Spacing QA report site: it needs no server.

- **Open it:** double-click `index.html` (any current browser).
- **Publish it:** put the contents of this folder in a GitHub repository and turn on
  GitHub Pages (Settings → Pages → Deploy from a branch → the branch, `/ (root)`).
  Any static host works the same way.

Fonts checked on the page — uploads under *Check a font*, and a family's *Re-check* —
are checked in the browser by `spacingqa-wasm.js` (the same Rust code as the server,
compiled to WebAssembly). Nothing is uploaded.

Built 2026-10-08T06:08:00Z from a live scan of fonts.google.com: 1950 families, 1950 reports.
The exports for the Google Fonts tagging initiative and the Markdown reports are in
`data/exports/` (see its README.md).

To build it again: `spacingqa scan`, then `spacingqa site` (SpacingQA/README.md), or let
the GitHub Actions workflow (`.github/workflows/spacingqa-pages.yml`) do it every day.
