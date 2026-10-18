# Round-02 assets

- `images/portal-poster.png`: preserved original generated architecture; source reference for the new persistent landscape.
- `images/basalt.png`: original generated seamless basalt material. The live Portal architecture uses it as a surface and approximate bump texture.
- Studio and app marks: unchanged copies from the existing repository artwork.
- Afterlight captures and original game logo: unchanged copies originally sourced from `G:/Programs/Afterlight`. The full title artwork leads Signal’s Afterlight panel, appears in Portal’s copy and Orbit’s index/fallback, and supplies the wordmark texture beneath the 3D crest. The combat capture remains linked from the game’s disclosure.

The generated scene/material assets were created with the built-in image tool on 18 October 2026. No generated scene is represented as gameplay. Portal and Orbit use the standalone symbols described below. Both Signal treatments use the original logos in CSS 3D assemblies, with the source icon's alpha mask for depth. Signal’s sampled lettering preserves the exact `gLitCh Labs.` brand text.

Font sources and licenses:

- [Bebas Neue](https://github.com/google/fonts/tree/main/ofl/bebasneue)
- [Space Grotesk](https://github.com/google/fonts/tree/main/ofl/spacegrotesk)
- Existing DM Sans, Manrope, Cormorant Garamond, and Outfit copies with their retained licenses.

Three.js r170 and its four official add-ons come from the [official npm distribution](https://www.npmjs.com/package/three/v/0.170.0), with the MIT license in `../vendor/three-LICENSE.txt`. Add-on imports are changed only to point to the local Three.js build. GSAP and Lenis retain their existing version-local licenses.

- `images/afterlight-emblem.svg`: unchanged copy of `G:/Programs/Afterlight/assets/brand/afterlight-emblem.svg`. SVGLoader converts the supplied paths into the live crest geometry; this is not a generated replacement identity.

- `images/portal-environment.png`: built-in image_gen edit of `portal-poster.png`, generated on 18 October 2026 as `exec-d23b4022-3ec5-4688-b24e-16e32f4b3808.png`. The baked doorways and their reflections were removed; the sunset, wet stone, distant mountains, and warm atmosphere were retained. It remains visible behind transparent live geometry throughout Portal.
- [Exact prompt and generation mode](portal-environment.prompt.txt). No source logos or gameplay artwork were regenerated.

## Standalone Portal and Orbit symbols

These are locally authored SVG reconstructions for the prototype, not original source-repository SVGs or AI-generated replacements. They preserve the existing symbols while removing their icon plates. SVGLoader extrudes the shapes into physical geometry; Portal's static labels and fallback and Orbit's selected fallback use the same vectors. Original raster assets remain unchanged for both Signal treatments.

- `images/expenses-symbol.svg`: champagne E and nine dots, guided by `G:/Programs/expenses-by-glitchlabs/src/assets/brand/expenses-splash-mark.png` and the existing `expenses.webp` icon.
- `images/aura-symbol.svg`: gold orb and upward crescent, guided by `G:/Programs/AstroAI/frontend/public/icon-transparent.png` and `aura.webp`. The live orb uses a flattened sphere; the crescent is extruded.
- `images/lumen-symbol.svg`: layered open book, binding, and three colored stars, guided by the existing `lumen.webp` artwork and `G:/Programs/lumen/resources/icon-original-transparent.png`. It preserves the book identity used by these prototypes rather than substituting the source repo's different single-star vector.

Signal / Titanium needs no new bitmap assets. Its near-black textured background is CSS, and its satin titanium studs are native Three.js lathed geometry lit by a local RoomEnvironment. The original studio logo is displayed in the desktop header.

The additional Signal Ivory, Plum, and Acid palettes also use native CSS surfaces and instanced lathed geometry. Orbit / Gallery reuses the same standalone SVGs with champagne materials, a native shadow-catching plane, and one directional shadow map. No new bitmap, external runtime asset, or replacement brand artwork is needed for these four additional options.

The grouped-picker update adds no raster artwork. Midnight and Dark Gallery reuse the same supplied/reconstructed identities. Lumen’s `data-z` and `data-depth` relief metadata now separates the book layers and reduces bevel overlap, with its 2D paths unchanged. Afterlight’s original emblem file and full logo remain unchanged; the runtime separates flame/core sheets and gives the supplied halo strokes shallow extrusion. The Lumen manifest hash reflects its relief metadata update.

## Nocturne / Folio / Chroma

These three studies add no raster assets. Nocturne’s native black body, rounded frame, and 33 lathed studs interpret the supplied studio emblem; the source image remains the header/still identity. Folio uses CSS paper and cloth surfaces around the same original marks. Chroma’s glass forms, light environment, and background shader are procedural and decorative. Original app vectors and Afterlight artwork remain unchanged; the existing asset manifest hashes still apply. The new pages use only the existing local, licensed fonts and vendored runtimes.

## Sculpted editions

Options 14–17 reuse the same source artwork without new bitmaps. The shared model factory extrudes the original reconstructed app SVGs and supplied Afterlight crest. It deepens Lumen’s pages/stars while scaling their layer offsets, deepens Afterlight’s structure while keeping flame/core/halo faces apart, and retains the original raster title as a printed inscription. Chroma’s new studio hero uses the existing procedural studio emblem with satin titanium and black lacquer, starting assembled. Source files and manifest hashes are unchanged.
