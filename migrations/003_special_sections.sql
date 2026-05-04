-- ==========================================
-- SPECIAL SECTIONS TABLE
-- Tabla para los bloques editoriales de la portada
-- (Israel-Gaza, European Politics, etc.)
-- Ejecuta este SQL en el Editor SQL de Supabase
-- ==========================================

-- 1. CREAR TABLA
CREATE TABLE IF NOT EXISTS public.special_sections (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label       text NOT NULL DEFAULT '',       -- Ej: "ESPECIAL:"
  title       text NOT NULL DEFAULT '',       -- Ej: "Israel-Gaza"
  btn1        text DEFAULT 'VER NOTICIA →',
  btn2        text DEFAULT 'OCULTAR',
  trend       text DEFAULT '',               -- Ej: "TEMA EN TENDENCIA GLOBAL"
  sort_order  integer DEFAULT 0,
  -- Tarjeta principal (noticia grande izquierda)
  main        jsonb DEFAULT '{}'::jsonb,     -- { label, title, desc, legendLeft, legendRight, barType, story_id }
  -- Tarjetas laterales (pequeñas derecha, max 3)
  sides       jsonb DEFAULT '[]'::jsonb,     -- [{ label, title, meta, story_id }, ...]
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now()
);

-- 2. ÍNDICE PARA ORDENADO
CREATE INDEX IF NOT EXISTS idx_special_sections_order ON public.special_sections(sort_order);

-- 3. RLS (solo managers pueden escribir, todos pueden leer)
ALTER TABLE public.special_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read special sections" ON public.special_sections;
CREATE POLICY "Public read special sections" ON public.special_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manager write special sections" ON public.special_sections;
CREATE POLICY "Manager write special sections" ON public.special_sections
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('manager', 'admin_editor')
    )
  );

-- 4. TRIGGER para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_special_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_special_sections_updated_at ON public.special_sections;
CREATE TRIGGER trg_special_sections_updated_at
  BEFORE UPDATE ON public.special_sections
  FOR EACH ROW EXECUTE FUNCTION update_special_sections_updated_at();


-- ==========================================
-- 5. SEED INICIAL — Los 4 bloques de ejemplo
-- (Vincula los story_id a tus noticias reales de Supabase)
-- ==========================================

INSERT INTO public.special_sections (label, title, btn1, btn2, trend, sort_order, main, sides)
VALUES (
  'ESPECIAL:', 'Israel-Gaza',
  'VER ANÁLISIS →', 'OCULTAR ESTO',
  'TEMA EN TENDENCIA GLOBAL', 1,
  '{
    "label": "NOTICIA DESTACADA — HACE 4H",
    "title": "Nuevas negociaciones en El Cairo buscan una tregua humanitaria en Gaza",
    "desc": "Delegaciones de Israel y Hamás se reúnen con mediadores egipcios para discutir un posible intercambio de rehenes y una pausa prolongada en las hostilidades.",
    "legendLeft": "COBERTURA: 124 FUENTES",
    "legendRight": "VER ANÁLISIS ↗",
    "barType": "grayscale",
    "story_id": "tregua-gaza-2024"
  }'::jsonb,
  '[
    {"label": "POLÍTICA EXTERIOR", "title": "Ayuda humanitaria llega al puerto flotante construido por EE.UU.", "meta": "COBERTURA CENTRISTA", "story_id": "tregua-gaza-2024"},
    {"label": "CONFLICTO NORTE",   "title": "Aumenta la tensión en la frontera norte: intercambio de fuego con Hezbolá.", "meta": "PUNTO CIEGO DE DERECHA", "story_id": "reforma-mordaza-2024"},
    {"label": "SOCIEDAD CIVIL",    "title": "Protestas masivas en Tel Aviv exigen la convocatoria de elecciones anticipadas.", "meta": "PUNTO CIEGO DE IZQUIERDA", "story_id": "regularizacion-2024"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO public.special_sections (label, title, btn1, btn2, trend, sort_order, main, sides)
VALUES (
  'EUROPEAN', 'POLITICS',
  'MÁS DE EUROPA', 'MENOS DE EUROPA',
  'ELECCIONES JUNIO 2024', 2,
  '{
    "label": "U.E. — NOTICIA CENTRAL",
    "title": "Macron advierte que Europa \"puede morir\" si no se reestructura militarmente",
    "desc": "El presidente francés hace un llamamiento a la autonomía estratégica europea ante la incertidumbre del apoyo estadounidense y el ascenso de potencias rivales.",
    "legendLeft": "COBERTURA: 88 FUENTES",
    "legendRight": "VER PERSPECTIVAS ↗",
    "barType": "grayscale",
    "story_id": "pekin-ev-2024"
  }'::jsonb,
  '[
    {"label": "ALEMANIA",  "title": "Berlín aprueba el paquete de defensa más grande desde la Guerra Fría.", "meta": "COBERTURA CENTRISTA", "story_id": "economia-fmi-2024"},
    {"label": "POLONIA",   "title": "Tusk lidera el desbloqueo de fondos europeos tras reformas judiciales.", "meta": "NOTICIA DESTACADA", "story_id": "reforma-mordaza-2024"},
    {"label": "HUNGRÍA",   "title": "Orbán critica la centralización de Bruselas en vísperas de las elecciones.", "meta": "SESGO DE DERECHA", "story_id": "regularizacion-2024"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO public.special_sections (label, title, btn1, btn2, trend, sort_order, main, sides)
VALUES (
  'U.S.', 'ELECTIONS',
  'MÁS DE EE.UU.', 'MENOS DE EE.UU.',
  'RUMBO A NOVIEMBRE 2024', 3,
  '{
    "label": "DEBATE PRESIDENCIAL — ANÁLISIS",
    "title": "Trump y Biden empatados en los estados clave según los últimos sondeos",
    "desc": "La economía y la política migratoria se consolidan como los dos ejes principales que decidirán el voto en Pensilvania, Michigan y Wisconsin.",
    "legendLeft": "SESGO: BIPARTIDISTA ESTATAL",
    "legendRight": "245 FUENTES ANALIZADAS",
    "barType": "bipartisan",
    "story_id": "pekin-ev-2024"
  }'::jsonb,
  '[
    {"label": "CORTE SUPREMA", "title": "Fallo histórico sobre la inmunidad presidencial genera debate jurídico.", "meta": "COBERTURA LEGAL", "story_id": "reforma-mordaza-2024"},
    {"label": "ECONOMÍA",      "title": "La inflación en EE.UU. cae más de lo esperado: ¿respiro para Biden?", "meta": "ANÁLISIS FINANCIERO", "story_id": "economia-fmi-2024"},
    {"label": "CAMPAÑA RNC",   "title": "Trump consolida su apoyo entre los votantes latinos en Florida.", "meta": "PUNTO CIEGO DE IZQUIERDA", "story_id": "regularizacion-2024"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO public.special_sections (label, title, btn1, btn2, trend, sort_order, main, sides)
VALUES (
  'CLIMATE', 'CRISIS',
  'MÁS CLIMA', 'MENOS CLIMA',
  'EMERGENCIA GLOBAL', 4,
  '{
    "label": "INFORME IPCC — CIENCIA",
    "title": "Abril rompe récords como el mes más caluroso de la historia mundial",
    "desc": "Los niveles de CO2 en la atmósfera alcanzan un nuevo máximo, acelerando el deshielo en los polos y la frecuencia de eventos climáticos extremos.",
    "legendLeft": "ALTO CONSENSO CIENTÍFICO",
    "legendRight": "512 ESTUDIOS REVISADOS",
    "barType": "grayscale",
    "story_id": "sequia-sur-2024"
  }'::jsonb,
  '[
    {"label": "OCEANOGRAFÍA", "title": "Blanqueamiento masivo del coral en la Gran Barrera: alerta roja.", "meta": "COBERTURA AMBIENTAL", "story_id": "sequia-sur-2024"},
    {"label": "RENOVABLES",   "title": "La energía solar supera al carbón en la red eléctrica de EE.UU.", "meta": "PUNTO CIEGO DE DERECHA", "story_id": "hidrogeno-verde-2024"},
    {"label": "LEGISLACIÓN",  "title": "Nuevas tasas al carbono: el debate sobre el impacto en los precios.", "meta": "PERSPECTIVA ECONÓMICA", "story_id": "economia-fmi-2024"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ==========================================
-- VERIFICACIÓN: Ver lo que quedó
-- ==========================================
SELECT id, label, title, sort_order, main->>'story_id' AS main_story
FROM public.special_sections
ORDER BY sort_order;
