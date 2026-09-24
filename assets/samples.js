// Test syllabi offered on the page. The first two are the original built-in examples; the others are
// fictional syllabi written for this demo in the layout of Taiwanese university course systems
// (not copied from any real course). They were written after the rubric was frozen and are not used
// to tune rules. Real public syllabi are linked in REAL_SYLLABI; their text is copyrighted and not bundled.
import {ABILITIES} from './abilities.js';

export const SAMPLES = [
  {id: 'good', label: '完整範例', kind: '內建範例', title: '顧客關係管理與 AI 應用（餐旅系三年級）',
    text: ABILITIES.map(a => a.good).join('\n\n')},
  {id: 'bad', label: '空泛反例', kind: '內建範例', title: '顧客關係管理與 AI 應用（餐旅系三年級）',
    text: ABILITIES.map(a => a.bad).join('\n\n')},
  {id: 'writing', label: '通識寫作', kind: '虛構・部分涵蓋', title: 'AI 時代的閱讀與寫作（通識，大一國文）',
    text: `課程概述
本課程帶領學生在生成式 AI 普及的情境下重新練習閱讀、思辨與寫作，培養負責任使用 AI 的態度與獨立思考能力。

課程目標
1. 能說明生成式 AI 在寫作上的用途與限制。
2. 能在作業中誠實揭露 AI 的使用情形。
3. 能獨立完成一篇具個人觀點的評論文章。

AI 使用規範
本課程允許使用 ChatGPT 等工具協助發想與修辭，但每份作業須附「AI 使用紀錄」，寫明使用的工具、提示詞與採用的段落；未附紀錄者該次作業不予計分。

課程進度
第 1 週：課程介紹、AI 與寫作的關係
第 2–3 週：閱讀單元一〈論說文的結構〉，學生分組拆解範文論點
第 4 週：學生請 AI 摘要同一篇文章，再逐段比對原文，標出 AI 漏掉或扭曲的論點，繳交比對表
第 5–7 週：閱讀單元二〈報導文學〉
第 8 週：期中寫作：學生到校園周邊觀察一個生活現象，自己擬定題目寫 800 字觀察短文，不得使用 AI 生成內文
第 9–12 週：閱讀單元三〈科技與人文〉，課堂討論 AI 對創作者工作的影響
第 13–16 週：期末評論文章撰寫與同儕互評
第 17–18 週：彈性學習週

評量方式
平時作業（含 AI 使用紀錄）30%
AI 摘要比對表 10%
期中觀察短文 25%（依寫作尺規評分）
期末評論文章 25%
課堂參與 10%`},
  {id: 'marketing', label: '行銷研究', kind: '虛構・課程系統表格', title: '行銷研究與 AI 資料分析（企管系三年級）',
    text: `課程概述 Course Description
本課程結合行銷研究方法與 AI 分析工具，學生以真實企業資料完成一份市場研究報告。

課程學習目標 Course Objectives
能設計問卷與抽樣計畫
能運用 AI 工具分析質性與量化資料
能判讀 AI 分析結果並提出行銷建議

課程進度 Progress Description
週次	進度說明
1	課程介紹與分組，確認合作企業（在地連鎖咖啡品牌）
2	行銷研究流程與研究問題設定
3	次級資料蒐集：學生比較 Perplexity、Google Scholar 與 NotebookLM 蒐集產業資料的完整度與可信度，填寫工具比較表
4	問卷設計與前測
5	抽樣方法
6	資料蒐集：各組至門市訪談 5 位顧客並回收 100 份問卷
7	AI 質性分析：學生用 ChatGPT 將訪談逐字稿歸納主題，再由兩位組員人工編碼 20% 資料，計算與 AI 歸納的一致率
8	期中報告：研究設計與初步發現
9	期中考週
10	量化分析（一）敘述統計
11	量化分析（二）迴歸分析，學生比較 AI 產生的程式碼與自己撰寫的分析結果是否一致
12	研究倫理：受訪者個資去識別化練習，並撰寫資料使用聲明
13	人機分工檢討：各組繪製本專案的人機分工流程，標出 AI 出錯的步驟與人工覆核方式
14	行銷建議撰寫：由各組自行決定提案方向，說明為何採納或不採納 AI 的建議
15	業師講評與修正
16	期末成果發表（向合作企業簡報）
17	期末報告繳交
18	彈性學習週

評量方式 Grading
方法	百分比%
工具比較表	10
質性分析與一致率報告	15
期中報告	20
期末報告與簡報（依評分尺規，含業師評分）	40
課堂參與	15`},
  {id: 'manufacturing', label: '智慧製造', kind: '虛構・講授為主', title: '智慧製造導論（工管系二年級）',
    text: `課程概述
工業 4.0 與人工智慧正深刻改變製造業。本課程介紹智慧製造的核心技術與產業趨勢，培養學生具備 AI 時代所需的跨領域整合能力、創新思維與終身學習的態度，並了解 AI 帶來的倫理與社會影響。

課程目標
1. 了解智慧製造與工業 4.0 的基本概念
2. 認識機器學習、物聯網與數位孿生
3. 培養運用 AI 解決製造問題的能力
4. 建立 AI 倫理與資安意識

課程進度
1	課程介紹
2	工業 4.0 概論
3	物聯網與感測技術
4	大數據與雲端運算
5	機器學習概論（一）
6	機器學習概論（二）
7	生成式 AI 在製造業的應用
8	數位孿生
9	期中考
10	智慧工廠案例介紹
11	預測性維護
12	品質檢測與電腦視覺
13	供應鏈與 AI
14	AI 倫理、資安與社會影響
15	產業趨勢講座
16	課程回顧
17	期末考
18	彈性學習週

評量方式
出席 20%
期中考 35%
期末考 35%
心得報告 10%`},
];

export const REAL_SYLLABI = [
  {school: '國立臺灣大學', course: '生成式人工智慧導論（112-2）',
    url: 'https://nol.ntu.edu.tw/nol/coursesearch/print_table.php?course_id=921+U3570&class=&dpt_code=9210&ser_no=74774&semester=112-2'},
  {school: '國立成功大學／AI 聯盟', course: '生成式AI：文字與圖像生成的原理與實務（113-2）',
    url: 'https://class-qry.acad.ncku.edu.tw/syllabus/online_display_remote.php?class_code=&co_no=ZA50900&sem=2&syear=0113'},
  {school: '國立成功大學', course: '人工智慧與應用（113-1）',
    url: 'https://class-qry.acad.ncku.edu.tw/syllabus/online_display.php?class_code=&co_no=N063700&sem=1&syear=0113'},
];
