from pathlib import Path
from typing import Iterable


def public_delivery_paths(paths: Iterable[Path]) -> list[Path]:
    """Exclude repository directory placeholders that are not public assets."""
    return [path for path in paths if path.name != '.gitkeep']
