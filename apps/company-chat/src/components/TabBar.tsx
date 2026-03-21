'use client';

import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  { path: '/chat', label: 'チャット', icon: '💬' },
  { path: '/calendar', label: 'カレンダー', icon: '📅' },
  { path: '/todos', label: 'TODO', icon: '✓' },
  { path: '/settings', label: '設定', icon: '⚙' },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav style={{
      display: 'flex', borderTop: '1px solid var(--border)',
      background: 'var(--surface)', position: 'sticky', bottom: 0,
    }}
    className="safe-bottom"
    >
      {TABS.map(tab => {
        const active = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            style={{
              flex: 1, padding: '8px 0 6px', border: 'none',
              background: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 10, fontWeight: active ? 700 : 400,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
