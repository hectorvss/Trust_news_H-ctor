import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../supabaseService';

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const formatRelativeTime = (iso) => {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const TYPE_ACCENT = {
  info: '#000000',
  warning: '#d97706',
  success: '#059669',
  editorial: '#000000',
  system: '#6b7280'
};

const NotificationBell = ({ userId, navigate }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const loadNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    const list = await getNotifications(userId, 30);
    setNotifications(list);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // poll every 60s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleClickNotification = async (notif) => {
    if (!notif.is_read) {
      await markNotificationRead(userId, notif);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    if (notif.link) {
      setOpen(false);
      if (notif.link.startsWith('http')) {
        window.open(notif.link, '_blank');
      } else {
        navigate(notif.link);
      }
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(userId, notifications);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  if (!userId) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 8px', position: 'relative', opacity: 0.7 }}
        title="Notificaciones"
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: '#ff3333',
            color: 'white',
            fontSize: '9px',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid white'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '380px',
          maxWidth: '92vw',
          background: 'white',
          border: '1px solid black',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 1100,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid black', background: '#fafafa' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '2px', marginBottom: '2px' }}>BUZÓN</div>
              <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px' }}>Notificaciones</div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: '1px solid black', padding: '6px 10px', fontSize: '9px', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}
              >
                MARCAR TODAS
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>CARGANDO...</div>
            )}
            {!loading && notifications.length === 0 && (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', opacity: 0.1, marginBottom: '12px' }}>∅</div>
                <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', opacity: 0.4, letterSpacing: '1px' }}>SIN NOTIFICACIONES</div>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>Tu actividad editorial aparecerá aquí.</p>
              </div>
            )}
            {!loading && notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleClickNotification(notif)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #eee',
                  cursor: notif.link ? 'pointer' : 'default',
                  background: notif.is_read ? 'white' : '#fffbe7',
                  borderLeft: `3px solid ${TYPE_ACCENT[notif.type] || '#000'}`,
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => { if (notif.link) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = notif.is_read ? 'white' : '#fffbe7'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.3, flex: 1 }}>
                    {!notif.is_read && <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ff3333', marginRight: '8px', verticalAlign: 'middle' }} />}
                    {notif.title}
                  </div>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.4, fontWeight: 800, whiteSpace: 'nowrap' }}>{formatRelativeTime(notif.created_at)}</span>
                </div>
                {notif.message && (
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', lineHeight: 1.5, opacity: 0.7 }}>{notif.message}</p>
                )}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 900, padding: '2px 6px', background: TYPE_ACCENT[notif.type] || '#000', color: 'white', letterSpacing: '0.5px' }}>{(notif.type || 'info').toUpperCase()}</span>
                  {notif.is_broadcast && (
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, opacity: 0.5, letterSpacing: '0.5px' }}>· BROADCAST</span>
                  )}
                  {notif.link && (
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, marginLeft: 'auto', opacity: 0.5 }}>VER ↗</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
