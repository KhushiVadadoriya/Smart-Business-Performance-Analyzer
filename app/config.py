import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Khushi%401806@localhost:5432/smart_analyzer"
)