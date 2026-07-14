# 🔬 Auditoría del motor de generación de noticias — 13 jul 2026

Auditoría en vivo (BD de producción + código desplegado). El scheduler pg_cron
**revivió al reactivar el proyecto** y la máquina está corriendo sola:
ingest cada 15 min · embed cada 1 min · keyword-cluster cada 10 min ·
vector-cluster cada 30 min · materialize cada 45 min · synthesize cada 5 min.

## Estado del embudo (en vivo)

| Etapa | Estado | Números |
|---|---|---|
| Fuentes | ⚠️ mermadas | 107 en catálogo, **55 activas**, 53 con RSS, solo **39 con artículos en 7 días** |
| Ingesta | ✅ corre sola | 14.659 artículos (+4.931 en 48h), dedupe por url_hash OK |
| Extracción de contenido | 🔴 **NO corre** | 14.539 `extraction_status='pending'`; **0 artículos con texto completo** — no hay cron para `extract-article-content` |
| Embeddings | ✅ al día | 11.883 embebidos, backlog **0** (OpenAI 1536-dim) |
| Clustering | ⚠️ funciona, calidad floja | 1.003 clusters (973 en 24h); **avg 2,4 fuentes/cluster**; solo 242 con ≥3 fuentes |
| Título de cluster | 🔴 **78% sin título** | 781/1.003 sin `title` (todos tienen `topic_summary` y keywords) |
| Materialización | ✅ corre | 838 drafts |
| Síntesis IA (OpenAI) | ✅ corre sola | 826/838 redactados por gpt-4o-mini; 828 con array `articles`; cuerpo medio 741 chars |
| Revisión/publicación | ⚠️ manual | 19 publicadas; 838 esperando aprobación |

## Cómo funciona hoy cada pieza

### 1. Fuentes (`sources`)
Catálogo curado con sesgo (5 puntos), factualidad, propiedad, ámbito. La
clasificación por sesgo del cluster se deriva de `bias_label`/`bias` de la
fuente de cada artículo (no la decide la IA → trazable y barata). Problema:
solo 39/55 activas produjeron artículos esta semana; 16 feeds muertos sin
alerta (source_status no los marca porque el parser no falla, simplemente no
trae items nuevos).

### 2. Ingesta (`ingest-rss`)
Lee los RSS con concurrencia acotada y deadline de 50s. Guarda SOLO lo que trae
el feed: titular + excerpt (≤300 chars por decisión legal) + metadatos. La
extracción del cuerpo se delega a `extract-article-content`… que **nunca se
ejecuta** (sin cron). Consecuencia: TODO el análisis IA se hace sobre extractos
de ≤300 caracteres.

### 3. Embeddings (`embed-articles`)
OpenAI `text-embedding-3-small`, lotes de ~96, columna `vector(1536)` verificada.
Al día y sin fallos. Coste ~céntimos.

### 4. Clustering (dos vías en paralelo)
- `cluster-articles` (vectorial, cada 30 min): coseno sobre embeddings con
  banda alta/baja (0.82/0.55) — crea clusters CON título.
- `cluster-by-keywords` (Jaccard de keywords, cada 10 min): greedy anclado a
  semilla, anti-mega-blobs, min 2 artículos + 2 fuentes distintas. **Crea el
  grueso de los clusters pero NO escribe `title`** (guarda el titular del
  primer artículo solo en `topic_summary`). ← origen del "Sin título".
- Ambos calculan cobertura izquierda/centro/derecha real desde el sesgo de las
  fuentes miembro.

### 5. Materialización (`materialize-cluster`)
Cluster `ready` → story `draft` con `title = cluster.title || 'Sin título'`
(**sin fallback a `topic_summary`** ← segundo eslabón del bug), categoría por
reglas regex (inferCategory), ubicación inferida, coverage_%, imagen del primer
artículo con imagen.

### 6. Síntesis IA (`generate-synthesis` v13, OpenAI)
gpt-4o-mini + JSON mode, cada 5 min, lotes de 8. Redacta: summary, cuerpo,
contexto, perspectivas por lado, consenso_narrativo (izq|centro|dcha),
blind_spot, verificación, impactos, preguntas, análisis por artículo. Prompt
con reglas anti-alucinación (solo evidencia, sin cifras inventadas) y guard de
prompt-injection. **No genera título** (tercer eslabón: un draft sin título
sigue sin título tras redactarse). Trabaja solo con extractos de 300 chars →
profundidad limitada.

### 7. Clasificación
- **Sesgo**: derivado del catálogo de fuentes (determinista) ✅
- **Categoría**: regex keywords en materialize + la IA la puede corregir en síntesis ✅
- **Factualidad/consenso/impacto**: los asigna la IA con enums cerrados ⚠️ (razonable, pero con evidencia de 300 chars es superficial)

## 🔴 Cuellos de botella, por impacto

1. **781 drafts "Sin título" (78%)** — triple eslabón: cluster-by-keywords no
   escribe title → materialize no cae a topic_summary → síntesis no genera
   titular. Un feed lleno de "Sin título" es inservible de cara al público.
   **Fix (3 toques + backfill):**
   a) cluster-by-keywords: `title: topicSummary` en el insert.
   b) materialize: `title = c.title || c.topic_summary || 'Sin título'`.
   c) generate-synthesis: pedir `"title"` al LLM y escribirlo cuando el draft
      no tenga titular real.
   d) Backfill SQL de los 781 clusters + 781 drafts existentes desde
      topic_summary (instantáneo).

2. **Extracción de contenido muerta** — sin cuerpo real, la IA redacta desde
   extractos de 300 chars: análisis pobres, cifras_clave casi siempre vacías
   (0 en la muestra), verificación superficial. **Fix:** revisar/desplegar
   `extract-article-content` + cron cada 10-15 min + respetar
   `allow_full_content` del catálogo (legal). Tras esto, la síntesis debería
   preferir `content_excerpt` largo sobre el excerpt RSS.

3. **Clusters delgados (avg 2,4 fuentes)** — con 2 fuentes no hay "comparación
   de cobertura" real ni blindspot fiable. Causas: solo 39 fuentes vivas y
   umbral Jaccard 0.15 con ventana corta. **Fix:** (a) reactivar/reparar feeds
   muertos (16 activas sin producción + 52 desactivadas), (b) job de merge
   que fusione clusters casi-duplicados entre las dos vías, (c) subir el gate
   de publicación (p.ej. solo materializar con ≥3 fuentes) para que revisión
   reciba solo historias comparables.

4. **Dos clustering en paralelo sin coordinación** — vectorial y keywords crean
   clusters independientes del mismo suceso (duplicados en revisión). **Fix:**
   antes de insertar, comprobar solape de article_ids/centroide contra clusters
   de las últimas 48h y fusionar.

5. **Salud de fuentes invisible** — no hay alerta de feed muerto. **Fix:** el
   dashboard MOTOR ya existe; añadir "fuentes sin artículos en 72h" y marcar
   `source_status='stale'`.

## Coste actual (OpenAI, gpt-4o-mini + embeddings small)
826 síntesis + 11.9k embeddings ≈ **<1€**. El motor a plena máquina cuesta
céntimos/día. Subir a gpt-4o solo lo justificaría la calidad tras el fix #2.

## Orden de ejecución recomendado
1) Fix títulos (a+b+c+d) — 1 hora, arregla el 78% del output visible.
2) Extracción de contenido + cron — profundidad real del análisis.
3) Gate ≥3 fuentes + merge de duplicados — calidad de comparación.
4) Salud de fuentes + revivir feeds — más materia prima.
