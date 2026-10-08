/*
 * Spacing QA — the router: hash routes, one view at a time, each with its
 * own abort signal and clean-up (polling, observers), titles, focus and
 * scroll memory.
 *
 *   #/                  the library (filters in the query: #/?level=WARN)
 *   #/family/<slug>     a family's report (checked live when needed)
 *   #/family/<slug>?at=wght:700&name=Bold
 *                       a variable family at a location of its designspace
 *                       (the axes that differ from the default location;
 *                       ital:1 for its italic font), checked live, not stored
 *   #/upload            check a font file
 *   #/guide             how to use it, and the tagging data for the Google Fonts team
 *   #/cli               the command line: QA runs over the library, CI, font files
 *   #/about             how the check works
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, clear } = SQA;
  const main = document.getElementById("main");
  const scrollMemory = new Map();
  let current = null;
  let first = true;

  function parse(hash) {
    let raw = (hash || "").replace(/^#/, "");
    if (!raw.startsWith("/")) raw = "/" + raw;
    const qi = raw.indexOf("?");
    const path = qi >= 0 ? raw.slice(0, qi) : raw;
    const params = new URLSearchParams(qi >= 0 ? raw.slice(qi + 1) : "");
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return { name: "library", params, key: "library" };
    if (parts[0] === "family" && parts[1]) return { name: "family", params, slug: parts[1], key: "family/" + parts[1] };
    if (parts[0] === "upload" && parts.length === 1) return { name: "upload", params, key: "upload" };
    if (parts[0] === "about" && parts.length === 1) return { name: "about", params, key: "about" };
    if (parts[0] === "guide" && parts.length === 1) return { name: "guide", params, key: "guide" };
    if (parts[0] === "cli" && parts.length === 1) return { name: "cli", params, key: "cli" };
    return { name: "notfound", params, key: "notfound" };
  }

  function markNav(name) {
    const target = name === "family" ? "library" : name;
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.dataset.nav === target) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function notFound(ctx) {
    ctx.setTitle("Not found");
    ctx.root.appendChild(h("div", { class: "view-head" },
      h("h1", { tabindex: "-1" }, "Page not found"),
      h("p", { class: "lede" }, "There is nothing at this address. ", h("a", { href: "#/" }, "Go to the library"), ".")));
  }

  function route() {
    const r = parse(location.hash);
    if (current) {
      scrollMemory.set(current.key, window.scrollY);
      current.dispose();
    }
    SQA.tip.hide();
    clear(main);
    const container = h("div", { class: "view" });
    main.appendChild(container);
    const ac = new AbortController();
    const cleanups = [];
    let alive = true;
    const ctx = {
      root: container,
      signal: ac.signal,
      alive: () => alive,
      onCleanup: (fn) => cleanups.push(fn),
      setTitle: (t) => { document.title = t ? `${t} — Spacing QA` : "Spacing QA"; },
      focusHeading: () => {
        if (first) return;
        const hd = container.querySelector("h1");
        if (hd) hd.focus({ preventScroll: true });
      },
    };
    current = {
      key: r.key,
      dispose() {
        alive = false;
        ac.abort();
        cleanups.forEach((fn) => { try { fn(); } catch (e) { /* keep disposing */ } });
      },
    };
    markNav(r.name);
    ctx.setTitle(null);
    try {
      if (r.name === "library") SQA.views.library(ctx, r.params);
      else if (r.name === "family") SQA.views.family(ctx, r.params, r.slug);
      else if (r.name === "upload") SQA.views.upload(ctx, r.params);
      else if (r.name === "about") SQA.views.about(ctx, r.params);
      else if (r.name === "guide") SQA.views.guide(ctx, r.params);
      else if (r.name === "cli") SQA.views.cli(ctx, r.params);
      else notFound(ctx);
    } catch (e) {
      container.appendChild(SQA.errorBox(e));
    }
    const y = scrollMemory.get(r.key);
    window.scrollTo(0, r.name === "library" && y ? y : 0);
    ctx.focusHeading();
    first = false;
  }

  /** The server version opened as a file: there is no server to talk to, and
   *  a web page cannot start one. Say what to open instead. */
  function noServer() {
    const local = "http://127.0.0.1:8787/";
    const found = h("p", { class: "small" }, "Looking for a Spacing QA server on this computer…");
    main.appendChild(h("div", { class: "view" },
      h("header", { class: "view-head" },
        h("p", { class: "eyebrow" }, "Spacing QA"),
        h("h1", { tabindex: "-1" }, "This copy of the page runs with its server"),
        h("p", { class: "lede" }, "You opened the live version of Spacing QA as a file. It gets everything from the Spacing QA server, and a web page cannot start a program on your computer — so here is what to open instead.")),
      h("div", { class: "panel" },
        h("h2", { style: { marginTop: "0" } }, "No server needed"),
        h("p", null, "Open ", h("a", { href: "../dist/index.html" }, h("b", null, "the published copy")), " — in Finder, ", h("code", null, "SpacingQA/Spacing QA.html"),
          ". It has the whole library, every report, the exports, and checks your own fonts in the browser. It is the same folder you put on GitHub Pages."),
        h("h2", null, "The live version, with its server"),
        h("p", null, "It can also scan the library itself. Double-click ", h("code", null, "SpacingQA/Start Spacing QA server.command"),
          " (it starts the server and opens this site in your browser; close its window to stop it), or run this in Terminal, in the SpacingQA folder:"),
        h("div", { class: "formula" }, "./target/release/spacingqa serve --data data --site site --bind 127.0.0.1:8787"),
        found)));
    // a server already running on this computer: offer it
    fetch(local + "healthz", { mode: "no-cors", cache: "no-store" })
      .then(() => { clear(found); SQA.append(found, ["A Spacing QA server is running on this computer: ", h("a", { href: local }, h("b", null, "open it")), "."]); })
      .catch(() => { found.textContent = "No Spacing QA server is running on this computer right now."; });
  }

  function boot() {
    SQA.initTheme();
    if (!SQA.STATIC && location.protocol === "file:") {
      noServer();
      return;
    }
    document.querySelectorAll("[data-skip]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      main.focus();
    }));
    window.addEventListener("hashchange", route);
    window.addEventListener("unhandledrejection", (e) => {
      // network aborts while leaving a view are expected
      if (e.reason && e.reason.name === "AbortError") e.preventDefault();
    });
    route();
    SQA.getInfo(false).catch(() => { /* the views report errors themselves */ });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
