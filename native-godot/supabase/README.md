# Supabase backend for FourBarg

This folder belongs to the native Godot mobile app. Use a **dedicated Supabase project for FourBarg**. Do not point it at unrelated projects used by other products.

## Current files

- `001_initial_schema.sql`: player profiles and read-only personal stats, with RLS policies.
- `../scripts/supabase_client.gd`: starter Godot client for email/password sign-up/sign-in and reading the signed-in player's profile.

## Setup sequence

1. Create a dedicated Supabase project for FourBarg.
2. Apply `001_initial_schema.sql` in that project's SQL Editor (or through a reviewed migration workflow).
3. Copy the project URL and **publishable** key from the Supabase dashboard.
4. Configure a scene/node that owns `FourBargSupabaseClient`, then call `configure(project_url, publishable_key)` before sign-up/sign-in.
5. Configure email confirmation and redirect/auth policies for the intended launch markets.
6. Test two separate accounts and verify each account can only read/update its own profile and read its own stats.

## Security boundaries

- A publishable key may be embedded in the client; it is not a secret. RLS is mandatory.
- Never ship a Supabase secret or `service_role` key in the Godot project, app bundle, repository, or logs.
- The mobile client intentionally cannot insert/update scores. A trusted authoritative game service must validate completed matches and write stats. Client-side score submissions are not trustworthy.
- Do not store passwords in local files. The starter client stores session tokens in the app's private user-data directory. Production hardening should add refresh-token rotation, expiry handling, secure platform credential storage, and a sign-out/session-revocation test.
- The current client scaffold is not yet wired to a login UI or match server.
