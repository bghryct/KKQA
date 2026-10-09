/*
 * Spacing QA — the command line (#/cli): the same check as a QA tool for the
 * whole library, run by hand, every day or in CI, and for font files.
 */
(function () {
  "use strict";
  const SQA = window.SQA;
  const { h } = SQA;

  function view(ctx) {
    ctx.setTitle("Command line");
    const root = ctx.root;
    const cfg = SQA.CONFIG || {};
    const repo = SQA.STATIC && cfg.repo_url ? String(cfg.repo_url).replace(/\/+$/, "") : "";
    const raw = repo ? `${repo}/raw/main/tool` : "";
    const code = (text) => h("div", { class: "formula" }, text);
    const out = (href, text) => h("a", { href, target: "_blank", rel: "noopener" }, text);
    const c = (t) => h("code", null, t);
    const tool = repo ? "./spacingqa" : "spacingqa";

    const sections = [];
    const section = (id, title) => {
      const el = h("h2", { id: "cli-" + id, tabindex: "-1" }, title);
      sections.push([el, title]);
      return el;
    };
    const sGet = section("get", "1. Get the tool");
    const sStart = section("start", "2. Start from the published reports");
    const sRun = section("run", "3. A QA run");
    const sOften = section("often", "4. Running it every day, and in CI");
    const sFiles = section("files", "5. Checking font files");
    const sOut = section("outputs", "6. What a run writes");
    const sNorms = section("norms", "7. The norms");
    const toc = h("ul", { class: "guide-toc" }, sections.map(([el, title]) =>
      h("li", null, h("button", { type: "button", class: "linklike", onclick: () => { el.scrollIntoView({ block: "start" }); el.focus({ preventScroll: true }); } }, title))));

    root.appendChild(h("header", { class: "view-head" },
      h("p", { class: "eyebrow" }, "Command line"),
      h("h1", { tabindex: "-1" }, "Testing from the command line"),
      h("p", { class: "lede" }, "This site shows the results; the ", c("spacingqa"), " tool makes them. It checks the whole library or any font files, writes the tagging files and the reports, says what got worse since the last run, and fails a CI job when something does. It is the same check as the site, with the same levels.")));
    const prose = h("div", { class: "prose" });
    root.appendChild(prose);
    SQA.append(prose, [h("p", { class: "small" }, "On this page:"), toc]);

    // ------------------------------------------------------------ get it
    SQA.append(prose, [sGet,
      repo
        ? [h("p", null, "On a Mac with Apple silicon, download it from ", out(`${repo}/tree/main/tool`, "this site's repository"), ". The library's norms are built in: nothing else is needed.")]
        : h("p", null, "Build it from the source (SpacingQA/README.md): ", c("cargo build --release -p spacingqa"), "."),
      repo ? code(`curl -fsSL -o spacingqa ${raw}/spacingqa\nchmod +x spacingqa\n${tool} --version`) : null,
      repo ? h("p", { class: "small" }, "curl does not mark the file as downloaded; a copy saved by a browser needs ", c("xattr -d com.apple.quarantine spacingqa"), " before macOS runs it. The tool is built for macOS on Apple silicon; for Linux, ask the repository's owner for a build.") : null,
      h("p", null, c(`${tool} --help`), " lists the commands, and ", c(`${tool} qa --help`), " the options of one.")]);

    // ------------------------------------------------------------ start
    SQA.append(prose, [sStart,
      h("p", null, "A run keeps its reports in a data folder (here ", c("spacingqa-data"), ") and checks only what changed since. Start it from the reports this site publishes, and the first run takes seconds instead of an hour:"),
      repo
        ? code(`git clone --depth 1 ${repo}.git kkqa\n${tool} import-site --site kkqa --data spacingqa-data`)
        : code(`${tool} import-site --site path/to/the/published/copy --data spacingqa-data`),
      h("p", null, "Or check the whole library from nothing: every family and every location of the variable ones, live from fonts.google.com, about an hour on an M1:"),
      code(`${tool} qa --data spacingqa-data --mode all`)]);

    // ------------------------------------------------------------ a run
    SQA.append(prose, [sRun,
      code(`${tool} qa --data spacingqa-data`),
      h("p", null, "One run:"),
      h("ol", null,
        h("li", null, "reads the Google Fonts catalog and checks the families that are new or changed on fonts.google.com since their report, the ones that could not be checked, and those missing a location;"),
        h("li", null, "judges every report against the same norms, so that one run compares with the next;"),
        h("li", null, "writes the tagging files, the reports and a summary of the run into ", c("spacingqa-data/qa/"), ";"),
        h("li", null, "prints the levels and every family that got worse or better since the last run, and sets the exit code.")),
      h("p", null, "With nothing new on Google Fonts it takes a few seconds. What it prints, for instance:"),
      code("1,950 families, 2 checked in this run, baseline 2026-10-08-1419-1115: 12 FAIL (+1), 184 WARN (−1), 1,653 INFO, 101 SKIP\n               worse: Sarina INFO → FAIL  (evenness: Shape error 107.3 units per 1000 em …)\n              better: Lato WARN → INFO"),
      h("dl", { class: "defs" },
        h("dt", null, c("--mode")), h("dd", null, c("stale"), " (the default) checks what changed; ", c("all"), " every family; ", c("none"), " nothing: judge, write and compare only."),
        h("dt", null, c("--families")), h("dd", null, "Only these families, by name or slug: ", c("--families \"Lato,Roboto Flex\""), "."),
        h("dt", null, c("--source")), h("dd", null, "A google/fonts checkout instead of the live library, for instance before a release: ", c("--source ~/fonts"), "."),
        h("dt", null, c("--fail-on")), h("dd", null, "When the exit code is 1: ", c("new-fail"), " (a family is FAIL that was not; the default), ", c("new-warn"), " (a family got worse), ", c("fail"), " (any FAIL), ", c("warn"), " (any WARN or FAIL), ", c("never"), ". The exit code is 2 when the tool could not run."),
        h("dt", null, c("--out")), h("dd", null, "Where the files go (default ", c("DATA/qa"), ")."),
        h("dt", null, c("--gf-tags")), h("dd", null, "google/fonts' ", c("tags/all/families.csv"), ": adds ", c("agreement.md"), ", the comparison with the human tags."),
        h("dt", null, c("--site-url")), h("dd", null, "Links each family in the Markdown to its report on a site, such as ", c(cfg.public_url || "https://example.github.io/spacing-qa/"), "."),
        h("dt", null, c("--max-minutes")), h("dd", null, "Stops taking new families after so long; the next run checks the rest."),
        h("dt", null, c("--workers")), h("dd", null, "Families checked at once (6)."))]);

    // ------------------------------------------------------------ often
    SQA.append(prose, [sOften,
      h("p", null, "Every morning on a Mac, with cron (", c("crontab -e"), "):"),
      code(`15 7 * * * cd ~/spacing-qa && ./spacingqa qa --data spacingqa-data --fail-on never >> qa.log 2>&1`),
      repo
        ? h("p", null, "This site is such a run: ", out(`${repo}/blob/main/.github/workflows/spacingqa-refresh.yml`, "its GitHub Actions workflow"), " checks what changed every day, writes the summary of the run to the run's page under ", out(`${repo}/actions`, "Actions"), ", and publishes it with this site: ",
          h("a", { href: SQA.exportUrl("last-run.md") }, c("last-run.md")), " and ", h("a", { href: SQA.exportUrl("last-run.json") }, c("last-run.json")), ". Fork the repository to run your own (Guide, ", h("a", { href: "#/guide" }, "Testing the whole library yourself"), ").")
        : null,
      h("p", null, "On pull requests to google/fonts, check the font files a pull request adds or changes, with the result in the job's summary. ",
        repo ? ["The workflow is ", out(`${repo}/blob/main/tool/github-actions-google-fonts.yml`, "tool/github-actions-google-fonts.yml"), ": copy it into google/fonts' ", c(".github/workflows/"), ". It runs on GitHub's macOS runner, which public repositories use for free, and fails the job on FAIL. Its core:"] : "Its core:"),
      code(`git diff --name-only -z --diff-filter=AM "origin/$BASE..." -- '*.ttf' \\\n  | xargs -0 ${tool} check --format markdown --error-code-on fail >> "$GITHUB_STEP_SUMMARY"`),
      h("p", null, "In a google/fonts checkout, the check reads each family's ", c("METADATA.pb"), " next to the font for its category and primary script.")]);

    // ------------------------------------------------------------ files
    SQA.append(prose, [sFiles,
      code(`${tool} check MyFont-Regular.ttf --category "Sans Serif"\n${tool} check ofl/lato/*.ttf --format markdown\n${tool} check fonts/*.ttf --error-code-on warn --json reports.json`),
      h("p", null, "Each font is judged against the library's norms for its category (", c("--category"), ", or the ", c("METADATA.pb"), " next to it). A variable font is checked at every named instance, edge and corner (", c("--no-instances"), ": its default location only). ",
        c("--format"), " is ", c("text"), ", ", c("markdown"), " (the report this site downloads) or ", c("json"), "; ", c("--json FILE"), " also writes the full reports. The exit code is 1 when a font is at the level of ", c("--error-code-on"), " (", c("fail"), " by default) or above.")]);

    // ------------------------------------------------------------ outputs
    SQA.append(prose, [sOut,
      h("p", null, "In ", c("spacingqa-data/qa/"), " after a run:"),
      h("dl", { class: "defs" },
        h("dt", null, c("summary.md"), " ", c("summary.json")), h("dd", null, "The run: the levels and how they moved, the families that got worse or better, the ones checked, the ones that could not be checked, and what the designer harness does across the library (for how many families the model with it is closer to the designer's spacing than without it). The Markdown fits a CI job summary or an issue."),
        h("dt", null, [c("tags.csv"), " ", c("quant.csv"), " ", c("skip.csv"), " ", c("tags_metadata.csv")]), h("dd", null, "The tagging data, in the formats of google/fonts' ", c("tags/all/"), ". The ", h("a", { href: "#/guide" }, "Guide"), " says how to use them."),
        h("dt", null, c("quality.csv")), h("dd", null, "One row per family: level, closest preset, every number, the suggestion and the reasons."),
        h("dt", null, [c("FAIL.md"), " ", c("WARN.md"), " ", c("INFO.md"), " ", c("SKIP.md"), " ", c("ERROR.md")]), h("dd", null, "Every family of a level, with its reasons."),
        h("dt", null, c("agreement.md")), h("dd", null, "With ", c("--gf-tags"), ": the suggestions against the human ", c("/Quality/Spacing"), " tags.")),
      h("p", null, "Each family's full report is ", c("spacingqa-data/reports/<family>.json"), "; ", c(`${tool} site --data spacingqa-data --out site`), " writes this site from them, to open from disk.")]);

    // ------------------------------------------------------------ norms
    SQA.append(prose, [sNorms,
      h("p", null, "Levels come from the library's norms: the baseline, ", c("library.json"), ". The tool has this site's built in, and a run judges every report against the one it is given (", c("--baseline"), "), or the data folder's, or the built-in one. Keeping the same norms from run to run keeps the runs comparable; the summary says when they changed."),
      h("p", null, "After a run of every family, new norms from those reports:"),
      code(`${tool} baseline --data spacingqa-data --out library.json`),
      h("p", null, "About explains the norms and the thresholds; ", c(`${tool} baseline --thresholds my.json`), " changes the thresholds.")]);
  }

  SQA.views = SQA.views || {};
  SQA.views.cli = view;
})();
