// Reproduce the v1 page pipeline exactly (same chunking, batches of 3, same aggregation).
import fs from 'node:fs';
import {loadAgent} from './laya-node.mjs';
import {ABILITIES} from '../assets/abilities.js';
import {questionsFor, splitCourse, aggregate} from './legacy-engine.js';

const title = '顧客關係管理與 AI 應用（餐旅系三年級）';
const agent = await loadAgent();
const out = {model: 'laya multilingual quantized ONNX (onnxruntime-node)', createdAt: new Date().toISOString(), runs: {}};
for (const kind of ['good', 'bad']) {
  const text = ABILITIES.map(ab => ab[kind]).join('\n\n');
  const input = title + '\n' + text;
  const chunks = splitCourse(input, s => agent.tok.encode(s), agent.maxLen - agent.headMaxLen - 8);
  const res = {};
  for (const ab of ABILITIES) {
    const entries = Object.entries(questionsFor(ab)), runs = [];
    for (const chunk of chunks) {
      const answers = {};
      for (let j = 0; j < entries.length; j += 3) Object.assign(answers, (await agent.predict(chunk, Object.fromEntries(entries.slice(j, j + 3)))).answers);
      runs.push({text: chunk, answers});
    }
    const r = aggregate(ab, runs);
    res[ab.id] = {total: r.total, scores: r.scores, best: r.best, details: r.details, runs};
    console.log(kind, ab.id, r.total, JSON.stringify(r.scores), 'best seg', r.best + 1, '/', runs.length, r.details.map(d => `${d.id}:${d.p.toFixed(2)}@${d.segment + 1}`).join(' '));
  }
  out.runs[kind] = {input, chunks, abilities: res};
}
fs.mkdirSync(new URL('./results/', import.meta.url), {recursive: true});
fs.writeFileSync(new URL('./results/legacy-repro.json', import.meta.url), JSON.stringify(out, null, 1));
