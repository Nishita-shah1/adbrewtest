import "./App.css";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";

export function App() {
  const { todos, isLoading, isSubmitting, error, addTodo } = useTodos();

  return (
    <div className="App">
      <div>
        <h1>List of TODOs</h1>
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
        <TodoList todos={todos} isLoading={isLoading} />
      </div>
      <div>
        <h1>Create a ToDo</h1>
        <TodoForm onSubmit={addTodo} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

export default App;
