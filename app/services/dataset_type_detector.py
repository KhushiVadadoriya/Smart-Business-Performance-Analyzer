import pandas as pd

SUMMABLE_KEYWORDS = [
    "quantity", "amount", "sales", "revenue", "price", "count", "units"
]


def is_summable_metric(column_name: str) -> bool:
    name = column_name.lower()
    return any(k in name for k in SUMMABLE_KEYWORDS)


def detect_dataset_type(df, date_column, metric_columns):

    # 🔹 If metric name suggests summable AND valid date column exists → time-series
    for col in metric_columns:
        if is_summable_metric(col):
            if date_column and date_column in df.columns:
                try:
                    pd.to_datetime(df[date_column], errors="raise")
                    return "event_time_series"
                except Exception:
                    pass

    # 🔹 Otherwise treat as snapshot
    return "snapshot_entity"