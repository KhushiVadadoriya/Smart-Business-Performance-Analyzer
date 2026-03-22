from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.orchestrator_v3 import run_v3_pipeline
from app.services.ingestion import ingest_from_source
from app.services.column_discovery import discover_columns


router = APIRouter(
    prefix="",
    tags=["Version 3"]
)


class V3Request(BaseModel):
    source_type: str
    source_config: Dict[str, Any]
    date_column: Optional[str] = None
    metric_columns: List[str]
    entity_column: Optional[str] = None

class V3DiscoverRequest(BaseModel):
    source_type: str
    source_config: Dict[str, Any]


@router.post("/ingest-and-analyze")
def ingest_and_analyze_v3(request: V3Request):
    try:
        result = run_v3_pipeline(request)
        return result
    except HTTPException:
        raise
    except Exception as e:
        if "entity_column is required for snapshot analysis" in str(e):
            raise HTTPException(
                status_code=400,
                detail="Entity column is required for snapshot dataset."
            )
        raise HTTPException(status_code=400, detail=str(e))

class V3CSVRequest:
    def __init__(self, file: UploadFile, date_column: Optional[str], metric_columns: List[str], entity_column: Optional[str] = None):
        self.source_type = "csv"
        self.source_config = {"file": file}
        self.date_column = date_column
        self.metric_columns = metric_columns
        self.entity_column = entity_column

@router.post("/analyze-csv")
def analyze_csv_v3(
    file: UploadFile = File(...),
    date_column: Optional[str] = Form(None),
    metric_columns: str = Form(...),
    entity_column: Optional[str] = Form(None)
):
    try:
        metrics = [m.strip() for m in metric_columns.split(",") if m.strip()]
        req = V3CSVRequest(file, date_column, metrics, entity_column)
        result = run_v3_pipeline(req)
        return result
    except HTTPException:
        raise
    except Exception as e:
        if "entity_column is required" in str(e):
            raise HTTPException(
                status_code=400,
                detail="Entity column is required for snapshot dataset."
            )
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/discover")
def discover_columns_v3(request: V3DiscoverRequest):
    try:
        df = ingest_from_source(request.source_type, request.source_config)
        if df.empty:
            raise ValueError("No data returned from source")
        return discover_columns(df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
