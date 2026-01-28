from fastapi import APIRouter, UploadFile, File, Form
import pandas as pd

from app.services.normalization import normalize_data
from app.services.analysis_engine import analyze_time_series
from app.services.insight_engine import generate_insight

router = APIRouter(
    prefix="/insights",
    tags=["Insight Engine"]
)

@router.post("/generate")
def generate_insight_from_dataset(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    metric_column: str = Form(...)
):
    df = pd.read_csv(file.file)
    normalized_df = normalize_data(df, date_column, metric_column)
    analysis = analyze_time_series(normalized_df)
    return generate_insight(analysis)

