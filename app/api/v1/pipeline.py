from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.services.ingestion import ingest_from_source
from app.services.normalization import normalize_dataset
from app.services.dataset_type_detector import detect_dataset_type
from app.services.analysis_engine import analyze_multiple_metrics
from app.services.insight_engine import generate_multi_metric_insights
from app.services.snapshot_engine import generate_snapshot_insights


router = APIRouter(
    prefix="/pipeline",
    tags=["Unified Pipeline"]
)


# ✅ DEFINE REQUEST MODEL FIRST
class PipelineRequest(BaseModel):
    source_type: str                 # csv | sql | api | nosql
    source_config: Dict[str, Any]
    date_column: Optional[str] = None
    metric_columns: List[str]


# ✅ THEN DEFINE THE ENDPOINT
@router.post("/run")
def run_unified_pipeline(request: PipelineRequest):
    # 1️⃣ Ingest
    df = ingest_from_source(
        source_type=request.source_type,
        source_config=request.source_config
    )

    if df.empty:
        raise HTTPException(status_code=400, detail="No data returned from source")

    # 2️⃣ Normalize
    if request.date_column:
        normalized_df = normalize_dataset(
            df,
            request.date_column,
            request.metric_columns
        )
        detected_date_column = "date"
    else:
        normalized_df = df
        detected_date_column = None

    # 3️⃣ Detect dataset type
    if not detected_date_column:
        raise HTTPException(
            status_code=400,
            detail="date_column is required for unified pipeline"
        )

    dataset_type = detect_dataset_type(
        normalized_df,
        detected_date_column,
        request.metric_columns
    )

    # 4️⃣ Analyze
    if dataset_type == "event_time_series":
        analysis = analyze_multiple_metrics(
            normalized_df,
            request.metric_columns
        )
        insights = generate_multi_metric_insights(analysis)

    elif dataset_type == "snapshot_entity":
        insights = generate_snapshot_insights(
            normalized_df,
            request.metric_columns
        )

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported dataset type: {dataset_type}"
        )

    # 5️⃣ Response
    return {
        "source_type": request.source_type,
        "dataset_type": dataset_type,
        "metrics_analyzed": request.metric_columns,
        "insights": insights
    }
