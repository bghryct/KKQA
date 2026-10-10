/* The check in the browser, for the static copy of the site (GitHub Pages,
 * or the folder opened from disk): SQA.wasm.check(bytes, opts) → a report,
 * SQA.wasm.designspace(bytes) → its axes and locations, SQA.wasm.markdown(report)
 * → Markdown — the same Rust code as the server (crates/spacingqa-wasm),
 * shipped as spacingqa-wasm.js (base64) so that it loads from disk too. It
 * runs in a Web Worker made from a Blob when the browser allows one, else in
 * the page (which then pauses while it works). A check in the worker can be
 * cancelled (its signal): the worker is stopped and the next check starts a
 * new one. */
(function () {
  "use strict";
  const SQA = window.SQA;
  const cfg = window.SQA_CONFIG || {};
  const DATA = cfg.data || "data/";

  // the module's side: bytes in, JSON or text out (runs in the worker or here)
  function engine() {
    const enc = new TextEncoder(), dec = new TextDecoder();
    let x = null, wasm = null, library = null;
    function put(bytes) {
      const p = x.sqa_alloc(bytes.length);
      new Uint8Array(x.memory.buffer, p, bytes.length).set(bytes);
      return p;
    }
    function take(p) {
      const n = new DataView(x.memory.buffer).getUint32(p, true);
      const s = dec.decode(new Uint8Array(x.memory.buffer, p + 4, n).slice());
      x.sqa_free(p, n + 4);
      return s;
    }
    function free(p, n) { try { if (x) x.sqa_free(p, n); } catch (e) { /* a trapped instance */ } }
    async function instantiate() {
      const { instance } = await WebAssembly.instantiate(wasm, {});
      x = instance.exports;
      if (library) { const b = enc.encode(library); const p = put(b); x.sqa_set_library(p, b.length); free(p, b.length); }
    }
    async function run(op, a) {
      if (op === "init") { wasm = a.wasm; library = a.library || null; await instantiate(); return true; }
      if (!x) await instantiate();
      if (op === "check") {
        const opts = enc.encode(JSON.stringify(a.opts || {}));
        const fp = put(a.bytes), op_ = put(opts);
        try { return JSON.parse(take(x.sqa_check(fp, a.bytes.length, op_, opts.length))); }
        finally { free(fp, a.bytes.length); free(op_, opts.length); }
      }
      if (op === "designspace") {
        if (typeof x.sqa_designspace !== "function") throw new Error("This copy's check (spacingqa-wasm.js) is too old to read a designspace.");
        const p = put(a.bytes);
        try { return JSON.parse(take(x.sqa_designspace(p, a.bytes.length))); } finally { free(p, a.bytes.length); }
      }
      if (op === "markdown") {
        const b = enc.encode(a.report);
        const p = put(b);
        try { return take(x.sqa_markdown(p, b.length)); } finally { free(p, b.length); }
      }
      throw new Error("Unknown operation " + op);
    }
    async function handle(op, args) {
      try { return { ok: true, value: await run(op, args || {}) }; }
      catch (err) {
        const trapped = typeof WebAssembly === "object" && err instanceof WebAssembly.RuntimeError;
        if (trapped) x = null; // unusable after a trap: a fresh instance next time
        return { ok: false, error: trapped ? "The font could not be checked: the check stopped on an internal error." : String((err && err.message) || err) };
      }
    }
    return handle;
  }
  // the worker's script: the same function, answering messages
  const WORKER_SOURCE = `"use strict";
const handle = (${engine.toString()})();
self.onmessage = async (e) => {
  const { id, op, args } = e.data || {};
  self.postMessage(Object.assign({ id }, await handle(op, args)));
};`;

  let ready = null;    // Promise of {call(op, args, transfer, signal), inPage}
  let module = null;   // {wasm (bytes), library (JSON text)}
  const cancelled = () => new DOMException("The check was cancelled.", "AbortError");
  function base64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function startWorker(init) {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url); // throws where the browser does not allow it
    let seq = 0, stopped = false;
    const waiting = new Map();
    const self_ = { call: null, inPage: false };
    const settle = (id) => { const w = waiting.get(id); waiting.delete(id); if (w && w.unlisten) w.unlisten(); return w; };
    worker.onmessage = (e) => {
      const { id, ok, value, error } = e.data || {};
      const w = settle(id);
      if (!w) return;
      if (ok) w.resolve(value); else w.reject(new SQA.ApiError(500, error));
    };
    /** Stops the worker: every waiting call fails with `err`; the next call starts a new worker. */
    function stop(err) {
      if (stopped) return;
      stopped = true;
      for (const id of [...waiting.keys()]) settle(id).reject(err);
      worker.terminate();
      URL.revokeObjectURL(url);
      if (current === self_) { current = null; ready = null; }
    }
    worker.onerror = (e) => stop(new SQA.ApiError(500, "The check stopped: " + ((e && e.message) || "an error in the WebAssembly module") + "."));
    self_.call = (op, args, transfer, signal) => new Promise((resolve, reject) => {
      if (stopped) { reject(new SQA.ApiError(500, "The check stopped.")); return; }
      if (signal && signal.aborted) { reject(cancelled()); return; }
      const id = ++seq;
      const entry = { resolve, reject, unlisten: null };
      if (signal) {
        // the module cannot be interrupted: stop the worker (a new one takes the next check)
        const onAbort = () => { if (waiting.has(id)) stop(cancelled()); };
        signal.addEventListener("abort", onAbort, { once: true });
        entry.unlisten = () => signal.removeEventListener("abort", onAbort);
      }
      waiting.set(id, entry);
      worker.postMessage({ id, op, args }, transfer || []);
    });
    await self_.call("init", init);
    current = self_;
    return self_;
  }
  let current = null;
  async function startInPage(init) {
    const handle = engine();
    const call = async (op, args) => {
      const r = await handle(op, args);
      if (!r.ok) throw new SQA.ApiError(500, r.error);
      return r.value;
    };
    await call("init", init);
    return { call, inPage: true };
  }
  function ensure() {
    if (!cfg.wasm) return Promise.reject(new SQA.ApiError(501, "This copy of KKQA cannot check fonts in the browser (it was published without spacingqa-wasm.js)."));
    if (typeof WebAssembly !== "object") return Promise.reject(new SQA.ApiError(501, "This browser cannot run the check (WebAssembly is needed)."));
    if (!ready) {
      const p = (async () => {
        // kept decoded: a cancelled check's worker is replaced without loading the module again
        if (!module) {
          const wasm = base64ToBytes(await SQA.staticData("wasm", cfg.wasm, false));
          let library = null;
          try { library = JSON.stringify(await SQA.staticData("library", `${DATA}library.js`, true)); } catch (e) { /* no baseline: INFO only */ }
          module = { wasm, library };
        }
        try { const w = await startWorker(module); SQA.wasm.where = "worker"; return w; }
        catch (e) { SQA.wasm.where = "page"; return startInPage(module); }
      })();
      ready = p;
      p.catch(() => { if (ready === p) ready = null; });
    }
    return ready;
  }
  const now = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");

  SQA.wasm = {
    available: !!cfg.wasm,
    /**
     * Checks font bytes; opts: {file, family, category, primary_script,
     * designers, weight, kind, url, last_modified, location ({wght: 700, …}),
     * instance (its name), instances (also every location of the designspace:
     * a few seconds each)}. `signal` cancels it (in a worker).
     */
    async check(bytes, opts, signal) {
      const e = await ensure();
      if (signal && signal.aborted) throw cancelled();
      const copy = bytes.slice();
      // in the page the check holds the page for a few seconds: let it paint the "Checking…" state first
      if (e.inPage) await new Promise((r) => setTimeout(r, 60));
      const t0 = performance.now();
      const report = await e.call("check", { bytes: copy, opts: Object.assign({ now: now() }, opts || {}) }, e.inPage ? [] : [copy.buffer], signal);
      // how long one check took here (for estimates of longer ones)
      if (!(opts && opts.instances)) SQA.wasm.lastMs = performance.now() - t0;
      return report;
    },
    /** A font's axes and the locations a full check covers: {axes, locations} or {error}. */
    async designspace(bytes, signal) {
      const e = await ensure();
      const copy = bytes.slice();
      return e.call("designspace", { bytes: copy }, e.inPage ? [] : [copy.buffer], signal);
    },
    /** A report as Markdown (the same text the server makes). */
    async markdown(report) {
      const e = await ensure();
      return e.call("markdown", { report: typeof report === "string" ? report : JSON.stringify(report) });
    },
  };
})();
