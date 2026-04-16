import React, { useState } from 'react';

// --- ELEMENTOS UI REUSABLES ---

const Toggle = ({ active, onChange }) => {
  const [isActive, setIsActive] = useState(active);
  const handleToggle = () => {
     setIsActive(!isActive);
     onChange && onChange(!isActive);
  }
  return (
    <div onClick={handleToggle} style={{ width: '44px', height: '24px', background: !isActive ? '#eee' : 'black', borderRadius: '100px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', border: !isActive ? '1px solid #ddd' : '1px solid black' }}>
      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', left: isActive ? '22px' : '3px', top: '3px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
    </div>
  )
};

const Button = ({ children, onClick, variant = 'secondary', block = false, disabled = false, style }) => {
  const [hover, setHover] = useState(false);
  const styles = {
    primary: { background: hover ? '#333' : 'black', color: 'white', border: '1px solid black' },
    secondary: { background: hover ? '#f5f5f5' : 'white', color: 'black', border: '1px solid black' },
    danger: { background: hover ? '#fff5f5' : 'none', color: '#d32f2f', border: '1px solid #d32f2f' },
    ghost: { background: hover ? '#f9f9f9' : 'transparent', color: 'black', border: '1px solid transparent', textDecoration: hover ? 'none' : 'underline' }
  };
  const base = {
    padding: '12px 24px',
    fontSize: '11px',
    fontWeight: 900,
    fontFamily: 'var(--font-mono)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: block ? '100%' : 'auto',
    textAlign: 'center',
    display: 'inline-block',
    transition: '0.2s',
    ...styles[variant],
    ...style
  };
  return <button onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={disabled ? undefined : onClick} style={base}>{children}</button>;
};

const TextInput = ({ label, value, type="text", placeholder, verified }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
       <label style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5 }}>{label}</label>
       {verified !== undefined && (
          <span style={{ fontSize: '10px', fontWeight: 800, color: verified ? '#2e7d32' : '#d32f2f' }}>
            {verified ? 'VERIFICADO ✓' : 'NO VERIFICADO ⚠️'}
          </span>
       )}
    </div>
    <input type={type} defaultValue={value} placeholder={placeholder} style={{ width: '100%', padding: '16px', border: '1px solid #ccc', fontSize: '14px', background: '#fcfcfc', transition: 'border 0.2s', outline: 'none' }} onFocus={(e) => e.target.style.border = '1px solid black'} onBlur={(e) => e.target.style.border = '1px solid #ccc'} />
  </div>
);


// --- PESTAÑAS (TABS) INTERNAS ---

const TABS = [
  { id: 'profile', label: 'Mi Perfil' },
  { id: 'preferences', label: 'Ajustes de Lectura' },
  { id: 'security', label: 'Seguridad' },
  { id: 'billing', label: 'Mi Suscripción' },
  { id: 'notifications', label: 'Notificaciones' },
  { id: 'stats', label: 'Mis Estadísticas' },
  { id: 'privacy', label: 'Privacidad y Datos' }
];


// --- COMPONENTES DE BLOQUE (SUBVISTAS) ---

const TabProfile = ({ user, profile }) => {
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
     <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
       {success && (
          <div style={{ padding: '16px', background: 'black', color: 'white', marginBottom: '24px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between', letterSpacing: '1px' }}>
             <span>PERFIL ACTUALIZADO CORRECTAMENTE</span>
             <span style={{ cursor: 'pointer' }} onClick={() => setSuccess(false)}>✕</span>
          </div>
       )}
       <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '40px' }}>Mi Perfil</h2>
       
       <div style={{ border: 'var(--border-thin)', padding: '40px' }}>
          {/* AVATAR & NAME SECTION */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: '#eee', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              fontWeight: 800 
            }}>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              {!editing ? (
                <>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>{profile?.full_name || 'Héctor Vidal'}</div>
                  <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', opacity: 0.5, marginTop: '4px' }}>@{profile?.username || 'hector_v'}</div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input defaultValue={profile?.full_name || 'Héctor Vidal'} style={{ fontSize: '24px', fontWeight: 800, border: 'none', borderBottom: '1px solid black', width: '300px', outline: 'none', padding: '0 0 4px 0', fontFamily: 'inherit' }} />
                  <input defaultValue={'@' + (profile?.username || 'hector_v')} style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', opacity: 0.5, border: 'none', width: '200px', outline: 'none', padding: 0 }} />
                </div>
              )}
            </div>
          </div>
          
          {/* CORE DATA GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', paddingBottom: '40px', borderBottom: 'var(--border-thin)', marginBottom: '40px' }}>
             <div>
               <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.4, marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>EMAIL</div>
               {!editing ? (
                 <div style={{ fontWeight: 600 }}>{user?.email || 'hectorvidal041103@gmail.com'}</div>
               ) : (
                 <input defaultValue={user?.email || 'hectorvidal041103@gmail.com'} style={{ fontWeight: 600, border: 'none', borderBottom: '1px solid #ddd', width: '100%', outline: 'none', padding: '4px 0', fontFamily: 'inherit' }} />
               )}
             </div>
             <div>
               <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.4, marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>TELÉFONO</div>
               {!editing ? (
                 <div style={{ fontWeight: 600 }}>+34 600 000 000</div>
               ) : (
                 <input defaultValue="+34 600 000 000" style={{ fontWeight: 600, border: 'none', borderBottom: '1px solid #ddd', width: '100%', outline: 'none', padding: '4px 0', fontFamily: 'inherit' }} />
               )}
             </div>
             <div>
               <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.4, marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>LOCALIZACIÓN</div>
               {!editing ? (
                 <>
                   <div style={{ fontWeight: 600 }}>Español (ES)</div>
                   <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Madrid, España</div>
                 </>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   <select style={{ fontWeight: 600, border: 'none', borderBottom: '1px solid #ddd', outline: 'none', padding: '4px 0', background: 'transparent', fontFamily: 'inherit' }}><option>Español (ES)</option><option>English (US)</option></select>
                   <select style={{ fontSize: '12px', opacity: 0.6, border: 'none', outline: 'none', padding: 0, background: 'transparent', fontFamily: 'inherit' }}><option>Madrid, España</option></select>
                 </div>
               )}
             </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            {!editing ? (
              <Button variant="secondary" onClick={() => setEditing(true)}>EDITAR PERFIL</Button>
            ) : (
              <>
                <Button variant="primary" onClick={handleSave}>GUARDAR CAMBIOS</Button>
                <Button variant="ghost" onClick={() => setEditing(false)} style={{ color: '#888' }}>CANCELAR</Button>
              </>
            )}
          </div>
       </div>
     </div>
  );
};


const TabPreferences = () => {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '40px' }}>Ajustes de Lectura</h2>
        
        {/* Visual Settings */}
        <div style={{ marginBottom: '60px' }}>
           <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5 }}>DISEÑO VISUAL</h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ border: '2px solid black', padding: '24px', cursor: 'pointer', background: '#fafafa' }}>
                 <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Brutalista</div>
                 <div style={{ fontSize: '12px', opacity: 0.6, lineHeight: '1.4' }}>Diseño directo con fuentes de estilo técnico. (ACTIVO)</div>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '24px', cursor: 'pointer', opacity: 0.6, transition: '0.2s' }}>
                 <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Compacto</div>
                 <div style={{ fontSize: '12px', opacity: 0.6, lineHeight: '1.4' }}>Menos espacio entre noticias para leer más rápido.</div>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '24px', cursor: 'pointer', opacity: 0.6, transition: '0.2s' }}>
                 <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Cómodo</div>
                 <div style={{ fontSize: '12px', opacity: 0.6, lineHeight: '1.4' }}>Más espacio y letra más fluida para leer tranquilo.</div>
              </div>
           </div>
        </div>

        {/* Content Depth Settings */}
        <div style={{ marginBottom: '60px' }}>
           <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5 }}>NIVEL DE DETALLE</h3>
           <div style={{ border: 'var(--border-thin)', padding: '32px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #eee' }}>
               <div style={{ maxWidth: '60%' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>Cantidad de información</div>
                  <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '8px', lineHeight: '1.5' }}>Elige si prefieres ver resúmenes rápidos o artículos completos y profundos.</div>
               </div>
               <select style={{ padding: '16px 24px', background: '#eee', border: 'none', fontWeight: 800, outline: 'none', fontFamily: 'inherit' }}>
                 <option>Artículos profundos</option>
                 <option>Equilibrado (Recomendado)</option>
                 <option>Resumen rápido</option>
               </select>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ maxWidth: '60%' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>Frecuencia de noticias</div>
                  <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '8px', lineHeight: '1.5' }}>Filtra qué noticias quieres ver primero según su importancia.</div>
               </div>
               <select style={{ padding: '16px 24px', background: '#eee', border: 'none', fontWeight: 800, outline: 'none', fontFamily: 'inherit' }}>
                 <option>Solo lo más importante</option>
                 <option>Selección editorial</option>
                 <option>Todo al momento</option>
               </select>
             </div>
           </div>
        </div>

        {/* Intelligence Settings */}
        <div style={{ marginBottom: '60px' }}>
           <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5 }}>PERSONALIZACIÓN</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ maxWidth: '70%' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>Basado en tus intereses</div>
                    <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px', lineHeight: '1.5' }}>Usaremos tus lecturas recientes para mostrarte noticias que te gusten más.</div>
                 </div>
                 <Toggle active={true} />
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ maxWidth: '70%' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>Mostrar opiniones variadas</div>
                    <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px', lineHeight: '1.5' }}>Te mostraremos contenido de diferentes puntos de vista para evitar burbujas.</div>
                 </div>
                 <Toggle active={true} />
               </div>
           </div>
        </div>

        {/* Categories */}
        <div>
           <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5 }}>MIS TEMAS FAVORITOS</h3>
           <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '24px' }}>Organiza los temas que aparecen en tu página principal.</p>
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {['POLÍTICA', 'ECONOMÍA', 'TECNOLOGÍA', 'SUCESOS', 'VIVIENDA'].map(c => (
                <div key={c} style={{ padding: '12px 24px', border: '1px solid black', background: 'white', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s', cursor: 'grab' }}>
                  <span style={{ opacity: 0.3 }}>≡</span>
                  <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{c}</span>
                  <span style={{ cursor: 'pointer', opacity: 0.3, fontWeight: 900, marginLeft: '8px' }}>✕</span>
                </div>
              ))}
              <div style={{ padding: '12px 24px', border: '1px dashed #ccc', color: 'black', background: '#fafafa', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '16px' }}>+</span> AÑADIR TEMA
              </div>
           </div>
        </div>
    </div>
  );
};


const TabSecurity = () => {
   return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
         <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '40px' }}>Seguridad</h2>
         
         <div style={{ border: 'var(--border-thin)', padding: '40px', marginBottom: '60px' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '32px' }}>Ajustes de acceso</h3>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #eee' }}>
                <div>
                   <div style={{ fontSize: '15px', fontWeight: 800 }}>Contraseña</div>
                   <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>Cambiado por última vez hace unos meses.</div>
                </div>
                <Button variant="secondary">CAMBIAR CONTRASEÑA</Button>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ maxWidth: '60%' }}>
                   <div style={{ fontSize: '15px', fontWeight: 800 }}>Doble verificación</div>
                   <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px', lineHeight: '1.5' }}>Añade una protección extra usando tu móvil. Muy recomendado.</div>
                </div>
                <Button variant="primary">ACTIVAR</Button>
             </div>
         </div>

         <div style={{ border: 'var(--border-thin)', padding: '40px', marginBottom: '60px' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Cuentas vinculadas</h3>
             <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, padding: '24px', border: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                   <div style={{ fontWeight: 800 }}>Google</div>
                   <span style={{ fontSize: '10px', color: '#2e7d32', fontWeight: 800 }}>CONECTADO</span>
                </div>
                <div style={{ flex: 1, padding: '24px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontWeight: 800 }}>Apple</div>
                   <Button variant="ghost">CONECTAR</Button>
                </div>
             </div>
         </div>

         <div>
             <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Sesiones activas</h3>
             <div style={{ border: 'var(--border-thin)' }}>
                <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', borderBottom: '1px solid #ccc' }}>
                   <div>
                     <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800 }}>MacBook Pro 16"</span>
                        <span style={{ background: 'black', color: 'white', padding: '4px 8px', fontSize: '9px', fontWeight: 900 }}>ESTE DISPOSITIVO</span>
                     </div>
                     <div style={{ fontSize: '12px', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>Madrid, España • Activo ahora</div>
                   </div>
                </div>
                <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>iPhone 15 Pro</div>
                     <div style={{ fontSize: '12px', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>Barcelona, España • Hace 6 horas</div>
                   </div>
                   <Button variant="danger">CERRAR SESIÓN</Button>
                </div>
             </div>
             <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <Button variant="danger">CERRAR TODAS LAS SESIONES</Button>
             </div>
         </div>
      </div>
   );
};

const TabBilling = ({ onUpgrade }) => {
   return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
         <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '40px' }}>Mi Suscripción</h2>

         <div style={{ background: '#fff', color: '#000', padding: '40px', marginBottom: '60px', border: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px', marginBottom: '24px' }}>MI PLAN ACTUAL</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: '1' }}>Elite</span>
                  <span style={{ background: '#000', color: '#fff', padding: '6px 12px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.5px' }}>ACTIVO</span>
               </div>
               <div style={{ fontSize: '13px', opacity: 0.5, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>Precio: 8€ / mes • Siguiente pago: 01 MAY, 2026</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px' }}>
               <button 
                 onClick={onUpgrade}
                 style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer', background: 'black', color: 'white', border: 'none', width: '100%' }}
               >
                 CAMBIAR PLAN
               </button>
               <button style={{ padding: '12px 24px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer', background: '#eee', color: '#666', border: 'none', width: '100%' }}>CANCELAR</button>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px', alignItems: 'stretch' }}>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5 }}>MÉTODO DE PAGO</h3>
                <div style={{ border: 'var(--border-thin)', padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                   <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                           <div style={{ background: '#eee', padding: '8px 12px', fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', border: '1px solid #ccc' }}>VISA</div>
                           <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '2px' }}>•••• 4242</div>
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 900, border: '1px solid black', padding: '4px 8px' }}>PRINCIPAL</span>
                     </div>
                     <div style={{ fontSize: '13px', opacity: 0.5, marginBottom: '32px', fontFamily: 'var(--font-mono)' }}>Caduca en: 08/2028</div>
                   </div>
                   <Button variant="secondary" block>AÑADIR TARJETA</Button>
                </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5 }}>DATOS FISCALES</h3>
                <div style={{ border: 'var(--border-thin)', padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                   <div style={{ gridGap: '16px', display: 'grid', fontSize: '13px', marginBottom: '32px', fontFamily: 'var(--font-mono)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.5 }}>Nombre</span><span style={{ fontWeight: 800 }}>Héctor Vidal</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.5 }}>DNI / CIF</span><span style={{ fontWeight: 800 }}>B-12345678</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.5 }}>Dirección</span><span style={{ fontWeight: 800, textAlign: 'right', whiteSpace: 'pre-line' }}>{`Gran Vía 12\n28013 Madrid, España`}</span></div>
                   </div>
                   <Button variant="secondary" block>EDITAR DATOS</Button>
                </div>
             </div>
         </div>

         <div>
             <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5 }}>MIS FACTURAS</h3>
             <div style={{ border: 'var(--border-thin)' }}>
                {['01 ABR 2026', '01 MAR 2026', '01 FEB 2026'].map((date, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', background: i % 2 === 0 ? '#fafafa' : 'white', borderBottom: i < 2 ? '1px solid #eee' : 'none' }}>
                     <div>
                       <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>Suscripción Elite</div>
                       <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>Fecha: {date} • Ref: INV-20260{4-i}</div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                       <div style={{ fontSize: '18px', fontWeight: 800 }}>8€</div>
                       <Button variant="ghost"> DESCARGAR </Button>
                     </div>
                  </div>
                ))}
             </div>
         </div>
      </div>
   );
};

const TabNotifications = () => {
   return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
         <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '40px' }}>Notificaciones</h2>
         
         <div style={{ marginBottom: '60px' }}>
             <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', borderBottom: 'var(--border-thin)', paddingBottom: '16px', marginBottom: '24px', opacity: 0.5 }}>AVISOS DE CONTENIDO</h3>
             <div style={{ border: 'var(--border-thin)', padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 100px 100px', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid #ccc', marginBottom: '32px' }}>
                   <div></div>
                   <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>EMAIL</div>
                   <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.5, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>MÓVIL</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 100px 100px', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
                   <div style={{ paddingRight: '24px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800 }}>Resumen diario</div>
                      <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '6px', lineHeight: '1.4' }}>Recibe un correo con lo más importante del día.</div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle active={true} /></div>
                   <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle active={false} /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 100px 100px', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
                   <div style={{ paddingRight: '24px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800 }}>Noticias de última hora</div>
                      <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '6px', lineHeight: '1.4' }}>Te avisamos de eventos urgentes al instante.</div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle active={true} /></div>
                   <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle active={true} /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 100px 100px', gap: '24px', alignItems: 'center' }}>
                   <div style={{ paddingRight: '24px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800 }}>Resumen semanal</div>
                      <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '6px', lineHeight: '1.4' }}>Un análisis de tus lecturas de la semana.</div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle active={true} /></div>
                   <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle active={false} /></div>
                </div>
             </div>
         </div>
      </div>
   );
};

const TabStats = () => {
   return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
         <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '40px' }}>Mis Estadísticas</h2>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2px', background: '#e0e0e0', border: '1px solid #e0e0e0', marginBottom: '60px' }}>
             <div style={{ background: 'white', padding: '40px 32px' }}>
                 <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '12px' }}>NOTICIAS LEÍDAS</div>
                 <div style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-3px', lineHeight: '1' }}>342</div>
                 <div style={{ fontSize: '12px', fontWeight: 800, color: '#2e7d32', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>▲ +24 este mes</div>
             </div>
             <div style={{ background: 'white', padding: '40px 32px' }}>
                 <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '12px' }}>TIEMPO DE LECTURA</div>
                 <div style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-3px', lineHeight: '1' }}>62<span style={{ fontSize: '24px' }}>h</span></div>
                 <div style={{ fontSize: '12px', fontWeight: 800, color: '#2e7d32', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>▲ Muy activo</div>
             </div>
             <div style={{ background: 'white', padding: '40px 32px' }}>
                 <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, marginBottom: '12px' }}>VARIEDAD DE FUENTES</div>
                 <div style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-3px', lineHeight: '1' }}>84<span style={{ fontSize: '24px' }}>%</span></div>
                 <div style={{ fontSize: '12px', fontWeight: 800, color: 'black', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>★ Lee de todo</div>
             </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '40px', marginBottom: '60px' }}>
             <div style={{ border: 'var(--border-thin)', padding: '40px' }}>
                 <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '32px', opacity: 0.5, borderBottom: '1px solid #ccc', paddingBottom: '16px' }}>ACTIVIDAD (30 DÍAS)</h3>
                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', borderBottom: '2px solid black', paddingBottom: '8px' }}>
                    {[20, 60, 45, 80, 100, 70, 50, 45, 90, 65, 40, 20, 85, 30].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: h > 85 ? 'black' : h > 40 ? '#888' : '#e0e0e0', height: `${h}%`, transition: 'height 0.3s ease' }}></div>
                    ))}
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '11px', opacity: 0.4, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                    <span>Hace 30 días</span>
                    <span>Hoy</span>
                 </div>
             </div>
             <div style={{ border: 'var(--border-thin)', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '16px', opacity: 0.5, letterSpacing: '1px' }}>RACHA DE LECTURA</h3>
                 <div style={{ fontSize: '80px', fontWeight: 800, letterSpacing: '-5px', lineHeight: '0.9', margin: '16px 0' }}>14<span style={{ fontSize: '32px', letterSpacing: '-1px' }}>d</span></div>
                 <div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.6, lineHeight: '1.5' }}>Días seguidos leyendo noticias. Tu récord es 28.</div>
             </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
             <div style={{ border: 'var(--border-thin)', padding: '40px', background: '#fafafa' }}>
                 <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '32px', opacity: 0.5, borderBottom: '1px solid #ccc', paddingBottom: '16px' }}>TEMAS MÁS LEÍDOS</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {[
                      { l: 'Políticas Públicas', val: '58%' }, 
                      { l: 'Banca y Economía', val: '27%' }, 
                      { l: 'Sector Tecnológico', val: '12%' },
                      { l: 'Geopolítica', val: '3%' }
                    ].map((c, i) => (
                      <div key={i}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}><span>{c.l}</span><span>{c.val}</span></div>
                         <div style={{ height: '2px', background: '#ddd' }}><div style={{ width: c.val, height: '100%', background: 'black' }} /></div>
                      </div>
                    ))}
                 </div>
             </div>
             <div style={{ border: 'var(--border-thin)', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '32px', opacity: 0.5, borderBottom: '1px solid #ccc', paddingBottom: '16px' }}>INTERÉS EN AVISOS</h3>
                    <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px' }}>74%</div>
                    <div style={{ fontSize: '14px', opacity: 0.6, marginTop: '8px', marginBottom: '32px', lineHeight: '1.5' }}>Porcentaje de avisos que has abierto en los últimos meses.</div>
                  </div>
                  <Button variant="secondary" block style={{ marginTop: 'auto' }}>DESCARGAR MIS DATOS (CSV)</Button>
             </div>
         </div>
      </div>
   )
}

const TabPrivacy = () => {
   return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
         <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '40px' }}>Privacidad y Datos</h2>
         
         <div style={{ border: 'var(--border-thin)', padding: '40px', marginBottom: '60px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Cómo usamos tus datos</h3>
            <p style={{ fontSize: '15px', lineHeight: '1.7', opacity: 0.7, marginBottom: '40px', maxWidth: '700px' }}>
              No vendemos tu información a terceros. Usamos tus datos exclusivamente para mejorar tu experiencia de lectura y mostrarte contenido relevante.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '32px', borderBottom: '1px solid #eee', marginBottom: '32px' }}>
                <div style={{ maxWidth: '70%' }}>
                   <div style={{ fontSize: '16px', fontWeight: 800 }}>Permitir estadísticas técnicas</div>
                   <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '8px', lineHeight: '1.5' }}>Si lo activas, nos ayudas a detectar errores en la web para que todo cargue rápido.</div>
                </div>
                <Toggle active={true} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ maxWidth: '70%' }}>
                   <div style={{ fontSize: '16px', fontWeight: 800 }}>Uso de historial para recomendaciones</div>
                   <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '8px', lineHeight: '1.5' }}>Permite que el sistema use lo que has leído antes para sugerirte noticias nuevas.</div>
                </div>
                <Toggle active={true} />
            </div>
         </div>

         <div style={{ border: 'var(--border-thin)', padding: '40px', marginBottom: '60px', background: '#fafafa' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Descargar tus datos</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.7, marginBottom: '32px', maxWidth: '700px' }}>Eres el dueño de tu información. Puedes descargar todo lo que hemos guardado en un archivo simple.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
               <Button variant="secondary">DESCARGAR MIS DATOS</Button>
               <Button variant="ghost">VER CONDICIONES LEGALES</Button>
            </div>
         </div>

         <div style={{ border: '1px solid #d32f2f', padding: '40px', background: '#fffcfc' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#d32f2f', marginBottom: '16px' }}>Eliminar cuenta</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.8, marginBottom: '32px', color: '#8b0000', maxWidth: '700px' }}>
               Esto borrará permanentemente tu perfil y todos tus datos de nuestros servidores. No se puede deshacer.
            </p>
            <Button variant="danger" disabled style={{ fontSize: '10px' }}>SE REQUIERE CONFIRMACIÓN POR EMAIL</Button>
         </div>

      </div>
   );
};

// --- COMPONENTE PRINCIPAL ---

const Account = ({ user, profile, onBack, onSaveSettings, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTab = () => {
    switch(activeTab) {
      case 'profile': return <TabProfile user={user} profile={profile} />;
      case 'preferences': return <TabPreferences />;
      case 'security': return <TabSecurity />;
      case 'billing': return <TabBilling onUpgrade={onUpgrade} />;
      case 'notifications': return <TabNotifications />;
      case 'stats': return <TabStats />;
      case 'privacy': return <TabPrivacy />;
      default: return <TabProfile user={user} profile={profile} />;
    }
  };

  return (
    <div className="account-view" style={{ animation: 'fadeIn 0.5s ease-out', background: '#fff' }}>
      
      {/* 1. HERO HEADER */}
      <section style={{ 
        padding: '100px 0 60px 0', 
        borderBottom: 'var(--border-thin)', 
        marginBottom: '60px'
      }}>
        <div className="container" style={{ padding: '0 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
                <span onClick={onBack} style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>← VOLVER</span>
                <span style={{ opacity: 0.2 }}>/</span>
                <span style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4 }}>AJUSTES DE CUENTA</span>
              </div>
              <h1 style={{ fontSize: '100px', fontWeight: 800, letterSpacing: '-6px', lineHeight: '0.8', margin: 0 }}>
                Mi Cuenta.
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-split">
        {/* 2. NAVIGATION SIDEBAR */}
        <div className="sidebar" style={{ paddingRight: '60px', borderRight: 'var(--border-thin)' }}>
          <div style={{ position: 'sticky', top: '100px' }}>
             
             {/* Navegación Interna */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TABS.map(tab => (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     style={{
                        padding: '16px 20px',
                        background: activeTab === tab.id ? 'black' : 'transparent',
                        color: activeTab === tab.id ? 'white' : 'black',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '15px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-main)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                     }}
                   >
                      {tab.label}
                      {activeTab === tab.id && <span>→</span>}
                   </button>
                ))}
             </div>
             
             {/* Soporte */}
             <div style={{ marginTop: '60px', padding: '32px', border: 'var(--border-thin)', background: '#fafafa' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, marginBottom: '12px', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>AYUDA</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '24px', lineHeight: '1.4' }}>¿Tienes algún problema técnico o duda?</div>
                <Button variant="secondary" block>CONTACTAR ATENCIÓN</Button>
             </div>
             
             <div style={{ marginTop: '24px' }}>
             </div>

          </div>
        </div>

        {/* 3. DYNAMIC MAIN CONTENT */}
        <div className="main-content" style={{ paddingLeft: '80px', paddingBottom: '120px' }}>
           {renderTab()}
         </div>
      </section>

    </div>
  );
};

export default Account;
