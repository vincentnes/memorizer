# Memorizer Product Plan

Memorizer is evolving from a local prototype into a complete local-first product for reading, recall, spaced review, and browsing-time reflection.

## Product Positioning

Memorizer helps people who read a lot but struggle to recall the main points afterward.

The product combines:

- focused reading
- active recall
- spaced review
- article and source management
- browser-time analysis from Chrome, Edge, and Firefox
- local-first privacy controls

The core promise:

> Read with attention, recall without looking, and know what is actually staying in memory.

## Current Baseline

Already implemented:

- Memory Training page
- paste or clipboard-load passage input
- timed reading flow
- hidden-source recall phase
- hint and review flow
- bilingual Traditional Chinese / English UI
- Browsing Time page
- Chrome, Edge, and Firefox browsing data export
- imported JSON generated-time prompt
- local server update API
- category and hourly charts
- click chart bars to filter visit logs
- send visit content into memory training
- local-first safety documentation

## Phase 1: Article Library And Training Records

Goal: make every training session persist as a useful learning record.

Tasks:

- Add an article library view.
- Save articles with title, source URL, tags, created date, and last trained date.
- Save each recall attempt with typed recall text, score, confidence, and timestamp.
- Let users reopen previous articles for another training session.
- Add a simple article search and filter by tag/source/status.
- Add export/import for saved training data.

Success criteria:

- A user can save a passage and revisit it later.
- A user can see prior recall attempts for the same article.
- Training history survives browser refresh and app restart.

## Phase 2: Spaced Review

Goal: turn one-time recall into long-term memory practice.

Tasks:

- Add review states: New, Learning, Due, Mastered.
- Add spaced intervals: 1 day, 3 days, 7 days, 14 days, custom later.
- Let users mark recall quality after each session.
- Calculate next review date from score and confidence.
- Add a Due Today section.
- Add overdue review count in the main navigation.

Success criteria:

- A user knows what to review today.
- A completed recall session schedules the next review automatically.
- The app can distinguish new, learning, due, and mastered material.

## Phase 3: Better Recall Modes

Goal: support different kinds of memory training, not only free recall.

Tasks:

- Keep free recall as the default mode.
- Add "3 main points" mode.
- Add Q&A card mode.
- Add cloze deletion mode.
- Let users write or edit their own expected key points.
- Add a comparison screen for source text, user recall, and expected key points.
- Track common missed-point patterns.

Success criteria:

- A user can choose the recall style that fits the article.
- A user can compare recall against manually written key points.
- Missed content becomes visible and reusable for later review.

## Phase 4: Content Extraction Improvements

Goal: make imported web pages more useful as training material.

Tasks:

- Improve automatic main-content detection.
- Keep manual content region options: main, right, all.
- Extract title, canonical URL, author, and published date when available.
- Strip navigation, ads, related links, and repeated footer text.
- Support Markdown, TXT, and PDF import.
- Split long articles into smaller training blocks.

Success criteria:

- Visit-to-training usually produces readable article text.
- Long articles can be trained section by section.
- Non-browser sources can be added to the same article library.

## Phase 5: Browsing Time Productization

Goal: make Browsing Time a useful reflection tool, not only charts.

Tasks:

- Add weekly and monthly trends.
- Add Focus vs Distraction classification.
- Add custom category rules by domain, keyword, and optional regex.
- Allow category editing from visit rows.
- Add batch import from multiple JSON files.
- Deduplicate visits across imports.
- Add "add selected visits to training queue."

Success criteria:

- A user can understand where browsing time went across days and weeks.
- A user can fix wrong categories.
- Useful visited pages can become training material in batches.

## Phase 6: Personal Dashboard

Goal: give users a daily and weekly learning cockpit.

Tasks:

- Add today's reading count.
- Add today's recall count.
- Add due review count.
- Add retention or self-score trend.
- Add most-forgotten topics.
- Add training streak.
- Add weekly summary: what was read, what was recalled, what is due, and where browsing time went.

Success criteria:

- Opening the app immediately shows what matters today.
- Progress and memory gaps are visible without digging through logs.

## Phase 7: Data, Privacy, And Packaging

Goal: prepare for broader public use.

Tasks:

- Move persistent app data from localStorage to local SQLite or IndexedDB.
- Add explicit backup and restore.
- Add one-click clear private browsing data.
- Add a privacy review screen before exporting/sharing.
- Package as a desktop app with Tauri or Electron.
- Add Windows installer.
- Add demo data.
- Add onboarding for first-time users.
- Add screenshots or demo GIF to README.
- Add GitHub release checklist.

Success criteria:

- Non-technical users can install and run the app.
- Private browsing data stays local by default.
- The GitHub project looks understandable and trustworthy.

## Recommended Build Order

1. Article library and training records.
2. Spaced review.
3. Better recall modes.
4. Improved content extraction.
5. Browsing Time productization.
6. Personal dashboard.
7. Desktop packaging and release polish.

## Near-Term Next Sprint

Recommended next sprint: Phase 1.

Concrete first implementation slice:

- Add an article model in app state.
- Add "Save Article" from the Memory Training passage box.
- Add an Article Library section.
- Add saved recall attempts per article.
- Store data in localStorage first, with a clear migration path to IndexedDB or SQLite later.

Why this first:

- It directly strengthens the memory-training core.
- It makes the app useful beyond a single session.
- It creates the data foundation for spaced review and dashboard features.
