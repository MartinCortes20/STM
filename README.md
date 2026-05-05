# STM — Staff Task Manager

Pixel-aesthetic task delegation system. Full-stack: React + TypeScript frontend, Node.js + Express + TypeScript backend, JSON file persistence.

## Requirements

- Node.js 18+
- npm 9+

## Setup & Run

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on **http://localhost:3001**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3000**

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Company Logo

Drop a `logo.png` file into `frontend/public/`. It will appear at the top of the home screen. If no logo is found, the slot is hidden automatically.

## Architecture

Both backend and frontend follow **Clean Architecture** with layers:

| Layer | Purpose |
|---|---|
| `domain/` | Core types and interfaces |
| `use-cases/` | Business logic |
| `infrastructure/` | I/O: JSON file (backend) / API client (frontend) |
| `presentation/` | Express routes (backend) / React components (frontend) |

## API

```
GET    /api/workers
POST   /api/workers          { name, role, photo? }
DELETE /api/workers/:id

GET    /api/workers/:id/tasks
POST   /api/workers/:id/tasks
PATCH  /api/workers/:id/tasks/:taskId  { status?, comment? }
DELETE /api/workers/:id/tasks/:taskId
```

## Data

Stored in `backend/data/db.json`. Worker photos are base64-encoded and compressed client-side to <50KB before upload.
# STM
