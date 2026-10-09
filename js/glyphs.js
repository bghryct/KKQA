/*
 * Spacing QA — the report's glyphs as a small font: text layout under each
 * spacing (designer, tight, standard, loose, best, and the bare model — the
 * best fit without the designer harness), pair gaps, and drawing through
 * shared <defs> so every outline is in the page once.
 *
 * Geometry is in font units with y up (paths are drawn with scale(s, −s)).
 * A glyph sits at pen position x with its ink starting at x + lsb, so it is
 * translated by x + lsb − bbox[0]; its advance is lsb + ink width + rsb.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { s } = SQA;
  const SPACINGS = ["designer", "tight", "standard", "loose", "best", "bare"];
  const SPACING_LABEL = { designer: "As designed", tight: "Tight", standard: "Standard", loose: "Loose", best: "Best fit", bare: "Best fit, bare model" };
  const finite = (v) => typeof v === "number" && Number.isFinite(v);
  let faceIds = 0;

  class Face {
    constructor(report) {
      const d = report.detail || {};
      this.id = "f" + ++faceIds;
      this.upm = report.font && report.font.upm > 0 ? report.font.upm : 1000;
      this.per = 1000 / this.upm;
      // a CJK font: its punctuation of ambiguous East Asian width is not scored
      this.cjk = !!(report.font && report.font.cjk);
      this.glyphs = d.glyphs || [];
      this.n = this.glyphs.length;
      this.byChar = new Map();
      this.byName = new Map();
      this.ok = this.glyphs.map((g) => Array.isArray(g.bbox) && g.bbox.length === 4 && g.bbox.every(finite) && g.bbox[1] >= g.bbox[0] && typeof g.d === "string");
      this.glyphs.forEach((g, i) => {
        if (!this.ok[i]) return;
        this.byChar.set(g.char, i);
        this.byName.set(g.name, i);
      });
      this.kern = {};
      SPACINGS.forEach((sp) => {
        // the bare model's kerning is the best fit's except where the harness corrects a pair
        const m = sp === "bare" ? new Map(this.kern.best) : new Map();
        const list = (d.kerning && d.kerning[sp]) || [];
        for (const e of list) if (Array.isArray(e) && e.length === 3) m.set(e[0] * this.n + e[1], e[2]);
        this.kern[sp] = m;
      });
      /** The spacings this report has (older reports have no bare model). */
      this.spacings = SPACINGS.filter((sp) => this.glyphs.some((g, i) => this.ok[i] && Array.isArray(g[sp])));
      let top = -Infinity, bottom = Infinity;
      this.glyphs.forEach((g, i) => { if (this.ok[i]) { top = Math.max(top, g.bbox[3]); bottom = Math.min(bottom, g.bbox[2]); } });
      this.top = finite(top) ? top : 0.8 * this.upm;
      this.bottom = finite(bottom) ? bottom : -0.2 * this.upm;
      const H = this.byName.get("H");
      this.capHeight = H !== undefined ? this.glyphs[H].bbox[3] : 0.7 * this.upm;
      this.space = 0.25 * this.upm;
    }
    has(i, sp) {
      if (!this.ok[i]) return false;
      const v = this.glyphs[i][sp];
      return Array.isArray(v) && finite(v[0]) && finite(v[1]);
    }
    ink(i) { const b = this.glyphs[i].bbox; return b[1] - b[0]; }
    lsb(i, sp) { return this.glyphs[i][sp][0]; }
    rsb(i, sp) { return this.glyphs[i][sp][1]; }
    advance(i, sp) { return this.lsb(i, sp) + this.ink(i) + this.rsb(i, sp); }
    kerning(a, b, sp) { return this.kern[sp].get(a * this.n + b) || 0; }
    /** The white between the ink of a and b: rsb(a) + lsb(b) + kerning (font units). */
    gap(a, b, sp) { return this.rsb(a, sp) + this.lsb(b, sp) + this.kerning(a, b, sp); }
    /** Lays out text: items [{i, ch, ti (index in the text), tx (translate x), inkL, inkR}], width, skipped chars. */
    layout(text, sp) {
      const items = [];
      const skipped = [];
      let x = 0, prev = -1, ti = -1;
      for (const ch of text) {
        ti++;
        if (ch === " " || ch === "\u00a0") { x += this.space; prev = -1; continue; }
        const i = this.byChar.has(ch) ? this.byChar.get(ch) : -1;
        if (i < 0 || !this.has(i, sp)) { if (!skipped.includes(ch)) skipped.push(ch); continue; }
        if (prev >= 0) x += this.kerning(prev, i, sp);
        const lsb = this.lsb(i, sp), b = this.glyphs[i].bbox;
        const inkL = x + lsb;
        items.push({ i, ch, ti, tx: inkL - b[0], inkL, inkR: inkL + (b[1] - b[0]) });
        x += this.advance(i, sp);
        prev = i;
      }
      return { items, width: x, skipped };
    }
    /** The id of a glyph's path in the shared defs. */
    ref(i) { return `${this.id}-g${i}`; }
    /** A hidden svg with every outline once; <use> refers to it. */
    defs() {
      const root = s("svg", { width: 0, height: 0, "aria-hidden": "true", focusable: "false", style: "position:absolute;width:0;height:0;overflow:hidden" });
      const defs = s("defs");
      this.glyphs.forEach((g, i) => { if (this.ok[i] && g.d) defs.appendChild(s("path", { id: this.ref(i), d: g.d })); });
      root.appendChild(defs);
      return root;
    }
    /** A <use> of glyph i at translate x (font units) on a baseline at y (px), scale k (px per unit). */
    use(i, x, k, ox, baseY, cls, extra) {
      const a = { href: "#" + this.ref(i), transform: `translate(${(ox + x * k).toFixed(2)} ${baseY.toFixed(2)}) scale(${k.toFixed(5)} ${(-k).toFixed(5)})`, class: cls || "glyph-fill" };
      if (extra) Object.assign(a, extra);
      return s("use", a);
    }
    /** Pair geometry under one spacing: translate x of a and b with a's ink at x = 0. */
    pairPlace(a, b, sp) {
      const ba = this.glyphs[a].bbox, bb = this.glyphs[b].bbox;
      const gap = this.gap(a, b, sp);
      const inkLb = this.ink(a) + gap;
      return { ta: -ba[0], tb: inkLb - bb[0], right: inkLb + this.ink(b), gap };
    }
  }

  /** Groups of the scored glyphs (by the engine's rhythm group, else by character). */
  function groupOf(g) {
    if (g.group === 1) return "upper";
    if (g.group === 2) return "lower";
    if (g.group === 3) return "figure";
    if (/^[A-Z]$/.test(g.char)) return "upper";
    if (/^[a-z]$/.test(g.char)) return "lower";
    if (/^[0-9]$/.test(g.char)) return "figure";
    return "punct";
  }

  Object.assign(SQA, { Face, SPACINGS, SPACING_LABEL, groupOf });
})();
