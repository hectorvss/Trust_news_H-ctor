-- ==========================================================
-- SEED MAESTRO: Noticias de Alta Fidelidad para TNE
-- Este script prepara la tabla e inserta la noticia más completa posible
-- ==========================================================

-- 1. ASEGURAR COLUMNAS FALTANTES (Safety first)
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS articles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS perspectives jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cronologia_info jsonb DEFAULT '[]'::jsonb;

-- 2. LIMPIAR DATOS ANTERIORES PARA EVITAR DUPLICADOS
DELETE FROM public.stories;

-- 3. INSERTAR NOTICIA MAESTRA (LEY DE VIVIENDA)
INSERT INTO public.stories (
    id,
    category, 
    title, 
    summary, 
    time_label, 
    location, 
    source_count, 
    bias, 
    factuality, 
    image_url, 
    full_content, 
    analytical_snippet, 
    consenso_narrativo, 
    cifras_clave, 
    verificacion_info, 
    origen_info, 
    medios_analizados, 
    documentos_info, 
    fact_check, 
    blind_spot, 
    protagonistas_info, 
    preguntas_info, 
    status,
    articles,
    perspectivas_info,
    cronologia_info,
    impacto_social,
    impacto_sistemico,
    contexto
) VALUES (
    gen_random_uuid(),
    'POLÍTICA', 
    'El Gobierno de España aprueba una nueva ley de vivienda para limitar alquileres',
    'Se ha aprobado un marco regulatorio para las zonas tensionadas en las principales ciudades españolas, buscando frenar la escalada de precios mediante un índice de referencia y topes del 3% anual.',
    'hace 2 horas',
    'Madrid, España',
    42,
    '{"left": 45, "center": 30, "right": 25}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=800',
    'La nueva regulación inmobiliaria marca un hito en la política social del Gobierno. Los puntos clave incluyen el control de precios en zonas tensionadas, la declaración de nuevos límites para grandes tenedores y un paquete de incentivos fiscales para propietarios que acepten rebajas en las rentas actuales.',
    'Unanimidad total sobre la gravedad del problema de acceso, pero división irreconciliable sobre si el control de precios es la medicina o el veneno para el mercado.',
    'Justicia social y blindaje del derecho al hogar | Análisis de la estabilidad del mercado y el impacto en la inflación general. | Inseguridad jurídica y riesgo de parálisis',
    '[
        {"label": "Límite de subida", "value": "3.0% anual"}, 
        {"label": "Contratos afectados", "value": "2,400,000"},
        {"label": "Vigencia", "value": "2024-2027"},
        {"label": "Incentivo fiscal", "value": "Hasta 90%"}
    ]'::jsonb,
    'Los datos han sido extraídos directamente del RD-Ley publicado en el BOE y confirmados por el Ministerio de Vivienda y Agenda Urbana.',
    '["Agencia EFE", "Reuters", "Europa Press", "Gabinete Ministerial"]'::jsonb,
    '["EL PAÍS", "ABC", "EL MUNDO", "RTVE", "LA VANGUARDIA", "ELDIARIO.ES"]'::jsonb,
    '[{"name": "RD-LEY 12/2024.PDF", "size": "1.2MB"}, {"name": "RESUMEN_EJECUTIVO.PDF", "size": "450KB"}]'::jsonb,
    '- Congelación de precios en zonas declaradas de mercado tensionado.\n- Prohibición de desahucios de personas vulnerables sin alternativa habitacional.\n- Los honorarios de la agencia inmobiliaria siempre corren a cargo del propietario.',
    'El riesgo de que muchos propietarios retiren sus viviendas del mercado de alquiler tradicional para pasarlas a alquiler de temporada, que no está regulado por esta ley.',
    '{"beneficiados": "Jóvenes y familias inquilinas con rentas bajas o medias en ciudades como Madrid y Barcelona.", "afectados": "Inversores institucionales, SOCIMIs y plataformas de gestión inmobiliaria."}'::jsonb,
    '["¿Cómo se definirá exactamente una zona tensionada?", "¿Habrá compensaciones a los propietarios?", "¿Qué ocurre con los contratos ya vigentes?"]'::jsonb,
    'published',
    '[
        {
            "id": "art-1",
            "source": "EL PAÍS",
            "title": "La ley de vivienda nace con el reto de bajar los precios sin reducir la oferta",
            "bias": "LEFT_CENTER",
            "url": "#",
            "summary": "Un análisis profundo sobre cómo los incentivos fiscales podrían equilibrar la balanza frente al miedo a la regulación."
        },
        {
            "id": "art-2",
            "source": "ABC",
            "title": "El sector inmobiliario alerta de un desplome de la inversión por la inseguridad jurídica",
            "bias": "RIGHT",
            "url": "#",
            "summary": "Expertos y agencias advierten que el control de precios provocará un mercado negro y falta de stock."
        },
        {
            "id": "art-3",
            "source": "EL MUNDO",
            "title": "Guía completa: así te afecta la nueva ley si eres inquilino o propietario",
            "bias": "CENTER",
            "url": "#",
            "summary": "Desglose técnico de los plazos, las multas y los derechos que entran en vigor con la nueva normativa."
        }
    ]'::jsonb,
    'La perspectiva gubernamental enfatiza la función social de la vivienda, mientras que la oposición y los entes reguladores de mercado alertan sobre posibles distorsiones en la oferta a largo plazo.',
    '[
        {"date": "15 ENE", "event": "Primer borrador presentado en el Consejo de Ministros."},
        {"date": "12 MAR", "event": "Aprobación definitiva en el Congreso tras intensas negociaciones."},
        {"date": "17 ABR", "event": "Entrada en vigor oficial tras la publicación en el BOE."}
    ]'::jsonb,
    '["Reducción inmediata de la carga financiera para familias vulnerables.", "Eliminación de barreras de entrada (honorarios de agencia)."]'::jsonb,
    '["Posible contracción del mercado de alquiler un 15% según consultoras.", "Impacto en el PIB derivado del sector construcción."]'::jsonb,
    'España se enfrenta a una de las crisis de vivienda más agudas de su historia democrática, con precios de alquiler que han subido un 50% en la última década en las grandes capitales.'
);

-- 4. INSERTAR OTRA NOTICIA COMPLETA (INFLACIÓN)
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status, analytical_snippet, consenso_narrativo, contexto
) VALUES (
    gen_random_uuid(),
    'FINANZAS',
    'La inflación en la eurozona cae al 2,4% y abre la puerta a bajadas de tipos en junio',
    'Los datos de Eurostat confirman una moderación mayor de la esperada en los precios de los alimentos y la energía, presionando al BCE para iniciar el ciclo de flexibilización.',
    'hace 6 horas',
    'Bruselas, Bélgica',
    56,
    '{"left": 20, "center": 70, "right": 10}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1611974714652-7624bf9cbb70?auto=format&fit=crop&q=80&w=800',
    'published',
    'Consenso técnico elevado sobre la trayectoria desinflacionaria, aunque persiste el miedo a la inflación de servicios.',
    'Alivio para los hipotecados y optimismo en los mercados financieros. | Cautela ante la persistencia de los salarios altos en el sector servicios.',
    'El Banco Central Europeo ha mantenido los tipos en máximos históricos durante meses para combatir la escalada de precios derivada de la guerra en Ucrania.'
);
