export function TodoList({ todos, isLoading }) {
  if (isLoading) {
    return <p>Loading todos...</p>;
  }

  if (!todos.length) {
    return <p>No todos yet. Add one below.</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.description}</li>
      ))}
    </ul>
  );
}
