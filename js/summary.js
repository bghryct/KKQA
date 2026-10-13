/*
 * KKQA — what a report opens with: the level and the issues in short sentences,
 * the key numbers, and drawings of what stands out most — the 10 sidebearings
 * and the 10 pairs furthest from what is expected (the Model Gap, computed
 * once when the report is judged: top.rs), and joins that do not connect.
 * Every other section is folded under Details.
 *
 * The words follow ASD-STE100's writing rules: short sentences, active voice,
 * one idea each, the same word for the same thing.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, s, fmt, signed, int } = SQA;

  const LEVEL_LINE = {
    FAIL: "The spacing is very far from the norm.",
    WARN: "Examine the items below.",
    INFO: "The check found no problem. Spacing is the designer's choice.",
    PASS: "The check found no problem.",
    SKIP: "The check does not apply to this font.",
    ERROR: "The check did not complete.",
  };
  const ORDER = { FAIL: 0, ERROR: 0, WARN: 1, SKIP: 2, INFO: 3, PASS: 3 };
  // notes that limit what an INFO level says: the font is compared, not judged
  const NOT_JUDGED = ["spacing/out-of-range", "spacing/connected", "spacing/slanted"];

  // ------------------------------------------------------------------ drawings
  const H = 112, PAD = 10;
  /** A glyph in its advance box: the solid edges are where the font puts its
   *  sides, the dashed edge is where the expected side would be, and the band
   *  between them is the Model Gap. */
  function sideTile(face, e) {
    const g = face.glyphs[e.g], b = g.bbox;
    const lsb = face.lsb(e.g, "designer"), rsb = face.rsb(e.g, "designer");
    const gapU = e.gap / face.per;
    const k = (H - 2 * PAD) / (face.top - face.bottom);
    const adv = lsb + (b[1] - b[0]) + rsb;
    const left = e.side === 0;
    const edge = left ? 0 : adv, want = left ? gapU : adv - gapU;
    const x0 = Math.min(0, want), x1 = Math.max(adv, want);
    const W = Math.max(56, Math.ceil((x1 - x0) * k) + 2 * PAD);
    const X = (u) => PAD + (u - x0) * k;
    const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: "chart side-tile", role: "img",
      "aria-label": `${g.char} ${left ? "left" : "right"} side: ${signed(e.gap, 0)} units from the expected value` });
    svg.appendChild(s("rect", { x: Math.min(X(edge), X(want)), y: 4, width: Math.abs(X(want) - X(edge)), height: H - 8, class: e.gap > 0 ? "gap-shade looser" : "gap-shade tighter" }));
    svg.appendChild(s("line", { x1: X(0), x2: X(0), y1: 4, y2: H - 4, class: "adv-edge" }));
    svg.appendChild(s("line", { x1: X(adv), x2: X(adv), y1: 4, y2: H - 4, class: "adv-edge" }));
    svg.appendChild(s("line", { x1: X(want), x2: X(want), y1: 4, y2: H - 4, class: "want-edge" }));
    svg.appendChild(face.use(e.g, lsb - b[0], k, X(0), PAD + face.top * k, "glyph-fill"));
    return svg;
  }
  /** A pair as designed, with the second glyph's expected position in grey. */
  function pairTile(face, e) {
    if (!face.has(e.a, "designer") || !face.has(e.b, "designer")) return null;
    const p = face.pairPlace(e.a, e.b, "designer");
    const gapU = e.gap / face.per;
    const k = (H - 2 * PAD) / (face.top - face.bottom);
    const x0 = Math.min(0, p.tb - gapU), x1 = Math.max(p.right, p.right - gapU);
    const W = Math.max(64, Math.ceil((x1 - x0) * k) + 2 * PAD);
    const ox = PAD - x0 * k, baseY = PAD + face.top * k;
    const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: "chart pair-tile", role: "img",
      "aria-label": `${face.glyphs[e.a].char}${face.glyphs[e.b].char}: ${signed(e.gap, 0)} units from the expected gap` });
    svg.appendChild(face.use(e.b, p.tb - gapU, k, ox, baseY, "glyph-ghost"));
    svg.appendChild(face.use(e.a, p.ta, k, ox, baseY));
    svg.appendChild(face.use(e.b, p.tb, k, ox, baseY));
    return svg;
  }
  // the extent of SVG path data (every number pair is a point: M, L, Q and C)
  const boundsCache = new Map();
  function pathBounds(d) {
    if (boundsCache.has(d)) return boundsCache.get(d);
    const n = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i + 1 < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]); }
    const b = Number.isFinite(x0) ? [x0, x1, y0, y1] : null;
    boundsCache.set(d, b);
    return b;
  }
  /**
   * A join's word ("n" + pair + "n") exactly as a browser sets it: the glyphs
   * shaping chose (contextual alternates included) at the positions it gave
   * them; the n's in grey. `p.run`: [glyph id, x, y, part]; `outlines`: SVG
   * path data by glyph id. Null for reports from before the runs.
   */
  function joinRun(face, joins, p, height) {
    if (!p || !Array.isArray(p.run) || !p.run.length || !joins || !joins.outlines) return null;
    const k = (height - 2 * PAD) / (face.top - face.bottom);
    let x0 = Infinity, x1 = -Infinity;
    p.run.forEach(([g, x]) => { const b = pathBounds(joins.outlines[g] || ""); if (b) { x0 = Math.min(x0, x + b[0]); x1 = Math.max(x1, x + b[1]); } });
    if (!Number.isFinite(x0)) return null;
    const W = Math.ceil((x1 - x0) * k) + 2 * PAD;
    const ox = PAD - x0 * k, baseY = PAD + face.top * k;
    const svg = s("svg", { width: W, height, viewBox: `0 0 ${W} ${height}`, class: "chart join-run", role: "img",
      "aria-label": `n${p.pair}n as a browser sets it${Number.isFinite(p.gap) ? `: the strokes are ${fmt(p.gap, 0)} units apart` : ""}` });
    p.run.forEach(([g, x, y, part]) => {
      const d = joins.outlines[g];
      if (!d) return;
      svg.appendChild(s("path", { d, class: part === 0 ? "glyph-ghost" : "glyph-fill",
        transform: `translate(${(ox + x * k).toFixed(2)} ${(baseY - y * k).toFixed(2)}) scale(${k.toFixed(5)} ${(-k).toFixed(5)})` }));
    });
    return svg;
  }

  // ------------------------------------------------------------------ the section
  function render(ctx, root, r, face, o) {
    const st = r.status || { level: "ERROR", reasons: [] };
    const sm = r.summary || null;
    const top = st.top || null;
    const sec = h("section", { class: "summary", "aria-labelledby": "summary-h" });
    sec.appendChild(h("h2", { id: "summary-h", tabindex: "-1", class: "sr-only" }, "Summary"));
    // an INFO level that is not a verdict: compared but not judged, or no norms at all (an italic on its own)
    const unjudged = st.level === "INFO" && (st.reasons || []).some((x) => NOT_JUDGED.includes(x.code));
    const noNorms = st.level === "INFO" && sm && !st.baseline;
    const line = unjudged ? "The check compares this font with the norms, but does not judge it."
      : noNorms ? "The check does not judge this font against the norms." : LEVEL_LINE[st.level] || "";
    sec.appendChild(h("div", { class: "verdict-line" }, SQA.badge(st.level, { big: true }), h("p", null, line)));
    if (sm && face) {
      const stats = h("div", { class: "stats key-stats" });
      const tile = (v, label) => stats.appendChild(h("div", { class: "stat" }, h("div", { class: "stat-value" }, v), h("div", { class: "stat-label" }, label)));
      tile(fmt(sm.shape_error, 1), "Shape error");
      tile(signed(sm.best_looseness, 2), r.settings && r.settings.fit === "joins" ? "Looseness, joined letters" : "Best-fit Looseness");
      tile(SQA.PRESET_LABEL[sm.closest] || sm.closest || "–", "Nearest preset");
      tile(sm.kern_r !== null && sm.kern_r !== undefined ? fmt(sm.kern_r, 2) : "None", "Kerning match");
      sec.appendChild(stats);
    }
    // the issues, what sets the level first, then the notes (folded): each one
    // as its first sentence, its numbers and lists on demand (the nearest
    // preset is a key number)
    const reasons = (st.reasons || []).filter((x) => x.code !== "spacing/closest").sort((a, b) => ORDER[a.level] - ORDER[b.level]);
    const isNote = (x) => x.level === "INFO" || x.level === "PASS";
    const item = (x, badge) => {
      const m = x.message || "";
      const k = m.search(/[.!?](?=\s+[A-Z0-9“"‘(])/);
      const text = k < 0 ? h("span", null, m)
        : h("details", { class: "issue-more" }, h("summary", null, m.slice(0, k + 1)), h("p", null, m.slice(k + 1).trim()));
      return h("li", null, badge ? SQA.badge(x.level) : null, text);
    };
    const issues = reasons.filter((x) => !isNote(x)), notes = reasons.filter(isNote);
    if (issues.length) {
      sec.appendChild(h("h3", null, "Issues"));
      sec.appendChild(h("ul", { class: "issues" }, issues.map((x) => item(x, true))));
    }
    if (notes.length) {
      const d = h("details", { class: "fold small-fold" }, h("summary", null, `Notes (${notes.length})`));
      d.appendChild(h("ul", { class: "notes" }, notes.map((x) => item(x, false))));
      sec.appendChild(d);
    }
    if (!face || !sm) { root.appendChild(sec); return sec; }

    const key = h("p", { class: "small" }, "Units per 1000 em. Plus is looser than expected; minus is tighter. ", SQA.readLink("summary"));
    if (top && top.sides && top.sides.length) {
      sec.appendChild(h("h3", null, `Top ${top.sides.length} sidebearings`));
      sec.appendChild(key);
      sec.appendChild(h("div", { class: "top-grid" }, top.sides.filter((e) => face.glyphs[e.g]).map((e) => h("figure", { class: "top-item" }, sideTile(face, e),
        h("figcaption", null, h("b", null, face.glyphs[e.g].char), ` ${e.side === 0 ? "left" : "right"} `, h("b", null, signed(e.gap, 0)),
          e.flag ? h("span", { class: "z-mark", title: e.flag === "fail" ? "Beyond the FAIL limit for this side" : "Beyond the WARN limit for this side" }, e.flag === "fail" ? "✕" : "!") : null)))));
      sec.appendChild(h("p", { class: "small" }, "Dashed line: the expected edge. ! and ✕: beyond the WARN and FAIL limits."));
    }
    const tiles = (list, kern) => h("div", { class: "top-grid" }, list.filter((e) => face.glyphs[e.a] && face.glyphs[e.b]).map((e) => {
      const svg = pairTile(face, e);
      return svg ? h("figure", { class: "top-item" }, svg, h("figcaption", null, h("b", null, face.glyphs[e.a].char + face.glyphs[e.b].char), " ", h("b", null, signed(e.gap, 0)),
        kern && Number.isFinite(e.kern) ? ` · kern ${signed(e.kern, 0)}` : null)) : null;
    }));
    if (top && top.pairs && top.pairs.length) {
      sec.appendChild(h("h3", null, `Top ${top.pairs.length} pairs`));
      sec.appendChild(h("p", { class: "small" }, "Each pair without the effect of its sidebearings. Grey: the expected position of the second glyph."));
      sec.appendChild(tiles(top.pairs, false));
    }
    if (top && top.kerned_count) {
      const d = h("details", { class: "fold small-fold" }, h("summary", null, `Kerned on purpose (${int(top.kerned_count)})`));
      d.appendChild(h("p", { class: "small" }, "The font kerns these pairs in the direction of their gap, and the glyphs do not touch. They are not issues."));
      d.appendChild(tiles(top.kerned || [], true));
      sec.appendChild(d);
    }
    // joins that do not connect, as a browser sets them
    const broken = (r.joins && r.joins.broken) || [];
    const runs = broken.slice(0, 10).map((p) => [p, joinRun(face, r.joins, p, 96)]).filter((x) => x[1]);
    if (runs.length) {
      sec.appendChild(h("h3", null, broken.length === 1 ? "A join that does not connect" : `Joins that do not connect (${int(broken.length)})`));
      sec.appendChild(h("p", { class: "small" }, "As a browser sets them, between two n's. Gaps in units per 1000 em.",
        runs.length < broken.length ? ` This list shows the ${runs.length} largest. Joins, under Details, shows more.` : ""));
      sec.appendChild(h("div", { class: "top-grid" }, runs.map(([p, svg]) => h("figure", { class: "top-item" }, svg,
        h("figcaption", null, h("b", null, p.pair), " ", h("b", null, fmt(p.gap, 0)))))));
    }
    root.appendChild(sec);
    return sec;
  }

  /** Every section after the summary, folded: its title stays; it opens on demand. */
  function fold(root, after) {
    const box = h("section", { class: "details", "aria-labelledby": "details-h" }, h("h2", { id: "details-h" }, "Details"));
    const secs = [...root.children].filter((el) => (el.tagName === "SECTION" || el.matches("details.panel")) && el !== after && (el.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_PRECEDING));
    secs.forEach((sec) => {
      if (sec.tagName !== "SECTION") { box.appendChild(sec); return; }
      const h2 = sec.querySelector("h2");
      const d = h("details", { class: "fold" }, h("summary", null, h2 ? h2.textContent : "More"));
      if (h2) h2.classList.add("sr-only");
      d.appendChild(sec);
      box.appendChild(d);
    });
    after.after(box);
  }

  SQA.summary = { render, fold, joinRun, pathBounds };
})();
