-- Quest Submissions Table
create table if not exists public.quest_submissions (
  id uuid not null default gen_random_uuid (),
  attendee_id uuid not null references public.attendees (id) on delete cascade,
  quest_id text not null,
  answer text not null,
  points_earned integer not null,
  created_at timestamp with time zone not null default now(),
  constraint quest_submissions_pkey primary key (id),
  constraint unique_quest_per_attendee unique (attendee_id, quest_id)
);

-- RLS Policies
alter table public.quest_submissions enable row level security;

create policy "Allow public insert for quest_submissions" on public.quest_submissions for insert with check (true);
create policy "Allow public select for quest_submissions" on public.quest_submissions for select using (true);

-- Permissions
grant all on public.quest_submissions to anon, authenticated;
