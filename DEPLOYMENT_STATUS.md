# Deployment Status — 5 de junio 2026

## ✅ COMPLETADO EN SUPABASE

### Migración 030 — APLICADA ✓
**Schema de Toddy completamente creado:**
- ✅ Tabla `toddy_conversations` (0 filas, listo para usar)
- ✅ Tabla `toddy_messages` (0 filas, listo para usar)
- ✅ Columnas en `profiles`: `ai_credit_balance`, `ai_credit_updated_at`
- ✅ 2 políticas RLS en cada tabla (users read/write own data)
- ✅ Funciones RPC: `grant_ai_credits()`, `consume_ai_credits()` (service-role only)
- ✅ Índice único T5: `uq_toddy_free_answer_per_story` (1 free answer per user+story)

### Migraciones de Seguridad — VERIFICADAS ✓
- ✅ **026**: Trigger `trg_guard_profile_privileged` + RLS stripe_events (no privilege escalation)
- ✅ **027**: Índice único T5 (free-tier race guard)
- ✅ **028**: Vista `manager_review_queue` gateada con `is_manager()`

### Datos en Producción
| Item | Count | Estado |
|------|-------|--------|
| raw_articles | 8.899 | ✓ Ingesta funcionó |
| sources (activas) | 55 | ✓ Activos |
| stories (published) | 19 | ✓ Manuales |
| stories (draft) | **0** | ⏳ Esperando pipeline activo |
| story_clusters | **0** | ⏳ Esperando embeddings + clustering |
| profiles (users) | 0 | ✓ OK (sin usuarios aún) |
| toddy_conversations | 0 | ✓ Listo (nuevo schema) |
| toddy_messages | 0 | ✓ Listo (nuevo schema) |

---

## ⏳ PENDIENTE (usuario debe hacer)

### Migración 029 — REQUIERE PERMISOS ELEVADOS
**Reactivar los 6 crons del pipeline** (sin permisos en `cron.job` table):
```sql
update cron.job set active = true
where jobname in (
  'trust-news-ingest',
  'trust-news-embed',
  'trust-news-keyword-cluster',
  'trust-news-cluster',
  'trust-news-materialize',
  'trust-news-synthesize'
);
```
**Ubicación**: Supabase Dashboard → SQL Editor → Copiar + ejecutar

### Secretos de API — REQUIERE VALORES REALES
**Supabase → Project Settings → Edge Functions → Secrets**

```
OPENAI_API_KEY = sk-proj-...      [Requerido: OPENAI]
ANTHROPIC_API_KEY = sk-ant-...    [Requerido: CLAUDE]
```

Sin estas keys:
- ❌ `embed-articles`: no ejecuta (0 embeddings)
- ❌ `generate-synthesis`: no ejecuta (0 análisis)
- ❌ Toddy web-research: no busca web

---

## 📊 ESTADO DEL PIPELINE POST-ACTIVACIÓN

**En 5 minutos (ingest):**
- Si 029 ✓ + OPENAI_API_KEY ✓:
  - `trust-news-ingest` ejecuta → nuevos raw_articles
  - `trust-news-embed` ejecuta → primeros embeddings (1536-dim)

**En 30 minutos (clustering):**
- `cluster-articles` + `cluster-by-keywords` ejecutan
- Primeros `story_clusters` aparecen

**En 2 horas (síntesis):**
- Si ANTHROPIC_API_KEY ✓:
  - `generate-synthesis` ejecuta
  - Primeros `stories (draft)` con análisis

**Toddy funciona:**
- Si ambas keys ✓: usuarios pueden chatear

---

## 📦 EN GITHUB

**Rama**: `fix/pipeline-revive`

**Commits** (14 total):
1. d014f5d: Fix pipeline death (restore embedBatch)
2. b64b6a7: Security 026 applied live
3. 8bbc9e7: Fix pipeline error handling
4. 6b62d08: Toddy XSS + message length
5. 898b402: Toddy injection + error leakage + pipeline-health auth
6. 92055ca: Pricing (T4 + T8)
7. f7418d1: Synthesis retry/backoff (#9)
8. e0460e0: Clustering embedding gate (#7)
9. 9f80465: Ingest concurrency (#3)
10. 3a1e7ae: Synthesis injection (#8)
11. 40da2be: T5 race guard (027)
12. e1df6eb: Manager queue gate (028)
13. 9bc689a: Migration 029 (reactivar crons)
14. 2ec9739: Audit findings
15. 5cf64b7: Audit + Migration 030 (Toddy schema)

**Listos para merge a `main` cuando**:
- [ ] 029 aplicada en Supabase (usuario + super-admin)
- [ ] Secretos OPENAI_API_KEY + ANTHROPIC_API_KEY añadidos
- [ ] Verificar que `pipeline_runs` crece (5 min después de activar)

---

## ✓ RESUMEN FINAL

**La BD está lista 100%** ✓
- Seguridad: Cerrada (026, 027, 028)
- Toddy: Schema creado (030)
- Pipeline: Datos presentes (8.899 articles)
- Crons: Listos para reactivar (029)

**Falta**:
- [ ] Ejecutar migración 029 (Supabase Dashboard SQL Editor)
- [ ] Añadir 2 secrets (OPENAI_API_KEY, ANTHROPIC_API_KEY)

**Tiempo total post-activación**: ~2 horas para ver pipeline funcionando end-to-end.

---

Audit realizado por: Claude Code Agent
Fecha: 5 de junio 2026
