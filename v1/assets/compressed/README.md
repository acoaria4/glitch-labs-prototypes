# Reusable lossless icons

These WebP files preserve the finalized originals' dimensions, decoded RGBA pixels
(including RGB values under fully transparent pixels), and ICC profiles. No resizing,
palette reduction, or lossy compression is applied. Website references are unchanged.

The original `assets/finalized-icons/` folder was removed during the website promotion.
Sources were read directly from Git revision
`07f52a5f147aa7a013453a9f75372ed6adbc6eb2`, without restoring or altering the originals.
`manifest.json` records the source paths, revision, hashes, dimensions, verification,
output sizes, and savings.

| Icon | Dimensions | Bytes | Decimal MB |
| --- | --- | ---: | ---: |
| AURA ivory | 1254 × 1254 | 1,011,670 | 1.012 |
| AURA obsidian | 1254 × 1254 | 1,041,478 | 1.041 |
| Expenses | 1254 × 1254 | 1,114,788 | 1.115 |
| gLitCh Labs | 1254 × 1254 | 1,201,208 | 1.201 |
| Lumen | 1254 × 1254 | 1,389,014 | 1.389 |

The tested lossless settings did not achieve the preferred 500,000-byte target or
the 1,000,000-byte target. These files prioritize exact quality over a size cap.
Smaller dimensions would discard detail and are deliberately not generated here.

## Regenerate

Install Pillow and the `cwebp` executable (libwebp), then run from the repository root:

```sh
python3 scripts/compress-icons.py
```

The command reads the local `assets/finalized-icons/` folder if present; otherwise it
uses the archived revision above. It compares lossless WebP presets 6 and 9 against
the source PNG, verifies pixels and profiles, and writes the smallest equivalent.
It only writes into this folder and does not change the website or source assets.
