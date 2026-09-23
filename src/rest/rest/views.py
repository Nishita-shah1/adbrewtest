import logging
import os

from pymongo import MongoClient
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .todo_repository import TodoPersistenceError, TodoRepository
from .todo_service import TodoService, TodoValidationError

logger = logging.getLogger(__name__)

mongo_uri = "mongodb://" + os.environ["MONGO_HOST"] + ":" + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)["test_db"]

todo_service = TodoService(TodoRepository(db))


class TodoListView(APIView):
    """HTTP adapter for listing and creating TODOs."""

    def get(self, request):
        try:
            todos = todo_service.get_todos()
            return Response({"todos": todos}, status=status.HTTP_200_OK)
        except TodoPersistenceError as exc:
            logger.exception("GET /todos failed")
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            logger.exception("Unexpected error on GET /todos")
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        try:
            todo = todo_service.create_todo(request.data)
            return Response({"todo": todo}, status=status.HTTP_201_CREATED)
        except TodoValidationError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except TodoPersistenceError as exc:
            logger.exception("POST /todos failed")
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            logger.exception("Unexpected error on POST /todos")
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
