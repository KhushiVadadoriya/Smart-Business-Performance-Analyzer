import os

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'PostgreSQL://user:password@localhost:5432/smart_analyzer_db'
)