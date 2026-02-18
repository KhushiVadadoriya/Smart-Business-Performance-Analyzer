import pandas as pd
from fastapi import HTTPException


class CSVDataSource:
    def __init__(self, file: str):
        self.file = file

    def fetch(self):
        try:
            return pd.read_csv(self.file)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid CSV file: {str(e)}"
            )
