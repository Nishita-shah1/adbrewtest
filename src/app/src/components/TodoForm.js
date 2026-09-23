import { useState } from "react";

export function TodoForm({ onSubmit, isSubmitting }) {
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = description.trim();
    if (!trimmed) {
      setFormError("Please enter a todo description.");
      return;
    }

    setFormError(null);

    try {
      await onSubmit(trimmed);
      setDescription("");
    } catch (error) {
      setFormError(error.message || "Could not add todo.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="todo">ToDo: </label>
        <input
          id="todo"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
          placeholder="What needs to be done?"
        />
      </div>
      <div style={{ marginTop: "5px" }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add ToDo!"}
        </button>
      </div>
      {formError ? <p style={{ color: "crimson" }}>{formError}</p> : null}
    </form>
  );
}
