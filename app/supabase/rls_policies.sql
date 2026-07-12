-- Phase 4: lock the database down to "only the logged-in user can touch their own rows".
-- auth.uid() is a Postgres function Supabase provides that returns the id of
-- whoever is making the request, based on their login token.

alter table exercises enable row level security;
create policy "Users manage their own exercises"
  on exercises for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table sessions enable row level security;
create policy "Users manage their own sessions"
  on sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- session_exercises and sets don't store user_id directly — ownership is
-- checked by joining up to the sessions table, which does.
alter table session_exercises enable row level security;
create policy "Users manage their own session exercises"
  on session_exercises for all
  using (exists (
    select 1 from sessions
    where sessions.id = session_exercises.session_id and sessions.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from sessions
    where sessions.id = session_exercises.session_id and sessions.user_id = auth.uid()
  ));

alter table sets enable row level security;
create policy "Users manage their own sets"
  on sets for all
  using (exists (
    select 1 from session_exercises
    join sessions on sessions.id = session_exercises.session_id
    where session_exercises.id = sets.session_exercise_id and sessions.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from session_exercises
    join sessions on sessions.id = session_exercises.session_id
    where session_exercises.id = sets.session_exercise_id and sessions.user_id = auth.uid()
  ));
