
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd

from app.services.dataset_type_detector import detect_dataset_type
from app.services.analysis_engine import analyze_multiple_metrics
from app.services.insight_engine import generate_multi_metric_insights
from app.services.snapshot_engine import generate_snapshot_insights

router = APIRouter(
    prefix="/insights",
    tags=["Insight Engine"]
)

@router.post("/generate")
def generate_insight_from_dataset(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    metric_columns: str = Form(...)
):
    # 1️⃣ Load CSV safely
    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file")

    metrics = [m.strip() for m in metric_columns.split(",")]

    # 2️⃣ Validate columns
    if date_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Date column ''{date_column}'' not found in dataset."
        )

    missing = [m for m in metrics if m not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Metric columns not found: {missing}"
        )

    # 3️⃣ Detect dataset type
    dataset_type = detect_dataset_type(df, date_column, metrics)

    # 4️⃣ Route intelligently
    if dataset_type == "event_time_series":
        df[date_column] = pd.to_datetime(df[date_column], errors="coerce")

        working_df = df[[date_column] + metrics].rename(
            columns={date_column: "date"}
        )

        analysis = analyze_multiple_metrics(working_df, metrics)

        response = {
            "dataset_type": dataset_type,
            "metrics_analyzed": metrics,
            **generate_multi_metric_insights(analysis)
}

        return response

    elif dataset_type == "snapshot_entity":
        insights = generate_snapshot_insights(df, metrics)

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported dataset type"
        )

    response = {
        "dataset_type": dataset_type,
        "metrics_analyzed": metrics,
        "insights": generate_snapshot_insights(df, metrics)
    }


    return response
