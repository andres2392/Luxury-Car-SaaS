from __future__ import annotations

import mimetypes
from pathlib import Path
from urllib.parse import quote, unquote

from fastapi import HTTPException, status
from supabase import create_client

from app.core.config import settings

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


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
