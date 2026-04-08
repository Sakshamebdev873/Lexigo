# Legixo — Case Intake & Hearing Readiness Mini Module

Full-stack legal-ops mini module built for the Legixo Thinklabs Full Stack Intern
take-home. Users can manage case intake records, track hearing-prep tasks per case,
and see a dashboard of hearing readiness.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + React Router
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB (via Mongoose)
- **Validation:** Zod (backend), native HTML + JS checks (frontend)
- **API:** REST (primary) + GraphQL (bonus, one query + one mutation)
- **Tests:** Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Project Structure

```
legixo-case-module/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas (Case, Task)
│   │   ├── controllers/     # Route handlers (case, task, dashboard)
│   │   ├── routes/          # Express router mounting all REST endpoints
│   │   ├── middleware/      # Zod validation schemas, error handler, role gate
│   │   ├── graphql/         # GraphQL schema + resolvers (bonus)
│   │   ├── app.ts           # Express app factory
│   │   └── server.ts        # Entry — connects Mongo + listens
│   ├── __tests__/           # Supertest tests
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/           # Dashboard, CasesList, CaseForm, CaseDetail
    │   ├── components/      # Shared UI primitives
    │   ├── services/api.ts  # REST + GraphQL client
    │   ├── types/           # Shared TS types
    │   ├── App.tsx          # Router + nav + role switcher
    │   └── main.tsx
    ├── __tests__/           # Vitest tests
    └── package.json
```

## Prerequisites

- Node.js 18+
- MongoDB running to a remote instance

## Setup & Run

### 1. Backend

```bash
cd backend
cp  .env          # edit if your Mongo URI differs
npm install
npm run dev                   # starts on http://localhost:5000
```

Environment variables (`backend/.env`):

| Variable        | Default                                   | Purpose                         |
| --------------- | ----------------------------------------- | ------------------------------- |
| `PORT`          | `5000`                                    | API port                        |
| `MONGODB_URI`   | `mongodb://127.0.0.1:27017/legixo`        | MongoDB connection string       |
| `CLIENT_ORIGIN` | `http://localhost:5173`                   | CORS allow-list                 |

Health check: `GET http://localhost:5000/health` → `{ ok: true }`
GraphiQL playground: `http://localhost:5000/graphql`

### 2. Frontend

```bash
cd frontend
cp .env
npm install
npm run dev                   # starts on http://localhost:5173
```

Environment variables (`frontend/.env`):

| Variable       | Default                        |
| -------------- | ------------------------------ |
| `VITE_API_URL` | `http://localhost:5000/api`    |

### 3. Run tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## REST API Contract

| Method | Path                        | Purpose                               |
| ------ | --------------------------- | ------------------------------------- |
| POST   | `/api/cases`                | Create a case                         |
| GET    | `/api/cases`                | List cases (supports search/filter)   |
| GET    | `/api/cases/:id`            | Get a single case                     |
| PUT    | `/api/cases/:id`            | Update a case                         |
| DELETE | `/api/cases/:id`            | Delete a case (**Admin only**)        |
| POST   | `/api/cases/:id/tasks`      | Create a task under a case            |
| GET    | `/api/cases/:id/tasks`      | List tasks for a case                 |
| PUT    | `/api/tasks/:id`            | Update a task                         |
| DELETE | `/api/tasks/:id`            | Delete a task (**Admin only**)        |
| PATCH  | `/api/tasks/:id/status`     | Toggle task status                    |
| GET    | `/api/dashboard/summary`    | Dashboard metrics                     |

**List query params:** `search` (matches caseTitle/clientName, case-insensitive),
`stage`, `fromDate`, `toDate` (ISO dates). All combinable.

**Role header:** the frontend sends `x-role: Admin|Intern`. Delete routes
require `Admin` and return `403` otherwise.

## GraphQL (Bonus 1)

One query + one mutation exposed at `/graphql`:

```graphql
query { cases(search: "tata") { id caseTitle clientName stage } }

mutation { updateCaseStage(id: "...", stage: "Evidence") { id stage } }
```

The mutation is wired into the UI from the **Case Detail** page as a "Quick
stage update" action — it calls GraphQL while the rest of the UI continues
using REST, so both transports are exercised in real flows.

## Features Implemented

**Base (100 pts):**

- ✅ Case Intake CRUD with all required fields + validation
- ✅ Hearing Task Tracker (create/edit/delete/toggle status) scoped to a case
- ✅ Dashboard: active cases, hearings in next 7 days, pending/completed tasks
- ✅ Search (caseTitle/clientName, case-insensitive) + stage filter + hearing
     date range filter, all combinable, plus a "Clear filters" reset
- ✅ Frontend + backend validation, actionable error messages, proper HTTP codes
- ✅ TypeScript throughout, clean separation of concerns
- ✅ This README + meaningful git history

**Bonus:**

- ✅ **GraphQL** (query + mutation, used in real UI flow)
- ✅ **Role handling** — Admin vs Intern, delete gated to Admin
- ✅ **Tests** — one backend (supertest validation) + one frontend (Vitest)
- ✅ **AI usage log** — see `AI_USAGE.md`
- ✅ **UX polish** — responsive layout, loading/empty states, visual hierarchy

## Assumptions & Limitations

- **"Active case"** is defined as any case whose stage is not `Order Reserved`.
  Adjust in `dashboardController.ts` if a different definition is preferred.
- **Cascade delete:** deleting a case removes its tasks. The spec allowed either
  cascade or block-with-error; cascade was chosen for smoother UX since tasks
  have no meaning without their parent case.
- **Role system is deliberately simple** — a client-side `x-role` header,
  not real auth. A production build would use JWT/session + server-side identity.
- **No pagination** on the cases list — acceptable for the assignment scope;
  a `skip/limit` pair would be the natural extension.
- **No mongodb-memory-server in tests** — the backend test verifies validation
  at the route layer without hitting Mongo to keep CI setup trivial. A full
  integration suite would add `mongodb-memory-server`.
- **Notes field** is capped at 1000 chars (enforced both sides).
- **Time zones:** dates are stored as UTC; the UI uses the browser locale for
  display. Intentional for a single-tenant demo.

## Where to review bonus features

| Bonus          | Where to look                                                      |
| -------------- | ------------------------------------------------------------------ |
| GraphQL        | `backend/src/graphql/schema.ts`, used in `frontend/src/pages/CaseDetail.tsx` via `gqlUpdateCaseStage` |
| Role handling  | `backend/src/middleware/error.ts` (`requireAdmin`) + role switcher in `frontend/src/App.tsx` |
| Tests          | `backend/__tests__/cases.test.ts`, `frontend/__tests__/Dashboard.test.tsx` |
| AI usage log   | `AI_USAGE.md`                                                      |
| UX polish      | `frontend/src/index.css`, loading/empty states across pages        |
