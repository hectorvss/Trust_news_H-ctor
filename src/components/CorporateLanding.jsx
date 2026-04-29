import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Plus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2 }}>
    <path d="M12 5V19M5 12H19" strokeLinecap="square"/>
  </svg>
);

const CorporateLanding = ({ type, onBack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionId = searchParams.get('section');

  const companySections = [
    { 
      id: 'sobre-nosotros', 
      title: 'Sobre Nosotros', 
      subtitle: 'IDENTIDAD Y VALORES', 
      blocks: [
        {
          title: 'Periodismo sin filtros.',
          content: 'TNE (Trust News España) surgió como respuesta directa a la creciente fragmentación de la verdad en el espacio digital español. No somos un medio tradicional; somos un agregador de inteligencia diseñado para que nunca vuelvas a estar dentro de una burbuja informativa.',
          tag: 'FUNDACIÓN'
        },
        {
          title: 'Tecnología Aplicada.',
          content: 'Nuestros algoritmos de detección de sesgo analizan semánticamente miles de titulares por segundo, identificando adjetivos cargados, omisiones estratégicas y encuadres ideológicos antes de que lleguen a tu pantalla.',
          tag: 'SISTEMA'
        }
      ]
    },
    { 
      id: 'mision', 
      title: 'Misión', 
      subtitle: 'EL NORTE TÉCNICO', 
      blocks: [
        {
          title: 'Transparencia absoluta.',
          content: 'Aspiramos a que cada ciudadano español tenga la capacidad de diseccionar un titular y comprender los intereses que hay detrás de cada palabra. Nuestra misión es terminar con el "punto ciego" informativo.',
          tag: 'PROPÓSITO'
        },
        {
          title: 'Independencia total.',
          content: 'No aceptamos inversiones de grupos mediáticos ni subvenciones gubernamentales que puedan comprometer nuestra objetividad. Sobrevivimos gracias a nuestra comunidad de lectores críticos.',
          tag: 'ÉTICA'
        }
      ]
    },
    { 
      id: 'blog', 
      title: 'Blog Editorial', 
      subtitle: 'PENSAMIENTO CRÍTICO', 
      blocks: [
        {
          title: 'El auge de la IA en la desinformación.',
          content: 'Un análisis profundo sobre cómo los modelos de lenguaje están siendo utilizados para generar narrativas falsas a escala y cómo TNE combate este fenómeno.',
          tag: 'ABRIL 2024'
        },
        {
          title: 'Auditando a los auditores.',
          content: 'Explicamos el proceso de auditoría semestral al que sometemos nuestros propios algoritmos para evitar sesgos de confirmación internos.',
          tag: 'METODOLOGÍA'
        }
      ]
    },
    { 
      id: 'suscripciones', 
      title: 'Suscripciones', 
      subtitle: 'ACCESO ILIMITADO', 
      isPricing: true,
      blocks: [
        {
          title: 'Invierte en tu claridad.',
          content: 'Al suscribirte a TNE, no solo obtienes acceso a las mejores herramientas de análisis, sino que financias la independencia del portal más transparente de España.',
          tag: 'COMUNIDAD'
        }
      ]
    },
    { 
      id: 'carreras', 
      title: 'Carreras', 
      subtitle: 'TRABAJA CON NOSOTROS', 
      isJobs: true,
      blocks: [
        {
          title: 'Escala el impacto.',
          content: 'Estamos buscando mentes inquietas que quieran resolver el problema de la polarización informativa mediante código, diseño y análisis de datos.',
          tag: 'TALENTO'
        }
      ]
    }
  ];

  const helpSections = [
    { 
      id: 'centro-ayuda', 
      title: 'Centro de Ayuda', 
      subtitle: 'DOCUMENTACIÓN', 
      blocks: [
        {
          title: 'Guía de Inicio Rápido.',
          content: 'Aprende a navegar por el feed multiperspectiva y a configurar tus alertas de sesgo en menos de 5 minutos.',
          tag: 'TUTORIAL'
        }
      ]
    },
    { 
      id: 'faq', 
      title: 'FAQ', 
      subtitle: 'FREQUENTLY ASKED QUESTIONS', 
      isFaq: true,
      blocks: [
        {
          title: 'Respuestas Directas.',
          content: 'Hemos recopilado las dudas más frecuentes de nuestra comunidad sobre el funcionamiento técnico y ético de la plataforma.',
          tag: 'PREGUNTAS'
        }
      ]
    },
    { 
      id: 'contacto', 
      title: 'Contacto', 
      subtitle: 'SOPORTE DIRECTO', 
      blocks: [
        {
          title: 'Estamos aquí.',
          content: 'Si eres usuario Premium, tienes acceso a una línea directa con nuestros analistas. Para consultas generales, nuestro equipo de soporte responde en menos de 24h.',
          tag: 'CANALES'
        }
      ]
    },
    { 
      id: 'ratings', 
      title: 'Ratings de Sesgo', 
      subtitle: 'METODOLOGÍA ANALÍTICA', 
      blocks: [
        {
          title: 'Cómo medimos la verdad.',
          content: 'Nuestro sistema de calificación de sesgo es dinámico. Evaluamos las fuentes basándonos en la omisión de hechos, el uso de lenguaje denotativo y la diversidad de citación.',
          tag: 'AUDITORÍA'
        }
      ]
    },
    { 
      id: 'fuentes', 
      title: 'Fuentes de noticias', 
      subtitle: 'NUESTRO ÍNDICE', 
      blocks: [
        {
          title: 'Índice de Diversidad Informativa.',
          content: 'Auditamos más de 500 fuentes en español, desde medios tradicionales hasta boletines independientes, asegurando un espectro ideológico completo.',
          tag: 'REPOSITORIO'
        }
      ]
    }
  ];

  const toolsSections = [
    { 
      id: 'app-movil', 
      title: 'App móvil', 
      subtitle: 'TNE EN TU BOLSILLO', 
      blocks: [
        {
          title: 'Noticias sin ruido, donde estés.',
          content: 'Nuestra aplicación para iOS y Android está diseñada para el consumo rápido y crítico. Incluye widgets de sesgo en tiempo real para tu pantalla de inicio.',
          tag: 'MOBILE'
        },
        {
          title: 'Alertas de burbuja.',
          content: 'Configura notificaciones inteligentes que te avisan cuando estás consumiendo demasiado contenido de una sola tendencia ideológica.',
          tag: 'SMART NOTIFY'
        }
      ]
    },
    { 
      id: 'extension', 
      title: 'Extensión de navegador', 
      subtitle: 'ANÁLISIS EN TIEMPO REAL', 
      blocks: [
        {
          title: 'Inyecta transparencia en tu navegación.',
          content: 'Nuestra extensión para Chrome, Firefox y Safari analiza automáticamente cualquier artículo que estés leyendo fuera de TNE, mostrándote el rating de sesgo y fuentes alternativas.',
          tag: 'BROWSER'
        }
      ]
    },
    { 
      id: 'newsletter', 
      title: 'Newsletter diaria', 
      subtitle: 'TU RESUMEN MATINAL', 
      blocks: [
        {
          title: 'El mapa del día.',
          content: 'Cada mañana a las 7:00 AM, recibe un correo con las 3 noticias más importantes y cómo están siendo cubiertas por todo el espectro mediático.',
          tag: 'EMAIL'
        }
      ]
    },
    { 
      id: 'timelines', 
      title: 'Timelines', 
      subtitle: 'CONTEXTO HISTÓRICO', 
      blocks: [
        {
          title: 'No te pierdas en el presente.',
          content: 'Nuestra herramienta de Timelines te permite retroceder meses o años para ver cómo ha evolucionado la narrativa de una noticia específica.',
          tag: 'DATA VIZ'
        }
      ]
    },
    { 
      id: 'api', 
      title: 'API de datos', 
      subtitle: 'PARA DESARROLLADORES', 
      blocks: [
        {
          title: 'Construye sobre la verdad.',
          content: 'Accede a nuestra base de datos de análisis de sesgo y factuality para tus propios proyectos de investigación o aplicaciones.',
          tag: 'ELITE PLAN'
        }
      ]
    }
  ];

  const termsSections = [
    { 
      id: 'terminos', 
      title: 'Términos de Uso', 
      subtitle: 'ACUERDO LEGAL', 
      blocks: [
        {
          title: '1. Aceptación de los términos.',
          content: 'Al acceder a TNE, aceptas cumplir con nuestras normas de comunidad y uso ético de los datos proporcionados.',
          tag: 'LEGAL'
        },
        {
          title: '2. Propiedad Intelectual.',
          content: 'El software y los algoritmos de análisis de sesgo son propiedad exclusiva de TNE. El contenido de las noticias pertenece a sus respectivos autores citados.',
          tag: 'IP'
        },
        {
          title: '3. Uso permitido.',
          content: 'Queda prohibido el uso de técnicas de scraping masivo sin autorización previa a través de nuestra API oficial.',
          tag: 'USO'
        }
      ]
    }
  ];

  const privacySections = [
    { 
      id: 'privacidad', 
      title: 'Privacidad', 
      subtitle: 'PROTECCIÓN DE DATOS', 
      blocks: [
        {
          title: 'Privacidad por diseño.',
          content: 'No rastreamos tu identidad personal ni vendemos tu comportamiento de lectura a anunciantes. Tu perfil de sesgo es solo para tu mejora personal.',
          tag: 'PRIVACY'
        },
        {
          title: 'Cifrado de extremo a extremo.',
          content: 'Tus marcadores y preferencias están protegidos mediante cifrado industrial, asegurando que nadie más tenga acceso a tu dieta informativa.',
          tag: 'SEGURIDAD'
        }
      ]
    }
  ];

  const jobs = [
    { role: 'Senior React Engineer', type: 'Remoto / Madrid', area: 'PRODUCTO' },
    { role: 'Data Scientist (NLP)', type: 'Remoto / Barcelona', area: 'INTELIGENCIA' },
    { role: 'Brand Designer', type: 'Madrid', area: 'DISEÑO' },
    { role: 'Customer Support Lead', type: 'Remoto', area: 'OPERACIONES' },
  ];

  const faqs = [
    { q: '¿Cómo calculáis el sesgo de una fuente?', a: 'Utilizamos un sistema híbrido que combina análisis de lenguaje natural (NLP) para detectar adjetivos y encuadres, cruzado con un panel de expertos ciegos y el histórico de fuentes del medio.' },
    { q: '¿TNE tiene alguna inclinación política?', a: 'TNE es una entidad técnica. No tenemos línea editorial propia. Nuestra única "ideología" es la exposición a la diversidad informativa.' },
    { q: '¿Es posible usar TNE de forma gratuita?', a: 'Sí. El feed básico y el análisis de sesgo inicial son siempre gratuitos. Las herramientas de análisis profundo requieren suscripción.' },
    { q: '¿Cómo añado una nueva fuente de noticias?', a: 'Puedes sugerir fuentes a través del panel de Ayuda. Todas las fuentes deben pasar un proceso de auditoría de 3 meses antes de integrarse.' },
    { q: '¿Vendéis mis datos de lectura?', a: 'Nunca. Tu historial de lectura es privado y está cifrado punto a punto. No vendemos perfiles de usuario a terceros.' },
  ];

  const sectionsMap = {
    'COMPANY': companySections,
    'HELP': helpSections,
    'TOOLS': toolsSections,
    'TERMS': termsSections,
    'PRIVACY': privacySections
  };

  const sections = sectionsMap[type] || companySections;
  
  const initialIndex = sectionId 
    ? sections.findIndex(s => s.id === sectionId) 
    : 0;

  const [activeSection, setActiveSection] = useState(initialIndex !== -1 ? initialIndex : 0);
  const [openFaq, setOpenFaq] = useState(null);

  // Sync state if URL changes
  useEffect(() => {
    const newIndex = sectionId ? sections.findIndex(s => s.id === sectionId) : 0;
    if (newIndex !== -1) {
      setActiveSection(newIndex);
      window.scrollTo(0, 0); // Scroll to top on section change
    }
  }, [sectionId, sections]);

  const handleSectionClick = (index) => {
    setActiveSection(index);
    setSearchParams({ section: sections[index].id });
  };

  const activeData = sections[activeSection];

  return (
    <div className="corporate-page" style={{ background: '#fff' }}>
      <div style={{ padding: '24px var(--page-padding)', borderBottom: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '2px', cursor: 'pointer' }} onClick={onBack}>
          ← VOLVER AL FEED
        </div>
        <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>
          TNE / {(() => {
            if (type === 'COMPANY') return 'CORPORATIVO';
            if (type === 'HELP') return 'SOPORTE';
            if (type === 'TOOLS') return 'HERRAMIENTAS';
            if (type === 'TERMS') return 'TÉRMINOS';
            if (type === 'PRIVACY') return 'PRIVACIDAD';
            return 'INFO';
          })()}
        </div>
      </div>

      <section className="layout-split" style={{ minHeight: 'calc(100vh - 150px)' }}>
        <div className="sidebar" style={{ background: '#fcfcfc', borderRight: 'var(--border-thin)' }}>
          <div style={{ padding: '60px var(--page-padding)' }}>
            <h1 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '4px', marginBottom: '60px', opacity: 0.3 }}>
              {(() => {
                if (type === 'COMPANY') return 'COMPAÑÍA';
                if (type === 'HELP') return 'AYUDA';
                if (type === 'TOOLS') return 'HERRAMIENTAS';
                if (type === 'TERMS') return 'LEGAL';
                if (type === 'PRIVACY') return 'LEGAL';
                return 'INFO';
              })()}
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sections.map((section, index) => (
                <div 
                  key={section.id}
                  onClick={() => handleSectionClick(index)}
                  style={{ 
                    padding: '16px 0', 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    color: activeSection === index ? 'black' : '#ccc',
                    borderBottom: activeSection === index ? '1px solid black' : '1px solid transparent',
                    transition: '0.2s'
                  }}
                  className="footer-link"
                >
                  {section.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="main-content" style={{ padding: '80px 100px' }}>
          <div style={{ maxWidth: '1000px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '16px', letterSpacing: '3px' }}>
              {activeData.subtitle}
            </div>
            <h2 style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-3px', lineHeight: '0.9', marginBottom: '80px' }}>
              {activeData.title}
            </h2>

            {/* Content Blocks */}
            {activeData.blocks.map((block, i) => (
              <div key={i} style={{ marginBottom: '80px', borderTop: i > 0 ? 'var(--border-thin)' : 'none', paddingTop: i > 0 ? '80px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                  <Plus /> <Plus />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '60px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '8px 16px', border: '1px solid black', alignSelf: 'start', textAlign: 'center' }}>
                    {block.tag}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-1px' }}>{block.title}</h3>
                    <p style={{ fontSize: '20px', lineHeight: '1.5', color: '#333' }}>{block.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Special Section: PRICING (Symmetry with Pricing component) */}
            {activeData.isPricing && (
              <div style={{ marginTop: '80px', borderTop: '2px solid black', paddingTop: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '0 0 40px 0' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Mensual</span>
                  <div style={{ width: '40px', height: '20px', background: 'black', borderRadius: '10px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }} />
                  </div>
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>Anual (-17%)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'black', border: '1px solid black' }}>
                  {[
                    { 
                      name: 'ESTÁNDAR', 
                      price: '0€', 
                      period: 'Gratis siempre',
                      feat: ['Feed de noticias mundial', 'Sesgo básico (3 fuentes)', 'Noticias resumidas'],
                      btn: 'SEGUIR GRATIS'
                    },
                    { 
                      name: 'PREMIUM', 
                      price: '4€', 
                      period: 'Al mes',
                      feat: ['Noticias completas', 'Blindspots ilimitados', 'Sin anuncios', 'Gráficos avanzados'],
                      dark: true,
                      btn: 'ELEGIR PREMIUM'
                    },
                    { 
                      name: 'ELITE', 
                      price: '8€', 
                      period: 'Al mes',
                      feat: ['Todo lo de Premium', 'Acceso a API de datos', 'Soporte 24/7', 'Reportes analíticos'],
                      btn: 'EMPEZAR ELITE'
                    }
                  ].map((p, i) => (
                    <div key={i} style={{ background: p.dark ? 'black' : 'white', color: p.dark ? 'white' : 'black', padding: '30px 24px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', opacity: 0.5, marginBottom: '16px' }}>{p.name}</span>
                      <div style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2px', lineHeight: '1', marginBottom: '4px' }}>{p.price}</div>
                      <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '32px' }}>{p.period}</div>
                      
                      <div style={{ flex: 1 }}>
                        {p.feat.map((f, j) => (
                          <div key={j} style={{ fontSize: '12px', paddingBottom: '12px', borderBottom: p.dark ? '1px solid #333' : '1px solid #eee', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ opacity: 0.3 }}>[+]</span> {f}
                          </div>
                        ))}
                      </div>

                      <button style={{ 
                        width: '100%', 
                        marginTop: '32px', 
                        padding: '16px', 
                        background: p.dark ? 'white' : 'black', 
                        color: p.dark ? 'black' : 'white', 
                        border: 'none', 
                        fontWeight: 800, 
                        fontSize: '11px', 
                        cursor: 'pointer',
                        letterSpacing: '1px'
                      }}>
                        {p.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Section: JOBS */}
            {activeData.isJobs && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#eee', border: '1px solid #eee' }}>
                {jobs.map((job, i) => (
                  <div key={i} style={{ background: 'white', padding: '40px', cursor: 'pointer' }} className="special-card-hover">
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '16px' }}>{job.area}</div>
                    <h4 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{job.role}</h4>
                    <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.6 }}>{job.type}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Special Section: FAQ Accordion */}
            {activeData.isFaq && (
              <div style={{ marginTop: '40px', borderTop: '2px solid black' }}>
                {faqs.map((faq, i) => (
                  <div key={i} style={{ borderBottom: 'var(--border-thin)', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ padding: '32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <h4 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{faq.q}</h4>
                      <span style={{ fontSize: '24px', fontWeight: 300 }}>{openFaq === i ? '−' : '+'}</span>
                    </div>
                    <div style={{ 
                      maxHeight: openFaq === i ? '200px' : '0', 
                      opacity: openFaq === i ? 1 : 0,
                      transition: 'all 0.3s ease-in-out',
                      paddingBottom: openFaq === i ? '32px' : '0'
                    }}>
                      <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', margin: 0 }}>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '100px' }}>
              <Plus /> <Plus />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateLanding;
