'use client';

import { useRef, useState, useCallback } from 'react';

export interface UploadedImage {
  url: string;
  type: string;
  name: string;
  preview: string; // data URL for preview
}

interface Props {
  images: UploadedImage[];
  onAdd: (img: UploadedImage) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function ImageUpload({ images, onAdd, onRemove, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (uploading) return;

    // プレビュー用のdata URLを生成
    const preview = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'アップロードに失敗しました');
        return;
      }

      const data = await res.json();
      onAdd({
        url: data.url,
        type: data.type,
        name: data.name,
        preview,
      });
    } catch {
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  }, [uploading, onAdd]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  // ドラッグ&ドロップ
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {/* Upload button */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={disabled || uploading || images.length >= 5}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          width: 34, height: 34, borderRadius: '50%',
          border: '1px solid var(--border)',
          background: uploading ? 'var(--primary-bg)' : 'var(--surface)',
          color: 'var(--text-tertiary)',
          cursor: disabled ? 'default' : 'pointer',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: 'var(--shadow-sm)',
        }}
        title="画像を添付"
      >
        {uploading ? (
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="40" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </button>

      {/* Preview strip */}
      {images.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0,
          padding: '8px 16px',
          display: 'flex', gap: 8, overflowX: 'auto',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
        }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={img.preview}
                alt={img.name}
                style={{
                  width: 56, height: 56, borderRadius: 8,
                  objectFit: 'cover',
                  border: '1px solid var(--border)',
                }}
              />
              <button
                onClick={() => onRemove(i)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--danger)', border: 'none',
                  color: '#fff', fontSize: 11, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
