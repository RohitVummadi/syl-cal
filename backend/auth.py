"""Firebase token verification for the Syl-Cal API."""

from __future__ import annotations

import os
from functools import wraps
from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials
from flask import g, jsonify, request


class FirebaseConfigurationError(RuntimeError):
    """Raised when the API cannot verify Firebase tokens."""


def initialize_firebase() -> None:
    """Initialize Firebase Admin once, using a credential file outside the repo."""
    if firebase_admin._apps:
        return

    credential_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if not credential_path:
        raise FirebaseConfigurationError(
            "FIREBASE_SERVICE_ACCOUNT_PATH is not configured on the server."
        )

    path = Path(credential_path).expanduser()
    if not path.is_file():
        raise FirebaseConfigurationError(
            "Firebase service-account file could not be found on the server."
        )

    firebase_admin.initialize_app(credentials.Certificate(str(path)))


def verify_bearer_token():
    header = request.headers.get("Authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None, (jsonify({"error": "Authentication is required."}), 401)

    try:
        initialize_firebase()
        return auth.verify_id_token(token), None
    except FirebaseConfigurationError as error:
        return None, (jsonify({"error": str(error)}), 503)
    except Exception:
        return None, (jsonify({"error": "Your sign-in session is invalid or expired."}), 401)


def require_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        claims, error_response = verify_bearer_token()
        if error_response:
            return error_response
        g.user_id = claims["uid"]
        return view(*args, **kwargs)

    return wrapped
