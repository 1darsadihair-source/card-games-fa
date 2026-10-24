# FourBarg — Realistic Avatar and Table Production Plan

This is the implementation contract for replacing the temporary primitive people in the table prototype. The current procedural characters are placeholders, not realistic human models.

## Visual target

- Premium, intimate card-room lighting: deep green felt, dark walnut, restrained brass accents, soft key light and subtle rim light.
- Four seated adult human characters with believable proportions, visible heads/shoulders/arms/hands, and distinct silhouettes.
- Camera anchored at the player's seat. The player's own hand is face-up and readable; the partner and opponents show card backs only.
- Character creator controls must change the character actually used at the table, not just a separate preview.
- UI remains touch-first and readable on a portrait phone.

## Asset policy

Prefer licensed, rigged GLB/glTF assets that can be imported directly by Godot 4. Keep the licence text and source URL in the repository beside each asset. Do not commit scraped models, paid models without a licence, or naked base meshes as if they were finished clothed characters.

Candidate sources to evaluate:
- Ara 3D Gen (open-source generator based on CC0 MakeHuman data): https://github.com/olatunde85/3d-gen
- Innerscene CC0 rigged human base mesh (use only as a technical base; it is not a finished clothed avatar): https://www.innerscene.com/tools/library/3d-parts/human-base-mesh-with-editable-53-bone-rig-8e7c8ab1
- Other assets must be checked individually for licence, textures, skeleton, topology, and mobile suitability before inclusion.

## Import and optimization checklist

1. Generate/export at least four visually distinct, clothed adult avatars in GLB with compatible skeletons and textures.
2. Store each asset and its licence/source note under `native-godot/assets/avatars/`.
3. Import each GLB in Godot 4 and inspect scale, forward axis, materials, skeleton, and texture embedding.
4. Create a reusable avatar scene with a seated pose. Use rigged arms/hands where available; do not fake hands with spheres in the final version.
5. Add a model loader with a safe fallback so a missing asset cannot break the table scene.
6. Persist a validated avatar profile locally first; then apply it to the table's player model. Only later sync the profile to an authenticated backend.
7. Keep opponent hands hidden. Never expose opponents' card faces to the local client.
8. Profile the scene on a mid-range Android device; reduce mesh complexity, texture sizes, shadows, and material count if frame time is poor.

## Acceptance criteria

- [ ] At least four clothed, realistic human models are included with documented licences.
- [ ] All four are seated and oriented toward the table correctly.
- [ ] Own cards are face-up; all other hands show backs only.
- [ ] Character creator changes are visible on the in-game player model after saving and returning to the table.
- [ ] No missing textures, magenta materials, broken rigs, or invalid scene paths.
- [ ] Godot 4 import/parse and smoke tests pass in GitHub Actions.
- [ ] Android performance is measured before calling the scene production-ready.

## Current status

The avatar editor and table button are prototypes. The editor currently renders simple geometry, saves a local JSON profile, and does not yet drive the table avatars. No realistic model files have been committed and no native Android/iOS build has been verified. Do not describe these items as complete until the acceptance criteria above are met.
