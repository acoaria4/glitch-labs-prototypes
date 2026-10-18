# Round 02 — experience, not a colorway

Round 01 is archived byte-for-byte in `../drafts/round-01/`. This exploration deliberately changes the site's underlying experience. It remains a choice of prototypes, not the full production build.

## Portal

One continuous sunset landscape remains visible behind a transparent Three.js layer from the opening through all four project chapters and the studio closing. The landscape contains no baked architecture. Every doorway and project mark is real geometry; native scroll moves through the corridor while the backdrop stays in place. There is no crossfade into a separate scene.

- Environment: `assets/images/portal-environment.png`, generated from the original poster with all architecture and structural reflections removed. The original poster remains preserved as the source. The exact built-in image-generation prompt is in `assets/portal-environment.prompt.txt`.
- Composition: CSS `cover` with the source ground vanishing point anchored at 76% width /72% height. Camera view offset uses the same principal point. Vertical FOV adjusts to the covered image height so perspective stays aligned on wide screens and phones.
- Geometry: five monolithic basalt frames at x=0, z=0/-14/-28/-42/-56. Each is 6.3 wide and 8.275 high, with 1.2-deep columns, subtle bronze edges, warm interior trims, and a low threshold.
- Camera: eye height 2 units, x=1.3 with bounded damped pointer drift, initial z=18. Native chapter progress advances z by 14 units. Passed frames leave the view; the active logo becomes visible as its doorway approaches. Distant logos stay hidden to keep the open corridor readable.
- Materials: physically scaled basalt UVs, rough stone, restrained bronze, warm directional sunset, neutral fill. Original Expenses/AURA/Lumen faces retain their traced bodies. Afterlight uses its supplied extruded vector crest and original wordmark.
- Grounding: alpha contact shadows and mirrored local geometry with height-faded transparency. No opaque ground plane, full-screen reflector, or second rendered sun can cover the landscape.
- Phones: the shared landscape/canvas stage sits below the copy (56svh, 60svh on narrow phones) with larger logo scale. The same perspective/lighting contract applies. Project controls and native touch scrolling remain usable.
- Lifecycle: one transparent renderer, DPR capped at 1.5 desktop /1.25 phone; hidden documents pause; teardown frees shared textures, source and mirrored geometry/materials, and subscriptions. Motion off/reduced motion retain the landscape and native project artwork.
- Content: Expenses → AURA → Lumen → Afterlight. Afterlight remains fourth and marked In development.

## Signal

The studio's name is a live three-dimensional field of small blocks. Pointer movement disturbs the letters, then they re-form. An accessible Disrupt button produces the same interaction. Scroll breaks the name into a field before handing off to a sharply composed four-project index.

- Vermilion, carbon black, bone white. Space Grotesk utilities and Bebas Neue display type.
- Sample `gLitCh Labs.` in mixed-case Space Grotesk into approximately 2,600 instanced boxes; one geometry/material, bounded repulsion, fixed deterministic origins, no per-frame allocations.
- One hero renderer. Under each app name the original logo sits in a CSS 3D assembly with shallow edge depth, a one-time GSAP reveal, bounded pointer tilt, and native button activation. The Afterlight panel displays the full original gold title artwork. The semantic portfolio index remains normal HTML, with all projects and real links visible.
- Reduced motion: readable static typography, no particle field. Missing WebGL retains the complete typography and project index.

## Orbit

An explorable physical collection of four dimensional app-logo objects. Drag the collection or choose a named project control to turn it. The currently selected project is also described in semantic DOM, and every project remains available below the spatial collection.

- Saturated cobalt room, pale chartreuse type, original logo faces and metallic edges, deep perspective and raking light.
- Four dimensional logo objects on a circular rig. Shortest-path rotation with bounded damping. Camera/rig have authored desktop and phone positions.
- Original product-icon artwork remains on shallow rounded 3D bodies; Afterlight uses its supplied vector emblem as actual extruded geometry and a title texture from the original game logo. Secondary objects scale back; the rear object is hidden to keep the open crest clear.
- Expenses → AURA → Lumen → Afterlight order in controls and document. Afterlight is in development; there is no download or wishlist claim.
- Reduced motion/missing WebGL: static selected logo with the same native controls and content. Controls work with keyboard and touch.

## Shared contract

GSAP/ScrollTrigger + one Lenis instance per current document, tied to the GSAP ticker. Native touch scroll. The comparison picker stays unchanged except direction labels. All resources are local. Pagehide, live motion changes, and iframe replacement release GPU resources and event subscriptions. Static content precedes enhancement; motion or WebGL failures never hide links.

Fonts: Bebas Neue and Space Grotesk from Google Fonts' official repository; original licenses retained. Three.js r170, official RoomEnvironment/RoundedBoxGeometry/SVGLoader add-ons and MIT license are vendored. Original product identity and Afterlight source repo remain unchanged.

Portal’s background and transparent live layer remain at opacity 1 throughout the story. Signal’s CSS depth layers use the exact icon masks instead of approximate rounded rectangles.
