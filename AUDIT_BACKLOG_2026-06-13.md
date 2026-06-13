# Backlog Priorizado de Auditoría

Fecha: 2026-06-13  
Ámbito: `ground-news-espana`

Este backlog convierte la auditoría del SaaS en trabajo ejecutable.  
El orden prioriza primero los desajustes de contrato y la duplicación de backend, luego la coherencia del pipeline y por último la UX y la documentación.

## Estado de ejecucion

- 2026-06-13: P0.1 cerrado. Stripe, webhooks, creditos IA y wrappers locales usan `api/_billingCore.js` como fuente unica.
- 2026-06-13: P0.2 parcialmente cerrado. Se documento el contrato canonico en `PIPELINE_CONTRACT_2026-06-13.md` y `fetchPipelineStats()` expone contadores canonicos con alias compatibles.
- 2026-06-13: P1.3 cerrado. `fetchStoryById()` filtra `status='published'` por defecto y la ruta `/story/:id` muestra un estado claro si no hay story publica.
- 2026-06-13: P2.8 parcialmente cerrado. El footer ya no expone Herramientas; la ruta `/tools` queda como compatibilidad directa.
- 2026-06-13: P1.5 cerrado en el helper principal. `approveDraftStory()` solo puede publicar stories `status='draft'` e `is_auto_generated=true`, y el test de contrato lo bloquea.
- 2026-06-13: P1.6 cerrado como contrato operativo. El resumen diario tiene Edge Function, tabla, workflow programado, UI persistida y fallback documentado/testeado.
- 2026-06-13: P2.8 cerrado para producto visible. `/tools` queda como ruta legacy directa, pero no aparece en footer ni navegacion visible.
- 2026-06-13: P3.11 clasificado sin destruccion en `REPO_HYGIENE_NOTES_2026-06-13.md`.
- 2026-06-13: P3.10 cerrado. `README.md` reemplazado por documentacion real del producto.

## P0. Bloqueos de arquitectura

### 1. Unificar la superficie backend de Toddy y Stripe
- **Módulo**: backend / pagos / Toddy
- **Severidad**: P0
- **Problema**: existen dos implementaciones paralelas de la misma lógica:
  - servidor local Express en `server/index.js`
  - rutas API en `api/webhook.js` y `api/toddy-chat.js`
- **Riesgo**: divergencia de comportamiento entre despliegues, bugs que solo aparecen en una ruta, y doble mantenimiento.
- **Evidencia**:
  - `server/index.js`
  - `api/webhook.js`
  - `api/toddy-chat.js`
- **Objetivo de cierre**:
  - dejar una única fuente de verdad para Toddy y webhooks
  - decidir explícitamente si el runtime principal es Vercel API o Express local
  - eliminar código duplicado o dejarlo como wrapper muy fino

### 2. Canonicalizar el contrato pipeline sin doble lectura de columnas
- **Módulo**: pipeline / Supabase
- **Severidad**: P0
- **Problema**: conviven campos antiguos y nuevos:
  - `cluster_id` y `pipeline_cluster_id`
  - `embedded` y `status='embedded'`
  - `pipeline_status` y `extraction_status`
  - `centroid_embedding` y referencias legacy
- **Riesgo**: lecturas ambiguas, fallos silenciosos y análisis incompleto.
- **Evidencia**:
  - `supabase/migrations/023_supabase_first_pipeline.sql`
  - `supabase/migrations/024_editorial_flow_assurance.sql`
  - `supabase/functions/generate-synthesis/index.ts`
  - `src/supabaseService.js`
- **Objetivo de cierre**:
  - fijar un contrato canónico por etapa
  - documentar qué campos son legacy y cuáles son obligatorios
  - evitar que cualquier función escriba en ambos contratos salvo transición explícita

## P1. Consistencia funcional

### 3. Bloquear lectura pública de borradores y reforzar el fetch de story
- **Módulo**: frontend / acceso a datos
- **Severidad**: P1
- **Problema**: `fetchStoryById()` no filtra `published`, mientras que Toddy sí exige story publicada.
- **Riesgo**: exposición de borradores si la política de acceso o RLS no cubre todos los casos.
- **Evidencia**:
  - `src/supabaseService.js`
  - `api/_toddyCore.js`
  - `src/App.jsx`
- **Objetivo de cierre**:
  - asegurar que las rutas de lectura pública solo sirven contenido publicado
  - añadir comprobación homogénea en frontend y backend

### 4. Alinear el dashboard con el contrato actual del pipeline
- **Módulo**: manager / observabilidad
- **Severidad**: P1
- **Problema**: varias métricas aún dependen de combinaciones legacy de estado.
- **Riesgo**: paneles vacíos, contadores incorrectos y diagnósticos engañosos.
- **Evidencia**:
  - `src/supabaseService.js`
  - `src/components/manager/PipelineDashboard.jsx`
  - `supabase/functions/pipeline-health/index.ts`
- **Objetivo de cierre**:
  - hacer coincidir métricas con el esquema canónico
  - mantener una sola lectura de estados por tabla

### 5. Consolidar la revisión editorial de stories y clústers
- **Módulo**: editorial / manager
- **Severidad**: P1
- **Problema**: el flujo `generate-synthesis -> review queue -> approve/reject` ya existe, pero depende de campos muy ricos y muchos fallbacks.
- **Riesgo**: una story puede parecer lista cuando falta evidencia, o quedar bloqueada por validación incompleta.
- **Evidencia**:
  - `supabase/functions/generate-synthesis/index.ts`
  - `src/components/manager/ReviewQueue.jsx`
  - `src/components/manager/DraftReviewPanel.jsx`
- **Objetivo de cierre**:
  - validar que todos los bloques editoriales se generan o se marcan como faltantes
  - mejorar mensajes de fallo para manager

### 6. Cerrar el hueco entre daily summary y pipeline real
- **Módulo**: editorial / resumen diario
- **Severidad**: P1
- **Problema**: el resumen diario existe, pero depende de `daily_briefs` si está disponible y de fallback local si no.
- **Riesgo**: divergencia entre resumen publicado y resumen reconstruido.
- **Evidencia**:
  - `src/components/DailySummary.jsx`
  - `supabase/functions/generate-daily-summary/index.ts`
  - `src/supabaseService.js`
- **Objetivo de cierre**:
  - definir cuándo se usa DB y cuándo fallback
  - asegurar que ambos caminos comparten estructura editorial

## P2. Calidad de UX y producto

### 7. Reducir la dependencia de heurística en discover / local / blindspot
- **Módulo**: UX / exploración
- **Severidad**: P2
- **Problema**: varias vistas dependen de texto libre, localStorage y matching heurístico.
- **Riesgo**: resultados pobres cuando faltan metadatos o cambia el catálogo.
- **Evidencia**:
  - `src/components/Discover.jsx`
  - `src/components/LocalNews.jsx`
  - `src/components/BlindspotFeed.jsx`
- **Objetivo de cierre**:
  - mejorar normalización de ubicaciones, temas y personas
  - reducir falsos positivos de clasificación

### 8. Revisar la navegación pública residual
- **Módulo**: frontend / navegación
- **Severidad**: P2
- **Problema**: el header ya no muestra “Herramientas”, pero la ruta `/tools` y enlaces en footer siguen vivos.
- **Riesgo**: experiencia inconsistente y secciones que parecen retiradas pero siguen accesibles.
- **Evidencia**:
  - `src/App.jsx`
  - `src/components/Footer.jsx`
  - `src/components/layout/Navbar.jsx`
- **Objetivo de cierre**:
  - decidir si `/tools` se mantiene como landing o se retira del producto visible
  - alinear header, footer y rutas

### 9. Reforzar StoryDetail y Account para cambios de esquema
- **Módulo**: frontend / pantallas críticas
- **Severidad**: P2
- **Problema**: son pantallas muy densas y muy dependientes de metadatos editoriales.
- **Riesgo**: regresiones visuales o paneles vacíos cuando cambie el contrato.
- **Evidencia**:
  - `src/components/StoryDetail.jsx`
  - `src/components/Account.jsx`
- **Objetivo de cierre**:
  - cubrir con tests de render y datos parciales
  - verificar estados vacíos y errores

## P3. Deuda técnica y documentación

### 10. Sustituir documentación template por documentación real del producto
- **Módulo**: docs
- **Severidad**: P3
- **Problema**: `README.md` sigue siendo el template de Vite.
- **Riesgo**: nueva gente entra con documentación incorrecta o incompleta.
- **Evidencia**:
  - `README.md`
  - `PIPELINE_ARCHITECTURE.md`
- **Objetivo de cierre**:
  - explicar arquitectura real, contratos, flujos y variables de entorno
  - eliminar texto legado que ya no representa el sistema

### 11. Limpiar artefactos sueltos y archivos de seed/mocks
- **Módulo**: repo hygiene
- **Severidad**: P3
- **Problema**: hay archivos no integrados al producto que contaminan el estado del worktree.
- **Riesgo**: confusión sobre qué está en producción y qué es experimental.
- **Evidencia**:
  - `.claude/`
  - `.figma_audit/`
  - `check_schema.js`
  - `final_seed.js`
  - `list.js`
  - `old_story_detail.jsx`
  - `seed.js`
  - `src/mockData.js`
- **Objetivo de cierre**:
  - clasificar cada archivo como útil, temporal o descartable
  - eliminar o mover lo que no pertenezca al producto

## Orden recomendado de ejecución

1. Unificar backend Toddy / Stripe.
2. Canonicalizar contrato pipeline.
3. Bloquear lectura de borradores y alinear fetches.
4. Alinear observabilidad y revisión editorial.
5. Cerrar daily summary y vistas de exploración.
6. Mejorar UX y limpiar documentación.

## Criterio de terminado

Cada ítem queda cerrado cuando:
- se eliminan los contratos ambiguos o se documenta explícitamente el legacy
- el cambio tiene test o verificación asociada
- manager y frontend leen los mismos campos que escribe el pipeline
- no queda una segunda ruta silenciosa que pueda reintroducir la divergencia
