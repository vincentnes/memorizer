# Memorizer

Memorizer is a local-first memory training and browser-time analysis app, evolving toward a personal memory and knowledge tool: capture memories, connect knowledge, and recall inspiration.

It helps with a common problem: you read something and understand it, but cannot recall the main points later. The app combines active recall practice with a private browsing-time dashboard, so useful pages from your browsing history can be sent into memory training.

## Features

- Import UTF-8 TXT / Markdown files up to 1 MB (Markdown remains plain text).
- Split long articles into sections of up to 1,200 Unicode characters, with parent links and source snapshots.
- Preserve earlier text versions on edit; back up sections, versions, and recall source snapshots.
- Show heuristic warnings for empty, short, or likely blocked content; users can repair the source manually.

- Brand-aligned capture and review entry points, with the approved Memorizer logo.
- Personal impressions and tags saved with articles and searchable in the library.
- Missing-content repair that preserves source information.
- Version 2 training backups with legacy import support and recall-history merging.

- Memory training flow: paste a passage, read under a timer, hide the source, recall, compare, and save missed points.
- Clipboard import: load text from your clipboard directly into the training passage box.
- Browsing time analysis: import exported Chrome, Edge, or Firefox history JSON, filter by time, classify content, and view charts.
- Chart drilldown: click a bar in the category or hourly chart to show matching visit logs.
- Visit-to-training: send a visit's fetched page content, title, and link into memory training.
- Visit-to-library: add useful browsing visits to the article library and track their learning status.
- Training data backup: export and import saved articles and recall sessions as local JSON.
- Bilingual UI: switch between Traditional Chinese and English.
- Local update API: when served from `tools/local_server.py`, the app can regenerate browsing data JSON from your machine.

## Roadmap

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for the revised brand-aligned phases: brand and entry points, reliable capture, active recall, knowledge connections, retrieval and inspiration, optional multimedia and AI, and desktop release. Knowledge connections, inspiration notes, multimedia, and AI are planned capabilities. Existing library and spaced-review work remains the baseline; data integrity and privacy apply throughout.

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

## Export Browsing Data

Supported browsers: Chrome, Microsoft Edge, and Firefox.

Close the target browser first if the history database is locked, then run:

```powershell
python tools/export_browser_history.py --browser chrome --days 7
```

To include readable page text:

```powershell
python tools/export_browser_history.py --browser edge --days 7 --fetch-content
```

For sites where the main article is in a right-side content column:

```powershell
python tools/export_browser_history.py --browser firefox --days 7 --fetch-content --content-region right
```

If you run the app through `python tools/local_server.py`, you can also open the Browsing Time view and click **Generate Browsing Data** directly; no JSON import is required first. Manual exports can still be imported from `browser_history_export.json`.

## Privacy And Security

Memorizer is designed to run locally. Browser history and fetched page content can be highly sensitive, so generated JSON exports are ignored by git through `.gitignore`.

Before uploading to GitHub, check:

```powershell
git status --short
```

Make sure no `browser_history_export.json`, `exports/`, browser history database, or personal notes are staged.

The local server binds to `127.0.0.1` only. Its update API checks `Host`, `Origin`, and `Referer`, caps request size and export range, and does not accept arbitrary `historyPath` values from the browser.

## Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
├── tools/
│   ├── export_browser_history.py
│   ├── export_chrome_history.py
│   └── local_server.py
├── README.md
├── SECURITY.md
└── .gitignore
```

## Development Checks

```powershell
node --check app.js
node tests/memory-data.test.cjs
node tests/content.test.cjs
python -m unittest discover -s tests -p test_extraction.py
python tests/run_browser_checks.py
python -m py_compile tools/export_browser_history.py tools/export_chrome_history.py tools/local_server.py
```

## GitHub Preparation

Initialize and inspect:

```powershell
git init
git status --short
```

Stage only source and docs:

```powershell
git add index.html styles.css app.js tools/export_browser_history.py tools/export_chrome_history.py tools/local_server.py README.md SECURITY.md .gitignore
git commit -m "Initial Memorizer app"
```

Then create a GitHub repository and add its remote:

```powershell
git remote add origin https://github.com/YOUR_NAME/memorizer.git
git branch -M main
git push -u origin main
```







### Text imports and source versions

Repeated imports of the same filename and unchanged content reuse the existing article.
A changed file is saved as a separate article so existing impressions and training records remain intact.
Repeated browsing visits reuse the saved article; update its text explicitly to create a new content version.
Editing a source resets its review schedule while retaining old attempts. Previously created sections keep their
source snapshot and are not silently regenerated. Splitting the new version creates a separate set of sections.
Content warnings are heuristics, not proof that a fetched article is complete.

The browser check uses Chrome (or a supplied Chromium executable path) and an isolated profile under
tests/.runtime. It clears only that test profile's app storage.

## Settings

Use the gear icon in the top-right corner to configure language, start page, default reading seconds and target points.
Choose an export folder using the native folder picker in supported Chrome/Edge browsers on localhost.
Folder access is remembered in IndexedDB; the browser may request permission again before a later export.
The UI shows the authorized folder name, since the browser does not expose its full disk path.
This setting controls training JSON exports, not live article storage or browser-history generation.
Edits continue to save in browser localStorage. Cancel discards pending settings; browser-download mode remains available.

Settings integration check (start the local server first):

```powershell
node tests/run-settings-browser.cjs
```

The test uses an isolated browser profile and a sandboxed test folder, not personal folders.


### Three key points and review history

Define expected points in the article editor (one per line), save, and select **Three key points**.
This mode requires exactly three expected points. Recall uses three separate fields; source,
expected points, and previous attempts are hidden until submission. Compare your submitted
points with the expected points, then self-rate and save. Reset or start a new round to edit.
Each article's **Complete attempt history** includes every saved response, expected-point
snapshot, source version/text, score, confidence, missed points, and next review date.
Existing backups and free recall remain supported; old attempts are retained as recorded.

Review timing now uses the self-rated score: below 3 returns in one day, 3 in three days,
and consecutive scores of 4–5 advance through 3, 7, 14, and 30 days. Three consecutive
strong attempts earn mastery; weaker performance breaks the streak. Confidence is recorded
separately. Source or expected-point edits reset scheduling, retaining historical attempts.
Only attempts for the current source version and expected points count toward the streak.
