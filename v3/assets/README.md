# Round-02 assets

- `images/portal-poster.png`: preserved original generated architecture; source reference for the new persistent landscape.
- `images/basalt.png`: original generated seamless basalt material. The live Portal architecture uses it as a surface and approximate bump texture.
- Studio and app marks: unchanged copies from the existing repository artwork.
- Afterlight captures and original game logo: unchanged copies originally sourced from `G:/Programs/Afterlight`. The full title artwork leads Signal’s Afterlight panel, appears in Portal’s copy and Orbit’s index/fallback, and supplies the wordmark texture beneath the 3D crest. The combat capture remains linked from the game’s disclosure.

The two generated assets were created with the built-in image tool on 18 October 2026. No generated scene is represented as gameplay. Portal and Orbit use the original app artwork as transparent faces on shallow 3D bodies traced from the artwork’s opaque silhouette. Signal’s depth layer uses the source icon’s alpha mask. Signal uses the original logos in CSS 3D assemblies. Signal’s sampled lettering preserves the exact `gLitCh Labs.` brand text.

Font sources and licenses:

- [Bebas Neue](https://github.com/google/fonts/tree/main/ofl/bebasneue)
- [Space Grotesk](https://github.com/google/fonts/tree/main/ofl/spacegrotesk)
- Existing DM Sans, Manrope, Cormorant Garamond, and Outfit copies with their retained licenses.

Three.js r170 and its four official add-ons come from the [official npm distribution](https://www.npmjs.com/package/three/v/0.170.0), with the MIT license in `../vendor/three-LICENSE.txt`. Add-on imports are changed only to point to the local Three.js build. GSAP and Lenis retain their existing version-local licenses.

- `images/afterlight-emblem.svg`: unchanged copy of `G:/Programs/Afterlight/assets/brand/afterlight-emblem.svg`. SVGLoader converts the supplied paths into the live crest geometry; this is not a generated replacement identity.

- `images/portal-environment.png`: built-in image_gen edit of `portal-poster.png`, generated on 18 October 2026 as `exec-d23b4022-3ec5-4688-b24e-16e32f4b3808.png`. The baked doorways and their reflections were removed; the sunset, wet stone, distant mountains, and warm atmosphere were retained. It remains visible behind transparent live geometry throughout Portal.
- [Exact prompt and generation mode](portal-environment.prompt.txt). No source logos or gameplay artwork were regenerated.
