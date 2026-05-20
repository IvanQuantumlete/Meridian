import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SketchMic, SketchPlay, SketchPause } from '@/components/icons/SketchIcons';

export default function MessageBubble({ message, isLastInGroup = true }) {
  const isUser = message.role === 'user';
  const isVoice = message.input_type === 'voice';
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const now = message.created_date ? new Date(message.created_date) : new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

  // §4 Chat Bubbles — WhatsApp tail, no avatars
  const userBubbleStyle = {
    position: 'relative',
    background: '#1E1E1E',
    borderRadius: isLastInGroup ? '16px 16px 2px 16px' : '16px',
    alignSelf: 'flex-end',
    maxWidth: '74%',
    width: 'fit-content',
    padding: '13px 18px',
    fontFamily: "'DM Mono', monospace",
    fontSize: '14px',
    fontWeight: 300,
    color: '#D0D0D0',
    lineHeight: 1.7,
    wordBreak: 'normal',
    overflowWrap: 'anywhere',
    whiteSpace: 'normal',
  };

  const agentBubbleStyle = {
    position: 'relative',
    background: '#141414',
    borderRadius: isLastInGroup ? '16px 16px 16px 2px' : '16px',
    alignSelf: 'flex-start',
    maxWidth: '82%',
    padding: '14px 20px',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '17px',
    fontWeight: 300,
    color: '#C8C8C8',
    letterSpacing: '0.015em',
    lineHeight: 1.75,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: isLastInGroup ? '8px' : '2px' }}>
      {isVoice && isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#444444', marginBottom: '5px', fontFamily: "'DM Mono', monospace", fontWeight: 300, letterSpacing: '0.08em' }}>
          <SketchMic size={15} color="#555555" />
          <span>voice message</span>
        </div>
      )}

      {message.content && (
        <div style={{ position: 'relative' }}>
          <div style={isUser ? userBubbleStyle : agentBubbleStyle}>
            {isUser ? (
              <div style={{ position: 'relative', zIndex: 1 }}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ fontWeight: 500, color: '#F5E6A3' }}>{children}</strong>,
                    em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#D0D0D0', opacity: 0.85 }}>{children}</em>,
                    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', textDecoration: 'underline' }}>{children}</a>,
                    ul: ({ children }) => <ul style={{ margin: '5px 0', paddingLeft: '18px' }}>{children}</ul>,
                    li: ({ children }) => <li style={{ margin: '3px 0', lineHeight: 1.7 }}>{children}</li>,
                    blockquote: ({ children }) => <blockquote style={{ borderLeft: '2px solid #888888', paddingLeft: '12px', margin: '6px 0', opacity: 0.7, fontStyle: 'italic' }}>{children}</blockquote>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div style={{ position: 'relative', zIndex: 1 }}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={{ margin: '0 0 8px 0', lineHeight: 1.75 }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ fontWeight: 500, color: '#C9A84C' }}>{children}</strong>,
                    em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#D0D0D0', opacity: 0.85 }}>{children}</em>,
                    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', textDecoration: 'underline' }}>{children}</a>,
                    ul: ({ children }) => <ul style={{ margin: '6px 0', paddingLeft: '18px' }}>{children}</ul>,
                    li: ({ children }) => <li style={{ margin: '4px 0', lineHeight: 1.7 }}>{children}</li>,
                    h1: ({ children }) => <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, color: '#C9A84C', margin: '0 0 10px', letterSpacing: '0.02em' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '19px', fontWeight: 300, color: '#D0D0D0', margin: '0 0 8px', letterSpacing: '0.02em' }}>{children}</h2>,
                    blockquote: ({ children }) => <blockquote style={{ borderLeft: '2px solid #C9A84C', paddingLeft: '12px', margin: '8px 0', opacity: 0.75, fontStyle: 'italic' }}>{children}</blockquote>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* WhatsApp-style tail — only on last bubble in group */}
          {isLastInGroup && isUser && (
            <div style={{
              position: 'absolute', bottom: 0, right: '-8px',
              width: 0, height: 0,
              borderStyle: 'solid',
              borderWidth: '8px 0 0 8px',
              borderColor: 'transparent transparent transparent #1E1E1E',
            }} />
          )}
          {isLastInGroup && !isUser && (
            <div style={{
              position: 'absolute', bottom: 0, left: '-8px',
              width: 0, height: 0,
              borderStyle: 'solid',
              borderWidth: '8px 8px 0 0',
              borderColor: 'transparent #141414 transparent transparent',
            }} />
          )}
        </div>
      )}

      {/* Audio replay */}
      {isVoice && message.audio_url && (
        <button
          onClick={toggleAudio}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#444444', marginTop: '4px', cursor: 'pointer', background: 'none', padding: 0, fontFamily: "'DM Mono', monospace", fontWeight: 300, letterSpacing: '0.08em', opacity: 0.7 }}
        >
          {playing ? <SketchPause size={16} color="#888888" /> : <SketchPlay size={16} color="#888888" />}
          <span>{playing ? 'pause' : 'replay'}</span>
          <audio ref={audioRef} src={message.audio_url} onEnded={() => setPlaying(false)} />
        </button>
      )}


    </div>
  );
}