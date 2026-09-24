# Jev 課程計畫檢視（開源版 Laya）

線上展示：https://clchrf.github.io/jev-course-demo/

以 [Laya](https://github.com/NandhaKishorM/laya)（TypeSafe Jev 的開源對應版本）在瀏覽器內即時判讀大專院校 AI 課程計畫，對照教育部《未來人才 AI 能力圖像》大專院校階段（IV）四大能力。模型完全在瀏覽器執行（onnxruntime-web，多執行緒 WASM），課程文字不會送到任何伺服器。

## 評分方式

每項能力送 6 題是非題（`noul`）給 Laya，一次編碼器運算完成：

| 畫面名稱 | 問題 | 換算 | 驗證 AUC |
|---|---|---|---|
| 對到定義 | 該能力的 3 題核心行為題 | 取最高 × 100 | 0.78 |
| 看得到做法 | 週次／評分方式、具體數字／資料／工具 | 兩題平均 × 100 | 0.98 |
| 成果不誇大 | 同上 3 題核心行為題 | 三題平均 × 100 | 0.68 |
| 不是範本 | 是否只是空泛口號 | (1 − P) × 100 | 1.00 |

四項平均的總分 AUC 為 0.93（20 段課程文字，其中 12 段未參與調整題目）。示範資料，不代表實際案例；結果僅供參考，未經嚴謹驗證。

## 檔案

- `model/`：`convaiinnovations/laya` 的 `multilingual` 權重，經 `laya-ts/scripts/export_onnx.py` 轉成 ONNX，再以權重量化（詞嵌入 4-bit、MatMul 8-bit）；`encoder.onnx` 切成 3 塊以符合 GitHub 單檔 100MB 上限，由 `assets/app.js` 在瀏覽器合併。
- `assets/laya-browser.mjs`：laya-ts 以 esbuild 打包的瀏覽器版（固定使用 WASM 執行）。
- `coi-serviceworker.min.js`：讓 GitHub Pages 取得 cross-origin isolation 以啟用多執行緒。

## 授權

- Laya 程式與權重：Apache-2.0，© Convai Innovations（見 `LICENSE-laya.txt`）
- coi-serviceworker：MIT，© Guido Zuidhof（見 `LICENSE-coi-serviceworker.txt`）
- Jev 為 TypeSafe AI 之閉源產品，本專案未使用其服務。
