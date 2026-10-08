/*
 * Spacing QA — the library view (#/): catalog and baseline status, the scan
 * panel with live progress, library charts and the table of every family.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, clear, esc, fmt, signed, int, api, isAbort, badge, badgeHtml, presetHtml } = SQA;

  const CATEGORIES = ["Sans Serif", "Serif", "Display", "Handwriting", "Monospace"];
  const NOTE = {
    "spacing/monospaced": "monospaced",
    "spacing/not-latin": "no Latin",
    "spacing/no-outlines": "no outlines",
    "spacing/unreadable": "unreadable",
    "spacing/unavailable": "download failed",
    "spacing/error": "engine error",
  };
  const PRESET_ORDER = { tight: 0, standard: 1, loose: 2 };
  const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

  // filters, sort and chart category survive navigation (and live in the URL)
  const state = { q: "", cat: "", level: "", closest: "", status: "", font: "", sort: "name", dir: 1, chartCat: "ALL", scrollTop: 0 };
  const COLS = [
    { key: "name", label: "Family", title: "Family name (opens its report)" },
    { key: "category", label: "Category", title: "Google Fonts category" },
    { key: "level", label: "Level", title: "Result level, as fontspector's: INFO by default; WARN or FAIL only far outside the library's norms" },
    { key: "closest", label: "Closest", title: "The Kinetikern2 preset nearest to the font's spacing" },
    { key: "best_looseness", label: "Looseness", num: true, title: "Best-fit Looseness: −0.5 is the tight preset, 0 standard, +0.5 loose" },
    { key: "shape_error", label: "Shape error", num: true, title: "How far the gaps depart from even spacing of these shapes, overall tightness taken out (units per 1000 em)" },
    { key: "sidebearing_error", label: "Sidebearing error", num: true, title: "Mean sidebearing difference from the best-fit model, offset removed (units per 1000 em)" },
    { key: "kern_r", label: "Kerning r", num: true, title: "Correlation of the designer's kerning with the model's on the pairs the designer kerned" },
    { key: "checked", label: "Checked", title: "When the family was last checked; 'changed' marks families updated on Google Fonts since" },
  ];

  // variable fonts: every family the scan read axes for, those with a location
  // of their designspace at WARN or above, and the families checked as static fonts
  const isVariable = (r) => Array.isArray(r.axes) && r.axes.length > 0;
  const raisedLocation = (r) => r.locations_level === "WARN" || r.locations_level === "FAIL" || r.locations_level === "ERROR";
  const FONT_FILTERS = {
    variable: { label: "Variable fonts", test: isVariable },
    raised: { label: "Variable, a location WARN or FAIL", test: raisedLocation },
    static: { label: "Static fonts", test: (r) => !!r.level && !isVariable(r) },
  };

  function readParams(p) {
    if (!p) return;
    const get = (k) => p.get(k) || "";
    if ([...p.keys()].length === 0) return;
    state.q = get("q"); state.cat = get("cat"); state.level = get("level"); state.closest = get("closest"); state.status = get("status");
    state.font = FONT_FILTERS[get("font")] ? get("font") : "";
    const sort = get("sort");
    if (sort) { state.dir = sort.startsWith("-") ? -1 : 1; const k = sort.replace(/^-/, ""); if (COLS.some((c) => c.key === k)) state.sort = k; }
    if (get("chart")) state.chartCat = get("chart");
  }
  function queryString() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.cat) p.set("cat", state.cat);
    if (state.level) p.set("level", state.level);
    if (state.closest) p.set("closest", state.closest);
    if (state.status) p.set("status", state.status);
    if (state.font) p.set("font", state.font);
    if (state.sort !== "name" || state.dir !== 1) p.set("sort", (state.dir < 0 ? "-" : "") + state.sort);
    if (state.chartCat !== "ALL") p.set("chart", state.chartCat);
    const qs = p.toString();
    return qs ? "?" + qs : "";
  }
  function writeQuery() {
    const url = "#/" + queryString();
    if (location.hash !== url) history.replaceState(null, "", url);
  }
  SQA.libraryHref = () => "#/" + queryString();

  // ---------------------------------------------------------------- rows
  function prepare(rows) {
    rows.forEach((r) => {
      r._search = SQA.fold(r.name + " " + (r.designers || []).join(" "));
      r._rank = r.level ? SQA.LEVEL_RANK[r.level] : -1;
    });
    return rows;
  }
  function compare(key, dir) {
    const nullsLast = (a, b, f) => {
      const an = a === null || a === undefined, bn = b === null || b === undefined;
      if (an && bn) return 0;
      if (an) return 1;
      if (bn) return -1;
      return f(a, b) * dir;
    };
    const byName = (a, b) => collator.compare(a.name, b.name);
    switch (key) {
      case "name": return (a, b) => byName(a, b) * dir;
      case "category": return (a, b) => nullsLast(a.category, b.category, collator.compare) || byName(a, b);
      case "level": return (a, b) => (a._rank - b._rank) * dir || byName(a, b);
      case "closest": return (a, b) => nullsLast(PRESET_ORDER[a.closest], PRESET_ORDER[b.closest], (x, y) => x - y) || byName(a, b);
      case "checked": return (a, b) => nullsLast(a.checked, b.checked, (x, y) => (x < y ? -1 : x > y ? 1 : 0)) || byName(a, b);
      default: return (a, b) => nullsLast(a[key], b[key], (x, y) => x - y) || byName(a, b);
    }
  }
  function filterRows(rows) {
    const q = SQA.fold(state.q.trim());
    return rows.filter((r) => {
      if (state.cat && r.category !== state.cat) return false;
      if (state.level) {
        if (state.level === "NONE") { if (r.level) return false; }
        else if (r.level !== state.level) return false;
      }
      if (state.closest && r.closest !== state.closest) return false;
      if (state.status === "stale" && !r.stale) return false;
      if (state.status === "unchecked" && r.level) return false;
      if (state.status === "current" && (!r.level || r.stale)) return false;
      if (state.status === "out" && !SQA.outOfRange(r.best_looseness)) return false;
      if (state.font && FONT_FILTERS[state.font] && !FONT_FILTERS[state.font].test(r)) return false;
      if (q && !r._search.includes(q)) return false;
      return true;
    });
  }

  function loosenessCell(v) {
    if (v === null || v === undefined) return `<span class="na">–</span>`;
    // a bar from the centre of a 64 px track, ±1 at the ends
    const bw = Math.min(Math.abs(v), 1) * 32;
    const x = v < 0 ? 32 - bw : 32;
    const oor = SQA.outOfRange(v) ? `<span class="tag" title="The best fit stopped at the limit of the Looseness range (±${SQA.FIT_LIMIT}): the font is set ${v < 0 ? "tighter" : "looser"} than anything the model makes, as in connecting scripts. Reported, never raised.">out of range</span> ` : "";
    return `${oor}<span class="lb ${v < 0 ? "neg" : "pos"}" style="--x:${x.toFixed(1)}px;--bw:${bw.toFixed(1)}px">${esc(signed(v, 2))}</span>`;
  }
  /** "VF · 12": a variable font and the locations of its designspace checked (axes in the title). */
  function vfMarker(r) {
    if (!isVariable(r)) return "";
    const lv = raisedLocation(r) ? r.locations_level : null;
    const title = `Variable font: ${r.axes.join(", ")}` + (r.locations
      ? ` · checked at ${int(r.locations)} ${r.locations === 1 ? "location" : "locations"} of its designspace` + (lv ? ` · ${lv} at one of them at least` : "")
      : " · its designspace has not been checked yet");
    return ` <span class="vf${lv ? " lvl-" + lv : ""}" title="${esc(title)}">VF${r.locations ? " · " + esc(int(r.locations)) : ""}${lv ? ` <b aria-hidden="true">${lv === "FAIL" ? "✕" : "!"}</b><span class="sr-only"> (${lv} at a location)</span>` : ""}</span>`;
  }
  function rowHtml(r) {
    const unchecked = !r.level;
    let level;
    if (unchecked) level = badgeHtml(null) + (r.latin === false ? ` <span class="small">no Latin</span>` : "");
    else level = badgeHtml(r.level) + (r.note && NOTE[r.note] ? ` <span class="small">${esc(NOTE[r.note])}</span>` : "");
    const checked = r.checked
      ? esc(SQA.fmtDate(r.checked)) + (r.stale ? ` <span class="tag stale" title="Updated on Google Fonts${r.last_modified ? " on " + esc(r.last_modified) : ""} after this check">changed</span>` : "")
      : `<span class="na">not yet</span>`;
    return `<tr data-slug="${esc(r.slug)}"${unchecked ? ' class="unchecked"' : ""}>`
      + `<td><a href="#/family/${esc(r.slug)}" title="${esc(r.name)}">${esc(r.name)}</a>${vfMarker(r)}</td>`
      + `<td>${esc(r.category || "–")}</td>`
      + `<td>${level}</td>`
      + `<td>${presetHtml(r.closest)}</td>`
      + `<td class="num">${loosenessCell(r.best_looseness)}</td>`
      + `<td class="num">${esc(fmt(r.shape_error, 1))}</td>`
      + `<td class="num">${esc(fmt(r.sidebearing_error, 1))}</td>`
      + `<td class="num">${esc(fmt(r.kern_r, 2))}</td>`
      + `<td${r.checked ? ` title="${esc(SQA.fmtDateTime(r.checked))}"` : ""}>${checked}</td></tr>`;
  }

  // ---------------------------------------------------------------- the view
  function view(ctx, params) {
    readParams(params);
    writeQuery();
    const root = ctx.root;
    let rows = SQA.store.families ? prepare(SQA.store.families) : null;
    let info = SQA.store.info, library = SQA.store.library;

    // header
    const statusEl = h("div", { class: "status-strip", "aria-live": "off" }, h("span", { class: "muted" }, "Loading the catalog…"));
    const chipsEl = h("div", { class: "chips", role: "group", "aria-label": "Families by level (filters the table)" });
    root.appendChild(h("header", { class: "view-head" },
      h("p", { class: "eyebrow" }, "Google Fonts · Kinetikern2 spacing model"),
      h("h1", { tabindex: "-1" }, "Spacing QA"),
      h("p", { class: "lede" }, "Checks the spacing of every Google Fonts family against the Kinetikern2 spacing model and its designer harness — how tight or loose each family is set, and where its letter gaps depart from even spacing of its shapes — and flags only what falls far outside the library's own norms."),
      statusEl, chipsEl));

    // scan panel
    const scan = scanPanel(ctx);
    root.appendChild(h("section", { "aria-labelledby": "scan-h" }, h("h2", { id: "scan-h" }, "Library scan"), scan.el));

    // charts
    const chartCatSeg = h("div", { class: "controls" });
    const chartGrid = h("div", { class: "chart-grid" });
    const chartsIntro = h("p", { class: "section-intro" });
    root.appendChild(h("section", { "aria-labelledby": "charts-h" },
      h("h2", { id: "charts-h" }, "The library at a glance"), chartsIntro, chartCatSeg, chartGrid));
    const charts = libraryCharts(ctx, chartGrid);

    // table
    const tableSec = h("section", { "aria-labelledby": "table-h", id: "families" });
    root.appendChild(tableSec);
    const table = familyTable(ctx, tableSec);

    // exports
    const exportLink = (name, ...text) => h("a", { class: "export", href: SQA.exportUrl(name), download: name }, h("b", null, name), h("span", null, ...text));
    const mdCounts = {};
    const mdLink = (level, what) => {
      const c = h("span", { class: "muted" });
      mdCounts[level] = c;
      return exportLink(level + ".md", what, " ", c);
    };
    root.appendChild(h("section", { "aria-labelledby": "exports-h" },
      h("h2", { id: "exports-h" }, "Exports"),
      h("p", { class: "section-intro" }, "Files for other tools, built from the latest reports. The tagging files use the formats of google/fonts' ", h("code", null, "tags/all/"), ": four columns, no header — ", h("code", null, "Family,Axes,Group/Tag,Weight"), "."),
      h("h3", null, "For the Google Fonts tagger"),
      h("div", { class: "exports" },
        exportLink("tags.csv", "A machine suggestion for the ", h("code", null, "/Quality/Spacing"), " tag, in the format of families.csv: weights 10–100, distributed like the human tags, for the families the check can judge. It passes google/fonts' tag tests (known tag, weights 1–100, no duplicates)."),
        exportLink("quant.csv", "Measured values in the format of quant.csv, at the weight checked (", h("code", null, "wght@400"), "): best-fit Looseness, shape error, sidebearing error, kerning error and correlation, and evenness (0–100 in the family's category). Variable families also at every location checked, the italic's too (", h("code", null, "\"ital,wght@1,700\""), ")."),
        exportLink("skip.csv", "Suggested ", h("code", null, "/Skip/Spacing"), " signals (the format of skip.csv) for families the check cannot judge: monospaced, no Latin, or spaced beyond the model's range."),
        exportLink("tags_metadata.csv", "The rows google/fonts' ", h("code", null, "tags/tags_metadata.csv"), " needs to register the new ", h("code", null, "/quant/spacing_*"), " and ", h("code", null, "/Skip/Spacing"), " tags, in its format (", h("code", null, "/Group/Tag,min,max,description"), ").")),
      h("h3", null, "Reports"),
      h("div", { class: "exports" },
        mdLink("FAIL", "Every FAIL family as Markdown: a table, then each family's reasons, its distance to the presets and its loosest and tightest pairs."),
        mdLink("WARN", "Every WARN family as Markdown, the same way: for issues and pull requests."),
        mdLink("INFO", "Every INFO family as a Markdown table: closest preset, Looseness, shape error and notes."),
        mdLink("SKIP", "The families the check does not apply to, with the reason."),
        exportLink("quality.csv", "One row per family: level, closest preset, the numbers, the suggested tag and every reason above INFO — for review dashboards."),
        exportLink("index.json", "Every report without its per-glyph detail, as JSON."))));
    function renderExportCounts() {
      const lv = (info && info.levels) || {};
      for (const k in mdCounts) mdCounts[k].textContent = lv[k] !== undefined ? `${int(lv[k])} ${lv[k] === 1 ? "family" : "families"}.` : "";
    }

    function renderHeader() {
      clear(statusEl);
      renderExportCounts();
      if (info && SQA.STATIC) {
        const built = SQA.CONFIG.generated || info.generated;
        statusEl.appendChild(SQA.REBUILT
          ? h("span", null, `Published copy · rebuilt ${SQA.REBUILT} from fonts.google.com · last `, h("b", null, SQA.fmtDateTime(built)), ` (${SQA.ago(built)})`)
          : h("span", null, "Published copy · built ", h("b", null, SQA.fmtDateTime(built))));
      }
      if (info) {
        const src = info.source === "live" ? "live from fonts.google.com" : String(info.source || "").replace(/^repo:/, "google/fonts checkout at ");
        statusEl.appendChild(h("span", null, "Catalog ", h("b", null, src), info.catalog_fetched ? ` · fetched ${SQA.fmtDateTime(info.catalog_fetched)} (${SQA.ago(info.catalog_fetched)})` : ""));
        statusEl.appendChild(h("span", null, h("b", null, int(info.reports)), " reports · ", h("b", null, int(info.families)), " families"));
        const ex = library && library.excluded ? Object.entries(library.excluded).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]) : [];
        statusEl.appendChild(info.baseline
          ? h("span", null, "Baseline ", h("b", null, info.baseline.id), ` · built ${SQA.fmtDateTime(info.baseline.generated)} · norms from `, h("b", null, int(info.baseline.fonts)), " fonts",
            ex.length ? ` · left out of the norms: ${ex.map(([k, n]) => `${int(n)} ${k}`).join(", ")}` : "")
          : h("span", { title: "Levels stay INFO until a library baseline is built from the reports" }, "Baseline ", h("b", null, "none yet"), " — every level is INFO until one is built"));
      } else statusEl.appendChild(h("span", { class: "muted" }, "Status unavailable."));
      renderChips();
    }
    function renderChips() {
      clear(chipsEl);
      if (!rows) return;
      const counts = {};
      let none = 0;
      rows.forEach((r) => { if (r.level) counts[r.level] = (counts[r.level] || 0) + 1; else none++; });
      const order = ["ERROR", "FAIL", "WARN", "INFO", "PASS", "SKIP"];
      order.filter((l) => counts[l]).forEach((l) => chipsEl.appendChild(levelChip(l, counts[l])));
      if (none) chipsEl.appendChild(levelChip("NONE", none));
    }
    function levelChip(level, n) {
      const b = h("button", { type: "button", class: "chip", "aria-pressed": String(state.level === level), title: state.level === level ? "Show every level" : "Show only these families in the table" },
        level === "NONE" ? badge(null) : badge(level), h("b", null, int(n)));
      b.addEventListener("click", () => {
        state.level = state.level === level ? "" : level;
        table.syncControls();
        table.render(false);
        renderChips();
        writeQuery();
        document.getElementById("families").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return b;
    }

    function renderCharts() {
      clear(chartCatSeg);
      const cats = ["ALL"].concat(CATEGORIES.filter((c) => !rows || rows.some((r) => r.category === c)));
      if (!cats.includes(state.chartCat)) state.chartCat = "ALL";
      chartCatSeg.appendChild(h("span", { class: "control-label", id: "chart-cat-l" }, "Category"));
      chartCatSeg.appendChild(SQA.segmented("Category of the charts", cats.map((c) => ({ label: c === "ALL" ? "All" : c, value: c })), state.chartCat, (v) => {
        state.chartCat = v; writeQuery(); charts.render(rows, info, library, state.chartCat); setIntro();
      }));
      setIntro();
      charts.render(rows, info, library, state.chartCat);
    }
    function setIntro() {
      const n = rows ? rows.filter((r) => r.best_looseness !== null && r.best_looseness !== undefined && (state.chartCat === "ALL" || r.category === state.chartCat)).length : 0;
      chartsIntro.textContent = `How the ${int(n)} checked ${state.chartCat === "ALL" ? "" : state.chartCat + " "}families are spaced: their best-fit Looseness, their shape error and the preset each is closest to.` +
        (library ? ` The WARN and FAIL thresholds come from the norms of baseline ${library.id}: ${int(library.fonts)} upright, proportional, Latin-primary families within the model's range.` : " Thresholds appear once a library baseline is built.");
    }

    /** Status and families load independently: one failing does not hide the other. */
    async function load() {
      const pInfo = SQA.getInfo(true, ctx.signal).then(async (i) => {
        info = i;
        library = await SQA.getLibrary(info, ctx.signal).catch((e) => { if (isAbort(e)) throw e; return null; });
        return true;
      }).catch((e) => {
        if (isAbort(e) || !ctx.alive()) throw e;
        clear(statusEl);
        statusEl.appendChild(h("span", { class: "msg error", role: "alert" }, "The server status could not be read: " + e.message));
        return false;
      });
      const pFam = SQA.getFamilies(true, ctx.signal).then((f) => { rows = prepare(f); return true; }).catch((e) => {
        if (isAbort(e) || !ctx.alive()) throw e;
        table.error(e, () => load());
        return false;
      });
      let okInfo = false, okFam = false;
      try { [okInfo, okFam] = await Promise.all([pInfo, pFam]); } catch (e) { return; }
      if (!ctx.alive()) return;
      if (okInfo) { renderHeader(); scan.setInfo(info); }
      else if (okFam) renderChips();
      if (okFam) { renderCharts(); table.setRows(rows, hadCache); }
    }
    let refreshing = false;
    /** Re-reads the families and the status (during and after scans). */
    async function refresh(final) {
      if (refreshing) return;
      refreshing = true;
      try {
        const [i, f] = await Promise.all([SQA.getInfo(true, ctx.signal), SQA.getFamilies(true, ctx.signal)]);
        if (!ctx.alive()) return;
        const baselineChanged = (i.baseline && i.baseline.id) !== (info && info.baseline && info.baseline.id);
        info = i; rows = prepare(f);
        if (baselineChanged || final) library = await SQA.getLibrary(info, ctx.signal).catch(() => library);
        renderHeader();
        renderCharts();
        table.setRows(rows, true);
        scan.setInfo(info);
      } catch (e) {
        if (!isAbort(e)) scan.note("The table could not be refreshed: " + e.message, "error");
      } finally { refreshing = false; }
    }
    scan.onChange = () => { SQA.store.familiesAt = 0; refresh(true); };
    scan.onData = (p, wasRunning) => {
      if (p.running && Date.now() - (scan.lastRefresh || 0) > 5000) { scan.lastRefresh = Date.now(); refresh(false); }
      if (!p.running && wasRunning) refresh(true);
    };

    const hadCache = !!rows;
    if (rows) { renderHeader(); renderCharts(); table.setRows(rows, false); }
    if (info) scan.setInfo(info);
    load();
    scan.start();
  }

  // ---------------------------------------------------------------- scan panel
  /**
   * Scan progress (polled: every second while a scan runs, every 15 s
   * otherwise) and the admin actions: start, cancel, catalog refresh and
   * baseline rebuild. The server allows them with its admin token, or with
   * no token on a loopback address; otherwise they are off (403).
   */
  /** The published copy has no scans to run: what it is, and when it was built. */
  function staticPanel() {
    const cfg = SQA.CONFIG;
    const more = h("p", { class: "small" });
    const el = h("div", { class: "panel scan static" },
      h("div", null, h("p", { class: "scan-state" }, "This is the published copy of Spacing QA."), more));
    return {
      el, onData: null, onChange: null, lastRefresh: 0,
      setInfo(info) {
        clear(more);
        const built = cfg.generated || (info && info.generated);
        const read = info && info.catalog_fetched ? `catalog read ${SQA.fmtDateTime(info.catalog_fetched)}` : "";
        SQA.append(more, [
          SQA.REBUILT
            ? [`The library is checked live from fonts.google.com ${SQA.REBUILT}: a scheduled scan (GitHub Actions) checks the new and changed families and rebuilds this copy. It was last rebuilt `,
              h("b", null, SQA.fmtDateTime(built)), ` (${SQA.ago(built)}${read ? "; " + read : ""}).`]
            : ["The library was checked live from fonts.google.com", read ? ` (${read})` : "",
              ", and this copy was built ", h("b", null, SQA.fmtDateTime(built)), ". A scheduled scan (GitHub Actions) builds it again."],
          " Fonts you check here — your own under ",
          h("a", { href: "#/upload" }, "Check a font"), ", or a family's Re-check — are checked in your browser; nothing is uploaded.",
          cfg.repo_url ? [" ", h("a", { href: cfg.repo_url, target: "_blank", rel: "noopener" }, "Source and schedule")] : "",
          SQA.requestUrl("")
            ? [" Anyone with a GitHub account can ask for a family to be checked again and published for everyone (", h("b", null, "Request a new check"), " on its page), or for every family that changed: ",
              h("a", { href: SQA.requestUrl(""), target: "_blank", rel: "noopener" }, "Request a refresh"), "."]
            : "",
        ]);
      },
      note(m) { more.appendChild(h("span", { class: "msg" }, " " + m)); },
      start() {},
    };
  }

  function scanPanel(ctx) {
    if (SQA.STATIC) return staticPanel();
    const stateEl = h("p", { class: "scan-state" }, "Reading the scan status…");
    const bar = h("span");
    const prog = h("div", { class: "progress", role: "progressbar", "aria-label": "Scan progress", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" }, bar);
    const nums = h("div", { class: "scan-numbers" });
    const countsEl = h("div", { class: "chips", "aria-label": "Results of this scan" });
    const msg = h("p", { class: "msg", "aria-live": "polite" });
    const access = h("p", { class: "small" });
    const bStale = h("button", { type: "button", class: "btn primary" }, "Check new and changed families");
    const bAll = h("button", { type: "button", class: "btn" }, "Re-check the whole library");
    const bCancel = h("button", { type: "button", class: "btn danger", disabled: true }, "Cancel");
    const bCatalog = h("button", { type: "button", class: "btn small" }, "Refresh the catalog");
    const bRebuild = h("button", { type: "button", class: "btn small" }, "Rebuild the baseline");
    // the admin token, for this tab only (sessionStorage)
    const tokenInput = h("input", { type: "password", id: "scan-token", autocomplete: "off", spellcheck: "false", placeholder: "Admin token" });
    const tokenUse = h("button", { type: "submit", class: "btn small" }, "Use token");
    const tokenForget = h("button", { type: "button", class: "linklike small" }, "Forget the token");
    const tokenState = h("span", { class: "small" });
    const tokenForm = h("form", { class: "row", hidden: true, style: { marginTop: "12px" } },
      h("label", { for: "scan-token", class: "control-label" }, "Admin token"), tokenInput, tokenUse, tokenState, tokenForget);
    const maint = h("details", { class: "maint", style: { marginTop: "14px" } },
      h("summary", { style: { cursor: "pointer", fontSize: "13.5px", color: "var(--ink-2)" } }, "Maintenance"),
      h("div", { class: "row", style: { marginTop: "10px" } }, bCatalog, h("span", { class: "small" }, "Re-reads the family list from Google Fonts.")),
      h("div", { class: "row", style: { marginTop: "8px" } }, bRebuild, h("span", { class: "small" }, "Builds the library norms from the current reports and judges every report again.")));
    const currentEl = h("ul", { class: "scan-list", "aria-label": "Families being checked now" });
    const recentEl = h("ul", { class: "scan-list", "aria-label": "Latest results" });
    const el = h("div", { class: "panel scan" },
      h("div", null, stateEl, prog, nums, countsEl, h("div", { class: "scan-actions" }, bStale, bAll, bCancel), tokenForm, msg, access, maint),
      h("div", null,
        h("h4", null, "Checking now"), currentEl,
        h("h4", { style: { marginTop: "14px" } }, "Latest results"), recentEl));
    const api_ = { el, onData: null, onChange: null, lastRefresh: 0, info: null };
    let timer = null, wasRunning = false, last = null, stopped = false, failures = 0, busy = false;
    let adminOff = false; // the server refuses admin actions (no token, public address)

    function famLink(name) { return h("a", { href: "#/family/" + SQA.slug(name) }, name); }
    function syncButtons() {
      const running = !!(last && last.running);
      const off = adminOff;
      bStale.disabled = off || running || busy;
      bAll.disabled = off || running || busy;
      bCancel.disabled = off || !running;
      bCatalog.disabled = off || busy;
      bRebuild.disabled = off || running || busy;
      bRebuild.title = running ? "Wait for the scan to finish" : "";
    }
    function syncToken() {
      const info = api_.info;
      const has = !!SQA.getToken();
      tokenForm.hidden = !(info && info.admin_required) || adminOff;
      maint.hidden = adminOff;
      tokenState.textContent = has ? "A token is set for this tab." : "";
      tokenForget.hidden = !has;
      tokenInput.hidden = has;
      tokenUse.hidden = has;
    }
    function syncAccess() {
      const info = api_.info;
      if (adminOff) access.textContent = (api_.offReason || "Scans, catalog refreshes and baseline rebuilds are off on this server: it has no admin token and is not on a local address.") + " Progress is still shown here.";
      else if (info && info.admin_required) access.textContent = "Starting or cancelling scans, refreshing the catalog and rebuilding the baseline need this server's admin token.";
      else access.textContent = info ? "This server accepts scans from this computer (local address, no admin token)." : "";
      syncToken();
      syncButtons();
    }
    function render(p) {
      last = p;
      const running = !!p.running;
      const pctDone = p.total ? (100 * p.done) / p.total : 0;
      bar.style.width = (running || p.done ? pctDone : 0).toFixed(1) + "%";
      prog.setAttribute("aria-valuenow", pctDone.toFixed(0));
      prog.setAttribute("aria-valuetext", p.total ? `${p.done} of ${p.total} families` : "No scan");
      clear(stateEl);
      if (running) stateEl.append(`Scanning: ${p.label || "families"}`);
      else if (p.finished) stateEl.append(`Last scan finished ${SQA.ago(p.finished)}${p.label ? ": " + p.label : ""}${p.total && p.done < p.total ? " (cancelled)" : ""}.`);
      else stateEl.append("No scan has run since the server started; the table shows the stored reports.");
      clear(nums);
      if (running || p.done) {
        SQA.append(nums, [
          h("span", null, h("b", null, `${int(p.done)} / ${int(p.total)}`), " families"),
          h("span", null, h("b", null, fmt(p.rate_per_min, 0)), " per minute"),
          running ? h("span", null, p.eta_s !== null && p.eta_s !== undefined ? ["about ", h("b", null, SQA.duration(p.eta_s)), " left"] : "estimating the time left…") : null,
          h("span", null, "elapsed ", h("b", null, SQA.duration(p.elapsed_s)))]);
      }
      clear(countsEl);
      Object.entries(p.counts || {}).sort((a, b) => SQA.LEVEL_RANK[b[0]] - SQA.LEVEL_RANK[a[0]]).forEach(([lvl, n]) =>
        countsEl.appendChild(h("span", { class: "chip" }, badge(lvl), h("b", null, int(n)))));
      clear(currentEl);
      if (running && p.current && p.current.length) p.current.forEach((n) => currentEl.appendChild(h("li", null, h("span", { class: "dot", style: { background: "var(--accent)" }, "aria-hidden": "true" }), famLink(n))));
      else currentEl.appendChild(h("li", { class: "muted" }, running ? "Starting…" : "Nothing right now."));
      clear(recentEl);
      if (p.recent && p.recent.length) p.recent.slice(0, 8).forEach(([n, lvl]) => recentEl.appendChild(h("li", null, badge(lvl), famLink(n))));
      else recentEl.appendChild(h("li", { class: "muted" }, "No results yet."));
      syncButtons();
    }
    async function poll() {
      clearTimeout(timer);
      if (stopped || !ctx.alive()) return;
      if (document.hidden) return; // resumes on visibilitychange
      let p = null;
      try {
        p = await api("/api/scan", { signal: ctx.signal });
        failures = 0;
        render(p);
        if (api_.onData) api_.onData(p, wasRunning);
        wasRunning = !!p.running;
      } catch (e) {
        if (isAbort(e)) return;
        failures++;
        SQA.message(msg, "Scan status unavailable: " + e.message, "error");
      }
      if (!stopped && ctx.alive()) timer = setTimeout(poll, p && p.running ? 1000 : Math.min(15000 * Math.max(1, failures), 60000));
    }
    const onVis = () => { if (!document.hidden) poll(); };
    document.addEventListener("visibilitychange", onVis);
    ctx.onCleanup(() => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVis); });

    /** Runs an admin call; 403 turns the controls off with the server's reason. */
    async function admin(path, json, working) {
      busy = true; syncButtons();
      if (working) SQA.message(msg, working);
      try {
        return await api(path, { method: "POST", json, admin: true, signal: ctx.signal });
      } catch (e) {
        if (e.status === 403) { adminOff = true; api_.offReason = e.message; syncAccess(); }
        throw e;
      } finally {
        busy = false; syncButtons(); syncToken();
      }
    }
    async function startScan(mode) {
      if (mode === "all") {
        const n = api_.info ? api_.info.families : null;
        const ok = await SQA.confirmDialog("Re-check the whole library?",
          `Every family${n ? ` (${int(n)})` : ""} is downloaded and checked again, and its stored report replaced. At the usual pace that takes ${n ? "about " + SQA.duration((n / 120) * 60) : "a while"}; the reports stay readable meanwhile.`,
          "Re-check everything");
        if (!ok) return;
      }
      try {
        const r = await admin("/api/scan", { mode }, "Starting…");
        if (r && r.started) SQA.message(msg, `Scan started: ${int(r.families)} ${r.families === 1 ? "family" : "families"} to check.`, "ok");
        else SQA.message(msg, r && r.reason === "nothing to check" ? "Nothing to check: every family is up to date." : "The scan did not start" + (r && r.reason ? ": " + r.reason : "."));
      } catch (e) {
        if (isAbort(e)) return;
        if (e.status === 409) SQA.message(msg, "A scan is already running; its progress is shown here.");
        else SQA.message(msg, e.message, "error");
      }
      poll();
    }
    bStale.addEventListener("click", () => startScan("stale"));
    bAll.addEventListener("click", () => startScan("all"));
    bCancel.addEventListener("click", async () => {
      try {
        await admin("/api/scan/cancel", undefined);
        SQA.message(msg, "Cancelling: the families being checked now finish first.");
      } catch (e) { if (!isAbort(e)) SQA.message(msg, e.message, "error"); }
      poll();
    });
    bCatalog.addEventListener("click", async () => {
      try {
        const r = await admin("/api/catalog/refresh", undefined, "Reading the catalog from Google Fonts…");
        SQA.message(msg, `Catalog refreshed: ${int(r && r.families)} families. “Check new and changed families” checks what changed.`, "ok");
        if (api_.onChange) api_.onChange();
      } catch (e) { if (!isAbort(e)) SQA.message(msg, e.message, "error"); }
    });
    bRebuild.addEventListener("click", async () => {
      const ok = await SQA.confirmDialog("Rebuild the baseline?",
        "The library norms are built again from the stored reports, and every report is judged again against them: levels can change across the library.", "Rebuild the baseline");
      if (!ok) return;
      try {
        const r = await admin("/api/library/rebuild", undefined, "Rebuilding the baseline and judging every report again…");
        SQA.message(msg, `Baseline ${r && r.id} built from ${int(r && r.fonts)} fonts; every report was judged again.`, "ok");
        if (api_.onChange) api_.onChange();
      } catch (e) {
        if (isAbort(e)) return;
        SQA.message(msg, e.status === 409 ? "Wait for the scan to finish before rebuilding the baseline." : e.message, "error");
      }
    });
    tokenForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = tokenInput.value.trim();
      if (!v) { tokenInput.focus(); return; }
      SQA.setToken(v);
      tokenInput.value = "";
      SQA.message(msg, "The token is kept for this tab only; the server checks it with the next action.");
      syncToken();
    });
    tokenForget.addEventListener("click", () => { SQA.setToken(""); SQA.message(msg, "Token forgotten."); syncToken(); tokenInput.focus(); });

    api_.start = () => { if (last) render(last); poll(); };
    api_.setInfo = (info) => {
      api_.info = info;
      if (info && info.admin_available === false) adminOff = true;
      else if (info && info.admin_available === true && !api_.offReason) adminOff = false;
      if (!last && info && info.scan) render(info.scan);
      syncAccess();
    };
    api_.note = (t, kind) => SQA.message(msg, t, kind);
    return api_;
  }

  // ---------------------------------------------------------------- charts
  function libraryCharts(ctx, grid) {
    let data = null;
    const panels = {};
    function panel(key, title, sub) {
      const subEl = h("p", { class: "figure-sub" }, sub || "");
      const stage = h("div", { class: "stage" });
      const cap = h("p", { class: "caption" });
      const foot = h("div");
      const p = h("div", { class: "panel" }, h("h3", { class: "figure-title", style: { fontFamily: "var(--sans)", marginTop: 0 } }, title), subEl, stage, cap, foot);
      grid.appendChild(p);
      panels[key] = { p, subEl, stage, cap, foot, chart: null, draw: null };
      return panels[key];
    }
    /** One observer per panel; a new render only swaps the drawing function. */
    function mount(pn, draw) {
      pn.draw = draw;
      if (!pn.chart) pn.chart = SQA.responsive(pn.stage, (w) => pn.draw(w), ctx);
      else pn.chart.redraw();
    }
    const pl = panel("loose", "Best-fit Looseness");
    const ps = panel("shape", "Shape error");
    const pc = panel("closest", "Closest preset");

    function examples(list) {
      const names = list.slice().sort((a, b) => (a.popularity || 1e9) - (b.popularity || 1e9)).slice(0, 5).map((r) => r.name);
      return names.length ? "e.g. " + names.join(", ") + (list.length > 5 ? " …" : "") : "";
    }

    function render(rows, info, lib, cat) {
      data = { rows: rows || [], info, lib, cat };
      const inCat = data.rows.filter((r) => r.best_looseness !== null && r.best_looseness !== undefined && (cat === "ALL" || r.category === cat));
      const judged = SQA.judgedCategory(lib, cat === "ALL" ? null : cat);
      const t = (lib && lib.thresholds) || (info && info.thresholds) || {};
      const catLabel = cat === "ALL" ? "all families" : cat;

      // Looseness
      const lo = -1.25, hi = 1.25, bw = 0.05;
      const L = SQA.binValues(inCat.map((r) => r.best_looseness), lo, hi, bw);
      L.bins.forEach((b) => { b.items = inCat.filter((r) => r.best_looseness >= b.x0 - 1e-9 && r.best_looseness < b.x1 - 1e-9 || (b.x1 >= hi - 1e-9 && r.best_looseness === hi)); });
      const underItems = inCat.filter((r) => r.best_looseness < lo - 1e-9), overItems = inCat.filter((r) => r.best_looseness > hi + 1e-9);
      const lMarkers = [{ x: -0.5, label: "Tight", cls: "marker-preset" }, { x: 0, label: "Standard", cls: "marker-preset" }, { x: 0.5, label: "Loose", cls: "marker-preset" }];
      let lCap = `${int(inCat.length)} ${catLabel === "all families" ? "families" : catLabel + " families"}, in steps of 0.05. The three presets are marked; families beyond ±1.25 are counted at the ends.`;
      if (judged && t.looseness_warn_z) {
        const d = judged.stats.best_looseness, sig = SQA.SIGMA * d.mad;
        if (sig > 0) {
          lMarkers.push({ x: d.median - t.looseness_warn_z * sig, label: "WARN", cls: "thr-warn" }, { x: d.median + t.looseness_warn_z * sig, label: "WARN", cls: "thr-warn" });
          lMarkers.push({ x: d.median - t.looseness_fail_z * sig, label: "FAIL", cls: "thr-fail" }, { x: d.median + t.looseness_fail_z * sig, label: "FAIL", cls: "thr-fail" });
          lCap += ` WARN beyond ${fmt(t.looseness_warn_z, 1)} and FAIL beyond ${fmt(t.looseness_fail_z, 1)} robust σ from the median of ${SQA.categoryName(judged.key)} (${signed(d.median, 2)}).`;
        }
      }
      pl.subEl.textContent = "Families per Looseness step · −0.5 tight, 0 standard, +0.5 loose";
      pl.cap.textContent = lCap;
      mount(pl, (w) => SQA.histogram(pl.stage, {
        width: w, height: 236, bins: L.bins, xMin: lo, xMax: hi, xTicks: [-1, -0.5, 0, 0.5, 1], xFormat: (v) => signed(v, 1),
        under: { n: L.under, label: "below −1.25" }, over: { n: L.over, label: "above +1.25" },
        markers: lMarkers, xLabel: "best-fit Looseness",
        ariaLabel: `Histogram of the best-fit Looseness of ${inCat.length} families. Use the arrow keys to read each bar.`,
        labelFor: (b) => `Looseness ${signed(b.x0, 2)} to ${signed(b.x1, 2)}: ${b.n} families`,
        tipFor: (b) => b.under ? { title: "Below −1.25", rows: [["Families", int(b.n)]], note: "Looseness down to " + signed(Math.min(...underItems.map((r) => r.best_looseness)), 2) + " — mostly connected scripts, whose letters touch. " + examples(underItems) }
          : b.over ? { title: "Above +1.25", rows: [["Families", int(b.n)]], note: examples(overItems) }
          : { title: `Looseness ${signed(b.x0, 2)} to ${signed(b.x1, 2)}`, rows: [["Families", int(b.n)]], note: examples(b.items || []) },
      }));
      pl.foot.textContent = "";
      SQA.tableToggle(pl.foot, [{ label: "Looseness", get: (r) => r.label }, { label: "Families", num: true, get: (r) => int(r.n) }],
        () => [].concat(L.under ? [{ label: "below −1.25", n: L.under }] : [], L.bins.map((b) => ({ label: `${signed(b.x0, 2)} to ${signed(b.x1, 2)}`, n: b.n })), L.over ? [{ label: "above +1.25", n: L.over }] : []),
        { caption: "Families per best-fit Looseness step" });

      // shape error
      const se = inCat.map((r) => r.shape_error).filter((v) => v !== null && v !== undefined).sort((a, b) => a - b);
      const sMarkers = [];
      let warnX = null, failX = null, sCap;
      if (judged && t.shape_warn_z) {
        const d = judged.stats.shape_error, sig = SQA.SIGMA * d.mad;
        warnX = d.median + t.shape_warn_z * sig; failX = d.median + t.shape_fail_z * sig;
        sMarkers.push({ x: d.median, label: "median", cls: "marker-preset" }, { x: warnX, label: `WARN ${fmt(warnX, 1)}`, cls: "thr-warn" }, { x: failX, label: `FAIL ${fmt(failX, 1)}`, cls: "thr-fail" });
        sCap = `WARN above ${fmt(warnX, 1)} (median + ${fmt(t.shape_warn_z, 1)} robust σ) and FAIL above ${fmt(failX, 1)} (+${fmt(t.shape_fail_z, 1)} σ), from ${SQA.categoryName(judged.key)} in the baseline${judged.fellBack ? ` (${cat} has too few fonts of its own)` : ""}.`;
      } else sCap = "WARN and FAIL thresholds appear here once a library baseline exists.";
      const p98 = se.length ? SQA.quantile(se, 0.98) : 40;
      let sHi = Math.max(20, p98, failX ? failX * 1.08 : 0);
      const sStep = SQA.niceStep(sHi, 44);
      sHi = Math.ceil(sHi / sStep) * sStep;
      const S = SQA.binValues(se, 0, sHi, sStep);
      S.bins.forEach((b) => { b.items = inCat.filter((r) => r.shape_error >= b.x0 - 1e-9 && r.shape_error < b.x1 - 1e-9); });
      const sOver = inCat.filter((r) => r.shape_error > sHi + 1e-9);
      ps.subEl.textContent = "Families per step · units per 1000 em, overall tightness taken out";
      ps.cap.textContent = `${int(se.length)} families. Lower is more even. ` + sCap;
      mount(ps, (w) => SQA.histogram(ps.stage, {
        width: w, height: 236, bins: S.bins, xMin: 0, xMax: sHi, xFormat: (v) => fmt(v, 0), over: { n: S.over, label: `above ${fmt(sHi, 0)}` },
        markers: sMarkers, xLabel: "shape error (units per 1000 em)",
        ariaLabel: `Histogram of the shape error of ${se.length} families. Use the arrow keys to read each bar.`,
        labelFor: (b) => `Shape error ${fmt(b.x0, 1)} to ${fmt(b.x1, 1)}: ${b.n} families`,
        tipFor: (b) => b.over ? { title: `Above ${fmt(sHi, 0)}`, rows: [["Families", int(b.n)]], note: examples(sOver) }
          : { title: `Shape error ${fmt(b.x0, 1)} to ${fmt(b.x1, 1)}`, rows: [["Families", int(b.n)]].concat(warnX !== null ? [["Level zone", b.x0 >= failX ? "FAIL" : b.x0 >= warnX ? "WARN" : "INFO"]] : []), note: examples(b.items || []) },
      }));
      ps.foot.textContent = "";
      SQA.tableToggle(ps.foot, [{ label: "Shape error", get: (r) => r.label }, { label: "Families", num: true, get: (r) => int(r.n) }],
        () => S.bins.map((b) => ({ label: `${fmt(b.x0, 1)} to ${fmt(b.x1, 1)}`, n: b.n })).concat(S.over ? [{ label: `above ${fmt(sHi, 0)}`, n: S.over }] : []),
        { caption: "Families per shape error step" });

      // closest
      const counts = { tight: 0, standard: 0, loose: 0 };
      inCat.forEach((r) => { if (r.closest in counts) counts[r.closest]++; });
      const total = inCat.length || 1;
      const crow = ["tight", "standard", "loose"].map((k) => ({
        label: SQA.PRESET_LABEL[k], value: counts[k], valueText: `${int(counts[k])} · ${fmt((100 * counts[k]) / total, 0)} %`,
        content: () => ({ title: SQA.PRESET_LABEL[k] + " preset", rows: [["Families", int(counts[k])], ["Share", fmt((100 * counts[k]) / total, 1) + " %"]], note: examples(inCat.filter((r) => r.closest === k)) }),
      }));
      pc.subEl.textContent = "Families whose spacing is nearest to each Kinetikern2 preset";
      pc.cap.textContent = "Nearest by the mean distance of all pair gaps. Being tight or loose is the designer's choice, never a problem in itself.";
      mount(pc, (w) => SQA.hbars(pc.stage, crow, { width: w, labelW: 82, valueW: 104, ariaLabel: `Families closest to each preset: ${crow.map((r) => r.label + " " + r.value).join(", ")}` }));
      pc.foot.textContent = "";
      SQA.tableToggle(pc.foot, [{ label: "Preset", get: (r) => r.label }, { label: "Families", num: true, get: (r) => int(r.value) }, { label: "Share", num: true, get: (r) => fmt((100 * r.value) / total, 1) + " %" }],
        () => crow, { caption: "Families closest to each preset" });
    }
    return { render };
  }

  // ---------------------------------------------------------------- table
  function familyTable(ctx, sec) {
    let rows = [], list = [], gen = 0;
    const search = h("input", { type: "search", placeholder: "Family or designer", "aria-describedby": "fam-count", autocomplete: "off", spellcheck: "false" });
    const selCat = h("select", null, h("option", { value: "" }, "All categories"), CATEGORIES.map((c) => h("option", { value: c }, c)));
    const selLevel = h("select", null);
    const selClosest = h("select", null, h("option", { value: "" }, "Any preset"), ["tight", "standard", "loose"].map((k) => h("option", { value: k }, SQA.PRESET_LABEL[k])));
    const selStatus = h("select", null,
      h("option", { value: "" }, "Any status"), h("option", { value: "current" }, "Checked, up to date"),
      h("option", { value: "stale" }, "Changed since checked"), h("option", { value: "unchecked" }, "Not checked yet"),
      h("option", { value: "out" }, "Out of the model's range (±6)"));
    const selFont = h("select", null);
    const reset = h("button", { type: "button", class: "btn small", hidden: true }, "Clear filters");
    const count = h("p", { id: "fam-count", class: "small", "aria-live": "polite", style: { margin: 0 } });
    const thead = h("thead");
    const tbody = h("tbody");
    const tbl = h("table", { class: "families" }, h("caption", { class: "sr-only" }, "Every family of the catalog with its latest result. Column headers sort."), thead, tbody);
    const wrap = h("div", { class: "table-wrap tall" }, tbl);
    const emptyEl = h("div", { class: "empty", hidden: true });
    sec.append(
      h("h2", { id: "table-h" }, "Families"),
      h("p", { class: "section-intro" }, "Every family in the catalog with its latest result. Families not checked yet are listed too: opening one checks it on the spot."),
      h("div", { class: "filters", role: "search", "aria-label": "Filter the families" },
        h("label", { class: "search" }, "Search", search),
        h("label", null, "Category", selCat),
        h("label", null, "Level", selLevel),
        h("label", null, "Closest", selClosest),
        h("label", null, "Status", selStatus),
        h("label", null, "Fonts", selFont),
        reset),
      wrap, emptyEl,
      h("div", { class: "table-foot" }, count, h("span", null, "Looseness bars: ", h("span", { style: { color: "var(--div-neg)" } }, "◀"), " tighter · looser ", h("span", { style: { color: "var(--div-pos)" } }, "▶"), " (bars to ±1) · ", h("span", { class: "vf" }, "VF · 12"), " a variable font checked at 12 locations of its designspace")));

    // header
    const tr = h("tr");
    COLS.forEach((c) => {
      const th = h("th", { scope: "col", class: c.num ? "num" : "", title: c.title });
      const b = h("button", { type: "button", class: "sort" }, c.label);
      b.addEventListener("click", () => {
        if (state.sort === c.key) state.dir = -state.dir;
        else { state.sort = c.key; state.dir = c.num || c.key === "level" || c.key === "checked" ? -1 : 1; }
        writeQuery();
        render(false);
      });
      th.appendChild(b);
      tr.appendChild(th);
    });
    thead.appendChild(tr);

    function syncControls() {
      search.value = state.q;
      selCat.value = state.cat;
      selLevel.value = state.level;
      selClosest.value = state.closest;
      selStatus.value = state.status;
      selFont.value = state.font;
      reset.hidden = !(state.q || state.cat || state.level || state.closest || state.status || state.font);
      [...thead.querySelectorAll("th")].forEach((th, i) => {
        if (COLS[i].key === state.sort) th.setAttribute("aria-sort", state.dir > 0 ? "ascending" : "descending");
        else th.removeAttribute("aria-sort");
      });
    }
    function levelOptions() {
      const counts = {};
      let none = 0;
      rows.forEach((r) => { if (r.level) counts[r.level] = (counts[r.level] || 0) + 1; else none++; });
      clear(selLevel);
      selLevel.appendChild(h("option", { value: "" }, "Any level"));
      ["ERROR", "FAIL", "WARN", "INFO", "PASS", "SKIP"].forEach((l) => selLevel.appendChild(h("option", { value: l }, `${l} (${int(counts[l] || 0)})`)));
      selLevel.appendChild(h("option", { value: "NONE" }, `Not checked (${int(none)})`));
      selLevel.value = state.level;
      clear(selFont);
      selFont.appendChild(h("option", { value: "" }, "All fonts"));
      Object.keys(FONT_FILTERS).forEach((k) => selFont.appendChild(h("option", { value: k }, `${FONT_FILTERS[k].label} (${int(rows.filter(FONT_FILTERS[k].test).length)})`)));
      selFont.value = state.font;
    }
    let debounce = null;
    search.addEventListener("input", () => { clearTimeout(debounce); debounce = setTimeout(() => { state.q = search.value; writeQuery(); render(false); }, 140); });
    const onSel = (key, el) => el.addEventListener("change", () => { state[key] = el.value; writeQuery(); render(false); });
    onSel("cat", selCat); onSel("level", selLevel); onSel("closest", selClosest); onSel("status", selStatus); onSel("font", selFont);
    reset.addEventListener("click", () => { state.q = state.cat = state.level = state.closest = state.status = state.font = ""; writeQuery(); render(false); search.focus(); });
    tbody.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const trEl = e.target.closest("tr[data-slug]");
      if (trEl && !window.getSelection().toString()) location.hash = "#/family/" + trEl.dataset.slug;
    });
    wrap.addEventListener("scroll", () => { state.scrollTop = wrap.scrollTop; }, { passive: true });

    // what is on screen: the rows' slugs in order and their markup (for in-place updates)
    let shown = [], shownHtml = [], complete = false;
    /**
     * Renders the filtered, sorted rows: the first screenful now, the rest
     * over the next frames. keepScroll (data refreshes during a scan): when
     * the order is unchanged only the rows that changed are replaced.
     */
    function render(keepScroll) {
      syncControls();
      list = filterRows(rows).sort(compare(state.sort, state.dir));
      const my = ++gen;
      const total = rows.length;
      count.textContent = list.length === total ? `${int(total)} families` : `Showing ${int(list.length)} of ${int(total)} families`;
      emptyEl.hidden = list.length > 0;
      wrap.hidden = list.length === 0;
      if (!list.length) {
        clear(emptyEl);
        emptyEl.append(rows.length ? "No family matches these filters. " : "The catalog is empty: the server could not read the Google Fonts family list yet. ",
          rows.length ? h("button", { type: "button", class: "linklike", onclick: () => reset.click() }, "Clear the filters") : "");
        tbody.innerHTML = "";
        shown = []; shownHtml = []; complete = false;
        return;
      }
      const html = list.map(rowHtml);
      if (keepScroll) {
        const same = complete && shown.length === list.length && list.every((r, i) => r.slug === shown[i]);
        if (same) {
          const trs = tbody.children;
          html.forEach((x, i) => { if (x !== shownHtml[i] && trs[i]) trs[i].outerHTML = x; });
        } else {
          const top = wrap.scrollTop;
          tbody.innerHTML = html.join("");
          wrap.scrollTop = top;
        }
        shown = list.map((r) => r.slug); shownHtml = html; complete = true;
        return;
      }
      wrap.scrollTop = 0;
      shown = list.map((r) => r.slug); shownHtml = html; complete = false;
      const first = 100, chunk = 200; // ~10 ms of work per frame: typing stays responsive
      tbody.innerHTML = html.slice(0, first).join("");
      let i = first;
      const step = () => {
        if (my !== gen || !ctx.alive()) return;
        if (i >= html.length) { complete = true; return; }
        tbody.insertAdjacentHTML("beforeend", html.slice(i, i + chunk).join(""));
        i += chunk;
        requestAnimationFrame(step);
      };
      if (html.length <= first) complete = true;
      else requestAnimationFrame(step);
    }
    return {
      setRows(r, keepScroll) {
        // coming back to the library: everything at once, where the reader left it
        const restore = !keepScroll && !rows.length && state.scrollTop > 0 ? state.scrollTop : 0;
        rows = r; levelOptions();
        render(keepScroll || restore > 0);
        if (restore) wrap.scrollTop = restore;
      },
      render, syncControls,
      error(e, retry) {
        clear(emptyEl); emptyEl.hidden = false; wrap.hidden = true;
        emptyEl.appendChild(SQA.errorBox(e, retry));
      },
    };
  }

  SQA.views = SQA.views || {};
  SQA.views.library = view;
})();
