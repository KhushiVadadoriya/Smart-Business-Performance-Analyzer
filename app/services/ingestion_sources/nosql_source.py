import pandas as pd
from fastapi import HTTPException

from .base import BaseDataSource


class NoSQLDataSource(BaseDataSource):
    """
    Read-only NoSQL (MongoDB-style) data source.
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
            # ✅ Proper import with debug clarity
            try:
                from pymongo import MongoClient
            except ImportError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"pymongo import failed: {str(e)}. Install using: pip install pymongo"
                )

            # ✅ Connect to MongoDB
            client = MongoClient(self.connection_url)

            # Optional: test connection
            try:
                client.admin.command("ping")
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"MongoDB connection failed: {str(e)}"
                )

            db = client[self.database]
            collection = db[self.collection]

            # ✅ Fetch documents
            cursor = collection.find(self.query).limit(self.limit)
            docs = list(cursor)

            if not docs:
                raise HTTPException(
                    status_code=400,
                    detail="No documents found in collection."
                )

            # ✅ Remove MongoDB internal field
            for doc in docs:
                doc.pop("_id", None)

            # ✅ Convert to DataFrame
            df = pd.json_normalize(docs)

            if df.empty:
                raise HTTPException(
                    status_code=400,
                    detail="DataFrame is empty after normalization."
                )

            return df

        except HTTPException:
            raise

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"NoSQL read failed: {str(e)}"
            )