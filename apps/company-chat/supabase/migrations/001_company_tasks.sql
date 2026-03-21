-- company_tasks: 秘書アプリのジョブキュー
CREATE TABLE company_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- リクエスト情報
  message TEXT NOT NULL,
  department_id TEXT,
  department_name TEXT,
  person TEXT,

  -- 分類
  task_type TEXT NOT NULL DEFAULT 'heavy'
    CHECK (task_type IN ('research', 'slide', 'code', 'report', 'file-op', 'heavy')),
  priority INTEGER NOT NULL DEFAULT 0,

  -- 実行結果
  result TEXT,
  error TEXT,

  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- ワーカー情報
  worker_id TEXT
);

CREATE INDEX idx_company_tasks_pending ON company_tasks(priority DESC, created_at ASC) WHERE status = 'pending';
CREATE INDEX idx_company_tasks_recent ON company_tasks(created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE company_tasks;

ALTER TABLE company_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON company_tasks
  FOR ALL USING (true) WITH CHECK (true);


-- company_worker_status: ワーカーのオンライン状態
CREATE TABLE company_worker_status (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now(),
  hostname TEXT,
  version TEXT
);

INSERT INTO company_worker_status (id, is_online) VALUES ('default', false);

ALTER PUBLICATION supabase_realtime ADD TABLE company_worker_status;

ALTER TABLE company_worker_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON company_worker_status
  FOR ALL USING (true) WITH CHECK (true);
