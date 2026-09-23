import { useEffect, useState } from "react";
import { createTodo, fetchTodos } from "../api/todosApi";

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function loadTodos() {
    setIsLoading(true);
    setError(null);

    try {
      const items = await fetchTodos();
      setTodos(items);
    } catch (err) {
      setError(err.message || "Failed to load todos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function addTodo(description) {
    setIsSubmitting(true);
    setError(null);

    try {
      await createTodo(description);
      await loadTodos();
    } catch (err) {
      setError(err.message || "Failed to create todo.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    todos,
    isLoading,
    isSubmitting,
    error,
    addTodo,
    refreshTodos: loadTodos,
  };
}
