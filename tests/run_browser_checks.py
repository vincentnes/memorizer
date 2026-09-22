"""Run the real-DOM Phase 1 checks in an isolated Chromium profile."""
from pathlib import Path
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "tests" / ".runtime"
RUNTIME.mkdir(exist_ok=True)
chrome = Path(os.environ.get("PROGRAMFILES", r"C:\Program Files")) / "Google/Chrome/Application/chrome.exe"
if len(sys.argv) > 1:
    chrome = Path(sys.argv[1])
if not chrome.is_file():
    raise SystemExit("Pass the path to Chrome or Edge as the first argument.")
html = (ROOT / "index.html").read_text(encoding="utf-8")
check_path = ROOT / "tests" / (sys.argv[2] if len(sys.argv) > 2 else "phase1-browser.js")
checks = check_path.read_text(encoding="utf-8-sig")
base_url = "http://127.0.0.1:8765" if check_path.name == "settings-browser.js" else ROOT.as_uri()
html = html.replace("<head>", '<head><base href="' + base_url + '/">')
html = html.replace("</body>", "<script>" + checks + "</script></body>")
page = RUNTIME / "phase1.html"
page.write_text(html, encoding="utf-8")
result = subprocess.run([
    str(chrome), "--headless", "--disable-gpu", "--no-first-run",
    "--allow-file-access-from-files", "--user-data-dir=" + str(RUNTIME / "profile"),
    "--virtual-time-budget=15000", "--dump-dom",
    "http://127.0.0.1:8765/tests/.runtime/phase1.html" if check_path.name == "settings-browser.js" else page.as_uri(),
], capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=45)
marker = '<pre id="result">'
report = result.stdout.split(marker)[-1].split("</pre>")[0] if marker in result.stdout else ""
if result.returncode or not report.startswith("PASS:"):
    raise SystemExit(report or result.stderr or "Browser produced no test result")
print(report)
