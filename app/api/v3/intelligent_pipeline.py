from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.orchestrator_v3 import run_v3_pipeline


router = APIRouter(
    prefix="",
    tags=["Version 3"]
)


class V3Request(BaseModel):
    source_type: str
    source_config: Dict[str, Any]
    date_column: str
    metric_columns: List[str]
    entity_column: Optional[str] = None


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