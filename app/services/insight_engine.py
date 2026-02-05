def generate_insight(analysis_result: dict):
    trend = analysis_result["trend"]
    change = abs(analysis_result["change_percent"])
    volatility = analysis_result["volatility"]

    # ---- SEVERITY ----
    if change > 50:
        severity = "high"
    elif change > 20:
        severity = "medium"
    else:
        severity = "low"

    # ---- CONFIDENCE ----
    if volatility == "low":
        confidence = 0.9
    elif volatility == "medium":
        confidence = 0.75
    else:
        confidence = 0.6

    # ---- SUMMARY ----
    if trend == "down":
        summary = "Performance declined over the observed period."
    elif trend == "up":
        summary = "Performance improved over the observed period."
    else:
        summary = "Performance remained relatively stable over the observed period."

    # ---- EXPLANATION ----
    explanation = (
        f"The metric changed by {analysis_result['change_percent']}% "
        f"from {analysis_result['start_value']} to {analysis_result['end_value']}. "
        f"Volatility during this period was classified as {volatility}."
    )

    return {
        "summary": summary,
        "severity": severity,
        "confidence": confidence,
        "explanation": explanation
    }

def generate_multi_metric_insights(analysis_results: dict):
    insights = {}

    for metric, analysis in analysis_results.items():
        insights[metric] = generate_insight(analysis)

    return insights
