#!/usr/bin/env python3
"""Export browser history to JSON for the Memorizer dashboard."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import sqlite3
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen


CHROME_EPOCH = dt.datetime(1601, 1, 1, tzinfo=dt.timezone.utc)
SUPPORTED_BROWSERS = {"chrome", "edge", "firefox"}

CATEGORY_RULES = [
    ("AI/技術", re.compile(r"openai|chatgpt|claude|gemini|perplexity|github|stackoverflow|developer|npm|python|react|vercel|cursor|anthropic", re.I)),
    ("學習/文件", re.compile(r"wikipedia|docs\.|coursera|udemy|edx|medium|substack|notion|readwise|obsidian|arxiv", re.I)),
    ("影片/娛樂", re.compile(r"youtube|netflix|bilibili|twitch|disney|hulu|vimeo|spotify|podcast", re.I)),
    ("社群", re.compile(r"x\.com|twitter|facebook|instagram|threads|reddit|discord|linkedin|tiktok", re.I)),
    ("新聞/資訊", re.compile(r"news|nytimes|bbc|cnn|reuters|bloomberg|wsj|hacker news|hn\.algolia|ycombinator", re.I)),
    ("購物", re.compile(r"amazon|shop|store|ebay|etsy|costco|target|walmart|bestbuy", re.I)),
    ("工作/工具", re.compile(r"gmail|mail|calendar|docs\.google|drive\.google|slack|trello|asana|jira|figma|miro|zoom", re.I)),
    ("金融", re.compile(r"bank|chase|amex|paypal|stripe|coinbase|binance|tradingview|finance|broker", re.I)),
    ("旅遊/地圖", re.compile(r"maps|booking|airbnb|expedia|tripadvisor|uber|lyft|airline|flight", re.I)),
]


class ReadableTextParser(HTMLParser):
    void_tags = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
    candidate_tags = {"article", "main", "section", "div", "p", "li", "td"}
    skip_tags = {"script", "style", "noscript", "svg", "canvas", "select", "template"}
    blocked_tags = {"header", "footer", "nav", "aside", "form"}
    bad_attrs = re.compile(r"nav|menu|footer|header|sidebar|comment|related|promo|advert|cookie|popup|modal|share|social", re.I)
    good_attrs = re.compile(r"article|body|content|entry|main|page|post|primary|read|story|text", re.I)
    right_attrs = re.compile(r"right|rhs|main|content|article|post|primary|reader", re.I)
    left_attrs = re.compile(r"left|lhs|sidebar|nav|menu|aside", re.I)

    def __init__(self, region: str) -> None:
        super().__init__()
        self.region = region
        self.stack: list[dict] = []
        self.candidates: list[dict] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in self.void_tags:
            if tag in {"br", "hr"}:
                self.handle_data("\n")
            return
        attr_text = " ".join(value or "" for name, value in attrs if name in {"class", "id", "role", "itemprop"})
        parent_blocked = self.stack[-1]["blocked"] if self.stack else False
        blocked = parent_blocked or tag in self.blocked_tags or bool(self.bad_attrs.search(attr_text))
        self.stack.append({"tag": tag, "attrs": attr_text, "text": [], "blocked": blocked})
        if tag in self.skip_tags:
            self.skip_depth += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag.lower() not in self.void_tags:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if not any(frame["tag"] == tag for frame in self.stack):
            return
        if tag in self.skip_tags and self.skip_depth:
            self.skip_depth -= 1
        while self.stack:
            frame = self.stack.pop()
            if frame["tag"] in self.candidate_tags and not frame["blocked"]:
                text = self.clean_text(" ".join(frame["text"]))
                if len(text) >= 35:
                    self.candidates.append(
                        {
                            "tag": frame["tag"],
                            "attrs": frame["attrs"],
                            "text": text,
                            "score": self.score(frame["tag"], frame["attrs"], text),
                        }
                    )
            if frame["tag"] == tag:
                break

    def handle_data(self, data: str) -> None:
        text = re.sub(r"\s+", " ", data).strip()
        if not self.skip_depth and len(text) >= 2:
            if any(frame["blocked"] for frame in self.stack):
                return
            for frame in self.stack:
                frame["text"].append(text)

    def text(self, max_chars: int) -> str:
        if not self.candidates:
            return ""
        ranked = sorted(self.candidates, key=lambda item: item["score"], reverse=True)
        best = ranked[0]["text"]
        return self.clean_text(best)[:max_chars]

    def score(self, tag: str, attrs: str, text: str) -> float:
        words = re.findall(r"\w+", text)
        linkish = len(re.findall(r"https?://|登入|註冊|分享|訂閱|廣告|cookie|privacy", text, re.I))
        score = len(text) + len(words) * 6 - linkish * 80
        if tag in {"article", "main"}:
            score += 900
        if self.good_attrs.search(attrs):
            score += 700
        if self.bad_attrs.search(attrs):
            score -= 1200
        if self.region == "right":
            if self.right_attrs.search(attrs):
                score += 1000
            if self.left_attrs.search(attrs):
                score -= 1000
        return score

    @staticmethod
    def clean_text(text: str) -> str:
        lines = [line.strip() for line in re.split(r"[\r\n]+|(?<=[。！？!?])\s+", text)]
        lines = [line for line in lines if len(line) >= 2]
        return "\n".join(dict.fromkeys(lines))


def chromium_history_path(browser: str, profile: str) -> Path:
    local_app_data = os.environ.get("LOCALAPPDATA")
    if not local_app_data:
        raise RuntimeError("LOCALAPPDATA is not set; cannot find Chromium browser profile directory.")
    roots = {
        "chrome": Path(local_app_data) / "Google" / "Chrome" / "User Data",
        "edge": Path(local_app_data) / "Microsoft" / "Edge" / "User Data",
    }
    return roots[browser] / profile / "History"


def firefox_history_path(profile: str | None) -> Path:
    app_data = os.environ.get("APPDATA")
    if not app_data:
        raise RuntimeError("APPDATA is not set; cannot find Firefox profile directory.")
    profiles_root = Path(app_data) / "Mozilla" / "Firefox" / "Profiles"
    if profile:
        return profiles_root / profile / "places.sqlite"
    candidates = sorted(profiles_root.glob("*.default-release/places.sqlite"))
    candidates.extend(sorted(profiles_root.glob("*.default/places.sqlite")))
    candidates.extend(sorted(profiles_root.glob("*/places.sqlite")))
    if not candidates:
        raise FileNotFoundError(f"Firefox places.sqlite not found under {profiles_root}")
    return candidates[0]


def chrome_time_to_datetime(value: int) -> dt.datetime:
    return CHROME_EPOCH + dt.timedelta(microseconds=value)


def datetime_to_chrome_time(value: dt.datetime) -> int:
    if value.tzinfo is None:
        value = value.astimezone()
    return int((value.astimezone(dt.timezone.utc) - CHROME_EPOCH).total_seconds() * 1_000_000)


def datetime_to_unix_microseconds(value: dt.datetime) -> int:
    if value.tzinfo is None:
        value = value.astimezone()
    return int(value.astimezone(dt.timezone.utc).timestamp() * 1_000_000)


def parse_datetime(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        parsed = parsed.astimezone()
    return parsed


def domain_from_url(url: str) -> str:
    host = urlparse(url).hostname or ""
    return host.removeprefix("www.") or "未知網站"


def classify_visit(domain: str, title: str, url: str) -> str:
    haystack = f"{domain} {title} {url}"
    for category, pattern in CATEGORY_RULES:
        if pattern.search(haystack):
            return category
    return "其他"


def json_ld_article_body(html: str, max_chars: int) -> str:
    bodies = re.findall(r'"articleBody"\s*:\s*"((?:\\.|[^"\\])*)"', html, flags=re.I)
    if not bodies:
        return ""
    try:
        decoded = json.loads('"' + bodies[0] + '"')
    except (ValueError, TypeError):
        return ""
    return ReadableTextParser.clean_text(decoded)[:max_chars]


def fetch_readable_content(url: str, timeout: float, max_chars: int, region: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return ""
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 Memorizer/1.0",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            content_type = response.headers.get("content-type", "")
            if "html" not in content_type.lower():
                return ""
            raw = response.read(2_500_000)
    except Exception:
        return ""

    html = raw.decode("utf-8", errors="ignore")
    structured_body = json_ld_article_body(html, max_chars)
    if structured_body:
        return structured_body

    parser = ReadableTextParser(region)
    try:
        parser.feed(html)
        parser.close()
    except Exception:
        return ""
    return parser.text(max_chars)


def estimate_durations(rows: list[dict], max_gap_seconds: int) -> None:
    ordered = sorted(rows, key=lambda row: row["visitedAt"])
    for index, row in enumerate(ordered):
        if index + 1 >= len(ordered):
            row["durationSeconds"] = 0
            continue
        current = dt.datetime.fromisoformat(row["visitedAt"])
        next_visit = dt.datetime.fromisoformat(ordered[index + 1]["visitedAt"])
        gap = max(0, int((next_visit - current).total_seconds()))
        row["durationSeconds"] = min(gap, max_gap_seconds)


def query_chromium_rows(copy_path: Path, start: dt.datetime, end: dt.datetime) -> list[sqlite3.Row]:
    connection = sqlite3.connect(copy_path)
    connection.row_factory = sqlite3.Row
    rows = connection.execute(
        """
        SELECT
          visits.id,
          visits.visit_time,
          urls.url,
          urls.title,
          urls.visit_count,
          urls.typed_count
        FROM visits
        JOIN urls ON urls.id = visits.url
        WHERE visits.visit_time BETWEEN ? AND ?
        ORDER BY visits.visit_time ASC
        """,
        (datetime_to_chrome_time(start), datetime_to_chrome_time(end)),
    ).fetchall()
    connection.close()
    return rows


def query_firefox_rows(copy_path: Path, start: dt.datetime, end: dt.datetime) -> list[sqlite3.Row]:
    connection = sqlite3.connect(copy_path)
    connection.row_factory = sqlite3.Row
    rows = connection.execute(
        """
        SELECT
          moz_historyvisits.id,
          moz_historyvisits.visit_date,
          moz_places.url,
          moz_places.title,
          moz_places.visit_count,
          0 AS typed_count
        FROM moz_historyvisits
        JOIN moz_places ON moz_places.id = moz_historyvisits.place_id
        WHERE moz_historyvisits.visit_date BETWEEN ? AND ?
        ORDER BY moz_historyvisits.visit_date ASC
        """,
        (datetime_to_unix_microseconds(start), datetime_to_unix_microseconds(end)),
    ).fetchall()
    connection.close()
    return rows


def browser_history_path(browser: str, profile: str | None, explicit_path: str | None) -> Path:
    if explicit_path:
        return Path(explicit_path)
    if browser == "firefox":
        firefox_profile = None if not profile or profile == "Default" else profile
        return firefox_history_path(firefox_profile)
    return chromium_history_path(browser, profile or "Default")


def visit_datetime(browser: str, row: sqlite3.Row) -> dt.datetime:
    if browser == "firefox":
        return dt.datetime.fromtimestamp(row["visit_date"] / 1_000_000, tz=dt.timezone.utc)
    return chrome_time_to_datetime(row["visit_time"])


def export_history(args: argparse.Namespace) -> dict:
    browser = args.browser.lower()
    if browser not in SUPPORTED_BROWSERS:
        raise ValueError(f"Unsupported browser: {browser}")

    source = browser_history_path(browser, args.profile, args.history_path)
    if not source.exists():
        raise FileNotFoundError(f"{browser.title()} history database not found: {source}")

    end = parse_datetime(args.end) if args.end else dt.datetime.now().astimezone()
    start = parse_datetime(args.start) if args.start else end - dt.timedelta(days=args.days)

    with tempfile.TemporaryDirectory() as tmpdir:
        copy_path = Path(tmpdir) / source.name
        shutil.copy2(source, copy_path)
        rows = query_firefox_rows(copy_path, start, end) if browser == "firefox" else query_chromium_rows(copy_path, start, end)

    visits = []
    seen_content_urls: set[str] = set()
    for row in rows:
        url = row["url"]
        title = row["title"] or "(無標題)"
        domain = domain_from_url(url)
        visit = {
            "id": row["id"],
            "visitedAt": visit_datetime(browser, row).astimezone().replace(microsecond=0).isoformat(),
            "url": url,
            "title": title,
            "domain": domain,
            "category": classify_visit(domain, title, url),
            "durationSeconds": 0,
            "visitCount": row["visit_count"],
            "typedCount": row["typed_count"],
        }
        if args.fetch_content and url not in seen_content_urls:
            visit["content"] = fetch_readable_content(url, args.fetch_timeout, args.content_chars, args.content_region)
            seen_content_urls.add(url)
        visits.append(visit)

    estimate_durations(visits, args.max_gap_seconds)
    return {
        "exportedAt": dt.datetime.now().astimezone().replace(microsecond=0).isoformat(),
        "browser": browser,
        "source": str(source),
        "start": start.replace(microsecond=0).isoformat(),
        "end": end.replace(microsecond=0).isoformat(),
        "visits": visits,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Export browser history as Memorizer JSON.")
    parser.add_argument("--browser", choices=sorted(SUPPORTED_BROWSERS), default="chrome", help="Browser history source.")
    parser.add_argument("--profile", default="Default", help="Profile directory. Chrome/Edge: Default or Profile 1. Firefox: exact profile folder, or omit for default.")
    parser.add_argument("--history-path", help="Explicit path to a browser history SQLite file.")
    parser.add_argument("--days", type=int, default=7, help="Days to export when --start is not provided.")
    parser.add_argument("--start", help="Start datetime, e.g. 2026-09-01T00:00:00.")
    parser.add_argument("--end", help="End datetime, defaults to now.")
    parser.add_argument("--max-gap-seconds", type=int, default=1800, help="Cap inferred dwell time per visit.")
    parser.add_argument("--fetch-content", action="store_true", help="Fetch readable page text for each HTTP(S) URL.")
    parser.add_argument("--content-region", choices=["main", "right", "all"], default="main", help="Readable content preference. Use right for right-column article layouts.")
    parser.add_argument("--fetch-timeout", type=float, default=4.0, help="Seconds to wait for each page fetch.")
    parser.add_argument("--content-chars", type=int, default=8000, help="Maximum fetched text characters per visit.")
    parser.add_argument("--output", default="browser_history_export.json", help="Output JSON path.")
    args = parser.parse_args()

    payload = export_history(args)
    output_path = Path(args.output)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(payload['visits'])} {payload['browser']} visits to {output_path}")


if __name__ == "__main__":
    main()
