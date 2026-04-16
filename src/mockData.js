// Real News Data for trustnews.es - April 16, 2026
export const mockStories = [
  {
    id: "1",
    category: "POLÍTICA",
    location: "España",
    title: "España abre hoy el portal telemático para la regularización de 500.000 migrantes",
    summary: "El Gobierno activa el Real Decreto que permitirá a medio millón de personas solicitar su estatus legal en un proceso histórico que busca reducir la economía sumergida.",
    time: "hace 2 horas",
    author: "Elena Martínez",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
    bias: { left: 45, center: 40, right: 15 },
    sources: 24,
    factuality: "alta",
    consensus: "medio",
    impact: "alto",
    sourceCount: 24,
    detailStats: {
      keyFigures: [
        { label: "Beneficiarios", value: "500k", trend: "up" },
        { label: "Impacto PIB", value: "+1.2%", trend: "up" },
        { label: "Plazo", value: "6 meses", trend: "stable" }
      ],
      factualScore: 92,
      sourceList: ["El País", "RTVE", "El Mundo", "EFE", "La Vanguardia"]
    },
    analyticalSnippet: "Consenso sobre la necesidad técnica de la medida (60%), con debate intenso en la derecha sobre el efecto llamada (30%) y críticas de colectivos por la lentitud de la web (10%).",
    articles: [
      {
        id: "a1",
        source: "El País",
        bias: "LEFT",
        title: "Un paso hacia la justicia social: el portal de regularización entra en vigor",
        excerpt: "La medida permitirá aflorar miles de empleos y garantizar derechos fundamentales a personas que llevan años integradas en la sociedad española.",
        readerContent: {
          context: "España ha aprobado una de las regularizaciones más ambiciosas de la UE, afectando a sectores clave como la agricultura y los cuidados.",
          implications: "Se espera un aumento de la recaudación por seguridad social y una mejora en la cohesión social de los barrios más vulnerables.",
          keyClaims: ["Justicia social histórica", "Beneficio económico neto", "Fortalecimiento del sistema público"]
        }
      },
      {
        id: "a2",
        source: "El Mundo",
        bias: "RIGHT",
        title: "Preocupación en las CC.AA. por el impacto estructural de la regularización masiva",
        excerpt: "Diferentes regiones advierten de la presión sobre los servicios públicos y cuestionan si hay recursos suficientes para gestionar la avalancha de trámites.",
        readerContent: {
          context: "El decreto llega en un momento de tensión política entre el Gobierno central y las comunidades autónomas por la financiación autonómica.",
          implications: "Posible saturación de oficinas de extranjería y centros de salud de atención primaria.",
          keyClaims: ["Falta de coordinación autonómica", "Riesgo de efecto llamada", "Presión sobre servicios públicos"]
        }
      }
    ]
  },
  {
    id: "2",
    category: "VIVIENDA",
    location: "Madrid / Barcelona",
    title: "El Congreso debatirá el Decreto 8/2026: prórroga forzosa de alquileres y tope del 2%",
    summary: "La nueva ley busca blindar a los inquilinos ante la crisis de oferta, extendiendo los contratos que vencen este año y manteniendo el límite de precios.",
    time: "hace 4 horas",
    author: "Carlos Ruiz",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    bias: { left: 60, center: 20, right: 20 },
    sources: 18,
    factuality: "media",
    consensus: "bajo",
    impact: "alto",
    sourceCount: 18,
    detailStats: {
      keyFigures: [
        { label: "Tope Rentas", value: "2%", trend: "stable" },
        { label: "Prórroga", value: "2 años", trend: "none" },
        { label: "Votos aseg.", value: "176", trend: "up" }
      ],
      factualScore: 88,
      sourceList: ["Cinco Días", "El Confidencial", "idealista/news", "ABC"]
    },
    analyticalSnippet: "Fuerte sesgo de opinión según el medio: la prensa económica advierte de la retirada de oferta, mientras medios generalistas enfocan el alivio a las familias.",
    articles: [
      {
        id: "a3",
        source: "Cinco Días",
        bias: "CENTER",
        title: "Inquilinos y propietarios: el pulso por el tope del 2% llega a su fase crítica",
        excerpt: "La prórroga forzosa genera división entre los agentes inmobiliarios, que temen una congelación del mercado secundario de vivienda.",
        readerContent: {
          context: "El mercado del alquiler en España lleva encadenando subidas de doble dígito en las capitales desde 2024.",
          implications: "Estabilidad para los actuales inquilinos pero mayor dificultad de acceso para nuevos demandantes.",
          keyClaims: ["Protección inmediata de rentas", "Desincentivo a la inversión", "Necesidad de mayor parque público"]
        }
      }
    ]
  },
  {
    id: "3",
    category: "FINANZAS",
    location: "Unión Europea",
    title: "España corre contra reloj: 27.000M€ de Fondos Europeos pendientes de adjudicar",
    summary: "En la recta final de ejecución, el Ministerio de Economía acelera los procesos administrativos para evitar la devolución de capital estratégico a la UE.",
    time: "hace 6 horas",
    author: "Marta Sánchez",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    bias: { left: 10, center: 70, right: 20 },
    sources: 32,
    factuality: "alta",
    consensus: "alto",
    impact: "alto",
    sourceCount: 32,
    detailStats: {
      keyFigures: [
        { label: "Pdte Adjudicar", value: "27B€", trend: "down" },
        { label: "Ejecución", value: "78%", trend: "up" },
        { label: "Proyectos AI", value: "4.2B€", trend: "up" }
      ],
      factualScore: 96,
      sourceList: ["Expansión", "Reuters", "Bloomberg", "La Razón"]
    },
    analyticalSnippet: "Información mayoritariamente técnica. El debate político se centra en la capacidad de las CC.OO. para gestionar el flujo final de inversiones.",
    articles: [
      {
        id: "a4",
        source: "Expansión",
        bias: "RIGHT",
        title: "La burocracia amenaza con lastrar el último tramo de los fondos NextGen",
        excerpt: "Las empresas denuncian falta de agilidad en las convocatorias del PERTE, con miles de millones aún sin destino claro.",
        readerContent: {
          context: "España es el segundo mayor receptor de fondos de recuperación tras la pandemia, pero su ejecución está siendo vigilada por Bruselas.",
          implications: "Posible pérdida de fondos si no se comprometen antes de las fechas límite de 2026.",
          keyClaims: ["Cuellos de botella administrativos", "Críticas de las PYMES", "Oportunidad histórica de digitalización"]
        }
      }
    ]
  },
  {
    id: "4",
    category: "INTERNACIONAL",
    location: "Pekín / Madrid",
    title: "Sánchez en Pekín: España busca liderar la mediación comercial entre la UE y China",
    summary: "El viaje diplomático cierra con acuerdos en energías renovables y automoción eléctrica, posicionando a España como socio preferente en el sur de Europa.",
    time: "hace 8 horas",
    author: "Jorge Valdés",
    image: "https://images.unsplash.com/photo-1547983331-f64a203ba2d3?auto=format&fit=crop&q=80&w=800",
    bias: { left: 30, center: 50, right: 20 },
    sources: 41,
    factuality: "alta",
    consensus: "medio",
    impact: "medio",
    sourceCount: 41,
    detailStats: {
      keyFigures: [
        { label: "Acuerdos", value: "12", trend: "up" },
        { label: "Inversión China", value: "1.2B€", trend: "up" },
        { label: "Puestos trabajo", value: "5k", trend: "up" }
      ],
      factualScore: 90,
      sourceList: ["El Mundo", "The Guardian", "SCMP", "Canal 24h"]
    },
    analyticalSnippet: "Cobertura centrada en el éxito diplomático en medios afines, mientras la oposición cuestiona el equilibrio de la balanza comercial final.",
    articles: [
      {
        id: "a5",
        source: "El Mundo",
        bias: "CENTER",
        title: "Acuerdos estratégicos en Pekín: España se posiciona como el hub de la movilidad eléctrica",
        excerpt: "Las marcas chinas de coches eléctricos ven en España la puerta de entrada para fabricar en suelo europeo.",
        readerContent: {
          context: "La UE busca reducir su dependencia de China mientras intenta negociar acuerdos que eviten una guerra comercial de aranceles.",
          implications: "Nuevas fábricas de baterías y ensamblaje en el corredor del Mediterráneo.",
          keyClaims: ["Liderazgo diplomático español", "Sinergia en renovables", "Equilibrio geopolítico complejo"]
        }
      }
    ]
  },
  {
    id: "5",
    category: "TECNOLOGÍA",
    location: "Sectores Bancarios",
    title: "La IA generativa ya gestiona el 40% de la atención al cliente en el sector bancario español",
    summary: "Un informe sectorial revela que la banca española lidera la adopción de modelos de lenguaje para gestiones complejas, reduciendo tiempos de espera.",
    time: "hace 10 horas",
    author: "Silvia Castro",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    bias: { left: 5, center: 75, right: 20 },
    sources: 15,
    factuality: "alta",
    consensus: "alto",
    impact: "medio",
    sourceCount: 15,
    detailStats: {
      keyFigures: [
        { label: "Adopción IA", value: "40%", trend: "up" },
        { label: "Ahorro costes", value: "15%", trend: "up" },
        { label: "Nivel error", value: "0.2%", trend: "down" }
      ],
      factualScore: 94,
      sourceList: ["Xataka", "WIRED", "El Español", "Computerworld"]
    },
    analyticalSnippet: "Enfoque optimista en medios tecnológicos. Críticas de sindicatos sobre la posible desatención a colectivos vulnerables y brecha digital.",
    articles: [
      {
        id: "a6",
        source: "Xataka",
        bias: "CENTER",
        title: "Del 'chatbot' al asistente experto: cómo la IA ha revolucionado la banca española en dos años",
        excerpt: "Los modelos entrenados específicamente en regulación financiera permiten ahora resolver dudas técnicas sin intervención humana.",
        readerContent: {
          context: "La banca española ha sido históricamente pionera en digitalización en el contexto europeo.",
          implications: "Reducción drástica del empleo administrativo en oficinas centrales y mayor eficiencia operativa.",
          keyClaims: ["Eficiencia algorítmica", "Optimización de experiencia de usuario", "Desafío de la inclusión financiera"]
        }
      }
    ]
  }
];

export const sections = {
  trending: [
    "Ley de Vivienda 2026",
    "Regularización Migrantes",
    "Pedro Sánchez China",
    "FMI Previsiones",
    "AI Bancaria",
    "Eurocopa 2026 Sedes"
  ],
  headlines: [
    "El IBEX 35 roza los 12.000 puntos en una jornada récord.",
    "Baja el desempleo juvenil al 22% por primera vez en una década.",
    "Nuevas ayudas para el coche eléctrico de segunda mano.",
    "El Museo del Prado inaugura su ampliación virtual definitiva."
  ]
};
