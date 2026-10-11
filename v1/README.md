# Cinematic studio prototype

Open `http://127.0.0.1:8089/v1/` after serving this repository root with `python -m http.server 8089 --bind 127.0.0.1`. The version directory is at `http://127.0.0.1:8089/`.

## Creative direction

Everyday life, brought into focus. A composed titanium opening introduces the existing studio mark; a silver line warms to champagne and connects it to a working Expenses bill-splitting concept. AURA opens into an ivory editorial chart, followed by Lumen's blush practice desk. Each product retains its palette and typography from the version-local snapshot stylesheets: Manrope for Expenses, Cormorant Garamond with DM Sans for AURA, and Outfit for Lumen. DM Sans remains the studio body face.

Sequence: studio opening → Expenses introduction and interactive bill → AURA chart exploration → Lumen sample practice → studio return. Original studio and product icons are reused, without alteration. All three scenes are clearly labeled interface concepts using sample data, not app screenshots. The chart is an original CSS data diagram; no generated people or stock media are used.

AURA's fixed-sign South Indian chart shows three explicitly fictional placements. Native radio controls select the Ascendant, Sun, or Moon and keep the chart highlight and reading pane in agreement. Its slower entrances and open page composition emphasize contemplation; it does not calculate a personal chart or produce predictions. Lumen presents three authored science/math samples, answer explanations, next-question controls, and a restartable completion state. Its compact response animation emphasizes understanding. The site preserves Lumen's coming-soon availability.

Skills: `build-awwwards-quality-sites`, `gsap-scrolltrigger-storytelling`, `animation-systems`, with the existing-project preservation approach from `redesign-existing-projects`.

## Motion and architecture

- GSAP 3.13.0 with ScrollTrigger coordinates the introduction, connecting line, and desktop bill assembly. A short pinned composition is enabled only on sufficiently wide and tall screens.
- Lenis 1.3.26 is the sole smooth-scroll engine, driven by the GSAP ticker. Lenis was selected over Locomotive Scroll because this small prototype only needs wheel interpolation; GSAP already handles viewport choreography. Touch remains native. No CSS scroll snapping.
- CSS handles button feedback. No Three.js: the existing focal asset, dimensional CSS transforms, and lighting support the concept without a continuously rendered canvas.
- No React migration is needed for these scenes. Libraries are vendored locally; page use makes no third-party requests.
- Intro: 1.2 seconds, power3 easing, 80 ms text stagger. Micro interactions: 160–220 ms. Desktop story: one short scroll sequence, then normal document flow.
- System reduced motion or the visible motion button removes Lenis, pointer response, scrubbed/pinned sequences, and entrance animations. All content renders immediately. All three product interactions remain functional. The currently visible scene retains its position when Expenses' pin spacing is removed or restored.
- Plain HTML is complete without JavaScript. Interaction controls start disabled and are enabled by the demo script. A noscript note explains the sample.
- Navigating away tears down observers, listeners, timelines, and Lenis. Returning from the back-forward cache reinitializes them.

This version is self-contained inside `v1/`, with local styles, scripts, artwork, fonts, and vendor libraries. Product and privacy links point to https://theglitchlabs.com. The production repository is independent. This preview retains `noindex` metadata; this repository has no deployment workflow.

## Vendor provenance

Downloaded from the npm distributions via jsDelivr:

- https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js
- https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js
- https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js
- https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.css

Upstream license notices are preserved in the scripts and accompanying vendor license files. Fonts and original artwork retain the repository's existing provenance.

## Verification

From the repository root, run `python -X utf8 scripts/check-site.py` and `node --check` on the four authored files in `v1/scripts/`. Browser verification should cover desktop and mobile, keyboard access, 2/3/4-person splits and reset, reduced motion and live motion preference changes, and a usable static page with unavailable libraries or JavaScript.

The ₹2,840 example is calculated in integer paise: a three-person split must allocate ₹946.67, ₹946.67, and ₹946.66 so the total remains exact.

## Historical design review — 11 October 2026

These checks were recorded before extraction from the production repository; its page counts and optimization notes refer to that repository. See the root README for migration checks.

- Syntax checks passed for all four authored scripts; the repository page/link checker passed for all 22 pages.
- Desktop and phone compositions inspected in Chromium, including 1440 × 900 and 390 × 844. Independent review found no horizontal overflow at 320, 390, 1000, 1280, or 1440px widths. At the 1000 × 850 pin boundary, the bill and its controls remain accessible.
- Two/four-way splits return ₹1,420/₹710 per person; three-way split returns ₹946.67, ₹946.67, ₹946.66. Reset, arrow-key radio selection, live announcements, and visible result focus verified.
- Switching motion off removes pin spacers and Lenis classes, clears transforms, and preserves the visible story position. Toggling back on restores the preview. Native touch scrolling is retained by configuration; physical device feel still merits user review.
- Script-free HTML remains readable; removing vendor scripts still leaves the native bill interaction usable. Temporary test fixtures were removed after verification. Browser console showed no warnings or errors in these checks.
- Existing `check-optimized.py` fails on this Windows checkout's CRLF bytes. An independent audit confirmed all 64 source/output/fallback hashes across the 30 production manifest entries exactly match Git HEAD; all 12 working-file differences are CRLF conversion only. Production files were not edited.
- Historical preview screenshots are retained in the ignored `.cache/prototype-review/` directory in this repository. This is a visual prototype, not a production rollout or a cross-browser performance certification.

## AURA and Lumen extension review

- Preserved the shared AURA ivory/bronze + Cormorant Garamond / DM Sans and Lumen blush/plum/pink/gold + Outfit theme tokens. No production files changed.
- AURA Ascendant/Sun/Moon selection updates the fixed chart highlight, visible explanation, and live status. Arrow-key selection verified. On phones the controls sit directly above the chart, followed by its explanation. The fixed South Indian sign layout was checked against the [Murugan Calendar chart guide](https://murugancalendar.com/en/jathagam); placements are fictional examples.
- Lumen's incorrect and correct answers, all three questions, completion, restart, visible answer labels, and focus transitions verified in the browser. Questions are authored examples; product scope and coming-soon availability follow the existing Lumen page.
- No horizontal overflow at 320, 390, 800, 1000, or 1440px. Desktop and 390px phone compositions inspected; intermediate navigation fits at 800px.
- With vendor scripts removed, both new interactions remained functional and the motion toggle stayed hidden. A script-free fixture kept disabled controls and readable static content/fallback explanations. Temporary fixtures were removed.
- Switching motion off in AURA preserved the chart's viewport position within one pixel while removing the Expenses pin spacer and Lenis classes. Lumen receives layout refreshes after state changes.
- New preview captures: `.cache/prototype-review/aura-desktop.jpg`, `aura-mobile.jpg`, `lumen-desktop.jpg`, and `lumen-mobile.jpg`.
