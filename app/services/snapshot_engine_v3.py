import pandas as pd
import numpy as np


def analyze_snapshot_v3(df: pd.DataFrame, metric: str, entity_column: str):
    """
    Advanced snapshot analysis with entity intelligence.
    """

    temp_df = df[[entity_column, metric]].dropna()

    grouped = (
        temp_df.groupby(entity_column)[metric]
        .sum()
        .sort_values(ascending=False)
    )

    values = grouped.values

    # Basic statistics
    mean = np.mean(values)
    median = np.median(values)
    variance = np.var(values)
    skewness = pd.Series(values).skew()

    # Top & Bottom entity
    top_entity = grouped.index[0]
    bottom_entity = grouped.index[-1]

    # Concentration ratio (Top 20%)
    top_n = max(1, int(0.2 * len(grouped)))
    concentration_ratio = grouped.head(top_n).sum() / grouped.sum()

    # Variance classification
    if variance > mean:
        variance_level = "high"
    elif variance > mean * 0.5:
        variance_level = "medium"
    else:
        variance_level = "low"

    # Dominance Index (Top entity contribution)
    dominance_index = grouped.iloc[0] / grouped.sum()

    # Spread Score (normalized variance)
    spread_score = variance / (mean + 1e-6)

    return {
        "mean": round(float(mean), 2),
        "median": round(float(median), 2),
        "variance_level": variance_level,
        "skewness": round(float(skewness), 3),
        "top_entity": top_entity,
        "bottom_entity": bottom_entity,
        "concentration_ratio": round(float(concentration_ratio), 3),
        "dominance_index": round(float(dominance_index), 3),
        "spread_score": round(float(spread_score), 3)
    }

def analyze_multiple_snapshot_v3(df: pd.DataFrame, metrics: list[str], entity_column: str):
    results = {}

    for metric in metrics:
        try:
            results[metric] = analyze_snapshot_v3(df, metric, entity_column)
        except Exception:
            results[metric] = {
                "error": f"Could not analyze metric: {metric}"
            }

    return results