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

## Integrated Product Loop

Browsing Time and Memory Training should not feel like two separate tools.

Browsing Time is the attention source:

- What did I spend time on?
- Which pages were probably worth remembering?
- Which visits are still unprocessed?
- Which visits became articles, training sessions, or reviews?

Memory Training is the retention system:

- What did I actually retain?
- What should I review next?
- Which topics keep slipping away?
- Which browsing categories are turning into durable knowledge?

The intended product loop:

1. Import browsing data from Chrome, Edge, or Firefox.
2. Review time spent by category, site, hour, or visit.
3. Select useful visits and convert them into saved articles.
4. Train recall from those articles.
5. Save recall attempts and missed points.
6. Schedule spaced review.
7. Compare browsing attention with retained knowledge.

Each browser visit should eventually have a learning status:

- Not reviewed
- Not useful
- Needs content
- Added to library
- Trained
- Due for review
- Mastered

Each saved article should keep its origin:

- source URL
- source browser
- source visit timestamp
- source category
- source visit ID when available
- extraction method: fetched page, clipboard, manual paste, PDF, Markdown, or text file

This makes the key product question visible:

> Did this browsing time become knowledge, or did it only become activity?

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

## Phase 1 First Implementation Slice

Implemented in the current local-first version:

- Article title field in Memory Training.
- Save Article from the passage box.
- Article Library panel with search/filter.
- Load saved articles back into Memory Training.
- Add browsing visits to Article Library from Visit Details.
- Visit learning status in the Visits table: Not reviewed, Needs content, Added, Trained.
- Recall attempts linked to saved articles.

Still remaining for the full phase:

- Tags and richer filters.
- Dedicated import/export for saved training data.
- Better article editing controls.
- Stronger migration path from localStorage to IndexedDB or SQLite.
## Phase 1: Article Library And Training Records

Goal: make browsing visits and training sessions persist as one useful learning record.

Tasks:

- Add an article library view.
- Save articles with title, source URL, source visit metadata, tags, created date, and last trained date.
- Save each recall attempt with typed recall text, score, confidence, and timestamp.
- Let users reopen previous articles for another training session.
- Add a simple article search and filter by tag/source/status.
- Add "Add to Library" from visit rows.
- Show whether a visit is Not reviewed, Added, Trained, Due, or Mastered.
- Add export/import for saved training data.

Success criteria:

- A user can save a passage and revisit it later.
- A user can see prior recall attempts for the same article.
- A user can tell which browsing visits became learning material.
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

Goal: make imported web pages more useful as training material, and make failed extraction recoverable.

Tasks:

- Improve automatic main-content detection.
- Keep manual content region options: main, right, all.
- Extract title, canonical URL, author, and published date when available.
- Strip navigation, ads, related links, and repeated footer text.
- Detect low-confidence or missing page content.
- Add a "Needs Content" state for visits that cannot be converted into useful text.
- Let users paste content into a visit or article manually.
- Add a clipboard-assisted repair flow: open the page, copy the useful part, then load clipboard into the article.
- Preserve page title, URL, domain, category, and visit time even when content cannot be fetched.
- Offer a lightweight note field so users can write what the page was about when extraction fails.
- Support Markdown, TXT, and PDF import.
- Split long articles into smaller training blocks.

Success criteria:

- Visit-to-training usually produces readable article text.
- Failed extraction is visible and recoverable instead of silently producing empty content.
- Long articles can be trained section by section.
- Non-browser sources can be added to the same article library.

## Phase 5: Browsing Time Productization

Goal: make Browsing Time a useful reflection tool and a reliable source of training material.

Tasks:

- Add weekly and monthly trends.
- Add Focus vs Distraction classification.
- Add custom category rules by domain, keyword, and optional regex.
- Allow category editing from visit rows.
- Add batch import from multiple JSON files.
- Deduplicate visits across imports.
- Add "add selected visits to training queue."
- Add filters for Not reviewed, Needs content, Added, Trained, Due, and Mastered.
- Show trained vs untrained time by category.

Success criteria:

- A user can understand where browsing time went across days and weeks.
- A user can fix wrong categories.
- Useful visited pages can become training material in batches.
- Browsing analysis shows which attention turned into training.

## Phase 6: Optional AI Assistance

Goal: let users connect AI services to help understand pages and evaluate recall quality, while keeping the product local-first and user-controlled.

Possible providers:

- ChatGPT / OpenAI
- Claude / Anthropic
- Gemini / Google
- local LLMs when available

AI-assisted page understanding:

- Summarize a fetched article into key points.
- Infer what a page is about from title, URL, metadata, and partial text when full content cannot be fetched.
- Suggest tags and categories.
- Detect whether a visit is likely worth memorizing.
- Generate candidate questions, cloze deletions, and three-main-point prompts.
- Mark low-confidence summaries clearly when the model only has partial content.

AI-assisted recall evaluation:

- Compare the user's recall against the source article or expected key points.
- Estimate recall coverage as a percentage.
- Identify missing main points.
- Separate minor wording differences from real conceptual gaps.
- Suggest what to review next.
- Produce a short feedback note without revealing the full answer too early.

Privacy and control requirements:

- AI features must be optional and off by default.
- The app should show exactly what text will be sent before sending it.
- Users should be able to choose provider, model, and whether API keys are stored locally.
- Browser history should never be sent in bulk by default.
- Prefer sending one selected article or recall attempt at a time.
- Keep a local-only mode that works without any AI login or API key.
- Store AI outputs with provider, model, timestamp, and source text version for auditability.

Product boundary:

AI should support memory training, not replace it. The user still performs active recall first. AI appears after recall to help judge coverage, reveal missed points, and prepare the next review.

Success criteria:

- A user can understand partially fetched pages better without pretending low-confidence guesses are facts.
- A user can get useful recall feedback without manually writing all expected key points.
- Private browsing data remains local unless the user explicitly sends selected content.

## Phase 7: Personal Dashboard

Goal: give users a daily and weekly learning cockpit.

Tasks:

- Add today's reading count.
- Add today's recall count.
- Add due review count.
- Add retention or self-score trend.
- Add most-forgotten topics.
- Add training streak.
- Add weekly summary: what was read, what was recalled, what is due, and where browsing time went.
- Add attention-to-retention metrics: browsing time, articles added, recall attempts, due reviews, and mastered items.
- Add "unconverted attention" section for high-time visits or categories that have not become articles.

Success criteria:

- Opening the app immediately shows what matters today.
- Progress and memory gaps are visible without digging through logs.
- The user can see the gap between time spent browsing and knowledge retained.

## Phase 8: Data, Privacy, And Packaging

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
4. Improved content extraction and missing-content repair.
5. Browsing Time productization.
6. Optional AI assistance.
7. Personal dashboard.
8. Desktop packaging and release polish.

## Near-Term Next Sprint

Recommended next sprint: Phase 1.

Concrete first implementation slice:

- Add an article model in app state.
- Add "Save Article" from the Memory Training passage box.
- Add "Add to Library" from the Visits table.
- Add an Article Library section.
- Add saved recall attempts per article.
- Track the learning status of visits imported from browsing data.
- Store data in localStorage first, with a clear migration path to IndexedDB or SQLite later.

Why this first:

- It directly strengthens the memory-training core.
- It makes browsing history and memory training part of the same loop.
- It makes the app useful beyond a single session.
- It creates the data foundation for spaced review and dashboard features.
