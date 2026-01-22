from fastapi import FastAPI
from app.api.v1.upload import router as upload_router

app = FastAPI(
    title='Smart Business Performance Analyzer',
    description='SaaS-based application for business insights',
    version='1.0.0'
)

app.include_router(upload_router, prefix="/api/v1")

@app.get('/')
def read_root():
    return {
        'Smart Business Performance Analyzer is running successfully!'
    }
