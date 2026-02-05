import pandas as pd

SUMMABLE_KEYWORDS = [
    "quantity", "amount", "sales", "revenue", "price", "count", "units"
]

def is_summable_metric(column_name: str) -> bool:
    name = column_name.lower()
    return any(k in name for k in SUMMABLE_KEYWORDS)

def detect_dataset_type(df, date_column, metric_columns):
    # 1️⃣ Date must exist
    dates = pd.to_datetime(df[date_column], errors="coerce")

    # 2️⃣ EVENT TIME-SERIES OVERRIDE (CRITICAL)
    # If any metric is summable AND date exists → event_time_series
    for col in metric_columns:
        if is_summable_metric(col):
            return "event_time_series"

    # 3️⃣ Snapshot signals (binary / attributes)
    binary_metrics = 0
    for col in metric_columns:
        unique_vals = df[col].dropna().unique()
        if len(unique_vals) <= 2:
            binary_metrics += 1

    if binary_metrics >= 1:
        return "snapshot_entity"

    # 4️⃣ Safe default
    return "snapshot_entity"
