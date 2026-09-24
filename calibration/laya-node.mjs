// Offline runner: loads the same quantized ONNX weights and the same Laya bundle the page uses,
// but through onnxruntime-node so calibration can be repeated without a browser.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Agent} from '../assets/laya-browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MODEL_SRC = path.join(root, 'model');
const CACHE = path.join(root, '.cache', 'model');

// The page streams encoder.onnx.part0..2; onnxruntime-node needs one file, so join them once.
function assemble() {
  const manifest = JSON.parse(fs.readFileSync(path.join(MODEL_SRC, 'manifest.json'), 'utf8'));
  fs.mkdirSync(CACHE, {recursive: true});
  for (const [name, entry] of Object.entries(manifest.files)) {
    const out = path.join(CACHE, name);
    if (fs.existsSync(out) && fs.statSync(out).size === entry.size) continue;
    const parts = entry.parts || [name];
    fs.writeFileSync(out, Buffer.concat(parts.map(p => fs.readFileSync(path.join(MODEL_SRC, p)))));
  }
  return CACHE;
}

export async function loadAgent({threads = 4} = {}) {
  const dir = assemble();
  return Agent.load(dir, {localDir: dir, numThreads: threads});
}
