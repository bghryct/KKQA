/*
 * Spacing QA — two sections of a font's report: the settings the check used
 * (those that suit a font of this kind — the plugin's, with Spacing QA's
 * additions: italics along their italic angle, Keep joins for a connected
 * script, tabular figures at their width) with what each other setting gives; and, for a connected script, the join
 * checker: every a–z pair set inside a word the way a browser sets it, where
 * the strokes meet, which joins are broken in the font itself, and what each
 * join setting does to them.
 *
 * Units: every number shown in units per 1000 em; proofs in font units.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, s, fmt, signed, int, tip } = SQA;

  function section(root, id, title, intro) {
    const sec = h("section", { "aria-labelledby": id });
    sec.appendChild(h("h2", { id, tabindex: "-1" }, title));
    if (intro) sec.appendChild(typeof intro === "string" ? h("p", { class: "section-intro" }, intro) : intro);
    root.appendChild(sec);
    return sec;
  }
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const JOIN_LABEL = { keep: "Keep joins", space: "Space joined letters", off: "No join mode" };
  const SETTING_LABEL = { slant: "Italic angle", joins: "Connected script", harness: "Designer harness", categories: "Figures, punctuation, symbols" };
  const CAT_LABEL = { figures: "figures", punctuation: "punctuation", symbols: "symbols" };

  /** What the check used, in words. */
  function usedValue(st, setting) {
    if (setting === "slant") return st.slant ? `along ${fmt(Math.abs(st.slant), 1)}°${st.slant_from === "declared" ? " (declared)" : st.slant_from === "measured" ? " (measured)" : ""}` : "upright";
    if (setting === "joins") return JOIN_LABEL[st.joins] || st.joins;
    if (setting === "harness") return st.harness ? "on" : "off";
    if (setting === "categories") return "the letters' Looseness";
    return "";
  }
  function variantValue(v) {
    if (v.setting === "slant") return v.value === "upright" ? "upright" : `along the ${v.value.replace("measured ", "")} slant its stems show`;
    if (v.setting === "joins") return JOIN_LABEL[v.value] || v.value;
    if (v.setting === "harness") return v.value;
    if (v.setting === "categories") {
      const parts = Object.entries(v.offsets || {}).map(([k, x]) => `${CAT_LABEL[k] || k} ${signed(x, 2)}`);
      return `each at its own Looseness${parts.length ? ` (${parts.join(", ")})` : ""}`;
    }
    return v.value;
  }

  // ---------------------------------------------------------------- settings
  function settings(ctx, root, r, face, o) {
    const st = r.settings;
    const sm = r.summary;
    if (!st || !sm) return;
    const variants = Array.isArray(st.variants) ? st.variants : [];
    const used = [];
    if (st.slant) used.push(st.slant_from === "measured"
      ? `measured along the ${fmt(Math.abs(st.slant), 1)}° slant its stems show (it declares no italic angle, and fits clearly better that way: Spacing QA's own rule, as the plugin measures such a design as drawn)`
      : `measured along its ${fmt(Math.abs(st.slant), 1)}° italic angle (sheared upright about half the x-height, as the plugin does)`);
    if (st.joins) used.push(`${st.joins === "keep" ? "its joins kept as drawn (Keep joins, the plugin's default for a connected script)" : `connected-script mode “${JOIN_LABEL[st.joins] || st.joins}”`}`);
    if (st.fit === "joins") used.push(`the Looseness matched to its joined letters (${signed(sm.best_looseness, 2)}), as the plugin does with Keep joins, so the rest of the font is measured at the script's own rhythm rather than pulled by its swash capitals and punctuation`);
    if (st.tabular) used.push("its tabular figures kept at their width");
    used.push(st.harness ? "the designer harness on" : "the bare model, without the designer harness");
    const sec = section(root, "settings-h", "Settings",
      h("p", { class: "section-intro" },
        "Kinetikern2 was set up for a font of this kind the way the plugin sets it up, so that what the check finds is about the font, not about a way of measuring that does not suit it: ",
        used.join("; "), ". ",
        "The plugin's own defaults differ in two places: its designer harness is off until it is switched on, and it writes class kerning with a 5-unit threshold and at most 30,000 entries, where the check compares every glyph pair with no threshold and no budget. Two rules are Spacing QA's own: a design that leans without declaring an italic angle is measured along the slant its stems show where that fits clearly better, and a script whose letters join only as set inside words (strokes that meet flush, contextual alternates) is found by the join checker. ",
        variants.length ? `Each setting was also tried the other way. Every row is compared on the same pairs, at its own ${st.fit === "joins" ? "Looseness (matched to the joined letters where the joins are kept, else fitted)" : "best-fit Looseness"}.` : ""));
    if (!variants.length) return;
    const tbl = h("table", { class: "both-ways settings-table" });
    tbl.appendChild(h("caption", { class: "sr-only" }, "The check with each setting changed, on the same pairs"));
    const anyJoins = variants.some((v) => v.joins);
    const cols = ["Setting", "Value", "Looseness", "Shape error", "Sidebearings", "Kerned pairs", "Kerning r"].concat(anyJoins ? ["Joins kept"] : []);
    tbl.appendChild(h("thead", null, h("tr", null, cols.map((c, i) => h("th", { scope: "col", class: i >= 2 ? "num" : "" }, c)))));
    const tb = h("tbody");
    const joinsCell = (e) => e ? h("td", { class: "num" }, `${int(e.kept)} of ${int(e.joins)}`, e.broken ? h("small", null, `${int(e.broken)} break${e.crossings ? ` · ${int(e.crossings)} cross` : ""}`) : (e.crossings ? h("small", null, `${int(e.crossings)} cross`) : null)) : h("td", { class: "num" }, "–");
    const base = { best_looseness: sm.best_looseness, shape_error: sm.shape_error, sidebearing_error: sm.sidebearing_error, kerned_error: sm.kerned_error, kern_r: sm.kern_r, joins: r.joins && r.joins.effect };
    tb.appendChild(h("tr", { class: "row-used" },
      h("th", { scope: "row" }, "This check"),
      h("td", null, "the settings above"),
      h("td", { class: "num" }, signed(base.best_looseness, 2)),
      h("td", { class: "num" }, fmt(base.shape_error, 1)),
      h("td", { class: "num" }, fmt(base.sidebearing_error, 1)),
      h("td", { class: "num" }, num(base.kerned_error) ? fmt(base.kerned_error, 1) : "–"),
      h("td", { class: "num" }, num(base.kern_r) ? fmt(base.kern_r, 2) : "–"),
      anyJoins ? joinsCell(base.joins) : null));
    const change = (x, y, dec, lowerBetter) => {
      if (!num(x) || !num(y)) return null;
      const d = y - x;
      if (Math.abs(d) < Math.pow(10, -dec) / 2) return null;
      const better = lowerBetter ? d < 0 : d > 0;
      return h("span", { class: "chg " + (better ? "chg-better" : "chg-worse") }, signed(d, dec));
    };
    variants.forEach((v) => {
      tb.appendChild(h("tr", null,
        h("th", { scope: "row" }, SETTING_LABEL[v.setting] || v.setting, h("small", null, `used: ${usedValue(st, v.setting)}`)),
        h("td", null, variantValue(v)),
        h("td", { class: "num" }, signed(v.best_looseness, 2)),
        h("td", { class: "num" }, fmt(v.shape_error, 1), change(base.shape_error, v.shape_error, 1, true)),
        h("td", { class: "num" }, fmt(v.sidebearing_error, 1), change(base.sidebearing_error, v.sidebearing_error, 1, true)),
        h("td", { class: "num" }, num(v.kerned_error) ? fmt(v.kerned_error, 1) : "–"),
        h("td", { class: "num" }, num(v.kern_r) ? fmt(v.kern_r, 2) : "–"),
        anyJoins ? joinsCell(v.joins) : null));
    });
    tbl.appendChild(tb);
    sec.appendChild(h("div", { class: "table-wrap auto" }, tbl));
    // in words
    const lines = [];
    variants.forEach((v) => {
      const d = v.shape_error - sm.shape_error;
      const how = Math.abs(d) < 0.05 ? "the same" : d > 0 ? `${fmt(d, 1)} less even` : `${fmt(-d, 1)} more even`;
      if (v.setting === "slant" && v.value === "upright") lines.push(`Measured upright, this ${st.slant_from === "measured" ? "design" : "italic"} would look ${how} (shape error ${fmt(v.shape_error, 1)} against ${fmt(sm.shape_error, 1)}) and fit at Looseness ${signed(v.best_looseness, 2)}.`);
      else if (v.setting === "slant") lines.push(`Its stems lean but it declares no italic angle of 3° or more; measured along that slant it would look ${how}, not clearly better, so it was measured upright, as drawn — the way the plugin measures it.`);
      else if (v.setting === "joins" && v.joins) lines.push(`${JOIN_LABEL[v.value] || v.value}: ${v.joins.broken ? `${int(v.joins.broken)} of its ${int(v.joins.joins)} a–z joins would break` : "every join would hold"}${v.joins.crossings ? `, ${int(v.joins.crossings)} pairs would cross or collide` : ""}; the other pairs would look ${how}.`);
      else if (v.setting === "harness") lines.push(`Without the designer harness the model is ${how} to this font's spacing (the harness's own section has the detail).`);
      else if (v.setting === "categories") {
        const off = Object.entries(v.offsets || {}).filter(([, x]) => Math.abs(x) >= 0.1).map(([k, x]) => `its ${CAT_LABEL[k] || k} ${x > 0 ? "looser" : "tighter"} (${signed(x, 2)})`);
        lines.push(off.length ? `By category the font sets ${off.join(", ")} than its letters, by the model; spaced that way the pairs would look ${how}.` : `Its figures, punctuation and symbols sit at about the letters' own tightness.`);
      }
    });
    if (lines.length) sec.appendChild(h("ul", { class: "settings-notes" }, lines.map((t) => h("li", null, t))));
  }

  // ---------------------------------------------------------------- joins
  /** The a–z spacing of a join variant over the face's designed spacing. */
  function variantSpacing(face, az) {
    const idx = (ch) => (ch >= "a" && ch <= "z" ? ch.charCodeAt(0) - 97 : -1);
    const kern = new Map();
    (az && az.kern || []).forEach(([a, b, v]) => kern.set(a * 26 + b, v));
    return {
      sides(i) {
        const k = idx(face.glyphs[i].char);
        return k >= 0 && az && az.sides[k] ? az.sides[k] : [face.lsb(i, "designer"), face.rsb(i, "designer")];
      },
      kern(a, b) {
        const ka = idx(face.glyphs[a].char), kb = idx(face.glyphs[b].char);
        return ka >= 0 && kb >= 0 && az ? (kern.get(ka * 26 + kb) || 0) : face.kerning(a, b, "designer");
      },
    };
  }
  // more kerning than this (units per 1000 em) does not fix a broken join (report.rs KERN_FIX_MAX)
  const KERN_FIX_MAX = 100;
  const designed = (face) => ({ sides: (i) => [face.lsb(i, "designer"), face.rsb(i, "designer")], kern: (a, b) => face.kerning(a, b, "designer") });

  /** A word drawn in the font with one spacing; the pair (positions 1, 2) in ink, the rest ghosted. */
  function proof(face, word, sp, k, label, info) {
    const items = [];
    let x = 0, prev = -1;
    for (const ch of word) {
      const i = face.byChar.has(ch) ? face.byChar.get(ch) : -1;
      if (i < 0 || !face.has(i, "designer")) return null;
      if (prev >= 0) x += sp.kern(prev, i);
      const [lsb, rsb] = sp.sides(i);
      const b = face.glyphs[i].bbox;
      items.push({ i, tx: x + lsb - b[0] });
      x += lsb + (b[1] - b[0]) + rsb;
      prev = i;
    }
    const pad = 6;
    const H = Math.ceil((face.top - face.bottom) * k + 2 * pad);
    const W = Math.ceil(x * k + 2 * pad);
    const baseY = face.top * k + pad;
    const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${word}: ${label}` });
    items.forEach((it, n) => svg.appendChild(face.use(it.i, it.tx, k, pad, baseY, n === 1 || n === 2 ? "glyph-fill" : "glyph-ghost")));
    const box = h("figure", { class: "proof" }, svg, h("figcaption", null, label));
    if (info) {
      box.addEventListener("pointermove", (e) => tip.show(info, e.clientX, e.clientY));
      box.addEventListener("pointerleave", () => tip.hide());
    }
    return box;
  }

  function proofRow(sec, face, title, list, make, limit) {
    if (!list || !list.length) return;
    sec.appendChild(h("h3", null, title));
    const row = h("div", { class: "proofs" });
    list.slice(0, limit || 16).forEach((p) => { const el = make(p); if (el) row.appendChild(el); });
    sec.appendChild(row);
    if (list.length > (limit || 16)) sec.appendChild(h("p", { class: "small" }, `and ${int(list.length - (limit || 16))} more.`));
  }

  function joins(ctx, root, r, face, o) {
    const j = r.joins, st = r.settings;
    if (!j || !face) return;
    const mode = st && st.joins;
    // found by the detector (outlines), else by the join checker on the
    // shaped pairs: through contextual forms only where shaping set them
    const how = st && st.connected_by && st.connected_by.includes("outlines")
      ? "its letters overlap where they join, as spaced and kerned"
      : j.substituted ? "its letters join as set inside words, through contextual alternates and connectors"
      : "its letters touch as set inside words";
    const sec = section(root, "joins-h", "Joins",
      h("p", { class: "section-intro" },
          `A connected script: ${how}. `,
          mode === "keep"
            ? "Kinetikern2 keeps its joins as drawn — the plugin's default for a connected script: every side that joins keeps its sidebearing, and every pair of two joining sides the font's kerning. The model spaces everything else; the scores leave the kept joins out and cover the capitals, punctuation and symbols and the letters next to them (a letter next to a period) — figures are spaced, never scored — and the join checker judges the joins. "
            : `Checked with “${JOIN_LABEL[mode] || mode}”. `,
          "The checker sets every pair of a–z inside a word (n + pair + n) the way a browser does, contextual alternates and connectors included, and finds where the strokes meet. Two letters whose facing sides each join at least half the glyphs they are set next to, and that do not meet here, make a broken join: 3 units per 1000 em apart or more (WARN); closer, they nearly touch. A hand where 1 in 20 such pairs or more do not meet joins partly by design: there only pairs whose sides both join at least three in four of their partners count as broken, and its other non-joins are listed apart, as style."));
    const stats = h("div", { class: "stats" });
    const tile = (value, label, delta, cls) => stats.appendChild(h("div", { class: "stat" + (cls ? " " + cls : "") }, h("div", { class: "stat-value" }, value), h("div", { class: "stat-label" }, label), delta ? h("div", { class: "stat-delta" }, delta) : null));
    tile(int(j.joins), `a–z pairs join, of ${int(j.pairs)} measured`, `${int(j.pen_lifts)} pen lifts${j.ligated ? ` · ${int(j.ligated)} ligatures` : ""}${j.substituted ? ` · ${int(j.substituted)} set with contextual forms` : ""}`);
    tile(int((j.broken || []).length), "joins broken in the font", "two joining letters whose strokes do not meet (3 units per 1000 em apart or more)", (j.broken || []).length ? "stat-warn" : "");
    if ((j.partial || []).length) tile(int(j.partial.length), "not joined: a partly connected hand", `${fmt(j.exceptions, 0)} % of the pairs of its joining letters do not meet: style, not flagged`);
    tile(int((j.near || []).length), "nearly touch", "a hairline gap under 3 units per 1000 em");
    tile(int((j.fragile || []).length), "fragile joins", "less than 5 units per 1000 em of room to open");
    tile(int((j.crossings || []).length), "joins that cross", "white neither letter has, or a changed counter");
    if (num(j.open_median)) tile(fmt(j.open_median, 1), "median room to open", "how far a join can open before it breaks");
    if (j.effect) tile(`${int(j.effect.kept)} / ${int(j.effect.joins)}`, "joins kept by the check's spacing", mode === "keep" ? `${int(j.kept_sides)} glyph sides kept as drawn` : "");
    sec.appendChild(stats);

    // proofs at an x-height of about 46 px (scripts have small ones)
    const xi = face.byChar.get("x");
    const xh = xi !== undefined && face.glyphs[xi].bbox[3] > 0 ? face.glyphs[xi].bbox[3] : 0.5 * face.upm;
    const k = Math.max(48 / face.upm, Math.min(46 / xh, 150 / face.upm));
    const des = designed(face);
    const pairInfo = (p, kind) => {
      const rows = [["Glyphs set", p.glyphs.filter(Boolean).join(" + ")]];
      if (num(p.gap)) rows.push(["Gap", `${fmt(p.gap, 1)} units per 1000 em`]);
      if (num(p.fix)) rows.push(["Kerning that joins it", p.fix_crosses ? `${signed(p.fix, 0)}, but that kern makes the strokes cross: a longer stroke or an alternate joins it`
        : p.too_far || Math.abs(p.fix) > KERN_FIX_MAX ? `${signed(p.fix, 0)}: too far for kerning (a longer stroke or an alternate joins it)` : signed(p.fix, 0)]);
      if (num(p.open)) rows.push(["Room to open", fmt(p.open, 1)]);
      if (num(p.close)) rows.push(["Room to close", p.close >= 99.95 ? "100 or more" : fmt(p.close, 1)]);
      if (num(p.height)) rows.push(["Contact height", fmt(p.height, 0)]);
      return { title: `“${p.pair}” — ${kind}`, rows, note: "Drawn with the letters' default forms and the designer's spacing; the measure is of the forms a browser sets inside a word." };
    };
    proofRow(sec, face, "Broken in the font", j.broken, (p) => proof(face, `n${p.pair}n`, des, k, `${p.pair} · ${fmt(p.gap, 0)} apart${p.fix_crosses ? " · kern crosses strokes" : num(p.fix) && (p.too_far || Math.abs(p.fix) > KERN_FIX_MAX) ? " · too far to kern" : num(p.fix) ? ` · kern ${signed(p.fix, 0)}` : ""}`, pairInfo(p, "broken")), 24);
    proofRow(sec, face, "Partly connected: not joined here", j.partial, (p) => proof(face, `n${p.pair}n`, des, k, `${p.pair} · ${fmt(p.gap, 0)} apart`, pairInfo(p, "not joined (partly connected hand)")), 12);
    proofRow(sec, face, "Nearly touching", j.near, (p) => proof(face, `n${p.pair}n`, des, k, `${p.pair} · ${fmt(p.gap, 1)}`, pairInfo(p, "nearly touching")), 12);
    proofRow(sec, face, "Fragile: little room to open", j.fragile, (p) => proof(face, `n${p.pair}n`, des, k, `${p.pair} · room ${fmt(p.open, 1)}`, pairInfo(p, "fragile")), 12);
    proofRow(sec, face, "Crossing strokes", j.crossings, (p) => proof(face, `n${p.pair}n`, des, k, p.pair, pairInfo(p, "strokes cross")), 12);

    // the other join settings, drawn
    const vars = ((st && st.variants) || []).filter((v) => v.setting === "joins" && v.joins);
    vars.forEach((v) => {
      const e = v.joins;
      if (!e.broken) return;
      const sp = variantSpacing(face, v.az);
      sec.appendChild(h("h3", null, `With “${JOIN_LABEL[v.value] || v.value}”: ${int(e.broken)} of ${int(e.joins)} joins break`));
      if (e.sides && e.sides.length) {
        sec.appendChild(h("p", { class: "small" }, "The sides that break the most, and how far the spacing moves them (+ away from the neighbour): ",
          e.sides.slice(0, 8).map((x) => `${x.side} ${signed(x.delta, 0)} → ${int(x.breaks)}`).join(" · "), "."));
      }
      const row = h("div", { class: "proofs" });
      (e.pairs || []).slice(0, 10).forEach(([pair, d]) => {
        const pd = proof(face, `n${pair}n`, des, k, `${pair} as drawn`);
        const pv = v.az ? proof(face, `n${pair}n`, sp, k, `${pair} · ${signed(d, 0)}`) : null;
        if (pd) row.appendChild(h("div", { class: "proof-pair" }, pd, pv));
      });
      sec.appendChild(row);
    });

    // drawing advice
    if (j.advice && j.advice.length && mode === "keep") {
      sec.appendChild(h("h3", null, "Drawing advice"));
      const off = j.advice_offset || 0;
      sec.appendChild(h("p", { class: "small" },
        `The joining sides keep the designer's sidebearings. Here is what the model would give each body instead, relative to the font's own body rhythm: negative, the body sits further from its neighbour than the font's other letters (shorten the stroke that reaches out and the advance follows); positive, closer. Overall the model would set the bodies ${fmt(Math.abs(off), 0)} units per 1000 em ${off < 0 ? "closer together" : "further apart"} than the font does — a matter of style in a script, not an error. Advice, not edits.`));
      const tbl = h("table", { class: "both-ways advice" });
      tbl.appendChild(h("thead", null, h("tr", null, h("th", { scope: "col" }, "Side"), h("th", { scope: "col", class: "num" }, "Model wants"))));
      const tb = h("tbody");
      j.advice.filter((a) => Math.abs(a.value) >= 5).slice(0, 16).forEach((a) => tb.appendChild(h("tr", null, h("th", { scope: "row" }, a.side), h("td", { class: "num" }, signed(a.value, 0)))));
      if (tb.children.length) {
        tbl.appendChild(tb);
        sec.appendChild(h("div", { class: "table-wrap auto" }, tbl));
      } else sec.appendChild(h("p", { class: "small" }, "Every joining body sits within 5 units of the font's own rhythm."));
    }
  }

  SQA.settings = { settings, joins };
})();
