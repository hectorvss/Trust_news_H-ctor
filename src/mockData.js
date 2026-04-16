// Helper to generate long text for mock data satisfying the >2000 character requirement
const generateLongText = (topic, bias, type) => {
  const basePrefix = `Este análisis exhaustivo profundiza en las capas multifacéticas de ${topic}. Desde una perspectiva de ${bias}, observamos que `;
  const middleContent = `
    En un mundo cada vez más polarizado, la información se convierte en el activo más valioso. 
    Este reportaje especial de investigación ha requerido más de 40 horas de análisis documental y entrevistas con expertos 
    de primer nivel en el sector. Al analizar los datos crudos, se hace evidente que los modelos predictivos utilizados 
    anteriormente han fallado en capturar la complejidad sistémica de los eventos actuales. 
    
    La convergencia de factores macroeconómicos, tensiones geopolíticas y la aceleración tecnológica ha creado 
    un "cisne negro" que desafía las interpretaciones tradicionales. Mientras que algunos sectores abogan por 
    una intervención estatal fuerte para mitigar los riesgos, otros sugieren que la autorregulación del mercado 
    es el único camino hacia una estabilidad duradera. 
    
    Es fundamental entender que no estamos ante un evento aislado. Las raíces de este fenómeno se hunden en 
    décadas de decisiones políticas y económicas que ahora convergen en un punto crítico. La opinión pública 
    se encuentra dividida, a menudo alimentada por narrativas simplistas que ignoran los matices técnicos. 
    A través de este despliegue informativo, buscamos restaurar la profundidad que el tema merece. 
    
    Los indicadores de sentimiento muestran un aumento en la ansiedad social, pero también una disposición 
    creciente a adoptar soluciones innovadoras. El papel de las instituciones europeas será determinante 
    en los próximos meses. ¿Podrá Bruselas coordinar una respuesta unificada o veremos una fragmentación 
    de políticas nacionales? La respuesta a esta pregunta definirá la salud democrática de la región 
    durante la próxima década. 
    
    Continuamos desglosando los puntos clave: el impacto en la cadena de suministro, la erosión del poder 
    adquisitivo medio y la transformación digital de los procesos de toma de decisiones. Cada uno de estos 
    puntos está interconectado mediante hilos invisibles de causalidad que este artículo pretende desvelar. 
    La profundidad de nuestra investigación nos permite afirmar que estamos ante una transición de paradigma. 
    Lo que ayer se consideraba una verdad económica inamovible, hoy es cuestionado por las métricas de eficiencia. 
    
    Finalmente, la dimensión humana de la noticia es lo que debe prevalecer. Detrás de los porcentajes y 
    los grandes titulares hay historias de adaptación y resiliencia. El periodismo de calidad tiene la 
    obligación ética de dar voz a estos procesos. En las siguientes secciones de este reporte, el lector 
    encontrará datos exclusivos no publicados en otros medios nacionales, fruto de filtraciones internas 
    y análisis de big data aplicado al periodismo de investigación. Este compromiso con la verdad y la 
    transparencia es lo que define nuestra marca editorial.
  `.repeat(4); // Repeat to ensure >2000 chars

  return basePrefix + middleContent;
};

export const mockStories = [
  {
    id: 1,
    title: "El Gobierno de España aprueba una nueva ley de vivienda para limitar alquileres",
    image: "https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=800",
    time: "hace 2 horas",
    location: "Madrid, España",
    sourceCount: 42,
    bias: { left: 45, center: 30, right: 25 },
    factuality: "High",
    consensus: "MEDIO",
    impact: "ALTO",
    category: "SOCIAL",
    summary: "Se ha aprobado un marco regulatorio para las zonas tensionadas en las principales ciudades españolas, buscando frenar la escalada de precios.",
    analyticalSnippet: "División entre la justicia social del acceso al hogar y la seguridad jurídica del mercado privado.",
    consensoNarrativo: "Justicia social vs Seguridad de mercado",
    cifrasClave: [{ label: 'Límite', value: '3%' }, { label: 'Afectados', value: '2.4M' }],
    verificacionInfo: "Confirmado via BOE.",
    desglose: ["Tope del 3%", "Zonas tensionadas"],
    contexto: "España tiene una de las menores tasas de vivienda social de la UE.",
    fullContent: generateLongText("la Ley de Vivienda", "CENTRO", "EDITORIAL"),
    perspectivasInfo: "Debate intenso entre protección al inquilino y derechos del propietario.",
    articles: [
      {
        source: "elDiario.es", bias: "LEFT", fact: "ALTA", time: "Hace 1h", origin: "Nacional", type: "ANÁLISIS", author: "R. SEGURA",
        title: "Una victoria histórica para el derecho al hogar: claves de la nueva Ley",
        summary: "Análisis del avance en derechos que supone la regulación de precios en zonas tensionadas.",
        readerContent: {
          whatHappened: generateLongText("Ley de Vivienda", "IZQUIERDA PROGRESISTA", "INFORMATIVO"),
          interstitialNotes: [{ pos: 1, text: "Dato TNE: El 70% de los jóvenes destina más del 40% de su sueldo al alquiler." }],
          context: "Décadas de desregulación han llevado al mercado a un punto de quiebre.",
          claims: [{ text: "La vivienda es un derecho, no un activo financiero.", source: "Plataforma de Afectados" }],
          implications: { owner: "Los grandes tenedores verán reducidas sus expectativas de rentabilidad extrema." },
          blindSpot: "El artículo ignora el posible impacto en la reducción de oferta de vivienda nueva."
        }
      },
      {
        source: "RTVE", bias: "CENTER", fact: "ALTA", time: "Hace 2h", origin: "Institucional", type: "REPORTE", author: "U. NOTICIAS",
        title: "Guía técnica: Cómo te afecta el nuevo índice de precios de alquiler",
        summary: "Explicación detallada y neutral de los mecanismos de aplicación de la ley.",
        readerContent: {
          whatHappened: generateLongText("Ley de Vivienda", "CENTRO NEUTRAL", "TÉCNICO"),
          interstitialNotes: [{ pos: 1, text: "Nota: La aplicación depende de la declaración de zona tensionada por cada CCAA." }],
          context: "El índice se basa en datos históricos de la Agencia Tributaria.",
          claims: [{ text: "Buscamos un equilibrio que dé estabilidad al mercado.", source: "Ministerio de Vivienda" }],
          implications: { owner: "Impacto moderado con incentivos fiscales para el pequeño propietario." },
          blindSpot: "Falta de análisis sobre la capacidad real de las CCAA para gestionar el índice."
        }
      },
      {
        source: "El Mundo", bias: "RIGHT", fact: "ALTA", time: "Hace 3h", origin: "Nacional", type: "CRÍTICA", author: "J. L. ALONSO",
        title: "El asalto a la propiedad privada: El riesgo de colapso de la oferta",
        summary: "Advertencia sobre la fuga de capitales y la inseguridad jurídica que genera la ley.",
        readerContent: {
          whatHappened: generateLongText("Ley de Vivienda", "DERECHA LIBERAL", "OPINIÓN"),
          interstitialNotes: [{ pos: 1, text: "Alerta: Experiencias en Berlín y París muestran que el control de precios puede reducir la oferta." }],
          context: "La inseguridad jurídica es el mayor enemigo de la inversión inmobiliaria.",
          claims: [{ text: "Esta ley es un ataque directo al ahorro de las familias.", source: "Asociación de Propietarios" }],
          implications: { owner: "Riesgo de parálisis del sector y deterioro del parque de viviendas." },
          blindSpot: "Omite los beneficios directos para familias en riesgo de exclusión."
        }
      }
    ]
  },
  {
    id: 2,
    title: "La economía española crecerá un 2,4% en 2024 según el FMI",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    time: "hace 5 horas",
    location: "España",
    sourceCount: 18,
    bias: { left: 20, center: 60, right: 20 },
    factuality: "High",
    consensus: "ALTO",
    impact: "MEDIO",
    category: "FINANZAS",
    summary: "El FMI eleva la previsión de crecimiento de España, destacando la resiliencia del sector exterior.",
    analyticalSnippet: "Consenso macroeconómico con debate sobre la sostenibilidad del déficit.",
    cifrasClave: [{ label: 'PIB prev.', value: '2.4%' }, { label: 'Deuda', value: '107%' }],
    fullContent: generateLongText("Previsiones FMI", "CENTRO", "ECONOMÍA"),
    articles: [
      {
        source: "Público", bias: "LEFT", fact: "ALTA", time: "Hace 4h", title: "El éxito de la reforma laboral impulsa el PIB por encima de la media europea",
        summary: "Enfoque en cómo la calidad del empleo está sosteniendo el consumo interno.",
        readerContent: { whatHappened: generateLongText("PIB FMI", "IZQUIERDA", "ECONOMÍA SOCIAL"), blindSpot: "No menciona el aumento de los costes de financiación para pymes." }
      },
      {
        source: "EFE", bias: "CENTER", fact: "ALTA", time: "Hace 5h", title: "España liderará el crecimiento de la Eurozona en 2024",
        summary: "Resumen factual de los datos publicados en el World Economic Outlook.",
        readerContent: { whatHappened: generateLongText("PIB FMI", "CENTRO", "AGENCIA"), blindSpot: "Falta profundidad en el análisis de riesgos geopolíticos." }
      },
      {
        source: "ABC", bias: "RIGHT", fact: "ALTA", time: "Hace 6h", title: "El parche del gasto público oculta un déficit estructural preocupante",
        summary: "Crítica al crecimiento basado en el endeudamiento y la burocracia.",
        readerContent: { whatHappened: generateLongText("PIB FMI", "DERECHA", "FINANZAS"), blindSpot: "No valora el aumento récord de la inversión extranjera en renovables." }
      }
    ]
  },
  {
    id: 3,
    title: "Reforma de la Ley de Seguridad Ciudadana: Tensión en el Congreso",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
    time: "hace 8 horas",
    category: "POLÍTICA",
    sourceCount: 35,
    bias: { left: 40, center: 10, right: 50 },
    summary: "El debate sobre las pelotas de goma divide al bloque de investidura y la oposición.",
    fullContent: generateLongText("Reforma Ley Mordaza", "CENTRO", "POLÍTICA"),
    articles: [
      {
        source: "La Marea", bias: "LEFT", fact: "ALTA", time: "Hace 7h", title: "El fin de las pelotas de goma: Un paso hacia una policía democrática",
        summary: "Defensa de la reforma como garantía de derechos fundamentales.",
        readerContent: { whatHappened: generateLongText("Ley Mordaza", "IZQUIERDA", "DERECHOS"), blindSpot: "Subestima los retos logísticos de las unidades de intervención." }
      },
      {
        source: "La Vanguardia", bias: "CENTER", fact: "ALTA", time: "Hace 8h", title: "El equilibrio entre la seguridad y el derecho de manifestación",
        summary: "Análisis de la negociación política en la Cámara Baja.",
        readerContent: { whatHappened: generateLongText("Ley Mordaza", "CENTRO", "POLÍTICA"), blindSpot: "Evita posicionarse sobre la eficacia de los nuevos materiales antidisturbios." }
      },
      {
        source: "La Razón", bias: "RIGHT", fact: "ALTA", time: "Hace 9h", title: "Desprotección total a la Policía delante de la violencia callejera",
        summary: "Crítica a la pérdida de autoridad de los agentes en situaciones críticas.",
        readerContent: { whatHappened: generateLongText("Ley Mordaza", "DERECHA", "SEGURIDAD"), blindSpot: "No menciona las condenas europeas previas por uso excesivo de la fuerza." }
      }
    ]
  },
  {
    id: 4,
    title: "Huelga indefinida en la Sanidad Pública por la falta de recursos",
    image: "https://images.unsplash.com/photo-1576091160550-217359f41f18?auto=format&fit=crop&q=80&w=800",
    time: "hace 10 horas",
    category: "SOCIAL",
    sourceCount: 28,
    bias: { left: 55, center: 25, right: 20 },
    summary: "Médicos demandan 10 minutos por paciente y fin de la precariedad laboral.",
    fullContent: generateLongText("Huelga Sanidad", "SOCIAL", "SALUD"),
    articles: [
      {
        source: "elDiario.es", bias: "LEFT", fact: "ALTA", time: "Hace 9h", title: "Grito unánime en defensa de la Sanidad Pública: 'No podemos más'",
        summary: "Reportaje sobre el agotamiento del personal tras años de recortes.",
        readerContent: { whatHappened: generateLongText("Huelga Sanidad", "IZQUIERDA", "SALUD PÚBLICA"), blindSpot: "No aborda el problema de la falta de oferta de MIR a nivel nacional." }
      },
      {
        source: "RTVE", bias: "CENTER", fact: "ALTA", time: "Hace 10h", title: "Servicios mínimos y cronodatos de la huelga en las CCAA",
        summary: "Datos sobre el seguimiento y el impacto en las listas de espera.",
        readerContent: { whatHappened: generateLongText("Huelga Sanidad", "CENTRO", "INFORMATIVO"), blindSpot: "Falta análisis sobre las diferencias salariales entre regiones." }
      },
      {
        source: "OkDiario", bias: "RIGHT", fact: "ALTA", time: "Hace 11h", title: "Huelgas políticas orquestadas para desgastar a gobiernos regionales",
        summary: "Tesis sobre la motivación partidista detrás de las movilizaciones.",
        readerContent: { whatHappened: generateLongText("Huelga Sanidad", "DERECHA", "POLÍTICA"), blindSpot: "Ignora las demandas técnicas reales aprobadas por los colegios médicos." }
      }
    ]
  },
  {
    id: 5,
    title: "Inversión histórica en Puertollano para el Hub del Hidrógeno Verde",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
    time: "hace 12 horas",
    category: "TECNOLOGÍA",
    sourceCount: 22,
    bias: { left: 15, center: 70, right: 15 },
    summary: "El proyecto H2Med recibe el visto bueno europeo para su desarrollo masivo.",
    fullContent: generateLongText("Hidrógeno Verde", "CENTRO", "ENERGÍA"),
    articles: [
      { source: "EcoGestión", bias: "LEFT", fact: "ALTA", time: "Hace 11h", title: "Soberanía energética y abandono de los fósiles: El hito de Puertollano", summary: "Reportaje sobre la transición ecológica justa.", readerContent: { whatHappened: generateLongText("H2 Verde", "IZQUIERDA", "ECOLOGÍA"), blindSpot: "No analiza el alto coste de producción actual." } },
      { source: "Actualidad Económica", bias: "CENTER", fact: "ALTA", time: "Hace 12h", title: "El PERTE energético comienza a dar sus frutos industriales", summary: "Análisis de la colaboración público-privada.", readerContent: { whatHappened: generateLongText("H2 Verde", "CENTRO", "INDUSTRIA"), blindSpot: "Poca información sobre la infraestructura de transporte necesaria." } },
      { source: "Libre Mercado", bias: "RIGHT", fact: "ALTA", time: "Hace 13h", title: "¿Burbuja del hidrógeno? Dudas sobre la rentabilidad a largo plazo", summary: "Dudas sobre la dependencia de las subvenciones públicas.", readerContent: { whatHappened: generateLongText("H2 Verde", "DERECHA", "OPINIÓN"), blindSpot: "Omite los beneficios tácticos de reducir la dependencia de gas externo." } }
    ]
  },
  {
    id: 6,
    title: "Inicia el proceso de regularización para 500.000 trabajadores",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
    time: "hace 2 horas",
    category: "POLÍTICA",
    sourceCount: 24,
    bias: { left: 45, center: 40, right: 15 },
    summary: "Dignidad laboral y economía sumergida: el reto de la integración masiva.",
    fullContent: generateLongText("Regularización Migrantes", "CENTRO", "POLÍTICA/SOCIAL"),
    articles: [
      { source: "Público", bias: "LEFT", fact: "ALTA", time: "1h", title: "Un acto de justicia frente a la explotación: Comienza la regularización", summary: "Enfoque en los derechos de las personas.", readerContent: { whatHappened: generateLongText("Migrantes", "IZQUIERDA", "DDHH"), blindSpot: "No aborda el impacto inicial en los servicios de extranjería." } },
      { source: "La Vanguardia", bias: "CENTER", fact: "ALTA", time: "2h", title: "El impacto económico de la regularización: Más cotizaciones y consumo", summary: "Análisis del potencial aumento del PIB laboral.", readerContent: { whatHappened: generateLongText("Migrantes", "CENTRO", "ECONOMÍA"), blindSpot: "Falta de datos sobre el coste de los procesos administrativos." } },
      { source: "ABC", bias: "RIGHT", fact: "ALTA", time: "3h", title: "Críticas por el 'efecto llamada' y la falta de recursos fronterizos", summary: "Preocupación por la seguridad y la gestión de fronteras.", readerContent: { whatHappened: generateLongText("Migrantes", "DERECHA", "ORDEN"), blindSpot: "Ignora la necesidad de mano de obra en el sector primario." } }
    ]
  },
  {
    id: 7,
    title: "Pedro Sánchez en Pekín: Alianza estratégica por el coche eléctrico",
    image: "https://images.unsplash.com/photo-1547983331-f64a203ba2d3?auto=format&fit=crop&q=80&w=800",
    time: "hace 8 horas",
    category: "INTERNACIONAL",
    sourceCount: 41,
    bias: { left: 30, center: 50, right: 20 },
    summary: "España busca posicionarse como el socio preferente de China en Europa.",
    fullContent: generateLongText("Sánchez en China", "CENTRO", "DIPLOMACIA"),
    articles: [
      { source: "El País", bias: "LEFT", fact: "ALTA", time: "7h", title: "España lidera la diplomacia europea en Pekín con acuerdos millonarios", summary: "Visión del éxito diplomático del Gobierno.", readerContent: { whatHappened: generateLongText("Sánchez China", "IZQUIERDA", "GLOBAL"), blindSpot: "No cuestiona las tensiones con la industria alemana." } },
      { source: "EFE", bias: "CENTER", fact: "ALTA", time: "8h", title: "Sánchez y Xi Jinping firman 14 memorandos de entendimiento", summary: "Listado factual de los logros del viaje.", readerContent: { whatHappened: generateLongText("Sánchez China", "CENTRO", "DIPLOMACIA"), blindSpot: "Falta de análisis crítico sobre la duración real de los contratos." } },
      { source: "El Mundo", bias: "RIGHT", fact: "ALTA", time: "9h", title: "Sánchez se entrega a los intereses de Pekín a espaldas de Bruselas", summary: "Crítica a la posible ruptura del consenso europeo.", readerContent: { whatHappened: generateLongText("Sánchez China", "DERECHA", "OPINIÓN"), blindSpot: "No menciona los beneficios inmediatos para las factorías de Valencia." } }
    ]
  },
  {
    id: 8,
    title: "La IA generativa conquista el 40% de la operativa bancaria avanzada",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    time: "hace 10 horas",
    category: "TECNOLOGÍA",
    sourceCount: 15,
    bias: { left: 5, center: 75, right: 20 },
    summary: "Eficiencia radical vs. pérdida de empleos cualificados en el sector financiero.",
    fullContent: generateLongText("IA Bancaria", "CENTRO", "TECNOLOGÍA"),
    articles: [
      { source: "Ctxt", bias: "LEFT", fact: "ALTA", time: "9h", title: "El algoritmo que despide: Cómo la IA está vaciando las sucursales", summary: "Preocupación por la deshumanización y el empleo.", readerContent: { whatHappened: generateLongText("IA Banca", "IZQUIERDA", "LABORAL"), blindSpot: "No admite las mejoras en la detección de fraudes." } },
      { source: "Xataka", bias: "CENTER", fact: "ALTA", time: "10h", title: "Dentro del LLM bancario: Así es la IA que gestiona tus hipotecas", summary: "Análisis técnico de la implementación de la IA.", readerContent: { whatHappened: generateLongText("IA Banca", "CENTRO", "TECNOLOGÍA"), blindSpot: "Ignora las implicaciones de ética algorítmica y sesgos." } },
      { source: "Expansión", bias: "RIGHT", fact: "ALTA", time: "11h", title: "La banca ahorra 450M€ en costes gracias a la automatización inteligente", summary: "Foco en la rentabilidad y el valor para el accionista.", readerContent: { whatHappened: generateLongText("IA Banca", "DERECHA", "NEGOCIOS"), blindSpot: "Omite los riesgos de seguridad y privacidad a gran escala." } }
    ]
  },
  {
    id: 9,
    title: "Final Eurocopa 2026: España e Inglaterra buscan la gloria en Madrid",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    time: "hace 1 hora",
    category: "DEPORTE",
    sourceCount: 52,
    bias: { left: 33, center: 34, right: 33 },
    summary: "El Bernabéu acoge el mayor evento deportivo de la década en suelo español.",
    fullContent: generateLongText("Final Eurocopa", "CENTRO", "DEPORTE"),
    articles: [
      { source: "Mundo Deportivo", bias: "LEFT", fact: "ALTA", time: "1h", title: "Justicia poética: España a un paso de la leyenda con su fútbol total", summary: "Enfoque épico y apoyo incondicional a la Roja.", readerContent: { whatHappened: generateLongText("Final Euro", "IZQUIERDA", "DEPORTE"), blindSpot: "No analiza las debilidades defensivas ante el físico inglés." } },
      { source: "Marca", bias: "CENTER", fact: "ALTA", time: "2h", title: "Duelo de colosos: Análisis táctico de la final de las finales", summary: "Estudio técnico de ambas plantillas.", readerContent: { whatHappened: generateLongText("Final Euro", "CENTRO", "TÉCNICO"), blindSpot: "Evita dar un favorito claro por compromiso comercial." } },
      { source: "As", bias: "RIGHT", fact: "ALTA", time: "3h", title: "El rugido del Bernabéu: Factor clave para destronar a Inglaterra", summary: "Énfasis en el valor del estadio y la afición nacional.", readerContent: { whatHappened: generateLongText("Final Euro", "DERECHA", "SENTIMIENTO"), blindSpot: "Ignora las quejas por las agresiones leves en las fanzones inglesas." } }
    ]
  },
  {
    id: 10,
    title: "Alto el fuego permanente en Gaza después de meses de mediación",
    image: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&q=80&w=800",
    time: "hace 3 horas",
    category: "INTERNACIONAL",
    sourceCount: 142,
    bias: { left: 40, center: 20, right: 40 },
    summary: "La ONU supervisará el corredor humanitario y el intercambio de rehenes.",
    fullContent: generateLongText("Paz Gaza", "CENTRO", "MUNDO"),
    articles: [
      { source: "Al Jazeera", bias: "LEFT", fact: "ALTA", time: "2h", title: "Esperanza tras el horror: El fin de los bombardeos sobre la Franja", summary: "Enfoque humanitario y en el alivio de la población civil.", readerContent: { whatHappened: generateLongText("Gaza", "IZQUIERDA", "HUMANITARIO"), blindSpot: "No detalla el protocolo de seguridad de las fronteras israelíes." } },
      { source: "Reuters", bias: "CENTER", fact: "ALTA", time: "3h", title: "Los puntos clave del acuerdo firmado en El Cairo", summary: "Resumen objetivo del pacto internacional.", readerContent: { whatHappened: generateLongText("Gaza", "CENTRO", "DIPLOMACIA"), blindSpot: "Poca información sobre los grupos opositores al pacto." } },
      { source: "Fox News", bias: "RIGHT", fact: "ALTA", time: "4h", title: "Fragilidad y desconfianza: ¿Cuánto durará realmente este pacto?", summary: "Visión escéptica sobre la seguridad a largo plazo.", readerContent: { whatHappened: generateLongText("Gaza", "DERECHA", "SEGURIDAD"), blindSpot: "Minimiza la extrema necesidad humanitaria del alto el fuego." } }
    ]
  },
  {
    id: 11,
    title: "El Prado inaugura su era digital: Encuentros cara a cara con la historia",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800",
    time: "hace 14 horas",
    category: "CULTURA",
    sourceCount: 14,
    bias: { left: 20, center: 70, right: 10 },
    summary: "IA y realidad mixta para democratizar el acceso al patrimonio nacional.",
    fullContent: generateLongText("Prado Digital", "CENTRO", "CULTURA"),
    articles: [
      { source: "El Diario Cultural", bias: "LEFT", fact: "ALTA", time: "13h", title: "El Prado para todos: Cómo la tecnología rompe las barreras de clase", summary: "La IA como herramienta de inclusión social.", readerContent: { whatHappened: generateLongText("Prado", "IZQUIERDA", "SOCIAL"), blindSpot: "Poca mención al coste de los equipos de realidad virtual." } },
      { source: "La Vanguardia", bias: "CENTER", fact: "ALTA", time: "14h", title: "La mayor pinacoteca del mundo ya es eterna en el espacio digital", summary: "Hito tecnológico y de archivo histórico.", readerContent: { whatHappened: generateLongText("Prado", "CENTRO", "ARTE"), blindSpot: "No trata el debate sobre el derecho de imagen de las obras." } },
      { source: "ABC Cultura", bias: "RIGHT", fact: "ALTA", time: "15h", title: "Cuidado con la banalización del arte: ¿Sustituirá el visor al lienzo?", summary: "Miedo a la pérdida de la experiencia aurática del arte.", readerContent: { whatHappened: generateLongText("Prado", "DERECHA", "ACADEMIA"), blindSpot: "Ignora la atracción de nuevos públicos jóvenes mediante el juego." } }
    ]
  },
  {
    id: 12,
    title: "Emergencia por sequía: El Guadalquivir toca fondo antes de verano",
    image: "https://images.unsplash.com/photo-1504150559433-c4aeeaeef8f2?auto=format&fit=crop&q=80&w=800",
    time: "hace 6 horas",
    category: "SOCIAL",
    sourceCount: 27,
    bias: { left: 30, center: 50, right: 20 },
    summary: "Se solicitan 600 millones a la UE para salvar la campaña agrícola.",
    fullContent: generateLongText("Sequía Sur", "CENTRO", "EMERGENCIA"),
    articles: [
      { source: "La Marea", bias: "LEFT", fact: "ALTA", time: "5h", title: "La factura del cambio climático: El campo andaluz se queda sin tiempo", summary: "Denuncia sobre la falta de políticas climáticas eficaces.", readerContent: { whatHappened: generateLongText("Sequía", "IZQUIERDA", "CLIMA"), blindSpot: "No aborda la ineficacia de algunos modelos de gestión pública." } },
      { source: "Ideal", bias: "CENTER", fact: "ALTA", time: "6h", title: "Andalucía pide auxilio a Bruselas ante la peor sequía del siglo", summary: "Informa sobre la petición oficial del gobierno regional.", readerContent: { whatHappened: generateLongText("Sequía", "CENTRO", "INFORMATIVO"), blindSpot: "Poca profundidad en el impacto sobre el consumo doméstico." } },
      { source: "La Razón", bias: "RIGHT", fact: "ALTA", time: "7h", title: "El castigo al regadío: La ideología verde pone en riesgo el pan del sur", summary: "Crítica a las restricciones ambientales extremas.", readerContent: { whatHappened: generateLongText("Sequía", "DERECHA", "AGRICULTURA"), blindSpot: "Ignora los datos científicos sobre el agotamiento real de los acuíferos." } }
    ]
  }
];

export const sections = {
  trending: ["Final Eurocopa Bernabéu", "Paz en Gaza", "Ley Vivienda", "IA en Bancos", "Sequía"],
  headlines: ["El IBEX roza los 12.000 puntos.", "Nuevas ayudas al coche eléctrico."]
};
