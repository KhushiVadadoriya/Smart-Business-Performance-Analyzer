from pydantic import BaseModel

class AnalysisResult(BaseModel):
    trend: str
    change_percent: float
    volatility: str
    start_value: float
    end_value: float
