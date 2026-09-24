// Reproducible evaluation: rubric levels, real Laya probabilities, legacy v1 scores, metamorphic checks.
// Usage: node calibration/run.mjs [calibration|validation] [--no-model] [--no-legacy]
import fs from 'node:fs';
import crypto from 'node:crypto';
import {ABILITIES} from '../assets/abilities.js';
import {splitUnits, splitCourse, analyzeUnits, scoreAbility, modelQuestions, mergeCompetency, MODEL_POLICY} from '../assets/course-engine.js';
import * as legacy from './legacy-engine.js';

const set = process.argv[2] || 'calibration';
const useModel = !process.argv.includes('--no-model'), useLegacy = !process.argv.includes('--no-legacy');
const {CASES, LABEL_STATUS} = await import(`./cases/${set}.mjs`);
const COMPS = ABILITIES.flatMap(a => a.comps.map(([id]) => id));
const agent = useModel || useLegacy ? await (await import('./laya-node.mjs')).loadAgent() : null;

// Prediction cache keyed by text + question definition, so reruns only pay for new inputs.
const cacheFile = new URL('../.cache/predictions.json', import.meta.url);
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
const h = s => crypto.createHash('sha1').update(s).digest('hex');
async function predict(text, questions) {
  const out = {}, todo = {};
  for (const [k, q] of Object.entries(questions)) {
    const key = h(text + '\u0000' + JSON.stringify(q));
    if (cache[key]) out[k] = cache[key]; else todo[k] = [q, key];
  }
  const entries = Object.entries(todo);
  for (let i = 0; i < entries.length; i += 4) {
    const batch = Object.fromEntries(entries.slice(i, i + 4).map(([k, [q]]) => [k, q]));
    const r = (await agent.predict(text, batch)).answers;
    for (const [k, v] of Object.entries(r)) { out[k] = v; cache[todo[k][1]] = v; }
  }
  return out;
}
const budget = agent ? agent.maxLen - agent.headMaxLen - 8 : 760;
const enc = s => agent.tok.encode(s);

// Per unit: P(yes) per competency; a unit longer than the budget keeps its highest piece.
async function modelForUnits(units) {
  const qs = modelQuestions(COMPS), res = [];
  for (const u of units) {
    const p = {}, raw = [];
    for (const piece of splitCourse(u, enc, budget)) {
      const a = await predict(piece, qs); raw.push({text: piece, answers: a});
      for (const id of COMPS) p[id] = Math.max(p[id] ?? 0, a[id].noul);
    }
    res.push({p, raw});
  }
  return res;
}

function evaluate(title, text, modelP) {
  const units = splitUnits(text), analysis = analyzeUnits(units, title);
  const abilities = Object.fromEntries(ABILITIES.map(ab => [ab.id, scoreAbility(ab, analysis, modelP)]));
  const levels = Object.fromEntries(Object.values(abilities).flatMap(r => r.comps.map(c => [c.id, c.level])));
  return {units, analysis, abilities, levels};
}

async function legacyRun(title, text) {
  const input = title + '\n' + text;
  const chunks = legacy.splitCourse(input, enc, budget), out = {};
  for (const ab of ABILITIES) {
    const runs = [];
    for (const c of chunks) runs.push({text: c, answers: await predict(c, legacy.questionsFor(ab))});
    const r = legacy.aggregate(ab, runs);
    out[ab.id] = {total: r.total, scores: r.scores, details: r.details.map(d => ({id: d.id, p: d.p, segment: d.segment}))};
  }
  return {chunks: chunks.length, abilities: out};
}

// Deterministic permutation (not a sort of the text) for the reorder check.
const shuffle = arr => arr.map((x, i) => [x, (i * 7919) % 101]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const results = [];
for (const c of CASES) {
  const units = splitUnits(c.text);
  const mRes = useModel ? await modelForUnits(units) : null;
  const modelP = mRes?.map(m => m.p) ?? null;
  const ev = evaluate(c.title, c.text, modelP);
  const cmp = COMPS.map(id => ({id, expect: c.expect[id] ?? 0, got: ev.levels[id]}));
  // Metamorphic checks on the rubric (model P is per unit, so it moves with its unit).
  const base = evaluate(c.title, c.text, null).levels;
  const meta = {
    reorder: same(evaluate(c.title, shuffle(units).join('\n\n'), null).levels, base) && same(evaluate(c.title, [...units].reverse().join('\n\n'), null).levels, base),
    duplicate: same(evaluate(c.title, units.concat(units).join('\n\n'), null).levels, base),
    deletion: [],
  };
  for (const id of COMPS) {
    const m = mergeCompetency(id, ev.analysis); if (m.level < 2) continue;
    // Remove every copy of the practice units (duplicates are deduplicated, so keep none of them).
    const key = u => u.replace(/\s/g, '');
    const drop = new Set(m.units.filter(u => u.practice).map(u => key(units[u.index])));
    const after = evaluate(c.title, units.filter(u => !drop.has(key(u))).join('\n\n'), null).levels[id];
    meta.deletion.push({id, before: m.level, after, ok: after < 2});
  }
  const row = {id: c.id, kind: c.kind, title: c.title, why: c.why, cmp, meta,
    abilities: Object.fromEntries(Object.entries(ev.abilities).map(([k, r]) => [k, {total: r.total, scores: r.scores, status: r.status,
      comps: r.comps.map(x => ({id: x.id, level: x.level, flags: {practice: x.practice, output: x.output, check: x.check, specific: x.specific}, pEvidence: x.pEvidence, pAny: x.pAny, review: x.review}))}])),
    units: ev.units.map((u, i) => ({text: u, model: mRes?.[i]?.raw ?? null})),
    legacy: useLegacy ? await legacyRun(c.title, c.text) : null};
  results.push(row);
  const diff = cmp.filter(x => x.expect !== x.got).map(x => `${x.id.slice(0, 3)} exp ${x.expect} got ${x.got}`);
  const metaOk = meta.reorder && meta.duplicate && meta.deletion.every(d => d.ok);
  console.log(c.id.padEnd(22), 'rubric', ABILITIES.map(a => a.id + row.abilities[a.id].total).join(' '),
    row.legacy ? '| legacy ' + ABILITIES.map(a => a.id + row.legacy.abilities[a.id].total).join(' ') : '',
    '| meta', metaOk ? 'ok' : JSON.stringify(meta), diff.length ? '| DIFF ' + diff.join('; ') : '');
}
fs.mkdirSync(new URL('../.cache/', import.meta.url), {recursive: true});
fs.writeFileSync(cacheFile, JSON.stringify(cache));

// Summary statistics.
const all = results.flatMap(r => r.cmp.map(x => ({...x, case: r.id})));
const frac = n => +(n / all.length).toFixed(3);
function auroc(pos, neg) { if (!pos.length || !neg.length) return null; let s = 0; for (const p of pos) for (const n of neg) s += p > n ? 1 : p === n ? .5 : 0; return +(s / (pos.length * neg.length)).toFixed(3); }
const mean = xs => xs.length ? +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(3) : null;
const modelStats = useModel ? COMPS.map(id => {
  const pts = results.map(r => ({y: r.cmp.find(x => x.id === id).expect >= 2, p: Math.max(...r.units.flatMap(u => u.model.map(m => m.answers[id].noul)))}));
  const pos = pts.filter(x => x.y).map(x => x.p), neg = pts.filter(x => !x.y).map(x => x.p);
  return {id, auroc: auroc(pos, neg), pos: pos.length, neg: neg.length, meanPos: mean(pos), meanNeg: mean(neg)};
}) : null;
const legacyStats = useLegacy ? (() => {
  const pts = results.flatMap(r => r.cmp.map(x => ({y: x.expect >= 2, p: r.legacy.abilities[x.id[0]].details.find(d => d.id === x.id).p})));
  const pos = pts.filter(x => x.y).map(x => x.p), neg = pts.filter(x => !x.y).map(x => x.p);
  return {detailAccuracyAt50: +(pts.filter(x => (x.p >= .5) === x.y).length / pts.length).toFixed(3), detailAuroc: auroc(pos, neg),
    falsePositivesAt50: neg.filter(p => p >= .5).length, negatives: neg.length, positives: pos.length};
})() : null;
const summary = {set, labelStatus: LABEL_STATUS, policy: MODEL_POLICY, cases: results.length, cells: all.length,
  exactAgreement: frac(all.filter(x => x.got === x.expect).length), within1: frac(all.filter(x => Math.abs(x.got - x.expect) <= 1).length),
  rubricAccuracyAtL2: frac(all.filter(x => (x.got >= 2) === (x.expect >= 2)).length),
  falseAttribution: all.filter(x => x.expect === 0 && x.got >= 2).map(x => `${x.case}:${x.id}(got L${x.got})`),
  missed: all.filter(x => x.expect >= 2 && x.got < 2).map(x => `${x.case}:${x.id}(exp L${x.expect} got L${x.got})`),
  metamorphic: {reorder: results.every(r => r.meta.reorder), duplicate: results.every(r => r.meta.duplicate), deletion: results.every(r => r.meta.deletion.every(d => d.ok))},
  model: modelStats, legacy: legacyStats};
console.log(JSON.stringify(summary, null, 1));
if (useModel && useLegacy) {
  fs.mkdirSync(new URL('./results/', import.meta.url), {recursive: true});
  fs.writeFileSync(new URL(`./results/${set}.json`, import.meta.url), JSON.stringify({summary, results, createdAt: new Date().toISOString(), model: 'laya multilingual quantized ONNX via onnxruntime-node 1.30'}, null, 1));
}
