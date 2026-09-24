// Calibration set: used to develop cue lists and choose model thresholds.
// Labels are PROVISIONAL, drafted by Claude (AI assistant) from the official IV wording.
// They are NOT teacher or expert annotations and must be reviewed by people before being relied on.
// expect: competency -> evidence level L0–L4 (unlisted = L0). why: short provisional rationale.
import {ABILITIES} from '../../assets/abilities.js';

export const LABEL_STATUS = '暫定標籤：由 Claude 依官方 IV 定義擬定，非教師或專家人工標註，需人工複核。';

const weeks = (from, to, topic) => Array.from({length: to - from + 1}, (_, i) =>
  `第 ${from + i} 週：${topic[i % topic.length]}。教師講授相關章節，學生完成課後閱讀與隨堂小考。`).join('\n');

export const CASES = [
  {id: 'cal-builtin-good', kind: '具體正例', title: '顧客關係管理與 AI 應用（餐旅系三年級）',
    text: ABILITIES.map(a => a.good).join('\n\n'),
    expect: {'A-1-IV-1': 4, 'A-2-IV-1': 4, 'B-1-IV-1': 4, 'B-2-IV-1': 4, 'C-1-IV-1': 4, 'C-3-IV-1': 4, 'D-1-IV-1': 3, 'D-2-IV-1': 3},
    why: '頁面內建範例。A/B/C 有週次、產出與配分；D 有角色扮演與反思但無評分產出。B-3、C-2、D-3 未見對應活動。'},
  {id: 'cal-builtin-bad', kind: '空泛反例', title: '顧客關係管理與 AI 應用（餐旅系三年級）',
    text: ABILITIES.map(a => a.bad).join('\n\n'),
    expect: {'A-1-IV-1': 1, 'A-2-IV-1': 1, 'B-1-IV-1': 1, 'B-2-IV-1': 1, 'B-3-IV-1': 1, 'C-1-IV-1': 1, 'C-2-IV-1': 1, 'D-2-IV-1': 1, 'D-3-IV-1': 1},
    why: '頁面內建反例。只寫能力名稱與目標，沒有學生活動，最高僅 L1。'},
  {id: 'cal-partial-writing', kind: '部分涵蓋', title: 'AI 輔助學術寫作（通識，一年級）',
    text: `課程目標：培養學生以負責任的方式使用生成式 AI 撰寫學術報告。

第 2 週：學生以同一題目分別使用 ChatGPT、Claude 與 Perplexity 搜尋文獻，依引用正確性與可追溯性填寫工具評比表，並說明最後選用哪一個工具。

第 4 週：AI 使用揭露。每份作業須附 AI 使用聲明，列出使用的工具、提示詞與修改段落；助教抽查聲明與作業是否一致，列入作業成績。

第 6 週：學生逐一核對 AI 產生的 10 筆參考文獻是否真實存在，繳交查核紀錄，標出虛構的文獻。

第 8–16 週：學生完成個人期末報告，教師依寫作尺規評分。`,
    expect: {'A-1-IV-1': 4, 'B-1-IV-1': 4, 'B-2-IV-1': 3},
    why: '只涵蓋 A-1、B-1、B-2。A-1 有評比表且依指標評比；B-1 聲明被抽查列入成績；B-2 有查核紀錄但未寫評分方式。C、D 與 A-2 無證據。'},
  {id: 'cal-noai-accounting', kind: '無 AI 課程', title: '中級會計學（會計系二年級）',
    text: `課程目標：熟悉財務報表編製與分錄原則。

第 1–6 週：分錄練習與試算表，每週繳交習題，占 20%。
第 7 週：學生分組訪談兩位事務所會計師，了解查帳實務，繳交訪談紀錄。
第 8–15 週：合併報表、租賃會計，課堂分組個案分析並上台簡報。
第 16 週：期末考 40%。`,
    expect: {},
    why: '具體但沒有任何 AI 情境。人才圖像細項皆以 AI 為前提，訪談也不列入 D-2。'},
  {id: 'cal-tools-only', kind: '只列工具名稱', title: '數位行銷概論（企管系二年級）',
    text: `本課程使用工具：ChatGPT、Gemini、Copilot、Canva、Midjourney。

課程目標：提升學生數位行銷能力與 AI 素養。

評量方式：期中考 30%、期末考 40%、出席 30%。`,
    expect: {},
    why: '只列工具與一般目標，沒有說明學生怎麼使用，也沒有提到任何細項的能力名稱。'},
  {id: 'cal-negation', kind: '否定敘述', title: '程式設計（一）（資工系一年級）',
    text: `本課程不安排 AI 工具的比較或評估活動，也不要求學生揭露 AI 使用。

第 3–10 週：學生每週完成程式作業，繳交原始碼並由助教測試評分。

第 11 週：學生使用 GitHub Copilot 完成同一題作業，比對自己寫的版本與 AI 產生的版本，記錄 AI 程式碼中的 3 個錯誤，繳交錯誤紀錄。

本課程未安排任何訪談或角色扮演。`,
    expect: {'B-2-IV-1': 4, 'C-3-IV-1': 3},
    why: '否定句中的 A-1、B-1、D-2 不應計入。第 11 週找出 AI 程式錯誤屬 B-2（有紀錄並比對）；也涉及覆核 AI 產出，暫定 C-3 L3。'},
  {id: 'cal-duplicate', kind: '重複文字', title: 'AI 輔助學術寫作（通識，一年級）',
    text: null, // filled below: the partial case repeated three times
    expect: {'A-1-IV-1': 4, 'B-1-IV-1': 4, 'B-2-IV-1': 3},
    why: '與 cal-partial-writing 相同內容重複三次，等級不應提高。'},
  {id: 'cal-longtail', kind: '長課綱尾段才有證據', title: '行銷研究（企管系三年級）',
    text: `課程目標：學習行銷研究的設計與分析方法。\n\n${weeks(1, 15, ['研究問題與假設', '次級資料蒐集', '問卷設計', '抽樣方法', '量表信效度', '敘述統計', '交叉分析', '迴歸分析', '因素分析', '集群分析', '聯合分析', '質性研究', '焦點團體', '研究倫理', '報告撰寫'])}\n\n第 16 週：學生取得合作咖啡店 500 則線上評論，用 ChatGPT 分類顧客抱怨主題，再人工抽查 60 則計算 AI 誤判率。\n第 17 週：各組繪製人機分工流程圖，說明哪些步驟由 AI 處理、哪些由人覆核，並提出改善方案向店長簡報，依尺規評分。`,
    expect: {'C-1-IV-1': 4, 'C-3-IV-1': 4, 'B-2-IV-1': 3},
    why: '前 15 週無 AI；第 16–17 週才有 C-1、C-3 證據（分析、改善方案、誤判率、尺規）。計算誤判率也屬辨識 AI 誤判（B-2），暫定 L3。'},
  {id: 'cal-nursing', kind: '具體正例（其他領域）', title: 'AI 與照護溝通（護理系四年級）',
    text: `第 5 週：學生使用 AI 聊天機器人產生衛教單張初稿，再依照護專業知識修改，繳交修改前後對照表。

第 6 週：病歷資料去識別化練習：學生找出模擬病歷中 5 類個人資料並遮罩，繳交處理紀錄。

第 9–10 週：模擬病房角色扮演。學生扮演護理師，向扮演家屬的同學說明 AI 風險評估結果，並自行判斷是否需要通報醫師；演練後撰寫反思，由教師回饋。`,
    expect: {'B-1-IV-1': 3, 'C-1-IV-1': 2, 'D-1-IV-1': 3, 'D-2-IV-1': 3, 'B-2-IV-1': 1},
    why: 'B-1 去識別化並繳交紀錄；D-1 自行判斷、D-2 角色扮演，皆有反思回饋。第 5 週依專業修改 AI 初稿接近 C-1，但未寫驗證方式，暫定 L2。'},
  {id: 'cal-a-only', kind: 'A 證據不應被當成 B/C/D', title: '自主學習專題（通識）',
    text: `第 1 週：學生訂定個人學習計畫，選定一項想自學的技能。

第 2–3 週：學生比較 NotebookLM、ChatGPT 與 Perplexity 整理學習資料的效果，填寫工具評比表並寫下選用理由。

第 4–15 週：每週撰寫 AI 學習日誌，記錄如何用 AI 搜尋與整理資料、遇到的困難與調整的學習策略；每月與教師面談一次，教師依日誌給予回饋，日誌占 40%。`,
    expect: {'A-1-IV-1': 3, 'A-2-IV-1': 4},
    why: '全為 A 的證據（工具評比、學習日誌與反思）。與教師面談是學習輔導，不視為 D-2 的同理互動；B/C/D 應為 L0。'},
  {id: 'cal-grading-table', kind: '證據分散（活動與評量分開寫）', title: '新聞採訪與 AI（傳播系二年級）',
    text: `第 4 週：學生用 AI 產生一則地方新聞初稿，逐句比對原始新聞稿與官方資料，標出錯誤與誤導之處。

第 8 週：學生訪談三位在地商家，了解他們對 AI 生成新聞的看法。

第 12 週：分組辯論「新聞媒體是否應全面使用 AI 寫稿」，說明對記者工作與讀者的影響。

評量方式：
- 查核紀錄 20%
- 訪談逐字稿與心得 20%
- 辯論表現 20%（依評分尺規）
- 期末作品 40%`,
    expect: {'B-2-IV-1': 4, 'D-2-IV-1': 4, 'B-3-IV-1': 3},
    why: '活動寫在週次，評量寫在最後的列表，應整合全課程證據：B-2 查核＋紀錄配分；D-2 訪談＋逐字稿配分；B-3 辯論影響並依尺規評分，但未寫具體產出，暫定 L3。'},
];
CASES.find(c => c.id === 'cal-duplicate').text = Array(3).fill(CASES.find(c => c.id === 'cal-partial-writing').text).join('\n\n');
