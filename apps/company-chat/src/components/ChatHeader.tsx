'use client';

import type { ModelKey } from '@/lib/constants';
import { MODELS } from '@/lib/constants';

interface Props {
  model: ModelKey;
  showModelPicker: boolean;
  onToggleModelPicker: () => void;
  onSelectModel: (key: ModelKey) => void;
  onOpenDrawer: () => void;
}

export default function ChatHeader({
  model, showModelPicker, onToggleModelPicker, onSelectModel, onOpenDrawer,
}: Props) {
  return (
    <>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onOpenDrawer}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700, border: 'none', color: '#fff',
              cursor: 'pointer',
            }}
            title="会話履歴"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.02em' }}>Company 秘書室</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>藤崎 ひなた</div>
          </div>
        </div>
        <button
          onClick={onToggleModelPicker}
          style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
            color: '#fff', cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}
        >
          {MODELS[model].label}
        </button>
      </header>

      {showModelPicker && (
        <div style={{
          display: 'flex', gap: 6, padding: '10px 20px',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {(Object.entries(MODELS) as [ModelKey, typeof MODELS[ModelKey]][]).map(([key, m]) => (
            <button
              key={key}
              onClick={() => onSelectModel(key)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                border: key === model ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: key === model ? 'var(--primary-bg)' : 'var(--surface)',
                color: key === model ? 'var(--primary)' : 'var(--text)', cursor: 'pointer',
                fontWeight: key === model ? 700 : 400, transition: 'all 0.2s',
              }}
            >
              <div>{m.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
