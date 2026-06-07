"""Vercel serverless entrypoint for the FastAPI backend.

Vercel's Python runtime serves the ASGI ``app`` exposed by this module. The
backend package lives in ``../server`` and is bundled into the function via the
``includeFiles`` setting in ``vercel.json``. We prepend that directory to
``sys.path`` so the backend's top-level imports (``from database import ...``,
``from routers import ...``) resolve unchanged.

Requests reach this function through the ``/api/(.*)`` rewrite in vercel.json.
Vercel preserves the original request path, so FastAPI's ``/api/...`` routes
match (e.g. ``/api/auth/login``).
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "server"))

from main import app  # noqa: E402  (import must follow the sys.path insert)

# `app` is the ASGI application Vercel will serve.
__all__ = ["app"]
