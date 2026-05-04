-- ==========================================================
-- SEED ECONOMÍA/SOCIEDAD: Vivienda y Tokenización Inmobiliaria
-- Noticia de Alta Fidelidad con Desarrollo Editorial Extendido v8.0
-- USANDO DOLLAR QUOTING PARA ESTABILIDAD TOTAL
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
    contexto, impacto_social, impacto_sistemico, articles, desglose
) VALUES (
    'tokenizacion-vivienda-2024',
    'ECONOMÍA',
    'El ladrillo se fragmenta: ¿Es la tokenización inmobiliaria la solución a la crisis de la vivienda o una nueva burbuja?',
    'Empresas tecnológicas empiezan a trocear edificios en Madrid y Barcelona para venderlos en "tokens" de 100 euros, abriendo el mercado a jóvenes ahorradores pero despertando alarmas en el sector regulador.',
    'hace 3 horas',
    'Madrid / Barcelona',
    96,
    '{"left": 30, "center": 40, "right": 30}'::jsonb,
    'ALTA',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
    'published',
    -- RESUMEN EJECUTIVO (MASIVO)
    $$ La tokenización inmobiliaria ha pasado de ser un experimento marginal a una tendencia que amenaza con transformar el mercado del "ladrillo" en España. Este proceso consiste en representar la propiedad (o los derechos de explotación) de un inmueble mediante tokens en una blockchain, permitiendo que un edificio se divida en miles de participaciones accesibles desde 100 euros. Para sus defensores, es la democratización definitiva de la inversión: permite que un joven que no puede comprar una casa entera sí pueda beneficiarse de las rentas de alquiler. \n\nSin embargo, este avance tecnológico choca frontalmente con una realidad social sangrante: el precio de la vivienda está en máximos históricos y el acceso al alquiler es cada vez más difícil para las rentas medias. Los críticos advierten que la facilidad para invertir "a golpe de clic" podría inyectar una liquidez artificial y especulativa en un mercado ya tensionado, acelerando la gentrificación y dificultando aún más la regulación de los precios. Este análisis de TNE explora si estamos ante una herramienta de inclusión financiera o ante la "Especulación 3.0" que convertirá el derecho a la vivienda en un simple activo financiero fragmentado. $$ ,
    -- CONSENSO NARRATIVO
    $$ Existe un consenso absoluto en que el modelo inmobiliario actual está roto para las nuevas generaciones. | La tecnología blockchain reduce drásticamente los costes notariales y de gestión, haciendo la inversión más eficiente. | La discrepancia surge en la regulación: mientras los liberales piden dejar fluir el capital, los socialdemócratas exigen que estos edificios tokenizados cumplan con cupos de vivienda social. $$ ,
    -- CIFRAS CLAVE
    $$ [
        {"label": "Inversión mínima", "value": "100€"},
        {"label": "Rentabilidad estimada", "value": "8-12% anual"},
        {"label": "Nº Proyectos (Est)", "value": "+45 en España"},
        {"label": "Volumen captado", "value": "120M€ en 2023"},
        {"label": "Ahorro gestoría", "value": "45%"},
        {"label": "Liquidez", "value": "T + 24 horas"}
    ] $$,
    -- VERIFICACIÓN
    $$ Datos extraídos de la Comisión Nacional del Mercado de Valores (CNMV) respecto a registros de plataformas participativas y reportes de la Asociación Fintech España. Las rentabilidades han sido validadas analizando los whitepapers de las tres principales plataformas operantes en Madrid. $$ ,
    -- ORIGEN
    $$ ["CNMV (Registro Fintech)", "PropTech Spain", "Ministerio de Vivienda", "Ethereum Network (Smart Contracts)", "Idealista Data"] $$,
    -- MEDIOS ANALIZADOS
    $$ ["LA VANGUARDIA", "PÚBLICO", "FORBES", "EXPANSIÓN", "EL CONFIDENCIAL", "BUSINESS INSIDER"] $$,
    -- DOCUMENTOS
    $$ [{"name": "GUIA_CNMV_TOKENIZACION.PDF", "size": "1.2MB"}, {"name": "REPORTE_INMOBILIARIO_2024.PDF", "size": "6.8MB"}] $$,
    -- FACT CHECK
    $$ ✓ La tokenización de activos inmobiliarios es legal en España bajo la Ley de Mercados de Valores.\n✓ Invertir en un token NO da derecho de uso de la vivienda, solo a una parte proporcional de los rendimientos netos.\n✓ Actualmente, la mayoría de proyectos se centran en el alquiler turístico o de corta estancia. $$ ,
    -- BLIND SPOT
    $$ La mayoría de las noticias ignoran el riesgo de 'Vacío de Responsabilidad': si un edificio tokenizado tiene problemas estructurales o de convivencia, los 'propietarios' de los tokens no tienen una estructura clara de toma de decisiones comunitaria ante la ley de propiedad horizontal actual. $$ ,
    -- PROTAGONISTAS
    $$ {"beneficiados": "Pequeños ahorradores con capital limitado (1k-5k€); plataformas tecnológicas (exchanges de ladrillo).", "afectados": "Inquilinos locales desplazados por el aumento de precios; reguladores que no pueden rastrear el origen de todos los capitales fragmentados."} $$ ,
    -- PREGUNTAS ABIERTAS
    $$ ["¿Sustituirán los tokens a las SOCIMIs tradicionales?", "¿Qué ocurre si la plataforma de tokenización quiebra?", "¿Acabará el blockchain con las inmobiliarias de barrio?"] $$ ,
    -- +INFO > GENERAL (DESARROLLO MASIVO)
    $$ La tokenización es la punta de lanza de lo que los economistas llaman 'Finanzas Descentralizadas Aplicadas' (Real World Assets). A diferencia de las criptomonedas especulativas como el Bitcoin, el token inmobiliario está respaldado por un activo físico: ladrillo, cemento y una ubicación geográfica real. Esto le otorga una estabilidad que atrae a inversores conservadores que huyen de la volatilidad del Nasdaq o el mercado cripto tradicional.\n\nEl proceso técnico es fascinante. Se crea un vehículo (una sociedad limitada) por cada inmueble. Las acciones de esa sociedad se digitalizan en forma de tokens ERC-20 o similares. Cuando un inquilino paga el alquiler, un contrato inteligente (Smart Contract) reparte automáticamente el dinero de forma proporcional a los monederos digitales de los miles de copropietarios. Sin bancos, sin demoras y sin fronteras. Un inversor en México puede ser copropietario de un local comercial en el barrio de Salamanca y recibir sus dividendos cada mes de forma automatizada.\n\nEste modelo elimina las barreras de entrada que han mantenido a la clase trabajadora fuera de la inversión inmobiliaria durante décadas. Históricamente, para ganar dinero con pisos necesitabas una hipoteca o mucho ahorro previo. Ahora, con el ahorro de un par de cenas fuera, cualquier ciudadano puede empezar a construir su propio 'imperio inmobiliario' digital. Sin embargo, esta facilidad de inversión tiene un precio sistémico: la vivienda deja de ser un hogar para convertirse en un ticker bursátil más, compitiendo en rentabilidad con la tecnología o el petróleo en tiempo real. $$ ,
    -- +INFO > PERSPECTIVAS
    $$ Las plataformas aseguran que están rehabilitando barrios degradados y subiendo el nivel de las viviendas. Al atraer inversión micro-fragmentada, se logran reformar edificios que de otro modo estarían en ruinas.\n\nPor el contrario, los movimientos de defensa de la vivienda argumentan que la tokenización es la 'gamificación' de la miseria habitacional. Si un fondo ahora puede trocear un edificio y venderlo a 10.000 personas en lugar de a un solo comprador, el precio de venta final suele ser superior a la suma de las partes, inflando artificialmente el valor de mercado de todo el barrio. $$ ,
    -- CONTEXTO
    $$ España es el segundo país de Europa con más proyectos de tokenización inmobiliaria tras Francia. Esto se debe a la herencia cultural del 'ladrillo' como refugio financiero seguro. Tras la crisis de 2008, la desconfianza en los productos bancarios complejos empujó a muchos hacia los activos tangibles, y ahora la tecnología ofrece la forma más eficiente de gestionarlos. $$ ,
    -- IMPACTO SOCIAL
    $$ ["Acceso al patrimonio para la Generación Z: una forma de combatir la pérdida de poder adquisitivo del ahorro.", "Riesgo de despersonalización de los barrios: barrios gobernados por algoritmos y propietarios ausentes.", "Transparencia total: cada transacción es pública y rastreable en la blockchain, reduciendo el fraude fiscal en alquileres."] $$ ,
    -- IMPACTO SISTÉMICO
    $$ ["Transformación de la Ley de Propiedad Horizontal: necesidad de reformar el código civil para dar personalidad jurídica a los DAOs (Organizaciones Autónomas) de propietarios.", "Desintermediación bancaria: menor dependencia de los créditos hipotecarios tradicionales para la financiación de proyectos.", "Riesgo sistémico si caen los rendimientos inmobiliarios en un mercado hiper-líquido."] $$ ,
    
    -- ARTÍCULOS DETALLADOS (CONTENIDO MASIVO)
    $$ [
        {
            "id": "vivienda-art-lavanguardia",
            "source": "La Vanguardia",
            "bias": "CENTER",
            "fact": "ALTA",
            "author": "Piergiorgio M. Sandri",
            "time": "hace 1 hora",
            "title": "Invertir en un piso por 100 euros: Así es la revolución que llega a las capitales",
            "readerContent": {
                "whatHappened": "Barcelona se ha convertido en el laboratorio europeo de la tokenización. Caminando por el barrio de Poblenou, es difícil imaginar que algunos de los lofts más modernos no pertenecen a un gran fondo de inversión, sino a una comunidad de cientos de pequeños ahorradores dispersos por todo el mundo. \n\nLa tecnología blockchain ha aterrizado en el sector inmobiliario con una promesa clara: eficiencia. Lo que antes tardaba meses entre notarios, registros y comisiones bancarias, ahora se resuelve en minutos. 'El mercado inmobiliario era la última frontera de las finanzas que faltaba por digitalizar', afirma un experto del sector Proptech. La facilidad de uso es asombrosa: un usuario descarga una app, verifica su identidad y, con un par de clics, adquiere una fracción de un local comercial o un apartamento turístico.\n\nEsto no es solo una moda pasajera. Las cifras indican que el volumen de activos tokenizados en España se dobló el año pasado. Para muchos jóvenes catalanes, esta es la única forma de tener un pie en el mercado inmobiliario ante unos precios de compra que exigen ahorros previos de 50.000 euros solo para la entrada de una hipoteca. Aquí, la barrera de entrada ha desaparecido, y el rendimiento del alquiler llega directamente al smartphone del inversor.",
                "context": "El sector inmobiliario español mueve más de 20.000 millones de euros en inversión anual. Hasta ahora, el 90% estaba en manos de grandes capitales o de propietarios individuales. El 10% restante, el pequeño ahorrador, estaba fuera del juego.",
                "claims": [
                    {"text": "Estamos democratizando el acceso a la riqueza inmobiliaria.", "source": "CEO de TokenHouse"},
                    {"text": "Es una herramienta de ahorro más estable que comprar criptomonedas.", "source": "Analista Financiero"}
                ],
                "preQuoteAnalysis": "La Vanguardia mantiene un tono equilibrado y optimista, centrando el interés en la modernización económica y la eficiencia del servicio.",
                "postQuoteAnalysis": "El artículo destaca la seguridad que da el 'respaldo físico' del ladrillo frente a otros activos digitales puramente virtuales.",
                "implications": {
                    "owner": "Para un usuario medio, esto significa que puede diversificar su dinero: en lugar de poner 100.000 euros en un solo piso, puede comprar 1.000 porciones de 100 pisos diferentes, reduciendo el riesgo de impago."
                },
                "blindSpot": "No se profundiza en qué sucede si el inquilino deja de pagar o si hay una derrama importante en el edificio: ¿quién vota en la junta de vecinos?",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota TNE: El enfoque es descriptivo y aspiracional, ideal para perfiles que buscan nuevas formas de inversión."},
                    {"pos": 2, "text": "Inteligencia: Se resalta la 'liquidez' como el gran valor diferencial respecto a comprar un piso físico."}
                ]
            }
        },
        {
            "id": "vivienda-art-publico",
            "source": "Público",
            "bias": "LEFT",
            "fact": "ALTA",
            "author": "Alejandro López",
            "time": "hace 4 horas",
            "title": "Fragmentar la miseria: La trampa de la inversión inmobiliaria ''uberizada''",
            "readerContent": {
                "whatHappened": "Bajo la palabra 'democratización' se esconde a menudo el rostro más feo del capitalismo digital. La última tendencia en los barrios más castigados de Madrid y Valencia es la tokenización: trocear los edificios para que cualquiera, incluso sin tener donde vivir, pueda participar en el negocio del alquiler de otros. Es la culminación de la vivienda convertida en pura mercancía bursátil.\n\nLas plataformas de tokenización venden la idea de que invertir 100 euros es un acto de empoderamiento financiero para los jóvenes. Lo que no dicen es que cada euro que entra en estas plataformas es un euro que presiona al alza el precio de los alquileres de esos mismos barrios. Al facilitar la entrada de capital de cualquier rincón del planeta, se genera una competencia desleal contra el vecino que simplemente busca un techo. Si un edificio puede ser rentabilizado por 5.000 micro-inversores, la presión por maximizar el dividendo será mucho más feroz que la de un propietario tradicional.\n\nAdemás, la opacidad que puede ofrecer la blockchain plantea serios interrogantes sobre el control de precios. ¿Cómo va a aplicar el Gobierno el límite a los alquileres si la propiedad está fragmentada en 10.000 carteras digitales anónimas? Estamos ante una 'Uberización' del derecho a la vivienda donde la responsabilidad social se diluye en la cadena de bloques.",
                "context": "En España, más del 40% del salario de un joven se destina al alquiler. Mientras tanto, el número de viviendas turísticas y tokenizadas sigue creciendo sin control en las zonas tensionadas.",
                "claims": [
                    {"text": "Esto es especulación 3.0 para lavar la cara a los fondos buitre.", "source": "Sindicato de Inquilinas"},
                    {"text": "Se está destruyendo el tejido vecinal a cambio de dividendos digitales.", "source": "Antropólogo Urbano"}
                ],
                "preQuoteAnalysis": "Público adopta una postura de denuncia social, alertando sobre los peligros de la financiarización de un derecho básico.",
                "postQuoteAnalysis": "El texto pone el acento en la pérdida de control democrático sobre el territorio y la imposibilidad de regular un mercado tan fragmentado.",
                "implications": {
                    "owner": "Para los movimientos sociales, la tokenización es el enemigo final: es más difícil luchar contra 5.000 pequeños inversores que contra un solo banco."
                },
                "blindSpot": "El artículo ignora sistemáticamente los beneficios de la transparencia fiscal que la blockchain aporta, impidiendo los pagos 'en negro' tan comunes en el alquiler tradicional.",
                "interstitialNotes": [
                    {"pos": 1, "text": "Nota de Inteligencia: El tono es de urgencia y crítica sistémica, enfocándose en la deshumanización de la ciudad."},
                    {"pos": 2, "text": "Dato TNE: Se vincula la inversión tecnológica con el aumento de la desigualdad generacional."}
                ]
            }
        },
        {
            "id": "vivienda-art-forbes",
            "source": "Forbes (ES)",
            "bias": "RIGHT",
            "fact": "ALTA",
            "author": "Laura Martínez",
            "time": "hace 5 horas",
            "title": "Why Real Estate Tokenization is the Smart Money Play of 2024",
            "readerContent": {
                "whatHappened": "For decades, real estate was the ultimate 'illiquid' asset. Selling a commercial building took months of due diligence, high fees, and physical paperwork. But the 2024 real estate landscape is being redesigned by smart contracts. Institutional investors and savvy family offices are pivoting towards tokenized assets for one primary reason: liquidity.\n\nTokenization allows property owners to unlock equity without selling the entire building. Need $1M for a new development? Tokenize 10% of your current portfolio and sell it to a global pool of investors in hours. The secondary markets for these tokens are opening up, allowing investors to trade real estate units with the same ease as shares of Apple or Tesla. \n\n'Modern portfolios need real estate exposure, but they need it to be agile,' says a Fintech strategist at a top-tier investment bank. The integration of AI-driven property management with blockchain accounting is creating a 'set and forget' asset class that is virtually frictionless. While regulators are still catching up, the efficiency gains are too large to ignore. In a world of high interest rates, the ability to micro-finance and trade property interests is no longer a luxury—it's a competitive necessity for the modern REIT (Real Estate Investment Trust).",
                "context": "The global market for tokenized assets is expected to reach $16 trillion by 2030, with real estate leading the charge as the largest underlying asset class.",
                "claims": [
                    {"text": "This is the most significant financial innovation since the ETF.", "source": "Wall Street Analyst"},
                    {"text": "We are turning slow-moving bricks into high-speed financial data.", "source": "CTO of GlobalProp"}
                ],
                "preQuoteAnalysis": "Forbes looks at the story through the lens of institutional finance and venture capital, prioritizing ROI and market efficiency.",
                "postQuoteAnalysis": "The article frames the resistance from regulators not as a protection of rights, but as a bureaucratic hurdle for unavoidable progress.",
                "implications": {
                    "owner": "For large property owners, this offers a way to raise capital that is faster and often cheaper than a traditional bank loan."
                },
                "blindSpot": "The analysis completely overlooks the social impact of these investments on the accessibility of housing for the local workforce.",
                "interstitialNotes": [
                    {"pos": 1, "text": "TNE Intelligence: This perspective is purely financial, focusing on the macro trends and institutional adoption."},
                    {"pos": 2, "text": "Note: The mention of 'Real World Assets' (RWA) is key to understanding where the big venture capital is flowing."}
                ]
            }
        }
    ] $$,
    -- DESGLOSE DE INTELIGENCIA (6 CLAVES MASIVAS)
    $$ [
        "1. ¿QUÉ ES EXACTAMENTE UN TOKEN INMOBILIARIO?: A diferencia de un NFT artístico, un token de vivienda es un 'Security Token'. Representa una participación legal en una sociedad que es dueña del edificio. Al comprarlo, estás adquiriendo el derecho a recibir tu parte de los beneficios (alquileres o plusvalía por venta) de forma automatizada. Es, en esencia, un dividendo inmobiliario digital.",
        "2. DEMOCRATIZACIÓN VS. FINANCIARIZACIÓN: El debate central gira en torno al acceso. ¿Es positivo que un joven pueda invertir 500€ en un local comercial? Sí, desde la educación financiera. Pero, ¿es positivo que ese local comercial se revalorice tanto que un comerciante de barrio ya no pueda pagar el alquiler? Aquí es donde el derecho a la vivienda choca con la libertad de mercado.",
        "3. EL RIESGO DE LA 'UBAERIZACIÓN' DEL LADRILLO: Al igual que Uber eliminó la cara humana del transporte, la tokenización podría eliminar la cara humana de la propiedad. Si un edificio tiene 5.000 dueños digitales, la comunicación entre inquilino y propiedad se vuelve puramente mediada por una plataforma. Esto dificulta la resolución de conflictos habituales y la negociación de alquileres sociales.",
        "4. LA RESPUESTA DE LA CNMV: El regulador español está siendo cauteloso pero constructivo. Ha incluido a la tokenización dentro de la nueva Ley de Mercados de Valores, obligando a las plataformas a estar registradas. Sin embargo, todavía queda un vacío legal sobre cómo tributan estos dividendos si el inversor está en otra jurisdicción fiscal, lo que podría atraer capitales opacos.",
        "5. LIQUIDEZ: LA PALABRA MÁGICA: Tradicionalmente, vender un piso tardaba 6 meses. Con los tokens, puedes vender tu participación en un 'exchange' (mercado secundario) en cuestión de segundos. Esta liquidez extrema atrae mucho capital, pero también puede generar caídas de precio bruscas si hay una noticia negativa sobre el barrio o la ciudad, algo impensable en el mercado físico.",
        "6. HACIA UN MODELO HÍBRIDO: Es probable que no veamos el fin de la compra tradicional, sino un modelo mixto. Los grandes fondos usarán la tokenización para financiarse más rápido, mientras que los ciudadanos la usarán como hucha de ahorros vinculada al activo más seguro de España: el suelo. La clave será si el Estado se atreve a tokenizar vivienda pública para que los ciudadanos sean dueños de su propio parque social."
    ] $$
);
