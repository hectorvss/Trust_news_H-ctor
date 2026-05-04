-- ==========================================================
-- SUPER SEED: ACTUALIDAD ESPAÑA 2024-2025 (PARTE 1)
-- Noticias de Alta Fidelidad con Desarrollo Editorial Extendido v9.0
-- ==========================================================

-- 0. SEGURIDAD DE ESQUEMA
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS articles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS perspectivas jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cronologia_info jsonb DEFAULT '[]'::jsonb;

-- 1. EMERGENCIA POR SEQUÍA
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'sequia-emergencia-2024',
    'MEDIO AMBIENTE',
    'España bajo mínimos: La sequía estructural obliga a rediseñar el modelo productivo y el consumo urbano',
    'Cataluña y Andalucía declaran la fase de emergencia ante embalses por debajo del 15%. Las restricciones al riego, la industria y el turismo marcan un punto de inflexión en la gestión hídrica nacional.',
    'hace 2 horas',
    'Barcelona / Sevilla',
    112,
    '{"left": 25, "center": 50, "right": 25}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ La crisis hídrica en España ha dejado de ser un fenómeno estacional para convertirse en una emergencia estructural. Con las cuencas del Ter-Llobregat y el Guadalquivir en niveles críticos, el país se enfrenta a decisiones dolorosas: ¿Priorizar el consumo humano, el riego agrícola que alimenta a Europa o el motor turístico del PIB? La declaración de emergencia en Cataluña, que afecta a más de 6 millones de personas, no es solo un problema de falta de lluvia, sino el resultado de una planificación que no previó la aceleración del cambio climático. El debate se centra ahora en la desalinización masiva, la regeneración de aguas y la interconexión de cuencas, una solución técnica que despierta viejas tensiones territoriales. $$ ,
    $$ Existe consenso científico en que los periodos de sequía serán más largos e intensos en la Península Ibérica. | Hay acuerdo político en que las infraestructuras actuales son insuficientes para el nuevo clima. | La discrepancia es política y territorial: el "trasvase" sigue siendo una palabra tabú, y el reparto de culpas entre administraciones dificulta una respuesta unificada. $$ ,
    $$ [
        {"label": "Nivel embalses CAT", "value": "14.5%"},
        {"label": "Inversión desalinización", "value": "2.400M€"},
        {"label": "Pérdidas agrarias", "value": "1.200M€ (Est)"},
        {"label": "Población afectada", "value": "+9M personas"},
        {"label": "Consumo límite", "value": "200 l/hab/día"},
        {"label": "Capacidad desaladora", "value": "Subida +30%"}
    ] $$,
    $$ Datos contrastados con los informes semanales de la Agencia Catalana de l'Aigua (ACA) y la Confederación Hidrográfica del Guadalquivir. $$ ,
    $$ ["AEMET", "MITECO", "ACA", "COAG", "Greenpeace"] $$,
    $$ ["EL PAÍS", "EL MUNDO", "ARA", "ABC"] $$,
    $$ [{"name": "INFORME_ESTADO_CUENCAS_2024.PDF", "size": "3.5MB"}] $$,
    $$ ✓ España es el país de la UE con mayor riesgo de desertificación.\n✓ Las plantas desalinizadoras funcionan actualmente al 100%.\n✓ El consumo doméstico representa solo el 15% del uso total del agua. $$ ,
    $$ Se omiten las fugas en redes municipales que pierden hasta el 40% del agua. $$ ,
    $$ {"beneficiados": "Ingeniería hidráulica y desalación.", "afectados": "Agricultores, sector turístico y ciudadanos con restricciones."} $$ ,
    $$ ["¿Es viable el turismo de masas sin agua?", "¿Trasvase del Ebro por mar?", "¿Qué cultivos deben desaparecer?"] $$ ,
    $$ La sequía en España ha mutado de noticia meteorológica a crisis de Estado. En Cataluña, el sistema Ter-Llobregat ha entrado en una fase de emergencia que no se veía desde 2008. Las restricciones no son solo simbólicas; los barcos cargados de agua desde Sagunto hasta el Puerto de Barcelona son ya una posibilidad logística real. En el sur, el Guadalquivir agoniza. El conflicto social es latente: mientras el campo pide más pozos, los ecologistas advierten de que los acuíferos están al borde del colapso. La tecnología ofrece soluciones como desaladoras, pero son caras y consumen mucha energía. $$ ,
    $$ Gobierno e instituciones apuestan por infraestructuras resilientes. El campo denuncia criminalización frente al turismo. $$ ,
    $$ Tres años de sequía acumulada y temperaturas récord. $$ ,
    $$ ["Encarecimiento de alimentos.", "Éxodo rural.", "Tensiones territoriales."] $$ ,
    $$ ["Menos hidroeléctrica.", "Presión sobre el PIB.", "Necesidad de un Pacto Nacional del Agua."] $$ ,
    $$ [
        {
            "id": "sequia-art-elpais",
            "source": "El País",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Manuel Planelles",
            "title": "La batalla por la última gota",
            "readerContent": {
                "whatHappened": "España se divide hoy entre quienes tienen el grifo garantizado por la desalinización y quienes dependen del cielo. En Barcelona, la emergencia limita el consumo a 200 litros por habitante. 'No estamos ante una sequía, estamos ante un cambio de clima'.",
                "context": "Plan de Gestión de Sequías avanzado pero superado por la realidad.",
                "claims": [{"text": "El agua regenerada es la esperanza.", "source": "Teresa Ribera"}],
                "preQuoteAnalysis": "Tono analítico sobre gestión pública.",
                "postQuoteAnalysis": "Subraya la necesidad de gobernanza técnica.",
                "implications": {"owner": "Encarecimiento del recibo del agua."},
                "blindSpot": "Coste energético de las desaladoras.",
                "interstitialNotes": [{"pos": 1, "text": "Enfoque institucional."}]
            }
        }
    ] $$,
    $$ [
        "1. EL AGUA COMO ACTIVO ESTRATÉGICO: Factor de producción crítico.",
        "2. DESALINIZACIÓN VS. REGENERACIÓN: Diferencia de costes y aceptación social.",
        "3. EL CONFLICTO TURÍSTICO: Tasa turística para agua.",
        "4. TECNOLOGÍA EN EL CAMPO: Digitalización del riego.",
        "5. GUERRAS TERRITORIALES: Tensiones entre autonomías.",
        "6. CIUDAD ESPONJA: Captación de lluvia urbana."
    ] $$
);

-- 2. EL PRADO: ERA DIGITAL
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'prado-era-digital-2025',
    'CULTURA',
    'El Prado 4.0: El museo nacional abraza la IA y el Big Data',
    'La pinacoteca lanza su nueva plataforma digital que utiliza IA para analizar pinceladas, crear rutas personalizadas y abrir archivos en 8K.',
    'hace 5 horas',
    'Madrid',
    45,
    '{"left": 10, "center": 80, "right": 10}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ El Museo del Prado ha dado un salto hacia el futuro. La nueva Era Digital implementa una arquitectura de datos para explorar obras de Velázquez o El Bosco con profundidad inédita. IA generativa y visión por computador permiten leer documentos históricos y realizar escaneos multiespectrales. $$ ,
    $$ Entusiasmo por la calidad técnica. Apertura de datos positiva. Duda sobre si canibalizará la visita física. $$ ,
    $$ [
        {"label": "Obras digitalizadas", "value": "12.000+"},
        {"label": "Resolución", "value": "Gigapíxel"},
        {"label": "Documentos", "value": "400.000"},
        {"label": "Inversión", "value": "15M€"}
    ] $$,
    $$ Información del Museo del Prado y Telefónica Tech. $$ ,
    $$ ["Museo del Prado", "Cultura", "Telefónica Tech"] $$,
    $$ ["EL MUNDO", "THE ART NEWSPAPER", "RTVE"] $$,
    $$ [{"name": "MEMORIA_DIGITAL_PRADO.PDF", "size": "8.4MB"}] $$,
    $$ ✓ Primer museo con archivos históricos completos abiertos.\n✓ IA para catalogación, no para creación.\n✓ Imágenes 8K libres para educación. $$ ,
    $$ Coste de mantenimiento de servidores y consumo energético masivo. $$ ,
    $$ {"beneficiados": "Investigadores y estudiantes.", "afectados": "Guías turísticos no oficiales."} $$ ,
    $$ ["¿VR sustituirá a la emoción real?", "¿NFTs oficiales?", "¿Detección de falsificaciones?"] $$ ,
    $$ La transformación digital del Prado permite una navegación semántica. El escaneo Gigapíxel permite ver grietas microscópicas y correcciones originales. Es una herramienta científica y estética. Rutas basadas en intereses personales mediante realidad aumentada hacen hablar a los personajes de los cuadros. $$ ,
    $$ Humanismo digital vs parque temático tecnológico. $$ ,
    $$ Fondos Next Generation EU. $$ ,
    $$ ["Acceso universal.", "Educación interactiva.", "Marca España."] $$ ,
    $$ ["Nuevo modelo de negocio.", "Conservación preventiva.", "Ecosistema tech-culture."] $$ ,
    $$ [
        {
            "id": "prado-art-rtve",
            "source": "RTVE",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Gema Alfaro",
            "title": "El Prado infinito",
            "readerContent": {
                "whatHappened": "Diseño minimalista y potencia abrumadora. La IA permite preguntar al museo. 'Si Velázquez viviera hoy, estaría experimentando con esto'.",
                "context": "3M visitas físicas vs objetivo 30M digitales.",
                "claims": [{"text": "Prado en el bolsillo.", "source": "Miguel Falomir"}],
                "preQuoteAnalysis": "Enfoque divulgativo.",
                "postQuoteAnalysis": "Cultura como servicio público.",
                "implications": {"owner": "Sustituye libros caros."},
                "blindSpot": "Ciberseguridad.",
                "interstitialNotes": [{"pos": 1, "text": "Web del año."}]
            }
        }
    ] $$,
    $$ [
        "1. VISIÓN POR COMPUTADOR: Comparativa de décadas.",
        "2. NETFLIX DEL ARTE: Suscripción a documentales.",
        "3. FIN BARRERA IDIOMÁTICA: Traducción neuronal.",
        "4. DATOS VS COLISEO: Gestión de flujos.",
        "5. COPIA DE SEGURIDAD: Legado en la nube.",
        "6. GAMIFICACIÓN: App para niños."
    ] $$
);

-- 3. ALTO EL FUEGO GAZA
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'gaza-alto-fuego-2024',
    'INTERNACIONAL',
    'Gaza: Hacia un alto el fuego permanente',
    'Negociaciones bajo mediación internacional para un plan de tres fases. Liberación de rehenes y reconstrucción total.',
    'hace 1 hora',
    'Gaza / Washington',
    156,
    '{"left": 40, "center": 30, "right": 30}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ Plan de tres fases: cese de hostilidades, liberación de rehenes y reconstrucción. Presión interna en Israel y situación humanitaria extrema en Gaza fuerzan el diálogo. Escollo: gobernanza post-conflicto. $$ ,
    $$ Necesidad de pausa inmediata. Soberanía y retirada total como puntos de conflicto. $$ ,
    $$ [
        {"label": "Rehenes", "value": "~100"},
        {"label": "Víctimas", "value": "40.000+"},
        {"label": "Reconstrucción", "value": "$50B"}
    ] $$,
    $$ Reportes ONU y Casa Blanca. $$ ,
    $$ ["ONU", "Catar", "Israel", "Hamás"] $$,
    $$ ["AL JAZEERA", "CNN", "HAARETZ"] $$,
    $$ [{"name": "PLAN_ONU.PDF", "size": "1.8MB"}] $$,
    $$ ✓ Respaldo ONU.\n✓ Israel acepta 'en principio' fase 1.\n✓ Hamás pide garantías internacionales. $$ ,
    $$ Situación en Cisjordania ignorada. $$ ,
    $$ {"beneficiados": "Civiles y familias de rehenes.", "afectados": "Extrema derecha israelí y líderes militares."} $$ ,
    $$ ["¿Quién paga la reconstrucción?", "¿Fuerza de paz?", "¿Sobrevivirá Netanyahu?"] $$ ,
    $$ Delicado equilibrio. Fase 1 de seis semanas. Desconfianza mutua: túneles vs bombardeos. Esfuerzo financiero global necesario. $$ ,
    $$ Prioridad salvar vidas vs riesgo de dejar a Hamás operativo. $$ ,
    $$ Post-7 de octubre. Crisis humanitaria sin precedentes. $$ ,
    $$ ["Generación traumatizada.", "Polarización en Israel.", "Sentimiento anti-occidental."] $$ ,
    $$ ["Alianzas en Oriente Medio.", "Legitimidad instituciones internacionales.", "Precios petróleo."] $$ ,
    $$ [
        {
            "id": "gaza-art-haaretz",
            "source": "Haaretz",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Amos Harel",
            "title": "Dilema de Netanyahu",
            "readerContent": {
                "whatHappened": "Test político máximo. El estamento militar pide el acuerdo; los socios ultra amenazan con caer el gobierno. 'Victoria total' es un eslogan imposible.",
                "context": "65% israelíes priorizan rehenes.",
                "claims": [{"text": "Cerca del trato.", "source": "EE.UU."}],
                "preQuoteAnalysis": "Crítica al gobierno.",
                "postQuoteAnalysis": "Rift político-militar.",
                "implications": {"owner": "Fin de pesadilla o amenaza nacional."},
                "blindSpot": "Dinámicas internas de Hamás.",
                "interstitialNotes": [{"pos": 1, "text": "Voz liberal israelí."}]
            }
        }
    ] $$,
    $$ [
        "1. FACTOR HEZBOLLÁH: Evitar frente norte.",
        "2. ESTADOS ÁRABES: Condición de Estado Palestino.",
        "3. TÚNELES: Complejidad mayor de la esperada.",
        "4. UNRWA: Clave para estabilidad social.",
        "5. DÍA DESPUÉS: Transición tecnocrática.",
        "6. ELECCIONES EE.UU.: Presión de Biden."
    ] $$
);

-- 4. IA GENERATIVA: EL AÑO DE LA REGULACIÓN Y LA INTEGRACIÓN
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'ia-generativa-2024',
    'TECNOLOGÍA',
    'IA Generativa 2024: De la fascinación a la utilidad y la ley',
    'La IA deja de ser un juguete para integrarse en el flujo de trabajo masivo. Entra en vigor la AI Act de la UE y se intensifica la batalla entre modelos abiertos y cerrados.',
    'hace 4 horas',
    'Silicon Valley / Bruselas',
    95,
    '{"left": 20, "center": 60, "right": 20}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ 2024 es el año en que la IA se vuelve invisible al estar en todas partes. La AI Act de la Unión Europea establece el primer marco legal del mundo para mitigar riesgos sin frenar la innovación. Mientras, empresas como OpenAI, Google y Anthropic compiten por el 'agente' definitivo capaz de razonar y actuar de forma autónoma. La tensión entre el código abierto (Llama) y los modelos propietarios marca la estrategia de las grandes tecnológicas. $$ ,
    $$ Hay consenso en que la IA transformará el mercado laboral. Se acepta la necesidad de regulación ética. La discrepancia es sobre el ritmo: ¿estamos frenando a Europa frente a EE.UU. y China? $$ ,
    $$ [
        {"label": "Mercado IA 2024", "value": "$150B+"},
        {"label": "Productividad", "value": "+40% en coding"},
        {"label": "Multas AI Act", "value": "Hasta 7% facturación"},
        {"label": "Nivel razonamiento", "value": "Humano (O1/Claude 3.5)"}
    ] $$,
    $$ Análisis de Gartner, informes de la Comisión Europea y whitepapers de laboratorios de IA. $$ ,
    $$ ["OpenAI", "UE AI Office", "Nvidia", "MIT"] $$,
    $$ ["WIRED", "THE VERGE", "FINANCIAL TIMES", "XATAKA"] $$,
    $$ [{"name": "EU_AI_ACT_FINAL.PDF", "size": "2.4MB"}] $$,
    $$ ✓ La AI Act prohíbe el scoring social y el reconocimiento facial indiscriminado.\n✓ Los modelos abiertos ya igualan a los cerrados en muchos benchmarks.\n✓ La IA consume ya el 2% de la electricidad global. $$ ,
    $$ Se infravalora el impacto psicológico de la desinformación generada por IA en procesos electorales inmediatos. $$ ,
    $$ {"beneficiados": "Desarrolladores de software; Nvidia; consultoras de transformación digital.", "afectados": "Creativos junior; perfiles administrativos; agencias de stock de imágenes."} $$ ,
    $$ ["¿Cuándo llegará la AGI?", "¿Quién es responsable de las alucinaciones?", "¿Serán los agentes IA nuestros nuevos jefes?"] $$ ,
    $$ La IA generativa ha pasado la fase del 'hype'. Ahora se trata de ROI (Retorno de Inversión). Las empresas ya no preguntan qué puede hacer la IA, sino cuánto cuesta integrarla de forma segura. El surgimiento de modelos con razonamiento avanzado (Chain of Thought) permite tareas complejas que antes requerían supervisión constante. La AI Act europea busca dar seguridad jurídica, pero el sector tech teme que la burocracia desplace el talento a Silicon Valley. La soberanía digital está en juego. $$ ,
    $$ Visión optimista sobre productividad vs precaución sobre riesgos existenciales y laborales. $$ ,
    $$ Post-lanzamiento de GPT-4. Elecciones globales masivas en 2024. $$ ,
    $$ ["Riesgo de deepfakes.", "Brecha digital de habilidades.", "Nuevas formas de educación."] $$ ,
    $$ ["Cambio en la arquitectura de Internet.", "Demanda masiva de centros de datos.", "Nueva geopolítica de los chips (Nvidia)."] $$ ,
    $$ [
        {
            "id": "ia-art-wired",
            "source": "Wired",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Steven Levy",
            "title": "La era del agente: La IA que ya no solo habla, sino que hace",
            "readerContent": {
                "whatHappened": "Estamos viendo el fin del 'chatbot'. Lo que viene son agentes que reservan tus vuelos, escriben tu código y gestionan tu agenda sin preguntarte. OpenAI y Anthropic están en una carrera por el razonamiento puro. 'Ya no es solo predecir la siguiente palabra, es predecir el siguiente paso lógico'.",
                "context": "Inversión de 10.000M en startups de agentes IA.",
                "claims": [{"text": "La IA será un colaborador, no una herramienta.", "source": "Sam Altman"}],
                "preQuoteAnalysis": "Enfoque en innovación de producto.",
                "postQuoteAnalysis": "Dudas sobre la autonomía sin control.",
                "implications": {"owner": "Ahorro de 10 horas semanales en tareas tediosas."},
                "blindSpot": "Impacto en la privacidad de los datos personales usados por agentes.",
                "interstitialNotes": [{"pos": 1, "text": "Análisis de vanguardia."}]
            }
        }
    ] $$,
    $$ [
        "1. RAZONAMIENTO VS MEMORIA: El salto a los modelos O1.",
        "2. COSTES ENERGÉTICOS: El desafío de la sostenibilidad.",
        "3. AI ACT: El experimento regulador europeo.",
        "4. AGENTES AUTÓNOMOS: La nueva interfaz de usuario.",
        "5. CÓDIGO ABIERTO: Llama 3 y la democratización.",
        "6. COPYRIGHT: La batalla legal con los creadores de contenido."
    ] $$
);

-- 5. PUERTOLLANO: HIDRÓGENO VERDE
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'puertollano-hidrogeno-2024',
    'ECONOMÍA',
    'Puertollano: El nuevo corazón del hidrógeno verde en Europa',
    'Inversión histórica de más de 470M€ para ampliar el complejo de hidrógeno renovable. España se posiciona como el hub energético del sur del continente.',
    'hace 6 horas',
    'Puertollano, Ciudad Real',
    38,
    '{"left": 10, "center": 80, "right": 10}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ Puertollano está viviendo una segunda revolución industrial. Iberdrola y Fertiberia lideran el mayor complejo de hidrógeno verde para uso industrial en Europa. Con las nuevas ayudas del IDAE (242M€), la planta alcanzará 220MW de electrólisis adicionales. Este proyecto no solo descarboniza la producción de fertilizantes, sino que convierte a Castilla-La Mancha en el centro de la 'Ruta del Hidrógeno' europea, atrayendo industria pesada que busca energía barata y limpia. $$ ,
    $$ Consenso en el valor estratégico para la soberanía energética. Apoyo institucional total. Duda sobre la rentabilidad real a corto plazo sin subvenciones continuas. $$ ,
    $$ [
        {"label": "Inversión total", "value": "+470M€"},
        {"label": "Capacidad electrólisis", "value": "240MW (Fase final)"},
        {"label": "Ayuda pública", "value": "242M€"},
        {"label": "CO2 evitado", "value": "48.000 t/año"}
    ] $$,
    $$ Datos del IDAE, Iberdrola y Gobierno de Castilla-La Mancha. $$ ,
    $$ ["Iberdrola", "Fertiberia", "MITECO", "IDAE"] $$,
    $$ ["EXPANSIÓN", "CINCO DÍAS", "RTVE"] $$,
    $$ [{"name": "PLAN_HIDROGENO_ESP_2030.PDF", "size": "5.6MB"}] $$,
    $$ ✓ Planta operativa más grande de Europa.\n✓ Uso de energía solar propia (100MW).\n✓ Destinado a amoniaco verde para agricultura. $$ ,
    $$ El transporte del hidrógeno (hidroductos) sigue siendo el gran cuello de botella logístico. $$ ,
    $$ {"beneficiados": "Industria química; empleo local en Puertollano; sector renovable.", "afectados": "Proveedores de gas natural tradicional."} $$ ,
    $$ ["¿Llegará el hidrógeno a ser competitivo sin ayudas?", "¿Puede España exportar hidrógeno al norte de Europa?", "¿Será Puertollano el nuevo Silicon Valley de la energía?"] $$ ,
    $$ De ciudad del carbón a ciudad del hidrógeno. Puertollano simboliza la transición justa. El proyecto usa electrólisis alimentada por una planta fotovoltaica de 100MW con almacenamiento por baterías. El hidrógeno resultante se inyecta en la planta de amoniaco de Fertiberia, eliminando la necesidad de gas natural. Esto es soberanía alimentaria y energética. La ampliación prevista para 2025-2026 situará a España a la vanguardia de la tecnología de electrólisis a escala industrial. $$ ,
    $$ Éxito de colaboración público-privada vs dependencia de fondos europeos. $$ ,
    $$ Crisis energética post-Ucrania y Pacto Verde Europeo. $$ ,
    $$ ["Renacimiento de una zona industrial deprimida.", "Empleo cualificado.", "Orgullo regional."] $$ ,
    $$ ["Descarbonización de la industria difícil de electrificar.", "Liderazgo tecnológico.", "Independencia del gas ruso/argelino."] $$ ,
    $$ [
        {
            "id": "puer-art-expansion",
            "source": "Expansión",
            "bias": "RIGHT",
            "fact": "ALTA",
            "author": "C. G. Bolinches",
            "title": "Puertollano: El Dorado del Hidrógeno",
            "readerContent": {
                "whatHappened": "La inversión de Iberdrola es una apuesta por el futuro del mix energético español. Puertollano ya no mira al suelo buscando carbón, mira al sol. El amoniaco verde es solo el principio. 'Estamos creando una industria desde cero'.",
                "context": "España aspira a producir el 20% del hidrógeno verde de la UE.",
                "claims": [{"text": "España es el país con más potencial de Europa.", "source": "Ignacio Galán"}],
                "preQuoteAnalysis": "Enfoque en rentabilidad y macroeconomía.",
                "postQuoteAnalysis": "Valoración de la seguridad jurídica para inversiones.",
                "implications": {"owner": "Energía más barata para la industria nacional."},
                "blindSpot": "Impacto en el precio del agua necesaria para la electrólisis en zonas con sequía.",
                "interstitialNotes": [{"pos": 1, "text": "Referencia económica."}]
            }
        }
    ] $$,
    $$ [
        "1. ELECTRÓLISIS A ESCALA: El reto de bajar costes.",
        "2. AMONIACO VERDE: Fertilizantes sin CO2.",
        "3. EL ROL DE LOS FONDOS IPCEI: Ayudas europeas clave.",
        "4. EMPLEO EN LA ESPAÑA INTERIOR: Fijar población.",
        "5. HIDRODUCTO PUERTOLLANO-HUELVA: La red logística.",
        "6. COMPETENCIA INTERNACIONAL: EE.UU. y sus subsidios masivos."
    ] $$
);

-- 6. REFORMA LEY SEGURIDAD CIUDADANA (LEY MORDAZA)
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'reforma-ley-mordaza-2024',
    'POLÍTICA',
    'Adiós a la Ley Mordaza: El pacto que desactiva los puntos más polémicos',
    'PSOE, Sumar y Bildu acuerdan la reforma de la Ley de Seguridad Ciudadana. Fin de las pelotas de goma, límites a las multas por faltas de respeto y fin de las devoluciones en caliente en frontera.',
    'hace 2 horas',
    'Madrid / Congreso',
    56,
    '{"left": 40, "center": 30, "right": 30}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ Tras una década de vigencia y años de bloqueo parlamentario, la 'Ley Mordaza' llega a su fin. El acuerdo entre los socios de gobierno y sus aliados parlamentarios toca el núcleo de la norma: se prohíben las pelotas de goma, se acaba con la arbitrariedad de las sanciones por 'desobediencia' y se reforman las devoluciones en caliente para cumplir con los estándares internacionales. Para sus defensores, es recuperar libertades civiles; para sus detractores, es desproteger a las fuerzas de seguridad ante la violencia callejera. $$ ,
    $$ Consenso en que la ley de 2015 era excesivamente punitiva. Acuerdo en la necesidad de proporcionalidad. Discrepancia total sobre los medios antidisturbios y el principio de autoridad de los agentes. $$ ,
    $$ [
        {"label": "Artículos reformados", "value": "36"},
        {"label": "Multas anuladas (Est)", "value": "15%"},
        {"label": "Apoyo parlamentario", "value": "178 votos"},
        {"label": "Años de vigencia", "value": "9 (2015-2024)"}
    ] $$,
    $$ Texto del acuerdo parlamentario y boletines oficiales. $$ ,
    $$ ["PSOE", "Sumar", "Bildu", "Sindicatos Policiales (JUPOL/SUP)", "Amnistía Internacional"] $$,
    $$ ["EL PAÍS", "EL MUNDO", "RTVE", "PÚBLICO"] $$,
    $$ [{"name": "ACUERDO_REFORMA_SEGURIDAD.PDF", "size": "0.9MB"}] $$,
    $$ ✓ Se elimina el uso de pelotas de goma progresivamente.\n✓ Las multas se graduarán según la renta del sancionado.\n✓ Grabar a la policía deja de ser infracción si no pone en riesgo su seguridad. $$ ,
    $$ No se aborda cómo afectará la falta de medios antidisturbios a la contención de protestas violentas o asaltos masivos a la valla. $$ ,
    $$ {"beneficiados": "Manifestantes y activistas; periodistas; colectivos migrantes.", "afectados": "Agentes de policía que se sienten desamparados legalmente."} $$ ,
    $$ ["¿Habrá un aumento de la conflictividad callejera?", "¿Qué material sustituirá a las pelotas de goma?", "¿Aceptará el Tribunal Constitucional la reforma?"] $$ ,
    $$ La reforma es un hito político. Lo más relevante es la modificación del artículo 37.4, que sancionaba las 'faltas de respeto'. Ahora, el insulto o la falta de respeto solo será sancionable si es 'grave y contrastable', evitando multas arbitrarias. En frontera, se establece el derecho a solicitar asilo antes de cualquier rechazo, lo que choca con la política de 'tolerancia cero' en la valla. Los sindicatos policiales han anunciado movilizaciones, considerando que la reforma es una 'moneda de cambio política' que pone en riesgo su integridad física. $$ ,
    $$ Recuperación de derechos democráticos vs desprotección policial y riesgo de orden público. $$ ,
    $$ Ley del PP de 2015 muy criticada por organismos internacionales. $$ ,
    $$ ["Menos miedo a la protesta social.", "Mayor transparencia en actuaciones policiales.", "Conflicto abierto Gobierno-Policía."] $$ ,
    $$ ["Cambio en la doctrina de seguridad nacional.", "Alineación con el Consejo de Europa.", "Tensión interna en el bloque de investidura."] $$ ,
    $$ [
        {
            "id": "mordaza-art-publico",
            "source": "Público",
            "bias": "LEFT",
            "fact": "ALTA",
            "author": "Alexis Romero",
            "title": "El fin del autoritarismo del PP",
            "readerContent": {
                "whatHappened": "Se acaba la era de la impunidad policial. El acuerdo con Bildu desbloquea los puntos que el PSOE se resistía a tocar. Las pelotas de goma, que han dejado a decenas de personas ciegas, pasan a la historia. Es un triunfo de la sociedad civil.",
                "context": "Amnistía Internacional pedía esta reforma desde hace 8 años.",
                "claims": [{"text": "Es una ley para una democracia del siglo XXI.", "source": "Mertxe Aizpurua (Bildu)"}],
                "preQuoteAnalysis": "Tono reivindicativo.",
                "postQuoteAnalysis": "Enfoque en libertades públicas.",
                "implications": {"owner": "Libertad de expresión real."},
                "blindSpot": "Dificultad de aplicación en entornos de frontera.",
                "interstitialNotes": [{"pos": 1, "text": "Visión progresista."}]
            }
        }
    ] $$,
    $$ [
        "1. PELOTAS DE GOMA: El fin de un arma controvertida.",
        "2. GRADUALIDAD DE MULTAS: Justicia redistributiva en las sanciones.",
        "3. PRINCIPIO DE VERACIDAD: Se limita el valor absoluto de la palabra del agente.",
        "4. DERECHO A GRABAR: Protección al periodismo ciudadano.",
        "5. RECHAZO EN FRONTERA: Cumplir con el TEDH.",
        "6. EL CONFLICTO POLICIAL: La calle contra el despacho."
    ] $$
);

-- ==========================================================
-- SUPER SEED: ACTUALIDAD ESPAÑA (PARTE 2)
-- ==========================================================

-- 7. ECONOMÍA ESPAÑOLA 2.4%
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'economia-españa-24',
    'ECONOMÍA',
    'España acelera: La economía crecerá un 2.4% en 2024, liderando la Eurozona',
    'El Banco de España y la OCDE elevan las previsiones. El consumo interno, el turismo récord y los fondos europeos compensan la debilidad de Alemania y Francia.',
    'hace 1 día',
    'Madrid / Bruselas',
    42,
    '{"left": 20, "center": 60, "right": 20}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ España se ha convertido en el motor de crecimiento de la Unión Europea. Mientras el centro del continente roza la recesión, la economía española muestra una resiliencia sorprendente. La revisión al alza hasta el 2.4% se apoya en un mercado laboral dinámico (récord de 21 millones de afiliados) y una inflación que, aunque persistente en servicios, está por debajo de la media europea. La gran duda es si este crecimiento 'por cantidad' (más empleo) puede transformarse en crecimiento 'por calidad' (más productividad). $$ ,
    $$ Consenso en la buena marcha de las cifras macro. Acuerdo en que el turismo es el pilar fundamental. Discrepancia sobre la sostenibilidad de la deuda pública y el impacto real de los fondos NextGen en la economía real. $$ ,
    $$ [
        {"label": "Crecimiento PIB", "value": "2.4%"},
        {"label": "Afiliados SS", "value": "21.3M"},
        {"label": "Paro", "value": "11.5%"},
        {"label": "Deuda/PIB", "value": "105%"}
    ] $$,
    $$ Datos del INE, Banco de España y AIReF. $$ ,
    $$ ["INE", "Banco de España", "OCDE", "Eurostat"] $$,
    $$ ["EL PAÍS", "EL MUNDO", "EXPANSIÓN", "FINANCIAL TIMES"] $$,
    $$ [{"name": "INFORME_ANUAL_BANCO_ESP.PDF", "size": "7.2MB"}] $$,
    $$ ✓ España crece 3 veces más rápido que la media de la Eurozona.\n✓ El sector servicios aporta el 70% del crecimiento.\n✓ La inversión empresarial sigue por debajo de niveles pre-pandemia. $$ ,
    $$ Se menciona poco que el crecimiento está muy ligado al aumento de población (migración), lo que mantiene el PIB per cápita casi estancado. $$ ,
    $$ {"beneficiados": "Sector servicios y hostelería; Gobierno (más recaudación); grandes empresas del IBEX.", "afectados": "Familias con hipotecas variables (tipos altos); pequeñas empresas con costes al alza."} $$ ,
    $$ ["¿Es este crecimiento sostenible sin el turismo?", "¿Bajará el paro del 10%?", "¿Cuándo se notará el alivio en los tipos de interés?"] $$ ,
    $$ España vive un 'momento dulce' macroeconómico. La reforma laboral ha estabilizado el empleo, y la subida del SMI ha impulsado el consumo de las rentas bajas. Sin embargo, la productividad es la asignatura pendiente: España produce lo mismo con más gente, en lugar de producir más con la misma gente. La ejecución de los fondos europeos está en su fase crítica: 2024 y 2025 deben ser los años en que los PERTE (vehículo eléctrico, microchips, salud) den resultados tangibles. Si no, España corre el riesgo de volver a un modelo de ladrillo y sol cuando el ciclo europeo mejore. $$ ,
    $$ Optimismo oficial vs cautela técnica por la baja inversión privada y deuda. $$ ,
    $$ Salida de la crisis inflacionista y tipos de interés en máximos de 20 años. $$ ,
    $$ ["Mejor percepción de seguridad laboral.", "Aumento del coste de vida que anula las subidas salariales.", "Desigualdad territorial."] $$ ,
    $$ ["España como refugio de inversión en la UE.", "Presión para cumplir las reglas fiscales en 2025.", "Transformación del mercado laboral."] $$ ,
    $$ [
        {
            "id": "eco-art-elpais",
            "source": "El País",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Hugo Gutiérrez",
            "title": "España, la excepción positiva",
            "readerContent": {
                "whatHappened": "Las cifras no mienten: España vuela. El tirón de las exportaciones de servicios no turísticos (consultoría, ingeniería) empieza a ser tan importante como las playas. El Banco de España reconoce que la economía es más sólida de lo previsto. 'Hemos aguantado el choque de los tipos de interés mejor que Alemania'.",
                "context": "Previsión de crecimiento de la Eurozona: 0.8%.",
                "claims": [{"text": "España es un motor de confianza.", "source": "Carlos Cuerpo, Ministro"}],
                "preQuoteAnalysis": "Enfoque equilibrado y constructivo.",
                "postQuoteAnalysis": "Destaque de la diversificación económica.",
                "implications": {"owner": "Mayor estabilidad para planes de ahorro."},
                "blindSpot": "Impacto de la vivienda en la renta disponible.",
                "interstitialNotes": [{"pos": 1, "text": "Análisis macro."}]
            }
        }
    ] $$,
    $$ [
        "1. EL TURISMO RÉCORD: Más allá de los 85M de visitantes.",
        "2. CONSUMO DE LAS FAMILIAS: El ahorro embalsado se libera.",
        "3. EL ENIGMA DE LA PRODUCTIVIDAD: El reto del sector tecnológico.",
        "4. MERCADO LABORAL: Del paro estructural a la falta de mano de obra.",
        "5. REGLAS FISCALES: El regreso de la austeridad controlada en 2025.",
        "6. INVERSIÓN PÚBLICA: El impacto de los PERTE."
    ] $$
);

-- 8. LEY ALQUILERES: ZONAS TENSIONADAS
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'ley-alquileres-tension-2024',
    'ECONOMÍA',
    'La guerra del alquiler: Cataluña aplica el límite de precios y el resto de España observa',
    'Entra en vigor el índice de precios en 140 municipios catalanes. El Ministerio de Vivienda publica el sistema de referencia nacional mientras Madrid y Andalucía se niegan a aplicarlo.',
    'hace 7 horas',
    'Barcelona / Madrid',
    78,
    '{"left": 40, "center": 20, "right": 40}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1582408921715-18e7806367c1?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ La Ley de Vivienda vive su momento de la verdad. Por primera vez, una administración (la Generalitat) utiliza las herramientas legales para topar los precios del alquiler en zonas 'tensionadas'. La medida busca frenar una escalada que impide el acceso a la vivienda a jóvenes y rentas medias. El sector inmobiliario advierte de una retirada masiva de oferta y un trasvase al alquiler de temporada para esquivar la ley. Madrid se posiciona como el contrapunto liberal, fiándolo todo al aumento de la oferta mediante la liberalización de suelo. $$ ,
    $$ Consenso en que el precio del alquiler es el principal problema social de España. Acuerdo en que falta parque público de vivienda. Discrepancia total sobre si el control de precios soluciona o agrava el problema a largo plazo. $$ ,
    $$ [
        {"label": "Municipios tensionados", "value": "140 (CAT)"},
        {"label": "Subida media alquiler", "value": "+10% anual"},
        {"label": "Esfuerzo financiero", "value": "45% del sueldo"},
        {"label": "Vivienda social", "value": "2.5% (Media UE 9%)"}
    ] $$,
    $$ BOE, DOGC y portales inmobiliarios (Idealista/Fotocasa). $$ ,
    $$ ["Ministerio de Vivienda", "Generalitat", "Sindicat de Llogateras", "ASVAL (Propietarios)"] $$,
    $$ ["LA VANGUARDIA", "EL MUNDO", "EL PERIÓDICO", "ABC"] $$,
    $$ [{"name": "INDICE_PRECIOS_ALQUILER.PDF", "size": "1.5MB"}] $$,
    $$ ✓ El tope solo afecta a grandes tenedores y contratos nuevos en zonas tensionadas.\n✓ El alquiler de temporada no está regulado por esta ley (vacío legal).\n✓ Madrid ha anunciado que recurrirá la ley ante el Constitucional. $$ ,
    $$ El impacto del alquiler turístico (Airbnb) en la desaparición de oferta residencial permanente se ignora a menudo en favor del debate sobre el tope de precios. $$ ,
    $$ {"beneficiados": "Inquilinos actuales en zonas tensionadas; movimientos sociales.", "afectados": "Pequeños propietarios que temen perder rentabilidad; agencias inmobiliarias."} $$ ,
    $$ ["¿Caerá la oferta de alquiler un 20% como dicen los portales?", "¿Es el alquiler de temporada el fin de la ley?", "¿Construirá el Estado las 180.000 viviendas prometidas?"] $$ ,
    $$ El experimento catalán será el laboratorio de España. Si los precios bajan sin que la oferta se hunda, el Gobierno tendrá un argumento electoral imbatible. Si por el contrario, los pisos desaparecen del mercado para irse al alquiler turístico o de habitaciones, la ley habrá fracasado. El problema de fondo es estructural: 30 años de falta de inversión en vivienda pública y un modelo de ahorro basado en el ladrillo. La tensión política entre el Gobierno central y las comunidades del PP garantiza un mapa de España con dos realidades inmobiliarias opuestas, lo que podría generar trasvases de población y capital entre regiones. $$ ,
    $$ Intervención necesaria para garantizar un derecho vs ataque a la propiedad privada y distorsión de mercado. $$ ,
    $$ Precios en máximos históricos y crisis de acceso para jóvenes (media de emancipación 30 años). $$ ,
    $$ ["Alivio financiero para miles de familias.", "Riesgo de 'mercado negro' en alquileres.", "Aumento de la conflictividad propietario-inquilino."] $$ ,
    $$ ["Cambio en la estrategia de los fondos de inversión inmobiliaria.", "Necesidad de reformar la LAU para cerrar el vacío del alquiler de temporada.", "Presión sobre el sistema bancario e hipotecario."] $$ ,
    $$ [
        {
            "id": "viv-art-lavanguardia",
            "source": "La Vanguardia",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Luis Federico Florio",
            "title": "Barcelona estrena el control de precios",
            "readerContent": {
                "whatHappened": "Primer día de la nueva era. Los portales inmobiliarios ya muestran avisos sobre el índice de referencia. La incertidumbre es total. Algunos propietarios han decidido retirar el anuncio para 'pensárselo'. El Sindicato de Inquilinos lo celebra como un hito histórico. 'Se acabó el chantaje'.",
                "context": "Barcelona tiene el alquiler medio más alto de España (1.200€).",
                "claims": [{"text": "Es una medida valiente para proteger a la gente.", "source": "Ester Capella (Generalitat)"}],
                "preQuoteAnalysis": "Enfoque descriptivo de la realidad urbana.",
                "postQuoteAnalysis": "Equilibrio entre la esperanza social y el temor económico.",
                "implications": {"owner": "Contratos más largos y estables."},
                "blindSpot": "Inexistencia de sanciones reales inmediatas para quien se salte el índice.",
                "interstitialNotes": [{"pos": 1, "text": "Crónica de ciudad."}]
            }
        }
    ] $$,
    $$ [
        "1. EL ÍNDICE DE REFERENCIA: Cómo se calcula y a quién afecta.",
        "2. GRANDES TENEDORES: La definición que lo cambia todo.",
        "3. ALQUILER DE TEMPORADA: El refugio de la oferta.",
        "4. IMPACTO EN LA REFORMA: ¿Se dejará de invertir en mejorar los pisos?",
        "5. LA VIVIENDA PÚBLICA: La única solución a largo plazo.",
        "6. EL RECURSO AL CONSTITUCIONAL: La inseguridad jurídica."
    ] $$
);

-- 9. HUELGA SANIDAD PÚBLICA: EL COLAPSO DEL MODELO
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'huelga-sanidad-2024',
    'SOCIEDAD',
    'Batas blancas en pie de guerra: Huelga indefinida en la sanidad pública',
    'Médicos y enfermeros de Atención Primaria inician paros ante la sobrecarga asistencial y la falta de presupuesto. El conflicto se enquista en Madrid y Galicia mientras las listas de espera baten récords.',
    'hace 10 horas',
    'Madrid / Santiago / Valencia',
    51,
    '{"left": 40, "center": 30, "right": 30}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    'published',
    $$ La joya de la corona del Estado del Bienestar español muestra síntomas de agotamiento severo. La huelga indefinida no es solo por salarios, es por el tiempo por paciente (reivindican 10 minutos mínimo) y la falta de relevo generacional. Con miles de plazas de MIR vacantes en medicina de familia y una fuga de cerebros hacia el sector privado o el extranjero, el sistema se sostiene por el sobreesfuerzo de sus profesionales. El debate político es feroz: la izquierda acusa a los gobiernos autonómicos de derechas de querer privatizar el sistema; la derecha acusa al Gobierno central de no financiar suficientemente a las comunidades y no crear más plazas de formación. $$ ,
    $$ Consenso en que la Atención Primaria está al borde del colapso. Acuerdo en la necesidad de subir la inversión al 7% del PIB. Discrepancia sobre el modelo de gestión (público-privado) y la responsabilidad política del déficit de profesionales. $$ ,
    $$ [
        {"label": "Pacientes/día", "value": "50-60 (Cita previa)"},
        {"label": "Listas de espera", "value": "800.000 personas (Cirugía)"},
        {"label": "Inversión Salud", "value": "6.8% PIB (Media UE 7.5%)"},
        {"label": "Fuga de médicos", "value": "2.500/año al extranjero"}
    ] $$,
    $$ Informes del Ministerio de Sanidad y sindicatos médicos (AMYTS/SATSE). $$ ,
    $$ ["Ministerio de Sanidad", "Sindicato Médico", "FADSP", "Consejerías de Salud"] $$,
    $$ ["EL PAÍS", "EL MUNDO", "ABC", "CADENA SER"] $$,
    $$ [{"name": "INFORME_SITUACION_SANIDAD_2024.PDF", "size": "4.1MB"}] $$,
    $$ ✓ España tiene una de las esperanzas de vida más altas pero con menor inversión per cápita que Alemania o Francia.\n✓ La sanidad privada ha crecido un 15% en usuarios desde la pandemia.\n✓ Faltan 5.000 médicos de familia de forma inmediata. $$ ,
    $$ Se habla poco del impacto de la burocracia: los médicos pasan el 30% de su tiempo rellenando informes en lugar de atendiendo. $$ ,
    $$ {"beneficiados": "Aseguradoras de salud privadas; clínicas privadas.", "afectados": "Pacientes crónicos y ancianos; profesionales exhaustos; familias con rentas bajas."} $$ ,
    $$ ["¿Sobrevivirá el modelo universal y gratuito?", "¿Es la sanidad privada el único refugio?", "¿Habrá un pacto nacional por la sanidad?"] $$ ,
    $$ El conflicto es sistémico. La pandemia fue el detonante, pero la mecha era la desinversión desde 2012. Los médicos denuncian 'maltrato institucional' con contratos por días o semanas. La huelga busca forzar un cambio de modelo que recupere la Atención Primaria como base del sistema, evitando que las urgencias hospitalarias colapsen por casos leves. Mientras tanto, el sector privado vive un boom, convirtiéndose en una sanidad 'de dos velocidades': quien puede pagarlo tiene cita mañana; quien no, espera meses. Esto rompe la equidad, pilar fundamental de la cohesión social en España. $$ ,
    $$ Defensa de lo público como derecho vs necesidad de colaboración privada para reducir listas de espera. $$ ,
    $$ Herencia de la crisis de 2008 y desgaste post-COVID. $$ ,
    $$ ["Aumento de la mortalidad evitable por retrasos en diagnóstico.", "Desgaste psicológico de los sanitarios (Burnout).", "Pérdida de confianza en las instituciones."] $$ ,
    $$ ["Riesgo de colapso del sistema público de pensiones y salud por envejecimiento.", "Necesidad de una nueva ley de gestión sanitaria.", "Debate sobre la centralización de competencias."] $$ ,
    $$ [
        {
            "id": "san-art-ser",
            "source": "Cadena SER",
            "bias": "LEFT",
            "fact": "ALTA",
            "author": "Mariola Lourido",
            "title": "Voces desde la consulta: 'No podemos más'",
            "readerContent": {
                "whatHappened": "Micrófonos en los centros de salud. La sensación es de impotencia. Médicos que lloran tras la jornada. 'Atender a una persona en 3 minutos no es medicina, es despacho de recetas'. La huelga es la última medida tras años de avisos ignorados.",
                "context": "Madrid es la comunidad con menos inversión en Primaria por habitante.",
                "claims": [{"text": "La sanidad pública se defiende, no se vende.", "source": "Lema de la manifestación"}],
                "preQuoteAnalysis": "Tono empático con los profesionales.",
                "postQuoteAnalysis": "Crítica a la gestión política presupuestaria.",
                "implications": {"owner": "Retrasos en citas de especialistas de hasta un año."},
                "blindSpot": "La falta de médicos es un problema europeo, no solo español.",
                "interstitialNotes": [{"pos": 1, "text": "Crónica humana."}]
            }
        }
    ] $$,
    $$ [
        "1. LA ATENCIÓN PRIMARIA: El muro de contención roto.",
        "2. EL ÉXODO DE PROFESIONALES: Mejores sueldos en Europa.",
        "3. EL BOOM DE LOS SEGUROS PRIVADOS: 12 millones de españoles ya tienen uno.",
        "4. PLAZAS MIR: El desajuste entre formación y necesidad.",
        "5. ENVEJECIMIENTO: La tormenta perfecta de demanda.",
        "6. TELEMEDICINA: ¿Solución o parche deshumanizador?"
    ] $$
);

-- ==========================================================
-- FIN DEL SUPER SEED COMPLETO
-- ==========================================================
