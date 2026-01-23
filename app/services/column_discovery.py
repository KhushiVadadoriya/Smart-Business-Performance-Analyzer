import pandas as pd

def discover_columns(df: pd.DataFrame):
    date_candidates = []
    metric_candidates = []
    categorical_candidates = []

    for column in df.columns:
        series = df[column]

        # Try datetime detection
        try:
            parsed = pd.to_datetime(series, errors="coerce")
            # Must have majority valid date
            if parsed.notna().sum() > 0.8 * len(series):
                # Exclude purely numeric columns (IDs, quantities)
                if pd.api.types.is_numeric_dtype(series):
                    pass
                else:
                    # Exclude low-variance timestamps (IDs disguised as dates)
                    if parsed.nunique() > 10:
                        date_candidates.append(column)
                        continue
        except Exception:
            pass

        # Numeric detection
        if pd.api.types.is_numeric_dtype(series):
            metric_candidates.append(column)
            continue

        # Categorical fallback
        categorical_candidates.append(column)

    return {
        "date_candidates": date_candidates,
        "metric_candidates": metric_candidates,
        "categorical_candidates": categorical_candidates
    }
