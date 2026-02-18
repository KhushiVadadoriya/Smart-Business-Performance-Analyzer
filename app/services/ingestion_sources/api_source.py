import requests
import pandas as pd
from fastapi import HTTPException

from .base import BaseDataSource


class APIDataSource(BaseDataSource):
    """
    Read-only REST API data source.
    Fetches JSON data and converts it to a DataFrame.
    """

    def __init__(
        self,
        url: str,
        headers: dict | None = None,
        params: dict | None = None,
        data_key: str | None = None,
        timeout: int = 10
    ):
        self.url = url
        self.headers = headers or {}
        self.params = params or {}
        self.data_key = data_key
        self.timeout = timeout

    def fetch(self) -> pd.DataFrame:
        try:
            response = requests.get(
                self.url,
                headers=self.headers,
                params=self.params,
                timeout=self.timeout
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"API request failed with status {response.status_code}"
                )

            data = response.json()

            # Handle APIs that wrap data inside a key
            if self.data_key:
                data = data.get(self.data_key, [])

            if not isinstance(data, list):
                raise HTTPException(
                    status_code=400,
                    detail="API response is not a list of records"
                )

            df = pd.json_normalize(data)
            return df

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=400,
                detail=f"API request error: {str(e)}"
            )
