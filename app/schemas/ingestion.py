from pydantic import BaseModel
from typing import List

class IngestionResponse(BaseModel):
    filename: str
    rows: int
    columns: int
    column_names: List[str]
