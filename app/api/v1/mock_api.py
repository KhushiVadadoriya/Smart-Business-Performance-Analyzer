from fastapi import APIRouter
import pandas as pd
import numpy as np

router = APIRouter(prefix="/mock", tags=["Mock API"])

@router.get("/large-dataset")
def generate_large_dataset():

    rows = 100_000

    df = pd.DataFrame({
        "order_date": pd.date_range("2022-01-01", periods=rows, freq="min"),
        "quantity": np.random.randint(1, 50, rows),
        "revenue": np.random.randint(100, 5000, rows),
        "region": np.random.choice(["North", "South", "East", "West"], rows)
    })

    return df.to_dict(orient="records")
