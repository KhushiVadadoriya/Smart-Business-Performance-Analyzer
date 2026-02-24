# app/services/analysis_engine_v3.py

import pandas as pd
import numpy as np


def analyze_time_series_v3(df: pd.DataFrame):

    df = df.copy()

    # ✅ Daily granularity
    df["date"] = pd.to_datetime(df["date"]).dt.date

    # ✅ Aggregate per day
    daily_df = (
        df.groupby("date", as_index=False)["metric"]
        .sum()
        .sort_values("date")
    )

    if len(daily_df) < 2:
        raise ValueError("Not enough data points for trend analysis")

    x = np.arange(len(daily_df))
    y = daily_df["metric"].values.astype(float)

    # 🔹 Linear regression
    slope, intercept = np.polyfit(x, y, 1)

    start_value = y[0]
    end_value = y[-1]

    # 🔹 % Change
    if start_value == 0:
        change_percent = 0
    else:
        change_percent = ((end_value - start_value) / start_value) * 100

    # 🔹 Volatility (Coefficient of Variation)
    mean = np.mean(y)
    std = np.std(y)
    volatility_score = std / mean if mean != 0 else 0

    # 🔹 Normalized trend strength (scale-invariant)
    trend_strength = slope / (mean + 1e-6)

    # 🔹 IQR anomaly detection
    q1 = np.percentile(y, 25)
    q3 = np.percentile(y, 75)
    iqr = q3 - q1

    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr

    anomaly_mask = (y < lower) | (y > upper)
    anomaly_count = int(anomaly_mask.sum())

    # 🔹 Trend classification (safer)
    if abs(slope) < 1e-6:
        trend = "flat"
    elif slope > 0:
        trend = "up"
    else:
        trend = "down"

    return {
        "trend": trend,
        "slope": round(float(slope), 6),
        "trend_strength": round(float(trend_strength), 6),
        "change_percent": round(float(change_percent), 2),
        "volatility_score": round(float(volatility_score), 3),
        "anomaly_count": anomaly_count,
        "data_points": len(daily_df),
        "min_value": float(np.min(y)),
        "max_value": float(np.max(y)),
        "start_value": float(start_value),
        "end_value": float(end_value)
    }

def analyze_multiple_metrics_v3(df: pd.DataFrame, metrics: list[str]):
    results = {}

    for metric in metrics:
        try:
            temp_df = df[["date", metric]].rename(columns={metric: "metric"})
            results[metric] = analyze_time_series_v3(temp_df)
        except Exception:
            results[metric] = {
                "error": f"Could not analyze metric: {metric}"
            }

    return results