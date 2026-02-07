import pandas as pd
from sqlalchemy import create_engine, text
from fastapi import HTTPException

from .base import BaseDataSource


class SQLDataSource(BaseDataSource):
    """
    Read-only relational database source.
    Supports SELECT queries only.
    """

    def __init__(self, connection_url: str, query: str):
        self.connection_url = connection_url
        self.query = query

        # basic safety check
        if not query.strip().lower().startswith("select"):
            raise HTTPException(
                status_code=400,
                detail="Only SELECT queries are allowed (read-only access)."
            )

    def fetch(self) -> pd.DataFrame:
        try:
            engine = create_engine(self.connection_url)

            with engine.connect() as connection:
                result = connection.execute(text(self.query))
                df = pd.DataFrame(result.fetchall(), columns=result.keys())

            return df

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Database read failed: {str(e)}"
            )
