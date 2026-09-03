#!/usr/bin/env python3
"""Backward-compatible wrapper for export_browser_history.py."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools.export_browser_history import export_history, main


if __name__ == "__main__":
    main()
