import {RUBRIC, CUES, GOAL_FRAME, VIA_GOAL, NEGATION, AI_TERMS, COURSE_LEVEL_AI} from './rubric.js';

// Four Jev-style indicators, redefined on the evidence rubric (see README「評分規則」).
export const METRICS = [
  ['alignment', '對到定義', '有學生練習的細項比例'],
  ['concreteness', '看得到做法', '練習是否有產出、檢核與具體細節'],
  ['supported', '成果不誇大', '有練習的單元 ÷（練習單元＋只寫目標的宣稱）'],
  ['boilerplate', '不是範本', '相關敘述中非空泛目標句的比例'],
];

// Laya is reported next to the rubric, never inside it. On the calibration set, review flags driven by
// the model (P < 0.5 on rubric evidence, or P ≥ 0.9 without it) caught 0 of 3 rubric/label disagreements
// while firing on 51 of 121 cells, so the model only gets a descriptive agree/disagree note.
export const MODEL_POLICY = {agree: 0.5};
// Course-level AUROC of max P(yes) against provisional labels (≥L2), calibration set only.
// Very few positives per competency: treat as a rough reliability hint, not a validated figure.
export const MODEL_CALIBRATION = {
  'A-1-IV-1': {auroc: 0.875, pos: 4, neg: 7}, 'A-2-IV-1': {auroc: 0.611, pos: 2, neg: 9},
  'B-1-IV-1': {auroc: 0.911, pos: 4, neg: 7}, 'B-2-IV-1': {auroc: 0.733, pos: 6, neg: 5}, 'B-3-IV-1': {auroc: 0.4, pos: 1, neg: 10},
  'C-1-IV-1': {auroc: 0.604, pos: 3, neg: 8}, 'C-2-IV-1': {auroc: null, pos: 0, neg: 11}, 'C-3-IV-1': {auroc: 0.75, pos: 3, neg: 8},
  'D-1-IV-1': {auroc: 0.778, pos: 2, neg: 9}, 'D-2-IV-1': {auroc: 0.458, pos: 3, neg: 8}, 'D-3-IV-1': {auroc: null, pos: 0, neg: 11},
};

// Model-facing questions: one noul per competency, asked of every teaching unit.
const CRITERIA = {true: 'yes, the text describes students doing exactly this', false: 'no, the text is about something else, only states a goal, or says it is not done'};
export function modelQuestions(compIds = Object.keys(RUBRIC)) {
  return Object.fromEntries(compIds.map(id => [id, {type: 'noul', instructions: RUBRIC[id].model, criteria: CRITERIA}]));
}

// Teaching units: blank lines, and lines that open a new week / numbered item / bullet.
// Schedule tables copied from university systems start rows with "1<Tab>" or "1 2/18".
const UNIT_START = /^\s*(?:第\s*[\d一二三四五六七八九十]+(?:\s*[–—\-~～至到、]\s*[\d一二三四五六七八九十]+)?\s*週|(?:W|Week)\s*\d+|\d{1,2}\s*[.、)）]|\d{1,2}\t|\d{1,2}\s+\d{1,2}\/\d{1,2}|[-•*・●▪]\s)/i;
export function splitUnits(text) {
  const units = []; let cur = [];
  const flush = () => { const t = cur.join('\n').trim(); if (t) units.push(t); cur = []; };
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) { flush(); continue; }
    if (UNIT_START.test(line) && cur.length) flush();
    cur.push(line);
  }
  flush();
  return units;
}

// Leave room for the longest question prefix; never silently drop the end of a course.
export function splitCourse(text, encode, budget) {
  if (!text.trim()) return [];
  const pieces = text.split(/(?<=[。！？\n])/u).filter(Boolean);
  const chunks = []; let current = '';
  for (const piece of pieces) {
    // Keep a teaching unit together so the evidence panel remains readable.
    if (piece === '\n' && current.endsWith('\n') && encode(current + piece).length <= budget) {
      chunks.push(current + piece); current = ''; continue;
    }
    if (encode(current + piece).length <= budget) { current += piece; continue; }
    if (current) { chunks.push(current); current = ''; }
    for (const char of piece) {
      if (encode(current + char).length > budget) { chunks.push(current); current = ''; }
      current += char;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

const norm = s => s.replace(/[\s　]+/g, '').replace(/[，,。．.、；;：:！!？?「」『』（）()]/g, '');
const sentencesOf = unit => unit.split(/(?<=[。！？!?；;\n])/u).map(s => s.trim()).filter(Boolean);
const clausesOf = s => s.split(/[，,、：:]/u).filter(Boolean);

// Cue text with negated clauses removed.
function positive(s) { return clausesOf(s).filter(c => !NEGATION.test(c)).join('，'); }
function isGoalOnly(s) {
  if (CUES.specific.test(s) || CUES.output.test(s)) return false;
  return VIA_GOAL.test(s) || (GOAL_FRAME.test(s) && !CUES.activity.test(s));
}

// Rule pass over every unit. Pure text; no model involved.
// `title` only supplies course-level AI context; it is never counted as evidence.
export function analyzeUnits(units, title = '') {
  const courseAI = AI_TERMS.test(title) || units.some(u => AI_TERMS.test(u));
  return units.map(unit => {
    const sents = sentencesOf(unit).map(s => {
      const pos = positive(s), goal = isGoalOnly(pos);
      return {s, pos, goal, act: !goal && CUES.activity.test(pos), out: !goal && CUES.output.test(pos), chk: !goal && CUES.check.test(pos), spec: !goal && CUES.specific.test(pos)};
    });
    const unitAI = AI_TERMS.test(unit);
    const flags = {act: sents.some(x => x.act), out: sents.some(x => x.out), chk: sents.some(x => x.chk), spec: sents.some(x => x.spec)};
    const comps = {};
    for (const [id, r] of Object.entries(RUBRIC)) {
      const aiOk = courseAI;
      const hits = aiOk ? sents.filter(x => r.anchors.some(a => a.test(x.pos))) : [];
      const named = aiOk ? sents.filter(x => !hits.includes(x) && r.mentions.test(x.pos)) : [];
      if (!hits.length && !named.length) continue;
      const concrete = hits.filter(x => !x.goal);
      const practice = concrete.length > 0 && flags.act;
      comps[id] = {
        mention: true, practice,
        // Output / check count for the whole unit when students practise there; otherwise only when
        // they sit in the same sentence as the competency (e.g. a grading line "查核紀錄 20%").
        output: practice ? flags.out : concrete.some(x => x.out),
        check: practice ? flags.chk : concrete.some(x => x.chk),
        specific: practice && flags.spec,
        claims: [...hits, ...named].filter(x => x.goal).map(x => x.s),
        sentences: [...hits, ...named].map(x => x.s),
        aiFromCourse: !unitAI && !COURSE_LEVEL_AI.has(id),
      };
    }
    return {text: unit, comps};
  });
}

export function levelOf(e) {
  if (!e || (!e.mention && !e.practice)) return 0;
  if (!e.practice) return 1;
  return e.output && e.check ? 4 : e.output || e.check ? 3 : 2;
}

// Merge evidence for one competency across the whole course. Set-based (OR over distinct units),
// so reordering units or repeating identical text cannot raise the level.
export function mergeCompetency(id, analysis) {
  const seen = new Set(), units = [];
  analysis.forEach((u, i) => {
    const e = u.comps[id]; if (!e) return;
    const key = norm(u.text); if (seen.has(key)) return; seen.add(key);
    units.push({index: i, ...e});
  });
  const any = k => units.some(u => u[k]);
  const merged = {mention: units.length > 0, practice: any('practice'), output: any('output'), check: any('check'), specific: any('specific')};
  return {...merged, level: levelOf(merged), units,
    claims: [...new Set(units.flatMap(u => u.claims).map(norm))].length};
}

// modelP: array (per unit) of {compId: P(yes)}; may be null when the model has not run.
export function scoreAbility(ab, analysis, modelP, policy = MODEL_POLICY) {
  const comps = ab.comps.map(([id]) => {
    const m = mergeCompetency(id, analysis);
    const pAt = i => modelP?.[i]?.[id];
    const evidence = m.units.filter(u => u.practice).map(u => u.index);
    const pEvidence = evidence.length && modelP ? Math.max(...evidence.map(pAt)) : null;
    let pAny = null, pAnyUnit = null;
    if (modelP) modelP.forEach((p, i) => { if (pAny === null || p[id] > pAny) { pAny = p[id]; pAnyUnit = i; } });
    const review = m.practice && m.units.filter(u => u.practice).every(u => u.aiFromCourse) ? '練習段落本身未提到 AI，請確認此活動與 AI 相關' : null;
    // Descriptive only: does the model's reading point the same way as the rubric?
    const modelAgrees = !modelP ? null : m.level >= 2 ? pEvidence >= policy.agree : pAny < policy.agree;
    return {id, ...m, pEvidence, pAny, pAnyUnit, review, modelAgrees, modelCalibration: MODEL_CALIBRATION[id]};
  });
  const n = comps.length, levels = comps.map(c => c.level);
  const practiced = comps.filter(c => c.practice);
  const evidenceUnits = new Set(practiced.flatMap(c => c.units.filter(u => u.practice).map(u => norm(analysis[u.index].text))));
  const claimSet = new Set(), relevant = new Set(), generic = new Set();
  comps.forEach(c => c.units.forEach(u => {
    u.claims.forEach(s => claimSet.add(norm(s)));
    u.sentences.forEach(s => { relevant.add(norm(s)); if (u.claims.includes(s)) generic.add(norm(s)); });
  }));
  const pct = x => Math.round(x * 100);
  const scores = {
    alignment: pct(practiced.length / n),
    concreteness: practiced.length ? pct(practiced.reduce((a, c) => a + (c.output + c.check + c.specific) / 3, 0) / practiced.length) : 0,
    supported: evidenceUnits.size + claimSet.size ? pct(evidenceUnits.size / (evidenceUnits.size + claimSet.size)) : null,
    boilerplate: relevant.size ? pct(1 - generic.size / relevant.size) : null,
  };
  const total = pct(levels.reduce((a, b) => a + b, 0) / (4 * n));
  const reviews = comps.filter(c => c.review).length;
  const status = reviews ? 'review' : practiced.length === 0 ? 'insufficient' : 'ok';
  return {total, scores, comps, status, reviews};
}
