# Round 02 — experience, not a colorway

Round 01 is archived byte-for-byte in `../drafts/round-01/`. This exploration deliberately changes the site's underlying experience. It remains a choice of prototypes, not the full production build.

## Portal

One continuous sunset landscape remains visible behind a transparent Three.js layer from the opening through all four project chapters and the studio closing. The landscape contains no baked architecture. Every doorway and project mark is real geometry; native scroll moves through the corridor while the backdrop stays in place. There is no crossfade into a separate scene.

- Environment: `assets/images/portal-environment.png`, generated from the original poster with all architecture and structural reflections removed. The original poster remains preserved as the source. The exact built-in image-generation prompt is in `assets/portal-environment.prompt.txt`.
- Composition: CSS `cover` with the source ground vanishing point anchored at 76% width /72% height. Camera view offset uses the same principal point. Vertical FOV adjusts to the covered image height so perspective stays aligned on wide screens and phones.
- Geometry: five monolithic basalt frames at x=0, z=0/-14/-28/-42/-56. Each is 6.3 wide and 8.275 high, with 1.2-deep columns, subtle bronze edges, warm interior trims, and a low threshold.
- Camera: eye height 2 units, x=1.3 with bounded damped pointer drift, initial z=18. Native chapter progress advances z by 14 units. Passed frames leave the view; the active logo becomes visible as its doorway approaches. Distant logos stay hidden to keep the open corridor readable.
- Ending: the studio section is an authored stop at progress 6 (camera z=-66), beyond Afterlight's final frame at z=-56. Its crest clears as the camera approaches; the final architecture stays visible until the camera is close, then leaves the view. The closing message sits over the open landscape with a light readability scrim. On phones the landscape expands above the former stage after the gates clear. Reverse scroll restores the same journey; motion-off and reduced-motion retain the landscape ending without camera movement.
- Materials: physically scaled basalt UVs, near-black stone (`#101112`, roughness .93), restrained bronze, warm directional sunset, and reduced neutral fill. The architecture reads as black basalt with warm edges against the landscape.
- Identities: Expenses, AURA, and Lumen are freestanding extruded SVG reconstructions of their existing symbols, without square or squircle backings. AURA has a dimensional gold orb; Lumen has layered book pages and stars. Afterlight retains its supplied extruded vector crest and original wordmark. The same standalone SVGs supply Portal's chapter labels and motion-off artwork.
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

## Signal / Titanium

A separate Signal option uses near-black graphite behind satin titanium studs, echoing the studio logo. The vermilion Signal remains available unchanged.

- The graphite surface uses a low-contrast texture and a broad, quiet light pool. Typography and navigation use silver; the primary control has a satin titanium surface with dark text. Collection rules and panels use subtle silver edges.
- The mixed-case `gLitCh Labs.` field uses approximately 2,600 instanced machined studs with bevelled rims, satin titanium metal, and cool neutral lighting. One draw call; the existing pointer, disruption, scroll, and reform behavior is shared with Signal.
- Project marks retain their original colors. The four-project collection, closing copy, motion preferences, and accessible controls are shared with Signal. Afterlight remains fourth and in development.
- Picker option four is Signal / Titanium (`?v=4`); Portal, red Signal, and Orbit retain their existing indices 1–3.

## Orbit

An explorable physical collection of four dimensional app-logo objects. Drag the collection or choose a named project control to turn it. The currently selected project is also described in semantic DOM, and every project remains available below the spatial collection.

- Saturated cobalt room, pale chartreuse type, freestanding colored-metal symbols, deep perspective and raking light.
- Four dimensional logo objects on a circular rig. Shortest-path rotation with bounded damping. Camera/rig have authored desktop and phone positions.
- Expenses, AURA, and Lumen share Portal's standalone extruded SVG geometry, with no icon plates. AURA's orb is dimensional and Lumen's pages and stars have layered relief. Afterlight uses its supplied vector emblem as actual extruded geometry and a title texture from the original game logo. Secondary objects scale back; the rear object is hidden to keep open symbols clear.
- Expenses → AURA → Lumen → Afterlight order in controls and document. Afterlight is in development; there is no download or wishlist claim.
- Reduced motion/missing WebGL: the selected standalone SVG (original full title for Afterlight) with the same native controls and content. Controls work with keyboard and touch.

## Additional palette explorations

The original four routes keep their picker indices. Orbit / Gallery is option 5; Signal / Warm Ivory, Deep Plum, and Acid Yellow are options 6–8. These are additional complete pages with the same real content and controls.

- Gallery: limestone `#d8d1c5`, espresso `#292622`, bronze selection rules, bronze Expenses/AURA faces with dark sidewalls, and the existing colored Lumen and gold Afterlight symbols. A transparent shadow-catching floor grounds the floating geometry without a visible canvas boundary. One 1024px directional shadow map, directional warm lighting, controlled fill, rougher metal, smaller neighboring marks, slower damping, and reduced bobbing create a quieter collection. All shadow resources are released with the scene.
- Warm Ivory: `#e8e3d8` paper, `#242522` graphite type, matte dark studs, and a slightly deeper paper collection.
- Deep Plum: `#281b30`, pale lilac `#d9cbe5`, satin lilac studs, and soft violet lighting. The collection and closing remain in the same palette.
- Acid Yellow: `#dded52`, ink `#171b18`, glossy dark studs, and a stronger yellow-green collection surface.
- Each Signal palette preserves the lettering, pointer/disruption/reform motion, original app colors, keyboard logo controls, and static fallback. Afterlight stays fourth and In development.
- Midnight: ink navy `#0c1429`, silver-blue type, gold symbols, and cool fill light with the original Orbit motion. Option 9.
- Dark Gallery: warm near-black `#141311`, ivory type, bronze faces, darker metal sidewalls, warm key light, cool fill, and Gallery’s shadows and slower motion. Option 10.
- The picker has three family buttons: Portal, Signal, and Orbit. A native select contains only the active family’s treatments. All ten options remain accessible on desktop and phones; existing query indices 1–8 are unchanged. Shortcuts 1–9 and 0 select global options; arrows cycle within the family and R replays outside native form controls.

## Shared contract

GSAP/ScrollTrigger + one Lenis instance per current document, tied to the GSAP ticker. Native touch scroll. The comparison picker includes ten options grouped into three families and supports keys 1–9/0, family arrows, and replay. All resources are local. Pagehide, live motion changes, and iframe replacement release GPU resources and event subscriptions. Static content precedes enhancement; motion or WebGL failures never hide links.

Logo relief: Lumen’s book sheets use separated face depths and thinner bevels to avoid coplanar flicker. Afterlight’s orange flame and ivory core have distinct depths; its original halo strokes are extruded into shallow strips. Its source SVG and title artwork remain unchanged. Orbit’s tighter near/far camera range also improves depth precision.

Fonts: Bebas Neue and Space Grotesk from Google Fonts' official repository; original licenses retained. Three.js r170, official RoomEnvironment/RoundedBoxGeometry/SVGLoader add-ons and MIT license are vendored. Original product identity and Afterlight source repo remain unchanged.

Portal’s background and transparent live layer remain at opacity 1 throughout the story. Signal’s CSS depth layers use the exact icon masks instead of approximate rounded rectangles.

## Three new directions for the next selection

These remain separate comparison prototypes under New studies, options 11–13. The existing Portal, five Signal treatments, and four Orbit treatments keep their routes, indices, artwork, and runtime files.

| Study | Composition and material | Signature interaction | Tradeoff |
| --- | --- | --- | --- |
| Nocturne | Asymmetric serif opening, black lacquer, titanium, champagne light; alternating dark project stages | Move the key light around a dimensional studio emblem; scroll separates its machined studs | Requires deliberate dark-scene contrast and lighting |
| Folio | A physical olive-cloth book, paper edges, warm editorial spreads, oversized serif type | Open the cover and turn through all four projects | Quieter first impression; typography and mobile page proportions need care |
| Chroma | Large precise sans type, mint/violet optical glass, pearl ground, offset project color studies | Change the glass assembly’s perspective; bounded pointer depth | Physical transmission costs more GPU work than Folio |

All three preserve native vertical reading, working project links, contact, source identities, the curiosity closing, and Afterlight’s fourth-place development status. Nocturne’s live studio emblem is a procedural interpretation of the supplied dot arrangement, not a new replacement studio logo. Chroma’s glass is abstract sculpture, not a product mark. Folio’s book artwork uses the existing app symbols and original full Afterlight title.

## Additive sculpted editions

- Options 14–16: Nocturne / 3D, Folio / 3D, Chroma / Studio 3D. Option 17: Portal / Sculpted 3D. All older routes remain available.
- All four products use actual extruded source shapes. Champagne or satin bronze faces, darker metal sidewalls, bevel highlights, colored enamel, separated relief, and local lighting supply the depth. Lumen retains its pages and stars; Afterlight retains its supplied crest and title and stays fourth, In development.
- One collection renderer uses clipped viewports for only the visible figures. Native overlay buttons rotate each mark; Folio’s book also contains a live 3D mark, with a snapshot of the rendered outgoing leaf during turns.
- Chroma’s new studio hero uses an assembled black lacquer body, satin titanium frame, and 33 machined studs. Scroll progress from .06 to .72 lifts the frame by .65 units and studs by 1.05 units; damping makes the movement reversible and restrained. No automatic separation happens on arrival. The old glass hero remains in the original Chroma.
- Portal’s additive runtime imports the same model factory. The landscape stays visible, and the final section remains beyond Afterlight’s last doorway. Original Portal is retained.


## Context-specific identities, options 18–25

Lumen now has genuinely curved page surfaces, a rounded spine, lifted leaves and sculpted stars. Afterlight has architectural recesses, raised roof ridges, a thick tubular broken halo and a lofted flame. These shared models use polished/satin metal and enamel in Orbit, warm bronze in Portal, burnished metal and quieter color in Nocturne, and tinted/frosted cast glass in Chroma. Chroma's studio hero adds a glass perimeter while retaining its black body and titanium studs. Folio uses original artwork with shallow print/foil relief; Signal's original icon plates are unchanged. All previous seventeen variants and all source assets remain available, with stable picker indices. No external repositories or original image manifest hashes were changed.
