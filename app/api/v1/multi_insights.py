from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd

from app.services.analysis_engine import analyze_multiple_metrics
from app.services.insight_engine import generate_multi_metric_insights

router = APIRouter(
    prefix="/multi-insights",
    tags=["Multi-Metric Insights"]
)

@router.post("/generate")
def generate_multi_metric_insights_api(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    metric_columns: str = Form(...)
):
    # 1️⃣ Read CSV
    df = pd.read_csv(file.file)

    # 2️⃣ Parse metric columns (comma-separated)
    metrics = [m.strip() for m in metric_columns.split(",")]

    # 3️⃣ Validate columns exist
    missing = [m for m in metrics if m not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Metric columns not found: {missing}"
        )

    # 4️⃣ Convert date
    df[date_column] = pd.to_datetime(df[date_column], errors="coerce")

    # 5️⃣ Keep only valid numeric metrics
    numeric_metrics = [
        m for m in metrics if pd.api.types.is_numeric_dtype(df[m])
    ]

    if not numeric_metrics:
        raise HTTPException(
            status_code=400,
            detail="No numeric metric columns provided."
        )

    # 6️⃣ Prepare dataframe
    working_df = df[[date_column] + numeric_metrics].rename(
        columns={date_column: "date"}
    )

    # 7️⃣ Analyze + generate insights
    analysis = analyze_multiple_metrics(working_df, numeric_metrics)
    return generate_multi_metric_insights(analysis)
