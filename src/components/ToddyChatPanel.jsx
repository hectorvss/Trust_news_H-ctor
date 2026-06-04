import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  'Explicamelo simple',
  'Que sesgo hay',
  'Que dicen las fuentes',
  'Que falta por saber',
  'Dame cronologia'
];

const DEPTHS = [
  { id: 'quick', label: 'Rapido', description: 'Breve y directo' },
  { id: 'deep', label: 'Profundo', description: 'Contexto, cifras y sesgo' },
  { id: 'research', label: 'Investigacion', description: 'Puede consultar web' },
  { id: 'audit', label: 'Auditoria', description: 'Maxima trazabilidad' }
];

const STATUS_COPY = {
  'leyendo la noticia': 'Leyendo la noticia',
  'buscando evidencia': 'Buscando evidencia',
  'investigando web': 'Investigando web',
  'comparando fuentes': 'Comparando fuentes',
  'verificando claims': 'Verificando claims',
  'validando citas': 'Validando citas',
  'redactando respuesta': 'Redactando respuesta'
};

const formatRole = (role) => role === 'assistant' ? 'Toddy' : 'Tu';

const ERROR_COPY = {
  story_not_found: 'Esta noticia todavia no esta disponible para Toddy.',
  story_not_published: 'Toddy solo funciona con noticias publicadas.',
  auth_required: 'Inicia sesion para hablar con Toddy.',
  free_limit_used: 'Ya usaste la pregunta gratuita de Toddy para esta noticia.',
  insufficient_credits: 'No tienes creditos IA suficientes para esta profundidad.',
  depth_not_allowed: 'Tu plan actual no permite este modo de razonamiento.',
  daily_research_limit_used: 'Has usado las investigaciones IA disponibles hoy.',
  toddy_generation_failed: 'Toddy no pudo responder ahora mismo. Intentalo de nuevo en unos minutos.'
};

const humanError = (value) => ERROR_COPY[value] || ERROR_COPY[String(value || '').trim()] || value || 'Toddy no pudo responder';

const MarkdownText = ({ text }) => {
  const blocks = String(text || '').split('\n');
  return (
    <>
      {blocks.map((line, index) => {
        const trimmed = line.trim();
        const isBullet = /^[-*]\s+/.test(trimmed);
        const clean = isBullet ? trimmed.replace(/^[-*]\s+/, '') : line;
        const parts = clean.split(/(\*\*[^*]+\*\*)/g);
        return (
          <div
            key={`${index}-${line.slice(0, 12)}`}
            style={{
              marginTop: index === 0 ? 0 : trimmed ? '7px' : '10px',
              paddingLeft: isBullet ? '14px' : 0,
              position: 'relative'
            }}
          >
            {isBullet && <span style={{ position: 'absolute', left: 0 }}>-</span>}
            {parts.map((part, partIndex) => {
              if (/^\*\*[^*]+\*\*$/.test(part)) {
                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
              }
              return <React.Fragment key={partIndex}>{part}</React.Fragment>;
            })}
          </div>
        );
      })}
    </>
  );
};

const ReasoningSelector = ({ depth, onChange, disabled, allowedDepths = DEPTHS.map((item) => item.id) }) => {
  const [open, setOpen] = useState(false);
  const options = DEPTHS.filter((item) => allowedDepths.includes(item.id));
  const selected = options.find((item) => item.id === depth) || options[0] || DEPTHS[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-label="Elegir razonamiento de Toddy"
        aria-expanded={open}
        style={{
          minWidth: '116px',
          height: '44px',
          border: '1px solid #111',
          background: '#fff',
          color: '#111',
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 900,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.45 : 1
        }}
      >
        <span>{selected.label}</span>
        <span style={{ fontSize: '12px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }}>^</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: '50px',
            width: '236px',
            background: '#fff',
            border: '1px solid #111',
            boxShadow: '0 18px 38px rgba(0,0,0,0.16)',
            zIndex: 4
          }}
        >
          {options.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              style={{
                width: '100%',
                border: 'none',
                borderBottom: item.id === options[options.length - 1].id ? 'none' : '1px solid #e1ded6',
                background: item.id === depth ? '#f1eee6' : '#fff',
                padding: '11px 12px',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 900 }}>{item.label}</div>
              <div style={{ marginTop: '3px', fontSize: '11px', opacity: 0.58, lineHeight: 1.25 }}>{item.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const parseSseEvent = (block) => {
  const lines = block.split('\n');
  const event = lines.find((line) => line.startsWith('event: '))?.slice(7).trim() || 'message';
  const dataRaw = lines
    .filter((line) => line.startsWith('data: '))
    .map((line) => line.slice(6))
    .join('\n');
  try {
    return { event, data: JSON.parse(dataRaw) };
  } catch {
    return { event, data: dataRaw };
  }
};

const ToddyChatPanel = ({ story, open, onClose }) => {
  const navigate = useNavigate();
  const { user, session, profile, fetchProfile } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [credits, setCredits] = useState(0);
  const [freeAvailable, setFreeAvailable] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [availableDepths, setAvailableDepths] = useState(['quick']);
  const [researchRemaining, setResearchRemaining] = useState(null);
  const [message, setMessage] = useState('');
  const [depth, setDepth] = useState('quick');
  const [creditPolicy, setCreditPolicy] = useState({ estimated_costs: { quick: 0.45, deep: 0.95, research: 8, audit: 12 }, token_based: true });
  const [status, setStatus] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const estimatedCost = useMemo(() => Number(creditPolicy?.estimated_costs?.[depth] || 0.45), [creditPolicy, depth]);
  const canAsk = Boolean(user && session?.access_token && !loading);

  useEffect(() => {
    if (!open || !user || !session?.access_token || !story?.id) return;

    const loadConversation = async () => {
      setError('');
      try {
        const res = await fetch(`/api/toddy-chat?story_id=${encodeURIComponent(story.id)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(humanError(payload.error || 'No se pudo cargar Toddy'));
        setConversation(payload.conversation);
        setMessages(payload.messages || []);
        setCredits(payload.credits || profile?.ai_credit_balance || 0);
        setFreeAvailable(Boolean(payload.free_available));
        setIsPaid(Boolean(payload.is_paid));
        const returnedDepths = payload.available_depths || (payload.is_paid ? DEPTHS.map((item) => item.id) : ['quick']);
        const remaining = payload.research_daily_remaining ?? null;
        setAvailableDepths(remaining === 0 ? returnedDepths.filter((item) => !['research', 'audit'].includes(item)) : returnedDepths);
        setResearchRemaining(remaining);
        setCreditPolicy(payload.credit_policy || creditPolicy);
      } catch (err) {
        setError(err.message);
      }
    };

    loadConversation();
  }, [open, user, session?.access_token, story?.id, profile?.ai_credit_balance]);

  useEffect(() => {
    if (!availableDepths.includes(depth)) setDepth('quick');
  }, [availableDepths, depth]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, streamingText, status]);

  const startCreditCheckout = async (pack = 'medium') => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/stripe?type=ai_credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack, user_id: user.id, email: user.email })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'No se pudo abrir Stripe');
      window.location.href = payload.url;
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = async (text = message) => {
    const trimmed = text.trim();
    if (!trimmed || !canAsk) return;

    setMessage('');
    setError('');
    setLoading(true);
    setStatus('leyendo la noticia');
    setStreamingText('');
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: 'user', content: trimmed }]);

    try {
      const res = await fetch('/api/toddy-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          story_id: story.id,
          conversation_id: conversation?.id,
          message: trimmed,
          depth
        })
      });

      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(humanError(payload.error || 'Toddy no pudo responder'));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let finalMeta = null;
      let citations = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks.filter(Boolean)) {
          const { event, data } = parseSseEvent(block);
          if (event === 'status') setStatus(data.state || '');
          if (event === 'citation') citations = [...citations, data];
          if (event === 'delta') {
            assistantText += data.text || '';
            setStreamingText(assistantText);
          }
          if (event === 'done') finalMeta = data;
          if (event === 'error') throw new Error(data.message || data.error || 'Toddy fallo');
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: finalMeta?.message_id || `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantText,
          depth,
          sources_used: finalMeta?.sources_used || [],
          token_usage: finalMeta?.token_usage || {},
          credits_charged: finalMeta?.credits_charged || 0
          ,
          citations_used: finalMeta?.citations || citations
        }
      ]);
      setConversation((prev) => prev || (finalMeta?.conversation_id ? { id: finalMeta.conversation_id } : prev));
      setStreamingText('');
      setStatus('');
      setFreeAvailable(false);
      if (finalMeta?.credits_charged) setCredits((current) => Math.max(0, Number((current - finalMeta.credits_charged).toFixed(2))));
      if (fetchProfile && user?.id) fetchProfile(user.id);
    } catch (err) {
      setError(err.message);
      setStatus('');
      setStreamingText('');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const needsCredits = isPaid && credits < estimatedCost;
  const freeBlocked = !isPaid && !freeAvailable && messages.some((m) => m.role === 'assistant');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.18)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(480px, 100vw)',
          height: '100%',
          background: '#f7f5ef',
          borderLeft: '1px solid #111',
          boxShadow: '-18px 0 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <header style={{ padding: '22px 22px 18px', borderBottom: '1px solid #111', background: '#111', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 900, opacity: 0.55, letterSpacing: '1px' }}>AGENTE IA</div>
              <h2 style={{ margin: '4px 0 0', fontSize: '30px', lineHeight: 1, letterSpacing: 0 }}>Toddy</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar Toddy"
              style={{ border: '1px solid rgba(255,255,255,0.35)', background: 'transparent', color: '#fff', width: '34px', height: '34px', cursor: 'pointer', fontSize: '20px' }}
            >
              x
            </button>
          </div>
          <p style={{ margin: '14px 0 0', fontSize: '13px', lineHeight: 1.35, opacity: 0.72 }}>
            {story?.title}
          </p>
        </header>

        {!user ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.45 }}>
              Inicia sesion para preguntarle a Toddy por esta noticia y guardar la conversacion.
            </p>
            <button
              onClick={() => navigate('/auth')}
              style={{ border: '1px solid #111', background: '#111', color: '#fff', padding: '14px 16px', fontWeight: 900, cursor: 'pointer' }}
            >
              INICIAR SESION
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #d8d3c6', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 900, opacity: 0.52, letterSpacing: '1px' }}>
                {DEPTHS.find((item) => item.id === depth)?.label || 'Rapido'}
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 900, opacity: 0.62 }}>
                {isPaid
                  ? researchRemaining == null ? `${Number(credits).toFixed(2)} creditos` : `${researchRemaining} investigaciones hoy`
                  : freeAvailable ? '1 pregunta disponible' : 'pregunta gratis usada'}
              </span>
            </div>

            <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {messages.length === 0 && (
                <div style={{ border: '1px solid #d6d0c3', background: '#fff', padding: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 900, opacity: 0.45, marginBottom: '8px' }}>PREGUNTAS RAPIDAS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        disabled={!canAsk || needsCredits || freeBlocked}
                        style={{ border: '1px solid #111', background: '#f7f5ef', padding: '9px 10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((item) => (
                <div key={item.id} style={{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 900, opacity: 0.42, marginBottom: '5px' }}>{formatRole(item.role)}</div>
                  <div style={{
                    background: item.role === 'user' ? '#111' : '#fff',
                    color: item.role === 'user' ? '#fff' : '#111',
                    border: '1px solid #111',
                    padding: '12px 13px',
                    fontSize: '14px',
                    lineHeight: 1.45,
                  }}>
                    {item.role === 'assistant' ? <MarkdownText text={item.content} /> : item.content}
                  </div>
                  {item.role === 'assistant' && (item.citations_used?.length > 0 || item.metadata?.structured_answer?.citations?.length > 0) && (
                    <div style={{ marginTop: '7px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(item.citations_used || item.metadata?.structured_answer?.citations || []).slice(0, 6).map((citation, citationIndex) => (
                        <span key={`${item.id}-citation-${citationIndex}`} style={{ border: '1px solid #d6d0c3', padding: '4px 6px', fontSize: '10px', fontFamily: 'var(--font-mono)', background: '#f7f5ef' }}>
                          {citation.source || citation.article_id || citation.web_result_id || 'cita'}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.role === 'assistant' && item.sources_used?.length > 0 && (
                    <div style={{ marginTop: '7px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {item.sources_used.slice(0, 8).map((source) => {
                        const label = `${source.source}${source.article_id ? ` #${String(source.article_id).slice(0, 8)}` : ''}`;
                        const quality = source.extraction_quality != null ? ` q${Number(source.extraction_quality).toFixed(2)}` : '';
                        const chipStyle = { border: '1px solid #d6d0c3', padding: '4px 6px', fontSize: '10px', fontFamily: 'var(--font-mono)', background: '#fff', color: '#111', textDecoration: 'none' };
                        return source.url ? (
                          <a key={`${item.id}-${source.article_id}`} href={source.url} target="_blank" rel="noreferrer" style={chipStyle}>
                            {label}{quality}
                          </a>
                        ) : (
                          <span key={`${item.id}-${source.article_id}`} style={chipStyle}>
                            {label}{quality}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {status && (
                <div style={{ alignSelf: 'flex-start', border: '1px solid #d6d0c3', background: '#ebe6da', padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 900 }}>
                  {STATUS_COPY[status] || status}
                </div>
              )}

              {streamingText && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: '#fff', border: '1px solid #111', padding: '12px 13px', fontSize: '14px', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                  {streamingText}
                </div>
              )}

              {error && (
                <div style={{ border: '1px solid #9b1c1c', background: '#fff0f0', color: '#7a1212', padding: '12px', fontSize: '13px', lineHeight: 1.35 }}>
                  {error}
                </div>
              )}
            </div>

            {(needsCredits || freeBlocked) && (
              <div style={{ padding: '12px 18px', borderTop: '1px solid #d6d0c3', background: '#fff8df', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, lineHeight: 1.3 }}>
                  {needsCredits ? 'Necesitas mas creditos IA.' : 'La consulta gratuita de esta noticia ya se uso.'}
                </span>
                <button onClick={() => startCreditCheckout('medium')} style={{ marginLeft: 'auto', border: '1px solid #111', background: '#111', color: '#fff', padding: '9px 10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}>
                  COMPRAR
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              style={{ borderTop: '1px solid #111', padding: '14px', background: '#f7f5ef', display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!canAsk || needsCredits || freeBlocked}
                placeholder={needsCredits ? 'Compra creditos IA para continuar' : freeBlocked ? 'Actualiza tu plan o compra creditos IA' : 'Pregunta sobre esta noticia...'}
                style={{ flex: '1 1 220px', minWidth: 0, height: '44px', boxSizing: 'border-box', border: '1px solid #111', background: '#fff', padding: '0 12px', fontSize: '14px', outline: 'none' }}
              />
              <ReasoningSelector
                depth={depth}
                onChange={setDepth}
                allowedDepths={availableDepths}
                disabled={!canAsk || needsCredits || freeBlocked || loading}
              />
              <button
                disabled={!message.trim() || !canAsk || needsCredits || freeBlocked}
                style={{ height: '44px', border: '1px solid #111', background: '#111', color: '#fff', padding: '0 16px', fontWeight: 900, cursor: 'pointer', opacity: (!message.trim() || !canAsk || needsCredits || freeBlocked) ? 0.45 : 1 }}
              >
                ENVIAR
              </button>
            </form>
          </>
        )}
      </aside>
    </div>
  );
};

export default ToddyChatPanel;
