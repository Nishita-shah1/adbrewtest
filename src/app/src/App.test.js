import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

jest.mock("./api/todosApi", () => ({
  fetchTodos: jest.fn().mockResolvedValue([]),
  createTodo: jest.fn(),
}));

test("renders todo list and create form headings", async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/list of todos/i)).toBeInTheDocument();
  });
  expect(screen.getByText(/create a todo/i)).toBeInTheDocument();
});
