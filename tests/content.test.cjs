const assert = require("node:assert/strict");
const { splitText, readTextFile, revisionFields, quality } = require("../memory-content.js");
for (const source of ["段落。".repeat(1800), "😀".repeat(2501), ("A sentence.\n\nAnother paragraph.\n").repeat(200)]) {
  const parts = splitText(source);
  assert.equal(parts.join(""),source.trim());
  assert.ok(parts.every(part=>Array.from(part).length <= 1200));
  assert.ok(parts.every(part=>!part.includes("\uFFFD")));
}
assert.throws(()=>readTextFile("bad.pdf","data",4));
assert.throws(()=>readTextFile("bad.txt","",0));
assert.throws(()=>readTextFile("bad.txt","\uFFFD",3));
assert.throws(()=>readTextFile("large.md","test",1048577));
assert.equal(readTextFile("note.md","\uFEFF# 標題\r\n\r\n內容",40).title,"標題");
assert.equal(readTextFile("note.txt","<script>alert(1)</script>",30).content,"<script>alert(1)</script>");
const original={id:"a",content:"old",contentVersion:1,revisions:[]};
assert.equal(revisionFields(original,"old","today").contentVersion,1);
const changed=revisionFields(original,"new","today");
assert.equal(changed.contentVersion,2);
assert.equal(changed.revisions[0].content,"old");
assert.equal(original.revisions.length,0);
assert.equal(quality(""),"empty");
assert.equal(quality("short note"),"short");
assert.equal(quality("Verify you are human ".repeat(30)),"blocked");
console.log("PASS: lossless Unicode splitting, text formats, encoding/size limits, version snapshots, quality hints");
