from __future__ import annotations

import io
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.core.storage import build_public_image_url, ensure_storage_configured

ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = ROOT / "backend" / "scripts" / "template_image_manifest.json"

MAX_WIDTH = 2200
WEBP_QUALITY = 80

IMAGE_SOURCES = {
    "bentley-black": Path("/Users/andresg/Pictures/cars/bentley-black.png"),
    "bentley-old": Path("/Users/andresg/Pictures/cars/bentley-old.png"),
    "ferrari-testarosa": Path("/Users/andresg/Pictures/cars/ferrari-testarosa.png"),
    "mountain-coupe-user": Path("/Users/andresg/Pictures/cars/mountain-coupe.png"),
    "detail-atelier-user": Path("/Users/andresg/Pictures/cars/detail-atelier.png"),
    "private-showroom-user": Path("/Users/andresg/Pictures/cars/private-showroom.png"),
    "mustang-67-black": Path("/Users/andresg/Pictures/cars/mustang-67-black.png"),
    "hotel-arrival-user": Path("/Users/andresg/Pictures/cars/hotel-arrival.png"),
    "mustang67": Path("/Users/andresg/Pictures/cars/mustang67.png"),
    "porsche-old": Path("/Users/andresg/Pictures/cars/porshe-old.png"),
    "collector-analog-detail": ROOT / "frontend" / "public" / "images" / "gallery" / "analog-detail.webp",
    "collector-analog-icons-garage": ROOT / "frontend" / "public" / "images" / "hero" / "collector-icons-garage.webp",
    "collector-carrera-gt-gallery": ROOT / "frontend" / "public" / "images" / "gallery" / "carrera-gt-gallery.webp",
    "collector-heritage-defender-gallery": ROOT / "frontend" / "public" / "images" / "gallery" / "heritage-defender-gallery.webp",
    "collector-sell-consign-lounge": ROOT / "frontend" / "public" / "images" / "services" / "sell-consign-lounge.webp",
    "homepage-custom-hero-mustang": ROOT / "frontend" / "public" / "images" / "hero" / "custom-hero-mustang.webp",
    "gallery-detail-atelier": ROOT / "frontend" / "public" / "luxury-gallery" / "detail-atelier.png",
    "gallery-hotel-arrival": ROOT / "frontend" / "public" / "luxury-gallery" / "hotel-arrival.png",
    "gallery-mountain-coupe": ROOT / "frontend" / "public" / "luxury-gallery" / "mountain-coupe.png",
    "gallery-private-showroom": ROOT / "frontend" / "public" / "luxury-gallery" / "private-showroom.png",
}


def optimize_to_webp(source_path: Path) -> bytes:
    with Image.open(source_path) as image:
        image.load()

        processed = image
        if processed.mode not in {"RGB", "RGBA"}:
            processed = processed.convert("RGBA" if "A" in processed.getbands() else "RGB")

        if processed.width > MAX_WIDTH:
            ratio = MAX_WIDTH / processed.width
            processed = processed.resize(
                (MAX_WIDTH, max(1, int(processed.height * ratio))),
                Image.Resampling.LANCZOS,
            )

        buffer = io.BytesIO()
        processed.save(buffer, format="WEBP", quality=WEBP_QUALITY, method=6)
        return buffer.getvalue()


def upload_template_assets() -> dict[str, dict[str, str]]:
    ensure_storage_configured()
    manifest: dict[str, dict[str, str]] = {}

    for slug, source_path in IMAGE_SOURCES.items():
        if not source_path.exists():
            raise FileNotFoundError(f"Missing source image: {source_path}")

        storage_path = f"template/{slug}.webp"
        payload = optimize_to_webp(source_path)
        upload_url = (
            f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
            f"{settings.supabase_storage_bucket}/{storage_path}"
        )
        with tempfile.NamedTemporaryFile(suffix=".webp") as temp_file:
            temp_file.write(payload)
            temp_file.flush()
            subprocess.run(
                [
                    "curl",
                    "--fail",
                    "--silent",
                    "--show-error",
                    "-X",
                    "POST",
                    upload_url,
                    "-H",
                    f"Authorization: Bearer {settings.supabase_service_role_key}",
                    "-H",
                    f"apikey: {settings.supabase_service_role_key}",
                    "-H",
                    "Content-Type: image/webp",
                    "-H",
                    "x-upsert: true",
                    "--data-binary",
                    f"@{temp_file.name}",
                ],
                check=True,
            )

        manifest[slug] = {
            "storage_path": storage_path,
            "url": build_public_image_url(storage_path),
            "source": str(source_path),
        }

    return manifest


def main() -> None:
    manifest = upload_template_assets()
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Uploaded {len(manifest)} assets and wrote manifest to {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
