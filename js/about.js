/*
 * Spacing QA — how the check works (#/about), with the live thresholds.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h, fmt, isAbort } = SQA;

  function view(ctx) {
    ctx.setTitle("About");
    const root = ctx.root;
    const thrBox = h("div", null, SQA.loading("Reading the thresholds…"));
    root.appendChild(h("header", { class: "view-head" },
      h("p", { class: "eyebrow" }, "How the check works"),
      h("h1", { tabindex: "-1" }, "About Spacing QA"),
      h("p", { class: "lede" }, "Spacing QA measures how every Google Fonts family is spaced, with the Kinetikern2 spacing model and its designer harness as the yardstick and the library itself as the norm.")));
    const prose = h("div", { class: "prose" });
    root.appendChild(prose);
    prose.append(
      h("h2", null, "What is measured"),
      h("p", null, "Kinetikern2 spaces and kerns the glyphs of Google Fonts’ ", h("strong", null, "GF Latin Kernel"), " from their outlines alone — A–Z, a–z, 0–9 and the punctuation and symbols every Google Fonts family has, 114 glyphs, each against every other: 12,996 ordered pairs. Letters, punctuation and most symbols are scored (88 glyphs, 7,744 ordered pairs). Figures, the symbols fonts often draw at the figure width — $ ¢ £ ¥ € + − × ÷ = < > # ^ ~, at the figure width in two of three fonts with tabular figures — and the underscore, which joins its neighbours, are spaced, measured and drawn but not scored. In a CJK font, the punctuation of ambiguous East Asian width (® ° · – — ‘ ’ “ ” • … ™) follows CJK conventions, often full-width, and is not scored either. Reports made before the kernel cover the 76 glyphs of the core set (A–Z, a–z, 0–9 and 14 punctuation marks)."),
      h("p", null, "The model is set up for a font of each kind the way the Kinetikern2 plugin sets it up, so that what the check finds is about the font, not about a way of measuring that does not suit it. ", h("strong", null, "Italics"), " are measured along the italic angle they declare (3° or more), on their outlines sheared upright about half the x-height, as the plugin does. A design that leans without declaring an angle is measured along the slant its stems show where that fits it clearly better (a fifth less shape error or more), and the report says so: that is Spacing QA's own addition, as the plugin measures such a design as drawn. ", h("strong", null, "Tabular figures"), " keep their width. Two settings differ from the plugin's defaults on purpose: the designer harness is on (below; off by default in the plugin), and kerning is compared glyph pair by glyph pair, with no threshold and no budget (the plugin defaults to class kerning, a 5-unit threshold and 30,000 entries)."),
      h("p", null, h("strong", null, "Connected scripts"), " — families whose letters join — keep their joins, the plugin's default: every letter side that joins keeps the designer's sidebearing, and every pair of two joining sides the designer's kerning, so every join stays as drawn, and the Looseness is matched to the joined letters, as the plugin does with Keep joins. The model spaces everything else; the scores leave the kept joins out and cover the capitals, punctuation and symbols and the letters next to them (a letter next to a period) — figures are spaced, never scored. A family is connected when at least half of its a–z letters overlap at least half of their a–z partners, as the designer spaced and kerned them (the plugin's detector), or — Spacing QA's addition — when at least half of a–z have a right side that touches at least half of its partners as set inside words: strokes that meet flush, and joins made by contextual alternates and connector glyphs (Playwrite). The ", h("strong", null, "join checker"), " then sets every pair of a–z inside a word (n + pair + n) the way a browser does and finds where the strokes meet: joins broken in the font itself (two joining sides, each joining at least half the glyphs it is set next to, whose strokes do not meet: 3 units per 1000 em apart or more is a WARN, closer they nearly touch), fragile joins (less than 5 units of room to open), crossing strokes (white that neither letter has alone, or a counter changed by more than 1 %), and what spacing the joined letters' bodies instead would break. Where the kerning that would join a broken pair makes the strokes cross, or is more than 100 units, the report says that kerning is not the fix: a longer stroke or an alternate is. Matched pair by pair against exact outline geometry — 61,054 a–z pairs of 118 families, the families Spacing QA then reported as connected and 16 Playwrite families, set without contextual alternates — it agrees on 99.8 % of joins (every disagreement a gap under about two units, which its one-unit tolerance counts as touching), within a unit on 98.8 % of the room to open, within 4.5 units on 99.4 % of the room to close, and on 99.9 % of crossings. For each kept side the report gives drawing advice: where the model would put the letter's body, relative to the font's own rhythm. A script that joins consistently has its exceptions flagged: on Google Fonts the 138 consistent joiners leave at most 4.2 % of the pairs of their joining letters apart (about 1 in 24), the 7 partly connected hands 5.8 % or more (about 1 in 17). A hand where 1 in 20 or more do not meet joins partly by design: there only pairs whose sides both join at least three in four of their partners count as broken, and the rest are listed as style. Designs whose glyphs touch through a line, a grid, a background or an effect that runs through every glyph — underline, charted and guide-line fonts, whose figures touch the letters too (at least 60 % of the figures' sides touch at least half the a–z), which a script's do not — are not scripts: they are skipped, like monospaced fonts, because their spacing is part of the design (the plugin keeps every side that touches)."),
      h("p", null, "Each report also tries every setting the other way — measured upright (an italic) or along the slant its stems show (a design that leans without declaring it), the joined letters' bodies spaced or no join mode, the bare model, and the figures, punctuation and symbols each at their own Looseness — on the same pairs, so you can see what each setting does for that font."),
      h("p", null, "The yardstick is the model with its ", h("strong", null, "designer harness"), ": corrections for the few places where the model alone consistently spaces differently from the designers of the text fonts on Google Fonts that people rate well spaced (Sans Serif and Serif families tagged ", h("code", null, "/Quality/Spacing"), " 70 or more, at Regular and at their other weights). Measured against them the model sets parentheses, brackets and braces (their inner sides most), the slash and backslash, the bar, the question and exclamation marks, the ampersand, % * @ and the open sides of E, F, L and T too tight — more so at light weights — and quotes, period, comma, hyphen, en and em dashes, the degree sign and the diagonal sides of A, V, W, Y and K too loose; the harness moves each side by what those designers do, for the Looseness and the weight at hand, and corrects the pairs where they consistently do something else again, mostly with punctuation and symbols (on the families it was not learned from, it brings the model 19 % closer to the designers, and the punctuation pairs 10 units or more off from 3,010 to 57). Display and handwriting designers space punctuation more openly still, so a family of those categories also gets its category's punctuation, learned from the display and handwriting families rated 70 or more. Without the harness every font would show the same few differences, which say more about the model than about the font. It is the same harness Kinetikern2 offers designers in Glyphs and RoboFont, where it is off by default and can be switched on. Every report compares the font both ways — with the harness and with the bare model, from the same solves — and its ", h("strong", null, "Designer harness"), " section shows the difference: the shape error, the closest preset and the other numbers either way, the glyph sides and pairs the harness moves, and whether each move is toward the font's designer or away. The library page shows it for every family. ", h("code", null, "spacingqa check --no-harness"), " compares with the bare model alone."),
      h("p", null, "The unit of comparison is the ", h("strong", null, "gap"), " of a pair — the white between the two ink shapes:"),
      h("div", { class: "formula" }, "gap = right sidebearing (left glyph)\n    + left sidebearing (right glyph)\n    + kerning of the pair"),
      h("p", null, "Every length is in units per 1000 em, so fonts with different units per em compare directly."),
      h("dl", { class: "defs" },
        h("dt", null, "Presets"), h("dd", null, "The model at three Looseness settings: Tight (−0.5), Standard (0) and Loose (+0.5)."),
        h("dt", null, "Distance"), h("dd", null, "The mean absolute difference between the designer's gaps and a preset's, overall offset included. The nearest preset is the one the font is “closest to”."),
        h("dt", null, "Offset"), h("dd", null, "The mean of designer gap − preset gap: positive when the font is set looser than the preset."),
        h("dt", null, "Best-fit Looseness"), h("dd", null, "The Looseness at which the model fits the font best — the font's overall tightness on the model's scale. A connected script is matched to its joined letters instead, as the plugin does with Keep joins (“matched to the kept joins”), so its tightness is the script's own rhythm and not a fit pulled by swash capitals and punctuation."),
        h("dt", null, "Shape error"), h("dd", null, "At the best fit, with the overall offset taken out: the mean absolute difference of the gaps — the average size of the pair residuals below. It is how far the spacing departs from even spacing of these shapes, the part that can point at problems. Every report explains its own: one pair measured, how all the residuals spread, the glyphs that make most of it (drawn among other letters, as designed and as the model sets them), and whether it lies in the sidebearings or in the kerning."),
        h("dt", null, "Sidebearing error"), h("dd", null, "The mean absolute difference of each side's sidebearing from the model's, offset removed."),
        h("dt", null, "Kerning agreement"), h("dd", null, "On the pairs the designer kerned: the correlation r of the designer's kerning with the model's, and the share kerned in the same direction."),
        h("dt", null, "Pair residual"), h("dd", null, "Designer gap − model gap − offset for every pair: positive when the font sets the pair looser than the model would at the font's own tightness.")));

    prose.append(
      h("h2", null, "Levels"),
      h("p", null, "Levels follow fontspector: SKIP, PASS, INFO, WARN, FAIL and ERROR. How tight or loose a font is spaced is the designer's choice, so the check reports ", h("strong", null, "INFO"), " by default — it says which preset the font is closest to and how it compares, without judging."),
      h("p", null, "A font is raised to ", h("strong", null, "WARN"), " or ", h("strong", null, "FAIL"), " where it falls far outside the library itself — the Google Fonts collection, per category — measured with robust statistics: the median and the median absolute deviation (MAD), with robust σ = 1.4826 × MAD, so that a few extreme fonts do not move the norms. A variable font's locations can raise it too (below). A connected script whose joins are kept is compared with the library's other connected scripts, and that comparison is reported, not judged: what the model compares in a script is mostly swash capitals and punctuation, where it disagrees with script designers by convention. One finding does not depend on the library: joins broken in a connected script (two joining letters whose strokes do not meet, 3 units per 1000 em apart or more, as a browser sets them) are a WARN — an error in the font, not a matter of taste. Without a library baseline nothing is judged against the norms, so only broken joins raise a level. A font set tighter or looser than anything the model makes (its fit stops at ±6) has its comparison with the model reported, not judged."),
      h("p", null, "SKIP: monospaced fonts and fonts whose every letter has one of two or three widths, such as the multi-pitch Trispace or a barcode (their spacing is set by the widths), designs whose glyphs touch by construction (a line, a grid, a background or an effect through every glyph), fonts without the basic Latin alphabet, fonts without outlines and files that cannot be read as fonts. ERROR: the font could not be downloaded or measured."),
      h("h3", null, "Thresholds of this server"),
      thrBox);

    const dsThr = h("span", null, "0.5");
    const dsSpike = h("span", null, "1.8 times theirs and 10 units per 1000 em above");
    prose.append(
      h("h2", null, "Variable fonts"),
      h("p", null, "A variable family's main report is Regular, the way Google Fonts serves it: weight 400, width 100 and upright where the axes reach them, every other axis at its default. The check also goes everywhere a user can set the font — across its ", h("strong", null, "designspace"), ":"),
      h("dl", { class: "defs" },
        h("dt", null, "Named instances"), h("dd", null, "Every instance the font names: Thin to Black, Condensed Bold, Italic, Mono Casual…"),
        h("dt", null, "Edges"), h("dd", null, "Every axis at its minimum and at its maximum, the other axes where the main report checks the font (Regular: weight 400, width 100, upright; the rest at their defaults)."),
        h("dt", null, "Corners"), h("dd", null, "Every corner of the designspace: all its axes at their extremes together, such as wght 900 · slnt −10, the Black Italic corner. A font with more than six axes (Roboto Flex has thirteen) would have thousands, so it gets the corners of weight, width and optical size, and each other axis's minimum and maximum at the lightest and the boldest weight.")),
      h("p", null, "Each location is measured like the main report: the closest preset, the best-fit Looseness, the shape and sidebearing errors and the kerning correlation. They are judged from those numbers alone, so a new baseline judges them again without a new scan:"),
      h("ul", null,
        h("li", null, "Evenness: how much a location's shape error exceeds the main report's (Regular's), against how much evenness the library's families usually lose at that kind of location — a named instance, an edge or a corner. A named instance that differs from the main report in weight alone can be WARN or FAIL. An edge, a corner or a named instance at one of them is at most WARN, as is one at another width, optical size or custom-axis value than the main report (families space those differently on purpose; YEAR, MORF… may be meant to distort the letters), and any location of a family whose primary script is not Latin."),
        h("li", null, "Overall tightness is reported, never judged: weights, widths and optical sizes are meant to be spaced differently."),
        h("li", null, "Italic and slanted locations, measured along their italic angle, are compared with the upright location they go with (an italic Bold with the upright Bold), against how much the library's italics lose against their uprights, and raise at most WARN, jumps along their own axes included. Those measured upright (in reports from before, or with no declared angle) are reported only, and so are fits that stop at the limit of the Looseness range."),
        h("li", null, "Along every axis, the locations that differ only on it are compared with their neighbours: a location whose Looseness is off the line through its two neighbours by ", dsThr, " or more, or whose shape error is ", dsSpike, " both, is a WARN — an interpolation problem, or a master spaced apart."),
        h("li", null, "Locations where every letter has the same width (a MONO axis, for one) are skipped: monospaced. So are locations where every letter has one of two or three widths."),
        h("li", null, "A family whose italics are a variable font of their own is checked across the italic's designspace too — its named instances, edges and corners — each against its upright, and its center with every setting tried the other way.")),
      h("p", null, "A raised location raises the family's level. On a family's page the ", h("strong", null, "Designspace"), " section lists every location with its numbers and draws the spacing along each axis; any location — a listed one, or any other point of the designspace — can be picked and is checked live ",
        SQA.STATIC ? "in your browser" : "on the server", ", with its full report, in a few seconds. It is not stored, and its address can be shared. An uploaded variable font is checked at Regular, the main report's location, first; its locations can then be checked one by one, or all at once."));

    const x = (name) => h("a", { href: SQA.exportUrl(name) }, name);
    prose.append(
      h("h2", null, "For the Google Fonts tagger"),
      h("p", null, "The tagging files use the formats of google/fonts' ", h("code", null, "tags/all/"), ": four columns and no header — ", h("code", null, "Family,Axes,Group/Tag,Weight"), ", the Axes column empty for the whole family or a location such as ", h("code", null, "wght@400"), "."),
      h("ul", null,
        h("li", null, x("tags.csv"), " — a machine suggestion for the human-assessed ", h("code", null, "/Quality/Spacing"), " tag of ", h("code", null, "families.csv"), ". A family's evenness rank in its category is mapped onto the distribution of the human tags (weights 10–100 in steps of 10, median 70); a WARN or FAIL on evenness, glyph sides or pairs caps it at 60 or 40. Only families the check can judge, and none for handwriting, where the measure does not follow the human tags, or for connected scripts, whose scores leave their joins out. It passes the tests in google/fonts' ", h("code", null, ".ci/test_font_tags.py"), "."),
        h("li", null, x("quant.csv"), " — measured values in the format of ", h("code", null, "quant.csv"), ": ", h("code", null, "/quant/spacing_looseness"), " (a connected script's matched to its joined letters), ", h("code", null, "_shape_error"), ", ", h("code", null, "_sidebearing_error"), ", ", h("code", null, "_kerning_error"), ", ", h("code", null, "_kerning_correlation"), " and ", h("code", null, "_evenness"), " at the weight checked; a variable family also the Looseness, shape error, sidebearing error and kerning correlation of every other location checked, its italic's written as google/fonts writes them (", h("code", null, "\"ital,wght@1,700\""), "). A family whose main font is an italic has no rows."),
        h("li", null, x("skip.csv"), " — suggested ", h("code", null, "/Skip/Spacing"), " signals, in the format of ", h("code", null, "skip.csv"), ", for families the check cannot judge."),
        h("li", null, x("tags_metadata.csv"), " — the rows google/fonts' ", h("code", null, "tags/tags_metadata.csv"), " needs to register the new ", h("code", null, "/quant/spacing_*"), " and ", h("code", null, "/Skip/Spacing"), " tags (", h("code", null, "/Quality/Spacing"), " is registered already).")),
      h("p", null, "On the 1,151 judged families that carry a human ", h("code", null, "/Quality/Spacing"), " tag (October 2026), the measured evenness has a rank correlation of +0.21 overall, +0.24 to +0.28 for display, sans serif and serif faces and +0.04 for handwriting: it agrees in direction but measures one thing, how evenly the shapes are spaced, while people rate spacing as a whole. The suggestions are a second opinion; the families where the two disagree most are worth a look. ", x("quality.csv"), " has one row per family with its level, numbers, suggestion and reasons; ", x("FAIL.md"), ", ", x("WARN.md"), ", ", x("INFO.md"), ", ", x("SKIP.md"), " and ", x("ERROR.md"), " list every family of a level as Markdown."));

    prose.append(
      h("h2", null, "In CI and in fontspector"),
      h("p", null, "Check font files with the library baseline, and fail the job at WARN or above:"),
      h("div", { class: "formula" }, "spacingqa check FONT.ttf --baseline library.json --error-code-on warn"),
      h("p", null, "As a fontspector plugin (the baseline is built into the plugin; ", h("code", null, "SPACINGQA_BASELINE"), " names another):"),
      h("div", { class: "formula" }, "fontspector --plugin ./spacingqa-fontspector -p spacingqa Font.ttf"),
      h("p", null, "Next to a ", h("code", null, "METADATA.pb"), " in a google/fonts checkout, the family's category picks the library category to compare with (a connected script whose joins are kept is compared with the library's connected scripts). ", h("code", null, "spacingqa check --category \"Serif\""), " sets it by hand."),
      h("h2", null, "This site's data"),
      SQA.STATIC
        ? h("p", null, "This is the published copy: every family's report, the baseline and the exports are files, written by ", h("code", null, "spacingqa site"), " after a live scan of fonts.google.com and rebuilt by a scheduled scan (GitHub Actions)",
          SQA.REBUILT ? ` ${SQA.REBUILT}, which checks the new and changed families. It was last rebuilt ${SQA.fmtDateTime(SQA.CONFIG.generated)}` : "",
          ". Fonts you check here — uploads and Re-check — are checked in your browser by the same Rust code, compiled to WebAssembly; nothing is uploaded.",
          SQA.requestUrl("") ? " Anyone with a GitHub account can also ask for a family to be checked again and the new report published for everyone: Request a new check on its page opens a GitHub issue, which the workflow answers and closes, usually within 15 minutes." : "")
        : h("p", null, "The library table lists the live Google Fonts catalog; a family without a current report is checked when its page is opened. The library baseline is rebuilt from the stored reports after a scan (", h("code", null, "spacingqa baseline"), "). Uploaded fonts are checked in memory and never stored."));

    (async () => {
      try {
        const info = await SQA.getInfo(false, ctx.signal);
        const lib = await SQA.getLibrary(info, ctx.signal).catch((e) => { if (isAbort(e)) throw e; return null; });
        if (!ctx.alive()) return;
        thrBox.replaceChildren(thresholds(info, lib));
        // this server's thresholds for jumps between neighbouring locations
        const t = Object.assign({}, info.thresholds || {}, (lib && lib.thresholds) || {});
        if (Number.isFinite(t.instance_jump)) dsThr.textContent = fmt(t.instance_jump, 2).replace(/0$/, "");
        if (Number.isFinite(t.instance_spike_ratio) && Number.isFinite(t.instance_spike_units)) dsSpike.textContent = `${fmt(t.instance_spike_ratio, 1)} times theirs and ${fmt(t.instance_spike_units, 0)} units per 1000 em above`;
      } catch (e) {
        if (isAbort(e) || !ctx.alive()) return;
        thrBox.replaceChildren(h("p", { class: "msg error" }, "The thresholds could not be read: " + e.message));
      }
    })();
  }

  function thresholds(info, lib) {
    const t = info.thresholds || {};
    const n = (v, d) => (v === undefined || v === null ? "–" : fmt(v, d === undefined ? 1 : d));
    const rows = [
      ["Shape error", `WARN at ${n(t.shape_warn_z)} robust σ above the category median, FAIL at ${n(t.shape_fail_z)} σ.`],
      ["Overall tightness", `Best-fit Looseness ${n(t.looseness_warn_z)} robust σ from the category median, either way: WARN; ${n(t.looseness_fail_z)} σ: FAIL. A fit that stops at the limit of the range (±${SQA.FIT_LIMIT}) — scripts and designs whose letters touch or overlap — is reported (INFO), not judged; broken joins and the designspace's locations still are.`],
      ["Glyph sides", `A side is far from the norm at ${n(t.side_warn_z)} σ and ${n(t.side_warn_units, 0)} units per 1000 em from the median for that side (σ at least 2 units); ${n(t.side_warn_count, 0)} such sides: WARN.` +
        (t.side_fail_z !== undefined ? ` A side at ${n(t.side_fail_z)} σ and ${n(t.side_fail_units, 0)} units is extreme: one extreme side is WARN${t.side_fail_count ? `, ${n(t.side_fail_count, 0)} are FAIL` : ""}.` : "")],
    ];
    if (t.pair_z !== undefined) rows.push(["Pairs", `A pair is unusual at ${n(t.pair_z)} σ and ${n(t.pair_units, 0)} units from the median for that pair (σ at least 3 units); ${n(t.pair_warn_count, 0)} unusual pairs: WARN. A pair with a glyph side that is itself far from its norm counts under that side, not again here.`]);
    if (t.fullwidth_em !== undefined) rows.push(["Full-width quotes", `Quotes of ambiguous East Asian width (‘ ’ “ ”) at least ${n(t.fullwidth_em, 1)} em wide — a CJK convention — are not compared with the norms of proportional fonts.`]);
    rows.push(["Primary script not Latin", "The family's Latin is compared with the Latin norms, but its level stops at WARN: it follows the primary script's conventions."]);
    rows.push(["Categories", `Each font is compared with its Google Fonts category, and a connected script whose joins are kept with the library's connected scripts; groups with fewer than ${n(t.min_category, 0)} fonts in the norms use the whole library.`]);
    const ex = lib && lib.excluded ? Object.entries(lib.excluded).filter(([, k]) => k > 0).sort((a, b) => b[1] - a[1]) : [];
    return h("div", null,
      h("dl", { class: "defs" }, rows.map(([k, v]) => [h("dt", null, k), h("dd", null, v)])),
      h("p", { class: "small" }, info.baseline
        ? `Baseline ${info.baseline.id}, built ${SQA.fmtDateTime(info.baseline.generated)}: norms from ${SQA.int(info.baseline.fonts)} upright, proportional, Latin-primary families within the model's range${ex.length ? `; left out: ${ex.map(([k, c]) => `${SQA.int(c)} ${k}`).join(", ")}` : ""}.`
        : "No baseline yet: these thresholds apply once one is built; until then nothing is judged against the norms, and only joins broken in the font raise a level."));
  }

  SQA.views = SQA.views || {};
  SQA.views.about = view;
})();
