# Smart Business Performance Analyzer

Smart Business Performance Analyzer is a full-stack analytics platform that ingests business data from files, databases, APIs, and NoSQL sources, then turns that data into structured insights, summaries, and visual analysis.

## Overview

The project combines a FastAPI backend with a React + Vite frontend. The backend provides versioned APIs for upload, discovery, quality checks, analysis, and authentication. The frontend provides a guided analysis workflow, dashboard, history, profile management, and protected routes for signed-in users.

## Key Capabilities

- Multi-source ingestion from CSV, SQL, API, and NoSQL inputs
- Guided step-by-step analysis flow in the frontend
- Automatic dataset type detection for time series and snapshot/entity-style data
- Data quality checks and column discovery helpers
- Insight generation across one or many metrics
- Versioned backend APIs for public and authenticated workflows
- JWT-based authentication with optional Google sign-in support
- Profile management, including profile picture upload
- Standardized API success and error responses

## Tech Stack

Backend:

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pandas and NumPy
- Passlib with bcrypt
- python-jose for JWT handling
- Requests and python-multipart

Frontend:

- React 19
- Vite 8
- TypeScript
- React Router
- Zustand
- Axios
- Recharts
- Sonner
- Tailwind CSS v4

## Repository Layout

```text
app/                    FastAPI backend application
auth/                   Authentication models, routes, schemas, helpers
core/                   Shared error handling and security utilities
services/               Analysis, ingestion, normalization, and orchestration logic
data/                   Sample CSV files and notebook assets
frontend/               React + Vite client application
uploads/                Generated uploads and profile pictures
requirements.txt        Python dependencies
frontend/package.json   Frontend dependencies and scripts
README.md               Project documentation
```

## Prerequisites

- Python 3.10+ recommended
- Node.js 18+ recommended
- PostgreSQL for the default backend configuration
- npm or another Node package manager

## Setup

### 1. Backend

Create and activate a virtual environment, then install the Python dependencies:

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Frontend

Install the frontend dependencies from the `frontend` folder:

```bash
cd frontend
npm install
```

## Environment Variables

Backend variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:Khushi%401806@localhost:5432/smart_analyzer` |
| `JWT_SECRET_KEY` | JWT signing secret | `change-this-secret-key-in-production` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Access-token lifetime in minutes | `60` |

Frontend variables:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Optional backend base URL for the API client |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for the login flow |

If `VITE_API_BASE_URL` is not set, the frontend uses a relative base URL.

## Run Locally

### Backend

```bash
uvicorn app.main:app --reload
```

Default backend URLs:

- API root: `http://127.0.0.1:8000`
- OpenAPI docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### Frontend

```bash
cd frontend
npm run dev
```

The Vite dev server typically runs at `http://localhost:5173`.

## Authentication

The backend exposes username/password auth, Google login, and profile endpoints under `/auth`.

### Register

`POST /auth/register`

Request body:

```json
{
  "email": "user@example.com",
  "password": "MySecurePass123"
}
```

Response:

```json
{
  "message": "User registered successfully."
}
```

### Login

`POST /auth/login`

This endpoint uses `application/x-www-form-urlencoded` with the fields `username` and `password`.

Example payload:

```text
username=user@example.com&password=MySecurePass123
```

Response:

```json
{
  "success": true,
  "access_token": "<JWT_TOKEN>",
  "token_type": "bearer"
}
```

### Google Login

`POST /auth/google`

Send the Google token in the request body. The frontend uses `@react-oauth/google` for this flow.

### Protected Requests

Authenticated endpoints require this header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Protected API groups in the current implementation:

- `/api/v2/*`
- `/api/v3/*`
- `/auth/profile`
- `/auth/profile/picture`
- `/auth/profile` update route

## Analysis Workflow

The frontend uses a staged analysis pipeline that guides users through the following steps:

1. Choose a data source
2. Upload or connect the source
3. Select relevant columns
4. Review data understanding
5. Check data quality
6. Run analysis
7. Generate insights
8. Review the final summary

The dashboard also keeps recent analysis history and provides a quick restart path for new runs.

## API Overview

### Health

`GET /`

Returns a simple success payload confirming that the backend is running.

### V1 Public APIs

Base prefix: `/api/v1`

Main endpoints include:

- CSV upload
- preview analysis
- column discovery
- data quality checks
- single-metric analysis
- insights generation
- dataset type detection
- unified pipeline execution
- mock data generation

These endpoints are public in the current implementation.

### V2 Protected APIs

Base prefix: `/api/v2`

- Unified ingestion and analysis
- Bearer token required

### V3 Protected APIs

Base prefix: `/api/v3`

- Intelligent ingestion and analysis
- Bearer token required
- Supports entity-aware analysis for snapshot-style workflows

## Sample Data

The repository includes sample datasets under `data/`, which can be used to test ingestion and analysis flows quickly.

## Notes

- CORS is currently configured for `http://localhost:5173`.
- The backend automatically creates the uploads directory and serves it statically.
- JWT expiry is controlled by `JWT_EXPIRE_MINUTES`.
- Uploaded profile pictures are stored under `uploads/profile_pictures/`.

## Verification

If you want to confirm the app is wired correctly, start the backend and frontend, then open the dashboard, sign in, and run a sample analysis using one of the CSV files in `data/`.
