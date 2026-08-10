#!/usr/bin/env python3
"""Send one authorized recording to BRAINIALL without retries or redirects."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
from pathlib import Path
import stat
import sys
import urllib.error
import urllib.request
import uuid

API_URL = "https://api.brainiall.com/v1/whisper/transcribe"
CONFIRMATION = "I_CONFIRM_RIGHTS_AND_COST"
MAX_BYTES = 25 * 1024 * 1024
ALLOWED_SUFFIXES = {".mp3", ".wav", ".m4a", ".mp4", ".mpeg", ".mpga", ".webm", ".ogg"}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
        raise urllib.error.HTTPError(req.full_url, code, "Redirect refused", headers, fp)


def multipart(input_path: Path, language: str) -> tuple[bytes, str]:
    boundary = f"brainiall-{uuid.uuid4().hex}"
    media_type = mimetypes.guess_type(input_path.name)[0] or "application/octet-stream"
    chunks: list[bytes] = []

    def field(name: str, value: str) -> None:
        chunks.extend([
            f"--{boundary}\r\n".encode(),
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
            value.encode(),
            b"\r\n",
        ])

    field("language", language)
    field("diarize", "true")
    chunks.extend([
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="audio"; filename="upload{input_path.suffix.lower()}"\r\n'.encode(),
        f"Content-Type: {media_type}\r\n\r\n".encode(),
        input_path.read_bytes(),
        b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    return b"".join(chunks), boundary


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("language", choices=("pt", "es"))
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    if os.environ.get("BRAINIALL_CONFIRM") != CONFIRMATION:
        raise ValueError(f"Set BRAINIALL_CONFIRM={CONFIRMATION} after checking rights, consent, price, and balance.")
    api_key = os.environ.get("BRAINIALL_API_KEY", "")
    if not api_key:
        raise ValueError("BRAINIALL_API_KEY is required.")

    info = args.input.lstat()
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
        raise ValueError("Input must be one local regular file and not a symlink.")
    if args.input.suffix.lower() not in ALLOWED_SUFFIXES:
        raise ValueError("Unsupported media extension.")
    if not 0 < info.st_size <= MAX_BYTES:
        raise ValueError("Input must be between 1 byte and 25 MB.")
    if args.output.exists() or args.output.is_symlink():
        raise FileExistsError("Output path must not already exist.")
    if not args.output.parent.is_dir():
        raise ValueError("Output directory must already exist.")

    body, boundary = multipart(args.input, args.language)
    request = urllib.request.Request(
        API_URL,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Accept": "application/json",
        },
    )
    opener = urllib.request.build_opener(NoRedirect)
    try:
        with opener.open(request, timeout=120) as response:  # exactly one attempt
            if response.status != 200:
                raise RuntimeError(f"BRAINIALL returned HTTP {response.status}; inspect usage before any retry.")
            payload = json.loads(response.read())
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"BRAINIALL returned HTTP {error.code}; response body hidden. Inspect usage before any retry.") from None
    except urllib.error.URLError:
        raise RuntimeError("Ambiguous network result; inspect usage before any retry.") from None

    if not isinstance(payload, dict) or not isinstance(payload.get("words"), list):
        raise RuntimeError("Unexpected response shape; inspect usage before any retry.")
    descriptor = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
        json.dump(payload, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    print(f"Saved private response to {args.output}. Human review is required.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # keep credentials and upstream bodies out of logs
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from None
