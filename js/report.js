/*
 * Spacing QA — the report of one font (#/family/<slug>, and uploads): the
 * verdict, the preset it is closest to, the settings the check used and what
 * the others give, a connected script's joins (settings.js), a specimen
 * under every spacing, the glyph sides, the pairs (list and heat map) and
 * the kerning agreement.
 *
 * Units: geometry in font units; every number shown in units per 1000 em.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, s, clear, fmt, signed, int, pct, tip, badge, api, isAbort } = SQA;

  const SAMPLES = ["Hamburgefonstiv", "AVATAR TYPE WAVE", "Typography (spacing) / kerning?", "nonnnoon HOHHOOH", "“Kernel” [glyphs] {all} – 100% @ “once”…", "info@kinetikern.com • $9 · €5 · £3 ™"];
  const GROUP_LABEL = { upper: "Capitals", lower: "Lowercase", punct: "Punctuation and symbols", unscored: "Not scored: figures, symbols often drawn at figure width, underscore" };
  // the kernel's characters of ambiguous East Asian width: not scored in a CJK font
  const CJK_WIDTH = "®°·×÷–—‘’“”•…€™";
  /** Why a glyph is not scored, for notes and tooltips. */
  function unscoredWhy(g, face) {
    return face && face.cjk && CJK_WIDTH.includes(g.char)
      ? "in a CJK font this punctuation follows CJK conventions (often full-width)"
      : "fonts often give it a fixed (tabular) width, or it joins its neighbours";
  }
  /** What a report covers, for the page's words: the GF Latin Kernel (114
   *  glyphs, 88 scored) or, for an older report, the 76-glyph core set. */
  function coverage(r) {
    const g = (r.detail && r.detail.glyphs) || [];
    const kernel = g.length > 76 || !!r.method;
    const scored = g.filter((x) => x.scored).length;
    return {
      kernel, glyphs: g.length, scored,
      what: kernel
        ? "the glyphs of Google Fonts’ GF Latin Kernel — A–Z, a–z, 0–9, punctuation and symbols, 114 in all"
        : "the font's 76 core glyphs — A–Z, a–z, 0–9 and 14 punctuation marks",
      unscored: kernel
        ? "figures, the symbols fonts often draw at the figure width ($ ¢ £ ¥ € + − × ÷ = < > # ^ ~) and the underscore, which joins its neighbours, are spaced and drawn but not scored"
        : "figures are spaced but not scored, because many fonts make them tabular",
    };
  }
  // what to do about a skip or an error (the reason itself says what happened)
  const CODE_HELP = {
    "spacing/no-outlines": "The font has no outlines the check can read (for example a bitmap or colour-only font).",
    "spacing/unreadable": "The file could not be read as a TrueType or OpenType font.",
    "spacing/unavailable": "The font could not be downloaded from Google Fonts. This is usually temporary: re-check later.",
    "spacing/error": "The spacing engine could not measure this font.",
    "spacing/fixed-widths": "Every letter has one of two or three advance widths — a multi-pitch design such as Trispace (500, 650 and 850 units per 1000 em) or a barcode — so, as in a monospaced font, the spacing is set by the widths and there are no sidebearings or kerning of a proportional font to compare with the model.",
    "spacing/decorated": "Its figures touch the letters as set, as an underline, a chart, guide lines or an effect make every glyph touch its neighbours (a script's figures stand apart). Spacing such a font would break the line or grid, so there is nothing to compare: the plugin's Keep joins keeps every side that touches.",
  };

  // ---------------------------------------------------------------- helpers
  function section(root, id, title, intro) {
    const sec = h("section", { "aria-labelledby": id });
    sec.appendChild(h("h2", { id, tabindex: "-1" }, title));
    if (intro) sec.appendChild(typeof intro === "string" ? h("p", { class: "section-intro" }, intro) : intro);
    root.appendChild(sec);
    return sec;
  }
  const per1000 = (face, v) => v * face.per;
  function percentileOf(dist, x) {
    if (!dist || !dist.q || dist.q.length < 2) return null;
    const k = dist.q.filter((q) => q <= x).length;
    return Math.max(0, Math.min(100, k - 1));
  }
  /**
   * The norms the server judges a report against, as library.rs judge():
   * the compared category's side and pair norms when the baseline has them,
   * else the whole library's.
   */
  function normsFor(r, lib) {
    if (!lib || !lib.categories) return null;
    let key = r.status && r.status.compared_with;
    if (!key || !lib.categories[key]) { const j = SQA.judgedCategory(lib, r.font && r.font.category); key = j ? j.key : "ALL"; }
    const own = !!(lib.category_sides && lib.category_sides[key]);
    return {
      key,
      stats: lib.categories[key] || lib.categories.ALL || null,
      sides: (lib.category_sides && lib.category_sides[key]) || lib.sides || {},
      pairs: (lib.category_pairs && lib.category_pairs[key]) || lib.pairs || [],
      name: own ? SQA.categoryName(key) : "the whole library",
      t: lib.thresholds || {},
    };
  }
  /** Quotes of ambiguous East Asian width set full-width (a CJK convention)
   *  are not compared with the norms — the server's rule (library.rs). */
  const AMBIGUOUS_WIDTH = ["\u2018", "\u2019", "\u201C", "\u201D"];
  function fullWidth(face, t) {
    const em = t && t.fullwidth_em;
    return face.glyphs.map((g) => !!em && AMBIGUOUS_WIDTH.includes(g.char) && g.adv >= em * face.upm);
  }
  function ordinal(n) {
    n = Math.round(n);
    const m100 = n % 100, m10 = n % 10;
    const suf = m100 >= 11 && m100 <= 13 ? "th" : m10 === 1 ? "st" : m10 === 2 ? "nd" : m10 === 3 ? "rd" : "th";
    return n + suf;
  }

  // ---------------------------------------------------------------- the report
  /**
   * Renders a report. opts: {mode: "family"|"upload", slug, info, library,
   * families (rows, for the distribution without a baseline), onRecheck(), fileName,
   * designspace (the locations to show when they are not the report's own: a
   * picked location shows its family's), dsHref(row)/dsPick(row) (show a
   * location), checkAll (an upload's "check every location"), picked ({name,
   * desc, redundant, backHref | back()}: the report is of a picked location)}
   */
  function renderReport(ctx, root, report, opts) {
    const o = opts || {};
    const sum = report.summary;
    const face = report.detail && report.detail.glyphs && report.detail.glyphs.length ? new SQA.Face(report) : null;
    if (face) root.appendChild(face.defs());
    const ds = SQA.designspace ? SQA.designspace.model(o.designspace || ownDesignspace(report)) : null;
    header(root, report, o, !!ds);
    const vsec = verdict(root, report, o);
    if (!sum || !face) { notChecked(root, report, o); if (ds) designspace(ctx, root, ds, o); technical(root, report); return; }
    keyNumbers(vsec, report, o);
    if (ds) designspace(ctx, root, ds, o);
    closest(ctx, root, report, o);
    if (SQA.settings) {
      SQA.settings.settings(ctx, root, report, face, o);
      SQA.settings.joins(ctx, root, report, face, o);
    }
    if (SQA.explain) {
      SQA.explain.harness(ctx, root, report, face, o);
      SQA.explain.shape(ctx, root, report, face, o);
    }
    specimen(ctx, root, report, face);
    sides(ctx, root, report, face, o);
    pairs(ctx, root, report, face, o);
    kerning(ctx, root, report, face);
    technical(root, report);
  }

  /** A variable font's own designspace: the locations its report was checked
   *  at (none yet: its default location, and any other can be picked). */
  function ownDesignspace(r) {
    const f = r.font || {};
    const inst = Array.isArray(r.instances) ? r.instances : [];
    // a picked location's report is shown with its family's designspace (opts.designspace)
    if (!f.axes || !f.axes.length || f.instance || (!inst.length && !r.summary)) return null;
    const from = r.instancesFrom || null;
    return { axes: f.axes, main: f.location, instances: inst, italic: r.italic || null, mainReport: r, reasons: from ? from.reasons : (r.status && r.status.reasons) || [], from };
  }
  function designspace(ctx, root, ds, o) {
    const per = o.dsSeconds || pickSeconds();
    SQA.designspace.section(ctx, root, ds, {
      current: o.picked ? o.picked.location : null,
      href: o.dsHref || null, pick: o.dsPick || null,
      where: o.mode === "upload" ? SQA.WHERE : SQA.STATIC ? "in your browser" : "on the server",
      seconds: per, checkAll: o.checkAll || null,
      unchecked: o.mode === "upload" ? "" : SQA.STATIC ? " — the next scheduled scan checks them" : " — the next scan checks them",
    });
  }
  /** Seconds one location's check takes: in the browser, what one took here (when known). */
  const pickSeconds = () => (SQA.STATIC ? (SQA.wasm && SQA.wasm.lastMs ? Math.max(1, SQA.wasm.lastMs / 1000) : 3) : 2);
  /** "Showing Bold (wght 700) — checked live just now, not stored · Back to the main report (Regular)" */
  function pickBanner(p, text) {
    const back = p.backHref ? h("a", { href: p.backHref }, "Back to the main report (Regular)")
      : h("button", { type: "button", class: "linklike", onclick: p.back }, "Back to the main report (Regular)");
    return h("div", { class: "pick-banner" },
      h("span", null, text[0], h("b", null, p.name), p.desc && !p.redundant ? ` (${p.desc})` : "", text[1]), back);
  }
  /**
   * The page while a location is checked: the font, what is being checked and
   * its designspace (to pick another). p: {crumbs, eyebrow, title, picked,
   * sub, model, dsOpts}. Returns {fail(err, retry)}.
   */
  function renderPicking(ctx, root, p) {
    const head = h("header", { class: "view-head report-head" });
    if (p.crumbs) head.appendChild(p.crumbs);
    head.appendChild(h("p", { class: "eyebrow" }, p.eyebrow || ""));
    head.appendChild(h("h1", { tabindex: "-1" }, p.title));
    let banner = pickBanner(p.picked, ["Checking ", "…"]);
    head.appendChild(banner);
    root.appendChild(head);
    const slot = h("div", null, SQA.loading(`Checking ${p.picked.label}…`, p.sub));
    root.appendChild(slot);
    if (p.model) SQA.designspace.section(ctx, root, p.model, p.dsOpts || {});
    return {
      fail(err, retry) {
        const b = pickBanner(p.picked, ["Could not check ", ""]);
        banner.replaceWith(b);
        banner = b;
        clear(slot);
        slot.appendChild(SQA.errorBox(err, retry));
      },
    };
  }

  function header(root, r, o, hasDs) {
    const f = r.font || {};
    const name = f.family || o.fileName || f.file || "Font";
    const head = h("header", { class: "view-head report-head" });
    if (o.mode === "upload") head.appendChild(h("p", { class: "crumbs" }, h("span", { class: "muted" }, `Uploaded font — checked ${SQA.WHERE}, not stored`)));
    else head.appendChild(h("p", { class: "crumbs" }, h("a", { href: SQA.libraryHref ? SQA.libraryHref() : "#/" }, "← Library")));
    // a picked location: its name, not the file's default style
    head.appendChild(h("p", { class: "eyebrow" }, [f.category || "Category unknown", f.instance || f.style || null, f.italic && !f.instance ? "Italic" : null].filter(Boolean).join(" · ")));
    head.appendChild(h("h1", { tabindex: "-1" }, name));
    if (o.picked) head.appendChild(pickBanner(o.picked, ["Showing ", o.mode === "upload" ? ` — checked ${SQA.WHERE} just now, not stored` : " — checked live just now, not stored"]));
    const meta = h("div", { class: "meta" });
    const item = (label, ...val) => meta.appendChild(h("span", null, label ? label + " " : "", ...val));
    if (f.designers && f.designers.length) item("Designed by", h("b", null, f.designers.join(", ")));
    if (f.version) item("", h("b", null, f.version.replace(/;.*$/, "")));
    if (f.upm) item("", h("b", null, int(f.upm)), " units per em");
    if (f.primary_script && f.primary_script !== "Latn") item("Primary script", h("b", null, SQA.scriptName(f.primary_script)), " — Latin is secondary");
    if (f.axes && f.axes.length) {
      const loc = Object.entries(f.location || {}).map(([k, v]) => `${k} ${SQA.axisNum(v)}`).join(", ");
      item("Variable:", h("b", null, f.axes.map((a) => `${a.tag} ${SQA.axisNum(a.min)}–${SQA.axisNum(a.max)}`).join(", ")), loc ? ` · checked at ${loc}` : "");
    }
    if (f.file) {
      const url = f.source && f.source.url;
      item("File", url ? h("a", { href: url, rel: "noopener", target: "_blank" }, f.file) : h("b", null, f.file));
    }
    if (r.generated) item("Checked", h("b", { title: r.generated }, SQA.fmtDateTime(r.generated)), ` (${SQA.ago(r.generated)})`);
    if (r.status && r.status.baseline) item("Baseline", h("b", null, r.status.baseline), r.status.compared_with ? ` · compared with ${SQA.categoryName(r.status.compared_with)}` : "");
    else if (r.summary && f.italic) item("Baseline", h("b", null, "not used"), " — an italic on its own is not judged against the library's norms");
    else if (r.summary) item("Baseline", h("b", null, "none"), " — nothing judged against the library's norms");
    head.appendChild(meta);
    const actions = h("div", { class: "report-actions" });
    if (o.mode !== "upload" && o.onRecheck) {
      const b = h("button", { type: "button", class: "btn", title: SQA.STATIC ? "Checks the family's current file from fonts.google.com in your browser, for you: nothing is stored or published." : "" }, "Re-check now");
      b.addEventListener("click", () => o.onRecheck(b));
      actions.appendChild(b);
    }
    // a published copy that takes requests: ask its workflow to check the
    // family again and publish the new report for everyone (a GitHub issue)
    const request = o.mode === "family" ? SQA.requestUrl(o.familyName || name, o.familyKey) : "";
    if (request) {
      actions.appendChild(h("a", {
        class: "btn", href: request, target: "_blank", rel: "noopener",
        title: "Opens a GitHub issue (a GitHub account is needed). The site's workflow checks the family again from fonts.google.com, publishes the new report for everyone, answers on the issue and closes it, usually within 15 minutes.",
      }, "Request a new check"));
    }
    // a picked location's file names say where it was checked
    const base = (o.slug || SQA.slug(name)) + (f.instance ? "-" + SQA.slug(f.instance) : "");
    const dl = h("button", { type: "button", class: "btn" }, "Download JSON");
    dl.addEventListener("click", () => SQA.download(`${base}.spacing-report.json`, JSON.stringify(r, null, 2)));
    actions.appendChild(dl);
    // the same Markdown the server and the CLI write (FAIL.md, `check --format markdown`)
    const md = h("button", { type: "button", class: "btn" }, "Download Markdown");
    md.addEventListener("click", async () => {
      md.disabled = true;
      const label = md.textContent;
      md.textContent = "Writing Markdown…";
      try {
        const text = await SQA.api("/api/markdown", { method: "POST", json: r });
        SQA.download(`${base}.spacing-report.md`, String(text), "text/markdown");
      } catch (e) {
        if (!SQA.isAbort(e)) {
          let msgEl = actions.querySelector(".md-msg");
          if (!msgEl) { msgEl = h("p", { class: "msg md-msg" }); actions.appendChild(msgEl); }
          SQA.message(msgEl, "The Markdown could not be written: " + e.message, "error");
          msgEl.classList.add("md-msg");
        }
      } finally {
        md.disabled = false;
        md.textContent = label;
      }
    });
    actions.appendChild(md);
    if (o.mode !== "upload" && f.family && (!f.source || f.source.kind === "live")) {
      actions.appendChild(h("a", { class: "btn", href: "https://fonts.google.com/specimen/" + encodeURIComponent(f.family).replace(/%20/g, "+"), target: "_blank", rel: "noopener" }, "Open on Google Fonts"));
    }
    head.appendChild(actions);
    if (o.mode === "upload") head.appendChild(h("p", { class: "note", style: { marginTop: "14px" } }, SQA.STATIC
      ? "This font was checked in your browser and was not uploaded anywhere: the report exists only in this page. Download it to keep it."
      : "This font was checked in memory and is not stored on the server: the report exists only in this page. Download it to keep it."));
    if (r.summary) {
      const nav = h("nav", { class: "onpage", "aria-label": "On this page" });
      [["verdict-h", "Verdict"], hasDs ? ["designspace-h", "Designspace"] : null, ["closest-h", "Closest preset"], r.settings && r.settings.variants && r.settings.variants.length ? ["settings-h", "Settings"] : null, r.joins ? ["joins-h", "Joins"] : null, r.summary.bare ? ["harness-h", "Designer harness"] : null, ["shape-h", "Shape error"], ["specimen-h", "Specimen"], ["sides-h", "Glyph sides"], ["pairs-h", "Pairs"], ["heat-h", "Heat map"], ["kern-h", "Kerning"]].filter(Boolean).forEach(([id, label]) => {
        const a = h("a", { href: "#" + id }, label);
        a.addEventListener("click", (e) => {
          e.preventDefault();
          const t = document.getElementById(id);
          if (t) { t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); t.focus({ preventScroll: true }); }
        });
        nav.appendChild(a);
      });
      head.appendChild(nav);
    }
    root.appendChild(head);
  }

  function verdict(root, r, o) {
    const st = r.status || { level: "ERROR", reasons: [] };
    const sec = section(root, "verdict-h", "Verdict");
    const reasons = (st.reasons || []).slice().sort((a, b) => SQA.LEVEL_RANK[b.level] - SQA.LEVEL_RANK[a.level]);
    // what raised the level: the library's norms, a location of the
    // designspace, broken joins — one or more of them
    const raised = reasons.filter((x) => x.level === st.level).map((x) => x.code);
    const joins = reasons.some((x) => x.code === "spacing/joins-broken" && SQA.LEVEL_RANK[x.level] >= SQA.LEVEL_RANK.WARN);
    const located = raised.includes("spacing/instances");
    const norms = raised.some((x) => x !== "spacing/joins-broken" && x !== "spacing/instances");
    const fail = st.level === "FAIL";
    const parts = [
      norms ? `the spacing falls ${fail ? "very " : ""}far outside the library's norms` : null,
      located ? (fail ? "a named instance of its designspace falls very far outside the library's norms" : "a location of its designspace stands far from the norms or from its neighbours") : null,
      joins ? "joins are broken in the font" : null,
    ].filter(Boolean);
    const text = (st.level === "WARN" || fail) && parts.length ? `${fail ? "Fails" : "Worth a look"}: ${parts.join(", and ")}.`
      : SQA.LEVEL_TEXT[st.level] || "";
    const box = h("div", { class: "panel verdict" },
      badge(st.level, { big: true }),
      h("div", null,
        h("p", { class: "verdict-text" }, text),
        h("ul", { class: "reasons" }, reasons.map((x) => h("li", null,
          h("span", null, badge(x.level)),
          h("span", null, h("span", { class: "code" }, x.code), x.message))))));
    sec.appendChild(box);
    const lib = o.library;
    if (r.summary && !st.baseline && !r.font.italic) {
      sec.appendChild(h("p", { class: "small" }, lib
        ? `This report was made without a library baseline, so nothing in it was judged against the library's norms (only broken joins raise a level without one); the comparisons below use the current baseline ${lib.id}. Re-check to judge it.`
        : "No library baseline was used: nothing is judged against the library's norms until one is built from the library's reports (joins broken in the font are WARN regardless). The comparisons below use the families checked so far."));
    } else if (r.summary && st.baseline && lib && lib.id && st.baseline !== lib.id) {
      sec.appendChild(h("p", { class: "note", style: { marginTop: "10px" } }, `The level and reasons above were judged against baseline ${st.baseline}; the library comparisons below use the server's current baseline ${lib.id}, so their numbers can differ slightly until the report is judged again.`));
    }
    return sec;
  }

  function notChecked(root, r, o) {
    const st = r.status || {};
    const first = (st.reasons || [])[0] || {};
    const sec = section(root, "what-h", st.level === "SKIP" ? "Why this font was skipped" : "Why the check did not finish");
    sec.appendChild(h("div", { class: `callout lvl-${st.level}` },
      h("p", { style: { marginTop: 0, fontSize: "17px", color: "var(--ink)" } }, first.message || "No reason was given."),
      CODE_HELP[first.code] ? h("p", null, CODE_HELP[first.code]) : null,
      st.level === "ERROR" && o.onRecheck ? h("p", null, h("button", { type: "button", class: "btn", onclick: (e) => o.onRecheck(e.currentTarget) }, "Re-check now")) : null));
    sec.appendChild(h("h3", null, "What the check covers"));
    sec.appendChild(h("p", { class: "section-intro" }, "Kinetikern2 spaces and kerns the glyphs of Google Fonts’ GF Latin Kernel — A–Z, a–z, 0–9, punctuation and symbols, 114 in all, each against every other — from their outlines, at a tight, a standard and a loose preset and at the Looseness that fits the font best, with its designer harness and without it, and compares the designer's spacing with each. Letters, punctuation and most symbols are scored; figures, the symbols fonts often draw at the figure width and the underscore are spaced and drawn but not scored. Skipped: monospaced fonts and fonts whose every letter has one of two or three widths (a multi-pitch design or a barcode), designs whose glyphs touch by construction (a line, a grid, a background or an effect through every glyph), fonts without the basic Latin alphabet, fonts without outlines, and files that are not fonts."));
  }

  function keyNumbers(sec, r, o) {
    const sm = r.summary;
    const N = normsFor(r, o.library);
    const med = (k) => (N && N.stats ? N.stats[k] : null);
    const ctxLine = (k, d) => { const m = med(k); return m && m.n ? `library median ${fmt(m.median, d)}${percentileOf(m, sm[k]) !== null ? ` · ${ordinal(percentileOf(m, sm[k]))} percentile` : ""}` : ""; };
    const stats = h("div", { class: "stats" });
    const tile = (value, label, delta) => stats.appendChild(h("div", { class: "stat" }, h("div", { class: "stat-value" }, value), h("div", { class: "stat-label" }, label), delta ? h("div", { class: "stat-delta" }, delta) : null));
    tile(signed(sm.best_looseness, 2), r.settings && r.settings.fit === "joins" ? "Looseness (a connected script: matched to its joined letters; −0.5 tight · 0 standard · +0.5 loose)" : "best-fit Looseness (−0.5 tight · 0 standard · +0.5 loose)", ctxLine("best_looseness", 2));
    tile(fmt(sm.shape_error, 1), "shape error: gaps that depart from even spacing of these shapes", ctxLine("shape_error", 1));
    tile(fmt(sm.sidebearing_error, 1), "sidebearing error per side, offset removed", ctxLine("sidebearing_error", 1));
    tile(sm.kerned_error !== null && sm.kerned_error !== undefined ? fmt(sm.kerned_error, 1) : "–", `shape error on the ${int(sm.kerned_pairs)} pairs the designer kerned`, ctxLine("kerned_error", 1));
    tile(sm.kern_r !== null && sm.kern_r !== undefined ? fmt(sm.kern_r, 2) : "–", "kerning correlation r with the model", sm.kern_sign !== null && sm.kern_sign !== undefined ? `same direction on ${pct(sm.kern_sign)} of kerned pairs` : "the designer kerned none of the scored pairs");
    const cov = coverage(r);
    const cjk = r.font && r.font.cjk ? " · a CJK font: its punctuation of ambiguous width is not scored" : "";
    tile(int(sm.pairs), "scored pairs measured", (sm.missing && sm.missing.length ? `missing from the font: ${sm.missing.join(" ")}` : `all ${cov.scored} scored glyphs present${cov.kernel ? ` · ${int(cov.glyphs * cov.glyphs)} pairs drawn in all` : ""}`) + cjk);
    if (sm.bare) {
      const d = sm.shape_error - sm.bare.shape_error;
      tile(signed(d, 1), "shape error from the designer harness", `${fmt(sm.bare.shape_error, 1)} without it, ${fmt(sm.shape_error, 1)} with it: ${d < -0.05 ? "closer to this font" : d > 0.05 ? "further from this font" : "no change"}`);
    }
    sec.appendChild(h("p", { class: "small", style: { marginBottom: 0 } }, "All numbers in units per 1000 em."));
    sec.appendChild(stats);
    // the shape error, explained further down
    const go = (id) => () => {
      const t = document.getElementById(id);
      if (t) { t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); t.focus({ preventScroll: true }); }
    };
    sec.appendChild(h("p", { class: "small" },
      h("button", { type: "button", class: "linklike", onclick: go("shape-h") }, "What the shape error is made of"), " — the pairs and glyphs behind it, drawn",
      sm.bare ? [" · ", h("button", { type: "button", class: "linklike", onclick: go("harness-h") }, "The designer harness, with it and without it")] : null));
  }

  // ---------------------------------------------------------------- closest
  function closest(ctx, root, r, o) {
    const sm = r.summary;
    const sec = section(root, "closest-h", "Closest to",
      (SQA.withHarness(r)
        ? "The designer's gaps compared with Kinetikern2's three presets, with its designer harness (see About)."
        : "The designer's gaps compared with Kinetikern2's three presets — the bare model: this report was checked before the designer harness.") +
      " Distance is the mean absolute difference of the scored pairs' gaps, overall offset included; which preset is nearest is a matter of overall tightness — a designer's choice.");
    const cards = h("div", { class: "preset-cards" });
    const bare = sm.bare || null;
    (sm.presets || []).forEach((p, k) => {
      const isClosest = p.name === sm.closest;
      const loose = p.offset > 0;
      const bp = bare && bare.presets ? bare.presets[k] : null;
      cards.appendChild(h("div", { class: "preset-card" + (isClosest ? " closest" : "") },
        isClosest ? h("span", { class: "closest-flag" }, "Closest") : null,
        h("h3", null, SQA.PRESET_LABEL[p.name] || p.name, h("small", null, `Looseness ${signed(p.looseness, 1)}`)),
        h("div", { class: "big" }, fmt(p.distance, 1)),
        h("div", { class: "lab" }, "mean gap distance (units per 1000 em)"),
        h("dl", null,
          h("dt", null, "Overall offset"), h("dd", null, signed(p.offset, 1)),
          h("dt", null, "Shape error at this preset"), h("dd", null, fmt(p.shape_error, 1)),
          bp ? h("dt", null, "Without the harness") : null,
          bp ? h("dd", null, `${fmt(bp.distance, 1)} distance · ${fmt(bp.shape_error, 1)} shape error${bare.closest === p.name && !isClosest ? " · closest without it" : ""}`) : null),
        h("p", { class: "small", style: { margin: "8px 0 0" } }, Math.abs(p.offset) < 0.5 ? "On average the font sets its gaps as this preset does." : `On average the font sets its gaps ${fmt(Math.abs(p.offset), 1)} units ${loose ? "looser" : "tighter"} than this preset.`)));
    });
    sec.appendChild(cards);
    if (bare && bare.closest !== sm.closest) sec.appendChild(h("p", { class: "small" }, `Without the designer harness the font would be closest to the ${SQA.PRESET_LABEL[bare.closest] || bare.closest} preset: the harness moves the model's overall tightness a little (most of all around punctuation), and the font sits between two presets.`));

    // the Looseness scale with the category behind it
    const lib = o.library;
    let dist = null;
    const lo = -1.25, hi = 1.25, bw = 0.05;
    const N = normsFor(r, lib);
    if (N && N.stats && N.stats.best_looseness && N.stats.best_looseness.q && N.stats.best_looseness.q.length > 1) {
      const d = N.stats.best_looseness;
      dist = Object.assign(SQA.binsFromQuantiles(d.q, d.n, lo, hi, bw), { median: d.median, n: d.n, label: `${int(d.n)} ${N.key === "ALL" ? "fonts of the library" : SQA.categoryName(N.key)} in baseline ${lib.id}`, pctl: percentileOf(d, sm.best_looseness) });
    }
    if (!dist && o.families) {
      const c = r.font.category;
      const vals = o.families.filter((x) => x.best_looseness !== null && x.best_looseness !== undefined && (!c || x.category === c)).map((x) => x.best_looseness);
      if (vals.length >= 5) {
        const b = SQA.binValues(vals, lo, hi, bw);
        const sorted = vals.slice().sort((a, b2) => a - b2);
        dist = Object.assign(b, { median: SQA.quantile(sorted, 0.5), n: vals.length, label: `${int(vals.length)} ${c ? c + " " : ""}families checked so far (no baseline yet)`, pctl: (100 * sorted.filter((v) => v <= sm.best_looseness).length) / sorted.length });
      }
    }
    const fig = h("div", { class: "figure panel" });
    fig.appendChild(h("div", { class: "figure-head" }, h("div", null, h("h3", { class: "figure-title", style: { fontFamily: "var(--sans)", margin: 0 } }, "Where the font sits on the Looseness scale"),
      h("p", { class: "figure-sub" }, dist ? `Grey: ${dist.label}` : "No library distribution to compare with yet."))));
    const stage = h("div", { class: "stage" });
    fig.appendChild(stage);
    const v = sm.best_looseness;
    fig.appendChild(h("p", { class: "caption" }, `Best fit ${signed(v, 2)}` + (dist && dist.pctl !== null && dist.pctl !== undefined ? ` — the ${ordinal(dist.pctl)} percentile; median ${signed(dist.median, 2)}.` : ".") +
      (SQA.outOfRange(v) ? (v < 0 ? " The fit stopped at its limit (−6): the font is set tighter than anything the model makes, as scripts and designs whose letters touch or overlap can be. Its comparison with the model is reported, not judged; broken joins and the designspace's locations still are." : " The fit stopped at its limit (+6): the font is set looser than anything the model makes. Its comparison with the model is reported, not judged; broken joins and the designspace's locations still are.") : "")));
    sec.appendChild(fig);
    SQA.responsive(stage, (w) => looseScale(stage, w, v, dist, sm.presets), ctx);
    SQA.tableToggle(fig, [{ label: "Marker", get: (x) => x[0] }, { label: "Looseness", num: true, get: (x) => x[1] }],
      () => [["This font (best fit)", signed(v, 2)]].concat(dist ? [["Median of the comparison", signed(dist.median, 2)]] : [], (sm.presets || []).map((p) => [SQA.PRESET_LABEL[p.name] + " preset", signed(p.looseness, 1)])),
      { caption: "The font's best-fit Looseness and the presets" });
  }

  function looseScale(container, W, v, dist, presets) {
    clear(container);
    const H = 156, l = 18, rgt = 18, axisY = 104;
    const lo = -1.25, hi = 1.25;
    const X = (x) => l + ((Math.max(lo, Math.min(hi, x)) - lo) / (hi - lo)) * (W - l - rgt);
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "chart", role: "img", "aria-label": `Looseness scale from −1.25 to +1.25: this font's best fit is ${signed(v, 2)}.` });
    const items = [];
    if (dist) {
      const maxN = Math.max(...dist.bins.map((b) => b.n), 1e-9);
      const top = axisY - 62;
      const Y = (n) => axisY - (n / maxN) * (axisY - top);
      let d = `M${X(dist.bins[0].x0)},${axisY}`;
      dist.bins.forEach((b) => { d += `V${Y(b.n).toFixed(1)}H${X(b.x1).toFixed(1)}`; });
      d += `V${axisY}Z`;
      root.appendChild(s("path", { d, class: "dist" }));
      let line = `M${X(dist.bins[0].x0)},${axisY}`;
      dist.bins.forEach((b) => { line += `V${Y(b.n).toFixed(1)}H${X(b.x1).toFixed(1)}`; });
      root.appendChild(s("path", { d: line + `V${axisY}`, class: "dist-line" }));
      dist.bins.forEach((b) => {
        const hit = s("rect", { x: X(b.x0), y: top - 4, width: Math.max(1, X(b.x1) - X(b.x0)), height: axisY - top + 4, class: "hit" });
        hit.addEventListener("pointermove", (e) => tip.show({ title: `Looseness ${signed(b.x0, 2)} to ${signed(b.x1, 2)}`, rows: [["Fonts", fmt(b.n, b.n < 10 && b.n % 1 ? 1 : 0)]], note: dist.label }, e.clientX, e.clientY));
        hit.addEventListener("pointerleave", () => tip.hide());
        root.appendChild(hit);
      });
      const mx = X(dist.median);
      root.appendChild(s("line", { x1: mx, x2: mx, y1: top - 8, y2: axisY, class: "dist-line", style: "stroke-width:1.5" }));
      root.appendChild(s("text", { x: mx, y: top - 12, "text-anchor": mx < 60 ? "start" : mx > W - 60 ? "end" : "middle", class: "muted-label halo" }, "median"));
    }
    root.appendChild(s("line", { x1: l, x2: W - rgt, y1: axisY, y2: axisY, class: "axis" }));
    [-1, 0, 1].forEach((t) => root.appendChild(s("text", { x: X(t), y: axisY + 44, "text-anchor": "middle", class: "tick" }, signed(t, 1))));
    (presets || []).forEach((p) => {
      const x = X(p.looseness);
      root.appendChild(s("line", { x1: x, x2: x, y1: axisY - 8, y2: axisY + 8, class: "marker" }));
      const t = s("text", { x, y: axisY + 24, "text-anchor": "middle", class: "label-strong", style: "font-size:12px" }, SQA.PRESET_LABEL[p.name] || p.name);
      root.appendChild(t);
      items.push({ node: t, content: { title: `${SQA.PRESET_LABEL[p.name]} preset`, rows: [["Looseness", signed(p.looseness, 1)], ["Distance", fmt(p.distance, 1)], ["Offset", signed(p.offset, 1)]] }, label: `${SQA.PRESET_LABEL[p.name]} preset at ${signed(p.looseness, 1)}` });
    });
    const fx = X(v);
    const off = v < lo || v > hi;
    const mk = s("circle", { cx: fx, cy: axisY, r: 7, class: "font-marker" });
    root.appendChild(mk);
    const label = (off ? (v < lo ? "‹ " : "") : "") + `This font ${signed(v, 2)}` + (off && v > hi ? " ›" : "");
    const anchor = fx < 70 ? "start" : fx > W - 70 ? "end" : "middle";
    root.appendChild(s("text", { x: fx, y: axisY - 14, "text-anchor": anchor, class: "label-strong halo" }, label));
    const content = { title: "This font", rows: [["Best-fit Looseness", signed(v, 2)]].concat(dist && dist.pctl !== null && dist.pctl !== undefined ? [["Percentile", ordinal(dist.pctl)]] : []), note: off ? "Outside the drawn scale." : "" };
    const hitM = s("circle", { cx: fx, cy: axisY, r: 14, class: "hit" });
    hitM.addEventListener("pointermove", (e) => tip.show(content, e.clientX, e.clientY));
    hitM.addEventListener("pointerleave", () => tip.hide());
    root.appendChild(hitM);
    items.unshift({ node: mk, content, label: `This font: best-fit Looseness ${signed(v, 2)}` });
    SQA.keyNav(root, items);
    container.appendChild(root);
  }

  // ---------------------------------------------------------------- specimen
  function specimen(ctx, root, r, face) {
    const sm = r.summary;
    const sec = section(root, "specimen-h", "Specimen",
      `The same outlines under each spacing, all at one scale, so widths and rhythm compare directly${face.spacings.includes("bare") ? " — the best fit with the designer harness, and without it (the bare model)" : ""}. Only the ${face.n} checked glyphs exist here (${face.n > 76 ? "A–Z, a–z, 0–9 and the punctuation and symbols of the GF Latin Kernel" : "A–Z, a–z, 0–9 and . , : ; ! ? - ' \" ( ) / & ’"}); other characters are left out and the word space is fixed at 250 units per 1000 em.`);
    const st = { text: SAMPLES[0], mode: "lines", over: "best", shifts: true };
    const controls = h("div", { class: "controls" });
    const input = h("input", { type: "text", value: st.text, maxlength: "64", "aria-label": "Specimen text", spellcheck: "false", autocomplete: "off" });
    controls.appendChild(h("label", { class: "control" }, "Text", input));
    const samples = SQA.segmented("Sample texts", SAMPLES.map((t) => ({ label: t, value: t })), st.text, (v) => { st.text = v; input.value = v; draw(); });
    controls.appendChild(samples);
    const modeSeg = SQA.segmented("Display", [{ label: "Lines", value: "lines" }, { label: "Overlay", value: "overlay" }], st.mode, (v) => { st.mode = v; overWrap.hidden = v !== "overlay"; draw(); });
    controls.appendChild(modeSeg);
    const sel = h("select", { "aria-label": "Model spacing drawn over the designed one" }, ["best", "bare", "tight", "standard", "loose"].filter((k) => face.spacings.includes(k)).map((k) => h("option", { value: k }, k === "best" ? `Best fit (${signed(sm.best_looseness, 2)})` : k === "bare" ? `Best fit, bare model (no harness)` : SQA.SPACING_LABEL[k])));
    sel.addEventListener("change", () => { st.over = sel.value; draw(); });
    const overWrap = h("label", { class: "control", hidden: true }, "Outline", sel);
    controls.appendChild(overWrap);
    const shiftBox = h("input", { type: "checkbox", checked: true });
    shiftBox.addEventListener("change", () => { st.shifts = shiftBox.checked; draw(); });
    controls.appendChild(h("label", { class: "check" }, shiftBox, "Show shifts"));
    sec.appendChild(controls);
    const out = h("div", { class: "specimen" });
    sec.appendChild(out);
    const legendBox = h("div", { style: { marginTop: "10px" } });
    sec.appendChild(legendBox);
    const skippedEl = h("p", { class: "skipped", "aria-live": "polite" });
    sec.appendChild(skippedEl);
    let timer = null;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => { st.text = input.value; samples.setValue(SAMPLES.includes(st.text) ? st.text : null); draw(); }, 120);
    });
    const label = (sp) => sp === "best" ? `Best fit · Looseness ${signed(sm.best_looseness, 2)}${sm.bare ? " · with the designer harness" : ""}` : sp === "bare" ? `Best fit · bare model, without the harness` : sp === "designer" ? "As designed" : `${SQA.SPACING_LABEL[sp]} · Looseness ${signed({ tight: -0.5, standard: 0, loose: 0.5 }[sp], 1)}`;
    let width = 0;

    function lineSvg(Ls, k, W, opts) {
      const pad = 16;
      const glyphH = (face.top - face.bottom) * k;
      const band = st.shifts && opts.shiftsFrom ? 14 : 0;
      const H = Math.ceil(glyphH + band + 8);
      const baseY = face.top * k + 4;
      const svgW = Math.ceil(Math.max(W, opts.maxW * k + 2 * pad));
      const root = s("svg", { width: svgW, height: H, viewBox: `0 0 ${svgW} ${H}`, role: "img", "aria-label": opts.aria });
      (opts.under || []).forEach((u) => u.L.items.forEach((it) => root.appendChild(face.use(it.i, it.tx, k, pad, baseY, u.cls, u.cls === "glyph-outline" ? { style: `stroke-width:${(1.3 / k).toFixed(3)}` } : null))));
      Ls.items.forEach((it) => root.appendChild(face.use(it.i, it.tx, k, pad, baseY, opts.cls || "glyph-fill", opts.cls === "glyph-outline" ? { style: `stroke-width:${(1.3 / k).toFixed(3)}` } : null)));
      if (band) {
        const y = baseY - face.bottom * k + 8;
        const D = opts.shiftsFrom;
        const byTi = new Map(D.items.map((x) => [x.ti, x]));
        Ls.items.forEach((it, idx) => {
          // the same character in the designed line
          const d = byTi.get(it.ti);
          if (!d) return;
          const cm = pad + ((it.inkL + it.inkR) / 2) * k, cd = pad + ((d.inkL + d.inkR) / 2) * k;
          const dx = (((it.inkL + it.inkR) - (d.inkL + d.inkR)) / 2) * face.per;
          if (Math.abs(cm - cd) >= 0.75) root.appendChild(s("line", { x1: cd, x2: cm, y1: y, y2: y, class: dx > 0 ? "shift-pos" : "shift-neg", "stroke-width": 2.5, "stroke-linecap": "round" }));
          root.appendChild(s("circle", { cx: cm, cy: y, r: 2, class: "shift-dot" }));
          const prev = idx > 0 && Ls.items[idx - 1].ti === it.ti - 1 ? Ls.items[idx - 1] : null;
          const prevD = prev ? byTi.get(prev.ti) : null;
          const hit = s("rect", { x: pad + it.inkL * k - 2, y: 0, width: Math.max(6, (it.inkR - it.inkL) * k + 4), height: H, class: "hit" });
          hit.addEventListener("pointermove", (e) => {
            const rows = [["Moved", `${signed(dx, 1)} units per 1000 em`]];
            if (prev && prevD && prev.i === prevD.i) {
              const gm = (it.inkL - prev.inkR) * face.per, gd = (d.inkL - prevD.inkR) * face.per;
              rows.push(["Gap before it, designed", fmt(gd, 1)], ["Gap before it, " + opts.name, fmt(gm, 1)]);
            }
            tip.show({ title: `${it.ch} — ${face.glyphs[it.i].name}`, rows, note: "Shift of the glyph from its designed position; it adds up along the line." }, e.clientX, e.clientY);
          });
          hit.addEventListener("pointerleave", () => tip.hide());
          root.appendChild(hit);
        });
      }
      return root;
    }

    function draw() {
      const W = width || out.clientWidth || 800;
      clear(out);
      const text = st.text || " ";
      const layouts = {};
      face.spacings.forEach((sp) => { layouts[sp] = face.layout(text, sp); });
      const skipped = layouts.designer.skipped;
      skippedEl.textContent = skipped.length ? `Left out (not among the checked glyphs): ${skipped.join(" ")}` : "";
      const maxW = Math.max(1, ...face.spacings.map((sp) => layouts[sp].width));
      const fontPx = Math.max(24, Math.min(72, (W - 40) / (maxW / face.upm)));
      const k = fontPx / face.upm;
      const dW = layouts.designer.width;
      const widthNote = (sp) => {
        const em = layouts[sp].width / face.upm;
        if (sp === "designer") return `${fmt(em, 2)} em wide`;
        const d = dW > 0 ? (100 * (layouts[sp].width - dW)) / dW : 0;
        return `${fmt(em, 2)} em · ${Math.abs(d) < 0.05 ? "same width" : `${signed(d, 1)} % vs designed`}`;
      };
      if (!layouts.designer.items.length) {
        out.appendChild(h("p", { class: "empty" }, "Type letters, figures or the punctuation listed above."));
        clear(legendBox);
        return;
      }
      if (st.mode === "lines") {
        face.spacings.forEach((sp) => {
          const line = h("div", { class: "spec-line" + (sp === "bare" ? " spec-bare" : "") }, h("div", { class: "spec-label" }, label(sp), h("span", null, widthNote(sp))));
          line.appendChild(lineSvg(layouts[sp], k, W - 34, { maxW, aria: `${text} — ${label(sp)}, ${widthNote(sp)}`, shiftsFrom: sp === "designer" ? null : layouts.designer, name: SQA.SPACING_LABEL[sp].toLowerCase() }));
          out.appendChild(line);
        });
      } else {
        const sp = st.over;
        const line = h("div", { class: "spec-line" }, h("div", { class: "spec-label" }, `As designed (ink) with ${label(sp)} (outline)`, h("span", null, `${widthNote("designer")} → ${widthNote(sp)}`)));
        line.appendChild(lineSvg(layouts[sp], k, W - 34, { maxW, cls: "glyph-outline", under: [{ L: layouts.designer, cls: "glyph-fill" }], aria: `${text}: the designed spacing in ink with the ${label(sp)} spacing drawn over it as outlines`, shiftsFrom: layouts.designer, name: SQA.SPACING_LABEL[sp].toLowerCase() }));
        out.appendChild(line);
      }
      clear(legendBox);
      const items = [];
      if (st.mode === "overlay") items.push({ label: "As designed", color: "var(--glyph)" }, { label: "Model (outline)", color: "var(--outline)", ring: true });
      if (st.shifts) items.push({ label: "moved left (tighter so far)", color: "var(--div-neg)", line: true }, { label: "moved right (looser so far)", color: "var(--div-pos)", line: true });
      if (items.length) legendBox.appendChild(SQA.legend(items));
    }
    SQA.responsive(out, (w) => { width = w; draw(); }, ctx);
  }

  // ---------------------------------------------------------------- glyph sides
  function sides(ctx, root, r, face, o) {
    const lib = o.library;
    const N = normsFor(r, lib);
    const t = (N && N.t) || (o.info && o.info.thresholds) || {};
    const wide = fullWidth(face, t);
    const sec = section(root, "sides-h", "Glyph sides",
      "Each side's sidebearing against the best-fit model, after the font's overall offset: positive means the designer gives that side more room than the model. " +
      (SQA.withHarness(r)
        ? "The designer harness already takes out what the designers of well-spaced text fonts consistently do differently from the model alone (quotes, parentheses, the open sides of E, F, L and T…); "
        : "The bare model disagrees with designers in the same places in many fonts (around f, r, quotes and the like), so ") +
      "with a baseline each side is also compared with the library's median for that side — only what is far from the library is flagged.");
    const entries = [];
    face.glyphs.forEach((g, i) => {
      if (!Array.isArray(g.dev)) return;
      ["left", "right"].forEach((side, k) => {
        const v = g.dev[k];
        if (v === null || v === undefined) return;
        // unscored glyphs are drawn, never compared with the norms
        const L = N && !wide[i] && g.scored ? N.sides[`${g.name} ${side}`] : null;
        const e = { i, g, side, v, lib: L, diff: null, z: null, flag: null, wide: wide[i], group: g.scored ? SQA.groupOf(g) : "unscored" };
        if (L && L.n) {
          const sigma = Math.max(SQA.SIGMA * L.mad, 2);
          e.diff = v - L.median; e.z = e.diff / sigma;
          // as the server: "extreme" past the FAIL limits, "far" past the WARN limits
          if (Math.abs(e.z) >= t.side_fail_z && Math.abs(e.diff) >= t.side_fail_units) e.flag = "fail";
          else if (Math.abs(e.z) >= t.side_warn_z && Math.abs(e.diff) >= t.side_warn_units) e.flag = "warn";
        }
        entries.push(e);
      });
    });
    if (!entries.length) { sec.appendChild(h("p", { class: "note" }, "No side deviations in this report.")); return; }
    const flagged = entries.filter((e) => e.flag).sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
    if (N) {
      const ext = flagged.filter((e) => e.flag === "fail").length;
      if (flagged.length) {
        const far = flagged.length - ext;
        const lead = ext
          ? `${ext} extreme ${ext === 1 ? "side" : "sides"}${far ? ` and ${far} more far` : ""} from the norms of ${N.name}`
          : `${far} ${far === 1 ? "side is" : "sides are"} far from the norms of ${N.name}`;
        sec.appendChild(h("p", { style: { margin: "0 0 4px" } }, h("b", null, lead),
          ` — far: at least ${fmt(t.side_warn_z, 0)} robust σ and ${fmt(t.side_warn_units, 0)} units per 1000 em from the median for that side` +
          (ext ? `; extreme (✕): ${fmt(t.side_fail_z, 0)} σ and ${fmt(t.side_fail_units, 0)} units` : "") + ":"));
        sec.appendChild(h("div", { class: "flag-list" }, flagged.map((e) => h("span", { class: "flag-item" + (e.flag === "fail" ? " fail" : "") },
          h("b", { "aria-hidden": "true" }, e.flag === "fail" ? "✕" : "!"), `${e.g.char} ${e.side} ${signed(e.diff, 0)}`, h("span", { class: "small" }, `${e.flag === "fail" ? "extreme · " : ""}z ${signed(e.z, 1)}`)))));
      } else sec.appendChild(h("p", { class: "small" }, `No side is far from the norms of ${N.name} (${fmt(t.side_warn_z, 0)} robust σ and ${fmt(t.side_warn_units, 0)} units per 1000 em from the median for that side).`));
      if (wide.some(Boolean)) sec.appendChild(h("p", { class: "small" }, `Full-width quotes (${face.glyphs.filter((g, i) => wide[i] && g.scored).map((g) => g.char).join(" ")}), a CJK convention, are not compared with the norms of proportional fonts.`));
    } else sec.appendChild(h("p", { class: "small" }, "No baseline yet: the library's medians are not shown, so sides where the model usually disagrees with designers are not told apart."));
    const abs = entries.filter((e) => e.group !== "unscored").map((e) => Math.abs(e.v)).concat(entries.filter((e) => e.lib).map((e) => Math.abs(e.lib.median))).sort((a, b) => a - b);
    let R = Math.max(20, SQA.quantile(abs, 0.96) * 1.2);
    R = Math.ceil(R / 10) * 10;
    const legendItems = [{ label: "tighter than the model", color: "var(--div-neg)" }, { label: "looser than the model", color: "var(--div-pos)" }];
    if (N) legendItems.push({ label: `median of ${N.name} for that side`, color: "var(--ink)", line: true }, { label: "far from the norm (! far, ✕ extreme)", color: "var(--ink)", ring: true });
    sec.appendChild(SQA.legend(legendItems));
    const grid = h("div", { class: "side-groups", style: { marginTop: "12px" } });
    sec.appendChild(grid);
    ["upper", "lower", "punct", "unscored"].forEach((grp) => {
      const list = [];
      face.glyphs.forEach((g, i) => { if (Array.isArray(g.dev) && (g.scored ? SQA.groupOf(g) : "unscored") === grp) list.push(i); });
      if (!list.length) return;
      const label = GROUP_LABEL[grp] + (grp === "unscored" && face.cjk ? ", punctuation set by CJK conventions" : "");
      const panel = h("div", { class: "panel" + (grp === "unscored" ? " unscored" : "") }, h("h4", null, label));
      const stage = h("div", { class: "stage" });
      panel.appendChild(stage);
      grid.appendChild(panel);
      SQA.responsive(stage, (w) => sideChart(stage, w, list, entries, R, face, !!N), ctx);
    });
    sec.appendChild(h("p", { class: "caption" }, `Bars run from 0 to the side's deviation (units per 1000 em, scale ±${fmt(R, 0)}; longer values stop at the edge with ›).`));
    SQA.tableToggle(sec, [
      { label: "Glyph", get: (e) => `${e.g.char} (${e.g.name})` }, { label: "Side", get: (e) => e.side },
      { label: "Deviation", num: true, get: (e) => signed(e.v, 1) },
      { label: "Library median", num: true, get: (e) => (e.lib ? signed(e.lib.median, 1) : "–") },
      { label: "Difference", num: true, get: (e) => (e.diff !== null ? signed(e.diff, 1) : "–") },
      { label: "Robust z", num: true, get: (e) => (e.z !== null ? signed(e.z, 1) : "–") },
      { label: "Flag", get: (e) => (e.flag === "fail" ? "extreme" : e.flag === "warn" ? "far" : e.wide ? "full-width, not compared" : e.group === "unscored" ? "not scored" : "") }],
      () => entries, { caption: "Glyph side deviations from the best-fit model", size: "medium" });
  }

  function sideChart(container, W, list, entries, R, face, hasLib) {
    clear(container);
    const rowH = 19, top = 22, labelW = 30, gapX = 14;
    const H = top + list.length * rowH + 20;
    const trackW = (W - labelW - gapX) / 2;
    const cols = [{ side: "left", x0: labelW }, { side: "right", x0: labelW + trackW + gapX }];
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "chart", role: "img", "aria-label": "Left and right sidebearing deviations from the model. Use the arrow keys to read each side." });
    const items = [];
    cols.forEach((c) => {
      const mid = c.x0 + trackW / 2;
      root.appendChild(s("text", { x: mid, y: 13, "text-anchor": "middle", class: "label-strong", style: "font-size:11.5px" }, c.side === "left" ? "Left side" : "Right side"));
      root.appendChild(s("line", { x1: mid, x2: mid, y1: top - 4, y2: H - 18, class: "axis" }));
      root.appendChild(s("text", { x: c.x0 + 2, y: H - 5, "text-anchor": "start", class: "tick" }, signed(-R, 0)));
      root.appendChild(s("text", { x: mid, y: H - 5, "text-anchor": "middle", class: "tick" }, "0"));
      root.appendChild(s("text", { x: c.x0 + trackW - 2, y: H - 5, "text-anchor": "end", class: "tick" }, signed(R, 0)));
    });
    const hl = s("rect", { class: "sel", x: -10, y: -10, width: 0, height: 0, rx: 3 });
    list.forEach((gi, row) => {
      const g = face.glyphs[gi];
      const y = top + row * rowH;
      root.appendChild(s("text", { x: labelW - 10, y: y + rowH / 2 + 4.5, "text-anchor": "middle", class: "label-strong", style: "font-size:13px" }, g.char));
      cols.forEach((c) => {
        const e = entries.find((x) => x.i === gi && x.side === c.side);
        if (!e) return;
        const mid = c.x0 + trackW / 2, half = trackW / 2 - 6;
        const X = (v) => mid + (Math.max(-R, Math.min(R, v)) / R) * half;
        const bw = X(e.v) - mid;
        root.appendChild(s("path", { d: SQA.barPath(mid, y + 4, bw, rowH - 8, 3), class: e.v < 0 ? "neg" : "pos" }));
        if (Math.abs(e.v) > R) root.appendChild(s("text", { x: e.v > 0 ? X(e.v) + 2 : X(e.v) - 2, y: y + rowH / 2 + 4, "text-anchor": e.v > 0 ? "start" : "end", class: "label-strong", style: "font-size:11px" }, e.v > 0 ? "›" : "‹"));
        if (e.lib) {
          const lx = X(e.lib.median);
          root.appendChild(s("line", { x1: lx, x2: lx, y1: y + 1, y2: y + rowH - 1, class: "lib-tick" }));
        }
        if (e.flag) {
          root.appendChild(s("rect", { x: c.x0 + 1, y: y + 1, width: trackW - 2, height: rowH - 2, rx: 4, class: "flag-ring", style: e.flag === "fail" ? "stroke:var(--critical)" : "" }));
          const tx = e.v >= 0 ? Math.min(X(e.v) + 4, c.x0 + trackW - 4) : Math.max(X(e.v) - 4, c.x0 + 4);
          root.appendChild(s("text", { x: tx, y: y + rowH / 2 + 4, "text-anchor": e.v >= 0 ? (X(e.v) + 30 > c.x0 + trackW ? "end" : "start") : (X(e.v) - 30 < c.x0 ? "start" : "end"), class: "label-strong", style: "font-size:10.5px" }, e.flag === "fail" ? "✕" : "!"));
        }
        const content = () => {
          const rows = [["Deviation from the model", signed(e.v, 1)]];
          if (e.lib) rows.push(["Norm (median)", signed(e.lib.median, 1)], ["Norm MAD", fmt(e.lib.mad, 1)], ["Difference", signed(e.diff, 1)], ["Robust z", signed(e.z, 1)]);
          return { title: `${g.char} — ${c.side} side (${g.name})`, rows, note: e.flag ? (e.flag === "fail" ? "Extreme: very far from the norm for this side." : "Far from the norm for this side.") : e.wide ? "Full-width punctuation: not compared with the norms." : e.group === "unscored" ? `Not scored: ${unscoredWhy(g, face)}.` : (e.v > 0 ? "The designer gives this side more room than the model." : e.v < 0 ? "The designer gives this side less room than the model." : "") };
        };
        const hit = s("rect", { x: c.x0, y, width: trackW, height: rowH, class: "hit" });
        hit.addEventListener("pointermove", (ev) => { tip.show(content(), ev.clientX, ev.clientY); });
        hit.addEventListener("pointerleave", () => tip.hide());
        root.appendChild(hit);
        items.push({ node: hit, content, label: `${g.char} ${c.side} side: ${signed(e.v, 1)}${e.lib ? `, norm ${signed(e.lib.median, 1)}` : ""}${e.flag === "fail" ? ", extreme" : e.flag ? ", far from the norm" : ""}`, box: [c.x0, y, trackW, rowH] });
      });
    });
    root.appendChild(hl);
    SQA.keyNav(root, items, { onMove(i) { if (i < 0) { hl.setAttribute("width", 0); return; } const b = items[i].box; hl.setAttribute("x", b[0]); hl.setAttribute("y", b[1]); hl.setAttribute("width", b[2]); hl.setAttribute("height", b[3]); } });
    container.appendChild(root);
  }

  // ---------------------------------------------------------------- pairs
  function pairData(r, face, lib, N) {
    const d = r.detail;
    const wide = fullWidth(face, N ? N.t : null);
    const pg = d.pair_glyphs || [];
    const m = pg.length;
    const res = d.residuals || [];
    const out = [];
    if (!m || res.length !== m * m) return { list: out, m, pg, hasLib: false, offset: 0 };
    let libPos = null, M = 0;
    const norms = N ? N.pairs : null;
    if (lib && Array.isArray(lib.pair_names) && Array.isArray(norms) && norms.length === lib.pair_names.length ** 2) {
      M = lib.pair_names.length;
      const pos = new Map(lib.pair_names.map((n, k) => [n, k]));
      libPos = pg.map((gi) => (pos.has(face.glyphs[gi].name) ? pos.get(face.glyphs[gi].name) : -1));
    }
    const offs = [];
    for (let a = 0; a < m; a++) {
      for (let b = 0; b < m; b++) {
        const v = res[a * m + b];
        if (v === null || v === undefined) continue;
        const ga = pg[a], gb = pg[b];
        const e = { k: a * m + b, ra: a, rb: b, a: ga, b: gb, res: v / 10 };
        if (face.has(ga, "designer") && face.has(gb, "designer") && face.has(ga, "best") && face.has(gb, "best")) {
          e.dg = face.gap(ga, gb, "designer") * face.per;
          e.mg = face.gap(ga, gb, "best") * face.per;
          e.kd = face.kerning(ga, gb, "designer") * face.per;
          e.km = face.kerning(ga, gb, "best") * face.per;
          offs.push(e.dg - e.mg - e.res);
        }
        if (libPos && libPos[a] >= 0 && libPos[b] >= 0 && !wide[ga] && !wide[gb]) {
          const L = norms[libPos[a] * M + libPos[b]];
          if (L && L.length === 2 && Number.isFinite(L[0])) {
            e.libMed = L[0]; e.libMad = L[1];
            e.diff = e.res - L[0];
            e.z = e.diff / Math.max(SQA.SIGMA * L[1], 3);
          }
        }
        const A = SQA.groupOf(face.glyphs[ga]), B = SQA.groupOf(face.glyphs[gb]);
        e.cat = A === "punct" || B === "punct" ? "punct" : A === "upper" && B === "upper" ? "upper" : A === "lower" && B === "lower" ? "lower" : "mixed";
        e.scored = !!(face.glyphs[ga].scored && face.glyphs[gb].scored);
        out.push(e);
      }
    }
    return { list: out, m, pg, hasLib: out.some((e) => e.libMed !== undefined), offset: offs.length ? SQA.median(offs) : 0 };
  }

  function pairs(ctx, root, r, face, o) {
    const lib = o.library;
    const N = normsFor(r, lib);
    const t = (N && N.t) || (o.info && o.info.thresholds) || {};
    const P = pairData(r, face, lib, N);
    const unscoredPairs = P.list.some((e) => !e.scored);
    const sec = section(root, "pairs-h", "Pairs, loosest to tightest",
      `Every ordered pair of the scored glyphs, ranked by how its gap departs from the best-fit model: the designer's gap − the model's gap − the font's overall offset (${signed(P.offset, 1)}). Positive: the font sets the pair looser than the model would at the font's own tightness. Relative to the library, the value is compared with how ${N ? N.name.replace(/^the whole library$/, "the library's fonts") : "the library's fonts"} usually differ from the model on that pair.${unscoredPairs ? ` Pairs with a glyph that is not scored (figures, symbols often drawn at the figure width, the underscore${face.cjk ? "; in this CJK font, the punctuation of ambiguous width" : ""}) are measured too: include them below.` : ""}`);
    if (!P.list.length) { sec.appendChild(h("p", { class: "note" }, "This report has no pair residuals.")); return; }
    const st = { rel: "model", order: "loose", filter: "all", unscored: false };
    const controls = h("div", { class: "controls" });
    const relSeg = SQA.segmented("Relative to", [{ label: "Relative to the model", value: "model" }, { label: "Relative to the library", value: "library", disabled: !P.hasLib, title: P.hasLib ? "" : "Needs a library baseline" }], st.rel, (v) => { st.rel = v; drawList(); heat.draw(); });
    controls.append(relSeg,
      SQA.segmented("Order", [{ label: "Loosest first", value: "loose" }, { label: "Tightest first", value: "tight" }], st.order, (v) => { st.order = v; drawList(); }),
      SQA.segmented("Pairs shown", [{ label: "All", value: "all" }, { label: "Capitals", value: "upper" }, { label: "Lowercase", value: "lower" }, { label: "Mixed case", value: "mixed" }, { label: "Punctuation and symbols", value: "punct" }], st.filter, (v) => { st.filter = v; drawList(); }));
    if (unscoredPairs) {
      const box = h("input", { type: "checkbox" });
      box.addEventListener("change", () => { st.unscored = box.checked; drawList(); });
      controls.appendChild(h("label", { class: "check" }, box, "Include glyphs that are not scored"));
    }
    sec.appendChild(controls);
    if (!P.hasLib) sec.appendChild(h("p", { class: "small", style: { marginTop: "-4px" } }, lib ? "The library's pair norms do not cover this font's glyph set." : "“Relative to the library” needs a library baseline; none exists yet."));
    const listInfo = h("p", { class: "small", "aria-live": "polite" });
    sec.appendChild(listInfo);
    const tableBox = h("div", { class: "table-wrap" });
    sec.appendChild(tableBox);
    const valueOf = (e) => (st.rel === "library" ? e.diff : e.res);

    // pair drawings share one scale
    const k = 38 / (face.top - face.bottom);
    const padU = 0.05 * face.upm;
    function pairSvg(e, sp, widthU, ghostSp) {
      const p = face.pairPlace(e.a, e.b, sp);
      const W = Math.ceil((widthU + 2 * padU) * k), H = Math.ceil((face.top - face.bottom) * k + 4);
      const baseY = face.top * k + 2;
      const root = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${face.glyphs[e.a].char}${face.glyphs[e.b].char} ${sp === "designer" ? "as designed" : "as the model sets it"}, gap ${fmt(p.gap * face.per, 0)}` });
      const ox = padU * k;
      if (ghostSp) {
        const q = face.pairPlace(e.a, e.b, ghostSp);
        root.appendChild(face.use(e.b, q.tb, k, ox, baseY, "glyph-ghost"));
      }
      root.appendChild(face.use(e.a, p.ta, k, ox, baseY));
      root.appendChild(face.use(e.b, p.tb, k, ox, baseY));
      return root;
    }
    function drawList() {
      const useLib = st.rel === "library" && P.hasLib;
      let list = P.list.filter((e) => (st.unscored || e.scored) && (st.filter === "all" || e.cat === st.filter) && valueOf(e) !== undefined && valueOf(e) !== null);
      const max = Math.max(1, ...list.map((e) => Math.abs(valueOf(e))));
      list.sort((a, b) => (st.order === "loose" ? valueOf(b) - valueOf(a) : valueOf(a) - valueOf(b)));
      const shown = list.slice(0, 40);
      const unusual = useLib ? P.list.filter((e) => e.z !== undefined && Math.abs(e.z) >= (t.pair_z || 5) && Math.abs(e.diff) >= (t.pair_units || 50)).length : null;
      listInfo.textContent = `The ${st.order === "loose" ? "loosest" : "tightest"} ${shown.length} of ${int(list.length)} pairs` +
        (useLib ? ` relative to ${N.name}. ${int(unusual)} ${unusual === 1 ? "pair is" : "pairs are"} far from their usual (at least ${fmt(t.pair_z, 0)} robust σ and ${fmt(t.pair_units, 0)} units) and marked “far”.` : " relative to the model.");
      clear(tableBox);
      if (!shown.length) { tableBox.appendChild(h("p", { class: "empty" }, "No pairs in this group.")); return; }
      const widthU = Math.max(...shown.map((e) => Math.max(face.pairPlace(e.a, e.b, "designer").right, face.pairPlace(e.a, e.b, "best").right)));
      const tbl = h("table", { class: "pairs" });
      tbl.appendChild(h("caption", { class: "sr-only" }, listInfo.textContent));
      const cols = ["#", "Pair", "As designed", "Model (best fit)", useLib ? "vs library" : "vs model", "Designer gap", "Model gap", "Designer kern", "Model kern"].concat(useLib ? ["Library median", "z"] : []);
      tbl.appendChild(h("thead", null, h("tr", null, cols.map((c, i) => h("th", { scope: "col", class: i >= 4 ? "num" : "" }, c)))));
      const tb = h("tbody");
      shown.forEach((e, i) => {
        const ga = face.glyphs[e.a], gb = face.glyphs[e.b];
        const v = valueOf(e);
        const far = useLib && Math.abs(e.z) >= (t.pair_z || 5) && Math.abs(e.diff) >= (t.pair_units || 50);
        tb.appendChild(h("tr", null,
          h("td", { class: "rank" }, String(i + 1)),
          h("td", { class: "pair-name" }, ga.char + gb.char, h("small", null, `${ga.name} ${gb.name}`)),
          h("td", { class: "draw" }, pairSvg(e, "designer", widthU)),
          h("td", { class: "draw" }, pairSvg(e, "best", widthU, "designer")),
          h("td", { class: "num" }, SQA.miniDiverging(v, max, 96), " ", h("b", null, signed(v, 1)), far ? h("span", { class: "z-mark", title: "Far from the library's usual for this pair" }, "far") : null, e.kd ? h("span", { class: "kd-mark", title: "The designer kerned this pair" }, "kerned") : null, e.scored ? null : h("span", { class: "kd-mark", title: `A glyph of this pair is not scored: ${unscoredWhy(ga.scored ? gb : ga, face)}` }, "not scored")),
          h("td", { class: "num" }, fmt(e.dg, 0)),
          h("td", { class: "num" }, fmt(e.mg, 0)),
          h("td", { class: "num" }, e.kd ? signed(e.kd, 0) : "0"),
          h("td", { class: "num" }, e.km ? signed(e.km, 0) : "0"),
          useLib ? h("td", { class: "num" }, signed(e.libMed, 1)) : null,
          useLib ? h("td", { class: "num" }, signed(e.z, 1)) : null));
      });
      tbl.appendChild(tb);
      tableBox.appendChild(tbl);
    }
    drawList();
    sec.appendChild(h("p", { class: "caption" }, "Drawings: the pair as designed, and as the best-fit model sets it with the designed position of the second glyph in grey. Gaps and kerning in units per 1000 em."));

    // the heat map
    const hsec = h("div", null);
    hsec.appendChild(h("h3", { id: "heat-h", tabindex: "-1" }, "Heat map of every pair"));
    hsec.appendChild(h("p", { class: "section-intro" }, "Rows: the left glyph; columns: the right glyph. Uses the “relative to” setting above. Hover a cell, or focus the map and use the arrow keys."));
    sec.appendChild(hsec);
    const heat = heatMap(ctx, hsec, P, face, () => (st.rel === "library" && P.hasLib ? "library" : "model"));
  }

  function heatMap(ctx, sec, P, face, relFn) {
    const m = P.m;
    const byK0 = new Array(m * m).fill(null);
    P.list.forEach((e) => { byK0[e.k] = e; });
    // rows and columns grouped: capitals, lowercase, punctuation and symbols,
    // then what is not scored (figures first)
    const rank = (gi) => { const g = face.glyphs[gi]; if (!g.scored) return SQA.groupOf(g) === "figure" ? 3 : 4; return { upper: 0, lower: 1 }[SQA.groupOf(g)] ?? 2; };
    const ord = P.pg.map((gi, k) => k).sort((x, y) => rank(P.pg[x]) - rank(P.pg[y]) || x - y);
    const byK = new Array(m * m).fill(null);
    for (let a = 0; a < m; a++) for (let b = 0; b < m; b++) byK[a * m + b] = byK0[ord[a] * m + ord[b]];
    const glyphAt = (k) => face.glyphs[P.pg[ord[k]]];
    const unscored = ord.map((k) => !face.glyphs[P.pg[k]].scored);
    const ramp = h("div", { class: "ramp" });
    sec.appendChild(ramp);
    const wrap = h("div", { class: "heat-wrap", style: { marginTop: "10px" } });
    sec.appendChild(wrap);
    const live = h("p", { class: "sr-only", "aria-live": "polite" });
    sec.appendChild(live);
    const chars = ord.map((k) => face.glyphs[P.pg[k]].char);
    const groups = ord.map((k) => rank(P.pg[k]));
    let R = 20, rel = "model", width = 0;
    const val = (e) => (!e ? null : rel === "library" ? (e.diff === undefined ? null : e.diff) : e.res);
    function cls(v) {
      if (v === null || v === undefined) return "hm-na";
      const step = Math.min(8, Math.round((Math.abs(v) / R) * 8));
      if (step === 0) return "hm-0";
      return (v < 0 ? "hm-n" : "hm-p") + step;
    }
    function drawRamp() {
      clear(ramp);
      const steps = h("span", { class: "steps", "aria-hidden": "true" });
      for (let i = 8; i >= 1; i--) steps.appendChild(rampCell("hm-n" + i));
      steps.appendChild(rampCell("hm-0"));
      for (let i = 1; i <= 8; i++) steps.appendChild(rampCell("hm-p" + i));
      ramp.append(h("span", null, `${signed(-R, 0)} tighter`), steps, h("span", null, `looser ${signed(R, 0)}`), h("span", { class: "muted" }, rel === "library" ? "than the library's usual for the pair (units per 1000 em)" : "than the model (units per 1000 em)"));
      const na = s("svg", { width: 12, height: 12, "aria-hidden": "true" }, s("rect", { width: 12, height: 12, class: "hm-na", stroke: "currentColor", "stroke-opacity": 0.3 }));
      ramp.append(h("span", { style: { display: "inline-flex", gap: "5px", alignItems: "center" } }, na, "not measured"));
    }
    function rampCell(c) {
      const sv = s("svg", { width: 14, height: 12 }, s("rect", { width: 14, height: 12, class: c }));
      return sv;
    }
    function draw() {
      rel = relFn();
      const vals = P.list.filter((e) => e.scored).map(val).filter((v) => v !== null && v !== undefined).map(Math.abs).sort((a, b) => a - b);
      R = Math.max(10, Math.ceil(SQA.quantile(vals, 0.98) / 10) * 10 || 10);
      drawRamp();
      const W = width || wrap.clientWidth || 700;
      const lab = 16;
      const c = Math.max(8, Math.min(14, Math.floor((W - lab - 4) / m)));
      const size = lab + m * c + 2;
      clear(wrap);
      const root = s("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, class: "chart", role: "application", "aria-roledescription": "heat map", "aria-label": `Heat map of ${m} by ${m} pairs, ${rel === "library" ? "relative to the library" : "relative to the model"}. Arrow keys move between cells.`, tabindex: "0" });
      const cells = s("g", { "aria-hidden": "true" });
      for (let a = 0; a < m; a++) {
        for (let b = 0; b < m; b++) {
          const e = byK[a * m + b];
          cells.appendChild(s("rect", { x: lab + b * c, y: lab + a * c, width: c - 0.5, height: c - 0.5, class: cls(val(e)) }));
        }
      }
      root.appendChild(cells);
      // what is not scored: veiled
      const first = unscored.indexOf(true);
      if (first >= 0) {
        root.appendChild(s("rect", { x: lab + first * c, y: lab, width: (m - first) * c, height: first * c, class: "hm-veil" }));
        root.appendChild(s("rect", { x: lab, y: lab + first * c, width: m * c, height: (m - first) * c, class: "hm-veil" }));
      }
      // group gaps (white between capitals, lowercase and punctuation)
      for (let i = 1; i < m; i++) {
        if (groups[i] !== groups[i - 1]) {
          root.appendChild(s("line", { x1: lab + i * c - 0.25, x2: lab + i * c - 0.25, y1: lab, y2: lab + m * c, class: "hm-group" }));
          root.appendChild(s("line", { y1: lab + i * c - 0.25, y2: lab + i * c - 0.25, x1: lab, x2: lab + m * c, class: "hm-group" }));
        }
      }
      const fs = Math.min(10, c - 1);
      chars.forEach((ch, i) => {
        const lc = "hm-label" + (unscored[i] ? " hm-label-muted" : "");
        root.appendChild(s("text", { x: lab + i * c + c / 2, y: lab - 4, "text-anchor": "middle", class: lc, style: `font-size:${fs}px` }, ch));
        root.appendChild(s("text", { x: lab - 4, y: lab + i * c + c / 2 + fs / 2 - 1, "text-anchor": "end", class: lc, style: `font-size:${fs}px` }, ch));
      });
      const sel = s("rect", { class: "sel", x: -20, y: -20, width: c + 1, height: c + 1 });
      root.appendChild(sel);
      let at = null;
      const content = (a, b) => {
        const e = byK[a * m + b];
        const ga = glyphAt(a), gb = glyphAt(b);
        if (!e) return { title: `${ga.char}${gb.char}`, note: "Not measured." };
        const rows = [["vs model", signed(e.res, 1)]];
        if (e.libMed !== undefined) rows.push(["Library median", signed(e.libMed, 1)], ["vs library", signed(e.diff, 1)], ["Robust z", signed(e.z, 1)]);
        if (e.dg !== undefined) rows.push(["Designer gap", fmt(e.dg, 0)], ["Model gap", fmt(e.mg, 0)], ["Designer kern", fmt(e.kd, 0)], ["Model kern", fmt(e.km, 0)]);
        return { title: `${ga.char}${gb.char} — ${ga.name} ${gb.name}`, rows, note: e.scored ? "" : `Not scored: ${unscoredWhy(ga.scored ? gb : ga, face)}.` };
      };
      const move = (a, b, viaKey) => {
        at = [a, b];
        sel.setAttribute("x", lab + b * c - 0.5); sel.setAttribute("y", lab + a * c - 0.5);
        if (viaKey) {
          const rr = root.getBoundingClientRect();
          tip.show(content(a, b), rr.left + lab + (b + 1) * c, rr.top + lab + a * c);
          const e = byK[a * m + b];
          live.textContent = `${chars[a]}${chars[b]}: ${e ? signed(val(e), 1) : "not measured"}`;
          // keep the focused cell in view inside the scrolling wrapper
          const cx = lab + b * c, cy = lab + a * c;
          if (cx < wrap.scrollLeft + lab || cx + c > wrap.scrollLeft + wrap.clientWidth) wrap.scrollLeft = Math.max(0, cx - wrap.clientWidth / 2);
          if (cy < wrap.scrollTop || cy + c > wrap.scrollTop + wrap.clientHeight) wrap.scrollTop = Math.max(0, cy - wrap.clientHeight / 2);
        }
      };
      root.addEventListener("pointermove", (ev) => {
        const rr = root.getBoundingClientRect();
        const x = ev.clientX - rr.left, y = ev.clientY - rr.top;
        const b = Math.floor((x - lab) / c), a = Math.floor((y - lab) / c);
        if (a < 0 || b < 0 || a >= m || b >= m) { tip.hide(); sel.setAttribute("x", -20); return; }
        move(a, b, false);
        tip.show(content(a, b), ev.clientX, ev.clientY);
      });
      root.addEventListener("pointerleave", () => { tip.hide(); sel.setAttribute("x", -20); });
      root.addEventListener("keydown", (ev) => {
        let [a, b] = at || [0, 0];
        if (ev.key === "ArrowRight") b = Math.min(m - 1, b + 1);
        else if (ev.key === "ArrowLeft") b = Math.max(0, b - 1);
        else if (ev.key === "ArrowDown") a = Math.min(m - 1, a + 1);
        else if (ev.key === "ArrowUp") a = Math.max(0, a - 1);
        else if (ev.key === "Home") b = 0;
        else if (ev.key === "End") b = m - 1;
        else if (ev.key === "Escape") { tip.hide(); return; }
        else return;
        ev.preventDefault();
        move(a, b, true);
      });
      root.addEventListener("focus", () => { const [a, b] = at || [0, 0]; move(a, b, true); });
      root.addEventListener("blur", () => { tip.hide(); sel.setAttribute("x", -20); });
      wrap.appendChild(root);
      tableTog.refresh();
    }
    // the matrix (up to 114 × 114 cells) is built as one string
    const tableTog = SQA.tableToggle(sec, [], () => [], {
      label: "Show as table (every pair)", size: "medium",
      render(twrap) {
        const head = "<thead><tr><th scope=\"col\">L \\ R</th>" + chars.map((ch) => `<th scope="col">${SQA.esc(ch)}</th>`).join("") + "</tr></thead>";
        let body = "<tbody>";
        for (let a = 0; a < m; a++) {
          body += `<tr><th scope="row">${SQA.esc(chars[a])}</th>`;
          for (let b = 0; b < m; b++) { const v = val(byK[a * m + b]); body += `<td>${v === null || v === undefined ? "" : SQA.esc(fmt(v, 0))}</td>`; }
          body += "</tr>";
        }
        twrap.innerHTML = `<table class="matrix"><caption class="sr-only">Pair values ${rel === "library" ? "relative to the library" : "relative to the model"}, units per 1000 em; rows are the left glyph</caption>${head}${body}</tbody></table>`;
      },
    });
    SQA.responsive(wrap, (w) => { width = w; draw(); }, ctx);
    return { draw };
  }

  // ---------------------------------------------------------------- kerning
  function kerning(ctx, root, r, face) {
    const sm = r.summary;
    const d = r.detail;
    const sec = section(root, "kern-h", "Kerning agreement",
      "The designer's kerning against the best-fit model's on the scored pairs the designer kerned (units per 1000 em). Points near the diagonal agree; points across zero kern the other way.");
    const scored = new Set((d.pair_glyphs || []).filter((i) => face.glyphs[i] && face.glyphs[i].scored));
    const pts = [];
    (d.kerning.designer || []).forEach(([a, b, v]) => {
      if (!scored.has(a) || !scored.has(b)) return;
      const kd = v * face.per, km = face.kerning(a, b, "best") * face.per;
      const agree = Math.abs(km) >= 0.5 * face.per && Math.sign(km) === Math.sign(kd);
      pts.push({ a, b, kd, km, agree, label: face.glyphs[a].char + face.glyphs[b].char });
    });
    const stats = h("p", { style: { margin: "0 0 10px" } });
    if (sm.kern_r !== null && sm.kern_r !== undefined) stats.append(h("b", null, `r = ${fmt(sm.kern_r, 2)}`), ` · the same direction on ${pct(sm.kern_sign)} of the ${int(sm.kerned_pairs)} pairs the designer kerned · shape error on those pairs ${fmt(sm.kerned_error, 1)}`);
    else stats.append(pts.length ? `${int(pts.length)} kerned pairs; too few for a correlation.` : "The designer kerned none of the scored pairs, so there is nothing to compare.");
    sec.appendChild(stats);
    if (!pts.length) return;
    sec.appendChild(SQA.legend([{ label: "same direction", color: "var(--s-kk)" }, { label: "opposite direction, or not kerned by the model", color: "var(--s-human)", ring: true }]));
    const stage = h("div", { class: "stage", style: { maxWidth: "640px", marginTop: "8px" } });
    sec.appendChild(stage);
    SQA.responsive(stage, (w) => scatter(stage, Math.min(w, 640), pts), ctx);
    SQA.tableToggle(sec, [{ label: "Pair", get: (p) => `${p.label} (${face.glyphs[p.a].name} ${face.glyphs[p.b].name})` }, { label: "Designer kerning", num: true, get: (p) => signed(p.kd, 1) }, { label: "Model kerning", num: true, get: (p) => signed(p.km, 1) }, { label: "Same direction", get: (p) => (p.agree ? "yes" : "no") }],
      () => pts.slice().sort((x, y) => x.kd - y.kd), { caption: "Designer and model kerning on the pairs the designer kerned", size: "medium" });
  }

  function scatter(container, W, pts) {
    clear(container);
    const H = Math.min(W, 460);
    const m = { l: 52, r: 14, t: 14, b: 44 };
    const maxAbs = Math.max(10, ...pts.map((p) => Math.max(Math.abs(p.kd), Math.abs(p.km))));
    const ticks = SQA.niceTicks(-maxAbs, maxAbs, W < 420 ? 4 : 6);
    const lim = Math.max(Math.abs(ticks[0]), Math.abs(ticks[ticks.length - 1]), maxAbs);
    const X = (v) => m.l + ((v + lim) / (2 * lim)) * (W - m.l - m.r);
    const Y = (v) => H - m.b - ((v + lim) / (2 * lim)) * (H - m.t - m.b);
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "chart", role: "img", "aria-label": `Scatter of ${pts.length} kerned pairs: designer kerning against model kerning. Use the arrow keys to read the points, largest disagreements first.` });
    const grid = s("g", { class: "grid" });
    ticks.forEach((t) => {
      grid.appendChild(s("line", { x1: X(t), x2: X(t), y1: m.t, y2: H - m.b }));
      grid.appendChild(s("line", { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t) }));
      root.appendChild(s("text", { x: X(t), y: H - m.b + 16, "text-anchor": "middle", class: "tick" }, fmt(t, 0)));
      root.appendChild(s("text", { x: m.l - 6, y: Y(t) + 4, "text-anchor": "end", class: "tick" }, fmt(t, 0)));
    });
    root.appendChild(grid);
    root.appendChild(s("line", { x1: X(0), x2: X(0), y1: m.t, y2: H - m.b, class: "zero" }));
    root.appendChild(s("line", { x1: m.l, x2: W - m.r, y1: Y(0), y2: Y(0), class: "zero" }));
    root.appendChild(s("line", { x1: X(-lim), y1: Y(-lim), x2: X(lim), y2: Y(lim), class: "diag" }));
    root.appendChild(s("text", { x: (m.l + W - m.r) / 2, y: H - 8, "text-anchor": "middle", class: "muted-label" }, "designer kerning"));
    root.appendChild(s("text", { x: 12, y: (m.t + H - m.b) / 2, "text-anchor": "middle", class: "muted-label", transform: `rotate(-90 12 ${(m.t + H - m.b) / 2})` }, "model kerning"));
    const dots = s("g");
    const nodes = pts.map((p) => {
      const c = s("circle", { cx: X(p.kd), cy: Y(p.km), r: 4, class: "pt " + (p.agree ? "agree" : "disagree"), style: p.agree ? "" : "fill:var(--surface);stroke:var(--s-human);stroke-width:2" });
      dots.appendChild(c);
      return c;
    });
    root.appendChild(dots);
    const ring = s("circle", { r: 8, class: "sel", cx: -20, cy: -20 });
    root.appendChild(ring);
    const content = (p) => ({ title: `${p.label}`, rows: [["Designer", signed(p.kd, 1)], ["Model", signed(p.km, 1)], ["Difference", signed(p.kd - p.km, 1)]], note: p.agree ? "Same direction." : Math.abs(p.km) < 0.5 ? "The model does not kern this pair." : "Opposite direction." });
    root.addEventListener("pointermove", (ev) => {
      const rr = root.getBoundingClientRect();
      const sx = W / rr.width;
      const x = (ev.clientX - rr.left) * sx, y = (ev.clientY - rr.top) * sx;
      let best = -1, bd = 24 * 24;
      pts.forEach((p, i) => { const dx = X(p.kd) - x, dy = Y(p.km) - y; const dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = i; } });
      if (best < 0) { tip.hide(); ring.setAttribute("cx", -20); return; }
      ring.setAttribute("cx", X(pts[best].kd)); ring.setAttribute("cy", Y(pts[best].km));
      tip.show(content(pts[best]), ev.clientX, ev.clientY);
    });
    root.addEventListener("pointerleave", () => { tip.hide(); ring.setAttribute("cx", -20); });
    const order = pts.map((p, i) => i).sort((i, j) => Math.abs(pts[j].kd - pts[j].km) - Math.abs(pts[i].kd - pts[i].km));
    SQA.keyNav(root, order.map((i) => ({ node: nodes[i], content: () => content(pts[i]), label: `${pts[i].label}: designer ${signed(pts[i].kd, 0)}, model ${signed(pts[i].km, 0)}` })), {
      onMove(k) { if (k < 0) { ring.setAttribute("cx", -20); return; } const p = pts[order[k]]; ring.setAttribute("cx", X(p.kd)); ring.setAttribute("cy", Y(p.km)); },
    });
    container.appendChild(root);
  }

  function technical(root, r) {
    const t = r.timing_ms || {};
    const f = r.font || {};
    const det = h("details", { class: "panel", style: { marginTop: "36px" } },
      h("summary", { style: { cursor: "pointer", fontWeight: 600 } }, "Technical details"),
      h("dl", { class: "defs" },
        h("dt", null, "Tool"), h("dd", null, `${r.tool || "–"} · ${r.engine || "–"} · schema ${r.schema || "–"}`),
        h("dt", null, "Checked"), h("dd", null, r.generated || "–"),
        h("dt", null, "Source"), h("dd", null, f.source ? [f.source.kind, f.source.last_modified ? `last modified ${f.source.last_modified}` : null, f.source.path].filter(Boolean).join(" · ") : "–"),
        h("dt", null, "File hash"), h("dd", null, h("code", null, f.hash || "–")),
        h("dt", null, "Timing"), h("dd", null, `load ${fmt(t.load, 0)} ms · prepare ${fmt(t.prepare, 0)} ms · solve ${fmt(t.solve, 0)} ms · total ${fmt(t.total, 0)} ms`)));
    root.appendChild(det);
  }

  // ---------------------------------------------------------------- the family view
  // The family's main report while its locations are picked
  // (#/family/<slug>?at=wght:700&name=Bold): picking another does not load it again.
  let mainCache = null;
  const CACHE_MS = 10 * 60 * 1000;

  /**
   * The location a family page's URL names — `at`: the axes that differ from
   * the default location ("wght:700,wdth:75"), `name`: its name — or null for
   * the default location (or a font without those axes).
   */
  function locationOf(rep, at, atName) {
    const f = rep.font || {};
    if (!f.axes || !f.axes.length) return null;
    const D = SQA.designspace;
    const m = D.model(ownDesignspace(rep) || { axes: f.axes, main: f.location, instances: [], italic: rep.italic || null });
    if (!m) return null;
    const over = SQA.parseLocation(at);
    // `ital:1`: a location of the family's italic font (when it has one)
    const tags = new Set(m.order.concat(m.italic ? m.italic.order.concat(["ital"]) : []));
    if (!Object.keys(over).some((t) => tags.has(t))) return null;
    const loc = D.locate(m, over);
    if (SQA.sameLocation(loc, m.main)) return null;
    // a location the scan checked keeps its own name
    const row = m.rows.find((r) => SQA.sameLocation(r.location, loc));
    const desc = D.describe(m, loc);
    const given = String(atName || "").trim().slice(0, 80);
    const name = row ? row.name : given || D.nameOf(m, loc);
    const redundant = D.sameParts(name, desc);
    // named: a listed location, or a name the address gave (a location typed in has none)
    return { name, desc, location: loc, redundant, italic: !!loc.ital, named: !!row || !!given, label: redundant ? name : `${name} (${desc})` };
  }

  function familyView(ctx, params, slugIn) {
    const slug = decodeURIComponent(slugIn || "").toLowerCase();
    const at = (params && params.get("at")) || "";
    const atName = (params && params.get("name")) || "";
    const row = SQA.store.families ? SQA.store.families.find((x) => x.slug === slug) : null;
    const name = row ? row.name : slug;
    ctx.setTitle(name);
    const root = ctx.root;
    const base = "#/family/" + encodeURIComponent(slug);
    const libraryHref = () => (SQA.libraryHref ? SQA.libraryHref() : "#/");
    // picking a location, or coming back from one: the main report just loaded
    const cached = mainCache && mainCache.slug === slug && (at || mainCache.picking) && Date.now() - mainCache.t < CACHE_MS ? mainCache : null;
    const willCheck = !cached && row && (!row.level || row.stale);
    const crumbs = h("p", { class: "crumbs", style: { marginTop: "28px" } }, h("a", { href: libraryHref() }, "← Library"));
    let waitEl = SQA.loading(willCheck ? `Checking ${name} now…` : `Loading the report of ${name}…`, willCheck ? "The font is downloaded from Google Fonts and spaced by Kinetikern2 at its three presets and its best fit, and with each other setting; this takes a few seconds." : null);
    if (!cached) root.append(crumbs, waitEl);
    const slow = cached ? null : setTimeout(() => {
      if (!ctx.alive() || !waitEl.isConnected || willCheck) return;
      const nw = SQA.loading(`Checking ${name} now…`, "No current report was stored, so the font is being downloaded and checked; this takes a few seconds.");
      waitEl.replaceWith(nw); waitEl = nw;
    }, 900);
    ctx.onCleanup(() => clearTimeout(slow));

    /** Links and picks of this family's locations: the URL holds the location. */
    function links(rep) {
      const f = rep.font || {};
      const main = SQA.designspace.fill(f.axes || [], null, f.location || {});
      const enc = (t) => encodeURIComponent(t).replace(/%3A/gi, ":").replace(/%2C/gi, ",");
      const href = (r) => {
        if (r.main || SQA.sameLocation(r.location, main)) return base;
        return `${base}?at=${enc(SQA.locationString(SQA.locationDiff(r.location, main)))}${r.custom ? "" : "&name=" + encodeURIComponent(r.name)}`;
      };
      return { dsHref: href, dsPick: (r) => { const u = href(r); if (location.hash !== u) location.hash = u; } };
    }

    async function load(refresh) {
      try {
        const [rep, info] = await Promise.all([
          cached && !refresh ? cached.rep : api(`/api/family/${encodeURIComponent(slug)}${refresh ? "?refresh=1" : ""}`, { signal: ctx.signal }),
          SQA.getInfo(false, ctx.signal).catch((e) => { if (isAbort(e)) throw e; return null; }),
        ]);
        const library = await SQA.getLibrary(info, ctx.signal).catch((e) => { if (isAbort(e)) throw e; return null; });
        const families = library ? SQA.store.families : await SQA.getFamilies(false, ctx.signal).catch((e) => { if (isAbort(e)) throw e; return null; });
        if (!ctx.alive()) return;
        if (refresh || willCheck) SQA.store.familiesAt = 0; // the library table re-reads it
        clearTimeout(slow);
        mainCache = { slug, rep, t: cached && !refresh ? cached.t : Date.now(), picking: false };
        const env = { info, library, families };
        const target = at ? locationOf(rep, at, atName) : null;
        if (target) {
          mainCache.picking = true;
          // the address of what is shown (values within the axes, no axes the font lacks)
          const canon = links(rep).dsHref({ location: target.location, name: target.name, custom: !target.named });
          if (canon !== location.hash) history.replaceState(null, "", canon);
          pick(rep, target, env);
          return;
        }
        // the default location, or one this font does not have: the family's own page
        if (at) history.replaceState(null, "", base);
        clear(root);
        ctx.setTitle((rep.font && rep.font.family) || name);
        renderReport(ctx, root, rep, Object.assign({
          mode: "family", slug, familyName: row ? row.name : (rep.font && rep.font.family) || name, familyKey: row ? row.name : slug,
          onRecheck: async (btn) => {
            btn.disabled = true;
            btn.textContent = "Re-checking…";
            const bar = h("div", { class: "progress indeterminate", style: { width: "160px", alignSelf: "center" }, "aria-hidden": "true" }, h("span"));
            btn.after(bar);
            SQA.announce(`Re-checking ${name}`);
            try { await load(true); }
            finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = "Re-check now"; bar.remove(); } }
          },
        }, env, links(rep)));
        if (refresh) SQA.announce(`${name} re-checked: ${rep.status ? rep.status.level : ""}`);
        ctx.focusHeading();
      } catch (e) {
        if (isAbort(e) || !ctx.alive()) return;
        clearTimeout(slow);
        if (refresh) {
          const msgEl = h("p", { class: "msg error", role: "alert" }, "The re-check failed: " + e.message);
          const actions = root.querySelector(".report-actions");
          if (actions) actions.after(msgEl); else root.prepend(msgEl);
          return;
        }
        clear(root);
        root.appendChild(crumbs);
        if (e.status === 404) {
          ctx.setTitle("Family not found");
          root.appendChild(h("div", { class: "view-head" }, h("h1", { tabindex: "-1" }, "Family not found"),
            h("p", { class: "lede" }, `There is no family “${slug}” in the catalog. `, h("a", { href: "#/?q=" + encodeURIComponent(slug.replace(/-/g, " ")) }, "Search the library"), " for it.")));
        } else root.appendChild(SQA.errorBox(e, () => { clear(root); root.append(crumbs, SQA.loading(`Loading ${name}…`)); load(false); }));
        ctx.focusHeading();
      }
    }

    /** The family at a picked location: checked now (on the server, or in the browser), not stored. */
    async function pick(rep, target, env) {
      const f = rep.font || {};
      const family = f.family || name;
      const lk = links(rep);
      const own = ownDesignspace(rep);
      const picked = { name: target.name, desc: target.desc, redundant: target.redundant, label: target.label, location: target.location, backHref: base };
      const q = new URLSearchParams({ location: SQA.locationString(target.location), instance: target.name });
      const url = `/api/family/${encodeURIComponent(slug)}?${q.toString()}`;
      const userBusy = () => { const a = document.activeElement; return !!a && a !== document.body && root.contains(a) && a.tagName !== "H1"; };
      const show = (rep2) => {
        clear(root);
        ctx.setTitle(`${family} — ${target.name}`);
        renderReport(ctx, root, rep2, Object.assign({
          mode: "family", slug, familyName: row ? row.name : family, familyKey: row ? row.name : slug, picked, designspace: own,
          onRecheck: async (btn) => {
            btn.disabled = true;
            btn.textContent = "Re-checking…";
            const bar = h("div", { class: "progress indeterminate", style: { width: "160px", alignSelf: "center" }, "aria-hidden": "true" }, h("span"));
            btn.after(bar);
            SQA.announce(`Re-checking ${family} at ${target.label}`);
            try {
              const again = await api(url, { signal: ctx.signal });
              if (!ctx.alive()) return;
              show(again);
              SQA.announce(`${target.label} re-checked: ${again.status ? again.status.level : ""}`);
              ctx.focusHeading();
            } catch (e) {
              if (isAbort(e) || !ctx.alive()) return;
              const msgEl = h("p", { class: "msg error", role: "alert" }, "The re-check failed: " + e.message);
              const actions = root.querySelector(".report-actions");
              if (actions) actions.after(msgEl); else root.prepend(msgEl);
            } finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = "Re-check now"; bar.remove(); } }
          },
        }, env, lk));
      };
      clear(root);
      ctx.setTitle(`${family} — ${target.name}`);
      const ui = renderPicking(ctx, root, {
        crumbs: h("p", { class: "crumbs" }, h("a", { href: libraryHref() }, "← Library")),
        eyebrow: [f.category || "Category unknown", target.italic ? "Italic variable font" : "Variable font"].join(" · "),
        title: family, picked,
        sub: SQA.STATIC
          ? "Checked in your browser: the font is downloaded from Google Fonts and spaced by Kinetikern2 at this location, at its three presets and its best fit, and with each other setting — a few seconds. Nothing is stored."
          : "Checked live on the server: the font is spaced by Kinetikern2 at this location, at its three presets and its best fit, and with each other setting — a few seconds. Nothing is stored.",
        model: own ? SQA.designspace.model(own) : null,
        dsOpts: { current: target.location, href: lk.dsHref, pick: lk.dsPick, where: SQA.STATIC ? "in your browser" : "on the server", seconds: pickSeconds() },
      });
      ctx.focusHeading();
      try {
        const rep2 = await api(url, { signal: ctx.signal });
        if (!ctx.alive()) return;
        const refocus = !userBusy();
        show(rep2);
        SQA.announce(`Checked ${family} at ${target.label}: ${rep2.status ? rep2.status.level : ""}`);
        if (refocus) ctx.focusHeading();
      } catch (e) {
        if (isAbort(e) || !ctx.alive()) return;
        ui.fail(e, () => pick(rep, target, env));
      }
    }

    // a fresh family list already knows the slug does not exist: no request needed
    if (SQA.store.families && Date.now() - SQA.store.familiesAt < 60000 && !row) {
      clearTimeout(slow);
      clear(root);
      root.appendChild(crumbs);
      ctx.setTitle("Family not found");
      root.appendChild(h("div", { class: "view-head" }, h("h1", { tabindex: "-1" }, "Family not found"),
        h("p", { class: "lede" }, `There is no family “${slug}” in the catalog. `, h("a", { href: "#/?q=" + encodeURIComponent(slug.replace(/-/g, " ")) }, "Search the library"), " for it.")));
      return;
    }
    load(false);
  }

  SQA.reportParts = { normsFor, percentileOf, ordinal };
  SQA.renderReport = renderReport;
  SQA.renderPicking = renderPicking;
  SQA.views = SQA.views || {};
  SQA.views.family = familyView;
})();
