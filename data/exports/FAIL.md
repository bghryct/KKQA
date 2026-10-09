# Spacing QA — FAIL: 2 families

Spacing very far outside the norms of the family's group — its Google Fonts category, or for a connected script the library's connected scripts — by how evenly the shapes are spaced, by single glyph sides or by overall tightness, or a named instance of its designspace very far from how the library's families lose evenness there. Each family lists the reasons, worst first.

1950 families in the library · baseline 2026-10-09-2340-1163 (1163 fonts in the norms) · spacingqa 0.1.0 kinetikern2 2.0.0

| Family | Category | Closest | Looseness | Shape error | Reasons | Notes |
|---|---|---|---:|---:|---|---|
| [Cinzel Decorative](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) | Display | standard | −0.58 | 61.7 | `glyph-sides` |  |
| [Trispace](https://bghryct.github.io/KKQA/#/family/trispace) | Sans Serif | loose | +1.51 | 61.9 | `evenness` |  |

---

<a id="cinzel-decorative"></a>

## Cinzel Decorative Regular — FAIL

Display · `CinzelDecorative-Regular.ttf` · Version 1.002;PS 001.002;hotconv 1.0.56;makeotf.lib2.0.21325 · checked at weight 400 · baseline 2026-10-09-2340-1163

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.58; mean distance in units per 1000 em: tight 62.7, standard 54.7, loose 80.2).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.58 is at the 15th percentile of Display fonts (median +0.08, robust z -1.2).
- **WARN** `spacing/evenness` — Shape error 61.7 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Display fonts (median 21.6, robust z +5.8).
- **FAIL** `spacing/glyph-sides` — 4 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): Q right -625, L right -530, Z right -367, & right -332.
- **WARN** `spacing/pairs` — 39 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): qX -643, qJ -525, q, -477, q; -420, qH -393, GX -481, qS -300, NX -392, qW -420, q) -457; 349 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 62.7 | +3.9 | 61.3 | 66.4 | 63.3 |
| standard (closest) | +0.00 | 54.7 | −32.6 | 58.8 | 57.3 | 61.8 |
| loose | +0.50 | 80.2 | −76.8 | 57.7 | 78.9 | 60.8 |
| best fit | −0.58 | | | 61.7 |  | 63.5 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 63.5 without it, 61.7 with it (-1.8).

Units per 1000 em. Sidebearing error 39.5 · kerned-pair error 78.4 · kerning correlation 0.34 · 7744 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) · [Specimen](https://fonts.google.com/specimen/Cinzel+Decorative)

<a id="trispace"></a>

## Trispace Regular — FAIL

Sans Serif · `Trispace-VariableFont_wdth,wght.ttf` · Version 1.210 · checked at weight 400 · baseline 2026-10-09-2340-1163

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's loose preset (best-fit Looseness +1.51; mean distance in units per 1000 em: tight 176.0, standard 145.7, loose 111.5).
- **WARN** `spacing/tightness` — Overall tightness: Looseness +1.51 is at the 100th percentile of Sans Serif fonts (median +0.05, robust z +5.2).
- **FAIL** `spacing/evenness` — Shape error 61.9 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Sans Serif fonts (median 18.8, robust z +9.1).
- **WARN** `spacing/glyph-sides` — 24 glyph sides are spaced far from the norms of Sans Serif fonts (units per 1000 em against their median): m left -90, m right -77, Q left -70, O left -70, O right -70, N right -71, L left -75, Q right -70.
- INFO `spacing/pairs` — 9 pairs are spaced far from how Sans Serif fonts usually compare with the model (units per 1000 em, + looser): Wi -141, G@ -122, Sd -84, Bi -95, z. +107, iS -84; 217 more, with a glyph side flagged above, count under that side.
- INFO `spacing/designspace` — Checked at 14 locations of the designspace (8 named instances, 2 edges, 4 corners): closest to 14 loose; Looseness from +0.69 (wght 800 · wdth 75) to +2.24 (wght 800 · wdth 125); shape error 34.3–133.2.
- **WARN** `spacing/instances` — 3 locations of the designspace are spaced far from the norms or from their neighbours: wdth 75 (min) (spacing jumps against its neighbours); wdth 125 (max) (shape error 126.8); wght 800 · wdth 125 (shape error 119.3).

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 176.0 | +176.0 | 64.1 | 178.9 | 66.7 |
| standard | +0.00 | 145.7 | +145.6 | 62.9 | 148.2 | 67.1 |
| loose (closest) | +0.50 | 111.5 | +109.9 | 62.3 | 113.7 | 67.7 |
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
| wght 800 · wdth 125 | wdth 125 · wght 800 | corner | loose | +2.24 | 119.3 | **WARN** |

- **WARN** wdth 75 (min) — Along wght, wdth 75 (min) is spaced 0.79 Looseness looser than its neighbours suggest (wght 100 · wdth 75 +1.52, wght 800 · wdth 75 +0.69; here +1.95): an interpolation problem, or a master spaced apart?
- **WARN** wdth 125 (max) — Shape error 126.8 units per 1000 em, 2.0× Regular's (the main report) 61.9: families usually lose far less evenness at their edges of middle weight (median 1.01×, robust z +13.0).
- **WARN** wght 800 · wdth 125 — Shape error 119.3 units per 1000 em, 1.9× Regular's (the main report) 61.9: families usually lose far less evenness at their bold corners (above wght 600) (median 1.07×, robust z +3.5).

[Full report](https://bghryct.github.io/KKQA/#/family/trispace) · [Specimen](https://fonts.google.com/specimen/Trispace)

