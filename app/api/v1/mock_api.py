from fastapi import APIRouter
import pandas as pd
import numpy as np

router = APIRouter()

@router.get("/mock-api")
def generate_large_dataset():
    rows = 300

    df = pd.DataFrame({
        "order_date": pd.date_range("2024-01-01", periods=rows, freq="D"),
        "revenue": np.random.randint(100, 1000, size=rows)
    })

    return df.to_dict(orient="records")