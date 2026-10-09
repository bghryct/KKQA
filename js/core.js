/*
 * Spacing QA — core: DOM and SVG helpers, the API client (errors, admin
 * token), formatting, the tooltip, the theme, dialogs and shared data.
 * Everything hangs off window.SQA; no build step, no framework.
 */
(function () {
  "use strict";
  const SQA = (window.SQA = window.SQA || {});
  const NS = "http://www.w3.org/2000/svg";

  // ------------------------------------------------------------------ DOM
  function append(node, kids) {
    for (const k of kids) {
      if (k === null || k === undefined || k === false) continue;
      if (Array.isArray(k)) append(node, k);
      else if (k instanceof Node) node.appendChild(k);
      else node.appendChild(document.createTextNode(String(k)));
    }
    return node;
  }
  function setAttrs(n, attrs, svg) {
    if (!attrs) return;
    for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") { if (svg) n.setAttribute("class", v); else n.className = v; }
      else if (k === "text") n.textContent = v;
      else if (k === "style" && typeof v === "object") Object.assign(n.style, v);
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (k === "dataset") Object.assign(n.dataset, v);
      else n.setAttribute(k, v === true ? "" : v);
    }
  }
  /** h("div", {class: "x"}, child, "text", [more]) */
  function h(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    setAttrs(n, attrs, false);
    return append(n, kids);
  }
  /** SVG element. */
  function s(tag, attrs, ...kids) {
    const n = document.createElementNS(NS, tag);
    setAttrs(n, attrs, true);
    return append(n, kids);
  }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); return n; }
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ------------------------------------------------------------------ format
  const MINUS = "−";
  const nf = new Map();
  function fmt(v, d = 1) {
    if (v === null || v === undefined || Number.isNaN(v) || !Number.isFinite(Number(v))) return "–";
    let f = nf.get(d);
    if (!f) { f = new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); nf.set(d, f); }
    const out = f.format(v);
    return out.replace("-", MINUS).replace(/^−(0(\.0+)?)$/, "$1");
  }
  /** Signed: +0.23, −0.04, 0.00 */
  function signed(v, d = 1) {
    if (v === null || v === undefined || Number.isNaN(v)) return "–";
    const t = fmt(v, d);
    if (t.startsWith(MINUS)) return t;
    return Number(t.replace(/,/g, "")) === 0 ? t : "+" + t;
  }
  const int = (v) => fmt(v, 0);
  const pct = (v, d = 0) => (v === null || v === undefined ? "–" : fmt(v * 100, d) + " %");
  const plural = (n, one, many) => `${int(n)} ${n === 1 ? one : many || one + "s"}`;
  const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const dtFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  function parseDate(iso) { if (!iso) return null; const d = new Date(iso); return Number.isNaN(d.getTime()) ? null : d; }
  function fmtDate(iso) { const d = parseDate(iso); return d ? dateFmt.format(d) : "–"; }
  function fmtDateTime(iso) { const d = parseDate(iso); return d ? dtFmt.format(d) : "–"; }
  function ago(iso) {
    const d = parseDate(iso);
    if (!d) return "";
    const s = (Date.now() - d.getTime()) / 1000;
    if (s < 45) return "just now";
    if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`;
    const days = Math.round(s / 86400);
    return days === 1 ? "yesterday" : `${days} days ago`;
  }
  function duration(sec) {
    if (sec === null || sec === undefined || !Number.isFinite(sec)) return "–";
    sec = Math.max(0, Math.round(sec));
    if (sec < 60) return `${sec} s`;
    const m = Math.round(sec / 60);
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
  }
  function bytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${fmt(n / 1024, 0)} KB`;
    return `${fmt(n / 1024 / 1024, 1)} MB`;
  }
  /** Google Fonts' slug of a family, as the server makes it ("Open Sans" → "open-sans"). */
  function slug(name) {
    let out = "", dash = false;
    for (const c of String(name).trim()) {
      if (/^[A-Za-z0-9]$/.test(c)) { out += c.toLowerCase(); dash = false; }
      else if (!dash && out) { out += "-"; dash = true; }
    }
    out = out.replace(/-+$/, "");
    return out || "font";
  }
  const fold = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // ------------------------------------------------------------------ designspace locations
  // A location of a variable font is {tag: user value} for every axis; the
  // server and the URL write it "wght:700,wdth:75" (instances.rs).
  const numText = (v) => {
    if (Math.abs(v - Math.round(v)) < 1e-3) return String(Math.round(v));
    return v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  };
  /** An axis value as the server writes it: 400, 62.5, −10. */
  const axisNum = (v) => (Number.isFinite(Number(v)) ? numText(Number(v)).replace("-", MINUS) : "–");
  /** "wght:700,wdth:75" → {wght: 700, wdth: 75} (parse_location in instances.rs). */
  function parseLocation(text) {
    const out = {};
    String(text || "").split(",").forEach((part) => {
      const m = part.match(/^\s*([^:=]+?)\s*[:=]\s*(.+?)\s*$/);
      if (!m) return;
      const v = Number(m[2].replace(MINUS, "-"));
      if (m[1].length === 4 && Number.isFinite(v)) out[m[1]] = v;
    });
    return out;
  }
  /** {wght: 700, wdth: 75} → "wdth:75,wght:700" (sorted by tag, as the server sorts). */
  const locationString = (loc) => Object.keys(loc || {}).sort().map((t) => `${t}:${numText(Number(loc[t]))}`).join(",");
  const sameValue = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-3;
  /** Two locations with the same axes at the same values. */
  function sameLocation(a, b) {
    const ka = Object.keys(a || {}), kb = Object.keys(b || {});
    return ka.length === kb.length && ka.every((k) => k in b && sameValue(a[k], b[k]));
  }
  /** The axes of `loc` whose value differs from `ref`'s: {tag: value}. */
  function locationDiff(loc, ref) {
    const out = {};
    Object.keys(loc || {}).forEach((k) => { if (!ref || !(k in ref) || !sameValue(loc[k], ref[k])) out[k] = loc[k]; });
    return out;
  }
  /** "wght 700 · wdth 75": the axes of `loc` that differ from `ref`, in the
   *  font's axis order when `order` (tags) is given (describe() in instances.rs). */
  function describeLocation(loc, ref, order) {
    const d = locationDiff(loc, ref);
    const tags = Object.keys(d).sort((a, b) => {
      const ia = order ? order.indexOf(a) : -1, ib = order ? order.indexOf(b) : -1;
      return ia >= 0 && ib >= 0 ? ia - ib : ia >= 0 ? -1 : ib >= 0 ? 1 : (a < b ? -1 : a > b ? 1 : 0);
    });
    return tags.length ? tags.map((t) => `${t} ${axisNum(d[t])}`).join(" · ") : "the default location";
  }

  // ------------------------------------------------------------------ levels
  const LEVELS = ["SKIP", "PASS", "INFO", "WARN", "FAIL", "ERROR"];
  const LEVEL_RANK = { SKIP: 0, PASS: 1, INFO: 2, WARN: 3, FAIL: 4, ERROR: 5 };
  const LEVEL_ICON = { SKIP: "–", PASS: "✓", INFO: "i", WARN: "!", FAIL: "✕", ERROR: "!!" };
  const LEVEL_TEXT = {
    SKIP: "Not checked: the font is outside what the check covers.",
    PASS: "Passes.",
    INFO: "For information: the spacing is the designer's choice, and nothing the check judges is far outside the library's norms or broken.",
    WARN: "Worth a look: something falls far outside the library's norms, a location of the designspace jumps against its neighbours, or joins are broken in the font.",
    FAIL: "Fails: the spacing falls very far outside the library's norms.",
    ERROR: "The check could not run on this font.",
  };
  function badge(level, opts) {
    const o = opts || {};
    const L = level || "NONE";
    const label = level || o.none || "Not checked";
    return h("span", { class: `badge lvl-${L}${o.big ? " big" : ""}`, "data-i": level ? LEVEL_ICON[level] : "·", title: o.title || (level ? LEVEL_TEXT[level] : "") }, label);
  }
  function badgeHtml(level, none) {
    const L = level || "NONE";
    return `<span class="badge lvl-${L}" data-i="${level ? LEVEL_ICON[level] : "·"}">${esc(level || none || "Not checked")}</span>`;
  }
  const PRESET_LABEL = { tight: "Tight", standard: "Standard", loose: "Loose" };
  function presetChip(name) {
    if (!name) return h("span", { class: "na" }, "–");
    return h("span", { class: `preset p-${name}` }, PRESET_LABEL[name] || name);
  }
  function presetHtml(name) {
    return name ? `<span class="preset p-${esc(name)}">${esc(PRESET_LABEL[name] || name)}</span>` : `<span class="na">–</span>`;
  }

  // ------------------------------------------------------------------ API
  class ApiError extends Error {
    constructor(status, message, detail) { super(message); this.status = status; this.detail = detail || ""; }
  }

  // ------------------------------------------------------------------ the static copy
  // `spacingqa site` writes a copy that needs no server (GitHub Pages, or the
  // folder opened from disk): its data are scripts — SQA_DATA(key, value) —
  // because a page opened from disk may load scripts but not fetch files, and
  // fonts are checked in the browser (js/wasm.js). config.js says which.
  const CONFIG = window.SQA_CONFIG || { mode: "server" };
  const STATIC = CONFIG.mode === "static";
  const DATA = CONFIG.data || "data/";
  const BUILD = CONFIG.generated ? "?v=" + encodeURIComponent(CONFIG.generated) : "";
  const STATIC_REFUSED = "This is the published copy of Spacing QA: a scheduled scan updates it (GitHub Actions), so scans and rebuilds do not run from this page.";
  /** How often the copy is rebuilt from fonts.google.com ("every day"), when its
   *  build says (`spacingqa site --refresh-hours 24`); "" when it does not. */
  const REBUILT = !STATIC || !(CONFIG.refresh_hours > 0) ? ""
    : CONFIG.refresh_hours === 24 ? "every day" : `every ${CONFIG.refresh_hours} hours`;
  /** A published copy that takes requests (`spacingqa site --requests`): the
   *  address of a new GitHub issue that asks its refresh workflow to check
   *  `family` again, or without one every family that changed on Google
   *  Fonts; the workflow publishes the result, answers and closes the issue.
   *  `key` (the catalog name or the slug, which the workflow matches) goes
   *  in the form when the name shown may not be the catalog's. "" when the
   *  copy takes no requests. */
  function requestUrl(family, key) {
    if (!STATIC || !CONFIG.requests || !CONFIG.repo_url) return "";
    const q = new URLSearchParams({ template: "recheck.yml", title: family ? `Re-check: ${family}` : "Re-check: every changed family" });
    if (family) q.set("family", key || family);
    return `${String(CONFIG.repo_url).replace(/\/+$/, "")}/issues/new?${q.toString()}`;
  }
  const staticValues = new Map();
  window.SQA_DATA = (key, value) => { staticValues.set(key, value); };
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = () => { el.remove(); resolve(); };
      el.onerror = () => { el.remove(); reject(new ApiError(404, "Not found.")); };
      document.head.appendChild(el);
    });
  }
  /** A value of the static copy: data/<file>.js calls SQA_DATA(key, value).
   *  Requests for the same key at once share one script load. */
  const staticLoading = new Map();
  async function staticData(key, file, keep) {
    if (staticValues.has(key)) {
      const v = staticValues.get(key);
      if (!keep) staticValues.delete(key);
      return v;
    }
    let p = staticLoading.get(key);
    if (!p) {
      p = loadScript(file + BUILD).then(() => {
        if (!staticValues.has(key)) throw new ApiError(500, "The published data could not be read.");
        const v = staticValues.get(key);
        if (!keep) staticValues.delete(key);
        return v;
      }).finally(() => staticLoading.delete(key));
      staticLoading.set(key, p);
    }
    return p;
  }
  /** A report as the copy publishes it, {gz: base64 of the gzipped JSON}
   *  (static_site.rs `packed`), unpacked; anything else as it is. */
  async function unpackReport(v) {
    if (!v || typeof v.gz !== "string") return v;
    if (typeof DecompressionStream === "undefined") throw new ApiError(500, "This browser cannot unpack the published reports (it has no DecompressionStream): please use a current browser.");
    const bin = atob(v.gz);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return JSON.parse(await new Response(stream).text());
  }
  /** Where an export file is: the server's /api/export, or the copy's data/exports. */
  const exportUrl = (name) => (STATIC ? `${DATA}exports/${name}` : `/api/export/${name}`);
  /** Where uploaded fonts are checked, for the page's wording. */
  const WHERE = STATIC ? "in your browser" : "in memory on the server";

  async function staticApi(path, o) {
    const u = new URL(path, "http://x");
    const p = u.pathname, q = u.searchParams;
    const method = (o.method || "GET").toUpperCase();
    if (p === "/api/check" && method === "POST") {
      const bytes = new Uint8Array(await o.body.arrayBuffer());
      const opts = { file: q.get("name") || "font.ttf", category: q.get("category") || null, weight: Number(q.get("weight")) || 400 };
      const loc = parseLocation(q.get("location"));
      if (Object.keys(loc).length) { opts.location = loc; if (q.get("instance")) opts.instance = q.get("instance"); }
      // every location of a designspace takes seconds in the browser: only when asked for
      opts.instances = q.get("instances") === "1";
      return SQA.wasm.check(bytes, opts, o.signal);
    }
    if (p === "/api/designspace" && method === "POST") return SQA.wasm.designspace(new Uint8Array(await o.body.arrayBuffer()), o.signal);
    if (p === "/api/markdown" && method === "POST") return SQA.wasm.markdown(o.json);
    if (method !== "GET") throw new ApiError(403, STATIC_REFUSED);
    if (p === "/api/info") return staticData("info", `${DATA}info.js`, true);
    if (p === "/api/families") return staticData("families", `${DATA}families.js`, true);
    if (p === "/api/library") return staticData("library", `${DATA}library.js`, true);
    if (p === "/api/scan") return (await staticData("info", `${DATA}info.js`, true)).scan;
    let m = p.match(/^\/api\/family\/([^/]+)$/);
    if (m) {
      const slug = decodeURIComponent(m[1]);
      let r;
      try { r = await unpackReport(await staticData("report:" + slug, `${DATA}reports/${slug}.js`, false)); }
      catch (e) {
        if (e.status === 404) throw new ApiError(404, "This family has not been checked yet: the next scheduled scan will check it.");
        throw e;
      }
      const loc = parseLocation(q.get("location"));
      if (Object.keys(loc).length) return checkAt(r, loc, q.get("instance"), o.signal);
      return q.has("refresh") ? recheck(r, o.signal) : r;
    }
    throw new ApiError(404, "This is not part of the published copy.");
  }
  /** A font file from fonts.gstatic.com. The last two are kept: picking several
   *  locations of a family (upright and italic) downloads each file once. */
  const fontFiles = [];
  async function fontFile(url, signal) {
    if (!url) throw new ApiError(400, "This report names no font file to check again.");
    const kept = fontFiles.find((x) => x.url === url);
    if (kept) return kept;
    let res;
    try { res = await fetch(url, { signal }); }
    catch (e) { if (isAbort(e)) throw e; throw new ApiError(502, "Google Fonts could not be reached", "Google Fonts could not be reached"); }
    if (!res.ok) throw new ApiError(502, `Google Fonts answered HTTP ${res.status}.`);
    const font = { url, bytes: new Uint8Array(await res.arrayBuffer()) };
    fontFiles.unshift(font);
    fontFiles.length = Math.min(fontFiles.length, 2);
    return font;
  }
  const familyFont = (report, signal) => fontFile(report.font && report.font.source && report.font.source.url, signal);
  function liveOptions(report, url) {
    const f = report.font || {};
    return {
      file: f.file, family: f.family, category: f.category, primary_script: f.primary_script, designers: f.designers,
      weight: f.weight || (f.location && f.location.wght) || 400, kind: "live", url, last_modified: f.source.last_modified,
    };
  }
  /** Checks a family again in the browser, from its file on fonts.gstatic.com. */
  async function recheck(report, signal) {
    const font = await familyFont(report, signal);
    const fresh = await SQA.wasm.check(font.bytes, liveOptions(report, font.url), signal);
    // every location takes seconds here, so the browser re-checks the default
    // location only: the page keeps the published scan's locations, marked as
    // such (not part of the report itself: its JSON and Markdown leave them out)
    if (fresh && !(fresh.instances && fresh.instances.length) && Array.isArray(report.instances) && report.instances.length) {
      const reasons = ((report.status && report.status.reasons) || []).filter((x) => x.code === "spacing/designspace" || x.code === "spacing/instances");
      Object.defineProperty(fresh, "instances", { value: report.instances, enumerable: false, configurable: true, writable: true });
      Object.defineProperty(fresh, "instancesFrom", { value: { generated: report.generated, reasons }, enumerable: false, configurable: true });
      // the italic variable font the scan checked (its axes, its file for picked locations)
      if (report.italic && !fresh.italic) Object.defineProperty(fresh, "italic", { value: report.italic, enumerable: false, configurable: true, writable: true });
    }
    return fresh;
  }
  /** Checks a family in the browser at one location of its designspace — `ital` ≥ 0.5:
   *  of its italic variable font (report.italic), a file of its own without that axis. */
  async function checkAt(report, location, instance, signal) {
    const italic = Number(location.ital) >= 0.5;
    const it = report.italic;
    if (italic && !(it && it.file && it.source && it.source.url)) throw new ApiError(404, "This family has no italic variable font to check.");
    const font = italic ? await fontFile(it.source.url, signal) : await familyFont(report, signal);
    const loc = Object.assign({}, location);
    delete loc.ital;
    const opts = Object.assign(liveOptions(report, font.url), { location: loc });
    // the italic: reported, not judged (the check marks the report with ital 1)
    if (italic) { opts.file = it.file; opts.last_modified = it.source.last_modified; opts.italic = true; }
    if (instance) opts.instance = instance;
    return SQA.wasm.check(font.bytes, opts, signal);
  }
  const TOKEN_KEY = "sqa-admin-token";
  function getToken() { try { return sessionStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
  function setToken(t) { try { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage off */ } }

  function describe(status, msg, path) {
    const m = msg ? String(msg) : "";
    switch (status) {
      case 0: return "The Spacing QA server cannot be reached. Check the connection and try again.";
      case 400: return m ? cap(m) + "." : "The server did not accept the request.";
      case 401: return m ? cap(m) + "." : "This action needs the admin token.";
      case 403: return m ? cap(m) + "." : "This server does not allow that action.";
      case 404: return m ? cap(m) + "." : `Not found (${path}).`;
      case 409: return m ? cap(m) + "." : "Another operation is in progress.";
      case 413: return "The file is larger than the server accepts.";
      case 415: return m ? cap(m) + "." : "The file is not a font the server can read.";
      case 502: return m ? `Google Fonts could not be reached: ${m}` : "The server could not be reached (HTTP 502).";
      case 503: return m ? cap(m) + ". Try again in a moment." : "The server is busy. Try again in a moment.";
      default: return `The server had a problem (HTTP ${status})${m ? ": " + m : "."}`;
    }
  }
  const cap = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

  /**
   * fetch → JSON (or text). opts: method, json, body, contentType, admin,
   * signal. Throws ApiError with a message fit to show; AbortError passes.
   */
  async function api(path, opts) {
    const o = opts || {};
    if (STATIC) return staticApi(path, o);
    const init = { method: o.method || "GET", headers: {}, signal: o.signal, cache: "no-store" };
    if (o.json !== undefined) { init.headers["Content-Type"] = "application/json"; init.body = JSON.stringify(o.json); }
    else if (o.body !== undefined) { init.body = o.body; if (o.contentType) init.headers["Content-Type"] = o.contentType; }
    let token = o.admin ? getToken() : "";
    if (o.admin && !token && !o._retried && store.info && store.info.admin_required && store.info.admin_available !== false) {
      // the server says it needs the token: ask before sending (no 401 round trip)
      token = (await askToken(null)) || "";
      if (!token) throw new ApiError(401, "Cancelled: this action needs the admin token.");
      setToken(token);
      o._asked = true;
    }
    if (token) init.headers.Authorization = "Bearer " + token;
    let res;
    try { res = await fetch(path, init); }
    catch (e) {
      if (e && e.name === "AbortError") throw e;
      throw new ApiError(0, describe(0));
    }
    if (res.status === 401 && o.admin) {
      let said = "";
      try { const j = await res.clone().json(); said = j && j.error ? String(j.error) : ""; } catch (e) { /* no body */ }
      const refused = "The admin token was not accepted" + (said ? ` (the server says: ${said})` : "") + ".";
      if (token) setToken("");
      if (o._retried || o._asked) {
        if (o._asked && !o._retried) {
          // the token just typed was wrong: one more try
          const again = await askToken("That token was not accepted. Enter the admin token again.");
          if (!again) throw new ApiError(401, refused);
          setToken(again);
          return api(path, Object.assign({}, o, { _retried: true, _asked: false }));
        }
        throw new ApiError(401, refused);
      }
      const t = await askToken(token ? "That token was not accepted. Enter the admin token again." : null);
      if (!t) throw new ApiError(401, "Cancelled: this action needs the admin token.");
      setToken(t);
      return api(path, Object.assign({}, o, { _retried: true }));
    }
    if (!res.ok) {
      let msg = "";
      // the server's JSON {"error": …}; other bodies (a proxy's HTML page) are not shown
      try { const j = await res.json(); msg = j && j.error ? String(j.error) : ""; } catch (e) { /* not JSON */ }
      throw new ApiError(res.status, describe(res.status, msg, path), msg);
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("json")) {
      try { return await res.json(); }
      catch (e) { if (e && e.name === "AbortError") throw e; throw new ApiError(res.status, "The server sent a reply that could not be read."); }
    }
    return res.text();
  }
  const isAbort = (e) => e && e.name === "AbortError";

  // ------------------------------------------------------------------ dialogs
  function modal(build) {
    return new Promise((resolve) => {
      const dlg = h("dialog", { class: "modal" });
      let result = null;
      const done = (v) => { result = v; dlg.close(); };
      build(dlg, done);
      dlg.addEventListener("close", () => { dlg.remove(); resolve(result); });
      document.body.appendChild(dlg);
      if (typeof dlg.showModal === "function") dlg.showModal();
      else { dlg.setAttribute("open", ""); }
      const first = dlg.querySelector("input, button.primary");
      if (first) first.focus();
    });
  }
  function askToken(message) {
    return modal((dlg, done) => {
      const input = h("input", { type: "password", autocomplete: "off", "aria-label": "Admin token", id: "sqa-token" });
      const form = h("form", { method: "dialog" },
        h("h2", null, "Admin token"),
        h("p", null, message || "Scans and baseline rebuilds need the admin token this server was started with. It is kept for this browser tab only."),
        h("label", { for: "sqa-token", class: "sr-only" }, "Admin token"),
        input,
        h("div", { class: "row" },
          h("button", { type: "button", class: "btn", onclick: () => done(null) }, "Cancel"),
          h("button", { type: "submit", class: "btn primary" }, "Use token")));
      form.addEventListener("submit", (e) => { e.preventDefault(); done(input.value.trim() || null); });
      dlg.appendChild(form);
    });
  }
  function confirmDialog(title, text, okLabel) {
    return modal((dlg, done) => {
      dlg.appendChild(h("div", null,
        h("h2", null, title),
        h("p", null, text),
        h("div", { class: "row" },
          h("button", { type: "button", class: "btn", onclick: () => done(false) }, "Cancel"),
          h("button", { type: "button", class: "btn primary", onclick: () => done(true) }, okLabel || "Continue"))));
    }).then((v) => v === true);
  }

  // ------------------------------------------------------------------ tooltip
  const tip = (() => {
    let el = null;
    function ensure() {
      if (!el) { el = h("div", { class: "tooltip", "aria-hidden": "true" }); document.body.appendChild(el); }
      return el;
    }
    /** content: a Node, or {title, rows: [[label, value]], note} (text only). */
    function build(content) {
      if (content instanceof Node) return content;
      const frag = document.createDocumentFragment();
      if (content.title) frag.appendChild(h("div", { class: "t-title" }, content.title));
      (content.rows || []).forEach(([label, value]) => frag.appendChild(h("div", { class: "t-row" }, h("span", null, label), h("b", null, value))));
      if (content.note) frag.appendChild(h("div", { class: "t-note" }, content.note));
      return frag;
    }
    function place(x, y) {
      const r = el.getBoundingClientRect(), pad = 14;
      let left = x + pad, top = y + pad;
      if (left + r.width > innerWidth - 8) left = Math.max(8, x - r.width - pad);
      if (top + r.height > innerHeight - 8) top = Math.max(8, y - r.height - pad);
      el.style.left = left + "px";
      el.style.top = top + "px";
    }
    return {
      show(content, x, y) {
        ensure();
        clear(el);
        el.appendChild(build(content));
        el.classList.add("on");
        place(x, y);
      },
      /** Shows next to an element (keyboard focus). */
      showAt(content, node) {
        const r = node.getBoundingClientRect();
        this.show(content, r.right, r.top + r.height / 2);
      },
      hide() { if (el) el.classList.remove("on"); },
      /** Hover and focus tooltip on a node; fn returns the content. */
      attach(node, fn) {
        node.addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") this.show(fn(), e.clientX, e.clientY); });
        node.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") this.show(fn(), e.clientX, e.clientY); });
        node.addEventListener("pointerleave", () => this.hide());
        node.addEventListener("focus", () => this.showAt(fn(), node));
        node.addEventListener("blur", () => this.hide());
      },
    };
  })();
  window.addEventListener("scroll", () => tip.hide(), { passive: true });

  // ------------------------------------------------------------------ theme
  const THEME_KEY = "sqa-theme";
  const darkQuery = matchMedia("(prefers-color-scheme: dark)");
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");
  }
  function initTheme() {
    const btn = document.getElementById("theme-toggle");
    const text = btn.querySelector(".tt-text") || btn;
    const label = () => {
      const dark = currentTheme() === "dark";
      text.textContent = dark ? "Light" : "Dark";
      btn.setAttribute("aria-label", dark ? "Switch to the light theme" : "Switch to the dark theme");
      btn.title = dark ? "Light theme" : "Dark theme";
    };
    label();
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage off */ }
      label();
      document.dispatchEvent(new CustomEvent("sqa-theme"));
    });
    darkQuery.addEventListener("change", () => { label(); document.dispatchEvent(new CustomEvent("sqa-theme")); });
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  // ------------------------------------------------------------------ announcements
  let announceTimer = null;
  function announce(text) {
    const el = document.getElementById("announcer");
    if (!el) return;
    clearTimeout(announceTimer);
    el.textContent = "";
    announceTimer = setTimeout(() => { el.textContent = text; }, 60);
  }

  // ------------------------------------------------------------------ shared data
  const store = {
    info: null, infoAt: 0,
    families: null, familiesAt: 0,
    library: undefined, libraryId: undefined,
  };
  async function getInfo(force, signal) {
    if (!force && store.info && Date.now() - store.infoAt < 8000) return store.info;
    const v = await api("/api/info", { signal });
    store.info = v; store.infoAt = Date.now();
    renderFooter(v);
    return v;
  }
  async function getFamilies(force, signal) {
    if (!force && store.families && Date.now() - store.familiesAt < 20000) return store.families;
    const v = await api("/api/families", { signal });
    if (!Array.isArray(v)) throw new ApiError(500, "The family list could not be read.");
    store.families = v; store.familiesAt = Date.now();
    return v;
  }
  /** The library baseline, or null when there is none yet (404). */
  async function getLibrary(info, signal) {
    // a rebuilt baseline can keep its id (date and size): the build time tells them apart
    const id = info && info.baseline ? `${info.baseline.id} ${info.baseline.generated || ""}` : null;
    if (store.library !== undefined && store.libraryId === id) return store.library;
    if (!id && info) { store.library = null; store.libraryId = null; return null; }
    try {
      const lib = await api("/api/library", { signal });
      store.library = lib && lib.categories ? lib : null;
    } catch (e) {
      if (isAbort(e)) throw e;
      if (e.status === 404) store.library = null;
      else throw e;
    }
    store.libraryId = id;
    return store.library;
  }
  function renderFooter(info) {
    const f = document.getElementById("footer");
    if (!f || !info) return;
    clear(f);
    append(f, [
      "Spacing QA for Google Fonts — spacing compared with the Kinetikern2 model and its designer harness, and with the library's own norms. Distances are in units per 1000 em. ",
      h("span", { class: "muted" }, `${info.tool || "spacingqa"} · ${info.engine || "kinetikern2"}`),
      " · ", h("a", { href: "#/about" }, "How the check works"),
    ]);
  }

  /** The library category key of a Google Fonts category ("Sans Serif" → "SANS_SERIF"). */
  const categoryKey = (c) => (c ? String(c).toUpperCase().replace(/ /g, "_") : "ALL");
  /** "SANS_SERIF" → "Sans Serif fonts", as the server's messages name them. */
  // the norm groups: Google Fonts' categories, and connected scripts across them (library.rs norm_key)
  const categoryName = (k) => (!k || k === "ALL" ? "the library's fonts" : k === "CONNECTED" ? "connected scripts" : k.split("_").map((w) => cap(w.toLowerCase())).join(" ") + " fonts");
  /** The fit stops at Looseness ±6: tighter (looser) than anything the model makes. */
  const FIT_LIMIT = 6;
  const outOfRange = (v) => typeof v === "number" && Math.abs(v) >= FIT_LIMIT - 1e-6;
  /** A report compared with the model and its designer harness (false: one
   *  checked before the harness, with the bare model). */
  const withHarness = (r) => !!(r && r.harness);
  const SCRIPTS = { Arab: "Arabic", Armn: "Armenian", Beng: "Bengali", Cher: "Cherokee", Cyrl: "Cyrillic", Deva: "Devanagari", Ethi: "Ethiopic",
    Geor: "Georgian", Grek: "Greek", Gujr: "Gujarati", Guru: "Gurmukhi", Hang: "Hangul", Hans: "Simplified Chinese", Hant: "Traditional Chinese",
    Hebr: "Hebrew", Hira: "Hiragana", Jpan: "Japanese", Khmr: "Khmer", Knda: "Kannada", Kore: "Korean", Laoo: "Lao", Mlym: "Malayalam",
    Mong: "Mongolian", Mymr: "Myanmar", Orya: "Odia", Sinh: "Sinhala", Taml: "Tamil", Telu: "Telugu", Thaa: "Thaana", Thai: "Thai", Tibt: "Tibetan" };
  const scriptName = (code) => (code ? (SCRIPTS[code] ? `${SCRIPTS[code]} (${code})` : code) : "Latin");
  /** The category stats the server judges a font against (falls back to ALL when small). */
  function judgedCategory(lib, category) {
    if (!lib || !lib.categories) return null;
    const key = categoryKey(category);
    const min = (lib.thresholds && lib.thresholds.min_category) || 30;
    const c = lib.categories[key];
    if (c && c.n >= min) return { key, stats: c };
    if (lib.categories.ALL) return { key: "ALL", stats: lib.categories.ALL, fellBack: key !== "ALL" };
    return null;
  }
  const SIGMA = 1.4826;

  // ------------------------------------------------------------------ download
  function download(name, text, type) {
    const blob = new Blob([text], { type: type || "application/json" });
    const url = URL.createObjectURL(blob);
    const a = h("a", { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  // ------------------------------------------------------------------ small UI
  /** Segmented control: options [{label, value, disabled, title}]. */
  function segmented(label, options, value, onChange) {
    const seg = h("div", { class: "seg", role: "group", "aria-label": label });
    const buttons = options.map((opt) => {
      const b = h("button", { type: "button", "aria-pressed": String(opt.value === value), disabled: opt.disabled || null, title: opt.title || null }, opt.label);
      b.addEventListener("click", () => {
        if (b.getAttribute("aria-pressed") === "true") return;
        buttons.forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        onChange(opt.value);
      });
      return b;
    });
    append(seg, buttons);
    seg.setValue = (v) => buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(options[i].value === v)));
    return seg;
  }
  function message(el, text, kind) {
    el.className = "msg" + (kind ? " " + kind : "");
    el.textContent = text || "";
    if (text) el.setAttribute("role", kind === "error" ? "alert" : "status");
  }
  function loading(text, sub) {
    return h("div", { class: "loading", role: "status" },
      h("p", { class: "lede", style: { margin: 0 } }, text),
      h("div", { class: "progress indeterminate", "aria-hidden": "true" }, h("span")),
      sub ? h("p", { class: "small" }, sub) : null);
  }
  function errorBox(err, retry) {
    const box = h("div", { class: "callout lvl-ERROR", role: "alert" },
      h("h2", { style: { marginTop: 0, fontSize: "24px" } }, "Something went wrong"),
      h("p", null, err && err.message ? err.message : String(err)));
    if (retry) box.appendChild(h("p", null, h("button", { type: "button", class: "btn", onclick: retry }, "Try again")));
    return box;
  }

  Object.assign(SQA, {
    NS, h, s, clear, append, esc, fmt, signed, int, pct, plural, fmtDate, fmtDateTime, ago, duration, bytes, slug, fold, cap,
    axisNum, parseLocation, locationString, sameLocation, locationDiff, describeLocation,
    LEVELS, LEVEL_RANK, LEVEL_ICON, LEVEL_TEXT, badge, badgeHtml, PRESET_LABEL, presetChip, presetHtml,
    ApiError, api, isAbort, getToken, setToken, askToken, confirmDialog,
    CONFIG, STATIC, REBUILT, requestUrl, WHERE, exportUrl, staticData,
    tip, initTheme, currentTheme, cssVar, announce,
    store, getInfo, getFamilies, getLibrary, categoryKey, categoryName, judgedCategory, SIGMA, FIT_LIMIT, outOfRange, withHarness, scriptName,
    download, segmented, message, loading, errorBox, MINUS,
  });
})();
