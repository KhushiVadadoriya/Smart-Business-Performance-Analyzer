from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

router = APIRouter(prefix="/upload", tags=["File Upload"])


@router.post("/csv")
def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file")

    return {
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": df.columns.tolist()
    }
