import React, { useEffect, useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';

const StoryReader = ({ article, onBack }) => {
  const [scrollPct, setScrollPct] = useState(0);
  const { isMobile } = useBreakpoint();
  const topOffset = 72;

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

  // Etiquetas del Intelligence Report derivadas de datos REALES del catálogo
  // (bias/factuality de la fuente), sin métricas inventadas.
  const bias = (article.biasRating || article.bias || 'CENTER').toUpperCase();
  const biasLabel = bias === 'LEFT' ? 'IZQUIERDA' : bias === 'RIGHT' ? 'DERECHA' : 'CENTRO';
  const biasDesc = bias === 'LEFT'
    ? 'Su línea editorial tiende a priorizar la función social y los colectivos vulnerables.'
    : bias === 'RIGHT'
      ? 'Su línea editorial tiende a priorizar el mercado, la iniciativa privada y la seguridad jurídica.'
      : 'Cobertura de línea centrada, con tendencia al equilibrio institucional.';
  const fact = (article.factuality || '').toUpperCase();
  const factLabel = fact === 'ALTA' ? 'ALTA · DOCUMENTAL'
    : fact === 'MIXTA' || fact === 'MEDIA' ? 'MIXTA · INTERPRETATIVA'
    : fact === 'BAJA' ? 'BAJA · OPINIÓN'
    : 'NO CLASIFICADA';
  const factDesc = fact
    ? `Fiabilidad factual clasificada como ${fact} para ${article.source} en el catálogo TNE.`
    : `Factualidad no determinada para ${article.source}.`;

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
      <div style={{ position: 'fixed', top: `${topOffset}px`, left: 0, width: '100%', height: '3px', background: '#eee', zIndex: 1000 }}>
        <div style={{ width: `${scrollPct}%`, height: '100%', background: 'black', transition: 'width 0.1s linear' }} />
      </div>

      {/* Top navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `20px ${px}px`, borderBottom: 'var(--border-thin)', position: 'sticky', top: `${topOffset}px`, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(15px)', zIndex: 999, flexWrap: 'wrap', gap: '8px' }}>
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
      <div style={{ maxWidth: '1200px', margin: `${isMobile ? 32 : 72}px auto 0`, padding: `0 ${px}px` }}>

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
          {(() => {
            // Pieza propia desarrollada: párrafos en readerContent.body (nuevo) o,
            // como fallback, los campos estructurados antiguos.
            const rc = article.readerContent || {};
            const paras = Array.isArray(rc.body) && rc.body.length
              ? rc.body.filter(p => p && String(p).trim())
              : [rc.whatHappened, rc.context, rc.postQuoteAnalysis, rc.implications?.owner].filter(p => p && String(p).trim());
            const quote = (rc.claims || [])[0];
            // Inserta la cita destacada tras el 2º párrafo (o al final si hay menos).
            const quoteAfter = Math.min(2, paras.length);
            if (!paras.length) {
              return <p style={{ opacity: 0.5, fontStyle: 'italic' }}>{article.summary || article.teaser || 'Análisis en preparación.'}</p>;
            }
            return paras.map((para, idx) => (
              <React.Fragment key={idx}>
                <p style={{ marginBottom: isMobile ? 28 : 48 }}>
                  {idx === 0 && !isMobile && (
                    <span style={{ float: 'left', fontSize: '120px', lineHeight: '0.6', fontWeight: 800, marginRight: '20px', marginTop: '16px', fontFamily: 'var(--font-heading)' }}>
                      {String(para).charAt(0)}
                    </span>
                  )}
                  {idx === 0 && !isMobile ? String(para).slice(1) : para}
                </p>
                {idx === 0 && renderNote(1)}
                {idx === quoteAfter - 1 && quote?.text && (
                  <div style={{ margin: `${isMobile ? 40 : 90}px 0`, padding: `${isMobile ? 28 : 60}px 0`, borderTop: '6px solid black', borderBottom: '6px solid black', textAlign: 'center' }}>
                    <span style={{ fontSize: isMobile ? '26px' : '54px', fontWeight: 700, lineHeight: '1.15', display: 'block', letterSpacing: isMobile ? '-1px' : '-3px', marginBottom: isMobile ? 16 : 28, fontStyle: 'italic' }}>
                      "{String(quote.text).replace(/"/g, '')}"
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px' }}>
                      — {quote.source}
                    </span>
                  </div>
                )}
                {idx === 1 && renderNote(2)}
              </React.Fragment>
            ));
          })()}

          {renderNote(3)}

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
              <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '2px' }}>SESGO EDITORIAL DE LA FUENTE</div>
              <div style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: 700, marginBottom: '20px' }}>
                {biasLabel}
              </div>
              <p style={{ fontSize: '18px', opacity: 0.7, lineHeight: '1.6' }}>
                Clasificación del catálogo TNE para <strong>{article.source}</strong>. {biasDesc}
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '40px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '2px' }}>FIABILIDAD FACTUAL</div>
              <div style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: 700, marginBottom: '20px' }}>
                {factLabel}
              </div>
              <p style={{ fontSize: '18px', opacity: 0.7, lineHeight: '1.6' }}>
                {factDesc}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '100px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '60px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '2px' }}>QUÉ APORTA ESTA FUENTE</div>
              <p style={{ fontSize: '20px', fontWeight: 600, fontStyle: 'italic', lineHeight: '1.5' }}>
                {article.readerContent?.blindSpot || article.whyOpened || `Cobertura de ${article.source} sobre esta noticia.`}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '24px', letterSpacing: '2px' }}>FICHA DE LA PIEZA</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  ['Medio', article.source],
                  ['Tipo', article.type || 'Noticia'],
                  ['Tono', article.tone || 'N/D'],
                  ['Propiedad', article.ownershipCategory || 'N/D'],
                  ['Ámbito', article.origin || 'Nacional'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    <span style={{ opacity: 0.6 }}>{k}:</span>
                    <span style={{ fontWeight: 800, textAlign: 'right' }}>{v}</span>
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
