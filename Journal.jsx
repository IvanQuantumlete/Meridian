import React, { useState, useCallback } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import MeridianLogo from '@/components/icons/MeridianLogo';
import { SketchPanelClose, SketchPanelOpen, SketchPlus, SketchTrash, SketchPencil, SketchX, SketchCheck } from '@/components/icons/SketchIcons';
import { MarkerLine1, MarkerLine2, MarkerUnderline, MarkerDouble } from '@/components/icons/SketchMarkers';
import SessionList from '@/components/sidebar/SessionList';

const MOODS = ['reflective', 'anxious', 'clear', 'uncertain', 'determined', 'lost'];
const MOOD_COLORS = {
  reflective: '#C9A84C', anxious: '#F0A96B', clear: '#888888',
  uncertain: '#C5A8D4', determined: '#D0D0D0', lost: '#444444',
};

function JournalSidebar({ entries, activeId, onSelect, onCreate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#111111' }}>
      <div style={{ padding: '20px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MeridianLogo size={22} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '20px', color: '#C9A84C', letterSpacing: '0.04em' }}>
            Journal
          </span>
        </div>
        <button onClick={onCreate} title="New entry"
          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer', background: '#1F1F1F', opacity: 0.7, transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
        >
          <SketchPlus size={16} color="#888888" />
        </button>
      </div>

      <div style={{ margin: '0 16px 10px' }}>
        <MarkerLine1 opacity={0.3} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
        <AnimatePresence>
          {entries.map(entry => {
            const isActive = entry.id === activeId;
            const moodColor = MOOD_COLORS[entry.mood] || '#444444';
            return (
              <motion.div key={entry.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                style={{ marginBottom: '2px' }}
              >
                <div onClick={() => onSelect(entry.id)}
                  style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', background: isActive ? '#1F1F1F' : 'transparent', transition: 'background 0.12s' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#181818'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <p style={{ fontFamily: isActive ? "'Cormorant Garamond', serif" : "'DM Mono', monospace", fontStyle: isActive ? 'italic' : 'normal', fontSize: isActive ? '14px' : '12px', fontWeight: 300, color: isActive ? moodColor : '#888888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, letterSpacing: '0.02em' }}>
                    {entry.title}
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#2A2A2A', marginTop: '2px' }}>
                    {entry.mood || 'no mood'} · {entry.created_date ? new Date(entry.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#2A2A2A' }}>no entries yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryEditor({ entry, onSave, onDelete, onCancel }) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || '');
  const [delConfirm, setDelConfirm] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), content, mood });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px', overflowY: 'auto', maxWidth: '720px', width: '100%', margin: '0 auto' }}>
      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="entry title..."
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '28px', color: '#C9A84C', background: 'transparent', width: '100%', marginBottom: '4px', letterSpacing: '0.02em' }}
      />
      <MarkerUnderline width={Math.min(title.length * 14 + 30, 320)} color="#C9A84C" opacity={0.4} />

      {/* Mood picker */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px', marginBottom: '4px' }}>
        {MOODS.map(m => (
          <button key={m} onClick={() => setMood(m === mood ? '' : m)}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', fontWeight: 300, letterSpacing: '0.08em', color: mood === m ? MOOD_COLORS[m] : '#444444', background: mood === m ? '#1F1F1F' : 'transparent', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', transition: 'all 0.12s' }}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ margin: '16px 0 8px' }}>
        <MarkerLine2 opacity={0.2} />
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="write here..."
        style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: '13px', color: '#C8C8C8', background: 'transparent', flex: 1, resize: 'none', lineHeight: 2, minHeight: '300px', caretColor: '#C9A84C' }}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: 'none' }}>
        <MarkerDouble style={{ position: 'absolute' }} />
        <button onClick={handleSave}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#C9A84C', background: '#1F1F1F', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.08em', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#242424'}
          onMouseLeave={e => e.currentTarget.style.background = '#1F1F1F'}>
          save
        </button>
        {entry?.id && !delConfirm && (
          <button onClick={() => setDelConfirm(true)}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#444444', background: 'transparent', padding: '8px 16px', cursor: 'pointer', letterSpacing: '0.08em' }}>
            delete
          </button>
        )}
        {delConfirm && (
          <>
            <button onClick={() => onDelete(entry.id)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#F0A96B', background: 'transparent', padding: '8px 16px', cursor: 'pointer', letterSpacing: '0.08em' }}>
              confirm delete
            </button>
            <button onClick={() => setDelConfirm(false)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#444444', background: 'transparent', padding: '8px 16px', cursor: 'pointer' }}>
              cancel
            </button>
          </>
        )}
        <button onClick={onCancel}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 300, color: '#444444', background: 'transparent', padding: '8px 16px', cursor: 'pointer', letterSpacing: '0.08em', marginLeft: 'auto' }}>
          close
        </button>
      </div>
    </div>
  );
}

export default function Journal() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ['journal'],
    queryFn: () => api.entities.JournalEntry.list('-updated_date'),
  });

  const activeEntry = entries.find(e => e.id === activeId) || null;

  const handleCreate = () => {
    setActiveId(null);
    setIsNew(true);
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setIsNew(false);
  };

  const handleSave = async (data) => {
    if (isNew) {
      await api.entities.JournalEntry.create(data);
    } else if (activeId) {
      await api.entities.JournalEntry.update(activeId, data);
    }
    queryClient.invalidateQueries({ queryKey: ['journal'] });
    setIsNew(false);
  };

  const handleDelete = async (id) => {
    await api.entities.JournalEntry.delete(id);
    queryClient.invalidateQueries({ queryKey: ['journal'] });
    setActiveId(null);
    setIsNew(false);
  };

  const showEditor = isNew || (activeId && activeEntry);

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#0A0A0A' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '260px' : '0',
        minWidth: sidebarOpen ? '260px' : '0',
        transition: 'width 0.25s ease, min-width 0.25s ease, opacity 0.2s ease',
        opacity: sidebarOpen ? 1 : 0,
        pointerEvents: sidebarOpen ? 'auto' : 'none',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#111111',
      }}>
        {sidebarOpen && (
          <JournalSidebar entries={entries} activeId={activeId} onSelect={handleSelect} onCreate={handleCreate} />
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#111111' }}>
        {/* Header */}
        <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', borderRadius: '4px', opacity: 0.7, transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
            {sidebarOpen ? <SketchPanelClose size={18} color="#888888" /> : <SketchPanelOpen size={18} color="#888888" />}
          </button>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '16px', color: '#444444', letterSpacing: '0.1em' }}>
            journal
          </span>
          <div style={{ flex: 1 }} />
          <a href="/" style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#444444', letterSpacing: '0.08em', textDecoration: 'none', opacity: 0.7 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
            ← chat
          </a>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {showEditor ? (
            <motion.div key={isNew ? 'new' : activeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ flex: 1, display: 'flex', overflowY: 'auto' }}>
              <EntryEditor
                entry={isNew ? null : activeEntry}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={() => { setIsNew(false); setActiveId(null); }}
              />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <MeridianLogo size={32} />
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#2A2A2A', letterSpacing: '0.08em' }}>
                select an entry or create one
              </p>
              <button onClick={handleCreate}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#C9A84C', background: '#1F1F1F', padding: '7px 18px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.08em' }}>
                new entry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}