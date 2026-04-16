// Real News Data for trustnews.es - April 16, 2026
export const mockStories = [
  {
    id: "1",
    category: "POLÍTICA",
    title: "España abre hoy el portal telemático para la regularización de 500.000 migrantes",
    summary: "El Gobierno activa el Real Decreto que permitirá a medio millón de personas solicitar su estatus legal en un proceso histórico que busca reducir la economía sumergida.",
    time: "hace 2 horas",
    author: "Elena Martínez",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
    bias: { left: 45, center: 40, right: 15 },
    sources: 24,
    detailStats: {
      keyFigures: [
        { label: "Beneficiarios", value: "500k", trend: "up" },
        { label: "Impacto PIB", value: "+1.2%", trend: "up" },
        { label: "Plazo", value: "6 meses", trend: "stable" }
      ],
      factualScore: 92,
      sourceList: ["El País", "RTVE", "El Mundo", "EFE", "La Vanguardia"]
    },
    analyticalSnippet: "Consenso sobre la necesidad técnica de la medida (60%), con debate intenso en la derecha sobre el efecto llamada (30%) y críticas de colectivos por la lentitud de la web (10%)."
  },
  {
    id: "2",
    category: "VIVIENDA",
    title: "El Congreso debatirá el Decreto 8/2026: prórroga forzosa de alquileres y tope del 2%",
    summary: "La nueva ley busca blindar a los inquilinos ante la crisis de oferta, extendiendo los contratos que vencen este año y manteniendo el límite de precios.",
    time: "hace 4 horas",
    author: "Carlos Ruiz",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    bias: { left: 60, center: 20, right: 20 },
    sources: 18,
    detailStats: {
      keyFigures: [
        { label: "Tope Rentas", value: "2%", trend: "stable" },
        { label: "Prórroga", value: "2 años", trend: "none" },
        { label: "Votos aseg.", value: "176", trend: "up" }
      ],
      factualScore: 88,
      sourceList: ["Cinco Días", "El Confidencial", "idealista/news", "ABC"]
    },
    analyticalSnippet: "Fuerte sesgo de opinión según el medio: la prensa económica advierte de la retirada de oferta, mientras medios generalistas enfocan el alivio a las familias."
  },
  {
    id: "3",
    category: "FINANZAS",
    title: "España corre contra reloj: 27.000M€ de Fondos Europeos pendientes de adjudicar",
    summary: "En la recta final de ejecución, el Ministerio de Economía acelera los procesos administrativos para evitar la devolución de capital estratégico a la UE.",
    time: "hace 6 horas",
    author: "Marta Sánchez",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    bias: { left: 10, center: 70, right: 20 },
    sources: 32,
    detailStats: {
      keyFigures: [
        { label: "Pdte Adjudicar", value: "27B€", trend: "down" },
        { label: "Ejecución", value: "78%", trend: "up" },
        { label: "Proyectos AI", value: "4.2B€", trend: "up" }
      ],
      factualScore: 96,
      sourceList: ["Expansión", "Reuters", "Bloomberg", "La Razón"]
    },
    analyticalSnippet: "Información mayoritariamente técnica. El debate político se centra en la capacidad de las CC.OO. para gestionar el flujo final de inversiones."
  },
  {
    id: "4",
    category: "INTERNACIONAL",
    title: "Sánchez en Pekín: España busca liderar la mediación comercial entre la UE y China",
    summary: "El viaje diplomático cierra con acuerdos en energías renovables y automoción eléctrica, posicionando a España como socio preferente en el sur de Europa.",
    time: "hace 8 horas",
    author: "Jorge Valdés",
    image: "https://images.unsplash.com/photo-1547983331-f64a203ba2d3?auto=format&fit=crop&q=80&w=800",
    bias: { left: 30, center: 50, right: 20 },
    sources: 41,
    detailStats: {
      keyFigures: [
        { label: "Acuerdos", value: "12", trend: "up" },
        { label: "Inversión China", value: "1.2B€", trend: "up" },
        { label: "Puestos trabajo", value: "5k", trend: "up" }
      ],
      factualScore: 90,
      sourceList: ["El Mundo", "The Guardian", "SCMP", "Canal 24h"]
    },
    analyticalSnippet: "Cobertura centrada en el éxito diplomático en medios afines, mientras la oposición cuestiona el equilibrio de la balanza comercial final."
  },
  {
    id: "5",
    category: "TECNOLOGÍA",
    title: "La IA generativa ya gestiona el 40% de la atención al cliente en el sector bancario español",
    summary: "Un informe sectorial revela que la banca española lidera la adopción de modelos de lenguaje para gestiones complejas, reduciendo tiempos de espera.",
    time: "hace 10 horas",
    author: "Silvia Castro",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    bias: { left: 5, center: 75, right: 20 },
    sources: 15,
    detailStats: {
      keyFigures: [
        { label: "Adopción IA", value: "40%", trend: "up" },
        { label: "Ahorro costes", value: "15%", trend: "up" },
        { label: "Nivel error", value: "0.2%", trend: "down" }
      ],
      factualScore: 94,
      sourceList: ["Xataka", "WIRED", "El Español", "Computerworld"]
    },
    analyticalSnippet: "Enfoque optimista en medios tecnológicos. Críticas de sindicatos sobre la posible desatención a colectivos vulnerables y brecha digital."
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
