const API_BASE_URL = "http://localhost:8000";

async function parseErrorMessage(response) {
  try {
    const data = await response.json();
    if (data && data.error) {
      return data.error;
    }
  } catch (error) {
    // Fall through to status-based message.
  }
  return `Request failed with status ${response.status}`;
}

export async function fetchTodos() {
  const response = await fetch(`${API_BASE_URL}/todos/`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = await response.json();
  return Array.isArray(data.todos) ? data.todos : [];
}

export async function createTodo(description) {
  const response = await fetch(`${API_BASE_URL}/todos/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = await response.json();
  return data.todo;
}
