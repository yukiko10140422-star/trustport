'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') redirect('/chat');
    if (status === 'unauthenticated') redirect('/login');
  }, [status]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
      <p style={{ color: 'var(--text-secondary)' }}>読み込み中...</p>
    </div>
  );
}
