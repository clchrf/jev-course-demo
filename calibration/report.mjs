// Build calibration/results/REPORT.md from calibration.json and validation.json.
import fs from 'node:fs';
const load = s => JSON.parse(fs.readFileSync(new URL(`./results/${s}.json`, import.meta.url), 'utf8'));
const sets = ['calibration', 'validation'].filter(s => fs.existsSync(new URL(`./results/${s}.json`, import.meta.url))).map(s => [s, load(s)]);
const AB = ['A', 'B', 'C', 'D'];
const L = [];
L.push('# 評分校準報告（自動產生）', '', '由 `node calibration/run.mjs <set>` 產生原始結果，`node calibration/report.mjs` 產生本檔。', '',
  '> 所有預期等級皆為 **暫定標籤**：由 Claude 依官方 IV 定義擬定，並非教師或專家人工標註。驗證集在規則凍結（commit c32da85）後才撰寫，未用來調整規則或門檻。', '');
for (const [name, {summary: s, results}] of sets) {
  L.push(`## ${name === 'calibration' ? '校準集' : '驗證集'}（${s.cases} 門課 × 11 細項 = ${s.cells} 格）`, '');
  L.push('### 修改前（v1）與修改後（v2）各向度分數', '', '| 案例 | 類型 | v1 A/B/C/D | v2 A/B/C/D | v2 狀態 |', '|---|---|---|---|---|');
  for (const r of results) {
    const v1 = AB.map(a => r.legacy.abilities[a].total).join(' / ');
    const v2 = AB.map(a => r.abilities[a].total).join(' / ');
    const st = AB.map(a => ({ok: '✓', review: '複核', insufficient: '不足'})[r.abilities[a].status]).join(' ');
    L.push(`| ${r.id} | ${r.kind} | ${v1} | ${v2} | ${st} |`);
  }
  L.push('', '### 細項判定與暫定標籤的一致性', '');
  L.push(`- v2 證據等級完全一致：${(s.exactAgreement * 100).toFixed(1)}%；差距 ≤1 級：${(s.within1 * 100).toFixed(1)}%`);
  L.push(`- v2 以「≥L2（有學生練習）」判斷是否涵蓋：一致率 ${(s.rubricAccuracyAtL2 * 100).toFixed(1)}%`);
  L.push(`- v1 以「細項 P(是) ≥ 0.5」判斷是否涵蓋：一致率 ${(s.legacy.detailAccuracyAt50 * 100).toFixed(1)}%；AUROC ${s.legacy.detailAuroc}；在 ${s.legacy.negatives} 個應為未涵蓋的格子中誤判 ${s.legacy.falsePositivesAt50} 個`);
  L.push(`- v2 誤把其他證據算成此細項（預期 L0、判為 ≥L2）：${s.falseAttribution.length ? s.falseAttribution.join('、') : '無'}`);
  L.push(`- v2 漏判（預期 ≥L2、判為 <L2）：${s.missed.length ? s.missed.join('、') : '無'}`);
  L.push(`- 變形測試：段落重排 ${s.metamorphic.reorder ? '不變 ✓' : '有變動 ✗'}；內容重複 ${s.metamorphic.duplicate ? '不加分 ✓' : '加分 ✗'}；刪除關鍵段落 ${s.metamorphic.deletion ? '等級降至 <L2 ✓' : '未下降 ✗'}`, '');
  L.push('### 等級不一致的格子', '', '| 案例 | 細項 | 暫定 | v2 |', '|---|---|---|---|');
  for (const r of results) for (const c of r.cmp) if (c.expect !== c.got) L.push(`| ${r.id} | ${c.id} | L${c.expect} | L${c.got} |`);
  L.push('', '### Laya 機率能否分辨「此細項有練習」（課程層級，全段最高 P）', '', '| 細項 | 正例數 | 負例數 | 正例平均 P | 負例平均 P | AUROC |', '|---|---|---|---|---|---|');
  for (const m of s.model) L.push(`| ${m.id} | ${m.pos} | ${m.neg} | ${m.meanPos ?? '–'} | ${m.meanNeg ?? '–'} | ${m.auroc ?? '–'} |`);
  L.push('');
}
fs.writeFileSync(new URL('./results/REPORT.md', import.meta.url), L.join('\n') + '\n');
console.log(L.join('\n'));
