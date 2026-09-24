// Exploratory probe: does mean-pooled encoder similarity to the official IV definitions separate competencies?
import {loadAgent} from './laya-node.mjs';
import {embedFnFromAgent} from '../assets/laya-browser.mjs';
import {ABILITIES} from '../assets/abilities.js';
const agent = await loadAgent();
const embed = embedFnFromAgent(agent);
const defs = ABILITIES.flatMap(a => a.comps.map(([id, name, d]) => [id.slice(0, 3), name + '：' + d]));
const T = (await import('./probe-matrix-texts.mjs')).T;
const cos = (a, b) => { let s = 0, x = 0, y = 0; for (let i = 0; i < a.length; i++) { s += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i]; } return s / Math.sqrt(x * y); };
const D = await embed(defs.map(d => d[1]));
const E = await embed(Object.values(T));
Object.keys(T).forEach((n, i) => {
  const s = D.map(d => cos(E[i], d));
  const best = defs[s.indexOf(Math.max(...s))][0];
  console.log(n.padEnd(6), s.map(v => v.toFixed(3)).join(' '), ' top', best);
});
