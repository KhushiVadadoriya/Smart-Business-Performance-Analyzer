from pydantic import BaseModel
from typing import List

class ColumnDiscoveryResponse(BaseModel):
    date_candidates: List[str]
    metric_candidates: List[str]
    categorical_candidates: List[str]

