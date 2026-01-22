from fastapi import APIRouter, UploadFile, File
import pandas as pd

from app.services.data_quality import assess_data_quality
from app.schemas.quality import DataQualityResponse

router = APIRouter(
    prefix="/quality",
    tags=["Data Quality"]
)

@router.post("/assess", response_model=DataQualityResponse)
def assess_quality(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    return assess_data_quality(df)
