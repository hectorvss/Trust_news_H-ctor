import React, { useState, useEffect } from 'react';
import { getBiasStats } from '../supabaseService';
import { useAuth } from '../context/AuthContext';

const Plus = () => <span style={{ fontSize: '18px', opacity: 0.2, fontWeight: 700 }}>+</span>;

const BiasAnalysis = ({ onBack }) => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30D');
  const [realStats, setRealStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBiasStats(user?.id).then(data => {
      setRealStats(data);
      setLoading(false);
    });
  }, [user]);

  const stats = [
    { label: 'ARTÍCULOS LEÍDOS', value: realStats ? realStats.total_articles : '342', meta: '+12% vs mes ant.', detail: 'Media 11.4/día' },
    { label: 'SESGO PROMEDIO', value: realStats ? (realStats.bias_distribution.LEFT > realStats.bias_distribution.RIGHT ? 'CENTRO-IZQ' : 'CENTRO-DER') : 'CENTRO-IZQ', meta: 'ESTABILIDAD ALTA', detail: 'Confianza 94%' },
    { label: 'FUENTES CONSULTADAS', value: realStats ? realStats.top_sources.length : '86', meta: '+5 nuevas', detail: 'Top 3 cubren 42%' },
    { label: 'DIVERSIDAD MEDIA', value: realStats ? `${realStats.diversity_pct}%` : '72%', meta: '-2% vs histórico', detail: 'Patrón saludable' },
  ];

  const sourceBreakdown = realStats ? realStats.top_sources : [
    { name: 'El País', count: 124, pct: 36, bias: -0.6, trend: '↑' },
    { name: 'El Mundo', count: 82, pct: 24, bias: 0.4, trend: '→' },
    { name: 'ABC', count: 45, pct: 13, bias: 0.8, trend: '↓' },
    { name: 'elDiario.es', count: 38, pct: 11, bias: -0.9, trend: '→' },
    { name: 'La Razón', count: 20, pct: 6, bias: 0.7, trend: '→' },
  ];

  const thematicBreakdown = [
    { theme: 'Política', pct: 45 },
    { theme: 'Economía', pct: 22 },
    { theme: 'Vivienda', pct: 14 },
    { theme: 'Internacional', pct: 8 },
    { theme: 'Sociedad', pct: 6 },
    { theme: 'Otros', pct: 5 },
  ];

  const achievements = [
    { label: 'Explorador de Espectro', status: 'COMPLETO' },
    { label: 'Lector Multifuente', status: 'COMPLETO' },
    { label: 'Contrapeso Ideológico', status: 'EN PROGRESO' },
    { label: 'Verificador de Contexto', status: 'BLOQUEADO' },
    { label: 'Lector Consistente', status: 'COMPLETO' },
    { label: 'Descubridor de Medios', status: 'EN PROGRESO' },
  ];

  const balanceTips = [
    "Incorporar 2 medios con enfoque internacional.",
    "Añadir perspectiva regional (Catalunya/Euskadi/Andalucía).",
    "Reducir dependencia del bloque 'Centro-Izq' (-5%).",
    "Explorar diversidad temática fuera de Política."
  ];

  return (
    <div className="bias-analysis-page" style={{ background: '#fff', minHeight: '100vh', color: '#000' }}>
      {/* 1. Navigation Header */}
      <div style={{ padding: '24px 60px', borderBottom: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '2px', cursor: 'pointer' }} onClick={onBack}>
          ← VOLVER AL FEED
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['7D', '30D', '90D', 'HIST'].map(p => (
            <span key={p} onClick={() => setPeriod(p)} style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer', opacity: period === p ? 1 : 0.2 }}>
              {p === 'HIST' ? 'HISTÓRICO' : p}
            </span>
          ))}
        </div>
      </div>

      <section className="layout-split" style={{ display: 'flex' }}>
      <div className="bias-analysis-content" style={{ padding: '80px 60px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '80px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '16px', letterSpacing: '3px' }}>
              ANÁLISIS DE CONSUMO ENERO 2024
            </div>
            <h2 style={{ fontSize: '80px', fontWeight: 800, letterSpacing: '-5px', lineHeight: '0.9', marginBottom: '24px' }}>
              Mi Sesgo de Lectura.
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.5, maxWidth: '700px', lineHeight: '1.5', margin: '0 auto' }}>
              Un resumen de tus patrones de lectura, diversidad de fuentes y puntos ciegos para equilibrar tu dieta informativa.
            </p>
          </div>

          {/* Metrics Row Full Width */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'black', border: '1px solid black', marginBottom: '100px' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: 'white', padding: '40px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '24px', letterSpacing: '1px' }}>{s.label}</div>
                <div style={{ fontSize: '38px', fontWeight: 800, marginBottom: '8px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', fontWeight: 800 }}>
                  {s.meta}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.3, marginTop: '4px', fontWeight: 700 }}>{s.detail}</div>
              </div>
            ))}
          </div>

          {/* 1. Distribución Ideológica (Full Width) */}
          <section style={{ marginBottom: '160px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '60px', letterSpacing: '-1px', borderBottom: '2px solid black', paddingBottom: '20px' }}>Distribución Ideológica</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
              {sourceBreakdown.map((source, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 100px', alignItems: 'center', gap: '60px', padding: '24px 0', borderBottom: '0.5px solid #eee' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{source.name}</div>
                  <div style={{ height: '6px', background: '#f5f5f5', width: '100%', position: 'relative', borderRadius: '10px' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '50%', 
                      width: `${Math.abs(source.bias * 50)}%`, 
                      height: '100%', 
                      background: 'black',
                      transform: source.bias < 0 ? 'translateX(-100%)' : 'none',
                      borderRadius: '10px'
                    }} />
                    <div style={{ position: 'absolute', left: '50%', height: '12px', width: '1px', background: 'black', top: '-3px' }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 800 }}>{source.pct}%</div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Distribución Temática (Full Width) */}
          <section style={{ marginBottom: '180px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '60px', letterSpacing: '-1px', borderBottom: '2px solid black', paddingBottom: '20px' }}>Distribución Temática</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {thematicBreakdown.map((t, i) => (
                <div key={i} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '200px 1fr 100px', 
                  alignItems: 'center', 
                  gap: '80px',
                  padding: '30px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{t.theme.toUpperCase()}</div>
                  <div style={{ height: '24px', background: '#f5f5f5', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${t.pct}%`, height: '100%', background: 'black' }} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{t.pct}%</div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Blindspots and Balance (Side by Side) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '180px' }}>
            <div style={{ padding: '60px', border: 'var(--border-thin)', borderRadius: '32px', background: '#fcfcfc' }}>
              <h3 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px' }}>Puntos Ciegos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {[
                  { t: 'Política Rural', d: 'Falta de exposición a realidades fuera de capitales.', p: 'SOCIAL' },
                  { t: 'Sindicatos', d: 'Escasa información sobre movimientos laborales directos.', p: 'ECO' },
                  { t: 'Bruselas', d: 'Consumo centrado en lo nacional, ignorando la UE.', p: 'REG' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>{item.t}</div>
                      <div style={{ fontSize: '14px', opacity: 0.5, lineHeight: '1.4' }}>{item.d}</div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 12px', background: 'white', border: '1px solid black', borderRadius: '6px' }}>{item.p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '60px', border: 'var(--border-thin)', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px' }}>Para equilibrar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {balanceTips.map((tip, i) => (
                  <div key={i} style={{ fontSize: '15px', fontWeight: 600, display: 'flex', gap: '20px', lineHeight: '1.6' }}>
                    <span style={{ minWidth: '10px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '8px', height: '8px', background: 'black', borderRadius: '50%' }} /></span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Resumen de Perfil (Full Width, Extra Detail) */}
          <section style={{ marginBottom: '180px' }}>
            <div style={{ background: 'black', color: 'white', padding: '80px', borderRadius: '48px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '30px', right: '60px', opacity: 0.15 }}>
                <svg width="200" height="200" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" />
                  <path d="M50 0 V100 M0 50 H100" stroke="white" strokeWidth="0.1" />
                </svg>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '4px', marginBottom: '48px', opacity: 0.4 }}>RESUMEN ESTRATÉGICO DE PERFIL</div>
              <h4 style={{ fontSize: '42px', fontWeight: 700, lineHeight: '1.1', marginBottom: '60px', maxWidth: '1000px', letterSpacing: '-2px' }}>
                "Eres un lector analítico con alta fidelidad a la política nacional, pero con una dependencia estructural del bloque progresista y un vacío crítico en información económica global."
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '60px' }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.4, marginBottom: '16px', letterSpacing: '1px' }}>INTELIGENCIA EMOCIONAL</div>
                  <p style={{ fontSize: '15px', opacity: 0.8, lineHeight: '1.6' }}>Tu consumo sugiere una búsqueda de validación más que de contraste en temas sociales.</p>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.4, marginBottom: '16px', letterSpacing: '1px' }}>ESTABILIDAD DE DIETA</div>
                  <p style={{ fontSize: '15px', opacity: 0.8, lineHeight: '1.6' }}>Patrón consistente durante 12 semanas. Sin cambios bruscos tras eventos electorales.</p>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.4, marginBottom: '16px', letterSpacing: '1px' }}>NIVEL DE APARTIDISMO</div>
                  <p style={{ fontSize: '15px', opacity: 0.8, lineHeight: '1.6' }}>Bajo. Se recomienda duplicar el seguimiento de medios de espectro opuesto para 2024.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Evolución (Real SVG Graph - Concept: Perceptual Opening) */}
          <section style={{ marginBottom: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', borderBottom: '2px solid black', paddingBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-1.5px' }}>Apertura Crítica e Índice de Diversidad</h3>
                <div style={{ fontSize: '12px', marginTop: '12px', opacity: 0.5, fontWeight: 700 }}>EVOLUCIÓN DE LA SALUD INFORMATIVA • ÚLTIMOS 90 DÍAS</div>
              </div>
            </div>
            
            <div style={{ height: '350px', width: '100%', position: 'relative', marginTop: '60px' }}>
              <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                <line x1="0" y1="50" x2="1000" y2="50" stroke="#f5f5f5" strokeWidth="1" />
                <line x1="0" y1="150" x2="1000" y2="150" stroke="#000" strokeWidth="0.3" strokeDasharray="6 6" />
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#f5f5f5" strokeWidth="1" />
                
                {/* LINE 1: Historical Baseline (Eco Chamber) */}
                <path 
                  d="M0,250 C100,240 200,260 300,245 S500,255 600,240 S800,250 1000,230" 
                  fill="none" 
                  stroke="#ddd" 
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />

                {/* LINE 2: Active Opening (Curiosity/Change) */}
                <path 
                  d="M0,250 C100,220 200,180 300,150 S500,130 600,100 S800,70 1000,60" 
                  fill="none" 
                  stroke="black" 
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                
                {/* Highlight Point */}
                <circle cx="1000" cy="60" r="8" fill="black" />
              </svg>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0px', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', border: '2px solid black', borderRadius: '50%' }} />
                  <span>APERTURA CRÍTICA (ACTUAL)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.3 }}>
                  <div style={{ width: '12px', height: '2px', background: '#aaa', borderTop: '2px dashed #aaa' }} />
                  <span>CÁMARA DE ECO (HISTÓRICO)</span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Últimas historias leídas */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', borderBottom: '2px solid black', paddingBottom: '20px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>Últimas Noticias Leídas</h3>
              <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3 }}>HISTORIAL RECIENTE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {[
                { title: 'Debate en el Congreso sobre la reforma de la ley mordaza: posturas enfrentadas', sources: 35, time: 'hace 8 horas', bias: { left: 40, center: 40, right: 20 } },
                { title: 'El BCE mantiene los tipos de interés tras la bajada de la inflación en la eurozona', sources: 112, time: 'hace 12 horas', bias: { left: 20, center: 70, right: 10 } },
                { title: 'Nueva ley de vivienda: el tope al alquiler se aplicará en zonas tensionadas desde mayo', sources: 86, time: 'ayer', bias: { left: 60, center: 30, right: 10 } }
              ].map((story, i) => (
                <div key={i} style={{ padding: '40px', border: '2px solid black', borderRadius: '32px', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '6px 16px', border: '1px solid black', borderRadius: '100px' }}>ESPAÑA</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3 }}>{story.sources} SOURCES</span>
                  </div>
                  <h5 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-2px', lineHeight: '1.1', margin: '0 0 16px 0' }}>{story.title}</h5>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '32px' }}>{story.time} — Covering the latest developments in translation.</div>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: '12px' }}>Media Bias Spectrum</div>
                    <div style={{ display: 'flex', height: '4px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${story.bias.left}%`, background: '#000' }}></div>
                      <div style={{ width: `${story.bias.center}%`, background: '#666' }}></div>
                      <div style={{ width: `${story.bias.right}%`, background: '#ccc' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
            <Plus />
          </div>
        </div>
      </div>
    </section>
  </div>
);
};

export default BiasAnalysis;

