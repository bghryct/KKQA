# tool/

The daily workflow (`.github/workflows/spacingqa-refresh.yml`) runs these
files. They are built from Spacing QA, whose source is not in this
repository.

| File | What it is |
|---|---|
| `spacingqa` | The Spacing QA command-line tool, built for macOS on Apple silicon (macOS 11 or later); the workflow runs it on GitHub's `macos-14` runner. It reads the Google Fonts catalog and the families' font files from fonts.google.com, checks the families that are new or changed, and writes the site. The site's pages are built into it. |
| `spacingqa.wasm` | The same check, compiled to WebAssembly. The site publishes it: "Check a font" and a family's "Re-check" run it in the visitor's browser. |
| `library.json` | The baseline: the library's norms and the thresholds that every level (INFO, WARN, FAIL) is judged against. |
| `requests.py` | Reads the requests to check a family again and answers them (below). |
| `github-actions-google-fonts.yml` | A workflow for google/fonts (copy it into its `.github/workflows/`): it checks the font files a pull request adds or changes and writes the result to the job's summary. |

The tool is also a QA tool of its own, for the whole library or for font
files: `spacingqa qa` checks what changed, judges it, writes the tagging
files and the reports, and says what got worse since the last run, with an
exit code for CI. The site's **CLI** page is the walkthrough.

The reports are kept between runs in the Actions cache (`spacingqa-data`). A
run without one starts from the site's own reports in this repository
(`spacingqa import-site`). Deleting the caches (Actions → Caches) makes the
next run start from them again.

## Requests

Anyone with a GitHub account can ask for a family to be checked again and
published for everyone: **Request a new check** on a family's page opens a
"Re-check: <family>" issue (the form in `.github/ISSUE_TEMPLATE/recheck.yml`),
and **Request a refresh** on the library page asks for every family that
changed on Google Fonts. Opening such an issue starts the workflow. A run
checks the families asked for in every open "Re-check" issue (at most 30 a
run; the rest wait for the next), publishes the site, then comments the
result on each issue and closes it. An unknown family name is closed as not
planned. The issue's text is only matched against the catalog's family
names; nothing in it is run. The first run creates the `recheck` label.

## Updating them

They do not update themselves. After a change to Spacing QA, on the
computer with its source:

1. Build the tool and the WebAssembly check (`SpacingQA/README.md`).
2. Run `SpacingQA/deploy/update-pages-repo.sh` with this repository's
   folder. It copies the files here, the workflow and the request form, and
   prints the git commands that commit and push them.
3. The push rebuilds the site by itself: a push that changes `tool/` or the
   workflow starts a run that checks what changed (**stale**). For a new
   version of the check, also run the workflow by hand (Actions → Spacing QA
   daily refresh → Run workflow) with **all**, so that every family is
   checked by it. The daily run (**stale**) checks only the families that
   changed on Google Fonts since the last run.
