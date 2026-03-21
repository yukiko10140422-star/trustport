import { listEvents, createEvent } from './calendar-service';
import { listTodos, createTodo, completeTodo } from './todo-service';
import { searchDocuments, getDocumentDetail } from './company-docs-service';
import { searchWeb } from './web-search-service';

// Google OAuth不要のツール
const NO_AUTH_TOOLS = new Set(['search_company_docs', 'get_company_doc_detail', 'web_search']);

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

      default:
        return JSON.stringify({ error: `不明なツールです: ${toolName}` });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}
