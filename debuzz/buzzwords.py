import csv
from pathlib import Path


class BuzzwordChecker:
    def __init__(self, words: dict[str, int]):
        self.words = list(words.keys())
        self.frequencies = words.copy()

    @classmethod
    def from_csv(cls, path: str | Path):
        file_path = Path(path).resolve()
        with file_path.open() as file:
            return cls({row['word']: int(row['count']) for row in csv.DictReader(file)})

    def check(self, word: str, count_threshold: int | None = None, freq_threshold: int | None = None) -> bool:
        return (
            word in self.words
            and (
                count_threshold is None
                or self.words.index(word) < count_threshold
            )
            and (
                freq_threshold is None
                or self.frequencies[word] < freq_threshold
            )
        )
