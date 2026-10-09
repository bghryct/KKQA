# Spacing QA exports

Files for the Google Fonts tagging initiative use the formats of
google/fonts `tags/all/`: four columns, no header —
`Family,Axes,Group/Tag,Weight`.

| File | What it is |
|---|---|
| `tags.csv` | A machine **suggestion** for the human-assessed `/Quality/Spacing` tag, in the format of `families.csv`: weights 10–100 in steps of 10, distributed like the human tags. Only families the check can judge (upright, proportional, Latin as the primary script, within the model's range), and none for handwriting, where the measured evenness runs against the human tags, or for connected scripts, whose scores leave their joins out. It passes the checks of google/fonts' `.ci/test_font_tags.py`. |
| `quant.csv` | Measured values in the format of `quant.csv`, at the weight checked (`wght@400`): `/quant/spacing_looseness` (best-fit Looseness — for a connected script, matched to its joined letters; the tight preset is −0.5, the loose one +0.5), `/quant/spacing_shape_error`, `/quant/spacing_sidebearing_error`, `/quant/spacing_kerning_error`, `/quant/spacing_kerning_correlation` (units per 1000 em, except the last) and `/quant/spacing_evenness` (0–100 within the family's norm group — its category, or the connected scripts — 100 = the most even; not for a family beyond the model's range). A variable family also has the Looseness, shape error, sidebearing error and kerning correlation of every other location checked — named instances, edges, corners, and its italic's — with that location in the Axes column: the axes away from their defaults, and wght (`"wdth,wght@75,700"`; italic locations `"ital,wght@1,700"`, as google/fonts writes them). A family whose main font is an italic has no rows. |
| `skip.csv` | Suggested `/Skip/Spacing` signals in the format of `skip.csv`, for families the check cannot judge: monospaced, glyphs that touch by construction (a line, a grid, a background or an effect through every glyph), without the basic Latin alphabet, without outlines, or spaced beyond the model's range (scripts and designs whose letters touch or overlap). |
| `tags_metadata.csv` | The rows google/fonts' `tags/tags_metadata.csv` needs for the tags of `quant.csv` and `skip.csv`, in its format (`/Group/Tag,min,max,description`). `/Quality/Spacing` is listed there already. |
| `quality.csv` | This tool's review table (with a header): level, closest preset, the numbers and the WARN/FAIL reasons of every family. |
| `FAIL.md`, `WARN.md`, `INFO.md`, `SKIP.md`, `ERROR.md` | Every family of one level: a table, then (FAIL and WARN) each family's reasons, its distance to the three presets and its loosest and tightest pairs. |
| `agreement.md` | (when made with google/fonts' families.csv) how the measured evenness compares with the human `/Quality/Spacing` tags, and the families where they disagree most. |

The suggestion maps a family's evenness rank in its category onto the
distribution of the human tags, and a WARN or FAIL on evenness, glyph sides
or pairs caps it at 60 or 40. The human tag rates spacing as a whole, as
people read it; the check measures one thing, how evenly the shapes are
spaced by Kinetikern2's model — treat the suggestion as a second opinion.
