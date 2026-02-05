import pandas as pd

def detect_dataset_type(
    df: pd.DataFrame,
    date_column: str,
    metric_columns: list[str]
) -> str:
    """
    Returns:
        'time_series' or 'snapshot'
    """

    # 1️⃣ Convert date safely
    dates = pd.to_datetime(df[date_column], errors="coerce")

    total_rows = len(df)
    unique_dates = dates.nunique()

    # 2️⃣ Check if metrics are binary / static-like
    binary_metrics = 0
    for col in metric_columns:
        unique_vals = df[col].dropna().unique()
        if len(unique_vals) <= 2:
            binary_metrics += 1

    # 3️⃣ Heuristic rules
    if unique_dates < total_rows * 0.5:
        return "time_series"

    if binary_metrics >= len(metric_columns) / 2:
        return "snapshot"

    return "snapshot"
