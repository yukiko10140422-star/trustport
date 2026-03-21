'use client';

import { useRef, useCallback } from 'react';
import { DEPT_COLORS } from '@/lib/constants';
import { getAllDepartments } from '@/lib/departments';
import type { Department } from '@/types';
import ImageUpload, { type UploadedImage } from './ImageUpload';
import type { SpeechStatus } from '@/hooks/useSpeechRecognition';

const departments: Department[] = getAllDepartments();

interface Props {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  loading: boolean;
  // 部署
  selectedDept: string;
  showDeptPicker: boolean;
  onToggleDeptPicker: () => void;
  onSelectDept: (id: string) => void;
  // 画像
  images: UploadedImage[];
  onAddImage: (img: UploadedImage) => void;
  onRemoveImage: (index: number) => void;
  // 音声
  speechSupported: boolean;
  speechStatus: SpeechStatus;
  onSpeechToggle: () => void;
}

export default function ChatInputBar({
  input, onInputChange, onSend, onStop, loading,
  selectedDept, showDeptPicker, onToggleDeptPicker, onSelectDept,
  images, onAddImage, onRemoveImage,
  speechSupported, speechStatus, onSpeechToggle,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [onInputChange]);

  return (
    <>
      {/* Department Picker */}
      {showDeptPicker && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 20px',
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          maxHeight: 140, overflowY: 'auto', animation: 'slideUp 0.2s ease',
        }}>
          <button
            onClick={() => onSelectDept('')}
            style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12,
              border: !selectedDept ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: !selectedDept ? 'var(--primary-bg)' : 'var(--surface)',
              color: !selectedDept ? 'var(--primary)' : 'var(--text)', cursor: 'pointer',
              fontWeight: !selectedDept ? 600 : 400,
            }}
          >
            自動
          </button>
          {departments.map(d => (
            <button
              key={d.id}
              onClick={() => onSelectDept(d.id)}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12,
                border: selectedDept === d.id ? `2px solid ${DEPT_COLORS[d.id]}` : '1px solid var(--border)',
                background: selectedDept === d.id ? DEPT_COLORS[d.id] : 'var(--surface)',
                color: selectedDept === d.id ? '#fff' : 'var(--text)', cursor: 'pointer',
                fontWeight: selectedDept === d.id ? 600 : 400, transition: 'all 0.2s',
              }}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <footer style={{
        display: 'flex', alignItems: 'flex-end', gap: 6,
        padding: '8px 12px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)', position: 'relative',
      }}>
        <ImageUpload
          images={images}
          onAdd={onAddImage}
          onRemove={onRemoveImage}
          disabled={loading}
        />

        {speechSupported && (
          <button
            onClick={onSpeechToggle}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: speechStatus === 'listening' ? '2px solid #ef4444' : '1px solid var(--border)',
              background: speechStatus === 'listening' ? 'rgba(239,68,68,0.1)' : 'var(--surface)',
              color: speechStatus === 'listening' ? '#ef4444' : 'var(--text-tertiary)',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              animation: speechStatus === 'listening' ? 'pulse 1.5s infinite' : 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
            title={speechStatus === 'listening' ? '録音停止' : '音声入力'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        <button
          onClick={onToggleDeptPicker}
          style={{
            width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)',
            background: selectedDept ? DEPT_COLORS[selectedDept] : 'var(--surface)',
            color: selectedDept ? '#fff' : 'var(--text-tertiary)',
            cursor: 'pointer', fontSize: 12, flexShrink: 0, transition: 'all 0.2s',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="部署を選択"
        >
          {selectedDept ? departments.find(d => d.id === selectedDept)?.name.charAt(0) : '部'}
        </button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={handleChange}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="ひなたに聞いてみよう..."
          rows={1}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 22,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 15, resize: 'none',
            maxHeight: 120, lineHeight: 1.4, outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        />

        {loading ? (
          <button
            onClick={onStop}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#ef4444', border: 'none', color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
            }}
            title="停止"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!input.trim()}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: input.trim()
                ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                : 'var(--border)',
              border: 'none', color: '#fff',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
              boxShadow: input.trim() ? 'var(--shadow-md)' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </footer>
    </>
  );
}
