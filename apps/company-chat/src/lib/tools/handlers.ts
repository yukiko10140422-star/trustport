import { listEvents, createEvent, deleteEvent } from './calendar-service';
import { listTodos, createTodo, completeTodo } from './todo-service';
import { searchDocuments, getDocumentDetail } from './company-docs-service';
import { searchWeb } from './web-search-service';
import { listFiles, readFile, writeFile, searchFiles } from './file-service';

// Google OAuth不要のツール
const NO_AUTH_TOOLS = new Set([
  'search_company_docs', 'get_company_doc_detail', 'web_search',
  'list_files', 'read_file', 'write_file', 'search_files',
]);

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  accessToken: string,
): Promise<string> {
  // Google系ツールのみaccessToken必須
  if (!accessToken && !NO_AUTH_TOOLS.has(toolName)) {
    return JSON.stringify({ error: 'Google認証が必要です。再ログインしてください。' });
  }

  try {
    switch (toolName) {
      case 'get_calendar_events': {
        const events = await listEvents(
          accessToken,
          toolInput.timeMin as string,
          toolInput.timeMax as string,
        );
        return JSON.stringify(events);
      }

      case 'create_calendar_event': {
        const result = await createEvent(accessToken, {
          title: toolInput.title as string,
          start: toolInput.start as string,
          end: toolInput.end as string | undefined,
          allDay: toolInput.allDay as boolean | undefined,
        });
        return JSON.stringify(result);
      }

      case 'delete_calendar_event': {
        await deleteEvent(accessToken, toolInput.eventId as string);
        return JSON.stringify({ ok: true, message: '予定を削除しました' });
      }

      case 'get_todos': {
        const todos = await listTodos(accessToken);
        return JSON.stringify(todos);
      }

      case 'create_todo': {
        const result = await createTodo(accessToken, {
          title: toolInput.title as string,
          due: toolInput.due as string | undefined,
          notes: toolInput.notes as string | undefined,
        });
        return JSON.stringify(result);
      }

      case 'complete_todo': {
        await completeTodo(accessToken, {
          taskId: toolInput.taskId as string,
          completed: toolInput.completed as boolean,
        });
        return JSON.stringify({ ok: true });
      }

      case 'search_company_docs': {
        const results = await searchDocuments(
          toolInput.query as string,
          {
            department: toolInput.department as string | undefined,
            docType: toolInput.doc_type as string | undefined,
          },
        );
        return JSON.stringify(results);
      }

      case 'get_company_doc_detail': {
        const doc = await getDocumentDetail(toolInput.file_path as string);
        if (!doc) {
          return JSON.stringify({ error: '該当するドキュメントが見つかりませんでした' });
        }
        return JSON.stringify(doc);
      }

      case 'web_search': {
        const results = await searchWeb(
          toolInput.query as string,
          toolInput.count as number | undefined,
        );
        return JSON.stringify(results);
      }

      case 'list_files': {
        const result = await listFiles(toolInput.path as string);
        return JSON.stringify(result);
      }

      case 'read_file': {
        const result = await readFile(toolInput.path as string);
        return JSON.stringify(result);
      }

      case 'write_file': {
        const result = await writeFile(
          toolInput.path as string,
          toolInput.content as string,
        );
        return JSON.stringify(result);
      }

      case 'search_files': {
        const result = await searchFiles(
          toolInput.query as string,
          toolInput.directory as string | undefined,
        );
        return JSON.stringify(result);
      }

      default:
        return JSON.stringify({ error: `不明なツールです: ${toolName}` });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}
