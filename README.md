# Adbrew TODO App — Solution

Full-stack TODO application built with **React (hooks)**, **Django REST Framework**, **MongoDB**, and **Docker**.

- Frontend: http://localhost:3000  
- Backend: http://localhost:8000/todos/  
- Database: MongoDB on port 27017  

---

## What the app does

1. Loads TODOs from MongoDB via `GET /todos/`
2. Creates a TODO via `POST /todos/` with `{ "description": "..." }`
3. Refreshes the list after a successful create

No Django models, serializers, or SQLite are used for TODOs. All persistence goes through MongoDB using the provided `db` connection pattern.

---

## Architecture overview

```
Browser
  └── React App (hooks)
        ├── components/   UI only
        ├── hooks/        state + flow
        └── api/          HTTP client
              │
              ▼
        Django APIView
              │
              ├── TodoService      (validation / business rules)
              └── TodoRepository   (MongoDB access)
                        │
                        ▼
                     MongoDB
```

Layers keep HTTP, business rules, and data access separate so each part is easier to test and change.

---

## Files I created

| File | Purpose |
|------|---------|
| `src/rest/rest/todo_repository.py` | Repository layer — MongoDB read/write for TODOs |
| `src/rest/rest/todo_service.py` | Service layer — validation and business logic |
| `src/app/src/api/todosApi.js` | Frontend API client (`fetch` to Django) |
| `src/app/src/hooks/useTodos.js` | Custom React hook — list/create/refresh state |
| `src/app/src/components/TodoList.js` | Presentational list component |
| `src/app/src/components/TodoForm.js` | Form component (controlled input + submit) |

---

## Files I modified

| File | What changed |
|------|----------------|
| `src/rest/rest/views.py` | Implemented `GET` and `POST`; wired service + repository; error handling |
| `src/app/src/App.js` | Replaced hardcoded TODOs with hooks + components |
| `src/app/src/App.test.js` | Updated test for the new UI |
| `Dockerfile` | Setup fixes so images build on modern Docker (Node 16 for CRA 4, pip pin) |
| `docker-compose.yml` | Official `mongo:4.4` image; `node_modules` volume; app env for CRA in Docker |
| `.env` | Local `ADBREW_CODEBASE_PATH` for volume mounts (Windows) |

### Files left as-is (used, not rewritten)

| File | Role |
|------|------|
| `src/rest/rest/urls.py` | Already routes `/todos/` → `TodoListView` |
| `src/rest/rest/settings.py` | CORS / DRF already configured |
| `src/requirements.txt` | Original dependency list kept |

---

## Design principles used

### 1. Separation of concerns

| Layer | Responsibility |
|-------|----------------|
| **View** (`views.py`) | HTTP only — status codes, JSON responses |
| **Service** (`todo_service.py`) | Rules — validate description, orchestrate create/list |
| **Repository** (`todo_repository.py`) | Data — MongoDB queries and serialization |
| **API module** (`todosApi.js`) | Network — only place the frontend talks to the backend |
| **Hook** (`useTodos.js`) | State — loading, errors, refresh after create |
| **Components** | UI — render form/list; no direct `fetch` |

### 2. Repository pattern

`TodoRepository` hides MongoDB details (`find`, `insert_one`, ObjectId → string). The rest of the app never imports `pymongo` directly except where the DB client is created.

### 3. Service / facade pattern

`TodoService` is the single entry for use-cases (`get_todos`, `create_todo`). Views stay thin.

### 4. Modular frontend

Feature split into `api/`, `hooks/`, and `components/` so UI can change without touching network code, and vice versa.

### 5. Error handling (production-minded)

**Backend**
- Validation errors → `400 Bad Request`
- Mongo failures → `503 Service Unavailable` + logging
- Unexpected errors → `500` with a safe message (no stack traces to the client)

**Frontend**
- Empty form blocked before calling the API
- Failed requests show user-facing messages
- Loading / submitting states disable the button and show feedback

---

## SOLID principles

| Principle | How it applies here |
|-----------|---------------------|
| **S — Single Responsibility** | View ≠ Service ≠ Repository. Form ≠ List ≠ API client ≠ hook. |
| **O — Open/Closed** | New validation rules can be added in the service without changing Mongo code. New UI can use `useTodos` without changing `todosApi`. |
| **L — Liskov Substitution** | Service depends on a repository with a clear contract (`list_all`, `create`). A different storage implementation with the same methods could replace Mongo without changing the view. |
| **I — Interface Segregation** | Components only receive the props they need (`todos`/`isLoading`, or `onSubmit`/`isSubmitting`) — not the whole app state. |
| **D — Dependency Inversion** | `TodoService` depends on a repository abstraction (injected in `__init__`), not on raw `MongoClient` usage inside business logic. `TodoService(TodoRepository(db))` wires this in `views.py`. |

---

## OOP concepts used (Python)

| Concept | Example |
|---------|---------|
| **Class** | `TodoRepository`, `TodoService`, `TodoListView` |
| **Encapsulation** | `_collection`, `_repository`, `_serialize`, `_extract_description` (internal helpers) |
| **Abstraction** | Callers use `create()` / `get_todos()` without knowing Mongo query details |
| **Inheritance** | `TodoListView(APIView)` — DRF base class for HTTP verbs |
| **Composition** | Service *has a* repository; view *uses* a service instance |
| **Custom exceptions** | `TodoValidationError`, `TodoPersistenceError` for typed error handling |
| **Static methods** | `_serialize`, `_extract_description` — helpers without instance state |

---

## React concepts used (JavaScript)

| Concept | Where |
|---------|--------|
| **Functional components** | `App`, `TodoForm`, `TodoList` |
| **Hooks** | `useState`, `useEffect`, custom `useTodos` |
| **Controlled inputs** | Form value bound to state |
| **Props** | Parent passes data/callbacks down |
| **Lifting state** | List + create flow owned by `useTodos`, shared via `App` |

No class components or lifecycle methods (`componentDidMount`, etc.) — hooks only, as required.

---

## API contract

### `GET /todos/`

**Response `200`**
```json
{
  "todos": [
    { "id": "...", "description": "Learn Docker" }
  ]
}
```

### `POST /todos/`

**Request**
```json
{ "description": "Buy milk" }
```

**Response `201`**
```json
{
  "todo": { "id": "...", "description": "Buy milk" }
}
```

**Response `400`** (validation)
```json
{ "error": "Description cannot be empty." }
```

---

## How to run (Docker)

### Prerequisites
- Docker Desktop running
- This repo cloned as a **standalone** copy (not a fork of Adbrew’s public repo)

### Windows (PowerShell)

```powershell
cd path\to\adbrewtest

$env:ADBREW_CODEBASE_PATH = "C:/path/to/adbrewtest/src"
# Or use the included .env file with ADBREW_CODEBASE_PATH set

docker compose build
docker compose up -d
```

### Linux / macOS

```bash
cd path/to/adbrewtest
export ADBREW_CODEBASE_PATH="$(pwd)/src"
docker-compose build
docker-compose up -d
```

### Verify

```bash
docker ps
```

You should see containers: `app`, `api`, `mongo`.

- App: http://localhost:3000  
- API: http://localhost:8000/todos/  

### Helpful commands

```bash
docker logs -f --tail=100 app
docker logs -f --tail=100 api
docker compose down
docker restart app
```

> First start of `app` can take a while (`yarn install`). Wait until logs show **Compiled successfully**.

---

## Docker setup (brief)

Three services:

| Service | Role | Port |
|---------|------|------|
| `app` | React dev server (`yarn start`) | 3000 |
| `api` | Django (`manage.py runserver`) | 8000 |
| `mongo` | MongoDB 4.4 | 27017 |

Code is mounted via `ADBREW_CODEBASE_PATH` → `/src` so edits on the host reflect in containers. The API uses `MONGO_HOST=mongo` (Docker network hostname) to reach the database.

---

## Constraints followed

- React: **hooks only** (no class components / lifecycle methods)
- Persistence: **MongoDB only** (no Django models / serializers / SQLite for TODOs)
- App runs through **Docker** (not bypassed)
- Code structured for **maintainability**: layers, validation, and clear error handling

---

## Submission note

This is a **private standalone repository**, not a fork/PR against Adbrew’s public test repo.
