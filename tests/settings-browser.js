(async () => {
  const check = (value, message) => { if (!value) throw new Error(message); };
  const pause = () => new Promise(resolve=>setTimeout(resolve,80));
  try {
    await MemorizerSettings.ready;
    const button=document.querySelector("#settingsButton");
    button.click(); await pause();
    const dialog=document.querySelector("#settingsDialog");
    const form=document.querySelector("#settingsForm");
    check(dialog.open,"opens");
    form.elements.seconds.value="180";
    document.querySelector("#settingsCancel").click();
    check(!dialog.open && readSeconds.value!=="180","cancel does not apply");
    button.click(); await pause();
    form.elements.seconds.value="120";
    form.elements.points.value="3";
    form.elements.startPage.value="chrome";
    form.elements.language.value="en";
    const folder = await navigator.storage.getDirectory();
    const testFolder=await folder.getDirectoryHandle("memorizer-settings-test",{create:true});
    window.showDirectoryPicker=async()=>testFolder;
    const choose=document.querySelector("#chooseSettingsFolder");choose.disabled=false;
    choose.click();await pause();
    form.requestSubmit(); await pause();
    check(!dialog.open,"save closes");
    check(readSeconds.value==="120" && targetPoints.value==="3","defaults applied");
    check(JSON.parse(localStorage.getItem("memorizer.settings")).startPage==="chrome","start persisted");
    check(currentLanguage==="en","language applied");
    await exportTrainingData();
    let found=false;
    for await (const [name, handle] of testFolder.entries()) {
      if(name.startsWith("memorizer-training-")) {
        const payload=JSON.parse(await (await handle.getFile()).text());
        check(payload.app==="Memorizer" && payload.schemaVersion===2,"actual saved backup");
        found=true;
      }
    }
    check(found,"file exists in chosen directory");
    button.click();await pause();
    check(document.querySelector("#settingsFolder").value==="memorizer-settings-test","folder persisted");
    document.querySelector("#resetSettingsFolder").click();
    form.requestSubmit(); await pause();
    check(await MemorizerSettings.saveBackup(new Blob(["test"]),"unused.json")===false,"download fallback");
    localStorage.removeItem("memorizer.settings");localStorage.removeItem("memorizer.language");
    document.body.innerHTML="<pre id='result'>PASS: popup, cancel, saved defaults, language, folder selection, actual JSON write, download fallback</pre>";
  } catch(error) {
    document.body.innerHTML="<pre id='result'></pre>";
    document.querySelector("#result").textContent="FAIL: "+error.stack+"; "+document.querySelector("#settingsStatus")?.textContent;
  }
})();
