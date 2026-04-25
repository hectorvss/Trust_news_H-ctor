
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  `.repeat(4);

  return basePrefix + middleContent;
};

const mockStories = [
  {
    id: "ley-vivienda-2024",
    title: "El Gobierno de España aprueba una nueva ley de vivienda para limitar alquileres",
    image: "https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=800",
    time: "hace 2 horas",
    location: "Madrid, España",
    sourceCount: 42,
    bias: { left: 45, center: 30, right: 25 },
    factuality: "ALTA",
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
    id: "economia-fmi-2024",
    title: "La economía española crecerá un 2,4% en 2024 según el FMI",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    time: "hace 5 horas",
    location: "España",
    sourceCount: 18,
    bias: { left: 20, center: 60, right: 20 },
    factuality: "ALTA",
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
    id: "reforma-mordaza-2024",
    title: "Reforma de la Ley de Seguridad Ciudadana: Tensión en el Congreso",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
    time: "hace 8 horas",
    category: "POLÍTICA",
    sourceCount: 35,
    bias: { left: 40, center: 10, right: 50 },
    summary: "El debate sobre las pelotas de goma divide al bloque de investidura y la oposición.",
    fullContent: generateLongText("Reforma Ley Mordaza", "CENTRO", "POLÍTICA"),
    articles: [
      { source: "La Marea", bias: "LEFT", fact: "ALTA", time: "Hace 7h", title: "El fin de las pelotas de goma: Un paso hacia una policía democrática", summary: "Defensa de la reforma.", readerContent: { whatHappened: generateLongText("Ley Mordaza", "IZQUIERDA", "DERECHOS"), blindSpot: "Subestima retos logísticos." } },
      { source: "La Vanguardia", bias: "CENTER", fact: "ALTA", time: "Hace 8h", title: "Equilibrio entre seguridad y manifestación", summary: "Análisis político.", readerContent: { whatHappened: generateLongText("Ley Mordaza", "CENTRO", "POLÍTICA"), blindSpot: "Equilibrio." } },
      { source: "La Razón", bias: "RIGHT", fact: "ALTA", time: "Hace 9h", title: "Desprotección total a la Policía", summary: "Crítica a la pérdida de autoridad.", readerContent: { whatHappened: generateLongText("Ley Mordaza", "DERECHA", "SEGURIDAD"), blindSpot: "Omite condenas europeas." } }
    ]
  },
  {
    id: "huelga-sanidad-2024",
    title: "Huelga indefinida en la Sanidad Pública por la falta de recursos",
    image: "https://images.unsplash.com/photo-1576091160550-217359f41f18?auto=format&fit=crop&q=80&w=800",
    time: "hace 10 horas",
    category: "SOCIAL",
    sourceCount: 28,
    bias: { left: 55, center: 25, right: 20 },
    summary: "Médicos demandan 10 minutos por paciente y fin de la precariedad laboral.",
    fullContent: generateLongText("Huelga Sanidad", "SOCIAL", "SALUD"),
    articles: [
      { source: "elDiario.es", bias: "LEFT", fact: "ALTA", title: "Grito unánime en defensa de la Sanidad Pública", readerContent: { whatHappened: generateLongText("Huelga Sanidad", "IZQUIERDA", "SALUD") } },
      { source: "RTVE", bias: "CENTER", fact: "ALTA", title: "Servicios mínimos de la huelga", readerContent: { whatHappened: generateLongText("Huelga Sanidad", "CENTRO", "INFO") } },
      { source: "OkDiario", bias: "RIGHT", fact: "ALTA", title: "Huelgas políticas", readerContent: { whatHappened: generateLongText("Huelga Sanidad", "DERECHA", "POLITICA") } }
    ]
  },
  {
    id: "hidrogeno-verde-2024",
    title: "Inversión histórica en Puertollano para el Hub del Hidrógeno Verde",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
    time: "hace 12 horas",
    category: "TECNOLOGÍA",
    sourceCount: 22,
    bias: { left: 15, center: 70, right: 15 },
    summary: "El proyecto H2Med recibe el visto bueno europeo para su desarrollo masivo.",
    fullContent: generateLongText("Hidrógeno Verde", "CENTRO", "ENERGÍA"),
    articles: [
      { source: "EcoGestión", bias: "LEFT", fact: "ALTA", title: "Soberanía energética", readerContent: { whatHappened: generateLongText("H2", "IZQ", "ECO") } },
      { source: "Actualidad", bias: "CENTER", fact: "ALTA", title: "PERTE energético", readerContent: { whatHappened: generateLongText("H2", "CENTER", "INDUSTRIA") } },
      { source: "Libre Mercado", bias: "RIGHT", fact: "ALTA", title: "¿Burbuja del hidrógeno?", readerContent: { whatHappened: generateLongText("H2", "RIGHT", "FINANZAS") } }
    ]
  },
  {
    id: "regularizacion-2024",
    title: "Inicia el proceso de regularización para 500.000 trabajadores",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
    time: "hace 2 horas",
    category: "POLÍTICA",
    sourceCount: 24,
    bias: { left: 45, center: 40, right: 15 },
    summary: "Dignidad laboral y economía sumergida.",
    fullContent: generateLongText("Regularización", "CENTRO", "SOCIAL"),
    articles: [
      { source: "Público", bias: "LEFT", title: "Justicia frente explotación", readerContent: { whatHappened: generateLongText("REG", "LEFT", "DDHH") } },
      { source: "La Vanguardia", bias: "CENTER", title: "Impacto económico", readerContent: { whatHappened: generateLongText("REG", "CENTER", "ECO") } },
      { source: "ABC", bias: "RIGHT", title: "Efecto llamada", readerContent: { whatHappened: generateLongText("REG", "RIGHT", "SEGURIDAD") } }
    ]
  },
  {
     id: "pekin-ev-2024",
     title: "Pedro Sánchez en Pekín: Alianza estratégica por el coche eléctrico",
     image: "https://images.unsplash.com/photo-1547983331-f64a203ba2d3?auto=format&fit=crop&q=80&w=800",
     category: "INTERNACIONAL",
     summary: "Acuerdos industriales estratégicos.",
     fullContent: generateLongText("Sánchez Pekín", "CENTER", "DIPLOMACIA"),
     articles: [
       { source: "El País", bias: "LEFT", title: "Liderazgo diplomático", readerContent: { whatHappened: generateLongText("PKN", "LEFT", "DIP") } },
       { source: "EFE", bias: "CENTER", title: "Memorandos Xi-Sánchez", readerContent: { whatHappened: generateLongText("PKN", "CENTER", "DIP") } },
       { source: "El Mundo", bias: "RIGHT", title: "Intereses Pekín", readerContent: { whatHappened: generateLongText("PKN", "RIGHT", "DIP") } }
     ]
  },
  {
     id: "ia-banca-2024",
     title: "La IA generativa conquista el 40% de la operativa bancaria avanzada",
     category: "TECNOLOGÍA",
     summary: "Transformación tecnológica radical.",
     fullContent: generateLongText("IA Banca", "CENTER", "TECH"),
     articles: [
       { source: "Ctxt", bias: "LEFT", title: "Algoritmo despide", readerContent: { whatHappened: generateLongText("IAB", "LEFT", "LAB") } },
       { source: "Xataka", bias: "CENTER", title: "Dentro del LLM", readerContent: { whatHappened: generateLongText("IAB", "CENTER", "TECH") } },
       { source: "Expansión", bias: "RIGHT", title: "Ahorro millonario", readerContent: { whatHappened: generateLongText("IAB", "RIGHT", "FIN") } }
     ]
  },
  {
     id: "euro-final-2026",
     title: "Final Eurocopa 2026: España e Inglaterra buscan la gloria en Madrid",
     category: "DEPORTE",
     summary: "Duelo épico en el Bernabéu.",
     fullContent: generateLongText("Euro Final", "CENTER", "DEPORTE"),
     articles: [
       { source: "Mundo Dep", bias: "LEFT", title: "Justicia poética", readerContent: { whatHappened: generateLongText("EURO", "LEFT", "DEP") } },
       { source: "Marca", bias: "CENTER", title: "Duelo de colosos", readerContent: { whatHappened: generateLongText("EURO", "CENTER", "DEP") } },
       { source: "As", bias: "RIGHT", title: "Rugido Bernabéu", readerContent: { whatHappened: generateLongText("EURO", "RIGHT", "DEP") } }
     ]
  },
  {
     id: "tregua-gaza-2024",
     title: "Alto el fuego permanente en Gaza después de meses de mediación",
     category: "INTERNACIONAL",
     summary: "Hito diplomático humanitario.",
     fullContent: generateLongText("Gaza", "CENTER", "GLOBAL"),
     articles: [
       { source: "Al Jazeera", bias: "LEFT", title: "Esperanza tras horror", readerContent: { whatHappened: generateLongText("GZ", "LEFT", "HUM") } },
       { source: "Reuters", bias: "CENTER", title: "Pacto de El Cairo", readerContent: { whatHappened: generateLongText("GZ", "CENTER", "DIP") } },
       { source: "Fox News", bias: "RIGHT", title: "Fragilidad pacto", readerContent: { whatHappened: generateLongText("GZ", "RIGHT", "SEG") } }
     ]
  },
  {
     id: "prado-digital-2024",
     title: "El Prado inaugura su era digital: Encuentros con la historia",
     category: "CULTURA",
     summary: "Patrimonio accesible vía IA.",
     fullContent: generateLongText("Prado Digital", "CENTER", "CULT"),
     articles: [
       { source: "CulturDiario", bias: "LEFT", title: "Democratización cultural", readerContent: { whatHappened: generateLongText("PRD", "LEFT", "CUL") } },
       { source: "La Vanguardia", bias: "CENTER", title: "Eternidad pinacoteca", readerContent: { whatHappened: generateLongText("PRD", "CENTER", "CUL") } },
       { source: "ABC Cultura", bias: "RIGHT", title: "Banalizar el arte", readerContent: { whatHappened: generateLongText("PRD", "RIGHT", "CUL") } }
     ]
  },
  {
     id: "sequia-sur-2024",
     title: "Emergencia por sequía: El Guadalquivir toca fondo",
     category: "SOCIAL",
     summary: "Crisis hídrica en Andalucía.",
     fullContent: generateLongText("Sequía", "CENTER", "SOCIAL"),
     articles: [
       { source: "La Marea", bias: "LEFT", title: "Factura climática", readerContent: { whatHappened: generateLongText("SQ", "LEFT", "CLIM") } },
       { source: "Ideal", bias: "CENTER", title: "Auxilio a Bruselas", readerContent: { whatHappened: generateLongText("SQ", "CENTER", "SOC") } },
       { source: "La Razón", bias: "RIGHT", title: "Castigo regadío", readerContent: { whatHappened: generateLongText("SQ", "RIGHT", "AGR") } }
     ]
  }
];

async function seed() {
  console.log("Iniciando MASTER SEED...");
  for (const s of mockStories) {
    const payload = {
      id: s.id,
      category: s.category,
      title: s.title,
      summary: s.summary,
      image_url: s.image,
      time_label: s.time || "recientemente",
      location: s.location || "España",
      bias: s.bias || { left: 33, center: 33, right: 34 },
      factuality: s.factuality || "ALTA",
      source_count: s.sourceCount || s.articles?.length || 0,
      full_content: s.fullContent,
      perspectivas_info: s.perspectivasInfo,
      consenso_narrativo: s.consensoNarrativo,
      cifras_clave: s.cifrasClave || [],
      verificacion_info: s.verificacionInfo,
      blind_spot: s.blindSpot || (s.articles?.[0]?.readerContent?.blindSpot),
      articles: s.articles || [],
      status: 'published'
    };
    
    console.log(`Procesando: ${s.id}`);
    const { error } = await supabase.from('stories').upsert(payload, { onConflict: 'id' });
    if (error) console.error(`Error en ${s.id}:`, error);
  }
  console.log("MASTER SEED COMPLETADO.");
}

seed();
