from fastapi import FastAPI
from app.routers.file_upload import router as file_router

app = FastAPI(title='Smart Business Performance Analyzer',
              description='SaaS-based application for business insights',
              version='1.0.0')

app.include_router(file_router)
@app.get('/')
def read_root():
    return{
        'Smart Business Performance Analyzer is running successfully!'
    }