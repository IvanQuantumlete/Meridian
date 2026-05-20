import React from 'react';
import { motion } from 'framer-motion';
import MeridianLogo from '@/components/icons/MeridianLogo';
import { SketchUnderline } from '@/components/icons/SketchIcons';
import { MarkerLine1, MarkerLine2, MarkerScribble } from '@/components/icons/SketchMarkers';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', background: '#111111' }}
    >
      <MeridianLogo size={40} />

      <div style={{ marginTop: '20px', position: 'relative', display: 'inline-block' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '22px', color: '#C9A84C', letterSpacing: '0.04em', margin: 0 }}>
          Meridian
        </h2>
        <div style={{ marginTop: '4px' }}>
          <SketchUnderline width={90} color="#C9A84C" />
        </div>
      </div>

      <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: '13px', color: '#888888', maxWidth: '300px', lineHeight: 1.7, marginTop: '16px' }}>
        I won't tell you what you want to hear.
        <br />I'll tell you what you need to hear.
      </p>

      {/* Rough marker separators */}
      <div style={{ margin: '20px 0 8px', width: '260px' }}>
        <MarkerLine1 opacity={0.4} />
        <div style={{ marginTop: '4px' }}>
          <MarkerLine2 opacity={0.18} />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', maxWidth: '400px' }}>
        {[
          "Why do I keep making the same mistakes?",
          "Am I being honest with myself?",
          "What am I avoiding right now?",
        ].map((q, i) => (
          <span key={i} style={{
            fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 300,
            padding: '6px 12px', borderRadius: '4px',
            background: '#181818', color: '#888888',
          }}>
            {q}
          </span>
        ))}
      </div>
    </motion.div>
  );
}