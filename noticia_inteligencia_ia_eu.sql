-- ==========================================================
-- SEED GEOPOLÍTICA/TECNOLOGÍA: La Directiva de IA de la UE y la Soberanía Digital
-- Noticia de Alta Fidelidad con Desarrollo Editorial Extendido v6.0
-- ==========================================================

-- 0. SEGURIDAD DE ESQUEMA (Garantizar columnas necesarias)
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS articles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS perspectivas jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cronologia_info jsonb DEFAULT '[]'::jsonb;

-- 1. INSERTAR NOTICIA MAESTRA
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'ia-ue-soberania-2024',
    'TECNOLOGÍA',
    'Europa vs El Algoritmo: La UE aprueba la primera Ley de IA del mundo para frenar el dominio de Silicon Valley',
    'El Parlamento Europeo ratifica el AI Act, una legislación pionera que clasifica los sistemas por nivel de riesgo y prohíbe el reconocimiento facial preventivo, marcando el inicio de una nueva era de soberanía digital en el continente.',
    'hace 1 hora',
    'Bruselas / Estrasburgo',
    124,
    '{"left": 25, "center": 50, "right": 25}'::jsonb,
    'MUY ALTA',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    'published',
    -- RESUMEN EJECUTIVO (EXTENDIDO)
    'La aprobación de la Ley de Inteligencia Artificial (AI Act) no es solo un trámite administrativo; es la declaración de independencia tecnológica de la Unión Europea. En un contexto donde Estados Unidos domina la infraestructura LLM (Large Language Content) y China el control social algorítmico, Europa ha optado por la "tercera vía": el humanismo digital. Este resumen editorial destaca que la ley obligará a gigantes como OpenAI, Google y Microsoft a ser transparentes con los datos de entrenamiento y a auditar sus modelos bajo riesgo de multas de hasta el 7% de su facturación global.\n\nEl desafío es monumental. Mientras los defensores de la ley argumentan que establecerá el "Estándar de Oro" mundial (como ocurrió con el GDPR), los críticos advierten que la sobrerregulación podría expulsar la innovación hacia mercados menos restrictivos, dejando a Europa como un continente de consumidores protegidos pero sin industria propia. La arquitectura de esta ley divide la IA en cuatro niveles de riesgo, desde "mínimo" hasta "inaceptable", prohibiendo explícitamente sistemas de puntuación social similares a los de Pekín.',
    -- CONSENSO NARRATIVO
    'Consenso en que la regulación es necesaria para proteger los derechos fundamentales y evitar sesgos discriminatorios en algoritmos de contratación o justicia. | Discrepancia total sobre si esta ley ayudará o hundirá a las startups europeas frente a las Big Tech americanas. | Existe un acuerdo tácito en que la implementación técnica será un caos burocrático en los primeros dos años debido a la falta de expertos en las agencias reguladoras nacionales.',
    -- CIFRAS CLAVE
    '[
        {"label": "Multas máximas", "value": "35M€ / 7% CA"},
        {"label": "Niveles de riesgo", "value": "4 categorías"},
        {"label": "Startup IA (UE)", "value": "+1,200 empresas"},
        {"label": "Inversión pública", "value": "20,000M€/año"},
        {"label": "Modelos prohibidos", "value": "Puntaje social/SNA"},
        {"label": "Plazo implementación", "value": "24 meses"}
    ]'::jsonb,
    -- VERIFICACIÓN
    'Datos contrastados con el texto final aprobado por el Parlamento Europeo (PE-CONS 24/24). Las cifras de impacto económico provienen del reporte de impacto del Centro de Estudios de Política Europea (CEPS).',
    -- ORIGEN
    '["Parlamento Europeo", "Comisión Europea (DG CONNECT)", "OpenAI Compliance Dept.", "Mistral AI", "Stanford HAI"]'::jsonb,
    -- MEDIOS ANALIZADOS
    '["REUTERS", "POLITICO", "TECHCRUNCH", "EL PAÍS", "LE MONDE", "WIRED"]'::jsonb,
    -- DOCUMENTOS
    '[{"name": "DIRECTIVA_IA_TEXTO_FINAL.PDF", "size": "12.4MB"}, {"name": "IA_STAKEHOLDER_REACTIONS.PDF", "size": "4.2MB"}]'::jsonb,
    -- FACT CHECK
    '✓ La ley NO prohíbe la IA generativa, solo exige transparencia en derechos de autor.\n✓ Se permite el uso de IA en vigilancia policial para crímenes graves bajo permiso judicial.\n✓ El reglamento entrará en vigor de forma escalada hasta 2026.',
    -- BLIND SPOT
    'La mayoría de medios de comunicación omiten el hecho de que la ley permite "puertas traseras" para la seguridad nacional, lo que en la práctica diluye las restricciones de vigilancia facial si el Estado alega riesgo antiterrorista inminente.',
    -- PROTAGONISTAS
    '{"beneficiados": "Mistral AI (Francia) y Aleph Alpha (Alemania), que han conseguido excepciones para modelos de propósito general; ciudadanos preocupados por la privacidad.", "afectados": "Empresas medianas de desarrollo de software que no podrán costear las auditorías de cumplimiento; proveedores de IA para el sector público."}'::jsonb,
    -- PREGUNTAS ABIERTAS
    '["¿Se convertirá la Ley de IA en el estándar global de facto?", "¿Cómo se auditará un modelo cuyo funcionamiento es una ''caja negra''?", "¿Podrá Europa competir en IA generativa con estas restricciones?"]'::jsonb,
    -- +INFO > GENERAL (DESARROLLO MASIVO)
    'La inteligencia artificial ha dejado de ser una herramienta computacional para convertirse en el nuevo motor de la productividad global. El AI Act de la Unión Europea pretende civilizar este proceso, estableciendo que la dignidad humana y los derechos fundamentales no son negociables frente a la eficiencia algorítmica. \n\nEl núcleo de la ley reside en el concepto de "Sistemas de IA de Alto Riesgo". Estos incluyen algoritmos utilizados en infraestructuras críticas (electricidad, transporte), educación (calificación de exámenes), empleo (cribado automático de CVs) y servicios bancarios (concesión de créditos). Estos sistemas no estarán prohibidos, pero deberán cumplir con requisitos estrictos de calidad de datos, documentación técnica y supervisión humana. Esto significa que ya no será suficiente con que un algoritmo "funcione"; habrá que demostrar "por qué" toma las decisiones que toma.\n\nPara las empresas tecnológicas, esto supone un cambio de paradigma total. Hasta ahora, el lema de Silicon Valley era "muévete rápido y rompe cosas". Ahora, en suelo europeo, el lema será "documenta bien y no discriminies". Esta divergencia regulatoria podría crear un cisma en Internet, obligando a las empresas a desarrollar versiones "Lite" de sus herramientas para Europa, o bien a adoptar el estándar europeo para todo el mundo para evitar duplicidades operativas.',
    -- +INFO > PERSPECTIVAS
    'Desde el punto de vista geopolítico, la Ley de IA es un intento de Europa por no ser un simple tablero de juego entre Washington y Pekín. Al crear el primer marco legal coherente, la UE espera atraer a inversores que busquen estabilidad legal. \n\nSin embargo, desde el sector académico, voces como las de Yann LeCun (Meta) han advertido que regular la tecnología "en su infancia" es un error táctico. Argumentan que poner trabas a los modelos fundacionales (los que sirven de base para otros) es como intentar regular la electricidad antes de que se inventara la bombilla. Esta tensión entre seguridad y desarrollo marcará la próxima década de la política industrial europea.',
    -- CONTEXTO
    'La ley llega en un momento de eclosión sin precedentes. Solo en 2023, la inversión privada en IA en EE.UU. fue seis veces superior a la de toda la UE combinada. Europa ya ha perdido la batalla de los buscadores y las redes sociales; el AI Act es el último cartucho para no perder la batalla del cerebro digital.\n\nFrancia y Alemania, inicialmente reticentes a regular los modelos de lenguaje para proteger sus propias startups camponas (Mistral y Aleph Alpha), finalmente cedieron a cambio de cláusulas de excepción que permiten a los modelos de código abierto mayor libertad de investigación, siempre que no supongan un riesgo sistémico.',
    -- IMPACTO SOCIAL
    '["Protección contra la manipulación psicológica: prohibición de técnicas subliminales que alteren el comportamiento.", "Detección de emociones en entornos laborales: la ley limita el uso de IA para saber si un empleado está triste o cansado.", "Fin de los sesgos raciales y de género en la administración pública mediante auditorías obligatorias."]'::jsonb,
    -- IMPACTO SISTÉMICO
    '["Creación del Mercado Único de IA: una sola regla para 27 países, evitando la fragmentación legal.", "Fortalecimiento de la soberanía digital europea frente a infraestructuras en la nube extranjeras.", "Posible encarecimiento de los servicios digitales en la UE debido a los costes de cumplimiento."]'::jsonb,
    
    -- ARTÍCULOS DETALLADOS (CONTENIDO MASIVO)
    '[
        {
            "id": "ia-art-wired",
            "source": "WIRED",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Gregory Barber",
            "time": "hace 45 min",
            "title": "The Brussels Effect: Why Tech Giants are Terrified of Europe''s New AI Law",
            "readerContent": {
                "whatHappened": "For years, the tech industry has treated the European Union as a slow-moving regulatory dinosaur. But today, that dinosaur just bit back. The passage of the AI Act has sent tremors through Silicon Valley, as compliance officers at OpenAI and Meta scramble to understand the 400-page document that now governs their operations in the world’s most lucrative single market.\n\nThis isn’t just about privacy anymore; it’s about power. The EU is demanding access to the ''black box''—the secret recipes behind large language models. Under the new rules, developers must disclose how much computing power they use, the data sources they scraped (including potential copyright violations), and conduct rigorous red-teaming to ensure their AI doesn’t hallucinate dangerous advice.\n\n''This changes everything,'' says a senior advisor at the Center for AI Safety. ''In the US, safety is a suggestion. In Europe, it’s now a legal requirement.'' The economic impact is projected to be massive. Companies found in violation face fines that dwarf anything seen under the GDPR, potentially reaching the billions. This moves AI safety from the realm of ethics boards into the boardroom of public companies.",
                "context": "The AI Act follows a long history of European digital leadership. From the GDPR (Privacy) to the DMA (Competition), Brussels has consistently set rules that major tech firms eventually adopt globally to maintain a unified platform architecture.",
                "claims": [
                    {"text": "The EU is setting a global benchmark for trustworthy AI.", "source": "Thierry Breton, EU Commissioner"},
                    {"text": "This could lead to a digital wall between Europe and the US.", "source": "Tech Lobbies DC"}
                ],
                "preQuoteAnalysis": "WIRED provides a technical and industry-focused analysis, highlighting the shift from voluntary safety guidelines to mandatory legal oversight.",
                "postQuoteAnalysis": "The article emphasizes the ''Brussels Effect'', arguing that even if companies hate the law, they will reflect its standards in their global products to avoid the headache of managing separate region-specific AIs.",
                "implications": {
                    "owner": "For developers, this means the end of the ''Wild West'' era of AI deployment. Every significant update will now require a legal review before it touches European servers."
                },
                "blindSpot": "The piece focuses heavily on US giants, ignoring the burgeoning AI ecosystems in regions like the Middle East or SE Asia that may ignore EU rules entirely.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota TNE: WIRED adopta un tono de ''crónica del futuro'', analizando la ley como un evento histórico de poder geoeconómico."},
                    {"pos": 2, "text": "Inteligencia: Se destaca la mención a los miles de millones en multas como el principal incentivo para el cambio corporativo."}
                ]
            }
        },
        {
            "id": "ia-art-elpais",
            "source": "El País",
            "bias": "LEFT",
            "fact": "ALTA",
            "author": "Manuel Ansede",
            "time": "hace 2 horas",
            "title": "Humanismo contra Máquinas: Europa prohíbe el ''gran hermano'' algorítmico",
            "readerContent": {
                "whatHappened": "En una votación calificada de histórica, el Parlamento Europeo ha levantado un muro legal contra los excesos de la inteligencia artificial. La nueva ley es, ante todo, una victoria de la ética sobre el beneficio desmedido. Por primera vez, una potencia económica decide que no todo lo que es tecnológicamente posible es políticamente aceptable.\n\nEl punto más caliente de la negociación ha sido el reconocimiento facial. Tras meses de intensas presiones de los ministerios de interior de varios países miembros, la UE ha logrado un compromiso: prohibir la identificación biométrica en tiempo real en espacios públicos, con excepciones muy tasadas para la búsqueda de víctimas de trata o la prevención de ataques terroristas inminentes. Sin esta ley, el futuro de nuestras calles se parecería peligrosamente al sistema de crédito social chino, donde cada gesto es analizado por una cámara.\n\n''Hoy protegemos el derecho a ser anónimos'', declaraba eufórica la eurodiputada ponente. Pero la batalla no ha terminado. La ley también pone el foco en los sesgos: si una IA de contratación de personal rechaza sistemáticamente a mujeres o personas de color porque aprendió de una base de datos histórica machista o racista, el responsable de esa herramienta se enfrentará a la justicia. Europa ha decidido que el futuro será digital, pero solo si es justo.",
                "context": "El Parlamento Europeo ha tardado tres años en dar forma a este texto, lidiando con el lobby más agresivo de la historia de Bruselas. Las empresas de tecnología han gastado más de mil millones de euros intentando diluir las restricciones a la vigilancia biométrica.",
                "claims": [
                    {"text": "Es el paso más importante hacia una tecnología al servicio de las personas.", "source": "Amnistía Internacional"},
                    {"text": "Nos quedaremos atrás si no dejamos que las empresas experimenten.", "source": "BusinessEurope"}
                ],
                "preQuoteAnalysis": "El País enfoca la noticia desde la perspectiva de los derechos civiles y la protección del ciudadano medio frente al poder corporativo y estatal.",
                "postQuoteAnalysis": "Se otorga gran peso a la prohibición de la vigilancia masiva, presentándola como la "línea roja" que define el modelo de democracia europea frente al autoritarismo tecnológico.",
                "implications": {
                    "owner": "Para un ciudadano europeo, esto significa que podrá caminar por la calle con la seguridad de que su rostro no está siendo escaneado y comparado con una base de datos policial por defecto."
                },
                "blindSpot": "El artículo apenas menciona los costes de implementación que recaerán sobre las Administraciones Públicas, que deberán crear nuevos cuerpos de funcionarios de auditoría algorítmica.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota de Inteligencia: El enfoque es marcadamente humanista y sociológico, alejándose de los datos financieros."},
                    {"pos": 2, "text": "Dato TNE: Se resalta la tensión entre seguridad nacional y libertad civil en el último minuto de la votación."}
                ]
            }
        },
        {
            "id": "ia-art-wsj",
            "source": "WSJ (Intl)",
            "bias": "RIGHT",
            "fact": "ALTA",
            "author": "Kim Mackrael",
            "time": "hace 3 horas",
            "title": "Europe Chooses Regulation Over Innovation: Will the AI Act Kill Local Startups?",
            "readerContent": {
                "whatHappened": "BRUSSELS — The European Union’s gamble to lead the world in AI regulation might backfire into a permanent decline of its domestic tech sector. As officials in Brussels celebrate the AI Act, venture capitalists in Berlin, Paris, and London are raising red flags: the cost of innovation in Europe just went through the roof.\n\nWhile the law aims to curb the power of American giants, its true victims might be the small, scrappy startups that lack the legal armies of an Alphabet or a Microsoft. To bring a high-risk AI product to market in the EU, a company must now navigate a labyrinth of documentation, data governance, and liability schemes that could take years and millions of dollars to complete. \n\n''This is a gift to Silicon Valley,'' says a managing partner at a leading European VC firm. ''The big players will simply pay the compliance fees. The startups will just move to the US or Dubai.'' Even France’s Mistral AI, often hailed as Europe’s answer to ChatGPT, expressed concern that the law’s provisions on foundation models could throttle their ability to compete with OpenAI. The concern is that while Europe sets the rules, others will build the technology, leaving the continent as little more than a museum of digital regulation.",
                "context": "The EU currently accounts for less than 5% of global private investment in AI. In the last year, US AI startups raised $27 billion, while European firms managed just $4 billion. Analysts fear the AI Act will only widen this gap.",
                "claims": [
                    {"text": "We are creating a bureaucratic nightmare for our best minds.", "source": "DigitalEurope Industry Body"},
                    {"text": "Regulation provides the stability that long-term investors need.", "source": "EU Finance Ministry"}
                ],
                "preQuoteAnalysis": "The WSJ delivers a skeptical, market-driven critique, focusing on capital flight and the competitive disadvantage of European firms.",
                "postQuoteAnalysis": "It frames the situation as a trade-off: Europe is trading economic leadership for moral high ground, a move that critics say is unsustainable in a high-growth sector.",
                "implications": {
                    "owner": "For investors, the EU is now a high-compliance, low-growth environment for tech, making jurisdictions like Texas or Tokyo more attractive for seed funding."
                },
                "blindSpot": "The article ignores the potential economic benefits of ''Trustworthy AI'' as a brand that consumers might eventually prefer over unregulated competitors.",
                "interstitialNotes": [
                    {"pos": 1, "text": "TNE Intelligence: The focus here is strictly on ROC (Return on Compliance) and global competitiveness."},
                    {"pos": 2, "text": "Note: The comparison with Dubai and the US as ''innovation havens'' is a common trope in conservative financial press."}
                ]
            }
        }
    ]'::jsonb,
    -- DESGLOSE DE INTELIGENCIA (6 CLAVES CON MUCHO TEXTO)
    '[
        "1. EL FIN DE LA IMPUNIDAD DEL ALGORITMO: La ley termina con la era en la que las empresas podían lanzar sistemas de IA sin rendir cuentas. Ahora, los modelos fundacionales deberán ser transparentes por diseño, revelando no solo cómo funcionan, sino de dónde han sacado su inteligencia. Esto forzará a empresas como OpenAI a negociar licencias con los creadores de contenido originales, alterando para siempre la economía del entrenamiento de datos.",
        "2. CATEGORIZACIÓN POR RIESGO - LA CLAVE TÉCNICA: No toda la IA es igual. La ley introduce una pirámide de riesgo. Los sistemas de riesgo inaceptable (como la puntuación social) se prohíben. Los de alto riesgo (educación, salud, empleo) se permiten pero bajo vigilancia extrema. Los de riesgo limitado (chatbots simples) solo requieren avisar al usuario de que está hablando con una máquina. Esta claridad legal busca dar seguridad a los jueces europeos.",
        "3. EL SESGO COMO DELITO FEDERAL: Una de las partes más ambiciosas es el control de sesgos. La ley obliga a que los datos de entrenamiento sean representativos de la población europea. Si un algoritmo de seguros médicos discrimina a ciudadanos por su código postal o etnia, las multas serán históricas. Es el primer intento serio de codificar la justicia social en el código binario de las máquinas.",
        "4. EXCEPCIONES PARA EL CÓDIGO ABIERTO: Tras intensas negociaciones, la UE ha decidido proteger a los investigadores y a los proyectos de Open Source (código abierto). El objetivo es que las startups europeas puedan experimentar sin la carga burocrática de las Big Tech, siempre que sus modelos no se conviertan en infraestructuras críticas que pongan en peligro la seguridad nacional.",
        "5. VIGILANCIA BIOMÉTRICA - LA LÍNEA ROJA POLÍTICA: Se prohíbe el análisis de emociones en empresas y escuelas, así como la categorización biométrica por orientación sexual o religión. El uso de cámaras con IA por parte de la policía estará restringido a casos extremos y requerirá la firma de un juez, cerrando la puerta a un sistema de control de masas automatizado en territorio de la UE.",
        "6. HACIA UN ESTÁNDAR GLOBAL (EL EFECTO BRUSELAS): Al igual que el GDPR cambió la privacidad en todo el mundo, la UE confía en que su AI Act obligue al resto del planeta a seguir su ejemplo. Las empresas americanas y chinas que quieran vender sus servicios a 450 millones de consumidores europeos tendrán que adaptar sus algoritmos al estándar de Bruselas, dándole a Europa el poder de regular el mundo sin necesidad de fabricar el hardware."
    ]'::jsonb
);
