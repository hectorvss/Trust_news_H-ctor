import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteStory, fetchAppConfig, updateAppConfig, fetchSpecialSections, saveSpecialSection, deleteSpecialSection, updateStoryArticles, uploadStoryImage,
  fetchAdminUsers, updateUserRole, updateUserSubscriptionTier,
  fetchAllNotifications, createNotification, deleteNotification,
  fetchNewsletterSubscribers, updateSubscriberStatus
} from '../supabaseService';

import Plus from './ui/Plus';

const BIAS_OPTIONS = ['LEFT', 'CENTER', 'RIGHT'];
const TYPE_OPTIONS = ['REPORTAJE', 'OPINIÓN', 'ANÁLISIS', 'CRÓNICA', 'ENTREVISTA', 'EDITORIAL', 'BREAKING'];

const labelStyle = { fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '9px 10px', border: '1px solid #ddd', fontSize: '12px', fontFamily: 'inherit', outline: 'none', background: 'white', boxSizing: 'border-box' };

const ArticleField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
  </div>
);

const ArticleTextarea = ({ label, value, onChange, placeholder, rows = 2 }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
  </div>
);

const blankArticle = () => ({
  title: '', source: '', bias: 'CENTER', time: 'Reciente', origin: 'España',
  type: 'REPORTAJE', author: '', tone: 'Neutral', angle: '', diff: '', summary: '', whyOpened: ''
});

const ManagerStudio = ({ user, profile, stories, onRefresh }) => {
  const navigate = useNavigate();
  const isManager = profile?.role === 'manager' || profile?.role === 'admin_editor';
  const [activeView, setActiveView] = useState('POSTS'); // POSTS, SECCIONES, DESTACADOS, USUARIOS, COMUNICACIÓN
  const [loading, setLoading] = useState(false);
  const [localStories, setLocalStories] = useState(stories || []);
  const [specialSections, setSpecialSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null); // section being edited in form

  // Image upload state
  const [uploadingImageId, setUploadingImageId] = useState(null);

  // Article management state
  const [editingStoryArticles, setEditingStoryArticles] = useState(null); // story whose articles we're editing
  const [draftArticles, setDraftArticles] = useState([]);
  const [savingArticles, setSavingArticles] = useState(false);

  // App Config state for Highlights
  const [appConfig, setAppConfig] = useState({ global_headlines: [], blind_spots: [], related_topics: [], special_sections: [], footer_links: {}, trending_topics: [] });

  // Admin: users panel
  const [adminUsers, setAdminUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilter, setUserFilter] = useState('');

  // Admin: communication panel
  const [commTab, setCommTab] = useState('NOTIFICACIONES'); // NOTIFICACIONES | NEWSLETTER
  const [allNotifications, setAllNotifications] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [newNotif, setNewNotif] = useState({ title: '', message: '', type: 'info', link: '', user_id: '' });
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    setLocalStories(stories);
  }, [stories]);

  useEffect(() => {
    if (activeView === 'DESTACADOS') {
       fetchAppConfig().then(c => {
         if(c) setAppConfig(c);
       });
    }
    if (activeView === 'SECCIONES') {
      fetchSpecialSections().then(s => setSpecialSections(s || []));
    }
    if (activeView === 'USUARIOS') {
      setUsersLoading(true);
      fetchAdminUsers().then(u => { setAdminUsers(u || []); setUsersLoading(false); });
    }
    if (activeView === 'COMUNICACIÓN') {
      fetchAllNotifications().then(n => setAllNotifications(n || []));
      fetchNewsletterSubscribers().then(s => setSubscribers(s || []));
    }
  }, [activeView]);

  // ── Admin: user management handlers ──
  const handleRoleChange = async (userId, role) => {
    const ok = await updateUserRole(userId, role);
    if (ok) setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };
  const handleTierChange = async (userId, tier) => {
    const ok = await updateUserSubscriptionTier(userId, tier);
    if (ok) setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_tier: tier } : u));
  };

  // ── Admin: notifications handlers ──
  const handleSendNotification = async () => {
    if (!newNotif.title.trim()) {
      alert('El título es obligatorio.');
      return;
    }
    setSendingNotif(true);
    const created = await createNotification({
      userId: newNotif.user_id || null,
      type: newNotif.type,
      title: newNotif.title,
      message: newNotif.message,
      link: newNotif.link
    });
    if (created) {
      setAllNotifications(prev => [created, ...prev]);
      setNewNotif({ title: '', message: '', type: 'info', link: '', user_id: '' });
    } else {
      alert('Error al enviar la notificación.');
    }
    setSendingNotif(false);
  };
  const handleDeleteNotification = async (id) => {
    if (!window.confirm('¿Eliminar esta notificación?')) return;
    const ok = await deleteNotification(id);
    if (ok) setAllNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ── Admin: newsletter handlers ──
  const handleToggleSubscriber = async (sub) => {
    const ok = await updateSubscriberStatus(sub.id, !sub.is_active);
    if (ok) setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, is_active: !s.is_active } : s));
  };

  const exportSubscribersCSV = () => {
    const active = subscribers.filter(s => s.is_active);
    const csv = ['email,full_name,frequency,source,created_at']
      .concat(active.map(s => `${s.email},"${(s.full_name || '').replace(/"/g, '""')}",${s.frequency},${s.source || ''},${s.created_at}`))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tne_newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSection = async (section) => {
    setLoading(true);
    const saved = await saveSpecialSection(section);
    if (saved) {
      setSpecialSections(prev => {
        const idx = prev.findIndex(s => s.id === saved.id);
        if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
        return [...prev, saved];
      });
      setEditingSection(null);
    }
    setLoading(false);
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('¿Borrar esta sección especial?')) return;
    setLoading(true);
    const ok = await deleteSpecialSection(id);
    if (ok) setSpecialSections(prev => prev.filter(s => s.id !== id));
    setLoading(false);
  };

  const blankSection = () => ({
    id: null,
    label: '',
    title: '',
    btn1: 'VER NOTICIA →',
    btn2: 'OCULTAR',
    trend: '',
    sort_order: specialSections.length + 1,
    main: { label: '', title: '', desc: '', legendLeft: '', legendRight: '', barType: 'grayscale', story_id: '' },
    sides: [
      { label: '', title: '', meta: '', story_id: '' },
      { label: '', title: '', meta: '', story_id: '' },
      { label: '', title: '', meta: '', story_id: '' },
    ]
  });

  const handleEditStory = (story) => {
     if (story) {
       navigate(`/story/${story.id}`);
     } else {
       navigate(`/story/new`);
     }
  };

  const handleOpenArticles = (story) => {
    setEditingStoryArticles(story);
    setDraftArticles((story.articles || []).map(a => ({ ...a })));
  };

  const handleCloseArticles = () => {
    setEditingStoryArticles(null);
    setDraftArticles([]);
  };

  const updateDraftArticle = (idx, field, value) => {
    setDraftArticles(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const moveDraftArticle = (idx, dir) => {
    setDraftArticles(prev => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const deleteDraftArticle = (idx) => {
    setDraftArticles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveArticles = async () => {
    setSavingArticles(true);
    const updated = await updateStoryArticles(editingStoryArticles.id, draftArticles);
    if (updated) {
      setLocalStories(prev => prev.map(s => s.id === updated.id ? updated : s));
      if (onRefresh) onRefresh();
      handleCloseArticles();
    } else {
      alert('Error al guardar. Revisa la consola.');
    }
    setSavingArticles(false);
  };

  const handleImageUpload = async (storyId, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Solo se admiten archivos de imagen (JPG, PNG, WebP, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo supera el límite de 5 MB.');
      return;
    }
    setUploadingImageId(storyId);
    const url = await uploadStoryImage(storyId, file);
    if (url) {
      setLocalStories(prev => prev.map(s => s.id === storyId ? { ...s, image: url } : s));
      if (onRefresh) onRefresh();
    } else {
      alert('Error al subir la imagen. Asegúrate de que el bucket "story-images" existe en Supabase Storage y tiene permisos públicos.');
    }
    setUploadingImageId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que quieres borrar este post?')) {
      setLoading(true);
      const success = await deleteStory(id);
      if (success) {
        setLocalStories(prev => prev.filter(s => s.id !== id));
        if (onRefresh) onRefresh();
      }
      setLoading(false);
    }
  };

  const handleSaveAppConfig = async () => {
    setLoading(true);
    await updateAppConfig(appConfig);
    setLoading(false);
    alert("Destacados actualizados en Supabase.");
  };

  if (!isManager) {
    return (
      <div style={{ padding: '200px 40px', textAlign: 'center', minHeight: '100vh', background: '#fff' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3, letterSpacing: '2px', marginBottom: '24px' }}>ACCESO RESTRINGIDO</div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px' }}>Área de Manager</h2>
        <p style={{ fontSize: '14px', opacity: 0.5, maxWidth: '400px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>Solo las cuentas con rol de manager autorizado pueden acceder a la dirección editorial.</p>
        <button onClick={() => navigate('/')} style={{ padding: '16px 32px', background: 'black', color: 'white', border: 'none', borderRadius: '100px', fontWeight: 900, fontSize: '11px', cursor: 'pointer', letterSpacing: '1px' }}>VOLVER A PORTADA</button>
      </div>
    );
  }

  return (
    <div className="manager-studio" style={{ padding: '60px 40px', background: '#fff', color: '#000', minHeight: '100vh' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '80px', borderBottom: 'var(--border-thin)', paddingBottom: '32px' }}>
        <div>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>← VOLVER A PORTADA</div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', margin: 0, lineHeight: 1 }}>DIRECCIÓN EDITORIAL</h1>
          <p style={{ marginTop: '16px', fontSize: '15px', color: '#666', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
            NÚCLEO MANAGER / ACCESO AUTORIZADO: <strong>{user?.email || 'manager@tne.com'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => handleEditStory(null)} style={{ padding: '16px 24px', background: 'black', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>+ CREAR NOTICIA IN-SITU</button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {['POSTS', 'SECCIONES', 'DESTACADOS', 'USUARIOS', 'COMUNICACIÓN'].map(tab => (
          <h2
            key={tab}
            onClick={() => setActiveView(tab)}
            style={{
              fontSize: '24px', fontWeight: 800, letterSpacing: '-1px', margin: 0, cursor: 'pointer',
              opacity: activeView === tab ? 1 : 0.2, transition: 'opacity 0.2s', borderBottom: activeView === tab ? '3px solid black' : 'none', paddingBottom: '8px'
            }}
          >
            {tab}
          </h2>
        ))}
      </div>

      {/* VIEW RENDERER */}

      {/* ─── SECCIONES ESPECIALES ─── */}
      {activeView === 'SECCIONES' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>SECCIONES ESPECIALES (PORTADA)</h3>
              <p style={{ fontSize: '12px', opacity: 0.5, margin: '6px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                Bloques de cobertura especial visibles bajo el feed principal. Vincula cada tarjeta a una noticia real por ID.
              </p>
            </div>
            <button
              onClick={() => setEditingSection(blankSection())}
              style={{ padding: '12px 24px', background: 'black', color: 'white', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              + NUEVA SECCIÓN
            </button>
          </div>

          {/* SECTION LIST */}
          {!editingSection && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'black', border: '1px solid black' }}>
              {specialSections.length === 0 && (
                <div style={{ padding: '60px', background: 'white', textAlign: 'center', fontWeight: 800, opacity: 0.5 }}>
                  NO HAY SECCIONES. CREA UNA O EJECUTA EL SQL DE SEED.
                </div>
              )}
              {specialSections.map((sec) => (
                <div key={sec.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr', gap: '16px', padding: '24px', background: 'white', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.4, fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>ORDEN #{sec.sort_order}</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{sec.label}<br/>{sec.title}</h3>
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                    <strong>MAIN:</strong> {sec.main?.title?.substring(0, 60)}…
                    <div style={{ fontSize: '10px', opacity: 0.5, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>story_id: {sec.main?.story_id || '—'}</div>
                  </div>
                  <div style={{ fontSize: '11px', lineHeight: '1.8', fontFamily: 'var(--font-mono)' }}>
                    {(sec.sides || []).map((s, i) => (
                      <div key={i}><span style={{ opacity: 0.4 }}>LADO {i+1}:</span> {s.story_id || '—'} {s.title ? `(${s.title.substring(0,30)}…)` : ''}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => setEditingSection({ ...sec, main: sec.main || {}, sides: sec.sides || [{},{},{}] })} style={{ padding: '8px 16px', border: '1px solid black', background: 'white', fontWeight: 800, fontSize: '10px', cursor: 'pointer' }}>EDITAR</button>
                    <button onClick={() => handleDeleteSection(sec.id)} style={{ padding: '8px 16px', border: '1px solid #d32f2f', color: '#d32f2f', background: 'white', fontWeight: 800, fontSize: '10px', cursor: 'pointer' }}>BORRAR</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION EDITOR */}
          {editingSection && (
            <div style={{ border: '2px solid black', padding: '40px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{editingSection.id ? 'EDITAR SECCIÓN' : 'NUEVA SECCIÓN'}</h3>
                <button onClick={() => setEditingSection(null)} style={{ padding: '8px 20px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontWeight: 800, fontSize: '11px' }}>✕ CANCELAR</button>
              </div>

              {/* SECTION META */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {[
                  { key: 'label', label: 'ETIQUETA SUPERIOR (ej: ESPECIAL:)' },
                  { key: 'title', label: 'TÍTULO GRANDE (ej: Israel-Gaza)' },
                  { key: 'trend', label: 'TEXTO TENDENCIA (ej: EMERGENCIA GLOBAL)' },
                  { key: 'btn1', label: 'BOTÓN PRINCIPAL' },
                  { key: 'btn2', label: 'BOTÓN SECUNDARIO' },
                  { key: 'sort_order', label: 'ORDEN DE APARICIÓN (número)' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px', opacity: 0.6 }}>{label}</label>
                    <input
                      value={editingSection[key] || ''}
                      onChange={e => setEditingSection(p => ({ ...p, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                    />
                  </div>
                ))}
              </div>

              {/* MAIN CARD */}
              <div style={{ borderTop: '2px solid black', paddingTop: '32px', marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '20px', letterSpacing: '1px' }}>TARJETA PRINCIPAL (IZQUIERDA)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { key: 'label', label: 'SUPERTÍTULO (ej: NOTICIA DESTACADA — HACE 4H)' },
                    { key: 'title', label: 'TÍTULO DE LA NOTICIA' },
                    { key: 'desc', label: 'SUMARIO / DESCRIPCIÓN' },
                    { key: 'legendLeft', label: 'PIE IZQUIERDO (ej: COBERTURA: 124 FUENTES)' },
                    { key: 'legendRight', label: 'PIE DERECHO (ej: VER ANÁLISIS ↗)' },
                    { key: 'story_id', label: '⚡ ID NOTICIA SUPABASE (campo id de la tabla stories)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px', opacity: 0.6 }}>{label}</label>
                      <input
                        value={(editingSection.main || {})[key] || ''}
                        onChange={e => setEditingSection(p => ({ ...p, main: { ...p.main, [key]: e.target.value } }))}
                        style={{ width: '100%', padding: '10px', border: key === 'story_id' ? '2px solid black' : '1px solid #ccc', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: key === 'story_id' ? '#fffde7' : 'white' }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px', opacity: 0.6 }}>TIPO DE BARRA (grayscale / bipartisan)</label>
                  <select
                    value={(editingSection.main || {}).barType || 'grayscale'}
                    onChange={e => setEditingSection(p => ({ ...p, main: { ...p.main, barType: e.target.value } }))}
                    style={{ padding: '10px', border: '1px solid #ccc', fontSize: '13px' }}
                  >
                    <option value="grayscale">Gris (izquierda/centro)</option>
                    <option value="bipartisan">Bipartidista (negro/gris)</option>
                  </select>
                </div>
              </div>

              {/* SIDE CARDS */}
              <div style={{ borderTop: '2px solid black', paddingTop: '32px', marginBottom: '40px' }}>
                <div style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '20px', letterSpacing: '1px' }}>TARJETAS LATERALES (DERECHA — MÁX. 3)</div>
                {(editingSection.sides || [{},{},{}]).map((side, sIdx) => (
                  <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px', background: sIdx % 2 === 0 ? 'white' : '#f9f9f9', marginBottom: '2px', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, gridColumn: '1/-1', marginBottom: '-8px' }}>TARJETA LATERAL {sIdx + 1}</div>
                    {[
                      { key: 'label', label: 'ETIQUETA REGIÓN (ej: ALEMANIA)' },
                      { key: 'title', label: 'TÍTULO DEL ARTÍCULO LATERAL' },
                      { key: 'meta', label: 'META (ej: PUNTO CIEGO DE DERECHA)' },
                      { key: 'story_id', label: '⚡ ID NOTICIA SUPABASE' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label style={{ fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px', opacity: 0.6 }}>{label}</label>
                        <input
                          value={side[key] || ''}
                          onChange={e => setEditingSection(p => {
                            const ns = [...(p.sides || [{},{},{}])];
                            ns[sIdx] = { ...ns[sIdx], [key]: e.target.value };
                            return { ...p, sides: ns };
                          })}
                          style={{ width: '100%', padding: '8px', border: key === 'story_id' ? '2px solid black' : '1px solid #ccc', fontSize: '12px', fontFamily: 'inherit', outline: 'none', background: key === 'story_id' ? '#fffde7' : 'white' }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* AVAILABLE IDs */}
              <div style={{ border: '1px solid #eee', padding: '20px', marginBottom: '32px', background: 'white' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '12px', opacity: 0.5 }}>IDs DE NOTICIAS DISPONIBLES EN SUPABASE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(stories || []).map(s => (
                    <span key={s.id} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '4px 10px', border: '1px solid black', cursor: 'pointer' }}
                      title={s.title}
                    >
                      {s.id}
                    </span>
                  ))}
                </div>
              </div>

              <button
                disabled={loading}
                onClick={() => handleSaveSection(editingSection)}
                style={{ padding: '16px 40px', background: 'black', color: 'white', border: 'none', fontWeight: 900, fontSize: '13px', cursor: 'pointer', width: '100%', letterSpacing: '1px' }}
              >
                {loading ? 'GUARDANDO...' : 'GUARDAR SECCIÓN EN SUPABASE'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeView === 'POSTS' && !editingStoryArticles && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'black', border: '1px solid black' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 2fr', gap: '16px', padding: '16px 24px', background: '#f5f5f5', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
             <div>IMAGEN</div>
             <div>TÍTULO PRINCIPAL</div>
             <div>SECCIÓN</div>
             <div>DATOS SIDEBAR</div>
             <div style={{ textAlign: 'right' }}>ACCIONES</div>
           </div>

           {localStories.length === 0 && (
             <div style={{ padding: '60px', background: 'white', textAlign: 'center', fontWeight: 800, opacity: 0.5 }}>NO HAY POSTS. CREA UNO NUEVO.</div>
           )}

           {localStories.map((story) => {
             const isUploading = uploadingImageId === story.id;
             return (
             <div key={story.id} style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 2fr', gap: '16px', padding: '24px', background: 'white', alignItems: 'start', transition: '0.2s' }}>

               {/* IMAGE COLUMN */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                 <div
                   style={{ width: '72px', height: '48px', background: '#f0f0f0', border: '1px solid #ddd', overflow: 'hidden', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                   title="Haz clic para subir imagen"
                   onClick={() => !isUploading && document.getElementById(`img-upload-${story.id}`)?.click()}
                 >
                   {story.image && !story.image.includes('unsplash') ? (
                     <img src={story.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', opacity: 0.3 }}>⬛</div>
                   )}
                   {isUploading && (
                     <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                     </div>
                   )}
                 </div>
                 <input
                   id={`img-upload-${story.id}`}
                   type="file"
                   accept="image/*"
                   style={{ display: 'none' }}
                   onChange={e => handleImageUpload(story.id, e.target.files?.[0])}
                 />
                 <button
                   onClick={() => !isUploading && document.getElementById(`img-upload-${story.id}`)?.click()}
                   disabled={isUploading}
                   style={{ padding: '3px 8px', border: '1px solid #ccc', background: 'white', fontWeight: 900, fontSize: '9px', cursor: isUploading ? 'wait' : 'pointer', fontFamily: 'var(--font-mono)', opacity: isUploading ? 0.5 : 1, whiteSpace: 'nowrap' }}
                 >
                   {isUploading ? '...' : '↑ SUBIR'}
                 </button>
               </div>

               <div>
                 <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.2 }}>{story.title}</h3>
                 <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, fontFamily: 'var(--font-mono)' }}>ID: {story.id}</div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <span style={{ fontSize: '10px', padding: '4px 8px', background: 'black', color: 'white', width: 'fit-content', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>PUBLISHED</span>
                 <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.6 }}>{story.category}</span>
               </div>

               <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, lineHeight: '1.6', opacity: 0.6 }}>
                 <div>Artículos: {story.articles?.length || 0}</div>
                 <div>Perspectivas: {story.perspectivasInfo ? 'Sí' : 'No'}</div>
                 <div>Punto Ciego: {story.blindSpot ? 'Sí' : 'No'}</div>
                 <div>Cronología: {story.cronologiaInfo ? 'Sí' : 'No'}</div>
               </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleOpenArticles(story)} style={{ padding: '8px 16px', border: '2px solid black', background: 'black', color: 'white', fontWeight: 800, fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>ARTÍCULOS ({story.articles?.length || 0})</button>
                  <button onClick={() => handleEditStory(story)} style={{ padding: '8px 16px', border: '1px solid black', background: 'white', fontWeight: 800, fontSize: '10px', cursor: 'pointer' }}>EDITAR EN VISTA</button>
                  <button onClick={() => handleDelete(story.id)} style={{ padding: '8px 16px', border: '1px solid #d32f2f', color: '#d32f2f', background: 'white', fontWeight: 800, fontSize: '10px', cursor: 'pointer' }}>BORRAR</button>
               </div>
             </div>
           );
           })}
        </div>
      )}

      {activeView === 'POSTS' && editingStoryArticles && (
        <div>
          {/* Article editor header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '2px solid black', paddingBottom: '24px' }}>
            <div>
              <button onClick={handleCloseArticles} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '12px', padding: 0, opacity: 0.5 }}>← VOLVER A POSTS</button>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>ARTÍCULOS</h3>
              <p style={{ fontSize: '13px', opacity: 0.5, margin: '6px 0 0 0', fontFamily: 'var(--font-mono)' }}>{editingStoryArticles.title}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setDraftArticles(prev => [blankArticle(), ...prev])}
                style={{ padding: '12px 20px', border: '1px solid black', background: 'white', fontWeight: 900, fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
              >
                + AÑADIR ARTÍCULO
              </button>
              <button
                disabled={savingArticles}
                onClick={handleSaveArticles}
                style={{ padding: '12px 24px', background: 'black', color: 'white', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)', opacity: savingArticles ? 0.5 : 1 }}
              >
                {savingArticles ? 'GUARDANDO...' : `GUARDAR ${draftArticles.length} ARTÍCULOS`}
              </button>
            </div>
          </div>

          {draftArticles.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed #ccc' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.3 }}>SIN ARTÍCULOS. AÑADE UNO CON EL BOTÓN DE ARRIBA.</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {draftArticles.map((art, idx) => (
              <div key={idx} style={{ border: '1px solid #e0e0e0', borderLeft: `4px solid ${art.bias === 'LEFT' ? '#2196f3' : art.bias === 'RIGHT' ? '#f44336' : '#9e9e9e'}`, background: 'white' }}>
                {/* Article row header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>#{idx + 1}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>{art.source || 'Sin fuente'}</span>
                    <span style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 900, fontFamily: 'var(--font-mono)', background: art.bias === 'LEFT' ? '#2196f3' : art.bias === 'RIGHT' ? '#f44336' : '#9e9e9e', color: 'white' }}>{art.bias}</span>
                    <span style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 800, fontFamily: 'var(--font-mono)', border: '1px solid #ccc' }}>{art.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => moveDraftArticle(idx, -1)} disabled={idx === 0} style={{ padding: '4px 10px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '12px', opacity: idx === 0 ? 0.3 : 1 }}>↑</button>
                    <button onClick={() => moveDraftArticle(idx, 1)} disabled={idx === draftArticles.length - 1} style={{ padding: '4px 10px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '12px', opacity: idx === draftArticles.length - 1 ? 0.3 : 1 }}>↓</button>
                    <button onClick={() => deleteDraftArticle(idx)} style={{ padding: '4px 12px', border: '1px solid #d32f2f', color: '#d32f2f', background: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 900 }}>✕</button>
                  </div>
                </div>

                {/* Article fields grid */}
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {/* Row 1: source, bias, type */}
                  <ArticleField label="FUENTE / MEDIO" value={art.source} onChange={v => updateDraftArticle(idx, 'source', v)} />
                  <div>
                    <label style={labelStyle}>SESGO POLÍTICO</label>
                    <select value={art.bias} onChange={e => updateDraftArticle(idx, 'bias', e.target.value)} style={inputStyle}>
                      {BIAS_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>TIPO DE PIEZA</label>
                    <select value={art.type} onChange={e => updateDraftArticle(idx, 'type', e.target.value)} style={inputStyle}>
                      {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Row 2: author, tone, angle */}
                  <ArticleField label="AUTOR/A" value={art.author} onChange={v => updateDraftArticle(idx, 'author', v)} />
                  <ArticleField label="TONO" value={art.tone} onChange={v => updateDraftArticle(idx, 'tone', v)} placeholder="Ej: Crítico, Neutral, Favorable..." />
                  <ArticleField label="ÁNGULO" value={art.angle} onChange={v => updateDraftArticle(idx, 'angle', v)} placeholder="Ej: Económico, Político..." />

                  {/* Row 3: time, origin, title (spans 1 col) */}
                  <ArticleField label="TIEMPO" value={art.time} onChange={v => updateDraftArticle(idx, 'time', v)} placeholder="Ej: Hace 2 horas" />
                  <ArticleField label="ORIGEN / UBICACIÓN" value={art.origin} onChange={v => updateDraftArticle(idx, 'origin', v)} placeholder="Ej: Madrid, España" />
                  <ArticleField label="CLAVE DE APERTURA" value={art.whyOpened} onChange={v => updateDraftArticle(idx, 'whyOpened', v)} placeholder="Por qué abre portada..." />

                  {/* Row 4: title (full width) */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ArticleField label="TITULAR DEL ARTÍCULO" value={art.title} onChange={v => updateDraftArticle(idx, 'title', v)} placeholder="Titular completo del artículo..." />
                  </div>

                  {/* Row 5: diff (full width) */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ArticleTextarea label="ENFOQUE DETECTADO" value={art.diff} onChange={v => updateDraftArticle(idx, 'diff', v)} placeholder="Describe en qué se diferencia el enfoque de este artículo del resto..." rows={2} />
                  </div>

                  {/* Row 6: summary (full width) */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ArticleTextarea label="RESUMEN EXCLUSIVO" value={art.summary} onChange={v => updateDraftArticle(idx, 'summary', v)} placeholder="Resumen profundo del artículo..." rows={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {draftArticles.length > 0 && (
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={handleCloseArticles} style={{ padding: '14px 28px', border: '1px solid #ccc', background: 'white', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>CANCELAR</button>
              <button
                disabled={savingArticles}
                onClick={handleSaveArticles}
                style={{ padding: '16px 48px', background: 'black', color: 'white', border: 'none', fontWeight: 900, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '1px', opacity: savingArticles ? 0.5 : 1 }}
              >
                {savingArticles ? 'GUARDANDO...' : `GUARDAR ${draftArticles.length} ARTÍCULOS EN SUPABASE`}
              </button>
            </div>
          )}
        </div>
      )}

      {activeView === 'DESTACADOS' && (
        <div style={{ border: '1px solid black', padding: '40px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>CONTROL DE DESTACADOS (FRONT PAGE)</h3>
             <button disabled={loading} onClick={handleSaveAppConfig} style={{ padding: '12px 24px', background: 'black', color: 'white', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>{loading ? 'GUARDANDO...' : 'GUARDAR DESTACADOS'}</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px' }}>
              <div>
                  <label style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: '1px solid #ccc', paddingBottom: '12px', display: 'block', marginBottom: '16px' }}>TRENDING TOPICS BAR (JSON Array)</label>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Barra de navegación móvil. Formato: ["Ley de Vivienda", "FMI España"]</p>
                  <textarea 
                     rows={10}
                     defaultValue={JSON.stringify(appConfig.trending_topics || [], null, 2)}
                     onBlur={(e) => {
                       try { setAppConfig(p => ({ ...p, trending_topics: JSON.parse(e.target.value) })) } catch(err) {}
                     }}
                     style={{ width: '100%', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', border: '1px solid #ccc', outline: 'none' }}
                  />
              </div>
              <div>
                  <label style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: '1px solid #ccc', paddingBottom: '12px', display: 'block', marginBottom: '16px' }}>TITULARES DESTACADOS (JSON Array)</label>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Define los titulares que aparecen en la barra lateral derecha de la portada. Formato: [{`{"t": "Título", "w": "70%"}`}]</p>
                  <textarea 
                     rows={10}
                     defaultValue={JSON.stringify(appConfig.global_headlines || [], null, 2)}
                     onBlur={(e) => {
                       try { setAppConfig(p => ({ ...p, global_headlines: JSON.parse(e.target.value) })) } catch(err) {}
                     }}
                     style={{ width: '100%', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', border: '1px solid #ccc', outline: 'none' }}
                  />
              </div>
              <div>
                  <label style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: '1px solid #ccc', paddingBottom: '12px', display: 'block', marginBottom: '16px' }}>PUNTOS CIEGOS DESTACADOS (JSON Array)</label>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Define los puntos ciegos globales que aparecen en la portada. Formato: [{`{"type": "LEFT", "text": "..."}`}]</p>
                  <textarea 
                     rows={10}
                     defaultValue={JSON.stringify(appConfig.blind_spots || [], null, 2)}
                     onBlur={(e) => {
                       try { setAppConfig(p => ({ ...p, blind_spots: JSON.parse(e.target.value) })) } catch(err) {}
                     }}
                     style={{ width: '100%', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', border: '1px solid #ccc', outline: 'none' }}
                  />
              </div>
              <div>
                  <label style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: '1px solid #ccc', paddingBottom: '12px', display: 'block', marginBottom: '16px' }}>TEMAS RELACIONADOS (JSON Array)</label>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Muestra los botones de temas relacionados en la portada. Formato: ["TEMA 1", "TEMA 2"]</p>
                  <textarea 
                     rows={10}
                     defaultValue={JSON.stringify(appConfig.related_topics || [], null, 2)}
                     onBlur={(e) => {
                       try { setAppConfig(p => ({ ...p, related_topics: JSON.parse(e.target.value) })) } catch(err) {}
                     }}
                     style={{ width: '100%', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', border: '1px solid #ccc', outline: 'none' }}
                  />
              </div>
              <div>
                  <label style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: '1px solid #ccc', paddingBottom: '12px', display: 'block', marginBottom: '16px' }}>ENLACES FOOTER (JSON Object)</label>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Columnas y enlaces del footer. Formato: {`{"col1": {"title": "Noticias", "links": [{"label": "Página", "url": "/"}]}}`}</p>
                  <textarea 
                     rows={10}
                     defaultValue={JSON.stringify(appConfig.footer_links || {}, null, 2)}
                     onBlur={(e) => {
                       try { setAppConfig(p => ({ ...p, footer_links: JSON.parse(e.target.value) })) } catch(err) {}
                     }}
                     style={{ width: '100%', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', border: '1px solid #ccc', outline: 'none' }}
                  />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: '1px solid #ccc', paddingBottom: '12px', display: 'block', marginBottom: '16px' }}>SECCIONES ESPECIALES (JSON Array)</label>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Bloques complejos tipo Israel-Gaza, Elecciones US. Es un array de objetos con "main" y "sides". (Precaución al editar).</p>
                  <textarea 
                     rows={20}
                     defaultValue={JSON.stringify(appConfig.special_sections || [], null, 2)}
                     onBlur={(e) => {
                       try { setAppConfig(p => ({ ...p, special_sections: JSON.parse(e.target.value) })) } catch(err) {}
                     }}
                     style={{ width: '100%', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', border: '1px solid #ccc', outline: 'none' }}
                  />
              </div>
          </div>
        </div>
      )}

      {/* ─── USUARIOS ─── */}
      {activeView === 'USUARIOS' && (() => {
        const isAdminEditor = profile?.role === 'admin_editor';
        const filtered = adminUsers.filter(u => {
          if (!userFilter) return true;
          const term = userFilter.toLowerCase();
          return (u.email || '').toLowerCase().includes(term) ||
                 (u.full_name || '').toLowerCase().includes(term) ||
                 (u.role || '').toLowerCase().includes(term);
        });
        const totalUsers = adminUsers.length;
        const premiumUsers = adminUsers.filter(u => u.subscription_tier === 'premium').length;
        const managerUsers = adminUsers.filter(u => u.role === 'manager' || u.role === 'admin_editor').length;
        const last7d = adminUsers.filter(u => {
          if (!u.signed_up_at) return false;
          return Date.now() - new Date(u.signed_up_at).getTime() < 7 * 24 * 3600 * 1000;
        }).length;

        return (
          <div>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'black', border: '1px solid black', marginBottom: '32px' }}>
              {[
                { label: 'USUARIOS TOTALES', value: totalUsers },
                { label: 'PREMIUM', value: premiumUsers },
                { label: 'EQUIPO EDITORIAL', value: managerUsers },
                { label: 'NUEVOS (7D)', value: last7d }
              ].map(stat => (
                <div key={stat.label} style={{ background: 'white', padding: '24px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1.5px', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
              <input
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
                placeholder="Buscar por email, nombre o rol..."
                style={{ flex: 1, maxWidth: '400px', padding: '10px 14px', border: '1px solid #ccc', fontSize: '12px', fontFamily: 'inherit', outline: 'none' }}
              />
              <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.5 }}>
                {filtered.length} / {totalUsers} USUARIOS
              </div>
            </div>

            {/* Users table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'black', border: '1px solid black' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr', gap: '16px', padding: '16px 20px', background: '#f5f5f5', fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                <div>USUARIO</div>
                <div>ROL</div>
                <div>SUSCRIPCIÓN</div>
                <div>USO</div>
                <div style={{ textAlign: 'right' }}>ACCIÓN</div>
              </div>

              {usersLoading && (
                <div style={{ padding: '60px', background: 'white', textAlign: 'center', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>CARGANDO USUARIOS...</div>
              )}
              {!usersLoading && filtered.length === 0 && (
                <div style={{ padding: '60px', background: 'white', textAlign: 'center', fontWeight: 800, opacity: 0.5 }}>SIN RESULTADOS.</div>
              )}

              {!usersLoading && filtered.map(u => (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr', gap: '16px', padding: '16px 20px', background: 'white', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '2px' }}>{u.full_name || '—'}</div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>{u.email || `id:${u.id.substring(0, 8)}…`}</div>
                    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.3, marginTop: '4px' }}>
                      DESDE {u.signed_up_at ? new Date(u.signed_up_at).toLocaleDateString('es-ES') : '—'}
                    </div>
                  </div>
                  <div>
                    {isAdminEditor ? (
                      <select value={u.role || 'reader'} onChange={e => handleRoleChange(u.id, e.target.value)} style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', border: '1px solid #ccc' }}>
                        <option value="reader">reader</option>
                        <option value="manager">manager</option>
                        <option value="admin_editor">admin_editor</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '10px', padding: '4px 8px', background: u.role === 'admin_editor' ? '#ff3333' : (u.role === 'manager' ? 'black' : '#888'), color: 'white', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {(u.role || 'reader').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    {isAdminEditor ? (
                      <select value={u.subscription_tier || 'free'} onChange={e => handleTierChange(u.id, e.target.value)} style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', border: '1px solid #ccc' }}>
                        <option value="free">free</option>
                        <option value="premium">premium</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '10px', padding: '4px 8px', background: u.subscription_tier === 'premium' ? '#000' : '#eee', color: u.subscription_tier === 'premium' ? 'white' : 'black', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {(u.subscription_tier || 'free').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, lineHeight: 1.5, opacity: 0.7 }}>
                    <div>{u.articles_read || 0} artículos</div>
                    <div>{Math.round((u.reading_seconds || 0) / 60)} min</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => { setActiveView('COMUNICACIÓN'); setCommTab('NOTIFICACIONES'); setNewNotif(p => ({ ...p, user_id: u.id })); }}
                      style={{ padding: '6px 10px', border: '1px solid black', background: 'white', fontWeight: 800, fontSize: '9px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                      title="Enviar notificación a este usuario"
                    >
                      NOTIFICAR
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!isAdminEditor && (
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.5, marginTop: '16px' }}>
                ⚠ Solo los usuarios con rol <strong>admin_editor</strong> pueden modificar roles y suscripciones.
              </p>
            )}
          </div>
        );
      })()}

      {/* ─── COMUNICACIÓN (notificaciones + newsletter) ─── */}
      {activeView === 'COMUNICACIÓN' && (
        <div>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid #ddd' }}>
            {['NOTIFICACIONES', 'NEWSLETTER'].map(tab => (
              <span
                key={tab}
                onClick={() => setCommTab(tab)}
                style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', padding: '12px 0', cursor: 'pointer', letterSpacing: '1px', borderBottom: commTab === tab ? '3px solid black' : '3px solid transparent', opacity: commTab === tab ? 1 : 0.4, transition: 'all 0.2s' }}
              >
                {tab}
              </span>
            ))}
          </div>

          {/* NOTIFICACIONES sub-tab */}
          {commTab === 'NOTIFICACIONES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '32px' }}>
              {/* Composer */}
              <div style={{ border: '2px solid black', padding: '24px', background: '#fafafa', height: 'fit-content' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>NUEVA NOTIFICACIÓN</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>TÍTULO</label>
                    <input value={newNotif.title} onChange={e => setNewNotif(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Nueva sección de cobertura..." style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>MENSAJE</label>
                    <textarea value={newNotif.message} onChange={e => setNewNotif(p => ({ ...p, message: e.target.value }))} rows={3} placeholder="Detalle opcional..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>TIPO</label>
                      <select value={newNotif.type} onChange={e => setNewNotif(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                        <option value="info">info</option>
                        <option value="editorial">editorial</option>
                        <option value="success">success</option>
                        <option value="warning">warning</option>
                        <option value="system">system</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>ENLACE (opcional)</label>
                      <input value={newNotif.link} onChange={e => setNewNotif(p => ({ ...p, link: e.target.value }))} placeholder="/story/abc123 o https://..." style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>DESTINATARIO (vacío = broadcast a todos)</label>
                    <input value={newNotif.user_id} onChange={e => setNewNotif(p => ({ ...p, user_id: e.target.value }))} placeholder="user-id (UUID) o vacío" style={inputStyle} />
                    {newNotif.user_id && (
                      <button onClick={() => setNewNotif(p => ({ ...p, user_id: '' }))} style={{ marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', textDecoration: 'underline', opacity: 0.6 }}>
                        ← convertir en broadcast
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleSendNotification}
                    disabled={sendingNotif || !newNotif.title.trim()}
                    style={{ padding: '14px', background: 'black', color: 'white', border: 'none', fontWeight: 900, fontSize: '12px', cursor: sendingNotif ? 'wait' : 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '1px', opacity: sendingNotif || !newNotif.title.trim() ? 0.5 : 1 }}
                  >
                    {sendingNotif ? 'ENVIANDO...' : (newNotif.user_id ? 'ENVIAR A USUARIO ↗' : 'EMITIR BROADCAST ↗')}
                  </button>
                </div>
              </div>

              {/* History */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 900, margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>HISTORIAL ({allNotifications.length})</h3>
                {allNotifications.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #ccc', fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>SIN NOTIFICACIONES EMITIDAS</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                  {allNotifications.map(n => (
                    <div key={n.id} style={{ border: '1px solid #ddd', padding: '14px 16px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 900, padding: '2px 6px', background: 'black', color: 'white', letterSpacing: '0.5px' }}>{(n.type || 'info').toUpperCase()}</span>
                          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '2px 6px', background: n.user_id ? '#eee' : '#ffe066', letterSpacing: '0.5px' }}>{n.user_id ? 'USUARIO' : 'BROADCAST'}</span>
                          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>{new Date(n.created_at).toLocaleString('es-ES')}</span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>{n.title}</div>
                        {n.message && <p style={{ margin: 0, fontSize: '12px', opacity: 0.6, lineHeight: 1.4 }}>{n.message}</p>}
                        {n.link && <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.5, marginTop: '4px' }}>↗ {n.link}</div>}
                      </div>
                      <button onClick={() => handleDeleteNotification(n.id)} style={{ padding: '4px 8px', border: '1px solid #d32f2f', color: '#d32f2f', background: 'white', cursor: 'pointer', fontSize: '10px', fontWeight: 900 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NEWSLETTER sub-tab */}
          {commTab === 'NEWSLETTER' && (() => {
            const active = subscribers.filter(s => s.is_active);
            const byFreq = active.reduce((acc, s) => { acc[s.frequency] = (acc[s.frequency] || 0) + 1; return acc; }, {});
            return (
              <div>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'black', border: '1px solid black', marginBottom: '32px' }}>
                  {[
                    { label: 'SUSCRIPTORES ACTIVOS', value: active.length },
                    { label: 'DIARIA', value: byFreq.daily || 0 },
                    { label: 'SEMANAL', value: byFreq.weekly || 0 },
                    { label: 'BREAKING', value: byFreq.breaking || 0 }
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'white', padding: '24px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1.5px', marginBottom: '8px' }}>{stat.label}</div>
                      <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>SUSCRIPTORES ({subscribers.length})</h3>
                  <button onClick={exportSubscribersCSV} style={{ padding: '10px 18px', background: 'black', color: 'white', border: 'none', fontWeight: 900, fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                    ↓ EXPORTAR CSV (ACTIVOS)
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'black', border: '1px solid black' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', gap: '16px', padding: '14px 20px', background: '#f5f5f5', fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                    <div>EMAIL</div>
                    <div>NOMBRE</div>
                    <div>FRECUENCIA</div>
                    <div>FUENTE</div>
                    <div>ALTA</div>
                    <div style={{ textAlign: 'right' }}>ESTADO</div>
                  </div>

                  {subscribers.length === 0 && (
                    <div style={{ padding: '60px', background: 'white', textAlign: 'center', fontWeight: 800, opacity: 0.5 }}>SIN SUSCRIPTORES TODAVÍA.</div>
                  )}

                  {subscribers.map(sub => (
                    <div key={sub.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', gap: '16px', padding: '14px 20px', background: 'white', alignItems: 'center', fontSize: '12px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, opacity: sub.is_active ? 1 : 0.3 }}>{sub.email}</div>
                      <div style={{ opacity: 0.7 }}>{sub.full_name || '—'}</div>
                      <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{(sub.frequency || 'weekly').toUpperCase()}</div>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>{sub.source || 'footer'}</div>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>{new Date(sub.created_at).toLocaleDateString('es-ES')}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggleSubscriber(sub)}
                          style={{ padding: '4px 10px', border: '1px solid black', background: sub.is_active ? 'black' : 'white', color: sub.is_active ? 'white' : 'black', fontWeight: 800, fontSize: '9px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                        >
                          {sub.is_active ? 'ACTIVO' : 'BAJA'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};

export default ManagerStudio;
