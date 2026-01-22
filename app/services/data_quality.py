import pandas as pd

def assess_data_quality(df: pd.DataFrame):
    total_rows = len(df)

    # Null counts per column
    null_counts = df.isnull().sum().to_dict()

    # Duplicate rows
    duplicate_rows = df.duplicated().sum()

    # Overall completeness
    rows_with_any_null = df.isnull().any(axis=1).sum()
    usable_rows = total_rows - rows_with_any_null

    completeness_ratio = (
        usable_rows / total_rows if total_rows > 0 else 0
    )

    return {
        "total_rows": total_rows,
        "null_counts": null_counts,
        "duplicate_rows": duplicate_rows,
        "rows_with_any_null": rows_with_any_null,
        "usable_rows": usable_rows,
        "completeness_ratio": round(completeness_ratio, 3)
    }
