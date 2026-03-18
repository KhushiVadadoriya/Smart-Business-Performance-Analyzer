# Smart Business Performance Analyzer

Smart Business Performance Analyzer is a FastAPI-based analytics service that ingests data from files, databases, APIs, and NoSQL sources, then generates business insights for time-series and snapshot/entity datasets.

## Features

- Multi-source ingestion (`csv`, `sql`, `api`, `nosql`)
- Dataset-type detection (`event_time_series` or `snapshot_entity`)
- Multi-metric insight generation
- Versioned APIs (`v1`, `v2`, `v3`)
- JWT authentication for protected versions (`v2`, `v3`)
- Standardized success/error response wrapping for `/api/v1`, `/api/v2`, `/api/v3`

## Tech Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pandas, NumPy
- Passlib + JWT (`python-jose`)

## Project Structure (High Level)

```text
app/
	main.py
	config.py
	database.py
	auth/
	core/
	api/
		v1/
		v2/
		v3/
	services/
	schemas/
```

## Installation

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Environment Variables

Set these before running the app (optional defaults exist for JWT and DB):

- `DATABASE_URL`
	- Default: `postgresql://postgres:Khushi%401806@localhost:5432/smart_analyzer`
- `JWT_SECRET_KEY`
	- Default: `change-this-secret-key-in-production`
- `JWT_ALGORITHM`
	- Default: `HS256`
- `JWT_EXPIRE_MINUTES`
	- Default: `60`

## Run Server

```bash
uvicorn app.main:app --reload
```

- Base URL: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`

## Authentication Flow

### Register

`POST /auth/register`

Request (JSON):

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

Request format:

- Content-Type: `application/x-www-form-urlencoded`
- Fields:
	- `username` (email)
	- `password`

Example:

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

### Where to send token

Protected endpoints (`/api/v2/*`, `/api/v3/*`) require:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Token expiry behavior

- Access token expiry is controlled by `JWT_EXPIRE_MINUTES`.
- Default expiry is **60 minutes**.
- Expired/invalid token returns `401` with detail: `Could not validate credentials`.

## Response Standardization

For successful API calls under versioned paths (`/api/v1`, `/api/v2`, `/api/v3`), responses are wrapped as:

```json
{
	"success": true,
	"version": "v1",
	"data": { "...": "..." }
}
```

If an endpoint already returns `{ "success": true, "data": ... }`, it is not double-wrapped.

## Error Response Format

Custom global error shape is used:

```json
{
	"success": false,
	"detail": "Error message"
}
```

Examples:

- Invalid credentials:

```json
{
	"success": false,
	"detail": "Invalid email or password."
}
```

- Token validation failure:

```json
{
	"success": false,
	"detail": "Could not validate credentials"
}
```

- Validation failure (HTTP 422):

```json
{
	"success": false,
	"detail": "field_name: validation_message"
}
```

## API Endpoints (Version-wise)

---

### V1 (Public)

Base prefix: `/api/v1`

#### 1) Upload CSV

- **Method**: `POST`
- **Endpoint**: `/api/v1/upload/csv`
- **Body**: `multipart/form-data`
	- `file`: CSV file
- **Response data**:

```json
{
	"filename": "orders.csv",
	"rows": 1000,
	"columns": 8,
	"column_names": ["order_date", "revenue", "region"]
}
```

#### 2) Analyze Preview

- **Method**: `POST`
- **Endpoint**: `/api/v1/analyze/preview`
- **Body**: `multipart/form-data`
	- `file`: CSV file
	- `date_column`: string
	- `metric_column`: string
- **Response data**:

```json
{
	"preview": [{"order_date": "2024-01-01", "revenue": 1000}],
	"total_rows": 1000
}
```

#### 3) Discover Columns

- **Method**: `POST`
- **Endpoint**: `/api/v1/columns/discover`
- **Body**: `multipart/form-data`
	- `file`: CSV file
- **Response data**:

```json
{
	"date_candidates": ["order_date"],
	"metric_candidates": ["revenue", "profit"],
	"categorical_candidates": ["region", "category"]
}
```

#### 4) Data Quality

- **Method**: `POST`
- **Endpoint**: `/api/v1/quality/assess`
- **Body**: `multipart/form-data`
	- `file`: CSV file
- **Response data**:

```json
{
	"total_rows": 1000,
	"null_counts": {"revenue": 0},
	"duplicate_rows": 2,
	"rows_with_any_null": 5,
	"usable_rows": 995,
	"completeness_ratio": 0.995
}
```

#### 5) Analysis Engine (Single Metric)

- **Method**: `POST`
- **Endpoint**: `/api/v1/analysis/run`
- **Body**: `multipart/form-data`
	- `file`: CSV file
	- `date_column`: string
	- `metric_column`: string
- **Response data**:

```json
{
	"trend": "up",
	"change_percent": 14.2,
	"volatility": "low",
	"start_value": 100.0,
	"end_value": 114.2
}
```

#### 6) Insights Generation

- **Method**: `POST`
- **Endpoint**: `/api/v1/insights/generate`
- **Body**: `multipart/form-data`
	- `file`: CSV file
	- `date_column`: string
	- `metric_columns`: comma-separated string (example: `revenue,profit`)
- **Response data**:

```json
{
	"dataset_type": "event_time_series",
	"metrics_analyzed": ["revenue", "profit"],
	"insights": {
		"revenue": {"summary": "...", "severity": "...", "confidence": 0.82, "explanation": "..."}
	}
}
```

#### 7) Dataset Type Detection

- **Method**: `POST`
- **Endpoint**: `/api/v1/detect/type`
- **Body**: `multipart/form-data`
	- `file`: CSV file
	- `date_column`: string
	- `metric_columns`: comma-separated string
- **Response data**:

```json
{
	"dataset_type": "event_time_series",
	"reasoning": {
		"rows": 1000,
		"unique_dates": 365,
		"metrics_checked": ["revenue", "profit"]
	}
}
```

#### 8) Unified Pipeline

- **Method**: `POST`
- **Endpoint**: `/api/v1/pipeline/run`
- **Body**: JSON

```json
{
	"source_type": "csv",
	"source_config": {"file_path": "app/data/orders.csv"},
	"date_column": "order_date",
	"metric_columns": ["revenue", "profit"]
}
```

- **Response data**:

```json
{
	"source_type": "csv",
	"dataset_type": "event_time_series",
	"metrics_analyzed": ["revenue", "profit"],
	"insights": {"revenue": {"summary": "..."}}
}
```

#### 9) Mock Data Endpoint

- **Method**: `GET`
- **Endpoint**: `/api/v1/mock-api`
- **Query Params**: None
- **Response data**: list of generated rows

```json
[
	{"order_date": "2024-01-01T00:00:00", "revenue": 742},
	{"order_date": "2024-01-02T00:00:00", "revenue": 318}
]
```

---

### V2 (Protected)

Base prefix: `/api/v2`

#### 1) Unified Ingestion + Analyze

- **Method**: `POST`
- **Endpoint**: `/api/v2/ingest-and-analyze/`
- **Auth**: Bearer token required
- **Body**: JSON

```json
{
	"source_type": "sql",
	"source_config": {"query": "SELECT * FROM orders"},
	"date_column": "order_date",
	"metric_columns": ["revenue", "profit"]
}
```

- **Response data**:

```json
{
	"version": "v2",
	"source_type": "sql",
	"dataset_type": "event_time_series",
	"metrics_analyzed": ["revenue", "profit"],
	"insights": {"revenue": {"summary": "..."}}
}
```

---

### V3 (Protected)

Base prefix: `/api/v3`

#### 1) Intelligent Ingestion + Analyze

- **Method**: `POST`
- **Endpoint**: `/api/v3/ingest-and-analyze`
- **Auth**: Bearer token required
- **Body**: JSON

```json
{
	"source_type": "csv",
	"source_config": {"file_path": "app/data/orders.csv"},
	"date_column": "order_date",
	"metric_columns": ["revenue", "profit"],
	"entity_column": "region"
}
```

`entity_column` is optional in request, but required for snapshot analysis.

- **Response data**:

```json
{
	"version": "v3",
	"dataset_type": "event_time_series",
	"metrics_analyzed": ["revenue", "profit"],
	"analysis_metadata": {
		"revenue": {
			"trend": "up",
			"slope": 1.234,
			"trend_strength": 0.012,
			"change_percent": 12.4,
			"volatility_score": 0.21,
			"anomaly_count": 3,
			"data_points": 365,
			"min_value": 100.0,
			"max_value": 900.0,
			"start_value": 100.0,
			"end_value": 112.4
		}
	},
	"executive_summary": {
		"overall_health": "growth",
		"health_score": 78,
		"risk_level": "medium",
		"stability": "moderate",
		"confidence_score": 0.82,
		"drivers": {
			"trend_strength": 1.234,
			"average_change_percent": 12.4,
			"volatility_level": 0.21,
			"anomaly_pressure": 3
		}
	},
	"execution_time_ms": 145.6
}
```

## Root Health Endpoint

`GET /`

Response:

```json
{
	"Smart Business Performance Analyzer is running successfully!"
}
```

## Notes

- CORS currently allows `http://localhost:5173`.
- V1 endpoints are public by design in current implementation.
- V2 and V3 endpoints are protected with `Depends(get_current_user)`.
