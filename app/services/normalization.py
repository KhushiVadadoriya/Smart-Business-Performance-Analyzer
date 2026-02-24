import pandas as pd
from fastapi import HTTPException


def normalize_dataset(df: pd.DataFrame, date_col: str, metric_cols: list[str]):
    if date_col not in df.columns:
        raise HTTPException(
            status_code=400,
            detail="Selected date column not found in data"
        )

    missing_metric_cols = [column for column in metric_cols if column not in df.columns]
    if missing_metric_cols:
        raise HTTPException(
            status_code=400,
            detail=f"Selected metric columns not found in data: {missing_metric_cols}"
        )

    selected_cols = [date_col] + metric_cols
    normalized_df = df[selected_cols].copy()
    normalized_df = normalized_df.rename(columns={date_col: "date"})

    try:
        normalized_df["date"] = pd.to_datetime(normalized_df["date"])
        for metric_col in metric_cols:
            normalized_df[metric_col] = pd.to_numeric(normalized_df[metric_col])
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid data types for date or metric columns"
        )

    return normalized_df


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
