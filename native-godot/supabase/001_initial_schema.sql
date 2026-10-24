-- FourBarg native app: initial Supabase schema.
-- Apply only to a dedicated Supabase project created for this app.
-- Never put service_role/secret keys in the Godot client.

create table if not exists public.player_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null default 'بازیکن',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint player_profiles_display_name_length check (char_length(display_name) between 1 and 32)
);

create table if not exists public.player_stats (
    user_id uuid primary key references auth.users(id) on delete cascade,
    games_played integer not null default 0 check (games_played >= 0),
    games_won integer not null default 0 check (games_won >= 0 and games_won <= games_played),
    tricks_won integer not null default 0 check (tricks_won >= 0),
    updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;
alter table public.player_stats enable row level security;

revoke all on public.player_profiles from anon, authenticated;
revoke all on public.player_stats from anon, authenticated;

grant select, insert, update on public.player_profiles to authenticated;
grant select on public.player_stats to authenticated;

create policy "Players can read their own profile"
on public.player_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Players can create their own profile"
on public.player_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Players can update their own profile"
on public.player_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Players can read their own stats"
on public.player_stats for select to authenticated
using ((select auth.uid()) = user_id);

-- No client INSERT/UPDATE policy for player_stats: scores must eventually be
-- written by trusted server-side game logic, not by a modified mobile client.

create or replace function public.handle_new_fourbarg_user()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    insert into public.player_profiles (user_id, display_name)
    values (
        new.id,
        coalesce(nullif(left(new.raw_user_meta_data ->> 'display_name', 32), ''), 'بازیکن')
    )
    on conflict (user_id) do nothing;

    insert into public.player_stats (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_fourbarg_auth_user_created on auth.users;
create trigger on_fourbarg_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_fourbarg_user();
