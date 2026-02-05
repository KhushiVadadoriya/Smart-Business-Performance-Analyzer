import pandas as pd

def analyze_time_series(df: pd.DataFrame):
    """
    Expects df with columns: ['date', 'metric']
    """

    # 🔑 Normalize datetime → date (daily granularity)
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"]).dt.date

    # 🔑 Aggregate metric per day
    daily_df = (
        df
        .groupby("date", as_index=False)["metric"]
        .sum()
        .sort_values("date")
    )

    start_value = daily_df["metric"].iloc[0]
    end_value = daily_df["metric"].iloc[-1]

    # Percentage change
    if start_value == 0:
        change_percent = 0.0
    else:
        change_percent = ((end_value - start_value) / start_value) * 100

    # Trend
    if change_percent > 5:
        trend = "up"
    elif change_percent < -5:
        trend = "down"
    else:
        trend = "flat"

    # Volatility
    mean = daily_df["metric"].mean()
    std = daily_df["metric"].std()

    if mean == 0:
        volatility = "low"
    elif std / mean > 0.5:
        volatility = "high"
    elif std / mean > 0.2:
        volatility = "medium"
    else:
        volatility = "low"

    return {
        "trend": trend,
        "change_percent": round(change_percent, 2),
        "volatility": volatility,
        "start_value": float(start_value),
        "end_value": float(end_value)
    }

def analyze_multiple_metrics(df: pd.DataFrame, metrics: list[str]):
    results = {}

    for metric in metrics:
        try:
            temp_df = df[["date", metric]].rename(columns={metric: "metric"})
            results[metric] = analyze_time_series(temp_df)
        except Exception as e:
            results[metric] = {
                "error": f"Could not analyze metric: {metric}"
            }

    return results

