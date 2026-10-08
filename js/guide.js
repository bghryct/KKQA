/*
 * Spacing QA — how to use it (#/guide): reading reports and testing fonts,
 * and, for the Google Fonts team, the tagging data and reports of the whole
 * library: where they are, how to use them, how to produce them again.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h } = SQA;

  function view(ctx) {
    ctx.setTitle("Guide");
    const root = ctx.root;
    const cfg = SQA.CONFIG || {};
    const repo = SQA.STATIC && cfg.repo_url ? String(cfg.repo_url).replace(/\/+$/, "") : "";
    const request = SQA.requestUrl ? SQA.requestUrl("") : "";
    const x = (name) => h("a", { href: SQA.exportUrl(name) }, h("code", null, name));
    const out = (href, text) => h("a", { href, target: "_blank", rel: "noopener" }, text);
    const c = (t) => h("code", null, t);

    // "On this page": the router owns the hash, so the links scroll instead
    const sections = [];
    const section = (id, title) => {
      const el = h("h2", { id: "guide-" + id, tabindex: "-1" }, title);
      sections.push([el, title]);
      return el;
    };
    const s1 = section("site", "Reading the library and a report");
    const s2 = section("testing", "Testing fonts");
    const s3 = section("tagging", "For the Google Fonts team: tagging data and reports");
    const s4 = section("library", "Testing the whole library yourself");
    const toc = h("ul", { class: "guide-toc" }, sections.map(([el, title]) =>
      h("li", null, h("button", { type: "button", class: "linklike", onclick: () => { el.scrollIntoView({ block: "start" }); el.focus({ preventScroll: true }); } }, title))));

    root.appendChild(h("header", { class: "view-head" },
      h("p", { class: "eyebrow" }, "How to use it"),
      h("h1", { tabindex: "-1" }, "Guide"),
      h("p", { class: "lede" }, "How to read a report and check fonts, and, for the Google Fonts team, how to get the tagging data and reports for the whole library or produce them yourself. ",
        h("a", { href: "#/about" }, "About"), " explains what is measured and how the levels are set.")));
    const prose = h("div", { class: "prose" });
    root.appendChild(prose);
    SQA.append(prose, [h("p", { class: "small" }, "On this page:"), toc]);

    // ------------------------------------------------------------ the site
    SQA.append(prose, [
      s1,
      h("p", null, "The ", h("a", { href: "#/" }, "Library"), " lists every Google Fonts family, checked live from fonts.google.com",
        SQA.STATIC && SQA.REBUILT ? ` and rebuilt ${SQA.REBUILT}` : "",
        ". Each row shows the family's level, the preset it is closest to and its numbers. The chips above the table filter it by level; the search box finds a family. Choose a family for its report."),
      h("p", null, "A report has these sections:"),
      h("dl", { class: "defs" },
        h("dt", null, "Verdict"), h("dd", null, "The level and every reason for it, with the glyph sides and pairs that stand out."),
        h("dt", null, "Closest to"), h("dd", null, "The designer's spacing against Kinetikern2's tight, standard and loose presets, and where the font sits on the Looseness scale among its category. Which preset is closest is a matter of taste, so it is reported, never judged."),
        h("dt", null, "Specimen"), h("dd", null, "The same text as designed and as each preset spaces it, as lines or overlaid."),
        h("dt", null, "Glyph sides"), h("dd", null, "Every sidebearing against the model and against the library's usual for that side, as a chart and a table."),
        h("dt", null, "Pairs"), h("dd", null, "Every pair from the loosest to the tightest, or the reverse, each drawn: all pairs, or capitals, lowercase, mixed case or punctuation; against the model or the library's usual. A heat map shows every pair at once."),
        h("dt", null, "Kerning agreement"), h("dd", null, "The designer's kerning against the model's on the pairs the designer kerned."),
        h("dt", null, "Designspace"), h("dd", null, "For a variable family: every named instance, edge and corner, checked and judged, with charts along each axis.")),
      h("p", null, "Levels follow fontspector. A family is ", h("strong", null, "INFO"), " unless it falls far outside the norms of its Google Fonts category: then it is ", h("strong", null, "WARN"), " or, very far out, ", h("strong", null, "FAIL"), ". About lists the thresholds.")]);

    // ------------------------------------------------------------ testing
    SQA.append(prose, [
      s2,
      h("dl", { class: "defs" },
        h("dt", null, "Your own font"), h("dd", null, h("a", { href: "#/upload" }, "Check a font"), ": choose or drop a TTF or OTF. It is checked ",
          SQA.STATIC ? "in your browser, by the same code compiled to WebAssembly, and nothing is uploaded" : "on the server and not stored",
          ". A variable font is checked at its default location first; then any location of its designspace, or all of them, can be checked."),
        h("dt", null, "A family's current file"), h("dd", null, h("strong", null, "Re-check now"), " on a family's page checks the family's file from fonts.google.com again",
          SQA.STATIC ? ", in your browser. The result is yours alone: the published report does not change." : " and stores the new report."),
        h("dt", null, "Any location"), h("dd", null, "On a variable family's page, choose a row in ", h("strong", null, "Designspace"), ", or a point on its charts: that location is checked live and shown as a full report. Its address can be shared."),
        request
          ? [h("dt", null, "For everyone"), h("dd", null, h("strong", null, "Request a new check"), " on a family's page opens a GitHub issue (a GitHub account is needed). The site's workflow checks the family again, publishes the new report, answers on the issue and closes it, usually within 15 minutes; the page can take up to 10 minutes more to show it. ",
            out(request, "Request a refresh"), " asks for every family that changed on Google Fonts.")]
          : null,
        h("dt", null, "Keep a result"), h("dd", null, h("strong", null, "Download JSON"), " and ", h("strong", null, "Download Markdown"), " on any report, an uploaded font's included."))]);

    // ------------------------------------------------------------ tagging
    SQA.append(prose, [
      s3,
      h("p", null, "Everything the check produces for the whole library is published with ", SQA.STATIC ? "this copy" : "this site", SQA.STATIC && SQA.REBUILT ? ` and rebuilt ${SQA.REBUILT}` : "", ":"),
      h("dl", { class: "defs" },
        h("dt", null, x("tags.csv")), h("dd", null, "A suggested ", h("code", null, "/Quality/Spacing"), " weight for each family the check can judge, in the format of google/fonts' ", h("code", null, "tags/all/families.csv"), "."),
        h("dt", null, x("quant.csv")), h("dd", null, "The measurements as ", h("code", null, "/quant/spacing_*"), " tags: per family, and per location of a variable family (", h("code", null, "\"ital,wght@1,700\""), ")."),
        h("dt", null, x("skip.csv")), h("dd", null, h("code", null, "/Skip/Spacing"), " for the families the check cannot judge: monospaced, no Latin, or beyond the model's range."),
        h("dt", null, x("tags_metadata.csv")), h("dd", null, "The rows that register the new tags in google/fonts' ", h("code", null, "tags/tags_metadata.csv"), "."),
        h("dt", null, x("quality.csv")), h("dd", null, "One row per family: level, closest preset, every number, the suggestion and the reasons. For a spreadsheet."),
        h("dt", null, [x("FAIL.md"), " ", x("WARN.md"), " ", x("INFO.md"), " ", x("SKIP.md")]), h("dd", null, "Every family of a level as Markdown, with its reasons and a link to its report: ready for an issue or a review."),
        h("dt", null, x("agreement.md")), h("dd", null, "How the suggestions compare with the human ", h("code", null, "/Quality/Spacing"), " tags, and where they disagree most."),
        h("dt", null, x("index.json")), h("dd", null, "Every report without its per-glyph detail, for scripts.")),
      h("h3", null, "Tagging the library"),
      h("ol", null,
        h("li", null, "Take ", x("tags.csv"), ", ", x("quant.csv"), " and ", x("skip.csv"), ". They are in the format of google/fonts' ", h("code", null, "tags/all/"), ": four columns, ", h("code", null, "Family,Axes,Group/Tag,Weight"), ", no header, sorted, the Axes column empty for a whole family."),
        h("li", null, "Register the new tags once: add the rows of ", x("tags_metadata.csv"), " to google/fonts' ", h("code", null, "tags/tags_metadata.csv"), ". ", h("code", null, "/Quality/Spacing"), " is registered already."),
        h("li", null, "Review before you merge. A suggestion is a second opinion: it ranks how evenly a family's shapes are spaced within its category, and agrees with the human tags in direction (rank correlation about +0.2 overall, +0.3 for sans serifs), not in every case. Start with ", x("agreement.md"), " (the largest disagreements) and ", x("FAIL.md"), " and ", x("WARN.md"), " (the outliers). There are no suggestions for handwriting, where the measure runs against the human tags."),
        h("li", null, x("tags.csv"), " passes google/fonts' own tag tests (", h("code", null, ".ci/test_font_tags.py"), "); run them on the merged file.")),
      h("h3", null, "Reports"),
      h("p", null, "The Markdown files list each level with its reasons, worst first, and link to each family's report. Every report also downloads as JSON and Markdown from its page. ",
        SQA.STATIC && SQA.REBUILT ? `The files are rebuilt ${SQA.REBUILT}; each report says when its family was checked, and the library page when the copy was built.` : "Each report says when its family was checked.")]);

    // ------------------------------------------------------------ whole library
    SQA.append(prose, [
      s4,
      h("p", null, "From the command line, the ", c("spacingqa"), " tool runs the same check on the whole library or on font files: a QA run checks what changed on Google Fonts, writes the files above, says what got worse since the last run and fails a CI job when something does. The ",
        h("a", { href: "#/cli" }, "CLI"), " page walks through it, from getting the tool to running it every day and on pull requests to google/fonts."),
      repo
        ? [h("h3", null, "A copy of your own, on GitHub"),
          h("p", null, "This copy is published by a GitHub Actions workflow that runs that QA every day. To run your own, with your own site and exports:"),
          h("ol", null,
            h("li", null, out(repo + "/fork", "Fork the repository"), "."),
            h("li", null, "In the fork, set Settings → Pages → Build and deployment → Source to ", h("strong", null, "GitHub Actions"), "."),
            h("li", null, "Run Actions → ", h("strong", null, "Spacing QA daily refresh"), " → Run workflow. On ", h("strong", null, "stale"), ", the fork starts from this copy's reports and checks what changed since; on ", h("strong", null, "all"), ", it checks every family again, live from fonts.google.com (a few hours on GitHub's runner). Either way it publishes the site and its exports, and from then on runs every day.")),
          h("p", null, "Each run's summary, what got worse or better, is on the run's page under Actions and in the exports: ", h("a", { href: SQA.exportUrl("last-run.md") }, c("last-run.md")), ".")]
        : null]);
  }

  SQA.views = SQA.views || {};
  SQA.views.guide = view;
})();
