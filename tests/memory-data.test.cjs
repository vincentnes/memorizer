const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("app.js", "utf8");
const data = new Map();
const node = () => ({ value: "", textContent: "", focus() {} });
const context = {
  console, Date, Map, JSON, MemoryContent: require("../memory-content.js"),
  renderDueReviews(){}, updateMemoryModeDueCount(){}, renderContentContext(article){ context.sourceContext.textContent = article.sourceUrl || ""; },
  localStorage: { getItem:k=>data.get(k) ?? null, setItem:(k,v)=>data.set(k,v), removeItem:k=>data.delete(k) },
  currentArticleId: null, currentSourceVisit: null,
  expectedPointsInput:node(), recallMode:node(),
  sourceText:node(), articleTitleInput:node(), articleTagsInput:node(), impressionInput:node(),
  sourceContext:node(), clipboardStatus:node(), browserSelect:node(), trainingDataFile:node(),
  renderArticleLibrary(){}, render(){}, refreshLearningViews(){},
  resetMemoryRound(){}, setAppMode(){}, t:key=>key,
};
vm.createContext(context);
for (const name of ["addDays","calculateReviewSchedule","loadArticles","saveArticles","loadMemoryHistory","saveMemoryHistory","parseTags","mergeRecords","mergeArticles","parseTrainingBackup","importTrainingData","createId","sourceVisitKey","inferArticleTitle","getCleanSource","findArticleForVisit","saveCurrentArticle","saveVisitToLibrary","loadArticleIntoTrainer"]) {
  const marker = source.includes("async function "+name+"(") ? "async function " : "function ";
  const start = source.indexOf(marker + name + "(");
  assert.ok(start >= 0, name);
  const end = source.indexOf("\n}", start) + 2;
  vm.runInContext(source.slice(start,end),context);
}
const run = code => vm.runInContext(code,context);
(async () => {
  run('articleTitleInput.value="Custom title"; articleTagsInput.value="memory, 工作, memory"; impressionInput.value="An important connection"; sourceText.value="Real content"; saveCurrentArticle()');
  let article = JSON.parse(data.get("memorizer.articles"))[0];
  assert.equal(article.title,"Custom title");
  assert.deepEqual(article.tags,["memory","工作"]);
  assert.equal(article.impression,"An important connection");
  context.saved = article;
  run('articleTagsInput.value=""; impressionInput.value=""; loadArticleIntoTrainer(saved)');
  assert.equal(context.articleTagsInput.value,"memory, 工作");
  assert.equal(context.impressionInput.value,article.impression);
  const visit = {url:"https://example.test/article", title:"Missing", browser:"test", visitedAt:"2026-09-16", content:""};
  context.visit=visit;
  run("saveVisitToLibrary(visit)");
  assert.equal(context.impressionInput.value,article.impression,"background save preserves draft");
  let missing=JSON.parse(data.get("memorizer.articles")).find(x=>x.sourceUrl===visit.url);
  assert.equal(missing.impression,"","draft does not leak into another article");
  context.missing=missing;
  run("loadArticleIntoTrainer(missing)");
  assert.equal(context.sourceText.value,"","missing content is not placeholder text");
  assert.equal(context.sourceContext.textContent,visit.url);
  run('sourceText.value="Repaired text"; impressionInput.value="Keep me"; articleTagsInput.value="fixed"; saveCurrentArticle()');
  let repaired=JSON.parse(data.get("memorizer.articles")).find(x=>x.id===missing.id);
  assert.equal(repaired.content,"Repaired text");
  assert.equal(repaired.sourceUrl,visit.url);
  assert.equal(repaired.extractionMethod,"manualPaste");
  run("saveVisitToLibrary(visit)");
  assert.equal(JSON.parse(data.get("memorizer.articles")).find(x=>x.id===missing.id).impression,"Keep me");
  const backup={schemaVersion:2,app:"Memorizer",articles:JSON.parse(data.get("memorizer.articles")),sessions:[]};
  data.clear();
  await context.importTrainingData({target:{files:[{text:async()=>JSON.stringify(backup)}]}});
  assert.equal(JSON.parse(data.get("memorizer.articles")).length,2);
  await context.importTrainingData({target:{files:[{text:async()=>JSON.stringify(backup)}]}});
  assert.equal(JSON.parse(data.get("memorizer.articles")).length,2,"reimport is idempotent");
  context.existing=[{id:"a",updatedAt:"2026-09-16",impression:"new",attempts:[{id:"one"}]}];
  context.incoming=[{id:"a",updatedAt:"2026-09-01",impression:"old",attempts:[{id:"two"}]}];
  const merged=run("mergeArticles(existing,incoming)");
  assert.equal(merged[0].impression,"new");
  assert.equal(merged[0].attempts.length,2);
  assert.equal(context.parseTrainingBackup({schemaVersion:1,articles:[{id:"old",content:"legacy"}]}).articles[0].impression,"");
  assert.throws(()=>context.parseTrainingBackup({schemaVersion:99,articles:[]}));
  assert.throws(()=>context.parseTrainingBackup({articles:[{id:"bad",tags:[1]}]}));
  const original=data.get("memorizer.articles");
  let failOnce=true;
  context.localStorage.setItem=(k,v)=>{
    if(k==="memorizer.sessions" && failOnce){ failOnce=false; throw new Error("quota"); }
    data.set(k,v);
  };
  await context.importTrainingData({target:{files:[{text:async()=>JSON.stringify({schemaVersion:2,articles:[{id:"extra",content:"test"}],sessions:[]})}]}});
  assert.equal(data.get("memorizer.articles"),original,"failed second write restores articles");
  assert.throws(()=>context.parseTrainingBackup({articles:[{id:"bad",expectedPoints:[1]}]}));
  context.expectedPointsInput.value="First\nSecond\nThird";
  context.recallMode.value="threePoints";
  run('saveCurrentArticle()');
  const withPoints=JSON.parse(data.get("memorizer.articles")).find(a=>a.id===context.currentArticleId);
  assert.deepEqual(withPoints.expectedPoints,["First","Second","Third"]);
  assert.equal(context.parseTrainingBackup({schemaVersion:2,articles:[withPoints]}).articles[0].recallMode,"threePoints");
  const schedule=context.calculateReviewSchedule;
  assert.equal(schedule(5,5,{}).status,"learning");
  assert.equal(schedule(5,5,{}).intervalDays,3);
  const prior={contentVersion:1,attempts:[{score:5,createdAt:"2026-09-21"},{score:4,createdAt:"2026-09-20"}]};
  assert.equal(schedule(4,5,prior).status,"mastered");
  assert.equal(schedule(4,5,prior).intervalDays,14);
  assert.equal(schedule(1,5,prior).intervalDays,1);
  assert.equal(schedule(1,5,prior).status,"learning");
  assert.equal(schedule(5,5,{...prior,contentVersion:2}).strongStreak,1);
  assert.equal(schedule(5,5,{...prior,expectedPoints:["new"]}).strongStreak,1);
  assert.equal(schedule(5,5,{attempts:[{score:1,createdAt:"2026-09-22"},...prior.attempts]}).strongStreak,1);
  console.log("PASS: metadata, reload, repair, draft isolation, duplicate capture, v1/v2 restore, merge, validation, import rollback");
})().catch(error=>{console.error(error);process.exitCode=1;});
