# Memorizer

Memorizer is a local-first memory training and Chrome browsing analysis app.

It helps with a common problem: you read something and understand it, but cannot recall the main points later. The app combines active recall practice with a private Chrome history dashboard, so useful pages from your browsing history can be sent into memory training.

## Features

- Memory training flow: paste a passage, read under a timer, hide the source, recall, compare, and save missed points.
- Clipboard import: load text from your clipboard directly into the training passage box.
- Chrome history analysis: import exported Chrome history JSON, filter by time, classify content, and view charts.
- Chart drilldown: click a bar in the category or hourly chart to show matching visit logs.
- Visit-to-training: send a visit's fetched page content, title, and link into memory training.
- Bilingual UI: switch between Traditional Chinese and English.
- Local update API: when served from `tools/local_server.py`, the app can regenerate Chrome JSON from your machine.

## Quick Start

Run the local server:

```powershell
python tools/local_server.py
```

Open:

```text
http://127.0.0.1:8765/
```

You can also open `index.html` directly, but direct file mode cannot run local Python or use the JSON update API.

## Export Chrome History

Close Chrome first if the history database is locked, then run:

```powershell
python tools/export_chrome_history.py --days 7
```

To include readable page text:

```powershell
python tools/export_chrome_history.py --days 7 --fetch-content
```

For sites where the main article is in a right-side content column:

```powershell
python tools/export_chrome_history.py --days 7 --fetch-content --content-region right
```

Then import `chrome_history_export.json` in the Chrome Analysis view.

## Privacy And Security

Memorizer is designed to run locally. Chrome history and fetched page content can be highly sensitive, so generated JSON exports are ignored by git through `.gitignore`.

Before uploading to GitHub, check:

```powershell
git status --short
```

Make sure no `chrome_history_export.json`, `exports/`, browser history database, or personal notes are staged.

The local server binds to `127.0.0.1` only. Its update API checks `Host`, `Origin`, and `Referer`, caps request size and export range, and does not accept arbitrary `historyPath` values from the browser.

## Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
├── tools/
│   ├── export_chrome_history.py
│   └── local_server.py
├── README.md
├── SECURITY.md
└── .gitignore
```

## Development Checks

```powershell
node --check app.js
python -m py_compile tools/export_chrome_history.py tools/local_server.py
```

## GitHub Preparation

Initialize and inspect:

```powershell
git init
git status --short
```

Stage only source and docs:

```powershell
git add index.html styles.css app.js tools/export_chrome_history.py tools/local_server.py README.md SECURITY.md .gitignore
git commit -m "Initial Memorizer app"
```

Then create a GitHub repository and add its remote:

```powershell
git remote add origin https://github.com/YOUR_NAME/memorizer.git
git branch -M main
git push -u origin main
```
