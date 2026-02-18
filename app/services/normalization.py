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

def normalize_dataset(
    df: pd.DataFrame,
    date_column: str,
    metric_columns: list[str]
):
    if date_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Date column '{date_column}' not found"
        )

    missing = [m for m in metric_columns if m not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Metric columns not found: {missing}"
        )

    normalized_df = df[[date_column] + metric_columns].copy()

    # Parse date
    normalized_df[date_column] = pd.to_datetime(
        normalized_df[date_column], errors="coerce"
    )

    # Parse metrics
    for m in metric_columns:
        normalized_df[m] = pd.to_numeric(
            normalized_df[m], errors="coerce"
        )

    # Drop invalid rows
    normalized_df = normalized_df.dropna(
        subset=[date_column] + metric_columns
    )

    # Rename date → canonical
    normalized_df = normalized_df.rename(
        columns={date_column: "date"}
    )

    return normalized_df
