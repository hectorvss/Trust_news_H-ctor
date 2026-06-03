import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';
import { MiniBiasBar } from './coverage';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SPAIN_LOCATION_RE = /espana|españa|madrid|barcelona|sevilla|valencia|bilbao|galicia|andaluc|catalu|pais vasco|zaragoza|murcia|malaga|alicante|castilla|extremadura|asturias|navarra|canarias|balear/i;

const clampText = (value, limit = 180) => {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

const isInternationalStory = (story) => {
  const haystack = [story.location, story.category, story.title, story.summary].filter(Boolean).join(' ').toLowerCase();
  return !SPAIN_LOCATION_RE.test(haystack);
};

const getDistribution = (story) => {
  const dist = story.biasDistribution || story.bias;
  if (!dist) return null;

  const left = Math.max(0, Number(dist.left) || 0);
  const center = Math.max(0, Number(dist.center) || 0);
  const right = Math.max(0, Number(dist.right) || 0);
  const total = left + center + right;

  if (total <= 0) return null;

  return {
    left: Math.round((left / total) * 100),
    center: Math.round((center / total) * 100),
    right: Math.round((right / total) * 100)
  };
};

const classifyBlindspot = (story) => {
  const distribution = getDistribution(story);
  if (!distribution) return null;

  const sourceCount = story.totalSources || story.sourceCount || story.articles?.length || 0;
  const strongest = Math.max(distribution.left, distribution.center, distribution.right);
  const sideGap = Math.abs(distribution.left - distribution.right);
  const blindSpotText = story.blindSpot || story.analyticalSnippet || story.summary || '';
  const dominantLean =
    distribution.left >= distribution.right && distribution.left >= distribution.center
      ? 'LEFT'
      : distribution.right >= distribution.center
        ? 'RIGHT'
        : 'CENTER';

  if (!(dominantLean === 'LEFT' || dominantLean === 'RIGHT')) return null;

  const isStrongCandidate = sideGap >= 18 || strongest >= 45 || Boolean(story.blindSpot);
  if (!isStrongCandidate) return null;

  const group = dominantLean === 'LEFT' ? 'for-right' : 'for-left';
  const missingSideLabel = dominantLean === 'LEFT' ? 'For the Right' : 'For the Left';
  const coverageLabel = dominantLean === 'LEFT' ? 'Only on Left' : 'Only on Right';

  return {
    ...story,
    blindspotGroup: group,
    missingSideLabel,
    coverageLabel,
    blindspotSummary: clampText(blindSpotText, 190),
    distribution,
    sourceCount,
    imbalanceScore: sideGap * 3 + strongest + Math.min(sourceCount, 60)
  };
};

const StoryBlindspotCard = ({ entry, onSelectStory, isFavorite, onToggleFavorite, onShare, isMobile }) => {
  const hasImage = !!entry.image_url;

  return (
    <article
      onClick={() => onSelectStory(entry)}
      style={{
        border: 'var(--border-thin)',
        borderRadius: 'var(--radius-sm)',
        background: '#fff',
        padding: isMobile ? '18px' : '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        cursor: 'pointer',
        minHeight: '100%'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="tag" style={{ padding: '4px 10px' }}>BLINDSPOT</span>
          <span className="tag" style={{ padding: '4px 10px', background: 'black', color: 'white', borderColor: 'black' }}>
            {entry.coverageLabel.toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.45, letterSpacing: '1px' }}>
          {entry.time || 'RECIENTE'}
        </span>
      </div>

      {hasImage && (
        <div style={{ borderRadius: '18px', overflow: 'hidden', border: 'var(--border-thin)', aspectRatio: '16 / 9' }}>
          <img src={entry.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: isMobile ? '22px' : '26px', lineHeight: 1.08, letterSpacing: isMobile ? '-0.8px' : '-1.2px', fontWeight: 800 }}>
          {entry.title}
        </h3>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, opacity: 0.68 }}>
          {entry.blindspotSummary}
        </p>
      </div>

      <div style={{ border: '1px solid #ececec', borderRadius: '18px', padding: '14px 14px 12px', background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <MiniBiasBar distribution={entry.distribution} width={92} height={8} />
            <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
              {entry.sourceCount} FUENTES
            </span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.55 }}>
            {entry.location || entry.category || 'TNE'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 38px', gap: '10px', alignItems: 'center' }}>
          {[
            ['LEFT', entry.distribution.left],
            ['CENTER', entry.distribution.center],
            ['RIGHT', entry.distribution.right]
          ].map(([label, value]) => (
            <React.Fragment key={label}>
              <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.55 }}>{label}</span>
              <div style={{ height: '4px', background: '#ededed', overflow: 'hidden', borderRadius: '999px' }}>
                <div
                  style={{
                    width: `${value}%`,
                    height: '100%',
                    background: label === 'LEFT' ? '#000' : label === 'CENTER' ? '#777' : '#c8c8c8'
                  }}
                />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{value}%</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(entry);
            }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '999px',
              border: '1px solid black',
              background: isFavorite ? 'black' : 'white',
              color: isFavorite ? 'white' : 'black',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 900
            }}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar'}
          >
            {isFavorite ? 'X' : '+'}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onShare(entry);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '999px',
              border: '1px solid black',
              background: 'white',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '1px'
            }}
          >
            COMPARTIR
          </button>
        </div>

        <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
          VER HISTORIA {'->'}
        </span>
      </div>
    </article>
  );
};

const BlindspotFeed = ({ stories = [], appConfig = {}, onSelectStory, favStoryIds, toggleFavorite, openShare }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const explainerRef = useRef(null);
  const newsletterRef = useRef(null);
  const [scope, setScope] = useState('ALL');
  const [activeTopic, setActiveTopic] = useState('TODO');

  const blindspotStories = useMemo(() => {
    return (stories || [])
      .map(classifyBlindspot)
      .filter(Boolean)
      .sort((a, b) => b.imbalanceScore - a.imbalanceScore);
  }, [stories]);

  const topicOptions = useMemo(() => {
    const fromStories = blindspotStories
      .map((story) => story.category)
      .filter(Boolean)
      .reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

    const sortedStoryTopics = Object.entries(fromStories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category]) => category);

    const trending = (appConfig.trending_topics || []).slice(0, 4);
    return ['TODO', ...new Set([...sortedStoryTopics, ...trending])];
  }, [blindspotStories, appConfig]);

  const filteredStories = useMemo(() => {
    return blindspotStories.filter((story) => {
      if (scope === 'SPAIN' && isInternationalStory(story)) return false;
      if (scope === 'INTERNATIONAL' && !isInternationalStory(story)) return false;

      if (activeTopic !== 'TODO') {
        const haystack = [story.title, story.summary, story.blindSpot, story.category, story.location].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(String(activeTopic).toLowerCase())) return false;
      }

      return true;
    });
  }, [blindspotStories, scope, activeTopic]);

  const forLeft = filteredStories.filter((story) => story.blindspotGroup === 'for-left');
  const forRight = filteredStories.filter((story) => story.blindspotGroup === 'for-right');
  const trendingTopics = (appConfig.trending_topics || []).slice(0, 10);
  const avgSources = filteredStories.length > 0
    ? Math.round(filteredStories.reduce((sum, story) => sum + story.sourceCount, 0) / filteredStories.length)
    : 0;

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: isMobile ? '32px 16px 80px' : '48px var(--page-padding) 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-start', flexDirection: isTablet ? 'column' : 'row', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '2px', opacity: 0.35, marginBottom: '14px' }}>
            TNE / BLINDSPOT
          </div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '44px' : '72px', lineHeight: 0.95, letterSpacing: isMobile ? '-2px' : '-4px', fontWeight: 800 }}>
            Blindspot.
          </h1>
          <p style={{ margin: '18px 0 0', maxWidth: '760px', fontSize: isMobile ? '16px' : '20px', lineHeight: 1.5, opacity: 0.7 }}>
            Historias desproporcionadamente cubiertas por un lado del espectro politico. Misma idea que Ground News, pero traducida a tu sistema editorial, tus datos y tu UI.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(110px, 1fr))', gap: '1px', background: 'black', border: '1px solid black', width: isTablet ? '100%' : '420px', flexShrink: 0 }}>
          {[
            { label: 'For the Left', value: forLeft.length },
            { label: 'For the Right', value: forRight.length },
            { label: 'Fuentes medias', value: avgSources || '-' }
          ].map((item) => (
            <div key={item.label} style={{ background: 'white', padding: isMobile ? '16px 14px' : '18px 16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.45, marginBottom: '8px', letterSpacing: '1px' }}>
                {item.label.toUpperCase()}
              </div>
              <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: 800, letterSpacing: '-1px' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {[
          ['ALL', 'Todo'],
          ['SPAIN', 'Espana'],
          ['INTERNATIONAL', 'Internacional']
        ].map(([value, label]) => {
          const active = scope === value;
          return (
            <button
              key={value}
              onClick={() => setScope(value)}
              style={{
                padding: '10px 16px',
                borderRadius: '999px',
                border: '1px solid black',
                background: active ? 'black' : 'white',
                color: active ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '1px'
              }}
            >
              {label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {topicOptions.map((topic) => {
          const active = activeTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: '1px solid #d9d9d9',
                background: active ? '#111' : '#fafafa',
                color: active ? 'white' : 'black',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 800
              }}
            >
              {topic}
            </button>
          );
        })}
      </div>

      <div style={{ border: 'var(--border-thin)', padding: isMobile ? '18px 16px' : '20px 22px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px', flexDirection: isMobile ? 'column' : 'row', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.45, letterSpacing: '1px', marginBottom: '6px' }}>
            NUEVO EN BLINDSPOT
          </div>
          <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800 }}>
            Descubre por que una historia se convierte en blindspot y como leerla bien.
          </div>
        </div>
        <button
          onClick={() => scrollTo(explainerRef)}
          style={{ padding: '12px 16px', border: '1px solid black', background: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', whiteSpace: 'nowrap' }}
        >
          COMO FUNCIONA
        </button>
      </div>

      <div style={{ border: 'var(--border-thin)', padding: isMobile ? '18px 16px' : '20px 22px', background: 'black', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px', flexDirection: isMobile ? 'column' : 'row', marginBottom: '42px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.55, letterSpacing: '1px', marginBottom: '6px' }}>
            BOLETIN BLINDSPOT
          </div>
          <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800 }}>
            Suscribete para recibir los blindspots mas potentes antes de que dominen la conversacion.
          </div>
        </div>
        <button
          onClick={() => scrollTo(newsletterRef)}
          style={{ padding: '12px 16px', border: '1px solid white', background: 'white', color: 'black', cursor: 'pointer', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px', whiteSpace: 'nowrap' }}
        >
          APUNTARME
        </button>
      </div>

      <section ref={explainerRef} style={{ marginBottom: '42px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.1fr 1fr', gap: '1px', background: 'black', border: '1px solid black' }}>
          <div style={{ background: 'white', padding: isMobile ? '22px 18px' : '28px' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.45, letterSpacing: '1px', marginBottom: '12px' }}>
              QUE ESTAS VIENDO
            </div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '28px' : '34px', letterSpacing: '-1px', lineHeight: 1.05 }}>
              Un feed editorial de historias que un lado esta cubriendo mucho mas que el otro.
            </h2>
          </div>
          <div style={{ background: 'white', padding: isMobile ? '22px 18px' : '28px', display: 'grid', gap: '18px' }}>
            {[
              'For the Left: historias con poca o ninguna cobertura en medios de izquierda.',
              'For the Right: historias con poca o ninguna cobertura en medios de derecha.',
              'Cada tarjeta usa tu distribucion real de cobertura, numero de fuentes y el blind spot sintetizado.'
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: '12px', fontSize: '14px', lineHeight: 1.55 }}>
                <div style={{ width: '10px', height: '10px', background: 'black', marginTop: '6px', flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: isMobile ? '24px' : '32px', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', marginBottom: '18px', borderBottom: '2px solid black', paddingBottom: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '30px' : '36px', letterSpacing: '-1px' }}>For the Left</h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.55 }}>Historias con poca o ninguna cobertura en la izquierda.</p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.45 }}>{forLeft.length} HISTORIAS</span>
          </div>

          <div style={{ display: 'grid', gap: '18px' }}>
            {forLeft.length > 0 ? (
              forLeft.map((entry) => (
                <StoryBlindspotCard
                  key={entry.id}
                  entry={entry}
                  onSelectStory={onSelectStory}
                  isFavorite={favStoryIds.has(String(entry.id))}
                  onToggleFavorite={toggleFavorite}
                  onShare={openShare}
                  isMobile={isMobile}
                />
              ))
            ) : (
              <div style={{ border: 'var(--border-thin)', padding: '32px 24px', background: '#fafafa', fontSize: '14px', lineHeight: 1.6, opacity: 0.7 }}>
                No hay historias que cumplan el umbral actual para esta columna con los filtros activos.
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', marginBottom: '18px', borderBottom: '2px solid black', paddingBottom: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '30px' : '36px', letterSpacing: '-1px' }}>For the Right</h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.55 }}>Historias con poca o ninguna cobertura en la derecha.</p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.45 }}>{forRight.length} HISTORIAS</span>
          </div>

          <div style={{ display: 'grid', gap: '18px' }}>
            {forRight.length > 0 ? (
              forRight.map((entry) => (
                <StoryBlindspotCard
                  key={entry.id}
                  entry={entry}
                  onSelectStory={onSelectStory}
                  isFavorite={favStoryIds.has(String(entry.id))}
                  onToggleFavorite={toggleFavorite}
                  onShare={openShare}
                  isMobile={isMobile}
                />
              ))
            ) : (
              <div style={{ border: 'var(--border-thin)', padding: '32px 24px', background: '#fafafa', fontSize: '14px', lineHeight: 1.6, opacity: 0.7 }}>
                No hay historias que cumplan el umbral actual para esta columna con los filtros activos.
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ marginTop: '48px', marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', marginBottom: '18px', borderBottom: '2px solid black', paddingBottom: '14px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '28px' : '34px', letterSpacing: '-1px' }}>Trending Topics</h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.55 }}>Temas conectados con los blindspots actuales.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(trendingTopics.length > 0 ? trendingTopics : topicOptions.slice(1)).map((topic) => (
            <button
              key={topic}
              onClick={() => navigate(`/?topic=${encodeURIComponent(topic)}`)}
              style={{
                padding: '12px 16px',
                borderRadius: '999px',
                border: '1px solid #d9d9d9',
                background: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      <section ref={newsletterRef}>
        <NewsletterSignup source="blindspot_feed" variant="light" />
      </section>
    </div>
  );
};

export default BlindspotFeed;
