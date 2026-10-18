# v3 — Round 02

Three new experience prototypes, awaiting selection before the full site build. Open `/v3/` after serving the repository root. The first round is preserved under **`/drafts/round-01/`**, with individual links in the root version selector's **Drafts** section. There is no drafts folder inside v3.

| Direction | Main idea | Interaction |
| --- | --- | --- |
| Portal | A monumental, live 3D corridor connecting four product worlds | Scroll moves the camera through the same gateway architecture; pointer adds restrained depth |
| Signal | The studio's identity is a field of physical blocks | Disturb the letters with the pointer or the Disrupt button; they re-form |
| Orbit | Four dimensional app logos form an explorable spatial collection | Drag to turn the collection, select a named project, or click a logo |

Expenses, AURA, Lumen, then Afterlight remain the document and control order. Afterlight is explicitly **in development**. Its imagery and description come from the local Afterlight repository; development captures do not represent balanced-play results or a downloadable release.

The comparison picker uses **1–3**, **left/right**, and **R** for switch/replay. Selection persists in the query string. Each prototype also works directly through `prototypes/portal.html`, `signal.html`, or `orbit.html`.

## Architecture

Buildless HTML/CSS/JavaScript. Three.js r170 and official RoomEnvironment, RoundedBoxGeometry, Reflector, and SVGLoader add-ons are local. GSAP 3.13.0 + ScrollTrigger and Lenis 1.3.26 are also local. One renderer, scene, and Lenis instance per loaded experience; the GSAP ticker drives smooth scroll and rendering. Touch scrolling stays native.

Portal keeps one world alive across its authored chapters. Signal uses one instanced draw for its letter field. Signal’s project marks use CSS 3D depth, GSAP entrance reveals, pointer tilt, and native keyboard/touch animation buttons. Orbit uses four physical logo objects and native controls describing the same selection. Renderer DPR is capped, Portal's mirror is omitted when initially opened on a phone, and offscreen/hidden scenes pause. GPU resources, observations, and event handlers are released on motion changes and page exit.

Motion off and system reduced motion retain static, readable content. Portal uses its generated architecture and original project marks; Signal uses native typography and static logos; Orbit uses the selected original logo with working selection buttons. WebGL failure also retains the content and project links. The complete project index remains in HTML before enhancement.

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

## Dynamic identities — 18 October 2026

The active prototypes and root catalog use `gLitCh Labs.`. Signal samples that exact mixed-case identity in Space Grotesk, folding at the word boundary on phones. All three closing sections read “Good things start with curiosity.”

Portal suspends original app-icon faces on thick rounded bodies over plinths. Orbit uses those same identities in its selectable circular collection, scaling secondary objects back and hiding the rear object so it cannot show through the open Afterlight crest. Both scenes extrude the supplied Afterlight SVG paths, with a title texture taken directly from the original game logo. The title artwork remains intact in Signal, Portal’s chapter copy, Orbit’s index, and the static fallback. Gameplay remains available through the development-capture links.

Source artwork is unchanged. Afterlight stays fourth and explicitly in development. Logo animation buttons have native Enter/Space activation; motion off and reduced motion keep the original artwork visible. No additional WebGL renderer was added for Signal’s four logos.

Validation for this update: all 32 pages and 831 local references pass the resource checker; the experience, picker, and SVGLoader pass Node syntax checks. Browser review covered desktop and phone compositions (320/390px), Signal’s keyboard logo activation, Orbit’s named controls, direct logo selection and drag, and motion-off Afterlight selection. A temporary reduced-motion Signal fixture verified static mixed-case branding and all four visible original logos, then was removed. No console errors or warnings were recorded in the reviewed views. Captures are under `.cache/v3-logo-review/`.

## Icon edges and Portal background correction

The app-icon backing now follows a smooth contour sampled from each original image’s opaque body, with an inset bevel so it cannot protrude through the transparent squircle corners. Portal and Orbit share the corrected geometry. Signal’s CSS depth layer uses the original image as an alpha mask.

Portal’s full original background artwork is now fitted without cropping in its opening, including with WebGL active. Native scroll crossfades it into the live corridor during the first chapter; returning home restores the complete artwork. Hidden opening geometry skips recurring renders. Motion-off cleanup restores the background and default opacities.

Verified in the browser at 1440×900 and 390×844: clean Expenses/AURA silhouettes, complete opening artwork with WebGL active, the forward and reverse scroll handoff, and motion-off cleanup. Node syntax and all 834 local resource references pass; reviewed browser views report no errors or warnings. Updated captures: `.cache/v3-logo-review/orbit-clean-edges.png` and `portal-full-background.png`.
