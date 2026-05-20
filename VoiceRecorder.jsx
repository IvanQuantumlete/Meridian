import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SketchMic, SketchX, SketchStop } from '@/components/icons/SketchIcons';

export default function VoiceRecorder({ onRecordingComplete, disabled }) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mediaRecorder.onstop = async () => {
      if (chunksRef.current.length === 0) return;
      setProcessing(true);
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      stream.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      onRecordingComplete(blob);
      setProcessing(false);
    };
    mediaRecorder.start(250);
    setRecording(true);
    setDuration(0);
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording) {
      chunksRef.current = [];
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    }
  };

  const formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (processing) {
    return (
      <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0A96B' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {recording ? (
        <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={cancelRecording} style={{ cursor: 'pointer', background: 'none', padding: '2px', opacity: 0.6 }}>
            <SketchX size={14} color="#888888" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <motion.div
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F0A96B' }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
            <span style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", fontWeight: 300, color: '#888888', letterSpacing: '0.08em' }}>
              {formatDuration(duration)}
            </span>
          </div>
          <button onClick={stopRecording}
            style={{ width: '22px', height: '22px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0A96B', cursor: 'pointer' }}>
            <SketchStop size={10} color="#0A0A0A" />
          </button>
        </motion.div>
      ) : (
        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button
            onClick={startRecording}
            disabled={disabled}
            style={{
              width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer', background: 'none', padding: '2px',
              opacity: disabled ? 0.3 : 0.7, transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = '1'; e.currentTarget.querySelector('svg').querySelector('path,circle') && null; } }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '0.7'; }}
          >
            <SketchMic size={24} color="#888888" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}