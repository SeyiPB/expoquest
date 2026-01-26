-- Events Table
create table public.events (
  id uuid not null default gen_random_uuid (),
  name text not null,
  config jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint events_pkey primary key (id)
);

-- Attendees Table
create table public.attendees (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null references public.events (id) on delete cascade,
  attendee_code text not null,
  demographics jsonb null default '{}'::jsonb,
  total_points integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint attendees_pkey primary key (id),
  constraint attendees_code_event_unique unique (event_id, attendee_code)
);

-- Stations Table
create table public.stations (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  type text not null default 'standard', -- standard, bonus, exit
  points_base integer not null default 100,
  description text null,
  created_at timestamp with time zone not null default now(),
  constraint stations_pkey primary key (id)
);

-- Scans Table (Raw scan logs)
create table public.scans (
  id uuid not null default gen_random_uuid (),
  attendee_id uuid not null references public.attendees (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint scans_pkey primary key (id),
  -- Prevent multiple scans of the same station by the same attendee? 
  -- User requirements said "prevent duplicates per station".
  constraint unique_scan_per_attendee_station unique (attendee_id, station_id) 
);

-- Points Log (Detailed history)
create table public.points_log (
  id uuid not null default gen_random_uuid (),
  attendee_id uuid not null references public.attendees (id) on delete cascade,
  amount integer not null,
  reason text not null,
  station_id uuid null references public.stations (id) on delete set null,
  created_at timestamp with time zone not null default now(),
  constraint points_log_pkey primary key (id)
);

-- RLS Policies (Simplified for prototype, refine for prod)
alter table public.events enable row level security;
alter table public.attendees enable row level security;
alter table public.stations enable row level security;
alter table public.scans enable row level security;
alter table public.points_log enable row level security;

-- Allow public read for events/stations (or authenticated anon)
create policy "Allow public read access for stations" on public.stations for select using (true);
create policy "Allow public insert for stations" on public.stations for insert with check (true);
create policy "Allow public read access for events" on public.events for select using (true);
create policy "Allow public insert for events" on public.events for insert with check (true);

-- Allow anyone to create attendee (check-in)
create policy "Allow public insert for attendees" on public.attendees for insert with check (true);
create policy "Allow public select for attendees" on public.attendees for select using (true);
create policy "Allow public update for attendees" on public.attendees for update using (true);

create policy "Allow public select for scans" on public.scans for select using (true);
create policy "Allow public select for points_log" on public.points_log for select using (true);
-- Allow attendee to read own data (conceptually, we might need a cookie or localstorage ID match, 
-- effectively for this app which is "no login", we might trust the client with the code OR 
-- we use the anon key and handle logic in RPCs or Edge Functions to verify).
-- For now, let's allow read/update if the client passes the UUID (not secure but fits 'fast prototype' with anon key).
-- A better way is: all mutations via RPC.

-- RPC for Scanning
create or replace function record_scan(
  p_attendee_id uuid,
  p_station_id uuid 
) returns jsonb as $$
declare
  v_points integer;
  v_station_exists boolean;
  v_scan_exists boolean;
  v_attendee_exists boolean;
  v_new_points integer;
begin
  -- Check existence
  select exists(select 1 from stations where id = p_station_id) into v_station_exists;
  if not v_station_exists then
    return jsonb_build_object('success', false, 'message', 'Station not found');
  end if;

  select exists(select 1 from attendees where id = p_attendee_id) into v_attendee_exists;
  if not v_attendee_exists then
    return jsonb_build_object('success', false, 'message', 'Attendee not found');
  end if;

  -- Check duplicate
  select exists(select 1 from scans where attendee_id = p_attendee_id and station_id = p_station_id) into v_scan_exists;
  if v_scan_exists then
    return jsonb_build_object('success', false, 'message', 'Already scanned this station');
  end if;

  -- Get points
  select points_base into v_points from stations where id = p_station_id;

  -- Insert scan
  insert into scans (attendee_id, station_id) values (p_attendee_id, p_station_id);

  -- Log points
  insert into points_log (attendee_id, amount, reason, station_id) values (p_attendee_id, v_points, 'Station Scan', p_station_id);

  -- Update total
  update attendees set total_points = total_points + v_points where id = p_attendee_id returning total_points into v_new_points;

  return jsonb_build_object('success', true, 'points_earned', v_points, 'new_total', v_new_points);
end;
$$ language plpgsql security definer;
