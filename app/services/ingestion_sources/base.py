from abc import ABC, abstractmethod
import pandas as pd


class BaseDataSource(ABC):
    """
    Abstract base class for all data sources in Version 2.
    Every data source must return a pandas DataFrame.
    """

    @abstractmethod
    def fetch(self) -> pd.DataFrame:
        """
        Fetch data from the source and return it as a DataFrame.
        """
        pass
