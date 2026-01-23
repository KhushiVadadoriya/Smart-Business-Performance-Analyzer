from fastapi import APIRouter, UploadFile, File, Form
import pandas as pd

from app.services.normalization import normalize_data
from app.schemas.analysis_engine import AnalysisResult
from app.services.analysis_engine import analyze_time_series

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis Engine"]
)

@router.post("/run", response_model=AnalysisResult)
def run_analysis(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    metric_column: str = Form(...)
):
    df = pd.read_csv(file.file)
    normalized_df = normalize_data(df, date_column, metric_column)
    return analyze_time_series(normalized_df)
