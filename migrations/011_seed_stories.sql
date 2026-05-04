-- ==========================================
-- SEED: Noticias de prueba para TNE
-- Ejecuta esto en el SQL Editor de Supabase
-- ==========================================

-- 1. Limpiar noticias existentes (opcional)
-- DELETE FROM public.stories;

-- 2. Insertar noticia 1: Ley de Vivienda
INSERT INTO public.stories (
    category, title, summary, time_label, location, source_count, bias, factuality, image_url, 
    full_content, analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, 
    origen_info, medios_analizados, documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, status
) VALUES (
    'POLÍTICA', 
    'El Gobierno de España aprueba una nueva ley de vivienda para limitar alquileres',
    'Se ha aprobado un marco regulatorio para las zonas tensionadas en las principales ciudades españolas, buscando frenar la escalada de precios mediante un índice de referencia y topes del 3% anual.',
    'hace 2 horas',
    'Madrid, España',
    42,
    '{"left": 45, "center": 30, "right": 25}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=800',
    'Contenido detallado sobre la ley de vivienda...',
    'Unanimidad total sobre la gravedad del problema de acceso, pero división irreconciliable sobre si el control de precios es la medicina o el veneno para el mercado.',
    'Justicia social y blindaje del derecho al hogar | Análisis de la estabilidad del mercado y el impacto en la inflación general. | Inseguridad jurídica y riesgo de parálisis',
    '[{"label": "Límite de subida", "value": "3.0% anual"}, {"label": "Contratos afectados", "value": "2,400,000"}]'::jsonb,
    'Los datos han sido extraídos directamente del RD-Ley publicado en el BOE y confirmados por el Ministerio de Vivienda y Agenda Urbana.',
    '["Agencia EFE", "Reuters", "Europa Press"]'::jsonb,
    '["EL PAÍS", "ABC", "EL MUNDO", "RTVE"]'::jsonb,
    '[{"name": "RD-LEY 12/2024.PDF"}]'::jsonb,
    'Congelación de precios en zonas declaradas de mercado tensionado.\nBonificaciones fiscales de hasta el 90% para propietarios que bajen la renta.',
    'Eliminación por ley del cobro de honorarios de agencia al arrendatario.',
    '{"beneficiados": "Inquilinos en zonas urbanas de alta demanda", "afectados": "Grandes tenedores de vivienda"}'::jsonb,
    '["¿Habrá un efecto rebote en los precios de venta?", "¿Cómo afectará a la inversión?"]'::jsonb,
    'published'
);

-- 3. Insertar noticia 2: Seguridad Ciudadana
INSERT INTO public.stories (
    category, title, summary, time_label, location, source_count, bias, factuality, image_url, 
    analytical_snippet, consenso_narrativo, status
) VALUES (
    'POLÍTICA',
    'Debate en el Congreso sobre la reforma de la Ley de Seguridad Ciudadana',
    'El pleno debate hoy las enmiendas a la conocida como ''Ley Mordaza'', con especial atención a las devoluciones en caliente y el uso de material antidisturbios.',
    'hace 4 horas',
    'Congreso, Madrid',
    38,
    '{"left": 40, "center": 20, "right": 40}'::jsonb,
    'MEDIA',
    'https://images.unsplash.com/photo-1589216532372-1c2a11f90d6a?auto=format&fit=crop&q=80&w=800',
    'Divergencia máxima (90% en polos) sobre el equilibrio entre seguridad y libertad.',
    'Recuperación de derechos civiles y eliminación de las devoluciones en caliente. | Debate técnico sobre el equilibrio entre la seguridad jurídica de los agentes y las garantías ciudadanas.',
    'published'
);
