import type { SupabaseClient } from '@supabase/supabase-js';
import { hostname } from 'os';

const VERSION = '0.1.0';

export class Heartbeat {
  private interval: ReturnType<typeof setInterval> | null = null;

  async start(supabase: SupabaseClient, intervalMs = 30_000): Promise<void> {
    await this.markOnline(supabase);
    this.interval = setInterval(() => this.markOnline(supabase), intervalMs);
  }

  async stop(supabase: SupabaseClient): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    await this.markOffline(supabase);
  }

  async markOnline(supabase: SupabaseClient): Promise<void> {
    await supabase
      .from('company_worker_status')
      .upsert({
        id: 'default',
        is_online: true,
        last_heartbeat: new Date().toISOString(),
        hostname: hostname(),
        version: VERSION,
      });
  }

  async markOffline(supabase: SupabaseClient): Promise<void> {
    await supabase
      .from('company_worker_status')
      .update({ is_online: false })
      .eq('id', 'default');
  }
}
