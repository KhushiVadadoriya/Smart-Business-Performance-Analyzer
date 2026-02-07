import pandas as pd
from fastapi import HTTPException
from pymongo import MongoClient

from .base import BaseDataSource


class NoSQLDataSource(BaseDataSource):
    """
    Read-only NoSQL (MongoDB-style) data source.
    Fetches documents and flattens them into a DataFrame.
    """

    def __init__(
        self,
        connection_url: str,
        database: str,
        collection: str,
        query: dict | None = None,
        limit: int = 1000
    ):
        self.connection_url = connection_url
        self.database = database
        self.collection = collection
        self.query = query or {}
        self.limit = limit

    def fetch(self) -> pd.DataFrame:
        try:
            client = MongoClient(self.connection_url)
            db = client[self.database]
            collection = db[self.collection]

            cursor = collection.find(self.query).limit(self.limit)
            docs = list(cursor)

            if not docs:
                raise HTTPException(
                    status_code=400,
                    detail="No documents found in collection."
                )

            # Remove MongoDB internal ID
            for doc in docs:
                doc.pop("_id", None)

            df = pd.json_normalize(docs)
            return df

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"NoSQL read failed: {str(e)}"
            )
