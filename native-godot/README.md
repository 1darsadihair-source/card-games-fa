# چهاربرگ — Native 3D Prototype

This is a separate Godot 4 project inside the existing `card-games-fa` repository. It does not use Supabase and does not replace the existing web prototype.

## Current prototype

- 3D oval-table composition built from meshes
- Felt surface, metallic trim, world environment, key/fill/rim lights and shadows
- Four seats and card backs
- Raised card geometry with suit/rank labels
- Touch/mouse interaction and a card-play tween
- Persian-first presentation

## Open locally

1. Install Godot 4.x.
2. Import `native-godot/project.godot`.
3. Run the main scene.

## Important limitations

This is a visual interaction prototype, not yet the complete Chahar Barg game engine. The current hand is illustrative; turn validation, proper 52-card dealing, complete rules, sound, user settings and online play still need implementation. Do not describe this prototype as store-ready.

## Cross-platform export

- Android: configure the Android export template and create an APK for device testing; make an AAB only when preparing a store release.
- iOS: export to Xcode and build/sign on macOS with Xcode and the required Apple developer signing setup.
- Use the Compatibility renderer as the initial baseline for broader mobile GPU support; test shadows and frame rate on actual devices.

## Architecture direction

- Godot client: rendering, input, animation, local game presentation.
- Pure game rules module: deterministic dealing, legal-move validation, trick winner and scoring.
- Later online play: separate authoritative game server using WebSockets; no Supabase dependency.
