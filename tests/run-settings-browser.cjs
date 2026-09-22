const fs = require("node:fs");
const { spawn } = require("node:child_process");
const path = require("node:path");
(async () => {
 const profile=path.resolve("tests/.runtime/settings-cdp");
 const proc=spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",["--headless","--disable-gpu","--no-first-run","--remote-debugging-port=9337","--user-data-dir="+profile,"about:blank"],{windowsHide:true,stdio:"ignore"});
 let ws;
 try {
  let pages;
  for(let i=0;i<50;i++){try{pages=await(await fetch("http://127.0.0.1:9337/json")).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
  ws=new WebSocket(pages.find(p=>p.type==="page").webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let id=0;const pending=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
  const call=(method,params={})=>new Promise(resolve=>{const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}));});
  await call("Page.navigate",{url:"http://127.0.0.1:8765/"});
  await new Promise(r=>setTimeout(r,800));
  const result=await call("Runtime.evaluate",{expression:fs.readFileSync("tests/settings-browser.js","utf8"),awaitPromise:true,returnByValue:true});
  if(result.result?.exceptionDetails) throw new Error(JSON.stringify(result.result.exceptionDetails));
  const report=await call("Runtime.evaluate",{expression:"document.querySelector('#result')?.textContent",returnByValue:true});
  const text=report.result?.result?.value||"No result";
  console.log(text);
  if(!text.startsWith("PASS:")) process.exitCode=1;
  await call("Page.navigate",{url:"http://127.0.0.1:8765/"});
  await new Promise(r=>setTimeout(r,500));
  await call("Runtime.evaluate",{expression:"(async()=>{await MemorizerSettings.ready;document.querySelector('#settingsButton').click();})()",awaitPromise:true});
  const shot=await call("Page.captureScreenshot",{format:"png"});
  fs.writeFileSync("tests/.runtime/settings-preview.png",Buffer.from(shot.result.data,"base64"));
  await call("Browser.close");
 } finally { if(ws)ws.close();proc.kill(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
