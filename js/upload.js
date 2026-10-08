/*
 * Spacing QA — check a font file (#/upload). On a server the file is posted
 * to /api/check, checked in memory and never stored; in the published copy
 * (GitHub Pages, or opened from disk) it is checked in the browser by
 * spacingqa.wasm and never leaves the computer. The report is drawn with the
 * same renderer as the library's.
 *
 * A variable font is checked at its default location first; then its
 * designspace is listed (/api/designspace), any location can be checked on
 * its own, and every location at once ("Check every location").
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, clear, api, isAbort } = SQA;
  const CATS = ["Sans Serif", "Serif", "Display", "Handwriting", "Monospace"];
  // the last result stays while the page is open (not stored anywhere else):
  // {rep, info, library, families, fileName, file, query, ds, perLocation, picked}
  let last = null;

  const variable = (rep) => !!(rep && rep.summary && rep.font && Array.isArray(rep.font.axes) && rep.font.axes.length);
  /** Seconds one location takes: in the browser, what the default location took; on the server, its check time. */
  function perLocation(rep, seconds) {
    if (SQA.STATIC) return Math.min(12, Math.max(1, (SQA.wasm && SQA.wasm.lastMs ? SQA.wasm.lastMs / 1000 : seconds) || 2.5));
    const t = rep.timing_ms && rep.timing_ms.total;
    return Math.min(12, Math.max(0.4, t ? t / 1000 + 0.1 : 1.5));
  }

  function view(ctx) {
    ctx.setTitle("Check a font");
    const root = ctx.root;
    root.appendChild(h("header", { class: "view-head" },
      h("p", { class: "eyebrow" }, "Check a font file"),
      h("h1", { tabindex: "-1" }, "Check a font"),
      h("p", { class: "lede" }, "Upload a TTF or OTF to check it the way the library is checked: against Kinetikern2's tight, standard and loose spacing and, when a baseline exists, against the library's norms for its category. A variable font is checked at its default location first; then any location of its designspace — or all of them — can be checked. " + (SQA.STATIC
        ? "The font is checked in your browser — it never leaves your computer, and the report exists only in this page."
        : "The font is checked in memory on the server and not stored — the report exists only in this page."))));

    const st = { file: null };
    const input = h("input", { type: "file", accept: ".ttf,.otf,.ttc,font/ttf,font/otf,font/collection,application/font-sfnt", "aria-describedby": "drop-help" });
    const fileEl = h("span", { class: "file" });
    const zone = h("label", { class: "dropzone" },
      input,
      h("span", { class: "big" }, "Drop a font here, or choose a file"),
      h("span", { id: "drop-help", class: "small" }, "TrueType or OpenType (.ttf, .otf). Web fonts (WOFF, WOFF2) are not accepted."),
      fileEl);
    const cat = h("select", { id: "up-cat" }, CATS.map((c) => h("option", { value: c }, c)));
    const weight = h("input", { id: "up-wght", type: "number", min: "1", max: "1000", step: "any", value: "400", inputmode: "decimal" });
    const go = h("button", { type: "submit", class: "btn primary", disabled: true }, "Check the font");
    const clearBtn = h("button", { type: "button", class: "btn", hidden: true }, "Clear");
    const msg = h("p", { class: "msg", "aria-live": "polite" });
    const form = h("form", { class: "panel", novalidate: true },
      zone,
      h("div", { class: "form-grid" },
        h("label", { for: "up-cat" }, "Compare with", cat, h("span", { class: "hint" }, "The Google Fonts category whose norms the font is judged against.")),
        h("label", { for: "up-wght" }, "Weight", weight, h("span", { class: "hint" }, "For variable fonts: the wght of the default location (400 unless you change it)."))),
      h("div", { class: "row" }, go, clearBtn),
      msg);
    root.appendChild(form);
    const result = h("div", { class: "upload-result" });
    root.appendChild(result);
    // the check of one location, or of all of them (one at a time)
    let running = null;
    const stopRunning = () => { if (running) { running.abort(); running = null; } };
    ctx.onCleanup(stopRunning);

    function setFile(f) {
      st.file = f || null;
      fileEl.textContent = f ? `${f.name} · ${SQA.bytes(f.size)}` : "";
      go.disabled = !f;
      clearBtn.hidden = !f && !result.firstChild;
      SQA.message(msg, "");
    }
    input.addEventListener("change", () => setFile(input.files && input.files[0]));
    ["dragenter", "dragover"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add("over"); }));
    ["dragleave", "dragend"].forEach((t) => zone.addEventListener(t, () => zone.classList.remove("over")));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("over");
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) setFile(f);
    });
    clearBtn.addEventListener("click", () => { stopRunning(); input.value = ""; last = null; clear(result); setFile(null); input.focus(); });

    async function sniff(file) {
      const b = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      const tag = String.fromCharCode(...b);
      if (tag === "wOF2" || tag === "wOFF") return "This is a WOFF/WOFF2 web font: please upload the TTF or OTF.";
      const sfnt = b.length === 4 && b[0] === 0 && b[1] === 1 && b[2] === 0 && b[3] === 0;
      if (!(sfnt || tag === "OTTO" || tag === "true" || tag === "ttcf")) return "This file is not a TrueType or OpenType font.";
      return null;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = st.file;
      if (!file) return;
      const w = Number(weight.value);
      if (weight.value && !(w > 0 && w <= 1000)) { SQA.message(msg, "Enter a weight between 1 and 1000.", "error"); weight.focus(); return; }
      let bad = null;
      try { bad = await sniff(file); } catch (err) { bad = "The file could not be read."; }
      if (bad) { SQA.message(msg, bad, "error"); return; }
      stopRunning();
      go.disabled = true;
      SQA.message(msg, "");
      clear(result);
      result.appendChild(SQA.loading(`Checking ${file.name} ${SQA.WHERE}…`, "Kinetikern2 spaces the font at five Looseness settings; this takes a few seconds. Nothing is stored."));
      try {
        const q = new URLSearchParams({ name: file.name, category: cat.value });
        if (weight.value) q.set("weight", String(w));
        const t0 = performance.now();
        // a variable font: its default location first (its other locations on request)
        const first = new URLSearchParams(q);
        first.set("instances", "0");
        const [rep, info] = await Promise.all([
          api("/api/check?" + first.toString(), { method: "POST", body: file, contentType: "application/octet-stream", signal: ctx.signal }),
          SQA.getInfo(false, ctx.signal).catch((err) => { if (isAbort(err)) throw err; return null; }),
        ]);
        const took = (performance.now() - t0) / 1000;
        const library = await SQA.getLibrary(info, ctx.signal).catch((err) => { if (isAbort(err)) throw err; return null; });
        const families = library ? null : await SQA.getFamilies(false, ctx.signal).catch(() => null);
        let ds = null;
        if (variable(rep)) {
          ds = await api("/api/designspace", { method: "POST", body: file, contentType: "application/octet-stream", signal: ctx.signal })
            .catch((err) => { if (isAbort(err)) throw err; return { error: err.message }; });
        }
        if (!ctx.alive()) return;
        last = { rep, info, library, families, fileName: file.name, file, query: q.toString(), ds, perLocation: perLocation(rep, took), picked: null };
        show(true);
        SQA.announce(`Checked ${file.name}: ${rep.status ? rep.status.level : ""}`);
      } catch (err) {
        if (isAbort(err) || !ctx.alive()) return;
        clear(result);
        SQA.message(msg, err.status === 413 ? `${file.name} (${SQA.bytes(file.size)}) is larger than this server accepts for uploads.` : err.message, "error");
      } finally {
        go.disabled = !st.file;
        clearBtn.hidden = !st.file && !result.firstChild;
      }
    });

    /** The designspace to show: every location once checked, else the list of them. */
    function designspaceOf() {
      const f = last.rep.font || {};
      const checked = Array.isArray(last.rep.instances) && last.rep.instances.length > 0;
      return {
        axes: f.axes, main: f.location, mainReport: last.rep,
        instances: checked ? last.rep.instances : null,
        locations: !checked && last.ds && Array.isArray(last.ds.locations) ? last.ds.locations : null,
        reasons: (last.rep.status && last.rep.status.reasons) || [],
      };
    }
    function locationCount() {
      return last.ds && Array.isArray(last.ds.locations) ? last.ds.locations.length : null;
    }
    /** "Check every location (12, about 30 s)", until they are checked. */
    function checkAllAction() {
      if (Array.isArray(last.rep.instances) && last.rep.instances.length) return null;
      const n = locationCount();
      if (n === 0) return null;
      const secs = n ? Math.round((n + 1) * last.perLocation) : null;
      const inPage = SQA.STATIC && SQA.wasm && SQA.wasm.where === "page";
      return {
        label: n ? `Check every location (${SQA.int(n)}, about ${SQA.duration(secs)})` : "Check every location",
        text: (SQA.STATIC
          ? `Your browser checks the locations one after another, about ${SQA.fmt(last.perLocation, 1)} s each (the default location took that long here)` + (inPage ? "; this browser runs the check in the page, which will not respond until it is done." : "; the page stays usable meanwhile.")
          : `The server checks the locations one after another, about ${SQA.fmt(last.perLocation, 1)} s each.`) +
          " The result is judged like a library family's: each location's evenness, and the jumps between neighbouring locations.",
        run: runAll,
      };
    }
    function opts() {
      return {
        mode: "upload", info: last.info, library: last.library, families: last.families, fileName: last.fileName,
        designspace: variable(last.rep) ? designspaceOf() : null,
        dsPick: variable(last.rep) ? pickLocation : null,
        dsSeconds: last.perLocation,
        checkAll: variable(last.rep) ? checkAllAction() : null,
      };
    }

    function show(focus) {
      clear(result);
      if (!last) return;
      const p = last.picked;
      if (p && p.rep) {
        SQA.renderReport(ctx, result, p.rep, Object.assign(opts(), { picked: p.banner, checkAll: null }));
      } else if (p) {
        const f = last.rep.font || {};
        const ui = SQA.renderPicking(ctx, result, {
          crumbs: h("p", { class: "crumbs" }, h("span", { class: "muted" }, `Uploaded font — checked ${SQA.WHERE}, not stored`)),
          eyebrow: [f.category || "Category unknown", "Variable font"].join(" · "),
          title: f.family || last.fileName, picked: p.banner,
          sub: `${last.fileName} is checked ${SQA.WHERE} at this location — about ${SQA.duration(Math.max(1, Math.round(last.perLocation)))}. Nothing is stored.`,
          model: SQA.designspace.model(designspaceOf()),
          dsOpts: { current: p.banner.location, pick: pickLocation, where: SQA.WHERE, seconds: last.perLocation },
        });
        if (p.error) ui.fail(p.error, () => pickLocation(p.row));
      } else {
        SQA.renderReport(ctx, result, last.rep, opts());
      }
      clearBtn.hidden = false;
      if (focus) { const hd = result.querySelector("h1"); if (hd) hd.focus(); }
    }

    /** Checks the uploaded font at one location (the default location: back to its report). */
    async function pickLocation(r) {
      if (!last || !r) return;
      const f = last.rep.font || {};
      const main = SQA.designspace.fill(f.axes || [], null, f.location || {});
      const loc = SQA.designspace.fill(f.axes || [], main, r.location);
      if (SQA.sameLocation(loc, main)) {
        // back to the default location (a check of every location keeps running)
        if (last.picked) { stopRunning(); last.picked = null; show(true); }
        return;
      }
      if (last.picked && last.picked.rep && SQA.sameLocation(last.picked.banner.location, loc)) return;
      stopRunning();
      const desc = SQA.describeLocation(loc, main, (f.axes || []).map((a) => a.tag));
      const redundant = SQA.designspace.sameParts(r.name, desc);
      const back = () => { stopRunning(); if (last) { last.picked = null; show(true); } };
      const state = { row: r, rep: null, error: null, banner: { name: r.name, desc, redundant, label: redundant ? r.name : `${r.name} (${desc})`, location: loc, back } };
      last.picked = state;
      show(true);
      const ac = new AbortController();
      running = ac;
      try {
        const q = new URLSearchParams(last.query);
        q.set("location", SQA.locationString(loc));
        q.set("instance", r.name);
        q.set("instances", "0");
        const rep = await api("/api/check?" + q.toString(), { method: "POST", body: last.file, contentType: "application/octet-stream", signal: ac.signal });
        if (!ctx.alive() || !last || last.picked !== state) return;
        state.rep = rep;
        show(true);
        SQA.announce(`Checked at ${state.banner.label}: ${rep.status ? rep.status.level : ""}`);
      } catch (err) {
        if (!last || last.picked !== state) return;
        if (isAbort(err)) { if (!ctx.alive()) last.picked = null; return; }
        if (!ctx.alive()) { last.picked = null; return; }
        state.error = err;
        show(false);
      } finally {
        if (running === ac) running = null;
      }
    }

    /** Every location of the designspace, judged together (instances=1). */
    async function runAll(box, btn) {
      if (!last) return;
      stopRunning();
      const n = locationCount();
      const secs = n ? Math.round((n + 1) * last.perLocation) : null;
      const ac = new AbortController();
      running = ac;
      const t0 = Date.now();
      const status = h("p", { class: "small", "aria-live": "off" });
      const cancel = h("button", { type: "button", class: "btn" }, "Cancel");
      const restore = Array.from(box.childNodes).filter((node) => !(node.classList && node.classList.contains("msg")));
      clear(box);
      box.append(
        h("p", { class: "lede", style: { margin: "0", fontSize: "17px" } }, `Checking ${n ? SQA.int(n) + " locations" : "every location"} of ${last.fileName}…`),
        h("div", { class: "progress indeterminate", style: { margin: "12px 0 8px" }, "aria-hidden": "true" }, h("span")),
        status, h("div", { class: "row" }, cancel));
      const tick = () => {
        const el = Math.round((Date.now() - t0) / 1000);
        status.textContent = `${SQA.duration(el)} so far` + (secs ? ` of about ${SQA.duration(secs)}` : "") + (secs && el > secs * 1.5 ? " — taking longer than estimated" : "") + ".";
      };
      tick();
      const timer = setInterval(tick, 1000);
      cancel.addEventListener("click", () => ac.abort());
      SQA.announce(`Checking every location of ${last.fileName}`);
      cancel.focus();
      try {
        const q = new URLSearchParams(last.query);
        q.set("instances", "1");
        const full = await api("/api/check?" + q.toString(), { method: "POST", body: last.file, contentType: "application/octet-stream", signal: ac.signal });
        if (!ctx.alive() || !last) return;
        last.rep = full;
        last.picked = null;
        show(false);
        const k = Array.isArray(full.instances) ? full.instances.length : 0;
        SQA.announce(`Checked ${SQA.plural(k, "location")}: ${full.status ? full.status.level : ""}`);
        const hd = document.getElementById("designspace-h");
        if (hd) { hd.scrollIntoView({ block: "start" }); hd.focus({ preventScroll: true }); }
      } catch (err) {
        if (!ctx.alive() || !box.isConnected) return;
        clear(box);
        box.append(...restore);
        const note = h("p", { class: "msg" + (isAbort(err) ? "" : " error"), role: isAbort(err) ? "status" : "alert" },
          isAbort(err) ? "Cancelled: the locations were not checked." : "The locations could not be checked: " + err.message);
        box.appendChild(note);
        btn.focus();
      } finally {
        clearInterval(timer);
        if (running === ac) running = null;
      }
    }

    if (last) show(false);
  }

  SQA.views = SQA.views || {};
  SQA.views.upload = view;
})();
