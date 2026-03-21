'use client';

import { useEffect, useState, useRef } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase';
import type { Task, WorkerStatus } from '@/types';

/**
 * Subscribe to a specific task's status updates via Supabase Realtime.
 * Falls back to polling if Realtime connection fails.
 */
export function useTaskSubscription(taskId: string | null) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(!!taskId);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!taskId) return;

    const supabase = createSupabaseBrowser();
    let active = true;

    // Initial fetch
    const fetchTask = async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const { task: t } = await res.json();
        if (active) {
          setTask(t);
          setIsLoading(false);
          if (t.status === 'completed' || t.status === 'failed') {
            clearInterval(pollRef.current);
          }
        }
      }
    };
    fetchTask();

    // Realtime subscription
    const channel = supabase
      .channel(`task-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'company_tasks',
          filter: `id=eq.${taskId}`,
        },
        (payload) => {
          if (active) {
            setTask(payload.new as Task);
            setIsLoading(false);
          }
        },
      )
      .subscribe((status) => {
        // Realtime接続失敗時はポーリングにフォールバック
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          pollRef.current = setInterval(fetchTask, 10_000);
        }
      });

    // ポーリングフォールバック（Realtimeが安定するまでの保険）
    pollRef.current = setInterval(fetchTask, 15_000);

    return () => {
      active = false;
      clearInterval(pollRef.current);
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  return { task, isLoading };
}

/**
 * Subscribe to worker online/offline status.
 */
export function useWorkerStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    let active = true;

    // Initial fetch
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('company_worker_status')
        .select('is_online, last_heartbeat')
        .eq('id', 'default')
        .single();

      if (active && data) {
        const online = data.is_online &&
          Date.now() - new Date(data.last_heartbeat).getTime() < 60_000;
        setIsOnline(online);
        setLastHeartbeat(data.last_heartbeat);
      }
    };
    fetchStatus();

    // Realtime subscription
    const channel = supabase
      .channel('worker-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'company_worker_status',
          filter: 'id=eq.default',
        },
        (payload) => {
          if (active) {
            const ws = payload.new as WorkerStatus;
            const online = ws.is_online &&
              Date.now() - new Date(ws.last_heartbeat).getTime() < 60_000;
            setIsOnline(online);
            setLastHeartbeat(ws.last_heartbeat);
          }
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { isOnline, lastHeartbeat };
}
