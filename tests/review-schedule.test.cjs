const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("app.js", "utf8");
const context = vm.createContext({ Date, JSON, Number });
for (const name of ["addDays", "calculateReviewSchedule", "isReviewDue", "latestMissingPoints"]) {
  const start = source.indexOf("function " + name + "(");
  assert.ok(start >= 0);
  vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), context);
}
const schedule = (score, days) => context.calculateReviewSchedule(score, 5, {}, days);
assert.equal(schedule(1).intervalDays, 1);
assert.equal(schedule(4).intervalDays, 3);
for (const days of [1, 7, 365]) {
  const result = schedule(1, days);
  assert.equal(result.intervalDays, days);
  assert.equal(result.status, "learning");
  const expected = context.addDays(new Date(), days);
  assert.ok(Math.abs(new Date(result.nextReviewAt) - expected) < 1000);
}
for (const invalid of [0, -1, 366, 1.5, NaN, "7"]) {
  assert.equal(schedule(4, invalid).intervalDays, 3);
}
console.log("PASS: automatic and custom review intervals, bounds, next date, unchanged mastery rules");
const oldTimezone = process.env.TZ;
try {
  for (const timezone of ["UTC", "America/Los_Angeles", "Asia/Taipei"]) {
    process.env.TZ = timezone;
    const now = new Date(2026, 9, 5, 0, 1);
    assert.equal(context.isReviewDue({ nextReviewAt: new Date(2026, 9, 5, 23).toISOString() }, now), true);
    assert.equal(context.isReviewDue({ nextReviewAt: new Date(2026, 9, 4).toISOString() }, now), true);
    assert.equal(context.isReviewDue({ nextReviewAt: new Date(2026, 9, 6).toISOString() }, now), false);
    assert.equal(context.isReviewDue({ nextReviewAt: "invalid" }, now), false);
    assert.equal(context.isReviewDue({}, now), false);
    for (const date of [new Date(2026, 2, 7, 12), new Date(2026, 9, 31, 12)]) {
      const next = context.addDays(date, 1);
      assert.equal(next.getHours(), 12);
      assert.equal(next.getDate(), date.getDate() === 31 ? 1 : date.getDate() + 1);
    }
  }
} finally {
  if (oldTimezone === undefined) delete process.env.TZ;
  else process.env.TZ = oldTimezone;
}
assert.equal(context.latestMissingPoints({ contentVersion: 2, attempts: [
  {contentVersion: 1, createdAt: "2026-10-05", missing: "Old source"},
  {contentVersion: 2, createdAt: "2026-10-03", missing: "Earlier"},
  {contentVersion: 2, createdAt: "2026-10-04", missing: "Latest"}
] }), "Latest");
assert.equal(context.latestMissingPoints({attempts: [{missing: ""}, {missing: "Resolved"}]}), "");
assert.equal(context.latestMissingPoints({contentVersion: 2, attempts: [{contentVersion: 1, missing: "Old"}]}), "");
console.log("PASS: local-day due dates, overdue, timezone/DST transitions, version-scoped missed points");
