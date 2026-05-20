import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignSelf: 'flex-start', marginBottom: '2px' }}>
      <div style={{
        background: '#141414',
        borderRadius: '12px 12px 12px 0px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#444444' }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>
      {/* WhatsApp tail */}
      <div style={{
        width: 0, height: 0,
        alignSelf: 'flex-end',
        borderStyle: 'solid',
        borderWidth: '8px 8px 0 0',
        borderColor: 'transparent #141414 transparent transparent',
        marginLeft: '-8px',
      }} />
    </div>
  );
}