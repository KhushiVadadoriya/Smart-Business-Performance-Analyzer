from fastapi import APIRouter, UploadFile, File, Form
import pandas as pd
from app.services.normalization import normalize_data

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("/preview")
def preview_analysis(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    metric_column: str = Form(...)
):
    df = pd.read_csv(file.file)
    normalized_df = normalize_data(df, date_column, metric_column)

    return {
        "preview": normalized_df.head(5).to_dict(orient="records"),
        "total_rows": len(normalized_df)
    }
