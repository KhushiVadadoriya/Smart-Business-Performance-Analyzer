import pandas as pd
from typing import Optional
from fastapi import UploadFile

def preview_analysis_service(
    file: UploadFile,
    date_column: Optional[str] = None,
    metric_column: Optional[str] = None
):
    df = pd.read_csv(file.file)

    # Return raw preview, ignoring normalization checks to support snapshot entity workflows seamlessly.
    preview_df = df.head(5).fillna("")

    return {
        "preview": preview_df.to_dict(orient="records"),
        "total_rows": len(df)
    }
