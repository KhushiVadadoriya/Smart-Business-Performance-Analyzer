from pydantic import BaseModel

class InsightResponse(BaseModel):
    summary: str
    severity: str
    confidence: float
    explanation: str
