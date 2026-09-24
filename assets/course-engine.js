export const METRICS = [
  ['alignment', '對到定義', '教的是這項能力，不只是「用到 AI」'],
  ['concreteness', '看得到做法', '有活動、週次、評量，不只有目標'],
  ['supported', '成果不誇大', '活動做得到寫出來的成果'],
  ['boilerplate', '不是範本', '換一門課就貼不上去'],
];

const DEFINITIONS = {
  A: 'students choose AI tools and reflect on their own learning with AI',
  B: 'students disclose AI use, protect data, verify information and take responsibility',
  C: 'students analyse real problems with AI, verify results and plan human-AI workflows',
  D: 'students make their own decisions, interact with people and develop ideas from real-world observation',
};
const DETAIL_QUESTIONS = {
  A: ['Do students evaluate and choose AI tools for a professional learning task?', 'Do students record or reflect on their own learning process with AI?'],
  B: ['Must students disclose AI use or check copyright and privacy rules?', 'Do students check AI errors, misinformation or data security risks?', 'Do students make a responsible judgment about the impact of using AI?'],
  C: ['Do students use AI to analyse a real problem and verify a solution?', 'Do students examine AI limitations and combine knowledge from different fields?', 'Do students design a human-AI workflow and evaluate its errors or quality?'],
  D: ['Do students make a decision themselves instead of following AI automatically?', 'Do students practise understanding other people through communication or role-play?', 'Do students observe real-world needs and create their own ideas with AI support?'],
};
export function questionsFor(ab) {
  const definition = DEFINITIONS[ab.id];
  const q = {
    alignment: {type:'score', instructions:`How closely do the described teaching activities match this ability: ${definition}`, criteria:['unrelated','only mentions the ability','some relevant activity','clearly relevant practice','explicit relevant practice and assessment']},
    concreteness: {type:'score', instructions:'How specific are the student activities and assessment described in this course?', criteria:['no activity','vague goals only','a named activity','specific tasks and outputs','specific tasks, outputs and grading']},
    supported: {type:'noul', instructions:`Do the described student activities provide evidence supporting the claimed ability: ${definition}`},
    boilerplate: {type:'noul', instructions:'Is the text only a vague slogan about cultivating abilities?'},
  };
  ab.comps.forEach(([id], i) => {
    q[id] = {type:'noul',instructions:DETAIL_QUESTIONS[ab.id][i]};
  });
  return q;
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

export function aggregate(ab, runs) {
  let best = 0;
  runs.forEach((r,i) => { if(r.answers.alignment.score > runs[best].answers.alignment.score) best=i; });
  const a = runs[best].answers;
  const scores = {alignment:Math.round(a.alignment.score*25),concreteness:Math.round(a.concreteness.score*25),supported:Math.round(a.supported.noul*100),boilerplate:Math.round((1-a.boilerplate.noul)*100)};
  const details = ab.comps.map(([id]) => {
    let segment=0;
    runs.forEach((r,i)=>{ if(r.answers[id].noul>runs[segment].answers[id].noul) segment=i; });
    return {id,p:runs[segment].answers[id].noul,segment};
  });
  return {scores,total:Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/4),details,best,runs};
}
