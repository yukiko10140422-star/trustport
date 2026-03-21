import { listEvents, createEvent } from './calendar-service';
import { listTodos, createTodo, completeTodo } from './todo-service';

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  accessToken: string,
): Promise<string> {
  if (!accessToken) {
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

      default:
        return JSON.stringify({ error: `不明なツールです: ${toolName}` });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}
