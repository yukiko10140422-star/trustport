'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TabBar from '@/components/TabBar';
import { getTheme, setTheme, THEME_OPTIONS, type ThemeValue } from '@/lib/theme';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status !== 'authenticated' || !session) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, margin: '0 auto' }}>
      <header style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>設定</span>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Account */}
        <div style={{
          padding: 16, borderRadius: 12, border: '1px solid var(--border)',
          background: 'var(--surface)', marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>
            アカウント
          </div>
          <div style={{ fontSize: 15 }}>{session.user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{session.user?.email}</div>
        </div>

        {/* App info */}
        <div style={{
          padding: 16, borderRadius: 12, border: '1px solid var(--border)',
          background: 'var(--surface)', marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>
            アプリ情報
          </div>
          <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div>Company 秘書アプリ v0.1.0</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>15部署対応 / Haiku・Sonnet・Opus 切替</div>
          </div>
        </div>

        {/* Theme */}
        <ThemeSelector />

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #ef4444',
            background: 'transparent', color: '#ef4444', fontSize: 15,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          ログアウト
        </button>
      </main>

      <TabBar />
    </div>
  );
}

function ThemeSelector() {
  const [current, setCurrent] = useState<ThemeValue>('system');

  useEffect(() => {
    setCurrent(getTheme());
  }, []);

  const handleChange = (value: ThemeValue) => {
    setTheme(value);
    setCurrent(value);
  };

  return (
    <div style={{
      padding: 16, borderRadius: 12, border: '1px solid var(--border)',
      background: 'var(--surface)', marginBottom: 12,
    }}>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 10 }}>
        テーマ
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: current === opt.value ? 700 : 400,
              border: current === opt.value ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: current === opt.value ? 'var(--primary-bg)' : 'transparent',
              color: current === opt.value ? 'var(--primary)' : 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
