import time
import math
from typing import Dict, Any
import numpy as np

from app.services.ingestion import ingest_from_source
from app.services.normalization import normalize_dataset
from app.services.dataset_type_detector import detect_dataset_type
from app.services.analysis_engine_v3 import analyze_multiple_metrics_v3
from app.services.snapshot_engine_v3 import analyze_multiple_snapshot_v3
from app.services.executive_summary_v3 import generate_executive_summary_v3


def run_v3_pipeline(request) -> Dict[str, Any]:

    start_time = time.time()

    # 1️⃣ Ingest
    df = ingest_from_source(
        source_type=request.source_type,
        source_config=request.source_config
    )

    if df.empty:
        raise ValueError("No data returned from source")

    # 2️⃣ Detect dataset type FIRST
    dataset_type = detect_dataset_type(
        df,
        request.date_column,
        request.metric_columns
    )

    # 3️⃣ Normalize only if time-series
    if dataset_type == "event_time_series":
        normalized_df = normalize_dataset(
            df,
            request.date_column,
            request.metric_columns
        )
    else:
        normalized_df = df.copy()

    # 4️⃣ Analysis
    if dataset_type == "event_time_series":

        analysis_results = analyze_multiple_metrics_v3(
            normalized_df,
            request.metric_columns
        )

    elif dataset_type == "snapshot_entity":

        if not request.entity_column:
            raise ValueError("entity_column is required for snapshot analysis")

        analysis_results = analyze_multiple_snapshot_v3(
            normalized_df,
            request.metric_columns,
            request.entity_column
        )

    else:
        raise ValueError("Unsupported dataset type")

    # 5️⃣ Executive Summary
    executive_summary = generate_executive_summary_v3(
        dataset_type,
        analysis_results
    )

    execution_time_ms = round((time.time() - start_time) * 1000, 2)
    result = {
        "version": "v3",
        "dataset_type": dataset_type,
        "metrics_analyzed": request.metric_columns,
        "analysis_metadata": analysis_results,
        "executive_summary": executive_summary,
        "execution_time_ms": execution_time_ms
    }

    # Recursive sanitizer to replace NaN/Inf (which json.dumps rejects) with None
    def sanitize(obj):
        if isinstance(obj, float):
            if not math.isfinite(obj):
                return None
            return obj
        if isinstance(obj, (np.floating, np.integer)):
            val = obj.item()
            if isinstance(val, float) and not math.isfinite(val):
                return None
            return val
        if isinstance(obj, dict):
            return {k: sanitize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [sanitize(v) for v in obj]
        if isinstance(obj, tuple):
            return tuple(sanitize(v) for v in obj)
        return obj

    return sanitize(result)