import assert from 'node:assert/strict';
import {splitCourse,aggregate,questionsFor} from '../assets/course-engine.js';
import {ABILITIES} from '../assets/abilities.js';
import {parseTokenizerJson,encodeWithData,buildQuestionPrefix,toInternal} from '../assets/laya-browser.mjs';
import fs from 'node:fs';
const data=parseTokenizerJson(JSON.parse(fs.readFileSync(new URL('../model/tokenizer.json',import.meta.url))));
const enc=s=>encodeWithData(data,s);
const sample=ABILITIES.map(a=>a.good).join('\n\n');
for(const text of ['',sample,sample.repeat(8),'🚀'.repeat(2000)]){
 const chunks=splitCourse(text,enc,760);
 assert.equal(chunks.join(''),text);
 assert(chunks.every(c=>enc(c).length<=760));
}
assert.equal(ABILITIES.flatMap(a=>a.comps).length,11);
const sampleChunks=splitCourse(sample,enc,760);
console.log('Sample tokens:',enc(sample).length,'chunks:',sampleChunks.length);
const a=ABILITIES[0];
const mock=(s,p)=>({text:'evidence',answers:{alignment:{score:s},concreteness:{score:4},supported:{noul:.8},boilerplate:{noul:.1},...Object.fromEntries(a.comps.map(([id])=>[id,{noul:p}]))}});
const r=aggregate(a,[mock(1,.9),mock(4,.6)]);
assert.equal(r.best,1);assert.equal(r.scores.boilerplate,90);assert.equal(r.total,93);assert(r.details.every(d=>d.segment===0));
for(const ab of ABILITIES){assert.equal(Object.keys(questionsFor(ab)).length,4+ab.comps.length);}
console.log('PASS: lossless token-bounded chunking, 11 official competencies, strongest segment selection, inverted boilerplate, independent detail evidence.');
