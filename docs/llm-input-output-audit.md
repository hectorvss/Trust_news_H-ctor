# Auditoria LLM: Input, Output Y Calidad Editorial

Fecha: 2026-06-03

## Resumen Ejecutivo

El sistema ya envia al LLM una base razonable para redactar una story: articulos agrupados, fuente, sesgo, URL, fecha, titulo, excerpt, texto extraido y senales estructuradas. Con las mejoras recientes tambien llegan `extraction_quality_score`, `paywall_detected`, `blocked_reason`, `event_signature` y `entity_fingerprint`.

La arquitectura, sin embargo, todavia no es optima para un producto editorial de alta confianza. El input llega como bloques de texto libre y JSON embebido truncado; la salida se exige por prompt, pero no por un contrato de schema con reparacion/reintento; y el modelo debe hacer demasiadas tareas a la vez: seleccionar evidencia, evaluar calidad, comparar ideologias, detectar consenso, redactar todos los apartados y devolver JSON perfecto.

Conclusion: el sistema puede funcionar, pero se puede mejorar bastante. La mejora mas importante no es "un prompt mas largo", sino separar el proceso en etapas verificables: paquete de evidencia normalizado, analisis estructurado, redaccion final y validacion/repair.

## Ruta LLM Actual

### Embeddings

Archivo: `supabase/functions/_shared/llm.ts`

Entrada actual:

- `title`
- `excerpt`

Funcion:

- `buildEmbeddingInput(title, excerpt)`
- Modelo configurable por `OPENAI_EMBEDDING_MODEL`, default `text-embedding-3-small`

Evaluacion:

- Es barato y estable.
- Es insuficiente para noticias con titulares ambiguos o RSS pobres.
- Ignora `resolved_title`, `lead`, texto extraido, entidades y firma de evento.

Mejora recomendada:

- Construir embeddings con un input editorial compacto:
  - titulo real
  - entradilla
  - excerpt RSS
  - primeras frases del texto extraido
  - entidades principales
  - cifras/documentos si existen
- Mantener limite corto, pero mas informativo que titulo + excerpt.

### Sintesis Editorial

Archivos:

- `supabase/functions/generate-synthesis/index.ts`
- `supabase/functions/_shared/llm.ts`

Input actual por articulo:

- fuente y sesgo normalizado
- URL
- autor
- fecha
- titulo
- excerpt
- texto extraido truncado a 1800 caracteres
- senales estructuradas truncadas a 1800 caracteres

Senales disponibles:

- `claims`
- `figures`
- `documents`
- `quotes`
- `entities`
- `tone`
- `tags`
- `images`
- `outbound_links`
- `extraction_quality_score`
- `parser_used`
- `content_source`
- `paywall_detected`
- `blocked_reason`
- `event_signature`
- `entity_fingerprint`

Output esperado:

- `category`
- `title`
- `summary`
- `full_content`
- `analytical_snippet`
- `desglose`
- `contexto`
- `consenso_narrativo`
- `blind_spot`
- `perspectivas_info`
- `impacto_social`
- `impacto_sistemico`
- `cifras_clave`
- `verificacion_info`
- `origen_info`
- `documentos_info`
- `protagonistas_info`
- `preguntas_info`
- `factuality`
- `consensus`
- `impact`
- `articles`

## Lo Que Esta Bien

1. El sistema ya manda evidencia multifuente, no solo un resumen previo.
2. El prompt obliga a no inventar cifras/citas/documentos.
3. El output cubre casi todos los campos reales de `StoryDetail`.
4. El sistema bloquea publicacion si la validacion editorial minima falla.
5. La sintesis no corre si no hay suficientes fuentes distintas.
6. La calidad de extraccion ya llega al LLM, lo que permite ponderar evidencia.
7. `review_status = analysis_failed` evita que una story incompleta parezca lista.

## Riesgos Actuales

### P0 - Contrato De Salida Debil

El JSON se exige por prompt y luego se extrae con regex. Si el modelo devuelve JSON parcialmente invalido, campos con tipos incorrectos o claves incompletas, el sistema solo lo detecta parcialmente.

Impacto:

- stories marcadas como `analysis_failed` aunque podrian repararse
- perdida de tiempo/coste por respuestas casi correctas
- riesgo de campos ambiguos o arrays mal formados

Mejora:

- Definir un schema formal del output.
- Validar tipos, arrays minimos y enums.
- Si falla, hacer un segundo intento de repair con el error exacto.
- Guardar `llm_raw_response`, `llm_validation_errors` y `llm_attempts` en metadata.

### P0 - Tareas Demasiado Mezcladas En Una Sola Llamada

Ahora el LLM debe analizar evidencia, comparar sesgos y redactar toda la noticia en una llamada.

Impacto:

- menor precision en claims y cifras
- salida menos estable
- mas probabilidad de narrativa bonita pero poco trazable

Mejora:

Separar en dos o tres etapas:

1. `analyze-evidence`: hechos, claims, cifras, citas, documentos, actores, desacuerdos.
2. `compare-coverage`: diferencias por fuente/sesgo, consenso, blind spots.
3. `write-story`: redaccion final usando solo el analisis estructurado.

### P1 - Input No Priorizado Por Calidad

Aunque se envia `extraction_quality_score`, todos los articulos entran en el prompt con formato parecido.

Impacto:

- un articulo con paywall o texto pobre puede pesar demasiado
- un articulo de agencia puede duplicar narrativa sin aportar angulo
- fuentes con baja calidad pueden contaminar el consenso

Mejora:

Ordenar y etiquetar articulos antes del prompt:

- `primary_evidence`: buena extraccion y fuente fiable
- `secondary_evidence`: texto parcial o fuente repetitiva
- `weak_evidence`: paywall, bloqueo, bajo score
- `agency_or_duplicate`: agencia o re-publicacion probable

### P1 - Falta Fuente De Verdad Por Dato

El prompt pide no inventar cifras, pero no obliga a que cada cifra/cita/documento tenga `article_id`, `source`, `url` y contexto exacto.

Impacto:

- dificil auditar por que aparece una cifra
- manager no puede verificar rapido
- riesgo de atribucion imprecisa

Mejora:

Enviar evidencia con IDs estables y exigir output con referencias:

```json
{
  "cifras_clave": [
    {
      "label": "impacto presupuestario",
      "value": "1.200 millones de euros",
      "source_article_id": "uuid",
      "source": "El Pais",
      "url": "https://...",
      "confidence": "high"
    }
  ]
}
```

### P1 - Sesgo Ideologico Demasiado Dependiente De La Fuente

El LLM recibe el sesgo del medio, pero no recibe suficiente informacion sobre:

- confianza del sesgo
- ownership
- fact-check score
- tipo de medio
- si el texto es opinion/agencia/noticia

Impacto:

- puede atribuir ideologia al medio en vez de al articulo concreto
- puede exagerar diferencias politicas donde solo hay diferencia de foco

Mejora:

Mandar `source_profile` por fuente:

- `political_bias_bucket`
- `bias_confidence`
- `fact_check_score`
- `ownership`
- `media_type`
- `source_scope`
- `article_type`

Y pedir dos analisis separados:

- sesgo estructural de fuente
- framing concreto del articulo

### P1 - Max Tokens De Salida Probablemente Corto

`max_tokens` esta en 3000 para generar muchos apartados. Para una story completa con `full_content`, arrays, articulos y analisis, puede quedar justo.

Impacto:

- JSON truncado
- articulos incompletos
- `full_content` superficial
- campos rellenados con frases genericas

Mejora:

- Subir `max_tokens` para sintesis completa.
- O separar analisis y redaccion para que cada llamada tenga salida mas corta y verificable.

### P2 - Truncado Uniforme Por Articulo

Cada articulo se corta a 1800 caracteres de texto y 1800 de senales. Esto es simple, pero no necesariamente optimo.

Impacto:

- se pierden citas/cifras al final
- entradillas largas desplazan evidencia importante
- fuentes con texto pobre ocupan espacio innecesario

Mejora:

Construir un `evidence_pack`:

- headline
- lead
- top 8 hechos
- top cifras
- top citas
- documentos
- claims en disputa
- entidades
- resumen extractivo por articulo

El texto completo puede quedar disponible para auditoria, pero no entrar entero al prompt salvo necesidad.

### P2 - Internacionalizacion No Reflejada En El Prompt

El sistema esta preparado para `country`, `language`, `region`, pero el prompt sigue especializado en panorama espanol.

Impacto:

- cuando se activen fuentes internacionales, el modelo puede interpretar mal sesgos locales
- izquierda/derecha no significa lo mismo en todos los paises

Mejora:

Hacer prompt por ambito:

- `country_context`
- `political_axis`
- `language`
- `translation_status`
- `source_scope`

## Input Optimo Propuesto

En vez de un bloque de texto libre por articulo, mandar un objeto estructurado:

```json
{
  "cluster": {
    "id": "uuid",
    "title": "titulo provisional",
    "event_signature": "firma",
    "topic_keywords": ["..."],
    "coverage": {
      "left": 0.33,
      "center": 0.34,
      "right": 0.33
    }
  },
  "editorial_policy": {
    "do_not_publish": true,
    "require_human_review": true,
    "no_unsourced_figures": true,
    "no_long_quotes": true
  },
  "articles": [
    {
      "article_id": "uuid",
      "source": {
        "name": "El Pais",
        "bias": "centroizquierda",
        "bias_confidence": 0.8,
        "fact_check_score": 0.9,
        "ownership": "Grupo Prisa",
        "scope": "national"
      },
      "metadata": {
        "url": "https://...",
        "title": "...",
        "author": "...",
        "published_at": "...",
        "section": "Politica",
        "article_type": "NEWS"
      },
      "quality": {
        "extraction_quality_score": 0.82,
        "parser_used": "elpais_rules",
        "content_source": "source_rule",
        "paywall_detected": false,
        "blocked_reason": null
      },
      "evidence": {
        "lead": "...",
        "facts": ["..."],
        "claims": ["..."],
        "figures": ["..."],
        "quotes": ["..."],
        "documents": ["..."],
        "entities": ["..."]
      }
    }
  ]
}
```

## Output Optimo Propuesto

El output deberia mantener los campos de `StoryDetail`, pero anadir trazabilidad:

```json
{
  "title": "...",
  "summary": "...",
  "full_content": "...",
  "evidence_quality": {
    "overall": "high|medium|low",
    "why": "...",
    "weak_sources": ["article_id"],
    "missing_evidence": ["..."]
  },
  "claims_matrix": [
    {
      "claim": "...",
      "status": "verified|disputed|single_source|unclear",
      "supporting_articles": ["uuid"],
      "opposing_articles": ["uuid"]
    }
  ],
  "cifras_clave": [
    {
      "label": "...",
      "value": "...",
      "source_article_id": "uuid",
      "source": "...",
      "url": "...",
      "confidence": "high|medium|low"
    }
  ],
  "articles": [
    {
      "article_id": "uuid",
      "source": "...",
      "url": "...",
      "bias": "...",
      "angle": "...",
      "tone": "...",
      "diff": "...",
      "whyOpened": "..."
    }
  ]
}
```

## Plan De Mejora Recomendado

### Fase 1 - Sin Cambiar Modelo

1. Crear `buildEvidencePack(cluster, articles, sourcesMap)`.
2. Ordenar articulos por calidad, diversidad ideologica y novedad.
3. Exigir referencias por `article_id` en cifras, citas y documentos.
4. Guardar errores de validacion completos.
5. Anadir retry de JSON repair cuando falle el schema.

### Fase 2 - Separar Analisis Y Redaccion

1. `analyze-evidence`: produce matriz de hechos/claims/cifras.
2. `compare-coverage`: produce consenso, diferencias, blind spot.
3. `write-story`: redacta campos de Trust News usando solo outputs anteriores.

### Fase 3 - Evaluacion Continua

1. Crear fixtures de clusters con 5 articulos de sesgos distintos.
2. Medir:
   - JSON valido
   - campos completos
   - cifras con fuente
   - claims sin invencion
   - articulos con angulo diferenciado
3. Guardar score editorial por corrida en `pipeline_runs`.

## Veredicto

El resultado esperado actual es funcional, pero no es el optimo. Esta bien para un primer motor editorial revisado por manager, pero para "funcionar a la perfeccion" necesita un contrato mas estructurado y trazable.

Prioridad maxima:

1. Schema y repair de JSON.
2. Evidence pack estructurado.
3. Referencias por `article_id` para cada cifra/claim/documento.
4. Separar analisis de redaccion.
5. Subir o repartir presupuesto de salida para evitar respuestas superficiales o truncadas.
