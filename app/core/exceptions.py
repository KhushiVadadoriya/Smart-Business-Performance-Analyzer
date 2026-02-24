import json
from typing import Any
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import BaseHTTPMiddleware


def _stringify_detail(detail: Any) -> str:
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list):
        return "; ".join(_stringify_detail(item) for item in detail)
    if isinstance(detail, dict):
        return "; ".join(f"{k}: {v}" for k, v in detail.items())
    return str(detail)


def _extract_version(path: str) -> Optional[str]:
    if path.startswith("/api/v1"):
        return "v1"
    if path.startswith("/api/v2"):
        return "v2"
    if path.startswith("/api/v3"):
        return "v3"
    return None


def _readable_validation_message(exc: RequestValidationError) -> str:
    messages = []
    for err in exc.errors():
        loc = [str(x) for x in err.get("loc", []) if x != "body"]
        field = ".".join(loc)
        msg = err.get("msg", "Invalid value")
        messages.append(f"{field}: {msg}" if field else msg)
    return "; ".join(messages) if messages else "Invalid request payload."


class StandardizedResponseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        version = _extract_version(request.url.path)
        if not version or response.status_code >= 400:
            return response

        content_type = response.headers.get("content-type", "")
        if "application/json" not in content_type.lower():
            return response

        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        try:
            payload = json.loads(body.decode("utf-8") or "null")
        except Exception:
            headers = {
                k: v
                for k, v in response.headers.items()
                if k.lower() not in {"content-length"}
            }
            return Response(
                content=body,
                status_code=response.status_code,
                headers=headers,
                media_type=response.media_type,
            )

        if isinstance(payload, dict) and payload.get("success") is True and "data" in payload:
            wrapped = payload
        else:
            wrapped = {
                "success": True,
                "version": version,
                "data": payload,
            }

        headers = {
            k: v
            for k, v in response.headers.items()
            if k.lower() not in {"content-length", "content-type"}
        }
        return JSONResponse(
            content=wrapped,
            status_code=response.status_code,
            headers=headers,
        )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "detail": _stringify_detail(exc.detail),
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "detail": _readable_validation_message(exc),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, __: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "detail": "An unexpected server error occurred.",
            },
        )
