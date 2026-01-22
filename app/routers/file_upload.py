from fastapi import APIRouter, UploadFile, File
from app.services.ingestion import ingest_csv

router = APIRouter(prefix="/upload", tags=["File Upload"])


@router.post("/csv")
def upload_csv(file: UploadFile = File(...)):
    return ingest_csv(file)
