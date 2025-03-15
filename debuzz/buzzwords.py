import csv
from os import PathLike
from pathlib import Path


class BuzzwordChecker:
    def __init__(self, words: dict[str, int]):
        self.words = words.copy()

    @classmethod
    def from_csv(cls, path: PathLike[str]):
        file_path = Path(path).resolve()
        with file_path.open() as file:
            return cls({row[0]: int(row[1]) for row in csv.reader(file)})
