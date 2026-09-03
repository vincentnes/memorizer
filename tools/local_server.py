#!/usr/bin/env python3
"""Run the Memorizer app with a local API for updating Chrome history JSON."""

from __future__ import annotations

import json
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools.export_chrome_history import export_history


MAX_BODY_BYTES = 32_768
MAX_DAYS = 31
MAX_FETCH_TIMEOUT = 10.0
MAX_CONTENT_CHARS = 20_000
ALLOWED_HOSTS = {"127.0.0.1:8765", "localhost:8765"}
ALLOWED_ORIGINS = {"http://127.0.0.1:8765", "http://localhost:8765"}
ALLOWED_CONTENT_REGIONS = {"main", "right", "all"}


class MemorizerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/update-history":
            self.send_error(404)
            return
        if not self.request_is_local_app():
            self.write_json(403, {"error": "Forbidden origin or host."})
            return

        try:
            content_length = int(self.headers.get("content-length", "0"))
            if content_length > MAX_BODY_BYTES:
                self.write_json(413, {"error": "Request body too large."})
                return
            body = self.rfile.read(content_length).decode("utf-8") if content_length else "{}"
            request = json.loads(body)
            payload = self.update_history(request)
            self.write_json(200, payload)
        except Exception as error:
            self.write_json(500, {"error": str(error)})

    def request_is_local_app(self) -> bool:
        host = self.headers.get("host", "")
        origin = self.headers.get("origin", "")
        referer = self.headers.get("referer", "")
        if host not in ALLOWED_HOSTS:
            return False
        if origin and origin not in ALLOWED_ORIGINS:
            return False
        if referer:
            parsed = urlparse(referer)
            referer_origin = f"{parsed.scheme}://{parsed.netloc}"
            if referer_origin not in ALLOWED_ORIGINS:
                return False
        return True

    def update_history(self, request: dict) -> dict:
        output_name = Path(request.get("output") or "chrome_history_export.json").name
        output_path = ROOT / output_name
        content_region = request.get("contentRegion") or "right"
        if content_region not in ALLOWED_CONTENT_REGIONS:
            content_region = "right"
        args = SimpleNamespace(
            profile=request.get("profile") or "Default",
            history_path=None,
            days=max(1, min(int(request.get("days") or 7), MAX_DAYS)),
            start=request.get("start") or None,
            end=request.get("end") or None,
            max_gap_seconds=int(request.get("maxGapSeconds") or 1800),
            fetch_content=bool(request.get("fetchContent", True)),
            content_region=content_region,
            fetch_timeout=max(1.0, min(float(request.get("fetchTimeout") or 4.0), MAX_FETCH_TIMEOUT)),
            content_chars=max(500, min(int(request.get("contentChars") or 8000), MAX_CONTENT_CHARS)),
        )
        payload = export_history(args)
        payload["output"] = output_name
        output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return payload

    def write_json(self, status: int, payload: dict) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main() -> None:
    host = "127.0.0.1"
    port = 8765
    server = ThreadingHTTPServer((host, port), MemorizerHandler)
    print(f"Memorizer is running at http://{host}:{port}")
    print("Press Ctrl+C to stop.")
    server.serve_forever()


if __name__ == "__main__":
    main()
