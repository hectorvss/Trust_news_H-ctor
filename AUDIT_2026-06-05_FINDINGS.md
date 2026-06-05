# Auditoría Completa — 5 de junio 2026

## Estado del Repositorio
- **Rama**: `fix/pipeline-revive`
- **Commits**: 12 de seguridad y bugs (d014f5d → e1df6eb)
- **Migraciones en GitHub**: 029 (reactivar crons) + anteriores 026, 027, 028
- **Código**: ✅ Todos los fixes están en los archivos (`embedBatch` restaurado, error handling, inyección aislada, retry/backoff, etc.)

---

## Estado de Producción (Supabase)

### ✅ BASE DE DATOS — SEGURIDAD CERRADA
| Item | Estado | Detalles |
|------|--------|----------|
| **Migración 026** | ✅ APLICADA | Privilege escalation bloqueada; RPCs de crédito revocados; stripe_events RLS |
| **Migración 027** | ✅ APLICADA | Índice único parcial (1 respuesta libre por user+story) |
| **Migración 028** | ✅ APLICADA | manager_review_queue gateada a managers (is_manager guard) |
| **Migración 029** | ⏳ CREADA, SIN APLICAR | Script SQL escrito; necesita aplicación manual en Supabase Dashboard |

**RLS y funciones**: Verificado que `is_manager()` está activo en manager_review_queue.

---

### 🔴 PIPELINE — COMPLETAMENTE PARADO
| Item | Estado | Problema |
|------|--------|---------|
| **Datos en BD** | ✅ Presentes | 8.899 raw_articles, 55 fuentes activas, 19 stories publicadas |
| **Embeddings** | ❌ **0 en BD** | De 8.899 artículos, **CERO tienen embedding** |
| **Clusters** | ❌ **0 en BD** | No hay clusters (depende de embeddings) |
| **Draft stories** | ❌ **0 en BD** | No hay noticias en borrador (depende de clusters) |
| **Pipeline runs** | ❌ **0 en 48h** | Ninguna ejecución registrada |

**Causa raíz**: Los 6 crons están **DESACTIVADOS**:
- `trust-news-ingest` (*/15) → **INACTIVE** ❌
- `trust-news-embed` (*/1) → **INACTIVE** ❌
- `trust-news-keyword-cluster` (*/10) → **INACTIVE** ❌
- `trust-news-cluster` (*/30) → **INACTIVE** ❌
- `trust-news-materialize` (*/45) → **INACTIVE** ❌
- `trust-news-synthesize` (*/5) → **INACTIVE** ❌

(Solo activo: `trust-news-jobs-retention` para limpieza)

---

### 🔴 SECRETOS — FALTANDO
| Secreto | Status | Impacto |
|---------|--------|--------|
| `OPENAI_API_KEY` | ❌ FALTA | embed-articles no ejecuta; 0 embeddings para siempre |
| `ANTHROPIC_API_KEY` | ❌ FALTA | generate-synthesis bloqueada (requiere Claude API) |

**Ubicación Supabase**: Project Settings → Edge Functions → Secrets

---

### ✅ EDGE FUNCTIONS — DESPLEGADAS
Todas presentes y ACTIVE (v7-v11, probablemente con fixes intendidos aunque versiones no están sincronizadas con commits):

- `ingest-rss` (v7) — parser RSS
- `embed-articles` (v10) — **NECESITA OPENAI_API_KEY**
- `extract-article-content` (v1)
- `cluster-by-keywords` (v5)
- `cluster-articles` (v7) — **NECESITA EMBEDDINGS**
- `materialize-cluster` (v6) — **NECESITA CLUSTERS**
- `generate-synthesis` (v11) — **NECESITA ANTHROPIC_API_KEY**
- `pipeline-health` (v2) — auth gateada a managers (026)
- `orchestrate-pipeline` (v1)
- `analyze-cluster` (v1)

---

## Problemas Detectados

### P1: CRÍTICO — Pipeline muerto por crons desactivados
**Afecta**: Ingesta, embeddings, clustering, síntesis, stories
**Solución**: Aplicar migración 029 en Supabase Dashboard SQL Editor

### P2: CRÍTICO — Secrets de API faltando
**Afecta**: 
- Sin OPENAI_API_KEY → 0 embeddings (es el cuello de botella del pipeline)
- Sin ANTHROPIC_API_KEY → síntesis bloqueada

**Solución**: 
1. Ir a Supabase → Project Settings → Edge Functions → Secrets
2. Añadir:
   ```
   OPENAI_API_KEY = sk-proj-...
   ANTHROPIC_API_KEY = sk-ant-...
   ```

### P3: MENOR — Tablas de cluster redundantes
Hay 4 tablas que compiten:
- `article_clusters` (vieja?)
- `clusters` (vieja?)
- `story_clusters` (actual, en uso)
- `stories_clusters` (vieja?)

**Impacto**: Confusión de schema, posibles inconsistencias. Las funciones usan `story_clusters` (verificado).

**Solución**: Auditar cuál es la viva, DROP las 3 otras. Crear migración 030.

### P4: MENOR — CLAUDE.md desactualizado
Mencionan "dim=384" pero live schema tiene 1536. Menciona ANTHROPIC_API_KEY que falta.

---

## Checklist de Activación

```
[ ] 1. Añadir OPENAI_API_KEY a Supabase Edge Functions → Secrets
[ ] 2. Añadir ANTHROPIC_API_KEY a Supabase Edge Functions → Secrets
[ ] 3. Aplicar migración 029 (reactivar crons) — SQL Editor en Supabase Dashboard
[ ] 4. Verificar que pipeline_runs crece 5 min después (check pipeline-health)
[ ] 5. Crear migración 030 para limpiar tablas de cluster redundantes
[ ] 6. Actualizar CLAUDE.md con estado real
[ ] 7. Hacer PR de fix/pipeline-revive → main
```

---

## Métricas Esperadas post-activación

Dentro de **5 minutos**:
- ✅ ingest-rss ejecuta → 100-200 nuevos raw_articles
- ✅ embed-articles ejecuta → primeros embeddings (1536-dim)

Dentro de **30 minutos**:
- ✅ cluster-articles ejecuta → primeros clusters
- ✅ cluster-by-keywords ejecuta → clusters por palabras clave

Dentro de **2 horas**:
- ✅ materialize-cluster ejecuta → draft stories
- ✅ generate-synthesis ejecuta → análisis de Claude

Esperado: ~200-500 nuevos articles/día → 10-30 clusters/día → 2-5 draft stories/día (con síntesis)

---

## Código en Producción vs Repo

✅ **Código**: Los 12 commits con fixes están en GitHub y probablemente en las versiones v7-v11 de Edge Functions
❌ **Activación**: Sin crons + sin secrets, los fixes nunca se ejecutan

---

## Resumen Ejecutivo

**El pipeline NO está roto de código — está roto de CONFIGURACIÓN.**

- ✅ Seguridad: Cerrada (026, 027, 028 aplicadas)
- ✅ Código: Arreglado (12 commits, fixes de inyección/billing/clustering/timeout/retry)
- ❌ Ops: Parado (crons desactivados, secrets faltando)

**Tiempo para "funcionando"**: 10 minutos (agregar 2 secrets + aplicar 1 migración) + ~2 horas para ver resultados.

---

**Auditoría realizada por**: Claude Code Agent
**Fecha**: 5 de junio 2026, 18:45 UTC
**Rama**: fix/pipeline-revive (e1df6eb)
