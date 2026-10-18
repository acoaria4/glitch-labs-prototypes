# v3 — Round 02

Three new experience prototypes, awaiting selection before the full site build. Open `/v3/` after serving the repository root. The first round is preserved under **`/drafts/round-01/`**, with individual links in the root version selector's **Drafts** section. There is no drafts folder inside v3.

| Direction | Main idea | Interaction |
| --- | --- | --- |
| Portal | A monumental, live 3D corridor connecting four product worlds | Scroll moves the camera through the same gateway architecture; pointer adds restrained depth |
| Signal | The studio's identity is a field of physical blocks | Disturb the letters with the pointer or the Disrupt button; they re-form |
| Orbit | Four project posters form an explorable spatial collection | Drag to turn the collection, select a named project, or click a poster |

Expenses, AURA, Lumen, then Afterlight remain the document and control order. Afterlight is explicitly **in development**. Its imagery and description come from the local Afterlight repository; development captures do not represent balanced-play results or a downloadable release.

The comparison picker uses **1–3**, **left/right**, and **R** for switch/replay. Selection persists in the query string. Each prototype also works directly through `prototypes/portal.html`, `signal.html`, or `orbit.html`.

## Architecture

Buildless HTML/CSS/JavaScript. Three.js r170 and official RoomEnvironment, RoundedBoxGeometry, and Reflector add-ons are local. GSAP 3.13.0 + ScrollTrigger and Lenis 1.3.26 are also local. One renderer, scene, and Lenis instance per loaded experience; the GSAP ticker drives smooth scroll and rendering. Touch scrolling stays native.

Portal keeps one world alive across its authored chapters. Signal uses one instanced draw for its letter field. Orbit uses four physical poster objects and native controls describing the same selection. Renderer DPR is capped, Portal's mirror is omitted when initially opened on a phone, and offscreen/hidden scenes pause. GPU resources, observations, and event handlers are released on motion changes and page exit.

Motion off and system reduced motion retain static, readable content. Portal uses its generated poster; Signal uses native typography; Orbit uses a printed fallback with working selection buttons. WebGL failure also retains the content and project links. The complete project index remains in HTML before enhancement.

See [DIRECTION.md](DIRECTION.md) for the world, camera, material, and interaction contracts; see [assets/README.md](assets/README.md) for provenance.

## Verification

From the repository root:

```powershell
python -X utf8 scripts/check-site.py
node --check v3/scripts/experience.js
node --check v3/scripts/picker.js
```

The local-resource checker permits explicit navigation from a version into the root drafts archive; runtime assets still cannot escape their version. Archive pages retain their own local dependencies. All 49 files from the first round were verified byte-identical after moving them.

Live rendering was verified for all three directions at 320, 390, 800, and 1440px without horizontal overflow or browser warnings/errors. Orbit selection, drag, Afterlight status, and motion-off selection were checked. Root Drafts links were followed into the preserved original. Further review evidence is kept under ignored `.cache/v3-round02-review/`.

Skills: `prototype`, `build-awwwards-quality-sites`, `build-threejs-scroll-worlds`, `webgl-landing-steering`, `threejs`, and the existing GSAP/Lenis motion workflow. Fonts: Bebas Neue and Space Grotesk, with local OFL licenses. This is a local design exploration; physical-device frame rates and cross-browser behavior remain unmeasured.

## Final review — 18 October 2026

All 32 pages and 825 local HTML/CSS references passed validation. Both authored scripts passed syntax checks; v1/v2 are unchanged. The root Drafts links opened the archived original with its images intact. A script-free Portal fixture retained readable headings, all four projects, and links, then was removed.

Portal's forward journey to Afterlight and reverse trip to Expenses were checked. Signal's keyboard-triggered disruption was observed in the renderer; its phone composition folds the identity into two rows. Orbit's native selection, raycast/drag selection, and working motion-off selection were verified. Afterlight selection hides the release link and displays In development. All three rendered at 320/390/800/1440px without horizontal overflow. Desktop/phone captures are retained under `.cache/v3-round02-review/`; no browser warnings or errors were recorded in these checks.
