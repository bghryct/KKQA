/*
 * Spacing QA — "Where it differs": whether a font is even throughout,
 * consistent but for a few groups of glyphs, or uneven throughout, and which
 * glyph sides and which kerning stand out.
 *
 * What stands out is measured against what the library's fonts of the same
 * kind usually do (their median departure from the model, side by side and
 * pair by pair), so the model's own conventions — quotes set looser than the
 * model would, f and r tighter — are taken out; without a baseline, against
 * the model alone.
 *
 * - Sides: a side stands out when it is 25 units per 1000 em or more and 3
 *   robust σ from the font's typical side (both measured the same way).
 * - Kerning: a pair stands out when what is its own — its departure less the
 *   typical departure of its left glyph's pairs and of its right glyph's
 *   pairs — is 30 units and 4 robust σ or more; a glyph with three such pairs
 *   of one direction makes a group (T before round lowercase, say).
 *
 * Calibrated on the library (1,767 checked families, baseline 2026-10-09):
 * the median family has 7 sides that stand out of 176; a family whose sides
 * spread more than 16 (robust σ) differs everywhere (a third of the library,
 * mostly display and handwriting faces).
 *
 * Units: every number in units per 1000 em.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, s, clear, fmt, signed, int, tip } = SQA;

  const OUT_MIN = 25, OUT_SIGMA = 3, STRONG_MIN = 50, STRONG_SIGMA = 5, UNEVEN_SHARE = 0.2;
  /**
   * How widely the scored sides of the library's fonts spread around their own font's typical side
   * (σ, units per 1000 em), per norm group and comparison: [10th, 50th, 90th percentile]. Measured with
   * this file's analysis on the 1,767 checked families of baseline 2026-10-09-2340-1163 (October 2026);
   * "" is every group together. A font beyond the 90th percentile of its group is uneven throughout:
   * the groups differ too much for one threshold (a handwriting face spreads twice as wide as a sans).
   */
  const SPREAD = {
    library: { SANS_SERIF: [7.0, 9.2, 16.9], SERIF: [7.4, 11.4, 19.2], DISPLAY: [8.4, 13.8, 27.6], HANDWRITING: [13.0, 21.3, 53.0], CONNECTED: [17.7, 43.2, 100.7], "": [7.6, 12.4, 34.0] },
    model: { SANS_SERIF: [7.4, 9.6, 17.2], SERIF: [9.3, 12.6, 19.3], DISPLAY: [8.6, 13.9, 29.0], HANDWRITING: [14.2, 22.9, 54.0], CONNECTED: [23.3, 46.9, 114.2], "": [8.4, 13.1, 34.0] },
  };
  /** The spread of a group's fonts ({q: [p10, p50, p90], pooled}), for a comparison ("library" or "model"). */
  function spreadOf(against, key) {
    const t = SPREAD[against] || SPREAD.model;
    return t[key] ? { q: t[key], pooled: false } : { q: t[""], pooled: true };
  }
  const KERN_MIN = 30, KERN_SIGMA = 4, KERN_GROUP = 3;
  const PUNCT = [
    { key: "quotes", label: "Quotes and apostrophes", one: "quote", chars: "'\"‘’“”‚„‹›«»`" },
    { key: "brackets", label: "Brackets and parentheses", one: "bracket", chars: "()[]{}" },
    { key: "dashes", label: "Hyphens and dashes", one: "dash", chars: "-‐‑–—_" },
    { key: "marks", label: "Sentence punctuation", one: "mark", chars: ".,:;!?…¡¿·" },
    { key: "slashes", label: "Slashes and bars", one: "slash or bar", chars: "/\\|¦" },
  ];
  const KINDS = { upper: { key: "upper", label: "Capitals", one: "capital" }, lower: { key: "lower", label: "Lowercase", one: "lowercase letter" }, symbols: { key: "symbols", label: "Symbols", one: "symbol" } };
  const KIND_ORDER = ["upper", "lower", "quotes", "brackets", "dashes", "marks", "slashes", "symbols"];
  // paired punctuation: the inner side of an opening mark is its right side
  const OPENING = "([{‘“‚„‹«", CLOSING = ")]}’”›»";

  function kindOf(g) {
    const grp = SQA.groupOf(g);
    if (grp === "upper" || grp === "lower") return KINDS[grp];
    for (const p of PUNCT) if (p.chars.includes(g.char)) return p;
    return KINDS.symbols;
  }
  const medianOf = (v) => SQA.median(v);
  function spread(values, c) {
    return Math.max(2, SQA.SIGMA * medianOf(values.map((v) => Math.abs(v - c))));
  }
  /** Heat-map colour class of a value on a scale of ±R (the heat map's). */
  function heat(v, R) {
    if (v === null || v === undefined || !Number.isFinite(v)) return "hm-na";
    const step = Math.min(8, Math.round((Math.abs(v) / R) * 8));
    return step === 0 ? "hm-0" : (v < 0 ? "hm-n" : "hm-p") + step;
  }
  /** "T", or "— (emdash)" where the character alone is ambiguous. */
  function named(g) {
    return /^[A-Za-z0-9]$/.test(g.char) ? g.char : `${g.char} (${g.name})`;
  }
  function charList(face, idxs) {
    return idxs.map((i) => face.glyphs[i].char).join(" ");
  }
  /** "lowercase a c d e; punctuation . ," — glyphs by kind, in the font's order. */
  function describeGlyphs(face, idxs) {
    const by = new Map();
    idxs.slice().sort((x, y) => x - y).forEach((i) => {
      const k = kindOf(face.glyphs[i]);
      if (!by.has(k.key)) by.set(k.key, { label: k.label, chars: [] });
      by.get(k.key).chars.push(face.glyphs[i].char);
    });
    return KIND_ORDER.filter((k) => by.has(k)).map((k) => `${by.get(k).label.toLowerCase()} ${by.get(k).chars.join(" ")}`).join("; ");
  }
  function onWhere(gr, n) {
    if (gr.where === "both sides") return "on both sides";
    if (gr.where === "sides") return `on the sides named (${gr.detail})`;
    return `on ${n === 1 ? "its" : "their"} ${gr.where}`;
  }
  function range(values) {
    const a = values.map(Math.abs);
    const lo = Math.min(...a), hi = Math.max(...a);
    return Math.round(lo) === Math.round(hi) ? fmt(hi, 0) : `${fmt(lo, 0)}–${fmt(hi, 0)}`;
  }

  // ------------------------------------------------------------------ sides
  /** The scored sides, each with its departure from the model and (with norms) from what the category usually does. */
  function sideList(face, N, wide, against) {
    const out = [];
    let unnormed = 0;
    face.glyphs.forEach((g, i) => {
      if (!g.scored || !Array.isArray(g.dev)) return;
      ["left", "right"].forEach((side, k) => {
        const v = g.dev[k];
        if (!Number.isFinite(v)) return;
        if (against === "library") {
          const L = !wide[i] ? N.sides[`${g.name} ${side}`] : null;
          if (!L || !L.n) { unnormed++; return; }
          out.push({ i, g, side, k, v, lib: L.median, rel: v - L.median });
        } else out.push({ i, g, side, k, v, lib: null, rel: v });
      });
    });
    return { list: out, unnormed };
  }
  function analyseSides(list, group) {
    group = group || spreadOf("model", "");
    const vals = list.map((e) => e.rel);
    const c = medianOf(vals);
    const sigma = spread(vals, c);
    const tau = Math.max(OUT_MIN, OUT_SIGMA * sigma), strong = Math.max(STRONG_MIN, STRONG_SIGMA * sigma);
    list.forEach((e) => { e.d = e.rel - c; e.out = Math.abs(e.d) >= tau; e.strong = Math.abs(e.d) >= strong; });
    const outs = list.filter((e) => e.out);
    const wide = sigma > group.q[2], many = outs.length / Math.max(1, list.length) > UNEVEN_SHARE;
    const pattern = wide || many ? "uneven" : outs.length ? "outliers" : "even";
    return { c, sigma, tau, strong, outs, pattern, wide, spread: group, R: Math.max(40, Math.ceil(strong / 10) * 10) };
  }
  /**
   * Sides that stand out, by kind of glyph and direction; paired punctuation
   * says inner or outer sides. A glyph whose sides depart in opposite
   * directions, both at least half the threshold and one beyond it, is not
   * set looser or tighter but sits off-centre in its advance: "shifted".
   */
  function sideGroups(face, outs, scoredByKind, bySide, A) {
    const map = new Map();
    const add = (key, make, e) => { if (!map.has(key)) map.set(key, make()); map.get(key).items.push(e); };
    const shifted = new Set();
    outs.forEach((e) => {
      if (shifted.has(e.i)) return;
      const l = bySide.get(e.i + ":left"), r = bySide.get(e.i + ":right");
      if (l && r && Math.sign(l.d) !== Math.sign(r.d) && Math.abs(l.d) >= A.tau / 2 && Math.abs(r.d) >= A.tau / 2) shifted.add(e.i);
    });
    outs.forEach((e) => {
      const kd = kindOf(e.g);
      if (shifted.has(e.i)) return;
      const dir = e.d > 0 ? "looser" : "tighter";
      add(kd.key + ":" + dir, () => ({ kind: kd, dir, items: [] }), e);
    });
    shifted.forEach((i) => {
      const l = bySide.get(i + ":left"), r = bySide.get(i + ":right");
      const kd = kindOf(face.glyphs[i]);
      // left side tighter, right side looser: the ink sits further left than the model puts it
      const dir = l.d < 0 ? "shifted left" : "shifted right";
      add(kd.key + ":" + dir, () => ({ kind: kd, dir, items: [], shift: true }), l);
      map.get(kd.key + ":" + dir).items.push(r);
    });
    const groups = [...map.values()];
    groups.forEach((gr) => {
      gr.items.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
      gr.glyphs = [...new Set(gr.items.map((e) => e.i))].sort((x, y) => x - y);
      gr.weight = gr.items.reduce((t, e) => t + Math.abs(e.d), 0);
      gr.strong = gr.items.some((e) => e.strong);
      gr.total = scoredByKind.get(gr.kind.key) || gr.glyphs.length;
      if (gr.shift) {
        // how far the ink sits off: half the difference of the two sides
        gr.offsets = gr.glyphs.map((i) => (bySide.get(i + ":right").d - bySide.get(i + ":left").d) / 2);
        gr.where = "";
        gr.detail = "";
        return;
      }
      const inner = (e) => (OPENING.includes(e.g.char) ? e.side === "right" : CLOSING.includes(e.g.char) ? e.side === "left" : null);
      const flags = gr.items.map(inner);
      if ((gr.kind.key === "brackets" || gr.kind.key === "quotes") && flags.every((f) => f === true)) gr.where = "inner sides";
      else if ((gr.kind.key === "brackets" || gr.kind.key === "quotes") && flags.every((f) => f === false)) gr.where = "outer sides";
      else {
        const both = gr.glyphs.every((i) => gr.items.filter((e) => e.i === i).length === 2);
        const sides = new Set(gr.items.map((e) => e.side));
        const one = gr.glyphs.length === 1;
        gr.where = both ? "both sides" : sides.size === 2 ? "sides" : sides.has("left") ? (one ? "left side" : "left sides") : (one ? "right side" : "right sides");
      }
      if ((gr.where === "inner sides" || gr.where === "outer sides") && gr.glyphs.length === 1) gr.where = gr.where.replace("sides", "side");
      // which side of which glyph, when they are not all alike
      gr.detail = gr.where === "sides" ? gr.glyphs.map((i) => { const ss = gr.items.filter((e) => e.i === i); return `${face.glyphs[i].char} ${ss.length === 2 ? "both sides" : ss[0].side}`; }).join(", ") : "";
    });
    return groups.sort((a, b) => b.weight - a.weight);
  }

  // ---------------------------------------------------------------- kerning
  /** The scored pairs, each with its departure from the model and (with norms) from what the category usually does for it. */
  function pairList(all, face, N, lib, wide, against) {
    if (against !== "library") return all.map((e) => Object.assign({}, e, { rel: e.res }));
    const norms = N.pairs;
    if (!lib || !Array.isArray(lib.pair_names) || !Array.isArray(norms) || norms.length !== lib.pair_names.length ** 2) return [];
    const M = lib.pair_names.length;
    const pos = new Map(lib.pair_names.map((n, k) => [n, k]));
    const out = [];
    all.forEach((e) => {
      const pa = pos.get(face.glyphs[e.a].name), pb = pos.get(face.glyphs[e.b].name);
      if (pa === undefined || pb === undefined || wide[e.a] || wide[e.b]) return;
      const L = norms[pa * M + pb];
      if (!L || L.length !== 2 || !Number.isFinite(L[0])) return;
      out.push(Object.assign({}, e, { lib: L[0], rel: e.res - L[0] }));
    });
    return out;
  }
  /**
   * Each pair's own departure: its departure less the typical departure of
   * its left glyph's pairs and of its right glyph's pairs (medians), so what
   * a glyph's sidebearing does to all its pairs is taken out and what is left
   * is the pair's kerning. Groups: a glyph with KERN_GROUP or more pairs of
   * one direction that stand out; each pair goes to its largest group.
   */
  function analyseKerning(P) {
    if (P.length < 100) return null;
    const all = medianOf(P.map((e) => e.rel));
    const rows = new Map(), cols = new Map();
    P.forEach((e) => {
      if (!rows.has(e.a)) rows.set(e.a, []);
      if (!cols.has(e.b)) cols.set(e.b, []);
      rows.get(e.a).push(e.rel); cols.get(e.b).push(e.rel);
    });
    const rowFx = new Map([...rows].map(([k, v]) => [k, medianOf(v) - all]));
    const colFx = new Map([...cols].map(([k, v]) => [k, medianOf(v) - all]));
    P.forEach((e) => { e.own = e.rel - all - rowFx.get(e.a) - colFx.get(e.b); });
    const c = medianOf(P.map((e) => e.own));
    const sigma = spread(P.map((e) => e.own), c);
    const tau = Math.max(KERN_MIN, KERN_SIGMA * sigma);
    const outs = P.filter((e) => Math.abs(e.own - c) >= tau);
    outs.forEach((e) => { e.d = e.own - c; });
    const cands = [];
    const collect = (keyOf, role) => {
      const by = new Map();
      outs.forEach((e) => {
        const key = keyOf(e) + (e.d > 0 ? "+" : "-");
        if (!by.has(key)) by.set(key, { glyph: keyOf(e), role, dir: e.d > 0 ? "looser" : "tighter", pairs: [] });
        by.get(key).pairs.push(e);
      });
      by.forEach((gr) => { if (gr.pairs.length >= KERN_GROUP) cands.push(gr); });
    };
    collect((e) => e.a, "left");
    collect((e) => e.b, "right");
    cands.sort((x, y) => y.pairs.length - x.pairs.length || y.pairs.reduce((t, e) => t + Math.abs(e.d), 0) - x.pairs.reduce((t, e) => t + Math.abs(e.d), 0));
    const taken = new Set();
    const groups = [];
    cands.forEach((gr) => {
      const mine = gr.pairs.filter((e) => !taken.has(e));
      if (mine.length < KERN_GROUP) return;
      mine.forEach((e) => taken.add(e));
      mine.sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
      groups.push(Object.assign(gr, { pairs: mine, median: medianOf(mine.map((e) => e.d)) }));
    });
    const singles = outs.filter((e) => !taken.has(e)).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
    return { all, c, sigma, tau, outs, groups, singles, n: P.length };
  }

  // ---------------------------------------------------------------- drawing
  /**
   * A glyph between two bands, its left and right side, each coloured by how
   * far that side departs (the heat map's colours), ringed when it stands
   * out. e: {i, l, r (side entries or null)}.
   */
  function tile(face, e, A, o) {
    const g = face.glyphs[e.i];
    const H = o.h, band = o.band, pad = Math.round(H * 0.08);
    const k = (H - 2 * pad) / (face.top - face.bottom);
    const inkW = face.ink(e.i) * k;
    const W = Math.max(o.minW, Math.ceil(inkW + 2 * band + 14));
    const val = (x) => (x ? x.d : null);
    const label = `${g.char} (${g.name}): left side ${e.l ? signed(e.l.d, 0) : "not compared"}, right side ${e.r ? signed(e.r.d, 0) : "not compared"}` +
      ((e.l && e.l.out) || (e.r && e.r.out) ? ", stands out" : "");
    const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: "chart glyph-tile", role: "img", "aria-label": label });
    svg.appendChild(s("rect", { x: 0.5, y: 0.5, width: W - 1, height: H - 1, class: "tile-bg" }));
    [[e.l, 2], [e.r, W - band - 2]].forEach(([x, bx]) => {
      svg.appendChild(s("rect", { x: bx, y: 2, width: band, height: H - 4, class: heat(val(x), A.R) }));
      if (x && x.out) svg.appendChild(s("rect", { x: bx - 1, y: 1, width: band + 2, height: H - 2, class: "flag-ring", style: x.strong ? "stroke:var(--critical);stroke-width:2" : "stroke-width:2" }));
    });
    svg.appendChild(face.use(e.i, -g.bbox[0], k, (W - inkW) / 2, pad + face.top * k, "glyph-fill"));
    const content = () => {
      const rows = [];
      [["Left side", e.l], ["Right side", e.r]].forEach(([name, x]) => {
        if (!x) { rows.push([name, "not compared"]); return; }
        rows.push([name, `${signed(x.d, 0)}${x.out ? (x.strong ? " · stands far out" : " · stands out") : ""}`]);
      });
      const note = A.against === "library"
        ? "Each side against what the category's fonts usually do for it, less this font's typical side. Positive: looser."
        : "Each side against the model, less this font's typical side. Positive: looser.";
      return { title: `${g.char} — ${g.name}`, rows, note };
    };
    svg.addEventListener("pointermove", (ev) => tip.show(content(), ev.clientX, ev.clientY));
    svg.addEventListener("pointerleave", () => tip.hide());
    return svg;
  }
  function ramp(R, against, catName) {
    const box = h("div", { class: "ramp" });
    const cell = (c) => s("svg", { width: 14, height: 12 }, s("rect", { width: 14, height: 12, class: c }));
    const steps = h("span", { class: "steps", "aria-hidden": "true" });
    for (let i = 8; i >= 1; i--) steps.appendChild(cell("hm-n" + i));
    steps.appendChild(cell("hm-0"));
    for (let i = 1; i <= 8; i++) steps.appendChild(cell("hm-p" + i));
    box.append(h("span", { class: "scale" }, h("span", null, `${signed(-R, 0)} tighter`), steps, h("span", null, `looser ${signed(R, 0)}`)),
      h("span", { class: "muted" }, against === "library" ? `than ${catName} usually set that side, beyond this font's typical side` : "than the model, beyond this font's typical side"),
      h("span", { class: "legend-ring" }, h("i", { class: "swatch ring", "aria-hidden": "true" }), "stands out (red: far out)"));
    return box;
  }

  // ------------------------------------------------------------------ section
  function render(ctx, root, r, face, o) {
    if (!r.summary || !face) return;
    const parts = SQA.reportParts || {};
    const lib = o.library;
    const N = parts.normsFor ? parts.normsFor(r, lib) : null;
    const wide = parts.fullWidth ? parts.fullWidth(face, N ? N.t : null) : face.glyphs.map(() => false);
    const catName = N ? N.name.replace(/^the whole library$/, "the library's fonts") : "";
    // measured along a slant: the norms come from fonts measured upright, so the model alone comes first
    const slanted = parts.slanted ? parts.slanted(r) : false;
    const sec = h("section", { "aria-labelledby": "differs-h" });
    sec.appendChild(h("h2", { id: "differs-h", tabindex: "-1" }, "Where it differs"));
    sec.appendChild(h("p", { class: "section-intro" },
      "Is the font off everywhere, or mostly fine with a few glyphs that are not? This section looks at every scored glyph side and every scored pair and finds what stands out from the rest of the font. ",
      N ? `It compares each side and each pair with what ${catName} usually do there — their median departure from the model — so the model's own habits (quotes and parentheses it sets tighter than designers do, the open sides of f, r and T) are taken out, and what remains is particular to this font. ` : "No library baseline is loaded, so it compares with the model alone. ",
      N && slanted ? `This font is measured along its slant, so the comparison starts with the model alone: the norms of ${catName} come from fonts measured upright, and the shear moves the sides of what sits far from half the x-height (quotes, capitals, descenders), so what they usually do is only a rough guide here. ` : "",
      "A side stands out when it is at least 25 units per 1000 em from this font's typical side and three times as far as the font's sides usually are, and stands far out at 50 units and five times; a pair stands out when its own kerning departs by at least 30 units and four times the usual. A font whose sides spread more widely than 9 in 10 fonts of its kind is uneven throughout."));
    root.appendChild(sec);
    const st = { against: N && !slanted ? "library" : "model" };
    if (N) {
      sec.appendChild(h("div", { class: "controls" }, SQA.segmented("Compared with", [
        { label: `What ${catName} usually do`, value: "library" },
        { label: "The model alone", value: "model" },
      ], st.against, (v) => { st.against = v; draw(); })));
    }
    const body = h("div", { class: "differs" });
    sec.appendChild(body);
    const scoredByKind = new Map();
    face.glyphs.forEach((g) => { if (g.scored) { const k = kindOf(g).key; scoredByKind.set(k, (scoredByKind.get(k) || 0) + 1); } });
    const allPairs = SQA.explain && SQA.explain.pairsOf ? SQA.explain.pairsOf(r, face) : [];
    const resOf = new Map(allPairs.map((e) => [e.a * face.n + e.b, e.res]));

    function draw() {
      clear(body);
      const against = st.against;
      const S = sideList(face, N, wide, against);
      if (S.list.length < 20) { body.appendChild(h("p", { class: "note" }, "Too few glyph sides could be compared to say where the font differs.")); return; }
      const A = analyseSides(S.list, spreadOf(against, N ? N.key : ""));
      A.against = against;
      // the numbers behind the verdict, for tests and calibration
      Object.assign(body.dataset, { against, key: N ? N.key : "", sigma: A.sigma.toFixed(2), sides: String(S.list.length), outs: String(A.outs.length) });
      const bySide = new Map(S.list.map((e) => [e.i + ":" + e.side, e]));
      const groups = sideGroups(face, A.outs, scoredByKind, bySide, A);
      const K = analyseKerning(pairList(allPairs, face, N, lib, wide, against));
      body.appendChild(summary(face, S, A, groups, K, against, catName, r.summary.kerned_pairs));
      glyphMap(face, A, bySide, catName, body);
      sideCards(face, A, groups, bySide, resOf, catName, body);
      if (K) kerningCards(face, K, catName, against, body);
      tables(face, S, A, K, body);
    }
    draw();
  }

  /** The diagnosis in words. */
  function summary(face, S, A, groups, K, against, catName, kerned) {
    const n = S.list.length, k = A.outs.length;
    const within = n - k;
    const vs = against === "library" ? `Against what ${catName} usually do` : "Against the model";
    // the spread of this font's group, for scale
    const group = A.spread.pooled ? "fonts" : catName;
    const [q10, , q90] = A.spread.q;
    const scale = `a typical side is ${fmt(A.sigma, 0)} units per 1000 em from it, where 8 in 10 ${group} are at ${fmt(q10, 0)} to ${fmt(q90, 0)}`;
    const box = h("div", { class: "panel diagnosis" });
    const head = A.pattern === "even" ? "No glyph side stands out from the rest of the font"
      : A.pattern === "outliers" ? `Mostly consistent, with ${groups.length === 1 ? "one group" : `${groups.length} groups`} of glyphs that stand out`
        : "Uneven throughout: the differences are spread over the whole font";
    box.appendChild(h("p", { class: "diagnosis-head" }, head));
    const p1 = A.pattern === "uneven"
      ? (A.wide
        ? `${vs}, this font's glyph sides spread more widely around its typical side than 9 in 10 ${group}: ${scale}. So the spacing departs in many places rather than in a few glyphs — often a deliberate, lively rhythm (display and handwriting faces), sometimes sidebearings that were never made consistent.`
        : `${vs}, ${int(k)} of the ${int(n)} scored glyph sides (${fmt((100 * k) / n, 0)} %) stand out from this font's typical side — too many to be a few glyphs that differ.`) +
        (k ? (k === 1 ? " The side furthest out is grouped below." : ` The ${int(k)} sides furthest out are grouped below.`) : "")
      : `${vs}, ${int(within)} of the ${int(n)} scored glyph sides (${fmt((100 * within) / n, 0)} %) are within ${fmt(A.tau, 0)} units per 1000 em of this font's typical side — the rest of the font is consistent with itself (${scale}). ` +
        (k ? `${int(k)} ${k === 1 ? "side stands" : "sides stand"} out:` : "None stands out.");
    box.appendChild(h("p", null, p1));
    if (groups.length) {
      box.appendChild(h("ul", { class: "diagnosis-list" }, groups.slice(0, 8).map((gr) => h("li", null,
        h("b", null, `${gr.kind.label}: ${charList(face, gr.glyphs)}`),
        gr.shift ? ` — sits off-centre: ${gr.dir.replace("shifted ", "")} by ${range(gr.offsets)} (one side tighter, the other looser)`
          : ` — ${gr.where} ${gr.dir} by ${range(gr.items.map((e) => e.d))}${gr.detail ? ` (${gr.detail})` : ""}`,
        gr.strong ? h("span", { class: "z-mark" }, "far out") : null))));
      if (groups.length > 8) box.appendChild(h("p", { class: "small" }, `…and ${groups.length - 8} more groups below.`));
    }
    if (K) {
      const kk = K.outs.length;
      box.appendChild(h("p", null,
        `Kerning: of the ${int(K.n)} scored pairs, ${int(kk)} (${fmt((100 * kk) / K.n, 1)} %) depart by ${fmt(K.tau, 0)} units or more from the typical pair of their two glyphs — ${kerned === 0 ? "differences only kerning can change" : "differences in how those particular pairs are kerned"}. `,
        kerned === 0 ? `This font kerns none of its scored pairs, so each of these gaps is the two glyphs' sidebearings alone: these are the pairs that would need kerning to match ${against === "library" ? `what ${catName} usually do` : "the model"}. ` : "",
        K.groups.length ? `${K.groups.length === 1 ? "They fall in one group" : `Most of them fall in ${K.groups.length} groups; the largest`}:` : "They are scattered rather than grouped."));
      if (K.groups.length) {
        box.appendChild(h("ul", { class: "diagnosis-list kern" }, K.groups.slice(0, 5).map((gr) => {
          const g = face.glyphs[gr.glyph];
          const partners = gr.pairs.map((e) => face.glyphs[gr.role === "left" ? e.b : e.a].char);
          const list = partners.slice(0, 12).join(" ") + (partners.length > 12 ? " …" : "");
          return h("li", null, gr.role === "left"
            ? [h("b", null, named(g)), ` followed by ${list}`]
            : [list, " followed by ", h("b", null, named(g))],
          ` — ${gr.pairs.length} pairs ${gr.dir} by about ${fmt(Math.abs(gr.median), 0)}`);
        })));
      }
    }
    return box;
  }

  function glyphMap(face, A, bySide, catName, body) {
    body.appendChild(h("h3", { id: "differs-map-h", tabindex: "-1" }, "Every glyph, side by side"));
    body.appendChild(h("p", { class: "section-intro" },
      "Each glyph is drawn between two bands, its left and its right side. A band's colour says how far that side departs from this font's typical side: grey is as usual, red is looser, blue is tighter, the deeper the further. A ring marks a side that stands out; a red ring, one that stands far out. Hover or focus a glyph for its numbers."));
    body.appendChild(ramp(A.R, A.against, catName));
    const map = h("div", { class: "glyph-map" });
    const groupsOrder = [["upper", "Capitals"], ["lower", "Lowercase"], ["punct", "Punctuation and symbols"]];
    groupsOrder.forEach(([grp, label]) => {
      const idx = [];
      face.glyphs.forEach((g, i) => { if (g.scored && SQA.groupOf(g) === grp && face.ok[i]) idx.push(i); });
      if (!idx.length) return;
      const tiles = h("div", { class: "gm-tiles" });
      idx.forEach((i) => tiles.appendChild(tile(face, { i, l: bySide.get(i + ":left") || null, r: bySide.get(i + ":right") || null }, A, { h: 88, band: 10, minW: 60 })));
      map.appendChild(h("div", { class: "gm-group" }, h("h4", null, label), tiles));
    });
    body.appendChild(map);
    body.appendChild(h("p", { class: "caption" }, "Figures, the symbols fonts often draw at the figure width and the underscore are not scored (see Glyph sides further down)."));
  }

  function sideCards(face, A, groups, bySide, resOf, catName, body) {
    if (!groups.length) return;
    body.appendChild(h("h3", { id: "differs-sides-h", tabindex: "-1" }, "Sides that stand out"));
    body.appendChild(h("p", { class: "section-intro" },
      `Grouped by kind of glyph and direction. The numbers are units per 1000 em beyond this font's typical side${A.against === "library" ? `, after what ${catName} usually do for that side` : ""}. Under each group, its glyph set among others as designed and as the model sets it, with the white shaded red where the font is looser than the model, blue where tighter.`));
    const cards = h("div", { class: "out-cards" });
    groups.forEach((gr, gi) => {
      const card = h("article", { class: "panel out-card" + (gr.strong ? " far" : "") });
      const n = gr.glyphs.length;
      card.appendChild(h("h4", null, gr.shift ? `${gr.kind.label}: off-centre, ${gr.dir}` : `${gr.kind.label}: ${gr.where} ${gr.dir}`, gr.strong ? h("span", { class: "z-mark" }, "far out") : null));
      const all = n === gr.total && n > 1 ? `All ${n} ${gr.kind.label.toLowerCase()}, ${charList(face, gr.glyphs)},` : n === 1 ? `${face.glyphs[gr.glyphs[0]].char} (${face.glyphs[gr.glyphs[0]].name})` : `${n} of the ${gr.total} ${gr.kind.label.toLowerCase()}, ${charList(face, gr.glyphs)},`;
      const words = h("p", { class: "card-text" }, gr.shift
        ? `${all} ${n === 1 ? "sits" : "sit"} ${range(gr.offsets)} units per 1000 em further ${gr.dir.replace("shifted ", "")} in ${n === 1 ? "its" : "their"} advance than ${A.against === "library" ? `${catName} usually place ${n === 1 ? "it" : "them"}` : `the model places ${n === 1 ? "it" : "them"}`}: one side is tighter and the other looser by about as much, so the room is right but the ink is off-centre.`
        : [`${all} ${n === 1 ? "is" : "are"} set ${gr.dir} ${onWhere(gr, n)} than ${A.against === "library" ? `${catName} usually set ${n === 1 ? "it" : "them"}` : `the model sets ${n === 1 ? "it" : "them"}`}: ${range(gr.items.map((e) => e.d))} units per 1000 em beyond the font's typical side. `,
          `${n === 1 ? "It gets" : "They get"} ${gr.dir === "looser" ? "more" : "less"} room than the rest of the font gives its glyphs.`]);
      const tiles = h("div", { class: "gm-tiles big" });
      gr.glyphs.forEach((i) => {
        const l = bySide.get(i + ":left") || null, rr = bySide.get(i + ":right") || null;
        const cap = (x, name) => (x ? h("span", { class: x.out ? "out-num" : "" }, `${name} ${signed(x.d, 0)}`) : null);
        tiles.appendChild(h("figure", { class: "tile-fig" }, tile(face, { i, l, r: rr }, A, { h: 150, band: 15, minW: 104 }),
          h("figcaption", null, cap(l, "L"), l && rr ? " · " : null, cap(rr, "R"))));
      });
      card.appendChild(tiles);
      if (gi < 6 && SQA.explain && SQA.explain.contextStrip) {
        const top = gr.items[0].i;
        card.appendChild(SQA.explain.contextStrip(face, { i: top }, resOf, `${face.glyphs[top].char} (${face.glyphs[top].name}) among other glyphs`));
      }
      card.appendChild(words);
      cards.appendChild(card);
    });
    body.appendChild(cards);
  }

  function kernTitle(face, gr) {
    const g = face.glyphs[gr.glyph].char;
    const partners = gr.pairs.map((e) => face.glyphs[gr.role === "left" ? e.b : e.a].char);
    const shown = partners.slice(0, 8).join(" ") + (partners.length > 8 ? " …" : "");
    return gr.role === "left" ? `${g} before ${shown} (${gr.dir})` : `${shown} before ${g} (${gr.dir})`;
  }

  function kerningCards(face, K, catName, against, body) {
    body.appendChild(h("h3", { id: "differs-kern-h", tabindex: "-1" }, "Kerning that stands out"));
    body.appendChild(h("p", { class: "section-intro" },
      `A pair's gap depends on the two sidebearings and on its kerning. To see the kerning on its own, each pair is measured against the typical pair of its left glyph and of its right glyph${against === "library" ? `, after what ${catName} usually do for that pair` : ""}: whatever a glyph's sidebearing does to all its pairs cancels out, and what is left is how this particular pair is kerned. A pair stands out at ${fmt(K.tau, 0)} units per 1000 em or more. Groups: a glyph with three or more such pairs in one direction.`));
    if (!K.outs.length) { body.appendChild(h("p", { class: "note" }, "No pair stands out: the kerning follows the sidebearings consistently.")); return; }
    const cards = h("div", { class: "out-cards kern-cards" });
    const k = 132 / (face.top - face.bottom);
    K.groups.slice(0, 12).forEach((gr) => {
      const g = face.glyphs[gr.glyph];
      const partnerIdx = gr.pairs.map((e) => (gr.role === "left" ? e.b : e.a));
      const card = h("article", { class: "panel out-card" });
      card.appendChild(h("h4", null, gr.role === "left" ? `${named(g)} followed by ${gr.pairs.length} glyphs: ${gr.dir}` : `${gr.pairs.length} glyphs followed by ${named(g)}: ${gr.dir}`));
      const kd = medianOf(gr.pairs.map((e) => e.kd)), km = medianOf(gr.pairs.map((e) => e.km));
      const words = h("p", { class: "card-text" },
        `${gr.role === "left" ? `${named(g)} before ${describeGlyphs(face, partnerIdx)}` : `${describeGlyphs(face, partnerIdx)} before ${named(g)}`}: these pairs are set ${fmt(Math.abs(gr.median), 0)} units ${gr.dir} (median) than ${/^[A-Za-z0-9]$/.test(g.char) ? `${g.char}'s other pairs` : `the other pairs of ${named(g)}`} and their partners' other pairs would make them. `,
        `The font kerns them ${signed(kd, 0)} (median) where the model kerns ${signed(km, 0)}. `,
        gr.dir === "looser" ? "Compared with how the rest of the font is spaced, these pairs are kerned less, or opened more, than expected." : "Compared with how the rest of the font is spaced, these pairs are kerned more than expected.");
      // the pairs furthest out, drawn as designed and as the model sets them
      const ex = gr.pairs.slice(0, 4);
      const widthU = Math.max(...ex.map((e) => Math.max(face.pairPlace(e.a, e.b, "designer").right, face.pairPlace(e.a, e.b, "best").right)));
      const drawings = h("div", { class: "pair-examples" });
      ex.forEach((e) => {
        drawings.appendChild(h("figure", { class: "pair-example" },
          h("figcaption", null, h("b", null, face.glyphs[e.a].char + face.glyphs[e.b].char), h("span", null, `${signed(e.d, 0)} · kern ${signed(e.kd, 0)} / model ${signed(e.km, 0)}`)),
          h("div", { class: "pe-row" },
            h("div", null, h("span", { class: "measure-label" }, "As designed"), SQA.explain.pairFigure(face, e, "designer", k, { widthU, label: "as designed" })),
            h("div", null, h("span", { class: "measure-label" }, "Model"), SQA.explain.pairFigure(face, e, "best", k, { widthU, label: "as the model sets it", ghost: "designer" })))));
      });
      card.append(drawings, words);
      const more = h("details", { class: "more-pairs" }, h("summary", null, `Every pair of this group (${gr.pairs.length})`),
        h("div", { class: "table-wrap" }, pairTable(face, gr.pairs)));
      card.appendChild(more);
      cards.appendChild(card);
    });
    body.appendChild(cards);
    if (K.groups.length > 12) body.appendChild(h("p", { class: "small" }, `${K.groups.length - 12} smaller groups are in the table below.`));
    if (K.singles.length) {
      body.appendChild(h("h4", { class: "sub-h" }, `Single pairs that stand out (${int(K.singles.length)})`));
      body.appendChild(h("p", { class: "small" }, "Pairs that stand out but share no group with two others, furthest first."));
      const box = h("div", { class: "table-wrap medium" }, pairTable(face, K.singles.slice(0, 40)));
      body.appendChild(box);
      if (K.singles.length > 40) body.appendChild(h("p", { class: "small" }, `The first 40 of ${int(K.singles.length)}; the table below has every pair that stands out.`));
    }
  }

  function pairTable(face, pairs) {
    const t = h("table", { class: "compact" });
    t.appendChild(h("thead", null, h("tr", null, ["Pair", "Its own departure", "Against usual", "Font kerns", "Model kerns", "Font gap", "Model gap"].map((c, i) => h("th", { scope: "col", class: i ? "num" : "" }, c)))));
    const tb = h("tbody");
    pairs.forEach((e) => tb.appendChild(h("tr", null,
      h("th", { scope: "row" }, face.glyphs[e.a].char + face.glyphs[e.b].char, h("small", null, ` ${face.glyphs[e.a].name} ${face.glyphs[e.b].name}`)),
      h("td", { class: "num" }, h("b", null, signed(e.d, 0))),
      h("td", { class: "num" }, signed(e.rel, 0)),
      h("td", { class: "num" }, signed(e.kd, 0)),
      h("td", { class: "num" }, signed(e.km, 0)),
      h("td", { class: "num" }, fmt(e.dg, 0)),
      h("td", { class: "num" }, fmt(e.mg, 0)))));
    t.appendChild(tb);
    return t;
  }

  function tables(face, S, A, K, body) {
    SQA.tableToggle(body, [
      { label: "Glyph", get: (e) => `${e.g.char} (${e.g.name})` }, { label: "Side", get: (e) => e.side },
      { label: "Beyond the typical side", num: true, get: (e) => signed(e.d, 1) },
      { label: "Against usual", num: true, get: (e) => signed(e.rel, 1) },
      { label: "Against the model", num: true, get: (e) => signed(e.v, 1) },
      { label: "Stands out", get: (e) => (e.strong ? "far out" : e.out ? "yes" : "") }],
      () => S.list.slice().sort((a, b) => Math.abs(b.d) - Math.abs(a.d)), { caption: "Every compared glyph side, furthest first", size: "medium", label: `Show every side (${int(S.list.length)})` });
    if (K && K.outs.length) {
      SQA.tableToggle(body, [
        { label: "Pair", get: (e) => `${face.glyphs[e.a].char}${face.glyphs[e.b].char} (${face.glyphs[e.a].name} ${face.glyphs[e.b].name})` },
        { label: "Its own departure", num: true, get: (e) => signed(e.d, 0) },
        { label: "Against usual", num: true, get: (e) => signed(e.rel, 0) },
        { label: "Font kerns", num: true, get: (e) => signed(e.kd, 0) },
        { label: "Model kerns", num: true, get: (e) => signed(e.km, 0) }],
        () => K.outs.slice().sort((a, b) => Math.abs(b.d) - Math.abs(a.d)), { caption: "Every pair that stands out, furthest first", size: "medium", label: `Show every pair that stands out (${int(K.outs.length)})` });
    }
  }

  SQA.outliers = { render, analyseSides, analyseKerning, kindOf };
})();
