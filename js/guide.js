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
        ". Each row shows the family's level, the preset it is closest to and its numbers; “What each column and badge means”, above the table, explains them. The chips above the table filter it by level; the search box finds a family. Choose a family for its report."),
      h("p", null, "A report has these sections:"),
      h("dl", { class: "defs" },
        h("dt", null, "Verdict"), h("dd", null, "The level and every reason for it, with the glyph sides and pairs that stand out."),
        h("dt", null, "Where it differs"), h("dd", null, "Whether the font is off everywhere or mostly consistent with a few groups of glyphs that are not. Every scored side and pair is compared with what the fonts of its category usually do there (or with the model alone), so the model's own habits drop out. The sides that stand out are grouped by kind and direction (brackets looser on their inner sides, quotes tighter, a glyph that sits off-centre), each group drawn among other letters as designed and as the model sets it; every glyph is drawn between two bands coloured by how far its sides depart; and the pairs whose kerning departs from what the two glyphs' other pairs predict are grouped by glyph, drawn, and listed pair by pair. A font that kerns nothing is said so."),
        h("dt", null, "Closest to"), h("dd", null, "The designer's spacing against Kinetikern2's tight, standard and loose presets, with its designer harness and without it, and where the font sits on the Looseness scale among its category (a connected script: among the library's connected scripts). Which preset is closest is a matter of taste, so it is reported, never judged."),
        h("dt", null, "Settings"), h("dd", null, "The settings the check used for this font — along the italic angle for an italic (or along the slant its stems show, for a design that leans without declaring it), Keep joins for a connected script, tabular figures at their width, the designer harness — and the check with each setting the other way, on the same pairs: what measuring an italic upright, spacing a script's joined letters, the bare model or each category at its own Looseness would give, and how many joins each would keep."),
        h("dt", null, "Joins"), h("dd", null, "For a connected script: every a–z pair set inside a word as a browser sets it, and where the strokes meet — joins broken in the font (with the kerning that would join each, where kerning can), the pairs a partly connected hand leaves apart (listed as style), nearly touching, fragile and crossing joins, each drawn in the font — what the other join settings would break, drawn as designed and as they would set it, and drawing advice for each kept side."),
        h("dt", null, "Designer harness"), h("dd", null, "The same comparison with the bare model, from the same solves: whether the harness brings the model closer to this font's spacing or further from it, the glyph sides and pairs it moves (drawn), and whether each move is toward the designer."),
        h("dt", null, "Shape error, explained"), h("dd", null, "What the font's shape error is made of: one pair measured (the designer's gap, the model's gap, the overall offset and the residual they leave), how the residuals of all pairs spread, the glyphs that make most of it — drawn among other letters, as designed and as the model sets them — and whether it lies in the sidebearings or in the kerning."),
        h("dt", null, "Specimen"), h("dd", null, "The same text as designed and as each preset spaces it — and the best fit with the harness and without it — as lines or overlaid. The samples use the kernel's punctuation and symbols too."),
        h("dt", null, "Glyph sides"), h("dd", null, "Every sidebearing against the model and against the library's usual for that side, as a chart and a table."),
        h("dt", null, "Pairs"), h("dd", null, "Every pair of the GF Latin Kernel from the loosest to the tightest, or the reverse, each drawn: all pairs, or capitals, lowercase, mixed case or punctuation and symbols; against the model or the library's usual. Pairs with a glyph that is not scored (figures, the symbols fonts often draw at the figure width, the underscore) can be included. Choose how many rows to see (and show more at the end), or type a glyph or its name to see every pair it is in. A heat map shows every pair at once, the unscored glyphs last and veiled."),
        h("dt", null, "Kerning agreement"), h("dd", null, "The designer's kerning against the model's on the pairs the designer kerned."),
        h("dt", null, "Designspace"), h("dd", null, "For a variable family: every named instance, edge and corner, checked and judged, its italic's too (each italic location against its upright), with charts along each axis.")),
      h("p", null, "Levels follow fontspector. A family is ", h("strong", null, "INFO"), " unless it falls far outside the library's norms — those of its group (its Google Fonts category, or for a connected script whose joins are kept the library's connected scripts) at its main location, or how much evenness the library's families lose at a location of its designspace: then it is ", h("strong", null, "WARN"), " or, very far out, ", h("strong", null, "FAIL"), ". Joins broken in the font are ", h("strong", null, "WARN"), " on their own, and so is a location whose spacing jumps against its neighbours. About lists the thresholds.")]);

    // ------------------------------------------------------------ testing
    SQA.append(prose, [
      s2,
      h("dl", { class: "defs" },
        h("dt", null, "Your own font"), h("dd", null, h("a", { href: "#/upload" }, "Check a font"), ": choose or drop a TTF or OTF. It is checked ",
          SQA.STATIC ? "in your browser, by the same code compiled to WebAssembly, and nothing is uploaded" : "on the server and not stored",
          ". A variable font is checked at Regular, the main report's location, first; then any location of its designspace, or all of them, can be checked."),
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
        h("dt", null, x("quant.csv")), h("dd", null, "The measurements as ", h("code", null, "/quant/spacing_*"), " tags: per family (none for a family whose main font is an italic), and the Looseness, shape error, sidebearing error and kerning correlation per location of a variable family (", h("code", null, "\"ital,wght@1,700\""), ")."),
        h("dt", null, x("skip.csv")), h("dd", null, h("code", null, "/Skip/Spacing"), " for the families the check cannot judge: monospaced or on two or three fixed widths, glyphs that touch by construction, no Latin, no outlines, or beyond the model's range."),
        h("dt", null, x("tags_metadata.csv")), h("dd", null, "The rows that register the new tags in google/fonts' ", h("code", null, "tags/tags_metadata.csv"), "."),
        h("dt", null, x("quality.csv")), h("dd", null, "One row per family: level, closest preset, every number, the suggestion and the reasons. For a spreadsheet."),
        h("dt", null, [x("FAIL.md"), " ", x("WARN.md"), " ", x("INFO.md"), " ", x("SKIP.md"), " ", x("ERROR.md")]), h("dd", null, "Every family of a level as Markdown, with its reasons and a link to its report: ready for an issue or a review."),
        h("dt", null, x("agreement.md")), h("dd", null, "How the suggestions compare with the human ", h("code", null, "/Quality/Spacing"), " tags, and where they disagree most."),
        h("dt", null, x("index.json")), h("dd", null, "Every report without its per-glyph detail, for scripts.")),
      h("h3", null, "Tagging the library"),
      h("ol", null,
        h("li", null, "Take ", x("tags.csv"), ", ", x("quant.csv"), " and ", x("skip.csv"), ". They are in the format of google/fonts' ", h("code", null, "tags/all/"), ": four columns, ", h("code", null, "Family,Axes,Group/Tag,Weight"), ", no header, sorted, the Axes column empty for a whole family."),
        h("li", null, "Register the new tags once: add the rows of ", x("tags_metadata.csv"), " to google/fonts' ", h("code", null, "tags/tags_metadata.csv"), ". ", h("code", null, "/Quality/Spacing"), " is registered already."),
        h("li", null, "Review before you merge. A suggestion is a second opinion: it ranks how evenly a family's shapes are spaced within its category, and agrees with the human tags in direction (rank correlation +0.22 overall, +0.28 for sans serifs, on 1,163 families in October 2026), not in every case. Start with ", x("agreement.md"), " (the largest disagreements) and ", x("FAIL.md"), " and ", x("WARN.md"), " (the outliers). There are no suggestions for handwriting, where the measure does not follow the human tags, or for connected scripts, whose scores leave their joins out."),
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
