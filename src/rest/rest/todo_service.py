from .todo_repository import TodoRepository


class TodoValidationError(Exception):
    """Raised when todo input fails validation."""


class TodoService:
    """Business logic for TODO operations."""

    def __init__(self, repository):
        self._repository = repository

    def get_todos(self):
        return self._repository.list_all()

    def create_todo(self, payload):
        description = self._extract_description(payload)
        return self._repository.create(description)

    @staticmethod
    def _extract_description(payload):
        if payload is None:
            raise TodoValidationError("Request body is required.")

        description = payload.get("description")
        if description is None:
            # Accept common alternate keys from simple HTML forms / clients
            description = payload.get("todo") or payload.get("text")

        if not isinstance(description, str):
            raise TodoValidationError("Description must be a string.")

        description = description.strip()
        if not description:
            raise TodoValidationError("Description cannot be empty.")

        if len(description) > 500:
            raise TodoValidationError("Description must be 500 characters or fewer.")

        return description
