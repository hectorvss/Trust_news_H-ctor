-- ==========================================================
-- SEED SOCIAL/AMBIENTAL: La Crisis de la Sequía y el Futuro del Agua
-- Noticia de Alta Fidelidad con Desarrollo Editorial Extendido v5.0
-- ==========================================================

-- 0. SEGURIDAD DE ESQUEMA
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS articles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS perspectivas jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cronologia_info jsonb DEFAULT '[]'::jsonb;

-- 1. INSERTAR NOTICIA MAESTRA
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles
) VALUES (
    'sequia-crisis-2024',
    'SOCIAL',
    'Guerra del Agua: El conflicto entre el campo y las ciudades escala por la sequía extrema',
    'Las reservas hídricas en las cuencas del Segura y el Júcar caen por debajo del 20%, obligando al Gobierno a priorizar el consumo humano frente al regadío y activando un plan de emergencia nacional.',
    'hace 2 horas',
    'Cuenca del Segura, Murcia/Alicante',
    89,
    '{"left": 35, "center": 30, "right": 35}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&q=80&w=800',
    'published',
    -- RESUMEN EDITORIAL
    'España se enfrenta a su mayor crisis existencial del siglo XXI: la desertificación de su mitad sur. Lo que comenzó como un ciclo de sequía severa se ha transformado en un conflicto social y político de primer orden. La agricultura intensiva, responsable de más del 70% del consumo de agua en la región, choca frontalmente con el crecimiento urbano y las restricciones ambientales impuestas por Europa. La pregunta ya no es cómo conseguir más agua, sino quién tiene derecho a la que queda.',
    -- CONSENSO NARRATIVO
    'Necesidad urgente de cambiar el modelo productivo hacia un regadío sostenible y tecnificado que respete los caudales ecológicos. | Búsqueda de un equilibrio que no arruine al sector primario (el "huerto de Europa") mientras se asegura el abastecimiento a las grandes ciudades. | El sector agrario está siendo injustamente criminalizado por una gestión política negligente que no ha invertido en infraestructuras de desalación y trasvases.',
    -- CIFRAS CLAVE
    '[
        {"label": "Capacidad embalses", "value": "18.4%"},
        {"label": "Pérdidas sector agrario", "value": "1,200M€"},
        {"label": "Precio agua desalada", "value": "0.60€/m3"},
        {"label": "Población afectada", "value": "14.5M"},
        {"label": "Consumo agrícola", "value": "72%"},
        {"label": "Déficit hídrico", "value": "400 hm3/año"}
    ]'::jsonb,
    -- VERIFICACIÓN
    'Datos extraídos de los informes semanales de la Confederaciones Hidrográficas del Segura y el Tajo. Las pérdidas económicas han sido estimadas por la asociación agraria ASAJA y verificadas proporcionalmente con las ayudas directas aprobadas en el último Consejo de Ministros.',
    -- ORIGEN
    '["Ministerio para la Transición Ecológica", "Confederación Hidrográfica del Segura", "IPCC (Informe Mediterráneo)", "COAG"]'::jsonb,
    -- MEDIOS ANALIZADOS
    '["EL MUNDO", "EL DIARIO.ES", "THE GUARDIAN", "ABC", "LA VANGUARDIA", "EFE AGRO"]'::jsonb,
    -- DOCUMENTOS
    '[{"name": "PLAN_HIDROLOGICO_NACIONAL.PDF", "size": "8.4MB"}, {"name": "INFORME_DESERTIFICACION_CSIC.PDF", "size": "3.1MB"}]'::jsonb,
    -- FACT CHECK
    '✓ El trasvase Tajo-Segura se ha reducido un 25% respecto al año anterior.\n✓ Las sanciones por pozos ilegales se han triplicado en el último semestre.\n✓ El Gobierno ha prometido 500M€ para la modernización de regadíos.',
    -- BLIND SPOT
    'Casi ninguna fuente menciona el impacto de la industria turística y el riego de campos de golf, un tema tabú en regiones donde el turismo representa el 15% del PIB, prefiriendo centrar el debate exclusivamente en la agricultura o el consumo doméstico.',
    -- PROTAGONISTAS
    '{"beneficiados": "Tecnológicas hídricas y constructoras de desaladoras; núcleos urbanos de costa.", "afectados": "Pequeños agricultores familiares; ecosistemas fluviales en proceso de colapso."}'::jsonb,
    -- PREGUNTAS ABIERTAS
    '["¿Es viable económicamente el campo español con agua desalada?", "¿Habrá trasvases obligatorios entre regiones?", "¿Estamos ante el fin del modelo de ''huerta de Europa''?"]'::jsonb,
    -- +INFO > GENERAL
    'La sequía estructural en España ya no es un fenómeno meteorológico, sino un cambio sistémico. El aumento de las temperaturas globales ha desplazado las borrascas hacia el norte, dejando a la Península bajo la influencia de anticiclones persistentes.\n\nEn este contexto, la dependencia del agua subterránea ha llevado a los acuíferos al límite de su capacidad, provocando en muchos casos la intrusión salina (agua de mar que entra en el subsuelo), lo que inutiliza la tierra de cultivo para siempre. La tecnología de desalación es la gran esperanza, pero su alto consumo de energía eléctrica hace que el precio del agua resultante sea, a menudo, inasumible para cultivos de bajo margen como el cereal o las hortalizas básicas.',
    -- +INFO > PERSPECTIVAS
    'Desde las Confederaciones Hidrográficas se apuesta por un control digital del uso del agua mediante contadores inteligentes y vigilancia satelital de cultivos. El objetivo es detectar en tiempo real quién está regando por encima de su concesión legal.\n\nPor otro lado, los sindicatos agrarios denuncian que se está usando la excusa ambiental para favorecer a las importaciones de países terceros que no cumplen con los mismos estándares de sostenibilidad. Para ellos, el agua no es solo un recurso natural, sino una herramienta de equilibrio geopolítico para asegurar la soberanía alimentaria de la Unión Europea.',
    -- CONTEXTO
    'El Tajo-Segura, el trasvase más importante de España, se ha convertido en el principal campo de batalla político entre Castilla-La Mancha y la Comunidad Valenciana/Murcia. Mientras los primeros exigen mantener caudales ecológicos mínimos para salvar el río, los segundos dependen de ese flujo para mantener un sector que exporta miles de millones en frutas y verduras a toda Europa.\n\nEsta tensión territorial ha fracturado el consenso nacional y ha llevado el conflicto a los tribunales europeos, donde se dirime si la prioridad debe ser el ecosistema del río cedente o la economía del río receptor.',
    -- IMPACTO SOCIAL
    '["Desaparición del tejido social rural en el Levante: fin de las cooperativas agrícolas locales.", "Aumento del precio de la cesta de la compra (frutas y verduras) en toda la Unión Europea.", "Emigración de jóvenes agricultores hacia el sector servicios."]'::jsonb,
    -- IMPACTO SISTÉMICO
    '["Pérdida de biodiversidad crítica: humedales como Doñana o las Tablas de Daimiel están en situación de pre-colapso.", "Necesidad de una revolución energética para alimentar las desaladoras con renovables.", "Inestabilidad política regional por la ''guerra de los trasvases''."]'::jsonb,
    
    -- ARTÍCULOS DETALLADOS (MÁS DE 6000 CARACTERES TOTAL)
    '[
        {
            "id": "agua-art-right",
            "source": "El Mundo",
            "bias": "RIGHT",
            "fact": "ALTA",
            "author": "Vicente Ruiz",
            "time": "hace 45 min",
            "title": "El campo se desangra: el dogmatismo ecológico de Madrid sentencia a la huerta de Europa",
            "readerContent": {
                "whatHappened": "Es un paisaje desolador. En los campos de Murcia y Alicante, miles de hectáreas de limoneros y hortalizas comienzan a secarse bajo un sol implacable, mientras los despachos de Madrid firman sentencias de muerte en forma de recortes al trasvase Tajo-Segura. La sensación de abandono entre los agricultores es total.\n\nEl Gobierno ha decidido que la ideología verde está por encima de la economía real de millones de familias. Al imponer caudales ecológicos arbitrarios en el Tajo, se está cortando el suministro a una región que genera el 20% de las exportaciones hortofrutícolas del país. La alternativa propuesta, el agua desalada, es hoy un espejismo: su precio es el doble que el agua de riego tradicional y su calidad química daña las raíces de los cultivos más sensibles.\n\nASAJA y otras asociaciones ya preparan un otoño de protestas. ''No es sequía, es mala gestión'', repiten en las cooperativas. La falta de inversión en infraestructuras hídricas durante la última década ha dejado al campo vendido ante el primer ciclo seco serio, demostrando que para este Ejecutivo, la agricultura es un sector molesto que debe ser sustituido por parques fotovoltaicos instalados por grandes constructoras.",
                "context": "España tiene agua suficiente si se gestiona con solidaridad interterritorial. El Plan Hidrológico Nacional de 2001, derogado por Zapatero, era la única solución integral que contemplaba trasvases desde donde sobra hacia donde falta. Desde entonces, el agua se ha usado como moneda de cambio electoral entre comunidades autónomas.",
                "claims": [
                    {"text": "Nos están robando el futuro por cuatro votos en Castilla.", "source": "Presidente de Regantes"},
                    {"text": "El agua desalada no es la solución, es un parche carísimo.", "source": "Sindicato Agrario"}
                ],
                "preQuoteAnalysis": "El Mundo utiliza un tono de indignación y defensa de la propiedad privada y la tradición productiva, pintando al Gobierno central como un ente desconectado de la realidad rural.",
                "postQuoteAnalysis": "El artículo evita mencionar que los caudales ecológicos son una exigencia legal de la Unión Europea y del Tribunal Supremo español, presentándolos como una decisión puramente caprichosa del Ministerio.",
                "implications": {
                    "owner": "Para un agricultor medio, esto significa que deberá elegir entre endeudarse para pagar agua desalada o arrancar sus árboles y vender la tierra para la instalación de placas solares."
                },
                "blindSpot": "El texto omite convenientemente el problema de la sobreexplotación de pozos ilegales que ha secado los acuíferos de los que ahora se quejan.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota TNE: El Mundo utiliza un marco de ''Guerra Cultural'' entre la ciudad (progre/ideológica) y el campo (real/productivo)."},
                    {"pos": 2, "text": "Inteligencia: Se destaca la mención a las placas solares como el ''enemigo'' que viene a ocupar el lugar de los frutales."}
                ]
            }
        },
        {
            "id": "agua-art-left",
            "source": "elDiario.es",
            "bias": "LEFT",
            "fact": "ALTA",
            "author": "Raúl Rejón",
            "time": "hace 3 horas",
            "title": "El colapso del modelo insostenible: por qué no se puede seguir regando el desierto",
            "readerContent": {
                "whatHappened": "La realidad es tozuda, aunque algunos prefieran seguir mirando hacia otro lado. El modelo de agricultura intensiva en el sureste español ha llegado a su límite biofisico. Durante décadas, se ha fomentado un sistema basado en el crecimiento infinito en un territorio de recursos finitos, y ahora la naturaleza ha pasado factura.\n\nLa crisis del agua en Murcia y Almería no es una maldición divina, sino el resultado de políticas que han ignorado sistemáticamente las advertencias científicas sobre el cambio climático. Seguir pidiendo más trasvases de ríos que mueren, como el Tajo, es una irresponsabilidad que solo sirve para alimentar los beneficios de la agroindustria exportadora mientras los ecosistemas locales colapsan. Doñana y el Mar Menor son las dos caras de la misma moneda: un desarrollo que devora el medio ambiente hasta que ya no queda nada que devorar.\n\nLa transición hacia una agricultura de secano tecnificada y la reducción drástica de la superficie de regadío son las únicas vías de supervivencia. El Gobierno debe ser valiente y aplicar las restricciones necesarias, por impopulares que sean, para asegurar que en 20 años todavía quede agua potable en los grifos de las ciudades.",
                "context": "Desde los años 90, la superficie de regadío en España ha crecido un 15%, a pesar de que las precipitaciones han bajado un 12%. Estamos ante una disonancia cognitiva nacional: queremos seguir siendo el huerto de Europa en un país que se está convirtiendo en el Sáhara.",
                "claims": [
                    {"text": "El agua es un bien público, no un recurso para el beneficio privado.", "source": "Greenpeace España"},
                    {"text": "Debemos adaptarnos a la escasez, no luchar contra ella con más hormigón.", "source": "Mesa del Agua"}
                ],
                "preQuoteAnalysis": "elDiario.es utiliza una narrativa de responsabilidad climática y justicia ambiental, centrando el debate en los límites del crecimiento y la protección de los bienes comunes.",
                "postQuoteAnalysis": "Se pone el foco en el poder de los lobbies agroindustriales que, según el autor, mantienen rehén la política hídrica del país a través de la presión electoral en regiones clave.",
                "implications": {
                    "owner": "Para el consumidor, esto implica que el precio de los alimentos debe reflejar su coste hídrico real, lo que terminará con la era de la verdura barata a costa de ríos secos."
                },
                "blindSpot": "El artículo no profundiza en el drama social del desempleo masivo que una reducción del 30% del regadío provocaría en comarcas enteras que no tienen otra alternativa económica.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota de Inteligencia: El enfoque es marcadamente científico y normativo, apoyándose en directivas europeas."},
                    {"pos": 2, "text": "Dato TNE: Se resalta la contradicción entre los campos de golf y la agricultura, aunque ambos usan agua regenerada en muchos casos."}
                ]
            }
        },
        {
            "id": "agua-art-intl",
            "source": "The Guardian (ES)",
            "bias": "CENTER_LEFT",
            "fact": "ALTA",
            "author": "Ashifa Kassam",
            "time": "hace 2 horas",
            "title": "Spain''s Desertification: Europe''s Salad Bowl Running on Empty",
            "readerContent": {
                "whatHappened": "ALICANTE — In the scorched valleys of southern Spain, the future of European food security is being written in the sand. For decades, supermarkets in London, Berlin, and Paris have relied on a steady stream of low-cost berries and lettuces from this arid corner of the continent. But the tap is running dry.\n\nAs global temperatures rise, Spain is facing a process of ''Africanization'' of its climate. The political response has been a bitter war over the remaining drops of water in the nation''s reservoirs. The central government in Madrid finds itself caught between Brussels'' strict environmental mandates and a local agricultural lobby that provides thousands of jobs. \n\n''We are the canary in the coal mine,'' says an hydrologist from the University of Alicante. ''What is happening here today will be the reality of southern France and Italy in ten years.'' The transition to desalination technology, while technologically advanced, creates a new dependency on high energy prices, linking the cost of a salad in a UK supermarket directly to the volatility of European electricity markets.",
                "context": "Spain produces over 50% of Europe''s fresh vegetables. The intensive farming model has lifted millions out of poverty since the 1970s, but it has left a legacy of depleted aquifers and toxic runoff that recently led to the legal recognition of the Mar Menor lagoon as a person with rights.",
                "claims": [
                    {"text": "The era of cheap water-intensive exports is over.", "source": "EU Climate Commissioner"},
                    {"text": "Europe must decide if it wants a garden or a desert.", "source": "World Wildlife Fund"}
                ],
                "preQuoteAnalysis": "The Guardian offers an external, objective perspective that frames the Spanish crisis as a global warning sign of climate collapse.",
                "postQuoteAnalysis": "It highlights the supply chain risks for Northern European countries, which have outsourced their water-intensive crop production to the driest part of the continent.",
                "implications": {
                    "owner": "For international readers, this signifies a paradigm shift in how food is sourced and the increasing importance of water-resistent supply chains."
                },
                "blindSpot": "The report underplays the specific regional politics and the historical grievances between the ''dry Spain'' and ''wet Spain''." ,
                "interstitialNotes": [
                    {"pos": 1, "text": "TNE Intelligence: This article provides the most ''detached'' view, focusing on the systemic risks to the EU internal market."},
                    {"pos": 2, "text": "Note: The mention of the Mar Menor as a ''legal person'' is a detail that international press finds fascinating and significant."}
                ]
            }
        }
    ]'::jsonb
);
