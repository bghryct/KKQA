// Where Spacing QA gets its data. Served by `spacingqa serve`, the page talks
// to the server's /api (the default here). The static copy that
// `spacingqa site` writes (GitHub Pages) replaces this file with
// {"mode": "static", ...}: the page reads published files and checks fonts in
// the browser with spacingqa.wasm.
window.SQA_CONFIG = window.SQA_CONFIG || { mode: "server" };
