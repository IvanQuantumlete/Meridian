import React, { useRef } from 'react';
import { SketchPDF } from '@/components/icons/SketchIcons';

export default function PDFUploadButton({ onPDFSelected, disabled, uploading }) {
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onPDFSelected(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={disabled}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={disabled}
        title="Upload PDF"
        style={{
          flexShrink: 0, marginBottom: '10px', cursor: disabled ? 'not-allowed' : 'pointer',
          background: 'none', padding: '2px',
          opacity: disabled ? 0.3 : 0.7,
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '0.7'; }}
      >
        <SketchPDF size={26} color={uploading ? '#C9A84C' : '#888888'} uploading={uploading} />
      </button>
    </>
  );
}