-- ==========================================================
-- SUPER SEED: La Noticia Perfecta (Ley de Vivienda)
-- Este script inserta una noticia con profundidad editorial total
-- ==========================================================

-- 0. ASEGURAR COLUMNAS FALTANTES
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS articles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS perspectives jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cronologia_info jsonb DEFAULT '[]'::jsonb;

-- 1. LIMPIEZA
DELETE FROM public.stories WHERE title LIKE '%vivienda%';

-- 2. INSERCIÓN DE LA HISTORIA MAESTRA
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
    status,
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
    full_content,
    perspectivas_info,
    contexto,
    impacto_social,
    impacto_sistemico,
    articles
) VALUES (
    'vivienda-master-2024',
    'POLÍTICA',
    'El Gobierno de España aprueba una nueva ley de vivienda para limitar alquileres',
    'Se ha aprobado un marco regulatorio para las zonas tensionadas en las principales ciudades españolas, buscando frenar la escalada de precios mediante un índice de referencia y topes del 3% anual.',
    'hace 2 horas',
    'Madrid, España',
    42,
    '{"left": 45, "center": 30, "right": 25}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=800',
    'published',
    -- RESUMEN EDITORIAL
    'La nueva Ley de Vivienda es la primera regulación estatal de este tipo en la democracia española. Representa un giro estructural desde una visión de la vivienda como activo de inversión hacia su consideración como derecho social protegido. Aunque los topes de precios son la medida más mediática, el verdadero cambio reside en la definición de "gran tenedor" y en las nuevas garantías procesales contra desahucios en zonas declaradas de mercado tensionado por las CC.AA.',
    -- CONSENSO NARRATIVO (SIDEBAR & COBERTURA)
    'Conquista social histórica que protege al inquilino frente a la especulación desenfrenada en las grandes capitales. | Necesidad técnica de equilibrar el mercado ante el aumento descontrolado de precios, analizando la efectividad a largo plazo. | Ataque frontal a la propiedad privada y a la seguridad jurídica que provocará una contracción inmediata de la oferta.',
    -- CIFRAS CLAVE (DATOS)
    '[
        {"label": "Tope anual alquiler", "value": "3.0%"},
        {"label": "Hogares beneficiados", "value": "2.4M"},
        {"label": "Vigencia", "value": "2024-2027"},
        {"label": "Gran tenedor", "value": "5 viviendas"},
        {"label": "Incentivo IRPF", "value": "Hasta 90%"},
        {"label": "Zonas tensionadas", "value": "250 municipios"}
    ]'::jsonb,
    -- VERIFICACIÓN (DATOS)
    'Los datos han sido contrastados con el Real Decreto-Ley 12/2024 publicado en el BOE. Se ha verificado la correlación entre las exenciones fiscales prometidas y los tipos impositivos actuales. Los impactos en el ahorro medio han sido proyectados por el Ministerio de Vivienda a partir de datos del Catastro.',
    -- ORIGEN (FUENTES)
    '["Boletín Oficial del Estado (BOE)", "Ministerio de Vivienda y Agenda Urbana", "Consejo General del Poder Judicial", "Eurostat"]'::jsonb,
    -- MEDIOS ANALIZADOS (FUENTES)
    '["EL PAÍS", "EL MUNDO", "ABC", "LA VANGUARDIA", "ELDIARIO.ES", "RTVE", "EXPANSIÓN", "CINCO DÍAS"]'::jsonb,
    -- DOCUMENTOS
    '[{"name": "RD-LEY_VIVIENDA_2024.PDF", "size": "1.2MB"}, {"name": "MEMORIA_IMPACTO.PDF", "size": "850KB"}]'::jsonb,
    -- FACT CHECK
    '✓ El límite del 3% es una medida transitoria para 2024.\n✓ Los honorarios de inmobiliaria pasan a ser gasto del propietario.\n✓ Se prohíbe el uso de "recargos" no pactados en el contrato para evitar el tope.',
    -- BLIND SPOT (SIDEBAR)
    'La ley no regula el alquiler de temporada ni el alquiler vacacional (Airbnb), lo que permite a muchos propietarios migrar sus viviendas a estos mercados no regulados para esquivar legalmente los topes de precios.',
    -- PROTAGONISTAS
    '{"beneficiados": "Jóvenes menores de 35 años; familias monoparentales; inquilinos atrapados en zonas tensionadas.", "afectados": "Socimis (vehículos de inversión); propietarios con más de 5 inmuebles; agencias de intermediación."}'::jsonb,
    -- PREGUNTAS ABIERTAS
    '["¿Cómo afectará a la inversión en vivienda nueva?", "¿Habrá un trasvase masivo al mercado negro?", "¿Se aplicará en CC.AA. gobernadas por la oposición?"]'::jsonb,
    -- +INFO > GENERAL
    'La aprobación definitiva de la Ley por el Derecho a la Vivienda supone el cumplimiento de uno de los compromisos centrales de la coalición de Gobierno. El texto legal establece que el acceso a una vivienda digna debe estar por encima de los intereses puramente comerciales en situaciones de mercado roto.\n\nUna de las claves técnicas es la declaración de zonas de mercado residencial tensionado. Para ello, debe cumplirse que el coste medio de la hipoteca o del alquiler supere el 30% de los ingresos medios de los hogares de la zona, o que el precio haya subido al menos 3 puntos por encima del IPC en los últimos cinco años.\n\nEn estas zonas, los contratos de alquiler vigentes podrán prorrogarse con las mismas condiciones durante tres años. Además, los precios de los nuevos contratos no podrán superar el precio del contrato anterior, o el índice de referencia que publique el Gobierno para grandes tenedores.',
    -- +INFO > PERSPECTIVAS
    'Incluso dentro del bloque que apoya la ley, existen matices importantes. Sumar defiende que la ley debería ser aún más restrictiva con los alquileres turísticos, mientras que el PSOE enfatiza los incentivos fiscales como vía para convencer a los pequeños propietarios.\n\nDesde el sector empresarial, las patronales inmobiliarias argumentan que la ley creará un "invierno inversor". Señalan países como Portugal o Alemania donde medidas similares habrían tenido efectos mixtos o negativos en la oferta. Por otro lado, sindicatos de inquilinos consideran que el límite del 3% es un éxito pero lamentan que no se aplique de forma retroactiva a todos los alquileres existentes de forma automática.',
    -- CONTEXTO
    'España ha vivido una década de encarecimiento del alquiler sin precedentes, especialmente en ciudades como Barcelona, Madrid, Valencia y Málaga. Desde la crisis de 2008, la propiedad se ha vuelto inalcanzable para la mayoría de los jóvenes menores de 30 años, cuya tasa de emancipación es de las más bajas de Europa.\n\nLa estructura del mercado español es peculiar: el 90% de las viviendas de alquiler están en manos de particulares (pequeños propietarios), a diferencia de otros países europeos donde los fondos de pensiones y grandes corporaciones tienen mayor peso. Esto hace que la implementación de controles de precios sea técnicamente compleja y políticamente sensible.',
    -- IMPACTO SOCIAL
    '["Reducción drástica del riesgo de desahucios sin aviso previo para familias vulnerables.", "Aumento de la renta disponible para 2.4 millones de hogares inquilinos en España.", "Fomento del alquiler de larga duración frente al de corto plazo mediante beneficios fiscales."]'::jsonb,
    -- IMPACTO SISTÉMICO
    '["Migración masiva de capitales del sector inmobiliario residencial hacia el hotelero o logístico.", "Posible proliferación de alquileres fraudulentos (''por habitaciones'') para evadir el Real Decreto.", "Descentralización política: conflicto competencial entre el Estado y las Comunidades Autónomas."]'::jsonb,
    
    -- ARTÍCULOS RELACIONADOS (readerContent + full text)
    '[
        {
            "id": "art-eldiario-001",
            "source": "elDiario.es",
            "bias": "LEFT",
            "fact": "ALTA",
            "author": "Raquel Pérez",
            "time": "hace 1 hora",
            "title": "La ley que rompe con el tabú del mercado inmobiliario en España",
            "readerContent": {
                "whatHappened": "Después de tres años de negociaciones tortuosas, el Congreso ha dado luz verde a la primera Ley de Vivienda de la historia de nuestra democracia. Por primera vez, el Estado tiene herramientas coherentes para intervenir en un mercado que ha dejado a miles de personas en la calle o con deudas de por vida.\n\nEsta ley no es solo un conjunto de artículos técnicos; es un manifiesto político que dice alto y claro que poner un techo sobre la cabeza no es una mercancía más, sino un derecho humano fundamental que el Estado debe garantizar por encima de las rentabilidades de dos dígitos que buscan los fondos buitres en nuestras grandes capitales.",
                "context": "Venimos de una Ley de Arrendamientos Urbanos (LAU) que fue reformada en 2013 para favorecer la rotación y la subida de precios. Aquella reforma de la era de Rajoy dejó a los inquilinos totalmente desamparados, con contratos que apenas duraban tres años. Esta nueva ley pretende revertir décadas de desequilibrio en favor del capital frente al trabajo.",
                "claims": [
                    {"text": "Es el avance social más importante de la legislatura.", "source": "Ministra de Vivienda"},
                    {"text": "El mercado no se regula solo; se regula para los fuertes.", "source": "Sindicato de Inquilinos"}
                ],
                "preQuoteAnalysis": "La narrativa de elDiario subraya la victoria de los movimientos sociales y el papel regulador del Estado como garante de justicia distributiva.",
                "postQuoteAnalysis": "El enfoque prioriza al sujeto político del ''inquilino precario'', ignorando casi por completo las quejas de los pequeños ahorradores que ven su segunda vivienda como su única jubilación.",
                "implications": {
                    "owner": "Los propietarios particulares que acepten bajar el precio recibirán bonificaciones en el IRPF que pueden llegar al 90%, compensando en parte la pérdida de ingresos brutos con ahorro fiscal neto."
                },
                "blindSpot": "No menciona el efecto que la limitación de precios ha tenido en San Francisco o Estocolmo donde las listas de espera para conseguir un piso superan los 10 años.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Este artículo de elDiario.es utiliza un lenguaje marcadamente social, empleando términos como ''especulación'' y ''fondos buitre'' con alta frecuencia para encuadrar el conflicto."},
                    {"pos": 2, "text": "Dato TNE: Se observa una omisión sistémica de los argumentos técnicos sobre la movilidad laboral que se ve perjudicada por los controles de precios rígidos."}
                ]
            }
        },
        {
            "id": "art-rtve-001",
            "source": "RTVE Noticias",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Servicios Informativos",
            "time": "hace 45 min",
            "title": "Claves de la nueva Ley de Vivienda: del tope del 3% a los desahucios",
            "readerContent": {
                "whatHappened": "La nueva normativa estatal por el derecho a la vivienda entrará en vigor de forma inmediata tras su publicación en el BOE. Las CC.AA. tienen ahora la potestad de declarar zonas tensionadas. Bajo este nuevo marco legal, se establecen límites a las subidas anuales de los contratos de alquiler, que no podrán superar el 3% durante todo el año 2024, desacoplándose así definitivamente del IPC.\n\nAdemás, se redefine la figura del gran tenedor, permitiendo a las regiones bajar el umbral de 10 a 5 viviendas en propiedad para ser considerados como tales, lo que les obliga a aceptar precios intervenidos en determinadas circunstancias.",
                "context": "El texto final fue acordado in extremis entre el PSOE, Sumar, ERC y Bildu. El debate ha estado marcado por la necesidad de dar respuesta a un problema de estado que afecta a la inflación y a la movilidad laboral, pero respetando las competencias autonómicas que la Constitución otorga a las regiones en materia urbanística.",
                "claims": [
                    {"text": "Ofrece seguridad y estabilidad a millones de familias.", "source": "Portavocía del Gobierno"},
                    {"text": "Vamos a analizar los recursos ante el Tribunal Constitucional.", "source": "Comunidades del PP"}
                ],
                "preQuoteAnalysis": "RTVE mantiene un perfil descriptivo, centrándose en el mecanismo legal y el proceso parlamentario sin adjetivos valorativos.",
                "postQuoteAnalysis": "Se da voz equitativa tanto a los argumentos del ejecutivo como a las críticas de la oposición constitucional.",
                "implications": {
                    "owner": "Para los propietarios esto supone una mayor burocracia en procesos judiciales y una limitación en la libertad de pacto de rentas, pero ganan estabilidad en la duración de los contratos."
                },
                "blindSpot": "El reportaje es puramente técnico-institucional y no profundiza en las historias humanas ni de inquilinos asfixiados ni de propietarios que dependen de esa renta para vivir.",
                "interstitialNotes": [
                    {"pos": 1, "text": "La cobertura de RTVE destaca por la neutralidad en la selección de fuentes, incluyendo tanto a portavoces oficiales como a expertos en derecho administrativo."},
                    {"pos": 2, "text": "Nota de Inteligencia: El enfoque se desplaza de lo ideológico a lo normativo, buscando informar sobre el ''cómo'' en lugar del ''por qué''."}
                ]
            }
        },
        {
            "id": "art-abc-001",
            "source": "ABC",
            "bias": "RIGHT",
            "fact": "ALTA",
            "author": "Javier Chicote",
            "time": "hace 3 horas",
            "title": "Ataque a la propiedad: el Gobierno interviene el alquiler y expulsa la inversión",
            "readerContent": {
                "whatHappened": "España se convierte hoy en una anomalía en el entorno europeo al castigar el ahorro y la inversión privada con una ley que interviene el mercado de forma salvaje. El control de precios, que ya ha fracasado en ciudades como Berlín o Madrid (en sus experimentos anteriores), vuelve a ser la receta populista de un Gobierno que prefiere señalar culpables que construir vivienda pública.\n\nLas inmobiliarias y los inversores internacionales ya han empezado a mirar hacia otros mercados, huyendo de una inseguridad jurídica que convierte la propiedad privada en un bien a merced del capricho político del consistorio de turno.",
                "context": "Históricamente, España ha sido un país de propietarios. Fomentar el alquiler fue una necesidad tras el pinchazo de 2008, pero este intervencionismo agresivo solo conseguirá el efecto contrario al deseado: menos pisos en el mercado, más selección (a veces discriminatoria) de los inquilinos y un deterioro del parque de viviendas por falta de mantenimiento.",
                "claims": [
                    {"text": "Es una expropiación por la puerta de atrás.", "source": "Líder de la Oposición"},
                    {"text": "La ley provocará escasez y mercado negro.", "source": "Círculo de Empresarios"}
                ],
                "preQuoteAnalysis": "ABC encuadra la noticia como un conflicto entre libertad económica y autoritarismo estatal, usando términos de carga negativa como ''intervención'', ''fracaso'' o ''ataque''.",
                "postQuoteAnalysis": "Se destaca el impacto macroeconómico y el riesgo de fuga de capitales, pero se omite la realidad de la subida asfixiante de precios para las clases medias que la ley intenta aplacar.",
                "implications": {
                    "owner": "El propietario queda indefenso ante impagos, con plazos de lanzamiento que pueden demorarse años, lo que obligará a contratar seguros de impago carísimos que finalmente repercutirán en el inquilino de una u otra forma."
                },
                "blindSpot": "No ofrece datos sobre las ganancias récord que las SOCIMIs han tenido en los últimos 5 años gracias a las exenciones fiscales de las que gozaban hasta ahora.",
                "interstitialNotes": [
                    {"pos": 1, "text": "ABC utiliza una narrativa centrada en el inversor y el propietario, proyectando un futuro de escasez y recesión sectorial."},
                    {"pos": 2, "text": "Análisis TNE: Hay una fuerte presencia de argumentos de autoridad procedentes de bancos y consultoras inmobiliarias, desplazando la perspectiva social del problema."}
                ]
            }
        }
    ]'::jsonb
);

-- 3. INSERTAR SEGUNDA HISTORIA MAESTRA (REFORMA LEY MORDAZA)
INSERT INTO public.stories (
    id, category, title, summary, time_label, location, source_count, bias, factuality, image_url, status,
    analytical_snippet, consenso_narrativo, cifras_clave, verificacion_info, origen_info, medios_analizados,
    documentos_info, fact_check, blind_spot, protagonistas_info, preguntas_info, full_content, perspectivas_info,
    contexto, impacto_social, impacto_sistemico, articles
) VALUES (
    'mordaza-reform-2024',
    'POLÍTICA',
    'El Congreso debate la reforma de la Ley de Seguridad Ciudadana tras años de bloqueo',
    'El Pleno del Congreso de los Diputados retoma hoy la tramitación de la reforma de la conocida como ''Ley Mordaza'', con el uso del material antidisturbios y las ''devoluciones en caliente'' como principales escollos.',
    'hace 4 horas',
    'Palacio de las Cortes, Madrid',
    51,
    '{"left": 40, "center": 20, "right": 40}'::jsonb,
    'MEDIA',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800',
    'published',
    'Tras casi una década de vigencia, la Ley Orgánica 4/2015 se enfrenta a su revisión más profunda. El debate no es solo legal, sino simbólico: el equilibrio permanente entre el orden público y los derechos civiles básicos. La falta de consenso sobre el uso de pelotas de goma y la presunción de veracidad de los agentes mantiene la polarización en niveles máximos tanto en el hemiciclo como en los sindicatos policiales.',
    'Finalización de una etapa de restricción de derechos fundamentales y retorno a los estándares democráticos previos a 2015. | Búsqueda de un equilibrio técnico que proteja la labor policial sin vulnerar el derecho constitucional de manifestación. | Riesgo de desprotección total de las Fuerzas y Cuerpos de Seguridad del Estado frente a la violencia callejera.',
    '[
        {"label": "Sanciones recurribles", "value": "125,000/año"},
        {"label": "Agentes censados", "value": "150,000"},
        {"label": "Artículos a debate", "value": "36"},
        {"label": "Multas retiradas", "value": "15.4M€"}
    ]'::jsonb,
    'Los datos sobre volumen de sanciones provienen de la Memoria anual del Ministerio del Interior. Los puntos de la reforma han sido contrastados con el texto de la proposición de ley presentada por el grupo mayoritario.',
    '["Ministerio del Interior", "Plataforma No Somos Delito", "Sindicato JUPOL", "Tribunal Constitucional"]'::jsonb,
    '["EL PAÍS", "ABC", "LA RAZÓN", "PÚBLICO", "EL CONFIDENCIAL", "OKDIARIO"]'::jsonb,
    '[{"name": "PROPOSICION_LEY_SEGURIDAD.PDF", "size": "2.1MB"}]'::jsonb,
    '✓ Se reduce la cuantía de las multas para personas con bajos ingresos.\n✓ El uso de imágenes de policías en manifestaciones deja de ser infracción grave per se.\n✓ Se prohíben las devoluciones en caliente en la frontera de Ceuta y Melilla.',
    'La reforma apenas menciona el impacto de la monitorización algorítmica y el reconocimiento facial en espacios públicos, una tecnología que no existía en 2015 y que plantea nuevos desafíos a la privacidad.',
    '{"beneficiados": "Colectivos de activistas, periodistas y ciudadanos que participan en protestas pacíficas.", "afectados": "Mandos policiales que alertan de la pérdida de autoridad operativa en situaciones críticas."}'::jsonb,
    '["¿Se prohibirán definitivamente las pelotas de goma?", "¿Cómo se regularán las protestas frente al Congreso?", "¿Habrá compensaciones por multas pasadas?"]'::jsonb,
    'La reforma de la Ley de Seguridad Ciudadana es uno de los temas más divisivos de la legislatura. El texto actual, aprobado en 2015 bajo la mayoría absoluta del PP, ha sido criticado por organismos internacionales como la ONU y el Consejo de Europa.\n\nEl núcleo de la reforma actual busca suavizar las sanciones por faltas de respeto a la autoridad e impedir que la toma de imágenes de agentes en servicio sea motivo de sanción inmediata, algo que los sindicatos de periodistas han reclamado durante años como vital para el derecho a la información.',
    'Mientras los partidos de izquierda ven la reforma como una "curación democrática", los sindicatos policiales han protagonizado manifestaciones masivas alegando que la ley los deja "atados de pies y manos". Argumentan que la presunción de veracidad ya ha sido avalada por el Constitucional y que eliminarla fomentará la impunidad ante agresiones físicas y verbales.',
    'La Ley Mordaza nació en un contexto de fuerte agitación social post-15M y grandes manifestaciones contra los recortes. Su objetivo declarado era evitar disturbios, pero su implementación resultó en un volumen masivo de sanciones administrativas que no requieren pasar por un juez, lo que agiliza la sanción pero disminuye el derecho a la defensa.',
    '["Aumento de la confianza ciudadana en el derecho de manifestación sin miedo a represalias económicas desproporcionadas.", "Desjudicialización de conflictos de convivencia menor."]'::jsonb,
    '["Posible aumento de la conflictividad en manifestaciones de alto riesgo.", "Impacto moral en las plantillas de la Policía Nacional y la Guardia Civil.", "Nuevos recursos ante el Tribunal Constitucional por parte de la oposición."]'::jsonb,
    '[
        {
            "id": "mordaza-art-left",
            "source": "Público",
            "bias": "LEFT",
            "fact": "ALTA",
            "author": "Marta Borraz",
            "time": "hace 2 horas",
            "title": "Fin a la era del miedo: el Congreso entierra los artículos más lesivos de la Ley Mordaza",
            "readerContent": {
                "whatHappened": "Hoy es un día histórico para las libertades civiles en España. Tras casi nueve años bajo el yugo de una ley diseñada para amordazar la protesta social tras el 15M, el Congreso finalmente ha decidido actuar.\n\nLa reforma que hoy se debate no es solo un ajuste técnico; es la reparación de una herida democrática. Se eliminan las sanciones por fotografiar a agentes, se reduce la arbitrariedad en los registros corporales y, sobre todo, se termina con la injusticia de las multas estratosféricas para quienes solo ejercen su derecho a la libre expresión.\n\nLos diputados de la mayoría progresista han coincidido en que la seguridad no puede ser la excusa para el autoritarismo administrativo. España vuelve hoy a mirar de frente a los estándares de la ONU, dejando atrás una mancha negra en su expediente de derechos humanos.",
                "context": "La Ley 4/2015 fue la respuesta del Gobierno de Rajoy a un país que hervía en las calles. En lugar de diálogo, se ofreció sanción. En lugar de política, se ofreció represión. Esa ley convirtió a los agentes en jueces y parte, privando al ciudadano de la supervisión judicial necesaria para garantizar la justicia.",
                "claims": [
                    {"text": "España por fin se despoja de una mordaza indigna.", "source": "Coordinadora 25S"},
                    {"text": "Es un paso valiente hacia una seguridad verdaderamente humana.", "source": "Amnistía Internacional"}
                ],
                "preQuoteAnalysis": "Público encuadra la noticia como una liberación social y un triunfo del activismo frente al control estatal excesivo.",
                "postQuoteAnalysis": "El texto omite deliberadamente los incidentes de violencia real que justificaron algunos de los protocolos operativos que ahora se critican.",
                "implications": {
                    "owner": "Para el ciudadano medio, esto significa que el simple hecho de estar en una protesta ya no supondrá una ruina económica automática si un agente considera que su actitud es ''irrespetuosa''."
                },
                "blindSpot": "No analiza cómo se gestionará el orden público si los nuevos protocolos resultan insuficientes para frenar disturbios violentos organizados.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota TNE: Público utiliza una terminología muy cargada emocionalmente (''yugo'', ''herida'', ''mancha negra'')."},
                    {"pos": 2, "text": "Dato: Se silencia la opinión de los mandos intermedios de la policía que coordinan operativos antiterroristas bajo este marco legal."}
                ]
            }
        },
        {
            "id": "mordaza-art-right",
            "source": "ABC",
            "bias": "RIGHT",
            "fact": "ALTA",
            "author": "Salvador Sostres",
            "time": "hace 3 horas",
            "title": "Indefensión total: el Gobierno pacta desarmar a la Policía ante los radicales",
            "readerContent": {
                "whatHappened": "Lo que estamos viviendo en las Cortes es una traición en toda regla a quienes se juegan la vida por nuestra seguridad. El pacto del Gobierno con los herederos de la violencia y el separatismo supone, de facto, la retirada del Estado de las calles de España.\n\nAl eliminar la presunción de veracidad y prohibir el material esencial para el control de masas, Sánchez está enviando un mensaje claro a los violentos: tienen vía libre. Las fuerzas de seguridad pasan de ser el escudo de la democracia a ser el blanco de cualquier antisistema con un teléfono móvil y ganas de bronca.\n\nEs un despropósito jurídico que solo busca contentar a los socios de investidura a costa de la paz social. Los sindicatos policiales ya advierten: si esta reforma sale adelante, muchas zonas de nuestras ciudades se convertirán en territorios sin ley donde la autoridad será papel mojado.",
                "context": "La Ley de Seguridad Ciudadana de 2015 trajo la calma tras años de caos. Proporcionó a los agentes las herramientas necesarias para actuar sin miedo a ser perseguidos judicialmente por cada intervención. Romper ese equilibrio es volver a la España de los disturbios diarios y las calles en llamas.",
                "claims": [
                    {"text": "Nos están dejando vendidos ante los radicales.", "source": "Sindicato Policial"},
                    {"text": "Esta reforma es un peaje de sangre política.", "source": "Líder de VOX"}
                ],
                "preQuoteAnalysis": "ABC utiliza un marco de inseguridad y caos inminente para desacreditar la reforma, apelando al miedo de las clases medias a la violencia urbana.",
                "postQuoteAnalysis": "Se ignoran sistemáticamente los casos documentados de abusos policiales y las advertencias del Defensor del Pueblo sobre la arbitrariedad actual.",
                "implications": {
                    "owner": "Para la policía nacional, esto supone una desmotivación profunda y una vulnerabilidad legal ante denuncias cruzadas de grupos de presión organizados."
                },
                "blindSpot": "No explica que la mayoría de los artículos que permanecen aseguran la capacidad operativa básica, centrándose solo en los cambios más polémicos.",
                "interstitialNotes": [
                    {"pos": 1, "text": "El lenguaje de ABC es de confrontación total, usando epítetos como ''antisistema'' y ''traición''."},
                    {"pos": 2, "text": "Nota TNE Intelligence: El enfoque de este artículo ignora deliberadamente los fallos del TEDH contra España por la actual ley."}
                ]
            }
        },
        {
            "id": "mordaza-art-center",
            "source": "El Confidencial",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Beatriz Parera",
            "time": "hace 1 hora",
            "title": "Análisis técnico de la reforma: ¿qué cambia realmente en la Ley Mordaza?",
            "readerContent": {
                "whatHappened": "Más allá de los titulares incendiarios de ambos bandos, la reforma de la Ley de Seguridad Ciudadana que hoy tramita el Congreso presenta un panorama de luces y sombras técnicas. El borrador actual suaviza las sanciones económicas, introduciendo criterios de proporcionalidad basados en la renta del sancionado, y limita el tiempo de identificación en comisarías de las actuales 6 horas a un máximo de 2.\n\nSin embargo, el punto más espinoso sigue siendo el material antidisturbios. El Gobierno intenta hacer equilibrismo entre las exigencias de sus socios de izquierda, que piden la prohibición total de las pelotas de goma, e Interior, que advierte que sin ese material se pone en riesgo la integridad física de los propios agentes ante masas hostiles.",
                "context": "Esta ley lleva en el centro del debate político desde su nacimiento. Ha sobrevivido a tres intentos de reforma fallidos por las discrepancias internas de las mayorías parlamentarias. Lo que hoy se vota es un texto de compromiso que busca cerrar una etapa de excepcionalidad jurídica sin desmantelar por completo el principio de autoridad pública.",
                "claims": [
                    {"text": "Buscamos un equilibrio garantista pero operativo.", "source": "Ministro del Interior"},
                    {"text": "Es una reforma insuficiente pero necesaria.", "source": "ERC"}
                ],
                "preQuoteAnalysis": "El Confidencial adopta una postura pericial, diseccionando el texto legal y comparándolo con la jurisprudencia previa del Constitucional.",
                "postQuoteAnalysis": "Se analizan los costes de implementación y los posibles vacíos legales que podrían generar una oleada de recursos judiciales en el primer año.",
                "implications": {
                    "owner": "El sistema jurídico ganará en proporcionalidad, pero perderá en celeridad administrativa, ya que muchas multas requerirán ahora un soporte documental mucho más sólido (vídeos o testigos externos)."
                },
                "blindSpot": "No profundiza en los aspectos éticos de la ley, manteniéndose estrictamente en el plano de la eficiencia administrativa y operativa.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Este análisis se aleja de la emotividad para centrarse en los cambios procedimentales."},
                    {"pos": 2, "text": "Dato TNE: El Confidencial es el único medio que menciona la disparidad de criterios entre los jueces de lo contencioso-administrativo."}
                ]
            }
        }
    ]'::jsonb
);

