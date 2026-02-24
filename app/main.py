import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.upload import router as upload_router
from app.api.v1.analyze import router as analyze_router
from app.api.v1.columns import router as columns_router
from app.api.v1.quality import router as quality_router
from app.api.v1.analysis import router as analysis_engine_router
from app.api.v1.insights import router as insights_router
from app.api.v1.detect import router as detect_router
from app.api.v2.unified_ingestion import router as unified_ingestion_router
from app.api.v1.pipeline import router as pipeline_router
from app.api.v1.mock_api import router as mock_router
from app.api.v3.intelligent_pipeline import router as v3_router
from app.auth.routes import router as auth_router
from app.core.exceptions import StandardizedResponseMiddleware, register_exception_handlers
from app.core.security import get_current_user
from app.database import Base, engine
from app.auth.models import User  # noqa: F401


app = FastAPI(
    title='Smart Business Performance Analyzer',
    description='SaaS-based application for business insights',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(StandardizedResponseMiddleware)
register_exception_handlers(app)


@app.on_event("startup")
def create_tables() -> None:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        logging.warning("Could not initialize auth tables: %s", str(exc))

app.include_router(auth_router)

app.include_router(upload_router, prefix="/api/v1")
app.include_router(analyze_router, prefix="/api/v1")
app.include_router(columns_router, prefix="/api/v1")
app.include_router(quality_router, prefix="/api/v1")
app.include_router(analysis_engine_router, prefix="/api/v1")
app.include_router(insights_router, prefix="/api/v1")
app.include_router(detect_router, prefix="/api/v1")
app.include_router(
    unified_ingestion_router,
    prefix="/api/v2",
    dependencies=[Depends(get_current_user)],
)
app.include_router(pipeline_router, prefix="/api/v1")
app.include_router(mock_router, prefix="/api/v1")
app.include_router(
    v3_router,
    prefix="/api/v3",
    dependencies=[Depends(get_current_user)],
)

@app.get('/')
def read_root():
    return {
        'Smart Business Performance Analyzer is running successfully!'
    }

