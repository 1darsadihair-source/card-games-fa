# 3D Table View and Avatar Customization

## Table-view target

The native Godot scene is framed from the human player's seat:
- the human player's own 13 cards are the only cards rendered face-up;
- the partner sits across the table, with face/body visible and card backs facing the camera;
- the two opponents sit to the left and right, with faces visible and card backs hidden;
- the table uses green felt, a wood base, gold trim, warm key lighting, and chair/character silhouettes.

The current scene uses procedural placeholder geometry, not scanned or final-quality human models. It is a framing and interaction prototype. Replace the placeholder heads, torsos, arms, chairs, and cards with optimized licensed 3D assets before release.

## Avatar profile data

`scripts/avatar_profile.gd` defines a modular appearance profile with options for body style, skin tone, hairstyle, hair color, outfit, and accessory. It emits `appearance_changed` when a setting changes and supports JSON serialization for later persistence.

This is the data model only; a polished character-creator screen, final character meshes/material variants, and persistence through an authenticated FourBarg Supabase project still need implementation. Do not store account credentials in the profile JSON. Never let a client decide coin balances or award match rewards.

## Next implementation milestones

1. Add a character-creator scene with touch-friendly controls and a live 3D preview.
2. Bind profile choices to the avatar's meshes/materials and validate all option indexes.
3. Add a settings/profile entry point from the game lobby.
4. Create and configure the dedicated Supabase project, then save appearance to an authenticated profile row under RLS.
5. Replace placeholder characters with optimized, licensed rigged assets and test on real Android devices.
6. Run Godot import/parse and gameplay smoke tests, then export Android builds. No release APK/IPA should be claimed until an actual build is produced and tested.
