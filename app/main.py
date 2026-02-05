from fastapi import FastAPI
from app.api.v1.upload import router as upload_router
from app.api.v1.analyze import router as analyze_router
from app.api.v1.columns import router as columns_router
from app.api.v1.quality import router as quality_router
from app.api.v1.analysis import router as analysis_engine_router
from app.api.v1.insights import router as insights_router
from app.api.v1.detect import router as detect_router


app = FastAPI(
    title='Smart Business Performance Analyzer',
    description='SaaS-based application for business insights',
    version='1.0.0'
)

app.include_router(upload_router, prefix="/api/v1")
app.include_router(analyze_router, prefix="/api/v1")
app.include_router(columns_router, prefix="/api/v1")
app.include_router(quality_router, prefix="/api/v1")
app.include_router(analysis_engine_router, prefix="/api/v1")
app.include_router(insights_router, prefix="/api/v1")
app.include_router(detect_router, prefix="/api/v1")


@app.get('/')
def read_root():
    return {
        'Smart Business Performance Analyzer is running successfully!'
    }
