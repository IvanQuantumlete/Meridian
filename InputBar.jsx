import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import VoiceRecorder from './VoiceRecorder';
import PDFUploadButton from './PDFUploadButton';
import { SketchSend, SketchPDFBadge } from '@/components/icons/SketchIcons';

// §5.1 Hand-drawn input box border SVG
function HandDrawnBorder({ focused }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 48" preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <path d="M 6 2 Q 3.5 2 3 4.5 L 2.5 43.5 Q 2.5 46 6 46 L 394 46 Q 397.5 46 397.5 43.5 L 397.5 4.5 Q 397.5 2 394 2 Z"
        fill="none" stroke="#F5E6A3" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round"
        opacity={focused ? 0.65 : 0.35}/>
      <path d="M 7 3 Q 4.5 3 4 5 L 3.8 43 Q 3.8 45.5 7 45.5 L 393 45.5 Q 396 45.5 396 43 L 396 5 Q 396 3 393 3 Z"
        fill="none" stroke="#E8C4A0" strokeWidth="0.6"
        strokeLinecap="round" strokeLinejoin="round"
        opacity="0.18"/>
    </svg>
  );
}

export default function InputBar({ onSend, onVoiceRecording, onPDFUpload, loading, pdfLoaded, onRemovePDF, pdfProcessing }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const canSend = text.trim() && !loading;

  return (
    <div style={{ flexShrink: 0, padding: '12px 20px 20px', background: 'linear-gradient(to top, #111111 60%, transparent)' }}>
      {/* Processing pill */}
      {pdfProcessing && (
        <div style={{ maxWidth: '720px', margin: '0 auto 8px', display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300,
            color: '#F5E6A3', background: '#111111', padding: '3px 10px', borderRadius: '20px',
            letterSpacing: '0.08em', opacity: 0.9,
          }}>
            processing
          </div>
        </div>
      )}

      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        {/* PDF badge when loaded */}
        {pdfLoaded && !pdfProcessing && (
          <button onClick={onRemovePDF} title="Remove PDF context"
            style={{ flexShrink: 0, marginBottom: '10px', cursor: 'pointer', background: 'none', padding: '2px', opacity: 0.8 }}>
            <SketchPDFBadge size={16} />
          </button>
        )}

        {/* PDF Upload Button */}
        <PDFUploadButton onPDFSelected={onPDFUpload} disabled={loading} uploading={pdfProcessing} />

        {/* Input pill with hand-drawn border */}
        <div
          style={{
            flex: 1, display: 'flex', alignItems: 'flex-end', position: 'relative',
            background: focused ? '#242424' : '#1F1F1F',
            borderRadius: '8px', padding: '10px 14px', gap: '8px',
            transition: 'background 0.15s ease',
            boxShadow: focused ? '0 0 14px rgba(245,230,163,0.12)' : 'none',
            minHeight: '48px',
          }}
        >
          <HandDrawnBorder focused={focused} />
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="say something honest..."
            rows={1}
            disabled={loading}
            style={{
              flex: 1, background: 'transparent', resize: 'none',
              fontFamily: "'DM Mono', monospace", fontSize: '13px', fontWeight: 300,
              color: '#C8C8C8', caretColor: '#C9A84C',
              lineHeight: 1.6, position: 'relative', zIndex: 1,
              opacity: loading ? 0.5 : 1,
            }}
          />
          <div style={{ flexShrink: 0, paddingBottom: '2px', position: 'relative', zIndex: 1 }}>
            <VoiceRecorder onRecordingComplete={onVoiceRecording} disabled={loading} />
          </div>
        </div>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!canSend}
          style={{
            height: '48px', width: '48px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: canSend ? 'pointer' : 'not-allowed',
            background: canSend ? '#1F1F1F' : '#141414',
            opacity: canSend ? 1 : 0.3,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { if (canSend) e.currentTarget.style.background = '#2A2A2A'; }}
          onMouseLeave={e => { if (canSend) e.currentTarget.style.background = '#1F1F1F'; }}
        >
          <SketchSend size={24} color={canSend ? '#C9A84C' : '#888888'} />
        </button>
      </div>
    </div>
  );
}