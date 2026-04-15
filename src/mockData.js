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
    summary: "Se ha aprobado un marco regulatorio para las zonas tensionadas en las principales ciudades españolas, buscando frenar la escalada de precios mediante un índice de referencia y topes del 3% anual.",
    fullContent: `El Consejo de Ministros ha ratificado hoy el texto definitivo de la Ley por el Derecho a la Vivienda, una normativa que marca un antes y un después en la intervención estatal del mercado inmobiliario español. Tras tres años de negociaciones de alta intensidad entre los socios de coalición, la ley llega al BOE con el objetivo de enfriar los precios en las capitales y proteger a los inquilinos frente a subidas abusivas vinculadas a la inflación.\n\nEl punto neurálgico de la ley es la creación de los 'Índices de Referencia de Precios', una herramienta que obligará a los grandes tenedores a ajustar sus rentas a los baremos oficiales en aquellas áreas declaradas como 'zonas tensionadas'. Para los pequeños propietarios, la ley opta por la vía del incentivo: se introducen bonificaciones en el IRPF que pueden llegar al 90% si se rebaja el precio del alquiler actual un 5%. Además, la normativa traslada íntegramente los gastos de gestión inmobiliaria al arrendador, eliminando una de las barreras de entrada más criticadas por los colectivos juveniles.`,
    perspectivasInfo: `Desde los sectores progresistas, la ley se describe como el "sexto pilar del Estado del Bienestar". Medios como elDiario.es y El País subrayan la justicia social de proteger el hogar frente a fondos buitre. Destacan que España deja de ser una anomalía europea al empezar a regular un mercado que en países como Austria o Alemania ya cuenta con protecciones similares.\n\nEn el espectro conservador, la narrativa es de alarma. ABC y El Mundo proyectan una "sequía de oferta" inminente. Argumentan que la inseguridad jurídica empujará a los propietarios hacia el alquiler vacacional, lo que elevará aún más los precios en el mercado negro o bajo cuerda. Consideran que la medida es un ataque directo a la propiedad privada garantizada constitucionalmente.`,
    cronologiaInfo: `2021 (Octubre): Primer acuerdo presupuestario que incluye el compromiso de redactar la ley.\n\n2022 (Febrero): Aprobación del anteproyecto en primera lectura, iniciando el trámite de enmiendas.\n\n2023 (Mayo): Tras superar el veto del Senado, el Congreso ratifica el texto final antes del periodo electoral.\n\n2024 (Enero): Entrada en vigor de la prohibición de gastos de agencia para el inquilino.\n\n2024 (Marzo): Aplicación efectiva del índice de precios en Cataluña como zona pionera en el despliegue.`,
    desglose: [
      "Congelación de precios en zonas declaradas de mercado tensionado por las CCAA.",
      "Bonificaciones fiscales de hasta el 90% para propietarios que bajen la renta.",
      "Consideración de 'Gran Tenedor' a partir de 5 inmuebles en zonas concretas.",
      "Eliminación por ley del cobro de honorarios de agencia al arrendatario."
    ],
    contexto: `España presenta actualmente la menor tasa de vivienda social por habitante de las economías avanzadas (2.4% vs 9% media UE). El fenómeno de la gentrificación, impulsado por el auge del teletrabajo y el turismo masivo, ha desplazado a las familias de los centros urbanos hacia periferias donde el transporte es deficiente. Esta ley intenta corregir un desequilibrio de décadas donde la vivienda fue tratada exclusivamente como activo de inversión y no como bien de uso fundamental.`,
    impactoSocial: [
      "Alivio presupuestario directo para 2.4 millones de hogares en régimen de alquiler.",
      "Reducción del fenómeno de la 'emancipación tardía' de la población menor de 35 años.",
      "Protección jurídica reforzada contra desahucios sin alternativa habitacional oficial."
    ],
    impactoSistemico: [
      "Posible judicialización masiva por invasión de competencias autonómicas.",
      "Riesgo de desvío de capital inversor inmobiliario hacia Portugal o Grecia.",
      "Aparición de un mercado paralelo de alquiler de temporada para esquivar la ley."
    ],
    consensoNarrativo: "Unanimidad total sobre la gravedad del problema de acceso, pero división irreconciliable sobre si el control de precios es la medicina o el veneno para el mercado.",
    factCheck: "Los porcentajes de ahorro y los límites de precios reportados coinciden al 98% con el texto final del Real Decreto-Ley de Vivienda. Los datos sobre 'fuga de capitales' son proyecciones de consultoras privadas.",
    blindSpot: "Escasa cobertura sobre el impacto de la ley en el mercado de herencias inmobiliarias y la rehabilitación de cascos históricos.",
    tags: ["Indiferencia Fiscal", "Zonas Tensionadas", "Mercado Negro", "Gentrificación", "Parque Social", "IPC"],
    similarTopics: ["Vivienda", "IBEX 35", "Fiscalidad", "Regulación UE"],
    perspectives: {
      left: { title: "Justicia social y blindaje del derecho al hogar", sources: "El País, elDiario.es, RTVE" },
      right: { title: "Inseguridad jurídica y riesgo de parálisis", sources: "ABC, El Mundo, La Razón" }
    },
    articles: [
      {
        source: "EL PAÍS", bias: "CENTER", fact: "ALTA", time: "Hace 2h", origin: "Nacional", 
        type: "Análisis", tone: "Neutro", angle: "Regulatorio", author: "M. JIMÉNEZ",
        summary: "Análisis del equilibrio entre la protección del inquilino y los incentivos fiscales al dueño.",
        whyOpened: "Contexto técnico y análisis detallado de las tablas fiscales del IRPF.",
        diff: "Aporta claridad sobre las deducciones fiscales.",
        readerContent: {
          whatHappened: "La nueva Ley de Vivienda no es solo una medida de control de precios, sino un cambio profundo en la estructura fiscal del ahorro en España. El Gobierno ha introducido un sistema de 'zanahoria y palo' que busca, por un lado, limitar el crecimiento de las rentas en las ciudades más calientes y, por otro, premiar generosamente a aquel pequeño ahorrador que decida no exprimir el mercado. Según datos del Ministerio de Hacienda, un propietario que rebaje su alquiler un 5% en una zona tensionada pasará de tributar por el 60% de sus ingresos a hacerlo solo por el 10% gracias a la nueva deducción del 90%. Este movimiento estratégico intenta evitar el conflicto frontal con el propietario particular, que posee el 85% del parque de alquiler en España. Sin embargo, no todo es positivo. El texto adolece de una ambigüedad técnica en cuanto a la definición de los servicios de mantenimiento que pueden ser repercutidos, lo que podría generar lagunas legales en los próximos meses.\n\nLa prensa internacional ya mira con lupa este experimento regulatorio, ya que España se convierte en el banco de pruebas de las políticas de vivienda más ambiciosas de la Unión Europea después del 'Mietendeckel' berlinés, que terminó siendo anulado por tribunales superiores. La clave del éxito de EL PAÍS en este análisis ha sido entrevistar a técnicos de la Agencia Tributaria que confirman que el sistema de incentivos es 'potencialmente más eficaz' que la propia limitación de precios, ya que genera una competencia a la baja voluntaria por parte de los arrendadores que buscan optimizar su factura fiscal anual. Además, se analiza el impacto en el mercado de la obra nueva, donde el 20% de reserva de vivienda protegida en nuevas promociones está generando un intenso debate entre promotores y administraciones locales. El reportaje concluye que la ley requerirá de un desarrollo reglamentario minucioso para no morir por asfixia administrativa en las comunidades autónomas donde la sintonía política con el Gobierno central es inexistente, algo que marcará la radiografía del alquiler en la próxima década.",
          interstitialNotes: [{ pos: 1, text: "Nota Informativa: El 90% de deducción es el máximo histórico aplicado a la vivienda." }],
          context: "España tiene una de las tasas de propiedad más altas del mundo, pero el alquiler ha crecido un 40% en volumen desde 2013.",
          implications: { tenant: "Bajada de barrera de entrada al eliminarse la comisión de agencia (ahorro medio de 800€).", owner: "Necesidad de recalcular la rentabilidad neta tras impuestos para valorar la bajada de precio." },
          preQuoteAnalysis: "La arquitectura del Real Decreto-Ley no solo descansa en la limitación de precios, sino en una redefinición técnica del concepto de 'rentabilidad justa' que imperaba en el sector. Esta sección profundiza en cómo la norma intenta equilibrar la balanza entre el gran inversor y el pequeño ahorrador.",
          claims: [{ text: "\"La ley busca que el negocio inmobiliario sea estable, no especulativo.\"", source: "Gabinete de Presidencia" }],
          postQuoteAnalysis: "Tras esta declaración de intenciones, la realidad operativa del BOE impone obligaciones de información que muchos propietarios consideran excesivas. El impacto inmediato ha sido una revisión a la baja de las valoraciones de activos en las carteras de los principales SOCIMIs.",
          blindSpot: "EL PAÍS omite mencionar los retrasos burocráticos previstos en la declaración de las zonas tensionadas por parte de las CCAA del PP."
        }
      },
      {
        source: "ABC", bias: "RIGHT", fact: "ALTA", time: "Hace 4h", origin: "Nacional", 
        type: "Noticia", tone: "Crítico", angle: "Jurídico", author: "L. FERNÁNDEZ",
        summary: "Duras críticas por el ataque a la propiedad privada y el riesgo de escasez de oferta.",
        whyOpened: "Enfoque en la inseguridad jurídica y el potencial colapso del mercado.",
        diff: "Enfatiza el riesgo de desabastecimiento.",
        readerContent: {
          whatHappened: "El intervencionismo ha llegado al mercado del alquiler. Con la aprobación de la Ley de Vivienda, España entra en una senda de inseguridad jurídica que, según los expertos consultados por ABC, provocará un efecto huida de los inversores hacia mercados más estables como el de Portugal o Grecia. El ataque al derecho de propiedad privada, consagrado en el artículo 33 de nuestra Constitución, es frontal. Al limitar los precios por debajo de la inflación en un entorno de costes de vida crecientes, el Estado está obligando al propietario a asumir un coste social que debería ser responsabilidad única de las administraciones públicas mediante la construcción de vivienda social, capítulo en el que España se encuentra a la cola de Europa. La experiencia en otras ciudades del mundo, como Nueva York o Estocolmo, demuestra que fijar precios máximos solo genera listas de espera eternas y la aparición de un mercado negro sumergido donde se pagan 'extras' en efectivo por servicios inexistentes.\n\nAdemás, la ley desprotege al legítimo dueño frente a la ocupación ilegal, dificultando los procesos de desahucios y alargando la agonía de familias que dependen de esa renta para cubrir su propia hipoteca. La patronal del sector ya ha anunciado que recurrirá la ley ante el Tribunal Constitucional, mientras que miles de pequeños ahorradores están optando ya por vender sus inmuebles o pasarlos al mercado de alquiler de temporada, donde la ley no tiene competencias. ABC ha tenido acceso a estudios de mercado que alertan de una caída del 25% en la oferta de vivienda residencial en los primeros tres meses de vigencia de normativas similares en Cataluña. El resultado final será, irónicamente, una menor oferta y una mayor dificultad para los jóvenes de encontrar un techo digno en el centro de las ciudades terrestres. Es una norma que, en palabras de la patronal, dinamita el derecho al ahorro de millones de españoles que han invertido su esfuerzo en una segunda vivienda como complemento a su pensión futura.",
          interstitialNotes: [{ pos: 2, text: "Aviso Legal: Varias comunidades autónomas han anunciado recursos de inconstitucionalidad." }],
          context: "En Estocolmo, el control de precios ha generado listas de espera de hasta 10 años para un piso céntrico.",
          implications: { tenant: "Imposibilidad de encontrar pisos disponibles ante la retirada masiva de oferta.", owner: "Pérdida de control sobre el activo y riesgo de obsolescencia por falta de inversión en reformas." },
          preQuoteAnalysis: "La fundamentación jurídica de estas críticas se basa en una supuesta vulneración del artículo 33 de la Constitución Española, que garantiza el derecho a la propiedad privada. ABC analiza las fisuras legales de un texto que consideran 'improvisado' e 'intervencionista', señalando que el control de precios nunca ha funcionado en economías abiertas sin generar escasez crónica.",
          claims: [{ text: "\"Es una ley confiscatoria que destruye la seguridad jurídica de los propietarios.\"", source: "Asociación de Propietarios Urbanos" }],
          postQuoteAnalysis: "Más allá del ruido mediático, el análisis post-declaración sugiere un desplazamiento masivo de la oferta hacia el alquiler de temporada, un mercado que escapa a las restricciones de la nueva normativa. TNE Intelligence observa que este 'agujero legal' podría anular cualquier beneficio social pretendido por el legislador en menos de un ciclo fiscal.",
          blindSpot: "ABC ignora deliberadamente las deducciones fiscales que compensan la pérdida de renta bruta."
        }
      },
      {
        source: "EL DIARIO", bias: "LEFT", fact: "ALTA", time: "Hace 5h", origin: "Nacional", 
        type: "Reportaje", tone: "Activista", angle: "Social", author: "R. SOLER",
        summary: "Historias de inquilinos que ven en esta ley su última esperanza de no ser expulsados de sus barrios.",
        whyOpened: "Perspectiva humana y defensa del derecho constitucional a la vivienda.",
        diff: "Foco en los fondos buitre y la especulación.",
        readerContent: {
          whatHappened: "Por fin una ley que mira a los ojos a quienes sufren el acoso de la especulación. EL DIARIO ha recogido el testimonio de decenas de familias en barrios como Lavapiés o El Born que vivían con el miedo constante a la próxima renovación de contrato. Con la nueva ley, el concepto de 'zona tensionada' se convierte en un cordón sanitario contra los fondos buitre que compran bloques enteros para vaciarlos y convertirlos en apartamentos de lujo. La limitación del 3% en las subidas anuales es un respiro de aire puro frente a una inflación que amenazaba con devorar los salarios de la clase trabajadora. La eliminación de los gastos de inmobiliaria es otra victoria moral. Durante años, el inquilino español ha tenido que pagar un 'impuesto revolucionario' de un mes de renta a agencias que no le prestan ningún servicio, solo por el hecho de abrir una puerta.\n\nQue ese coste pase ahora al dueño, que es quien contrata el servicio, es de pura lógica comercial. No obstante, los movimientos por la vivienda como el Sindicato de Inquilinos advierten que no bajarán la guardia: la ley depende de la voluntad política de las comunidades autónomas para aplicarla. Sin una presión social constante, los gobiernos regionales del PP ignorarán los índices y permitirán que la burbuja siga creciendo. El reportaje profundiza en casos de abusos donde se obligaba a los inquilinos a contratar seguros de impago abusivos o a pagar 'en negro' parte de la renta. Con el nuevo marco legal, el inquilino gana herramientas de denuncia y una protección frente a la arbitrariedad que hasta ahora era inaudita en nuestra democracia. La batalla por la vivienda digna no termina hoy en el BOE, empieza ahora en los barrios, donde la organización ciudadana será la única garantía de que estos derechos no se queden en papel mojado frente a la resistencia feroz del lobby inmobiliario y financiero que ya prepara su contraataque en los juzgados.",
          interstitialNotes: [{ pos: 1, text: "Dato Social: Mas de 700.000 hogares destinan el 60% de su sueldo al alquiler." }],
          context: "Los fondos de inversión internacionales poseen más de 120.000 viviendas terminadas en suelo español.",
          implications: { tenant: "Fin de las subidas arbitrarias del 20% al renovar contrato.", owner: "Los grandes propietarios (fondos) ven limitado su margen de beneficio especulativo." },
          preQuoteAnalysis: "Desde colectivos sociales se ha monitorizado cada borrador de la ley, presionando para que el texto final no fuera una 'caricatura' regulatoria. El Diario destaca la importancia de blindar el hogar frente a dinámicas de mercado puramente financieras que han expulsado a miles de familias de sus centros históricos en la última década.",
          claims: [{ text: "\"Por primera vez el hogar está por encima de los dividendos de los fondos buitre.\"", source: "Portavoz Sindicato de Inquilinas" }],
          postQuoteAnalysis: "Este optimismo inicial se matiza con la preocupación por el despliegue administrativo en las comunidades autónomas hostiles. TNE Intelligence subraya que la fragmentación regulatoria en España convertirá la aplicación de la ley en un mapa de 'derechos a dos velocidades' según el territorio de residencia.",
          blindSpot: "EL DIARIO no analiza el riesgo de que los pequeños propietarios saquen su piso del mercado por el miedo generado por la prensa conservadora."
        }
      },
      {
        source: "EL MUNDO", bias: "RIGHT", fact: "ALTA", time: "Hace 6h", origin: "Nacional", 
        type: "Análisis", tone: "Escéptico", angle: "Financiero", author: "J. SANZ",
        summary: "Advierte del impacto negativo en la construcción de nueva vivienda por la parálisis del sector.",
        whyOpened: "Visión del inversor y análisis de rentabilidad del sector construcción.",
        diff: "Foco en la paralización de proyectos.",
        readerContent: {
          whatHappened: "El sector constructor español entra en zona de sombra. La Ley de Vivienda es un jarro de agua fría para los inversores internacionales que venían apostando por el 'Build to Rent' (construir para alquilar). Al congelar las rentas y endurecer la protección al okupa, el Gobierno ha dinamitado el plan de negocio de decenas de promotoras que tenían previsto levantar 50.000 nuevas viviendas en los próximos cinco años. Según consultoras inmobiliarias de primer nivel, la rentabilidad neta del alquiler en España caerá del 4,5% al 3% tras los ajustes impositivos y la limitación de precios, lo que hará que el capital fluya hacia otros activos como la deuda pública o la bolsa. El problema estructural de España no es el precio, sino la falta de stock. No hay viviendas suficientes para la demanda actual, y esta ley, lejos de crear nuevas, lo que hace es restringir el uso de las existentes.\n\nEl mundo económico coincide en que sin una ley de seguridad ciudadana que permita desahucios express en 48 horas, ningún inversor se arriesgará a poner su piso en alquiler a precios regulados. El Gobierno está intentando apagar un incendio con gasolina electoralista, buscando votos en el corto plazo a costa de destruir el tejido inmobiliario para la próxima década. La consecuencia será una mayor dificultad para los jóvenes, ya que los pocos pisos que queden en el mercado oficial tendrán requisitos de solvencia tan altos (seguros de impago, avales bancarios) que solo los más ricos podrán acceder a ellos. EL MUNDO ha contactado con fondos de inversión nórdicos que han decidido paralizar sus proyectos en la costa mediterránea hasta que el Tribunal Constitucional se pronuncie, lo que supone una pérdida de inversión directa estimada en 2.000 millones de euros solo en este semestre. Es una ley que castiga al ahorro y premia la precariedad habitacional futura al impedir que el mercado se ajuste de forma natural mediante la oferta.",
          interstitialNotes: [{ pos: 3, text: "Nota Sectorial: Las acciones de las grandes socimis han caído un 5% tras el anuncio." }],
          context: "España necesita 1.2M de nuevas viviendas para equilibrar el mercado de alquiler joven.",
          implications: { tenant: "Requisitos de entrada mucho más duros y elitistas.", owner: "Menor valor de mercado del inmueble al caer su rentabilidad futura." },
          preQuoteAnalysis: "El mundo económico coincide en que sin una ley de seguridad ciudadana que permita desahucios express en 48 horas, ningún inversor se arriesgará a poner su piso en alquiler a precios regulados. El análisis técnico muestra un escenario de 'asfixia fiscal' para el pequeño ahorrador que hoy se siente perseguido por la administración.",
          claims: [{ text: "\"Se castiga al ahorrador que compró una segunda vivienda con el esfuerzo de toda una vida.\"", source: "Plataforma de Afectados por la Regulación" }],
          postQuoteAnalysis: "La consecuencia lógica de estas medidas, según los expertos financieros consultados, será un retraimiento de la inversión privada en vivienda de obra nueva. TNE detecta que grandes promotoras ya están desviando sus flujos de capital hacia proyectos de centros de datos u otras infraestructuras menos sensibles.",
          blindSpot: "Omiten el hecho de que muchas promotoras ya están recibiendo ayudas públicas directas para el Build to Rent."
        }
      },
      {
        source: "RTVE", bias: "CENTER", fact: "ALTA", time: "Hace 8h", origin: "Nacional", 
        type: "Noticia", tone: "Neutro", angle: "Institucional", author: "Redacción",
        summary: "Guía completa de cómo afecta la ley a cada perfil de ciudadano partiendo de los datos oficiales.",
        whyOpened: "Información objetiva sin sesgo editorial para saber 'qué cambia mañana'.",
        diff: "Es la fuente mas equilibrada y fáctica.",
        readerContent: {
          whatHappened: "España estrena un nuevo marco legal para la vivienda tras su publicación en el Boletín Oficial del Estado. La ley divide el territorio nacional en dos realidades: aquellas zonas que las autoridades autonómicas declaren como tensionadas y el resto del país. En las primeras, los precios quedan congelados o limitados según el perfil del propietario (pequeño o gran tenedor). En las segundas, la libertad de mercado se mantiene pero bajo la nueva premisa de que los gastos de gestión siempre recaen en el casero. La administración central ha habilitado una oficina de consultas para resolver las dudas de miles de ciudadanos que mañana se enfrentan a nuevos procesos de firma o renovación.\n\nDesde el punto de vista procedimental, la ley introduce cambios en la Ley de Enjuiciamiento Civil para que los servicios sociales intervengan de oficio en cualquier lanzamiento vinculado al alquiler, garantizando un colchón de protección que hasta ahora dependía de la discrecionalidad del juez. Los plazos para los desahucios se dilatan, dando margen a la administración para buscar soluciones habitacionales alternativas. En cuanto a lo fiscal, Hacienda confirma que los beneficios del 90% en el IRPF entrarán en vigor en la próxima campaña de la renta, siempre que el contrato se ajuste a los requisitos de precios de los nuevos índices. RTVE ofrece en su web un simulador oficial para que inquilinos y dueños conozcan exactamente su situación legal a partir de hoy.",
          interstitialNotes: [{ pos: 1, text: "Consejo TNE: Consulta el BOE para ver si tu barrio está en zona tensionada." }],
          context: "El mercado del alquiler en España mueve más de 20.000 millones de euros anuales.",
          implications: { tenant: "Mayor tiempo de reacción ante una posible expulsión o impago.", owner: "Obligación de presentar informes de solvencia y estado del inmueble más rigurosos." },
          preQuoteAnalysis: "Desde el punto de vista procedimental, la ley introduce cambios en la Ley de Enjuiciamiento Civil para que los servicios sociales intervengan de oficio en cualquier lanzamiento vinculado al alquiler. RTVE analiza la arquitectura de este nuevo sistema de protección que pretende evitar el desamparo inmediato.",
          claims: [{ text: "\"El objetivo es armonizar el mercado con los derechos de la ciudadanía.\"", source: "Nota de Prensa Moncloa" }],
          postQuoteAnalysis: "Esta declaración institucional se enfrenta a la realidad de una administración autonómica saturada. TNE Intelligence destaca que, sin un aumento proporcional del personal en los juzgados y servicios sociales, los plazos de protección podrían convertirse en un círculo vicioso de burocracia sin soluciones reales.",
          blindSpot: "Evitan entrar en la polémica política sobre el uso electoralista del anuncio justo antes de los comicios locales."
        }
      }
    ]
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
    summary: "El FMI sitúa a España a la cabeza del crecimiento en la Eurozona, destacando la robustez del consumo interno y la pujanza del sector exterior.",
    fullContent: `El Fondo Monetario Internacional ha actualizado sus perspectivas económicas globales, otorgando a España una de las revisiones al alza más significativas de los últimos años. Con un crecimiento proyectado del 2,4% para el cierre de 2024, la economía española se desacopla de la atonía de sus principales socios comerciales, como Alemania (que roza la recesión) o Francia (con un crecimiento débil).\n\nSegún los técnicos de Washington, el éxito español se fundamenta en tres pilares: una reforma laboral que ha permitido mantener el empleo pese al endurecimiento de la política monetaria del BCE, un sector servicios que ha pulverizado récords históricos de facturación y una menor dependencia energética del gas ruso en comparación con el corazón de Europa. Sin embargo, el FMI también deja recados importantes: la inflación subyacente sigue siendo pegajosa y los niveles de deuda pública exigen un plan de consolidación fiscal urgente para evitar vulnerabilidades futuras ante el aumento del coste de la deuda.`,
    perspectivasInfo: `El análisis económico se ha dividido en dos campos opuestos. Los medios de perfil institucional y progresista destacan la "resiliencia" del modelo español, atribuyendo el mérito a la gestión gubernamental y a la paz social lograda mediante los pactos salariales. Para ellos, el 2,4% es la prueba de que el aumento del Salario Mínimo y la reforma laboral no han destruido empleo, sino que han fortalecido el consumo familiar.\n\nPor contra, la prensa económica de corte liberal (Expansión, El Economista) se muestra mucho más cauta. Argumentan que el crecimiento está "dopado" por un gasto público récord financiado con deuda y por una presión fiscal asfixiante sobre las empresas. Señalan que la renta per cápita sigue sin recuperar los niveles pre-pandemia si se ajusta por la inflación real (términos paritarios de compra), y que el diferencial de crecimiento con Europa se debe simplemente a que partíamos de un agujero mucho más profundo tras la crisis del COVID-10.`,
    cronologiaInfo: `2023 (Junio): Primeras señales de enfriamiento económico en la Eurozona, pero España mantiene el pulso industrial.\n\n2023 (Diciembre): El INE confirma un PIB mejor de lo esperado en el cuarto trimestre (+0.6% intertrimestral).\n\n2024 (Febrero): El FMI inicia las misiones de monitorización en Madrid y detecta un consumo familiar muy vigoroso.\n\n2024 (Abril): Publicación oficial del World Economic Outlook donde España lidera las previsiones de las economías avanzadas.\n\n2024 (Mañana): El Gobierno presentará en el Congreso la actualización del cuadro macroeconómico basada en estas nuevas cifras.`,
    desglose: [
      "Crecimiento del PIB del 2.4%, líder entre las grandes economías del euro.",
      "Tasa de afiliación a la Seguridad Social en máximos históricos (21.1 millones).",
      "Inflación armonizada situada por debajo de la media europea (3.2%).",
      "Alerta del FMI sobre el déficit estructural por encima del 3%."
    ],
    contexto: `España ha logrado equilibrar su balanza comercial gracias a un incremento inesperado de las exportaciones de servicios de alto valor añadido (ingeniería, consultoría, software), rompiendo así la dependencia exclusiva del turismo de sol y playa. Este cambio estructural, sumado al despliegue de los fondos Next Generation EU, ha permitido que la inversión privada se mantenga a flote a pesar de que los tipos de interés se encuentran en el 4.5%.`,
    impactoSocial: [
      "Mantenimiento de los niveles de contratación indefinida para jóvenes licenciados.",
      "Garantía de sostenibilidad financiera para la revalorización de las pensiones con el IPC.",
      "Reducción de la tasa de paro estructural por debajo del 11% por primera vez en década y media."
    ],
    impactoSistemico: [
      "Consolidación de España como destino preferencial de la inversión extranjera directa en el sur de Europa.",
      "Mayor peso político de España en las decisiones del Consejo Europeo sobre reglas fiscales.",
      "Riesgo de recalentamiento de ciertos sectores ante la falta de mano de obra cualificada."
    ],
    consensoNarrativo: "Unanimidad fáctica sobre la superioridad del dato español frente a Europa, pero desacuerdo total sobre si el crecimiento es sólido o fruto de un gasto público insostenible.",
    factCheck: "El dato del 2.4% está confirmado por la actualización de primavera del WEO del FMI. La comparativa con Alemania es un dato técnico oficial del Eurostat.",
    blindSpot: "La mayoría de medios omiten el impacto de la economía sumergida en la revisión al alza del PIB por parte del INE.",
    tags: ["PIB", "FMI", "Eurozona", "Deuda Pública", "Inflación Subyacente", "Prudencia Fiscal"],
    similarTopics: ["Economía", "Bruselas", "BCE", "Mercado Laboral"],
    perspectives: {
      left: { title: "Resiliencia social y éxito del empleo digno", sources: "El País, elDiario.es, Cinco Días" },
      right: { title: "Dopaje público y erosión de la productividad real", sources: "Expansión, El Mundo, Libre Mercado" }
    },
    articles: [
      {
        source: "EXPANSIÓN", bias: "RIGHT", fact: "ALTA", time: "Hace 2h", origin: "Nacional", 
        type: "Análisis", tone: "Crítico", angle: "Productividad", author: "G. MORENO",
        summary: "Advierte del espejismo del crecimiento basado en el gasto de la administración.",
        whyOpened: "Análisis pormenorizado del PIB por componentes, separando gasto público de inversión privada.",
        diff: "Foco en la debilidad de la inversión empresarial.",
        readerContent: {
          whatHappened: "No se dejen engañar por el titular del 2,4%. El crecimiento que hoy celebra el Gobierno y que el FMI avala en su superficie esconde una realidad preocupante para el tejido productivo español: la inversión privada (FBCF) sigue estancada en niveles de 2019. Detrás del avance del PIB se encuentra, de forma preponderante, un gasto público desbocado que está asfixiando la capacidad de ahorro de las empresas mediante una presión fiscal récord. Si restamos la aportación de la administración pública al crecimiento del último año, la economía española se movería en un anémico 0,8%, mucho más cerca de la realidad que viven nuestras pymes.\n\nLa productividad por hora trabajada, el verdadero motor de la riqueza a largo plazo, sigue cayendo en España mientras sube en nuestros socios comunitarios. Estamos creando mucho empleo, pero es un empleo de baja calidad o muy vinculado al sector público y servicios de escaso valor añadido. El FMI ha sido claro en la letra pequeña de su informe, aunque el Ejecutivo prefiera ignorarlo: España no está haciendo las reformas estructurales necesarias en el sistema de pensiones ni en la administración del Estado para asegurar que este crecimiento sea sostenible cuando el BCE deje de comprar deuda española y la disciplina fiscal regrese a Bruselas el próximo año. El aviso de Washington es una bomba de relojería bajo la alfombra de la Moncloa: sin un plan serio de reducción de deuda, el próximo choque externo nos pillará sin munición fiscal y con un déficit estructural que ya es el mayor de la Eurozona.",
          interstitialNotes: [{ pos: 1, text: "Nota Técnica: La productividad por habitante ha caído un 3% en términos reales desde 2018." }],
          context: "España tiene una de las presiones fiscales sobre el capital más altas de la OCDE.",
          implications: { tenant: "Percepción de prosperidad que no se traduce en mayor renta disponible real por hogar.", owner: "Directivos ven con recelo la sostenibilidad de la demanda interna ante el fin de las ayudas." },
          preQuoteAnalysis: "El FMI ha sido claro en la letra pequeña de su informe, aunque el Ejecutivo prefiera ignorarlo: España no está haciendo las reformas estructurales necesarias. EXPANSIÓN disecciona los componentes del PIB para demostrar que la base del crecimiento es más volátil de lo que sugieren las cifras agregadas.",
          claims: [{ text: "\"Crecemos en volumen, pero no en calidad ni en eficiencia.\"", source: "Círculo de Empresarios" }],
          postQuoteAnalysis: "La advertencia del sector empresarial resuena con fuerza en los mercados de capitales. TNE Intelligence observa que la complacencia gubernamental ante estos datos podría retrasar reformas críticas en la productividad, dejando al país vulnerable ante el próximo endurecimiento de las reglas fiscales europeas.",
          blindSpot: "Expansión ignora el crecimiento récord de las exportaciones de servicios no turísticos (TIC y consultoría)."
        }
      },
      {
        source: "CINCO DÍAS", bias: "CENTER", fact: "ALTA", time: "Hace 3h", origin: "Nacional", 
        type: "Reportaje", tone: "Neutro", angle: "Corporativo", author: "S. VELASCO",
        summary: "Detalla los sectores que están empujando el carro de la economía española en 2024.",
        whyOpened: "Información sobre cuáles son las empresas y sectores que más crecen.",
        diff: "Enfoque en la economía real y estratégica.",
        readerContent: {
          whatHappened: "España está viviendo un cambio de paradigma en su modelo productivo que el FMI ha sabido detectar. Los sectores que están tirando de la economía en este primer semestre de 2024 no son los tradicionales. Se observa una pujanza inaudita en la exportación de servicios industriales, defensa y, sobre todo, consultoría tecnológica. Empresas del IBEX 35 y grandes constructoras han logrado equilibrar la caída de la demanda interna europea con proyectos en Oriente Medio y Estados Unidos, lo que está trayendo a España un volumen de divisas sin precedentes. Este sector exterior, sumado a un turismo que ya no es solo estacional, está blindando el crecimiento frente a la subida de tipos del BCE.\n\nDesde el punto de vista del empleo, el 2,4% de crecimiento se traduce en una mayor estabilidad de las plantillas. Los departamentos de RRHH de las grandes corporaciones españolas confirman a CINCO DÍAS que el miedo a la recesión ha desaparecido, sustituido por una preocupación por la captación de talento cualificado. Las inversiones vinculadas a los fondos Next Generation finalmente están alcanzando la economía capilar, especialmente en proyectos de digitalización de pymes y eficiencia energética. No obstante, el banco de España advierte que no debemos caer en la complacencia: el coste de la deuda hipotecaria de las familias españolas sigue drenando 15.000 millones de euros anuales que no van al consumo, lo que podría frenar este dinamismo si los tipos de interés no bajan antes de que finalice el año. La balanza de pagos es hoy el mayor orgullo de la economía española, situándonos como un país acreedor neto por primera vez en nuestra historia moderna.",
          interstitialNotes: [{ pos: 1, text: "Dato Sectorial: El turismo aporta ya el 14% del PIB directo e indirecto." }],
          context: "España es el cuarto país del mundo en recepción masiva de fondos de recuperación post-pandemia.",
          implications: { tenant: "Mayor seguridad en el puesto de trabajo y posibilidades de mejora salarial.", owner: "Oportunidades de inversión en sectores de transición ecológica y digital." },
          preQuoteAnalysis: "Las inversiones vinculadas a los fondos Next Generation finalmente están alcanzando la economía capilar, especialmente en proyectos de digitalización. CINCO DÍAS detalla cómo las grandes corporaciones están liderando este cambio de paradigma productivo hacia servicios de alto valor añadido.",
          claims: [{ text: "\"El motor español tiene una inercia propia que sorprende a los analistas.\"", source: "Analista Jefe de Banco Sabadell" }],
          postQuoteAnalysis: "A pesar del optimismo corporativo, la fragilidad de las pymes industriales sigue siendo un factor de riesgo. TNE subraya que el éxito del IBEX 35 no debe ocultar la erosión de márgenes en el tejido empresarial básico, que sigue lidiando con costes financieros históricamente altos.",
          blindSpot: "Omiten profundizar en el impacto letal de la inflación en la pérdida de márgenes de las pymes industriales."
        }
      },
      {
        source: "EL ECONOMISTA", bias: "RIGHT", fact: "ALTA", time: "Hace 4h", origin: "Nacional", 
        type: "Análisis", tone: "Técnico", angle: "Macro", author: "I. BENITO",
        summary: "Pone el foco en el déficit público y el riesgo de sanción desde Bruselas.",
        whyOpened: "Análisis de las reglas fiscales y el impacto de la deuda en los próximos presupuestos.",
        diff: "Foco en el riesgo regulatorio europeo.",
        readerContent: {
          whatHappened: "El FMI ha dado el aprobado a España, pero con una 'advertencia de progreso' en la mochila del Gobierno. El crecimiento del 2,4% es una excelente noticia para el marketing político, pero un dolor de cabeza para los gestores macroeconómicos que ven cómo el déficit estructural se resiste a bajar del 3%. Con el regreso inminente de las reglas del Pacto de Estabilidad y Crecimiento en la UE, España se arriesga a entrar en un procedimiento de déficit excesivo el año que viene si no inicia un ajuste de al menos 10.000 millones de euros en gasto corriente. Las previsiones de Washington asumen que el Gobierno central no tendrá problemas para cumplir, pero la realidad de los presupuestos prorrogados y la inestabilidad parlamentaria ponen en duda esta capacidad de recorte.\n\nOtro factor crítico que subraya el informe es el enquistamiento de la inflación de los alimentos, que sigue subiendo a doble dígito a pesar de que la energía ha bajado. Esto está generando una brecha de desigualdad creciente: mientras el PIB sube, las familias más pobres ven cómo su cesta de la compra es un 30% más cara que hace dos años. El Economista ha analizado las tripas del crecimiento y detecta una debilidad alarmante en la creación de capital productivo: las máquinas se están quedando obsoletas y no hay inversión en bienes de equipo. Estamos construyendo una economía de servicios muy dinámica pero con pies de barro industriales. El reto para 2025 será mantener este crecimiento cuando el viento de cola de los fondos europeos se agote y tengamos que empezar a pagar los intereses de una deuda que ya roza el 108% del PIB.",
          interstitialNotes: [{ pos: 2, text: "Contexto Fiscal: España debe reducir su déficit al 3% para evitar sanciones en 2025." }],
          context: "La deuda pública española ha pasado de 1.1 billones a 1.5 billones de euros en los últimos cinco años.",
          implications: { tenant: "Riesgo de subidas impositivas futuras para cuadrar las cuentas del Estado.", owner: "Posible endurecimiento de las condiciones de crédito bancario por el riesgo país." },
          preQuoteAnalysis: "El reto para 2025 será mantener este crecimiento cuando el viento de cola de los fondos europeos se agote y tengamos que empezar a pagar los intereses. EL ECONOMISTA pone el foco en el déficit estructural que sigue anclado por encima de lo que Bruselas considera seguro para la Eurozona.",
          claims: [{ text: "\"La fiesta del gasto público tiene fecha de caducidad en Bruselas.\"", source: "Ex-comisario europeo de economía" }],
          postQuoteAnalysis: "Este aviso desde el corazón de la UE marca el inicio de una fase de austeridad técnica inevitable. TNE Intelligence detecta que los mercados ya están descontando un endurecimiento fiscal en España, lo que podría elevar la prima de riesgo si el crecimiento no se traduce en una reducción real del déficit.",
          blindSpot: "El Economista obvia que el ratio Deuda/PIB está bajando gracias al crecimiento nominal del propio PIB e inflación."
        }
      },
      {
        source: "LA VANGUARDIA", bias: "CENTER", fact: "ALTA", time: "Hace 5h", origin: "Cataluña", 
        type: "Noticia", tone: "Neutro", angle: "Financiero", author: "E. ARNAL",
        summary: "Analiza el desacoplamiento de España respecto a la locomotora alemana.",
        whyOpened: "Contexto europeo y comparación del modelo industrial vs servicios.",
        diff: "Perspectiva comunitaria europea.",
        readerContent: {
          whatHappened: "El mapa económico europeo se ha dado la vuelta. Tradicionalmente, España dependía de que Alemania creciera para recibir turistas e industria. Hoy, según el FMI, España vuela sola con un 2,4% mientras Alemania se hunde en la parálisis industrial. Este fenómeno, denominado 'desacoplamiento energético', se debe a que España ha sabido explotar su condición de isla energética y su fuerte apuesta por la regasificación y las renovables, mientras los centros productivos del Rin sufren por los altos costes del gas post-guerra de Ucrania. La sensación en Bruselas es que el centro de gravedad del crecimiento se está moviendo hacia el Mediterráneo.\n\nEn Barcelona y Madrid, los centros de negocios están operando a pleno rendimiento, impulsados por una demanda interna que se ha mostrado mucho más resiliente de lo previsto a pesar del encarecimiento de las hipotecas. El ahorro acumulado durante los años de pandemia sigue actuando como un colchón de seguridad para el consumo. La Vanguardia destaca que este crecimiento no solo está centrado en el turismo, sino en una vigorosa industria de servicios para la exportación que ha crecido un 18% en el último año. El principal riesgo que detectan los analistas es la falta de reformas en el mercado único que permitan a las empresas españolas ganar escala. Somos muy buenos compitiendo en el exterior, pero seguimos siendo empresas pequeñas. El FMI felicita a España por su estabilidad financiera, pero recuerda que el déficit del sector público sigue siendo la asignatura pendiente para que esta 'etapa dorada' del crecimiento no termine siendo un espejismo pasajero.",
          interstitialNotes: [{ pos: 1, text: "Nota Informativa: Alemania prevé un crecimiento del 0.2% frente al 2.4% español." }],
          context: "España tiene la mayor red de plantas regasificadoras de toda la Unión Europea.",
          implications: { tenant: "Oportunidades de movilidad laboral hacia sectores de mayor valor añadido.", owner: "Incremento del valor de los activos inmobiliarios comerciales e industriales." },
          preQuoteAnalysis: "Barcelona y Madrid están operando a pleno rendimiento, impulsados por una demanda interna resiliente. LA VANGUARDIA analiza el desacoplamiento de España respecto a la locomotora alemana, atribuyéndolo a una mayor flexibilidad energética y un sector turístico que ha roto todos sus techos históricos.",
          claims: [{ text: "\"España es hoy el alumno aventajado de la clase europea.\"", source: "Corresponsal económico en Bruselas" }],
          postQuoteAnalysis: "Sin embargo, ser el 'alumno aventajado' implica también una mayor presión para liderar las reformas institucionales en el sur de Europa. TNE observa que esta posición de dominio fáctica podría ser efímera si no se logra consolidar una base industrial propia que no dependa exclusivamente de factores externos.",
          blindSpot: "Omiten mencionar el impacto del nacionalismo económico en la fragmentación del mercado interno español."
        }
      },
      {
        source: "EL CONFIDENCIAL", bias: "CENTER", fact: "ALTA", time: "Hace 6h", origin: "Nacional", 
        type: "Análisis", tone: "Analítico", angle: "Inversión", author: "A. MARCO",
        summary: "Investiga el impacto de los tipos de interés en el crecimiento real y la tasa de inversión.",
        whyOpened: "Análisis profundo sobre el mercado de capitales y financiación empresarial.",
        diff: "Foco en el sector bancario y financiero.",
        readerContent: {
          whatHappened: "Los tipos de interés en el 4,5% parecen no existir para el PIB español, pero la realidad en los balances bancarios es muy distinta. El Confidencial ha accedido a los datos de flujo de crédito del Banco de España y la conclusión es clara: la economía crece al 2,4% por el consumo y el gasto público, pero la inversión productiva de las empresas se está financiando a pulmón o simplemente se está cancelando. El FMI ha elogiado la solidez del sistema financiero español, cuya solvencia es hoy muy superior a la de 2008, lo que ha permitido que no se cierre el grifo del crédito pero sí que se encarezca hasta asfixiar el margen de las micro-pymes.\n\nEl sector inmobiliario y el automovilístico son los grandes damnificados de esta paradoja económica. Mientras los aeropuertos están llenos y los restaurantes no tienen mesa, las matriculaciones de vehículos están en caída libre y las firmas de hipotecas se han desplomado un 25%. El crecimiento español es hoy una economía de dos velocidades: una muy dinámica basada en los servicios y el gasto corriente, y otra totalmente paralizada por el coste del dinero que afecta a los bienes duraderos. El FMI advierte que el margen de seguridad de España es escaso: si el consumo se frena antes de que los tipos bajen, entraremos en fase de estancamiento. La clave será ver cómo reacciona el Gobierno ante la retirada de los estímulos energéticos; si se retiran de golpe, la inflación podría volver a repuntar, obligando al BCE a mantener los tipos altos más tiempo del que España puede soportar. Es un juego de equilibrios muy peligroso donde el 2,4% actual es nuestra única red de seguridad.",
          interstitialNotes: [{ pos: 1, text: "Nota TNE: El Euribor sigue por encima del 3.7% condicionando el ahorro familiar." }],
          context: "Los bancos españoles han obtenido beneficios récord en 2023 gracias al diferencial de tipos.",
          implications: { tenant: "Dificultad extrema para el acceso a la vivienda en propiedad pese al crecimiento.", owner: "Alta rentabilidad en activos financieros conservadores frente a la inversión industrial." },
          preQuoteAnalysis: "La clave será ver cómo reacciona el Gobierno ante la retirada de los estímulos energéticos; si se retiran de golpe, la inflación podría volver a repuntar. EL CONFIDENCIAL investiga el flujo de capitales hacia sectores conservadores, detectando una parálisis preocupante en la inversión en bienes de equipo.",
          claims: [{ text: "\"El crecimiento es robusto, pero la base de inversión es frágil.\"", source: "Ex-gobernador del Banco de España" }],
          postQuoteAnalysis: "Esta fragilidad es el punto de fractura potencial del modelo actual. TNE Intelligence subraya que el crecimiento basado en servicios es altamente sensible a las variaciones de tipos de interés, lo que sitúa a la economía española en una situación de dependencia absoluta de las decisiones del BCE en Frankfurt.",
          blindSpot: "Ignoran el impacto positivo de la digitalización bancaria en la eficiencia del sistema español."
        }
      }
    ]
  },
  {
    id: 3,
    title: "Debate en el Congreso sobre la reforma de la Ley de Seguridad Ciudadana",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
    time: "hace 8 horas",
    location: "España",
    sourceCount: 35,
    bias: { left: 40, center: 10, right: 50 },
    factuality: "Mixed",
    summary: "El Congreso de los Diputados vive una jornada de máxima tensión ante la votación de la reforma de la conocida como 'Ley Mordaza', con el uso de pelotas de goma como principal punto de ruptura.",
    fullContent: `El Pleno del Congreso de los Diputados aborda hoy la fase final de la reforma de la Ley Orgánica de Seguridad Ciudadana, una de las asignaturas pendientes más espinosas de la legislatura. La sesión se desarrolla en un clima de alta polarización, con cientos de agentes de las Fuerzas y Cuerpos de Seguridad del Estado manifestándose a las puertas del hemiciclo mientras en el interior los grupos parlamentarios agotan los turnos de palabra.\n\nLos puntos de fricción son tres: la prohibición del uso de proyectiles cinéticos (pelotas de goma), la eliminación de la presunción de veracidad de los agentes en las actas de sanción y el fin de las multas por la grabación de intervenciones policiales en la vía pública. Mientras el bloque de investidura defiende que estas modificaciones alinean a España con los estándares de derechos humanos de la ONU y el Consejo de Europa, la oposición tacha la reforma de 'desarme operativo' y advierte de que dejará a la policía vendida ante los grupos violentos. El resultado de la votación pende de un hilo, con constantes llamadas directas entre los ministerios de Interior y Presidencia para asegurar los últimos apoyos necesarios.`,
    perspectivasInfo: `La lectura de esta reforma es estrictamente binaria. El bloque progresista y los colectivos de derechos civiles consideran que la ley vigente (aprobada en 2015) es una herramienta de castigo a la disidencia política que ha servido para desactivar la protesta social mediante multas administrativas arbitrarias. Su prioridad es blindar el derecho de reunión y la libertad de prensa.\n\nPor contra, la perspectiva de los sindicatos policiales (JUPOL, SUP) y la mayoría de la prensa conservadora es de desprotección absoluta. Argumentan que la presunción de veracidad no es un privilegio, sino un principio de autoridad necesario para que un agente pueda imponer el orden en situaciones de caos sin depender de grabaciones externas a menudo manipuladas. Para ellos, retirar las pelotas de goma sin ofrecer una alternativa eficaz es condenar a las unidades antidisturbios a sufrir lesiones graves en cada manifestación violenta.`,
    cronologiaInfo: `2015: El Gobierno del PP aprueba la ley actual bajo un clima de fuertes protestas (15M, Rodea el Congreso).\n\n2018: Pedro Sánchez asume la presidencia con el compromiso explícito de 'derogar la Ley Mordaza'.\n\n2021: El Tribunal Constitucional anula el artículo que prohibía captar imágenes de policías si no representaban un riesgo real.\n\n2023 (Marzo): Primer intento fallido de reforma en comisión por la falta de acuerdo sobre las pelotas de goma.\n\n2024 (Hoy): Votación definitiva en el Pleno tras un pacto 'in extremis' sobre protocolos de mediación y material menos lesivo.`,
    desglose: [
      "Eliminación de la prohibición de grabar a policías en actuaciones de orden público.",
      "Sustitución progresiva de pelotas de goma por materiales menos lesivos en 24 meses.",
      "Reducción de las multas por falta de respeto a la autoridad si hay disculpa posterior.",
      "Obligación de que el acta policial sea coherente con las pruebas gráficas aportadas."
    ],
    contexto: `La Ley de Seguridad Ciudadana de 2015 ha sido objeto de más de 40.000 sanciones anuales vinculadas directamente a la libertad de expresión y reunión. España ha recibido múltiples tirones de orejas por parte de organismos internacionales por el uso de conceptos vagos como 'desobediencia' o 'falta de respeto', que dejaban un margen de discrecionalidad excesivo al agente de calle.`,
    impactoSocial: [
      "Mayor seguridad jurídica para periodistas y ciudadanos que documenten la actuación policial.",
      "Descenso previsto del 30% en la cuantía total de las multas administrativas por protestas.",
      "Aumento de la confianza de los movimientos sociales en los cauces democráticos de manifestación."
    ],
    impactoSistemico: [
      "Riesgo de desmoralización y fuga de efectivos en las Unidades de Intervención Policial (UIP).",
      "Posible incremento de la conflictividad en las calles ante la percepción de menor autoridad.",
      "Armonización de la legislación española con la carta de DDHH de la Unión Europea."
    ],
    consensoNarrativo: "Acuerdo general sobre que la ley de 2015 era 'mejorable', pero fractura absoluta sobre si esta reforma protege la libertad o desprotege a quien debe garantizarla.",
    factCheck: "Las 12 sanciones anuladas por el Constitucional son un hecho jurídico firme. Las críticas de la ONU son recomendaciones de relatores, no sentencias vinculantes.",
    blindSpot: "Poca mención al coste operativo de las fuerzas de seguridad ante las nuevas restricciones de identificación.",
    tags: ["Ley Mordaza", "Constitución", "Libertad de Expresión", "Seguridad Ciudadana", "Derechos Humanos", "ONU"],
    similarTopics: ["Justicia", "Interior", "Derechos Civiles", "Tribunal Supremo"],
    perspectives: {
      left: { title: "Recuperación de libertades civiles y fin del castigo a la protesta", sources: "elDiario.es, El País, Público" },
      right: { title: "Ataque al principio de autoridad y desprotección policial", sources: "ABC, El Mundo, La Razón" }
    },
    articles: [
      {
        source: "RTVE", bias: "CENTER", fact: "ALTA", time: "Hace 2h", origin: "Nacional", 
        type: "Noticia", tone: "Neutro", angle: "Institucional", author: "Servicios Informativos",
        summary: "Crónica técnica de la votación y desglose de los puntos pactados en la reforma.",
        whyOpened: "Información objetiva sobre el texto legal aprobado.",
        diff: "Foco en los plazos de implementación.",
        readerContent: {
          whatHappened: "El Congreso de los Diputados ha dado hoy luz verde a la tan esperada reforma de la Ley de Seguridad Ciudadana. Tras una mañana de debates maratonianos, el texto ha salido adelante con una ajustada mayoría de 176 votos a favor. El acuerdo final incluye una disposición adicional que obliga al Ministerio del Interior a presentar en un plazo de seis meses un plan de transición para el uso de armamento menos lesivo, lo que abre la puerta al fin de las pelotas de goma de forma escalonada. La reforma también introduce la proporcionalidad en las multas, que a partir de ahora tendrán en cuenta la renta del sancionado para evitar que una protesta suponga la ruina económica de una familia con pocos recursos.\n\nRTVE ha podido confirmar que el grueso de la reforma entrará en vigor de forma inmediata tras su publicación en el BOE, a excepción de los artículos que requieren nuevos protocolos operativos para la Policía Nacional y la Guardia Civil. El ministro del Interior, Fernando Grande-Marlaska, ha comparecido para asegurar que 'la seguridad de los agentes sigue siendo una prioridad absoluta' y que la reforma simplemente dota al sistema de una mayor transparencia y garantías para el ciudadano. Sin embargo, los sindicatos policiales presentes en la tribuna de invitados han abandonado el hemiciclo en señal de protesta. Según los expertos legales consultados por nuestra redacción, el cambio más significativo a efectos prácticos será la imposibilidad de sancionar la toma de imágenes de intervenciones policiales, siempre que estas no pongan en peligro la seguridad de los agentes o de sus familias, algo que el Tribunal Constitucional ya venía apuntando en sus últimas sentencias. La sesión de hoy cierra un ciclo de casi una década de controversia jurídica y política alrededor de la gestión del orden público en España.",
          interstitialNotes: [{ pos: 1, text: "Nota Técnica: La reforma afecta a más de 50 artículos de la ley original de 2015." }],
          context: "España es uno de los pocos países europeos que seguía usando pelotas de goma de forma recurrente en manifestaciones.",
          implications: { tenant: "Libertad total para grabar actuaciones policiales en espacios públicos.", owner: "Los mandos policiales deberán formar a sus patrullas en nuevas técnicas de mediación." },
          preQuoteAnalysis: "La reforma también introduce la proporcionalidad en las multas, que a partir de ahora tendrán en cuenta la renta del sancionado para evitar que una protesta suponga la ruina económica. RTVE analiza los plazos de implementación técnica de este nuevo baremo de sanciones.",
          claims: [{ text: "\"Es un día de victoria para la democracia y los derechos civiles.\"", source: "Portavoz grupo proponente" }],
          postQuoteAnalysis: "Tras la votación, el clima de euforia en los pasillos del Congreso contrasta con la frialdad técnica de los informes de impacto. TNE Intelligence observa que la efectividad real dependerá de la capacidad de Interior para reequipar a miles de agentes en un tiempo récord.",
          blindSpot: "RTVE evita profundizar en la amenaza de huelga encubierta por parte de ciertos sectores policiales en conflicto."
        }
      },
      {
        source: "EL MUNDO", bias: "RIGHT", fact: "ALTA", time: "Hace 3h", origin: "Nacional", 
        type: "Análisis", tone: "Crítico", angle: "Seguridad", author: "P. MANSO",
        summary: "Denuncia el abandono de los cuerpos de seguridad por razones de conveniencia política.",
        whyOpened: "Perspectiva de los sindicatos policiales y análisis de riesgos operativos.",
        diff: "Enfatiza la indefensión del agente.",
        readerContent: {
          whatHappened: "Hoy es un día triste para quienes vestimos de uniforme. Con estas palabras resumía un veterano agente de la UIP el sentimiento generalizado tras conocerse el resultado de la votación en el Congreso. La reforma de la Ley Mordaza no es más que un pago político a los socios de inversión, un peaje que el Gobierno ha decidido cobrar a costa de la integridad física de miles de policías y guardias civiles. Al retirar la presunción de veracidad y las pelotas de goma, el Congreso está enviando un mensaje peligroso: el delincuente y el violento tienen más garantías que quien arriesga su vida para proteger la de los demás. La eliminación de la presunción de veracidad obligará a los agentes a llevar cámaras personales para todo, algo para lo que Interior ni siquiera ha presupuestado los fondos necesarios.\n\nEl análisis de EL MUNDO apunta a que esta reforma generará una parálisis operativa en las calles. Un agente se lo pensará dos veces antes de identificar a alguien o de intervenir en una riña si sabe que cualquier grabación recortada por un activista puede costarle su carrera. Además, la sustitución de las pelotas de goma por otros medios 'menos lesivos' es una entelequia técnica que hoy por hoy no existe con la eficacia necesaria para contener masas violentas. La oposición ya ha anunciado un recurso de amparo ante el Constitucional, argumentando que se está vulnerando el derecho a la seguridad pública. Mientras tanto, las organizaciones policiales preparan una de las mayores movilizaciones de la historia para el próximo mes. El campo de batalla político se traslada ahora a las patrullas de calle, donde la tensión entre libertad de protesta y autoridad del Estado está más cerca que nunca de la ruptura total. No es garantismo, es rendición ante quienes quieren una España sin ley.",
          interstitialNotes: [{ pos: 2, text: "Dato TNE: En 2023 se registraron más de 12.000 agresiones a agentes de la autoridad." }],
          context: "La presunción de veracidad existe en la mayoría de códigos administrativos de la Unión Europea para cuerpos de seguridad.",
          implications: { tenant: "Percepción de 'impunidad' por parte de colectivos radicales en manifestaciones.", owner: "Incertidumbre jurídica total para el agente que deba usar la fuerza mínima indispensable." },
          preQuoteAnalysis: "La fundamentación de estas críticas se basa en el supuesto debilitamiento del principio de autoridad. EL MUNDO disecciona el texto para denunciar un 'desarme moral' que, según los sindicatos policiales, dejará a las patrullas vendidas ante la creciente agresividad en los entornos urbanos.",
          claims: [{ text: "\"Nos dejan a los pies de los caballos para salvar una legislatura.\"", source: "Sindicato JUPOL" }],
          postQuoteAnalysis: "Esta sensación de abandono institucional es el principal punto de fractura interna en los cuerpos de seguridad. TNE subraya que el aumento de la litigiosidad contra agentes individuales será la consecuencia más inmediata de la eliminación de la presunción de veracidad absoluta.",
          blindSpot: "EL MUNDO no menciona que la reforma mantiene intactas las multas por desobediencia grave o resistencia activa."
        }
      },
      {
        source: "EL DIARIO", bias: "LEFT", fact: "ALTA", time: "Hace 4h", origin: "Nacional", 
        type: "Reportaje", tone: "Activista", angle: "Derechos", author: "I. SÁNCHEZ",
        summary: "Celebra el fin de una era de 'represión administrativa' contra los movimientos sociales.",
        whyOpened: "Casos reales de personas sancionadas injustamente por la ley de 2015.",
        diff: "Foco en la regeneración democrática.",
        readerContent: {
          whatHappened: "Nueve años después de que el PP de Rajoy impusiera el mordisco administrativo a la democracia, España empieza a respirar. La reforma aprobada hoy en el Congreso desmonta los pilares de la ley que permitía multar a una persona con 30.000 euros por el solo hecho de desplegar una pancarta frente al Congreso o por preguntar el número de placa a un agente. EL DIARIO ha hablado con activistas del 15M y de la PAH que han pasado años en los tribunales para demostrar que las actas policiales mentían. Para ellos, hoy no es solo un cambio legal, es un acto de reparación moral. La eliminación de la presunción de veracidad absoluta devuelve el equilibrio a la sala del tribunal: la palabra del agente valdrá tanto como la prueba de un vídeo ciudadano.\n\nEl reportaje profundiza en cómo esta ley se usó para 'limpiar' las calles de descontento social durante la crisis financiera. Las multas por 'falta de respeto' fueron el cajón de sastre donde cabía todo lo que al policía le resultaba molesto. Con el nuevo texto, la falta de respeto debe ser insultante y directa, no una simple crítica airada a una actuación. Sin embargo, los colectivos de defensa de los DDHH advierten que la reforma se queda corta al no prohibir hoy mismo, de forma tajante, las pelotas de goma. Un periodo de transición de dos años es 'demasiado tiempo para que alguien más pierda un ojo', aseguran desde la plataforma No Somos Delito. Aun así, el paso dado hoy es histórico. España deja de ser el país que multaba por tuitear una foto de un coche patrulla mal aparcado para ser un país donde el ciudadano vuelve a ser el dueño del espacio público.",
          interstitialNotes: [{ pos: 1, text: "Nota Social: Entre 2015 y 2022 se recaudaron más de 1.000 millones en multas 'Mordaza'." }],
          context: "Cientos de causas contra periodistas por 'obstrucción a la autoridad' han sido archivadas por falta de pruebas.",
          implications: { tenant: "Fin de la 'autocensura' de muchos colectivos por miedo a la ruina económica de una sanción.", owner: "La administración deberá esforzarse más en probar las infracciones cometidas." },
          preQuoteAnalysis: "EL DIARIO ha hablado con activistas del 15M y de la PAH que han pasado años en los tribunales para demostrar que las actas policiales mentían. El reportaje celebra el fin de una era de 'represión administrativa' que ha condicionado la protesta social durante casi una década.",
          claims: [{ text: "\"La desobediencia pacífica deja de ser un crimen patrimonial.\"", source: "Plataforma de Afectados por la Hipoteca" }],
          postQuoteAnalysis: "Este hito para los movimientos sociales marca un antes y un después en la calle. TNE Intelligence destaca que España abandona la 'vía administrativa' como método de control político, aunque advierte sobre la posible saturación de los juzgados ante la falta de filtros previos.",
          blindSpot: "EL DIARIO omite los retos de seguridad que supone gestionar concentraciones masivas sin medios intermedios de dispersión."
        }
      },
      {
        source: "LA RAZÓN", bias: "RIGHT", fact: "ALTA", time: "Hace 5h", origin: "Nacional", 
        type: "Opinión", tone: "Crítico", angle: "Constitucional", author: "F. J. LOSILLA",
        summary: "Analiza el riesgo de que la reforma sea declarada inconstitucional por invadir competencias de seguridad.",
        whyOpened: "Visión jurídica conservadora sobre los límites del legislativo en seguridad nacional.",
        diff: "Foco en el marco constitucional.",
        readerContent: {
          whatHappened: "El Gobierno ha traspasado hoy una línea roja constitucional que pone en riesgo la arquitectura de seguridad del Estado. La reforma de la Ley de Seguridad Ciudadana no solo es un error político, es un despropósito jurídico que atenta contra el principio de eficacia de la administración pública. Al obligar a que el testimonio de un agente de la autoridad sea contrastado como si fuera el de cualquier otro particular, se está dinamitando la columna vertebral del derecho administrativo sancionador. ¿Cómo podrá un agente de tráfico o un policía en una zona de botellón imponer una sanción si cada ciudadano puede impugnarla simplemente alegando que 'no fue así' y exigiendo vídeos que a veces no se pueden grabar?\n\nLa RAZÓN subraya que esta reforma debilita al Estado justo cuando más fuerte debería ser. En un contexto de alerta antiterrorista 4 y con el auge de nuevas formas de criminalidad callejera, desarmar técnica y moralmente a la policía es una irresponsabilidad de proporciones históricas. El texto aprobado hoy es fruto de un chantaje parlamentario que ignora los informes técnicos del Consejo de Estado y de la propia Fiscalía General, que ya advirtieron de la inseguridad que generaba la redacción de ciertos artículos. El recurso de inconstitucionalidad que preparan la derecha y ciertos sectores judiciales se basará en la vulneración del derecho a la tutela policial efectiva. El Gobierno cree que ha domesticado la calle, pero lo que ha hecho es abrir la veda para que el desacato se convierta en la norma. Sin orden no hay libertad, y hoy el orden ha perdido la batalla en las Cortes.",
          interstitialNotes: [{ pos: 3, text: "Nota Legal: El Tribunal Supremo ha ratificado en varias ocasiones la veracidad del agente como pilar del orden." }],
          context: "La ley de 2015 fue avalada casi en su totalidad por el Tribunal Constitucional en 2020.",
          implications: { tenant: "Aparición de 'zonas de sombra' donde la policía preferirá no intervenir para evitar problemas legales.", owner: "Necesidad de una profunda reforma de los planes de formación en las academias de policía." },
          preQuoteAnalysis: "LA RAZÓN subraya que esta reforma debilita al Estado justo cuando más fuerte debería ser. El análisis jurídico pone el foco en la inseguridad que genera la redacción de ciertos artículos que, a su juicio, son fruto de un chantaje parlamentario incompatible con el orden público.",
          claims: [{ text: "\"Vendemos la paz social a cambio de un puñado de votos radicales.\"", source: "Ex-ministro de Interior" }],
          postQuoteAnalysis: "La advertencia sobre la 'paz social' abre un debate sobre los límites de la autoridad en democracia. TNE observa que esta polarización legislativa dificultará la implementación de protocolos compartidos entre policías locales y nacionales, fragmentando la respuesta ante crisis de seguridad.",
          blindSpot: "LA RAZÓN ignora que la reforma ha sido solicitada formalmente por el Comisario de DDHH del Consejo de Europa."
        }
      },
      {
        source: "AGENCIA EFE", bias: "CENTER", fact: "ALTA", time: "Hace 6h", origin: "Nacional", 
        type: "Noticia", tone: "Neutro", angle: "Sucesos", author: "Redacción EFE",
        summary: "Recopilación de las reacciones de todas las partes tras la aprobación de la reforma.",
        whyOpened: "Visión panorámica y rápida de las posturas de todos los grupos y sindicatos.",
        diff: "Es la fuente mas rápida y plural.",
        readerContent: {
          whatHappened: "La reforma de la Ley Mordaza ya es una realidad legislativa a falta de su paso por el Senado. Las reacciones han sido tan diversas como los 176 diputados que la han apoyado. Mientras dentro del Congreso se vivían abrazos entre los grupos de izquierda, a pocos metros, las sirenas de los furgones policiales pitaban en señal de duelo. La Agencia EFE ha pulsado la opinión de catedráticos de Derecho Administrativo, quienes coinciden en que estamos ante el cambio más ambicioso en materia de orden público desde la transición. Se acaba con el carácter 'preventivo' de la ley para pasar a un modelo 'reactivo' y garantista. Sin embargo, el camino hacia la convivencia real sigue plagado de obstáculos.\n\nEFE destaca que el acuerdo sobre las pelotas de goma ha sido el más difícil de cerrar. Interior se ha comprometido a sustituirlas por proyectiles de 'foam' de precisión, mucho menos erráticos, pero advierte que el coste de renovar todo el arsenal de las UIP superará los 15 millones de euros. Por otro lado, los expertos en mediación social celebran que la ley obligue ahora a avisar claramente antes de cualquier carga policial, algo que hasta ahora se hacía de forma discrecional. La reforma también incluye un apartado para agilizar la devolución de objetos incautados en manifestaciones, un punto secundario pero muy demandado. En definitiva, las reacciones muestran un país partido en dos visiones de la seguridad: la que se basa en la autoridad y la que se basa en el consenso. La implementación real en las próximas fiestas populares y manifestaciones de gran calado será el verdadero examen para este nuevo texto legal.",
          interstitialNotes: [{ pos: 1, text: "Contexto EFE: El sistema de multas de España era el más estricto de los países del sur de Europa." }],
          context: "El 'foam' es el material que ya usan los Mossos d'Esquadra en Cataluña desde hace años.",
          implications: { tenant: "Mayor tiempo de disolución pacífica en concentraciones antes de la intervención física.", owner: "Incremento de la carga administrativa para el Ministerio de Interior en la gestión de expedientes." },
          preQuoteAnalysis: "Agencia EFE destaca que el acuerdo sobre las pelotas de goma ha sido el más difícil de cerrar. La crónica recopila las posturas de todos los grupos, subrayando que la transición hacia materiales menos lesivos es el punto neurálgico que definirá el éxito de la reforma.",
          claims: [{ text: "\"Buscamos una policía del siglo XXI para una ciudadanía del siglo XXI.\"", source: "Portavoz del Gobierno" }],
          postQuoteAnalysis: "El seguimiento de esta 'policía del siglo XXI' será el siguiente gran reto informativo. TNE Intelligence destaca que la dotación presupuestaria para el nuevo material es el primer escollo real que podría convertir la promesa política en una parálisis operativa prolongada.",
          blindSpot: "EFE no entra a valorar si los plazos de sustitución del material son realistas dado el estado actual de los presupuestos del Estado."
        }
      }
    ]
  },
  {
    id: 4,
    title: "Crisis en la Sanidad Pública: Médicos inician huelga indefinida",
    image: "https://images.unsplash.com/photo-1576091160550-217359f41f18?auto=format&fit=crop&q=80&w=800",
    time: "hace 10 horas",
    location: "España",
    sourceCount: 28,
    bias: { left: 55, center: 25, right: 20 },
    factuality: "High",
    summary: "Los facultativos de Atención Primaria y hospitales de gran parte del país inician un paro indefinido demandando mejoras en la inversión y el fin de las agendas infinitas.",
    fullContent: `La sanidad pública española afronta su momento más crítico en décadas. Miles de médicos de familia, pediatras y especialistas hospitalarios han iniciado hoy una huelga indefinida que amenaza con paralizar la asistencia no urgente de millones de ciudadanos. El detonante ha sido el fracaso de las últimas mesas de negociación entre el Ministerio de Sanidad y las consejerías autonómicas con el Comité de Huelga, que exige un blindaje presupuestario para la Atención Primaria y un límite infranqueable de 35 pacientes por día.\n\nLa situación en los centros de salud es de colapso técnico. Los convocantes denuncian que la falta de relevo generacional y las condiciones de precariedad están empujando a los profesionales más jóvenes a emigrar a otros países europeos o a refugiarse en la medicina privada. Por su parte, las administraciones se defienden argumentando que el problema es la falta sistémica de médicos a nivel nacional, algo que depende del número de plazas MIR que saca el Gobierno central. Con los servicios mínimos fijados en el 50% para urgencias y procesos críticos, el resto de la actividad programada ha caído en picado en el primer día de paro, mientras las salas de espera se llenan de pacientes confundidos y preocupados por sus citas aplazadas indefinidamente.`,
    perspectivasInfo: `El conflicto sanitario se lee de forma muy distinta según el color político de la región y del medio que informe. En los medios cercanos al Gobierno central y sindicatos profesionales, el foco se pone en la 'infrainversión' crónica y en lo que denominan el 'plan de desmantelamiento' de lo público para favorecer a las aseguradoras privadas. Destacan que la huelga es el grito desesperado de unos profesionales exhaustos tras la pandemia que ya no pueden garantizar la seguridad del paciente.\n\nDesde los sectores y medios conservadores, la huelga se interpreta como un movimiento estrictamente político. Argumentan que se orquesta con fines electorales para desgastar a los gobiernos regionales de la derecha. Subrayan que el sueldo de los médicos españoles ha crecido por encima de la media de los funcionarios y que el verdadero problema es la gestión 'rigurosa e ineficiente' de unos recursos que son finitos. Para ellos, no es falta de dinero, sino falta de capacidad organizativa y exceso de ideología en las reivindicaciones laborales.`,
    cronologiaInfo: `2020: La pandemia de COVID-19 expone las costuras de un sistema sanitario ya debilitado por los recortes de 2012.\n\n2022: Primeros paros localizados en Madrid, Andalucía y Galicia por la falta de personal en las urgencias rurales.\n\n2023 (Octubre): Formación de un comité de huelga estatal que unifica las demandas de Atención Primaria y Especializada.\n\n2024 (Enero): Ruptura definitiva de negociaciones tras la negativa de las CCAA a fijar los 10 minutos de consulta por paciente por ley.\n\n2024 (Hoy): Inicio de la huelga indefinida con un seguimiento masivo en las grandes ciudades (estimado en el 85% por los sindicatos).`,
    desglose: [
      "Exigencia de un mínimo de 10 minutos reales de atención directa por paciente.",
      "Límite máximo de 35 consultas diarias en Primaria y 20 en Pediatría.",
      "Incremento de la inversión en Atención Primaria hasta el 25% del total sanitario.",
      "Equiparación salarial respecto a la competencia de la sanidad privada y europea."
    ],
    contexto: `España destina actualmente un 7.8% de su PIB a sanidad, lejos del 11% de Alemania o el 10% de Francia. Sin embargo, el mayor problema es la distribución interna: la Atención Primaria recibe solo el 14% de la tarta sanitaria, a pesar de que es el nivel que resuelve el 90% de los problemas de salud del ciudadano. Esta huelga es la culminación de diez años de denuncias sobre el 'hospitalcentrismo' del sistema.`,
    impactoSocial: [
      "Aplazamiento masivo de miles de cirugías menores y pruebas diagnósticas no urgentes.",
      "Incremento indirecto de la contratación de seguros de salud privados ante la incertidumbre.",
      "Deterioro de la relación médico-paciente por el aumento de la tensión en las salas de espera."
    ],
    impactoSistemico: [
      "Riesgo de colapso de las urgencias hospitalarias por el tapón generado en los centros de salud.",
      "Aceleración de la jubilación anticipada de miles de médicos que no aguantan la presión.",
      "Gasto extraordinario para el sistema derivado de la derivación de pacientes a la privada para cumplir plazos legales."
    ],
    consensoNarrativo: "Unanimidad total sobre que el sistema de Atención Primaria está roto, pero división total sobre si la culpa es de la mala gestión local o de la falta de financiación estatal.",
    factCheck: "La cifra de 5.000 vacantes MIR es una proyección sindical. El Ministerio cifra la necesidad estructural en 1.800 plazas inmediatas.",
    blindSpot: "Casi ningún medio analiza el impacto de la sanidad privada en el trasvase de profesionales especialistas desde lo público.",
    tags: ["Sanidad Pública", "MIR", "Atención Primaria", "Lista de Espera", "Presupuesto", "Salud Mental"],
    similarTopics: ["Servicios Sociales", "CCAA", "Huelga", "Gestión Pública"],
    perspectives: {
      left: { title: "Defensa del modelo universal frente a la privatización", sources: "elDiario.es, Público, El País" },
      right: { title: "Huelga instrumentalizada con fines políticos y electoralistas", sources: "ABC, El Mundo, La Razón" }
    },
    articles: [
      {
        source: "EL DIARIO", bias: "LEFT", fact: "ALTA", time: "Hace 1h", origin: "Nacional",
        type: "Reportaje", tone: "Activista", angle: "Social", author: "A. LÓPEZ",
        summary: "Historias desde la primera línea del colapso: médicos que se van llorando a casa ante la imposibilidad de atender bien.",
        whyOpened: "Relatos humanos de profesionales y pacientes afectados por los recortes.",
        diff: "Enfoque en la precariedad laboral.",
        readerContent: {
          whatHappened: "No es una huelga por dinero, es una huelga por tiempo. Esta es la frase que más se escucha en los piquetes informativos a las puertas de los centros de salud en este primer día de paro indefinido. EL DIARIO ha acompañado a la doctora Elena García, médico de familia con 20 años de experiencia, que hoy ha decidido colgar el fonendo en señal de protesta. 'Mi agenda hoy tenía 62 pacientes. Eso significa menos de tres minutos por persona si no voy al baño ni descanso. Así es imposible detectar un cáncer a tiempo o escuchar a alguien que está pasando por una depresión', confiesa entre lágrimas. La situación no es aislada; el 85% de los facultativos de su área han secundado el paro, dejando claro que el límite de la resistencia se ha sobrepasado.\n\nEl reportaje analiza cómo años de recortes y una derivación encubierta de fondos hacia la sanidad privada han dejado a la joya de la corona del estado del bienestar en los huesos. Casi el 30% de los médicos de familia actuales superan los 60 años y no hay jóvenes que quieran ocupar sus plazas. Las condiciones de temporalidad son tales que muchos prefieren irse a trabajar a Portugal o Francia, donde cobran el doble y atienden a la mitad de pacientes. Para muchos expertos consultados, estamos ante una estrategia deliberada de ciertos gobiernos regionales para degradar lo público hasta que el ciudadano medio no tenga más remedio que pagar un seguro privado. Este 'plan de desmantelamiento' es lo que ha unido a los médicos en una protesta que califican de histórica. Las concentraciones de hoy en la sede de las consejerías de salud han sido multitudinarias, con un mensaje claro: sin médicos de cabecera no hay sanidad pública, y sin tiempo para el paciente no hay medicina, solo hay burocracia del dolor.",
          interstitialNotes: [{ pos: 1, text: "Nota Informativa: España ha perdido 10.000 médicos de primaria en la última década." }],
          context: "Cataluña y Madrid son las comunidades con el gasto en primaria más bajo en relación a su PIB regional.",
          implications: { tenant: "Protección a largo plazo de un sistema que garantiza que los ingresos no determinen tu salud.", owner: "Los gestores públicos deberán reorientar el gasto de infraestructuras hacia personal sanitario." },
          preQuoteAnalysis: "Elena García, médico de familia, decide colgar el fonendo en señal de protesta. EL DIARIO analiza cómo años de recortes y una derivación encubierta de fondos hacia la sanidad privada han dejado a la joya de la corona del estado del bienestar en una situación de colapso técnico.",
          claims: [{ text: "\"O paramos nosotros o el sistema se nos cae encima.\"", source: "Plataforma de Médicos de Primaria" }],
          postQuoteAnalysis: "Este grito de auxilio resuena en cada centro de salud del país. TNE Intelligence subraya que el conflicto no es solo presupuestario, sino demográfico: la falta de relevo generacional inducida por la precariedad amenaza con vaciar de especialistas la próxima década asistencial.",
          blindSpot: "EL DIARIO no menciona el impacto de la rigidez de los convenios públicos que dificultan la flexibilidad de horarios deseada por los gestores."
        }
      },
      {
        source: "EL MUNDO", bias: "RIGHT", fact: "ALTA", time: "Hace 2h", origin: "Nacional", 
        type: "Análisis", tone: "Crítico", angle: "Gestión", author: "M. RUIZ",
        summary: "Investiga las conexiones políticas detrás del comité de huelga y el uso de los paros para desgastar gobiernos.",
        whyOpened: "Análisis de la organización de la huelga y sus perfiles directivos vinculados a partidos.",
        diff: "Enfatiza el cariz político de la protesta.",
        readerContent: {
          whatHappened: "La huelga blanca tiene una agenda roja. EL MUNDO ha analizado los perfiles de los principales convocantes del comité de huelga y ha detectado vínculos directos con partidos de la oposición en las regiones más beligerantes. Lo que se nos vende como una reivindicación técnica por la mejora de la sanidad es, en realidad, una campaña orquestada para desgastar a los gobiernos del centro-derecha a pocos meses de la cita electoral. Aunque es cierto que existen problemas de personal, estos son comunes a toda España y tienen su origen en la inacción del Ministerio de Sanidad central, que no ha sido capaz de ampliar las plazas de formación MIR necesarias en los últimos cinco años. Culpar a las autonomías de un problema de falta de materia prima es, sencillamente, faltar a la verdad contable.\n\nEl informe subraya que el gasto sanitario en las regiones en huelga ha crecido un 15% de media desde la pandemia, pero ese dinero se ha ido a cubrir agujeros estructurales y no a una gestión eficiente de los recursos. Los médicos en huelga están pidiendo imposibles técnicos, como los 10 minutos por paciente, sin proponer de dónde sacarán los profesionales para cubrir ese tiempo extra. La realidad en los centros de salud hoy ha sido de una actividad del 40%, afectando gravemente a los ciudadanos más vulnerables que no tienen un seguro privado y que ven sus revisiones de crónicos canceladas por una disputa ideológica. La huelga está siendo orquestada por sindicatos que han rechazado subidas salariales del 10% porque lo que buscan no es el bienestar del facultativo, sino el titular de prensa que hable de 'caos sanitario'. Es una irresponsabilidad jugar con la salud de los españoles para conseguir una ventaja parlamentaria, y los datos de seguimiento demuestran que muchos médicos no han querido sumarse a esta pantomima política.",
          interstitialNotes: [{ pos: 2, text: "Dato TNE: El Ministerio de Sanidad central controla el número de médicos que se forman cada año." }],
          context: "El gasto sanitario total en España nunca ha sido tan alto en términos absolutos como en 2024.",
          implications: { tenant: "Uso de la sanidad como principal campo de batalla electoral antes de cada protesta.", owner: "Riesgo de polarización extrema que impida pactos de estado por la salud en el futuro." },
          preQuoteAnalysis: "EL MUNDO ha analizado los perfiles de los principales convocantes y ha detectado vínculos directos con partidos de la oposición. Lo que se vende como reivindicación técnica es, según esta perspectiva, una campaña orquestada para desgastar a los gobiernos de centro-derecha.",
          claims: [{ text: "\"Es una huelga contra los ciudadanos orquestada desde los despachos políticos.\"", source: "Portavoz de Gobierno Regional" }],
          postQuoteAnalysis: "La acusación de instrumentalización política añade una capa de toxicidad a una negociación ya estancada. TNE observa que esta guerra de relatos bloquea cualquier posibilidad de pacto de estado por la sanidad, dejando al ciudadano como el único perdedor real en el fuego cruzado.",
          blindSpot: "EL MUNDO obvia las quejas recurrentes de las sociedades científicas médicas, que son apolíticas y respaldan los paros."
        }
      },
      {
        source: "EL PAÍS", bias: "CENTER", fact: "ALTA", time: "Hace 3h", origin: "Nacional", 
        type: "Noticia", tone: "Neutro", angle: "Institucional", author: "C. SEGURA",
        summary: "Análisis equilibrado de la falta de profesionales y la respuesta de las distintas administraciones.",
        whyOpened: "Visión técnica sobre el mercado laboral sanitario y la falta de especialistas.",
        diff: "Foco en el problema demográfico y formativo.",
        readerContent: {
          whatHappened: "España se enfrenta a una tormenta perfecta en su sistema de salud que la huelga indefinida iniciada hoy pone de manifiesto. El problema no es solo de dinero de inversión, sino de una planificación demográfica fallida que nadie quiso corregir a tiempo. Se calcula que el 25% de la plantilla actual de médicos se jubilará en los próximos cinco años, y el ritmo de formación de nuevos especialistas es insuficiente para cubrir ese hueco. Estamos ante una huelga global contra una realidad física: no hay bastantes manos para la demanda de salud de una población cada vez más envejecida. EL PAÍS ha consultado a expertos en gestión sanitaria que coinciden en que sin un Pacto de Estado que involucre a todas las fuerzas políticas y niveles de la administración, la huelga de hoy será solo el preludio de un colapso sistémico irremediable.\n\nLa sesión informativa del Ministerio de Sanidad de esta mañana ha intentado rebajar la tensión, prometiendo una revisión de los criterios de las plazas MIR para 2025, pero los sindicatos consideran que la medida llega con una década de retraso. Mientras tanto, las comunidades autónomas intentan apagar fuegos individuales con parches de contratación temporal que no solucionan la raíz del problema. La huelga hoy ha tenido un impacto desigual en el territorio nacional, siendo especialmente intensa en las grandes capitales pero con un seguimiento menor en las zonas rurales, donde la cobertura es ya tan precaria que los profesionales temen que sus pacientes se queden sin ningún tipo de atención. El análisis profundo de nuestro diario apunta a que la solución pasa por una reforma de la Ley de Cohesión y Calidad del Sistema Nacional de Salud para asegurar que un médico en Cuenca tenga los mismos recursos y carga de trabajo que uno en Madrid, algo que hoy por hoy es una quimera administrativa. El conflicto de hoy es, en el fondo, una lucha por la supervivencia de la equidad en el servicio público más valorado por los españoles.",
          interstitialNotes: [{ pos: 1, text: "Nota Técnica: Formar a un médico especialista en España tarda una media de 11 años." }],
          context: "El déficit estimado de médicos de familia en España asciende a 5.000 profesionales hoy mismo.",
          implications: { tenant: "Incertidumbre sobre la calidad asistencial futura si no se retiene el talento joven.", owner: "Necesidad de rediseñar las competencias de enfermería para descargar la consulta del médico." },
          preQuoteAnalysis: "Estamos ante una huelga global contra una realidad física: no hay bastantes manos para la demanda de una población cada vez más envejecida. EL PAÍS analiza la planificación demográfica fallida que nadie quiso corregir a tiempo.",
          claims: [{ text: "\"La sanidad pública no necesita parches, necesita un nuevo modelo de financiación.\"", source: "Colegio Oficial de Médicos" }],
          postQuoteAnalysis: "La necesidad de un nuevo modelo es un consenso técnico, pero una quimera política. TNE Intelligence destaca que, mientras no se aborde la financiación autonómica de forma integral, la sanidad seguirá operando en un estado de 'emergencia permanente' que desgasta a profesionales y pacientes.",
          blindSpot: "EL PAÍS evita señalar directamente a los responsables políticos del pasado que decidieron congelar la oferta pública de empleo."
        }
      },
      {
        source: "ABC", bias: "RIGHT", fact: "ALTA", time: "Hace 4h", origin: "Nacional", 
        type: "Noticia", tone: "Crítico", angle: "Inversión", author: "J. L. ÁLVAREZ",
        summary: "Resalta el papel de los servicios mínimos y las dificultades que provoca la huelga al ciudadano medio.",
        whyOpened: "Información sobre el caos en los transportes y hospitales por las concentraciones de facultativos.",
        diff: "Foco en las molestias al usuario.",
        readerContent: {
          whatHappened: "Paciente y rehén de la política. Así se sentían miles de españoles que hoy han acudido a su centro de salud solo para encontrar una nota que decía 'Huelga'. El derecho a la huelga de los médicos es legítimo, pero ABC ha constatado que los servicios mínimos están siendo boicoteados en algunos puntos o aplicados con una laxitud que pone en riesgo la salud de los más débiles. Personas mayores que llevaban seis meses esperando una cita para el cardiólogo han visto su esperanza truncada sin una fecha alternativa de reprogramación. La huelga indefinida es la herramienta más agresiva posible y el comité de huelga parece no importarle el daño colateral que infringe a la misma sociedad que dice defender.\n\nNuestra investigación destaca que el problema de la sanidad no es la falta de presupuesto, ya que este no ha dejado de subir de forma exponencial en los últimos ejercicios, sino el corporativismo de ciertos sectores médicos que se niegan a flexibilizar sus jornadas laborales para adaptarse a una sociedad que demanda servicios 24/7. Las administraciones autonómicas están haciendo esfuerzos ingentes para digitalizar las consultas y reducir la burocracia, pero la resistencia al cambio de las cúpulas sindicales es total. Mientras tanto, el sector privado está absorbiendo a miles de pacientes que, hartos del caos, deciden dedicar sus últimos ahorros a pagar un seguro para poder ser operados. La huelga blanca está consiguiendo exactamente lo contrario de lo que predica: está cavando la tumba de la sanidad pública al expulsar a la clase media del sistema por falta de confianza en su fiabilidad operativa.",
          interstitialNotes: [{ pos: 3, text: "Consejo TNE: Llama al servicio de teleasistencia de tu región antes de acudir al hospital." }],
          context: "El absentismo laboral en el sector sanitario público es tres veces superior al del sector privado.",
          implications: { tenant: "Perjuicio directo en el diagnóstico precoz de patologías crónicas.", owner: "Incremento de la litigiosidad contra la administración por demoras asistenciales." },
          preQuoteAnalysis: "ABC destaca que el problema de la sanidad no es la falta de presupuesto, sino el corporativismo de ciertos sectores que se niegan a flexibilizar sus jornadas laborales. El diario pone el foco en las molestias al usuario que ve reducida su asistencia por una disputa que consideran innecesaria.",
          claims: [{ text: "\"No se puede usar al paciente como escudo humano en una negociación salarial.\"", source: "Asociación de defensa del paciente" }],
          postQuoteAnalysis: "Esta visión del 'paciente como escudo' cala en amplios sectores de la población. TNE subraya que la erosión de la confianza en el sistema público está acelerando el trasvase de la clase media hacia aseguradoras privadas, redefiniendo el modelo social de salud de forma irreversible.",
          blindSpot: "ABC ignora que el porcentaje de médicos de primaria en huelga es el más alto de la historia, lo que indica un malestar real no solo sindical."
        }
      },
      {
        source: "REDACCIÓN MÉDICA", bias: "CENTER", fact: "ALTA", time: "Hace 5h", origin: "Profesional", 
        type: "Análisis", tone: "Técnico", angle: "Laboral", author: "E. SOTO",
        summary: "Análisis puramente profesional del pliego de condiciones de la huelga y la comparativa salarial europea.",
        whyOpened: "Detalles sobre las escalas salariales, los turnos y la carrera profesional en juego.",
        diff: "Es la fuente mas técnica y experta en el sector.",
        readerContent: {
          whatHappened: "Superadas las declaraciones políticas, el conflicto sanitario en España tiene una base estrictamente numérica y laboral que REDACCIÓN MÉDICA desgrana hoy. El comité de huelga ha puesto sobre la mesa un documento de 50 puntos que va mucho más allá de las agendas de 10 minutos. Se reclama una reestructuración total del sistema de guardias, la desaparición de las jornadas de 24 horas que consideran peligrosas para el paciente, y una subida del complemento de exclusividad para frenar el 'pluriempleo obligado' en la privada. España paga a sus médicos de familia una media de 55.000 euros brutos anuales, frente a los 110.000 de Francia o los 140.000 del Reino Unido, lo que genera un déficit de competitividad inasumible en un mercado de talento global.\n\nEl análisis técnico subraya que el sistema actual se sustenta sobre el sobreesfuerzo personal de los facultativos, quienes realizan una media de 500 horas extra anuales para cubrir las carencias del sistema. La huelga indefinida es la respuesta a la negativa de las administraciones de dotar de plazas estructurales a lo que hoy son figuras temporales (los llamados 'interinos de larga duración'). La propuesta de los médicos incluye la creación de una figura de gestión de demanda compartida con enfermería, algo que REDACCIÓN MÉDICA valora como la verdadera clave para desatascar las consultas, pero que choca con la normativa competencial vigente. En este primer día de paro, el seguimiento clínico ha sido total en los servicios de cirugía programada y parcial en oncología, donde se están respetando los tratamientos activos. La bolsa de especialistas de España está vacía, y no hay vuelta atrás: o se mejoran las condiciones de contratación hoy, o en 2030 el sistema nacional de salud será inviable por falta física de médicos especialistas titulados.",
          interstitialNotes: [{ pos: 1, text: "Nota Laboral: El 40% de los médicos de familia actuales están en situación de precariedad contractual." }],
          context: "España es el segundo país del mundo con mayor número de facultades de medicina por habitante, pero exporta el 20% de sus graduados.",
          implications: { tenant: "Posibilidad de una reforma radical de los tiempos de espera si se acepta el pliego de condiciones.", owner: "Necesidad de una dotación presupuestaria extra de 8.000 millones sólo para personal sanitario." },
          preQuoteAnalysis: "REDACCIÓN MÉDICA desgrana la base numérica y laboral del conflicto, señalando que España paga a sus médicos de familia muy por debajo de la media europea. El análisis técnico subraya que el sistema actual se sustenta sobre el sobreesfuerzo personal crónico de los facultativos.",
          claims: [{ text: "\"Hacer medicina de calidad requiere recursos de calidad.\"", source: "Comité de Huelga Estatal" }],
          postQuoteAnalysis: "La 'calidad' en medicina tiene un precio que el mercado de talento global ya está marcando. TNE Intelligence advierte que la fuga de especialistas hacia mercados más competitivos vaciará el sistema nacional de salud de su mayor activo en menos de un ciclo MIR si no hay cambios estructurales.",
          blindSpot: "REDACCIÓN MÉDICA evita entrar en la batalla de cifras de seguimiento que dan sindicatos y consejerías."
        }
      }
    ]
  },
  {
    id: 5,
    title: "Inversión millonaria: Gigante energético elige Puertollano para su hub de hidrógeno",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
    time: "hace 12 horas",
    location: "Puertollano, España",
    sourceCount: 22,
    bias: { left: 15, center: 70, right: 15 },
    factuality: "Very High",
    summary: "Se confirma un proyecto estratégico de 5.000 millones de euros que posicionará a España como el principal polo de exportación de hidrógeno verde hacia el norte de Europa.",
    fullContent: `El municipio de Puertollano ha sido oficialmente seleccionado como la sede del futuro 'Valle del Hidrógeno Verde de Castilla-La Mancha', un megaproyecto industrial liderado por un consorcio internacional de gigantes energéticos. La inversión, cifrada en 5.000 millones de euros, contempla la construcción de una planta de electrólisis alimentada íntegramente por energía solar y eólica generada en la propia región. Este hub no solo producirá combustible limpio para la industria pesada local, sino que se convertirá en el nodo principal de conexión con el futuro hidroducto H2Med, que unirá Barcelona con Marsella.\n\nEl impacto económico previsto es masivo: se estima la creación de 3.500 empleos directos e indirectos durante la fase de construcción y unos 800 puestos de alta cualificación técnica permanentes. El anuncio ha sido recibido con euforia en la región, que ve en el hidrógeno verde una oportunidad histórica para su reindustrialización tras el cierre de las minas y las centrales térmicas. Sin embargo, el proyecto no está exento de retos, principalmente la enorme demanda de agua dulce necesaria para el proceso de electrólisis y la incertidumbre sobre la rentabilidad real de esta tecnología a corto plazo sin las masivas subvenciones europeas comprometidas.`,
    perspectivasInfo: `La mayoría de medios económicos y corporativos celebran la noticia como el nacimiento de la 'Arabia Saudí de las renovables'. Destacan que España tiene una ventaja competitiva natural gracias a su número de horas de sol y su amplia red de infraestructuras, lo que permitiría producir hidrógeno a un coste mucho menor que en Alemania o Países Bajos. Ven en Puertollano el ejemplo perfecto de transición justa.\n\nEn cambio, colectivos ecologistas y algunos analistas de sostenibilidad se muestran más precavidos. Alertan de que producir hidrógeno verde requiere ingentes cantidades de agua en una zona que ya sufre estrés hídrico recurrente. Cuestionan si el beneficio industrial justifica el impacto en los recursos hídricos locales y si el H2Med es una infraestructura necesaria o un 'elefante blanco' que terminará infrautilizado si la demanda europea de hidrógeno no crece al ritmo esperado.`,
    cronologiaInfo: `2022 (Diciembre): Firma del acuerdo H2Med entre España, Francia y Portugal durante la cumbre de Alicante.\n\n2023 (Junio): Puertollano entra en la lista corta de ubicaciones candidatas por su tradición industrial y conexión ferroviaria.\n\n2023 (Noviembre): Aprobación de la declaración de impacto ambiental simplificada por parte de la Junta de Castilla-La Mancha.\n\n2024 (Febrero): Selección definitiva del consorcio ejecutor y confirmación de los 5.000 millones de inversión pública y privada.\n\n2024 (Hoy): Acto oficial de colocación de la primera piedra con presencia de autoridades europeas y nacionales.`,
    desglose: [
      "Planta de electrólisis de 500 MW de potencia inicial, ampliable a 1 GW.",
      "Consumo anual de agua estimado en 2.5 millones de metros cúbicos equilibrado con plantas de tratamiento.",
      "Conexión directa con la red troncal de hidroductos de la Unión Europea (H2Med).",
      "Reducción prevista de 4 millones de toneladas de CO2 al año en la industria pesada."
    ],
    contexto: `España es actualmente el país europeo con mayor número de proyectos de hidrógeno verde en desarrollo. La 'Estrategia Nacional del Hidrógeno' busca convertir al país en un exportador neto de energía por primera vez en su historia moderna, rompiendo la dependencia del gas argelino y ruso. Puertollano, con su refinería y su pasado minero, ofrece el capital humano ideal para esta transición tecnológica.`,
    impactoSocial: [
      "Revitalización económica de una comarca afectada por la desindustrialización histórica.",
      "Atracción de talento joven de ingeniería y biotecnología a zonas rurales de Castilla-La Mancha.",
      "Mejora de las infraestructuras ferroviarias y logísticas de la zona de Puertollano."
    ],
    impactoSistemico: [
      "Posicionamiento de España como líder tecnológico en la fabricación de electrolizadores.",
      "Garantía de suministro de energía limpia para el sector del transporte pesado y la aviación en la UE.",
      "Desafío logístico y medioambiental de gestionar grandes volúmenes de agua en el interior peninsular."
    ],
    consensoNarrativo: "Existe un apoyo político casi unánime al proyecto por su carácter estratégico, pero la viabilidad técnica a largo plazo y el impacto hídrico son los dos grandes 'puntos ciegos' del debate actual.",
    factCheck: "Los 3.000M€ del PERTE están aprobados pero solo el 20% ha sido adjudicado a proyectos finales. El H2Med no transportará hidrógeno puro inicialmente.",
    blindSpot: "Se ignora el impacto hídrico masivo: se necesitan 9 litros de agua pura por cada kilo de hidrógeno verde producido.",
    tags: ["Hidrógeno Verde", "PERTE", "H2Med", "Descarbonización", "Soberanía Energética", "Renovables"],
    similarTopics: ["Energía", "Sostenibilidad", "Industria", "Fondos NextGen"],
    perspectives: {
      left: { title: "Liderazgo en transición energética y justicia social", sources: "elDiario.es, El País, Cinco Días" },
      right: { title: "Dudas sobre rentabilidad y dependencia de subsidios", sources: "Libre Mercado, Expansión, El Mundo" }
    },
    articles: [
      {
        source: "CINCO DÍAS", bias: "CENTER", fact: "ALTA", time: "Hace 10h", origin: "Nacional",
        type: "Análisis", tone: "Optimista", angle: "Económico", author: "S. RUIZ",
        summary: "Desglose financiero del proyecto y análisis de la ventaja competitiva de España en el mercado del H2.",
        whyOpened: "Información sobre el retorno de inversión y el papel estratégico de Puertollano.",
        diff: "Foco en la rentabilidad corporativa.",
        readerContent: {
          whatHappened: "El anuncio de los 5.000 millones para Puertollano no es solo una cifra, es el pistoletazo de salida para una nueva era industrial en España. CINCO DÍAS ha analizado el plan de negocio del consorcio energético y los números son claros: España puede producir hidrógeno verde a menos de 2 euros el kilo, mientras que el coste en el centro de Europa supera los 5 euros debido a la falta de recurso solar. Esta brecha de precios es lo que ha atraído al gigante energético para elegir Ciudad Real por delante de Rotterdam o Hamburgo. La planta de Puertollano será el pulmón que alimente no solo a la refinería local, sino a una red de hidroductos que convertirá a la península en el enchufe de Europa.\n\nDesde el punto de vista financiero, el proyecto se sustenta sobre un modelo de colaboración público-privada sin precedentes. Un 30% del capital proviene de los fondos Next Generation EU, lo que ha permitido mitigar el riesgo de los inversores privados en una tecnología que aún está en fase de maduración. El análisis destaca que la reindustrialización de Puertollano atraerá a empresas satélite de fabricación de componentes químicos y logística especializada, creando un 'clúster' que podría aportar hasta un 1,5% extra al PIB de Castilla-La Mancha en la próxima década. La clave del éxito, según los expertos consultados, será la estabilidad regulatoria. Los inversores exigen que no haya cambios en las reglas del juego del mercado eléctrico para asegurar que el coste de la energía que alimenta los electrolizadores se mantenga en los niveles ultra-bajos previstos. España tiene hoy la oportunidad de dejar de ser un importador de tecnología para ser quien controle la cadena de valor de la energía del futuro. Puertollano es la prueba de que la transición energética puede ser rentable si se aprovecharan las ventajas geográficas únicas de nuestro país.",
          interstitialNotes: [{ pos: 1, text: "Nota Informativa: El hidrógeno verde es el único combustible capaz de descarbonizar la siderurgia." }],
          context: "Con la 'excepción ibérica', España ha demostrado tener los precios eléctricos industriales más competitivos de la UE.",
          implications: { tenant: "Aparición de nuevos nichos de empleo de alta cualificación en la región.", owner: "Revalorización de los activos industriales y logísticos en todo el corredor sur." },
          preQuoteAnalysis: "La clave del éxito, según los expertos consultados, será la estabilidad regulatoria. CINCO DÍAS analiza el flujo de inversión extranjera que ve en la Península Ibérica el 'hub' energético ideal para la descarbonización de la industria pesada centroeuropea.",
          claims: [{ text: "\"Nace el nuevo petróleo español, pero esta vez es inagotable y limpio.\"", source: "CEO del Gigante Energético" }],
          postQuoteAnalysis: "Esta visión optimista del 'nuevo petróleo' sitúa a España en una posición de liderazgo fáctico. TNE Intelligence destaca que, a diferencia de los ciclos energéticos anteriores, esta vez el país controla no solo el recurso (sol/viento) sino gran parte de la cadena de valor tecnológica de los electrolizadores.",
          blindSpot: "CINCO DÍAS omite el debate sobre el coste de oportunidad de destinar tantos fondos públicos a una sola tecnología energética."
        }
      },
      {
        source: "EL MUNDO", bias: "RIGHT", fact: "ALTA", time: "Hace 11h", origin: "Nacional",
        type: "Reportaje", tone: "Crítico", angle: "Sostenibilidad", author: "L. RAMOS",
        summary: "Investiga las dudas sobre el consumo de agua y la fragilidad del modelo de subvenciones europeas.",
        whyOpened: "Perspectiva sobre el impacto ambiental real y la viabilidad fiscal del proyecto.",
        diff: "Foco en el riesgo hídrico y financiero.",
        readerContent: {
          whatHappened: "Detrás del brillo de los 5.000 millones de euros, Puertollano esconde una realidad hídrica preocupante que el marketing político ha preferido ignorar. Producir hidrógeno verde requiere un proceso de electrólisis donde por cada kilo de H2 generado se consumen aproximadamente 9 litros de agua pura. Multipliquen eso por las toneladas previstas en el proyecto y el resultado es una demanda de agua que el río Guadalmez no podrá soportar en años de sequía. EL MUNDO ha hablado con técnicos de la Confederación Hidrográfica del Guadiana que advierten de que o se construye una infraestructura de desalinización y transporte desde la costa, lo que encarecería el proyecto brutalmente, o Puertollano estará robando agua a los regantes y al consumo humano en la próxima gran sequía.\n\nAdemás del reto ambiental, nuestro diario pone el foco en el 'dopaje' financiero. El proyecto es viable hoy porque Europa está regalando el dinero a través de los fondos de recuperación, pero ¿qué pasará en 2030 cuando las ayudas se agoten y el hidrógeno deba competir en un mercado libre con el gas natural o el hidrógeno azul? Analistas internacionales ya advierten de una posible 'burbuja del hidrógeno' similar a la de las renovables de 2008 en España. Si la demanda alemana no se materializa por el hidroducto H2Med, Puertollano podría terminar siendo un cementerio de hormigón y placas solares muy caro. El Gobierno regional dice que el agua está garantizada mediante plantas de tratamiento de agua residuales, pero la escala del proyecto es tan inmensa que esas soluciones parecen insuficientes según los colectivos ecologistas. Es un salto al vacío con el dinero del contribuyente y el agua de una región seca.",
          interstitialNotes: [{ pos: 2, text: "Dato TNE: Ciudad Real ha pasado por tres periodos de sequía severa en los últimos cinco años." }],
          context: "La tecnología de electrólisis con agua salada o residual está aún en fase experimental a gran escala.",
          implications: { tenant: "Riesgo de restricciones de agua para los hogares en periodos críticos.", owner: "Posible paralización judicial del proyecto por parte de organizaciones ecologistas." },
          preQuoteAnalysis: "Además del reto ambiental, nuestro diario pone el foco en el 'dopaje' financiero que suponen las ayudas públicas. EL MUNDO investiga la vulnerabilidad de estos proyectos ante un posible cambio de prioridades en Bruselas o una sequía persistente que eleve los costes operativos.",
          claims: [{ text: "\"No podemos convertir el agua de beber en combustible para exportar a Alemania.\"", source: "Portavoz de Ecologistas en Acción" }],
          postQuoteAnalysis: "La disyuntiva entre 'agua o energía' será el gran conflicto social de la década. TNE observa que la falta de infraestructuras de desalinización en el interior peninsular es el talón de Aquiles de un plan que, de no corregirse, podría enfrentar una resistencia ciudadana masiva en zonas con estrés hídrico.",
          blindSpot: "EL MUNDO ignora que la planta prevé sistemas de circuito cerrado que reciclan el 80% del agua utilizada."
        }
      },
      {
        source: "EL PAÍS", bias: "CENTER", fact: "ALTA", time: "Hace 12h", origin: "Nacional",
        type: "Noticia", tone: "Neutro", angle: "Internacional", author: "C. PÉREZ",
        summary: "Contextualiza el proyecto de Puertollano dentro de la geopolítica energética europea y la independencia de Rusia.",
        whyOpened: "Visión global sobre por qué este proyecto es vital para la seguridad de la Unión Europea.",
        diff: "Enfoque en la autonomía estratégica de la UE.",
        readerContent: {
          whatHappened: "Puertollano se ha convertido hoy en una pieza clave del tablero de ajedrez geopolítico europeo. En un momento en que Bruselas busca desesperadamente cortar amarras con el gas ruso y argelino, el hidrógeno español aparece como la gran esperanza blanca de la autonomía estratégica. El megaproyecto confirmado hoy no solo generará energía limpia, sino que asegurará que el corazón industrial de Europa, desde Lyon hasta Berlín, no dependa de regímenes autoritarios para mantener sus fábricas funcionando. EL PAÍS ha accedido a informes del Consejo Europeo que señalan a España como el 'corredor verde' necesario para que la UE cumpla sus objetivos de emisión cero en 2050 sin perder competitividad industrial.\n\nEl reportaje explora cómo la infraestructura H2Med transformará la posición de España en el continente: de ser una isla energética a ser el puerto de entrada de los flujos renovables. El presidente autonómico y los ministros presentes en el acto han destacado que Puertollano es un ejemplo de 'patriotismo energético'. La inversión de 5.000 millones servirá también para posicionar a las ingenierías españolas a la vanguardia mundial, exportando el conocimiento adquirido en la electrólisis a otros mercados como América Latina. No obstante, el diario también recoge las voces diplomáticas francesas que, aunque apoyan el proyecto, exigen que el hidroducto sea bidireccional, lo que añade una capa de complejidad técnica a la inversión. En definitiva, Puertollano no es solo una planta química, es una declaración de soberanía europea frente a la energía fósil importada. El éxito de este hub determinará si la Unión Europea es capaz de liderar la revolución industrial verde o si quedará rezagada frente al empuje de China y Estados Unidos.",
          interstitialNotes: [{ pos: 1, text: "Nota Geopolítica: La UE prevé consumir 20 millones de toneladas de H2 verde para 2030." }],
          context: "El proyecto H2Med cuenta con la declaración de Interés Comunitario (IPCEI) de la Comisión Europea.",
          implications: { tenant: "Mayor estabilidad de precios energéticos a largo plazo para el ciudadano europeo.", owner: "Acceso a financiación preferente del Banco Europeo de Inversiones (BEI)." },
          preQuoteAnalysis: "EL PAÍS explora cómo la infraestructura H2Med transformará la posición de España en el continente: de ser una isla energética a ser el puerto de entrada de los flujos renovables. El análisis geopolítico sitúa a Puertollano como un ejemplo de patriotismo energético europeo.",
          claims: [{ text: "\"España es el motor que moverá la industria limpia de todo el continente.\"", source: "Comisario de Energía de la UE" }],
          postQuoteAnalysis: "Ser el 'motor' de Europa implica una responsabilidad estratégica que trasciende lo económico. TNE Intelligence subraya que este proyecto es el primer paso real hacia la autonomía energética de la Unión, rompiendo décadas de dependencia de regímenes autoritarios mediante tecnología propia.",
          blindSpot: "EL PAÍS pasa de puntillas sobre los sobrecostes que ya acumula la fase inicial del hidroducto H2Med."
        }
      },
      {
        source: "EXPANSIÓN", bias: "RIGHT", fact: "ALTA", time: "Hace 13h", origin: "Nacional",
        type: "Análisis", tone: "Técnico", angle: "Inversión", author: "F. JAVIER",
        summary: "Analiza el riesgo tecnológico y el mercado de capitales asociado a las energías renovables de segunda generación.",
        whyOpened: "Visión experta sobre si el mercado de valores está sobrevalorando el potencial del hidrógeno.",
        diff: "Foco en el mercado de capitales y tecnología.",
        readerContent: {
          whatHappened: "Inversión millonaria o espejismo tecnológico? EXPANSIÓN arroja un cubo de agua fría sobre el entusiasmo oficial de Puertollano. Aunque los 5.000 millones suenan impresionantes, el mercado de capitales sigue mirando al hidrógeno con extrema cautela. La razón es la eficiencia energética: hoy por hoy, se pierde casi un 30% de la energía en el proceso de creación y transporte del hidrógeno verde. Esto significa que para que el proyecto sea rentable, el coste de la electricidad solar debe ser prácticamente cero durante gran parte del día. El análisis técnico subraya que el consorcio ejecutor está asumiendo una apuesta de alto riesgo, confiando en que la tecnología de los electrolizadores baje de precio tan rápido como lo hicieron las placas solares en la década pasada.\n\nEl reportaje también investiga el impacto en el IBEX 35 de las empresas involucradas. Aunque el anuncio ha sido bien recibido por los analistas, se advierte de que el retorno de la inversión (ROI) no llegará antes de 15 años. Esto expone a las compañías a riesgos regulatorios y cambios en los ciclos políticos tanto en España como en Europa. Además, existe la amenaza de que Estados Unidos, con su programa de incentivos masivos (IRA), atraiga parte de esta inversión hacia proyectos similares en Texas, donde los subsidios son directos al kilo producido y no a la construcción de la planta. EXPANSIÓN concluye que Puertollano es un proyecto 'imprescindible' pero cuya ejecución financiera debe ser vigilada con lupa para evitar que se convierta en otro pozo sin fondo de déficit tarifario encubierto. No basta con poner el dinero; hay que asegurar que exista una demanda real de empresas industriales dispuestas a pagar el premium que hoy cuesta el hidrógeno limpio frente a las alternativas tradicionales.",
          interstitialNotes: [{ pos: 3, text: "Nota Financiera: Las acciones del consorcio han subido un 2% tras el anuncio oficial." }],
          context: "Estados Unidos ofrece hasta 3 dólares de subsidio por cada kilo de hidrógeno producido bajo el plan IRA.",
          implications: { tenant: "Riesgo de burbuja si la tecnología no madura lo suficientemente rápido.", owner: "Alta volatilidad en las carteras de inversión vinculadas a la energía limpia." },
          preQuoteAnalysis: "El reportaje también investiga el impacto en el IBEX 35 de las empresas involucradas. EXPANSIÓN advierte sobre la volatilidad de estas inversiones, que dependen de que la tecnología de los electrolizadores baje de precio tan rápido como lo hicieran las placas solares en la década pasada.",
          claims: [{ text: "\"El hidrógeno es el futuro, pero el presente aún tiene que cuadrar los balances.\"", source: "Analista Senior de Morgan Stanley" }],
          postQuoteAnalysis: "Los 'balances' mandan en el mercado de capitales, y el hidrógeno verde aún opera en números rojos operativos. TNE subraya que el éxito de Puertollano dependerá de que el precio del CO2 siga subiendo lo suficiente como para que el hidrógeno limpio sea la única alternativa lógica para la gran industria.",
          blindSpot: "EXPANSIÓN no valora los beneficios indirectos de reducción de multas por emisiones de CO2 para las empresas participantes."
        }
      },
      {
        source: "LANZA DIARIO DE LA MANCHA", bias: "CENTER", fact: "ALTA", time: "Hace 14h", origin: "Regional",
        type: "Reportaje", tone: "Esperanzador", angle: "Local", author: "P. RIVAS",
        summary: "El sentir de las calles de Puertollano: del carbón al hidrógeno, una ciudad que se niega a morir.",
        whyOpened: "Relatos de los habitantes y comerciantes de Puertollano ante la nueva inversión.",
        diff: "Es la fuente con el sentimiento local más auténtico.",
        readerContent: {
          whatHappened: "Puertollano vuelve a sonreír. Para una ciudad que ha vivido con el estigma de ser el centro de la contaminación industrial y que sufrió como pocas el fin de la minería, el anuncio de hoy se vive como un segundo renacimiento. LANZA ha recorrido los barrios de las 'Seiscientas' y del centro, donde los vecinos ya hablan de los 3.500 empleos como del Gordo de Navidad. 'Mis hijos se tuvieron que ir a trabajar a Madrid por falta de futuro, y ahora espero que con esta planta puedan volver a casa', cuenta María, dueña de un comercio local que ha visto cómo la población de la ciudad bajaba año tras año. La sensación es de alivio pero también de exigencia: Puertollano no quiere volver a ser solo una chimenea, quiere que esta vez la riqueza se quede en los colegios y en los parques del pueblo.\n\nEl reportaje regional destaca cómo la formación profesional de la zona se está adaptando a marchas forzadas. El instituto local ya ha abierto un módulo de especialización en hidrógeno verde y las plazas se han agotado en horas. Hay un optimismo cauteloso; los más viejos recuerdan las promesas incumplidas de otras crisis, pero la escala de esta inversión, respaldada por Europa, parece distinta. Los hosteleros ya nota el impacto con la llegada de los primeros técnicos de ingeniería que están realizando los estudios de suelo. Puertollano, que un día fue el centro del carbón que movía los trenes de España, se prepara ahora para ser el centro del hidrógeno que mueva los camiones de media Europa. Es una cuestión de orgullo manchego: demostrar que en mitad de la llanura puede nacer la tecnología más avanzada del mundo. Hoy, en los bares de Puertollano, se brinda por el futuro, con la esperanza de que esta vez el humo sea solo vapor de agua.",
          interstitialNotes: [{ pos: 1, text: "Dato Regional: Puertollano tiene una de las tasas de desempleo juvenil más altas de la región." }],
          context: "La ciudad ya cuenta con una cátedra de hidrógeno en colaboración con la Universidad de Castilla-La Mancha.",
          implications: { tenant: "Frenazo a la despoblación y recuperación del pulso comercial en la ciudad.", owner: "Incremento del 20% en el precio del alquiler y compra de vivienda en la zona." },
          preQuoteAnalysis: "El reportaje regional destaca cómo el instituto local ya ha abierto un módulo de especialización en hidrógeno verde para retener el talento joven. LANZA detalla el sentimiento de una ciudad que, tras años de declive minero, ve en estas chimeneas de vapor su billete de vuelta a la prosperidad.",
          claims: [{ text: "\"Por fin dejamos de mirar al suelo para buscar carbón y miramos al sol para buscar riqueza.\"", source: "Alcalde de Puertollano" }],
          postQuoteAnalysis: "Mirar al sol es, literalmente, buscar una nueva identidad colectiva. TNE Intelligence observa que el éxito social del proyecto dependerá de que Puertollano no sea solo un lugar de paso para técnicos externos, sino el epicentro de un nuevo tejido industrial que beneficie directamente al comercio de base.",
          blindSpot: "LANZA no profundiza en el riesgo de que la planta sea una 'isla tecnológica' con poco impacto real en el tejido comercial de base."
        }
      }
    ]
  }

];
