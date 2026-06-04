-- ============================================================
-- 027: Toddy free-answer race guard (audit T5)
-- The free tier grants ONE free quick answer per story. The check was a
-- non-atomic SELECT count, so N concurrent requests could each pass the gate
-- and obtain a free LLM answer. Enforce it in the DB: at most one free
-- (credits_charged = 0) assistant message per (user_id, story_id). The losing
-- concurrent insert then fails the unique index → only one free answer.
-- Defensive: only applies once the Toddy schema (023) is deployed.
-- ============================================================
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'toddy_messages'
  ) then
    create unique index if not exists uq_toddy_free_answer_per_story
      on public.toddy_messages (user_id, story_id)
      where role = 'assistant' and credits_charged = 0;
  end if;
end
$$;
