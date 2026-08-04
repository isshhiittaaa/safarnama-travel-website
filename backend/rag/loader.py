from pathlib import Path

import pandas as pd

from config.settings import PROCESSED_DATA_DIR


class CSVLoader:
    """
    Loads all processed CSV datasets grouped by city.

    Returns:
    {
        "varanasi": {
            "attractions": DataFrame,
            "hotels": DataFrame,
            ...
        },
        "jaipur": {
            ...
        }
    }
    """

    def __init__(self, data_dir: Path = PROCESSED_DATA_DIR):
        self.data_dir = data_dir

    def load_all(self) -> dict:

        city_datasets = {}

        # Iterate through each city folder
        for city_folder in self.data_dir.iterdir():

            if not city_folder.is_dir():
                continue

            city_name = city_folder.name.lower()

            datasets = {}

            for csv_file in city_folder.glob("*.csv"):

                dataset_name = csv_file.stem.lower()

                datasets[dataset_name] = pd.read_csv(csv_file)

            city_datasets[city_name] = datasets

        return city_datasets