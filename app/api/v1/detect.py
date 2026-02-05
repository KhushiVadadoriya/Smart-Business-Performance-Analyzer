from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd

from app.services.dataset_type_detector import detect_dataset_type

router = APIRouter(
    prefix="/detect",
    tags=["Dataset Detection"]
)

@router.post("/type")
def detect_type(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    metric_columns: str = Form(...)
):
    df = pd.read_csv(file.file)

    metrics = [m.strip() for m in metric_columns.split(",")]

    # 🔒 VALIDATION — THIS IS WHAT YOU WERE MISSING
    if date_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Date column '{date_column}' not found in dataset."
        )

    missing_metrics = [m for m in metrics if m not in df.columns]
    if missing_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Metric columns not found: {missing_metrics}"
        )

    dataset_type = detect_dataset_type(df, date_column, metrics)

    return {
        "dataset_type": dataset_type,
        "reasoning": {
            "rows": len(df),
            "unique_dates": df[date_column].nunique(),
            "metrics_checked": metrics
        }
    }
