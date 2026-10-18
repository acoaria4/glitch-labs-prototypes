# v3 — Round 02

Six directions with eighteen current styles, awaiting selection before the full site build. Eight superseded logo treatments are cataloged under `/drafts/logo-studies.html`; all twenty-six historical query links still work. Open `/v3/` after serving the repository root. The first round is preserved under **`/drafts/round-01/`**, with individual links in the root version selector's **Drafts** section. There is no drafts folder inside v3.

| Direction | Main idea | Interaction |
| --- | --- | --- |
| Portal | A monumental, live 3D corridor connecting four product worlds | Scroll moves the camera through the same gateway architecture; pointer adds restrained depth |
| Signal | The studio's identity is a field of physical blocks | Disturb the letters with the pointer or the Disrupt button; they re-form |
| Orbit | Four dimensional app logos form an explorable spatial collection | Drag to turn the collection, select a named project, or click a logo |
| Signal / Titanium | Near-black graphite with satin titanium studs echoing the studio logo | The same disruption and reform interaction as Signal |
| Orbit / Gallery | Limestone, espresso, richer bronze faces and dark metal sidewalls | A slower orbit with smaller neighbors and ground shadows |
| Orbit / Midnight | Ink navy, silver-blue type, and warm gold marks | The original orbit composition in a darker room |
| Orbit / Dark Gallery | Warm near-black, ivory type, and rich bronze marks | Gallery lighting, shadows, and slower motion in a dark room |
| Signal / Warm Ivory | Warm paper and matte graphite studs | Shared Signal interaction with a quiet editorial palette |
| Signal / Deep Plum | Deep plum and satin lilac studs | Shared Signal interaction with soft metallic light |
| Signal / Acid Yellow | Acid yellow and glossy black studs | Shared Signal interaction with bold contrast |
| Nocturne | Black lacquer, satin titanium, champagne light, and large serif type | Live dimensional studio emblem with a moving light control |
| Folio | Bone paper, olive cloth, ink type, and editorial spreads | A physical book with four working page turns |
| Chroma | Pearl, optical glass, mint, violet, and precise sans type | Live refractive sculpture with a perspective control |
| Nocturne / 3D | Champagne metal, dark sidewalls, and colored enamel | Live project sculptures with pointer and keyboard turning |
| Folio / 3D | Satin bronze on paper | Live dimensional marks inside the turning book and collection |
| Chroma / Studio 3D | Black lacquer and titanium on pearl | Assembled studio emblem with subtle, reversible scroll separation |
| Portal / Sculpted 3D | Sunset-lit metal, enamel pages, and deep relief | The shared project sculptures in Portal’s existing continuous landscape |

Expenses, AURA, Lumen, then Afterlight remain the document and control order. Afterlight is explicitly **in development**. Its imagery and description come from the local Afterlight repository; development captures do not represent balanced-play results or a downloadable release.

The picker has six top-level buttons: **Portal**, **Signal**, **Orbit**, **Nocturne**, **Folio**, and **Chroma**. Each has its own native style menu, remembering its last current selection for the session. Names in the dropdown describe only the style, without repeating the family. Keys **1–6** select those families in order; **left/right** cycle current styles within the family; **R** replays. Query indices remain stable across all twenty-six saved routes.

| Family | Current styles |
| --- | --- |
| Portal | Landscape; Warm Metal |
| Signal | Red; Titanium; Warm Ivory; Deep Plum; Acid Yellow |
| Orbit | Cobalt; Midnight; Gallery; Dark Gallery — all with the current sculptural models |
| Nocturne | Original artwork; Burnished metal |
| Folio | Original print; Print & foil; Scroll folio |
| Chroma | Glass loops; Cast glass |

Archived query indices: **3, 5, 9, 10, 14, 15, 16, 17**. They are discoverable from the root catalog's Drafts section and `/drafts/`. Opening an archived link still mounts its unchanged page and shows that selected treatment under an “Archived draft” optgroup; it does not add drafts to normal style cycling or overwrite the family's remembered current style. Runtime pages and assets stay in their original locations for compatible links and version-local resource closure. Opening `/v3/` without a query selects the current Orbit / Cobalt. On narrow screens the six family buttons use a three-column, two-row grid above the style menu.

The table above this section records the full exploration history, including archived intermediates.

## Architecture

Buildless HTML/CSS/JavaScript. Three.js r170 and official RoomEnvironment, RoundedBoxGeometry, and SVGLoader add-ons are local. GSAP 3.13.0 + ScrollTrigger and Lenis 1.3.26 are also local. One Lenis instance per loaded experience; the GSAP ticker drives smooth scroll and rendering. The original experiences use one renderer. Each sculpted study uses at most two contexts: collection plus hero, or collection plus book. Portal / 3D retains one renderer. Touch scrolling stays native.

Portal keeps one transparent 3D world over the same fixed sunset environment across all its authored chapters. Signal uses one instanced draw for its letter field. Signal’s project marks use CSS 3D depth, GSAP entrance reveals, pointer tilt, and native keyboard/touch animation buttons. Orbit uses four physical logo objects and native controls describing the same selection. Renderer DPR is capped, Portal uses local translucent geometry reflections instead of a full-screen mirror, and offscreen/hidden scenes pause. GPU resources, observations, and event handlers are released on motion changes and page exit.

Motion off and system reduced motion retain static, readable content. Portal uses its persistent landscape and standalone symbols; both Signal options use native typography and static logos; Orbit uses the selected standalone SVG (the original full title for Afterlight) with working selection buttons. WebGL failure also retains the content and project links. The complete project index remains in HTML before enhancement.

See [DIRECTION.md](DIRECTION.md) for the world, camera, material, and interaction contracts; see [assets/README.md](assets/README.md) for provenance.

## Verification

From the repository root:

```powershell
python -X utf8 scripts/check-site.py
node --check v3/scripts/experience.js
node --check v3/scripts/picker.js
node --check v3/scripts/editions.js
node --check v3/scripts/editions-3d.js
node --check v3/scripts/sculpted-logos.js
node --check v3/scripts/portal-sculpted.js
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

## Portal — persistent environment

The opening-to-corridor crossfade has been removed. `portal-environment.png` stays visible throughout the experience, including behind the moving doorways, app logos, and closing section. The supplied poster was recreated without baked gates so its architecture cannot compete with the actual 3D corridor. The original asset is preserved.

The Portal renderer now clears to transparent. It has no opaque background, full-screen floor, mirror target, or independent sun. Camera projection shares the landscape’s vanishing point; physically scaled basalt textures, warm rim lighting, alpha contact shadows, and softly fading local reflections ground the real objects in the same scene. Distant app marks remain hidden until their doorway approaches. The logo order and Afterlight development status are unchanged.

The exact generation prompt and mode are saved in [assets/portal-environment.prompt.txt](assets/portal-environment.prompt.txt). The output is [assets/images/portal-environment.png](assets/images/portal-environment.png); the built-in image tool was used. Earlier review notes above describe prior iterations; this section and DIRECTION.md are the current Portal contract.

Verified at 320×740, 390×844, 1440×900, and 1920×936: the same landscape stays at opacity 1 behind the live geometry, all four projects, and the translucent closing section. Motion-off retains the same environment and native artwork. The reviewed views have no horizontal overflow or console warnings/errors. Both authored scripts pass syntax checks; all 32 pages, 834 local references, and asset provenance hashes pass validation. Screenshots are retained under `.cache/v3-portal-scene-review/`.

## Standalone symbols and Signal / Titanium

Portal's first three app marks now use locally reconstructed standalone SVGs, extruded into physical symbols without icon plates. Expenses keeps its E and nine dots; AURA keeps its orb and crescent; Lumen keeps its layered book and stars. The same vectors appear in chapter labels and static fallbacks. Afterlight retains its supplied crest and title, fourth and In development. The basalt doorways are near-black with less neutral fill light and warm sunset edges. The persistent landscape is unchanged.

Signal / Titanium is an additional fourth picker option: satin titanium, black metallic studs, black typography, and original app colors. Its motion, project index, and fallback share Signal's implementation. The original red Signal and Orbit keep their existing selection indices. Picker controls fit on one line at 320px. Shared logo tilt now uses GSAP's canonical `rotation` property to avoid an alias-reset warning during keyboard focus changes.

Browser review covered Portal's four standalone marks at desktop size, the Lumen composition at 390px, Titanium at 320/390/1440px, keyboard disruption and logo activation, motion off/on, and the fourth picker option and numeric shortcuts. Reviewed layouts had no horizontal overflow. Original red Signal and Orbit's Afterlight selection were regression checked; no new warnings were recorded after the rotation correction. Physical-device performance remains unmeasured. Captures are under `.cache/v3-symbols-titanium-review/`.

Validation: both authored scripts pass syntax checks; all 33 pages, 856 local references, and asset provenance hashes pass. Earlier versions and the archived first round remain unchanged. Asset reconstruction references and distinctions from supplied source artwork are documented in [assets/README.md](assets/README.md).

## Orbit symbols and inverted Titanium

Orbit now shares Portal's freestanding Expenses, AURA, and Lumen geometry, with the same layered relief and no icon plates. Its static selection also uses these vectors. The obsolete raster-face backing and silhouette tracing are removed from the shared scene loader. Afterlight retains its supplied crest and full title and remains fourth, In development.

Signal / Titanium now uses near-black graphite with a subtle texture, satin titanium studs, silver text and rules, and a silver primary control. The palette extends through the collection and closing. App artwork keeps its original colors. This replaces the earlier silver-background treatment described above; red Signal is unchanged.

The Three.js geometry and shared GSAP/Lenis lifecycle are retained. Current design contracts are in DIRECTION.md. Browser evidence for this update is under `.cache/v3-orbit-inverted-review/`.

Verified Orbit's desktop marks, keyboard selection, phone drag from Expenses to AURA, Afterlight development status, and motion-off SVG selection. Checked inverted Titanium at 320/390/1440px, keyboard disruption, motion off/on, and collection contrast. Reviewed layouts had no horizontal overflow and no console warnings/errors. Portal was regression checked after sharing its loader. Both authored scripts and all 33 pages / 856 local references pass validation. Physical-device frame rates remain unmeasured.

## Portal — beyond the final doorway

The studio ending now continues past Afterlight's final gateway into the open sunset landscape. The camera advances from chapter progress 4 to 6 (z=-66, beyond the final frame at z=-56). Afterlight's crest clears during the approach; the doorway stays until the camera is close, then clears too. The closing message has a full-height composition over the landscape with a light scrim and ivory type. Project navigation clears from the ending, with the top navigation and reverse scrolling available.

On phones the landscape expands to fill the closing viewport after the geometry clears. Static and reduced-motion views retain this landscape ending without camera travel. Desktop and 390px browser review confirmed an empty geometry layer at the ending, restored Afterlight geometry on reverse scroll, and no horizontal overflow or console errors. Evidence: `.cache/v3-portal-ending-review/`.

Closing spacing was tightened so the section and footer share approximately one viewport. Closing bottom padding is 48px; footer bottom padding is 84px to clear the fixed comparison picker. Bottom-of-page checks at 1920×936 and 390×844 retain the full heading and footer without horizontal overflow. Captures: `desktop-spacing.png` and `phone-spacing.png` in the same review folder.

## Gallery and three Signal palettes

Options 5–8 add Orbit / Gallery and Signal / Warm Ivory, Deep Plum, and Acid Yellow. Original indices 1–4 are retained. Gallery uses champagne symbol materials, smaller neighbors, a quieter orbit, and a shadow-catching floor against limestone. Signal's new pages use matte graphite, satin lilac, and glossy dark studs respectively. Each palette continues through the collection, controls, and closing; original app artwork and Afterlight's fourth-place development status are retained.

Desktop uses eight picker buttons; phones use a native eight-option selector with replay. Shortcuts 1–8, arrows, and R are supported. No new bitmap assets or remote dependencies were added. Direction and material details are documented in DIRECTION.md; review captures are under `.cache/v3-palettes-gallery-review/`.

Validation: all 37 pages and 942 local references pass; both authored scripts pass syntax checks. Browser checks covered the four new heroes at desktop and phone widths, the 320px native picker, shortcut 8 from within a child frame, Gallery drag and keyboard selection, Afterlight's development status, Gallery static selection, Signal disruption and keyboard logo activation, palette continuity through the Plum collection/closing, and motion off/on. Reviewed views produced no console warnings/errors. Original picker indices 1–4 remain stable. Physical-device frame rates remain unmeasured.

## Grouped picker and layered logo corrections

Lumen’s book pages previously shared front-face depths, causing depth flicker while rotating. The sheets now have thinner bevels and distinct depths. Afterlight’s orange flame and ivory core likewise occupy separate sheets, and its supplied halo strokes have real thickness. Source outlines, supplied Afterlight SVG, original title artwork, project order, and development labels remain intact. The shared fix applies to Portal and all Orbit treatments.

Light Gallery now uses darker bronze faces, dark sidewalls, and more directional lighting for stronger metallic separation. Midnight and Dark Gallery are additional complete pages; every earlier treatment remains available.

A passive 180-frame desktop browser sample had a 16.7ms median and 16.8ms p95 both before and after; the corrected sample had no intervals above 34ms. This supports the geometry diagnosis rather than an ongoing frame-rate drop, but is not a physical-device performance guarantee. Browser review and timing reports are under `.cache/v3-layered-orbit-review/`.

Validation: 39 pages and 982 local references pass the site checker; both authored scripts pass syntax checks. All 15 asset hashes match. Browser checks covered the grouped family controls, remembered treatment, numeric 0 and family-arrow shortcuts, desktop and 320/390px layouts, corrected Afterlight in Portal and Dark Gallery, and motion off/on. Reviewed views produced no console errors or warnings. The temporary profiling fixture was removed.

## Nocturne, Folio, and Chroma

Three additional full-page design studies extend the lineup without changing earlier experience pages. Each has a unique hero, four-project collection, studio statement, contact link, and closing. Shared native content remains visible before enhancement. Afterlight stays fourth and In development; Lumen is Coming soon. No new bitmap or external dependency was introduced.

- Nocturne uses a native interpretation of the studio emblem: 33 machined studs, a black lacquer body, rounded titanium frame, directional light, and a controllable moving key. It continues into dark alternating project compositions. The original studio image supplies the still fallback.
- Folio uses CSS perspective for a cloth cover, paper edges, and individual page turns. The book opens to Expenses and cycles through AURA, Lumen, and Afterlight. Turning remains usable with motion off. Four alternating editorial spreads supply every project independently of the book interaction.
- Chroma uses three native glass forms with physical transmission, thickness, attenuation, iridescence, and negative fill cards in a local environment. The perspective control turns the assembly. Offset color studies continue into the collection; static CSS forms replace the glass when motion is off or WebGL is unavailable.

The new pages share isolated `styles/editions.css` and `scripts/editions.js`; no earlier page imports either file. GSAP, ScrollTrigger, and Lenis coordinate reveals and native scroll. GPU resources, observers, subscriptions, and smooth-scroll instances are cleaned up on motion changes or iframe replacement. DPR is capped at 1.5 desktop / 1.25 phone, hidden/offscreen scenes skip rendering, and touch does not drive pointer parallax. System reduced motion selects the still view.

Review captures are under `.cache/v3-new-studies-review/`.

Validation for the new studies: 42 pages and 1,060 local references pass the static checker; both picker and editions scripts pass Node syntax checks. All 15 existing asset hashes match, and v1/v2/drafts remain unchanged. Browser review covered 1440px desktop, 390px and 320px phones, all four Folio page turns, still views and motion off/on, Nocturne lighting and Afterlight disclosure, Chroma perspective and collection, family restoration, keyboard cycling, and preserved Portal/Signal/Orbit routes. Reviewed views recorded no console warnings or errors. Physical-device GPU performance was not measured.

## Shared sculpted identities

Options 14–17 are additional versions; original routes 1–13, their pages, and original runtimes remain intact. These intermediate treatments are now archived under Drafts; their original pages and query links remain intact.

`sculpted-logos.js` loads the existing standalone SVGs and original Afterlight title. It constructs actual extruded meshes, face and sidewall materials, a dimensional AURA orb, Lumen’s separated book sheets and stars, and Afterlight’s deep gold structure, halo, flame, and ivory core. Lumen’s relief is scaled with its layer offsets, preserving clearance. No original artwork or asset hash changes. The supplied Afterlight title remains a printed inscription beneath its solid crest.

The new study pages use one scissored collection renderer. Only visible figures render; the idle canvas clears once and then stops drawing. Folio uses one additional small context inside the transformed book page, preserving the rendered outgoing leaf during each turn. The Nocturne and Chroma heroes each use one additional context instead. Geometry, materials, local environments, title textures, shadow maps, observers, and subscriptions are released on motion changes and page exit. Native controls turn the project sculptures by pointer, tap, or keyboard activation. Still and reduced-motion views retain source artwork.

Chroma’s new hero replaces the loops with the studio emblem in black lacquer and satin titanium. All layers start assembled. Scrolling gently lifts the frame and studs; reverse scrolling returns them. Pearl, mint, and lilac light remain. The old optical-glass Chroma is still option 13.

Portal / Sculpted 3D imports the same model factory through an isolated runtime, preserving the original camera travel, landscape, mirrored geometry, project order, and open-sunset ending. Review captures are under `.cache/v3-sculpted-review/`.

Validation: 46 pages and 1,169 local references pass the checker, along with syntax checks for all four authored runtime/picker modules. All 15 asset hashes match; all 13 earlier prototype pages, original runtimes, v1/v2, and drafts remain unchanged. Browser review covered desktop and 320/390px layouts, all four Folio page selections, pointer/tap and keyboard logo turning, motion teardown/restoration, Chroma’s assembled/separated/reassembled states, and Portal’s Lumen, Afterlight, and sunset ending. No console warnings or errors appeared in the reviewed views. Physical-device frame pacing was not measured.


## Sculptural models and contextual treatments (18–25)

All seventeen earlier variants remain unchanged. Signal retains its original logo artwork in all five colorways.

| Query | Variant | Logo treatment |
| --- | --- | --- |
| `?v=18` | Orbit / Cobalt Sculpture | Sculpted geometry, polished metal and colored enamel |
| `?v=19` | Orbit / Midnight Sculpture | Sculpted geometry, metal and enamel in cool dark lighting |
| `?v=20` | Orbit / Gallery Sculpture | Satin bronze, ivory and enamel against limestone |
| `?v=21` | Orbit / Dark Gallery Sculpture | Gold and bronze with deep recesses |
| `?v=22` | Portal / Warm Metal | Shared sculptures, sunset-matched bronze and restrained enamel |
| `?v=23` | Nocturne / Burnished | Burnished gold, quieter enamel, ivory pages and theatrical light |
| `?v=24` | Folio / Print & Foil | Original artwork in shallow colored/metallic relief, no floating-object shadows |
| `?v=25` | Chroma / Cast Glass | Tinted cast glass, frosted curved pages, smoky amber crest and gold accents |

`atelier-models.js` creates Lumen from closed parametric sheets: curved bound cover, colored endpaper, thick bowed page blocks, lifted leaves, curved bookmarks, page-edge lines, rounded binding and lenticular stars. Its geometry is static during animation. Afterlight preserves the supplied A-shaped silhouette while adding a deep body, recessed panels, raised roof ridges, a faceted lance, tubular broken halo, rounded lofted flame and physical cup/stem. The original title remains a source-texture inscription. No new bitmap asset replaces either identity.

The same canonical sculptures feed Orbit, Portal, Nocturne and Chroma. Finishes differ by direction. Folio deliberately returns to original artwork with very shallow relief; it does not borrow the floating book sculpture. Chroma's black/titanium studio hero adds an optical glass perimeter, remains assembled on arrival, and separates only on scroll, reversing at the top.

`atelier-world.js` isolates the Orbit/Portal update from all existing variants. `editions-atelier.js` and `atelier-logos.js` isolate the new studies. Collection figures share one renderer and render only when visible. Local multisampled half-float targets isolate shadow/transmission passes before scissored compositing, preventing refraction or backgrounds leaking beyond a figure. Targets, background textures, models, shadows, environments and listeners are released on teardown. Each study has at most two WebGL contexts; Portal and Orbit use one. Motion-off and reduced-motion paths restore original artwork and native navigation. No device-wide FPS claim is made.

Latest static verification: 54 HTML pages and 1,365 local resource references. Review captures: `.cache/v3-atelier-review/`.


Atelier review: verified native picker navigation, sculpture turn controls, all four Folio pages, Chroma's assembled arrival and reversible scroll separation, Portal's open-landscape ending, and motion-off teardown/restoration. Desktop 1440×960 and narrow-phone 320×844 layouts were inspected; body widths equal scroll widths in the new Portal, Orbit, Nocturne, Folio and Chroma views. Existing 17 pages and runtimes remain byte-unchanged, as do all 15 manifest asset hashes. Lumen's four sculpture finishes each have 29 meshes and 34,908 triangles, with finite vertices and shared static geometry. No console warnings/errors were observed in the reviewed views. Glass volumes use outward-facing closed surfaces to avoid redundant backface passes. Offscreen targets use multisampling within the device limit and fall back to byte storage where floating-point color targets are unavailable. Physical-device FPS remains unmeasured.


## Scroll folio (26)

`/v3/?v=26` adds **Folio / Scroll folio** and is the Folio family's initial selection. Original print and Print & foil remain in its dropdown; all previous query indices are unchanged.

One olive-cloth volume occupies a sticky stage. Native scroll opens its cover, then turns three hinged paper leaves to reveal Expenses, AURA, Lumen and Afterlight in order. Each project is a semantic HTML article with original artwork printed on the page; the previous leaf becomes the left-hand notes page. The final Afterlight page retains **In development**. Continuing scroll releases the book into the studio colophon.

The isolated `folio-scroll.js` drives one paused GSAP timeline from ScrollTrigger's normalized progress; Lenis shares the GSAP ticker. The four native page links and Work link target authored reading holds. Reversing scroll restores the same page poses. Desktop shows a two-page spread; phones frame one reading page. Responsive rebuilds preserve scroll progress after viewport measurements settle. Motion off, reduced motion, missing animation libraries, or no JavaScript expose all four articles in normal document flow. Teardown removes listeners, ticker subscriptions, transforms, inert states and the smooth-scroll instance. No WebGL contexts or new raster assets are used.

Review covered all four pages, a partly turned leaf, forward/reverse poses, desktop/phone resizing, native page links, motion off/on and the colophon. Static validation: 56 pages and 1,409 local references. Existing prototype sources and assets remain unchanged.
