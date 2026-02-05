import pandas as pd

def generate_snapshot_insights(df: pd.DataFrame, metrics: list[str]):
    insights = {}

    for col in metrics:
        series = df[col].dropna()

        if series.nunique() <= 2:
            rate = series.mean()
            insights[col] = {
                "summary": "Binary outcome distribution observed.",
                "severity": "high" if rate < 0.3 else "medium",
                "confidence": 0.8,
                "explanation": f"Positive rate is {rate:.2%}, indicating limited response."
            }
        else:
            mean = series.mean()
            median = series.median()

            insights[col] = {
                "summary": "Customer behavior shows uneven distribution.",
                "severity": "medium",
                "confidence": 0.7,
                "explanation": (
                    f"Average value is {mean:.2f} while median is {median:.2f}, "
                    "suggesting concentration among a subset of entities."
                )
            }

    return insights
