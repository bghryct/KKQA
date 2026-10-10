/*
 * Spacing QA — chart kit. Responsive SVG charts whose viewBox width is the
 * container's width (text keeps its size on phones), a hover and keyboard
 * layer on every chart, and a table view under each.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, s, clear, fmt, tip } = SQA;

  /** Draws now and again when the container's width changes. Returns {redraw}. */
  function responsive(container, draw, ctx) {
    let lastW = 0, timer = null;
    const run = (force) => {
      const w = Math.round(container.clientWidth);
      if (!w || (!force && Math.abs(w - lastW) < 8)) return;
      lastW = w;
      draw(w);
    };
    run();
    if (typeof ResizeObserver === "function") {
      const ro = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(() => run(false), lastW ? 120 : 0); });
      ro.observe(container);
      if (ctx) ctx.onCleanup(() => { ro.disconnect(); clearTimeout(timer); });
    }
    return { redraw() { run(true); } };
  }

  function niceStep(span, count) {
    const step0 = span / Math.max(1, count);
    const mag = Math.pow(10, Math.floor(Math.log10(step0 || 1)));
    return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((st) => span / st <= count) || 10 * mag;
  }
  function niceTicks(lo, hi, count) {
    const span = hi - lo || 1;
    const step = niceStep(span, count);
    const out = [];
    for (let t = Math.ceil(lo / step - 1e-9) * step; t <= hi + 1e-9; t += step) out.push(+t.toFixed(10));
    return out;
  }
  /** A column with a rounded top (the data end) and a square base. */
  function colPath(x, y, w, hgt, r) {
    if (hgt <= 0) return "";
    const rr = Math.min(r, w / 2, hgt);
    return `M${x},${y + hgt}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + hgt}Z`;
  }
  /** A horizontal bar from x (baseline) of width w (may be negative), rounded at the data end. */
  /** Square bar ends: the site's design has no rounded corners. */
  const BAR_RADIUS = 0;
  function barPath(x, y, w, hgt, r) {
    if (Math.abs(w) < 0.5) return `M${x - 0.5},${y}h1v${hgt}h-1Z`;
    const rr = Math.min(r, BAR_RADIUS, Math.abs(w), hgt / 2);
    if (w > 0) return `M${x},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + hgt - rr}Q${x + w},${y + hgt} ${x + w - rr},${y + hgt}H${x}Z`;
    const e = x + w;
    return `M${x},${y}H${e + rr}Q${e},${y} ${e},${y + rr}V${y + hgt - rr}Q${e},${y + hgt} ${e + rr},${y + hgt}H${x}Z`;
  }

  /**
   * Keyboard layer: the svg is one tab stop; arrow keys move between items,
   * each shown with the tooltip and announced. items: [{node (for position), content, label}]
   */
  function keyNav(svgEl, items, opts) {
    const o = opts || {};
    let at = -1;
    svgEl.setAttribute("tabindex", "0");
    const show = () => {
      const it = items[at];
      if (!it) return;
      if (o.onMove) o.onMove(at);
      tip.showAt(typeof it.content === "function" ? it.content() : it.content, it.node);
      SQA.announce(it.label);
    };
    svgEl.addEventListener("keydown", (e) => {
      if (!items.length) return;
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown") at = Math.min(items.length - 1, at + 1);
      else if (k === "ArrowLeft" || k === "ArrowUp") at = Math.max(0, at < 0 ? 0 : at - 1);
      else if (k === "Home") at = 0;
      else if (k === "End") at = items.length - 1;
      else if (k === "Escape") { tip.hide(); if (o.onMove) o.onMove(-1); return; }
      else return;
      e.preventDefault();
      show();
    });
    svgEl.addEventListener("focus", () => { if (at < 0) at = o.start || 0; show(); });
    svgEl.addEventListener("blur", () => { tip.hide(); if (o.onMove) o.onMove(-1); });
  }

  /**
   * Vertical histogram.
   * o: {width, height, bins: [{x0, x1, n}], under: {n, label}, over: {n, label},
   *     xMin, xMax, xFormat, xLabel, yLabel, markers: [{x, label, cls}], tipFor(bin) → content,
   *     ariaLabel, highlight: x}
   */
  function histogram(container, o) {
    clear(container);
    const W = o.width, H = o.height || 230;
    const m = { l: 40, r: 14, t: 34, b: 42 };
    const extra = (o.under && o.under.n ? 1 : 0) + (o.over && o.over.n ? 1 : 0);
    const nb = o.bins.length;
    const slotW = (W - m.l - m.r) / (nb + extra * 1.6);
    const leftOff = o.under && o.under.n ? slotW * 1.6 : 0;
    const x0 = m.l + leftOff, x1 = W - m.r - (o.over && o.over.n ? slotW * 1.6 : 0);
    const X = (v) => x0 + ((v - o.xMin) / (o.xMax - o.xMin)) * (x1 - x0);
    const maxN = Math.max(1, ...o.bins.map((b) => b.n), o.under ? o.under.n : 0, o.over ? o.over.n : 0);
    const yTicks = niceTicks(0, maxN, 4);
    let top = yTicks[yTicks.length - 1] || maxN;
    if (top < maxN) {
      // the axis covers the tallest bar
      top = +(top + (yTicks.length > 1 ? yTicks[1] - yTicks[0] : maxN)).toFixed(10);
      yTicks.push(top);
    }
    const Y = (n) => H - m.b - (n / top) * (H - m.b - m.t);
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": o.ariaLabel || "Histogram", width: W, height: H });
    const grid = s("g", { class: "grid" }, null);
    root.appendChild(grid);
    yTicks.forEach((t) => {
      grid.appendChild(s("line", { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t) }));
      root.appendChild(s("text", { x: m.l - 6, y: Y(t) + 4, "text-anchor": "end", class: "tick" }, fmt(t, 0)));
    });
    // x ticks
    const xt = o.xTicks || niceTicks(o.xMin, o.xMax, Math.max(3, Math.floor((x1 - x0) / 56)));
    xt.forEach((t) => {
      root.appendChild(s("line", { x1: X(t), x2: X(t), y1: H - m.b, y2: H - m.b + 4, class: "axis" }));
      root.appendChild(s("text", { x: X(t), y: H - m.b + 16, "text-anchor": "middle", class: "tick" }, (o.xFormat || ((v) => fmt(v, 1)))(t)));
    });
    if (o.xLabel) root.appendChild(s("text", { x: (x0 + x1) / 2, y: H - 6, "text-anchor": "middle", class: "muted-label" }, o.xLabel));
    root.appendChild(s("line", { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: "axis" }));
    const items = [];
    const hl = s("rect", { class: "sel", x: -10, y: -10, width: 0, height: 0, rx: 3 });
    const gap = Math.min(2, (x1 - x0) / nb * 0.2);
    function addBar(xa, xb, n, cls, content, label) {
      const w = Math.max(1, xb - xa - gap);
      const y = Y(n);
      const p = s("path", { d: colPath(xa + gap / 2, y, w, H - m.b - y, Math.min(4, w / 2)), class: "bar " + (cls || "") });
      root.appendChild(p);
      const hit = s("rect", { x: xa, y: m.t - 6, width: Math.max(xb - xa, 2), height: H - m.b - m.t + 6, class: "hit" });
      hit.addEventListener("pointermove", (e) => { tip.show(content(), e.clientX, e.clientY); });
      hit.addEventListener("pointerleave", () => tip.hide());
      root.appendChild(hit);
      items.push({ node: hit, content, label, box: [xa, m.t - 6, xb - xa, H - m.b - m.t + 6] });
    }
    if (o.under && o.under.n) {
      const xa = m.l + slotW * 0.2, xb = m.l + slotW * 1.2;
      addBar(xa, xb, o.under.n, "overflow", () => o.tipFor({ n: o.under.n, under: true }), `${o.under.label}: ${o.under.n}`);
      root.appendChild(s("text", { x: (xa + xb) / 2, y: H - m.b + 16, "text-anchor": "middle", class: "tick" }, "‹"));
    }
    o.bins.forEach((b) => addBar(X(b.x0), X(b.x1), b.n, b.cls, () => o.tipFor(b), o.labelFor ? o.labelFor(b) : `${b.n}`));
    if (o.over && o.over.n) {
      const xa = W - m.r - slotW * 1.2, xb = W - m.r - slotW * 0.2;
      addBar(xa, xb, o.over.n, "overflow", () => o.tipFor({ n: o.over.n, over: true }), `${o.over.label}: ${o.over.n}`);
      root.appendChild(s("text", { x: (xa + xb) / 2, y: H - m.b + 16, "text-anchor": "middle", class: "tick" }, "›"));
    }
    // markers: lines with labels on one or two rows (labels drawn last, over every line)
    const placed = [], labels = [];
    (o.markers || []).filter((mk) => mk.x >= o.xMin && mk.x <= o.xMax).sort((a, b) => a.x - b.x).forEach((mk) => {
      const x = X(mk.x);
      const wLabel = mk.label.length * 6.4 + 8;
      let row = 0;
      while (placed.some((p) => p.row === row && Math.abs(p.x - x) < (p.w + wLabel) / 2)) row++;
      placed.push({ x, w: wLabel, row });
      const ly = 12 + row * 13;
      root.appendChild(s("line", { x1: x, x2: x, y1: ly + 4, y2: H - m.b, class: mk.cls || "marker" }));
      let anchor = "middle";
      if (x - wLabel / 2 < 2) anchor = "start"; else if (x + wLabel / 2 > W - 2) anchor = "end";
      labels.push(s("text", { x, y: ly, "text-anchor": anchor, class: "label-strong halo", style: "font-size:11px" }, mk.label));
    });
    labels.forEach((l) => root.appendChild(l));
    root.appendChild(hl);
    keyNav(root, items, {
      onMove(i) {
        if (i < 0) { hl.setAttribute("width", 0); return; }
        const b = items[i].box;
        hl.setAttribute("x", b[0]); hl.setAttribute("y", b[1]); hl.setAttribute("width", b[2]); hl.setAttribute("height", b[3]);
      },
    });
    container.appendChild(root);
    return root;
  }

  /** Horizontal bars, one series. rows: [{label, value, valueText, content}] */
  function hbars(container, rows, o) {
    clear(container);
    const W = o.width, rowH = 24, gapY = 12;
    const labelW = o.labelW || 84;
    const H = rows.length * (rowH + gapY) + 18;
    const max = Math.max(1, ...rows.map((r) => r.value));
    const x0 = labelW, x1 = W - (o.valueW || 96);
    const X = (v) => x0 + (v / max) * (x1 - x0);
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": o.ariaLabel || "Bar chart", width: W, height: H });
    const items = [];
    const hl = s("rect", { class: "sel", x: -10, y: -10, width: 0, height: 0, rx: 3 });
    rows.forEach((r, i) => {
      const y = 8 + i * (rowH + gapY);
      root.appendChild(s("text", { x: x0 - 10, y: y + rowH / 2 + 4, "text-anchor": "end", class: "label-strong" }, r.label));
      const w = Math.max(X(r.value) - x0, r.value > 0 ? 2 : 0);
      if (w > 0) root.appendChild(s("path", { d: barPath(x0, y, w, rowH, 4), class: "bar " + (r.cls || "") }));
      root.appendChild(s("text", { x: x0 + w + 8, y: y + rowH / 2 + 4 }, r.valueText || fmt(r.value, 0)));
      const hit = s("rect", { x: 0, y: y - gapY / 2, width: W, height: rowH + gapY, class: "hit" });
      hit.addEventListener("pointermove", (e) => tip.show(r.content(), e.clientX, e.clientY));
      hit.addEventListener("pointerleave", () => tip.hide());
      root.appendChild(hit);
      items.push({ node: hit, content: r.content, label: `${r.label}: ${r.valueText || r.value}`, box: [0, y - 4, W, rowH + 8] });
    });
    root.appendChild(s("line", { x1: x0, x2: x0, y1: 2, y2: H - 8, class: "axis" }));
    root.appendChild(hl);
    keyNav(root, items, {
      onMove(i) {
        if (i < 0) { hl.setAttribute("width", 0); return; }
        const b = items[i].box;
        hl.setAttribute("x", b[0] + 1); hl.setAttribute("y", b[1]); hl.setAttribute("width", b[2] - 2); hl.setAttribute("height", b[3]);
      },
    });
    container.appendChild(root);
    return root;
  }

  /**
   * "Show as table" toggle. columns: [{label, num, get(row) → text}];
   * rows() is called each time the table opens, so it shows current data.
   */
  let tableIds = 0;
  function tableToggle(parent, columns, rows, opts) {
    const o = opts || {};
    const id = "tv" + ++tableIds;
    const wrap = h("div", { class: "table-wrap " + (o.size || "medium"), id, hidden: true, style: { marginTop: "8px" } });
    const btn = h("button", { type: "button", class: "table-toggle", "aria-expanded": "false", "aria-controls": id }, o.label || "Show as table");
    function fill() {
      clear(wrap);
      if (o.render) { o.render(wrap); return; }
      const list = rows();
      const t = h("table", null);
      if (o.caption) t.appendChild(h("caption", { class: "sr-only" }, o.caption));
      t.appendChild(h("thead", null, h("tr", null, columns.map((c) => h("th", { class: c.num ? "num" : "", scope: "col" }, c.label)))));
      const tb = h("tbody");
      const frag = document.createDocumentFragment();
      list.forEach((r) => frag.appendChild(h("tr", null, columns.map((c, i) => (i === 0 && o.rowHeader !== false ? h("th", { scope: "row", class: c.num ? "num" : "", style: { position: "static", background: "transparent", fontWeight: 500, color: "var(--ink)" } }, c.get(r)) : h("td", { class: c.num ? "num" : "" }, c.get(r)))))));
      tb.appendChild(frag);
      t.appendChild(tb);
      wrap.appendChild(t);
      if (!list.length) wrap.appendChild(h("p", { class: "empty" }, "No rows."));
    }
    btn.addEventListener("click", () => {
      const open = wrap.hasAttribute("hidden");
      if (open) { fill(); wrap.removeAttribute("hidden"); } else wrap.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? (o.hideLabel || "Hide the table") : (o.label || "Show as table");
    });
    parent.appendChild(btn);
    parent.appendChild(wrap);
    return { refresh() { if (!wrap.hasAttribute("hidden")) fill(); } };
  }

  /** Inline diverging bar (HTML-free SVG) for table cells. */
  function miniDiverging(value, max, width, cls) {
    const W = width || 120, H = 14, mid = W / 2;
    const v = Math.max(-max, Math.min(max, value));
    const w = (v / max) * (mid - 2);
    const root = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "chart valbar", "aria-hidden": "true" });
    root.appendChild(s("line", { x1: mid, x2: mid, y1: 0, y2: H, class: "axis" }));
    root.appendChild(s("path", { d: barPath(mid, 3, w, H - 6, 3), class: cls || (value < 0 ? "neg" : "pos") }));
    return root;
  }

  /** Histogram bins over [lo, hi) with an under/over count. */
  function binValues(values, lo, hi, width) {
    const n = Math.max(1, Math.round((hi - lo) / width));
    const bins = Array.from({ length: n }, (_, i) => ({ x0: lo + i * width, x1: lo + (i + 1) * width, n: 0, items: [] }));
    let under = 0, over = 0;
    values.forEach((v) => {
      if (v === null || v === undefined || Number.isNaN(v)) return;
      if (v < lo - 1e-9) { under++; return; }
      if (v > hi + 1e-9) { over++; return; }
      const i = Math.min(n - 1, Math.max(0, Math.floor((v - lo) / width + 1e-9)));
      bins[i].n++;
    });
    return { bins, under, over };
  }

  /** Density of a distribution given its quantiles q[0..100] over bins (expected counts per bin of n). */
  function binsFromQuantiles(q, n, lo, hi, width) {
    const cdf = (x) => {
      if (!q || q.length < 2) return 0;
      if (x <= q[0]) return 0;
      if (x >= q[q.length - 1]) return 1;
      for (let k = 1; k < q.length; k++) {
        if (x <= q[k]) {
          const span = q[k] - q[k - 1];
          const f = span > 1e-12 ? (x - q[k - 1]) / span : 1;
          return (k - 1 + f) / (q.length - 1);
        }
      }
      return 1;
    };
    const nb = Math.max(1, Math.round((hi - lo) / width));
    const bins = [];
    for (let i = 0; i < nb; i++) {
      const a = lo + i * width, b = a + width;
      bins.push({ x0: a, x1: b, n: (cdf(b) - cdf(a)) * n });
    }
    return { bins, under: cdf(lo) * n, over: (1 - cdf(hi)) * n };
  }

  function quantile(sorted, p) {
    if (!sorted.length) return NaN;
    const x = p * (sorted.length - 1), i = Math.floor(x), f = x - i;
    return i + 1 < sorted.length ? sorted[i] * (1 - f) + sorted[i + 1] * f : sorted[sorted.length - 1];
  }
  function median(values) {
    const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
    return quantile(v, 0.5);
  }

  /** A legend: items [{label, cls (swatch class), color (css colour), line, ring}] */
  function legend(items) {
    return h("div", { class: "legend" }, items.map((it) => h("span", null,
      h("i", { class: "swatch" + (it.line ? " line" : "") + (it.ring ? " ring" : ""), style: it.color ? (it.ring ? { color: it.color } : { background: it.color }) : null, "aria-hidden": "true" }),
      it.label)));
  }

  Object.assign(SQA, { responsive, niceTicks, niceStep, colPath, barPath, keyNav, histogram, hbars, tableToggle, miniDiverging, binValues, binsFromQuantiles, quantile, median, legend });
})();
