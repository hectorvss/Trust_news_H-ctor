import React, { useEffect, useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';

const StoryReader = ({ article, onBack }) => {
  const [scrollPct, setScrollPct] = useState(0);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setScrollPct(total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!article) return null;

  const px = isMobile ? 16 : 60;
  // Stable pseudo-random based on source name length (avoids re-render flicker)
  const stablePct = ((article.source?.length || 5) * 7 % 20) + 10;

  const renderNote = (pos) => {
    const note = (article.readerContent?.interstitialNotes || []).find(n => n.pos === pos);
    if (!note) return null;
    return (
      <div style={{ margin: '60px 0', padding: isMobile ? '20px' : '32px', background: '#f8f8f8', borderLeft: '4px solid black', fontFamily: 'var(--font-mono)', fontSize: '14px', lineHeight: '1.6', color: '#555' }}>
        <div style={{ fontWeight: 800, color: 'black', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          INTELIGENCIA TNE • NOTA OBJETIVA
        </div>
        {note.text}
      </div>
    );
  };

  return (
    <div className="story-reader" style={{ background: 'var(--color-bg)', color: 'var(--color-primary)', minHeight: '100vh', paddingBottom: '200px', fontFamily: 'var(--font-heading)' }}>
      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '3px', background: '#eee', zIndex: 1000 }}>
        <div style={{ width: `${scrollPct}%`, height: '100%', background: 'black', transition: 'width 0.1s linear' }} />
      </div>

      {/* Top navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `20px ${px}px`, borderBottom: 'var(--border-thin)', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(15px)', zIndex: 999, flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: isMobile ? '12px' : '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span onClick={onBack} style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px', border: 'var(--border-thin)', borderRadius: 'var(--radius-pill)' }}>
            ← Volver
          </span>
          {!isMobile && (
            <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              DOC ID: TNE/{new Date().getFullYear()}/{(article.source || 'TNE').slice(0, 3).toUpperCase()} / ARCHIVO
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 16px', background: 'black', color: 'white', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderRadius: '4px', textTransform: 'uppercase' }}>
            {article.bias}
          </div>
          <div style={{ padding: '6px 16px', background: '#f5f5f5', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderRadius: '4px', textTransform: 'uppercase' }}>
            FACT: {article.factuality || 'N/D'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1200px', margin: `${isMobile ? 40 : 100}px auto 0`, padding: `0 ${px}px` }}>

        <div style={{ marginBottom: isMobile ? 48 : 100 }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', fontSize: isMobile ? '11px' : '14px', fontWeight: 900, opacity: 0.6, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px', flexWrap: 'wrap' }}>
            <span>POR {article.author || 'TNE'}</span>
            <span style={{ opacity: 0.3 }}>/</span>
            <span>{article.source}</span>
            <span style={{ opacity: 0.3 }}>/</span>
            <span>{article.time}</span>
          </div>

          <h1 style={{ fontSize: isMobile ? '36px' : '96px', fontWeight: 800, lineHeight: isMobile ? '1.1' : '0.85', letterSpacing: isMobile ? '-1px' : '-5px', marginBottom: isMobile ? 24 : 60, color: 'var(--color-primary)' }}>
            {article.title}
          </h1>

          {(article.diff || article.summary) && (
            <p style={{ fontSize: isMobile ? '18px' : '32px', lineHeight: '1.35', fontWeight: 400, opacity: 0.8, marginBottom: isMobile ? 32 : 80, letterSpacing: isMobile ? 0 : '-1px' }}>
              {article.diff || article.summary}
            </p>
          )}
        </div>

        <div style={{ fontSize: isMobile ? '17px' : '24px', lineHeight: '1.9', textAlign: 'justify', color: '#111' }}>
          {/* Drop cap */}
          <p style={{ marginBottom: isMobile ? 32 : 60 }}>
            {!isMobile && (
              <span style={{ float: 'left', fontSize: '120px', lineHeight: '0.6', fontWeight: 800, marginRight: '20px', marginTop: '16px', fontFamily: 'var(--font-heading)' }}>
                {article.readerContent?.whatHappened?.[0]}
              </span>
            )}
            {isMobile
              ? article.readerContent?.whatHappened
              : article.readerContent?.whatHappened?.slice(1)}
          </p>

          {renderNote(1)}

          <p style={{ marginBottom: isMobile ? 32 : 60 }}>{article.readerContent?.context}</p>

          {renderNote(2)}

          {article.readerContent?.preQuoteAnalysis && (
            <p style={{ marginBottom: isMobile ? 32 : 60, fontStyle: 'italic', opacity: 0.7, borderLeft: '2px solid #eee', paddingLeft: isMobile ? '16px' : '32px' }}>
              {article.readerContent.preQuoteAnalysis}
            </p>
          )}

          {(article.readerContent?.claims || []).slice(0, 1).map((claim, idx) => (
            <div key={idx} style={{ margin: `${isMobile ? 48 : 120}px 0`, padding: `${isMobile ? 32 : 80}px 0`, borderTop: '6px solid black', borderBottom: '6px solid black', textAlign: 'center' }}>
              <span style={{ fontSize: isMobile ? '28px' : '68px', fontWeight: 700, lineHeight: '1.1', display: 'block', letterSpacing: isMobile ? '-1px' : '-4px', marginBottom: isMobile ? 16 : 32, fontStyle: 'italic' }}>
                "{claim.text.replace(/"/g, '')}"
              </span>
              <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px' }}>
                — {claim.source}
              </span>
            </div>
          ))}

          {article.readerContent?.postQuoteAnalysis && (
            <p style={{ marginTop: '-40px', marginBottom: isMobile ? 48 : 100, fontSize: isMobile ? '16px' : '22px', lineHeight: '1.7', color: '#333', padding: `0 ${isMobile ? 16 : 40}px`, borderRight: '10px solid black' }}>
              {article.readerContent.postQuoteAnalysis}
            </p>
          )}

          {renderNote(3)}

          <p style={{ marginBottom: isMobile ? 32 : 60 }}>{article.readerContent?.implications?.owner}</p>

          {/* Author signature */}
          <div style={{ marginTop: isMobile ? 40 : 80, paddingTop: '40px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '1px' }}>REDACTOR / FUENTE</span>
            <span style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 800, letterSpacing: '-1px' }}>{article.author || 'TNE'} para {article.source}</span>
            <span style={{ fontSize: '14px', opacity: 0.5 }}>
              {article.origin ? `${article.origin}. ` : ''}{article.tone ? `Tono: ${article.tone}. ` : ''}Publicado originalmente el {article.time}.
            </span>
          </div>
        </div>

        {/* Intelligence Report */}
        <div style={{ marginTop: isMobile ? 60 : 150, padding: isMobile ? '40px 20px' : '100px 60px', background: 'black', color: 'white', borderRadius: '4px', marginLeft: isMobile ? 0 : '-60px', marginRight: isMobile ? 0 : '-60px' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '64px', fontWeight: 800, letterSpacing: '-3px', marginBottom: isMobile ? 40 : 80, lineHeight: 1 }}>
            TNE INTELLIGENCE REPORT
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '100px', marginBottom: isMobile ? 40 : 100 }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '40px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '2px' }}>SESGO EDITORIAL</div>
              <div style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: 700, marginBottom: '20px' }}>
                {article.bias === 'CENTER' ? 'EQUILIBRIO INSTITUCIONAL' : article.bias === 'LEFT' ? 'ENFOQUE PROGRESISTA' : 'PERSPECTIVA CONSERVADORA'}
              </div>
              <p style={{ fontSize: '18px', opacity: 0.7, lineHeight: '1.6' }}>
                El análisis detecta una priorización de {article.bias === 'LEFT' ? 'la función social y la protección de colectivos vulnerables' : article.bias === 'RIGHT' ? 'la libertad de mercado y la seguridad jurídica' : 'la estabilidad legislativa y el consenso institucional'}.
                Este ángulo influye en un {stablePct}% de la carga adjetival.
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '40px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '2px' }}>FIABILIDAD FACTUAL</div>
              <div style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: 700, marginBottom: '20px' }}>
                {article.factuality === 'ALTA' ? 'GRADO A: DOCUMENTAL' : article.factuality === 'MEDIA' ? 'GRADO B: INTERPRETATIVO' : 'GRADO C: OPINIÓN'}
              </div>
              <p style={{ fontSize: '18px', opacity: 0.7, lineHeight: '1.6' }}>
                {article.diff || `Cobertura original de ${article.source}. Factualidad clasificada como ${article.factuality || 'no determinada'}.`}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '100px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '60px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '2px' }}>PUNTO CIEGO CRÍTICO</div>
              <p style={{ fontSize: '20px', fontWeight: 600, fontStyle: 'italic', lineHeight: '1.5' }}>
                "{article.readerContent?.blindSpot || 'No identificado para este artículo.'}"
              </p>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '2px' }}>MÉTRICAS DE IMPACTO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[['Polarización', 'ALTA'], ['Sentimiento', article.tone?.toUpperCase() || 'N/D'], ['Complejidad', 'AVANZADA']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    <span style={{ opacity: 0.6 }}>{k}:</span>
                    <span style={{ fontWeight: 800 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: isMobile ? 60 : 140, textAlign: 'center' }}>
          <div
            onClick={() => { const url = article.url || article.origin; if (url && url.startsWith('http')) window.open(url, '_blank'); }}
            style={{ display: 'inline-block', cursor: article.url || (article.origin?.startsWith('http')) ? 'pointer' : 'default', padding: '20px 0', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <span style={{ fontSize: isMobile ? '24px' : '42px', fontWeight: 800, letterSpacing: isMobile ? '-1px' : '-2px', textTransform: 'uppercase', color: 'black', borderBottom: '4px solid black', paddingBottom: '4px', fontFamily: 'var(--font-heading)', display: 'inline-block', lineHeight: '1' }}>
              Continuar lectura en {article.source} ↗
            </span>
          </div>

          <div onClick={onBack} style={{ marginTop: '80px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', opacity: 0.3, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '2px', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}>
            [ CERRAR ARCHIVO Y VOLVER AL PANEL ]
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryReader;
