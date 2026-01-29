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
  
  -- Registration Fields
  first_name text not null,
  last_name text not null,
  email text not null,
  zip_code text not null,
  age_range text not null, -- e.g. "18-24", "25-34"
  -- Demographics / Classification
  attendee_type jsonb not null default '[]'::jsonb, -- Array of strings: ["Student", "Job Seeker"]
  organization text null, -- School or Org
  
  -- Tech Profile
  interests jsonb not null default '[]'::jsonb, -- Array of strings
  tech_access text not null, -- "Laptop/Desktop", "Smartphone only", etc.
  digital_skill_level text not null, -- "Beginner", "Intermediate", "Advanced"
  reason_for_attending text null,
  opt_in_communications boolean not null default false,

  -- Impact Data (Baseline)
  confidence_tech_access_pre integer null, -- Score 1-5 or similar
  clarity_tech_pathways_pre integer null, -- Score 1-5
  
  -- Impact Data (Post-Experience)
  confidence_tech_access_post integer null,
  clarity_tech_pathways_post integer null,
  valuable_activity text null, -- "Vendor booths", "AI activations", etc.
  future_action text null, -- "apply for program", etc.

  -- Check-in / Wristband Phase
  wristband_id text null, -- The unique code on the wristband
  wristband_linked_at timestamp with time zone null,

  -- Gamification
  total_points integer not null default 0,
  
  created_at timestamp with time zone not null default now(),
  constraint attendees_pkey primary key (id),
  constraint attendees_email_event_unique unique (event_id, email),
  constraint attendees_wristband_event_unique unique (event_id, wristband_id)
);

-- Stations Table
create table public.stations (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  type text not null default 'vendor', -- vendor, activation, welcome, hackathon, nysci, mentorship
  points_base integer not null default 100,
  description text null,
  created_at timestamp with time zone not null default now(),
  constraint stations_pkey primary key (id)
);

-- Vendors Table (Admin / detailed info)
create table public.vendors (
  id uuid not null default gen_random_uuid (),
  station_id uuid null references public.stations (id) on delete set null,
  name text not null,
  primary_contact text null,
  email text null,
  industry_category text null,
  description text null,
  created_at timestamp with time zone not null default now(),
  constraint vendors_pkey primary key (id)
);

-- Scans Table (Raw scan logs)
create table public.scans (
  id uuid not null default gen_random_uuid (),
  attendee_id uuid not null references public.attendees (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint scans_pkey primary key (id),
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

-- RLS Policies
alter table public.events enable row level security;
alter table public.attendees enable row level security;
alter table public.stations enable row level security;
alter table public.vendors enable row level security;
alter table public.scans enable row level security;
alter table public.points_log enable row level security;

-- Public Access Policies (Prototype Mode: Open access for ease of use, assume API/App handles logic)
-- In production, strict RLS with auth.uid() would be better, but we are using anon key + generated UUIDs.
create policy "Allow public read access for stations" on public.stations for select using (true);
create policy "Allow public insert for stations" on public.stations for insert with check (true);
create policy "Allow public read access for events" on public.events for select using (true);
create policy "Allow public insert for events" on public.events for insert with check (true);

create policy "Allow public insert for attendees" on public.attendees for insert with check (true);
create policy "Allow public select for attendees" on public.attendees for select using (true);
create policy "Allow public update for attendees" on public.attendees for update using (true);

create policy "Allow public select for vendors" on public.vendors for select using (true);
create policy "Allow public insert for vendors" on public.vendors for insert with check (true);

create policy "Allow public select for scans" on public.scans for select using (true);
create policy "Allow public select for points_log" on public.points_log for select using (true);

-- RPC for Scanning (Updated)
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

-- RPC for Linking Wristband (New)
create or replace function link_wristband(
  p_attendee_id uuid,
  p_wristband_id text
) returns jsonb as $$
declare
  v_attendee_exists boolean;
  v_wristband_taken boolean;
begin
  -- Check attendee
  select exists(select 1 from attendees where id = p_attendee_id) into v_attendee_exists;
  if not v_attendee_exists then
    return jsonb_build_object('success', false, 'message', 'Attendee not found');
  end if;

  -- Check if wristband is already used
  select exists(select 1 from attendees where wristband_id = p_wristband_id) into v_wristband_taken;
  if v_wristband_taken then
    return jsonb_build_object('success', false, 'message', 'Wristband already linked to another user');
  end if;

  -- Link
  update attendees 
  set wristband_id = p_wristband_id, 
      wristband_linked_at = now() 
  where id = p_attendee_id;

  return jsonb_build_object('success', true, 'message', 'Wristband linked successfully');
end;
$$ language plpgsql security definer;

-- View for Leaderboard / Qualification
create or replace view leaderboard as
select 
  a.id,
  a.first_name,
  a.last_name,
  a.total_points,
  count(s.id) filter (where st.type = 'vendor') as vendor_visits
from attendees a
left join scans s on s.attendee_id = a.id
left join stations st on s.station_id = st.id
group by a.id;

-- Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
-- Create sequence for attendee numbers
CREATE SEQUENCE IF NOT EXISTS attendee_number_seq START 1;

-- Add attendee_number column to attendees table
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS attendee_number text;

-- Create function to generate attendee number
CREATE OR REPLACE FUNCTION generate_attendee_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate formatted number: QNY-0001, QNY-0002, etc.
  NEW.attendee_number := 'QNY-' || LPAD(nextval('attendee_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign number on insert
DROP TRIGGER IF EXISTS set_attendee_number ON public.attendees;
CREATE TRIGGER set_attendee_number
BEFORE INSERT ON public.attendees
FOR EACH ROW
EXECUTE FUNCTION generate_attendee_number();
