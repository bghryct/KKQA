# Spacing QA — FAIL: 1 families

Spacing very far outside the norms of the family's group — its Google Fonts category, or for a connected script the library's connected scripts — by how evenly the shapes are spaced, by single glyph sides or by overall tightness, or a named instance of its designspace very far from how the library's families lose evenness there. Each family lists the reasons, worst first.

1950 families in the library · baseline 2026-10-09-2340-1163 (1163 fonts in the norms) · spacingqa 0.1.0 kinetikern2 2.0.0

| Family | Category | Closest | Looseness | Shape error | Reasons | Notes |
|---|---|---|---:|---:|---|---|
| [Cinzel Decorative](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) | Display | standard | −0.58 | 61.7 | `glyph-sides` |  |

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

