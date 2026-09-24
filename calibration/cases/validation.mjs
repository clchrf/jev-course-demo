// Independent validation set. Written AFTER the rubric was frozen (commit c32da85) and never used
// to change cue lists or thresholds. Different departments and wording from the calibration set.
// Labels are PROVISIONAL, drafted by Claude (AI assistant) from the official IV wording.
// They are NOT teacher or expert annotations and must be reviewed by people before being relied on.
export const LABEL_STATUS = '暫定標籤：由 Claude 依官方 IV 定義擬定，非教師或專家人工標註，需人工複核。規則凍結後才撰寫。';

const filler = n => Array.from({length: n}, (_, i) =>
  `Week ${i + 1}：熱力學第 ${i + 1} 章，教師講解例題，學生完成課本習題並於下週課堂檢討。`).join('\n');

export const CASES = [
  {id: 'val-mech-design', kind: '具體正例', title: 'AI 輔助產品設計（機械系三年級）',
    text: `一、課程說明
本課程帶學生把生成式 AI 用在產品設計流程的前期發想與後期檢驗。

二、教學活動
1. 第 2 週：學生用 Midjourney 與 Stable Diffusion 各產生 20 張椅子概念圖，比較兩者在結構可行性與風格控制上的差異，交一頁比較說明並選定後續使用的工具。
2. 第 5–6 週：各組到校內圖書館觀察學生實際坐姿與使用情境，拍照記錄 30 筆觀察，據此提出自己的設計概念，AI 只能用來整理觀察筆記。
3. 第 9 週：AI 生成圖若參考他人作品，須在作品說明中註明使用的工具與提示詞，並檢查是否侵害著作權。
4. 第 12–14 週：學生用 AI 對設計做結構強度的初步推估，再以有限元素分析軟體驗算，記錄 AI 推估與實際分析的差距。

三、評量
期末提交設計原型與設計報告，由業師與教師依評分尺規共同評分（50%）；比較說明與觀察紀錄各占 15%。`,
    expect: {'A-1-IV-1': 4, 'D-3-IV-1': 4, 'B-1-IV-1': 3, 'C-1-IV-1': 4, 'B-2-IV-1': 3},
    why: 'A-1 比較兩工具、交比較說明並配分；D-3 實地觀察並提出自己的設計，有觀察紀錄配分；B-1 註明工具與提示詞、檢查著作權（無評分）；C-1 用 AI 推估再以專業軟體驗算並記錄差距，期末報告評分；記錄 AI 推估誤差也屬辨識 AI 誤判，暫定 B-2 L3。'},
  {id: 'val-vague', kind: '空泛反例', title: '智慧觀光導論（觀光系一年級）',
    text: `本課程希望學生擁抱 AI 時代，具備前瞻視野與創新思維。
課程將融入人工智慧相關議題，使學生了解 AI 對觀光產業的衝擊，並培養批判思考、團隊合作、溝通表達與終身學習能力，成為產業所需的跨域人才。`,
    expect: {'A-2-IV-1': 1, 'B-3-IV-1': 1, 'C-2-IV-1': 1, 'D-2-IV-1': 1, 'D-3-IV-1': 1},
    why: '全部是願景與能力名詞，沒有任何學生任務。提到終身學習、產業衝擊、跨域、溝通、創新，最高 L1。'},
  {id: 'val-d-only', kind: '部分涵蓋', title: '長期照顧服務實務（社工系三年級）',
    text: `第 3 週：照服機構已導入 AI 排班與風險預警系統。學生到機構見習，觀察照服員如何看待系統建議。

第 4–5 週：學生兩人一組訪談一位長者與一位家屬，了解他們對照顧安排的期待，撰寫訪談紀錄。

第 7 週：情境演練：AI 預警顯示某長者跌倒風險高，建議限制其活動。學生扮演社工，與扮演長者的同學溝通，並自行決定要不要採納系統建議，寫下決定理由；演練後由教師與同學給回饋。`,
    expect: {'D-1-IV-1': 3, 'D-2-IV-1': 4, 'D-3-IV-1': 2},
    why: '只涉及 D。D-1 自行決定並寫理由、有回饋；D-2 訪談紀錄＋演練回饋；D-3 實地見習觀察但沒有產出或評量，暫定 L2。'},
  {id: 'val-noai-history', kind: '無 AI 課程', title: '台灣史（通識）',
    text: `第 1–4 週：清領時期的移墾社會，學生閱讀史料並撰寫 800 字心得。
第 5–8 週：日治時期的現代化，學生分組到地方文史館參訪，繳交參訪報告。
第 9 週：分組辯論「殖民現代性」，依評分尺規評分。
第 10–16 週：戰後史，期末學生訪談家中長輩的生命經驗，完成口述歷史作品。`,
    expect: {},
    why: '活動具體但完全沒有 AI 情境；參訪、訪談、辯論不應被當成 AI 人才圖像證據。'},
  {id: 'val-tools-bullets', kind: '只列工具名稱', title: '商業簡報技巧（企管系一年級）',
    text: `使用軟體與 AI 工具
- PowerPoint
- Canva
- ChatGPT
- Gamma
- Copilot

評分：出席 20%、期中簡報 40%、期末簡報 40%。`,
    expect: {},
    why: '只列出工具與評分比例，沒說明學生如何使用 AI，也沒有任何細項相關敘述。'},
  {id: 'val-negation', kind: '否定敘述', title: '財務報表分析（財金系三年級）',
    text: `本課程的作業與考試均不使用生成式 AI，因此不需要撰寫 AI 使用聲明，也不進行 AI 工具的比較。

第 6 週：學生用 ChatGPT 解讀一家上市公司的財報，再逐項核對 AI 說明與原始財報數字，找出錯誤並繳交核對表，由助教批改。`,
    expect: {'B-2-IV-1': 4},
    why: '開頭否定 B-1、A-1，不應計入。第 6 週核對 AI 對財報的解讀並找出錯誤、繳交核對表並批改，屬 B-2 L4。也接近 C-1，但沒有形成解決方案，暫定 C-1 L0。'},
  {id: 'val-reordered-dup', kind: '重複文字與順序改變', title: '數據新聞實作（新聞系三年級）',
    text: `期末：各組提交數據新聞作品，依尺規評分。

第 10 週：學生用 AI 分析 2,000 筆市府開放資料，找出交通事故熱點，並用專業統計方法驗證 AI 的結論。

第 10 週：學生用 AI 分析 2,000 筆市府開放資料，找出交通事故熱點，並用專業統計方法驗證 AI 的結論。

第 3 週：學生練習將受訪者個資去識別化，並在稿件末標註 AI 使用範圍。

第 10 週：學生用 AI 分析 2,000 筆市府開放資料，找出交通事故熱點，並用專業統計方法驗證 AI 的結論。`,
    expect: {'C-1-IV-1': 3, 'B-1-IV-1': 2},
    why: '第 10 週段落重複三次、順序打亂，不應加分。C-1 有練習與驗證（期末作品評分未直接連到此活動），暫定 L3；B-1 有練習但無產出與檢核，L2。'},
  {id: 'val-long-tail', kind: '長課綱尾段才有證據', title: '工程熱力學與 AI 應用（機械系二年級）',
    text: `${filler(16)}

Week 17：學生用 AI 助理規劃一套熱交換器的設計計算流程，小組畫出人機分工流程圖，標明哪些計算由 AI 產生、哪些由人工覆核，並記錄 AI 算錯的地方。
Week 18：各組口頭報告流程圖與錯誤紀錄，教師依尺規評分。`,
    expect: {'C-3-IV-1': 4, 'B-2-IV-1': 4},
    why: '前 16 週沒有 AI；Week 17–18 才有人機分工流程圖、人工覆核、AI 錯誤紀錄與評分（C-3 L4）。記錄 AI 算錯處屬辨識 AI 誤判（B-2），暫定 L4。'},
  {id: 'val-teacher-demo', kind: '教師示範（學生未實作）', title: '法律資訊檢索（法律系二年級）',
    text: `第 8 週：教師示範如何用 AI 搜尋判決，並說明 AI 可能捏造判決字號的風險及查證的重要。
第 9–16 週：民法案例研讀，期末筆試。`,
    expect: {'B-2-IV-1': 1, 'A-2-IV-1': 1},
    why: '只有教師示範與說明，學生沒有實作，最高 L1。'},
  {id: 'val-a-only', kind: 'A 證據不應被當成 B/C/D', title: '英文自學策略（外文系一年級）',
    text: `第 1 週：學生設定一學期的英文自學目標。
第 2–17 週：學生每週用 AI 對話練習英文口說 30 分鐘，在學習歷程檔案記錄 AI 糾正的文法重點，以及下週要調整的練習方式。
第 18 週：繳交學習歷程檔案，教師依反思深度評分。`,
    expect: {'A-2-IV-1': 4},
    why: '全為 A-2（AI 輔助自學、學習歷程與反思評分）。與 AI 對話練習口說不是與真人互動，不屬 D-2；記錄 AI 糾正的文法不是查核 AI 錯誤，不屬 B-2。'},
  {id: 'val-goal-plus-grading', kind: '只有目標與評分（無活動）', title: '資訊倫理（資管系二年級）',
    text: `課程目標：建立學生 AI 倫理與個資保護觀念，理解 AI 對社會的影響。

評分方式：AI 使用聲明 10%、期中考 40%、期末考 50%。`,
    expect: {'B-1-IV-1': 1, 'B-3-IV-1': 1},
    why: '只有目標與配分，沒有說明學生做什麼練習。聲明列入配分但沒有活動，最高 L1。'},
  {id: 'val-english', kind: '中英混寫', title: 'Global Marketing with AI（國企系，英語授課）',
    text: `Week 4: Students use ChatGPT to draft market-entry reports, then fact-check every statistic against official trade data and submit a verification log (10%).

Week 7: Role-play negotiation with a partner acting as a Japanese buyer; students must consider cultural differences, and write a reflection afterwards.`,
    expect: {'B-2-IV-1': 4, 'D-2-IV-1': 3},
    why: '英文描述。B-2 查核統計並繳交紀錄配分；D-2 角色扮演、考量文化差異並寫反思。規則以中文為主，此案例檢查英文課綱的限制。'},
];
