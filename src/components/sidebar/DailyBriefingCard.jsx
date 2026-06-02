import React from 'react';

/**
 * Daily Briefing — faithful adaptation of the Ground News briefing block
 * (Home frame, node 9:6511): lead story cover image, a "N historias •
 * M artículos • Xm lectura" stats line, the lead headline + summary, and a
 * run-on "+ más" list of the next headlines. Wired to real stories; falls
 * back to editorial globalHeadlines while the feed is still loading.
 */
const DailyBriefingCard = ({ navigate, stories = [], globalHeadlines = [], storiesCount }) => {
  const lead = stories[0] || null;
  const rest = stories.slice(1, 5);
  const leadImage = lead && lead.image_url ? lead.image : null;

  const articleEst = stories.slice(0, 5).reduce((a, s) => a + (s.totalSources || s.sourceCount || 0), 0)
    || Math.round((storiesCount || 0) * 4.2);
  const readEst = Math.max(2, Math.round((storiesCount || stories.length || 0) * 0.3));

  const dateStr = new Date()
    .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase();

  return (
    <div
      onClick={() => navigate('/daily-summary')}
      style={{ padding: '24px', border: 'var(--border-thin)', borderRadius: 'var(--radius-sm)', marginBottom: '32px', background: '#fff', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', gap: '10px' }}>
        <span style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.6px' }}>Resumen Diario</span>
        <span style={{ fontSize: '9px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.3, letterSpacing: '1px', textAlign: 'right', whiteSpace: 'nowrap' }}>{dateStr}</span>
      </div>

      {leadImage && (
        <div style={{ width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', border: 'var(--border-thin)', marginBottom: '12px' }}>
          <img src={leadImage} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '0.5px', marginBottom: lead ? '14px' : '20px' }}>
        {storiesCount || stories.length || '—'} historias • {articleEst} artículos • {readEst}m lectura
      </div>

      {lead ? (
        <>
          <h3 style={{ fontSize: '19px', fontFamily: 'var(--font-heading)', fontWeight: 800, lineHeight: '1.15', letterSpacing: '-0.6px', margin: '0 0 8px 0' }}>{lead.title}</h3>
          {lead.summary && (
            <p style={{ fontSize: '13px', lineHeight: '1.45', opacity: 0.55, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lead.summary}</p>
          )}
          {rest.length > 0 && (
            <p style={{ fontSize: '13px', lineHeight: '1.55', margin: 0 }}>
              <span style={{ fontWeight: 900, marginRight: '5px' }}>+</span>
              {rest.map((s, i) => (
                <span key={s.id || i} style={{ fontWeight: 600, opacity: 0.7 }}>{s.title}{i < rest.length - 1 ? '; ' : '. '}</span>
              ))}
              <span style={{ fontWeight: 600, opacity: 0.5 }}>y más.</span>
            </p>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(globalHeadlines || []).map((h, i) => (
            <p key={i} style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>{h.t}</p>
          ))}
        </div>
      )}

      <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.35, marginTop: '20px', letterSpacing: '0.5px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        VER RESUMEN COMPLETO ↗
      </div>
    </div>
  );
};

export default DailyBriefingCard;
