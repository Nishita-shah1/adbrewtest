from pymongo.errors import PyMongoError


class TodoRepository:
    """Data-access layer for TODO documents in MongoDB."""

    COLLECTION_NAME = "todos"

    def __init__(self, database):
        self._collection = database[self.COLLECTION_NAME]

    def list_all(self):
        try:
            cursor = self._collection.find().sort("_id", -1)
            return [self._serialize(document) for document in cursor]
        except PyMongoError as exc:
            raise TodoPersistenceError("Failed to fetch todos from MongoDB.") from exc

    def create(self, description):
        try:
            result = self._collection.insert_one({"description": description})
            document = self._collection.find_one({"_id": result.inserted_id})
            return self._serialize(document)
        except PyMongoError as exc:
            raise TodoPersistenceError("Failed to create todo in MongoDB.") from exc

    @staticmethod
    def _serialize(document):
        if document is None:
            return None
        return {
            "id": str(document["_id"]),
            "description": document.get("description", ""),
        }


class TodoPersistenceError(Exception):
    """Raised when a MongoDB operation fails."""
