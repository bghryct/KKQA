/*
 * Spacing QA — a variable font across its designspace (family pages and
 * uploads): the locations the check covers — every named instance, every
 * axis's minimum and maximum (its edges) and every corner of the designspace
 * (all axes at their extremes together; a font with more than six axes: the
 * corners of wght, wdth and opsz, and each other axis's extremes at the
 * lightest and the boldest weight) — a picker that checks any location live,
 * the table of every location, and the spacing along each axis and across
 * two of them.
 *
 *   SQA.designspace.model(src)                  → the locations to draw, or null
 *   SQA.designspace.section(ctx, root, m, opts) → the section
 *   SQA.designspace.fill(axes, base, over)      → a location with every axis
 *   SQA.designspace.locate(m, over)             → the full location a partial one names
 *
 * A family's italic variable font (report.italic) has locations of its own:
 * in report.instances with italic: true and ital: 1 in their location, filled
 * from the italic's axes — each judged against its upright counterpart where
 * it was measured along its italic angle (at most WARN), reported only where
 * it was measured upright.
 *
 * A location is {tag: user value} for every axis. `m.main` ("the default
 * location" in the code below) is the main report's: Regular (weight 400,
 * width 100, upright where the axes reach them), every other axis at its
 * default — the page calls it Regular, the main report, since the font's own
 * default location can be elsewhere.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, s, clear, fmt, signed, int, tip, badge } = SQA;

  const KIND = {
    default: { label: "Main report", group: "Regular (the main report)", order: 0 },
    named: { label: "Named", group: "Named instances", order: 1 },
    edge: { label: "Edge", group: "Edges", order: 2 },
    corner: { label: "Corner", group: "Corners", order: 3 },
  };
  // a family's italic variable font, checked across its own designspace: each
  // location against its upright counterpart (reported only, measured upright)
  const ITALIC_GROUP = "Italic (a font of its own)";
  const SKIPPED = {
    monospaced: "monospaced — every letter has the same advance width, so the spacing is set by the width",
    "fixed-widths": "two or three fixed widths — every letter has one of them, so the spacing is set by the widths",
    decorated: "the glyphs touch by construction — a line, a grid, a background or an effect runs through every glyph",
    "not-latin": "no basic Latin alphabet at this location",
    "no-outlines": "no outlines at this location",
  };
  const MEASURES = {
    best_looseness: { label: "Looseness", long: "best-fit Looseness", fmt: (v) => signed(v, 2), tick: (v) => signed(v, 1) },
    shape_error: { label: "Shape error", long: "shape error (units per 1000 em)", fmt: (v) => fmt(v, 1), tick: (v) => fmt(v, 0) },
  };
  const PRESET_ORDER = { tight: 0, standard: 1, loose: 2 };
  const finite = (v) => typeof v === "number" && Number.isFinite(v);
  const near = (a, b) => Math.abs(a - b) < 1e-3;
  const measurable = (r) => finite(r.best_looseness) && finite(r.shape_error);
  const slanted = (loc) => (finite(loc.slnt) && Math.abs(loc.slnt) > 1e-3) || (finite(loc.ital) && loc.ital >= 0.5);
  const validAxes = (list) => (Array.isArray(list) ? list : []).filter((a) => a && a.tag && finite(a.min) && finite(a.max));
  /** A location without the italic marker (`ital`: 1 on the italic font's locations). */
  const upright = (loc) => { const o = Object.assign({}, loc); delete o.ital; return o; };
  const inItalic = (loc) => !!loc && finite(loc.ital) && loc.ital >= 0.5;
  let uid = 0;

  // ---------------------------------------------------------------- the model
  /** A location with every axis of `axes`: from `over`, else `base`, else the axis default — within the axis. */
  function fill(axes, base, over) {
    const out = {};
    (axes || []).forEach((a) => {
      let v = over && finite(over[a.tag]) ? over[a.tag] : base && finite(base[a.tag]) ? base[a.tag] : a.default;
      if (!finite(v)) v = a.min;
      out[a.tag] = Math.min(a.max, Math.max(a.min, v));
    });
    return out;
  }
  /** "wdth 200 (max)" and "wdth 200" name the same place; so do corners in any axis order. */
  function sameParts(name, desc) {
    const parts = (t) => String(t || "").toLowerCase().replace(/−/g, "-").replace(/\s*\((min|max)\)\s*$/, "").split(" · ").map((x) => x.trim()).filter(Boolean).sort().join("|");
    return parts(name) === parts(desc);
  }
  /** A report's level without what its designspace adds (the main location's own level). */
  function ownLevel(r) {
    const st = r.status || {};
    const rs = (st.reasons || []).filter((x) => x.code !== "spacing/designspace" && x.code !== "spacing/instances");
    if (!rs.length) return st.level || null;
    return rs.reduce((a, x) => (SQA.LEVEL_RANK[x.level] > SQA.LEVEL_RANK[a] ? x.level : a), rs[0].level);
  }
  const byLevel = (a, b) => SQA.LEVEL_RANK[b.level] - SQA.LEVEL_RANK[a.level];

  /** The axes, order and default location a location belongs to: the upright font's, or the italic font's. */
  const frameOf = (m, italic) => (italic && m.italic ? m.italic : m);
  /** A full location from a partial one, relative to the default location (`ital` ≥ 0.5: in the italic font). */
  function locate(m, over) {
    const italic = inItalic(over) && !!m.italic;
    const f = frameOf(m, italic);
    const loc = fill(f.axes, f.main, over || {});
    if (italic) loc.ital = 1;
    return loc;
  }
  /** "wght 700 · wdth 75" against the default location; "italic · wght 700" against the italic's. */
  function describe(m, loc) {
    const italic = inItalic(loc);
    const f = frameOf(m, italic);
    const rel = SQA.describeLocation(upright(loc), f.main, f.order);
    if (!italic) return rel;
    return rel === "the default location" ? "italic" : "italic · " + rel;
  }
  /** The name of a location no list names (one typed in): its axes; "Italic · …" in the italic. */
  function nameOf(m, loc) {
    const d = describe(m, loc);
    return d === "italic" ? "Italic" : d.replace(/^italic · /, "Italic · ");
  }

  function makeRow(it, m) {
    const italic = !!it.italic || inItalic(it.location || it.coords);
    const f = frameOf(m, italic);
    const loc = fill(f.axes, f.main, it.location || it.coords || {});
    if (italic) loc.ital = 1;
    const r = {
      name: String(it.name || nameOf(m, loc)),
      kind: KIND[it.kind] ? it.kind : "named",
      location: loc, italic,
      desc: describe(m, loc),
      main: !!it.main, extreme: !!it.extreme, pending: !!it.pending, custom: !!it.custom,
      rawLevel: it.level || null,
      closest: it.closest || null,
      best_looseness: finite(it.best_looseness) ? it.best_looseness : null,
      shape_error: finite(it.shape_error) ? it.shape_error : null,
      sidebearing_error: finite(it.sidebearing_error) ? it.sidebearing_error : null,
      kern_r: finite(it.kern_r) ? it.kern_r : null,
      reasons: Array.isArray(it.reasons) ? it.reasons.slice().sort(byLevel) : [],
      skipped: it.skipped || null,
      error: it.error || null,
      slanted: slanted(loc),
    };
    finish(r);
    return r;
  }
  function finish(r) {
    // older scans wrote a skipped location as an error "Skipped: …"
    const skipText = r.error && /^skipped\b/i.test(r.error);
    r.outOfRange = SQA.outOfRange(r.best_looseness);
    r.level = r.pending ? null : r.skipped || skipText ? "SKIP" : r.error ? "ERROR" : r.rawLevel || "INFO";
    r.notes = [];
    if (r.skipped) r.notes.push(`Skipped: ${SKIPPED[r.skipped] || r.skipped}.`);
    else if (skipText) r.notes.push(r.error);
    else if (r.error) r.notes.push("Not checked: " + r.error);
    else if (!r.pending) {
      if (r.italic) r.notes.push("The italic: judged against its upright where measured along its italic angle (at most WARN), else reported only.");
      else if (r.slanted) r.notes.push("Slanted: judged against its upright where measured along its angle (at most WARN), else reported only.");
      if (r.outOfRange) r.notes.push(`The fit stopped at its limit (±${SQA.FIT_LIMIT}): reported, not judged.`);
    }
    r.redundant = sameParts(r.name, r.desc);
    r.label = r.main || r.redundant ? r.name : `${r.name} (${r.desc})`;
  }
  function fromReport(r, rep) {
    const sm = rep.summary;
    Object.assign(r, {
      pending: false, closest: sm.closest || null,
      best_looseness: finite(sm.best_looseness) ? sm.best_looseness : null,
      shape_error: finite(sm.shape_error) ? sm.shape_error : null,
      sidebearing_error: finite(sm.sidebearing_error) ? sm.sidebearing_error : null,
      kern_r: finite(sm.kern_r) ? sm.kern_r : null,
      rawLevel: ownLevel(rep),
    });
    finish(r);
  }

  /**
   * The locations of a variable font, for the page. src: {axes, main (the
   * main report's location), mainReport (its report: the numbers of the main
   * location), instances (checked: report.instances) or locations (from
   * /api/designspace: not checked yet), italic (report.italic: the family's
   * italic variable font, whose locations are in `instances` with ital 1),
   * reasons (the family's spacing/designspace and spacing/instances), from
   * ({generated}: the locations come from an earlier check than the report shown)}.
   */
  function model(src) {
    if (!src) return null;
    const axes = validAxes(src.axes);
    if (!axes.length) return null;
    const order = axes.map((a) => a.tag);
    const main = fill(axes, null, src.main || {});
    const m = { axes, order, main, italic: null };
    // the italic font: its own axes; its default location is the main report's weight, its other axes at their defaults
    const ia = src.italic && src.italic.file ? validAxes(src.italic.axes) : [];
    if (ia.length) {
      const imain = {};
      ia.forEach((a) => { imain[a.tag] = a.tag === "wght" && finite(main.wght) ? Math.min(a.max, Math.max(a.min, main.wght)) : a.default; });
      m.italic = { axes: ia, order: ia.map((a) => a.tag), main: imain, file: src.italic.file };
    }
    m.italicError = src.italic && !src.italic.file && src.italic.error ? String(src.italic.error) : null;
    const checked = Array.isArray(src.instances) && src.instances.length > 0;
    const list = checked ? src.instances : (Array.isArray(src.locations) ? src.locations : []).map((l) => ({ name: l.name, kind: l.kind, location: l.coords || l.location, extreme: l.extreme, pending: true }));
    const rows = list.map((it) => makeRow(it, m));
    const mr = src.mainReport && src.mainReport.summary ? src.mainReport : null;
    let mainRow = rows.find((r) => r.main) || rows.find((r) => !r.italic && SQA.sameLocation(r.location, main)) || null;
    if (mainRow) {
      mainRow.main = true;
      if (mainRow.pending && mr) fromReport(mainRow, mr);
      finish(mainRow);
    } else if (mr) {
      // the main report's location is not among the locations (an axis default between named instances)
      mainRow = makeRow({ name: "Regular", kind: "default", location: main, main: true }, m);
      fromReport(mainRow, mr);
      rows.unshift(mainRow);
    }
    rows.forEach((r, i) => { r.k = i; });
    const reasons = Array.isArray(src.reasons) ? src.reasons : [];
    return Object.assign(m, {
      rows, mainRow, checked,
      summary: reasons.find((x) => x.code === "spacing/designspace") || null,
      raised: reasons.filter((x) => x.code === "spacing/instances").sort(byLevel),
      from: src.from || null,
    });
  }

  // ---------------------------------------------------------------- the section
  /**
   * opts: {current (the location this page shows; null: the main report's),
   * href(row) → a link that shows a location (family pages), pick(row) shows
   * one, where (where a location is checked, for the wording), seconds (one
   * location's check), checkAll ({label, text, run(box, button)}: an upload
   * not checked at every location yet)}
   */
  function section(ctx, root, m, opts) {
    const o = opts || {};
    const cur = o.current ? locate(m, o.current) : m.main;
    const sec = h("section", { "aria-labelledby": "designspace-h", class: "designspace" });
    sec.appendChild(h("h2", { id: "designspace-h", tabindex: "-1" }, "Designspace"));
    const counts = { named: 0, edge: 0, corner: 0 };
    m.rows.forEach((r) => { if (r.kind in counts && !r.italic) counts[r.kind]++; });
    const n = m.rows.filter((r) => r.kind !== "default" && !r.italic).length;
    sec.appendChild(h("p", { class: "section-intro" },
      "A variable font is checked at Regular, the way Google Fonts serves it — weight 400, width 100 and upright where the axes reach them, every other axis at its default: the main report — and across its designspace: at every named instance, at every axis's minimum and maximum (its edges, the other axes where the main report has them) and at every corner of its designspace (all axes at their extremes together; a font with more than six axes: the corners of weight, width and optical size, and each other axis's extremes at the lightest and the boldest weight). ",
      m.italic ? "A family's italic variable font is checked across its own designspace too: each location measured along its italic angle is judged against its upright counterpart (at most WARN), and one measured upright is reported only. " : "",
      o.pick ? "Pick any location to see its full report, checked live." : ""));
    if (m.summary) sec.appendChild(h("p", { class: "ds-summary" }, m.summary.message));
    else if (!m.checked && n) {
      sec.appendChild(h("p", { class: "ds-summary" }, `This font has ${SQA.plural(n, "location")} to check: ${[
        counts.named ? SQA.plural(counts.named, "named instance") : null, counts.edge ? SQA.plural(counts.edge, "edge") : null, counts.corner ? SQA.plural(counts.corner, "corner") : null,
      ].filter(Boolean).join(", ")}. Only Regular, the main report, is checked so far.`));
    } else if (!m.checked) {
      sec.appendChild(h("p", { class: "ds-summary" }, "The named instances, edges and corners of this designspace have not been checked yet" +
        (o.unchecked || "") + (o.pick ? ". Any location can be checked now, under “Another location”." : ".")));
    }
    if (m.raised.length) {
      sec.appendChild(h("ul", { class: "reasons", style: { marginTop: "10px" } }, m.raised.map((x) => h("li", null,
        h("span", null, badge(x.level)),
        h("span", null, h("span", { class: "code" }, x.code), x.message)))));
    }
    if (m.from) {
      sec.appendChild(h("p", { class: "note", style: { marginTop: "12px" } },
        `The locations are those of the published scan (${SQA.fmtDateTime(m.from.generated)}): the re-check in your browser covers the main report (Regular) only, because each location takes a few seconds here. Pick a location to check it now.`));
    }
    sec.appendChild(axesList(m));
    if (o.pick) sec.appendChild(picker(m, o, cur));
    if (o.checkAll) sec.appendChild(checkAllBox(o.checkAll));
    if (m.rows.length > 1 || m.checked) table(sec, m, o, cur);
    charts(ctx, sec, m, o, cur);
    root.appendChild(sec);
    return sec;
  }

  function axesList(m) {
    const list = h("ul", { class: "ds-axes", "aria-label": "Axes" }, m.axes.map((a) => {
      const at = m.main[a.tag];
      return h("li", null, h("b", null, a.tag), ` ${SQA.axisNum(a.min)} to ${SQA.axisNum(a.max)}`,
        h("span", { class: "muted" }, near(at, a.default) ? ` · default ${SQA.axisNum(a.default)}` : ` · axis default ${SQA.axisNum(a.default)}, checked at ${SQA.axisNum(at)}`));
    }));
    if (m.italic) {
      // the italic font's axes, where they differ from the upright's
      const same = m.italic.axes.length === m.axes.length && m.italic.axes.every((a) => m.axes.some((b) => b.tag === a.tag && near(a.min, b.min) && near(a.max, b.max) && near(a.default, b.default)));
      list.appendChild(h("li", { class: "ds-italic-axes" }, h("b", null, "italic"), " a font of its own",
        h("span", { class: "muted" }, same ? " · the same axes" : " · " + m.italic.axes.map((a) => `${a.tag} ${SQA.axisNum(a.min)} to ${SQA.axisNum(a.max)}`).join(", "))));
    } else if (m.italicError) {
      list.appendChild(h("li", { class: "ds-italic-axes" }, h("b", null, "italic"), h("span", { class: "muted" }, " not checked: " + m.italicError)));
    }
    return list;
  }

  function optionText(r) {
    let t = r.name;
    if (r.main) t += " — Regular, the main report";
    else if (!r.redundant) t += ` — ${r.desc}`;
    if (r.level && r.level !== "INFO") t += ` · ${r.level}${r.skipped ? ` (${r.skipped})` : ""}`;
    return t;
  }

  function picker(m, o, cur) {
    const id = "ds-pick-" + ++uid;
    const wrap = h("div", { class: "panel ds-pick" });
    const help = h("p", { class: "small", id: id + "-help" },
      `Each location is checked live${o.where ? " " + o.where : ""} — ${o.seconds ? "about " + (o.seconds < 10 ? fmt(o.seconds, 1) + " s" : SQA.duration(o.seconds)) : "a few seconds"} — with its full report, and is not stored.`);
    if (m.rows.length > 1) {
      const sel = h("select", { id, "aria-describedby": id + "-help" });
      const group = (label, list) => {
        if (!list.length) return;
        const og = h("optgroup", { label: `${label} (${int(list.length)})` });
        list.forEach((r) => og.appendChild(h("option", { value: String(r.k), disabled: r.level === "SKIP" ? true : null }, optionText(r))));
        sel.appendChild(og);
      };
      ["default", "named", "edge", "corner"].forEach((g) => group(KIND[g].group, m.rows.filter((r) => r.kind === g && !r.italic)));
      group(ITALIC_GROUP, m.rows.filter((r) => r.italic));
      const shown = m.rows.find((r) => SQA.sameLocation(r.location, cur));
      if (shown) sel.value = String(shown.k);
      const btn = h("button", { type: "button", class: "btn primary" });
      const sync = () => {
        const r = m.rows[Number(sel.value)];
        const isShown = !!r && SQA.sameLocation(r.location, cur);
        btn.disabled = !r || isShown;
        btn.textContent = isShown ? "Shown on this page" : r && r.main ? "Show the main report (Regular)" : "Check this location";
      };
      sel.addEventListener("change", sync);
      btn.addEventListener("click", () => { const r = m.rows[Number(sel.value)]; if (r) o.pick(r); });
      sync();
      wrap.appendChild(h("div", { class: "ds-pick-row" }, h("label", { for: id, class: "control-label" }, "Location"), sel, btn));
    }
    wrap.appendChild(help);
    // with no listed locations to choose from, the axes are the picker
    wrap.appendChild(custom(m, o, cur, m.rows.length <= 1));
    return wrap;
  }

  /** Any point of the designspace, axis by axis — of the upright font, or of the italic (its own axes). */
  function custom(m, o, cur, open) {
    const k = ++uid;
    const det = h("details", { class: "ds-custom", open: open || null }, h("summary", null, "Another location"));
    let italic = inItalic(cur) && !!m.italic;
    let inputs = [];
    const grid = h("div", { class: "ds-axis-inputs" });
    function build() {
      const f = frameOf(m, italic);
      // start from the location shown when it is in this font, else from its default location
      const start = inItalic(cur) === italic ? cur : f.main;
      clear(grid);
      inputs = f.axes.map((a) => {
        const id = `ds-ax-${k}-${a.tag}`;
        const v = finite(start[a.tag]) ? start[a.tag] : f.main[a.tag];
        const inp = h("input", { type: "number", id, min: String(a.min), max: String(a.max), step: "any", inputmode: "decimal", value: String(+v.toFixed(2)) });
        return { a, inp, el: h("label", { for: id }, h("span", null, a.tag), inp, h("span", { class: "hint" }, `${SQA.axisNum(a.min)} to ${SQA.axisNum(a.max)}`)) };
      });
      inputs.forEach((x) => grid.appendChild(x.el));
    }
    build();
    const fontSwitch = m.italic ? h("div", { class: "controls", style: { margin: "10px 0 0" } }, h("span", { class: "control-label" }, "Font"),
      SQA.segmented("Font", [{ label: "Upright", value: "upright" }, { label: "Italic", value: "italic" }], italic ? "italic" : "upright", (v) => { italic = v === "italic"; build(); })) : null;
    const msg = h("p", { class: "msg", "aria-live": "polite" });
    const form = h("form", { novalidate: true },
      h("p", { class: "small", style: { margin: "6px 0 0" } }, "Any point of the designspace, each axis from its minimum to its maximum."),
      fontSwitch, grid,
      h("div", { class: "row" }, h("button", { type: "submit", class: "btn" }, "Check this location")),
      msg);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const loc = {};
      for (const { a, inp } of inputs) {
        const v = Number(String(inp.value).replace("−", "-"));
        if (String(inp.value).trim() === "" || !Number.isFinite(v) || v < a.min - 1e-9 || v > a.max + 1e-9) {
          SQA.message(msg, `${a.tag}: enter a value from ${SQA.axisNum(a.min)} to ${SQA.axisNum(a.max)}.`, "error");
          inp.focus();
          return;
        }
        loc[a.tag] = v;
      }
      if (italic) loc.ital = 1;
      SQA.message(msg, "");
      if (SQA.sameLocation(loc, cur)) { SQA.message(msg, "This location is shown on this page."); return; }
      const known = m.rows.find((r) => SQA.sameLocation(r.location, loc));
      o.pick(known || makeRow({ name: nameOf(m, loc), kind: "named", location: loc, italic, custom: true, pending: true, main: SQA.sameLocation(loc, m.main) }, m));
    });
    det.appendChild(form);
    return det;
  }

  function checkAllBox(ca) {
    const box = h("div", { class: "panel ds-run" });
    const btn = h("button", { type: "button", class: "btn primary" }, ca.label);
    box.append(h("p", { style: { margin: "0 0 12px" } }, ca.text), btn);
    btn.addEventListener("click", () => ca.run(box, btn));
    return box;
  }

  // ---------------------------------------------------------------- the table
  const COLS = [
    { key: "k", label: "Location", title: "In the designspace's order: named instances as the font lists them, then edges, then corners; then the italic font's" },
    { key: "kind", label: "Kind", title: "Named instance; edge (one axis at its minimum or maximum, the others where the main report has them: Regular — weight 400, width 100, upright — and the rest at their defaults); corner (all axes at their extremes together — with more than six axes, wght, wdth and opsz, or another axis's extreme at the lightest or the boldest weight)" },
    { key: "desc", label: "Axes", title: "The axes whose value differs from Regular, the main report's location (in the italic font: from the italic's own center, at the main report's weight)" },
    { key: "level", label: "Level", title: "Evenness lost against Regular, the main report (an italic or slanted location: against its upright), compared with what the library's families usually lose there, and jumps against neighbouring locations (WARN). A named instance that differs from the main report in weight alone can be WARN or FAIL; edges, corners, named instances at one of them, locations at another width, optical size or custom-axis value than the main report, and italic and slanted locations at most WARN. Italic and slanted locations measured upright, and fits at the limit of the Looseness range, are reported only" },
    { key: "closest", label: "Closest", title: "The Kinetikern2 preset nearest to the spacing at this location" },
    { key: "best_looseness", label: "Looseness", num: true, title: "Best-fit Looseness (a connected script: matched to its joined letters): −0.5 is the tight preset, 0 standard, +0.5 loose. Reported, not judged: weights, widths and optical sizes are meant to differ" },
    { key: "shape_error", label: "Shape error", num: true, title: "How far the gaps depart from even spacing of these shapes, overall tightness taken out (units per 1000 em)" },
    { key: "sidebearing_error", label: "Sidebearing error", num: true, title: "Mean absolute sidebearing difference from the best-fit model, offset removed (units per 1000 em)" },
    { key: "kern_r", label: "Kerning r", num: true, title: "Correlation of the designer's kerning with the model's" },
    { key: "notes", label: "Notes", title: "Why a location is raised, skipped or not judged" },
  ];
  function compare(key, dir) {
    const nullsLast = (a, b, f) => {
      const an = a === null || a === undefined, bn = b === null || b === undefined;
      if (an && bn) return 0;
      if (an) return 1;
      if (bn) return -1;
      return f(a, b) * dir;
    };
    const num = (x, y) => x - y;
    switch (key) {
      case "k": return (a, b) => (a.k - b.k) * dir;
      case "kind": return (a, b) => ((KIND[a.kind].order + (a.italic ? 10 : 0)) - (KIND[b.kind].order + (b.italic ? 10 : 0))) * dir || a.k - b.k;
      case "desc": return (a, b) => (a.main ? -1 : b.main ? 1 : a.desc.localeCompare(b.desc, "en", { numeric: true }) * dir) || a.k - b.k;
      case "level": return (a, b) => nullsLast(a.level ? SQA.LEVEL_RANK[a.level] : null, b.level ? SQA.LEVEL_RANK[b.level] : null, num) || a.k - b.k;
      case "closest": return (a, b) => nullsLast(PRESET_ORDER[a.closest], PRESET_ORDER[b.closest], num) || a.k - b.k;
      default: return (a, b) => nullsLast(a[key], b[key], num) || a.k - b.k;
    }
  }
  function looseCell(v) {
    if (!finite(v)) return h("span", { class: "na" }, "–");
    const bw = Math.min(Math.abs(v), 1) * 32;
    const x = v < 0 ? 32 - bw : 32;
    return [
      SQA.outOfRange(v) ? [h("span", { class: "tag", title: `The best fit stopped at the limit of the Looseness range (±${SQA.FIT_LIMIT}): this location is reported, not judged.` }, "out of range"), " "] : null,
      h("span", { class: "lb " + (v < 0 ? "neg" : "pos"), style: `--x:${x.toFixed(1)}px;--bw:${bw.toFixed(1)}px` }, signed(v, 2)),
    ];
  }

  function table(sec, m, o, cur) {
    const st = { sort: "k", dir: 1 };
    const mainShown = SQA.sameLocation(cur, m.main);
    const thead = h("thead"), tbody = h("tbody");
    const tbl = h("table", { class: "locations" },
      h("caption", { class: "sr-only" }, `Every location of the designspace checked, with its level and numbers.${o.pick ? " Each location's name checks it." : ""} Column headers sort.`), thead, tbody);
    const wrap = h("div", { class: "table-wrap medium" }, tbl);
    sec.append(h("h3", null, "Every location"), wrap,
      h("div", { class: "table-foot" }, h("span", null, `${SQA.plural(m.rows.length, "location")}. Numbers in units per 1000 em; Looseness bars: `,
        h("span", { style: { color: "var(--div-neg-text)" } }, "◀"), " tighter · looser ", h("span", { style: { color: "var(--div-pos-text)" } }, "▶"), ".")));
    const tr = h("tr");
    COLS.forEach((c) => {
      const th = h("th", { scope: "col", class: c.num ? "num" : "", title: c.title });
      if (c.key === "notes") th.textContent = c.label;
      else {
        const b = h("button", { type: "button", class: "sort" }, c.label);
        b.addEventListener("click", () => {
          if (st.sort === c.key) st.dir = -st.dir;
          else { st.sort = c.key; st.dir = c.num || c.key === "level" ? -1 : 1; }
          render();
        });
        th.appendChild(b);
      }
      tr.appendChild(th);
    });
    thead.appendChild(tr);

    function rowEl(r) {
      const isCur = SQA.sameLocation(r.location, cur);
      const cls = [isCur ? "current" : "", r.level === "SKIP" ? "skipped" : ""].filter(Boolean).join(" ");
      let name;
      if (o.href) name = h("a", { href: o.href(r) }, r.name);
      else if (o.pick) name = h("button", { type: "button", class: "linklike", onclick: () => o.pick(r) }, r.name);
      else name = h("span", null, r.name);
      const tags = [];
      if (r.main) tags.push(h("span", { class: "tag", title: "Regular: the main report's location" }, "main"));
      if (isCur && !mainShown) tags.push(h("span", { class: "tag shown", title: "The report on this page is of this location" }, "shown"));
      const notes = h("td", { class: "notes" },
        r.reasons.map((x) => h("div", { class: "ds-reason" }, badge(x.level), h("span", null, x.message))),
        r.notes.map((t) => h("div", { class: "small" }, t)));
      return h("tr", { "data-k": String(r.k), class: cls || null, "aria-current": isCur ? "true" : null },
        h("td", null, name, tags.length ? [" ", tags] : null),
        h("td", null, KIND[r.kind].label,
          r.italic ? [" ", h("span", { class: "tag italic", title: "A location of the family's italic font: judged against its upright where measured along its italic angle (at most WARN), else reported only" }, "italic")] : null,
          r.extreme && r.kind === "named" ? [" ", h("span", { class: "tag", title: "This named instance is also an edge or a corner of the designspace" }, "extreme")] : null),
        h("td", null, r.main ? h("span", { class: "muted" }, "Regular (main report)") : r.desc),
        h("td", null, r.level ? badge(r.level) : h("span", { class: "na" }, "not checked yet")),
        h("td", null, SQA.presetChip(r.closest)),
        h("td", { class: "num" }, looseCell(r.best_looseness)),
        h("td", { class: "num" }, fmt(r.shape_error, 1)),
        h("td", { class: "num" }, fmt(r.sidebearing_error, 1)),
        h("td", { class: "num" }, fmt(r.kern_r, 2)),
        notes);
    }
    function render() {
      [...thead.querySelectorAll("th")].forEach((th, i) => {
        if (COLS[i].key === st.sort) th.setAttribute("aria-sort", st.dir > 0 ? "ascending" : "descending");
        else th.removeAttribute("aria-sort");
      });
      clear(tbody);
      const frag = document.createDocumentFragment();
      m.rows.slice().sort(compare(st.sort, st.dir)).forEach((r) => frag.appendChild(rowEl(r)));
      tbody.appendChild(frag);
    }
    if (o.pick) {
      tbody.addEventListener("click", (e) => {
        if (e.target.closest("a, button")) return;
        const trEl = e.target.closest("tr[data-k]");
        if (trEl && !window.getSelection().toString()) o.pick(m.rows[Number(trEl.dataset.k)]);
      });
    }
    render();
  }

  // ---------------------------------------------------------------- the charts
  /** For one axis: the lines of locations that differ only on it (the other axes alike; the
   *  italic font's locations on lines of their own). */
  function axisLines(m, rows, tag) {
    const groups = new Map();
    rows.forEach((r) => {
      if (!finite(r.location[tag])) return;
      const f = frameOf(m, r.italic);
      const key = (r.italic ? "i|" : "u|") + f.order.filter((t) => t !== tag).map((t) => `${t}=${Math.round(r.location[t] * 100)}`).join("|");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    });
    const lines = [];
    groups.forEach((pts) => {
      if (pts.length < 2) return;
      pts.sort((a, b) => a.location[tag] - b.location[tag]);
      const italic = pts[0].italic;
      const f = frameOf(m, italic);
      const other = {}, base = {};
      f.order.forEach((t) => { if (t !== tag) { other[t] = pts[0].location[t]; base[t] = f.main[t]; } });
      const at = SQA.sameLocation(other, base) ? "" : SQA.describeLocation(other, base, f.order);
      const through = !italic && !at;
      lines.push({ pts, main: through, italic, label: italic ? "in the italic" + (at ? ", at " + at : "") : through ? "through Regular (the main report)" : "at " + at });
    });
    return lines.sort((a, b) => (b.main - a.main) || (a.italic - b.italic) || (b.pts.length - a.pts.length));
  }

  /** The two axes whose plane through the default location holds most locations (at least 4, half the grid). */
  function planeOf(m, rows) {
    let best = null;
    for (let i = 0; i < m.order.length; i++) {
      for (let j = i + 1; j < m.order.length; j++) {
        const a = m.order[i], b = m.order[j];
        const pts = rows.filter((r) => !r.italic && m.order.every((t) => t === a || t === b || near(r.location[t], m.main[t])));
        const xa = [...new Set(pts.map((r) => +r.location[a].toFixed(3)))].sort((p, q) => p - q);
        const xb = [...new Set(pts.map((r) => +r.location[b].toFixed(3)))].sort((p, q) => p - q);
        if (pts.length < 4 || xa.length < 2 || xb.length < 2 || pts.length < 0.5 * xa.length * xb.length) continue;
        // columns: the axis with more values (wght first on a tie)
        const swap = xb.length > xa.length || (xb.length === xa.length && b === "wght");
        const cand = swap ? { ax: b, ay: a, xs: xb, ys: xa, pts } : { ax: a, ay: b, xs: xa, ys: xb, pts };
        if (!best || pts.length > best.pts.length) best = cand;
      }
    }
    return best;
  }

  /** One scale for every chart of a measure: the values' range, but no further
   *  than 5 robust σ from their median (a far corner is drawn at the edge, with an arrow). */
  function domainOf(rows, measure) {
    const vals = rows.map((r) => r[measure]).filter((v) => finite(v) && (measure !== "best_looseness" || !SQA.outOfRange(v))).sort((a, b) => a - b);
    if (!vals.length) return measure === "best_looseness" ? [-1, 1] : [0, 40];
    const med = SQA.quantile(vals, 0.5);
    const mad = SQA.quantile(vals.map((v) => Math.abs(v - med)).sort((a, b) => a - b), 0.5);
    const sig = Math.max(SQA.SIGMA * mad, measure === "best_looseness" ? 0.12 : 2);
    let lo = Math.max(vals[0], med - 5 * sig), hi = Math.min(vals[vals.length - 1], med + 5 * sig);
    if (measure === "best_looseness") { lo = Math.min(lo, -0.5); hi = Math.max(hi, 0.5); }
    const pad = Math.max((hi - lo) * 0.08, measure === "best_looseness" ? 0.05 : 1);
    lo -= pad; hi += pad;
    if (measure === "shape_error") lo = Math.max(0, lo);
    return [lo, hi];
  }

  function charts(ctx, sec, m, o, cur) {
    const rows = m.rows.filter(measurable);
    const head = h("h3", null, "Across the designspace");
    if (rows.length < 2) {
      if (m.rows.length > 1) sec.append(head, h("p", { class: "small" }, m.checked ? "Fewer than two locations could be measured: nothing to draw." : "The charts appear when every location is checked."));
      return;
    }
    // an axis drawn over the upright's range and the italic's, when that differs
    const span = (a) => {
      const ia = m.italic ? m.italic.axes.find((x) => x.tag === a.tag) : null;
      return ia ? Object.assign({}, a, { min: Math.min(a.min, ia.min), max: Math.max(a.max, ia.max) }) : a;
    };
    const perAxis = m.axes.map((a) => ({ a: span(a), lines: axisLines(m, rows, a.tag) }));
    const drawn = perAxis.filter((x) => x.lines.length && x.a.max - x.a.min > 1e-6);
    const notDrawn = perAxis.filter((x) => !x.lines.length || x.a.max - x.a.min <= 1e-6).map((x) => x.a.tag);
    const plane = planeOf(m, rows);
    if (!drawn.length && !plane) return;
    const st = { measure: "best_looseness" };
    const isCur = (r) => !SQA.sameLocation(cur, m.main) && SQA.sameLocation(r.location, cur);
    sec.append(head, h("p", { class: "section-intro" },
      "Each line joins locations that differ on one axis only: the line through Regular (the main report) in ink, the others in grey; every dot is a location, coloured by its level. Hover or focus a dot for its numbers; click it, or press Enter, to check that location."));
    const controls = h("div", { class: "controls" }, h("span", { class: "control-label" }, "Measure"),
      SQA.segmented("Measure drawn", Object.keys(MEASURES).map((k) => ({ label: MEASURES[k].label, value: k })), st.measure, (v) => { st.measure = v; redraw(); }));
    // the legend: line keys for lines, the marks as drawn (level colours always with their names)
    const key = (cls, label) => h("span", null, h("i", { class: "ds-key " + cls, "aria-hidden": "true" }), label);
    const italicDrawn = drawn.some((x) => x.lines.some((l) => l.italic));
    const legend = h("div", { class: "legend ds-legend" },
      key("line", "line through Regular (the main report)"), key("line other", "other lines along the axis"),
      italicDrawn ? key("line italic", "the italic (hollow dots)") : null,
      key("dot lvl-INFO", "INFO"), key("dot lvl-WARN", "WARN (!)"), key("dot lvl-FAIL", "FAIL (✕)"),
      key("ring", "Regular (the main report)"),
      SQA.sameLocation(cur, m.main) ? null : key("square", "shown on this page"));
    sec.append(controls, legend);
    const redraws = [];
    const redraw = () => redraws.forEach((f) => f());

    if (plane) {
      const stage = h("div", { class: "ds-map-wrap" });
      const sub = h("p", { class: "figure-sub" });
      const ramp = h("div", { class: "ramp ds-ramp" });
      const panel = h("div", { class: "panel ds-map-panel" },
        h("h4", { class: "figure-title" }, `${plane.ax} × ${plane.ay}`),
        sub, ramp, stage);
      sec.appendChild(panel);
      const chart = SQA.responsive(stage, (w) => planeChart(stage, ramp, w, plane, st.measure, m, o, isCur), ctx);
      const setSub = () => { sub.textContent = `${MEASURES[st.measure].label} at the ${SQA.plural(plane.pts.length, "location")} where only ${plane.ax} and ${plane.ay} differ from Regular (the main report).`; };
      setSub();
      redraws.push(() => { setSub(); chart.redraw(); });
      SQA.tableToggle(panel, [], () => [], {
        label: "Show as table", size: "medium",
        render(wrap) {
          const M = MEASURES[st.measure];
          const t = h("table", { class: "matrix" }, h("caption", { class: "sr-only" }, `${M.label}: rows ${plane.ay}, columns ${plane.ax}`));
          t.appendChild(h("thead", null, h("tr", null, h("th", { scope: "col" }, `${plane.ay} \\ ${plane.ax}`), plane.xs.map((x) => h("th", { scope: "col" }, SQA.axisNum(x))))));
          const tb = h("tbody");
          plane.ys.slice().reverse().forEach((y) => tb.appendChild(h("tr", null, h("th", { scope: "row" }, SQA.axisNum(y)), plane.xs.map((x) => {
            const r = plane.pts.find((p) => near(p.location[plane.ax], x) && near(p.location[plane.ay], y));
            return h("td", null, r ? M.fmt(r[st.measure]) : "");
          }))));
          t.appendChild(tb);
          wrap.appendChild(t);
        },
      });
    }

    const grid = h("div", { class: "ds-grid" });
    sec.appendChild(grid);
    drawn.forEach(({ a, lines }) => {
      const stage = h("div", { class: "stage" });
      const n = lines.reduce((k, l) => k + l.pts.length, 0);
      const panel = h("div", { class: "panel" },
        h("h4", { class: "figure-title" }, a.tag, h("span", { class: "muted", style: { fontWeight: 400 } }, ` ${SQA.axisNum(a.min)} to ${SQA.axisNum(a.max)}`)),
        h("p", { class: "figure-sub" }, `${SQA.plural(lines.length, "line")}, ${SQA.plural(n, "location")}`),
        stage);
      grid.appendChild(panel);
      const chart = SQA.responsive(stage, (w) => axisChart(stage, w, a, lines, st.measure, domainOf(rows, st.measure), m, o, isCur), ctx);
      redraws.push(() => chart.redraw());
      SQA.tableToggle(panel, [
        { label: "Location", get: (p) => p.r.name },
        { label: a.tag, num: true, get: (p) => SQA.axisNum(p.r.location[a.tag]) },
        { label: "Looseness", num: true, get: (p) => signed(p.r.best_looseness, 2) },
        { label: "Shape error", num: true, get: (p) => fmt(p.r.shape_error, 1) },
        { label: "Level", get: (p) => p.r.level || "–" },
        { label: "Line", get: (p) => p.ln.label },
      ], () => [].concat(...lines.map((ln) => ln.pts.map((r) => ({ r, ln })))), { caption: `Locations along ${a.tag}`, size: "medium" });
    });
    if (notDrawn.length) {
      sec.appendChild(h("p", { class: "small" }, `Not drawn: ${notDrawn.join(", ")} — no two measured locations differ only on ${notDrawn.length === 1 ? "it" : "each of them"}.`));
    }
  }

  /** Tick values along an axis: the locations' own values when their labels fit, else round values; the axis ends always. */
  function xTicks(A, values, width) {
    const span = A.max - A.min || 1;
    const X = (v) => ((v - A.min) / span) * width;
    const w = (v) => SQA.axisNum(v).length * 6.6 + 8;
    const fits = (list) => list.every((v, i) => i === 0 || X(v) - X(list[i - 1]) >= (w(v) + w(list[i - 1])) / 2);
    const xs = [...new Set(values.concat([A.min, A.max]).map((v) => +v.toFixed(3)))].sort((a, b) => a - b);
    if (xs.length <= 10 && fits(xs)) return xs;
    let ticks = SQA.niceTicks(A.min, A.max, Math.max(2, Math.floor(width / 70)));
    const ends = [A.min, A.max];
    ticks = ticks.filter((t) => ends.every((e) => near(t, e) || Math.abs(X(t) - X(e)) >= (w(t) + w(e)) / 2));
    ends.forEach((e) => { if (!ticks.some((t) => near(t, e))) ticks.push(e); });
    return ticks.sort((a, b) => a - b);
  }

  /** Points on a chart: hover (the nearest within 24 px, or `findAt`), touch (a
   *  tap shows it, a second tap checks it), click, and the keyboard. */
  function pointLayer(root, W, pts, content, o, onMove, findAt) {
    const nearest = (ev) => {
      const rr = root.getBoundingClientRect();
      const k = W / (rr.width || W);
      const x = (ev.clientX - rr.left) * k, y = (ev.clientY - rr.top) * k;
      if (findAt) return findAt(x, y);
      let best = -1, bd = (24 * k) ** 2;
      pts.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = i; } });
      return best;
    };
    let downType = "mouse", armed = -1;
    root.addEventListener("pointerdown", (ev) => {
      downType = ev.pointerType || "mouse";
      if (downType !== "touch") return;
      const i = nearest(ev);
      if (i < 0) { tip.hide(); onMove(-1); return; }
      onMove(i);
      tip.show(content(pts[i], true), ev.clientX, ev.clientY);
    });
    root.addEventListener("pointermove", (ev) => {
      if (ev.pointerType === "touch") return;
      const i = nearest(ev);
      root.style.cursor = i >= 0 && o.pick ? "pointer" : "";
      if (i < 0) { tip.hide(); onMove(-1); return; }
      onMove(i);
      tip.show(content(pts[i], false), ev.clientX, ev.clientY);
    });
    root.addEventListener("pointerleave", () => { tip.hide(); onMove(-1); });
    root.addEventListener("click", (ev) => {
      const i = nearest(ev);
      if (i < 0 || !o.pick) return;
      if (downType === "touch" && armed !== i) { armed = i; return; }
      armed = -1;
      tip.hide();
      o.pick(pts[i].r);
    });
    let at = -1;
    SQA.keyNav(root, pts.map((p) => ({ node: p.node, content: () => content(p, false), label: p.label })), {
      onMove(i) { at = i; onMove(i); },
    });
    root.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && at >= 0 && o.pick) { ev.preventDefault(); tip.hide(); o.pick(pts[at].r); }
    });
  }

  function tipFor(r, extraRows, line, isCurrent, touch, pick) {
    const rows = (extraRows || []).concat([
      ["Looseness", signed(r.best_looseness, 2)], ["Shape error", fmt(r.shape_error, 1)],
      ["Level", r.level || "–"], ["Closest", SQA.PRESET_LABEL[r.closest] || "–"]]);
    const note = [
      line, r.main ? "Regular: the main report's location." : null,
      r.reasons.length ? r.reasons[0].message : r.notes[0] || null,
      isCurrent ? "Shown on this page." : pick ? (touch ? "Tap again to check this location." : "Click, or press Enter, to check this location.") : null,
    ].filter(Boolean).join(" ");
    return { title: r.label, rows, note };
  }

  function axisChart(container, W, A, lines, measure, dom, m, o, isCur) {
    clear(container);
    const M = MEASURES[measure];
    const H = 206, mg = { l: 44, r: 16, t: 28, b: 34 };
    const x0 = mg.l, x1 = W - mg.r, yB = H - mg.b, yT = mg.t;
    const span = A.max - A.min || 1;
    const X = (v) => x0 + ((v - A.min) / span) * (x1 - x0);
    const Y = (v) => yB - ((Math.max(dom[0], Math.min(dom[1], v)) - dom[0]) / (dom[1] - dom[0])) * (yB - yT);
    const n = lines.reduce((k, l) => k + l.pts.length, 0);
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "chart ds-chart", role: "img",
      "aria-label": `${M.label} along ${A.tag}: ${lines.length} ${lines.length === 1 ? "line" : "lines"} through ${n} locations. Use the arrow keys to read each location${o.pick ? "; Enter checks it" : ""}.` });
    const grid = s("g", { class: "grid" });
    root.appendChild(grid);
    SQA.niceTicks(dom[0], dom[1], 4).forEach((t) => {
      grid.appendChild(s("line", { x1: x0, x2: x1, y1: Y(t), y2: Y(t) }));
      root.appendChild(s("text", { x: x0 - 6, y: Y(t) + 4, "text-anchor": "end", class: "tick" }, M.tick(t)));
    });
    root.appendChild(s("line", { x1: x0, x2: x1, y1: yB, y2: yB, class: "axis" }));
    const values = [].concat(...lines.map((l) => l.pts.map((r) => r.location[A.tag])));
    xTicks(A, values, x1 - x0).forEach((t) => {
      const x = X(t);
      root.appendChild(s("line", { x1: x, x2: x, y1: yB, y2: yB + 4, class: "axis" }));
      root.appendChild(s("text", { x, y: yB + 17, "text-anchor": "middle", class: "tick" }, SQA.axisNum(t)));
    });
    // the default location's value on this axis
    const dx = X(m.main[A.tag]);
    root.appendChild(s("line", { x1: dx, x2: dx, y1: yT - 10, y2: yB, class: "ds-default" }));
    root.appendChild(s("text", { x: dx, y: yT - 14, "text-anchor": dx < x0 + 24 ? "start" : dx > x1 - 24 ? "end" : "middle", class: "muted-label halo" }, "main"));
    // lines: the others first, the default location's on top
    lines.slice().reverse().forEach((ln) => {
      const d = ln.pts.map((r, i) => `${i ? "L" : "M"}${X(r.location[A.tag]).toFixed(1)},${Y(r[measure]).toFixed(1)}`).join("");
      root.appendChild(s("path", { d, class: "ds-line" + (ln.main ? "" : " other") + (ln.italic ? " italic" : "") }));
    });
    const pts = [];
    const marks = s("g");
    lines.slice().reverse().forEach((ln) => ln.pts.forEach((r) => {
      const x = X(r.location[A.tag]), y = Y(r[measure]), v = r[measure];
      const node = s("circle", { cx: x, cy: y, r: ln.main ? 4.5 : 4, class: `ds-pt lvl-${r.level || "NONE"}` + (r.italic ? " italic" : "") });
      marks.appendChild(node);
      if (r.main) marks.appendChild(s("circle", { cx: x, cy: y, r: 8.5, class: "ds-main-ring" }));
      if (isCur(r)) marks.appendChild(s("rect", { x: x - 9, y: y - 9, width: 18, height: 18, class: "ds-current-ring" }));
      if (r.level === "WARN" || r.level === "FAIL") marks.appendChild(s("text", { x, y: y - 10, "text-anchor": "middle", class: "label-strong halo", style: "font-size:11px" }, r.level === "FAIL" ? "✕" : "!"));
      if (v < dom[0] || v > dom[1]) marks.appendChild(s("text", { x: x + 8, y: y + 4, class: "label-strong halo", style: "font-size:11px" }, v < dom[0] ? "↓" : "↑"));
      pts.push({ r, ln, x, y, node, label: `${r.label}: ${A.tag} ${SQA.axisNum(r.location[A.tag])}, ${M.label} ${M.fmt(v)}, ${r.level || "not checked"}, ${ln.label}` });
    }));
    root.appendChild(marks);
    // reading order: the default location's line first, each line along the axis
    pts.sort((p, q) => (q.ln.main - p.ln.main) || lines.indexOf(p.ln) - lines.indexOf(q.ln) || p.x - q.x);
    const hov = s("circle", { r: 11, class: "sel", cx: -40, cy: -40 });
    root.appendChild(hov);
    const onMove = (i) => {
      if (i < 0) { hov.setAttribute("cx", -40); return; }
      hov.setAttribute("cx", pts[i].x); hov.setAttribute("cy", pts[i].y);
    };
    const content = (p, touch) => {
      const v = p.r[measure];
      const extra = [[A.tag, SQA.axisNum(p.r.location[A.tag])]];
      const t = tipFor(p.r, extra, p.ln.main ? "On the line through Regular (the main report)." : `On the line ${p.ln.label}.`, isCur(p.r), touch, !!o.pick);
      if (v < dom[0] || v > dom[1]) t.note = "Beyond the drawn scale. " + t.note;
      return t;
    };
    pointLayer(root, W, pts, content, o, onMove);
    container.appendChild(root);
  }

  const SEQ = 8;
  function planeChart(container, rampEl, W, P, measure, m, o, isCur) {
    clear(container);
    const M = MEASURES[measure];
    const vals = P.pts.map((r) => r[measure]).filter((v) => finite(v) && (measure !== "best_looseness" || !SQA.outOfRange(v)));
    let R = 1, lo = 0, hi = 1;
    if (measure === "best_looseness") R = Math.max(0.25, Math.ceil(Math.max(...vals.map(Math.abs), 0.01) * 4) / 4);
    else { lo = Math.floor(Math.min(...vals)); hi = Math.ceil(Math.max(...vals)); if (hi - lo < 1) hi = lo + 1; }
    const cls = (v) => {
      if (!finite(v)) return "hm-na";
      if (measure === "best_looseness") {
        const step = Math.min(8, Math.round((Math.min(Math.abs(v), R) / R) * 8));
        return step === 0 ? "hm-0" : (v < 0 ? "hm-n" : "hm-p") + step;
      }
      return "sq-" + Math.max(1, Math.min(SEQ, Math.ceil(((v - lo) / (hi - lo)) * SEQ)));
    };
    // the ramp
    clear(rampEl);
    const steps = h("span", { class: "steps", "aria-hidden": "true" });
    const cell = (c) => s("svg", { width: 14, height: 12 }, s("rect", { width: 14, height: 12, class: c }));
    if (measure === "best_looseness") {
      for (let i = 8; i >= 1; i--) steps.appendChild(cell("hm-n" + i));
      steps.appendChild(cell("hm-0"));
      for (let i = 1; i <= 8; i++) steps.appendChild(cell("hm-p" + i));
      rampEl.append(h("span", null, `${signed(-R, 2)} tighter`), steps, h("span", null, `looser ${signed(R, 2)}`), h("span", { class: "muted" }, "best-fit Looseness"));
    } else {
      for (let i = 1; i <= SEQ; i++) steps.appendChild(cell("sq-" + i));
      rampEl.append(h("span", null, `${fmt(lo, 0)} more even`), steps, h("span", null, `less even ${fmt(hi, 0)}`), h("span", { class: "muted" }, "shape error, units per 1000 em"));
    }
    // the row labels' column fits "wdth \ wght" and the row values
    const corner = `${P.ay} \\ ${P.ax}`;
    const labW = Math.max(48, Math.ceil(Math.max(corner.length, ...P.ys.map((y) => SQA.axisNum(y).length)) * 6.4) + 14), top = 22;
    const nx = P.xs.length, ny = P.ys.length;
    const cw = Math.max(22, Math.min(76, Math.floor((W - labW - 4) / nx)));
    const ch = 34;
    const Wd = labW + nx * cw + 4, Hd = top + ny * ch + 4;
    const root = s("svg", { viewBox: `0 0 ${Wd} ${Hd}`, width: Wd, height: Hd, class: "chart ds-map", role: "img",
      "aria-label": `${M.label} across ${P.ax} and ${P.ay}: ${P.pts.length} locations. Use the arrow keys to read each location${o.pick ? "; Enter checks it" : ""}.` });
    P.xs.forEach((x, i) => root.appendChild(s("text", { x: labW + i * cw + cw / 2, y: top - 8, "text-anchor": "middle", class: "tick" }, SQA.axisNum(x))));
    root.appendChild(s("text", { x: labW - 8, y: top - 8, "text-anchor": "end", class: "muted-label" }, corner));
    const rowsTop = P.ys.slice().reverse(); // the largest value on top
    rowsTop.forEach((y, j) => root.appendChild(s("text", { x: labW - 8, y: top + j * ch + ch / 2 + 4, "text-anchor": "end", class: "tick" }, SQA.axisNum(y))));
    const pts = [];
    rowsTop.forEach((y, j) => P.xs.forEach((x, i) => {
      const r = P.pts.find((p) => near(p.location[P.ax], x) && near(p.location[P.ay], y));
      const cx = labW + i * cw, cy = top + j * ch;
      if (!r) {
        root.appendChild(s("rect", { x: cx + 1, y: cy + 1, width: cw - 2, height: ch - 2, class: "ds-empty" }));
        return;
      }
      const v = r[measure];
      const c = cls(v);
      const node = s("rect", { x: cx + 1, y: cy + 1, width: cw - 2, height: ch - 2, class: c });
      root.appendChild(node);
      if (cw >= 40) root.appendChild(s("text", { x: cx + cw / 2, y: cy + ch / 2 + 4, "text-anchor": "middle", class: "ds-cell-text" }, measure === "best_looseness" ? signed(v, 2) : fmt(v, 1)));
      if (r.main) root.appendChild(s("rect", { x: cx + 2.5, y: cy + 2.5, width: cw - 5, height: ch - 5, class: "ds-main-ring" }));
      if (isCur(r)) root.appendChild(s("rect", { x: cx + 0.5, y: cy + 0.5, width: cw - 1, height: ch - 1, class: "ds-current-ring" }));
      if (r.level === "WARN" || r.level === "FAIL") root.appendChild(s("text", { x: cx + cw - 5, y: cy + 12, "text-anchor": "end", class: "ds-cell-text", style: "font-size:10px;font-weight:700" }, r.level === "FAIL" ? "✕" : "!"));
      pts.push({ r, x: cx + cw / 2, y: cy + ch / 2, node, label: `${r.label}: ${P.ax} ${SQA.axisNum(x)}, ${P.ay} ${SQA.axisNum(y)}, ${M.label} ${M.fmt(v)}, ${r.level || "not checked"}` });
    }));
    const hov = s("rect", { class: "sel", x: -60, y: -60, width: cw, height: ch });
    root.appendChild(hov);
    const onMove = (i) => {
      if (i < 0) { hov.setAttribute("x", -60); return; }
      hov.setAttribute("x", pts[i].x - cw / 2); hov.setAttribute("y", pts[i].y - ch / 2);
    };
    const content = (p, touch) => tipFor(p.r, [[P.ax, SQA.axisNum(p.r.location[P.ax])], [P.ay, SQA.axisNum(p.r.location[P.ay])]], null, isCur(p.r), touch, !!o.pick);
    // the cell under the pointer
    const findAt = (x, y) => pts.findIndex((p) => Math.abs(p.x - x) <= cw / 2 && Math.abs(p.y - y) <= ch / 2);
    pointLayer(root, Wd, pts, content, o, onMove, findAt);
    container.appendChild(root);
  }

  SQA.designspace = { model, section, fill, sameParts, locate, describe, nameOf };
})();
