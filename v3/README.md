# v3 — Design explorations

Three interactive design directions for the next gLitCh Labs site, awaiting the user's choice before the full build. Serve the repository root and open `/v3/`.

| Direction | Composition | Motion |
| --- | --- | --- |
| Blue / Editorial | Warm paper, electric blue, grotesk/serif typography, a sculptural cover, staggered project grid | Art depth, gentle parallax, sequenced reveals |
| Dark / Observatory | Ink-black gallery, acid-green light, large serif type, landscape project spreads | Luminous cover, art depth, larger quiet reveals |
| Color / Playground | Butter yellow, coral, lilac, mint, rounded type, stacked project posters | Rotated compositions, sticky desktop posters with scroll-linked scale |

The bottom picker switches instantly between directions. Keys **1–3**, **left/right arrows**, and **R** switch or replay; keyboard events from the embedded pages reach the picker. The selection persists in `?v=1`, `?v=2`, or `?v=3`. Each direction is also directly accessible in `prototypes/`.

Each concept includes Expenses, AURA, Lumen, then Afterlight. Afterlight is explicitly **in development**, with no release date, store, or download claim. Its description and capture come from the local Afterlight repo, including README.md, NEXT_RUN.md, ART_DIRECTION.md, and current art-direction test captures.

Working samples: exact bill splits for two/three/four people, selectable fictional AURA placements, Lumen answer/feedback/reset, and expandable Afterlight information. App samples are labeled concepts. The AURA orbital graphic is illustrative rather than a calculated or traditional chart. Gameplay captures are development fixtures, not evidence of economic balance.

## Implementation

Plain HTML/CSS/JS. GSAP 3.13.0 + ScrollTrigger and Lenis 1.3.26 are copied locally with their licenses. One Lenis instance per loaded direction, driven by the GSAP ticker; native touch scrolling. No Three.js: generated sculptural artwork supplies the visual depth for this comparison. Full WebGL would be a separate choice after selection.

The Motion control and system reduced-motion preference remove smooth scrolling, scroll-linked effects, and entrances. Color posters return to normal flow. Without JavaScript, project content and navigation remain available; sample controls stay disabled. The picker offers direct-page links without JavaScript. Resources are version-local. Earlier versions are untouched.

Skills: `prototype` (picker and divergent directions), `build-awwwards-quality-sites`, `editorial-portfolio-chapters`, `cinematic-gsap-lenis-motion-system`, `design-taste-frontend`, and `imagegen`.

## Assets and checks

See `assets/README.md` and `assets/provenance.json` for artwork, source copies, and hashes. Original studio/product marks are unchanged. Three original hero images were generated with the built-in image tool. Font and vendor licenses are retained.

Run `python -X utf8 scripts/check-site.py` from the root, then `node --check` for `scripts/picker.js` and `scripts/explorations.js` inside v3. Browser review covers all directions, picker switching/replay, keyboard use, responsive widths, sample controls, motion off, and a script-free fixture. Saved review captures live in ignored `.cache/v3-review/`.

## Review — 18 October 2026

- Root validator passed 27 pages and 731 local references; both authored v3 scripts passed Node syntax checks. v1 and v2 have no changes.
- Desktop covers and 390px phone compositions inspected for every direction. Widths 320, 390, 800, 1000, and 1440 were checked; observed overflow and phone grid/title issues were repaired and rechecked.
- Picker buttons, number/arrow shortcuts, replay, URL persistence, and exactly one active choice verified in the browser.
- Bill allocation (including the exact three-person remainder), AURA selection, Lumen empty/wrong/correct/reset states, and Afterlight disclosure verified.
- Motion off removed Lenis and restored Color posters to normal flow; restoring motion reinstated the scene. A script-free fixture retained visible content, links, and disabled sample controls, then was removed.
- No browser warnings or errors were recorded during these checks. OS reduced-motion is implemented through live matchMedia and CSS; the available browser tool did not expose media-preference emulation.
