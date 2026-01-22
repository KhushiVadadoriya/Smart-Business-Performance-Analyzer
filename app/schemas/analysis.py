from pydantic import BaseModel
from typing import List, Dict, Any

class PreviewAnalysisResponse(BaseModel):
    preview: List[Dict[str, Any]]
    total_rows: int
