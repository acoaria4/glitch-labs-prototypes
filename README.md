# gLitCh Labs prototypes

Independent website experiments, separate from the production site repository.

## Open locally

In PowerShell:

```powershell
Set-Location 'G:\Programs\glitch-labs-prototypes'
python -m http.server 8089 --bind 127.0.0.1
```

- Version directory: http://127.0.0.1:8089/
- Current experiment: http://127.0.0.1:8089/v1/

No build step or package installation is required. Loading a version uses local fonts, images, styles, and libraries. Product and privacy links navigate to the production website at https://theglitchlabs.com/.

## Versions

| Version | Direction | Chapters |
| --- | --- | --- |
| [v1](v1/README.md) | Everyday, considered — cinematic studio | Opening, Expenses, AURA, Lumen |

Each version owns its assets, scripts, styles, and vendor dependencies. Create future experiments in `v2/`, `v3/`, etc., and add a link to the root `index.html`. Keep earlier versions stable when developing a new direction. The catalog currently uses v1's local fonts and favicon; v1 itself does not depend on the catalog or any parent files.

## Structure

```text
index.html                  Version directory
catalog.css                 Directory styling
scripts/check-site.py       Local link and asset validation
docs/v1-migration.json      Origin and unchanged-file SHA-256 records
v1/
  index.html
  README.md                 Creative direction and historical review
  styles/
  scripts/
  assets/fonts/             Fonts and their OFL licenses
  assets/images/
  vendor/                   GSAP, ScrollTrigger, Lenis, and licenses
```

## Verify

```powershell
python -X utf8 scripts/check-site.py
node --check v1/scripts/prototype.js
node --check v1/scripts/expenses-demo.js
node --check v1/scripts/aura-scene.js
node --check v1/scripts/lumen-scene.js
```

The checker validates local HTML/CSS resources, heading counts, unique IDs, fragment links, and version isolation. It rejects references that escape a version folder, external runtime resources, and symbolic links. Product links are intentional outbound navigation. For an interaction change, also check the affected scene in a browser at desktop and phone sizes and with motion disabled.

## Origin

Extracted on 11 October 2026 from the local `prototype/` experiment in `gLitCh-Labs-Releases`. The source prototype was untracked. Existing styles, scripts, images, fonts, and vendor files were copied without alteration; HTML/font resource paths and documentation were adapted. The migration manifest records the copied file hashes and the production repository's HEAD for provenance.

The two repositories have separate Git histories. This repository has no remote or publishing workflow configured. Both pages carry `noindex,nofollow` metadata. Vendor and font license texts are retained; original artwork keeps its existing ownership.

## Migration verification — 11 October 2026

- 39 unchanged source/dependency files matched both the original files and the recorded SHA-256 values. An independent review confirmed that v1 HTML and font CSS changed only in the intended resource and navigation paths.
- The static checker passed 2 pages and 51 local references; all four authored JavaScript files passed syntax checks.
- Served from this directory on port 8089: the version directory, desktop/390px layouts, artwork, Expenses three-person split, AURA placement selection, Lumen answer feedback, and motion toggle passed browser smoke checks. No browser warnings or errors were recorded.
- Preview captures are retained under ignored `.cache/prototype-review/`.
