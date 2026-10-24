# چهاربرگ — Native 3D Mobile App

This is the native Godot 4 project for the FourBarg Android/iOS app, kept in the existing `card-games-fa` repository. The React/Vite web prototype remains separate and is not the native app.

## Current implementation

- 3D table scene with felt, metallic trim, lighting, shadows, four seats and touch/mouse card interaction.
- Shuffled 52-card deck and 13 cards dealt to the local hand.
- Reusable game rules module for deck creation, dealing, follow-suit legality, trick winner, teams and baseline AI selection.
- Supabase backend scaffold: email/password Auth, user-scoped profile reads, and SQL schema with Row Level Security.
- Supabase schema and setup notes are in `native-godot/supabase/`.

## Current status — not store-ready

The visual scene is a prototype, not a complete playable game. Full turn sequencing, game-specific rule confirmation, trump selection, complete scoring, online matchmaking, authoritative server-side match validation, audio, accessibility, UI flows, and device QA remain to be implemented. The Supabase client scaffold is not yet wired into a login UI and the backend project has not yet been provisioned or connected.

## Native build

1. Install Godot 4.x and import `native-godot/project.godot`.
2. Run the main scene for local iteration.
3. Install/configure Android export templates to build an APK for device testing; produce an AAB for store release.
4. For iOS, export to Xcode and build/sign on macOS with Xcode and the required Apple signing setup.

The Compatibility renderer is the starting point for mobile GPU coverage. Real device performance and touch interaction must be tested before release.

## Supabase setup

Use a **dedicated Supabase project for FourBarg**, not a database used by another product. See `native-godot/supabase/README.md`.

- Apply `native-godot/supabase/001_initial_schema.sql`.
- Configure the project URL and publishable key in the native client before using Auth.
- Never embed a Supabase secret/service-role key in the app.
- RLS limits profile access to the signed-in owner. Stats are read-only from the client.
- Online game results need an authoritative server; a mobile client must not be trusted to award wins or modify scores.

## Architecture

- Godot: native 3D rendering, touch input, animation, local game presentation.
- Supabase: identity, player profile, private player stats.
- Authoritative game service (planned): online room state, move validation and score settlement.
