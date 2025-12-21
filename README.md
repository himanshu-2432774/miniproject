# Paws Haven — Local Backend (Node + Express)

A small local backend to power the static Paws Haven frontend. It provides a simple REST API for pets and local persistence with SQLite for development and demos.

---

## 🚀 Quick start
Prerequisites:
- Node.js 16+ (LTS recommended)
- npm (bundled with Node)

1) Open terminal in the project folder:
```powershell
cd "C:\Users\HP\OneDrive\Desktop\project"
```
2) Install dependencies:
```powershell
npm install
```
3) (Optional) Import existing JSON into SQLite (one-time):
```powershell
node db-migrate.js
```
4) Run the server in dev mode (auto-restart on change):
```powershell
npm run dev
```
Open the app: http://localhost:3000

---

## 📁 What this project includes
- Express server (`server.js`) serving frontend and exposing a JSON API.
- SQLite persistence via `better-sqlite3` (`data.sqlite`).
- One-time importer: `db-migrate.js` (imports `db.json` into SQLite).
- Basic server-side validation and sanitization for POST /api/pets.
- Optional API key protection (`ADMIN_API_KEY`) for mutating endpoints.
- Tests (Jest + Supertest) and a GitHub Actions CI workflow.

---

## 🔧 API
Base URL: http://localhost:3000

Endpoints:
- GET /api/pets
  - Returns: JSON array of pets
- GET /api/pets/:id
  - Returns: pet object or 404
- POST /api/pets
  - Creates a pet. JSON body must include at least `name` and `type`.
  - Request headers: `Content-Type: application/json` and, if `ADMIN_API_KEY` is set, `x-api-key: <key>`.
  - Server sanitizes inputs (strips HTML) and validates required fields.

Example: add a pet (with API key if required)
```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "x-api-key: <YOUR_API_KEY>" \
  -d '{"name":"Mittens","type":"cat","years":"2 Years","gender":"female","img":"https://..."}'
```

Responses:
- 200 for successful GETs
- 201 for successful POST
- 400 for validation errors (e.g., missing name/type)
- 401 for unauthorized POST when `ADMIN_API_KEY` is set

---

## 🔐 Admin API key
To protect create/update actions in production, set an admin key in environment variables or `.env`:
```
ADMIN_API_KEY=your_strong_secret_key
```
- If set, include `x-api-key: your_strong_secret_key` in requests to protected endpoints.
- Don’t commit `.env` to version control. `.env` is in `.gitignore`.

Local dev tip: you can also store the key in the browser locally for the admin UI (the frontend includes a small local key input for convenience).

---

## ✅ Tests & CI
Run tests locally:
```powershell
npm test
```
CI:
- A GitHub Actions workflow is included at `.github/workflows/nodejs.yml` to run tests on push and PR.

---

## 🧭 Deployment & production notes
- For production use a managed database (Postgres, MySQL). Keep `data.sqlite` only for local development.
- Persist your DB file when deploying to a container or platform with ephemeral filesystems (use volumes or managed DB services).
- Use a secrets manager (e.g., Render secrets, Railway variables, or cloud secret stores) to store `ADMIN_API_KEY` and other secrets.
- Recommended additions before production: input validation library, rate limiting, authentication, HTTPS, logging, and backups.

---

## 🛠 Troubleshooting
- Server won't start: check `npm install` and that Node is installed.
- Port in use: set `PORT` env var (e.g., `PORT=4000 npm run dev`).
- API key not working: ensure `.env` contains the same key and restart the server.
- Tests failing: run `npm test --verbose` to see error details.

---

## 📦 Files of interest
- `server.js` — main server
- `db-migrate.js` — import `db.json` → `data.sqlite`
- `data.sqlite` — SQLite DB created/used by the server
- `js/index.js`, `js/pet.js` — frontend scripts that use the API
- `.env` — environment variables (ignored by git)
- `tests/api.test.js` — API tests (Jest + Supertest)

---

## 📣 Want me to…
- Add API key management UI (admin login)?
- Add structured DB migrations (knex/umzug)?
- Prepare a deployment to Render or Railway and test it?

Reply which item you want next and I’ll implement it (I can do them all in sequence).

---

© 2025 Paws Haven — Local Dev Server
