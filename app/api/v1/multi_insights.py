from fastapi import APIRouter, UploadFile, File, Form
import pandas as pd
from typing import List

from app.services.normalization import normalize_data
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
    metric_columns: List[str] = Form(...)
):
    df = pd.read_csv(file.file)
    df[date_column] = pd.to_datetime(df[date_column])

    normalized_df = df[[date_column] + metric_columns]
    normalized_df = normalized_df.rename(columns={date_column: "date"})

    analysis = analyze_multiple_metrics(normalized_df, metric_columns)
    return generate_multi_metric_insights(analysis)
