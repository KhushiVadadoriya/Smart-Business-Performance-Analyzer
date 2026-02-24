import numpy as np


def generate_executive_summary_v3(dataset_type: str, analysis_metadata: dict):

    summary = {
        "overall_health": None,
        "health_score": 75,
        "risk_level": None,
        "stability": None,
        "confidence_score": None,
        "drivers": {}
    }

    # =========================================================
    # 🔷 TIME-SERIES
    # =========================================================
    if dataset_type == "event_time_series":

        slopes = []
        volatility_scores = []
        anomaly_counts = []
        change_percents = []

        for data in analysis_metadata.values():
            slopes.append(data.get("slope", 0))
            volatility_scores.append(data.get("volatility_score", 0))
            anomaly_counts.append(data.get("anomaly_count", 0))
            change_percents.append(data.get("change_percent", 0))

        avg_slope = np.mean(slopes)
        avg_volatility = np.mean(volatility_scores)
        total_anomalies = sum(anomaly_counts)
        avg_change = np.mean(change_percents)

        # 🔹 Health Score (0–100)
        health_score = 70

        if avg_slope > 0:
            health_score += 10
        else:
            health_score -= 15

        health_score -= min(total_anomalies * 2, 15)
        health_score -= int(avg_volatility * 20)

        health_score = max(0, min(100, health_score))
        summary["health_score"] = health_score

        # 🔹 Overall Health
        summary["overall_health"] = (
            "growth" if avg_slope > 0 else "decline"
        )

        # 🔹 Risk
        if avg_volatility > 0.5 or total_anomalies > 3:
            summary["risk_level"] = "high"
        elif avg_volatility > 0.3:
            summary["risk_level"] = "medium"
        else:
            summary["risk_level"] = "low"

        # 🔹 Stability
        if avg_volatility > 0.4:
            summary["stability"] = "unstable"
        elif avg_volatility > 0.2:
            summary["stability"] = "moderate"
        else:
            summary["stability"] = "stable"

        # 🔹 Confidence
        confidence = 1 - avg_volatility
        confidence -= min(total_anomalies * 0.05, 0.2)
        summary["confidence_score"] = round(max(0, min(1, confidence)), 2)

        # 🔹 Drivers
        summary["drivers"] = {
            "trend_strength": round(float(avg_slope), 4),
            "average_change_percent": round(float(avg_change), 2),
            "volatility_level": round(float(avg_volatility), 3),
            "anomaly_pressure": total_anomalies
        }

    # =========================================================
    # 🔷 SNAPSHOT
    # =========================================================
    elif dataset_type == "snapshot_entity":

        concentration_scores = []
        dominance_scores = []

        for data in analysis_metadata.values():
            concentration_scores.append(data.get("concentration_ratio", 0))
            dominance_scores.append(data.get("dominance_index", 0))

        avg_concentration = np.mean(concentration_scores)
        avg_dominance = np.mean(dominance_scores)

        # 🔹 Health Score
        health_score = 80
        health_score -= int(avg_concentration * 40)
        health_score -= int(avg_dominance * 20)

        health_score = max(0, min(100, health_score))
        summary["health_score"] = health_score

        # 🔹 Overall Health
        if avg_concentration > 0.6:
            summary["overall_health"] = "concentrated"
            summary["risk_level"] = "high"
        elif avg_concentration > 0.4:
            summary["overall_health"] = "imbalanced"
            summary["risk_level"] = "medium"
        else:
            summary["overall_health"] = "balanced"
            summary["risk_level"] = "low"

        summary["stability"] = "distribution_based"

        # 🔹 Confidence
        summary["confidence_score"] = round(1 - avg_concentration, 2)

        # 🔹 Drivers
        summary["drivers"] = {
            "concentration_ratio": round(float(avg_concentration), 3),
            "dominance_index": round(float(avg_dominance), 3)
        }

    return summary