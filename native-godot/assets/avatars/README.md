# Avatar asset slots

The table loader looks for these optional files:

- `partner.glb` — optional character for the partner across the table ("یار شما")
- `opponent.glb` — shared model for visible opponents and fallback if `partner.glb` is absent

Put licensed, clothed, rigged GLB models in this folder and keep a copy of each licence/source note here. Godot imports GLB as a PackedScene. Check each model's real-world scale, forward direction, seated pose, arm/hand placement, material appearance and Android performance before treating it as ready.

Recommended source for generating varied clothed characters:
- Ara 3D Gen: https://github.com/olatunde85/3d-gen
- Its repository describes character data as CC0 MakeHuman-derived assets. Keep the asset licence documentation with every export.

Do not use a nude base mesh as a shipped card-table character. Export clothed adult characters and test the exact GLB files in Godot before committing them.

The loader keeps the existing procedural body as a fallback when the files are absent. No realistic GLB model is included in this folder yet. The code integration is a loader only; it does not create or download model files.

## Verified seated-model candidates (CC0)

These are better first test candidates than standing models because the source pages explicitly describe a seated pose and embedded textures:

- **Seated upright** — https://www.innerscene.com/tools/library/3d-parts/seated-upright-3d-person-seated-c6901f24 — GLB, about 12 MB, static clothed adult in a charcoal business suit; approximately 93k triangles; CC0.
- **Seated leaning forward** — https://www.innerscene.com/tools/library/3d-parts/seated-leaning-forward-3d-person-seated-54eefd12 — GLB, about 19.1 MB, static clothed adult in a T-shirt and jeans; approximately 90k triangles; CC0.
- **Seated conversation** — https://www.innerscene.com/tools/library/3d-parts/seated-conversation-3d-person-seated-c5931842 — GLB, about 17.9 MB, static clothed adult; approximately 86k triangles; CC0.
- **Seated turning aside** — https://www.innerscene.com/tools/library/3d-parts/seated-turning-aside-3d-person-seated-2c3739dd — GLB, about 23.4 MB, static clothed adult; approximately 85k triangles; CC0.

These are candidate source pages, not assets already included in this repository. They are static meshes, so they will not animate or allow skeletal pose changes. Before using them in the table, download the GLB from the source page, inspect the exact orientation and arm/hand placement, optimize file size for mobile, and test in Godot. Keep the source page and CC0 terms documented with the exported file.
