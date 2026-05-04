import React, { useState, useEffect } from 'react';
import { getBiasStats, getReadingHistory, fetchStoryById } from '../supabaseService';
import { useAuth } from '../context/AuthContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import Plus from './ui/Plus';

const PERIOD_DAYS = { '7D': 7, '30D': 30, '90D': 90, 'HIST': null };

const periodLabel = (period) => {
  const now = new Date();
  if (period === 'HIST') return 'ANÁLISIS HISTÓRICO COMPLETO';
  const days = PERIOD_DAYS[period];
  const from = new Date(Date.now() - days * 86400000);
  return `ANÁLISIS ${from.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()} – ${now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()} ${now.getFullYear()}`;
};

const computeAchievements = (stats) => {
  if (!stats) return [
    { label: 'Explorador de Espectro', status: 'BLOQUEADO' },
    { label: 'Lector Multifuente', status: 'BLOQUEADO' },
    { label: 'Contrapeso Ideológico', status: 'BLOQUEADO' },
    { label: 'Lector Consistente', status: 'BLOQUEADO' },
    { label: 'Descubridor de Medios', status: 'BLOQUEADO' },
    { label: 'Maratonista Informativo', status: 'BLOQUEADO' },
  ];
  const d = stats.bias_distribution || {};
  const hasLeft = (d.LEFT || 0) > 0;
  const hasRight = (d.RIGHT || 0) > 0;
  const hasCenter = (d.CENTER || 0) > 0;
  return [
    { label: 'Explorador de Espectro', status: hasLeft && hasRight ? 'COMPLETO' : 'EN PROGRESO' },
    { label: 'Lector Multifuente', status: stats.unique_sources >= 5 ? 'COMPLETO' : 'EN PROGRESO' },
    { label: 'Contrapeso Ideológico', status: hasLeft && hasRight && hasCenter ? 'COMPLETO' : 'EN PROGRESO' },
    { label: 'Lector Consistente', status: stats.total_articles >= 10 ? 'COMPLETO' : 'EN PROGRESO' },
    { label: 'Descubridor de Medios', status: stats.unique_sources >= 10 ? 'COMPLETO' : 'EN PROGRESO' },
    { label: 'Maratonista Informativo', status: stats.total_seconds >= 3600 ? 'COMPLETO' : 'EN PROGRESO' },
  ];
};

const computeBalanceTips = (stats) => {
  if (!stats) return ["Lee medios de distintos espectros ideológicos.", "Diversifica tus fuentes de información."];
  const d = stats.bias_distribution || {};
  const total = Object.values(d).reduce((a, b) => a + b, 0) || 1;
  const leftPct = Math.round(((d.LEFT || 0) / total) * 100);
  const rightPct = Math.round(((d.RIGHT || 0) / total) * 100);
  const tips = [];
  if (leftPct > 60) tips.push("Incorpora medios de centro-derecha para contrastar tu perspectiva.");
  if (rightPct > 60) tips.push("Incorpora medios de centro-izquierda para ampliar el análisis.");
  if (stats.unique_sources < 5) tips.push("Consulta al menos 5 fuentes distintas para reducir dependencia.");
  if (stats.diversity_pct < 50) tips.push("Tu diversidad es baja. Explora medios fuera de tu zona de confort.");
  if (tips.length === 0) tips.push("Mantén el equilibrio actual: es un patrón saludable de consumo.");
  tips.push("Explora temas internacionales y de política regional para ampliar perspectiva.");
  return tips;
};

const biasColor = (biasStr) => {
  if (!biasStr) return '#888';
  const b = biasStr.toUpperCase();
  if (b === 'LEFT') return '#111';
  if (b === 'RIGHT') return '#555';
  return '#888';
};

const BiasAnalysis = ({ onBack }) => {
  const { user } = useAuth();
  const { isMobile } = useBreakpoint();
  const [period, setPeriod] = useState('30D');
  const [realStats, setRealStats] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const days = PERIOD_DAYS[period];
    Promise.all([
      getBiasStats(user.id, days),
      getReadingHistory(user.id),
    ]).then(([stats, history]) => {
      setRealStats(stats);
      const recent = (history || []).slice(0, 3);
      setRecentHistory(recent);
      setLoading(false);
      // Fetch story details for each history entry
      Promise.all(recent.map(e => fetchStoryById(e.story_id))).then(stories => {
        setRecentStories(stories.filter(Boolean));
      });
    });
  }, [user, period]);

  const d = realStats?.bias_distribution || {};
  const totalBias = Object.values(d).reduce((a, b) => a + b, 0) || 1;
  const leftPct = Math.round(((d.LEFT || 0) / totalBias) * 100);
  const centerPct = Math.round(((d.CENTER || 0) / totalBias) * 100);
  const rightPct = Math.round(((d.RIGHT || 0) / totalBias) * 100);

  const dominantBias = leftPct > rightPct && leftPct > centerPct
    ? 'CENTRO-IZQ'
    : rightPct > leftPct && rightPct > centerPct
    ? 'CENTRO-DER'
    : 'CENTRO';

  const stats = [
    {
      label: 'ARTÍCULOS LEÍDOS',
      value: realStats ? realStats.total_articles : (loading ? '…' : '0'),
      meta: `${Math.round((realStats?.total_seconds || 0) / 60)} min totales`,
      detail: realStats ? `${realStats.unique_sources} fuentes distintas` : '—',
    },
    {
      label: 'SESGO PROMEDIO',
      value: realStats ? dominantBias : (loading ? '…' : '—'),
      meta: realStats ? `${Math.max(leftPct, centerPct, rightPct)}% concentración` : '—',
      detail: 'Basado en historial real',
    },
    {
      label: 'FUENTES CONSULTADAS',
      value: realStats ? realStats.unique_sources : (loading ? '…' : '0'),
      meta: realStats ? `Top fuente: ${realStats.top_sources[0]?.name || '—'}` : '—',
      detail: `${realStats?.top_sources?.length || 0} en top 8`,
    },
    {
      label: 'DIVERSIDAD MEDIA',
      value: realStats ? `${realStats.diversity_pct}%` : (loading ? '…' : '—'),
      meta: realStats?.diversity_pct >= 60 ? 'Patrón saludable' : 'Mejorable',
      detail: `Izq ${leftPct}% / Ctr ${centerPct}% / Der ${rightPct}%`,
    },
  ];

  const sourceBreakdown = realStats?.top_sources?.length > 0
    ? realStats.top_sources
    : [];

  const achievements = computeAchievements(realStats);
  const balanceTips = computeBalanceTips(realStats);

  const profileSummary = realStats
    ? `Lector con ${realStats.total_articles} artículos y ${realStats.unique_sources} fuentes en el período. Sesgo predominante: ${dominantBias}. Diversidad del ${realStats.diversity_pct}%.`
    : 'Aún no hay suficientes datos de lectura para generar tu perfil. Lee más artículos para activar el análisis.';

  return (
    <div className="bias-analysis-page" style={{ background: '#fff', minHeight: '100vh', color: '#000' }}>
      {/* Navigation Header */}
      <div style={{ padding: isMobile ? '16px 16px' : '24px 60px', borderBottom: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '2px', cursor: 'pointer' }} onClick={onBack}>
          ← VOLVER AL FEED
        </div>
        <div style={{ display: 'flex', gap: isMobile ? '16px' : '32px' }}>
          {['7D', '30D', '90D', 'HIST'].map(p => (
            <span key={p} onClick={() => setPeriod(p)} style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer', opacity: period === p ? 1 : 0.2 }}>
              {p === 'HIST' ? 'HIST' : p}
            </span>
          ))}
        </div>
      </div>

      <section className="layout-split" style={{ display: 'flex' }}>
        <div className="bias-analysis-content" style={{ padding: isMobile ? '24px 16px' : '80px 60px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            <div style={{ marginBottom: '80px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '16px', letterSpacing: '3px' }}>
                {periodLabel(period)}
              </div>
              <h2 style={{ fontSize: isMobile ? '42px' : '80px', fontWeight: 800, letterSpacing: isMobile ? '-2px' : '-5px', lineHeight: isMobile ? '1.1' : '0.9', marginBottom: '24px' }}>
                Mi Sesgo de Lectura.
              </h2>
              <p style={{ fontSize: '18px', opacity: 0.5, maxWidth: '700px', lineHeight: '1.5', margin: '0 auto' }}>
                Un resumen de tus patrones de lectura, diversidad de fuentes y puntos ciegos para equilibrar tu dieta informativa.
              </p>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '1px', background: 'black', border: '1px solid black', marginBottom: isMobile ? '48px' : '100px' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: 'white', padding: '40px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '24px', letterSpacing: '1px' }}>{s.label}</div>
                  <div style={{ fontSize: '38px', fontWeight: 800, marginBottom: '8px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', fontWeight: 800 }}>{s.meta}</div>
                  <div style={{ fontSize: '11px', opacity: 0.3, marginTop: '4px', fontWeight: 700 }}>{s.detail}</div>
                </div>
              ))}
            </div>

            {/* 1. Distribución Ideológica */}
            <section style={{ marginBottom: '160px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '60px', letterSpacing: '-1px', borderBottom: '2px solid black', paddingBottom: '20px' }}>Distribución Ideológica</h3>
              {sourceBreakdown.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, letterSpacing: '1px' }}>
                  SIN DATOS PARA ESTE PERÍODO
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
                  {sourceBreakdown.map((source, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 48px' : '200px 1fr 100px', alignItems: 'center', gap: isMobile ? '12px' : '60px', padding: '24px 0', borderBottom: '0.5px solid #eee' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700 }}>{source.name}</div>
                      <div style={{ height: '6px', background: '#f5f5f5', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${source.pct}%`, height: '100%', background: 'black', borderRadius: '10px' }} />
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 800 }}>{source.pct}%</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. Distribución de Sesgo */}
            <section style={{ marginBottom: '180px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '60px', letterSpacing: '-1px', borderBottom: '2px solid black', paddingBottom: '20px' }}>Distribución de Sesgo</h3>
              {!realStats ? (
                <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, letterSpacing: '1px' }}>
                  SIN DATOS PARA ESTE PERÍODO
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    { theme: 'IZQUIERDA', pct: leftPct },
                    { theme: 'CENTRO', pct: centerPct },
                    { theme: 'DERECHA', pct: rightPct },
                  ].map((t, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 48px' : '200px 1fr 100px', alignItems: 'center', gap: isMobile ? '12px' : '80px', padding: '30px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700 }}>{t.theme}</div>
                      <div style={{ height: '24px', background: '#f5f5f5', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${t.pct}%`, height: '100%', background: 'black' }} />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{t.pct}%</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Blindspots and Balance */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '80px', marginBottom: isMobile ? '80px' : '180px' }}>
              <div style={{ padding: '60px', border: 'var(--border-thin)', borderRadius: '32px', background: '#fcfcfc' }}>
                <h3 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px' }}>Logros</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {achievements.map((a, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700 }}>{a.label}</div>
                      <span style={{
                        fontSize: '10px', fontWeight: 800, padding: '4px 12px',
                        background: a.status === 'COMPLETO' ? 'black' : 'white',
                        color: a.status === 'COMPLETO' ? 'white' : 'black',
                        border: '1px solid black', borderRadius: '6px'
                      }}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '60px', border: 'var(--border-thin)', borderRadius: '32px' }}>
                <h3 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px' }}>Para equilibrar</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {balanceTips.map((tip, i) => (
                    <div key={i} style={{ fontSize: '15px', fontWeight: 600, display: 'flex', gap: '20px', lineHeight: '1.6' }}>
                      <span style={{ minWidth: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '8px', height: '8px', background: 'black', borderRadius: '50%' }} /></span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Resumen de Perfil */}
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
                  "{profileSummary}"
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '24px' : '60px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '60px' }}>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.4, marginBottom: '16px', letterSpacing: '1px' }}>FUENTES ÚNICAS</div>
                    <p style={{ fontSize: '15px', opacity: 0.8, lineHeight: '1.6' }}>{realStats ? `${realStats.unique_sources} medios distintos en este período.` : 'Sin datos aún.'}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.4, marginBottom: '16px', letterSpacing: '1px' }}>TIEMPO DE LECTURA</div>
                    <p style={{ fontSize: '15px', opacity: 0.8, lineHeight: '1.6' }}>{realStats ? `${Math.round(realStats.total_seconds / 60)} minutos totales registrados.` : 'Sin datos aún.'}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.4, marginBottom: '16px', letterSpacing: '1px' }}>ÍNDICE DIVERSIDAD</div>
                    <p style={{ fontSize: '15px', opacity: 0.8, lineHeight: '1.6' }}>{realStats ? `${realStats.diversity_pct}% — ${realStats.diversity_pct >= 60 ? 'Patrón equilibrado.' : 'Recomienda ampliar espectro.'}` : 'Sin datos aún.'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Evolución */}
            <section style={{ marginBottom: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', borderBottom: '2px solid black', paddingBottom: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-1.5px' }}>Apertura Crítica e Índice de Diversidad</h3>
                  <div style={{ fontSize: '12px', marginTop: '12px', opacity: 0.5, fontWeight: 700 }}>EVOLUCIÓN DE LA SALUD INFORMATIVA • PERÍODO SELECCIONADO</div>
                </div>
              </div>

              <div style={{ height: '350px', width: '100%', position: 'relative', marginTop: '60px' }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  <line x1="0" y1="50" x2="1000" y2="50" stroke="#f5f5f5" strokeWidth="1" />
                  <line x1="0" y1="150" x2="1000" y2="150" stroke="#000" strokeWidth="0.3" strokeDasharray="6 6" />
                  <line x1="0" y1="250" x2="1000" y2="250" stroke="#f5f5f5" strokeWidth="1" />
                  <path d="M0,250 C100,240 200,260 300,245 S500,255 600,240 S800,250 1000,230" fill="none" stroke="#ddd" strokeWidth="2" strokeDasharray="8 4" />
                  <path d="M0,250 C100,220 200,180 300,150 S500,130 600,100 S800,70 1000,60" fill="none" stroke="black" strokeWidth="5" strokeLinecap="round" />
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

              {recentHistory.length === 0 ? (
                <div style={{ padding: '80px', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', border: '1px solid #eee', borderRadius: '32px' }}>
                  AÚN NO HAS LEÍDO NINGUNA HISTORIA
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {recentHistory.map((entry, i) => {
                    const story = recentStories[i];
                    const readDate = new Date(entry.read_at);
                    const diffH = Math.round((Date.now() - readDate.getTime()) / 3600000);
                    const timeAgo = diffH < 1 ? 'hace menos de 1 hora' : diffH < 24 ? `hace ${diffH} horas` : diffH < 48 ? 'ayer' : `hace ${Math.round(diffH / 24)} días`;
                    const biasD = story?.bias || {};
                    const leftP = biasD.left || 0;
                    const centerP = biasD.center || 0;
                    const rightP = biasD.right || 0;
                    return (
                      <div key={i} style={{ padding: '40px', border: '2px solid black', borderRadius: '32px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '6px 16px', border: '1px solid black', borderRadius: '100px' }}>{story?.category || 'LEÍDO'}</span>
                          <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, fontFamily: 'var(--font-mono)' }}>{timeAgo.toUpperCase()}</span>
                        </div>
                        <h5 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', lineHeight: '1.2', margin: '0 0 16px 0' }}>
                          {story?.title || `Historia ${entry.story_id}`}
                        </h5>
                        {story?.summary && (
                          <p style={{ fontSize: '14px', opacity: 0.5, margin: '0 0 24px 0', lineHeight: '1.5' }}>
                            {story.summary.substring(0, 140)}{story.summary.length > 140 ? '…' : ''}
                          </p>
                        )}
                        {(leftP + centerP + rightP) > 0 && (
                          <div style={{ marginTop: 'auto' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: '8px' }}>Media Bias Spectrum</div>
                            <div style={{ display: 'flex', height: '4px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${leftP}%`, background: '#000' }} />
                              <div style={{ width: `${centerP}%`, background: '#666' }} />
                              <div style={{ width: `${rightP}%`, background: '#ccc' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
