import { ABILITIES } from './abilities.js';
import { METRICS, questionsFor, aggregate } from './course-engine.js';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grade = s => s>=80?['很好','g']:s>=50?['尚可','a']:['要補強','r'];
const colors = {g:'var(--green)',a:'var(--amber)',r:'var(--red)'};
let agent, loading, running=false, revision=0, active='D', calls=0;
let results={}, lastInput=null;
const states={};

function modelState(kind,label,info){ $('led').className='led '+kind; $('mstate').textContent=label; $('minfo').textContent=info; }

let worker, requestId=0;
const pending=new Map();
function rpc(method,...args){
 if(!worker){
  worker=new Worker(new URL('./model-worker.js',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{
   if(data.event==='progress'){
    $('progBar').style.width=Math.min(100,data.done/data.total*100)+'%';
    $('minfo').textContent=`下載模型中 ${(data.done/1e6).toFixed(0)} / ${(data.total/1e6).toFixed(0)} MB；首次需要，之後使用瀏覽器快取。`;
    return;
   }
   const p=pending.get(data.id);if(!p)return;pending.delete(data.id);
   data.error?p.reject(new Error(data.error)):p.resolve(data.result);
  };
  worker.onerror=event=>{
   pending.forEach(p=>p.reject(new Error(event.message||'背景模型執行失敗')));pending.clear();
   worker.terminate();worker=null;agent=null;
  };
 }
 return new Promise((resolve,reject)=>{const id=++requestId;pending.set(id,{resolve,reject});worker.postMessage({id,method,args});});
}
async function loadModel(){
 if(agent)return agent;if(loading)return loading;
 loading=(async()=>{
  $('loadBtn').disabled=true;$('prog').hidden=false;
  modelState('load','載入中','正在背景準備模型…');
  try{
   const {threads}=await rpc('load');
   agent={predict:(...args)=>rpc('predict',...args)};
   $('mBackend').textContent=`WASM×${threads}`;$('loadBtn').hidden=true;
   modelState('ok','Laya 已就緒','背景模型於瀏覽器內判讀；課程內容不會送往伺服器。');
   return agent;
  }catch(e){
   modelState('err','模型載入失敗','請確認網路，使用電腦版 Chrome／Edge，再按載入重試。'+e.message);
   $('loadBtn').disabled=false;$('loadBtn').hidden=false;throw e;
  }finally{$('prog').hidden=true;loading=null;}
 })();return loading;
}

function renderCards(){
  $('cards').innerHTML=ABILITIES.map(ab=>`<article class="card" id="card-${ab.id}">
    <div class="head"><span class="badge">${ab.id}</span><h3>${ab.name}</h3><label class="switch"><span>本課程涵蓋</span><input id="on-${ab.id}" type="checkbox" checked aria-label="本課程涵蓋 ${ab.id} ${ab.name}"></label></div>
    <div class="body"><p class="desc">${ab.desc}</p><p class="q">${ab.q}</p>
    <p class="hint">與其他向度共用上方完整課綱；關閉此向度會排除評分。</p>
    <blockquote class="evidence" id="evidence-${ab.id}">檢視後顯示模型判為最相關的課綱段落。</blockquote>
    <p class="warn">${ab.warn}</p>
    <div class="result idle" id="rs-${ab.id}"><div class="rhead"><span class="lbl">AI 檢視（Laya）<span class="spin"></span></span><span class="total"><b id="tot-${ab.id}">–</b><span id="grade-${ab.id}">尚未檢視</span></span></div>
    ${METRICS.map(([key,name,sub])=>`<div class="row"><div class="nm"><b>${name}</b><small>${sub}</small></div><div class="bar"><i id="bar-${ab.id}-${key}"></i></div><div class="sc" id="sc-${ab.id}-${key}">–</div><div class="tg" id="tag-${ab.id}-${key}"></div></div>`).join('')}
    <p class="note" id="note-${ab.id}"></p></div>
    <details class="comp-details" open><summary>核心能力細項 · ${ab.comps.length} 項</summary><div class="detail-list">
    ${ab.comps.map(([id,name,desc])=>`<div class="detail-item"><header><code>${id}</code><output id="p-${id}">尚未檢視</output></header><h4>${name}</h4><p>${desc}</p><div class="bar"><i id="db-${id}"></i></div><p id="feedback-${id}">檢視後顯示機率與原文對照。</p><details><summary>提問與對照原文</summary><p>${esc(questionsFor(ab)[id].instructions)}</p><blockquote class="evidence" id="de-${id}">尚未檢視</blockquote></details></div>`).join('')}
    </div></details></div></article>`).join('');
  ABILITIES.forEach(ab=>$('on-'+ab.id).addEventListener('change',()=>{
    invalidate(); $('card-'+ab.id).classList.toggle('off',!$('on-'+ab.id).checked);
  }));
}
function paint(ab){
  const r=results[ab.id], status=states[ab.id]||'尚未檢視';
  $('rs-'+ab.id).classList.toggle('idle',!r);
  $('rs-'+ab.id).classList.toggle('busy',status==='檢視中');
  $('tot-'+ab.id).textContent=r?r.total:'–';
  $('grade-'+ab.id).textContent=r?grade(r.total)[0]:status;
  $('grade-'+ab.id).className=r?grade(r.total)[1]:'';
  METRICS.forEach(([key])=>{
    const s=r?.scores[key];
    $('bar-'+ab.id+'-'+key).style.width=r?s+'%':'0';
    $('bar-'+ab.id+'-'+key).style.background=r?colors[grade(s)[1]]:'';
    $('sc-'+ab.id+'-'+key).textContent=r?s:'–';
    $('tag-'+ab.id+'-'+key).textContent=r?grade(s)[0]:'';
    $('tag-'+ab.id+'-'+key).className='tg '+(r?grade(s)[1]:'');
  });
  $('evidence-'+ab.id).textContent=r?`課綱第 ${r.best+1}／${r.runs.length} 段（此向度 alignment 最高）\n${r.runs[r.best].text}`:'檢視後顯示模型判為最相關的課綱段落。';
  $('note-'+ab.id).textContent=r?`${r.runs.length} 段完整檢視 · ${(r.ms/1000).toFixed(1)} 秒 · 四項等權平均，供人工複核。`:'';
  ab.comps.forEach(([id],i)=>{
    const d=r?.details[i];
    $('p-'+id).textContent=d?`P(是) ${Math.round(d.p*100)}%`:status;
    $('db-'+id).style.width=d?d.p*100+'%':'0';
    $('feedback-'+id).textContent=d?(d.p>=.5?'模型判為有相關活動；請核對實作與評量證據。':'模型支持度較低；建議補上學生任務、成果與評量方式。'): '檢視後顯示機率與原文對照。';
    $('de-'+id).textContent=d?`第 ${d.segment+1} 段 · ${r.runs[d.segment].text}`:'尚未檢視';
  });
}
function overview(){
  $('overview').innerHTML=ABILITIES.map(ab=>`<a href="#card-${ab.id}"><span>${ab.id}　${ab.name}</span><strong>${results[ab.id]?.total??'–'} <small>/ 100</small></strong><small>${results[ab.id]?results[ab.id].details.filter(d=>d.p>=.5).length+' / '+ab.comps.length+' 細項達提示門檻':states[ab.id]||'尚未檢視'}</small></a>`).join('');
  $('abtabs').innerHTML=ABILITIES.map(ab=>`<button type="button" class="${active===ab.id?'on':''}" aria-pressed="${active===ab.id}" data-ab="${ab.id}"><span class="l">${ab.id}</span><span class="n">${results[ab.id]?.total??'–'}</span></button>`).join('');
  $('abtabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.ab;overview();renderLog();});
}
function renderLog(){
  const ab=ABILITIES.find(a=>a.id===active), r=results[active];
  if(!r){$('logBody').innerHTML=`<p class="lead">能力 ${active}：${states[active]||'尚未檢視'}</p><details><summary>查看問題設定</summary><pre>${esc(JSON.stringify(questionsFor(ab),null,2))}</pre></details>`;return;}
  $('logBody').innerHTML=`<div class="req">agent.predict(courseSegment, questions)<br>${Object.keys(questionsFor(ab)).length} 個問題 × ${r.runs.length} 段<br>輸出 0 tokens · ${(r.ms/1000).toFixed(1)} 秒</div>
    <p class="lead">score 回傳 0–4 分級期望值；noul 回傳 P(是)。文字建議由頁面規則產生，原文直接引用課綱。</p>
    <details><summary>完整提問設定</summary><pre>${esc(JSON.stringify(questionsFor(ab),null,2))}</pre></details>
    ${r.runs.map((run,i)=>`<details ${i===r.best?'open':''}><summary>第 ${i+1} 段 · 原文與回傳</summary><blockquote class="evidence">${esc(run.text)}</blockquote><pre>${esc(JSON.stringify(run.answers,null,2))}</pre></details>`).join('')}`;
}
function invalidate(){
  revision++; results={};lastInput=null;$('exportBtn').disabled=true;
  ABILITIES.forEach(ab=>{states[ab.id]=$('on-'+ab.id).checked?'待重新檢視':'本課程未涵蓋';paint(ab);});
  overview();renderLog();
  $('courseCount').textContent=Array.from($('syllabus').value).length+' 字';
  $('runStatus').textContent=running?'內容已更改，正在停止舊版檢視；完成後請重新執行。':'內容已更新，按「開始檢視 ABCD」取得結果。';
}
function fillCourse(kind){
  $('courseName').value='顧客關係管理與 AI 應用（餐旅系三年級）';
  $('syllabus').value=ABILITIES.map(ab=>ab[kind]).join('\n\n');
  ABILITIES.forEach(ab=>{$('on-'+ab.id).checked=true;$('card-'+ab.id).classList.remove('off');});
  invalidate();
}
async function runCourse(){
  if(running)return;
  const title=$('courseName').value.trim(), text=$('syllabus').value.trim();
  if(!text){$('runStatus').textContent='請先填寫課程綱要。';$('syllabus').focus();return;}
  const enabled=ABILITIES.filter(ab=>$('on-'+ab.id).checked);
  if(!enabled.length){$('runStatus').textContent='請至少開啟一項「本課程涵蓋」。';return;}
  invalidate();const version=revision;
  running=true;$('runStatus').textContent='正在準備模型與課綱…';$('runBtn').disabled=true;$('runBtn').textContent='檢視中…';
  try{
    await loadModel();
    if(version!==revision)return;
    // headMaxLen caps question text/options. Reserve additional boundary tokens.

    const input=title+'\n'+text;
    const chunks=await rpc('prepare',input);
    if(version!==revision)return;
    lastInput={title,text,chunks,model:'Laya multilingual (quantized ONNX)',createdAt:new Date().toISOString()};
    for(const ab of enabled){
      states[ab.id]='檢視中';paint(ab);overview();
      const questions=questionsFor(ab), entries=Object.entries(questions), runs=[];
      const start=performance.now();
      for(let i=0;i<chunks.length;i++){
        $('runStatus').textContent=`正在檢視 ${ab.id} · 第 ${i+1}／${chunks.length} 段課綱（共 ${entries.length} 個問題）`;
        const answers={};
        // Smaller batches limit WASM memory while retaining all questions.
        for(let j=0;j<entries.length;j+=3){
          if(version!==revision)return;
          const batch=Object.fromEntries(entries.slice(j,j+3));
          const output=await agent.predict(chunks[i],batch);
          if(version!==revision)return;
          Object.assign(answers,output.answers);calls+=Object.keys(batch).length;$('mCalls').textContent=calls;
          await new Promise(resolve=>setTimeout(resolve,0));
        }
        runs.push({text:chunks[i],answers});
      }
      results[ab.id]={...aggregate(ab,runs),ms:performance.now()-start};
      states[ab.id]='完成';active=ab.id;paint(ab);overview();renderLog();
      $('mLast').textContent=(results[ab.id].ms/1000).toFixed(1)+' s';
    }
    $('runStatus').textContent=`已完成 ${enabled.length} 個向度、${enabled.reduce((n,a)=>n+a.comps.length,0)} 個細項。結果來自實際模型，請搭配原文人工複核。`;
    $('exportBtn').disabled=false;
  }catch(e){
    console.error(e);
    $('runStatus').textContent='檢視未完成：'+(e.message||e)+'。可按「開始檢視 ABCD」重試。';
    ABILITIES.forEach(ab=>{if(states[ab.id]==='檢視中'){states[ab.id]='檢視失敗';paint(ab);}});overview();
  }finally{
    running=false;$('runBtn').disabled=false;$('runBtn').textContent='開始檢視 ABCD';
    ABILITIES.forEach(ab=>$('rs-'+ab.id).classList.remove('busy'));
    if(version!==revision)$('runStatus').textContent='內容已更新，舊版檢視已停止。請重新檢視 ABCD。';
  }
}
renderCards();fillCourse('good');
ABILITIES.forEach(ab=>{states[ab.id]='尚未檢視';paint(ab);});overview();renderLog();
$('runStatus').textContent='範例已填入。按「開始檢視 ABCD」取得實際模型結果。';
$('allGood').onclick=()=>fillCourse('good');$('allBad').onclick=()=>fillCourse('bad');
$('clearCourse').onclick=()=>{$('syllabus').value='';$('courseName').value='';invalidate();};
$('syllabus').oninput=invalidate;$('courseName').oninput=invalidate;
$('runBtn').onclick=runCourse;
$('loadBtn').onclick=()=>loadModel().catch(()=>{});
$('exportBtn').onclick=()=>{
  if(!lastInput)return;
  const blob=new Blob([JSON.stringify({...lastInput,method:'Four equally weighted metrics; strongest alignment segment; maximum per-competency probability across segments. Not an official student assessment.',abilities:ABILITIES.map(ab=>({id:ab.id,name:ab.name,definitions:ab.comps,included:$('on-'+ab.id).checked,questions:questionsFor(ab),result:results[ab.id]??null}))},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='課程人才圖像檢視.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
};
