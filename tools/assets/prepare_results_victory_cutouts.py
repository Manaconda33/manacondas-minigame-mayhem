#!/usr/bin/env python3
"""Build AA-10–12 Results cutouts from the approved RGB source renders."""

from __future__ import annotations

import argparse
from collections import deque
import hashlib
from pathlib import Path

import numpy as np
from PIL import Image


GREEN = np.array([0, 255, 0], dtype=np.uint8)
SIZE = (1024, 1536)
ASSETS = {
    "aa-10": {
        "source": "Krios's Triumphant Victory Roar.png",
        "source_sha256": "1b5793085436c015862606c27f930438683a3c29243fdc1220e780a0614999a4",
        "runtime_sha256": "ceb43f0c7b12a7ad16556dfec460ffc29cfc4372561ce1fa9580a8399aa76c98",
        "gray_modes": (214.0, 253.0),
        "clear_enclosed_components": False,
    },
    "aa-11": {
        "source": "AA-11’s Joyful Victory Spin.png",
        "source_sha256": "5c8cf1a9d0ce1e28bfabef8a2f05cc05961ecc065ecd1b26ace2ebabba292257",
        "runtime_sha256": "59dd6987fef114989b7afba9cf13fec40b9896801619285165b646124e88b47b",
        "gray_modes": (138.0, 200.0),
        "clear_enclosed_components": True,
    },
    "aa-12": {
        "source": "Jennifer’s Welcoming Victory Flourish.png",
        "source_sha256": "d2cd74f5cc1235c9a73016faf420066f551cc7b8ddf94150f8261c9368533f37",
        "runtime_sha256": "218ef5b7d5650046d04f5cc9adaeb014b9d7829d4b711079ed50c810173ca107",
        "gray_modes": (130.0, 192.0),
        "clear_enclosed_components": True,
    },
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def neighboring(mask: np.ndarray) -> np.ndarray:
    expanded = mask.copy()
    for row_offset in (-1, 0, 1):
        for column_offset in (-1, 0, 1):
            if row_offset == 0 and column_offset == 0:
                continue
            source_y = slice(max(0, -row_offset), mask.shape[0] - max(0, row_offset))
            target_y = slice(max(0, row_offset), mask.shape[0] - max(0, -row_offset))
            source_x = slice(max(0, -column_offset), mask.shape[1] - max(0, column_offset))
            target_x = slice(max(0, column_offset), mask.shape[1] - max(0, -column_offset))
            expanded[target_y, target_x] |= mask[source_y, source_x]
    return expanded


def edge_connected(candidate: np.ndarray) -> np.ndarray:
    height, width = candidate.shape
    selected = np.zeros_like(candidate)
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        if candidate[0, x]:
            selected[0, x] = True
            queue.append((0, x))
        if candidate[height - 1, x] and not selected[height - 1, x]:
            selected[height - 1, x] = True
            queue.append((height - 1, x))
    for y in range(height):
        if candidate[y, 0] and not selected[y, 0]:
            selected[y, 0] = True
            queue.append((y, 0))
        if candidate[y, width - 1] and not selected[y, width - 1]:
            selected[y, width - 1] = True
            queue.append((y, width - 1))

    while queue:
        y, x = queue.popleft()
        for neighbor_y in range(max(0, y - 1), min(height, y + 2)):
            for neighbor_x in range(max(0, x - 1), min(width, x + 2)):
                if candidate[neighbor_y, neighbor_x] and not selected[neighbor_y, neighbor_x]:
                    selected[neighbor_y, neighbor_x] = True
                    queue.append((neighbor_y, neighbor_x))
    return selected


def enclosed_components(candidate: np.ndarray, selected: np.ndarray) -> np.ndarray:
    residual = candidate & ~selected
    visited = np.zeros_like(residual)
    enclosed = np.zeros_like(residual)
    height, width = residual.shape

    for start_y, start_x in zip(*np.where(residual & ~visited)):
        y0 = int(start_y)
        x0 = int(start_x)
        visited[y0, x0] = True
        queue: deque[tuple[int, int]] = deque([(y0, x0)])
        component: list[tuple[int, int]] = []
        while queue:
            y, x = queue.popleft()
            component.append((y, x))
            for neighbor_y in range(max(0, y - 1), min(height, y + 2)):
                for neighbor_x in range(max(0, x - 1), min(width, x + 2)):
                    if residual[neighbor_y, neighbor_x] and not visited[neighbor_y, neighbor_x]:
                        visited[neighbor_y, neighbor_x] = True
                        queue.append((neighbor_y, neighbor_x))
        if len(component) >= 20:
            ys, xs = zip(*component)
            enclosed[np.asarray(ys), np.asarray(xs)] = True
    return enclosed


def matte(rgb: np.ndarray, modes: tuple[float, float], clear_enclosed: bool) -> np.ndarray:
    values = rgb.astype(np.float32)
    luminance = values.mean(axis=2)
    channel_spread = values.max(axis=2) - values.min(axis=2)
    mode_distance = np.minimum(np.abs(luminance - modes[0]), np.abs(luminance - modes[1]))
    candidate = (channel_spread <= 30) & (mode_distance <= 30)

    selected = edge_connected(candidate)
    edge_blend = (channel_spread <= 42) & (mode_distance <= 44)
    for _ in range(2):
        selected |= neighboring(selected) & edge_blend

    if clear_enclosed:
        selected |= enclosed_components(candidate, selected)
    return selected


def prepare(
    source_dir: Path,
    output_dir: Path,
    matte_dir: Path,
) -> None:
    matte_dir.mkdir(parents=True, exist_ok=True)
    for character_id, spec in ASSETS.items():
        source = source_dir / spec["source"]
        if sha256(source) != spec["source_sha256"]:
            raise ValueError(f"{source} does not match its approved source SHA-256.")

        source_image = Image.open(source).convert("RGB")
        if source_image.size != SIZE:
            raise ValueError(f"{source} must be 1024x1536 pixels.")
        rgb = np.asarray(source_image)
        if np.any(np.all(rgb == GREEN, axis=2)):
            raise ValueError(f"{source} already contains exact #00FF00 pixels.")

        selected = matte(rgb, spec["gray_modes"], spec["clear_enclosed_components"])
        green_pass = rgb.copy()
        green_pass[selected] = GREEN
        green_path = matte_dir / f"{character_id}-green-pass.png"
        Image.fromarray(green_pass, "RGB").save(green_path, format="PNG", optimize=True)

        keyed = np.all(green_pass == GREEN, axis=2)
        if not np.array_equal(keyed, selected):
            raise ValueError(f"{character_id} green pass does not match its recorded matte.")
        rgba = np.zeros((SIZE[1], SIZE[0], 4), dtype=np.uint8)
        rgba[:, :, :3] = rgb
        rgba[:, :, 3] = np.where(keyed, 0, 255).astype(np.uint8)
        rgba[keyed, :3] = 0

        target = output_dir / "assets" / "characters" / character_id / "results" / "victory.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(rgba, "RGBA").save(target, format="PNG", optimize=True)
        runtime_sha = sha256(target)
        if runtime_sha != spec["runtime_sha256"]:
            raise ValueError(f"{target} differs from the approved runtime SHA-256: {runtime_sha}")
        print(f"{character_id}: source={spec['source_sha256']} runtime={runtime_sha}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--matte-dir", required=True, type=Path)
    args = parser.parse_args()
    prepare(args.source_dir, args.output_dir, args.matte_dir)


if __name__ == "__main__":
    main()
