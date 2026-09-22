/* Settings and user-authorized backup destination. */
(() => {
  const key = "memorizer.settings";
  const defaults = { language: currentLanguage, startPage: "memory", readSeconds: 90, targetPoints: 4 };
  let preferences;
  try { preferences = { ...defaults, ...JSON.parse(localStorage.getItem(key) || "{}") }; }
  catch { preferences = { ...defaults }; }
  let savedFolder = null;
  let draftFolder = null;
  const dialog = document.querySelector("#settingsDialog");
  const form = document.querySelector("#settingsForm");
  const status = document.querySelector("#settingsStatus");
  const folderLabel = document.querySelector("#settingsFolder");
  const labels = {
    zh: { title: "設定", general: "一般", language: "介面語言", startPage: "啟動頁面", memory: "記憶訓練", browsing: "瀏覽時間",
      practice: "閱讀預設值", seconds: "閱讀秒數", points: "目標重點", storage: "檔案儲存",
      folder: "預設匯出資料夾", choose: "選擇資料夾", resetFolder: "使用瀏覽器下載",
      download: "瀏覽器預設下載位置", help: "匯出訓練資料時使用此資料夾。日常編輯仍自動保存在此瀏覽器，請定期匯出備份。",
      unsupported: "此瀏覽器不支援資料夾選擇，匯出時會使用瀏覽器下載。請在 Chrome 或 Edge 開啟本機網站以選擇資料夾。",
      permission: "下次儲存時，瀏覽器可能再次要求資料夾授權。", save: "儲存設定", cancel: "取消",
      saved: "設定已儲存", denied: "未取得資料夾寫入權限；請重新選擇資料夾或改用瀏覽器下載。", close: "關閉設定" },
    en: { title: "Settings", general: "General", language: "Language", startPage: "Start page", memory: "Memory Training", browsing: "Browsing Time",
      practice: "Reading defaults", seconds: "Reading seconds", points: "Target points", storage: "File storage",
      folder: "Default export folder", choose: "Choose folder", resetFolder: "Use browser downloads",
      download: "Browser download location", help: "Training exports use this folder. Everyday edits still save in this browser; export backups regularly.",
      unsupported: "Folder selection is unavailable here. Exports use browser downloads. Open the local website in Chrome or Edge to choose a folder.",
      permission: "Your browser may ask for folder access again when saving.", save: "Save settings", cancel: "Cancel",
      saved: "Settings saved", denied: "Folder write permission was not granted. Choose the folder again or use browser downloads.", close: "Close settings" }
  };
  const msg = name => labels[currentLanguage === "en" ? "en" : "zh"][name];
  function folderStore(mode, value) {
    return new Promise((resolve, reject) => {
      const open = indexedDB.open("memorizer.preferences", 1);
      open.onupgradeneeded = () => open.result.createObjectStore("settings");
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result;
        const tx = db.transaction("settings", mode === "read" ? "readonly" : "readwrite");
        const store = tx.objectStore("settings");
        const request = mode === "read" ? store.get("exportFolder")
          : value ? store.put(value, "exportFolder") : store.delete("exportFolder");
        tx.oncomplete = () => { db.close(); resolve(request.result || null); };
        tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error("Settings storage failed")); };
      };
    });
  }
  function showFolder() {
    folderLabel.value = draftFolder ? draftFolder.name : msg("download");
  }
  function refreshLabels() {
    document.querySelectorAll("[data-settings-label]").forEach(el => {
      el.textContent = msg(el.dataset.settingsLabel);
    });
    const button = document.querySelector("#settingsButton");
    button.title = msg("title");
    button.setAttribute("aria-label", msg("title"));
    document.querySelector("#settingsClose").setAttribute("aria-label", msg("close"));
    document.querySelector("#settingsFolderHint").textContent =
      typeof window.showDirectoryPicker === "function" ? msg("permission") : msg("unsupported");
    showFolder();
  }
  const ready = folderStore("read").then(value => { savedFolder = value; }).catch(() => {});
  document.querySelector("#settingsButton").addEventListener("click", async () => {
    await ready;
    draftFolder = savedFolder;
    form.elements.language.value = currentLanguage;
    form.elements.startPage.value = preferences.startPage;
    form.elements.seconds.value = preferences.readSeconds;
    form.elements.points.value = preferences.targetPoints;
    status.textContent = "";
    refreshLabels();
    dialog.showModal();
  });
  document.querySelector("#settingsClose").addEventListener("click", () => dialog.close());
  document.querySelector("#settingsCancel").addEventListener("click", () => dialog.close());
  const choose = document.querySelector("#chooseSettingsFolder");
  choose.disabled = typeof window.showDirectoryPicker !== "function";
  choose.addEventListener("click", async () => {
    try {
      draftFolder = await window.showDirectoryPicker({ id: "memorizer-backups", mode: "readwrite" });
      showFolder();
      status.textContent = "";
    } catch (error) {
      if (error.name !== "AbortError") status.textContent = error.message;
    }
  });
  document.querySelector("#resetSettingsFolder").addEventListener("click", () => {
    draftFolder = null;
    showFolder();
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const next = {
      language: form.elements.language.value,
      startPage: form.elements.startPage.value,
      readSeconds: Number(form.elements.seconds.value),
      targetPoints: Number(form.elements.points.value),
    };
    const saveButton = document.querySelector("#saveSettingsButton");
    saveButton.disabled = true;
    const previous = localStorage.getItem(key);
    const previousLanguage = localStorage.getItem("memorizer.language");
    try {
      localStorage.setItem(key, JSON.stringify(next));
      localStorage.setItem("memorizer.language", next.language);
      if (draftFolder !== savedFolder) await folderStore("write", draftFolder);
      preferences = next;
      savedFolder = draftFolder;
      currentLanguage = next.language;
      readSeconds.value = next.readSeconds;
      targetPoints.value = next.targetPoints;
      applyLanguage();
      dialog.close();
      clipboardStatus.textContent = msg("saved");
    } catch (error) {
      for (const [k, v] of [[key, previous], ["memorizer.language", previousLanguage]]) {
        if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
      }
      status.textContent = error.message;
    } finally { saveButton.disabled = false; }
  });
  window.MemorizerSettings = {
    ready,
    refreshLabels,
    async saveBackup(blob, filename) {
      await ready;
      if (!savedFolder) return false;
      let permission = await savedFolder.queryPermission({ mode: "readwrite" });
      if (permission !== "granted") permission = await savedFolder.requestPermission({ mode: "readwrite" });
      if (permission !== "granted") throw new Error(msg("denied"));
      const file = await savedFolder.getFileHandle(filename, { create: true });
      const writable = await file.createWritable();
      try { await writable.write(blob); await writable.close(); }
      catch (error) { try { await writable.abort(); } catch {} throw error; }
      return true;
    }
  };
  currentLanguage = localStorage.getItem("memorizer.language") || preferences.language;
  readSeconds.value = Number.isInteger(preferences.readSeconds) && preferences.readSeconds >= 20 && preferences.readSeconds <= 600 ? preferences.readSeconds : 90;
  targetPoints.value = Number.isInteger(preferences.targetPoints) && preferences.targetPoints >= 2 && preferences.targetPoints <= 8 ? preferences.targetPoints : 4;
  setAppMode(preferences.startPage === "chrome" ? "chrome" : "memory");
  applyLanguage();
})();
