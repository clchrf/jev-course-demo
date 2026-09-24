// Model-level checks that do not depend on any scoring formula.
import fs from 'node:fs';
import {loadAgent} from './laya-node.mjs';
import {ABILITIES} from '../assets/abilities.js';
import {questionsFor} from './legacy-engine.js';
import {buildQuestionPrefix, toInternal} from '../assets/laya-browser.mjs';

const agent = await loadAgent();
const report = {};
// 1) Prefix budget: does any question get its instruction truncated by head_max_len?
report.prefix = [];
for (const ab of ABILITIES) for (const [k, q] of Object.entries(questionsFor(ab))) {
  const iq = toInternal(q), full = agent.tok.encode(`${iq.t} question: ${iq.ins}`).length;
  const p = buildQuestionPrefix(agent.tok, iq, agent.maxLen, agent.headMaxLen);
  const kept = p.markers[0] - 2;
  report.prefix.push({ab: ab.id, k, prefixTokens: p.ids.length, questionTokens: full, kept, truncated: kept < full});
}
console.log('prefix truncated:', report.prefix.filter(p => p.truncated).map(p => p.ab + '.' + p.k));
console.log('max prefix tokens:', Math.max(...report.prefix.map(p => p.prefixTokens)), 'context budget used by page:', agent.maxLen - agent.headMaxLen - 8);

// 2) Batch invariance: same question alone vs inside a batch of 3.
const ab = ABILITIES[2], qs = questionsFor(ab), txt = ab.good;
const batch = await agent.predict(txt, qs);
let maxDiff = 0;
for (const [k, q] of Object.entries(qs)) {
  const single = (await agent.predict(txt, {[k]: q})).answers[k];
  const a = single.noul ?? single.score, b = batch.answers[k].noul ?? batch.answers[k].score;
  maxDiff = Math.max(maxDiff, Math.abs(a - b));
}
report.batchMaxDiff = maxDiff; console.log('batch vs single max |diff|:', maxDiff);

// 3) Label/prior bias: answers on content-free or unrelated text.
const nulls = {empty: '', weather: '今天天氣晴朗，氣溫攝氏二十五度。', unrelated: '第 1–18 週：有機化學反應機構、滴定實驗與期末筆試。', dots: '。。。'};
report.nulls = {};
for (const [name, t] of Object.entries(nulls)) {
  report.nulls[name] = {};
  for (const ab of ABILITIES) {
    const r = await agent.predict(t, questionsFor(ab));
    report.nulls[name][ab.id] = Object.fromEntries(Object.entries(r.answers).map(([k, v]) => [k, v.noul ?? v.score]));
  }
  console.log('null', name, JSON.stringify(report.nulls[name]));
}
// 4) Score distribution: does level 0 ever win? (upstream reports multilingual position bias, laya#131)
const sc = await agent.predict(nulls.unrelated, {x: questionsFor(ABILITIES[0]).alignment});
report.scoreProbsOnUnrelated = sc.answers.x.probabilities; console.log('alignment probs on unrelated:', sc.answers.x.probabilities);
fs.mkdirSync(new URL('./results/', import.meta.url), {recursive: true});
fs.writeFileSync(new URL('./results/diagnose.json', import.meta.url), JSON.stringify(report, null, 1));
