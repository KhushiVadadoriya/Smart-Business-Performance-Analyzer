import pandas as pd

def analyze_time_series(df: pd.DataFrame):
    """
    Expects df with columns: ['date', 'metric']
    """

    df = df.sort_values("date")

    start_value = df["metric"].iloc[0]
    end_value = df["metric"].iloc[-1]

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

    # Volatility (std relative to mean)
    mean = df["metric"].mean()
    std = df["metric"].std()

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
