import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStory, deleteStory, fetchAppConfig, updateAppConfig } from '../supabaseService';

const Plus = () => <span style={{ fontSize: '18px', opacity: 0.3, fontWeight: 700 }}>+</span>;

const ManagerStudio = ({ user, profile, stories, onRefresh }) => {
  const navigate = useNavigate();
  const isManager = profile?.role === 'manager' || profile?.role === 'admin_editor' || user?.email === 'hectorvidal0411@gmail.com';
  const [activeView, setActiveView] = useState('POSTS'); // POSTS, DESTACADOS
  const [loading, setLoading] = useState(false);
  const [localStories, setLocalStories] = useState(stories || []);
  
  // App Config state for Highlights
  const [appConfig, setAppConfig] = useState({ global_headlines: [], blind_spots: [] });

  useEffect(() => {
    setLocalStories(stories);
  }, [stories]);

  useEffect(() => {
    if (activeView === 'DESTACADOS') {
       fetchAppConfig().then(c => {
         if(c) setAppConfig(c);
       });
    }
  }, [activeView]);

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
        {['POSTS', 'DESTACADOS'].map(tab => (
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
                  <label style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: '1px solid #ccc', paddingBottom: '12px', display: 'block', marginBottom: '16px' }}>TITULARES DESTACADOS (JSON Array)</label>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Define los titulares que aparecen en la barra lateral derecha de la portada. Formato: [{`{"t": "Título", "w": "70%"}`}]</p>
                  <textarea 
                     rows={15}
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
                     rows={15}
                     defaultValue={JSON.stringify(appConfig.blind_spots || [], null, 2)}
                     onBlur={(e) => {
                       try { setAppConfig(p => ({ ...p, blind_spots: JSON.parse(e.target.value) })) } catch(err) {}
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
