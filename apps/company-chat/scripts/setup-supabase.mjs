/**
 * Supabase セットアップスクリプト
 * - conversations + messages テーブル作成
 * - company-chat ストレージバケット作成
 *
 * 使い方: node scripts/setup-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です');
  process.exit(1);
}

const supabase = createClient(url, key);

async function runSQL(sql) {
  const { error } = await supabase.rpc('exec_sql', { sql_string: sql }).maybeSingle();
  if (error) {
    // rpc が使えない場合は REST API で直接実行
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_string: sql }),
    });
    if (!res.ok) {
      return { error: await res.text() };
    }
  }
  return { error: null };
}

async function main() {
  console.log('=== Supabase セットアップ開始 ===\n');

  // 1. conversations テーブル確認・作成
  console.log('1. テーブル確認...');
  const { data: tables } = await supabase
    .from('conversations')
    .select('id')
    .limit(1);

  if (tables !== null) {
    console.log('   conversations テーブル: 既に存在');
  } else {
    console.log('   conversations テーブル: 作成中...');
    const sql = readFileSync(resolve(__dirname, '../supabase/migrations/002_conversations.sql'), 'utf-8');
    // SQL を文単位で実行（CREATE TABLE, CREATE INDEX, etc.）
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const stmt of statements) {
      const result = await runSQL(stmt);
      if (result.error) {
        console.log(`   警告: ${String(result.error).slice(0, 100)}`);
      }
    }
    console.log('   conversations + messages テーブル: 作成完了');
  }

  // 2. messages テーブル確認
  const { data: msgCheck } = await supabase
    .from('messages')
    .select('id')
    .limit(1);
  console.log(`   messages テーブル: ${msgCheck !== null ? '既に存在' : '確認が必要'}`);

  // 3. Storage バケット作成
  console.log('\n2. Storage バケット確認...');
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.id === 'company-chat');

  if (exists) {
    console.log('   company-chat バケット: 既に存在');
  } else {
    const { error: bucketError } = await supabase.storage.createBucket('company-chat', {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    });
    if (bucketError) {
      console.error('   バケット作成失敗:', bucketError.message);
    } else {
      console.log('   company-chat バケット: 作成完了 (public, 10MB制限)');
    }
  }

  // 4. company_tasks テーブル確認
  console.log('\n3. 既存テーブル確認...');
  const { data: tasksCheck } = await supabase
    .from('company_tasks')
    .select('id')
    .limit(1);
  console.log(`   company_tasks: ${tasksCheck !== null ? '存在' : '未作成'}`);

  const { data: workerCheck } = await supabase
    .from('company_worker_status')
    .select('id')
    .limit(1);
  console.log(`   company_worker_status: ${workerCheck !== null ? '存在' : '未作成'}`);

  console.log('\n=== セットアップ完了 ===');
}

main().catch(console.error);
