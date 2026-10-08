# Spacing QA — FAIL: 12 families

Spacing extremely far outside the norms of the family's Google Fonts category — by how evenly the shapes are spaced, by single glyph sides, or by overall tightness. Each family lists the reasons, worst first.

1950 families in the library · baseline 2026-10-08-1419-1115 (1115 fonts in the norms) · spacingqa 0.1.0 kinetikern2 2.0.0

| Family | Category | Closest | Looseness | Shape error | Reasons | Notes |
|---|---|---|---:|---:|---|---|
| [Almendra SC](https://bghryct.github.io/KKQA/#/family/almendra-sc) | Serif | standard | −0.67 | 52.1 | `evenness` `glyph-sides` |  |
| [Alumni Sans Collegiate One](https://bghryct.github.io/KKQA/#/family/alumni-sans-collegiate-one) | Sans Serif | tight | −2.96 | 16.7 | `tightness` |  |
| [Bitcount Prop Single](https://bghryct.github.io/KKQA/#/family/bitcount-prop-single) | Display | tight | −0.00 | 36.5 | `glyph-sides` |  |
| [Bitcount Prop Single Ink](https://bghryct.github.io/KKQA/#/family/bitcount-prop-single-ink) | Display | tight | −0.00 | 36.5 | `glyph-sides` |  |
| [Cinzel Decorative](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) | Display | standard | −0.59 | 68.9 | `evenness` `glyph-sides` |  |
| [Lily Script One](https://bghryct.github.io/KKQA/#/family/lily-script-one) | Display | tight | −2.86 | 71.9 | `evenness` `glyph-sides` |  |
| [Meie Script](https://bghryct.github.io/KKQA/#/family/meie-script) | Handwriting | standard | −0.27 | 188.9 | `evenness` `glyph-sides` |  |
| [Michroma](https://bghryct.github.io/KKQA/#/family/michroma) | Sans Serif | tight | −0.84 | 41.5 | `evenness` |  |
| [Oleo Script Swash Caps](https://bghryct.github.io/KKQA/#/family/oleo-script-swash-caps) | Display | standard | −1.53 | 44.8 | `glyph-sides` |  |
| [Sarina](https://bghryct.github.io/KKQA/#/family/sarina) | Display | tight | −1.24 | 107.3 | `evenness` `glyph-sides` |  |
| [Sonsie One](https://bghryct.github.io/KKQA/#/family/sonsie-one) | Display | standard | −0.79 | 71.1 | `evenness` `glyph-sides` |  |
| [Trispace](https://bghryct.github.io/KKQA/#/family/trispace) | Sans Serif | loose | +1.50 | 51.7 | `evenness` |  |

---

<a id="almendra-sc"></a>

## Almendra SC Regular — FAIL

Serif · `AlmendraSC-Regular.ttf` · Version 1.002 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.67; mean distance in units per 1000 em: tight 50.2, standard 46.6, loose 64.6).
- **WARN** `spacing/tightness` — Overall tightness: Looseness -0.67 is at the 0th percentile of Serif fonts (median +0.14, robust z -3.8).
- **FAIL** `spacing/evenness` — Shape error 52.1 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Serif fonts (median 16.8, robust z +8.2).
- **FAIL** `spacing/glyph-sides` — 2 sidebearings are far outside the norms of Serif fonts (units per 1000 em against their median): V left -157, W left -158.
- **WARN** `spacing/pairs` — 188 pairs are spaced far from how Serif fonts usually compare with the model (units per 1000 em, + looser): ZV -209, CW -190, CV -189, ZW -209, KH -191, CU -149, KK -190, CF -151, PF -145, EW -165.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 50.2 | −3.7 | 51.1 |
| standard (closest) | +0.00 | 46.6 | −30.2 | 49.1 |
| loose | +0.50 | 64.6 | −63.0 | 48.5 |
| best fit | −0.67 | | | 52.1 |

Units per 1000 em. Sidebearing error 33.4 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/almendra-sc) · [Specimen](https://fonts.google.com/specimen/Almendra+SC)

<a id="alumni-sans-collegiate-one"></a>

## Alumni Sans Collegiate One Regular — FAIL

Sans Serif · `AlumniSansCollegiateOne-Regular.ttf` · Version 1.100 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -2.96; mean distance in units per 1000 em: tight 188.0, standard 256.6, loose 333.8).
- **FAIL** `spacing/tightness` — Overall tightness: Looseness -2.96 is at the 0th percentile of Sans Serif fonts (median +0.03, robust z -10.1).
- INFO `spacing/evenness` — Shape error 16.7 units per 1000 em (gaps that depart from even spacing of these shapes): 68th percentile of Sans Serif fonts (median 14.2, robust z +0.6).

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 188.0 | −188.0 | 18.1 |
| standard | +0.00 | 256.6 | −256.6 | 19.5 |
| loose | +0.50 | 333.8 | −333.8 | 21.3 |
| best fit | −2.96 | | | 16.7 |

Units per 1000 em. Sidebearing error 10.0 · kerned-pair error 11.6 · kerning correlation 0.79 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/alumni-sans-collegiate-one) · [Specimen](https://fonts.google.com/specimen/Alumni+Sans+Collegiate+One)

<a id="bitcount-prop-single"></a>

## Bitcount Prop Single Regular — FAIL

Display · `BitcountPropSingle-VariableFont_CRSV,ELSH,ELXP,slnt,wght.ttf` · Version 1.0 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -0.00; mean distance in units per 1000 em: tight 38.2, standard 40.9, loose 71.9).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.00 is at the 45th percentile of Display fonts (median +0.04, robust z -0.1).
- INFO `spacing/evenness` — Shape error 36.5 units per 1000 em (gaps that depart from even spacing of these shapes): 94th percentile of Display fonts (median 17.9, robust z +3.1).
- **FAIL** `spacing/glyph-sides` — 2 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): S right +156, P right +157.
- INFO `spacing/pairs` — 1 pair is spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): Z, +172.
- INFO `spacing/designspace` — Checked at 52 locations of the designspace (18 named instances, 6 edges, 28 corners): closest to 52 tight; Looseness from -1.64 (wght 100 · ELXP 100 · ELSH 100 · slnt -8 · CRSV 0) to +0.09 (SemiBold); shape error 32.1–40.0; 12 locations beyond the model's range.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 38.2 | +26.1 | 36.3 |
| standard | +0.00 | 40.9 | −18.0 | 36.5 |
| loose | +0.50 | 71.9 | −68.3 | 37.2 |
| best fit | −0.00 | | | 36.5 |

Units per 1000 em. Sidebearing error 70.6 · kerned-pair error 34.8 · kerning correlation 0.21 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/bitcount-prop-single) · [Specimen](https://fonts.google.com/specimen/Bitcount+Prop+Single)

<a id="bitcount-prop-single-ink"></a>

## Bitcount Prop Single Ink Regular — FAIL

Display · `BitcountPropSingleInk-VariableFont_CRSV,ELSH,ELXP,SZP1,SZP2,XPN1,XPN2,YPN1,YPN2,slnt,wght.ttf` · Version 1.002 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -0.00; mean distance in units per 1000 em: tight 38.2, standard 40.9, loose 71.9).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.00 is at the 45th percentile of Display fonts (median +0.04, robust z -0.1).
- INFO `spacing/evenness` — Shape error 36.5 units per 1000 em (gaps that depart from even spacing of these shapes): 94th percentile of Display fonts (median 17.9, robust z +3.1).
- **FAIL** `spacing/glyph-sides` — 2 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): S right +156, P right +157.
- INFO `spacing/pairs` — 1 pair is spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): Z, +172.
- INFO `spacing/designspace` — Checked at 68 locations of the designspace (18 named instances, 18 edges, 32 corners): closest to 68 tight; Looseness from -1.64 (ELXP 100 (max)) to +0.09 (SemiBold); shape error 32.1–39.0; 3 locations beyond the model's range.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 38.2 | +26.1 | 36.3 |
| standard | +0.00 | 40.9 | −18.0 | 36.5 |
| loose | +0.50 | 71.9 | −68.3 | 37.2 |
| best fit | −0.00 | | | 36.5 |

Units per 1000 em. Sidebearing error 70.6 · kerned-pair error 34.8 · kerning correlation 0.21 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/bitcount-prop-single-ink) · [Specimen](https://fonts.google.com/specimen/Bitcount+Prop+Single+Ink)

<a id="cinzel-decorative"></a>

## Cinzel Decorative Regular — FAIL

Display · `CinzelDecorative-Regular.ttf` · Version 1.002;PS 001.002;hotconv 1.0.56;makeotf.lib2.0.21325 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.59; mean distance in units per 1000 em: tight 67.4, standard 55.9, loose 82.7).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.59 is at the 16th percentile of Display fonts (median +0.04, robust z -1.2).
- **FAIL** `spacing/evenness` — Shape error 68.9 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 17.9, robust z +8.5).
- **FAIL** `spacing/glyph-sides` — 4 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): Q right -625, L right -529, Z right -366, & right -332.
- **WARN** `spacing/pairs` — 301 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): QX -821, Qn -525, Qd -508, Qs -502, Qk -507, QV -592, Qm -528, Qr -506, Ql -510, Qa -574.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 67.4 | −1.5 | 68.1 |
| standard (closest) | +0.00 | 55.9 | −37.4 | 64.5 |
| loose | +0.50 | 82.7 | −81.9 | 62.6 |
| best fit | −0.59 | | | 68.9 |

Units per 1000 em. Sidebearing error 43.4 · kerned-pair error 81.0 · kerning correlation 0.28 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/cinzel-decorative) · [Specimen](https://fonts.google.com/specimen/Cinzel+Decorative)

<a id="lily-script-one"></a>

## Lily Script One Regular — FAIL

Display · `LilyScriptOne-Regular.ttf` · Version 1.002;PS 001.001;hotconv 1.0.70;makeotf.lib2.5.58329 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -2.86; mean distance in units per 1000 em: tight 68.7, standard 78.2, loose 97.9).
- **WARN** `spacing/tightness` — Overall tightness: Looseness -2.86 is at the 0th percentile of Display fonts (median +0.04, robust z -5.3).
- **FAIL** `spacing/evenness` — Shape error 71.9 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 17.9, robust z +9.0).
- **FAIL** `spacing/glyph-sides` — 3 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): O right -167, ' right +256, ' left +234.
- **WARN** `spacing/pairs` — 203 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): 'S +340, 'H +374, 'X +302, 'O +358, '' +469, 'K +340, 'f +325, 'l +312, 'b +311, 'M +348.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 68.7 | −29.2 | 64.8 |
| standard | +0.00 | 78.2 | −54.3 | 63.2 |
| loose | +0.50 | 97.9 | −84.6 | 62.5 |
| best fit | −2.86 | | | 71.9 |

Units per 1000 em. Sidebearing error 53.9 · kerned-pair error 57.1 · kerning correlation 0.50 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/lily-script-one) · [Specimen](https://fonts.google.com/specimen/Lily+Script+One)

<a id="meie-script"></a>

## Meie Script Regular — FAIL

Handwriting · `MeieScript-Regular.ttf` · Version 1.001 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.27; mean distance in units per 1000 em: tight 185.9, standard 185.4, loose 188.1).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.27 is at the 61st percentile of Handwriting fonts (median -0.51, robust z +0.3).
- **FAIL** `spacing/evenness` — Shape error 188.9 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Handwriting fonts (median 38.5, robust z +7.2).
- **FAIL** `spacing/glyph-sides` — 24 sidebearings are far outside the norms of Handwriting fonts (units per 1000 em against their median): N right -604, V left +571, O left +481, M right -403, G left +406, W left +595, U left +520, X left +441.
- **WARN** `spacing/pairs` — 858 pairs are spaced far from how Handwriting fonts usually compare with the model (units per 1000 em, + looser): No -567, Nv -554, Nc -590, Nw -556, Ng -572, Ni -575, Na -549, Nq -551, ’O +595, Ny -582.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 185.9 | +44.4 | 189.3 |
| standard (closest) | +0.00 | 185.4 | +22.5 | 188.3 |
| loose | +0.50 | 188.1 | −5.5 | 187.1 |
| best fit | −0.27 | | | 188.9 |

Units per 1000 em. Sidebearing error 162.5 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/meie-script) · [Specimen](https://fonts.google.com/specimen/Meie+Script)

<a id="michroma"></a>

## Michroma Regular — FAIL

Sans Serif · `Michroma-Regular.ttf` · Version 1.100; ttfautohint (v1.8.4.7-5d5b);gftools[0.9.29] · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -0.84; mean distance in units per 1000 em: tight 59.1, standard 120.1, loose 206.1).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.84 is at the 0th percentile of Sans Serif fonts (median +0.03, robust z -2.9).
- **FAIL** `spacing/evenness` — Shape error 41.5 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Sans Serif fonts (median 14.2, robust z +6.6).
- INFO `spacing/glyph-sides` — Sides spaced unusually for Sans Serif fonts: Y left +73.
- INFO `spacing/pairs` — 1 pair is spaced far from how Sans Serif fonts usually compare with the model (units per 1000 em, + looser): rj +120.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 59.1 | −38.3 | 47.1 |
| standard | +0.00 | 120.1 | −116.7 | 50.7 |
| loose | +0.50 | 206.1 | −206.0 | 52.3 |
| best fit | −0.84 | | | 41.5 |

Units per 1000 em. Sidebearing error 25.8 · kerned-pair error 24.9 · kerning correlation 0.84 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/michroma) · [Specimen](https://fonts.google.com/specimen/Michroma)

<a id="oleo-script-swash-caps"></a>

## Oleo Script Swash Caps Regular — FAIL

Display · `OleoScriptSwashCaps-Regular.ttf` · Version 1.002 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -1.53; mean distance in units per 1000 em: tight 41.9, standard 41.4, loose 50.3).
- INFO `spacing/tightness` — Overall tightness: Looseness -1.53 is at the 5th percentile of Display fonts (median +0.04, robust z -2.9).
- **WARN** `spacing/evenness` — Shape error 44.8 units per 1000 em (gaps that depart from even spacing of these shapes): 97th percentile of Display fonts (median 17.9, robust z +4.5).
- **FAIL** `spacing/glyph-sides` — 2 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): G right -163, C right -168.
- **WARN** `spacing/pairs` — 54 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): AP -222, Gk -157, AB -222, Gf -188, Gh -158, Gx -202, Gr -144, Gj -315, Gp -171, GQ -175.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 41.9 | −3.3 | 42.4 |
| standard (closest) | +0.00 | 41.4 | −19.8 | 40.7 |
| loose | +0.50 | 50.3 | −40.5 | 40.5 |
| best fit | −1.53 | | | 44.8 |

Units per 1000 em. Sidebearing error 36.1 · kerned-pair error 48.9 · kerning correlation 0.23 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/oleo-script-swash-caps) · [Specimen](https://fonts.google.com/specimen/Oleo+Script+Swash+Caps)

<a id="sarina"></a>

## Sarina Regular — FAIL

Display · `Sarina-Regular.ttf` · Version 1.001 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -1.24; mean distance in units per 1000 em: tight 105.2, standard 106.1, loose 111.5).
- INFO `spacing/tightness` — Overall tightness: Looseness -1.24 is at the 6th percentile of Display fonts (median +0.04, robust z -2.4).
- **FAIL** `spacing/evenness` — Shape error 107.3 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Display fonts (median 17.9, robust z +14.9).
- **FAIL** `spacing/glyph-sides` — 6 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): p left -190, f left -175, " left +253, , right +219, ' left +231, . right +191.
- **WARN** `spacing/pairs` — 997 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): ep -268, df -258, uf -261, er -219, ef -276, sf -247, ua -219, lf -261, so -202, gf -241.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 105.2 | +6.5 | 105.6 |
| standard | +0.00 | 106.1 | −14.6 | 104.1 |
| loose | +0.50 | 111.5 | −40.9 | 102.9 |
| best fit | −1.24 | | | 107.3 |

Units per 1000 em. Sidebearing error 73.5 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/sarina) · [Specimen](https://fonts.google.com/specimen/Sarina)

<a id="sonsie-one"></a>

## Sonsie One Regular — FAIL

Display · `SonsieOne-Regular.ttf` · Version 1.003 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.79; mean distance in units per 1000 em: tight 69.9, standard 68.0, loose 75.9).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.79 is at the 13th percentile of Display fonts (median +0.04, robust z -1.5).
- **FAIL** `spacing/evenness` — Shape error 71.1 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 17.9, robust z +8.9).
- **FAIL** `spacing/glyph-sides` — 3 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): o right -176, w right -187, v right -174.
- **WARN** `spacing/pairs` — 281 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): os -194, oz -186, wo -185, oP -184, wq -173, us -128, om -155, ws -201, cR -158, cP -158.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 69.9 | +9.5 | 69.5 |
| standard (closest) | +0.00 | 68.0 | −16.1 | 66.8 |
| loose | +0.50 | 75.9 | −47.8 | 65.1 |
| best fit | −0.79 | | | 71.1 |

Units per 1000 em. Sidebearing error 58.1 · 4356 pairs measured.

[Full report](https://bghryct.github.io/KKQA/#/family/sonsie-one) · [Specimen](https://fonts.google.com/specimen/Sonsie+One)

<a id="trispace"></a>

## Trispace Regular — FAIL

Sans Serif · `Trispace-VariableFont_wdth,wght.ttf` · Version 1.210 · checked at weight 400 · baseline 2026-10-08-1419-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's loose preset (best-fit Looseness +1.50; mean distance in units per 1000 em: tight 154.2, standard 123.6, loose 89.0).
- **WARN** `spacing/tightness` — Overall tightness: Looseness +1.50 is at the 100th percentile of Sans Serif fonts (median +0.03, robust z +5.0).
- **FAIL** `spacing/evenness` — Shape error 51.7 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Sans Serif fonts (median 14.2, robust z +9.0).
- **WARN** `spacing/glyph-sides` — 13 glyph sides are spaced far from the norms of Sans Serif fonts (units per 1000 em against their median): m left -80, m right -66, O right -60, O left -60, : right +92, N right -62, ( left +136, ' left +97.
- **WARN** `spacing/pairs` — 126 pairs are spaced far from how Sans Serif fonts usually compare with the model (units per 1000 em, + looser): Om -143, mL -133, mO -128, mQ -128, mN -130, Nm -144, Sm -105, Gm -133, fm -152, mH -122.
- INFO `spacing/designspace` — Checked at 14 locations of the designspace (8 named instances, 2 edges, 4 corners): closest to 14 loose; Looseness from +0.64 (wght 800 · wdth 75) to +2.17 (wght 800 · wdth 125); shape error 29.5–106.2.
- **WARN** `spacing/instances` — 4 locations of the designspace are spaced far from the norms or from their neighbours: ExtraBold (spacing jumps against its neighbours); wdth 75 (min) (spacing jumps against its neighbours); wdth 125 (max) (shape error 97.9); wght 800 · wdth 125 (shape error 96.5).

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 154.2 | +154.2 | 52.5 |
| standard | +0.00 | 123.6 | +123.5 | 51.9 |
| loose (closest) | +0.50 | 89.0 | +87.3 | 51.6 |
| best fit | +1.50 | | | 51.7 |

Units per 1000 em. Sidebearing error 35.4 · kerned-pair error 43.1 · kerning correlation 0.48 · 4356 pairs measured.

### Designspace

The locations that raise the level: 5 of 14 checked (the family's report lists them all).

| Location | Where | Kind | Closest | Looseness | Shape error | Level |
|---|---|---|---|---:|---:|---|
| Regular | wght 400 | named, the main report | loose | +1.50 | 51.7 | **FAIL** |
| ExtraBold | wght 800 | named, extreme | loose | +2.11 | 47.7 | **WARN** |
| wdth 75 (min) | wdth 75 · wght 400 | edge | loose | +2.13 | 31.1 | **WARN** |
| wdth 125 (max) | wdth 125 · wght 400 | edge | loose | +1.18 | 97.9 | **WARN** |
| wght 800 · wdth 125 | wdth 125 · wght 800 | corner | loose | +2.17 | 96.5 | **WARN** |

- **WARN** ExtraBold — Along wdth, ExtraBold is spaced 0.70 Looseness looser than its neighbours suggest (wght 800 · wdth 75 +0.64, wght 800 · wdth 125 +2.17; here +2.11): an interpolation problem, or a master spaced apart?
- **WARN** wdth 75 (min) — Along wght, wdth 75 (min) is spaced 1.01 Looseness looser than its neighbours suggest (wght 100 · wdth 75 +1.47, wght 800 · wdth 75 +0.64; here +2.13): an interpolation problem, or a master spaced apart?
- **WARN** wdth 125 (max) — Shape error 97.9 units per 1000 em, 1.9× Regular's 51.7 (the main report): families usually lose far less evenness at their edges of middle weight (median 1.00×, robust z +7.5).
- **WARN** wght 800 · wdth 125 — Shape error 96.5 units per 1000 em, 1.9× Regular's 51.7 (the main report): families usually lose far less evenness at their bold corners (above wght 600) (median 0.99×, robust z +3.7).

[Full report](https://bghryct.github.io/KKQA/#/family/trispace) · [Specimen](https://fonts.google.com/specimen/Trispace)

