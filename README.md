# gLitCh Labs prototypes

Independent website versions, separate from the production site repository.

## Open locally

In PowerShell:

```powershell
Set-Location 'G:\Programs\glitch-labs-prototypes'
python -m http.server 8089 --bind 127.0.0.1
```

Open the [version directory](http://127.0.0.1:8089/). No build step or package installation is required.

## Versions

| Version | Direction | Status |
| --- | --- | --- |
| [v1](v1/README.md) | Original site from `gLitCh-Labs-Releases` | Local snapshot, including studio, product, download, and resource pages |
| [v2](v2/README.md) | Everyday, considered — cinematic studio | Existing interactive prototype, moved intact from its former `v1/` location |
| [v3](v3/README.md) | Portal, Signal, Orbit, and Nocturne / Folio / Chroma studies | Seventeen explorations, including four additive sculpted editions |

Preview routes: `/v1/`, `/v2/`, and `/v3/`. Each version owns its runtime resources and works independently of the other versions. The catalog uses v2's local fonts and favicon. Continue new work in `v3/`; preserve earlier versions.

## Structure

```text
index.html                  Version directory
catalog.css                 Directory styling
scripts/check-site.py       Local link and asset validation
docs/v1-migration.json      Releases site snapshot provenance and hashes
docs/v2-migration.json      Original cinematic extraction provenance and hashes
v1/                         Original Releases site and local assets
v2/                         Cinematic studio prototype and local dependencies
v3/                         Current spatial concepts, visual picker, and local assets
drafts/round-01/            Archived Blue, Dark, and Color explorations
```

## Verify

```powershell
python -X utf8 scripts/check-site.py
node --check v1/script.js
node --check v1/invite.js
node --check v2/scripts/prototype.js
node --check v2/scripts/expenses-demo.js
node --check v2/scripts/aura-scene.js
node --check v2/scripts/lumen-scene.js
```

The checker validates local HTML/CSS resources, heading counts, unique IDs, fragment links, and version isolation. It rejects references that escape a version folder, external runtime resources, and symbolic links. Outbound store, support, email, and production product links are intentional. For interaction changes, also check the affected scene in a browser at desktop and phone sizes and with motion disabled.

## Version organization — 18 October 2026

The original site was copied from `G:/Programs/gLitCh-Labs-Releases` into `v1/`. It includes 102 source files: all 21 public site pages, root CSS/JS, and complete assets. HTML adds only `noindex,nofollow` metadata; other copied files are byte-identical. Source and target SHA-256 hashes are recorded in `docs/v1-migration.json`. The source repository was not modified. Its Git metadata, deployment workflow, domain binding, verification page, and internal tooling were not copied.

The existing cinematic experiment moved from `v1/` to `v2/`. All 43 files were verified unchanged immediately after the move; only README paths were then updated. The Discover Expenses production link is preserved. Its original extraction manifest moved to `docs/v2-migration.json`, with target paths updated and historical hashes retained. The experiment was originally extracted on 11 October 2026 from the source repository's untracked `prototype/` directory.

`v3/` now holds Portal, Signal, Orbit, and the additional Signal / Titanium treatment, pending selection for the full build. The rejected first round (Blue, Dark, Color) is preserved under root-level `drafts/round-01/` and linked individually under Drafts in the root version selector. Each presents Expenses, AURA, Lumen, then Afterlight (in development). All three versions are linked from the root directory. Every preview page carries `noindex,nofollow` metadata. This repository has no publishing workflow or domain binding; source vendor/font licenses and artwork are retained.

Validation after reorganization: 24 pages and 649 local references passed, including headings, unique IDs, fragments, and version isolation.
