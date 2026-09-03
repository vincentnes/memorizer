# Security Policy

## Sensitive Data

This app can process browser browsing history and fetched page text. Treat generated JSON files as private personal data.

Do not commit:

- `chrome_history_export.json`
- `*_history_export.json`
- raw Chrome/Edge `History` files or Firefox `places.sqlite` files
- exported pages, notes, or logs containing private browsing data

These are covered by `.gitignore`, but always verify with:

```powershell
git status --short
```

## Local Server

`tools/local_server.py` is intended for local use only.

Implemented safeguards:

- Binds to `127.0.0.1`.
- Accepts update requests only for `127.0.0.1:8765` or `localhost:8765`.
- Checks `Origin` and `Referer` to reduce cross-site request risk.
- Caps request body size.
- Caps export range, fetch timeout, and fetched content length.
- Does not allow the browser to pass an arbitrary browser history database path.

Do not expose the local server to a public network or reverse proxy.

## Page Content Fetching

`--fetch-content` downloads pages from URLs in your browser history and extracts readable text. Some pages may require login, block automated access, or contain private content. Use this option only for personal local analysis.

## Reporting Issues

If this project is published on GitHub, report security issues privately through GitHub Security Advisories if enabled. Otherwise, avoid posting browser history samples or private URLs in public issues.

