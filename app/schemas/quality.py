from pydantic import BaseModel
from typing import Dict

class DataQualityResponse(BaseModel):
    total_rows: int
    null_counts: Dict[str, int]
    duplicate_rows: int
    rows_with_any_null: int
    usable_rows: int
    completeness_ratio: float

