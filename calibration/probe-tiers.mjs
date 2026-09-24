// Exploratory probe: can the checkpoint tell "goal only" from "practice / output / assessment"?
import {loadAgent} from './laya-node.mjs';
const agent = await loadAgent();
const T = {
  goal: '本課程培養學生查核 AI 生成內容的能力，建立資訊查證觀念。',
  mention: '學生將了解 AI 可能產生錯誤資訊，並認識事實查核的重要性。',
  practice: '第 7 週課堂上，學生分組用 ChatGPT 產生三則新聞摘要，逐句比對原始新聞找出錯誤。',
  output: '第 7 週學生分組用 ChatGPT 產生三則新聞摘要，逐句比對原始新聞，繳交查核紀錄表，標出每一處錯誤與正確來源。',
  assess: '第 7 週學生分組用 ChatGPT 產生三則新聞摘要，逐句比對原始新聞，繳交查核紀錄表並撰寫反思；教師依查核正確率與來源完整度評分，占學期成績 10%。',
  negated: '本課程不安排 AI 內容查核的練習或作業，僅於期末提及資訊查證的重要性。',
  toolsOnly: '使用工具：ChatGPT、Gemini、Perplexity、Copilot、NotebookLM。',
  unrelated: '第 7 週學生分組操作滴定實驗，繳交實驗紀錄表，依數據正確率評分。',
  otherAI: '第 7 週學生分組用 ChatGPT 比較三種 AI 工具的摘要速度，填寫工具評比表並說明選用理由。',
};
const Q = {
  en_default: {type: 'noul', instructions: 'Do students check whether AI-generated content is correct?'},
  en_practice: {type: 'noul', instructions: 'Do students actually carry out an activity in which they check AI-generated content against sources?',
    criteria: {true: 'the text describes a concrete student activity checking AI output', false: 'the text only states a goal, mentions the topic, or describes no such activity'}},
  en_output: {type: 'noul', instructions: 'Do students hand in a concrete product (record, report, form) from checking AI-generated content?',
    criteria: {true: 'a named deliverable from the checking activity is required', false: 'no deliverable is named'}},
  en_assess: {type: 'noul', instructions: 'Is the fact-checking work graded, reviewed, or reflected on with stated criteria?',
    criteria: {true: 'grading, criteria, weighting, feedback or written reflection is stated', false: 'no assessment or reflection is stated'}},
  zh_practice: {type: 'noul', instructions: '學生是否實際進行查核 AI 生成內容的課堂活動？',
    criteria: {true: '有具體的學生查核活動', false: '只寫目標、只提到主題，或沒有這類活動'}},
  zh_assess: {type: 'noul', instructions: '查核成果是否有評分、評量標準或反思？',
    criteria: {true: '寫明評分、標準、配分或反思', false: '沒有寫明評量或反思'}},
  choice_tier: {type: 'choice', instructions: 'What is the strongest evidence that students verify AI-generated content?',
    criteria: {P: 'no such content at all', Q: 'only a goal or a mention of the topic', R: 'students do a verification activity', S: 'students produce a named verification record', T: 'verification work is graded or reflected on'}},
};
console.log('text'.padEnd(10), Object.keys(Q).join(' | '));
for (const [name, t] of Object.entries(T)) {
  const r = (await agent.predict(t, Q)).answers;
  console.log(name.padEnd(10), Object.entries(r).map(([k, v]) => v.type === 'choice' ? v.choice + JSON.stringify(Object.values(v.probabilities).map(x => +x.toFixed(2))) : v.noul.toFixed(2)).join(' | '));
}
