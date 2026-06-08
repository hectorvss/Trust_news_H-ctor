import React, { useEffect, useMemo, useState } from 'react';
import Plus from './ui/Plus';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { fetchLatestDailyBrief } from '../supabaseService';

const asArray = (value) => Array.isArray(value) ? value : [];
const asText = (value) => typeof value === 'string' ? value.trim() : '';
const num = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeCategory = (value) => {
  const raw = asText(value).toUpperCase().trim();
  return raw || 'GENERAL';
};

const biasOf = (story) => {
  const left = num(story?.biasDistribution?.left ?? story?.bias?.left ?? story?.coverage_left);
  const center = num(story?.biasDistribution?.center ?? story?.bias?.center ?? story?.coverage_center);
  const right = num(story?.biasDistribution?.right ?? story?.bias?.right ?? story?.coverage_right);
  const total = left + center + right;
  if (!total) return { left: 33, center: 33, right: 34 };
  return {
    left: Math.round((left / total) * 100),
    center: Math.round((center / total) * 100),
    right: Math.round((right / total) * 100),
  };
};

const dominantBias = (bias) =>
  bias.left >= bias.center && bias.left >= bias.right
    ? 'izquierda'
    : bias.right >= bias.center && bias.right >= bias.left
      ? 'derecha'
      : 'centro';

const storySourceCount = (story) => num(story?.sourceCount ?? story?.source_count ?? story?.totalSources ?? story?.sources_count);

const selectTopStories = (stories, limit = 6) => {
  return [...stories]
    .sort((a, b) => storySourceCount(b) - storySourceCount(a))
    .slice(0, limit)
    .map((story) => {
      const bias = biasOf(story);
      return {
        story_id: story.id || story.story_id,
        title: story.title || 'Sin titulo',
        summary: asText(story.summary || story.analyticalSnippet || story.analytical_snippet) || '',
        angle: `${normalizeCategory(story.category)} · ${asText(story.consensus) || 'MEDIO'}`,
        why_it_matters: asText(story.consensusNarrative || story.consensus_narrative || story.blindSpot || story.blind_spot)
          || `Concentra ${storySourceCount(story)} fuentes y mantiene seguimiento editorial activo.`,
        category: normalizeCategory(story.category),
        source_count: storySourceCount(story),
        factuality: asText(story.factuality) || 'N/D',
        impact: asText(story.impact) || 'N/D',
        consensus: asText(story.consensus) || 'N/D',
        updated_at: story.updated_at || story.created_at || null,
        bias_distribution: bias,
        dominant_bias: dominantBias(bias),
      };
    });
};

const buildFallbackDailyBrief = (stories = []) => {
  const sorted = [...stories].filter(Boolean);
  const categoryCounts = sorted.reduce((acc, story) => {
    const category = normalizeCategory(story.category);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const biasTotals = sorted.reduce((acc, story) => {
    const bias = biasOf(story);
    acc.left += bias.left;
    acc.center += bias.center;
    acc.right += bias.right;
    return acc;
  }, { left: 0, center: 0, right: 0 });
  const biasSum = biasTotals.left + biasTotals.center + biasTotals.right || 1;
  const bias = {
    left: Math.round((biasTotals.left / biasSum) * 100),
    center: Math.round((biasTotals.center / biasSum) * 100),
    right: Math.round((biasTotals.right / biasSum) * 100),
  };
  const dominant = dominantBias(bias);
  const topStories = selectTopStories(sorted, 6);
  const topCategory = categories[0] || ['GENERAL', 0];
  const topCoverageStory = [...sorted].sort((a, b) => storySourceCount(b) - storySourceCount(a))[0] || null;
  const lowCoverageStory = [...sorted].sort((a, b) => storySourceCount(a) - storySourceCount(b))[0] || null;
  const totalSources = sorted.reduce((acc, story) => acc + storySourceCount(story), 0);
  const articleCount = sorted.reduce((acc, story) => {
    const count = num(story.articleCount ?? story.article_count ?? story.sourceCount ?? story.source_count);
    return acc + count;
  }, 0);
  const highFactualityCount = sorted.filter((story) => asText(story.factuality).toUpperCase() === 'ALTA').length;
  const highFactualityPct = sorted.length ? Math.round((highFactualityCount / sorted.length) * 100) : 0;
  const today = new Date();
  const briefDate = today.toISOString().slice(0, 10);
  const dateLabel = today.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();

  const executiveSummary = [
    `La jornada deja ${sorted.length} historias publicadas, ${totalSources} fuentes y una agenda dominada por ${topCategory[0].toLowerCase()}. La cobertura principal se concentra en piezas de alta traccion, pero el panorama completo muestra una conversacion mas amplia que mezcla politica, economia, sociedad e internacional.`,
    `La distribucion de sesgo se reparte en ${bias.left}% izquierda, ${bias.center}% centro y ${bias.right}% derecha, con una posicion dominante hacia ${dominant}. El nivel de factualidad alta alcanza el ${highFactualityPct}% sobre el total analizado, lo que sugiere una base informativa razonablemente solida para el briefing.`,
    topCoverageStory && lowCoverageStory
      ? `La pieza mas visible hoy es "${topCoverageStory.title}", mientras que "${lowCoverageStory.title}" representa el tipo de historia que suele quedarse con menos cobertura y necesita contraste adicional. El siguiente paso es vigilar si entran nuevas fuentes o si cambia el framing en las proximas 24 horas.`
      : 'El siguiente paso es vigilar si entran nuevas fuentes o si cambia el framing en las proximas 24 horas.',
  ];

  const thematicOverview = categories.map(([name, count], index) => {
    const representative = topStories.find((story) => story.category === name) || topStories[index] || topStories[0] || null;
    return {
      theme: name,
      summary: representative
        ? `${count} historias sostienen este eje. La pieza representativa es "${representative.title}", que condensa la prioridad editorial del dia.`
        : `${count} historias sostienen este eje.`,
      representative_story_id: representative?.story_id || null,
      representative_story_title: representative?.title || null,
      story_count: count,
    };
  });

  const consensusNarrative = {
    narrative: `La cobertura mas compartida se apoya en historias con mayor densidad de fuentes, mientras que los vacios aparecen en piezas mas recientes o con menor traccion. El mapa editorial del dia es estable, pero sigue dependiendo de las historias de mayor cobertura.`,
    strongest: topStories.slice(0, 3).map((story) => story.title),
    weakest: [...sorted]
      .sort((a, b) => storySourceCount(a) - storySourceCount(b))
      .slice(0, 3)
      .map((story) => story.title)
      .filter(Boolean),
  };

  const blindSpots = [
    topCoverageStory ? `La historia "${topCoverageStory.title}" sigue siendo la mas visible; conviene no confundir volumen con resolucion.` : 'La historia mas visible sigue necesitando una lectura mas profunda.',
    lowCoverageStory ? `La historia "${lowCoverageStory.title}" mantiene poca cobertura relativa; puede faltar contexto, contraste o simplemente mas fuentes.` : 'Las piezas menos cubiertas necesitan mas contexto y contraste.',
    'La perspectiva internacional y el contraste territorial siguen siendo los dos huecos mas faciles de perder cuando la agenda se acelera.',
  ];

  const prospectiveNotes = [
    topCoverageStory ? `Seguir la evolucion de "${topCoverageStory.title}" en las proximas 24 horas, sobre todo si entran nuevas fuentes o cambia el framing.` : 'Seguir la historia dominante de las proximas 24 horas para detectar cambios de framing.',
    `La cobertura con mas densidad de fuentes sigue concentrada en ${topCategory[0].toLowerCase()}; cualquier entrada nueva en este eje puede reconfigurar el briefing.`,
    lowCoverageStory ? `Abrir nuevas fuentes en torno a "${lowCoverageStory.title}" para verificar si el punto ciego es editorial o circunstancial.` : 'Abrir nuevas fuentes en las historias menos cubiertas para confirmar si el hueco es editorial o circunstancial.',
  ];

  return {
    title: `Resumen diario ${dateLabel}`,
    dek: `Una lectura editorial completa de la jornada con foco en cobertura, sesgo, consensos y puntos ciegos.`,
    summary: executiveSummary.join(' '),
    executive_summary: executiveSummary,
    top_headlines: topStories,
    thematic_overview: thematicOverview,
    coverage_stats: {
      story_count: sorted.length,
      source_count: totalSources,
      article_count: articleCount,
      category_count: categories.length,
      high_factuality_count: highFactualityCount,
      high_factuality_pct: highFactualityPct,
      top_category: { name: topCategory[0], count: topCategory[1] },
    },
    bias_distribution: {
      left: bias.left,
      center: bias.center,
      right: bias.right,
      dominant,
      narrative: `La cobertura se inclina hacia ${dominant} con una distribucion de ${bias.left}/${bias.center}/${bias.right}.`,
    },
    consensus_notes: consensusNarrative,
    blind_spots: blindSpots,
    prospective_notes: prospectiveNotes,
    methodology_note: 'Resumen generado a partir de las historias publicadas y sus metadatos editoriales, priorizando trazabilidad, balance tematico y calidad de evidencia.',
    source_trace: topStories.map((story) => ({
      story_id: story.story_id,
      title: story.title,
      source_count: story.source_count,
      category: story.category,
      dominant_bias: story.dominant_bias,
    })),
    evidence_quality: {
      overall_score: sorted.length ? clamp(0.5 + (highFactualityPct / 200), 0.45, 0.85) : 0,
      story_count: sorted.length,
      source_count: totalSources,
      article_count: articleCount,
      selected_story_count: topStories.length,
    },
    missing_evidence: [],
    generation_metadata: {
      source: 'fallback',
      brief_date: briefDate,
    },
    briefDate: briefDate,
  };
};

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date).toUpperCase();
};

const DailySummary = ({ onBack, stories = [] }) => {
  const { isMobile } = useBreakpoint();
  const [dailyBrief, setDailyBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoadingBrief(true);
    fetchLatestDailyBrief('es')
      .then((brief) => {
        if (!alive) return;
        setDailyBrief(brief);
      })
      .catch((error) => {
        console.error('fetchLatestDailyBrief:', error);
      })
      .finally(() => {
        if (alive) setLoadingBrief(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const viewModel = useMemo(
    () => dailyBrief || buildFallbackDailyBrief(stories),
    [dailyBrief, stories],
  );

  const topStories = asArray(viewModel.top_headlines).slice(0, 6);
  const executiveParagraphs = asArray(viewModel.executive_summary).length
    ? asArray(viewModel.executive_summary)
    : (viewModel.summary ? [viewModel.summary] : []);
  const thematicOverview = asArray(viewModel.thematic_overview).slice(0, 4);
  const activeStories = [...stories]
    .sort((a, b) => storySourceCount(b) - storySourceCount(a))
    .slice(0, 3);
  const bias = viewModel.bias_distribution || {};
  const biasLeft = num(bias.left);
  const biasCenter = num(bias.center);
  const biasRight = num(bias.right);
  const biasLabel = asText(bias.dominant) || dominantBias({
    left: biasLeft,
    center: biasCenter,
    right: biasRight,
  });
  const totalStories = num(viewModel.coverage_stats?.story_count || stories.length);
  const totalSources = num(viewModel.coverage_stats?.source_count || stories.reduce((acc, story) => acc + storySourceCount(story), 0));
  const totalArticles = num(viewModel.coverage_stats?.article_count || stories.reduce((acc, story) => acc + storySourceCount(story), 0));
  const categoryCount = num(viewModel.coverage_stats?.category_count || Object.keys(stories.reduce((acc, story) => {
    acc[normalizeCategory(story.category)] = true;
    return acc;
  }, {})).length);
  const factualityPct = num(viewModel.coverage_stats?.high_factuality_pct);
  const dateLabel = formatDate(viewModel.briefDate || viewModel.generation_metadata?.brief_date);

  return (
    <div style={{
      background: 'var(--color-bg)',
      color: 'var(--color-primary)',
      minHeight: '100vh',
      paddingBottom: '200px',
      fontFamily: 'var(--font-heading)',
    }}>
      <div style={{ position: 'fixed', top: '72px', left: 0, width: '100%', height: '4px', background: '#eee', zIndex: 1000 }}>
        <div style={{ width: '100%', height: '100%', background: 'black' }} />
      </div>

      <div style={{ padding: isMobile ? '100px 16px 40px' : '120px 60px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '80px', borderBottom: '4px solid black', paddingBottom: '40px', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span>AMBITO: ESPAÑA / UE</span>
              <span>HISTORIAS ANALIZADAS: {totalStories || '—'}</span>
              <span>CIERRE: 08:30 CET</span>
              {loadingBrief && <span>ACTUALIZANDO BRIEF</span>}
            </div>
            <h1 style={{ fontSize: isMobile ? '44px' : '110px', fontWeight: 800, letterSpacing: isMobile ? '-2px' : '-6px', lineHeight: isMobile ? '1.1' : '0.9', margin: '0 0 20px 0', textTransform: 'uppercase' }}>
              Resumen <br />{dateLabel}
            </h1>
            <p style={{ fontSize: '16px', fontWeight: 600, opacity: 0.55, maxWidth: '760px', lineHeight: '1.55' }}>
              {asText(viewModel.dek) || 'Sintesis del ecosistema mediatico del dia: que domina la conversacion, como se cuenta y que implica.'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              onClick={onBack}
              style={{
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '12px 30px',
                border: '2px solid black',
                borderRadius: 'var(--radius-pill)',
                transition: 'var(--transition)',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'black'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'black'; }}
            >
              [ Cerrar Reporte ]
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '80px', marginBottom: isMobile ? '48px' : '100px', marginTop: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>RESUMEN EJECUTIVO</span>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {executiveParagraphs.length > 0 ? executiveParagraphs.map((paragraph, index) => (
                  <div key={index} style={{ display: 'flex', gap: '16px', fontSize: index === 0 ? '19px' : '17px', lineHeight: '1.65', fontWeight: index === 0 ? 700 : 500, opacity: index === 0 ? 1 : 0.8 }}>
                    <Plus />
                    <p style={{ margin: 0 }}>{paragraph}</p>
                  </div>
                )) : (
                  <div style={{ fontSize: '16px', opacity: 0.4, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SIN RESUMEN DISPONIBLE</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { label: 'HISTORIAS ACTIVAS', val: totalStories || '—', var: `${viewModel.coverage_stats?.top_category?.name || 'N/D'} DOMINA`, status: 'EN TIEMPO REAL' },
              { label: 'ARTICULOS ANALIZADOS', val: totalArticles || '—', var: `${categoryCount || 0} CATEGORIAS`, status: 'DINAMICO' },
              { label: 'FACTUALIDAD ALTA', val: factualityPct ? `${factualityPct}%` : '—', var: `${viewModel.coverage_stats?.high_factuality_count || 0} HISTORIAS`, status: 'DOCUMENTAL' },
              { label: 'FUENTES TOTALES', val: totalSources || '—', var: 'ANALIZADAS HOY', status: 'COMPLETO' },
            ].map((metric, index) => (
              <div key={index} style={{ background: index === 3 ? 'black' : '#f5f5f5', color: index === 3 ? 'white' : 'black', padding: '30px', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4, marginBottom: '6px', letterSpacing: '1px' }}>{metric.label}</div>
                  <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-2px' }}>{metric.val}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: index === 3 ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{metric.var}</span>
                  <span style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5 }}>{metric.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ margin: '60px 0 100px', padding: isMobile ? '20px' : '40px', border: 'var(--border-thin)', borderRadius: '4px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '20px' : '40px' }}>
          {[
            { label: 'DOMINA', val: normalizeCategory(viewModel.coverage_stats?.top_category?.name || viewModel.top_headlines?.[0]?.category || 'GENERAL'), desc: `${viewModel.coverage_stats?.top_category?.count || topStories[0]?.source_count || 0} historias activas en este eje.` },
            { label: 'CONSENSO', val: viewModel.consensus_notes?.strongest?.[0] || topStories[0]?.title || '—', desc: viewModel.consensus_notes?.narrative || 'Sin datos de consenso disponibles.' },
            { label: 'ALTA FACTUALIDAD', val: factualityPct ? `${factualityPct}%` : '—', desc: `${viewModel.coverage_stats?.high_factuality_count || 0} historias con factualidad alta.` },
            { label: 'FUENTES', val: totalSources || '—', desc: 'Analizadas en la ventana editorial de hoy.' },
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: '1.2' }}>{item.val}</div>
              <div style={{ fontSize: '11px', opacity: 0.5, lineHeight: '1.4' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '80px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 900, opacity: 0.4, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '60px', textAlign: 'center' }}>
            HISTORIAS PRINCIPALES DEL DIA
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
            {topStories.length > 0 ? topStories.map((story, index) => (
              <div key={story.story_id || index} style={{ border: '1px solid #eaeaea', padding: '26px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '240px', background: index === 0 ? '#fafafa' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px' }}>{story.category}</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>{story.source_count} FUENTES</div>
                </div>
                <p style={{ fontSize: '21px', fontWeight: 800, lineHeight: '1.25', margin: 0, letterSpacing: '-0.6px' }}>{story.title}</p>
                {story.summary && <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.68, margin: 0 }}>{story.summary}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.45 }}>
                  <span>{story.angle}</span>
                  <span>•</span>
                  <span>FACT: {story.factuality || 'N/D'}</span>
                  <span>•</span>
                  <span>IMPACT: {story.impact || 'N/D'}</span>
                </div>
                <div style={{ borderTop: '1px solid #efefef', paddingTop: '14px', marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.35, letterSpacing: '1px', marginBottom: '6px' }}>POR QUE IMPORTA</div>
                  <p style={{ fontSize: '13px', lineHeight: '1.55', margin: 0, opacity: 0.75 }}>{story.why_it_matters}</p>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, padding: '40px' }}>
                SIN HISTORIAS DISPONIBLES
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: isMobile ? '48px' : '100px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '80px', borderTop: 'var(--border-thin)', paddingTop: '60px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '32px' }}>CONSENSO NARRATIVO</div>
            <p style={{ fontSize: '17px', lineHeight: '1.65', margin: '0 0 24px 0', fontWeight: 600 }}>{viewModel.consensus_notes?.narrative || 'Sin consenso narrativo disponible.'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {asArray(viewModel.consensus_notes?.strongest).length > 0 ? asArray(viewModel.consensus_notes.strongest).map((txt, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', fontSize: '15px', fontWeight: 600 }}>
                  <Plus />
                  <span style={{ lineHeight: '1.4' }}>{txt}</span>
                </div>
              )) : (
                <div style={{ opacity: 0.3, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>SIN DATOS</div>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '32px' }}>PUNTOS CIEGOS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {asArray(viewModel.blind_spots).length > 0 ? asArray(viewModel.blind_spots).map((txt, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', fontSize: '15px', fontWeight: 600 }}>
                  <Plus />
                  <span style={{ lineHeight: '1.4' }}>{txt}</span>
                </div>
              )) : (
                <div style={{ opacity: 0.3, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>SIN DATOS</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '120px', background: 'black', color: 'white', padding: isMobile ? '42px 26px' : '80px', borderRadius: '4px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.5, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '20px' }}>DISTRIBUCION DE SESGO EN EL RESUMEN DIARIO</div>
            <h2 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '28px', lineHeight: '1.1' }}>
              El {biasLeft}% de la cobertura proviene de medios de izquierda, {biasCenter}% de centro y {biasRight}% de derecha.
            </h2>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.75, lineHeight: '1.65', marginBottom: '34px' }}>
              {viewModel.bias_distribution?.narrative || `La distribucion actual muestra una inclinacion hacia ${biasLabel}. Este dato refleja las historias disponibles en la plataforma y puede variar con cada actualizacion del feed.`}
            </p>
            <div style={{ display: 'flex', gap: 0, height: '12px', borderRadius: '4px', overflow: 'hidden', marginBottom: '18px' }}>
              <div style={{ width: `${clamp(biasLeft, 0, 100)}%`, background: 'rgba(255,255,255,0.9)' }} />
              <div style={{ width: `${clamp(biasCenter, 0, 100)}%`, background: 'rgba(255,255,255,0.5)' }} />
              <div style={{ width: `${clamp(biasRight, 0, 100)}%`, background: 'rgba(255,255,255,0.2)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.5, gap: '12px' }}>
              <span>IZQ {biasLeft}%</span>
              <span>CENTRO {biasCenter}%</span>
              <span>DER {biasRight}%</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '100px' }}>
          <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '40px' }}>EJES TEMATICOS Y REPERCUSION</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '28px' }}>
            {thematicOverview.length > 0 ? thematicOverview.map((theme, index) => (
              <div key={index} style={{ border: '1px solid #ececec', padding: '24px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px' }}>{theme.theme}</div>
                <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, letterSpacing: '1px' }}>{theme.story_count === 1 ? '1 HISTORIA' : `${theme.story_count} HISTORIAS`}</div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.75 }}>{theme.summary}</div>
                {theme.representative_story_title && (
                  <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 800, lineHeight: '1.4' }}>
                    Representante: {theme.representative_story_title}
                  </div>
                )}
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, padding: '40px' }}>
                SIN DATOS DE CATEGORIAS
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '120px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 900, opacity: 0.4, fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginBottom: '60px' }}>
            HISTORIAS ACTIVAS EN LA PLATAFORMA
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '28px' }}>
            {activeStories.length > 0 ? activeStories.map((story, index) => (
              <div key={story.id || index} style={{ borderLeft: '3px solid black', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.3', margin: 0 }}>{story.title}</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>
                  <span>{normalizeCategory(story.category)}</span>
                  <span>•</span>
                  <span>FACT: {story.factuality || 'N/D'}</span>
                  <span>•</span>
                  <span>{storySourceCount(story)} FUENTES</span>
                </div>
                {story.summary && <p style={{ fontSize: '13px', opacity: 0.6, lineHeight: '1.5', margin: 0 }}>{story.summary}</p>}
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, padding: '40px' }}>
                SIN HISTORIAS DISPONIBLES
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '100px', padding: '60px', background: '#f8f8f8', borderRadius: '4px', borderLeft: '4px solid black' }}>
          <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px', marginBottom: '24px' }}>ANALISIS PROSPECTIVO: PROXIMAS 24H</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '40px' }}>
            {asArray(viewModel.prospective_notes).length > 0 ? asArray(viewModel.prospective_notes).map((note, index) => (
              <div key={index}>
                <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '8px' }}>SEGUIMIENTO {index + 1}</div>
                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{note}</p>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.4, fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800 }}>
                SIN ANALISIS PROSPECTIVO
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '140px', borderTop: '1px solid #eee', paddingTop: '40px', fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.35, textAlign: 'justify', lineHeight: '1.8' }}>
          {viewModel.methodology_note || 'Resumen generado a partir de las historias publicadas y sus metadatos editoriales.'}
        </div>

        <div style={{ marginTop: '100px', textAlign: 'center' }}>
          <div onClick={onBack} style={{ display: 'inline-block', cursor: 'pointer', padding: '20px 0', transition: 'var(--transition)' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
            <span style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2px', textTransform: 'uppercase', color: 'black', borderBottom: '4px solid black', paddingBottom: '4px', fontFamily: 'var(--font-heading)', display: 'inline-block', lineHeight: '1' }}>
              Cerrar Reporte y Volver ↗
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
