-- The exercise library: every exercise you can pick from when building a session.
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  muscle_group text not null check (muscle_group in ('push','pull','legs')),
  equipment text not null check (equipment in ('barbell','dumbbell','machine','cable','bodyweight')),
  kind text not null check (kind in ('weighted','bodyweight','timed')),
  default_sets int not null default 3,
  default_reps text not null default '10',
  default_weight numeric,
  default_duration int,
  note text,
  created_at timestamptz not null default now()
);

-- One row per workout instance.
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_date date not null default current_date,
  day_type text not null check (day_type in ('push','pull','legs')),
  rotation_index int not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_minutes int
);

-- Which exercises (and what order) were picked for a given session.
-- Sets/reps are snapshotted here so later library edits don't rewrite history.
create table session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  order_index int not null,
  target_sets int not null,
  target_reps text not null
);

-- The actual logged sets against each session's exercises.
create table sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references session_exercises(id) on delete cascade,
  set_number int not null,
  weight numeric,
  reps int,
  duration_seconds int,
  logged_at timestamptz not null default now()
);

-- Row Level Security (RLS) stays OFF for now (Phase 2-3), since there's no
-- login yet to know who "you" are. We turn it on in Phase 4 once auth exists.
-- Supabase enables RLS by default on new tables, so we explicitly disable it here.
alter table exercises disable row level security;
alter table sessions disable row level security;
alter table session_exercises disable row level security;
alter table sets disable row level security;
