/*
 * Spacing QA — how to use it (#/guide): reading reports and testing fonts,
 * and, for the Google Fonts team, the tagging data and reports of the whole
 * library: where they are, how to use them, how to produce them again.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h } = SQA;

  function view(ctx, params) {
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

    // ------------------------------------------------------------ the site: how to read a report
    // (the explanations the report sections link to: #/guide?read=<topic>)
    const read = (id, title) => h("h3", { id: "read-" + id, tabindex: "-1" }, title);
    SQA.append(prose, [
      s1,
      h("p", null, "The ", h("a", { href: "#/" }, "Library"), " lists every Google Fonts family",
        SQA.STATIC && SQA.REBUILT ? `, rebuilt ${SQA.REBUILT}` : "",
        ". Each row shows the level, the nearest preset and the numbers. Choose a family to see its report."),
      read("summary", "The summary"),
      h("p", null, "A report opens with its level, four key numbers and the issues behind the level. Each issue shows one sentence; More shows its numbers. The notes, folded, tell how the check treated the font. Then two lists show what is furthest from the expected spacing: the 10 sidebearings and the 10 pairs with the largest Model Gap. Every other section is folded under Details. A font that the check compares but does not judge has no such lists."),
      h("p", null, h("strong", null, "Model Gap"), " = actual − expected, in units per 1000 em. Plus is looser than expected; minus is tighter."),
      h("ul", null,
        h("li", null, "For a sidebearing, the expected value is the model's sidebearing plus what fonts of the same kind usually do for that side."),
        h("li", null, "For a pair, the expected gap is the model's gap plus the usual for that pair, plus what the pair's two sidebearings do to all their pairs. So a bad sidebearing shows once, in the sidebearing list, and not again in every pair it faces.")),
      h("p", null, "The pair list leaves out two kinds of pairs. Pairs with a glyph that the font classes as a mark: browsers put such a glyph on the previous letter, so its pairs do not show spacing. Pairs that the font kerns on purpose, in the direction of their gap, with the glyphs apart: these are in the folded list “Kerned on purpose”. In the sidebearing list, ! and ✕ mark sides beyond the WARN and FAIL limits. For a connected script, the summary also shows the joins that do not connect, as a browser sets them."),
      read("levels", "The levels"),
      h("p", null, "The levels follow fontspector. The check compares the font with the norm for its group: its Google Fonts category, or the connected scripts."),
      h("dl", { class: "defs" },
        h("dt", null, "INFO"), h("dd", null, "Nothing is far from the norm. The nearest preset is the designer's choice: the check reports it but does not judge it."),
        h("dt", null, "WARN"), h("dd", null, "Something is far from the norm: the overall tightness or the evenness (3.5 robust σ), 4 or more sidebearings (6 σ and 60 units each), 27 or more pairs (8 σ and 80 units), a designspace location, or a join that does not connect. Spacing is the designer's choice: a WARN points to what stands out."),
        h("dt", null, "FAIL"), h("dd", null, "Something is very far from the norm: the evenness (6 σ), the tightness (7 σ), or 3 or more sidebearings (12 σ and 150 units each)."),
        h("dt", null, "SKIP"), h("dd", null, "The check does not apply to the font."),
        h("dt", null, "ERROR"), h("dd", null, "The check could not read the font.")),
      h("p", null, "Some fonts have limits. A family whose primary script is not Latin cannot be FAIL. A connected script or a font measured along its slant is compared but not judged, except for its joins. A font whose best fit stops at the end of the Looseness range is out of range: the check shows the comparison but does not judge it."),
      read("numbers", "Numbers"),
      h("dl", { class: "defs" },
        h("dt", null, "Best-fit Looseness"), h("dd", null, "The overall tightness at which the model comes nearest to the font: −0.5 is the tight preset, 0 standard, +0.5 loose. For a connected script, the Looseness matches its joined letters."),
        h("dt", null, "Shape error"), h("dd", null, "How uneven the gaps are: the mean size of the residuals (see Shape error)."),
        h("dt", null, "Sidebearing error"), h("dd", null, "The mean difference between the font's sidebearings and the model's, after the overall offset."),
        h("dt", null, "Kerning match"), h("dd", null, "The correlation r between the designer's kerning and the model's, on the pairs the designer kerns, and how often the two kern in the same direction.")),
      read("differs", "Where it differs"),
      h("p", null, "This section asks one question: is the font off everywhere, or consistent except for a few glyphs? It compares each sidebearing with the font's typical side, after the norm for that side. A side stands out at 25 units and 3 times the font's usual spread; it stands far out at 50 units and 5 times. A font whose sides spread more than 9 in 10 fonts of its kind, or whose sides stand out by more than 1 in 5, is uneven throughout."),
      h("p", null, "For kerning, it compares each pair with the usual pair of its two glyphs, so the sidebearings cancel out. A pair stands out at 30 units and 4 times the usual spread. A glyph with 3 or more such pairs in one direction makes a group."),
      read("designspace", "Designspace"),
      h("p", null, "The check measures a variable font at Regular (the main report): weight 400, width 100, upright, every other axis at its default. It also measures every named instance, every edge (one axis at its minimum or maximum) and every corner (all axes at their extremes). A font with more than six axes gets the corners of weight, width and optical size only."),
      h("p", null, "Each location is compared with how much evenness fonts usually lose there, and with its neighbours along each axis. A named instance that differs from Regular in weight only can be WARN or FAIL. Other locations can be WARN at most. An italic location is judged against its upright."),
      read("presets", "Presets"),
      h("p", null, "Kinetikern2 has three presets: tight (Looseness −0.5), standard (0) and loose (+0.5). The distance to a preset is the mean difference of the pair gaps, the overall offset included. The nearest preset is a matter of overall tightness: the designer's choice."),
      read("settings", "Settings"),
      h("p", null, "The check sets up Kinetikern2 for each font as the plugin does. It measures an italic along its italic angle. It measures a design that leans without an italic angle along the slant of its stems, when that fits clearly better. It keeps the joins of a connected script as drawn. It keeps tabular figures at their width. It uses the designer harness and the punctuation conventions."),
      h("p", null, "The plugin differs in two places. Its designer harness is off until you switch it on. It writes class kerning with a 5-unit threshold and at most 30,000 entries; the check compares every pair with no threshold. Each row of the Settings table changes one setting and shows the result."),
      read("joins", "Joins"),
      h("p", null, "For a connected script, the join checker sets every a–z pair between two n's, as a browser does: contextual alternates and connectors included. It then finds where the strokes meet."),
      h("ul", null,
        h("li", null, "A join does not connect when two joining letters stay 3 units or more apart, along the shortest line. A letter side joins when it meets at least half the letters set next to it."),
        h("li", null, "Two strokes closer than 3 units nearly touch. A join that breaks if the spacing opens by less than 5 units is fragile."),
        h("li", null, "A hand where 1 in 20 such pairs or more do not meet joins in part, by design. There, only pairs whose sides both join 3 in 4 of their partners count. The other non-joins are style."),
        h("li", null, "The drawings show each word as a browser sets it. Kerning closes a gap only when the strokes do not cross and the kern is under 100 units; else a longer stroke or an alternate is needed.")),
      read("harness", "Designer harness"),
      h("p", null, "Kinetikern2 spaces from the outlines alone. Its designer harness adds what the designers of well-spaced fonts do differently from the model: more room inside parentheses and brackets and around / ? ! &, less around quotes, period, comma and hyphen. It learned this from the Google Fonts families that reviewers rate well spaced. The report compares the font with the model and its harness; this section shows the same comparison without the harness."),
      read("shape", "Shape error"),
      h("p", null, "Even spacing means that the white between letters looks the same from pair to pair. For every pair, the check measures the white as designed and as the model sets it at the font's own tightness. Their difference, after the overall offset, is the pair's residual. The shape error is the mean size of the residuals. A high value can be a style (scripts, lively display faces), a convention the model does not know, or pairs that are really uneven. It is not a grade."),
      read("specimen", "Specimen"),
      h("p", null, "The same text as designed and at each spacing, at one scale. Only the checked glyphs show, and the word space is 250 units."),
      read("sides", "Glyph sides"),
      h("p", null, "Every sidebearing against the model and against the norm for that side, as a chart and a table. The table puts the largest Model Gap first."),
      read("pairs", "Pairs"),
      h("p", null, "Every pair, drawn as designed and as the model sets it, largest Model Gap first. Choose the expected gap: the model and the norm, or the model alone. “far” marks a pair 8 σ and 80 units from the norm. The folded matrix shows every pair at once: a whole row or column in one colour is one sidebearing."),
      read("kerning", "Kerning"),
      h("p", null, "The designer's kerning against the model's: one point per kerned pair. Points near the diagonal agree."),
      read("skipped", "When a font is not checked"),
      h("p", null, "The check does not apply to monospaced fonts, to fonts whose letters use two or three widths (a multi-pitch design or a barcode), to designs whose glyphs touch by construction, to fonts without the basic Latin alphabet or without outlines, and to files that are not fonts."),
    ]);
    // a report's “How to read this” link: scroll to its part once the router has
    // scrolled to the top and the fonts have set the text (else it moves)
    const topic = params && params.get ? params.get("read") : null;
    const t = topic ? document.getElementById("read-" + topic) : null;
    if (t) {
      const go = () => { if (t.isConnected) { t.scrollIntoView({ block: "start" }); t.focus({ preventScroll: true }); } };
      setTimeout(() => (document.fonts && document.fonts.ready ? document.fonts.ready.then(go) : go()), 0);
    }

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
        h("li", null, "Review before you merge. A suggestion is a second opinion: it ranks how evenly a family's shapes are spaced within its category, and agrees with the human tags in direction (rank correlation +0.19 overall, +0.23 for sans serifs and +0.29 for serifs, on 1,123 families in October 2026), not in every case. Start with ", x("agreement.md"), " (the largest disagreements) and ", x("FAIL.md"), " and ", x("WARN.md"), " (the outliers). There are no suggestions for handwriting, where the measure does not follow the human tags, or for connected scripts, whose scores leave their joins out."),
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
