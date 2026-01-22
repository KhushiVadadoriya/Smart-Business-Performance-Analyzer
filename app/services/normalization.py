import pandas as pd
from fastapi import HTTPException


def normalize_data(df: pd.DataFrame, date_col: str, metric_col: str):
    if date_col not in df.columns or metric_col not in df.columns:
        raise HTTPException(
            status_code=400,
            detail="Selected columns not found in data"
        )

    normalized_df = df[[date_col, metric_col]].copy()
    normalized_df.columns = ["date", "metric"]

    try:
        normalized_df["date"] = pd.to_datetime(normalized_df["date"])
        normalized_df["metric"] = pd.to_numeric(normalized_df["metric"])
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid data types for date or metric"
        )

    return normalized_df
