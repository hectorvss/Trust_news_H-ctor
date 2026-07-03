# ⏳ SUPABASE — Acciones pendientes (aplicar cuando el proyecto esté ACTIVO)

**Proyecto:** Trust News España · ref `xwkqtugupzpdnnvxrkyu` · región eu-west-3
**Estado actual:** `INACTIVE` (pausado por inactividad del plan free)

> El código del frontend ya está desplegado y listo. Estas acciones son las que
> quedan **del lado de Supabase / infraestructura** para que todo funcione en vivo.
> Nada de esto se puede automatizar mientras el proyecto esté pausado.

---

## 0. Reactivar el proyecto (PRIMERO)
- Dashboard de Supabase → proyecto "Trust News España" → **Restore / Resume**.
- Sin esto: DB apagada, Edge Functions caídas, feed vacío, sin ingesta.

---

## 1. Aplicar migración 034 — Bias reading tracking  🔴 CRÍTICO para "Mi Sesgo"
- **Archivo:** `migrations/034_bias_reading_tracking.sql`
- **Cómo:** SQL Editor de Supabase → pegar el contenido completo → Run.
- **Qué crea (idempotente):**
  - Tabla `bias_logs` + RLS por usuario/sesión
  - RPC `log_bias_read` (SECURITY DEFINER)
  - **`grant execute` del RPC a anon/authenticated** ← esto faltaba; sin ello el navegador NO puede escribir logs de sesgo
  - CHECK `bias_category in ('LEFT','CENTER','RIGHT')` + índice por fecha
- **Sin esto:** el módulo "Mi Sesgo" no registra nada → todo sale "SIN DATOS".

---

## 2. Secrets de Edge Functions (Supabase → Project Settings → Edge Functions → Secrets)
- 🔴 `ANTHROPIC_API_KEY = sk-ant-...` → desbloquea `generate-synthesis`.
  Sin ella, las ~330 stories draft se quedan sin análisis IA y la cola de
  revisión no deja publicarlas (validación exige `consensus_narrative`).
- 🟡 `OPENAI_API_KEY = sk-proj-...` → solo si se vuelve a embeddings OpenAI.
  Actualmente los embeddings usan dim=384 (modelo alternativo).

---

## 3. Secrets de GitHub Actions (repo → Settings → Secrets and variables → Actions)
Son el "reloj" que dispara el pipeline (reemplazan los cron de Supabase, que el
plan free no ejecuta de forma fiable). Workflows en `.github/workflows/pipeline-*.yml`.
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- **Sin esto:** los workflows corren pero fallan → 0 contenido nuevo.

---

## 4. Evitar que se vuelva a pausar  🟡 recomendado
- Plan free se pausa tras ~7 días sin actividad → se para TODO el pipeline.
- Opciones:
  - **Supabase Pro** (~25 $/mes): no se pausa.
  - **Keep-alive**: workflow de GitHub Actions con un ping diario a la DB
    (pendiente de crear si se decide esta vía — barato y gratis).

---

## 5. Verificar migraciones previas tras reactivar
Según `MIGRATIONS_APPLIED_20260608.md` estaban aplicadas 026/027/028/030
(seguridad + esquema Toddy). Confirmar que siguen presentes tras el resume:
```sql
select * from pg_indexes where indexname = 'uq_toddy_free_answer_per_story';
select * from information_schema.tables where table_name in ('toddy_conversations','toddy_messages');
select * from pg_proc where proname = 'log_bias_read';   -- debe existir tras migración 034
```

---

## 6. Acción de producto (no infra): publicar drafts
- Tras configurar `ANTHROPIC_API_KEY` y que corra `generate-synthesis`, las 330
  stories draft pasan a "LISTA REVISIÓN" en Manager Studio → aprobar/publicar.

---

### Checklist rápido
- [ ] Reactivar proyecto Supabase
- [ ] Ejecutar `migrations/034_bias_reading_tracking.sql`
- [ ] `ANTHROPIC_API_KEY` en Supabase Secrets
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` en GitHub Secrets
- [ ] (opc) plan Pro o keep-alive para no volver a pausar
- [ ] Verificar migraciones previas 026/027/028/030
- [ ] Publicar drafts desde Manager Studio
