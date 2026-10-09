# Spacing QA — FAIL: 7 families

Spacing extremely far outside the norms of the family's Google Fonts category — by how evenly the shapes are spaced, by single glyph sides, or by overall tightness. Each family lists the reasons, worst first.

1950 families in the library · baseline 2026-10-09-1149-1156 (1156 fonts in the norms) · spacingqa 0.1.0 kinetikern2 2.0.0

| Family | Category | Closest | Looseness | Shape error | Reasons | Notes |
|---|---|---|---:|---:|---|---|
| [Cinzel Decorative](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) | Display | standard | −0.58 | 61.7 | `glyph-sides` |  |
| [Meie Script](https://bghryct.github.io/KKQA/#/family/meie-script) | Handwriting | loose | +0.29 | 175.7 | `evenness` `glyph-sides` |  |
| [Momo Signature](https://bghryct.github.io/KKQA/#/family/momo-signature) | Sans Serif | standard | −0.39 | 64.8 | `evenness` |  |
| [Playball](https://bghryct.github.io/KKQA/#/family/playball) | Display | tight | −1.67 | 74.3 | `evenness` `glyph-sides` |  |
| [Sarina](https://bghryct.github.io/KKQA/#/family/sarina) | Display | loose | +1.23 | 80.4 | `evenness` |  |
| [Trispace](https://bghryct.github.io/KKQA/#/family/trispace) | Sans Serif | loose | +1.51 | 61.9 | `evenness` |  |
| [WindSong](https://bghryct.github.io/KKQA/#/family/windsong) | Handwriting | tight | −1.34 | 118.7 | `glyph-sides` |  |

---

<a id="cinzel-decorative"></a>

## Cinzel Decorative Regular — FAIL

Display · `CinzelDecorative-Regular.ttf` · Version 1.002;PS 001.002;hotconv 1.0.56;makeotf.lib2.0.21325 · checked at weight 400 · baseline 2026-10-09-1149-1156

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.58; mean distance in units per 1000 em: tight 62.7, standard 54.7, loose 80.2).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.58 is at the 16th percentile of Display fonts (median +0.07, robust z -1.2).
- **WARN** `spacing/evenness` — Shape error 61.7 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 21.9, robust z +5.4).
- **FAIL** `spacing/glyph-sides` — 4 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): Q right -625, L right -530, Z right -367, & right -332.
- **WARN** `spacing/pairs` — 38 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): qX -643, qJ -525, q, -477, q; -420, qH -393, GX -481, qW -420, NX -392, qS -300, q) -456; 343 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 62.7 | +3.9 | 61.3 | 66.4 | 63.3 |
| standard (closest) | +0.00 | 54.7 | −32.6 | 58.8 | 57.3 | 61.8 |
| loose | +0.50 | 80.2 | −76.8 | 57.7 | 78.9 | 60.8 |
| best fit | −0.58 | | | 61.7 |  | 63.5 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 63.5 without it, 61.7 with it (-1.8).

Units per 1000 em. Sidebearing error 39.5 · kerned-pair error 78.4 · kerning correlation 0.34 · 7744 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) · [Specimen](https://fonts.google.com/specimen/Cinzel+Decorative)

<a id="meie-script"></a>

## Meie Script Regular — FAIL

Handwriting · `MeieScript-Regular.ttf` · Version 1.001 · checked at weight 400 · baseline 2026-10-09-1149-1156

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's loose preset (best-fit Looseness +0.29; mean distance in units per 1000 em: tight 182.2, standard 177.6, loose 175.3).
- INFO `spacing/joins` — A connected script: its letters overlap at their joins, so 66 glyph sides were spaced as joins (learned from the font's own spacing): the model spaces the letter bodies and lets two joining letters overlap as drawn; every other pair keeps the usual rules.
- INFO `spacing/tightness` — Overall tightness: Looseness +0.29 is at the 90th percentile of Handwriting fonts (median -0.51, robust z +1.2).
- **FAIL** `spacing/evenness` — Shape error 175.7 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Handwriting fonts (median 42.8, robust z +7.2).
- **FAIL** `spacing/glyph-sides` — 20 sidebearings are far outside the norms of Handwriting fonts (units per 1000 em against their median): W left +585, V left +561, O left +467, M right -455, N right -640, Y left +578, U left +502, X left +428.
- INFO `spacing/pairs` — 9 pairs are spaced far from how Handwriting fonts usually compare with the model (units per 1000 em, + looser): E“ -237, T” -423, T' -432, T’ -419, Rc -229, Ro -226; 1235 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 182.2 | +64.9 | 173.7 | 185.9 | 176.1 |
| standard | +0.00 | 177.6 | +45.0 | 175.0 | 181.0 | 177.3 |
| loose (closest) | +0.50 | 175.3 | +19.5 | 175.9 | 177.9 | 178.2 |
| best fit | +0.29 | | | 175.7 |  | 178.1 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 178.1 without it, 175.7 with it (-2.4).

Units per 1000 em. Sidebearing error 131.6 · 7569 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/meie-script) · [Specimen](https://fonts.google.com/specimen/Meie+Script)

<a id="momo-signature"></a>

## Momo Signature Regular — FAIL

Sans Serif · `MomoSignature-Regular.ttf` · Version 1.000; ttfautohint (v1.8.4.7-5d5b) · checked at weight 400 · baseline 2026-10-09-1149-1156

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.39; mean distance in units per 1000 em: tight 66.4, standard 64.7, loose 86.5).
- INFO `spacing/joins` — A connected script: its letters overlap at their joins, so 96 glyph sides were spaced as joins (learned from the font's own spacing): the model spaces the letter bodies and lets two joining letters overlap as drawn; every other pair keeps the usual rules.
- INFO `spacing/tightness` — Overall tightness: Looseness -0.39 is at the 7th percentile of Sans Serif fonts (median +0.06, robust z -1.6).
- **FAIL** `spacing/evenness` — Shape error 64.8 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Sans Serif fonts (median 18.8, robust z +9.4).
- **WARN** `spacing/glyph-sides` — 17 glyph sides are spaced far from the norms of Sans Serif fonts (units per 1000 em against their median): ; left +142, , left +158, r left +88, Z right -83, S right -61, z right -72, L right -90, C right -83.
- **WARN** `spacing/pairs` — 291 pairs are spaced far from how Sans Serif fonts usually compare with the model (units per 1000 em, + looser): TH -351, FL -303, TB -195, T° -256, s© -199, e© -200, p© -195, i© -197, OR -214, q© -196; 193 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 66.4 | +14.3 | 66.2 | 67.5 | 67.2 |
| standard (closest) | +0.00 | 64.7 | −25.0 | 59.7 | 66.0 | 61.5 |
| loose | +0.50 | 86.5 | −72.9 | 55.6 | 87.4 | 58.5 |
| best fit | −0.39 | | | 64.8 |  | 66.0 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 66.0 without it, 64.8 with it (-1.2).

Units per 1000 em. Sidebearing error 37.7 · kerned-pair error 92.8 · kerning correlation 0.16 · 7744 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/momo-signature) · [Specimen](https://fonts.google.com/specimen/Momo+Signature)

<a id="playball"></a>

## Playball Regular — FAIL

Display · `Playball-Regular.ttf` · Version 1.010 · checked at weight 400 · baseline 2026-10-09-1149-1156

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -1.67; mean distance in units per 1000 em: tight 76.7, standard 76.7, loose 87.5).
- INFO `spacing/joins` — A connected script: its letters overlap at their joins, so 79 glyph sides were spaced as joins (learned from the font's own spacing): the model spaces the letter bodies and lets two joining letters overlap as drawn; every other pair keeps the usual rules.
- INFO `spacing/tightness` — Overall tightness: Looseness -1.67 is at the 5th percentile of Display fonts (median +0.07, robust z -3.2).
- **FAIL** `spacing/evenness` — Shape error 74.3 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 21.9, robust z +7.1).
- **FAIL** `spacing/glyph-sides` — 12 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): T right -369, ° right +286, N right -229, X right -262, J right -207, ° left +251, U right -189, M right -195.
- **WARN** `spacing/pairs` — 28 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): f& -312, fE +313, fL +294, fD +298, fB +299, lE +191, f© -249, lL +191, f( -264, f® -250; 504 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight (closest) | −0.50 | 76.7 | +11.4 | 75.3 | 79.0 | 77.4 |
| standard | +0.00 | 76.7 | −16.2 | 76.1 | 79.7 | 79.2 |
| loose | +0.50 | 87.5 | −49.9 | 77.1 | 90.3 | 81.0 |
| best fit | −1.67 | | | 74.3 |  | 75.6 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 75.6 without it, 74.3 with it (-1.3).

Units per 1000 em. Sidebearing error 57.7 · kerned-pair error 71.8 · kerning correlation 0.47 · 7744 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/playball) · [Specimen](https://fonts.google.com/specimen/Playball)

<a id="sarina"></a>

## Sarina Regular — FAIL

Display · `Sarina-Regular.ttf` · Version 1.001 · checked at weight 400 · baseline 2026-10-09-1149-1156

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's loose preset (best-fit Looseness +1.23; mean distance in units per 1000 em: tight 143.0, standard 126.4, loose 108.4).
- INFO `spacing/joins` — A connected script: its letters overlap at their joins, so 85 glyph sides were spaced as joins (learned from the font's own spacing): the model spaces the letter bodies and lets two joining letters overlap as drawn; every other pair keeps the usual rules.
- INFO `spacing/tightness` — Overall tightness: Looseness +1.23 is at the 96th percentile of Display fonts (median +0.07, robust z +2.2).
- **FAIL** `spacing/evenness` — Shape error 80.4 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Display fonts (median 21.9, robust z +7.9).
- **WARN** `spacing/glyph-sides` — 34 glyph sides are spaced far from the norms of Display fonts (units per 1000 em against their median): © left +140, © right +140, ® left +144, ® right +144, b right -81, " left +151, ' left +132, l left -91.
- **WARN** `spacing/pairs` — 37 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): eB -174, cB -162, Hz -145, &f -195, PH -156, °) +299, PE -159, Uz -154, US -148, Ut -151; 264 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 143.0 | +140.8 | 83.8 | 144.6 | 87.9 |
| standard | +0.00 | 126.4 | +122.2 | 82.4 | 128.9 | 87.4 |
| loose (closest) | +0.50 | 108.4 | +98.8 | 81.2 | 112.4 | 87.1 |
| best fit | +1.23 | | | 80.4 |  | 87.7 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 87.7 without it, 80.4 with it (-7.3).

Units per 1000 em. Sidebearing error 57.5 · 7744 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/sarina) · [Specimen](https://fonts.google.com/specimen/Sarina)

<a id="trispace"></a>

## Trispace Regular — FAIL

Sans Serif · `Trispace-VariableFont_wdth,wght.ttf` · Version 1.210 · checked at weight 400 · baseline 2026-10-09-1149-1156

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's loose preset (best-fit Looseness +1.51; mean distance in units per 1000 em: tight 176.1, standard 145.7, loose 111.5).
- **WARN** `spacing/tightness` — Overall tightness: Looseness +1.51 is at the 100th percentile of Sans Serif fonts (median +0.06, robust z +5.2).
- **FAIL** `spacing/evenness` — Shape error 61.9 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Sans Serif fonts (median 18.8, robust z +8.8).
- **WARN** `spacing/glyph-sides` — 24 glyph sides are spaced far from the norms of Sans Serif fonts (units per 1000 em against their median): m left -90, m right -77, O left -70, Q left -70, O right -70, N right -71, L left -75, N left -72.
- INFO `spacing/pairs` — 8 pairs are spaced far from how Sans Serif fonts usually compare with the model (units per 1000 em, + looser): Wi -142, Sd -84, G@ -122, z. +107, Bi -95, iS -84; 210 more, with a glyph side flagged above, count under that side.
- INFO `spacing/designspace` — Checked at 14 locations of the designspace (8 named instances, 2 edges, 4 corners): closest to 14 loose; Looseness from +0.69 (wght 800 · wdth 75) to +2.25 (wght 800 · wdth 125); shape error 34.3–133.2.
- **WARN** `spacing/instances` — 3 locations of the designspace are spaced far from the norms or from their neighbours: wdth 75 (min) (spacing jumps against its neighbours); wdth 125 (max) (shape error 126.8); wght 800 · wdth 125 (shape error 119.3).

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 176.1 | +176.1 | 64.1 | 179.0 | 66.7 |
| standard | +0.00 | 145.7 | +145.7 | 62.9 | 148.3 | 67.1 |
| loose (closest) | +0.50 | 111.5 | +110.0 | 62.3 | 113.8 | 67.7 |
| best fit | +1.51 | | | 61.9 |  | 68.7 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 68.7 without it, 61.9 with it (-6.8).

Units per 1000 em. Sidebearing error 43.8 · kerned-pair error 51.5 · kerning correlation 0.35 · 7744 pairs measured.

### Designspace

The locations that raise the level: 4 of 14 checked (the family's report lists them all).

| Location | Where | Kind | Closest | Looseness | Shape error | Level |
|---|---|---|---|---:|---:|---|
| Regular | wght 400 | named, the main report | loose | +1.51 | 61.9 | **FAIL** |
| wdth 75 (min) | wdth 75 · wght 400 | edge | loose | +1.95 | 37.3 | **WARN** |
| wdth 125 (max) | wdth 125 · wght 400 | edge | loose | +1.24 | 126.8 | **WARN** |
| wght 800 · wdth 125 | wdth 125 · wght 800 | corner | loose | +2.25 | 119.3 | **WARN** |

- **WARN** wdth 75 (min) — Along wght, wdth 75 (min) is spaced 0.79 Looseness looser than its neighbours suggest (wght 100 · wdth 75 +1.52, wght 800 · wdth 75 +0.69; here +1.95): an interpolation problem, or a master spaced apart?
- **WARN** wdth 125 (max) — Shape error 126.8 units per 1000 em, 2.0× Regular's 61.9 (the main report): families usually lose far less evenness at their edges of middle weight (median 1.01×, robust z +13.6).
- **WARN** wght 800 · wdth 125 — Shape error 119.3 units per 1000 em, 1.9× Regular's 61.9 (the main report): families usually lose far less evenness at their bold corners (above wght 600) (median 0.99×, robust z +6.0).

[Full report](https://bghryct.github.io/KKQA/#/family/trispace) · [Specimen](https://fonts.google.com/specimen/Trispace)

<a id="windsong"></a>

## WindSong Regular — FAIL

Handwriting · `WindSong-Regular.ttf` · Version 1.010; ttfautohint (v1.8.3) · checked at weight 400 · baseline 2026-10-09-1149-1156

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -1.34; mean distance in units per 1000 em: tight 121.3, standard 139.3, loose 174.5).
- INFO `spacing/joins` — A connected script: its letters overlap at their joins, so 100 glyph sides were spaced as joins (learned from the font's own spacing): the model spaces the letter bodies and lets two joining letters overlap as drawn; every other pair keeps the usual rules.
- INFO `spacing/tightness` — Overall tightness: Looseness -1.34 is at the 18th percentile of Handwriting fonts (median -0.51, robust z -1.2).
- **WARN** `spacing/evenness` — Shape error 118.7 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Handwriting fonts (median 42.8, robust z +4.1).
- **FAIL** `spacing/glyph-sides` — 4 sidebearings are far outside the norms of Handwriting fonts (units per 1000 em against their median): L right -602, R right -555, S right -380, m right +274.
- INFO `spacing/pairs` — 19 pairs are spaced far from how Handwriting fonts usually compare with the model (units per 1000 em, + looser): nO +430, dE +346, cD +304, nz +246, C™ +325, eF +325; 348 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight (closest) | −0.50 | 121.3 | −44.6 | 122.6 | 122.8 | 125.0 |
| standard | +0.00 | 139.3 | −95.4 | 129.9 | 138.9 | 133.0 |
| loose | +0.50 | 174.5 | −154.3 | 139.1 | 172.7 | 142.7 |
| best fit | −1.34 | | | 118.7 |  | 120.5 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 120.5 without it, 118.7 with it (-1.8).

Units per 1000 em. Sidebearing error 110.2 · kerned-pair error 124.7 · kerning correlation 0.05 · 7744 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/windsong) · [Specimen](https://fonts.google.com/specimen/WindSong)

