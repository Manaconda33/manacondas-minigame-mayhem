#!/usr/bin/env python3
"""Rebuild the approved AA-01–03 Results reaction cutouts from green-screen renders."""

from __future__ import annotations

import argparse
from collections import deque
import hashlib
from pathlib import Path

import numpy as np
from PIL import Image


SIZE = (1024, 1536)
ASSETS = {
    "aa-01": {
        "source": "exec-ba928d01-6c41-4be0-9093-6a30bddba050.png",
        "source_sha256": "5f4d22a4330d5be040a4d7cee82f318ec926fb905c6c117ccbf3e913e7553ae2",
        "runtime_sha256": "b6df95f50c0aa83908f2909e231b763031b2099e62b6fb67cff6a5798f97d650",
    },
    "aa-02": {
        "source": "exec-68f0d3f5-3a01-4347-b26d-085fea2a7798.png",
        "source_sha256": "0e775fbf7027149a422a950cef27a399e1e18bdc6aa308be2df1466007d62ff7",
        "runtime_sha256": "062a932545ab14a2e5db365d60f45fe95b8285ba96850b38ae994c97e408a430",
        "enclosed_green_anchor": (380, 300),
    },
    "aa-03": {
        "source": "exec-0b9782da-fe47-46f1-9483-df4d6ffc3b4e.png",
        "source_sha256": "f5aa679b38ffe59c2612d8d25385a14bb807519d84ac6437b59dbacb7072fc47",
        "runtime_sha256": "0ae22c91b376259390541dc7193648b6631015eee20b5f18153b31ba97482b91",
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


def connected_component(candidate: np.ndarray, anchor: tuple[int, int]) -> np.ndarray:
    x, y = anchor
    if not candidate[y, x]:
        raise ValueError(f"Green-gap anchor {anchor} is outside the candidate matte.")
    selected = np.zeros_like(candidate)
    selected[y, x] = True
    queue: deque[tuple[int, int]] = deque([(y, x)])
    height, width = candidate.shape
    while queue:
        current_y, current_x = queue.popleft()
        for neighbor_y in range(max(0, current_y - 1), min(height, current_y + 2)):
            for neighbor_x in range(max(0, current_x - 1), min(width, current_x + 2)):
                if candidate[neighbor_y, neighbor_x] and not selected[neighbor_y, neighbor_x]:
                    selected[neighbor_y, neighbor_x] = True
                    queue.append((neighbor_y, neighbor_x))
    return selected


def prepare(source_dir: Path, output_dir: Path) -> None:
    for character_id, spec in ASSETS.items():
        source = source_dir / spec["source"]
        if sha256(source) != spec["source_sha256"]:
            raise ValueError(f"{source} does not match its approved source SHA-256.")
        source_image = Image.open(source).convert("RGB")
        if source_image.size != SIZE:
            raise ValueError(f"{source} must be 1024x1536 pixels.")

        rgb = np.asarray(source_image).astype(np.float32)
        red, green, blue = np.moveaxis(rgb, 2, 0)
        green_excess = green - np.maximum(red, blue)
        candidate = (green >= 55) & (green_excess >= 10)
        exterior = edge_connected(candidate)
        edge_blend = (green >= 45) & (green_excess >= 5)
        selected = exterior | (neighboring(exterior) & edge_blend)

        alpha = np.ones(candidate.shape, dtype=np.float32)
        alpha[selected] = np.clip(1 - green_excess[selected] / 255, 0, 1)
        alpha_bytes = np.rint(alpha * 255).astype(np.uint8)
        alpha_bytes[alpha_bytes < 40] = 0

        if anchor := spec.get("enclosed_green_anchor"):
            enclosed_candidate = candidate & ~exterior
            enclosed = connected_component(enclosed_candidate, anchor)
            if int(enclosed.sum()) < 100:
                raise ValueError(f"{character_id} enclosed green component is unexpectedly small.")
            mean_excess = float(green_excess[enclosed].mean())
            if mean_excess < 50:
                raise ValueError(f"{character_id} enclosed component is not chroma-green.")
            alpha_bytes[enclosed] = 0

        alpha_float = (alpha_bytes.astype(np.float32) / 255)[..., None]
        foreground = (rgb - (1 - alpha_float) * np.array([0, 255, 0], dtype=np.float32)) / np.maximum(
            alpha_float, 1e-6
        )
        rgba = np.dstack([np.clip(foreground, 0, 255), alpha_bytes]).astype(np.uint8)
        rgba[alpha_bytes == 0, :3] = 0

        target = output_dir / "assets" / "characters" / character_id / "results" / "reaction.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(rgba, "RGBA").save(target, format="PNG", optimize=True)
        runtime_hash = sha256(target)
        if runtime_hash != spec["runtime_sha256"]:
            raise ValueError(f"{target} differs from its approved runtime SHA-256: {runtime_hash}")
        print(f"{character_id}: source={spec['source_sha256']} runtime={runtime_hash}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    prepare(args.source_dir, args.output_dir)


if __name__ == "__main__":
    main()
