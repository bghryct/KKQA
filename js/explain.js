/*
 * Spacing QA — two sections of a report that explain its numbers:
 *
 * - the designer harness: the comparison with Kinetikern2 and its harness
 *   (every other section) next to the same comparison with the bare model,
 *   from the same solves, so what the harness changes for this font shows —
 *   the sides and pairs it moves, and whether that is toward the designer;
 * - the shape error: what one pair's residual is (drawn and measured), how
 *   the residuals of all pairs spread, which glyphs make most of the error
 *   (drawn in context, as designed and as the model sets them), and whether
 *   it lies in the sidebearings or in the kerning.
 *
 * Units: geometry in font units; every number shown in units per 1000 em.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, s, clear, fmt, signed, int, tip } = SQA;

  function section(root, id, title, intro) {
    const sec = h("section", { "aria-labelledby": id });
    sec.appendChild(h("h2", { id, tabindex: "-1" }, title));
    if (intro) sec.appendChild(typeof intro === "string" ? h("p", { class: "section-intro" }, intro) : intro);
    root.appendChild(sec);
    return sec;
  }

  /**
   * The scored pairs of a report: its residual against the best fit (with
   * the harness), the designer's and the model's gaps and kerning, and with
   * the bare model its gap and residual too. Units per 1000 em.
   */
  function pairsOf(r, face) {
    const d = r.detail, sm = r.summary;
    const pg = d.pair_glyphs || [];
    const m = pg.length, res = d.residuals || [];
    const out = [];
    if (!m || res.length !== m * m) return out;
    const bareOff = face.spacings.includes("bare") && sm.bare ? sm.bare.offset : null;
    for (let a = 0; a < m; a++) {
      for (let b = 0; b < m; b++) {
        const v = res[a * m + b];
        if (v === null || v === undefined) continue;
        const ga = pg[a], gb = pg[b];
        if (!face.glyphs[ga].scored || !face.glyphs[gb].scored) continue;
        if (!face.has(ga, "designer") || !face.has(gb, "designer") || !face.has(ga, "best") || !face.has(gb, "best")) continue;
        const e = {
          a: ga, b: gb, res: v / 10,
          dg: face.gap(ga, gb, "designer") * face.per, mg: face.gap(ga, gb, "best") * face.per,
          kd: face.kerning(ga, gb, "designer") * face.per, km: face.kerning(ga, gb, "best") * face.per,
        };
        if (bareOff !== null && face.has(ga, "bare") && face.has(gb, "bare")) {
          e.bg = face.gap(ga, gb, "bare") * face.per;
          e.resBare = e.dg - e.bg - bareOff;
        }
        out.push(e);
      }
    }
    return out;
  }
  const pairName = (face, e) => face.glyphs[e.a].char + face.glyphs[e.b].char;
  const isLetter = (g) => /^[A-Za-z]$/.test(g.char);

  /**
   * A pair drawn under one spacing, at `k` px per unit, with its gap marked:
   * the white between the two inks, shaded and measured. o: {ghost (a
   * spacing whose second glyph is drawn in grey), widthU, label, cls}.
   */
  function pairFigure(face, e, sp, k, o) {
    const opt = o || {};
    const p = face.pairPlace(e.a, e.b, sp);
    const padU = 0.06 * face.upm;
    const widthU = Math.max(opt.widthU || 0, p.right);
    const glyphH = (face.top - face.bottom) * k;
    const W = Math.ceil((widthU + 2 * padU) * k), H = Math.ceil(glyphH + 30);
    const baseY = face.top * k + 4, ox = padU * k;
    const root = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${pairName(face, e)} ${opt.label || sp}: gap ${fmt(p.gap * face.per, 0)} units per 1000 em` });
    const inkR = face.ink(e.a), gapU = p.gap;
    // the gap: shaded between the two inks (an overlap is shaded too)
    const x1 = ox + Math.min(inkR, inkR + gapU) * k, x2 = ox + Math.max(inkR, inkR + gapU) * k;
    root.appendChild(s("rect", { x: x1, y: 2, width: Math.max(1, x2 - x1), height: glyphH + 4, class: "gap-band" + (gapU < 0 ? " overlap" : "") }));
    if (opt.ghost) {
      const q = face.pairPlace(e.a, e.b, opt.ghost);
      root.appendChild(face.use(e.b, q.tb, k, ox, baseY, "glyph-ghost"));
    }
    root.appendChild(face.use(e.a, p.ta, k, ox, baseY, opt.cls || "glyph-fill"));
    root.appendChild(face.use(e.b, p.tb, k, ox, baseY, opt.cls || "glyph-fill"));
    // the measure: a dimension line under the glyphs
    const y = glyphH + 16;
    root.appendChild(s("line", { x1, x2, y1: y, y2: y, class: "dim" }));
    root.appendChild(s("line", { x1, x2: x1, y1: y - 4, y2: y + 4, class: "dim" }));
    root.appendChild(s("line", { x1: x2, x2, y1: y - 4, y2: y + 4, class: "dim" }));
    root.appendChild(s("text", { x: (x1 + x2) / 2, y: y + 13, "text-anchor": "middle", class: "dim-label" }, (opt.measureLabel ? "gap " : "") + fmt(gapU * face.per, 0)));
    return root;
  }

  // ------------------------------------------------------------ the harness
  function harness(ctx, root, r, face, o) {
    const sm = r.summary, b = sm && sm.bare;
    if (!b || !face || !face.spacings.includes("bare")) return;
    const d = sm.shape_error - b.shape_error;
    const rel = b.shape_error > 0 ? Math.abs(d) / b.shape_error : 0;
    const sec = section(root, "harness-h", "Designer harness: with it and without it",
      "Kinetikern2 spaces from the outlines alone. Its designer harness adds what the designers of well-spaced fonts consistently do differently from the model — more room inside parentheses and brackets and around / ? ! &, less around quotes, period, comma and hyphen, more on the open sides of E, F, L and T at light weights — learned from the fonts on Google Fonts that its reviewers rate well spaced (see About). Every other section of this page compares the font with the model and its harness. Here is the same comparison with the bare model, from the same solves: the difference is the harness alone.");
    const verb = d < -0.05 ? "closer to" : d > 0.05 ? "further from" : "as close to";
    sec.appendChild(h("p", { class: "lead-line" },
      h("b", null, `With the harness the model is ${verb} this font's spacing`),
      `: shape error ${fmt(b.shape_error, 1)} without it, ${fmt(sm.shape_error, 1)} with it (${signed(d, 1)}${rel >= 0.005 ? `, ${fmt(rel * 100, 0)} % ${d < 0 ? "closer" : "further"}` : ""}).`));

    // the numbers both ways
    const tbl = h("table", { class: "both-ways" });
    tbl.appendChild(h("caption", { class: "sr-only" }, "The comparison with the bare model and with the model and its harness"));
    tbl.appendChild(h("thead", null, h("tr", null, h("th", { scope: "col" }, "Measure"), h("th", { scope: "col", class: "num" }, "Bare model"), h("th", { scope: "col", class: "num" }, "With the harness"), h("th", { scope: "col", class: "num" }, "Change"))));
    const tb = h("tbody");
    const row = (label, x, y, dec, lowerIsBetter, note) => {
      const ok = Number.isFinite(x) && Number.isFinite(y);
      const dv = ok ? y - x : null;
      const better = ok && Math.abs(dv) >= Math.pow(10, -dec) / 2 ? (lowerIsBetter ? dv < 0 : dv > 0) : null;
      tb.appendChild(h("tr", null,
        h("th", { scope: "row" }, label, note ? h("small", null, note) : null),
        h("td", { class: "num" }, ok || Number.isFinite(x) ? fmt(x, dec) : "–"),
        h("td", { class: "num" }, Number.isFinite(y) ? fmt(y, dec) : "–"),
        h("td", { class: "num" }, ok ? signed(dv, dec) : "–", better === null ? null : h("span", { class: "chg " + (better ? "chg-better" : "chg-worse") }, better ? "closer" : "further"))));
    };
    row("Shape error", b.shape_error, sm.shape_error, 1, true, "every scored pair");
    row("Sidebearing error", b.sidebearing_error, sm.sidebearing_error, 1, true, "per side");
    row("Shape error, kerned pairs", b.kerned_error, sm.kerned_error, 1, true, "the pairs the designer kerned");
    row("Kerning correlation r", b.kern_r, sm.kern_r, 2, false, "with the designer's kerning");
    tb.appendChild(h("tr", null, h("th", { scope: "row" }, "Closest preset"),
      h("td", { class: "num" }, SQA.PRESET_LABEL[b.closest] || b.closest), h("td", { class: "num" }, SQA.PRESET_LABEL[sm.closest] || sm.closest),
      h("td", { class: "num" }, b.closest === sm.closest ? "same" : "changed")));
    tbl.appendChild(tb);
    sec.appendChild(h("div", { class: "table-wrap auto" }, tbl));

    // the sides it moves
    const moves = [];
    face.glyphs.forEach((g, i) => {
      if (!g.scored || !Array.isArray(g.dev) || !Array.isArray(g.dev_bare) || !face.has(i, "bare") || !face.has(i, "best")) return;
      ["left", "right"].forEach((side, k) => {
        const shift = (g.best[k] - g.bare[k]) * face.per; // + = the harness gives the side more room
        if (Math.abs(shift) < 1) return;
        const toward = Math.abs(g.dev[k]) < Math.abs(g.dev_bare[k]) - 0.5;
        const away = Math.abs(g.dev[k]) > Math.abs(g.dev_bare[k]) + 0.5;
        moves.push({ i, g, side, k, shift, devBare: g.dev_bare[k], dev: g.dev[k], toward, away });
      });
    });
    if (moves.length) {
      const toward = moves.filter((m) => m.toward).length, away = moves.filter((m) => m.away).length;
      sec.appendChild(h("h3", null, "The sides it moves"));
      sec.appendChild(h("p", { class: "section-intro" },
        `The harness moves ${int(moves.length)} glyph ${moves.length === 1 ? "side" : "sides"} of this font by a unit per 1000 em or more: ${int(toward)} toward where the designer put ${toward === 1 ? "it" : "them"}, ${int(away)} away${moves.length - toward - away ? `, ${int(moves.length - toward - away)} about as far` : ""}. ` +
        "Each row is one side: the hollow dot is how far the designer's side is from the bare model, the filled dot how far it is from the model with the harness (0: where the model puts it, offset removed). An arrow toward 0 means the harness moved the model toward this font."));
      const top = moves.slice().sort((x, y) => Math.abs(y.shift) - Math.abs(x.shift)).slice(0, 16);
      const stage = h("div", { class: "stage" });
      sec.appendChild(stage);
      sec.appendChild(SQA.legend([{ label: "toward the designer", color: "var(--good)" }, { label: "away from the designer", color: "var(--critical)" }, { label: "bare model", color: "var(--ink)", ring: true }, { label: "with the harness", color: "var(--ink)" }]));
      SQA.responsive(stage, (w) => dumbbell(stage, w, top, face), ctx);
      SQA.tableToggle(sec, [
        { label: "Side", get: (m) => `${m.g.char} ${m.side} (${m.g.name})` },
        { label: "Harness moves it", num: true, get: (m) => signed(m.shift, 1) },
        { label: "Designer − bare model", num: true, get: (m) => signed(m.devBare, 1) },
        { label: "Designer − with harness", num: true, get: (m) => signed(m.dev, 1) },
        { label: "", get: (m) => (m.toward ? "toward the designer" : m.away ? "away" : "about the same") }],
        () => moves.slice().sort((x, y) => Math.abs(y.shift) - Math.abs(x.shift)), { caption: "Every glyph side the harness moves", size: "medium", label: `Show every side it moves (${int(moves.length)})` });
    }

    // the pairs it corrects
    const P = pairsOf(r, face);
    const byPair = new Map(P.map((e) => [e.a * face.n + e.b, e]));
    const fixes = [];
    for (const [a, bb, v] of (r.detail.kerning && r.detail.kerning.bare) || []) {
      const e = byPair.get(a * face.n + bb);
      if (!e || e.resBare === undefined) continue;
      const corr = (face.kerning(a, bb, "best") - v) * face.per;
      if (Math.abs(corr) < 1) continue;
      fixes.push(Object.assign({ corr, toward: Math.abs(e.res) < Math.abs(e.resBare) - 0.5, away: Math.abs(e.res) > Math.abs(e.resBare) + 0.5 }, e));
    }
    if (fixes.length) {
      const toward = fixes.filter((f) => f.toward).length;
      sec.appendChild(h("h3", null, "The pairs it corrects"));
      sec.appendChild(h("p", { class: "section-intro" },
        `Beyond the sides, the harness corrects the kerning of ${int(fixes.length)} ${fixes.length === 1 ? "pair" : "pairs"} of this font (mostly with punctuation); ${int(toward)} of them end up closer to the designer's gap. The largest, as designed, as the bare model sets them and with the harness:`));
      const top = fixes.slice().sort((x, y) => Math.abs(y.corr) - Math.abs(x.corr)).slice(0, 8);
      const k = 34 / (face.top - face.bottom);
      const widthU = Math.max(...top.map((e) => Math.max(face.pairPlace(e.a, e.b, "designer").right, face.pairPlace(e.a, e.b, "bare").right, face.pairPlace(e.a, e.b, "best").right)));
      const t2 = h("table", { class: "pairs" });
      t2.appendChild(h("caption", { class: "sr-only" }, "The pairs the designer harness corrects most"));
      t2.appendChild(h("thead", null, h("tr", null, ["Pair", "As designed", "Bare model", "With the harness", "Correction", "vs bare", "vs with it"].map((c, i) => h("th", { scope: "col", class: i >= 4 ? "num" : "" }, c)))));
      const body = h("tbody");
      top.forEach((e) => {
        body.appendChild(h("tr", null,
          h("td", { class: "pair-name" }, pairName(face, e), h("small", null, `${face.glyphs[e.a].name} ${face.glyphs[e.b].name}`)),
          h("td", { class: "draw" }, pairFigure(face, e, "designer", k, { widthU, label: "as designed" })),
          h("td", { class: "draw" }, pairFigure(face, e, "bare", k, { widthU, label: "bare model", ghost: "designer" })),
          h("td", { class: "draw" }, pairFigure(face, e, "best", k, { widthU, label: "with the harness", ghost: "designer" })),
          h("td", { class: "num" }, h("b", null, signed(e.corr, 0))),
          h("td", { class: "num" }, signed(e.resBare, 0)),
          h("td", { class: "num" }, signed(e.res, 0), e.toward ? h("span", { class: "chg chg-better" }, "closer") : e.away ? h("span", { class: "chg chg-worse" }, "further") : null)));
      });
      t2.appendChild(body);
      sec.appendChild(h("div", { class: "table-wrap" }, t2));
      sec.appendChild(h("p", { class: "caption" }, "Drawings at one scale; the white between the glyphs is shaded and measured, the designed position of the second glyph in grey. “vs bare” and “vs with it”: the pair's residual (designer's gap − model's gap − overall offset) against each model."));
    }
  }

  function dumbbell(container, W, rows, face) {
    clear(container);
    const rowH = 24, top = 26, labelW = 92;
    const H = top + rows.length * rowH + 26;
    const vals = rows.flatMap((m) => [Math.abs(m.dev), Math.abs(m.devBare)]).sort((a, b) => a - b);
    let R = Math.max(10, SQA.quantile(vals, 0.95) * 1.15);
    R = Math.ceil(R / 10) * 10;
    const x0 = labelW, x1 = W - 16;
    const X = (v) => x0 + ((Math.max(-R, Math.min(R, v)) + R) / (2 * R)) * (x1 - x0);
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "chart", role: "img", "aria-label": "Glyph sides the designer harness moves: the designer's side against the bare model and against the model with the harness. Use the arrow keys to read each side." });
    SQA.niceTicks(-R, R, W < 480 ? 4 : 8).forEach((t) => {
      root.appendChild(s("line", { x1: X(t), x2: X(t), y1: top - 6, y2: H - 22, class: t === 0 ? "zero" : "gridline" }));
      root.appendChild(s("text", { x: X(t), y: H - 8, "text-anchor": "middle", class: "tick" }, signed(t, 0)));
    });
    root.appendChild(s("text", { x: X(0), y: 12, "text-anchor": "middle", class: "muted-label" }, "0 = where the model puts the side"));
    const items = [];
    rows.forEach((m, j) => {
      const y = top + j * rowH + rowH / 2;
      root.appendChild(s("text", { x: 8, y: y + 4.5, class: "label-strong", style: "font-size:13px" }, m.g.char));
      root.appendChild(s("text", { x: 28, y: y + 4, class: "tick" }, `${m.side} · ${signed(m.shift, 0)}`));
      const xa = X(m.devBare), xb = X(m.dev);
      const cls = m.toward ? "db-toward" : m.away ? "db-away" : "db-same";
      root.appendChild(s("line", { x1: xa, x2: xb, y1: y, y2: y, class: "db-line " + cls }));
      if (Math.abs(xb - xa) > 8) {
        const dir = xb > xa ? -1 : 1;
        root.appendChild(s("path", { d: `M${xb + dir * 7},${y - 4}L${xb + dir * 1.5},${y}L${xb + dir * 7},${y + 4}`, class: "db-head " + cls }));
      }
      root.appendChild(s("circle", { cx: xa, cy: y, r: 4.5, class: "db-bare" }));
      root.appendChild(s("circle", { cx: xb, cy: y, r: 4.5, class: "db-with" }));
      const content = () => ({
        title: `${m.g.char} — ${m.side} side (${m.g.name})`,
        rows: [["Harness moves the side", signed(m.shift, 1)], ["Designer − bare model", signed(m.devBare, 1)], ["Designer − with the harness", signed(m.dev, 1)]],
        note: m.toward ? "The harness moves the model toward this font's designer." : m.away ? "The harness moves the model away from this font's designer: the font does not follow the convention it learned." : "About as far either way.",
      });
      const hit = s("rect", { x: 0, y: y - rowH / 2, width: W, height: rowH, class: "hit" });
      hit.addEventListener("pointermove", (ev) => tip.show(content(), ev.clientX, ev.clientY));
      hit.addEventListener("pointerleave", () => tip.hide());
      root.appendChild(hit);
      items.push({ node: hit, content, label: `${m.g.char} ${m.side}: ${signed(m.devBare, 0)} bare, ${signed(m.dev, 0)} with the harness` });
    });
    SQA.keyNav(root, items);
    container.appendChild(root);
  }

  // ------------------------------------------------------------ the shape error
  function shape(ctx, root, r, face, o) {
    const sm = r.summary;
    if (!sm || !face) return;
    const P = pairsOf(r, face);
    if (!P.length) return;
    const SE = sm.shape_error;
    const N = SQA.reportParts && SQA.reportParts.normsFor ? SQA.reportParts.normsFor(r, o.library) : null;
    const med = N && N.stats && N.stats.shape_error && N.stats.shape_error.n ? N.stats.shape_error : null;
    const sec = section(root, "shape-h", "Shape error, explained", h("div", { class: "section-intro" },
      h("p", null, "Even spacing means the white between letters feels the same from pair to pair, whatever their shapes. Kinetikern2 spaces each pair of this font's glyphs that way from the outlines alone. For every pair, the check measures the white between the two glyphs as designed and as the model sets them at the font's own overall tightness (the best fit), and takes their difference — after the font's overall offset is taken out, so being set tight or loose overall costs nothing. That difference is the pair's ", h("b", null, "residual"), ": positive when the font gives the pair more room than the model would, negative when less."),
      h("p", null, h("b", null, `The shape error is the average size of the residuals: ${fmt(SE, 1)} units per 1000 em for this font`),
        med ? ` (the median of ${N.name} is ${fmt(med.median, 1)}).` : ".",
        " 0 would mean every pair as even as the model spaces these shapes. A high value can be a deliberate style (scripts, display faces with a lively rhythm), a convention the model does not know, or pairs that really are uneven. It is not a grade: a shape error raises WARN or FAIL only when it is far outside the library's norms.")));

    // a pair, measured
    const letterPairs = P.filter((e) => isLetter(face.glyphs[e.a]) && isLetter(face.glyphs[e.b]));
    const pool = letterPairs.length ? letterPairs : P;
    const typical = pool.slice().sort((x, y) => Math.abs(Math.abs(x.res) - SE) - Math.abs(Math.abs(y.res) - SE))[0];
    const extreme = pool.slice().sort((x, y) => Math.abs(y.res) - Math.abs(x.res))[0];
    const offset = Number.isFinite(sm.offset) ? sm.offset : SQA.median(P.map((e) => e.dg - e.mg - e.res));
    sec.appendChild(h("h3", null, "One pair, measured"));
    const ex = h("div", { class: "measure-examples" });
    sec.appendChild(ex);
    const k = 92 / (face.top - face.bottom);
    [[typical, "A typical pair: its residual is about the shape error"], [extreme, letterPairs.length ? "The letter pair furthest from the model" : "The pair furthest from the model"]].forEach(([e, title]) => {
      if (!e) return;
      const widthU = Math.max(face.pairPlace(e.a, e.b, "designer").right, face.pairPlace(e.a, e.b, "best").right);
      ex.appendChild(h("figure", { class: "panel measure" },
        h("figcaption", null, h("b", null, title), h("span", { class: "muted" }, ` · ${pairName(face, e)} (${face.glyphs[e.a].name} ${face.glyphs[e.b].name})`)),
        h("div", { class: "measure-row" },
          h("div", null, h("div", { class: "measure-label" }, "As designed"), pairFigure(face, e, "designer", k, { widthU, label: "as designed", measureLabel: true })),
          h("div", null, h("div", { class: "measure-label" }, "As the model sets it"), pairFigure(face, e, "best", k, { widthU, label: "as the model sets it", ghost: "designer", measureLabel: true }))),
        h("p", { class: "equation" },
          h("span", null, `designer's gap ${fmt(e.dg, 0)}`), " − ", h("span", null, `model's gap ${fmt(e.mg, 0)}`), " − ", h("span", null, `overall offset ${fmt(offset, 0)}`), " = ",
          h("b", { class: e.res > 0 ? "pos-text" : e.res < 0 ? "neg-text" : "" }, `residual ${signed(e.res, 0)}`)),
        h("p", { class: "small", style: { margin: 0 } }, e.res > 0 ? "The font gives this pair more room than the model would at its own tightness." : e.res < 0 ? "The font sets this pair tighter than the model would at its own tightness." : "Exactly as the model would.")));
    });
    sec.appendChild(h("p", { class: "caption" }, "The white between the two glyphs is shaded and measured (units per 1000 em); in the model's drawing the designed position of the second glyph is in grey. The overall offset is the font's average difference from the model over all pairs: how much looser or tighter it is set overall."));

    // how the residuals spread
    const res = P.map((e) => e.res);
    const absSorted = res.map(Math.abs).sort((a, b) => a - b);
    let R = Math.max(20, Math.ceil(SQA.quantile(absSorted, 0.98) / 10) * 10);
    const bw = R <= 40 ? 2 : R <= 100 ? 5 : 10;
    const bins = SQA.binValues(res, -R, R, bw);
    bins.bins.forEach((bn) => { bn.cls = bn.x1 <= 0 ? "neg" : bn.x0 >= 0 ? "pos" : ""; });
    const within = (lim) => absSorted.filter((v) => v <= lim).length / absSorted.length;
    sec.appendChild(h("h3", null, `Every pair: ${int(P.length)} residuals`));
    sec.appendChild(h("p", { class: "section-intro" },
      `${fmt(100 * within(10), 0)} % of this font's pairs are within 10 units of the model, ${fmt(100 * (1 - within(40)), 0)} % are 40 or more away. The shape error, ${fmt(SE, 1)}, is their average distance from 0: a few pairs far out weigh as much as many a little off.`));
    const hst = h("div", { class: "stage" });
    sec.appendChild(hst);
    SQA.responsive(hst, (w) => SQA.histogram(hst, {
      width: w, height: 220, bins: bins.bins, xMin: -R, xMax: R,
      under: { n: bins.under, label: `tighter than ${signed(-R, 0)}` }, over: { n: bins.over, label: `looser than ${signed(R, 0)}` },
      xFormat: (v) => signed(v, 0), xLabel: "residual: tighter than the model ← 0 → looser (units per 1000 em)",
      markers: [{ x: -SE, label: `−${fmt(SE, 1)}`, cls: "marker-preset" }, { x: SE, label: `+${fmt(SE, 1)} shape error`, cls: "marker-preset" }],
      tipFor: (bn) => bn.under ? { title: `Tighter than ${signed(-R, 0)}`, rows: [["Pairs", int(bn.n)]] } : bn.over ? { title: `Looser than ${signed(R, 0)}`, rows: [["Pairs", int(bn.n)]] }
        : { title: `Residual ${signed(bn.x0, 0)} to ${signed(bn.x1, 0)}`, rows: [["Pairs", int(bn.n)]] },
      ariaLabel: `Histogram of the ${P.length} pair residuals; the shape error ${fmt(SE, 1)} is their mean absolute value.`,
    }), ctx);

    // which glyphs make it
    const per = new Map();
    const add = (i, side, v) => {
      let c = per.get(i);
      if (!c) { c = { i, left: 0, right: 0, nl: 0, nr: 0, worst: null }; per.set(i, c); }
      c[side] += Math.abs(v);
      if (side === "left") c.nl++; else c.nr++;
    };
    P.forEach((e) => { add(e.a, "right", e.res); add(e.b, "left", e.res); });
    P.forEach((e) => {
      [e.a, e.b].forEach((i) => { const c = per.get(i); if (!c.worst || Math.abs(e.res) > Math.abs(c.worst.res)) c.worst = e; });
    });
    const total = Math.max(1e-9, P.reduce((t, e) => t + Math.abs(e.res), 0) * 2);
    const glyphs = [...per.values()].map((c) => Object.assign(c, { share: (c.left + c.right) / total, mean: (c.left + c.right) / Math.max(1, c.nl + c.nr) }))
      .sort((x, y) => y.share - x.share);
    const topN = glyphs.slice(0, 12);
    const topSet = new Set(topN.map((c) => c.i));
    const rest = P.filter((e) => !topSet.has(e.a) && !topSet.has(e.b));
    const restSE = rest.length ? rest.reduce((t, e) => t + Math.abs(e.res), 0) / rest.length : NaN;
    const even = 1 / glyphs.length;
    sec.appendChild(h("h3", null, "The glyphs that make it"));
    sec.appendChild(h("p", { class: "section-intro" },
      `Each pair's residual belongs to two glyph sides: the right side of its first glyph and the left side of its second. Added up per glyph, ${topN.length} glyphs make ${fmt(100 * topN.reduce((t, c) => t + c.share, 0), 0)} % of this font's shape error (with every glyph equal, ${topN.length} would make ${fmt(100 * topN.length * even, 0)} %).` +
      (Number.isFinite(restSE) ? ` Without their pairs the shape error would be ${fmt(restSE, 1)}.` : "")));
    const cst = h("div", { class: "stage" });
    sec.appendChild(cst);
    sec.appendChild(SQA.legend([{ label: "pairs where it is the left glyph (its right side)", color: "var(--s-kk)" }, { label: "pairs where it is the right glyph (its left side)", color: "color-mix(in srgb, var(--s-kk) 30%, transparent)" }]));
    SQA.responsive(cst, (w) => contributions(cst, w, topN, face, even), ctx);
    SQA.tableToggle(sec, [
      { label: "Glyph", get: (c) => `${face.glyphs[c.i].char} (${face.glyphs[c.i].name})` },
      { label: "Share of the shape error", num: true, get: (c) => `${fmt(100 * c.share, 1)} %` },
      { label: "Mean |residual| of its pairs", num: true, get: (c) => fmt(c.mean, 1) },
      { label: "As the right glyph (left side)", num: true, get: (c) => fmt(c.left / Math.max(1, c.nl), 1) },
      { label: "As the left glyph (right side)", num: true, get: (c) => fmt(c.right / Math.max(1, c.nr), 1) },
      { label: "Furthest pair", get: (c) => (c.worst ? `${pairName(face, c.worst)} ${signed(c.worst.res, 0)}` : "–") }],
      () => glyphs, { caption: "Every scored glyph's share of the shape error", size: "medium", label: `Show every glyph (${int(glyphs.length)})` });

    // the same glyphs, drawn in context
    const resOf = new Map(P.map((e) => [e.a * face.n + e.b, e.res]));
    sec.appendChild(h("h4", { class: "sub-h" }, "Drawn among other letters"));
    sec.appendChild(h("p", { class: "small" }, "The first six, set between n and o (lowercase), H and O (capitals) or n and H (punctuation and symbols), as designed and as the model sets them; the white on each side of the glyph is shaded red where the font is looser than the model, blue where tighter, with the residual."));
    const strips = h("div", { class: "context-strips" });
    sec.appendChild(strips);
    topN.slice(0, 6).forEach((c) => strips.appendChild(contextStrip(face, c, resOf)));

    // sidebearings or kerning?
    const dev = (i, k2) => { const g = face.glyphs[i]; return Array.isArray(g.dev) && Number.isFinite(g.dev[k2]) ? g.dev[k2] : null; };
    const sidesOnly = [], kernOnly = [];
    P.forEach((e) => {
      const r2 = dev(e.a, 1), l2 = dev(e.b, 0);
      if (r2 === null || l2 === null) return;
      sidesOnly.push(e.res - r2 - l2); // what is left with every side where the model puts it
      kernOnly.push(e.res - (e.kd - e.km)); // what is left with the model's kerning
    });
    if (sidesOnly.length > 50) {
      const meanAbsCentred = (v) => { const m = v.reduce((t, x) => t + x, 0) / v.length; return v.reduce((t, x) => t + Math.abs(x - m), 0) / v.length; };
      const A = meanAbsCentred(sidesOnly), B = meanAbsCentred(kernOnly);
      sec.appendChild(h("h3", null, "Sidebearings or kerning?"));
      const lead = A < B
        ? "Most of it lies in the sidebearings: fix the sides above and the pairs follow."
        : "Most of it lies in the kerning: the sides are close to the model's, the pairs differ.";
      sec.appendChild(h("p", { class: "section-intro" },
        `A residual is the two sides' differences plus the kerning difference. If every glyph side were where the model puts it (the font's kerning as it is), the shape error would be ${fmt(A, 1)}; if the font kerned as the model does (its sidebearings as they are), ${fmt(B, 1)}. Now: ${fmt(SE, 1)}. ${lead}`));
      const bst = h("div", { class: "stage", style: { maxWidth: "620px" } });
      sec.appendChild(bst);
      const rows = [
        { label: "Now", value: SE, valueText: fmt(SE, 1), cls: "", content: () => ({ title: "Shape error now", rows: [["Shape error", fmt(SE, 1)]] }) },
        { label: "Sides fixed", value: A, valueText: fmt(A, 1), cls: "", content: () => ({ title: "Every side where the model puts it", rows: [["Shape error", fmt(A, 1)]], note: "What is left: the kerning differences." }) },
        { label: "Kerning fixed", value: B, valueText: fmt(B, 1), cls: "", content: () => ({ title: "Kerned as the model kerns", rows: [["Shape error", fmt(B, 1)]], note: "What is left: the sidebearing differences." }) },
      ];
      SQA.responsive(bst, (w) => SQA.hbars(bst, rows, { width: Math.min(w, 620), labelW: 104, ariaLabel: `Shape error now ${fmt(SE, 1)}; with the sides fixed ${fmt(A, 1)}; with the kerning fixed ${fmt(B, 1)}` }), ctx);
    }
  }

  function contributions(container, W, rows, face, even) {
    clear(container);
    const rowH = 34, top = 6, labelW = 150, valueW = 150;
    const H = top + rows.length * rowH + 10;
    const max = Math.max(...rows.map((c) => c.share), even * 1.5);
    const x0 = labelW, x1 = W - valueW;
    const X = (v) => x0 + (v / max) * (x1 - x0);
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "chart", role: "img", "aria-label": "The glyphs that make most of the shape error, with their share. Use the arrow keys to read each." });
    const gk = 26 / (face.top - face.bottom);
    const items = [];
    root.appendChild(s("line", { x1: X(even), x2: X(even), y1: 0, y2: H - 6, class: "gridline" }));
    root.appendChild(s("text", { x: X(even) + 4, y: H - 2, class: "tick" }, "every glyph equal"));
    rows.forEach((c, j) => {
      const g = face.glyphs[c.i];
      const y = top + j * rowH;
      // the glyph itself, drawn
      const gw = face.ink(c.i) * gk;
      root.appendChild(face.use(c.i, -g.bbox[0] + (26 / gk - face.ink(c.i)) / 2, gk, 6, y + face.top * gk + 3, "glyph-fill"));
      root.appendChild(s("text", { x: 6 + Math.max(30, gw + 6), y: y + rowH / 2 + 4, class: "tick" }, g.name.length > 15 ? g.name.slice(0, 14) + "…" : g.name));
      const shareR = c.left + c.right > 0 ? (c.right / (c.left + c.right)) * c.share : 0, shareL = c.share - shareR;
      const xr = X(shareR);
      root.appendChild(s("path", { d: SQA.barPath(x0, y + 8, xr - x0, rowH - 16, 0), class: "contrib-right" }));
      root.appendChild(s("path", { d: SQA.barPath(xr, y + 8, X(shareR + shareL) - xr, rowH - 16, 3), class: "contrib-left" }));
      root.appendChild(s("text", { x: X(c.share) + 8, y: y + rowH / 2 + 4 }, `${fmt(100 * c.share, 1)} % · mean ${fmt(c.mean, 0)}`));
      const content = () => ({
        title: `${g.char} — ${g.name}`,
        rows: [["Share of the shape error", `${fmt(100 * c.share, 1)} %`], ["Mean |residual| of its pairs", fmt(c.mean, 1)], ["As the left glyph (its right side)", fmt(c.right / Math.max(1, c.nr), 1)], ["As the right glyph (its left side)", fmt(c.left / Math.max(1, c.nl), 1)]].concat(c.worst ? [["Furthest pair", `${pairName(face, c.worst)} ${signed(c.worst.res, 0)}`]] : []),
      });
      const hit = s("rect", { x: 0, y, width: W, height: rowH, class: "hit" });
      hit.addEventListener("pointermove", (ev) => tip.show(content(), ev.clientX, ev.clientY));
      hit.addEventListener("pointerleave", () => tip.hide());
      root.appendChild(hit);
      items.push({ node: hit, content, label: `${g.char}: ${fmt(100 * c.share, 1)} % of the shape error` });
    });
    SQA.keyNav(root, items);
    container.appendChild(root);
  }

  /** A glyph between neighbours, as designed and as the model sets it, with the white on either side shaded by its residual. */
  function contextStrip(face, c, resOf) {
    const g = face.glyphs[c.i];
    const grp = SQA.groupOf(g);
    const [p, q] = grp === "lower" ? ["n", "o"] : grp === "upper" ? ["H", "O"] : ["n", "H"];
    const text = `${p}${g.char}${p} ${q}${g.char}${q}`;
    const k = 46 / (face.top - face.bottom);
    const wrap = h("figure", { class: "panel context-strip" }, h("figcaption", null, h("b", null, g.char), ` ${g.name} · ${fmt(100 * c.share, 1)} % of the shape error`));
    const lines = [["designer", "As designed"], ["best", "Model"]];
    const L = lines.map(([sp]) => face.layout(text, sp));
    const Wu = Math.max(...L.map((x) => x.width)) + 0.1 * face.upm;
    lines.forEach(([sp, label], li) => {
      const lay = L[li];
      const H = Math.ceil((face.top - face.bottom) * k + 22);
      const W = Math.ceil(Wu * k);
      const baseY = face.top * k + 2;
      const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${text} ${label.toLowerCase()}` });
      const labels = [];
      lay.items.forEach((it, idx) => {
        const prev = idx > 0 && lay.items[idx - 1].ti === it.ti - 1 ? lay.items[idx - 1] : null;
        if (prev && (it.i === c.i || prev.i === c.i)) {
          const r2 = resOf.get(prev.i * face.n + it.i);
          const xa = Math.min(prev.inkR, it.inkL) * k, xb = Math.max(prev.inkR, it.inkL) * k;
          if (r2 !== undefined) {
            svg.appendChild(s("rect", { x: xa, y: 1, width: Math.max(1.5, xb - xa), height: (face.top - face.bottom) * k + 2, class: "gap-shade " + (r2 > 2 ? "looser" : r2 < -2 ? "tighter" : "even") }));
            if (li === 0) labels.push({ x: (xa + xb) / 2, text: signed(r2, 0) });
          }
        }
      });
      // the residuals under their gaps, kept apart
      for (let pass = 0; pass < 4; pass++) {
        for (let j = 1; j < labels.length; j++) {
          const need = 7 * (labels[j - 1].text.length + labels[j].text.length) / 2 + 4 - (labels[j].x - labels[j - 1].x);
          if (need > 0) { labels[j - 1].x -= need / 2; labels[j].x += need / 2; }
        }
      }
      labels.forEach((l) => svg.appendChild(s("text", { x: Math.max(10, Math.min(W - 10, l.x)), y: H - 3, "text-anchor": "middle", class: "dim-label" }, l.text)));
      lay.items.forEach((it) => svg.appendChild(face.use(it.i, it.tx, k, 0, baseY, it.i === c.i ? "glyph-accent" : "glyph-fill")));
      wrap.appendChild(h("div", { class: "strip-line" }, h("span", { class: "measure-label" }, label), svg));
    });
    return wrap;
  }

  SQA.explain = { harness, shape, pairsOf };
})();
