-- FourBarg economy and tournament foundation.
-- Apply only to the dedicated FourBarg Supabase project, after 001_initial_schema.sql.
-- Virtual currency only; no cash-out, purchases, or client-side score settlement.

alter table public.player_profiles
    add column if not exists coins bigint not null default 500 check (coins >= 0),
    add column if not exists stars bigint not null default 0 check (stars >= 0),
    add column if not exists level integer not null default 1 check (level >= 1),
    add column if not exists avatar_url text,
    add column if not exists rename_count integer not null default 0 check (rename_count >= 0);

alter table public.player_stats
    add column if not exists matches_played integer not null default 0 check (matches_played >= 0),
    add column if not exists matches_won integer not null default 0 check (matches_won >= 0 and matches_won <= matches_played),
    add column if not exists hands_won integer not null default 0 check (hands_won >= 0);

create table if not exists public.fourbarg_match_modes (
    hands_per_match integer primary key check (hands_per_match in (3, 5, 7)),
    entry_fee_coins integer not null check (entry_fee_coins > 0),
    winner_prize_coins integer not null check (winner_prize_coins >= entry_fee_coins),
    stars_per_hand_won integer not null default 5 check (stars_per_hand_won > 0),
    enabled boolean not null default true
);

-- Initial balance/prices are provisional game-balance values and can be tuned.
insert into public.fourbarg_match_modes
    (hands_per_match, entry_fee_coins, winner_prize_coins, stars_per_hand_won)
values
    (3, 30, 50, 5),
    (5, 50, 90, 5),
    (7, 70, 130, 5)
on conflict (hands_per_match) do nothing;

create table if not exists public.fourbarg_level_thresholds (
    level integer primary key check (level >= 1),
    stars_required bigint not null unique check (stars_required >= 0)
);

-- Cumulative star thresholds: Level 2 needs 100 total stars; Level 3 needs 250.
insert into public.fourbarg_level_thresholds (level, stars_required) values
    (1, 0), (2, 100), (3, 250), (4, 500), (5, 900),
    (6, 1400), (7, 2000), (8, 2700), (9, 3500), (10, 4500),
    (11, 5700), (12, 7100), (13, 8700), (14, 10500), (15, 12500)
on conflict (level) do nothing;

create table if not exists public.fourbarg_matches (
    id uuid primary key default gen_random_uuid(),
    mode_hands integer not null references public.fourbarg_match_modes(hands_per_match),
    status text not null default 'waiting' check (status in ('waiting', 'active', 'completed', 'cancelled')),
    created_at timestamptz not null default now(),
    completed_at timestamptz,
    winner_team integer check (winner_team in (0, 1)),
    winning_user_id uuid references auth.users(id) on delete set null,
    result jsonb not null default '{}'::jsonb
);

create table if not exists public.fourbarg_match_players (
    match_id uuid not null references public.fourbarg_matches(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    seat integer not null check (seat between 0 and 3),
    team integer not null check (team in (0, 1)),
    entry_fee_paid integer not null check (entry_fee_paid >= 0),
    coins_awarded integer not null default 0 check (coins_awarded >= 0),
    stars_awarded integer not null default 0 check (stars_awarded >= 0),
    hands_won integer not null default 0 check (hands_won >= 0),
    is_winner boolean not null default false,
    primary key (match_id, user_id),
    unique (match_id, seat)
);

create table if not exists public.fourbarg_coin_ledger (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    amount bigint not null check (amount <> 0),
    reason text not null check (reason in ('welcome_bonus', 'match_entry', 'match_prize', 'rename', 'avatar_change', 'admin_adjustment')),
    match_id uuid references public.fourbarg_matches(id) on delete set null,
    idempotency_key text not null,
    created_at timestamptz not null default now(),
    unique (user_id, idempotency_key)
);

create table if not exists public.fourbarg_star_ledger (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    amount bigint not null check (amount > 0),
    reason text not null check (reason in ('hand_won', 'tournament_bonus', 'admin_adjustment')),
    match_id uuid references public.fourbarg_matches(id) on delete set null,
    idempotency_key text not null,
    created_at timestamptz not null default now(),
    unique (user_id, idempotency_key)
);

alter table public.fourbarg_match_modes enable row level security;
alter table public.fourbarg_level_thresholds enable row level security;
alter table public.fourbarg_matches enable row level security;
alter table public.fourbarg_match_players enable row level security;
alter table public.fourbarg_coin_ledger enable row level security;
alter table public.fourbarg_star_ledger enable row level security;

revoke all on public.fourbarg_match_modes, public.fourbarg_level_thresholds,
    public.fourbarg_matches, public.fourbarg_match_players,
    public.fourbarg_coin_ledger, public.fourbarg_star_ledger
from anon, authenticated;

grant select on public.fourbarg_match_modes, public.fourbarg_level_thresholds to authenticated;
grant select on public.fourbarg_matches, public.fourbarg_match_players to authenticated;
grant select on public.fourbarg_coin_ledger, public.fourbarg_star_ledger to authenticated;

create policy "Authenticated players can read match modes"
on public.fourbarg_match_modes for select to authenticated using (true);

create policy "Authenticated players can read level thresholds"
on public.fourbarg_level_thresholds for select to authenticated using (true);

create policy "Players can read their own match participation"
on public.fourbarg_match_players for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Players can read matches they joined"
on public.fourbarg_matches for select to authenticated
using (exists (
    select 1 from public.fourbarg_match_players mp
    where mp.match_id = id and mp.user_id = (select auth.uid())
));

create policy "Players can read their own coin ledger"
on public.fourbarg_coin_ledger for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Players can read their own star ledger"
on public.fourbarg_star_ledger for select to authenticated
using ((select auth.uid()) = user_id);

-- No client write policies for balances, ledgers, match results or prizes.
-- A trusted server must charge entry fees and settle results atomically.
