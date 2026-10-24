# Supabase backend for FourBarg

Use a **dedicated Supabase project for FourBarg**. Do not point this app at unrelated projects.

## Files
- `001_initial_schema.sql`: player profiles and personal stats.
- `002_tournament_economy.sql`: virtual coins, stars, levels, 3/5/7-hand match modes, participation records and ledgers.
- `../scripts/supabase_client.gd`: starter email/password auth client; not yet wired to a login UI.

## Initial game economy (tunable values)
- New profile: 500 virtual coins, 0 stars, level 1.
- Match length: 3, 5 or 7 hands.
- Provisional entry fee: 30 / 50 / 70 coins for 3 / 5 / 7 hands.
- Provisional winner reward: 50 / 90 / 130 coins for 3 / 5 / 7 hands.
- Stars: 5 per hand won.
- Cumulative level thresholds: level 2 at 100 stars; level 3 at 250 total stars; level 4 at 500; then the threshold table continues.
- Proposed cosmetic costs for the game UI: rename 100 coins; avatar change 50 coins. These are product rules to implement in a trusted server transaction, not yet callable from the app.
- Coins/stars are virtual game points only; no cash value or cash-out.

## Security and setup
1. Create a dedicated Supabase project.
2. Apply `001_initial_schema.sql`, then `002_tournament_economy.sql` in its SQL Editor.
3. Use only the project's URL and publishable key in the client.
4. Never ship a secret/service_role key in the app or repository.
5. RLS is enabled. Client roles cannot write balances, ledgers, match results or rewards.
6. Before enabling online tournaments, implement a trusted authoritative server that validates each match, charges the entry fee once, awards stars per hand won, updates level, and settles the winner prize atomically with idempotency protection. Do not trust client-reported results.
7. The app is not store-ready; this schema has not been applied to a live Supabase project.
