from fastapi import APIRouter, UploadFile, File
import pandas as pd

from app.services.column_discovery import discover_columns
from app.schemas.columns import ColumnDiscoveryResponse

router = APIRouter(
    prefix="/columns",
    tags=["Column Discovery"]
)

@router.post(
    "/discover",
    response_model=ColumnDiscoveryResponse
)
def discover_dataset_columns(
    file: UploadFile = File(...)
):
    df = pd.read_csv(file.file)
    return discover_columns(df)
