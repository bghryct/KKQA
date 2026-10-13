# Spacing QA — FAIL: 2 families

These families are very far from the norm for their group: their Google Fonts category, or the connected scripts. Each family lists its reasons, worst first.

1950 families in the library · baseline 2026-10-12-0107-1132 (1132 fonts in the norms) · spacingqa 0.1.0 kinetikern2 2.0.0

| Family | Category | Closest | Looseness | Shape error | Reasons | Notes |
|---|---|---|---:|---:|---|---|
| [Cinzel Decorative](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) | Display | standard | −0.58 | 54.2 | `glyph-sides` |  |
| [Revalia](https://bghryct.github.io/KKQA/#/family/revalia) | Display | loose | +0.10 | 63.3 | `evenness` |  |

---

<a id="cinzel-decorative"></a>

## Cinzel Decorative Regular — FAIL

Display · `CinzelDecorative-Regular.ttf` · Version 1.002;PS 001.002;hotconv 1.0.56;makeotf.lib2.0.21325 · checked at weight 400 · baseline 2026-10-12-0107-1132

- INFO `spacing/closest` — The spacing is nearest to the standard preset. Best-fit Looseness: -0.58.
- INFO `spacing/tightness` — Looseness is -0.58. This is at the 14th percentile of Display fonts (median +0.08).
- **WARN** `spacing/evenness` — The gaps are not even. Shape error is 54.2, at the 99th percentile of Display fonts (median 19.3).
- **FAIL** `spacing/glyph-sides` — 4 sidebearings are very far from the norm for Display fonts. In units per 1000 em: Q right -626, L right -531, Z right -368, & right -333.
- **WARN** `spacing/pairs` — 33 pairs are far from the norm for Display fonts. In units per 1000 em, + looser: qJ -530, q) -440, q; -427, qS -304, qW -424, q] -432, q} -411, oq -289, oo -298, he -253. 275 more pairs follow from the sidebearings above.
- INFO `spacing/pairs-kerned` — 3 pairs are far from the norm because the font kerns them on purpose. They do not count. In units per 1000 em: q, -488, qH -398, qA -206.

Shape error 54.2 · Looseness −0.58 · nearest preset standard · kerning match 0.15. Units per 1000 em.

[Full report](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) · [Specimen](https://fonts.google.com/specimen/Cinzel+Decorative)

<a id="revalia"></a>

## Revalia Regular — FAIL

Display · `Revalia-Regular.ttf` · Version 1.001 · checked at weight 400 · baseline 2026-10-12-0107-1132

- INFO `spacing/closest` — The spacing is nearest to the loose preset. Best-fit Looseness: +0.10.
- INFO `spacing/tightness` — Looseness is +0.10. This is at the 52nd percentile of Display fonts (median +0.08).
- **FAIL** `spacing/evenness` — The gaps are not even. Shape error is 63.3, at the 100th percentile of Display fonts (median 19.3).
- **WARN** `spacing/glyph-sides` — 10 sidebearings are far from the norm for Display fonts. In units per 1000 em: ° left +158, · left +179, · right +179, ° right +158, o right -70, ] left +109, [ right +110, C left -68.
- INFO `spacing/pairs` — 10 pairs are far from the norm for Display fonts. In units per 1000 em, + looser: }- +164, Pk -112, }: +191, Pr -111, uS -100, }– +202. 151 more pairs follow from the sidebearings above.

Shape error 63.3 · Looseness +0.10 · nearest preset loose · kerning match none. Units per 1000 em.

[Full report](https://bghryct.github.io/KKQA/#/family/revalia) · [Specimen](https://fonts.google.com/specimen/Revalia)

