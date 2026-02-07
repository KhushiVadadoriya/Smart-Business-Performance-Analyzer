import pandas as pd
from fastapi import UploadFile, HTTPException
from app.services.ingestion_sources.nosql_source import NoSQLDataSource
from app.services.ingestion_sources.csv_source import CSVDataSource
from app.services.ingestion_sources.sql_source import SQLDataSource
from app.services.ingestion_sources.api_source import APIDataSource

def ingest_csv(file: UploadFile):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file")

    return {
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": df.columns.tolist()
    }




def ingest_from_source(source_type: str, source_config: dict):
    """
    Unified ingestion entry point (Version 2).
    Returns a pandas DataFrame.
    """

    if source_type == "csv":
        source = CSVDataSource(
            file=source_config["file"]
        )

    elif source_type == "sql":
        source = SQLDataSource(
            connection_url=source_config["connection_url"],
            query=source_config["query"]
        )

    elif source_type == "nosql":
        source = NoSQLDataSource(
            connection_url=source_config["connection_url"],
            database=source_config["database"],
            collection=source_config["collection"],
            query=source_config.get("query"),
            limit=source_config.get("limit", 1000)
        )

    elif source_type == "api":
        source = APIDataSource(
            url=source_config["url"],
            headers=source_config.get("headers"),
            params=source_config.get("params"),
            data_key=source_config.get("data_key"),
            timeout=source_config.get("timeout", 10)
        )

    else:
        raise ValueError(f"Unsupported source type: {source_type}")

    return source.fetch()
