# GitHub Upload Checklist

Use this checklist before publishing Memorizer.

## 1. Verify Private Data Is Not Tracked

Run:

```powershell
git status --short --ignored
git check-ignore -v browser_history_export.json
```

Expected:

- Source files and docs may appear as untracked or staged.
- `browser_history_export.json` should appear as ignored.
- No browser history exports, raw browser history database files, personal URLs, or private notes should be staged.

## 2. Run Development Checks

```powershell
node --check app.js
python -m py_compile tools/export_browser_history.py tools/export_chrome_history.py tools/local_server.py
```

If Python creates `tools/__pycache__/`, leave it untracked. It is ignored by `.gitignore`.

## 3. Stage Only Safe Files

```powershell
git add .gitignore README.md SECURITY.md GITHUB_CHECKLIST.md
git add index.html styles.css app.js
git add tools/export_browser_history.py tools/export_chrome_history.py tools/local_server.py
```

Check staged files:

```powershell
git diff --cached --name-only
```

Expected staged files:

```text
.gitignore
GITHUB_CHECKLIST.md
README.md
SECURITY.md
app.js
index.html
styles.css
tools/export_browser_history.py
tools/export_chrome_history.py
tools/local_server.py
```

## 4. Commit

```powershell
git commit -m "Initial Memorizer app"
```

## 5. Create GitHub Repository

Create an empty repository on GitHub, then connect it:

```powershell
git remote add origin https://github.com/YOUR_NAME/memorizer.git
git branch -M main
git push -u origin main
```

## 6. After Publishing

- Do not upload `browser_history_export.json`.
- Do not paste private browsing history into public issues.
- Keep the local server bound to `127.0.0.1`.
- Review `SECURITY.md` if you change the update API.


