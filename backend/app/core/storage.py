from __future__ import annotations

import io
import mimetypes
from pathlib import Path
from urllib.parse import quote, unquote

from fastapi import HTTPException, status
from PIL import Image, UnidentifiedImageError
from supabase import create_client

from app.core.config import settings

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/webp",
}
MAX_IMAGE_FILE_SIZE_BYTES = 12 * 1024 * 1024
MAX_IMAGE_UPLOAD_COUNT = 8

DETAIL_IMAGE_MAX_WIDTH = 2200
DETAIL_IMAGE_WEBP_QUALITY = 80
GALLERY_IMAGE_MAX_WIDTH = 1400
GALLERY_IMAGE_WEBP_QUALITY = 74


class OptimizedImagePayload(dict):
    storage_path: str
    data: bytes
    content_type: str


def ensure_storage_configured() -> None:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase storage is not configured on the backend.",
        )


def validate_image_filename(filename: str | None) -> str:
    suffix = Path(filename or "").suffix.lower()
    if suffix not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only jpg, jpeg, png, and webp image files are supported.",
        )
    return suffix


def validate_image_upload(filename: str | None, content_type: str | None, size_bytes: int) -> str:
    suffix = validate_image_filename(filename)

    if content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only jpg, jpeg, png, and webp image files are supported.",
        )

    if size_bytes > MAX_IMAGE_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image files must be 12MB or smaller.",
        )

    return suffix


def build_public_image_url(storage_path: str) -> str:
    ensure_storage_configured()
    base_url = settings.supabase_url.rstrip("/")
    bucket = settings.supabase_storage_bucket
    return f"{base_url}/storage/v1/object/public/{bucket}/{quote(storage_path, safe='/')}"


def extract_storage_path(image_url: str) -> str | None:
    if not settings.supabase_url:
        return None

    base_url = settings.supabase_url.rstrip("/")
    bucket = settings.supabase_storage_bucket
    prefix = f"{base_url}/storage/v1/object/public/{bucket}/"

    if not image_url.startswith(prefix):
        return None

    return unquote(image_url.removeprefix(prefix))


def get_supabase_storage_bucket():
    ensure_storage_configured()
    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return client.storage.from_(settings.supabase_storage_bucket)


def format_storage_error(error: Exception) -> str:
    message = str(error).strip()

    if message and message != "{}":
        return message

    return "Could not connect to Supabase storage."


def _resize_image(image: Image.Image, max_width: int) -> Image.Image:
    if image.width <= max_width:
        return image

    ratio = max_width / image.width
    target_height = max(1, int(image.height * ratio))
    return image.resize((max_width, target_height), Image.Resampling.LANCZOS)


def optimize_image_bytes(
    *,
    filename: str | None,
    content_type: str | None,
    data: bytes,
    storage_directory: str,
    make_featured_ready: bool,
) -> OptimizedImagePayload:
    validate_image_upload(filename, content_type, len(data))

    try:
        with Image.open(io.BytesIO(data)) as source_image:
            source_image.load()
            source_format = (source_image.format or "").upper()
            max_width = DETAIL_IMAGE_MAX_WIDTH if make_featured_ready else GALLERY_IMAGE_MAX_WIDTH
            quality = DETAIL_IMAGE_WEBP_QUALITY if make_featured_ready else GALLERY_IMAGE_WEBP_QUALITY

            if source_format == "WEBP" and source_image.width <= max_width:
                optimized_bytes = data
            else:
                processed = source_image
                if processed.mode not in {"RGB", "RGBA"}:
                    processed = processed.convert("RGBA" if "A" in processed.getbands() else "RGB")

                processed = _resize_image(processed, max_width)

                buffer = io.BytesIO()
                processed.save(buffer, format="WEBP", quality=quality, method=6)
                optimized_bytes = buffer.getvalue()
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid image.",
        ) from error

    storage_path = f"{storage_directory}.webp"
    return {
        "storage_path": storage_path,
        "data": optimized_bytes,
        "content_type": "image/webp",
    }


def upload_image_bytes(storage_path: str, data: bytes, content_type: str | None = None) -> str:
    ensure_storage_configured()
    mime_type = content_type or mimetypes.guess_type(storage_path)[0] or "application/octet-stream"

    try:
        get_supabase_storage_bucket().upload(
            storage_path,
            data,
            {
                "content-type": mime_type,
                "upsert": "false",
            },
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Supabase storage upload failed: {format_storage_error(error)}",
        ) from error

    return build_public_image_url(storage_path)


def delete_image_object(storage_path: str) -> None:
    ensure_storage_configured()

    try:
        get_supabase_storage_bucket().remove([storage_path])
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Supabase storage deletion failed: {format_storage_error(error)}",
        ) from error
