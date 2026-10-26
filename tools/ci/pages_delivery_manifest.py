#!/usr/bin/env python3
"""Build and verify the production-only GitHub Pages delivery manifest."""

from __future__ import annotations

import argparse
import hashlib
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

TRANSIENT_HTTP_STATUSES = {429, 500, 502, 503, 504}
PRESERVATION_ATTEMPTS = 5
LIVE_DELIVERY_ATTEMPTS = 12

# These paths were previously approved as new production assets. Keep this
# exact path/hash allowlist; unexpected paths and content remain blocking.
APPROVED_NEW_PRODUCTION_ASSETS = {
    "assets/track/materials/concrete-wall-007/concrete_wall_007_diff_1k.png": "e560c10bcde3256697fa64538441ec6b3e1d257280b7f15e9bfca8412a5d948a",
    "assets/track/materials/concrete-wall-007/concrete_wall_007_nor_gl_1k.png": "3226418bde0ee3faad7eb8d74f376969c4855e86938330fdbdcc41e5bd53f08e",
    "assets/track/materials/concrete-wall-007/concrete_wall_007_rough_1k.png": "ca7430b1450fbd6758f8a87ca540988278069e601f22bb6093a2f6d0fecedbac",
    "assets/audio/music-opus-192k/01-circuit-alpha-race-loop.ogg": "c361e256dab8b02faea12f49ad3d8ffffddc1e1a84c604d8a0488f52122501d4",
    "assets/audio/music-opus-192k/02-circuit-alpha-final-lap-loop.ogg": "4c25b5a7e903af69ff1f3569af9310f09f6e0476bd78cd29ccb95900d43f27f8",
    "assets/audio/music-opus-192k/03-route-night-title-hub-loop.ogg": "3f590baa08d0ea2a1dd3900ea7c05965d1bb38cee3028bbbee4556c1f82841b7",
    "assets/audio/music-opus-192k/04-grid-preparation-character-select-loop.ogg": "efbee32d1ac0ece009530fb0f1f8231f16f4a5d2bb96f35e7023b3af323fdaa8",
    "assets/audio/music-opus-192k/05-finish-celebration-results-podium-loop.ogg": "6dad9dfef171913daec3974e59ce82ea9e708e8c4e854bb682ee11808994bd9a",
    "assets/track/neon-grid/billboard/arin-v1.webp": "7a357de283bb0baca071b2a6eb7fd2e4f2bf213bf57e470253fdd694ee2085cf",
    "assets/track/neon-grid/billboard/paprika-v1.webp": "0e90ae576d25a5bcdd3049ba61f5e02357a31eba3fda5d2ccfb2e444c7f47b20",
    "assets/track/neon-grid/billboard/raven-v1.webp": "4f414a9c5bfb02a805a34a80b3d19a0134fd56fe2bad7ad52a8d23cd1483eb9e",
    "assets/track/neon-grid/signage/manaconda-racing-v1.webp": "481feb4ff34635abad29dd4f65b39975e73c227eb0a53901a51028c5e9fe7d22",
    "assets/track/neon-grid/signage/nightshift-noodles-v1.webp": "76fc1f75778c757cd979ff78641844cbf1d3955ec6dff7cc8145289dda45373a",
    "assets/track/neon-grid/signage/service-tunnel-do-not-enter-v1.png": "11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4",
    "assets/track/neon-grid/signage/taco-bell-live-mas-v1.webp": "d289bc4dbc10872d6c75aa4ae650aaf716bf83a9ea36da12ce0cdc021e7bea7e",
    "assets/track/neon-grid/signage/voltline-industrial-v1.webp": "19b32b71ee59a0f52860c4a6003057b46e4fde890c4e2d4d390b78ed2ea67863",
}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def is_rebuilt_application_entrypoint(relative: str) -> bool:
    path = Path(relative)
    return relative == "index.html" or (
        path.parent == Path("assets") and path.suffix in {".js", ".css"}
    )


def is_approved_new_production_asset(relative: str, sha: str) -> bool:
    expected_sha = APPROVED_NEW_PRODUCTION_ASSETS.get(relative)
    if expected_sha is None:
        return False
    if sha != expected_sha:
        raise RuntimeError(
            f"Unexpected content for approved new production asset {relative}: "
            f"expected {expected_sha}, received {sha}"
        )
    return True


def verify_published_file(url: str, relative: str, expected_sha: str) -> None:
    for attempt in range(1, PRESERVATION_ATTEMPTS + 1):
        request = urllib.request.Request(
            url,
            headers={
                "Cache-Control": "no-cache",
                "User-Agent": "production-pages-preservation-check",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                if response.status != 200:
                    raise RuntimeError(f"Unexpected HTTP {response.status} for {relative}")
                data = response.read()
            actual_sha = hashlib.sha256(data).hexdigest()
            if actual_sha != expected_sha:
                raise AssertionError(f"Production bytes differ: {relative}")
            return
        except urllib.error.HTTPError as error:
            if error.code not in TRANSIENT_HTTP_STATUSES:
                raise RuntimeError(f"HTTP {error.code} while verifying {relative}") from error
            if attempt == PRESERVATION_ATTEMPTS:
                raise RuntimeError(
                    f"Transient HTTP {error.code} persisted for {relative} "
                    f"after {PRESERVATION_ATTEMPTS} attempts"
                ) from error
            delay = min(2 ** (attempt - 1), 8)
            print(
                f"Retrying {relative} after transient HTTP {error.code} "
                f"(attempt {attempt}/{PRESERVATION_ATTEMPTS}, wait {delay}s)",
                flush=True,
            )
            error.close()
            time.sleep(delay)


def build_delivery_manifest(root: Path, base_url: str, verify_existing: bool) -> list[dict]:
    if (root / "previews").exists():
        raise RuntimeError("Production-only Pages root must not contain a previews/ directory")
    paths = sorted(path for path in root.rglob("*") if path.is_file() and path.name != ".gitkeep")
    if not paths:
        raise RuntimeError(f"No production files found beneath {root}")

    manifest = []
    for path in paths:
        relative = path.relative_to(root).as_posix()
        sha = sha256_file(path)
        approved = is_approved_new_production_asset(relative, sha)
        if verify_existing and not is_rebuilt_application_entrypoint(relative) and not approved:
            verify_published_file(f"{base_url.rstrip('/')}/{relative}", relative, sha)
        manifest.append(
            {
                "path": relative,
                "url": f"{base_url.rstrip('/')}/{relative}",
                "sha256": sha,
                "bytes": path.stat().st_size,
            }
        )
    return manifest


def verify_live_delivery(manifest_path: Path, delivery_token: str) -> list[dict]:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    def verify_item(item: dict) -> dict:
        separator = "&" if "?" in item["url"] else "?"
        url = f"{item['url']}{separator}delivery={urllib.parse.quote(delivery_token)}"
        for attempt in range(LIVE_DELIVERY_ATTEMPTS):
            request = urllib.request.Request(
                url,
                headers={"Cache-Control": "no-cache", "User-Agent": "production-pages-delivery-check"},
            )
            try:
                with urllib.request.urlopen(request, timeout=45) as response:
                    data = response.read()
                    if response.status != 200:
                        raise AssertionError(f"Unexpected HTTP {response.status}: {item['path']}")
                actual_sha = hashlib.sha256(data).hexdigest()
                if len(data) != item["bytes"] or actual_sha != item["sha256"]:
                    raise AssertionError(f"Production bytes differ: {item['path']}")
                item["httpStatus"] = 200
                return item
            except Exception as error:
                print(f"Delivery attempt {attempt + 1} for {item['path']}: {error}", flush=True)
                if attempt + 1 == LIVE_DELIVERY_ATTEMPTS:
                    raise
                time.sleep(10)
        raise AssertionError(f"Unreachable delivery retry exhaustion: {item['path']}")

    verified = [None] * len(manifest)
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(verify_item, item): index for index, item in enumerate(manifest)}
        for future in as_completed(futures):
            index = futures[future]
            verified[index] = future.result()
            print(f"Verified {index + 1}/{len(manifest)}: {manifest[index]['path']}", flush=True)
    return verified


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--base-url", default="https://manaconda33.github.io/manacondas-minigame-mayhem")
    parser.add_argument("--verify-existing", action="store_true")
    parser.add_argument("--verify-live", type=Path)
    parser.add_argument("--delivery-token", default="production-only")
    args = parser.parse_args()

    if args.verify_live:
        verified = verify_live_delivery(args.verify_live, args.delivery_token)
        output = Path("delivery-verified.json")
    else:
        if args.root is None or args.output is None:
            parser.error("--root and --output are required when building a manifest")
        verified = build_delivery_manifest(args.root, args.base_url, args.verify_existing)
        output = args.output
    output.write_text(json.dumps(verified, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"files": len(verified), "output": str(output)}, indent=2))


if __name__ == "__main__":
    main()
