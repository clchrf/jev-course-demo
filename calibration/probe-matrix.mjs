// Exploratory probe: diagonal (right competency) vs off-diagonal responses of per-competency noul questions.
import {loadAgent} from './laya-node.mjs';
const agent = await loadAgent();
const variant = process.argv[2] || 'plain';
const Qs = {
  A1: 'Do students compare or evaluate different AI tools and choose one for a task?',
  A2: 'Do students record or reflect on how they learn with AI, such as a learning log?',
  B1: 'Must students disclose their AI use, or handle copyright or personal data rules?',
  B2: 'Do students fact-check AI output or identify AI bias, errors or security risks?',
  B3: 'Do students debate or judge the social or ethical impact of an AI application?',
  C1: 'Do students use AI to analyse real data or a real problem and propose a solution?',
  C2: 'Do students examine how an AI model works or its limits, and combine knowledge from other fields?',
  C3: 'Do students plan which steps AI does and which a human reviews in a workflow?',
  D1: 'Do students make a decision themselves and justify it, rather than following the AI?',
  D2: 'Do students interview, role-play or communicate with real people and consider their needs?',
  D3: 'Do students observe real-world situations and create their own original ideas or designs?',
};
const crit = {true: 'yes, the text describes students doing exactly this', false: 'no, the text is about something else, only states a goal, or says it is not done'};
const q = Object.fromEntries(Object.entries(Qs).map(([k, ins]) => [k, variant === 'crit' ? {type: 'noul', instructions: ins, criteria: crit} : {type: 'noul', instructions: ins}]));
const T = {
  A1: '第 3 週學生比較 ChatGPT、Perplexity、NotebookLM 整理文獻的正確性與耗時，填寫評比表並選定工具。',
  A2: '每週學生撰寫 AI 學習日誌，記錄提問方式、AI 回答的問題與自己如何修正學習策略。',
  B1: '所有作業須附 AI 使用聲明，標註使用的工具與提示詞；並練習將客戶資料去識別化。',
  B2: '學生分組用 ChatGPT 產生新聞摘要，逐句比對原始新聞，找出錯誤與偏誤，繳交查核紀錄。',
  B3: '學生針對 AI 監控員工的案例進行辯論，分析對員工與企業的影響，並撰寫立場報告。',
  C1: '學生取得合作店家 300 筆銷售資料，用 AI 分析銷售趨勢並提出庫存改善方案。',
  C2: '學生測試模型在不同資料來源下的輸出差異，說明其限制，並結合行銷與統計知識修正分析。',
  C3: '小組繪製人機分工流程圖，標出哪些步驟交給 AI、哪些由人覆核，並記錄 AI 錯誤回報。',
  D1: '學生看完 AI 建議的補償方案後，自行決定是否給予補償，並寫下判斷理由與承擔的後果。',
  D2: '學生訪談三位社區長者，了解他們使用數位服務的困難，並進行服務情境角色扮演。',
  D3: '學生實地觀察夜市人潮與攤商需求，提出自己的創新服務設計，AI 只用於整理觀察紀錄。',
  goal: '培養學生運用 AI 的能力，提升自主學習、倫理素養、解決問題與溝通創造力。',
  tools: '使用工具：ChatGPT、Gemini、Perplexity、Copilot、NotebookLM。',
  noAI: '第 1–18 週：會計原則、分錄練習、試算表編製，期中期末筆試。',
};
console.log('text  ', Object.keys(Qs).map(k => k.padStart(4)).join(' '), ' diag  maxOff');
const M = {};
for (const [n, t] of Object.entries(T)) {
  const a = (await agent.predict(t, q)).answers;
  M[n] = Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v.noul]));
  const off = Object.entries(M[n]).filter(([k]) => k !== n).map(([, v]) => v);
  console.log(n.padEnd(6), Object.keys(Qs).map(k => M[n][k].toFixed(2).padStart(4)).join(' '), ' ', (M[n][n] ?? NaN).toFixed(2), ' ', Math.max(...off).toFixed(2));
}
