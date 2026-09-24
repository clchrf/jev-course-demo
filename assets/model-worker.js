// Agent uses its browser provider when window exists, including in this dedicated worker.
self.window=self;
/* ---------- 模型下載（分塊 + 進度 + 快取） ---------- */
const MODEL_BASE = new URL("../model/", import.meta.url).href;
const CACHE = "laya-ts"; // 與 laya-ts 內部快取同名，避免存兩份
let manifest = null;
const progress = { done: 0, total: 1, files: {} };
const origFetch = window.fetch.bind(window);

async function readWithProgress(url, key) {
  const res = await origFetch(url);
  if (!res.ok) throw new Error(`下載失敗：${url}（${res.status}）`);
  const reader = res.body.getReader();
  const chunks = []; let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length;
    progress.files[key] = got; renderProgress();
  }
  return new Blob(chunks);
}

window.fetch = async (input, init) => {
  const url = input instanceof URL ? input.href : typeof input === "string" ? input : input.url;
  if (init || !manifest || !url.startsWith(MODEL_BASE)) return origFetch(input, init);
  const name = url.slice(MODEL_BASE.length);
  const entry = manifest.files[name];
  if (!entry) return origFetch(input, init);
  try {
    const hit = await (await caches.open(CACHE)).match(url);
    if (hit) { progress.files[name] = entry.size; renderProgress(); return hit; }
  } catch { /* 無快取可用時直接下載 */ }
  const parts = entry.parts || [name];
  const blobs = [];
  for (const p of parts) blobs.push(await readWithProgress(MODEL_BASE + p, name + "#" + p));
  for (const p of parts) delete progress.files[name + "#" + p];
  progress.files[name] = entry.size;
  return new Response(new Blob(blobs), { status: 200, headers: { "Content-Type": "application/octet-stream" } });
};

function renderProgress() {
 const done=Object.values(progress.files).reduce((a,b)=>a+b,0);
 self.postMessage({event:'progress',done,total:progress.total});
}

let model;
self.onmessage=async ({data:{id,method,args}})=>{
 try{
  let result;
  if(method==='load'){
   const {Agent}=await import('./laya-browser.mjs');
   const res=await origFetch(MODEL_BASE+'manifest.json');
   if(!res.ok)throw new Error('無法取得模型清單');
   manifest=await res.json();progress.total=Object.values(manifest.files).reduce((n,f)=>n+f.size,0);
   const ort=await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/ort.bundle.min.mjs');
   const threads=self.crossOriginIsolated?Math.min(4,navigator.hardwareConcurrency||4):1;
   ort.env.wasm.numThreads=threads;
   model=await Agent.load(MODEL_BASE.replace(/\/$/,''),{numThreads:threads});
   result={threads};
  }else if(method==='prepare'){
   const {splitCourse}=await import('./course-engine.js');
   result=splitCourse(args[0],s=>model.tok.encode(s),model.maxLen-model.headMaxLen-8);
  }else if(method==='predict'){
   result=await model.predict(...args);
  }else throw new Error('Unknown worker method');
  self.postMessage({id,result});
 }catch(e){self.postMessage({id,error:e.message||String(e)});}
};
