import pandas as pd


class CSVDataSource:

    def __init__(self, file=None, file_path=None):
        self.file = file
        self.file_path = file_path

    def fetch(self):

        if self.file:
            return pd.read_csv(self.file.file)

        elif self.file_path:
            return pd.read_csv(self.file_path)

        else:
            raise ValueError("Either file or file_path must be provided")