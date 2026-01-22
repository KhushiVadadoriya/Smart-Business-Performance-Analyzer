import pandas as pd
from fastapi import UploadFile
from app.services.normalization import normalize_data

def preview_analysis_service(
    file: UploadFile,
    date_column: str,
    metric_column: str
):
    df = pd.read_csv(file.file)
    normalized_df = normalize_data(df, date_column, metric_column)

    return {
        "preview": normalized_df.head(5).to_dict(orient="records"),
        "total_rows": len(normalized_df)
    }
