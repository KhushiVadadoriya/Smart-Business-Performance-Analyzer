from fastapi import APIRouter, UploadFile, File
from app.services.ingestion import ingest_csv
from app.schemas.ingestion import IngestionResponse

router = APIRouter(
    prefix="/upload",
    tags=["File Upload"]
)

@router.post("/csv", response_model=IngestionResponse)
def upload_csv(file: UploadFile = File(...)):
    return ingest_csv(file)
