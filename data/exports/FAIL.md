# Spacing QA — FAIL: 12 families

Spacing extremely far outside the norms of the family's Google Fonts category — by how evenly the shapes are spaced, by single glyph sides, or by overall tightness. Each family lists the reasons, worst first.

1950 families in the library · baseline 2026-10-08-0604-1115 (1115 fonts in the norms) · spacingqa 0.1.0 kinetikern2 2.0.0

| Family | Category | Closest | Looseness | Shape error | Reasons | Notes |
|---|---|---|---:|---:|---|---|
| [Almendra SC](https://fonts.google.com/specimen/Almendra+SC) | Serif | standard | −0.67 | 50.8 | `evenness` |  |
| [Alumni Sans Collegiate One](https://fonts.google.com/specimen/Alumni+Sans+Collegiate+One) | Sans Serif | tight | −2.96 | 9.7 | `tightness` |  |
| [Bitcount Prop Single](https://fonts.google.com/specimen/Bitcount+Prop+Single) | Display | standard | −0.00 | 38.5 | `glyph-sides` |  |
| [Bitcount Prop Single Ink](https://fonts.google.com/specimen/Bitcount+Prop+Single+Ink) | Display | standard | −0.00 | 38.5 | `glyph-sides` |  |
| [Cinzel Decorative](https://fonts.google.com/specimen/Cinzel+Decorative) | Display | standard | −0.59 | 69.2 | `evenness` `glyph-sides` |  |
| [Lily Script One](https://fonts.google.com/specimen/Lily+Script+One) | Display | tight | −2.86 | 71.9 | `evenness` `glyph-sides` |  |
| [Meie Script](https://fonts.google.com/specimen/Meie+Script) | Handwriting | standard | −0.27 | 188.8 | `evenness` `glyph-sides` |  |
| [Michroma](https://fonts.google.com/specimen/Michroma) | Sans Serif | tight | −0.84 | 46.8 | `evenness` |  |
| [Oleo Script Swash Caps](https://fonts.google.com/specimen/Oleo+Script+Swash+Caps) | Display | tight | −1.53 | 43.5 | `glyph-sides` |  |
| [Sarina](https://fonts.google.com/specimen/Sarina) | Display | tight | −1.24 | 109.0 | `evenness` `glyph-sides` |  |
| [Sonsie One](https://fonts.google.com/specimen/Sonsie+One) | Display | standard | −0.79 | 70.8 | `evenness` `glyph-sides` |  |
| [Trispace](https://fonts.google.com/specimen/Trispace) | Sans Serif | loose | +1.50 | 54.1 | `evenness` |  |

---

<a id="almendra-sc"></a>

## Almendra SC Regular — FAIL

Serif · `AlmendraSC-Regular.ttf` · Version 1.002 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.67; mean distance in units per 1000 em: tight 49.9, standard 46.5, loose 64.5).
- **WARN** `spacing/tightness` — Overall tightness: Looseness -0.67 is at the 0th percentile of Serif fonts (median +0.14, robust z -3.8).
- **FAIL** `spacing/evenness` — Shape error 50.8 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Serif fonts (median 19.5, robust z +7.5).
- **WARN** `spacing/glyph-sides` — 1 sidebearing is far outside the norms of Serif fonts (units per 1000 em against their median): W left -150.
- **WARN** `spacing/pairs` — 176 pairs are spaced far from how Serif fonts usually compare with the model (units per 1000 em, + looser): CW -176, ZV -192, CV -174, ZW -193, KH -191, KK -192, CN -145, cN -137, CU -144, KF -190.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 49.9 | −1.0 | 50.1 |
| standard (closest) | +0.00 | 46.5 | −28.2 | 49.1 |
| loose | +0.50 | 64.5 | −61.6 | 49.2 |
| best fit | −0.67 | | | 50.8 |

Units per 1000 em. Sidebearing error 31.7 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Almendra+SC)

<a id="alumni-sans-collegiate-one"></a>

## Alumni Sans Collegiate One Regular — FAIL

Sans Serif · `AlumniSansCollegiateOne-Regular.ttf` · Version 1.100 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -2.96; mean distance in units per 1000 em: tight 181.7, standard 251.7, loose 330.4).
- **FAIL** `spacing/tightness` — Overall tightness: Looseness -2.96 is at the 0th percentile of Sans Serif fonts (median +0.03, robust z -10.1).
- INFO `spacing/evenness` — Shape error 9.7 units per 1000 em (gaps that depart from even spacing of these shapes): 3rd percentile of Sans Serif fonts (median 17.0, robust z -1.6).

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 181.7 | −181.6 | 17.9 |
| standard | +0.00 | 251.7 | −251.7 | 17.8 |
| loose | +0.50 | 330.4 | −330.4 | 17.7 |
| best fit | −2.96 | | | 9.7 |

Units per 1000 em. Sidebearing error 5.7 · kerned-pair error 14.1 · kerning correlation 0.75 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Alumni+Sans+Collegiate+One)

<a id="bitcount-prop-single"></a>

## Bitcount Prop Single Regular — FAIL

Display · `BitcountPropSingle-VariableFont_CRSV,ELSH,ELXP,slnt,wght.ttf` · Version 1.0 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.00; mean distance in units per 1000 em: tight 44.1, standard 40.5, loose 68.9).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.00 is at the 45th percentile of Display fonts (median +0.04, robust z -0.1).
- INFO `spacing/evenness` — Shape error 38.5 units per 1000 em (gaps that depart from even spacing of these shapes): 95th percentile of Display fonts (median 19.4, robust z +2.6).
- **FAIL** `spacing/glyph-sides` — 3 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): S right +157, C right +153, P right +160.
- INFO `spacing/pairs` — 2 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): Z, +174, Sx +137.
- INFO `spacing/designspace` — Checked at 52 locations of the designspace (18 named instances, 6 edges, 28 corners): closest to 3 standard, 49 tight; Looseness from -1.64 (wght 100 · ELXP 100 · ELSH 100 · slnt -8 · CRSV 0) to +0.09 (SemiBold); shape error 31.4–41.7; 12 locations beyond the model's range.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 44.1 | +32.5 | 38.7 |
| standard (closest) | +0.00 | 40.5 | −13.1 | 38.5 |
| loose | +0.50 | 68.9 | −64.9 | 37.8 |
| best fit | −0.00 | | | 38.5 |

Units per 1000 em. Sidebearing error 70.5 · kerned-pair error 34.7 · kerning correlation 0.21 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Bitcount+Prop+Single)

<a id="bitcount-prop-single-ink"></a>

## Bitcount Prop Single Ink Regular — FAIL

Display · `BitcountPropSingleInk-VariableFont_CRSV,ELSH,ELXP,SZP1,SZP2,XPN1,XPN2,YPN1,YPN2,slnt,wght.ttf` · Version 1.002 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.00; mean distance in units per 1000 em: tight 44.1, standard 40.5, loose 68.9).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.00 is at the 45th percentile of Display fonts (median +0.04, robust z -0.1).
- INFO `spacing/evenness` — Shape error 38.5 units per 1000 em (gaps that depart from even spacing of these shapes): 95th percentile of Display fonts (median 19.4, robust z +2.6).
- **FAIL** `spacing/glyph-sides` — 3 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): S right +157, C right +153, P right +160.
- INFO `spacing/pairs` — 2 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): Z, +174, Sx +137.
- INFO `spacing/designspace` — Checked at 68 locations of the designspace (18 named instances, 18 edges, 32 corners): closest to 15 standard, 53 tight; Looseness from -1.64 (ELXP 100 (max)) to +0.09 (SemiBold); shape error 31.6–40.8; 3 locations beyond the model's range.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 44.1 | +32.5 | 38.7 |
| standard (closest) | +0.00 | 40.5 | −13.1 | 38.5 |
| loose | +0.50 | 68.9 | −64.9 | 37.8 |
| best fit | −0.00 | | | 38.5 |

Units per 1000 em. Sidebearing error 70.5 · kerned-pair error 34.7 · kerning correlation 0.21 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Bitcount+Prop+Single+Ink)

<a id="cinzel-decorative"></a>

## Cinzel Decorative Regular — FAIL

Display · `CinzelDecorative-Regular.ttf` · Version 1.002;PS 001.002;hotconv 1.0.56;makeotf.lib2.0.21325 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.59; mean distance in units per 1000 em: tight 69.5, standard 57.3, loose 81.6).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.59 is at the 16th percentile of Display fonts (median +0.04, robust z -1.2).
- **FAIL** `spacing/evenness` — Shape error 69.2 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 19.4, robust z +6.7).
- **FAIL** `spacing/glyph-sides` — 4 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): Q right -629, L right -518, Z right -356, & right -327.
- **WARN** `spacing/pairs` — 298 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): Qm -533, Qa -574, Qk -514, Qn -531, Qr -512, qX -642, QX -816, Qi -515, Qh -513, Qz -512.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 69.5 | +1.7 | 68.7 |
| standard (closest) | +0.00 | 57.3 | −34.9 | 65.9 |
| loose | +0.50 | 81.6 | −80.3 | 64.2 |
| best fit | −0.59 | | | 69.2 |

Units per 1000 em. Sidebearing error 44.4 · kerned-pair error 79.0 · kerning correlation 0.28 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Cinzel+Decorative)

<a id="lily-script-one"></a>

## Lily Script One Regular — FAIL

Display · `LilyScriptOne-Regular.ttf` · Version 1.002;PS 001.001;hotconv 1.0.70;makeotf.lib2.5.58329 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -2.86; mean distance in units per 1000 em: tight 69.0, standard 79.5, loose 99.5).
- **WARN** `spacing/tightness` — Overall tightness: Looseness -2.86 is at the 0th percentile of Display fonts (median +0.04, robust z -5.3).
- **FAIL** `spacing/evenness` — Shape error 71.9 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 19.4, robust z +7.1).
- **FAIL** `spacing/glyph-sides` — 4 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): O right -164, ' right +252, ' left +231, J right -151.
- **WARN** `spacing/pairs` — 227 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): 'S +340, 'O +358, '' +460, 't +301, 'H +367, 'f +324, 'Q +327, 'i +293, 'K +333, 'N +319.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 69.0 | −28.3 | 65.2 |
| standard | +0.00 | 79.5 | −53.7 | 64.3 |
| loose | +0.50 | 99.5 | −84.3 | 64.3 |
| best fit | −2.86 | | | 71.9 |

Units per 1000 em. Sidebearing error 53.9 · kerned-pair error 55.3 · kerning correlation 0.57 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Lily+Script+One)

<a id="meie-script"></a>

## Meie Script Regular — FAIL

Handwriting · `MeieScript-Regular.ttf` · Version 1.001 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.27; mean distance in units per 1000 em: tight 185.5, standard 185.2, loose 187.4).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.27 is at the 61st percentile of Handwriting fonts (median -0.51, robust z +0.3).
- **FAIL** `spacing/evenness` — Shape error 188.8 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Handwriting fonts (median 36.4, robust z +7.8).
- **FAIL** `spacing/glyph-sides` — 23 sidebearings are far outside the norms of Handwriting fonts (units per 1000 em against their median): N right -603, M right -402, O left +482, G left +408, V left +569, U left +521, W left +595, F left +365.
- **WARN** `spacing/pairs` — 895 pairs are spaced far from how Handwriting fonts usually compare with the model (units per 1000 em, + looser): Nc -588, Nv -554, Nw -556, No -564, Nq -549, Ng -568, Na -548, ’U +597, Ni -572, ’O +597.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 185.5 | +46.9 | 189.2 |
| standard (closest) | +0.00 | 185.2 | +24.3 | 188.1 |
| loose | +0.50 | 187.4 | −4.3 | 186.6 |
| best fit | −0.27 | | | 188.8 |

Units per 1000 em. Sidebearing error 161.9 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Meie+Script)

<a id="michroma"></a>

## Michroma Regular — FAIL

Sans Serif · `Michroma-Regular.ttf` · Version 1.100; ttfautohint (v1.8.4.7-5d5b);gftools[0.9.29] · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -0.84; mean distance in units per 1000 em: tight 61.6, standard 119.2, loose 205.1).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.84 is at the 0th percentile of Sans Serif fonts (median +0.03, robust z -2.9).
- **FAIL** `spacing/evenness` — Shape error 46.8 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Sans Serif fonts (median 17.0, robust z +6.7).
- INFO `spacing/glyph-sides` — Sides spaced unusually for Sans Serif fonts: Y right +80.
- INFO `spacing/pairs` — 2 pairs are spaced far from how Sans Serif fonts usually compare with the model (units per 1000 em, + looser): rj +125, AY +202.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 61.6 | −36.1 | 51.7 |
| standard | +0.00 | 119.2 | −115.1 | 53.1 |
| loose | +0.50 | 205.1 | −205.0 | 52.6 |
| best fit | −0.84 | | | 46.8 |

Units per 1000 em. Sidebearing error 29.7 · kerned-pair error 28.6 · kerning correlation 0.82 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Michroma)

<a id="oleo-script-swash-caps"></a>

## Oleo Script Swash Caps Regular — FAIL

Display · `OleoScriptSwashCaps-Regular.ttf` · Version 1.002 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -1.53; mean distance in units per 1000 em: tight 41.3, standard 43.1, loose 53.2).
- INFO `spacing/tightness` — Overall tightness: Looseness -1.53 is at the 5th percentile of Display fonts (median +0.04, robust z -2.9).
- INFO `spacing/evenness` — Shape error 43.5 units per 1000 em (gaps that depart from even spacing of these shapes): 96th percentile of Display fonts (median 19.4, robust z +3.3).
- **FAIL** `spacing/glyph-sides` — 2 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): G right -160, C right -166.
- **WARN** `spacing/pairs` — 57 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): CR -175, CP -175, CL -160, Gf -184, Gp -172, Gk -159, CF -171, AB -216, Gh -159, Gn -149.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 41.3 | −3.3 | 41.6 |
| standard | +0.00 | 43.1 | −19.8 | 41.7 |
| loose | +0.50 | 53.2 | −40.6 | 43.0 |
| best fit | −1.53 | | | 43.5 |

Units per 1000 em. Sidebearing error 35.3 · kerned-pair error 47.7 · kerning correlation 0.25 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Oleo+Script+Swash+Caps)

<a id="sarina"></a>

## Sarina Regular — FAIL

Display · `Sarina-Regular.ttf` · Version 1.001 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's tight preset (best-fit Looseness -1.24; mean distance in units per 1000 em: tight 107.2, standard 109.2, loose 115.7).
- INFO `spacing/tightness` — Overall tightness: Looseness -1.24 is at the 6th percentile of Display fonts (median +0.04, robust z -2.4).
- **FAIL** `spacing/evenness` — Shape error 109.0 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Display fonts (median 19.4, robust z +12.1).
- **FAIL** `spacing/glyph-sides` — 6 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): p left -194, f left -172, " left +249, , right +214, ' left +230, . right +187.
- **WARN** `spacing/pairs` — 1063 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): ep -273, er -222, df -257, ef -274, uf -260, ia -224, so -195, up -262, cp -269, sp -239.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight (closest) | −0.50 | 107.2 | +6.4 | 107.7 |
| standard | +0.00 | 109.2 | −14.8 | 107.1 |
| loose | +0.50 | 115.7 | −41.1 | 106.7 |
| best fit | −1.24 | | | 109.0 |

Units per 1000 em. Sidebearing error 74.5 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Sarina)

<a id="sonsie-one"></a>

## Sonsie One Regular — FAIL

Display · `SonsieOne-Regular.ttf` · Version 1.003 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's standard preset (best-fit Looseness -0.79; mean distance in units per 1000 em: tight 70.3, standard 68.2, loose 76.6).
- INFO `spacing/tightness` — Overall tightness: Looseness -0.79 is at the 13th percentile of Display fonts (median +0.04, robust z -1.5).
- **FAIL** `spacing/evenness` — Shape error 70.8 units per 1000 em (gaps that depart from even spacing of these shapes): 99th percentile of Display fonts (median 19.4, robust z +6.9).
- **FAIL** `spacing/glyph-sides` — 2 sidebearings are far outside the norms of Display fonts (units per 1000 em against their median): o right -176, w right -183.
- **WARN** `spacing/pairs` — 329 pairs are spaced far from how Display fonts usually compare with the model (units per 1000 em, + looser): os -193, oz -181, oP -185, og -170, om -159, or -158, cR -158, us -131, sP -153, op -166.

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 70.3 | +10.7 | 69.4 |
| standard (closest) | +0.00 | 68.2 | −15.2 | 67.3 |
| loose | +0.50 | 76.6 | −47.3 | 66.1 |
| best fit | −0.79 | | | 70.8 |

Units per 1000 em. Sidebearing error 57.0 · 4356 pairs measured.

[Specimen](https://fonts.google.com/specimen/Sonsie+One)

<a id="trispace"></a>

## Trispace Regular — FAIL

Sans Serif · `Trispace-VariableFont_wdth,wght.ttf` · Version 1.210 · checked at weight 400 · baseline 2026-10-08-0604-1115

- INFO `spacing/closest` — Spacing is closest to Kinetikern2's loose preset (best-fit Looseness +1.50; mean distance in units per 1000 em: tight 156.2, standard 125.0, loose 90.0).
- **WARN** `spacing/tightness` — Overall tightness: Looseness +1.50 is at the 100th percentile of Sans Serif fonts (median +0.03, robust z +5.0).
- **FAIL** `spacing/evenness` — Shape error 54.1 units per 1000 em (gaps that depart from even spacing of these shapes): 100th percentile of Sans Serif fonts (median 17.0, robust z +8.3).
- **WARN** `spacing/glyph-sides` — 11 glyph sides are spaced far from the norms of Sans Serif fonts (units per 1000 em against their median): m left -75, O left -63, Q left -63, : right +98, . right +86, O right -61, ' left +102, ( left +139.
- **WARN** `spacing/pairs` — 83 pairs are spaced far from how Sans Serif fonts usually compare with the model (units per 1000 em, + looser): Om -138, fm -156, mO -124, Sm -105, mQ -124, Gm -133, Wi -127, Qm -136, :r +138, mG -107.
- INFO `spacing/designspace` — Checked at 14 locations of the designspace (8 named instances, 2 edges, 4 corners): closest to 14 loose; Looseness from +0.64 (wght 800 · wdth 75) to +2.17 (wght 800 · wdth 125); shape error 31.3–108.9.
- **WARN** `spacing/instances` — 3 locations of the designspace are spaced far from the norms or from their neighbours: ExtraBold (spacing jumps against its neighbours); wdth 75 (min) (spacing jumps against its neighbours); wdth 125 (max) (shape error 101.1).

| Spacing | Looseness | Distance | Offset | Shape error |
|---|---:|---:|---:|---:|
| tight | −0.50 | 156.2 | +156.2 | 52.9 |
| standard | +0.00 | 125.0 | +125.0 | 53.2 |
| loose (closest) | +0.50 | 90.0 | +88.2 | 53.5 |
| best fit | +1.50 | | | 54.1 |

Units per 1000 em. Sidebearing error 35.5 · kerned-pair error 57.3 · kerning correlation 0.48 · 4356 pairs measured.

### Designspace

The locations that raise the level: 4 of 14 checked (the family's report lists them all).

| Location | Where | Kind | Closest | Looseness | Shape error | Level |
|---|---|---|---|---:|---:|---|
| Regular | wght 400 | named, the main report | loose | +1.50 | 54.1 | **FAIL** |
| ExtraBold | wght 800 | named, extreme | loose | +2.11 | 53.3 | **WARN** |
| wdth 75 (min) | wdth 75 · wght 400 | edge | loose | +2.13 | 31.3 | **WARN** |
| wdth 125 (max) | wdth 125 · wght 400 | edge | loose | +1.18 | 101.1 | **WARN** |

- **WARN** ExtraBold — Along wdth, ExtraBold is spaced 0.70 Looseness looser than its neighbours suggest (wght 800 · wdth 75 +0.64, wght 800 · wdth 125 +2.17; here +2.11): an interpolation problem, or a master spaced apart?
- **WARN** wdth 75 (min) — Along wght, wdth 75 (min) is spaced 1.01 Looseness looser than its neighbours suggest (wght 100 · wdth 75 +1.47, wght 800 · wdth 75 +0.64; here +2.13): an interpolation problem, or a master spaced apart?
- **WARN** wdth 125 (max) — Shape error 101.1 units per 1000 em, 1.9× Regular's 54.1 (the main report): families usually lose far less evenness at their edges of middle weight (median 1.00×, robust z +7.4).

[Specimen](https://fonts.google.com/specimen/Trispace)

