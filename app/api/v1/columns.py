from fastapi import APIRouter, UploadFile, File
import pandas as pd
from app.services.column_discovery import discover_columns

router = APIRouter(
    prefix="/columns",
    tags=["Column Discovery"]
)

@router.post("/discover")
def discover_dataset_columns(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    return discover_columns(df)
