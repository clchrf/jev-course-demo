// Evidence rubric for the 11 IV competencies.
// `anchors` can support practice evidence; `mentions` (the competency's name-level wording) only ever
// yields L1. Every cue list is derived from wording in the official IV definition (`trace`), never from the
// built-in example text. Cues are shown on the page so reviewers can see why a level was given.

// AI context: every competency in this talent profile is about AI. A course without any AI wording
// gets no evidence at all; for A/B/C, practice found only in units without AI wording is flagged for review.
export const AI_TERMS = /(?<![A-Za-z])(?:AI|A\.I\.|AIGC|GenAI)(?![A-Za-z])|人工智慧|生成式|ChatGPT|GPT|Gemini|Claude|Copilot|Perplexity|NotebookLM|Midjourney|DALL|Stable Diffusion|LLM|大型語言模型|語言模型|聊天機器人|機器學習|深度學習/i;

// Generic pedagogy cues (same for every competency).
export const CUES = {
  // Student practice: a scheduled or named learning activity that students carry out.
  activity: /第\s*[\d一二三四五六七八九十]+(?:\s*[–—\-~～至到、]\s*[\d一二三四五六七八九十]+)?\s*週|(?<![A-Za-z])W(?:eek)?\s*\d+|每週|課堂(?:上|中)?(?:練習|活動|實作|討論|演練)|工作坊|實作|實習|演練|練習|分組|小組|專題|作業|任務|訪談|角色扮演|扮演|辯論|田野|實地|踏查|參訪|走訪|測試|標註|比較|評比|撰寫|繳交|提交|簡報|工作單|學習單|案例(?:分析|討論)|個案(?:分析|討論)/,
  // Concrete output that students hand in or present.
  output: /繳交|提交|上傳|產出|報告|紀錄|記錄表|評比表|檢核表|聲明|學習單|工作單|日誌|簡報|作品|流程圖|企劃|提案|海報|影片|原型|心得|逐字稿|改善方案|服務方案|設計稿|立場書/,
  // Verification, reflection or assessment of the work.
  check: /評分|計分|評量|尺規|rubric|配分|占.{0,8}\d+\s*[%％]|\d+\s*[%％]|列入.{0,6}成績|成績|回饋|反思|覆核|檢核|驗證|比對|對照|誤判率|錯誤率|正確率|準確率|正確性|準確性|指標|互評|評審|講評/i,
  // Course-specific detail (quantities, weeks, named data).
  specific: /\d|[一二三四五六七八九十百千]+\s*(?:則|筆|份|位|組|項|次|週|篇|題|種|個|張|頁|分鐘|字|家|間)/,
};

// A sentence that only states intended outcomes ("培養…能力") carries no practice evidence.
export const GOAL_FRAME = /培養|提升|建立|強化|具備|養成|增進|厚植|啟發|涵養|了解|認識|理解|強調|重視|教導|使學生|讓學生|期望|期許|希望|目標|素養|觀念|態度|意識/;
// "透過專題培養…" names an activity only as the means to a goal; still a goal statement.
export const VIA_GOAL = /(?:透過|藉由|經由|藉著|以).{0,24}(?:培養|提升|建立|強化|養成|增進|厚植|涵養)/;
// Negation inside a clause suppresses every cue in that clause ("不安排實作", "未要求揭露").
// Excludes compounds that are not negations: 不同, 不斷, 不僅, 不只, 無法取代, 不為AI所限制.
export const NEGATION = /(?:並)?(?:不(?:會|需要?|必|安排|進行|包含|涉及|要求|提供|實施|設計|列入|納入|做|使用|討論|練習|含|採|教|談)|未(?:安排|進行|包含|涉及|要求|提供|實施|設計|列入|納入|有|曾)|沒有|無須|無需|毋須|免除|並無|不再)/;

export const RUBRIC = {
  'A-1-IV-1': {
    trace: '評估並選用適切工具，以支援學習、資訊管理與資料產出',
    anchors: [/(?:比較|評比|評估|選用|挑選|篩選|測試|試用).{0,24}(?:工具|模型|平台|服務|AI|ChatGPT|Gemini|Claude|Copilot|Perplexity|NotebookLM)/i,
      /(?:工具|模型|平台).{0,10}(?:比較|評比|評估|選用|選擇)/, /選用理由|工具評比|評比表/],
    mentions: /AI\s*工具|善用.{0,6}(?:AI|工具)/i,
    practice: '學生實際比較或試用多種 AI 工具，依任務選用',
    output: '評比表、選用理由、工具比較報告',
    checkHint: '依明確指標（正確性、來源、耗時等）評比，或有評分',
    model: 'Do students compare or evaluate different AI tools and choose one for a learning task?',
  },
  'A-2-IV-1': {
    trace: '將AI有策略地融入自主學習歷程，進行資料檢索、統整分析與反思調整',
    anchors: [/學習(?:歷程|日誌|紀錄|記錄|策略|計畫|檔案)|自主學習|自學|後設認知|終身學習/,
      /(?:用|以|運用|透過|借助|使用).{0,12}(?:AI|ChatGPT|Gemini|Claude|Copilot|Perplexity|NotebookLM|生成式).{0,14}(?:檢索|搜尋|整理|摘要|統整|歸納|複習|學習)/i,
      /(?:產業|新興).{0,6}(?:趨勢|AI\s*工具)/],
    mentions: /自主學習|終身學習|學習效能/,
    practice: '學生實際用 AI 檢索、整理資料或規劃自己的學習',
    output: '學習日誌、學習歷程檔案、整理筆記',
    checkHint: '定期反思並調整學習方式，或列入評量',
    model: 'Do students record or reflect on how they learn with AI, such as keeping a learning log?',
  },
  'B-1-IV-1': {
    trace: '遵循智慧財產權、個資保護及使用規範，清楚揭露AI使用方式與範圍',
    anchors: [/揭露|(?:使用|AI).{0,4}聲明|標註.{0,10}(?:AI|工具|提示詞|使用)|著作權|智慧財產|智財|版權|授權|個資|個人資料|隱私|去識別|抄襲|學術倫理|引用規範|使用規範/],
    mentions: /倫理|法規|法律|智財|規範/,
    practice: '作業要求揭露 AI 使用，或實際處理著作權／個資問題',
    output: 'AI 使用聲明、去識別化資料、授權檢核',
    checkHint: '聲明內容被檢核或列入成績',
    model: 'Must students disclose their AI use, or practise handling copyright or personal data rules?',
  },
  'B-2-IV-1': {
    trace: '辨識資料安全、偏見與誤判等風險；具備資訊查證能力，識別AI生成之虛假或誤導性內容',
    anchors: [/查核|查證|事實查核|核實|假訊息|虛假|不實|錯誤資訊|誤導|幻覺|偏見|偏誤|誤判|資安|資料安全|深偽|deepfake|提示注入|防護措施|(?:比對|核對).{0,8}(?:來源|原文|出處|資料)/i,
      /(?:AI|ChatGPT|Gemini|Claude|Copilot|生成).{0,16}(?:錯誤|錯處|漏洞|不正確)|(?:找出|標出|記錄|辨識|檢查|指出).{0,16}(?:錯誤|錯處)/i],
    mentions: /資安|風險|安全|查證/,
    practice: '學生實際查核 AI 產出，或找出偏誤與資安風險',
    output: '查核紀錄、風險清單',
    checkHint: '查核結果被比對、評分或回饋',
    model: 'Do students fact-check AI output or identify AI bias, errors or security risks?',
  },
  'B-3-IV-1': {
    trace: '理解AI應用對個人、專業、產業與社會之影響，提出專業判斷，並對自身決策及其後果負責',
    anchors: [/(?:社會|產業|職場|工作|個人|他人|環境|就業).{0,6}(?:影響|衝擊)|倫理(?:議題|兩難|案例|辯論|討論)|辯論|利害關係人|當責|問責|承擔.{0,6}(?:責任|後果)|價值判斷|立場/],
    mentions: /負責|責任|社會影響|價值/,
    practice: '學生實際討論或辯論 AI 應用的影響，提出自己的判斷',
    output: '立場報告、影響分析',
    checkHint: '判斷理由被評量或回饋',
    model: 'Do students debate or judge the social or ethical impact of an AI application and take a position?',
  },
  'C-1-IV-1': {
    trace: '運用AI輔助整理問題背景，結合AI分析結果與自身專業知識進行判讀與驗證，形成解決方案',
    anchors: [/(?:AI|ChatGPT|Gemini|Claude|Copilot|模型|生成式).{0,14}(?:分析|分類|預測|歸納)/i,
      /(?:AI|ChatGPT|Gemini|Claude|Copilot|生成式).{0,14}整理.{0,6}(?:問題|背景|變項|限制)/i,
      /(?:依|結合|根據|運用).{0,8}專業.{0,8}(?:修改|修正|判讀|驗證|審閱|檢核)/, /解決方案|改善方案/],
    mentions: /解決問題|問題解決|分析問題|解決方案/,
    practice: '學生實際用 AI 分析真實資料或問題',
    output: '分析報告、改善方案',
    checkHint: '以專業知識或人工結果驗證 AI 分析',
    model: 'Do students use AI to analyse real data or a real problem and verify a proposed solution?',
  },
  'C-2-IV-1': {
    trace: '理解AI資料來源、模型運作與推論機制的原理與限制，判斷AI適合的角色與階段，結合多元跨域知識',
    anchors: [/(?:模型|AI|演算法).{0,8}(?:原理|運作|機制|限制|侷限|局限)|資料來源|訓練資料|推論機制|跨領域|跨域|跨科|跨系|(?:整合|結合).{0,8}(?:知識|觀點|專業)|適合.{0,8}(?:角色|階段)/],
    mentions: /跨領域|跨域|邏輯思維|整合能力/,
    practice: '學生實際檢驗 AI 限制，或整合不同領域知識',
    output: '限制分析、跨域整合方案',
    checkHint: '說明判斷依據並接受評量',
    model: 'Do students examine how an AI model works or where it fails, and combine knowledge from other fields?',
  },
  'C-3-IV-1': {
    trace: '運用AI優化工作流程，辨識並回饋AI錯誤與偏見，評估AI介入對方案品質與風險的影響',
    anchors: [/人機(?:分工|協作|合作)|分工|工作流程|流程(?:圖|優化|設計|改善|改造)|workflow/i,
      /(?:人工|由人|人為).{0,8}(?:覆核|審核|檢查|確認|標註|校正)|回饋.{0,6}(?:錯誤|AI)|誤判率|錯誤率/],
    mentions: /人機協作|協作|工作流程/,
    practice: '學生實際規劃人與 AI 的分工，並覆核 AI 結果',
    output: '分工流程圖、錯誤紀錄',
    checkHint: '計算錯誤率或評估 AI 介入的品質影響',
    model: 'Do students plan which workflow steps AI performs and which a human reviews, and track AI errors?',
  },
  'D-1-IV-1': {
    trace: '在AI協力的過程中依循專業與倫理自主判斷，並承擔結果責任',
    anchors: [/(?:自行|自己|由人|由學生|親自|獨立|人類).{0,6}(?:判斷|決定|決策)|必須由人|人為(?:判斷|決策)|判斷理由|決策理由|取捨|不(?:直接|盲目)?(?:採用|照搬).{0,6}(?:AI|建議)/i],
    mentions: /判斷|決策/,
    practice: '學生在 AI 建議之外自行判斷並說明理由',
    output: '決策紀錄、判斷理由',
    checkHint: '判斷結果經討論、反思或評量',
    model: 'Do students make a decision themselves and justify it, rather than following the AI?',
  },
  'D-2-IV-1': {
    trace: '在AI輔助溝通與協作中理解並尊重他人觀點與需求，考量不同族群與社會情境，展現同理心',
    anchors: [/訪談|角色扮演|扮演|同理|換位思考|傾聽|協商|面對面|不同(?:族群|文化|背景|世代)|(?:與|和|向).{0,8}(?:顧客|客戶|使用者|長者|民眾|病人|病患|居民|業師|家長|同學)(?:互動|溝通|對話|交流|說明)|溝通(?:練習|演練)/],
    mentions: /同理|溝通|人際|互動/,
    practice: '學生實際與真人互動（訪談、扮演、服務）',
    output: '訪談紀錄、演練回饋',
    checkHint: '對互動過程進行反思或回饋',
    model: 'Do students interview, role-play or communicate with real people and consider their needs?',
  },
  'D-3-IV-1': {
    trace: '具備對真實世界環境的觀察能力，結合生活體驗與洞察真實世界問題，整合多元觀點並實踐',
    anchors: [/實地|田野|踏查|觀察|參訪|走訪|生活(?:經驗|體驗)|洞察|創意|創新|原創|創作|設計(?:提案|作品|方案|思考)|原型|prototype/i],
    mentions: /創意|創造|創新|洞察/,
    practice: '學生實地觀察或提出自己的創作／設計',
    output: '觀察紀錄、設計提案、原型',
    checkHint: '作品經回饋、反思或評量',
    model: 'Do students observe real-world situations and create their own original ideas or designs?',
  },
};

// D-competencies describe human abilities "in AI collaboration"; their AI context is expected to come
// from another part of the course, so they are not flagged when the unit itself has no AI wording.
export const COURSE_LEVEL_AI = new Set(['D-1-IV-1', 'D-2-IV-1', 'D-3-IV-1']);

export const LEVELS = [
  ['L0', '未見', '課綱沒有提到這項能力'],
  ['L1', '僅提及', '只寫目標或名稱，沒有學生練習'],
  ['L2', '有練習', '學生實際進行相關活動'],
  ['L3', '有產出或檢核', '練習並有具體產出，或有驗證／反思／評量'],
  ['L4', '產出且檢核', '練習、具體產出、驗證／反思／評量都有'],
];
