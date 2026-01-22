from fastapi import APIRouter, UploadFile, File, Form
from app.services.analysis_service import preview_analysis_service

router = APIRouter(
    prefix="/analyze",
    tags=["Analysis"]
)

@router.post("/preview")
def preview_analysis(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    metric_column: str = Form(...)
):
    return preview_analysis_service(file, date_column, metric_column)
