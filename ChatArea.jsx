import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SketchPanelClose, SketchPanelOpen } from '@/components/icons/SketchIcons';
import SessionList from '@/components/sidebar/SessionList';
import ChatArea from '@/components/chat/ChatArea';
import InputBar from '@/components/chat/InputBar';
import MeridianLogo from '@/components/icons/MeridianLogo';
import UserMenu from '@/components/chat/UserMenu';
import { buildMeridianPrompt } from '@/lib/meridianPrompt';

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [responding, setResponding] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const [pdfContext, setPdfContext] = useState(null); // { text, filename }
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.Session.list('-updated_date'),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', activeSessionId],
    queryFn: () => api.entities.Message.filter({ session_id: activeSessionId }, 'created_date', 200),
    enabled: !!activeSessionId,
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['allMessages'],
    queryFn: () => api.entities.Message.filter({ role: 'user' }, '-created_date', 100),
  });

  useEffect(() => { setLocalMessages(messages); }, [messages]);

  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const createSession = async () => {
    const session = await api.entities.Session.create({
      title: `Session ${sessions.length + 1}`,
      message_count: 0,
    });
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    setActiveSessionId(session.id);
  };

  const renameSession = async (id, title) => {
    await api.entities.Session.update(id, { title });
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
  };

  const deleteSession = async (id) => {
    const sessionMessages = await api.entities.Message.filter({ session_id: id });
    for (const msg of sessionMessages) {
      await api.entities.Message.delete(msg.id);
    }
    await api.entities.Session.delete(id);
    if (activeSessionId === id) setActiveSessionId(null);
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  };

  // §6 PDF Upload & Analysis Integration
  const handlePDFUpload = useCallback(async (file) => {
    setPdfProcessing(true);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    const result = await api.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
    });
    const text = result?.output?.text || (typeof result?.output === 'string' ? result.output : '');
    if (text) {
      setPdfContext({ text, filename: file.name });
    }
    setPdfProcessing(false);
  }, []);

  const sendMessage = useCallback(async (content, inputType = 'text', audioUrl = null) => {
    if (!activeSessionId || responding) return;
    setResponding(true);

    const userMsg = await api.entities.Message.create({
      session_id: activeSessionId,
      role: 'user',
      content,
      input_type: inputType,
      audio_url: audioUrl || '',
    });

    const updatedMessages = [...localMessages, userMsg];
    setLocalMessages(updatedMessages);

    const searchTriggers = ['search', 'look up', 'find', 'read', 'article', 'news', 'what is', "what's", 'who is', 'tell me about'];
    const needsSearch = searchTriggers.some(t => content.toLowerCase().includes(t));

    // §6.1 PDF context absorbed silently — appended to prompt
    const pdfExtra = pdfContext
      ? `\n\nDOCUMENT CONTEXT (silently absorbed — reference naturally, never announce it):\n${pdfContext.text.substring(0, 3000)}`
      : '';

    const prompt = buildMeridianPrompt(updatedMessages, allMessages) + pdfExtra;

    const response = await api.integrations.Core.InvokeLLM({
      prompt: `${prompt}\n\nUser: ${content}`,
      add_context_from_internet: needsSearch,
    });

    const assistantMsg = await api.entities.Message.create({
      session_id: activeSessionId,
      role: 'assistant',
      content: response,
      input_type: 'text',
    });

    setLocalMessages(prev => [...prev, assistantMsg]);

    await api.entities.Session.update(activeSessionId, {
      last_message_preview: content.substring(0, 80),
      message_count: updatedMessages.length + 1,
    });

    if (updatedMessages.length <= 1) {
      const title = content.length > 40 ? content.substring(0, 40) + '...' : content;
      await api.entities.Session.update(activeSessionId, { title });
    }

    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    setResponding(false);
  }, [activeSessionId, responding, localMessages, allMessages, queryClient, pdfContext]);

  const handleVoiceRecording = useCallback(async (blob) => {
    if (!activeSessionId) return;
    setResponding(true);
    const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    const transcript = await api.integrations.Core.TranscribeAudio({ audio_url: file_url });
    setResponding(false);
    if (transcript && transcript.trim()) {
      sendMessage(transcript.trim(), 'voice', file_url);
    }
  }, [activeSessionId, sendMessage]);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

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
        position: typeof window !== 'undefined' && window.innerWidth < 768 ? 'fixed' : 'relative',
        top: 0, bottom: 0, left: 0, zIndex: 50,
      }}>
        {sidebarOpen && (
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelect={(id) => { setActiveSessionId(id); closeSidebarOnMobile(); }}
            onCreate={createSession}
            onRename={renameSession}
            onDelete={deleteSession}
          />
        )}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)', display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'none' : 'block' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area — flex:1 fills remainder */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#111111', transition: 'all 0.25s ease' }}>
        {/* Header */}
        <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', flexShrink: 0, background: '#111111' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', borderRadius: '4px', opacity: 0.7, transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
          >
            {sidebarOpen
              ? <SketchPanelClose size={18} color="#888888" />
              : <SketchPanelOpen size={18} color="#888888" />
            }
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MeridianLogo size={18} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '18px', color: '#D0D0D0', letterSpacing: '0.04em' }}>
              Meridian
            </span>
            <svg viewBox="0 0 10 10" width="7" height="7" style={{ marginLeft: '2px' }}>
              <circle cx="5" cy="5" r="3.8" fill="none" stroke="#F0A96B" strokeWidth="1.3" strokeDasharray="1.2,0.6" opacity="0.9"/>
              <circle cx="5" cy="5" r="1.6" fill="#F5E6A3" stroke="none" opacity="0.75"/>
            </svg>
          </div>
          <div style={{ flex: 1 }} />
          {/* Journal nav link */}
          <a href="/journal"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300, color: '#444444', letterSpacing: '0.08em', textDecoration: 'none', opacity: 0.7, marginRight: '4px', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
            journal
          </a>
          <UserMenu />
        </div>

        {activeSessionId ? (
          <>
            <ChatArea messages={localMessages} loading={responding} />
            <InputBar
              onSend={(text) => sendMessage(text, 'text')}
              onVoiceRecording={handleVoiceRecording}
              onPDFUpload={handlePDFUpload}
              loading={responding}
              pdfLoaded={!!pdfContext}
              pdfProcessing={pdfProcessing}
              onRemovePDF={() => setPdfContext(null)}
            />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#111111' }}>
            <MeridianLogo size={48} />
            <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: '13px', color: '#444444' }}>
              start a new session to begin
            </p>
            <button
              onClick={createSession}
              style={{
                fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: '13px',
                color: '#C9A84C', background: '#1F1F1F', padding: '8px 20px',
                borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.08em',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#242424'}
              onMouseLeave={e => e.currentTarget.style.background = '#1F1F1F'}
            >
              new session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}