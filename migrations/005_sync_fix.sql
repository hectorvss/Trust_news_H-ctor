-- 0. PROFILES TABLE: Ensure role column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'reader';

-- 1. STORIES TABLE: Add missing columns used by the frontend
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS analytical_snippet text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS contexto text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS desglose jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cifras_clave jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS verificacion_info text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS origen_info jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS medios_analizados jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS documentos_info jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS protagonistas_info jsonb DEFAULT '{"beneficiados": "", "afectados": ""}'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS preguntas_info jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS consensus text DEFAULT 'MEDIO';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS impact text DEFAULT 'ALTO';

-- 2. STORIES TABLE: Set default for id (auto-generate UUID if not provided)
ALTER TABLE public.stories ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 3. STORIES TABLE: Convert impacto columns from text to jsonb
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stories' AND column_name='impacto_social' AND data_type='text') THEN
    ALTER TABLE public.stories ALTER COLUMN impacto_social TYPE jsonb USING 
      CASE 
        WHEN impacto_social IS NULL THEN '[]'::jsonb
        WHEN impacto_social LIKE '[%' THEN impacto_social::jsonb
        ELSE jsonb_build_array(impacto_social)
      END;
    ALTER TABLE public.stories ALTER COLUMN impacto_social SET DEFAULT '[]'::jsonb;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stories' AND column_name='impacto_sistemico' AND data_type='text') THEN
    ALTER TABLE public.stories ALTER COLUMN impacto_sistemico TYPE jsonb USING 
      CASE 
        WHEN impacto_sistemico IS NULL THEN '[]'::jsonb
        WHEN impacto_sistemico LIKE '[%' THEN impacto_sistemico::jsonb
        ELSE jsonb_build_array(impacto_sistemico)
      END;
    ALTER TABLE public.stories ALTER COLUMN impacto_sistemico SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 4. APP_CONFIG: Add blind_spots column
ALTER TABLE public.app_config ADD COLUMN IF NOT EXISTS blind_spots jsonb DEFAULT '[]'::jsonb;

-- 5. READING_HISTORY: Add unique constraint for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reading_history_user_story_unique'
  ) THEN
    ALTER TABLE public.reading_history ADD CONSTRAINT reading_history_user_story_unique UNIQUE (user_id, story_id);
  END IF;
END $$;

-- 6. FIX RLS POLICIES FOR FAVORITES (split into explicit per-operation policies)
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favorites" ON public.favorites FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 7. FIX RLS FOR READING_HISTORY (same split)
DROP POLICY IF EXISTS "Users manage own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can view own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can insert own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can delete own history" ON public.reading_history;

CREATE POLICY "Users can view own history" ON public.reading_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.reading_history FOR DELETE USING (auth.uid() = user_id);

-- 8. MANAGER CAN UPDATE APP_CONFIG
DROP POLICY IF EXISTS "Managers update app_config" ON public.app_config;
CREATE POLICY "Managers update app_config" ON public.app_config FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin_editor'))
);

DROP POLICY IF EXISTS "Managers insert app_config" ON public.app_config;
CREATE POLICY "Managers insert app_config" ON public.app_config FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin_editor'))
);

-- 9. UPDATE SEED with blind_spots
UPDATE public.app_config SET 
  blind_spots = '[{"type": "LEFT", "text": "El aumento de los costes sanitarios en las zonas rurales suele ser ignorado por los medios de comunicación progresistas."}, {"type": "RIGHT", "text": "Los indicadores económicos positivos de las reformas laborales no suelen aparecer en los medios conservadores."}]'::jsonb
WHERE id = 'global_sidebar' AND (blind_spots IS NULL OR blind_spots = '[]'::jsonb);
