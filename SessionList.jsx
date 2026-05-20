import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import MeridianLogo from '@/components/icons/MeridianLogo';
import {
  SketchPlus, SketchPencil, SketchTrash, SketchMore, SketchCheck, SketchX, SketchMessageSquare, SketchUnderline
} from '@/components/icons/SketchIcons';
import { MarkerLine1, MarkerDouble } from '@/components/icons/SketchMarkers';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SessionList({ sessions, activeSessionId, onSelect, onCreate, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (session) => { setEditingId(session.id); setEditTitle(session.title); };
  const confirmRename = (id) => { if (editTitle.trim()) onRename(id, editTitle.trim()); setEditingId(null); };
  const cancelRename = () => { setEditingId(null); setEditTitle(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#111111' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MeridianLogo size={24} />
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '22px', color: '#C9A84C', letterSpacing: '0.04em' }}>
              Meridian
            </span>
          </div>
        </div>
        <button
          onClick={onCreate}
          title="New session"
          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer', background: '#1F1F1F', opacity: 0.7, transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
        >
          <SketchPlus size={16} color="#888888" />
        </button>
      </div>

      {/* Rough marker divider */}
      <div style={{ margin: '0 16px 10px' }}>
        <MarkerLine1 opacity={0.28} />
      </div>

      <p style={{ padding: '0 16px 8px', fontSize: '11px', fontFamily: "'DM Mono', monospace", fontWeight: 500, color: '#444444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Sessions
      </p>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
        <AnimatePresence>
          {sessions.map((session) => {
            const isActive = activeSessionId === session.id;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ marginBottom: '2px' }}
              >
                {editingId === session.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '6px', background: '#1F1F1F' }}>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(session.id); if (e.key === 'Escape') cancelRename(); }}
                      autoFocus
                      style={{ flex: 1, background: 'transparent', fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#C8C8C8', padding: 0 }}
                    />
                    <button onClick={() => confirmRename(session.id)} style={{ cursor: 'pointer', background: 'none', padding: '2px', opacity: 0.8 }}>
                      <SketchCheck size={13} color="#C9A84C" />
                    </button>
                    <button onClick={cancelRename} style={{ cursor: 'pointer', background: 'none', padding: '2px', opacity: 0.6 }}>
                      <SketchX size={12} color="#888888" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => onSelect(session.id)}
                    className="group"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                      background: isActive ? '#1F1F1F' : 'transparent',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#181818'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <SketchMessageSquare size={14} color={isActive ? '#F5E6A3' : '#444444'} active={isActive} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: isActive ? "'Cormorant Garamond', serif" : "'DM Mono', monospace",
                        fontStyle: isActive ? 'italic' : 'normal',
                        fontSize: isActive ? '14px' : '12px',
                        fontWeight: 300,
                        color: isActive ? '#888888' : '#888888',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
                        letterSpacing: isActive ? '0.02em' : '0.04em',
                      }}>
                        {session.title}
                      </p>
                      {session.last_message_preview && (
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', fontWeight: 300, color: '#2A2A2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {session.last_message_preview}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          style={{ opacity: 0, transition: 'opacity 0.15s', cursor: 'pointer', background: 'none', padding: '2px' }}
                          className="group-hover:!opacity-100"
                          onClick={(e) => e.stopPropagation()}
                          onFocus={e => e.currentTarget.style.opacity = '1'}
                          onBlur={e => e.currentTarget.style.opacity = '0'}
                        >
                          <SketchMore size={14} color="#888888" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end"
                        style={{ background: '#181818', borderRadius: '6px', padding: '4px', minWidth: '120px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
                        <DropdownMenuItem onClick={() => startRename(session)}
                          style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#888888', cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <SketchPencil size={12} color="#888888" />Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(session.id)}
                          style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#888888', cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <SketchTrash size={12} color="#888888" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sessions.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#2A2A2A' }}>No sessions yet</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ padding: '8px 16px 16px' }}>
        <div style={{ marginBottom: '10px' }}>
          <MarkerDouble />
        </div>
        <a href="/journal"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', textDecoration: 'none', transition: 'background 0.12s', opacity: 0.7 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#181818'; e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.7'; }}
        >
          {/* mini book icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 4.5 C4 3.5 5 3 6 3 L18 3 C19 3 20 3.5 20 4.5 L20 20 C20 21 19 21.5 18 21.5 L6 21.5 C5 21.5 4 21 4 20 Z" stroke="#888888" strokeWidth="1.2" fill="none" opacity="0.7"/>
            <path d="M8 8 L16 8" stroke="#888888" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
            <path d="M8 12 L14 12" stroke="#888888" strokeWidth="1" strokeLinecap="round" opacity="0.35"/>
            <path d="M8 16 L12 16" stroke="#888888" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
          </svg>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#888888', letterSpacing: '0.08em' }}>journal</span>
        </a>
      </div>
    </div>
  );
}