# Avatar asset slots

The table loader looks for these optional files:

- `player.glb` — the character in the player's seat ("یار شما")
- `opponent.glb` — the shared fallback model for the other visible seats

Put licensed, clothed, rigged GLB models in this folder and keep a copy of each licence/source note here. Godot imports GLB as a PackedScene. Check each model's real-world scale, forward direction, seated pose, arm/hand placement, material appearance and Android performance before treating it as ready.

Recommended source for generating varied clothed characters:
- Ara 3D Gen: https://github.com/olatunde85/3d-gen
- Its repository describes character data as CC0 MakeHuman-derived assets. Keep the asset licence documentation with every export.

Do not use a nude base mesh as a shipped card-table character. Export clothed adult characters and test the exact GLB files in Godot before committing them.

The loader keeps the existing procedural body as a fallback when the files are absent. No realistic GLB model is included in this folder yet.
