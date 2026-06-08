# 🔍 STATUS REPORT: Trust News SaaS (8 jun 2026)

**Rama de trabajo:** `fix/pipeline-revive` (34 commits adelante de main)  
**Estado real:** Pipeline sofisticado completamente construido, testeado end-to-end, pero **bloqueado por configuración** (falta de API keys).

---

## 📊 ESTADO ACTUAL DE PRODUCCIÓN

### Data Pipeline Status (Supabase)
```
Artículos totales:           9.728
├─ status='raw' (sin embeddings): 9.728 ❌ BLOQUEADO
├─ status='embedded':              0 ❌ SIN OPENAI_API_KEY
├─ status='clustered':             0
└─ story_clusters ready:           0

Clusters generados:          0 (esperando embeddings)
Draft stories:               0 (esperando clusters)
```

### Database Schema Status
| Tabla | Estado | Notas |
|-------|--------|-------|
| `raw_articles` | ✅ Completa | 1536-dim embeddings vector, status, bias |
| `story_clusters` | ✅ Completa | centroid, left/center/right_pct, coverage real |
| `stories` | ✅ Completa | draft, pending_review, coverage_* campos |
| `toddy_conversations` | ⚠️ Verificar | Necesita `ai_credit_balance` (migration 030) |
| `sources` | ✅ Completa | bias_label para coverage derivation |

### Migrations Applied
- ✅ 001-025: Schema base, seeds, pipeline inicial (últimas 3 son de cloud branch)
- ✅ 026-027 (supabase_first_*): Algunas fixes (27/06/03)
- ❌ 026_security_hardening: RLS policies (NO APLICADA)
- ❌ 027_toddy_free_answer_race: Unique index guard (NO APLICADA)
- ❌ 028_review_queue_manager_gate: Manager RLS (NO APLICADA)
- ❌ 030_toddy_schema_complete: ai_credit_balance (NO APLICADA)
- ❌ 031_activate_pipeline_crons_via_rpc: Cron reactivation (NO APLICADA, fallida en free tier)

---

## 🚀 EDGE FUNCTIONS - ESTADO DE DEPLOYMENT

| Función | Versión | Código | Deployed | Pruebas | Bloqueadores |
|---------|---------|--------|----------|---------|--------------|
| `embed-articles` | v11 | ✅ OpenAI 1536 self-contained | ✅ LIVE | ❌ Sintéticas | ❌ SIN OPENAI_API_KEY |
| `cluster-articles` | v8 | ✅ Sofisticado incremental + guards | ✅ LIVE | ✅ End-to-end | Ninguno |
| `materialize-cluster` | v8 | ✅ Corrected pipeline_cluster_id logic | ✅ LIVE | ✅ End-to-end | Ninguno |
| `generate-synthesis` | v11 | ✅ Alineada con pipeline | ✅ LIVE | ❌ Código only | ❌ SIN ANTHROPIC_API_KEY |
| `ingest-rss` | v9+ | ✅ Concurrency control + deadline | ✅ LIVE | ✅ Código + live | Ninguno |
| `extract-article-content` | - | ✅ Existe | ✅ LIVE | - | - |
| `generate-daily-summary` | NEW | ✅ Añadida | ✅ LIVE | - | Necesita testing |
| `pipeline-health` | v7+ | ✅ Observabilidad | ✅ LIVE | - | - |

**Nota sobre deploy:** Todas las functions en v8+ son **self-contained** (sin imports de `_shared/`), lo que las hace reenviables vía API sin bundling.

---

## ⚠️ BLOQUEADORES CRÍTICOS (por prioridad)

### 🔴 BLOQUEADOR #1: OPENAI_API_KEY no configurada
**Impacto:** Pipeline completamente muerto (0 embeddings en 9.728 artículos)
```
ingest-rss (OK) → embed-articles (SKIPPED, no key) → 0 clusters → 0 stories
```
**Solución:** Agregar `OPENAI_API_KEY` en:
- Supabase Dashboard → Edge Functions → Secrets
- Value: tu key OpenAI (ej: `sk-proj-...`)
- Costo estimado backlog: ~$0.10 (9.728 art × 500 tokens × $0.02/1M)
- Costo recurrente: ~$0.08/mes

**Acción:** [usuario] Copiar la clave de OpenAI API → Supabase Secrets

---

### 🔴 BLOQUEADOR #2: ANTHROPIC_API_KEY no configurada
**Impacto:** Draft stories quedan sin análisis editorial
```
materialize-cluster (crea drafts) → generate-synthesis (SKIPPED, no key) → stories sin contenido
```
**Solución:** Agregar `ANTHROPIC_API_KEY` en Supabase → Edge Functions → Secrets
- Costo recurrente: ~$0.60-1.00/mes (50 stories × 3.200 tokens × Haiku pricing)

**Acción:** [usuario] Copiar la clave de Anthropic API → Supabase Secrets

---

### 🟠 BLOQUEADOR #3: Crons deshabilitados (free tier)
**Impacto:** Sin scheduler → pipeline no corre automáticamente
**Limitación:** Supabase free tier no permite `UPDATE cron.job`
**Workaround:** GitHub Actions workflows ya creados (`.github/workflows/pipeline-*.yml`)

**Solución alternativa (recomendada):**
1. Configurar secrets en GitHub → Settings → Secrets and variables → Actions:
   - `SUPABASE_URL`: tu URL Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: tu service role key
2. Los workflows corren automáticamente cada 5-30 minutos

**Archivos workflow:**
- `.github/workflows/pipeline-ingest.yml` (*/15 min)
- `.github/workflows/pipeline-cluster.yml` (*/10 min, */30 min, */45 min en 3 jobs)
- `.github/workflows/pipeline-synthesize.yml` (*/30 min, synthesis es cara)

**Acción:** [usuario] Agregar secrets en GitHub Actions

---

### 🟡 BLOQUEADOR #4: Migrations de seguridad no aplicadas
**Impacto:** Sin RLS policies, guard de free-tier, y credit balance
**Migraciones faltantes:**
- 026_security_hardening: RLS policies + credit RPCs
- 027_toddy_free_answer_race: Unique index guard (T5)
- 028_review_queue_manager_gate: Manager RLS para review queue
- 030_toddy_schema_complete: ai_credit_balance en toddy_conversations

**Estado en código:** ✅ Todas están en `/migrations/026-031` listas para aplicar

**Acción:** [usuario] Ejecutar manualmente en Supabase SQL editor:
```sql
-- Copiar contenido de migrations/026_security_hardening.sql
-- Copiar contenido de migrations/027_toddy_free_answer_race.sql
-- Copiar contenido de migrations/028_review_queue_manager_gate.sql
-- Copiar contenido de migrations/030_toddy_schema_complete.sql
```

---

## ✅ ARQUITECTURA VERIFICADA

### End-to-End Test (5 jun 2026, sintéticos)
```
6 artículos de prueba
  ↓ [cluster-articles]
2 clusters (cobertura real: 33/67/0 y 67/0/33) ✅
  ↓ [materialize-cluster]
2 draft stories con bias bars pobladas ✅
  ↓ [datos limpiados]
Producción intacta (9.728 raw articles)
```

### Pipeline Architecture
```
INGEST (RSS)           → status='raw'                    [SIN KEY]
   ↓
EMBED (OpenAI 1536)    → status='embedded'               [NECESITA: OPENAI_API_KEY]
   ↓
CLUSTER (Incremental)  → story_clusters (ready/forming)  [SIN KEY]
   ├─ Matching floor: coseno ≥ 0.60
   ├─ Anti-false-merge: title-token Jaccard ≥ 0.08 en banda gris
   └─ Coverage: izq/centro/der real desde source.bias_label
   ↓
MATERIALIZE            → stories (draft, pending_review) [SIN KEY]
   └─ Enlace vía pipeline_cluster_id
   ↓
SYNTHESIZE (Claude)    → editorial analysis (consenso_narrativo, desglose, etc) [NECESITA: ANTHROPIC_API_KEY]
```

### Decisiones de Arquitectura
- **Embedding model:** OpenAI text-embedding-3-small (1536-dim, máxima calidad para clustering)
- **Clustering:** Sofisticado incremental con guardrails contra falsos merges (#7)
- **Coverage:** Derivada en tiempo real desde source.bias_label (LEFT/CENTER-LEFT/CENTER/CENTER-RIGHT/RIGHT)
- **Cron replacement:** GitHub Actions (legitimate, free tier compatible)
- **Schema:** story_clusters como tabla central, pipeline_cluster_id para enlazar a stories

---

## 📋 CHECKLIST DE ACTIVACIÓN (en orden)

### Fase 1: Configuración API (5 min)
- [ ] Obtener `OPENAI_API_KEY` (https://platform.openai.com/api-keys)
- [ ] Obtener `ANTHROPIC_API_KEY` (https://console.anthropic.com/keys)
- [ ] Agregar ambas keys en Supabase → Edge Functions → Secrets
- [ ] Agregar secrets en GitHub → Settings → Secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

### Fase 2: Migrations de Seguridad (15 min)
- [ ] Abrir Supabase SQL Editor
- [ ] Copiar + ejecutar `/migrations/026_security_hardening.sql`
- [ ] Copiar + ejecutar `/migrations/027_toddy_free_answer_race.sql`
- [ ] Copiar + ejecutar `/migrations/028_review_queue_manager_gate.sql`
- [ ] Copiar + ejecutar `/migrations/030_toddy_schema_complete.sql`

### Fase 3: Test End-to-End Real (30-60 min)
- [ ] Monitorear logs de Supabase
- [ ] Ejecutar `embed-articles` (manualmente o esperar GitHub Action)
- [ ] Verificar raw_articles con status='embedded' (esperar 5-10 min)
- [ ] Ejecutar `cluster-articles` (debería crear story_clusters ready)
- [ ] Ejecutar `materialize-cluster` (debería crear draft stories)
- [ ] Ejecutar `generate-synthesis` (debería llenar análisis editorial)

### Fase 4: Verificación & Merge (10 min)
- [ ] Verificar que todas las stories tienen consenso_narrativo poblado
- [ ] Mergear `fix/pipeline-revive` a `main`
- [ ] Push a GitHub

---

## 📈 CAPACIDADES REALES POST-ACTIVACIÓN

| Capacidad | Estado | Notas |
|-----------|--------|-------|
| **Ingesta RSS** | ✅ LIVE | 55 fuentes, 7-10 art/min, bounded concurrency |
| **Embeddings OpenAI** | ✅ (falta key) | 1536-dim, máx calidad, ~$0.08/mes recurrente |
| **Clustering sofisticado** | ✅ LIVE | Incremental + coseno guard + Jaccard guard, coverage real |
| **Materiales draft stories** | ✅ LIVE | Con bias bars + coverage metadata |
| **Síntesis editorial (Claude)** | ✅ (falta key) | Consenso, análisis, blind spots, fact-check, ~$0.80/mes |
| **Manager review queue** | ✅ LIVE | RLS gate a managers (migration 028) |
| **Toddy AI agent** | ✅ LIVE | Credit system, free-tier race guard (migration 027), retry/backoff |
| **Pricing & billing** | ✅ LIVE | Real charge, elite limits, fractional credits |
| **Daily summary** | ✅ NEW | Briefs automáticos (generate-daily-summary) |

---

## 🔧 CÓDIGO CAMBIOS PRINCIPALES EN RAMA

### Security Fixes (en código, no aplicadas en prod)
- **T3 (Injection):** `api/_toddyCore.js` - Hardened system prompt con delimitadores
- **T4 (Infracobro):** `api/_toddyCore.js` - Real charge, not clamped to estimate
- **T5 (Free race):** `migrations/027_toddy_free_answer_race.sql` - Unique partial index
- **T7 (Message):** `api/_toddyCore.js` - 2000 char cap
- **T8 (Web research):** `api/_toddyCore.js` - Elite 20/day limit
- **T10 (Error):** `api/_toddyCore.js` - Generic error messages

### Pipeline Functions
- **embed-articles v11:** OpenAI 1536, self-contained, defensive (no poison rows)
- **cluster-articles v8:** Sofisticado incremental, cosine floor, Jaccard guard, real coverage
- **materialize-cluster v8:** pipeline_cluster_id fix, draft with coverage
- **generate-synthesis v11:** Alineada con story_clusters, reads article_ids vía pipeline_cluster_id

### Migrations (en `/migrations/`, listos para aplicar)
- 026-031: Security, toddy schema, RLS, cron workarounds

---

## 🎯 NEXT STEPS (en prioridad)

1. **[URGENTE]** Agregar OPENAI_API_KEY y ANTHROPIC_API_KEY en Supabase
2. **[URGENTE]** Configurar GitHub Actions secrets
3. **[Importante]** Aplicar migrations 026, 027, 028, 030 (seguridad + toddy)
4. **[Test]** Ejecutar test end-to-end real (monitor logs, verificar stories)
5. **[Deploy]** Mergear fix/pipeline-revive a main y push

**Tiempo total:** ~2 horas para estar en producción full

---

## 📞 SOPORTE

- **Logs Supabase:** Dashboard → Logs → Functions (para troubleshoot)
- **GitHub Actions:** Repo → Actions → pipeline-* (para scheduler status)
- **Schema reference:** `PIPELINE_ARCHITECTURE.md`
- **Security fixes reference:** Commits en rama fix/pipeline-revive (34 + main)
