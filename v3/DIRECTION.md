# Round 02 — experience, not a colorway

Round 01 is archived byte-for-byte in `../drafts/round-01/`. This exploration deliberately changes the site's underlying experience. It remains a choice of prototypes, not the full production build.

## Portal

Travel through the same monumental gateway corridor while four different studio projects come into focus. Native scroll is the deterministic source of camera progress; pointer adds a small damped offset. One persistent Three.js scene, a reflective obsidian floor, five physically thick rectangular gateways, and a far vermilion sun establish continuity.

- Units: one world unit approximately one metre. Gate centers at x=3.2, y=3.9, z=0/-18/-36/-54/-72. Outer width 6.2, height 8.2, depth 1.2; bevel radius .08.
- Perspective: FOV 42 desktop / 52 phone. Desktop camera begins at (1.4, 3.15, 15) and moves down the corridor by 18 units per chapter. Look target stays ahead through the next opening. Phone camera centers on the gateway at y=8.9, framing smaller logos below the copy.
- Silhouette: strict architectural rectangles, thick stone/metal edges, no ornamental floating primitives. Frame trim and focal objects change by chapter.
- Materials: rough black basalt frames, polished black floor, narrow emissive trims, physically lit metal focal objects. A single low-resolution planar mirror on desktop; simple floor on phones.
- Lighting: neutral top key and vermilion rim; chapter focal colors change warm gray → champagne → blush → ember. Fog separates depth; it does not obscure copy.
- Chapters: threshold gateway; original Expenses, AURA, and Lumen icon faces on thick rounded bodies; Afterlight’s source vector crest extruded in aged gold, with the original title artwork beneath. Restrained tilt and vertical drift preserve legibility.
- Desktop scene cap: one renderer, mirror 512, DPR 1.5; phone DPR 1.25, no mirror. Pause when hidden/offscreen; no continuous rendering under reduced motion. Context loss returns to the poster and semantic content.

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

Fonts: Bebas Neue and Space Grotesk from Google Fonts' official repository; original licenses retained. Three.js r170, official RoomEnvironment/RoundedBoxGeometry/Reflector/SVGLoader add-ons and MIT license are vendored. Original product identity and Afterlight source repo remain unchanged.
