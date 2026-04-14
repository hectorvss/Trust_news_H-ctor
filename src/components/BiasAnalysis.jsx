import React from 'react';

const Plus = () => <span style={{ fontSize: '18px', opacity: 0.2, fontWeight: 700 }}>+</span>;

const BiasAnalysis = ({ onBack }) => {
  const stats = [
    { label: 'ARTÍCULOS LEÍDOS', value: '342', trend: '+12%' },
    { label: 'SESGO PROMEDIO', value: 'CENTRO-IZQ', trend: 'ESTABLE' },
    { label: 'FUENTES CONSULTADAS', value: '86', trend: '+5' },
    { label: 'DIVERSIDAD MEDIA', value: '72%', trend: '-2%' },
  ];

  const sourceBreakdown = [
    { name: 'El País', count: 124, bias: -0.6 },
    { name: 'El Mundo', count: 82, bias: 0.4 },
    { name: 'ABC', count: 45, bias: 0.8 },
    { name: 'elDiario.es', count: 38, bias: -0.9 },
    { name: 'La Razón', count: 20, bias: 0.7 },
  ];

  return (
    <div className="bias-analysis-page" style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <div style={{ padding: '24px var(--page-padding)', borderBottom: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '2px', cursor: 'pointer' }} onClick={onBack}>
          ← VOLVER AL FEED
        </div>
        <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>
          TNE / PERFIL / ANÁLISIS DE SESGO
        </div>
      </div>

      <section className="layout-split">
        {/* Sidebar Summary */}
        <div className="sidebar" style={{ background: '#fcfcfc', borderRight: 'var(--border-thin)' }}>
          <div style={{ padding: '60px var(--page-padding)' }}>
            <h1 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '4px', marginBottom: '60px', opacity: 0.3 }}>MI PERFIL</h1>
            
            <div style={{ padding: '40px', border: 'var(--border-thin)', background: 'white', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '24px', opacity: 0.4 }}>TU SESGO ACTUAL</div>
              <div style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '32px' }}>CENTRO</div>
              
              <div style={{ height: '12px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginBottom: '24px' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '45%', 
                  width: '10%', 
                  height: '100%', 
                  background: 'black',
                  borderRadius: '10px'
                }} />
              </div>

              <button style={{ 
                width: '100%', 
                padding: '16px', 
                background: 'none', 
                border: '1px solid black', 
                fontWeight: 800, 
                fontSize: '11px', 
                borderRadius: '100px',
                cursor: 'pointer'
              }} onClick={() => {}}>
                EXPORTAR DATOS .JSON
              </button>
            </div>

            <div style={{ marginTop: '60px', padding: '0 20px' }}>
              <h3 style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', marginBottom: '24px' }}>LOGROS DE LECTURA</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                  <span style={{ fontWeight: 800 }}>[+]</span> Explorador de Espectro
                </div>
                <div style={{ fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '12px', opacity: 0.3 }}>
                  <span style={{ fontWeight: 800 }}>[ ]</span> Auditor de Fuentes
                </div>
                <div style={{ fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '12px', opacity: 0.3 }}>
                  <span style={{ fontWeight: 800 }}>[ ]</span> Maestro de la Verdad
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Dashboard */}
        <div className="main-content" style={{ padding: '80px 100px' }}>
          <div style={{ maxWidth: '1100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
              <Plus /> <Plus />
            </div>

            <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '16px', letterSpacing: '3px' }}>
              ANÁLISIS DE LOS ÚLTIMOS 30 DÍAS
            </div>
            <h2 style={{ fontSize: '80px', fontWeight: 800, letterSpacing: '-5px', lineHeight: '0.8', marginBottom: '60px' }}>
              Mi Sesgo <br/> de Lectura.
            </h2>

            {/* Top Level Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'black', border: '1px solid black', marginBottom: '80px' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: 'white', padding: '32px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '24px', letterSpacing: '1px' }}>{s.label}</div>
                  <div style={{ fontSize: '32px', fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '8px', color: s.trend.startsWith('+') ? '#28a745' : s.trend.startsWith('-') ? '#dc3545' : '#000' }}>
                    {s.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Distribution Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '80px', marginBottom: '80px' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', letterSpacing: '-1px', borderBottom: '2px solid black', paddingBottom: '16px' }}>Distribución Ideológica</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {sourceBreakdown.map((source, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 700 }}>
                        <span>{source.name}</span>
                        <span style={{ opacity: 0.5 }}>{source.count} ART.</span>
                      </div>
                      <div style={{ height: '4px', background: '#eee', width: '100%', position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          left: '50%', 
                          width: `${Math.abs(source.bias * 50)}%`, 
                          height: '100%', 
                          background: 'black',
                          transform: source.bias < 0 ? 'translateX(-100%)' : 'none'
                        }} />
                        <div style={{ position: 'absolute', left: '50%', height: '10px', width: '1px', background: 'black', top: '-3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px', letterSpacing: '-1px', borderBottom: '2px solid black', paddingBottom: '16px' }}>Tus Puntos Ciegos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    'Políticas de vivienda en zonas rurales',
                    'Innovación agrícola en el sur de España',
                    'Análisis fiscal de las PYMES tecnológicas'
                  ].map((topic, i) => (
                    <div key={i} style={{ padding: '24px', border: 'var(--border-thin)', borderRadius: '12px', background: '#fcfcfc' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '12px' }}>TEMA RECOMENDADO</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.4' }}>{topic}</div>
                      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', cursor: 'pointer' }}>
                        EXPLORAR PERSPECTIVAS ↗
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bias Timeline Chart (Blueprint Style) */}
            <div style={{ borderTop: 'var(--border-thin)', paddingTop: '60px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', marginBottom: '40px', opacity: 0.4 }}>EVOLUCIÓN SEMANAL</h3>
              <div style={{ height: '200px', width: '100%', border: 'var(--border-thin)', borderBottom: 'none', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 20px' }}>
                {[60, 45, 80, 55, 70, 40, 65].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '40%', height: `${h}%`, background: 'black', opacity: 0.1 + (i * 0.1) }} />
                  </div>
                ))}
                <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'black', opacity: 0.2, borderStyle: 'dashed' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', border: 'var(--border-thin)', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                <span>LUNES</span> <span>MARTES</span> <span>MIÉRCOLES</span> <span>JUEVES</span> <span>VIERNES</span> <span>SÁBADO</span> <span>DOMINGO</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '100px' }}>
              <Plus /> <Plus />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BiasAnalysis;
