-- ==========================================================
-- SEED PREMIUM: El Desafío de las Pensiones en España
-- Noticia de Alta Fidelidad con Desarrollo Editorial Extendido
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
    'pensiones-reforma-2024',
    'ECONOMÍA',
    'El sistema de pensiones a examen: la reforma que definirá el futuro de la generación baby boom',
    'España activa el segundo bloque de la reforma de las pensiones centrado en el aumento de los ingresos del sistema mediante el Mecanismo de Equidad Intergeneracional (MEI) y el destope de las bases máximas de cotización.',
    'hace 1 hora',
    'Ministerio de Inclusión, Madrid',
    64,
    '{"left": 30, "center": 50, "right": 20}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1573163276732-dc7008779831?auto=format&fit=crop&q=80&w=800',
    'published',
    -- RESUMEN EDITORIAL
    'La sostenibilidad del sistema público de pensiones se ha convertido en el principal desafío macroeconómico y social de España para las próximas tres décadas. Con la jubilación masiva de la generación del Baby Boom, el ratio entre cotizantes y pensionistas se encamina hacia un punto de tensión nunca antes visto. La actual reforma busca evitar recortes en las prestaciones mediante un aumento sin precedentes de las cotizaciones sociales, lo que traslada el peso del ajuste hacia el coste laboral y los salarios más altos, en un intento por blindar el poder adquisitivo de los mayores.',
    -- CONSENSO NARRATIVO
    'Garantía de suficiencia y dignidad para los pensionistas actuales y futuros mediante una redistribución de la riqueza desde los salarios más altos. | Búsqueda de un equilibrio actuarial que asegure el sistema sin comprometer excesivamente la competitividad de las empresas ni la creación de empleo. | Riesgo grave de quiebra del sistema a largo plazo por el aumento insostenible del gasto que penaliza el ahorro y el crecimiento económico.',
    -- CIFRAS CLAVE
    '[
        {"label": "Gasto en pensiones", "value": "11.7% PIB"},
        {"label": "MEI (cotización extra)", "value": "0.7%"},
        {"label": "Pensionistas", "value": "10,120,450"},
        {"label": "Pensión media", "value": "1,375€"},
        {"label": "Destope base máx.", "value": "56,600€"},
        {"label": "Hucha pensiones", "value": "5,500M€"}
    ]'::jsonb,
    -- VERIFICACIÓN
    'Datos contrastados con la Seguridad Social española y el informe de sostenibilidad de la Comisión Europea. Las proyecciones de gasto han sido verificadas con los paneles de la AIReF. Se ha confirmado la correlación entre la subida del IPC y la revalorización de las pensiones del ejercicio actual.',
    -- ORIGEN
    '["Seguridad Social (Secretaría de Estado)", "AIReF (Autoridad Independiente)", "OCDE", "Eurostat"]'::jsonb,
    -- MEDIOS ANALIZADOS
    '["EXPANSIÓN", "EL ECONOMISTA", "EL PAÍS", "EL MUNDO", "CINCO DÍAS", "THE FINANCIAL TIMES"]'::jsonb,
    -- DOCUMENTOS
    '[{"name": "INFORME_ASE_PENSIONES.PDF", "size": "3.4MB"}, {"name": "PROYECCIONES_DEMOGRAFICAS.PDF", "size": "1.8MB"}]'::jsonb,
    -- FACT CHECK
    '✓ Las pensiones contributivas se revalorizan con el IPC medio.\n✓ El MEI se aplica a todos los trabajadores y empresas.\n✓ La edad de jubilación legal sigue su senda ascendente hasta los 67 años en 2027.',
    -- BLIND SPOT
    'La reforma omite casi por completo el problema del bajo crecimiento de la productividad en España, que es el único factor capaz de sostener un sistema de este tipo sin aumentar constantemente los impuestos al trabajo.',
    -- PROTAGONISTAS
    '{"beneficiados": "Pensionistas actuales (revalorización blindada) y trabajadores de rentas bajas.", "afectados": "Empresas con altos costes laborales, trabajadores con salarios superiores a 54.000€ y jóvenes cotizantes."}'::jsonb,
    -- PREGUNTAS ABIERTAS
    '["¿Será suficiente el MEI para cubrir el déficit?", "¿Habrá un recorte real en el futuro vía impuestos?", "¿Cómo afectará a la contratación de personal cualificado?"]'::jsonb,
    -- +INFO > GENERAL
    'España se enfrenta a una "tormenta demográfica" perfecta. La estructura de la pirámide poblacional, marcada por el descenso de la natalidad y el aumento de la esperanza de vida, sitúa al país como uno de los más envejecidos del mundo en 2050.\n\nLa reforma del actual sistema se divide en tres pilares: la revalorización con el IPC, la ampliación del periodo de cómputo para el cálculo de la pensión y la creación de nuevos mecanismos de ingresos como el MEI. El objetivo del Gobierno es que la "Hucha de las Pensiones" alcance los 120.000 millones de euros en la próxima década para actuar como amortiguador durante los años críticos de la jubilación de los baby boomers.',
    -- +INFO > PERSPECTIVAS
    'Los sindicatos celebran el blindaje de la suficiencia, argumentando que la pensión es un salario diferido y un derecho inalienable. Desde la patronal CEOE, sin embargo, se alerta de que encarecer el empleo es la receta para que España siga teniendo una de las tasas de paro más altas de la OCDE.\n\nExpertos universitarios sugieren que el sistema debería evolucionar hacia un modelo híbrido con cuentas nocionales, similar al sueco, donde cada trabajador tiene una "cuenta" teórica que refleja exactamente sus aportaciones, dotando al sistema de mayor transparencia y justicia actuarial directa.',
    -- CONTEXTO
    'Desde la creación del Pacto de Toledo en 1995, el consenso político sobre las pensiones ha sido la piedra angular de la paz social en España. Sin embargo, las sucesivas crisis económicas de 2008 y 2020 han erosionado las reservas del sistema.\n\nEn la actualidad, España gasta más de 12.000 millones de euros mensuales solo en pagar las prestaciones contributivas. Esta cifra representa casi el 40% de los Presupuestos Generales del Estado, lo que limita la capacidad de inversión en otras áreas clave como la I+D, la educación o las políticas de juventud.',
    -- IMPACTO SOCIAL
    '["Reducción de la brecha de género en las pensiones mediante complementos de cuidado.", "Mantenimiento de la cohesión familiar: en muchas zonas, la pensión es la base económica que sostiene a hijos y nietos en paro.", "Fomento del envejecimiento activo y la jubilación demorada voluntaria."]'::jsonb,
    -- IMPACTO SISTÉMICO
    '["Aumento de la presión fiscal sobre el factor trabajo, pudiendo reducir el salario neto a largo plazo.", "Necesidad de replantear el modelo de ahorro privado y planes de pensiones de empresa.", "Conflictividad intergeneracional latente entre los jóvenes que cotizan y los mayores que cobran."]'::jsonb,
    
    -- ARTÍCULOS DETALLADOS (3000+ CARACTERES)
    '[
        {
            "id": "pension-art-econ",
            "source": "Expansión",
            "bias": "RIGHT",
            "fact": "ALTA",
            "author": "C. García Peranza",
            "time": "hace 45 min",
            "title": "El coste de las pensiones amenaza con asfixiar la competitividad española",
            "readerContent": {
                "whatHappened": "El anuncio del Ministerio sobre el nuevo tramo del Mecanismo de Equidad Intergeneracional ha caído como un jarro de agua fría en las sedes de las principales corporaciones del IBEX 35. No se trata solo de un pequeño porcentaje extra; es la señal definitiva de que el Gobierno ha optado por el camino más fácil y peligroso: subir impuestos al empleo para mantener un sistema que, bajo sus actuales premisas, es un gigante con pies de barro.\n\nLas empresas españolas ya soportan una cuña fiscal significativamente superior a la media de la OCDE en determinados sectores. Sumar ahora un 0,7% adicional que irá escalando hasta el 1,2% en 2029 supone un lastre directo a la contratación y un desincentivo claro para la inversión extranjera que busca costes operativos predecibles y sostenibles a largo plazo.\n\nDesde las grandes confederaciones empresariales se advierte que esta reforma no ataja el problema real: la demografía y la baja productividad. España está intentando pagar pensiones de primer mundo con una productividad que apenas se ha movido en la última década. La ecuación, simplemente, no cuadra sin un sacrificio mayor por parte del contribuyente futuro.",
                "context": "Históricamente, la Seguridad Social ha sido el orgullo del modelo de bienestar español. Pero los números son tercos. El déficit estructural del sistema se ha cronificado y las transferencias directas desde el Estado para cubrir las pagas extraordinarias se han vuelto recurrentes. Estamos ante una huida hacia adelante donde se priman los votos de 10 millones de pensionistas frente al futuro de 20 millones de trabajadores.",
                "claims": [
                    {"text": "Es una reforma basada en la ficción contable.", "source": "Círculo de Empresarios"},
                    {"text": "El destope de cotizaciones es un castigo al talento.", "source": "CEOE"}
                ],
                "preQuoteAnalysis": "La narrativa de Expansión se centra en las métricas de eficiencia y el impacto en el tejido empresarial, utilizando un tono de advertencia financiera severa.",
                "postQuoteAnalysis": "Se subraya que el aumento de costes laborales acaba traduciéndose en una menor capacidad de las empresas para subir sueldos netos, lo que genera una paradoja: se protege al jubilado empobreciendo al trabajador en activo.",
                "implications": {
                    "owner": "Para los altos directivos y cuadros técnicos, el destope de la base máxima supone una reducción directa de su salario líquido mensual de entre 150 y 300 euros sin que ello suponga una mejora proporcional en su pensión futura."
                },
                "blindSpot": "El artículo ignora los beneficios macroeconómicos de mantener un consumo alto por parte de los pensionistas, que actúan como estabilizadores económicos en épocas de crisis.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota de Inteligencia: Expansión cita fuentes exclusivamente del ámbito patronal y financiero, omitiendo los informes de la Comisión Europea que avalan la reforma como viable bajo ciertas condiciones de empleo."},
                    {"pos": 2, "text": "Análisis TNE: Se observa el uso recurrente de metáforas de ''asfixia'' y ''lastre'' para enmarcar la acción del Estado como un ente exclusivamente recaudador."}
                ]
            }
        },
        {
            "id": "pension-art-social",
            "source": "El País",
            "bias": "LEFT_CENTER",
            "fact": "ALTA",
            "author": "Manuel V. Gómez",
            "time": "hace 2 horas",
            "title": "Equidad e ingresos: España blinda sus pensiones frente al reto demográfico",
            "readerContent": {
                "whatHappened": "España ha decidido no repetir los errores de la crisis de 2012. En lugar de recortes y congelaciones que empobrecieron a millones de mayores, la nueva reforma del sistema público de pensiones apuesta por reforzar los ingresos. Es un pacto de país que prioriza la dignidad de quienes han trabajado toda su vida sobre las exigencias de recorte de gasto de los sectores más conservadores.\n\nEl despliegue del Mecanismo de Equidad Intergeneracional (MEI) es la pieza maestra de este plan. Se trata de una aportación pequeña pero colectiva que permitirá reconstruir la Hucha de las Pensiones, esa reserva que fue vaciada en años anteriores. Además, por primera vez, se pide un esfuerzo a quienes más tienen: el destope de las bases máximas permitirá recaudar miles de millones extra de los salarios más altos, equilibrando la balanza del sistema de forma justa y progresiva.\n\nLa Ministra de Inclusión ha sido clara en el Congreso: un país que no cuida a sus mayores es un país sin alma. La revalorización automática con el IPC no es un lujo, es una garantía de supervivencia ante la inflación galopante que hemos vivido recientemente.",
                "context": "La reforma es el fruto de un diálogo social intenso con los sindicatos UGT y CCOO. Se han introducido medidas para corregir lagunas de cotización y mejorar las pensiones mínimas, que son las que permiten que muchas mujeres que dejaron el mercado laboral para cuidar de sus hijos ahora tengan una vejez digna.",
                "claims": [
                    {"text": "Es el blindaje definitivo del sistema público.", "source": "UGT - Sindicato"},
                    {"text": "Nadie se quedará atrás por el reto demográfico.", "source": "Presidencia del Gobierno"}
                ],
                "preQuoteAnalysis": "El País adopta un enfoque de justicia social y estabilidad institucional, defendiendo el papel del Estado como protector de los derechos fundamentales.",
                "postQuoteAnalysis": "El análisis destaca que la sostenibilidad no debe lograrse a costa del bienestar de los más vulnerables, sino mediante una gestión inteligente y solidaria de los recursos comunes.",
                "implications": {
                    "owner": "Los pensionistas con rentas bajas verán incrementada su prestación por encima del IPC, un paso decisivo para erradicar la pobreza en la tercera edad en España."
                },
                "blindSpot": "El artículo pasa por alto el riesgo de que la Seguridad Social se convierta en un sistema de excesiva carga impositiva que desincentive la creación de nuevas empresas tecnológicas de alto valor.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota TNE: El lenguaje empleado es optimista y se centra en los conceptos de ''blindaje'' y ''pacto''. "},
                    {"pos": 2, "text": "Dato: El País resalta la mejora de la brecha de género, un tema que suele ser omitido en la prensa exclusivamente económica."}
                ]
            }
        },
        {
            "id": "pension-art-financial",
            "source": "The Financial Times (ES)",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Financial Analyst",
            "time": "hace 3 horas",
            "title": "La demografía española: el experimento de un sistema bajo presión",
            "readerContent": {
                "whatHappened": "Desde la City de Londres y los centros de decisión en Bruselas, se observa a España como un laboratorio viviente de la demografía del siglo XXI. Madrid está intentando algo que pocos países han logrado: mantener un sistema de reparto generoso en una sociedad que envejece rápidamente sin recurrir a un aumento drástico de la edad de jubilación.\n\nLa estrategia española se basa casi exclusivamente en el lado de los ingresos. A diferencia de las reformas francesas que provocaron disturbios masivos o el modelo de capitalización parcial británico, España confía en que el mercado laboral pueda absorber el aumento de las cotizaciones sociales sin dañar el crecimiento. Es una apuesta de alto riesgo. Si el desempleo se mantiene bajo y la economía sigue creciendo al ritmo actual, el plan podría funcionar. Pero cualquier recesión significativa dejaría al descubierto un déficit de financiación que obligaría a medidas mucho más drásticas.\n\nLos inversores están vigilantes. El ratio de deuda sobre el PIB y el compromiso de España con las reglas fiscales europeas dependen en gran medida de que este plan para las pensiones sea creíble ante los mercados internacionales.",
                "context": "El sistema de pensiones español es uno de los más generosos en términos de tasa de reemplazo (la relación entre el último sueldo y la jubilación). Esto crea un incentivo social muy fuerte para su defensa, pero también una rigidez presupuestaria que es difícil de manejar en entornos de baja inflación.",
                "claims": [
                    {"text": "España está ganando tiempo, pero la demografía no espera.", "source": "Comisión Europea"},
                    {"text": "El reto es la productividad, no solo las leyes.", "source": "Banco de España"}
                ],
                "preQuoteAnalysis": "El enfoque del FT es pragmático y comparativo, analizando a España como parte de una tendencia continental de envejecimiento.",
                "postQuoteAnalysis": "Se advierte que la dependencia de los ingresos por cotizaciones hace que el sistema sea extremadamente vulnerable a las crisis cíclicas del mercado laboral.",
                "implications": {
                    "owner": "Los inversores ven en esta reforma una solución política a corto plazo que evita el conflicto en las calles pero que deja interrogantes financieros abiertos para la década de 2030."
                },
                "blindSpot": "El análisis técnico puede carecer de sensibilidad hacia la realidad sociopolítica española donde la pensión es el eje central de la estructura de apoyo familiar intergeneracional.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota de Inteligencia: Este artículo es el que produce el análisis más frío y basado en proyecciones actuariales actuariales externas."},
                    {"pos": 2, "text": "Dato TNE: Se resalta la vulnerabilidad del modelo ante una posible subida de los tipos de interés de la deuda soberana."}
                ]
            }
        }
    ]'::jsonb
);
