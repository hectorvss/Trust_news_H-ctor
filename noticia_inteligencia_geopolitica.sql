-- ==========================================================
-- SEED GEOPOLÍTICA: La Revolución del Hidrógeno Verde en España
-- Noticia de Alta Fidelidad con Desarrollo Editorial Extendido v4.0
-- ==========================================================

-- 0. SEGURIDAD DE ESQUEMA
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS articles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS perspectives jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cronologia_info jsonb DEFAULT '[]'::jsonb;

-- 1. INSERTAR NOTICIA MAESTRA
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles
) VALUES (
    'hidrogeno-geopolitica-2024',
    'TECNOLOGÍA',
    'España se posiciona como el hub energético de Europa gracias al Hidrógeno Verde',
    'El Gobierno de España y la Unión Europea dan luz verde al proyecto H2Med, un corredor de energía limpia que conectará la península ibérica con Francia y Alemania para 2030.',
    'hace 3 horas',
    'Algeciras - Puertollano, España',
    72,
    '{"left": 25, "center": 60, "right": 15}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1548333341-97d2165444a1?auto=format&fit=crop&q=80&w=800',
    'published',
    -- RESUMEN EDITORIAL
    'La transformación de España de un país energéticamente dependiente a un exportador neto de energía renovable es el cambio geopolítico más relevante del siglo XXI para Madrid. El hidrógeno verde, producido mediante electrólisis alimentada por energía solar y eólica, se perfila como la clave para descarbonizar la industria pesada europea. Sin embargo, el éxito del proyecto depende de una inversión masiva en infraestructura y de superar las reticencias técnicas de Francia sobre el transporte de gas.',
    -- CONSENSO NARRATIVO
    'Oportunidad irrepetible para reindustrializar España y crear empleo de alta cualificación en zonas de la España Vaciada. | Proyecto estratégico necesario para la independencia energética europea frente al gas ruso, aunque con riesgos técnicos y de ejecución elevados. | Megaproyecto de dudosa rentabilidad real que beneficia principalmente a las eléctricas del IBEX y puede crear una burbuja tecnológica.',
    -- CIFRAS CLAVE
    '[
        {"label": "Inversión H2Med", "value": "2,500M€"},
        {"label": "Producción 2030", "value": "2M Ton/año"},
        {"label": "Puestos de trabajo", "value": "180,000"},
        {"label": "Coste/kg H2", "value": "2.5€ - 4€"},
        {"label": "Capacidad electrolisis", "value": "11 GW"},
        {"label": "Subvenciones UE", "value": "50% del total"}
    ]'::jsonb,
    -- VERIFICACIÓN
    'Datos contrastados con la Hoja de Ruta del Hidrógeno del Ministerio para la Transición Ecológica y el informe de viabilidad técnica de Enagás. Se han verificado las proyecciones de demanda de Alemania para 2030 con los datos de la Agencia Internacional de la Energía (AIE).',
    -- ORIGEN
    '["Comisión Europea (REPowerEU)", "Ministerio para la Transición Ecológica", "Agencia Internacional de las Energías Renovables (IRENA)", "Enagás"]'::jsonb,
    -- MEDIOS ANALIZADOS
    '["THE ECONOMIST", "LE MONDE", "PÚBLICO", "LA RAZÓN", "REUTERS", "EL CONFIDENCIAL", "BLOOMBERG"]'::jsonb,
    -- DOCUMENTOS
    '[{"name": "ESTRATEGIA_HIDROGENO_2030.PDF", "size": "5.2MB"}, {"name": "H2MED_TECHNICAL_GUIDE.PDF", "size": "12.4MB"}]'::jsonb,
    -- FACT CHECK
    '✓ El H2Med transportará exclusivamente hidrógeno verde.\n✓ España concentra el 20% de los proyectos mundiales de hidrógeno verde.\n✓ El agua necesaria para la electrólisis provendrá mayoritariamente de plantas desalinizadoras.',
    -- BLIND SPOT
    'La mayoría de la cobertura ignora el enorme consumo de agua dulce de los electrolizadores en un país que sufre sequías estructurales. Sin una gestión hídrica revolucionaria, el hidrógeno verde podría competir por los recursos con la agricultura española.',
    -- PROTAGONISTAS
    '{"beneficiados": "Zonas industriales como Puertollano, Huelva y Asturias; empresas de ingeniería renovable; soberanía energética europea.", "afectados": "Importadores de gas natural tradicionales; países productores del Magreb que pierden peso relativo."}'::jsonb,
    -- PREGUNTAS ABIERTAS
    '["¿Será España capaz de producir suficiente energía renovable para abastecerse e importar?", "¿Llegará la infraestructura a tiempo para 2030?", "¿Bajará el coste de producción lo suficiente para ser competitivo frente al gas chino?"]'::jsonb,
    -- +INFO > GENERAL
    'El hidrógeno verde se obtiene a través de un proceso químico conocido como electrólisis. Este método utiliza una corriente eléctrica para separar el hidrógeno del oxígeno que hay en el agua. Si esa electricidad se obtiene de fuentes renovables, produciremos energía sin emitir dióxido de carbono a la atmósfera.\n\nEspaña tiene una ventaja competitiva natural: sol y viento en abundancia, lo que permite producir esta electricidad de forma más barata que en el norte de Europa. El proyecto H2Med contempla una tubería submarina entre Barcelona y Marsella que servirá como la arteria principal del sistema energético europeo del futuro.',
    -- +INFO > PERSPECTIVAS
    'Desde el sector ecologista se advierte que no debemos caer en el "tecnoptimismo": el hidrógeno verde es muy ineficiente energéticamente en comparación con el uso directo de la electricidad. Por ello, solo debería usarse para industrias pesadas (acerías, fertilizantes, aviación) donde no hay otra alternativa.\n\nEn el plano diplomático, el proyecto ha suavizado las relaciones con Francia, que inicialmente prefería el "hidrógeno rosa" (producido con energía nuclear). El acuerdo final reconoce el hidrógeno bajo en carbono, pero prioriza la inversión en el verde para recibir fondos europeos.',
    -- CONTEXTO
    'La guerra en Ucrania cambió el mapa energético de Europa para siempre. Alemania, que antes dependía en un 55% del gas ruso, necesita urgentemente socios estables y "verdes". España, que hasta ahora era una isla energética mal conectada con el continente, tiene hoy la oportunidad de convertirse en la gasolinera de Europa.\n\nEste cambio de roles sitúa a Madrid en una posición de poder inédita en Bruselas, permitiéndole liderar la política industrial europea y atraer gigafactorías de baterías y vehículos eléctricos que buscan proximidad a la fuente de energía más barata del continente.',
    -- IMPACTO SOCIAL
    '["Creación de polos industriales en regiones deprimidas, frenando la despoblación.", "Reconversión de trabajadores del sector del carbón y gas a la industria renovable.", "Aparición de nuevas titulaciones universitarias y formación profesional especializada."]'::jsonb,
    -- IMPACTO SISTÉMICO
    '["Reducción drástica de la huella de carbono industrial de España en un 30% para 2040.", "Fortalecimiento del euro mediante la reducción de importaciones energéticas en dólares.", "Tensión geopolítica con Marruecos y Argelia por el liderazgo solar en el Mediterráneo."]'::jsonb,
    
    -- ARTÍCULOS DETALLADOS (4000+ CARACTERES TOTAL)
    '[
        {
            "id": "h2-art-left",
            "source": "Público",
            "bias": "LEFT",
            "fact": "ALTA",
            "author": "Laura Martínez",
            "time": "hace 2 horas",
            "title": "Soberanía o extractivismo: el riesgo de convertir a España en la pila de Europa",
            "readerContent": {
                "whatHappened": "España se encuentra ante una encrucijada que marcará las próximas décadas. El despliegue del hidrógeno verde promete ser la gran solución a la crisis climática, pero también amenaza con repetir viejos modelos de desarrollo donde el sur pone los recursos y el norte se lleva el valor añadido.\n\nEl proyecto H2Med es, sobre el papel, una victoria de la diplomacia española. Sin embargo, no podemos permitir que se convierta en una nueva burbuja especulativa impulsada por las grandes energéticas del IBEX 35. Detrás de los anuncios de miles de millones de inversión, hay un territorio que sufrirá el impacto visual de miles de nuevos aerogeneradores y placas solares. ¿Para qué? ¿Para que la industria pesada alemana siga funcionando mientras nuestros campos se quedan sin agua para producir este combustible? \n\nLa transición ecológica debe ser justa. Si el hidrógeno verde solo sirve para salvar las cuentas de resultados de Repsol e Iberdrola, habremos perdido una oportunidad histórica para democratizar la energía en España.",
                "context": "Históricamente, España ha sido un campo de pruebas para el capital extranjero. El boom de las renovables de 2008 terminó en un desastre de recortes retroactivos para los pequeños inversores, mientras las grandes eléctricas salían intactas. Ahora, bajo la bandera de lo ''verde'', se vuelve a orquestar un plan master donde el ciudadano apenas tiene voz.",
                "claims": [
                    {"text": "No queremos ser una colonia energética de Alemania.", "source": "Plataforma Territorial"},
                    {"text": "El agua debe ser para beber, no para quemar hidrógeno.", "source": "Ecologistas en Acción"}
                ],
                "preQuoteAnalysis": "Público encuadra la noticia como una lucha de clases energética, alertando sobre el colonialismo interno y la privatización de los beneficios renovables.",
                "postQuoteAnalysis": "Se destaca que la energía más barata de España debería usarse primero para bajar la factura de la luz de los hogares españoles antes de ser exportada por un tubo submarino.",
                "implications": {
                    "owner": "Para las comunidades locales de Albacete, Teruel o Cáceres, esto supone una invasión de infraestructuras sin un retorno social claro en forma de infraestructuras básicas o servicios."
                },
                "blindSpot": "El artículo no ofrece alternativas viables para la financiación de los 2.500 millones necesarios para la infraestructura si no es a través de la gran industria.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota TNE: La redactora utiliza un enfoque marcadamente territorial y social, priorizando la voz de los colectivos locales frente a los directivos de Energía."},
                    {"pos": 2, "text": "Análisis de Inteligencia: El enfoque ignora que la creación de empleo industrial suele venir de estas exportaciones de alto valor."}
                ]
            }
        },
        {
            "id": "h2-art-right",
            "source": "La Razón",
            "bias": "RIGHT",
            "fact": "MEDIA",
            "author": "Ángel S. Expósito",
            "time": "hace 4 horas",
            "title": "Luces y sombras de la utopía verde: España se lo juega todo a una carta",
            "readerContent": {
                "whatHappened": "El Gobierno de Sánchez ha hecho del hidrógeno verde su principal emblema internacional. Bajo la promesa de convertirnos en el ''hub'' de Europa, se está regando con miles de millones de fondos europeos un sector que hoy por hoy es una incógnita tecnológica y económica.\n\nEl problema no es el hidrógeno en sí, sino el coste. Actualmente, producir hidrógeno verde es hasta cinco veces más caro que obtenerlo a partir del gas natural. ¿Quién pagará esa diferencia? Según el plan del Gobierno, serán las subvenciones las que sostengan el tinglado hasta que la tecnología madure. Pero, ¿y si no madura a tiempo? ¿O si otros países, como Marruecos o Chile, consiguen costes de producción imbatibles gracias a una regulación laboral y medioambiental más laxa?\n\nEstamos ante un megaproyecto que recuerda a otros del pasado: el Castor, las radiales o el coche eléctrico. Infraestructuras carísimas que se inauguran con grandes fotos pero que luego arrastran pérdidas millonarias que el contribuyente termina rescatando. La energía debe ser barata para que la industria compita hoy, no una promesa dorada para 2030.",
                "context": "El sector energético español ha sido tradicionalmente un terreno de juego político. Desde el cierre acelerado de las nucleares hasta el impuesto al sol, el intervencionismo ha provocado que España tenga una de las facturas industriales más altas de Europa. Esta apuesta por el hidrógeno es otro salto al vacío sin red de seguridad.",
                "claims": [
                    {"text": "Es otra burbuja alimentada por el dinero público de la UE.", "source": "Portavoz de Economía del PP"},
                    {"text": "Sin nucleares, el sistema renovable es inestable y caro.", "source": "Foro Nuclear"}
                ],
                "preQuoteAnalysis": "La Razón utiliza un marco de escepticismo demagogo y desconfianza en la gestión pública, enfatizando los riesgos financieros y el coste para el contribuyente.",
                "postQuoteAnalysis": "El texto subraya la falta de un plan B si el mercado del hidrógeno no se desarrolla como se espera o si los socios franceses vuelven a bloquear las conexiones transpirenaicas.",
                "implications": {
                    "owner": "Para las pymes españolas, este proyecto no bajará la factura de la luz a corto plazo, ya que las inversiones en el H2Med se repercutirán en los peajes del sistema gasista y eléctrico."
                },
                "blindSpot": "El artículo omite convenientemente el coste masivo de NO hacer nada y seguir dependiendo del gas extranjero, que es el que dictamina hoy la inflación.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota TNE: Se observa un uso frecuente de la palabra ''utopía'' y ''tinglado'' para restar credibilidad científica al proyecto."},
                    {"pos": 2, "text": "Dato: El autor mezcla interesadamente el coste actual con el proyectado a 10 años, ignorando la curva de aprendizaje tecnológica."}
                ]
            }
        },
        {
            "id": "h2-art-center",
            "source": "Reuters Business",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Joan Faus",
            "time": "hace 1 hora",
            "title": "Spain''s Hydrogen Ambition: A Pivot for Continental Energy Flows",
            "readerContent": {
                "whatHappened": "MADRID/BERLIN (Reuters) - Spain is emerging as the undisputed leader in Europe''s ambitious plans to decarbonize its heavy industry by 2030. According to analysts at BloombergNEF, the Iberian nation now accounts for 20% of the world''s green hydrogen projects, leveraging its vast sun-drenched landscapes and aging but robust energy grid.\n\nThe final approval of the H2Med subsea pipeline between Barcelona and Marseille marks a turning point for European energy security. In Frankfurt and Wolfsburg, German industrial giants from BASF to Volkswagen are looking to the Pyrenees with hope. Their future survival depends on a steady flow of cheap hydrogen to replace Russian natural gas. \n\nHowever, technical challenges remain daunting. Transporting hydrogen molecules requires specialized pipelines to prevent leakage and brittleness of existing steel structures. Spain''s Enagas and France''s Teréga face a race against time to design a 455-kilometer offshore pipe that must withstand extreme pressures while maintaining the high purity levels required by chemical refineries.",
                "context": "The European Union has set a target to produce 10 million tonnes and import another 10 million tonnes of renewable hydrogen by 2030. Spain alone aims to provide up to 2 million tonnes, effectively becoming the strategic core of the emerging EU Hydrogen Backbone.",
                "claims": [
                    {"text": "Spain will be the Florida of Europe for clean energy.", "source": "CEO of International Tech Fund"},
                    {"text": "The project is viable but needs accelerated permitting.", "source": "European Commission Official"}
                ],
                "preQuoteAnalysis": "Reuters provides a strictly factual, business-oriented analysis, focusing on logistics, market demand, and FDI (Foreign Direct Investment) trends.",
                "postQuoteAnalysis": "The report highlights the geopolitical shift: Germany is moving its energy dependency from the East (Russia) to the South (Spain), creating a more stable internal market within the EU Schengen zone.",
                "implications": {
                    "owner": "International investors see Spain as a top-tier destination for ESG (Environmental, Social, and Governance) funds, which could lower the country''s overall risk premium."
                },
                "blindSpot": "The report focuses heavily on macro trends and corporate interests, underplaying the environmental impact on local ecosystems in the Mediterranean seabed.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Inteligencia TNE: Reuters es la fuente más fiable para entender el interés real de los fondos soberanos en este proyecto."},
                    {"pos": 2, "text": "Nota: Se destaca la mención a los problemas técnicos de la fragilidad del acero ante el hidrógeno, un detalle que la prensa nacional suele omitir por su complejidad."}
                ]
            }
        }
    ]'::jsonb
);
