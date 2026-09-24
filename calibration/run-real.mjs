// Run real, publicly posted university syllabi through v1 and v2.
// The syllabus texts are copyrighted by their schools/instructors and are NOT in this repository:
// they are read from .cache/real-syllabi/<id>.txt (first line = title, then "@@@", then the text).
// Only scores, levels and source links are written to calibration/results/real-syllabi.json.
import fs from 'node:fs';
import {ABILITIES} from '../assets/abilities.js';
import {splitUnits, splitCourse, analyzeUnits, scoreAbility, modelQuestions} from '../assets/course-engine.js';
import * as legacy from './legacy-engine.js';
import {loadAgent} from './laya-node.mjs';

export const SOURCES = [
  {id: 'ntu-genai-112-2', school: '國立臺灣大學', course: '生成式人工智慧導論（112-2，電機所）',
    url: 'https://nol.ntu.edu.tw/nol/coursesearch/print_table.php?course_id=921+U3570&class=&dpt_code=9210&ser_no=74774&semester=112-2'},
  {id: 'ncku-za50900-113-2', school: '國立成功大學／臺灣大專院校人工智慧學程聯盟', course: '生成式AI：文字與圖像生成的原理與實務（113-2）',
    url: 'https://class-qry.acad.ncku.edu.tw/syllabus/online_display_remote.php?class_code=&co_no=ZA50900&sem=2&syear=0113'},
  {id: 'ncku-n063700-113-1', school: '國立成功大學', course: '人工智慧與應用（113-1，工程管理）',
    url: 'https://class-qry.acad.ncku.edu.tw/syllabus/online_display.php?class_code=&co_no=N063700&sem=1&syear=0113'},
];

const dir = new URL('../.cache/real-syllabi/', import.meta.url);
const agent = await loadAgent();
const enc = s => agent.tok.encode(s), budget = agent.maxLen - agent.headMaxLen - 8;
const COMPS = ABILITIES.flatMap(a => a.comps.map(([id]) => id));
const out = [];
for (const src of SOURCES) {
  const file = new URL(`${src.id}.txt`, dir);
  if (!fs.existsSync(file)) { console.log('skip (not downloaded):', src.id); continue; }
  const [title, text] = fs.readFileSync(file, 'utf8').split('\n@@@\n');
  const units = splitUnits(text), analysis = analyzeUnits(units, title);
  const qs = modelQuestions(COMPS), modelP = [];
  for (const u of units) {
    const p = {};
    for (const piece of splitCourse(u, enc, budget)) {
      const entries = Object.entries(qs);
      for (let i = 0; i < entries.length; i += 4) {
        const r = (await agent.predict(piece, Object.fromEntries(entries.slice(i, i + 4)))).answers;
        for (const [k, v] of Object.entries(r)) p[k] = Math.max(p[k] ?? 0, v.noul);
      }
    }
    modelP.push(p);
  }
  const v2 = Object.fromEntries(ABILITIES.map(ab => { const r = scoreAbility(ab, analysis, modelP); return [ab.id, {total: r.total, status: r.status,
    comps: r.comps.map(c => ({id: c.id, level: c.level, practice: c.practice, output: c.output, check: c.check,
      evidenceUnits: c.units.filter(u => u.practice).map(u => u.index + 1), pEvidence: c.pEvidence, pAny: c.pAny, modelAgrees: c.modelAgrees, review: c.review}))}]; }));
  const chunks = legacy.splitCourse(title + '\n' + text, enc, budget), v1 = {};
  for (const ab of ABILITIES) {
    const runs = [];
    for (const c of chunks) {
      const entries = Object.entries(legacy.questionsFor(ab)), answers = {};
      for (let j = 0; j < entries.length; j += 3) Object.assign(answers, (await agent.predict(c, Object.fromEntries(entries.slice(j, j + 3)))).answers);
      runs.push({text: c, answers});
    }
    const r = legacy.aggregate(ab, runs);
    v1[ab.id] = {total: r.total, details: r.details.map(d => ({id: d.id, p: d.p}))};
  }
  out.push({...src, units: units.length, chars: text.length, v1, v2});
  console.log(src.id.padEnd(20), 'units', units.length, '| v1', ABILITIES.map(a => a.id + v1[a.id].total).join(' '), '| v2', ABILITIES.map(a => a.id + v2[a.id].total).join(' '),
    '|', COMPS.map(id => id.slice(0, 3) + ':L' + v2[id[0]].comps.find(c => c.id === id).level).join(' '));
}
fs.writeFileSync(new URL('./results/real-syllabi.json', import.meta.url), JSON.stringify({
  note: '真實公開課綱的檢視結果。原文受著作權保護，未收錄於本 repo；請依 url 自行查閱。',
  createdAt: new Date().toISOString(), results: out}, null, 1));
