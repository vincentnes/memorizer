/* Pure content operations shared by the browser and Node tests. */
(function (root) {
  "use strict";
  function splitText(text, limit = 1200) {
    if (!Number.isInteger(limit) || limit < 100) throw new Error("Invalid section size");
    const points = Array.from(text.trim());
    const chunks = [];
    while (points.length) {
      let end = Math.min(limit, points.length);
      if (end < points.length) {
        for (let i = end - 1; i >= Math.floor(limit / 2); i--) {
          if (/[\n。！？.!?]/u.test(points[i])) { end = i + 1; break; }
        }
      }
      chunks.push(points.splice(0, end).join(""));
    }
    return chunks;
  }
  function quality(text) {
    if (!text.trim()) return "empty";
    if (Array.from(text.trim()).length < 120) return "short";
    if (/access denied|verify you are human|enable javascript|captcha|拒絕存取|請先登入/i.test(text)) return "blocked";
    return "unchecked";
  }
  function readTextFile(name, text, size) {
    if (!/\.(txt|md|markdown)$/i.test(name)) throw new Error("fileType");
    if (size > 1024 * 1024) throw new Error("fileSize");
    const content = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
    if (!content || content.includes("\0") || content.includes("\uFFFD")) throw new Error("fileEncoding");
    return {
      title: content.match(/^#\s+(.+)$/m)?.[1]?.trim() || name.replace(/\.[^.]+$/, ""),
      content, sourceFileName: name,
      extractionMethod: /\.(md|markdown)$/i.test(name) ? "markdown" : "textFile",
    };
  }
  function revisionFields(previous, content, now) {
    const version = previous?.contentVersion || 1;
    if (!previous || previous.content === content) {
      return { contentVersion: version, revisions: previous?.revisions || [] };
    }
    return {
      contentVersion: version + 1,
      revisions: [...(previous.revisions || []), {
        id: previous.id + ":" + version + ":" + now,
        version, content: previous.content || "", savedAt: now,
      }],
    };
  }
  const api = { splitText, quality, readTextFile, revisionFields };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MemoryContent = api;
})(globalThis);
