import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStory, deleteStory, fetchAppConfig, updateAppConfig, fetchSpecialSections, saveSpecialSection, deleteSpecialSection } from '../supabaseService';

const Plus = () => <span style={{ fontSize: '18px', opacity: 0.3, fontWeight: 700 }}>+</span>;

const ManagerStudio = ({ user, profile, stories, onRefresh }) => {
  const navigate = useNavigate();
  const isManager = profile?.role === 'manager' || profile?.role === 'admin_editor';
  const [activeView, setActiveView] = useState('POSTS'); // POSTS, SECCIONES, DESTACADOS
  const [loading, setLoading] = useState(false);
  const [localStories, setLocalStories] = useState(stories || []);
  const [specialSections, setSpecialSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null); // section being edited in form
  
  // App Config state for Highlights
  const [appConfig, setAppConfig] = useState({ global_headlines: [], blind_spots: [], related_topics: [], special_sections: [], footer_links: {}, trending_topics: [] });

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
  }, [activeView]);

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
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        {['POSTS', 'SECCIONES', 'DESTACADOS'].map(tab => (
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

      {activeView === 'POSTS' && (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'black', border: '1px solid black' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '16px', padding: '16px 24px', background: '#f5f5f5', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
             <div>TÍTULO PRINCIPAL</div>
             <div>SECCIÓN</div>
             <div>DATOS SIDEBAR</div>
             <div style={{ textAlign: 'right' }}>ACCIONES</div>
           </div>
           
           {localStories.length === 0 && (
             <div style={{ padding: '60px', background: 'white', textAlign: 'center', fontWeight: 800, opacity: 0.5 }}>NO HAY POSTS. CREA UNO NUEVO.</div>
           )}

           {localStories.map((story) => (
             <div key={story.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '16px', padding: '24px', background: 'white', alignItems: 'start', transition: '0.2s' }}>
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
               
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={() => handleEditStory(story)} style={{ padding: '8px 16px', border: '1px solid black', background: 'white', fontWeight: 800, fontSize: '10px', cursor: 'pointer' }}>EDITAR EN VISTA</button>
                  <button onClick={() => handleDelete(story.id)} style={{ padding: '8px 16px', border: '1px solid #d32f2f', color: '#d32f2f', background: 'white', fontWeight: 800, fontSize: '10px', cursor: 'pointer' }}>BORRAR</button>
               </div>
             </div>
           ))}
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

    </div>
  );
};

export default ManagerStudio;
