const historyFile = document.querySelector("#historyFile");
const browserSelect = document.querySelector("#browserSelect");
const loadSampleButton = document.querySelector("#loadSampleButton");
const startDate = document.querySelector("#startDate");
const endDate = document.querySelector("#endDate");
const minSeconds = document.querySelector("#minSeconds");
const searchText = document.querySelector("#searchText");
const visitCount = document.querySelector("#visitCount");
const domainCount = document.querySelector("#domainCount");
const totalTime = document.querySelector("#totalTime");
const topCategory = document.querySelector("#topCategory");
const categoryCaption = document.querySelector("#categoryCaption");
const hourCaption = document.querySelector("#hourCaption");
const categoryLegend = document.querySelector("#categoryLegend");
const domainList = document.querySelector("#domainList");
const visitRows = document.querySelector("#visitRows");
const categoryCanvas = document.querySelector("#categoryChart");
const hourCanvas = document.querySelector("#hourChart");
const clearDrilldownButton = document.querySelector("#clearDrilldownButton");
const drilldownStatus = document.querySelector("#drilldownStatus");
const jsonStatusPanel = document.querySelector("#jsonStatusPanel");
const jsonGeneratedAt = document.querySelector("#jsonGeneratedAt");
const jsonUpdateStatus = document.querySelector("#jsonUpdateStatus");
const updateJsonButton = document.querySelector("#updateJsonButton");
const dismissJsonPromptButton = document.querySelector("#dismissJsonPromptButton");
const memoryModeButton = document.querySelector("#memoryModeButton");
const chromeModeButton = document.querySelector("#chromeModeButton");
const languageToggleButton = document.querySelector("#languageToggleButton");
const memoryTrainerView = document.querySelector("#memoryTrainerView");
const chromeAnalyzerView = document.querySelector("#chromeAnalyzerView");
const sourceText = document.querySelector("#sourceText");
const articleTitleInput = document.querySelector("#articleTitleInput");
const impressionInput = document.querySelector("#impressionInput");
const sourceContext = document.querySelector("#sourceContext");
const articleTagsInput = document.querySelector("#articleTagsInput");
const readSeconds = document.querySelector("#readSeconds");
const targetPoints = document.querySelector("#targetPoints");
const pasteClipboardButton = document.querySelector("#pasteClipboardButton");
const clipboardStatus = document.querySelector("#clipboardStatus");
const sampleArticleButton = document.querySelector("#sampleArticleButton");
const saveArticleButton = document.querySelector("#saveArticleButton");
const startReadingButton = document.querySelector("#startReadingButton");
const resetMemoryButton = document.querySelector("#resetMemoryButton");
const hideNowButton = document.querySelector("#hideNowButton");
const readingText = document.querySelector("#readingText");
const recallMode = document.querySelector("#recallMode");
const expectedPointsInput = document.querySelector("#expectedPointsInput");
let activeRound = null;
const recallText = document.querySelector("#recallText");
const hintButton = document.querySelector("#hintButton");
const structureButton = document.querySelector("#structureButton");
const finishRecallButton = document.querySelector("#finishRecallButton");
const hintBox = document.querySelector("#hintBox");
const scoreSlider = document.querySelector("#scoreSlider");
const scoreLabel = document.querySelector("#scoreLabel");
const confidenceSlider = document.querySelector("#confidenceSlider");
const confidenceLabel = document.querySelector("#confidenceLabel");
const missingText = document.querySelector("#missingText");
const saveSessionButton = document.querySelector("#saveSessionButton");
const newRoundButton = document.querySelector("#newRoundButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const historyList = document.querySelector("#historyList");
const articleSearchInput = document.querySelector("#articleSearchInput");
const articleStatusFilter = document.querySelector("#articleStatusFilter");
const exportTrainingDataButton = document.querySelector("#exportTrainingDataButton");
const trainingDataFile = document.querySelector("#trainingDataFile");
const articleLibraryList = document.querySelector("#articleLibraryList");
const dueReviewCount = document.querySelector("#dueReviewCount");
const dueReviewList = document.querySelector("#dueReviewList");
const timerLabel = document.querySelector("#timerLabel");
const phaseLabel = document.querySelector("#phaseLabel");
const memoryViews = {
  reading: document.querySelector("#readingView"),
  recall: document.querySelector("#recallView"),
  review: document.querySelector("#reviewView"),
};

const colors = [
  "#256d85",
  "#d46244",
  "#6d8f3d",
  "#7b5ea7",
  "#c28b2c",
  "#27766f",
  "#b94e7f",
  "#52677a",
  "#8a693c",
  "#3f7fbf",
];

const sampleSeed = [
  [18, "openai.com", "OpenAI Docs", "學習/文件", 420],
  [17.5, "github.com", "Pull requests", "工作/工具", 360],
  [16, "youtube.com", "How memory works", "影片/娛樂", 900],
  [14.5, "news.ycombinator.com", "Hacker News", "新聞/資訊", 300],
  [13, "amazon.com", "Notebook", "購物", 180],
  [10, "claude.ai", "Chat", "AI/技術", 600],
  [8, "x.com", "Home", "社群", 540],
  [6.5, "wikipedia.org", "Spaced repetition", "學習/文件", 760],
  [4, "docs.google.com", "Notes", "工作/工具", 480],
  [1.5, "netflix.com", "Watch", "影片/娛樂", 1200],
];

let visits = [];
let activeDrilldown = null;
let importedJsonMeta = null;
let currentLanguage = localStorage.getItem("memorizer.language") || "zh";
const chartHitboxes = new WeakMap();
let countdownId = null;
let remainingSeconds = 0;
let currentArticleId = null;
let currentSourceVisit = null;

const sampleArticle = `人的記憶不是像硬碟一樣把資訊完整存進去，而更像是一套重建系統。閱讀時覺得懂，通常代表你能跟著作者的線索走；但複述時必須自己產生線索，這是另一種能力。

訓練複述可以分成三步。第一步是關閉原文後立刻回想，不要求完整，只要求主動抓出核心。第二步是使用低提示，例如只看標題、關鍵字或段落數，讓大腦自己補路徑。第三步是校準，把漏掉的重點補回來，並安排隔一段時間再重述。

真正有效的記憶訓練，不是重讀更多次，而是提高提取的次數與品質。每次提取都會暴露空白，也會讓下一次提取更穩。`;

const translations = {
  zh: {
    trainingDataExportFailed: "匯出未完成：",
    importText: "匯入 TXT／Markdown",
    splitText: "分段練習",
    sourceParent: "返回母文章",
    versions: "內容版本",
    qualityShort: "內容較短，請確認是否完整；短筆記仍可使用。",
    qualityBlocked: "可能擷取到登入或驗證頁，請檢查並補上正文。",
    fileType: "請選擇 TXT 或 Markdown 檔案。",
    fileSize: "文字檔上限為 1 MB。",
    fileEncoding: "檔案為空或不是有效 UTF-8 文字。",
    sectionsCreated: "分段已存入文章庫；每段保留母文章及來源版本。",
    oneSection: "文章不需分段（每段最多 1,200 字元）。",
    parentMissing: "母文章已刪除；分段仍保留來源快照。",
    sourceVersion: "來源版本",
    originalSnapshot: "查看來源快照",
    savedVersions: "已儲存版本（唯讀）",
    qualityEmpty: "未取得正文，請貼上內容後儲存。",

    impression: "我的印象",
    impressionPlaceholder: "為什麼想保留？它讓你想到什麼？",
    today: "讓記憶留下印象",
    todayCaption: "收集記憶，串連知識，喚回靈感。",
    capture: "收集一段記憶",
    reviewToday: "今日複習",
    repairContent: "尚無正文，請貼上內容後儲存。",

    memoryMode: "記憶訓練",
    chromeMode: "瀏覽時間",
    loadSample: "載入範例",
    importChromeJson: "匯入瀏覽資料",
    sourceTitle: "放入一段文字",
    pasteClipboard: "載入剪貼簿",
    sampleArticle: "範例文章",
    saveArticle: "儲存文章",
    articleTitle: "文章標題",
    articleTitlePlaceholder: "可留空，系統會用第一行當標題。",
    articleTags: "標籤",
    articleTagsPlaceholder: "用逗號分隔，例如 AI, 閱讀, 工作",
    articleSaved: "文章已儲存到文章庫。",
    articleLoaded: "已載入文章。",
    articleLibraryTitle: "文章庫",
    dueTodayTitle: "今日複習",
    dueTodayCaption: "到期的文章會出現在這裡，直接載入後再做一次主動回想。",
    noDueReviews: "今天沒有到期複習。",
    reviewNow: "開始複習",
    nextReview: "下次複習：{date}",
    filterArticles: "篩選文章",
    statusFilter: "狀態",
    allStatuses: "全部",
    exportTrainingData: "匯出訓練資料",
    importTrainingData: "匯入訓練資料",
    trainingDataExported: "訓練資料已匯出。",
    trainingDataImported: "已匯入：{count} 篇文章。",
    trainingDataImportFailed: "匯入失敗：{message}",
    articleSearchPlaceholder: "標題、來源或標籤",
    noArticles: "還沒有文章。從文字框儲存，或在瀏覽明細中加入文章庫。",
    loadArticle: "載入",
    editArticle: "編輯",
    deleteArticle: "刪除",
    deleteArticleConfirm: "確定要刪除這篇文章？訓練紀錄摘要會保留，但文章庫會移除。",
    articleDeleted: "文章已刪除。",
    addToLibrary: "加入文章庫",
    addedToLibrary: "已加入",
    attemptsUnit: "次練習",
    sourceVisit: "來源瀏覽",
    noSourceUrl: "手動輸入",
    learningStatus: "狀態",
    newReview: "新文章",
    learning: "學習中",
    notReviewed: "未處理",
    notUseful: "不需記憶",
    needsContent: "需補內容",
    added: "已加入",
    trained: "已訓練",
    dueForReview: "待複習",
    mastered: "已掌握",
    reviewScheduled: "已排下次複習：{date}",
    article: "文章",
    sourcePlaceholder: "貼上你剛讀完、想訓練複述的段落。",
    readSeconds: "閱讀秒數",
    targetPoints: "目標重點",
    startReading: "開始閱讀",
    reset: "重置",
    practiceTitle: "關閉原文後複述",
    ready: "準備",
    reading: "閱讀",
    timeLeft: "剩餘時間",
    recall: "回想",
    calibrate: "校準",
    writeItDown: "寫下來",
    compare: "對照",
    readingIntro: "按下「開始閱讀」後，文章會出現在這裡。時間到後原文會自動收起。",
    recallNow: "現在開始回想",
    recallMode: "回想模式",
    threePoints: "三個重點",
    freeRecall: "自由複述",
    expectedPoints: "預期重點（每行一點）",
    needThreePoints: "請先定義三個預期重點，每行一點。",
    attemptHistory: "完整練習紀錄",
    confidence: "信心",
    point: "重點",
    recallLabel: "不要看原文，先寫下你記得的主要內容",
    recallPlaceholder: "用自己的話列出主要內容。卡住時先寫零碎片段也可以。",
    lowHint: "給我低提示",
    structureHint: "給我結構提示",
    reviewStart: "進入校準",
    yourRecall: "你的複述",
    originalText: "原文",
    scoreQuestion: "這次抓住了幾成重點？",
    confidenceQuestion: "你對這次回想有多有把握？",
    missingLabel: "補上漏掉的重點",
    missingPlaceholder: "寫下剛剛沒有想起來、但下次要抓住的重點。",
    saveSession: "儲存訓練紀錄",
    saved: "已儲存",
    newRound: "再練一次",
    historyTitle: "訓練紀錄",
    clearHistory: "清除紀錄",
    controlsTitle: "選擇要分析的時間",
    browser: "瀏覽器",
    start: "開始",
    end: "結束",
    minSeconds: "最少停留秒數",
    search: "搜尋",
    searchPlaceholder: "網域、標題或分類",
    browsingDataSource: "瀏覽資料",
    generateData: "產生瀏覽資料",
    updateJson: "更新 JSON",
    updating: "更新中",
    later: "稍後",
    visitCount: "瀏覽次數",
    domainCount: "不同網站",
    totalTime: "估計時間",
    topCategory: "最大分類",
    contentMix: "內容分類",
    hourlyVisits: "每小時瀏覽量",
    domainRanking: "網站排行",
    visitDetails: "瀏覽明細",
    showAll: "顯示全部",
    time: "時間",
    category: "分類",
    domain: "網站",
    page: "網頁",
    link: "連結",
    training: "訓練",
    sendToTraining: "送到訓練",
    localExport: "Local Export",
    howToExport: "如何產生瀏覽資料",
    exportStepCloseChrome: "關閉目標瀏覽器後，在這個專案資料夾執行",
    exportStepBasic: "它會複製本機瀏覽器歷史資料庫，只輸出網址、標題、時間、估計停留秒數和分類。",
    exportStepContent: "若要把可讀取的網頁正文也一起帶進來，可執行",
    exportStepRight: "如果正文在右邊主欄，使用",
    exportStepServer: "若要讓「產生/更新瀏覽資料」按鈕自動執行 Python，請用",
    exportStepServerEnd: "啟動本機 app。",
    outputFile: "輸出檔",
    noData: "尚無資料",
    noCategoryData: "匯入資料後顯示",
    importedJsonEmpty: "尚未匯入瀏覽資料",
    jsonIdle: "可直接從上方選定瀏覽器與時間範圍產生瀏覽資料，不必先匯入 JSON。",
    noMemoryHistory: "還沒有紀錄。完成一次校準後，這裡會留下你的分數與漏掉的重點。",
    noMissingPoints: "沒有補充漏掉的重點。",
    noDomainData: "尚無網站資料。",
    noVisitLog: "這個條件下沒有瀏覽 log。",
    drilldownDefault: "點任一圖表的 bar，可以在這裡查看對應的詳細 log。",
    categoryCount: "{count} 個分類",
    recordCount: "{count} 筆",
    visitsUnit: "次",
    seconds: "{value} 秒",
    minutes: "{value} 分",
    hours: "{value} 小時",
    missingSource: "先貼上一段文字，我們才有東西可以訓練。",
    hiddenSource: "原文已收起。先把你腦中還留著的內容倒出來。",
    emptyRecall: "這次還沒有寫下內容。",
    lowHintText: "低提示：試著用這些詞喚回 {count} 個重點：{keywords}",
    lowHintFallback: "低提示：先想這段文字在回答什麼問題，再想作者用了哪幾個理由。",
    structureHintText: "結構提示：\n{skeleton}",
    clipboardLoaded: "已載入剪貼簿內容。",
    clipboardEmpty: "剪貼簿沒有可貼上的文字。",
    clipboardBlocked: "無法讀取剪貼簿。請確認瀏覽器允許剪貼簿權限，或手動貼上。",
    jsonGeneratedAt: "JSON 產生時間：{time}",
    jsonAskUpdate: "要重新讀取選定瀏覽器的歷史紀錄並更新這份 JSON 嗎？",
    fileModeBlocked: "目前是直接打開 HTML，瀏覽器不能執行本機 Python。請先在專案資料夾執行 python tools/local_server.py，再用 http://127.0.0.1:8765 開啟。",
    generatingJson: "正在執行匯出器並產生瀏覽資料...",
    updatingJson: "正在執行匯出器並重新產生 JSON...",
    updatedJson: "已更新：{count} 筆瀏覽紀錄。",
    updateFailed: "更新失敗：{message}",
    detailCategory: "目前顯示「{value}」分類的瀏覽 log。",
    detailHour: "目前顯示 {value}:00-{value}:59 的瀏覽 log。",
    noFetchedContent: "這筆瀏覽紀錄只有標題和連結，沒有網頁正文。重新匯出時加上 --fetch-content，若該頁允許讀取，這裡就會帶入可複述的正文。",
  },
  en: {
    trainingDataExportFailed: "Export did not complete:",
    importText: "Import TXT / Markdown",
    splitText: "Split for practice",
    sourceParent: "Open parent article",
    versions: "Content versions",
    qualityShort: "Short content: check completeness. Short notes are still usable.",
    qualityBlocked: "This may be a login or verification page. Check and repair the source.",
    fileType: "Choose a TXT or Markdown file.",
    fileSize: "Text files must be at most 1 MB.",
    fileEncoding: "The file is empty or is not valid UTF-8 text.",
    sectionsCreated: "Sections saved with their parent article and source version.",
    oneSection: "No split needed (up to 1,200 characters per section).",
    parentMissing: "Parent deleted; the section retains its source snapshot.",
    sourceVersion: "Source version",
    originalSnapshot: "View source snapshot",
    savedVersions: "Saved versions (read-only)",
    qualityEmpty: "No source text. Paste the content and save.",

    impression: "My impression",
    impressionPlaceholder: "Why keep this? What does it bring to mind?",
    today: "Make memories leave an impression",
    todayCaption: "Capture memories. Connect knowledge. Recall inspiration.",
    capture: "Capture a memory",
    reviewToday: "Review today",
    repairContent: "No source text yet. Paste the content and save.",

    memoryMode: "Memory Training",
    chromeMode: "Browsing Time",
    loadSample: "Load Sample",
    importChromeJson: "Import Browsing Data",
    sourceTitle: "Add A Passage",
    pasteClipboard: "Load Clipboard",
    sampleArticle: "Sample Passage",
    saveArticle: "Save Article",
    articleTitle: "Article Title",
    articleTitlePlaceholder: "Optional. The first line will be used if blank.",
    articleTags: "Tags",
    articleTagsPlaceholder: "Comma-separated, e.g. AI, reading, work",
    articleSaved: "Article saved to library.",
    articleLoaded: "Article loaded.",
    articleLibraryTitle: "Article Library",
    dueTodayTitle: "Due Today",
    dueTodayCaption: "Due articles appear here. Load one and practice active recall again.",
    noDueReviews: "No reviews due today.",
    reviewNow: "Review",
    nextReview: "Next review: {date}",
    filterArticles: "Filter Articles",
    statusFilter: "Status",
    allStatuses: "All",
    exportTrainingData: "Export Training Data",
    importTrainingData: "Import Training Data",
    trainingDataExported: "Training data exported.",
    trainingDataImported: "Imported: {count} articles.",
    trainingDataImportFailed: "Import failed: {message}",
    articleSearchPlaceholder: "Title, source, or tag",
    noArticles: "No articles yet. Save from the passage box or add one from Visit Details.",
    loadArticle: "Load",
    editArticle: "Edit",
    deleteArticle: "Delete",
    deleteArticleConfirm: "Delete this article? Training history summaries remain, but the article library item will be removed.",
    articleDeleted: "Article deleted.",
    addToLibrary: "Add to Library",
    addedToLibrary: "Added",
    attemptsUnit: "attempts",
    sourceVisit: "Source visit",
    noSourceUrl: "Manual entry",
    learningStatus: "Status",
    newReview: "New",
    learning: "Learning",
    notReviewed: "Not reviewed",
    notUseful: "Not useful",
    needsContent: "Needs content",
    added: "Added",
    trained: "Trained",
    dueForReview: "Due",
    mastered: "Mastered",
    reviewScheduled: "Next review scheduled: {date}",
    article: "Passage",
    sourcePlaceholder: "Paste a passage you just read and want to practice recalling.",
    readSeconds: "Reading Seconds",
    targetPoints: "Target Points",
    startReading: "Start Reading",
    reset: "Reset",
    practiceTitle: "Recall Without The Source",
    ready: "Ready",
    reading: "Reading",
    timeLeft: "Time left",
    recall: "Recall",
    calibrate: "Calibrate",
    writeItDown: "Write",
    compare: "Compare",
    readingIntro: "After you press Start Reading, the passage appears here. When time is up, it will be hidden.",
    recallNow: "Start Recall Now",
    recallMode: "Recall mode",
    threePoints: "Three key points",
    freeRecall: "Free recall",
    expectedPoints: "Expected points (one per line)",
    needThreePoints: "Define exactly three expected points, one per line, before starting.",
    attemptHistory: "Complete attempt history",
    confidence: "Confidence",
    point: "Point",
    recallLabel: "Do not look at the source. Write the main points you remember.",
    recallPlaceholder: "List the main points in your own words. Fragments are fine when you get stuck.",
    lowHint: "Low Hint",
    structureHint: "Structure Hint",
    reviewStart: "Review",
    yourRecall: "Your Recall",
    originalText: "Original",
    scoreQuestion: "How much of the key content did you capture?",
    confidenceQuestion: "How confident are you in this recall?",
    missingLabel: "Add missed points",
    missingPlaceholder: "Write the points you missed and want to catch next time.",
    saveSession: "Save Session",
    saved: "Saved",
    newRound: "Practice Again",
    historyTitle: "Training History",
    clearHistory: "Clear History",
    controlsTitle: "Choose Time Range",
    browser: "Browser",
    start: "Start",
    end: "End",
    minSeconds: "Min Dwell Seconds",
    search: "Search",
    searchPlaceholder: "Domain, title, or category",
    browsingDataSource: "Browsing Data",
    generateData: "Generate Browsing Data",
    updateJson: "Update JSON",
    updating: "Updating",
    later: "Later",
    visitCount: "Visits",
    domainCount: "Unique Sites",
    totalTime: "Estimated Time",
    topCategory: "Top Category",
    contentMix: "Content Categories",
    hourlyVisits: "Hourly Visits",
    domainRanking: "Site Ranking",
    visitDetails: "Visit Details",
    showAll: "Show All",
    time: "Time",
    category: "Category",
    domain: "Site",
    page: "Page",
    link: "Link",
    training: "Train",
    sendToTraining: "Train",
    localExport: "Local Export",
    howToExport: "How To Generate Browsing Data",
    exportStepCloseChrome: "After closing the target browser, run this in the project folder",
    exportStepBasic: "It copies the local browser history database and exports URL, title, time, estimated dwell seconds, and category.",
    exportStepContent: "To include readable page text, run",
    exportStepRight: "If the article body is in the right content column, use",
    exportStepServer: "To let the Generate/Update Browsing Data button run Python automatically, start the local app with",
    exportStepServerEnd: "",
    outputFile: "Output file",
    noData: "No data",
    noCategoryData: "Import data to display",
    importedJsonEmpty: "No browsing data imported",
    jsonIdle: "Generate browsing data directly from the selected browser and time range above. No JSON import is required first.",
    noMemoryHistory: "No history yet. After a review, your score and missed points appear here.",
    noMissingPoints: "No missed points added.",
    noDomainData: "No site data yet.",
    noVisitLog: "No visit logs match this condition.",
    drilldownDefault: "Click any chart bar to show matching detailed logs here.",
    categoryCount: "{count} categories",
    recordCount: "{count} records",
    visitsUnit: "visits",
    seconds: "{value} sec",
    minutes: "{value} min",
    hours: "{value} hr",
    missingSource: "Paste a passage first so we have something to train with.",
    hiddenSource: "The source is hidden. Pour out what you still remember.",
    emptyRecall: "No recall written yet.",
    lowHintText: "Low hint: use these words to recover {count} key points: {keywords}",
    lowHintFallback: "Low hint: first ask what question this passage answers, then identify the reasons the author used.",
    structureHintText: "Structure hint:\n{skeleton}",
    clipboardLoaded: "Clipboard text loaded.",
    clipboardEmpty: "Clipboard has no text to paste.",
    clipboardBlocked: "Could not read the clipboard. Allow clipboard permission in the browser, or paste manually.",
    jsonGeneratedAt: "JSON generated at: {time}",
    jsonAskUpdate: "Read the selected browser history again and update this JSON file?",
    fileModeBlocked: "This page is opened directly as HTML, so the browser cannot run local Python. Run python tools/local_server.py in the project folder, then open http://127.0.0.1:8765.",
    generatingJson: "Running the exporter and generating browsing data...",
    updatingJson: "Running the exporter and regenerating JSON...",
    updatedJson: "Updated: {count} visits.",
    updateFailed: "Update failed: {message}",
    detailCategory: "Showing visit logs in the \"{value}\" category.",
    detailHour: "Showing visit logs from {value}:00-{value}:59.",
    noFetchedContent: "This browsing history item only has a title and link, not page text. Export again with --fetch-content; if the page allows reading, the text will be available for recall practice.",
  },
};

const categoryLabels = {
  "AI/技術": { zh: "AI/技術", en: "AI / Tech" },
  "學習/文件": { zh: "學習/文件", en: "Learning / Docs" },
  "影片/娛樂": { zh: "影片/娛樂", en: "Video / Entertainment" },
  "社群": { zh: "社群", en: "Social" },
  "新聞/資訊": { zh: "新聞/資訊", en: "News / Info" },
  "購物": { zh: "購物", en: "Shopping" },
  "工作/工具": { zh: "工作/工具", en: "Work / Tools" },
  "金融": { zh: "金融", en: "Finance" },
  "旅遊/地圖": { zh: "旅遊/地圖", en: "Travel / Maps" },
  "其他": { zh: "其他", en: "Other" },
};
function t(key, params = {}) {
  const template = translations[currentLanguage][key] || translations.zh[key] || key;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, value),
    template,
  );
}


function categoryName(category) {
  return categoryLabels[category]?.[currentLanguage] || category;
}
function localeName() {
  return currentLanguage === "zh" ? "zh-Hant" : "en-US";
}

function applyLanguage() {
  window.MemorizerSettings?.refreshLabels();
  document.documentElement.lang = currentLanguage === "zh" ? "zh-Hant" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  languageToggleButton.textContent = currentLanguage === "zh" ? "English" : "中文";
  if (!getCleanSource() && !countdownId) {
    readingText.textContent = t("readingIntro");
  }
  if (!importedJsonMeta) {
    jsonGeneratedAt.textContent = t("importedJsonEmpty");
    jsonUpdateStatus.textContent = t("jsonIdle");
    updateJsonButton.textContent = t("generateData");
    dismissJsonPromptButton.classList.add("hidden");
  }
  renderMemoryHistory();
  renderArticleLibrary();
  renderDueReviews();
  updateMemoryModeDueCount();
  render();
}

function setAppMode(mode) {
  const isMemory = mode === "memory";
  document.querySelector("#todayMemoryActions").hidden = !isMemory;
  memoryTrainerView.classList.toggle("hidden", !isMemory);
  chromeAnalyzerView.classList.toggle("hidden", isMemory);
  memoryModeButton.classList.toggle("active", isMemory);
  chromeModeButton.classList.toggle("active", !isMemory);
  loadSampleButton.classList.toggle("hidden", isMemory);
  historyFile.closest(".file-button").classList.toggle("hidden", isMemory);
}

function setMemoryView(nextView) {
  document.querySelectorAll(".source-panel input, .source-panel textarea, .source-panel button").forEach(node => node.disabled = !!activeRound);
  recallMode.disabled = !!activeRound;
  startReadingButton.disabled = !!activeRound;
  Object.entries(memoryViews).forEach(([name, node]) => {
    node.classList.toggle("hidden", name !== nextView);
  });
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.max(0, seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function setTimer(seconds) {
  remainingSeconds = seconds;
  timerLabel.textContent = formatTime(remainingSeconds);
}

function stopTimer() {
  if (countdownId) {
    clearInterval(countdownId);
    countdownId = null;
  }
}

function getCleanSource() {
  return sourceText.value.trim();
}

function startReading() {
  const expected = expectedPointsInput.value.split(/\n/).map(x => x.trim()).filter(Boolean);
  if (recallMode.value === "threePoints" && expected.length !== 3) {
    clipboardStatus.textContent = t("needThreePoints");
    expectedPointsInput.focus();
    return;
  }
  const text = getCleanSource();
  if (!text) {
    sourceText.focus();
    sourceText.placeholder = t("missingSource");
    return;
  }

  resetMemoryRound(true);
  const article = saveCurrentArticle({ silent: true });
  activeRound = { mode: recallMode.value, expectedPoints: expected, articleId: article.id, submitted: false, saved: false };
  readingText.textContent = text;
  phaseLabel.textContent = t("reading");
  hideNowButton.disabled = false;
  setMemoryView("reading");
  setTimer(Number(readSeconds.value) || 90);

  countdownId = setInterval(() => {
    setTimer(remainingSeconds - 1);
    if (remainingSeconds <= 0) {
      beginRecall();
    }
  }, 1000);
}

function beginRecall() {
  if (!activeRound) return;
  document.body.classList.add("recalling");
  const three = activeRound.mode === "threePoints";
  document.querySelector("#threeRecall").classList.toggle("hidden", !three);
  recallText.classList.toggle("hidden", three);
  hintButton.disabled = three;
  structureButton.disabled = three;
  stopTimer();
  phaseLabel.textContent = t("recall");
  timerLabel.textContent = t("writeItDown");
  readingText.textContent = t("hiddenSource");
  hintBox.textContent = "";
  setMemoryView("recall");
  (three ? document.querySelector("#recallPoint1") : recallText).focus();
}

function sentenceCandidates(text) {
  return text
    .split(/(?<=[。！？!?；;])\s+|[\n\r]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 8);
}

function keywordCandidates(text) {
  const cleaned = text.replace(/[，。！？；：、,.!?;:()（）「」『』"']/g, " ");
  const words = cleaned
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && word.length <= 12);
  const counts = new Map();
  words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 8)
    .map(([word]) => word);
}

function showLowHint() {
  const text = getCleanSource();
  const keywords = keywordCandidates(text);
  const count = Number(targetPoints.value) || 4;
  hintBox.textContent = keywords.length
    ? t("lowHintText", { count, keywords: keywords.join(currentLanguage === "zh" ? "、" : ", ") })
    : t("lowHintFallback");
}

function showStructureHint() {
  const text = getCleanSource();
  const sentences = sentenceCandidates(text);
  const count = Math.min(Number(targetPoints.value) || 4, Math.max(2, sentences.length));
  const skeleton = Array.from({ length: count }, (_, index) => {
    const sentence = sentences[index] || "";
    const lead = sentence.slice(0, Math.min(12, sentence.length));
    return `${index + 1}. ${lead}${lead ? "..." : "重點"}`;
  }).join("\n");
  hintBox.textContent = t("structureHintText", { skeleton });
}

function finishRecall() {
  if (!activeRound || activeRound.submitted) return;
  activeRound.recallPoints = [1, 2, 3].map(i => document.querySelector("#recallPoint" + i).value.trim());
  activeRound.recall = activeRound.mode === "threePoints" ? activeRound.recallPoints.map((p, i) => `${i + 1}. ${p}`).join("\n") : recallText.value.trim();
  activeRound.submitted = true;
  document.body.classList.remove("recalling");
  document.querySelector("#expectedPreview").textContent = activeRound.mode === "threePoints" ? activeRound.expectedPoints.map((p, i) => `${i + 1}. ${p}`).join("\n") : "";
  document.querySelector("#expectedComparison").classList.toggle("hidden", activeRound.mode !== "threePoints");
  phaseLabel.textContent = t("calibrate");
  timerLabel.textContent = t("compare");
  document.querySelector("#recallPreview").textContent = activeRound.recall || t("emptyRecall");
  document.querySelector("#sourcePreview").textContent = getCleanSource();
  setMemoryView("review");
}

function sessionSummary(text) {
  const firstLine = text.split(/\n+/).find(Boolean) || text;
  return firstLine.length > 96 ? `${firstLine.slice(0, 96)}...` : firstLine;
}

function loadMemoryHistory() {
  try {
    return JSON.parse(localStorage.getItem("memorizer.sessions") || "[]");
  } catch {
    return [];
  }
}

function saveMemoryHistory(history) {
  localStorage.setItem("memorizer.sessions", JSON.stringify(history));
}

function loadArticles() {
  try {
    return JSON.parse(localStorage.getItem("memorizer.articles") || "[]");
  } catch {
    return [];
  }
}

function saveArticles(articles) {
  localStorage.setItem("memorizer.articles", JSON.stringify(articles));
}

function parseTags(value) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, tags) => tags.indexOf(tag) === index)
    .slice(0, 12);
}

function tagsLabel(tags = []) {
  return tags.length ? tags.join(" · ") : "";
}

function refreshLearningViews() {
  renderMemoryHistory();
  renderArticleLibrary();
  renderDueReviews();
  updateMemoryModeDueCount();
  render();
}

function mergeRecords(existing, incoming) {
  const records = new Map();
  [...existing, ...incoming].forEach((item) => {
    const key = item.id || JSON.stringify(item);
    if (!records.has(key)) records.set(key, item);
  });
  return [...records.values()];
}

function mergeArticles(existingArticles, incomingArticles) {
  const map = new Map(existingArticles.map((article) => [article.id, article]));
  incomingArticles.forEach((article) => {
    if (!article || typeof article !== "object" || Array.isArray(article) ||
        typeof article.id !== "string" || !article.id ||
        ["content", "impression", "title", "parentArticleId", "parentSnapshot", "sourceFileName"].some(key => article[key] != null && typeof article[key] !== "string") ||
        (article.expectedPoints != null && (!Array.isArray(article.expectedPoints) || article.expectedPoints.some(p => typeof p !== "string"))) ||
        (article.contentVersion != null && (!Number.isInteger(article.contentVersion) || article.contentVersion < 1)) ||
        (article.revisions != null && (!Array.isArray(article.revisions) ||
          article.revisions.some(item => !item || typeof item.content !== "string" || !Number.isInteger(item.version)))) ||
        (article.tags != null && !Array.isArray(article.tags) && typeof article.tags !== "string") ||
        (Array.isArray(article.tags) && article.tags.some(tag => typeof tag !== "string")) ||
        (article.attempts != null && (!Array.isArray(article.attempts) ||
          article.attempts.some(item => !item || typeof item !== "object" || Array.isArray(item))))) {
      throw new Error("Invalid article data");
    }
    const previous = map.get(article.id);
    const incomingIsNewer = !previous ||
      Date.parse(article.updatedAt || article.createdAt || "") > Date.parse(previous.updatedAt || previous.createdAt || "");
    const merged = incomingIsNewer ? { ...previous, ...article } : { ...article, ...previous };
    const revisions = mergeRecords(previous?.revisions || [], article.revisions || []);
    const displaced = incomingIsNewer ? previous : article;
    if (displaced && displaced.content !== merged.content &&
        !revisions.some(item => item.content === (displaced.content || ""))) {
      revisions.push({
        id: createId("revision"), version: displaced.contentVersion || 1,
        content: displaced.content || "", savedAt: new Date().toISOString(),
      });
    }
    map.set(article.id, {
      ...merged,
      impression: merged.impression || "",
      tags: Array.isArray(merged.tags) ? merged.tags : parseTags(String(merged.tags || "")),
      attempts: mergeRecords(previous?.attempts || [], article.attempts || []),
      revisions,
    });
  });
  return [...map.values()].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
}

function parseTrainingBackup(payload) {
  if (!payload || typeof payload !== "object" ||
      (!Array.isArray(payload) && (
        (payload.schemaVersion != null && ![1, 2].includes(payload.schemaVersion)) ||
        (payload.app != null && payload.app !== "Memorizer") ||
        !Array.isArray(payload.articles) ||
        (payload.sessions != null && !Array.isArray(payload.sessions))))) {
    throw new Error("Unsupported or invalid Memorizer backup");
  }
  const articles = Array.isArray(payload) ? payload : payload.articles;
  const sessions = Array.isArray(payload) ? [] : payload.sessions || [];
  if (sessions.some(item => !item || typeof item !== "object" || Array.isArray(item))) {
    throw new Error("Invalid session data");
  }
  return { articles: mergeArticles([], articles), sessions };
}

async function exportTrainingData() {
  const payload = {
    schemaVersion: 2,
    app: "Memorizer",
    exportedAt: new Date().toISOString(),
    articles: loadArticles(),
    sessions: loadMemoryHistory(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const filename = "memorizer-training-" + new Date().toISOString().replace(/[:.]/g, "-") + "-" + Math.random().toString(36).slice(2, 8) + ".json";
  try {
    if (await window.MemorizerSettings?.saveBackup(blob, filename)) {
      clipboardStatus.textContent = t("trainingDataExported");
      return;
    }
  } catch (error) {
    clipboardStatus.textContent = t("trainingDataExportFailed") + " " + error.message;
    return;
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  clipboardStatus.textContent = t("trainingDataExported");
}

async function importTrainingData(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }
  try {
    const payload = JSON.parse(await file.text());
    const { articles: incomingArticles, sessions: incomingSessions } = parseTrainingBackup(payload);
    const mergedArticles = mergeArticles(loadArticles(), incomingArticles);
    const mergedSessions = mergeRecords(loadMemoryHistory(), incomingSessions);
    const oldArticles = localStorage.getItem("memorizer.articles");
    const oldSessions = localStorage.getItem("memorizer.sessions");
    try {
      saveArticles(mergedArticles);
      saveMemoryHistory(mergedSessions);
    } catch (error) {
      for (const [key, value] of [["memorizer.articles", oldArticles], ["memorizer.sessions", oldSessions]]) {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }
      throw error;
    }
    refreshLearningViews();
    clipboardStatus.textContent = t("trainingDataImported", { count: incomingArticles.length });
  } catch (error) {
    clipboardStatus.textContent = t("trainingDataImportFailed", { message: error.message });
  } finally {
    trainingDataFile.value = "";
  }
}

function deleteArticle(articleId) {
  if (!window.confirm(t("deleteArticleConfirm"))) {
    return;
  }
  const articles = loadArticles().filter((article) => article.id !== articleId);
  saveArticles(articles);
  if (currentArticleId === articleId) {
    currentArticleId = null;
    currentSourceVisit = null;
  }
  clipboardStatus.textContent = t("articleDeleted");
  refreshLearningViews();
}
function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sourceVisitKey(visit) {
  if (!visit) {
    return "";
  }
  return visit.sourceVisitKey || `${visit.browser || browserSelect.value || "unknown"}|${visit.visitedAt || ""}|${visit.url || ""}`;
}

function inferArticleTitle(text) {
  const explicit = articleTitleInput.value.trim();
  if (explicit) {
    return explicit;
  }
  const firstLine = text.split(/\n+/).find((line) => line.trim())?.trim() || t("article");
  return firstLine.length > 80 ? `${firstLine.slice(0, 80)}...` : firstLine;
}

function articleDateLabel(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(localeName(), {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isReviewDue(article, now = new Date()) {
  if (!article.nextReviewAt) {
    return false;
  }
  const due = new Date(article.nextReviewAt);
  return !Number.isNaN(due.getTime()) && due <= now;
}

function calculateReviewSchedule(scoreValue, confidenceValue, article = {}) {
  const quality = Math.min(5, Math.max(0, Number(scoreValue) || 0));
  const attempts = (article.attempts || []).filter(a =>
    (a.contentVersion || 1) === (article.contentVersion || 1) &&
    JSON.stringify(a.expectedPoints || []) === JSON.stringify(article.expectedPoints || [])
  ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  let strongStreak = quality >= 4 ? 1 : 0;
  if (strongStreak) {
    for (const attempt of attempts) {
      if (Number(attempt.score) < 4 || !Number.isFinite(Number(attempt.score))) break;
      strongStreak++;
    }
  }
  const intervalDays = quality < 3 ? 1 : quality < 4 ? 3 : [3, 7, 14, 30][Math.min(strongStreak - 1, 3)];
  return { quality, strongStreak, intervalDays, status: strongStreak >= 3 ? "mastered" : "learning",
    nextReviewAt: addDays(new Date(), intervalDays).toISOString() };
}

function dueArticles() {
  return loadArticles()
    .filter((article) => article.content?.trim() && isReviewDue(article))
    .sort((a, b) => new Date(a.nextReviewAt || 0) - new Date(b.nextReviewAt || 0));
}

function updateMemoryModeDueCount() {
  const count = dueArticles().length;
  memoryModeButton.textContent = count ? `${t("memoryMode")} (${count})` : t("memoryMode");
}

function reviewDateLabel(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(localeName(), {
    month: "2-digit",
    day: "2-digit",
  });
}
function articleStatus(article) {
  if (!article.content?.trim()) {
    return "needsContent";
  }
  if (article.nextReviewAt && isReviewDue(article)) {
    return "dueForReview";
  }
  if (article.status === "mastered") {
    return "mastered";
  }
  if (article.status === "learning") {
    return "learning";
  }
  if (article.attempts?.length) {
    return "learning";
  }
  return "newReview";
}

function statusLabel(status) {
  const keys = {
    newReview: "newReview",
    learning: "learning",
    notReviewed: "notReviewed",
    notUseful: "notUseful",
    needsContent: "needsContent",
    added: "added",
    trained: "trained",
    dueForReview: "dueForReview",
    mastered: "mastered",
  };
  return t(keys[status] || "notReviewed");
}

function findArticleForVisit(visit, articles = loadArticles()) {
  const key = sourceVisitKey(visit);
  return articles.find((article) => !article.parentArticleId && (
    (key && article.sourceVisitKey === key) ||
    (visit.url && article.sourceUrl === visit.url)
  ));
}

function visitLearningStatus(visit, articles = loadArticles()) {
  const article = findArticleForVisit(visit, articles);
  if (!article) {
    return visit.content?.trim() ? "notReviewed" : "needsContent";
  }
  return articleStatus(article);
}

function saveCurrentArticle(options = {}) {
  const text = getCleanSource();
  if (!text && !currentSourceVisit) {
    sourceText.focus();
    sourceText.placeholder = t("missingSource");
    return null;
  }

  const articles = loadArticles();
  const now = new Date().toISOString();
  const sourceUrl = currentSourceVisit?.url || "";
  const sourceKey = currentSourceVisit ? sourceVisitKey(currentSourceVisit) : "";
  const existingIndex = articles.findIndex((article) => currentArticleId
    ? article.id === currentArticleId
    : !article.parentArticleId && (
      (sourceKey && article.sourceVisitKey === sourceKey) ||
      (sourceUrl && article.sourceUrl === sourceUrl)
    ));
  const existing = existingIndex >= 0 ? articles[existingIndex] : null;
  const content = text.trim();
  const article = {
    ...(existing || {}),
    id: existing?.id || currentArticleId || createId("article"),
    title: inferArticleTitle(content || currentSourceVisit?.title || ""),
    content,
    ...MemoryContent.revisionFields(existing, content, now),
    tags: parseTags(articleTagsInput.value),
    impression: impressionInput.value.trim(),
    expectedPoints: options.background ? [] : expectedPointsInput.value.split(/\n/).map(x => x.trim()).filter(Boolean),
    recallMode: options.background ? "free" : recallMode.value,
    sourceUrl,
    sourceDomain: currentSourceVisit?.domain || "",
    sourceCategory: currentSourceVisit?.category || "",
    sourceBrowser: currentSourceVisit?.browser || browserSelect.value || "",
    sourceVisitedAt: currentSourceVisit?.visitedAt || "",
    sourceVisitKey: sourceKey,
    extractionMethod: existing?.content === content ? existing.extractionMethod : currentSourceVisit ? (content ? (content === currentSourceVisit.content ? "fetchedPage" : "manualPaste") : "needsContent") : "manualPaste",
    status: content ? (existing?.attempts?.length ? existing.status || "learning" : "newReview") : "needsContent",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastTrainedAt: existing?.lastTrainedAt || "",
    attempts: existing?.attempts || [],
  };

  if (existing && (existing.content !== content || JSON.stringify(existing.expectedPoints || []) !== JSON.stringify(article.expectedPoints))) {
    article.status = content ? "newReview" : "needsContent";
    article.nextReviewAt = null;
  }
  if (existingIndex >= 0) {
    articles[existingIndex] = article;
  } else {
    articles.unshift(article);
  }

  currentArticleId = article.id;
  articleTitleInput.value = article.title;
  saveArticles(articles);
  renderArticleLibrary();
  renderDueReviews();
  updateMemoryModeDueCount();
  if (!options.background) renderContentContext(article);
  render();

  if (!options.silent) {
    clipboardStatus.textContent = t("articleSaved");
  }
  return article;
}

function saveVisitToLibrary(visit) {
  const existing = findArticleForVisit(visit);
  if (existing) {
    clipboardStatus.textContent = t("articleSaved");
    return existing;
  }
  const previous = {
    id: currentArticleId, visit: currentSourceVisit,
    title: articleTitleInput.value, content: sourceText.value,
    tags: articleTagsInput.value, impression: impressionInput.value,
  };
  let article;
  try {
    currentArticleId = null;
    currentSourceVisit = visit;
    articleTitleInput.value = visit.title || visit.domain || "";
    sourceText.value = visit.content?.trim() || "";
    articleTagsInput.value = "";
    impressionInput.value = "";
    article = saveCurrentArticle({ silent: true, background: true });
  } finally {
    currentArticleId = previous.id;
    currentSourceVisit = previous.visit;
    articleTitleInput.value = previous.title;
    sourceText.value = previous.content;
    articleTagsInput.value = previous.tags;
    impressionInput.value = previous.impression;
  }
  clipboardStatus.textContent = t("articleSaved");
  return article;
}

function loadArticleIntoTrainer(article) {
  currentArticleId = article.id;
  currentSourceVisit = article.sourceUrl ? {
    id: article.sourceVisitKey || article.id,
    url: article.sourceUrl,
    title: article.title,
    domain: article.sourceDomain,
    category: article.sourceCategory,
    browser: article.sourceBrowser,
    visitedAt: article.sourceVisitedAt,
    content: article.content,
    sourceVisitKey: article.sourceVisitKey,
  } : null;
  articleTitleInput.value = article.title || "";
  articleTagsInput.value = (article.tags || []).join(", ");
  impressionInput.value = article.impression || "";
  expectedPointsInput.value = (article.expectedPoints || []).join("\n");
  recallMode.value = article.recallMode || "free";
  sourceText.value = article.content || "";
  renderContentContext(article);
  resetMemoryRound(true);
  setAppMode("memory");
  clipboardStatus.textContent = t(article.content?.trim() ? "articleLoaded" : "repairContent");
  sourceText.focus();
}

function renderArticleLibrary() {
  const query = articleSearchInput.value.trim().toLowerCase();
  const selectedStatus = articleStatusFilter.value;
  const articles = loadArticles()
    .filter((article) => {
      const status = articleStatus(article);
      const haystack = (article.impression || "").toLowerCase() + " " + `${article.title} ${article.sourceUrl} ${article.sourceDomain} ${(article.tags || []).join(" ")}`.toLowerCase();
      return (!query || haystack.includes(query)) && (selectedStatus === "all" || status === selectedStatus);
    })
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  articleLibraryList.innerHTML = "";
  if (!articles.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = t("noArticles");
    articleLibraryList.append(empty);
    return;
  }

  articles.forEach((article) => {
    const card = document.createElement("article");
    const header = document.createElement("div");
    const title = document.createElement("strong");
    const status = document.createElement("span");
    const meta = document.createElement("p");
    const tags = document.createElement("p");
    const snippet = document.createElement("p");
    const actions = document.createElement("div");
    const loadButton = document.createElement("button");
    const updateButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    card.className = "article-library-item";
    header.className = "article-library-header";
    status.className = `status-pill status-${articleStatus(article)}`;
    actions.className = "article-actions";
    loadButton.className = "secondary-button compact";
    updateButton.className = "secondary-button compact";
    deleteButton.className = "secondary-button compact danger-button";
    loadButton.type = "button";
    updateButton.type = "button";
    deleteButton.type = "button";
    loadButton.textContent = t("loadArticle");
    updateButton.textContent = t("editArticle");
    deleteButton.textContent = t("deleteArticle");
    loadButton.addEventListener("click", () => loadArticleIntoTrainer(article));
    updateButton.addEventListener("click", () => {
      loadArticleIntoTrainer(article);
      clipboardStatus.textContent = t("articleLoaded");
    });
    deleteButton.addEventListener("click", () => deleteArticle(article.id));

    title.textContent = article.title;
    status.textContent = statusLabel(articleStatus(article));
    meta.textContent = `${article.sourceDomain || t("noSourceUrl")} · ${(article.attempts || []).length} ${t("attemptsUnit")} · ${articleDateLabel(article.updatedAt || article.createdAt)}${article.nextReviewAt ? ` · ${t("nextReview", { date: reviewDateLabel(article.nextReviewAt) })}` : ""}`;
    tags.className = "tag-line";
    tags.textContent = tagsLabel(article.tags || []);
    snippet.textContent = article.content?.trim()
      ? sessionSummary(article.content)
      : `${t("needsContent")} · ${article.sourceUrl || t("noSourceUrl")}`;

    if (article.parentArticleId) {
      meta.textContent += " · " + t("sourceVersion") + " " + article.parentVersion;
    }
    const quality = MemoryContent.quality(article.content || "");
    if (quality === "short" || quality === "blocked") {
      snippet.textContent += " · " + t(quality === "short" ? "qualityShort" : "qualityBlocked");
    }
    header.append(title, status);
    if (tags.textContent) {
      card.append(header, meta, tags, snippet, actions);
    } else {
      card.append(header, meta, snippet, actions);
    }
    if (article.impression) {
      const note = document.createElement("p");
      note.className = "impression-note";
      note.textContent = t("impression") + ": " + article.impression;
      card.insertBefore(note, actions);
    }
    actions.append(loadButton, updateButton, deleteButton);
    const history = document.createElement("details");
    history.className = "attempt-history";
    const heading = document.createElement("summary");
    const attempts = mergeRecords(article.attempts || [], loadMemoryHistory().filter(a => a.articleId === article.id))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    heading.textContent = t("attemptHistory") + ` (${attempts.length})`;
    history.append(heading);
    attempts.forEach(attempt => {
      const entry = document.createElement("section");
      entry.className = "history-item";
      const meta = document.createElement("p");
      meta.textContent = `${attempt.createdAt || attempt.date || ""} · ${t(attempt.mode === "threePoints" ? "threePoints" : "freeRecall")} · ${attempt.score ?? "—"} / 5 · ${t("confidence")}: ${attempt.confidence ?? "—"} · ${t("sourceVersion")} ${attempt.contentVersion || 1}`;
      entry.append(meta);
      [["yourRecall", attempt.recall], ["expectedPoints", (attempt.expectedPoints || []).join("\n")], ["missingLabel", attempt.missing], ["originalText", attempt.sourceSnapshot], ["nextReview", attempt.nextReviewAt]].forEach(([key, value]) => {
        const label = document.createElement("strong");
        label.textContent = key === "nextReview" ? t(key, {date: value || "—"}) : t(key);
        const body = document.createElement("div");
        body.className = "review-box";
        body.textContent = value || "—";
        entry.append(label, body);
      });
      history.append(entry);
    });
    card.append(history);
    articleLibraryList.append(card);
  });
}


function renderDueReviews() {
  const articles = dueArticles();
  dueReviewCount.textContent = t("recordCount", { count: articles.length });
  dueReviewList.innerHTML = "";

  if (!articles.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = t("noDueReviews");
    dueReviewList.append(empty);
    return;
  }

  articles.forEach((article) => {
    const card = document.createElement("article");
    const header = document.createElement("div");
    const title = document.createElement("strong");
    const status = document.createElement("span");
    const meta = document.createElement("p");
    const actions = document.createElement("div");
    const reviewButton = document.createElement("button");

    card.className = "article-library-item";
    header.className = "article-library-header";
    status.className = "status-pill status-dueForReview";
    actions.className = "article-actions";
    reviewButton.className = "primary-button compact";
    reviewButton.type = "button";
    reviewButton.textContent = t("reviewNow");
    reviewButton.addEventListener("click", () => loadArticleIntoTrainer(article));

    title.textContent = article.title;
    status.textContent = statusLabel("dueForReview");
    meta.textContent = `${article.sourceDomain || t("noSourceUrl")} · ${t("nextReview", { date: reviewDateLabel(article.nextReviewAt) })}`;

    header.append(title, status);
    actions.append(reviewButton);
    card.append(header, meta, actions);
    dueReviewList.append(card);
  });
}
function renderMemoryHistory() {
  const history = loadMemoryHistory();
  historyList.innerHTML = "";

  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = t("noMemoryHistory");
    historyList.append(empty);
    return;
  }

  history.forEach((item) => {
    const article = document.createElement("article");
    const title = document.createElement("strong");
    const summary = document.createElement("p");
    const missing = document.createElement("p");
    article.className = "history-item";
    title.textContent = `${item.score} / 5 · ${item.date}`;
    summary.textContent = item.articleTitle ? `${item.articleTitle} · ${item.summary}` : item.summary;
    missing.textContent = item.missing || t("noMissingPoints");
    article.append(title, summary, missing);
    historyList.append(article);
  });
}
function saveSession() {
  if (!activeRound?.submitted || activeRound.saved) return;
  const source = getCleanSource();
  const linkedArticle = saveCurrentArticle({ silent: true });
  const schedule = calculateReviewSchedule(scoreSlider.value, confidenceSlider.value, linkedArticle || {});
  const attempt = {
    id: createId("attempt"),
    createdAt: new Date().toISOString(),
    date: new Date().toLocaleString(localeName(), {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    score: scoreSlider.value,
    confidence: confidenceSlider.value,
    reviewQuality: schedule.quality,
    nextReviewAt: schedule.nextReviewAt,
    mode: activeRound.mode,
    expectedPoints: [...activeRound.expectedPoints],
    recallPoints: activeRound.mode === "threePoints" ? [...activeRound.recallPoints] : [],
    recall: activeRound.recall,
    summary: sessionSummary(source),
    missing: missingText.value.trim(),
    articleId: linkedArticle?.id || "",
    contentVersion: linkedArticle?.contentVersion || 1,
    sourceSnapshot: source,
    articleTitle: linkedArticle?.title || inferArticleTitle(source),
  };

  const history = loadMemoryHistory();
  history.unshift(attempt);
  saveMemoryHistory(history);

  if (linkedArticle) {
    const articles = loadArticles();
    const index = articles.findIndex((article) => article.id === linkedArticle.id);
    if (index >= 0) {
      articles[index] = {
        ...articles[index],
        status: schedule.status,
        reviewStage: schedule.status,
        reviewQuality: schedule.quality,
        reviewIntervalDays: schedule.intervalDays,
        nextReviewAt: schedule.nextReviewAt,
        lastTrainedAt: attempt.createdAt,
        updatedAt: attempt.createdAt,
        attempts: [attempt, ...(articles[index].attempts || [])],
      };
      saveArticles(articles);
    }
  }

  renderMemoryHistory();
  renderArticleLibrary();
  renderDueReviews();
  updateMemoryModeDueCount();
  render();
  clipboardStatus.textContent = linkedArticle ? t("reviewScheduled", { date: reviewDateLabel(schedule.nextReviewAt) }) : "";
  activeRound.saved = true;
  saveSessionButton.disabled = true;
  saveSessionButton.textContent = t("saved");
  setTimeout(() => {
    saveSessionButton.textContent = t("saveSession");
  }, 1200);
}

async function pasteFromClipboard() {
  clipboardStatus.textContent = "";
  try {
    if (!navigator.clipboard?.readText) {
      throw new Error("Clipboard API unavailable");
    }
    const text = await navigator.clipboard.readText();
    if (!text.trim()) {
      clipboardStatus.textContent = t("clipboardEmpty");
      return;
    }
    sourceText.value = text;
    resetMemoryRound(true);
    clipboardStatus.textContent = t("clipboardLoaded");
  } catch {
    clipboardStatus.textContent = t("clipboardBlocked");
  }
}

function resetMemoryRound(keepSource = true) {
  activeRound = null;
  document.body.classList.remove("recalling");
  saveSessionButton.disabled = false;
  document.querySelector("#expectedPreview").textContent = "";
  document.querySelector("#recallPreview").textContent = "";
  document.querySelector("#sourcePreview").textContent = "";
  [1, 2, 3].forEach(i => document.querySelector("#recallPoint" + i).value = "");
  if (!keepSource) { expectedPointsInput.value = ""; recallMode.value = "free"; }
  stopTimer();
  if (!keepSource) {
    sourceText.value = "";
    currentArticleId = null;
    currentSourceVisit = null;
    articleTitleInput.value = "";
    articleTagsInput.value = "";
    impressionInput.value = "";
    sourceContext.textContent = "";
    document.querySelector("#contentVersions").replaceChildren();
  }
  recallText.value = "";
  missingText.value = "";
  hintBox.textContent = "";
  readingText.textContent = keepSource && getCleanSource()
    ? getCleanSource()
    : t("readingIntro");
  phaseLabel.textContent = t("ready");
  timerLabel.textContent = "00:00";
  hideNowButton.disabled = true;
  setMemoryView("reading");
}

function sampleVisits() {
  const now = new Date();
  return sampleSeed.map(([hoursAgo, domain, title, category, durationSeconds], index) => ({
    id: index + 1,
    visitedAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
    domain,
    title,
    url: `https://${domain}/`,
    category,
    durationSeconds,
    content: `${title}\n\n這是一段範例網頁內容。你可以按「送到訓練」，它會切回記憶訓練，並把這段內容放進文章框。真正的瀏覽資料匯出若加上 --fetch-content，這裡會是抓到的網頁正文。`,
  }));
}

function parseVisit(raw, index, meta = {}) {
  const visitedAt = raw.visitedAt || raw.visit_time_iso || raw.visitTime || raw.time;
  const url = raw.url || "";
  const domain = raw.domain || safeDomain(url) || "未知網站";
  const title = raw.title || "(無標題)";
  return {
    id: raw.id || index + 1,
    visitedAt,
    domain,
    title,
    url,
    category: raw.category || classifyVisit(domain, title, url),
    durationSeconds: Number(raw.durationSeconds ?? raw.duration_seconds ?? raw.duration ?? 0),
    content: raw.content || raw.text || raw.pageText || "",
    browser: raw.browser || meta.browser || "",
    sourceVisitKey: raw.sourceVisitKey || `${raw.browser || meta.browser || "unknown"}|${visitedAt || ""}|${url}`,
  };
}

function safeDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function classifyVisit(domain, title, url) {
  const haystack = `${domain} ${title} ${url}`.toLowerCase();
  const rules = [
    ["AI/技術", /openai|chatgpt|claude|gemini|perplexity|github|stackoverflow|developer|npm|python|react|vercel|cursor|anthropic/],
    ["學習/文件", /wikipedia|docs\.|coursera|udemy|edx|medium|substack|notion|readwise|obsidian|arxiv/],
    ["影片/娛樂", /youtube|netflix|bilibili|twitch|disney|hulu|vimeo|spotify|podcast/],
    ["社群", /x\.com|twitter|facebook|instagram|threads|reddit|discord|linkedin|tiktok/],
    ["新聞/資訊", /news|nytimes|bbc|cnn|reuters|bloomberg|wsj|hacker news|hn\.algolia|ycombinator/],
    ["購物", /amazon|shop|store|ebay|etsy|costco|target|walmart|bestbuy/],
    ["工作/工具", /gmail|mail|calendar|docs\.google|drive\.google|slack|trello|asana|jira|figma|miro|zoom/],
    ["金融", /bank|chase|amex|paypal|stripe|coinbase|binance|tradingview|finance|broker/],
    ["旅遊/地圖", /maps|booking|airbnb|expedia|tripadvisor|uber|lyft|airline|flight/],
  ];
  const match = rules.find(([, pattern]) => pattern.test(haystack));
  return match ? match[0] : "其他";
}

function setDefaultDates() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 7);
  startDate.value = toInputDate(start);
  endDate.value = toInputDate(now);
}

function toInputDate(date) {
  const pad = (value) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function filteredVisits() {
  const start = startDate.value ? new Date(startDate.value) : null;
  const end = endDate.value ? new Date(endDate.value) : null;
  const min = Number(minSeconds.value) || 0;
  const query = searchText.value.trim().toLowerCase();
  return visits.filter((visit) => {
    const date = new Date(visit.visitedAt);
    const searchable = `${visit.domain} ${visit.title} ${visit.category} ${visit.url}`.toLowerCase();
    return (
      (!start || date >= start) &&
      (!end || date <= end) &&
      visit.durationSeconds >= min &&
      (!query || searchable.includes(query))
    );
  });
}

function groupBy(items, keyFn) {
  return items.reduce((map, item) => {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
    return map;
  }, new Map());
}

function secondsLabel(seconds) {
  if (seconds < 60) {
    return t("seconds", { value: Math.round(seconds) });
  }
  if (seconds < 3600) {
    return t("minutes", { value: Math.round(seconds / 60) });
  }
  return t("hours", { value: (seconds / 3600).toFixed(1) });
}

function aggregate(items, keyFn) {
  return [...groupBy(items, keyFn).entries()]
    .map(([name, rows]) => ({
      name,
      visits: rows.length,
      seconds: rows.reduce((sum, row) => sum + row.durationSeconds, 0),
    }))
    .sort((a, b) => b.seconds - a.seconds || b.visits - a.visits);
}

function applyDrilldown(items) {
  if (!activeDrilldown) {
    return items;
  }
  if (activeDrilldown.type === "category") {
    return items.filter((visit) => visit.category === activeDrilldown.value);
  }
  if (activeDrilldown.type === "hour") {
    return items.filter((visit) => new Date(visit.visitedAt).getHours() === activeDrilldown.value);
  }
  return items;
}

function drilldownLabel() {
  if (!activeDrilldown) {
    return t("drilldownDefault");
  }
  if (activeDrilldown.type === "category") {
    return t("detailCategory", { value: categoryName(activeDrilldown.value) });
  }
  return t("detailHour", { value: activeDrilldown.value });
}

function drawBarChart(canvas, rows, options = {}) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 22, right: 22, bottom: 48, left: 58 };
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f6f8fb";
  context.fillRect(0, 0, width, height);

  if (!rows.length) {
    chartHitboxes.set(canvas, []);
    context.fillStyle = "#66717d";
    context.font = "16px system-ui";
    context.textAlign = "left";
    context.fillText(t("noData"), padding.left, height / 2);
    return;
  }

  const max = Math.max(...rows.map((row) => row.value), 1);
  const barGap = 8;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = Math.max(12, (chartWidth - barGap * (rows.length - 1)) / rows.length);
  const hitboxes = [];

  context.strokeStyle = "#d9e0e7";
  context.beginPath();
  context.moveTo(padding.left, padding.top);
  context.lineTo(padding.left, padding.top + chartHeight);
  context.lineTo(padding.left + chartWidth, padding.top + chartHeight);
  context.stroke();

  rows.forEach((row, index) => {
    const barHeight = (row.value / max) * (chartHeight - 10);
    const x = padding.left + index * (barWidth + barGap);
    const y = padding.top + chartHeight - barHeight;
    const isActive = options.activeKey !== undefined && row.key === options.activeKey;
    context.fillStyle = options.colorFor?.(row, index) || colors[index % colors.length];
    context.fillRect(x, y, barWidth, barHeight);
    if (isActive) {
      context.lineWidth = 3;
      context.strokeStyle = "#182027";
      context.strokeRect(x - 2, y - 2, barWidth + 4, barHeight + 4);
      context.lineWidth = 1;
    }
    context.fillStyle = "#182027";
    context.font = "12px system-ui";
    context.textAlign = "center";
    context.fillText(row.label, x + barWidth / 2, height - 24, Math.max(32, barWidth + 8));
    hitboxes.push({
      x,
      y,
      width: barWidth,
      height: barHeight,
      row,
      onClick: options.onBarClick,
    });
  });
  chartHitboxes.set(canvas, hitboxes);
}

function renderCategoryChart(items) {
  const rows = aggregate(items, (visit) => visit.category).slice(0, 10);
  drawBarChart(
    categoryCanvas,
    rows.map((row) => ({ label: categoryName(row.name), key: row.name, value: row.seconds || row.visits, ...row })),
    {
      activeKey: activeDrilldown?.type === "category" ? activeDrilldown.value : undefined,
      onBarClick: (row) => {
        activeDrilldown = { type: "category", value: row.name };
        render();
      },
    },
  );
  categoryLegend.innerHTML = "";
  rows.forEach((row, index) => {
    const item = document.createElement("div");
    const swatch = document.createElement("span");
    const name = document.createElement("strong");
    const detail = document.createElement("small");
    item.className = "legend-item";
    swatch.style.background = colors[index % colors.length];
    name.textContent = categoryName(row.name);
    detail.textContent = `${row.visits} ${t("visitsUnit")} · ${secondsLabel(row.seconds)}`;
    item.append(swatch, name, detail);
    categoryLegend.append(item);
  });
  categoryCaption.textContent = rows.length ? t("categoryCount", { count: rows.length }) : t("noCategoryData");
  topCategory.textContent = rows[0] ? categoryName(rows[0].name) : t("noData");
}

function renderHourChart(items) {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({ label: `${hour}`, key: hour, value: 0 }));
  items.forEach((visit) => {
    const hour = new Date(visit.visitedAt).getHours();
    buckets[hour].value += 1;
  });
  drawBarChart(hourCanvas, buckets, {
    activeKey: activeDrilldown?.type === "hour" ? activeDrilldown.value : undefined,
    colorFor: () => "#d46244",
    onBarClick: (row) => {
      activeDrilldown = { type: "hour", value: Number(row.key) };
      render();
    },
  });
  hourCaption.textContent = t("recordCount", { count: items.length });
}

function renderDomains(items) {
  const rows = aggregate(items, (visit) => visit.domain).slice(0, 12);
  domainList.innerHTML = "";
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = t("noDomainData");
    domainList.append(empty);
    return;
  }
  rows.forEach((row, index) => {
    const item = document.createElement("article");
    const name = document.createElement("strong");
    const detail = document.createElement("span");
    const meter = document.createElement("meter");
    item.className = "rank-item";
    name.textContent = `${index + 1}. ${row.name}`;
    detail.textContent = `${row.visits} ${t("visitsUnit")} · ${secondsLabel(row.seconds)}`;
    meter.min = 0;
    meter.max = rows[0].seconds || rows[0].visits || 1;
    meter.value = row.seconds || row.visits;
    item.append(name, detail, meter);
    domainList.append(item);
  });
}

function renderTable(items) {
  visitRows.innerHTML = "";
  if (!items.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.className = "empty-cell";
    cell.textContent = t("noVisitLog");
    row.append(cell);
    visitRows.append(row);
    return;
  }
  items.slice(0, 120).forEach((visit) => {
    const row = document.createElement("tr");
    const time = new Date(visit.visitedAt).toLocaleString(localeName(), {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    [time, categoryName(visit.category), visit.domain].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const titleCell = document.createElement("td");
    const titleLink = document.createElement("a");
    titleLink.href = visit.url || `https://${visit.domain}`;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.textContent = visit.title;
    titleCell.append(titleLink);
    row.append(titleCell);

    const urlCell = document.createElement("td");
    const urlLink = document.createElement("a");
    urlLink.className = "url-link";
    urlLink.href = titleLink.href;
    urlLink.target = "_blank";
    urlLink.rel = "noopener noreferrer";
    urlLink.textContent = visit.url || titleLink.href;
    urlCell.append(urlLink);
    row.append(urlCell);

    const statusCell = document.createElement("td");
    const status = visitLearningStatus(visit);
    const statusPill = document.createElement("span");
    statusPill.className = `status-pill status-${status}`;
    statusPill.textContent = statusLabel(status);
    statusCell.append(statusPill);
    row.append(statusCell);

    const actionCell = document.createElement("td");
    const addButton = document.createElement("button");
    const trainButton = document.createElement("button");
    actionCell.className = "visit-actions";
    addButton.className = "secondary-button compact";
    addButton.type = "button";
    addButton.textContent = status === "notReviewed" || status === "needsContent" ? t("addToLibrary") : t("addedToLibrary");
    addButton.disabled = status !== "notReviewed" && status !== "needsContent";
    addButton.addEventListener("click", () => saveVisitToLibrary(visit));
    trainButton.className = "secondary-button compact";
    trainButton.type = "button";
    trainButton.textContent = t("sendToTraining");
    trainButton.addEventListener("click", () => sendVisitToMemoryTraining(visit));
    actionCell.append(addButton, trainButton);
    row.append(actionCell);

    visitRows.append(row);
  });
}

function sendVisitToMemoryTraining(visit) {
  loadArticleIntoTrainer(saveVisitToLibrary(visit));
}

function render() {
  const items = filteredVisits();
  const detailItems = applyDrilldown(items);
  const domains = new Set(items.map((visit) => visit.domain));
  const seconds = items.reduce((sum, visit) => sum + visit.durationSeconds, 0);
  visitCount.textContent = items.length.toLocaleString("zh-Hant");
  domainCount.textContent = domains.size.toLocaleString("zh-Hant");
  totalTime.textContent = secondsLabel(seconds);
  renderCategoryChart(items);
  renderHourChart(items);
  renderDomains(items);
  renderTable(detailItems);
  drilldownStatus.textContent = drilldownLabel();
  clearDrilldownButton.classList.toggle("hidden", !activeDrilldown);
}

function loadVisits(rawVisits) {
  activeDrilldown = null;
  visits = rawVisits
    .map(parseVisit)
    .filter((visit) => visit.visitedAt && !Number.isNaN(new Date(visit.visitedAt).getTime()))
    .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt));
  render();
}

function localDateTimeLabel(value) {
  if (!value) {
    return "未知產生時間";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(localeName(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function showJsonPrompt(payload, fileName) {
  importedJsonMeta = {
    fileName,
    exportedAt: payload.exportedAt,
    start: payload.start,
    end: payload.end,
  };
  if (payload.browser) {
    browserSelect.value = payload.browser;
  }
  jsonGeneratedAt.textContent = t("jsonGeneratedAt", { time: localDateTimeLabel(payload.exportedAt) });
  jsonUpdateStatus.textContent = t("jsonAskUpdate");
  updateJsonButton.disabled = false;
  updateJsonButton.textContent = t("updateJson");
  dismissJsonPromptButton.classList.remove("hidden");
  jsonStatusPanel.classList.remove("hidden");
}

function daysFromImportedRange() {
  if (!importedJsonMeta?.start || !importedJsonMeta?.end) {
    return 7;
  }
  const start = new Date(importedJsonMeta.start);
  const end = new Date(importedJsonMeta.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 7;
  }
  return Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
}

async function updateImportedJson() {
  if (!window.location.protocol.startsWith("http")) {
    jsonUpdateStatus.textContent = t("fileModeBlocked");
    return;
  }

  updateJsonButton.disabled = true;
  updateJsonButton.textContent = t("updating");
  jsonUpdateStatus.textContent = t(importedJsonMeta ? "updatingJson" : "generatingJson");

  try {
    const response = await fetch("/api/update-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        output: importedJsonMeta?.fileName || "browser_history_export.json",
        browser: browserSelect.value,
        days: daysFromImportedRange(),
        start: startDate.value ? new Date(startDate.value).toISOString() : undefined,
        end: endDate.value ? new Date(endDate.value).toISOString() : undefined,
        fetchContent: true,
        contentRegion: "right",
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "更新失敗");
    }
    loadVisits(payload.visits || [], payload);
    showJsonPrompt(payload, payload.output || importedJsonMeta?.fileName || "browser_history_export.json");
    jsonUpdateStatus.textContent = t("updatedJson", { count: payload.visits?.length || 0 });
  } catch (error) {
    jsonUpdateStatus.textContent = t("updateFailed", { message: error.message });
  } finally {
    updateJsonButton.disabled = false;
    updateJsonButton.textContent = t(importedJsonMeta ? "updateJson" : "generateData");
  }
}

historyFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }
  const json = JSON.parse(await file.text());
  loadVisits(Array.isArray(json) ? json : json.visits || [], Array.isArray(json) ? {} : json);
  if (!Array.isArray(json)) {
    showJsonPrompt(json, file.name);
  }
});

memoryModeButton.addEventListener("click", () => setAppMode("memory"));
chromeModeButton.addEventListener("click", () => setAppMode("chrome"));
languageToggleButton.addEventListener("click", () => {
  currentLanguage = currentLanguage === "zh" ? "en" : "zh";
  localStorage.setItem("memorizer.language", currentLanguage);
  applyLanguage();
});
pasteClipboardButton.addEventListener("click", pasteFromClipboard);
saveArticleButton.addEventListener("click", () => saveCurrentArticle());
articleSearchInput.addEventListener("input", renderArticleLibrary);
articleStatusFilter.addEventListener("change", renderArticleLibrary);
exportTrainingDataButton.addEventListener("click", exportTrainingData);
trainingDataFile.addEventListener("change", importTrainingData);
sampleArticleButton.addEventListener("click", () => {
  currentArticleId = null;
  currentSourceVisit = null;
  articleTitleInput.value = currentLanguage === "zh" ? "記憶如何運作" : "How Memory Works";
  articleTagsInput.value = currentLanguage === "zh" ? "記憶, 閱讀" : "memory, reading";
  impressionInput.value = "";
  sourceContext.textContent = "";
  document.querySelector("#contentVersions").replaceChildren();
  expectedPointsInput.value = "";
  recallMode.value = "free";
  sourceText.value = sampleArticle;
  resetMemoryRound(true);
});
startReadingButton.addEventListener("click", startReading);
resetMemoryButton.addEventListener("click", () => resetMemoryRound(false));
hideNowButton.addEventListener("click", beginRecall);
hintButton.addEventListener("click", showLowHint);
structureButton.addEventListener("click", showStructureHint);
finishRecallButton.addEventListener("click", finishRecall);
scoreSlider.addEventListener("input", () => {
  scoreLabel.textContent = `${scoreSlider.value} / 5`;
});
saveSessionButton.addEventListener("click", saveSession);
newRoundButton.addEventListener("click", () => resetMemoryRound(true));
clearHistoryButton.addEventListener("click", () => {
  saveMemoryHistory([]);
  renderMemoryHistory();
});
updateJsonButton.addEventListener("click", updateImportedJson);
dismissJsonPromptButton.addEventListener("click", () => {
  jsonStatusPanel.classList.add("hidden");
});

loadSampleButton.addEventListener("click", () => loadVisits(sampleVisits(), { browser: "sample" }));
[startDate, endDate, minSeconds, searchText].forEach((input) => {
  input.addEventListener("input", () => {
    activeDrilldown = null;
    render();
  });
});
clearDrilldownButton.addEventListener("click", () => {
  activeDrilldown = null;
  render();
});

[categoryCanvas, hourCanvas].forEach((canvas) => {
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const hitbox = (chartHitboxes.get(canvas) || []).find(
      (box) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height,
    );
    hitbox?.onClick?.(hitbox.row);
  });

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const hitbox = (chartHitboxes.get(canvas) || []).find(
      (box) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height,
    );
    canvas.classList.toggle("clickable-chart", Boolean(hitbox));
  });

  canvas.addEventListener("mouseleave", () => {
    canvas.classList.remove("clickable-chart");
  });
});

setDefaultDates();
loadVisits([]);
setAppMode("memory");
applyLanguage();












document.querySelector("#captureMemoryButton").addEventListener("click", () => {
  resetMemoryRound(false);
  setAppMode("memory");
  sourceText.focus();
});
document.querySelector("#todayReviewButton").addEventListener("click", () => {
  setAppMode("memory");
  const first = dueArticles()[0];
  if (first) loadArticleIntoTrainer(first);
  else document.querySelector("#dueReviewTitle").scrollIntoView({ behavior: "smooth" });
});

function renderContentContext(article) {
  const quality = MemoryContent.quality(article.content || "");
  const warning = { empty: "qualityEmpty", short: "qualityShort", blocked: "qualityBlocked" }[quality];
  sourceContext.textContent = [article.sourceUrl || article.sourceFileName || "",
    warning ? t(warning) : ""].filter(Boolean).join(" · ");
  const panel = document.querySelector("#contentVersions");
  panel.replaceChildren();
  if (article.parentArticleId) {
    const parent = loadArticles().find(item => item.id === article.parentArticleId);
    if (parent) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary-button compact";
      button.textContent = t("sourceParent");
      button.addEventListener("click", () => loadArticleIntoTrainer(parent));
      panel.append(button);
    } else {
      const note = document.createElement("p");
      note.textContent = t("parentMissing");
      panel.append(note);
    }
    appendSnapshot(panel, t("originalSnapshot") + " · v" + article.parentVersion, article.parentSnapshot || "");
  }
  for (const revision of [...(article.revisions || [])].reverse()) {
    appendSnapshot(panel, t("savedVersions") + " · v" + revision.version, revision.content);
  }
}

function appendSnapshot(panel, label, text) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const body = document.createElement("pre");
  summary.textContent = label;
  body.textContent = text;
  details.append(summary, body);
  panel.append(details);
}

async function importTextFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 1024 * 1024) throw new Error("fileSize");
    const fields = MemoryContent.readTextFile(file.name, await file.text(), file.size);
    const articles = loadArticles();
    let article = articles.find(item => !item.parentArticleId &&
      item.sourceFileName === fields.sourceFileName && item.content === fields.content);
    if (!article) {
      const now = new Date().toISOString();
      article = { ...fields, id: createId("article"), tags: [], impression: "",
        status: "newReview", contentVersion: 1, revisions: [], attempts: [],
        createdAt: now, updatedAt: now };
      saveArticles([article, ...articles]);
    }
    loadArticleIntoTrainer(article);
    refreshLearningViews();
  } catch (error) {
    clipboardStatus.textContent = t(error.message) || error.message;
  } finally {
    event.target.value = "";
  }
}

function splitCurrentArticle() {
  try {
    const parent = saveCurrentArticle({ silent: true });
    if (!parent) return;
    const chunks = MemoryContent.splitText(parent.content);
    if (chunks.length < 2) {
      clipboardStatus.textContent = t("oneSection");
      return;
    }
    const articles = loadArticles();
    const now = new Date().toISOString();
    chunks.forEach((content, index) => {
      const id = parent.id + ":v" + parent.contentVersion + ":part" + (index + 1);
      if (articles.some(article => article.id === id)) return;
      articles.push({
        id, title: parent.title + " · " + (index + 1) + "/" + chunks.length,
        content, parentArticleId: parent.id, parentVersion: parent.contentVersion,
        parentSnapshot: parent.content, sectionIndex: index,
        sourceUrl: parent.sourceUrl || "", sourceBrowser: parent.sourceBrowser || "",
        sourceDomain: parent.sourceDomain || "", sourceCategory: parent.sourceCategory || "",
        sourceVisitedAt: parent.sourceVisitedAt || "", sourceFileName: parent.sourceFileName || "",
        extractionMethod: "section", tags: [...(parent.tags || [])], impression: "",
        contentVersion: 1, revisions: [], attempts: [], status: "newReview",
        createdAt: now, updatedAt: now,
      });
    });
    saveArticles(articles);
    refreshLearningViews();
    clipboardStatus.textContent = t("sectionsCreated");
  } catch (error) {
    clipboardStatus.textContent = error.message;
  }
}
document.querySelector("#textFileInput").addEventListener("change", importTextFile);
document.querySelector("#splitArticleButton").addEventListener("click", splitCurrentArticle);
