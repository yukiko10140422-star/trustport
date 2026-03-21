import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface AuthSession {
  email: string;
  accessToken: string;
}

/**
 * サーバーサイドで認証済みセッションを取得する。
 * 未認証・email未取得の場合は null を返す。
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return {
    email: session.user.email,
    accessToken: session.accessToken || '',
  };
}
