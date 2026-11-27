-- Technician authorization for service calls.
--
-- Run this once in the Supabase SQL editor before technicians sign in on a machine QR.
--
-- What it does:
--   * Anonymous and logged-in browser clients can still read the board and insert
--     a new operator call.
--   * They can no longer update or delete service_calls. Acknowledge, extra work,
--     and complete go through perform_tech_action, which only the service role
--     (the Next.js API) can execute.
--   * Each of those writes is stored in service_call_actions.
--   * "Needs more work" notes append to work_notes. The original description stays.
--   * Technician PINs live in technician_pins. The public anon key cannot read them.
--
-- After this migration, set these Vercel env vars:
--   TECH_SESSION_SECRET       long random string (signs the phone cookie and
--                             authorizes Plant admin to set PINs)
--   SUPABASE_SERVICE_ROLE_KEY Supabase service_role key (server only, never NEXT_PUBLIC)
--
-- Service-call SMS stays plain text with no link. Technicians scan the same
-- equipment QR as operators and sign in with the mobile number they registered
-- and the PIN set in Plant admin. The phone stores an httpOnly cookie so they
-- do not enter it on every scan.

alter table public.service_calls
  add column if not exists work_notes text,
  add column if not exists arrived_by uuid references public.technicians (id) on delete set null,
  add column if not exists arrived_by_name text,
  add column if not exists completed_by uuid references public.technicians (id) on delete set null,
  add column if not exists completed_by_name text;

create table if not exists public.service_call_actions (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.service_calls (id) on delete cascade,
  technician_id uuid references public.technicians (id) on delete set null,
  technician_name text not null,
  action text not null,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists service_call_actions_call_id_idx
  on public.service_call_actions (call_id, created_at desc);

alter table public.service_call_actions enable row level security;
revoke all on table public.service_call_actions from public, anon, authenticated;

create table if not exists public.technician_pins (
  technician_id uuid primary key references public.technicians (id) on delete cascade,
  pin_hash text not null,
  pin_salt text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.technician_pins enable row level security;
revoke all on table public.technician_pins from public, anon, authenticated;

alter table public.service_calls enable row level security;

do $$
declare
  existing record;
begin
  for existing in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'service_calls'
  loop
    execute format('drop policy %I on public.service_calls', existing.policyname);
  end loop;
end $$;

revoke update, delete on table public.service_calls from anon, authenticated;

create policy service_calls_select_public
  on public.service_calls
  for select
  to anon, authenticated
  using (true);

create policy service_calls_insert_operator
  on public.service_calls
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.perform_tech_action(
  p_call_id uuid,
  p_technician_id uuid,
  p_action text,
  p_note text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  tech record;
  call record;
  new_status text;
  clean_note text;
begin
  select id, name, plant_id, active
    into tech
  from technicians
  where id = p_technician_id;

  if tech.id is null or tech.active is distinct from true then
    raise exception 'technician_not_allowed';
  end if;

  select *
    into call
  from service_calls
  where id = p_call_id
  for update;

  if call.id is null then
    raise exception 'call_not_found';
  end if;

  if call.plant_id is distinct from tech.plant_id then
    raise exception 'technician_not_allowed';
  end if;

  clean_note := nullif(btrim(coalesce(p_note, '')), '');

  if p_action = 'arrived' then
    if call.status not in ('Open', 'Waiting') then
      raise exception 'invalid_transition';
    end if;
    new_status := 'Arrived';
    update service_calls
      set status = new_status,
          arrived_at = coalesce(arrived_at, now()),
          arrived_by = tech.id,
          arrived_by_name = tech.name
      where id = call.id;

  elsif p_action = 'needs_more' then
    if call.status not in ('Arrived', 'Needs More Work') then
      raise exception 'invalid_transition';
    end if;
    if clean_note is null then
      raise exception 'note_required';
    end if;
    new_status := 'Needs More Work';
    update service_calls
      set status = new_status,
          updated_at = now(),
          work_notes = concat_ws(
            E'\n\n',
            nullif(call.work_notes, ''),
            '[' || to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') || '] '
              || tech.name || ': ' || clean_note
          )
      where id = call.id;

  elsif p_action = 'complete' then
    if call.status not in ('Arrived', 'Needs More Work') then
      raise exception 'invalid_transition';
    end if;
    new_status := 'Completed';
    update service_calls
      set status = new_status,
          completed_at = now(),
          completed_by = tech.id,
          completed_by_name = tech.name
      where id = call.id;

  else
    raise exception 'invalid_action';
  end if;

  insert into service_call_actions (
    call_id,
    technician_id,
    technician_name,
    action,
    from_status,
    to_status,
    note
  ) values (
    call.id,
    tech.id,
    tech.name,
    p_action,
    call.status,
    new_status,
    clean_note
  );

  return jsonb_build_object(
    'status', new_status,
    'technician_id', tech.id,
    'technician_name', tech.name
  );
end;
$$;

revoke all on function public.perform_tech_action(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.perform_tech_action(uuid, uuid, text, text)
  to service_role;

notify pgrst, 'reload schema';
