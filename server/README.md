# Jharkhand SICP — Reference Backend

Express + Mongoose reference backend for the Jharkhand Societal Innovation Collaboration Platform.

## Setup

```bash
cd server
cp .env.example .env
npm install
```

## .env

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend origin for CORS |
| `AI_API_URL` / `AI_API_KEY` | Optional external AI service; see note below |

## Run

```bash
npm run dev     # watch mode
npm start       # production
npm run seed    # seed demo data
```

Health check: `GET /health`

## Demo accounts (password: `Demo@123`)

| Email | Role | Organization |
|---|---|---|
| citizen@demo.in | CITIZEN | — |
| admin@demo.in | ADMIN | — |
| university@demo.in | UNIVERSITY | IIIT Ranchi |
| industry@demo.in | INDUSTRY | Jharkhand Water Tech Pvt Ltd |

Seed data also includes BIT Mesra, Ranchi University, NIT Jamshedpur; faculty/students at IIIT Ranchi
across CSE/ECE/Environmental Science/Management; industry partners Tata Steel Foundation, Jharkhand
Water Tech Pvt Ltd, AgriSense Labs, Central Coalfields CSR Cell; 10 Jharkhand challenges (including a
23-report cluster for rural water contamination in Gumla); an active project "IoT-based Rural Water
Quality Monitoring" (5 milestones + industry collaboration); and a completed project with an
`ImpactMetric` of 850 people impacted.

## API overview (all under `/api/v1`)

| Resource | Base path | Notes |
|---|---|---|
| Auth | `/auth` | register, login, me, logout |
| Challenges | `/challenges` | citizen create; admin validate/reject/merge/assign/override; clusters, nearby |
| Universities | `/universities` | recommended challenges, express interest, accept -> creates project, form team |
| Proposals | `/proposals` | university submit; admin review |
| Projects | `/projects` | milestones, comments, impact metrics |
| Collaborations | `/collaborations` | industry/university requests + response |
| Notifications | `/notifications` | list, mark read |
| Analytics | `/analytics` | ADMIN-only aggregations (district, domain, severity, status, university/industry participation, pipeline, deployed solutions, impact totals) |
| Impact | `/impact` | citizens-impacted aggregate |

Every route requires `Authorization: Bearer <token>` (via `protect`) except `/auth/register` and
`/auth/login`; role-specific routes are additionally gated with `authorize('ROLE', ...)`.

## AI service note

`src/services/aiService.js` returns deterministic, keyword/heuristic-based mock results (classification,
priority scoring, duplicate detection, university/industry matching, solution suggestions) unless both
`AI_API_URL` and `AI_API_KEY` are set in `.env`, in which case it calls the configured external AI API
and falls back to the mock logic if that call fails.
