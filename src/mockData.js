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
    summary: "Se ha aprobado un marco regulatorio para las zonas tensionadas en las principales ciudades españolas, buscando frenar la escalada de precios.",
    fullContent: `El Consejo de Ministros ha dado luz verde final a la Ley por el Derecho a la Vivienda, una de las normativas más complejas y debatidas de la actual legislatura. Tras meses de negociaciones internas en la coalición de Gobierno y un intenso trámite parlamentario, la ley introduce instrumentos jurídicos sin precedentes en España para tratar de contener los precios del mercado inmobiliario.

El núcleo de la ley es la capacidad otorgada a las comunidades autónomas para declarar "zonas tensionadas". En estas áreas, donde el coste de la vivienda supere el 30% del presupuesto medio de los hogares, se aplicarán sistemas de control de precios. Para los nuevos contratos en estas zonas, la renta no podrá exceder el precio del contrato anterior, más un pequeño incremento permitido por ley.

La normativa establece una distinción fundamental entre "pequeños tenedores" y "grandes tenedores". Estos últimos, definidos como aquellos propietarios con más de cinco o diez viviendas (según decida cada comunidad), tendrán restricciones adicionales basadas en un índice de precios de referencia. El objetivo declarado por el Ministerio de Agenda Urbana es "terminar con la burbuja del alquiler que expulsa a los jóvenes de las ciudades".

En cuanto a los incentivos, la ley contempla una serie de bonificaciones fiscales en el IRPF para aquellos propietarios que rebajen el precio del alquiler en zonas tensionadas, busquen alquilar a jóvenes de entre 18 y 35 años o pongan su vivienda en alquiler social. Se estima que estas rebajas fiscales podrían llegar hasta el 90% en casos específicos.

Uno de los puntos más polémicos ha sido la regulación de los desahucios. La ley prohíbe los lanzamientos sin una fecha y hora exactas y introduce trámites de mediación obligatorios para propietarios que sean considerados grandes tenedores. Los sectores inmobiliarios y la oposición han criticado este punto, alegando que generará "indefensión jurídica" y podría terminar reduciendo la oferta total de inmuebles disponibles.

Finalmente, la ley busca movilizar la vivienda vacía. Se permitirá a los ayuntamientos aplicar un recargo de hasta el 150% en la cuota líquida del IBI para aquellas viviendas que permanezcan desocupadas de forma injustificada por un periodo superior a dos años. Con esta medida, el Ejecutivo espera incentivar la salida al mercado de miles de inmuebles que actualmente se encuentran fuera del circuito de alquiler.`,
    perspectives: {
      left: {
        title: "Histórico avance social: La nueva ley garantiza el hogar frente a la especulación.",
        sources: "elDiario.es, Público"
      },
      right: {
        title: "Inseguridad jurídica: Expertos alertan del parón en la oferta por el control de precios.",
        sources: "ABC, El Mundo"
      }
    }
  },
  {
    id: 2,
    title: "La economía española crecerá un 2,4% en 2024 según las previsiones del FMI",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    time: "hace 5 horas",
    location: "España",
    sourceCount: 18,
    bias: { left: 20, center: 60, right: 20 },
    factuality: "High",
    summary: "El Fondo Monetario Internacional eleva sus expectativas para España, destacando la resiliencia del sector servicios y el turismo.",
    fullContent: `El Fondo Monetario Internacional (FMI) ha vuelto a situar a España como el principal motor de crecimiento entre las economías avanzadas de la Eurozona. En su último informe 'Perspectivas Económicas Mundiales', la institución con sede en Washington ha elevado su previsión de crecimiento del PIB español hasta el 2,4% para el cierre del presente año 2024.

Este incremento de las proyecciones se fundamenta en una "resiliencia excepcional" de la demanda interna y, sobre todo, en el comportamiento del sector exterior. España ha logrado mantener una cuota de mercado competitiva a pesar de la ralentización de sus principales socios comerciales, como Alemania o Francia. La diversificación de las exportaciones y la normalización total de la cadena de suministros han sido claves en este proceso.

El mercado laboral español continúa mostrando señales de fortaleza inéditas. La tasa de empleo se encuentra en niveles récord, impulsada por las reformas estructurales y la llegada de fondos europeos Next Generation, que han comenzado a filtrarse hacia la economía real. Según el FMI, esta estabilidad en el empleo es lo que está permitiendo que el consumo de las familias resista la presión de los tipos de interés elevados.

El sector turístico merece una mención especial en el informe del FMI. La recuperación post-pandemia no solo se ha completado, sino que se ha superado en términos de valor añadido. España ya no solo recibe más turistas, sino que el gasto por visitante ha crecido significativamente, transformando el sector hacia un modelo de mayor sostenibilidad y rentabilidad económica.

Sin embargo, el FMI introduce notas de cautela necesarias. El organismo advertirtie que la deuda pública sigue siendo elevada y que el margen de maniobra fiscal es limitado. "Es imperativo aprovechar este viento de cola económico para emprender una consolidación fiscal seria que garantice la estabilidad futura", reza el documento. El déficit estructural sigue siendo el principal reto para las cuentas públicas españolas en el medio plazo.

Por último, el informe señala riesgos geopolíticos externos que podrían descarrilar estas proyecciones, especialmente la volatilidad en los precios de la energía y las tensiones en las rutas comerciales globales. El FMI recomienda a España seguir invirtiendo en la transición energética y digital para blindar su economía contra futuros shocks externos y mejorar la productividad total de los factores.`,
    perspectives: {
      left: {
        title: "Éxito de las políticas laborales: El FMI avala el crecimiento robusto de España.",
        sources: "El País, RTVE"
      },
      right: {
        title: "El motor es el gasto público: El FMI advierte sobre el déficit pese al crecimiento.",
        sources: "La Razón, El Mundo"
      }
    }
  },
  {
    id: 3,
    title: "Debate en el Congreso sobre la reforma de la ley mordaza: posturas enfrentadas",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
    time: "hace 8 horas",
    location: "España",
    sourceCount: 35,
    bias: { left: 40, center: 10, right: 50 },
    factuality: "Mixed",
    summary: "Los partidos de la coalición y la oposición mantienen visiones opuestas sobre el equilibrio entre seguridad ciudadana y libertad de expresión.",
    fullContent: `El arco parlamentario español vive una de sus jornadas más intensas con la reanudación del debate sobre la reforma de la Ley de Seguridad Ciudadana, aprobada originalmente en 2015. La ley, apodada por sus detractores como "ley mordaza", ha sido objeto de críticas recurrentes por parte de organismos internacionales que consideran que limita derechos fundamentales de expresión y reunión.

La reforma busca suavizar o eliminar los artículos que han generado mayor controversia judicial. Uno de ellos es el que permite sancionar la toma de imágenes de los agentes de las fuerzas de seguridad durante sus actuaciones. La nueva redacción propone que la toma de imágenes deje de ser infracción, salvo que genere un peligro real y constatable para la seguridad de los agentes o sus familias, algo que deberá quedar motivado en la denuncia.

Otro eje de la reforma afecta directamente a las sanciones por "faltas de respeto" a los agentes. Se propone que los insultos o expresiones que no supongan una amenaza real de violencia dejen de ser procesados por vía administrativa con multas elevadas, buscando proteger el derecho a la crítica, incluso si es ácida, contra las instituciones. Asimismo, se pretende rebajar las multas por desobediencia y resistencia a la autoridad.

En el ámbito de las manifestaciones, el nuevo texto legislativo pretende permitir las protestas espontáneas que no hayan sido comunicadas previamente, siempre que sean pacíficas y no alteren gravemente el orden público o la seguridad. Actualmente, la falta de comunicación previa es motivo de sanción automática tanto para los promotores como para los participantes identificados.

La reacción de los sindicatos policiales y asociaciones de la Guardia Civil no se ha hecho esperar. Miles de agentes se han manifestado en diversas ciudades bajo el lema "No a la inseguridad ciudadana", alegando que estas reformas eliminan el principio de autoridad y les dejan en una situación de indefensión legal frente a los violentos. "Nos quitan la presunción de veracidad y nos atan de manos", denuncian desde las plataformas policiales.

Por su parte, el bloque de investidura defiende que la seguridad no puede ser una excusa para recortar derechos civiles. "Estamos ajustando nuestra legislación a los estándares de la Unión Europea y del Tribunal de Derechos Humanos", argumentan los proponentes de la reforma. El debate se prevé largo y complejo, con enmiendas cruzadas que pondrán a prueba la cohesión de la mayoría parlamentaria en los próximos meses.`,
    perspectives: {
      left: {
        title: "Recuperando libertades: La reforma busca acabar con las multas arbitrarias a civiles.",
        sources: "Público, El Salto"
      },
      right: {
        title: "Desprotección policial: La oposición denuncia que la reforma deja vendidos a los agentes.",
        sources: "OKDiario, ABC"
      }
    }
  },
  {
    id: 4,
    title: "Crisis en la Sanidad Pública: Médicos inician huelga indefinida por falta de recursos",
    image: "https://images.unsplash.com/photo-1576091160550-217359f41f18?auto=format&fit=crop&q=80&w=800",
    time: "hace 10 horas",
    location: "España",
    sourceCount: 28,
    bias: { left: 55, center: 25, right: 20 },
    factuality: "High",
    summary: "Los facultativos denuncian una sobrecarga asistencial 'insostenible' y exigen un aumento inmediato del presupuesto para atención primaria.",
    fullContent: `Decenas de miles de médicos y personal sanitario en varias comunidades autónomas han iniciado hoy una jornada de huelga indefinida para denunciar el "deterioro alarmante" de la sanidad pública. Las principales plataformas sindicales exigen una inversión de emergencia para reducir las listas de espera, que en algunas regiones ya superan los seis meses para especialistas críticos. 
    
    El conflicto se centra en la Atención Primaria, donde los profesionales denuncian agendas de más de 50 pacientes al día, lo que impide una atención de calidad. Por su parte, las administraciones regionales alegan que existe una falta de médicos especialistas a nivel nacional y que las plazas ofertadas no se cubren, solicitando al Gobierno central un aumento de las plazas MIR.`,
    perspectives: {
      left: {
        title: "Defensa de lo público: La marea blanca sale a las calles contra los recortes.",
        sources: "elDiario.es, La Marea"
      },
      right: {
        title: "Huelga política: Los gobiernos regionales acusan a los sindicatos de electoralismo.",
        sources: "ABC, El Independiente"
      }
    }
  },
  {
    id: 5,
    title: "Inversión millonaria: Gigante energético elige España para su hub de hidrógeno verde",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
    time: "hace 12 horas",
    location: "Puertollano, Ciudad Real",
    sourceCount: 22,
    bias: { left: 15, center: 70, right: 15 },
    factuality: "Very High",
    summary: "El proyecto creará más de 3.000 empleos directos y posicionará a España como el principal exportador de energía limpia de la UE.",
    fullContent: `El sector energético ha recibido hoy una de las noticias más esperadas del año: la confirmación de la construcción del mayor complejo de producción de hidrógeno verde de Europa en España. Con una inversión estimada de 5.000 millones de euros, el proyecto busca aprovechar la capacidad de generación renovable del país para producir combustible cero emisiones.
    
    Este hub se convertirá en la pieza clave del 'Corredor Mediterráneo del Hidrógeno', permitiendo la exportación masiva hacia centros industriales en Francia y Alemania. El Gobierno ha destacado que esta inversión es una prueba del éxito de la excepción ibérica y de la apuesta por la descarbonización de la industria pesada nacional.`,
    perspectives: {
      left: {
        title: "Liderazgo verde: España se convierte en el pulmón energético de Europa.",
        sources: "Cinco Días, El País"
      },
      right: {
        title: "Dudas sobre la rentabilidad: Expertos piden cautela ante la burbuja del hidrógeno.",
        sources: "Expansión, El Economista"
      }
    }
  }
];

