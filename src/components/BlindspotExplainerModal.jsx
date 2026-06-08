import React, { useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';

const Bullet = () => (
  <div style={{ width: '8px', height: '8px', background: 'black', marginRight: '16px', flexShrink: 0, marginTop: '5px' }} />
);

const Divider = () => (
  <div style={{ borderTop: '1px solid black', margin: '0' }} />
);

const TABS = ['CÓMO FUNCIONA', 'LOS DOS LADOS', 'CÓMO LEERLO', 'PREGUNTAS'];

const BlindspotExplainerModal = ({ onClose }) => {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    // Tab 0: CÓMO FUNCIONA
    {
      content: (
        <>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
            TNE BLINDSPOT / GUÍA COMPLETA
          </div>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: 800, letterSpacing: isMobile ? '-1.4px' : '-2.5px', marginBottom: '8px', lineHeight: '0.95', paddingRight: isMobile ? '28px' : '40px' }}>
            Cómo funciona el Blindspot.
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.55, marginBottom: '28px', marginTop: '12px' }}>
            Un sistema para detectar qué historias están siendo silenciadas o ignoradas por un lado del espectro político. Basado en datos reales de cobertura de más de 80 medios españoles.
          </p>
          <Divider />
          {[
            {
              label: 'PASO 01',
              title: 'Recogemos la cobertura real.',
              description: 'Cada día ingerimos artículos de más de 80 medios españoles e internacionales. Cada fuente tiene asignado un sesgo político verificado: izquierda, centro-izquierda, centro, centro-derecha o derecha.',
            },
            {
              label: 'PASO 02',
              title: 'Agrupamos historias relacionadas.',
              description: 'Mediante inteligencia artificial, identificamos qué artículos tratan el mismo evento o tema. Así podemos comparar cómo cubre cada lado una misma noticia con datos objetivos.',
            },
            {
              label: 'PASO 03',
              title: 'Calculamos el desequilibrio.',
              description: 'Para cada historia, calculamos qué porcentaje de la cobertura proviene de medios de izquierda, centro y derecha. Si un lado supera el 20% de diferencia respecto al otro, la marcamos como blindspot.',
            },
            {
              label: 'PASO 04',
              title: 'Clasificamos el tipo de blindspot.',
              description: '"For the Left" significa que la izquierda cubre poco esa historia (la derecha la destaca). "For the Right" es al revés. Ambos tipos son igualmente importantes: revelan qué evita cada burbuja.',
            },
            {
              label: 'PASO 05',
              title: 'Actualizamos en tiempo real.',
              description: 'El feed se refresca continuamente. Los blindspots más recientes y con mayor desequilibrio aparecen primero, para que siempre veas lo más relevante del momento.',
            },
          ].map((step, i) => (
            <div key={i} style={{ padding: isMobile ? '20px 0' : '24px 0', borderBottom: '1px solid black', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
              <Bullet />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px' }}>{step.label}</div>
                <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 800, letterSpacing: '-0.4px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', lineHeight: 1.65, opacity: 0.62 }}>{step.description}</div>
              </div>
            </div>
          ))}
        </>
      ),
    },

    // Tab 1: LOS DOS LADOS
    {
      content: (
        <>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
            TNE BLINDSPOT / LOS DOS LADOS
          </div>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: 800, letterSpacing: isMobile ? '-1.4px' : '-2.5px', marginBottom: '8px', lineHeight: '0.95', paddingRight: isMobile ? '28px' : '40px' }}>
            For the Left y For the Right.
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.55, marginBottom: '28px', marginTop: '12px' }}>
            Dos columnas paralelas que muestran las historias que cada lado del espectro tiende a no cubrir. No es sobre quién tiene razón, sino sobre qué está viendo cada burbuja.
          </p>
          <Divider />
          {[
            {
              label: 'FOR THE LEFT',
              title: 'Lo que la izquierda cubre poco.',
              description: 'Historias donde los medios de derecha tienen mucha más presencia. Si lees principalmente El Mundo, ABC o La Razón, estas son noticias que ya conoces. Si lees El País, elDiario o La Sexta, son las que probablemente te estás perdiendo.',
              example: 'Ej: Una noticia sobre gestión económica de un gobierno de izquierda que la derecha enfatiza pero la izquierda minimiza.',
            },
            {
              label: 'FOR THE RIGHT',
              title: 'Lo que la derecha cubre poco.',
              description: 'Historias donde los medios de izquierda tienen mucha más presencia. Si lees principalmente El País o elDiario, estas ya las conoces. Si lees ABC o El Mundo, son las que tu burbuja tiende a ignorar.',
              example: 'Ej: Una investigación de corrupción que los medios progresistas cubren ampliamente pero los conservadores apenas mencionan.',
            },
            {
              label: 'POR QUÉ AMBOS LADOS',
              title: 'Nadie tiene el monopolio de la verdad.',
              description: 'La herramienta no toma partido. Muestra el desequilibrio en ambas direcciones con el mismo rigor. La premisa es simple: una ciudadanía mejor informada necesita conocer qué está evitando su propio ecosistema informativo.',
              example: 'Ej: Dos temas distintos en el mismo día pueden ser blindspot para lados opuestos.',
            },
          ].map((item, i) => (
            <div key={i} style={{ padding: isMobile ? '20px 0' : '26px 0', borderBottom: '1px solid black', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
              <Bullet />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px' }}>{item.label}</div>
                <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 800, letterSpacing: '-0.4px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', lineHeight: 1.65, opacity: 0.62, marginBottom: '8px' }}>{item.description}</div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', opacity: 0.45, lineHeight: 1.5, borderLeft: '2px solid black', paddingLeft: '10px' }}>{item.example}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: isMobile ? '16px' : '22px', border: '1px solid black', marginTop: '28px', position: 'relative' }}>
            <div style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, marginBottom: '10px', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>NOTA IMPORTANTE</div>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.65, opacity: 0.7 }}>
              Un blindspot no significa que la noticia sea falsa ni que el medio que no la cubre esté mintiendo. Significa que ese ángulo de la realidad no encaja con la narrativa que ese espectro prefiere enfatizar.
            </p>
            <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', width: '100%', height: '100%', background: 'rgba(0,0,0,0.05)', zIndex: -1 }} />
          </div>
        </>
      ),
    },

    // Tab 2: CÓMO LEERLO
    {
      content: (
        <>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
            TNE BLINDSPOT / METODOLOGÍA DE LECTURA
          </div>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: 800, letterSpacing: isMobile ? '-1.4px' : '-2.5px', marginBottom: '8px', lineHeight: '0.95', paddingRight: isMobile ? '28px' : '40px' }}>
            Cómo leer un blindspot bien.
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.55, marginBottom: '28px', marginTop: '12px' }}>
            No basta con ver el dato. La lectura crítica de un blindspot requiere un proceso específico para extraer el valor real de la información.
          </p>
          <Divider />
          {[
            {
              label: 'PRIMER PASO',
              title: 'Identifica tu posición.',
              description: 'Antes de leer, pregúntate: ¿qué medios consumo habitualmente? Si estás en la columna contraria a tu sesgo habitual, estás en el territorio del blindspot. Ese es el primer ejercicio de conciencia.',
            },
            {
              label: 'SEGUNDO PASO',
              title: 'Lee el titular sin reaccionar.',
              description: 'Los blindspots suelen activar resistencia emocional. Si el titular te genera rechazo inmediato, eso es precisamente la señal de que estás ante información que tu burbuja ha filtrado. Respira y sigue leyendo.',
            },
            {
              label: 'TERCER PASO',
              title: 'Mira la distribución de cobertura.',
              description: 'Cada tarjeta muestra las barras de izquierda, centro y derecha. Analiza no solo qué tan desequilibrada está la historia, sino qué tipo de medios están cubriendo cada ángulo.',
            },
            {
              label: 'CUARTO PASO',
              title: 'Busca el ángulo que falta.',
              description: 'Abre la historia completa y lee el blind spot sintetizado por nuestra IA. Ese análisis intenta articular exactamente qué perspectiva está ausente y por qué podría ser relevante.',
            },
            {
              label: 'QUINTO PASO',
              title: 'Contrasta con tu fuente habitual.',
              description: 'Si tienes suscripción, busca la misma historia en un medio de tu lado. Comparar cómo la encuadra cada espectro es el ejercicio más valioso de todo el proceso.',
            },
          ].map((step, i) => (
            <div key={i} style={{ padding: isMobile ? '20px 0' : '24px 0', borderBottom: '1px solid black', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
              <Bullet />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px' }}>{step.label}</div>
                <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 800, letterSpacing: '-0.4px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', lineHeight: 1.65, opacity: 0.62 }}>{step.description}</div>
              </div>
            </div>
          ))}
        </>
      ),
    },

    // Tab 3: PREGUNTAS
    {
      content: (
        <>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '3px', marginBottom: '16px' }}>
            TNE BLINDSPOT / FAQ
          </div>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: 800, letterSpacing: isMobile ? '-1.4px' : '-2.5px', marginBottom: '8px', lineHeight: '0.95', paddingRight: isMobile ? '28px' : '40px' }}>
            Preguntas frecuentes.
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.55, marginBottom: '28px', marginTop: '12px' }}>
            Todo lo que necesitas saber sobre cómo funciona el sistema de detección de blindspots.
          </p>
          <Divider />
          {[
            {
              q: '¿Es TNE un medio de izquierda o de derecha?',
              a: 'Ni uno ni otro. TNE no produce contenido editorial propio sobre noticias. Somos una plataforma de análisis de cobertura. Mostramos lo que dicen otros medios y cuánto espacio le dedica cada espectro. No tomamos partido.',
            },
            {
              q: '¿Cómo asignáis el sesgo a cada medio?',
              a: 'Usamos una combinación de estudios académicos sobre medios españoles, informes de organismos independientes como el Reuters Institute y análisis propios de línea editorial histórica. El sesgo no es una opinión nuestra, es una caracterización basada en evidencia documentada.',
            },
            {
              q: '¿Por qué aparece una historia como blindspot si mi medio sí la ha cubierto?',
              a: 'El blindspot se calcula sobre el conjunto de medios monitorizados, no sobre medios individuales. Tu medio puede haber cubierto la historia, pero si en general los medios de su espectro la han ignorado, sigue siendo un blindspot estadístico.',
            },
            {
              q: '¿Con qué frecuencia se actualiza el feed?',
              a: 'El sistema ingiere artículos cada 15 minutos desde más de 80 fuentes. Los nuevos blindspots aparecen en el feed una vez que hemos procesado suficientes artículos del mismo evento para calcular el desequilibrio con fiabilidad.',
            },
            {
              q: '¿Puede haber errores en la clasificación?',
              a: 'Sí. Ningún sistema automático es perfecto. Hay historias cuyo sesgo es ambiguo o cuya cobertura no encaja en categorías nítidas. Trabajamos continuamente para mejorar la precisión, pero invitamos al lector a ejercer siempre su propio juicio crítico.',
            },
            {
              q: '¿Cómo puedo reportar un blindspot mal clasificado?',
              a: 'Dentro de cada tarjeta de historia puedes usar el botón de feedback. Revisamos todos los reportes manualmente y los usamos para mejorar el algoritmo.',
            },
          ].map((item, i) => (
            <div key={i} style={{ padding: isMobile ? '18px 0' : '22px 0', borderBottom: '1px solid black', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
              <Bullet />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.3 }}>{item.q}</div>
                <div style={{ fontSize: '13px', lineHeight: 1.65, opacity: 0.62 }}>{item.a}</div>
              </div>
            </div>
          ))}
        </>
      ),
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
        padding: isMobile ? '16px' : '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          width: '100%',
          maxWidth: isMobile ? '100%' : '680px',
          maxHeight: 'min(92vh, 900px)',
          borderRadius: '0',
          border: '2px solid black',
          boxShadow: isMobile ? '8px 8px 0 rgba(0,0,0,1)' : '12px 12px 0 rgba(0,0,0,1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: isMobile ? '10px' : '20px',
            right: isMobile ? '10px' : '20px',
            background: 'none',
            border: 'none',
            fontSize: isMobile ? '20px' : '24px',
            cursor: 'pointer',
            padding: '8px',
            fontWeight: 800,
            zIndex: 10,
          }}
        >
          X
        </button>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid black',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: isMobile ? '14px 14px' : '16px 20px',
                border: 'none',
                borderRight: '1px solid black',
                background: activeTab === i ? 'black' : 'white',
                color: activeTab === i ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ padding: isMobile ? '24px' : '40px', overflowY: 'auto', flex: 1 }}>
          {tabs[activeTab].content}

          {/* Footer decorators */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', opacity: 0.2 }}>
            <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
            <div style={{ border: '1px solid black', width: '20px', height: '20px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlindspotExplainerModal;
