import { Agent } from "./laya-browser.mjs";

/* ---------- 大專院校（IV）四大能力 ---------- */
const ABILITIES = [
  { id: "A", name: "運用 AI 學習的能力",
    desc: "能快速掌握並善用新興 AI 工具提升學習效能，並運用 AI 協助自主學習與終身學習。",
    q: "學生會在哪些學習任務中評估、選用 AI 工具？怎麼留下學習歷程？",
    hint: "例如：比較不同 AI 工具的評比作業、以 AI 輔助資料檢索與統整、學習日誌與反思，並說明怎麼評量。",
    warn: "只寫「善用 AI 工具、提升學習效能」而沒有對應的學習任務，不算在這個向度。",
    comps: [
      ["A-1-IV-1", "理解AI工具以提升專業學習成效", "能依專業領域特性與任務需求，理解AI工具之基本原理，評估並選用適切工具，以支援學習、資訊管理與資料產出，提升學習與工作效能。"],
      ["A-2-IV-1", "建立AI賦能自主學習與終身學習能力", "能運用後設認知與批判思維，將AI有策略地融入自主學習歷程，進行資料檢索、統整分析與反思調整，持續精進個人能力；並培養AI輔助應用習慣，掌握產業發展趨勢，適切判斷、選用或延伸應用新興AI工具。"]],
    ind: [
      ["Do students compare or choose between different AI tools?", "比較或選用 AI 工具"],
      ["Do students reflect on or record how they learn with AI?", "記錄或反思 AI 學習歷程"],
      ["Do students use AI to search, summarize or organize study material?", "用 AI 檢索或整理資料"]],
    good: "第 3–4 週「AI 工具評比工作坊」：學生分組比較 ChatGPT、Perplexity、NotebookLM 三種工具整理 200 則顧客評論的表現，依正確性、引用來源、耗時三項指標填寫評比表，並撰寫 500 字選用理由。期末繳交個人 AI 學習歷程日誌（每週至少 1 則反思），占學期成績 15%。",
    bad: "讓學生善用各種 AI 工具，提升學習效能，培養自主學習與終身學習的能力。" },
  { id: "B", name: "負責任使用 AI 的能力",
    desc: "具備 AI 倫理及法律素養、資安與風險意識，理解 AI 的社會影響，並對自己的決策負責。",
    q: "課程怎麼處理 AI 使用揭露、智財、個資與資訊查證？",
    hint: "例如：作業的 AI 使用聲明、個資去識別化練習、假訊息查核任務，並說明繳交什麼、如何檢核。",
    warn: "只寫「建立 AI 倫理觀念、負責任的態度」而沒有具體要求或練習，不算在這個向度。",
    comps: [
      ["B-1-IV-1", "具備專業領域之AI倫理與法規素養", "能理解並遵循AI相關之智慧財產權、個資保護及使用規範，於學習與職場情境中正當運用AI，並清楚揭露其使用方式與範圍；同時透過實務案例辨識虛假訊息及相關權益議題，強化AI倫理判斷與責任意識。"],
      ["B-2-IV-1", "具備AI資安與風險意識", "能辨識AI應用所涉及之資料安全、偏見與誤判等風險，理解AI模型之限制，並採取適當防護措施；同時具備資訊查證能力，能識別AI生成之虛假或誤導性內容，確保應用之正確性與可靠性。"],
      ["B-3-IV-1", "具備價值判斷與當責能力", "能理解AI應用對個人、專業、產業與社會之影響，判斷其可能產生之風險與倫理議題，並能提出具專業觀點之判斷；同時對自身決策及其後果負責，確保AI應用符合人類價值與社會規範，並具備因應科技變革之調適能力。"]],
    ind: [
      ["Must students disclose or label their use of AI?", "揭露或標註 AI 使用"],
      ["Does the activity deal with personal data, privacy or copyright?", "處理個資、隱私或著作權"],
      ["Do students fact-check or verify AI-generated content?", "查核 AI 生成內容"]],
    good: "第 6 週「AI 使用揭露與個資」：所有作業須附 AI 使用聲明表，標註使用工具、提示詞與修改比例。課堂以去識別化的真實客訴資料練習，學生需找出至少 3 處個資風險並提出遮罩方式；另以一則 AI 生成的假評論案例進行事實查核，繳交查核紀錄，列入平時成績。",
    bad: "教導學生 AI 倫理與資安觀念，建立負責任使用 AI 的態度。" },
  { id: "C", name: "運用 AI 解決問題的能力",
    desc: "能運用 AI 分析問題、理解其運作邏輯並整合設計解決方案，以人機協作實踐。",
    q: "學生要用 AI 解決什麼真實問題？人與 AI 怎麼分工、怎麼驗證結果？",
    hint: "例如：以真實資料做專題、人工標註對照 AI 結果、繪製人機分工流程、向業師簡報，並附評量方式。",
    warn: "只寫「運用 AI 解決問題、培養整合能力」而沒有說明問題與分工，不算在這個向度。",
    comps: [
      ["C-1-IV-1", "運用AI分析與解決問題的能力", "能運用AI輔助整理問題背景、釐清關鍵變項與限制條件，並結合AI分析結果與自身專業知識進行判讀與驗證，形成具專業依據解決方案。"],
      ["C-2-IV-1", "強化邏輯思維及跨領域整合能力", "能理解AI在資料來源、模型運作與推論機制的原理與限制，並依問題特性判斷AI適合扮演的角色與應用階段，並結合多元跨域知識統合AI輸出產生具系統性的解決方案。"],
      ["C-3-IV-1", "專業導向的人機協作策劃與流程優化能力", "能統合具AI輔助的作業環境，順暢運用AI優化整體工作流程，辨識並回饋AI錯誤與偏見，評估AI介入對方案品質與風險的影響，強化解決方案的合理性與專業價值。"]],
    ind: [
      ["Do students use AI to analyse real data or a real problem?", "用 AI 分析真實問題"],
      ["Do students check whether the AI output is correct?", "檢查 AI 輸出是否正確"],
      ["Does the text split tasks between humans and AI?", "說明人機分工"]],
    good: "第 9–12 週期中專題：學生取得合作飯店 300 則線上評論，先人工標註 50 則作為對照，再用 AI 分類抱怨類型並計算誤判率。小組需繪製人機分工流程圖，說明哪些步驟交給 AI、哪些由人覆核，最後提出服務改善方案並向業師簡報，依評量尺規評分。",
    bad: "運用 AI 分析問題並提出解決方案，培養學生跨領域整合與邏輯思維能力。" },
  { id: "D", name: "AI 無法取代的能力",
    desc: "對真實世界的洞察、同理心、創造力、價值判斷、人際溝通，以及在 AI 輔助下仍能自主做決策的能力。",
    q: "哪些事一定要由學生自己判斷、溝通或創作？",
    hint: "例如：需要學生自己做價值判斷、溝通、同理或創作的活動（訪談、團隊決策、倫理辯論、與真實對象互動），說明 AI 在這些活動裡的角色與限制。",
    warn: "只是強調人的重要性，或者列出一串能力名詞（同理心、溝通、創造力）而沒有對應的教學活動，不算在這個向度。",
    comps: [
      ["D-1-IV-1", "善用AI提升判斷與決策力", "主動思考AI實踐範疇，並能在AI協力的過程中，依循專業與倫理的自主判斷，並承擔結果責任，展現以人為主體的決策能力。"],
      ["D-2-IV-1", "AI協作中的同理心與職場互動能力", "在AI輔助溝通與協作中，能理解並尊重他人觀點與需求，並能考量不同族群與社會情境，展現同理心與負責任的人際互動。"],
      ["D-3-IV-1", "對真實世界的洞察與創意整合能力", "善用AI但不為AI所限制，具備對真實世界環境的觀察能力，在專業學習、設計或創作過程中，結合生活體驗與洞察真實世界問題，整合多元觀點並實踐。"]],
    ind: [
      ["Do students interview, role-play or talk with real people?", "與真人互動（訪談／扮演）"],
      ["Do students make a judgment or decision themselves instead of the AI?", "由學生自己判斷決定"],
      ["Do students discuss the limits of AI advice?", "討論 AI 建議的限制"]],
    good: "第 15–16 週「服務情境角色扮演」：學生依 AI 分析出的抱怨類型，現場扮演櫃檯人員處理客訴，由同學扮演顧客；演練後小組討論哪些判斷必須由人做決定（例如是否給予補償），並撰寫反思，說明 AI 建議在真實情境中的限制。",
    bad: "強調同理心、溝通與創造力等 AI 無法取代的能力，培養學生人文關懷的素養。" },
];

const COMMON = {
  co0: ["Does the text describe a specific class activity with a week number or a grading method?", "是否寫出週次或評分方式"],
  co1: ["Does the text mention a specific detail such as a week, a number, a dataset or a named tool?", "是否提到具體數字、資料或工具"],
  bo0: ["Is the text only a vague slogan about cultivating abilities?", "是否只是空泛口號"],
};

const METRICS = [
  { key: "alignment", name: "對到定義", sub: "教的是這項能力，不只是「用到 AI」" },
  { key: "concreteness", name: "看得到做法", sub: "有活動、週次、評量，不只有目標" },
  { key: "supported", name: "成果不誇大", sub: "活動做得到寫出來的成果" },
  { key: "boilerplate", name: "不是範本", sub: "換一門課就貼不上去" },
];

/* ---------- 模型下載（分塊 + 進度 + 快取） ---------- */
const MODEL_BASE = new URL("model/", location.href).href;
const CACHE = "laya-ts"; // 與 laya-ts 內部快取同名，避免存兩份
let manifest = null;
const progress = { done: 0, total: 1, files: {} };
const origFetch = window.fetch.bind(window);

async function readWithProgress(url, key) {
  const res = await origFetch(url);
  if (!res.ok) throw new Error(`下載失敗：${url}（${res.status}）`);
  const reader = res.body.getReader();
  const chunks = []; let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length;
    progress.files[key] = got; renderProgress();
  }
  return new Blob(chunks);
}

window.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  if (!manifest || !url.startsWith(MODEL_BASE)) return origFetch(input, init);
  const name = url.slice(MODEL_BASE.length);
  const entry = manifest.files[name];
  if (!entry) return origFetch(input, init);
  try {
    const hit = await (await caches.open(CACHE)).match(url);
    if (hit) { progress.files[name] = entry.size; renderProgress(); return hit; }
  } catch { /* 無快取可用時直接下載 */ }
  const parts = entry.parts || [name];
  const blobs = [];
  for (const p of parts) blobs.push(await readWithProgress(MODEL_BASE + p, name + "#" + p));
  for (const p of parts) delete progress.files[name + "#" + p];
  progress.files[name] = entry.size;
  return new Response(new Blob(blobs), { status: 200, headers: { "Content-Type": "application/octet-stream" } });
};

function renderProgress() {
  const done = Object.values(progress.files).reduce((a, b) => a + b, 0);
  const pct = Math.min(100, (done / progress.total) * 100);
  $("progBar").style.width = pct + "%";
  $("minfo").textContent = `下載模型中 ${(done / 1e6).toFixed(0)} / ${(progress.total / 1e6).toFixed(0)} MB（首次需要，之後從瀏覽器快取讀取）`;
}

/* ---------- 狀態 ---------- */
const $ = (id) => document.getElementById(id);
let agent = null;
let backend = "–";
let calls = 0;
let active = "D";
const results = {};
const queue = new Map();
let running = false;

function setModelState(kind, label, info) {
  $("led").className = "led " + kind;
  $("mstate").textContent = label;
  if (info !== undefined) $("minfo").textContent = info;
}

async function loadModel() {
  $("loadBtn").disabled = true;
  $("prog").hidden = false;
  setModelState("load", "載入中", "讀取模型清單…");
  try {
    manifest = await (await origFetch(MODEL_BASE + "manifest.json")).json();
    progress.total = Object.values(manifest.files).reduce((a, f) => a + f.size, 0);
    const t0 = performance.now();
    // 跨來源隔離（coi-serviceworker）後才能用多執行緒 WASM
    const ort = await import("onnxruntime-web");
    const threads = self.crossOriginIsolated ? Math.min(8, navigator.hardwareConcurrency || 4) : 1;
    ort.env.wasm.numThreads = threads;
    agent = await Agent.load(MODEL_BASE.replace(/\/$/, ""));
    backend = `WASM×${threads}`;
    $("mBackend").textContent = backend;
    $("prog").hidden = true;
    $("loadBtn").hidden = true;
    setModelState("ok", "Laya 已就緒", `laya-multilingual（量化版）・${threads} 執行緒・載入 ${((performance.now() - t0) / 1000).toFixed(1)} 秒。修改任一段文字，停止輸入後會自動重新判斷。`);
    ABILITIES.forEach((ab) => schedule(ab.id));
  } catch (e) {
    console.error(e);
    setModelState("err", "載入失敗", `${e.message || e}。請改用電腦版 Chrome／Edge，或重新整理後再試一次。`);
    $("loadBtn").disabled = false;
  }
}

/* ---------- 推論 ---------- */
function questionsFor(ab) {
  const q = {};
  for (const [k, [en]] of Object.entries(COMMON)) q[k] = { type: "noul", instructions: en };
  ab.ind.forEach(([en], i) => (q["i" + i] = { type: "noul", instructions: en }));
  return q;
}

function schedule(id) {
  if (!agent) return;
  queue.set(id, true);
  setBusy(id, true);
  if (!running) drain();
}

async function drain() {
  running = true;
  while (queue.size) {
    const id = queue.keys().next().value;
    queue.delete(id);
    await evaluate(ABILITIES.find((a) => a.id === id));
  }
  running = false;
}

async function evaluate(ab) {
  const on = $("on-" + ab.id).checked;
  const text = $("tx-" + ab.id).value.trim();
  if (!on || !text) { results[ab.id] = null; paint(ab); setBusy(ab.id, false); renderTabs(); return; }
  const q = questionsFor(ab);
  const t0 = performance.now();
  const out = await agent.predict(text, q);
  const ms = performance.now() - t0;
  const p = Object.fromEntries(Object.keys(q).map((k) => [k, out.answers[k].noul]));
  const ind = [p.i0, p.i1, p.i2];
  const scores = {
    alignment: Math.max(...ind) * 100,
    concreteness: ((p.co0 + p.co1) / 2) * 100,
    supported: (ind.reduce((a, b) => a + b, 0) / 3) * 100,
    boilerplate: (1 - p.bo0) * 100,
  };
  for (const k in scores) scores[k] = Math.round(scores[k]);
  const total = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);
  calls += Object.keys(q).length;
  results[ab.id] = { text, p, scores, total, ms, tokens: out.usage?.input_tokens };
  // 若判斷期間文字又被改過，queue 會再排一次
  if ($("tx-" + ab.id).value.trim() === text) setBusy(ab.id, false);
  active = ab.id;
  paint(ab);
  $("mLast").textContent = (ms / 1000).toFixed(2) + " s";
  $("mCalls").textContent = calls;
  renderTabs(); renderLog();
}

/* ---------- 顯示 ---------- */
const grade = (s) => (s >= 80 ? ["很好", "g"] : s >= 50 ? ["尚可", "a"] : ["要補強", "r"]);
const BAR = { g: "var(--green)", a: "var(--amber)", r: "var(--red)" };

function tagFor(ab, key, s, p) {
  if (key === "alignment") {
    const i = [p.i0, p.i1, p.i2].indexOf(Math.max(p.i0, p.i1, p.i2));
    if (s >= 50) return [ab.ind[i][1], grade(s)[1]];
    return ["沒對到核心行為", "r"];
  }
  if (key === "concreteness") {
    if (s >= 80) return [p.co0 >= 0.8 ? "有週次與評量" : "做法具體", "g"];
    if (s >= 50) return ["缺週次或評量", "a"];
    return ["只有目標", "r"];
  }
  if (key === "supported") {
    const n = [p.i0, p.i1, p.i2].filter((x) => x >= 0.5).length;
    if (s < 50) return [n ? `只涵蓋 ${n}／3 項` : "活動撐不起宣稱", "r"];
    return [`涵蓋 ${n}／3 項`, grade(s)[1]];
  }
  if (key === "boilerplate" && s < 50) return ["像罐頭文案", "r"];
  return grade(s);
}

function paint(ab) {
  const r = results[ab.id];
  const box = $("rs-" + ab.id);
  box.classList.toggle("idle", !r);
  const on = $("on-" + ab.id).checked;
  if (!r) {
    METRICS.forEach((m) => {
      $(`bar-${ab.id}-${m.key}`).style.width = "0";
      $(`sc-${ab.id}-${m.key}`).textContent = "–";
      $(`tg-${ab.id}-${m.key}`).textContent = "";
    });
    $("tot-" + ab.id).textContent = "–";
    const g = $("totg-" + ab.id);
    g.textContent = !agent ? "等待模型" : !on ? "本課程未涵蓋" : "尚未填寫";
    g.className = "";
    $("note-" + ab.id).textContent = "";
    return;
  }
  METRICS.forEach((m) => {
    const s = r.scores[m.key];
    const [tag, cls] = tagFor(ab, m.key, s, r.p);
    const bar = $(`bar-${ab.id}-${m.key}`);
    bar.style.width = s + "%";
    bar.style.background = BAR[grade(s)[1]];
    $(`sc-${ab.id}-${m.key}`).textContent = s;
    const tg = $(`tg-${ab.id}-${m.key}`);
    tg.textContent = tag; tg.className = "tg " + cls;
  });
  const [gt, gc] = grade(r.total);
  $("tot-" + ab.id).textContent = r.total;
  const g = $("totg-" + ab.id); g.textContent = gt; g.className = gc;
  $("note-" + ab.id).textContent = `Laya 一次回答 6 題・${(r.ms / 1000).toFixed(2)} 秒・${r.tokens ?? "–"} tokens`;
}

function setBusy(id, on) { $("rs-" + id).classList.toggle("busy", on); }

function renderTabs() {
  $("abtabs").innerHTML = ABILITIES.map((ab) => {
    const r = results[ab.id];
    const c = r ? BAR[grade(r.total)[1]] : "var(--faint)";
    return `<button type="button" class="${ab.id === active ? "on" : ""}" data-ab="${ab.id}"><span class="l">${ab.id}</span><span class="n" style="color:${c}">${r ? r.total : "–"}</span></button>`;
  }).join("");
  $("abtabs").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    active = b.dataset.ab; renderTabs(); renderLog();
  }));
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function renderLog() {
  const ab = ABILITIES.find((a) => a.id === active);
  const r = results[active];
  if (!r) { $("logBody").innerHTML = `<p class="lead">能力 ${active} 目前沒有判斷結果。</p>`; return; }
  const snip = r.text.length > 60 ? r.text.slice(0, 60) + "…" : r.text;
  const rows = [
    ...ab.ind.map(([en, zh], i) => [en, zh, r.p["i" + i], "對到定義・成果不誇大"]),
    [COMMON.co0[0], COMMON.co0[1], r.p.co0, "看得到做法"],
    [COMMON.co1[0], COMMON.co1[1], r.p.co1, "看得到做法"],
    [COMMON.bo0[0], COMMON.bo0[1], r.p.bo0, "不是範本（取 1 − P）"],
  ];
  $("logBody").innerHTML = `
    <div class="req">
      <div><span class="k">agent.predict</span>(</div>
      <div>&nbsp;&nbsp;<span class="s">"${esc(snip)}"</span>,</div>
      <div>&nbsp;&nbsp;{ ${Object.keys(questionsFor(ab)).length} 題 × <span class="k">type</span>: <span class="s">"noul"</span> }</div>
      <div>) → ${(r.ms).toFixed(0)} ms</div>
    </div>
    <div class="qs">${rows.map(([en, zh, p, use]) => `
      <div class="qi"><span class="en">${esc(en)}</span><span class="zh">${zh}</span>
        <span class="p ${p >= 0.5 ? "g" : "r"}">${p.toFixed(2)}</span>
        <span class="use">→ ${use}</span></div>`).join("")}
    </div>`;
}

/* ---------- 卡片 ---------- */
const cards = $("cards");
ABILITIES.forEach((ab) => {
  const el = document.createElement("article");
  el.className = "card"; el.id = "card-" + ab.id;
  el.innerHTML = `
    <div class="head">
      <span class="badge">${ab.id}</span>
      <h3>${ab.name}</h3>
      <label class="switch" for="on-${ab.id}"><span>本課程涵蓋</span><input type="checkbox" id="on-${ab.id}" checked></label>
    </div>
    <div class="body">
      <p class="desc">${ab.desc}</p>
      <details class="comps"><summary>大專院校核心能力（${ab.comps.map((c) => c[0]).join("、")}）</summary>
        ${ab.comps.map((c) => `<div class="comp"><code>${c[0]}</code><b>${c[1]}</b><p>${c[2]}</p></div>`).join("")}
      </details>
      <label class="q" for="tx-${ab.id}">${ab.q}</label>
      <textarea id="tx-${ab.id}" placeholder="請描述具體的教學活動、週次與評量方式…"></textarea>
      <div class="hint"><span>${ab.hint}</span><span class="count" id="ct-${ab.id}">0 字</span></div>
      <p class="warn">${ab.warn}</p>
      <div class="samples">
        <button class="chip" type="button" data-fill="good">載入好例子</button>
        <button class="chip" type="button" data-fill="bad">載入反例</button>
        <button class="chip" type="button" data-fill="clear">清空</button>
      </div>
      <div class="result idle" id="rs-${ab.id}">
        <div class="rhead"><span class="lbl">AI 檢視（Laya）<span class="spin"></span></span>
          <span class="total"><b id="tot-${ab.id}">–</b><span id="totg-${ab.id}">等待模型</span></span></div>
        ${METRICS.map((m) => `
        <div class="row">
          <div class="nm"><b>${m.name}</b><small>${m.sub}</small></div>
          <div class="bar"><i id="bar-${ab.id}-${m.key}"></i></div>
          <div class="sc" id="sc-${ab.id}-${m.key}">–</div>
          <div class="tg" id="tg-${ab.id}-${m.key}"></div>
        </div>`).join("")}
        <p class="note" id="note-${ab.id}"></p>
      </div>
    </div>`;
  cards.appendChild(el);

  const tx = el.querySelector("textarea");
  const on = el.querySelector("input[type=checkbox]");
  let timer;
  tx.addEventListener("input", () => {
    count(ab);
    clearTimeout(timer);
    timer = setTimeout(() => schedule(ab.id), 700);
  });
  on.addEventListener("change", () => { el.classList.toggle("off", !on.checked); schedule(ab.id); if (!agent) paint(ab); });
  el.querySelectorAll("[data-fill]").forEach((b) => b.addEventListener("click", () => {
    tx.value = b.dataset.fill === "clear" ? "" : ab[b.dataset.fill];
    count(ab); schedule(ab.id);
  }));
});

function count(ab) { $("ct-" + ab.id).textContent = $("tx-" + ab.id).value.replace(/\s/g, "").length + " 字"; }

function fillAll(kind) {
  ABILITIES.forEach((ab) => {
    const on = $("on-" + ab.id);
    on.checked = true; $("card-" + ab.id).classList.remove("off");
    $("tx-" + ab.id).value = ab[kind]; count(ab); schedule(ab.id);
  });
}
$("allGood").addEventListener("click", () => fillAll("good"));
$("allBad").addEventListener("click", () => fillAll("bad"));
$("loadBtn").addEventListener("click", loadModel);

// 初始：A、C、D 好例子，B 反例
ABILITIES.forEach((ab) => { $("tx-" + ab.id).value = ab.id === "B" ? ab.bad : ab.good; count(ab); paint(ab); });
renderTabs();

// 已快取過模型就自動載入
(async () => {
  try {
    const c = await caches.open(CACHE);
    if (await c.match(MODEL_BASE + "encoder.onnx")) loadModel();
  } catch { /* 無法使用快取時等使用者按鈕 */ }
})();
