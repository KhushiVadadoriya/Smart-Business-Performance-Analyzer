from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List

import pandas as pd

from app.services.ingestion import ingest_from_source
from app.services.dataset_type_detector import detect_dataset_type
from app.services.analysis_engine import analyze_multiple_metrics
from app.services.insight_engine import generate_multi_metric_insights
from app.services.snapshot_engine import generate_snapshot_insights


router = APIRouter(
    prefix="/ingest-and-analyze",
    tags=["Unified Ingestion (V2)"]
)


class UnifiedIngestionRequest(BaseModel):
    source_type: str                 # csv | sql | api | nosql
    source_config: Dict[str, Any]    # source-specific config
    date_column: str
    metric_columns: List[str]


@router.post("/")
def ingest_and_analyze(request: UnifiedIngestionRequest):
    # 1️⃣ Ingest data from selected source
    try:
        df = ingest_from_source(
            source_type=request.source_type,
            source_config=request.source_config
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2️⃣ Validate columns
    metrics = request.metric_columns

    if request.date_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Date column '{request.date_column}' not found."
        )

    missing = [m for m in metrics if m not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Metric columns not found: {missing}"
        )

    # 3️⃣ Detect dataset type
    dataset_type = detect_dataset_type(
        df,
        request.date_column,
        metrics
    )

    # 4️⃣ Route intelligently (same logic as V1)
    if dataset_type == "event_time_series":
        df[request.date_column] = pd.to_datetime(
            df[request.date_column],
            errors="coerce"
        )

        working_df = df[
            [request.date_column] + metrics
        ].rename(columns={request.date_column: "date"})

        analysis = analyze_multiple_metrics(
            working_df,
            metrics
        )

        insights = generate_multi_metric_insights(analysis)

    elif dataset_type == "snapshot_entity":
        insights = generate_snapshot_insights(df, metrics)

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported dataset type"
        )

    # 5️⃣ Unified response
    return {
        "version": "v2",
        "source_type": request.source_type,
        "dataset_type": dataset_type,
        "metrics_analyzed": metrics,
        "insights": insights
    }
