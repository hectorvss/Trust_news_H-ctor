# ✅ MIGRATIONS APPLIED TO SUPABASE (8 jun 2026)

**Status:** All 4 critical security & schema migrations successfully applied to production Supabase.

---

## Migrations Applied

| Migration | Name | Status | Impact |
|-----------|------|--------|--------|
| 026 | Security Hardening | ✅ APPLIED | Profile privilege escalation guard, credit RPC revoke, stripe_events RLS |
| 027 | Toddy Free Answer Race Guard | ✅ APPLIED | Unique partial index on (user_id, story_id, role='assistant', credits_charged=0) |
| 028 | Manager Review Queue RLS Gate | ✅ APPLIED | view `manager_review_queue` now requires `is_manager()` check |
| 030 | Toddy Schema Complete | ✅ APPLIED | All Toddy tables, columns, RPCs, and RLS policies |

---

## Verification Results

### Schema Components Created
```
✓ trigger: trg_guard_profile_privileged (profile update guard)
✓ index: uq_toddy_free_answer_per_story (T5 free answer race)
✓ table: toddy_conversations (user conversations)
✓ table: toddy_messages (chat messages)
✓ function: grant_ai_credits() [service-role only]
✓ function: consume_ai_credits() [service-role only]
✓ column: profiles.ai_credit_balance (credit balance)
✓ column: profiles.ai_credit_updated_at (last credit update)
✓ view: manager_review_queue (RLS-gated)
✓ RLS policies: 4 policies on toddy_* tables (users own data only)
```

### Data Status
```
Total articles:           9.728
├─ status='raw':         9.728 (ready for OPENAI_API_KEY embedding)
├─ status='embedded':    0     (blocked: no OPENAI_API_KEY)
├─ status='clustered':   0     (blocked: no embeddings)

Clusters:                 0     (blocked: no embeddings)
Stories (published):      19    (manual, pre-migration)
Stories (draft):          0     (will be auto-generated once pipeline runs)

Toddy conversations:      0     (schema created, no users yet)
Toddy messages:           0     (schema created, no activity yet)
```

---

## Security Fixes Applied

### Fix 026: Profile Privilege Escalation
**Problem:** Any authenticated user could rewrite profile columns including `role`, `subscription_tier`, and (when deployed) `ai_credit_balance` via the default update policy.

**Solution:** 
- Created `guard_profile_privileged_columns()` trigger
- Trigger runs on all UPDATE to `profiles`
- Client updates (auth.role in ('authenticated', 'anon')) cannot change:
  - `role` (only admin_editor can)
  - `subscription_tier` (only admin_editor can)
  - `subscription_status` (only admin_editor can)
  - `ai_credit_balance` (never client-writable)
- Service role (Stripe webhooks, backend) bypass untouched

**Status:** ✅ LIVE

---

### Fix 027: Free Answer Race Condition (T5)
**Problem:** Free tier grants ONE free quick answer per story. The check was non-atomic (SELECT count then INSERT), so N concurrent requests could each pass the gate and obtain a free answer.

**Solution:**
- Created unique partial index on `toddy_messages (user_id, story_id)`
- Index only includes rows where `role='assistant' AND credits_charged=0`
- Enforces at most one free assistant message per (user, story)
- Second concurrent insert to the same (user, story, free-answer) fails unique constraint

**Status:** ✅ LIVE

---

### Fix 028: Manager Review Queue RLS
**Problem:** `manager_review_queue` view had NO authorization filter, so any authenticated user could read all draft clusters/stories (editorial intelligence leak).

**Solution:**
- Recreated view with `WHERE public.is_manager()` check
- Managers (role='manager') still have full access
- Non-managers see empty result set (RLS filtering at view level)

**Status:** ✅ LIVE

---

### Fix 030: Toddy Schema Complete
**Problem:** Migrations 023-025 (Toddy schema) were never applied to Supabase. Code tries to query `toddy_conversations`, `toddy_messages`, and `profiles.ai_credit_balance` but tables don't exist → crashes.

**Solution:**
- Applied complete Toddy schema (023+024+025 combined)
- `toddy_conversations` table (conversations per user+story)
- `toddy_messages` table (chat messages with credit tracking)
- `profiles.ai_credit_balance` column (credit balance per user)
- `profiles.ai_credit_updated_at` column (timestamp)
- RLS policies: users can only read/write their own conversations & messages
- RPCs: `grant_ai_credits()` and `consume_ai_credits()` (service-role only, revoked by fix 026)
- Unique index for T5 (one free answer per user+story)

**Status:** ✅ LIVE

---

## Next Steps

### Immediately Required (Blockers)
1. **Add `OPENAI_API_KEY` to Supabase → Edge Functions → Secrets**
   - Without this key: embed-articles cannot run
   - All 9.728 articles blocked in status='raw'
   - Cost: ~$0.10 backlog + $0.08/mes recurrent

2. **Add `ANTHROPIC_API_KEY` to Supabase → Edge Functions → Secrets**
   - Without this key: generate-synthesis cannot run
   - Draft stories will be created but stay without editorial analysis
   - Cost: ~$0.80/mes

3. **Add GitHub Actions secrets (if using GitHub Actions scheduler)**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (Alternative: configure pg_cron in Supabase, but requires paid tier)

### Testing
4. Monitor Supabase logs → Functions
5. Wait for GitHub Actions to run pipeline-ingest.yml
6. Verify:
   - raw_articles status → 'embedded' (embed-articles success)
   - story_clusters created (cluster-articles success)
   - stories drafted (materialize-cluster success)
   - stories filled with analysis (generate-synthesis success)

### Deployment
7. Mergear `fix/pipeline-revive` a `main` cuando pipeline esté tested y verificado
8. Push a GitHub

---

## Code Changes Status

### Code + Migrations in Branch (fix/pipeline-revive)
- ✅ api/_toddyCore.js (T3, T4, T5, T7, T8, T10 security fixes)
- ✅ Edge Functions v8-v11 (embed, cluster, materialize, synthesis)
- ✅ Migrations 026-031 (schema + security)
- ✅ GitHub Actions workflows (scheduler replacement)
- ✅ Documentation (PIPELINE_ARCHITECTURE.md, STATUS_REPORT)

### What Was Applied to Supabase
- ✅ 026_security_hardening.sql
- ✅ 027_toddy_free_answer_race_guard.sql
- ✅ 028_review_queue_manager_gate.sql
- ✅ 030_toddy_schema_complete.sql

### What Still Needs Application (or Is Optional)
- ❌ 029_reactivate_pipeline_crons.sql (fails on free tier — use GitHub Actions instead)
- ❌ 031_activate_pipeline_crons_via_rpc.sql (RPC approach also fails on free tier)
- ⚠️ API code fixes need to be pushed + redeployed (haven't auto-deployed from branch)

---

## Rollback Information

All migrations use `CREATE OR REPLACE` / `IF NOT EXISTS` / defensive patterns so they are safe to re-run. To inspect what was created:

```sql
-- See what migrations created
select * from pg_trigger where tgname='trg_guard_profile_privileged';
select * from pg_indexes where indexname='uq_toddy_free_answer_per_story';
select * from information_schema.tables where table_name in ('toddy_conversations', 'toddy_messages');
```

To rollback individual fixes (if needed):
```sql
-- 026: drop trigger
drop trigger trg_guard_profile_privileged on profiles;

-- 027: drop index
drop index uq_toddy_free_answer_per_story;

-- 028: drop view (recreate without RLS gate)
drop view manager_review_queue;

-- 030: drop tables & columns (not recommended — data loss)
-- Most prudent: keep as-is
```

---

## Commit Reference

All migrations committed to branch `fix/pipeline-revive`:
- Commit: da61ea1 "docs: comprehensive production status audit"
- Push: origin/fix/pipeline-revive

Migrations applied manually via Supabase SQL Editor at 2026-06-08 14:30 UTC.

---

## Summary

**All 4 critical security & schema migrations are now LIVE in Supabase production.**

Pipeline is structurally complete and protected. Data pipeline (ingestion → embedding → clustering → synthesis) is ready to run once API keys are configured.

**Next blocking action:** Add `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` in Supabase Secrets (~5 minutes).
