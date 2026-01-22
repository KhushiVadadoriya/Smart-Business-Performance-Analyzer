from fastapi import APIRouter, UploadFile, File, Form
from app.services.analysis_service import preview_analysis_service
from app.schemas.analysis import PreviewAnalysisResponse

router = APIRouter(
    prefix="/analyze",
    tags=["Analysis"]
)

@router.post("/preview", response_model=PreviewAnalysisResponse)
def preview_analysis(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    metric_column: str = Form(...)
):
    return preview_analysis_service(file, date_column, metric_column)
