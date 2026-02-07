import pandas as pd
from fastapi import UploadFile, HTTPException

from .base import BaseDataSource


class CSVDataSource(BaseDataSource):
    def __init__(self, file: UploadFile):
        self.file = file

    def fetch(self) -> pd.DataFrame:
        try:
            return pd.read_csv(self.file.file)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid CSV file"
            )
