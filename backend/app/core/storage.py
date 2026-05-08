from __future__ import annotations

import json
import mimetypes
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote
from urllib.request import Request, urlopen

from fastapi import HTTPException, status

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


def upload_image_bytes(storage_path: str, data: bytes, content_type: str | None = None) -> str:
    ensure_storage_configured()

    mime_type = content_type or mimetypes.guess_type(storage_path)[0] or "application/octet-stream"
    base_url = settings.supabase_url.rstrip("/")
    bucket = settings.supabase_storage_bucket
    endpoint = f"{base_url}/storage/v1/object/{bucket}/{quote(storage_path, safe='/')}"
    request = Request(
        endpoint,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "apikey": settings.supabase_service_role_key,
            "Content-Type": mime_type,
            "x-upsert": "false",
        },
    )

    try:
        with urlopen(request) as response:
            if response.status not in {200, 201}:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Supabase storage upload failed.",
                )
    except HTTPError as error:
        detail = "Supabase storage upload failed."
        try:
            payload = json.loads(error.read().decode("utf-8"))
            detail = payload.get("message") or payload.get("error") or detail
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail) from error
    except URLError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Supabase storage.",
        ) from error

    return build_public_image_url(storage_path)


def delete_image_object(storage_path: str) -> None:
    ensure_storage_configured()

    base_url = settings.supabase_url.rstrip("/")
    bucket = settings.supabase_storage_bucket
    endpoint = f"{base_url}/storage/v1/object/{bucket}/{quote(storage_path, safe='/')}"
    request = Request(
        endpoint,
        method="DELETE",
        headers={
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "apikey": settings.supabase_service_role_key,
        },
    )

    try:
        with urlopen(request) as response:
            if response.status not in {200, 204}:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Supabase storage deletion failed.",
                )
    except HTTPError as error:
        if error.code == 404:
            return
        detail = "Supabase storage deletion failed."
        try:
            payload = json.loads(error.read().decode("utf-8"))
            detail = payload.get("message") or payload.get("error") or detail
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail) from error
    except URLError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Supabase storage.",
        ) from error
