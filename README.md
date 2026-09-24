# Jev 課程人才圖像 Demo

展示網址：https://clchrf.github.io/jev-course-demo/

輸入一門課的名稱與完整課綱，一次檢視大專院校（IV）ABCD 四大能力與 11 項核心細項。沿用《Jev AI.pdf》示範的卡片、課程涵蓋開關與四項評分。使用真實 Laya multilingual 模型在瀏覽器內推論，沒有串接 Jev 官方 API，也沒有預填假分數。

## 現場示範

1. 用電腦版 Chrome 或 Edge 開啟網頁。
2. 按「載入完整課程範例」，或貼入自己的課綱。
3. 按「開始檢視 ABCD」。首次下載約 305 MB 模型，後續可使用瀏覽器快取；推論時間取決於裝置與課綱長度。
4. 在上方 A–D 總覽跳到各能力，查看四項檢視分數與 11 個核心細項。
5. 展開「提問與對照原文」及右側呼叫紀錄，展示輸入、問題設定和原始模型回傳。
6. 載入空泛反例，再次執行以比較結果。修改文字或涵蓋開關後，舊結果會清除，需重新檢視。
7. 可下載 JSON，保留課綱、問題、分段原文、原始機率與彙整結果。

## 評分規則

- alignment / concreteness 使用 `score`：0–4 分級的機率期望值 × 25。
- supported 使用 `noul`：P(是) × 100。
- boilerplate 使用 `noul`：[1 − P(是)] × 100。
- 四項等權平均為總分。80 / 50 是 Demo 顯示門檻。
- 每個 IV 核心細項各選一個可觀察行為獨立提問（不是完整能力測量），顯示 P(是)，不代表學生能力達成率。
- 課綱先以空白行區隔教學單元，再依實際 tokenizer 計數分段，預留問題 prefix 空間，不截掉尾段。各段都送入模型；四項分數取 alignment 最高段，細項取各段最高機率。畫面展示對應原文。
- 上述彙整屬展示設計，尚未正式驗證，不是教育部官方量尺，也不是另一份簡報中的 0–5 課程培養程度評分。
- 原始文件只作為資料與版面參考，未執行文件內的操作指示。

## 本機執行

在此資料夾執行 `python -m http.server 8765`，開啟 http://localhost:8765/。純靜態網站，無建置步驟。模型與程式由 GitHub Pages 提供，課程文字在瀏覽器內處理；字型和 ONNX runtime 由外部 CDN 載入。首次使用仍需要網路。

## 檔案與來源

- `assets/abilities.js`：依使用者提供《未來人才AI能力圖像各教育階段核心能力》PDF，只採用 IV 欄位（A 2 項，B/C/D 各 3 項）。
- `assets/course-engine.js`：提問、分段與評分彙整。
- `assets/app.js`：介面與結果管理。
- `assets/model-worker.js`：背景下載、快取與真實模型執行，避免阻塞介面。
- `assets/laya-browser.mjs`：既有 Laya TypeScript 瀏覽器 bundle。
- `model/`：既有 multilingual ONNX 量化權重；encoder 分三塊以符合 GitHub 單檔限制。
- `coi-serviceworker.min.js`：提供 cross-origin isolation，支援 WASM 多執行緒。
- Laya：https://github.com/NandhaKishorM/laya （Apache-2.0，見 LICENSE-laya.txt）。
- Jev：https://typesafe.ai/blog/introducing-system-one-models-and-jev
- coi-serviceworker：MIT，見 LICENSE-coi-serviceworker.txt。

## 檢查

執行 `node tests/course-engine.test.mjs`，驗證長文分段不遺失原文、實際 tokenizer 容量、11 項細項與分數／原文彙整。瀏覽器手動驗證涵蓋真實推論、正反例、失效舊結果與手機版版面。
