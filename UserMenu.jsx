import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/apiClient';
import { AnimatePresence, motion } from 'framer-motion';

function UserIcon({ size = 18, color = '#888888' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M 12 3.5 C 9 3.5 7 6 7 8.5 C 7 11 9 13.5 12 13.5 C 15 13.5 17 11 17 8.5 C 17 6 15 3.5 12 3.5 Z"
        stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M 4 20.5 C 4.5 16 8 14 12 14 C 16 14 19.5 16 20 20.5"
        stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      {/* rough sketch accent */}
      <path d="M 9 8 C 9.5 7.5 11 7 13 8" stroke={color} strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => api.auth.logout('/');

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Account"
        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: open ? '#1F1F1F' : 'none', borderRadius: '50%', opacity: open ? 1 : 0.7, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = '#1F1F1F'; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'none'; } }}
      >
        <UserIcon size={18} color={open ? '#C9A84C' : '#888888'} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '40px', right: 0, zIndex: 100,
              background: '#181818', borderRadius: '8px', padding: '12px 16px',
              minWidth: '200px', boxShadow: '0 12px 40px rgba(0,0,0,0.9)',
            }}
          >
            {/* Rough marker accent top */}
            <svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="none" fill="none" style={{ marginBottom: '10px' }}>
              <path d="M 4 3 C 50 2 100 4 196 3" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
              <path d="M 4 4.5 C 60 3 120 5 196 4" stroke="#C9A84C" strokeWidth="0.6" strokeLinecap="round" opacity="0.15"/>
            </svg>

            {user && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '16px', color: '#C9A84C', letterSpacing: '0.02em', margin: '0 0 2px' }}>
                  {user.full_name || 'anonymous'}
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', fontWeight: 300, color: '#444444', letterSpacing: '0.06em', margin: 0 }}>
                  {user.email}
                </p>
              </div>
            )}

            <div style={{ height: '1px', background: '#222222', margin: '8px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', fontWeight: 300, color: '#2A2A2A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', margin: '0 0 6px' }}>
                your data
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#444444', letterSpacing: '0.04em', margin: '0 0 2px' }}>
                · chat history & sessions
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#444444', letterSpacing: '0.04em', margin: '0 0 2px' }}>
                · journal entries
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#444444', letterSpacing: '0.04em', margin: '0 0 10px' }}>
                · all saved to your account
              </p>
            </div>

            <button
              onClick={handleSignOut}
              style={{ width: '100%', fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#888888', background: '#111111', padding: '7px 12px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.08em', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1A1A1A'; e.currentTarget.style.color = '#F0A96B'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#111111'; e.currentTarget.style.color = '#888888'; }}
            >
              sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}