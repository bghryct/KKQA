# Spacing QA — FAIL: 2 families

Spacing very far outside the norms of the family's group — its Google Fonts category, or for a connected script the library's connected scripts — by how evenly the shapes are spaced, by single glyph sides or by overall tightness, or a named instance of its designspace very far from how the library's families lose evenness there. Each family lists the reasons, worst first.

1950 families in the library · baseline 2026-10-12-0107-1132 (1132 fonts in the norms) · spacingqa 0.1.0 kinetikern2 2.0.0

| Family | Category | Closest | Looseness | Shape error | Reasons | Notes |
|---|---|---|---:|---:|---|---|
| [Cinzel Decorative](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) | Display | standard | −0.58 | 54.2 | `glyph-sides` |  |
| [Revalia](https://bghryct.github.io/KKQA/#/family/revalia) | Display | loose | +0.10 | 63.3 | `evenness` |  |

---

<a id="cinzel-decorative"></a>

## Cinzel Decorative Regular — FAIL

Display · `CinzelDecorative-Regular.ttf` · Version 1.002;PS 001.002;hotconv 1.0.56;makeotf.lib2.0.21325 · checked at weight 400 · baseline 2026-10-12-0107-1132

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.58; mean distance in units per 1000 em: tight 55.3, standard 48.6, loose 71.6).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.58 is at the 14th percentile of Display fonts (median +0.08, robust z -1.2).
- **WARN** `spacing/evenness` — Shape error 54.2 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 19.3, robust z +5.2).
- **FAIL** `spacing/glyph-sides` — 4 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): Q right -626, L right -531, Z right -368, & right -333.
- **WARN** `spacing/pairs` — 36 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): qJ -530, q, -488, q) -440, q; -427, qS -304, qH -398, qW -424, q] -432, q} -411, oq -289; 275 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 55.3 | +4.4 | 53.8 | 55.5 | 53.1 |
| standard (closest) | +0.00 | 48.6 | −28.0 | 51.4 | 48.4 | 51.4 |
| loose | +0.50 | 71.6 | −67.3 | 50.5 | 71.1 | 50.8 |
| best fit | −0.58 | | | 54.2 |  | 53.4 |

With Kinetikern2's designer harness the model is further from this font's spacing: shape error 53.4 without it, 54.2 with it (+0.8).

Units per 1000 em. Sidebearing error 38.3 · kerned-pair error 64.3 · kerning correlation 0.15 · 7744 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) · [Specimen](https://fonts.google.com/specimen/Cinzel+Decorative)

<a id="revalia"></a>

## Revalia Regular — FAIL

Display · `Revalia-Regular.ttf` · Version 1.001 · checked at weight 400 · baseline 2026-10-12-0107-1132

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's loose preset (best-fit Looseness +0.10; mean distance in units per 1000 em: tight 97.3, standard 68.6, loose 64.1).
- INFO `spacing/tightness` — Overall tightness: Looseness +0.10 is at the 52nd percentile of Display fonts (median +0.08, robust z +0.0).
- **FAIL** `spacing/evenness` — Shape error 63.3 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Display fonts (median 19.3, robust z +6.6).
- **WARN** `spacing/glyph-sides` — 10 glyph sides are spaced far from the norms of Display fonts (units per 1000 em against their median): ° left +158, · left +179, · right +179, ° right +158, o right -70, ] left +109, [ right +110, C left -68.
- INFO `spacing/pairs` — 10 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): }- +164, Pk -112, }: +191, Pr -111, uS -100, }– +202; 151 more, with a glyph side flagged above, count under that side.

| Spacing | Looseness | Distance | Offset | Shape error | Bare model: distance | Shape error |
|---|---:|---:|---:|---:|---:|---:|
| tight | −0.50 | 97.3 | +96.7 | 61.1 | 97.9 | 60.6 |
| standard | +0.00 | 68.6 | +56.3 | 62.9 | 69.2 | 63.8 |
| loose (closest) | +0.50 | 64.1 | +10.4 | 65.3 | 66.4 | 67.6 |
| best fit | +0.10 | | | 63.3 |  | 64.5 |

With Kinetikern2's designer harness the model is closer to this font's spacing: shape error 64.5 without it, 63.3 with it (-1.2).

Units per 1000 em. Sidebearing error 42.6 · 7569 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/revalia) · [Specimen](https://fonts.google.com/specimen/Revalia)

