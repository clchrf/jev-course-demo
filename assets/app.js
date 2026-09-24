import { ABILITIES } from './abilities.js';
import { RUBRIC, LEVELS } from './rubric.js';
import { METRICS, MODEL_POLICY, modelQuestions, splitUnits, analyzeUnits, scoreAbility } from './course-engine.js';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// 75 = average L3 (practice plus output or check); 50 = average L2 (students practise).
const grade = s => s==null?['無相關敘述','']:s>=75?['很好','g']:s>=50?['尚可','a']:['要補強','r'];
const colors = {g:'var(--green)',a:'var(--amber)',r:'var(--red)'};
const pct = p => p==null?'–':Math.round(p*100)+'%';
let agent, loading, running=false, revision=0, active='D', calls=0;
let results={}, lastInput=null, course=null;
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
    <blockquote class="evidence" id="evidence-${ab.id}">檢視後顯示有學生練習證據的課綱段落。</blockquote>
    <p class="warn">${ab.warn}</p>
    <div class="result idle" id="rs-${ab.id}"><div class="rhead"><span class="lbl">尺規分數（證據等級換算）<span class="spin"></span></span><span class="total"><b id="tot-${ab.id}">–</b><span id="grade-${ab.id}">尚未檢視</span></span></div>
    <p class="status" id="status-${ab.id}" hidden></p>
    ${METRICS.map(([key,name,sub])=>`<div class="row"><div class="nm"><b>${name}</b><small>${sub}</small></div><div class="bar"><i id="bar-${ab.id}-${key}"></i></div><div class="sc" id="sc-${ab.id}-${key}">–</div><div class="tg" id="tag-${ab.id}-${key}"></div></div>`).join('')}
    <p class="note" id="note-${ab.id}"></p></div>
    <details class="comp-details" ${matchMedia("(max-width:640px)").matches ? "" : "open"}><summary>核心能力細項 · ${ab.comps.length} 項</summary><div class="detail-list">
    ${ab.comps.map(([id,name,desc])=>{const r=RUBRIC[id];return `<div class="detail-item"><header><code>${id}</code><output id="p-${id}">尚未檢視</output></header><h4>${name}</h4><p>${desc}</p><div class="bar"><i id="db-${id}"></i></div>
    <ul class="flags" id="fl-${id}" aria-label="證據類型"></ul>
    <p id="feedback-${id}">檢視後顯示證據等級與原文對照。</p>
    <p class="mprob" id="mp-${id}"></p><p class="review" id="rv-${id}" hidden></p>
    <details><summary>尺規依據、模型提問與對照原文</summary><p><b>官方定義依據：</b>${esc(r.trace)}</p><p><b>練習：</b>${esc(r.practice)}<br><b>產出：</b>${esc(r.output)}<br><b>檢核：</b>${esc(r.checkHint)}</p><p><b>送入 Laya 的問題：</b>${esc(r.model)}</p><blockquote class="evidence" id="de-${id}">尚未檢視</blockquote></details></div>`;}).join('')}
    </div></details></div></article>`).join('');
  ABILITIES.forEach(ab=>$('on-'+ab.id).addEventListener('change',()=>{
    invalidate(); $('card-'+ab.id).classList.toggle('off',!$('on-'+ab.id).checked);
  }));
}
const FLAG_NAMES=[['mention','提及'],['practice','學生練習'],['output','具體產出'],['check','驗證／反思／評量']];
function modelLine(c,r){
  if(r.modelError)return '模型未執行：'+r.modelError;
  if(r.modelPending)return '模型判斷機率（Laya）：背景運算中…';
  const parts=[];
  if(c.pEvidence!=null)parts.push(`練習段落 P(是) ${pct(c.pEvidence)}`);
  if(c.pAny!=null)parts.push(`全課程最高 ${pct(c.pAny)}（第 ${c.pAnyUnit+1} 段）`);
  const cal=c.modelCalibration, rel=cal.auroc==null?'校準集無正例，可靠度未知':`校準 AUROC ${cal.auroc}（正例僅 ${cal.pos} 門）${cal.auroc<0.7?'，不可靠':''}`;
  return `模型判斷機率（Laya，未計入分數）：${parts.join('；')||'–'}。${c.modelAgrees?'與尺規方向一致':'與尺規方向不一致'}。${rel}。`;
}
function paint(ab){
  const r=results[ab.id], status=states[ab.id]||'尚未檢視';
  $('rs-'+ab.id).classList.toggle('idle',!r);
  $('rs-'+ab.id).classList.toggle('busy',status==='檢視中'||!!r?.modelPending);
  $('tot-'+ab.id).textContent=r?r.total:'–';
  $('grade-'+ab.id).textContent=r?grade(r.total)[0]:status;
  $('grade-'+ab.id).className=r?grade(r.total)[1]:'';
  const st=$('status-'+ab.id);
  st.hidden=!r||(r.status==='ok'&&!r.modelError);
  if(r)st.textContent=r.status==='insufficient'?'證據不足：沒有任何細項找到學生練習，分數只反映是否提及。':r.status==='review'?`需人工複核：${r.reviews} 項細項的練習段落本身未提到 AI，請確認活動與 AI 相關。`:r.modelError?'模型未能執行，以下僅為尺規結果，需人工複核。':'';
  METRICS.forEach(([key])=>{
    const s=r?.scores[key];
    $('bar-'+ab.id+'-'+key).style.width=r&&s!=null?s+'%':'0';
    $('bar-'+ab.id+'-'+key).style.background=r&&s!=null?colors[grade(s)[1]]:'';
    $('sc-'+ab.id+'-'+key).textContent=r?(s??'—'):'–';
    $('tag-'+ab.id+'-'+key).textContent=r?grade(s)[0]:'';
    $('tag-'+ab.id+'-'+key).className='tg '+(r?grade(s)[1]:'');
  });
  const ev=r?[...new Set(r.comps.flatMap(c=>c.units.filter(u=>u.practice).map(u=>u.index)))].sort((a,b)=>a-b):[];
  $('evidence-'+ab.id).textContent=!r?'檢視後顯示有學生練習證據的課綱段落。':ev.length?`有學生練習證據的段落：第 ${ev.map(i=>i+1).join('、')}／${course.units.length} 段\n\n`+ev.slice(0,3).map(i=>`【第 ${i+1} 段】${course.units[i]}`).join('\n\n')+(ev.length>3?`\n\n…另有 ${ev.length-3} 段，見細項對照。`:''):`全部 ${course.units.length} 段都沒有找到此向度的學生練習證據。`;
  $('note-'+ab.id).textContent=r?`${r.comps.filter(c=>c.practice).length} / ${r.comps.length} 細項有練習（≥L2）· 分數＝各細項證據等級平均 ÷ 4 × 100，不是四項指標平均 · 全課綱 ${course.units.length} 段合併檢視。`:'';
  ab.comps.forEach(([id],i)=>{
    const c=r?.comps[i];
    $('p-'+id).textContent=c?`${LEVELS[c.level][0]} ${LEVELS[c.level][1]}`:status;
    $('p-'+id).className=c?'lv'+c.level:'';
    $('db-'+id).style.width=c?c.level*25+'%':'0';
    $('db-'+id).style.background=c?colors[grade(c.level*25)[1]]:'';
    $('fl-'+id).innerHTML=c?FLAG_NAMES.map(([k,n])=>`<li class="${c[k]?'on':''}">${c[k]?'✓':'–'} ${n}</li>`).join(''):'';
    $('feedback-'+id).textContent=!c?'檢視後顯示證據等級與原文對照。':c.level>=4?'有學生練習、具體產出，以及驗證、反思或評量。':c.level===3?`有學生練習；尚缺${c.output?'驗證、反思或評量':'具體產出'}。`:c.level===2?'有學生練習；尚缺具體產出與驗證／評量。':c.level===1?'只提到能力或目標，沒有找到學生實際練習。':'課綱中沒有找到此細項的相關敘述。';
    $('mp-'+id).textContent=c?modelLine(c,r):'';
    $('rv-'+id).hidden=!c?.review;$('rv-'+id).textContent=c?.review?'需人工複核：'+c.review:'';
    $('de-'+id).textContent=!c?'尚未檢視':c.units.length?c.units.map(u=>`【第 ${u.index+1} 段 · ${u.practice?'練習':'僅提及'}】${u.sentences.join('')}`).join('\n\n'):'沒有對應的課綱文字。';
  });
}
function overview(){
  $('overview').innerHTML=ABILITIES.map(ab=>{const r=results[ab.id];return `<a href="#card-${ab.id}"><span>${ab.id}　${ab.name}</span><strong>${r?.total??'–'} <small>/ 100</small></strong><small>${r?`${r.comps.filter(c=>c.practice).length} / ${ab.comps.length} 細項有練習`+(r.reviews?` · ${r.reviews} 項需複核`:'')+(r.status==='insufficient'?' · 證據不足':''):states[ab.id]||'尚未檢視'}</small></a>`;}).join('');
  $('abtabs').innerHTML=ABILITIES.map(ab=>`<button type="button" class="${active===ab.id?'on':''}" aria-pressed="${active===ab.id}" data-ab="${ab.id}"><span class="l">${ab.id}</span><span class="n">${results[ab.id]?.total??'–'}</span></button>`).join('');
  $('abtabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.ab;overview();renderLog();});
}
function renderLog(){
  const ab=ABILITIES.find(a=>a.id===active), r=results[active], ids=ab.comps.map(([id])=>id), qs=modelQuestions(ids);
  if(!r){$('logBody').innerHTML=`<p class="lead">能力 ${active}：${states[active]||'尚未檢視'}</p><details><summary>查看問題設定</summary><pre>${esc(JSON.stringify(qs,null,2))}</pre></details>`;return;}
  const raw=course.modelRaw;
  $('logBody').innerHTML=`<div class="req">agent.predict(teachingUnit, questions)<br>${ids.length} 個問題 × ${course.units.length} 段<br>輸出 0 tokens${r.modelPending?' · 運算中':''}</div>
    <p class="lead">noul 回傳 P(是)。分數由尺規比對原文產生；模型機率只列出並標示是否與尺規方向一致（門檻 ${MODEL_POLICY.agree}），不計分，也不觸發複核（校準顯示這類旗標抓不到錯誤）。</p>
    <details><summary>完整提問設定</summary><pre>${esc(JSON.stringify(qs,null,2))}</pre></details>
    ${course.units.map((u,i)=>{const rule=Object.fromEntries(ids.filter(id=>course.analysis[i].comps[id]).map(id=>{const e=course.analysis[i].comps[id];return [id,{practice:e.practice,output:e.output,check:e.check}];}));
      const m=raw?.[i]?raw[i].map(p=>({text:p.text===u?'(同本段)':p.text,answers:Object.fromEntries(ids.map(id=>[id,p.answers[id]]))})):'尚未取得';
      return `<details ${Object.keys(rule).some(id=>rule[id].practice)?'open':''}><summary>第 ${i+1} 段 · 原文、尺規比對與模型回傳</summary><blockquote class="evidence">${esc(u)}</blockquote><pre>${esc(JSON.stringify({rubric:rule,laya:m},null,2))}</pre></details>`;}).join('')}`;
}
function invalidate(){
  revision++; results={};lastInput=null;course=null;$('exportBtn').disabled=true;
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
  running=true;$('runBtn').disabled=true;$('runBtn').textContent='檢視中…';
  const start=performance.now();
  try{
    // 1) Rubric pass: instant and deterministic.
    const units=splitUnits(text), analysis=analyzeUnits(units,title);
    course={title,units,analysis,modelP:null,modelRaw:null};
    lastInput={title,text,units,model:'Laya multilingual (quantized ONNX)',createdAt:new Date().toISOString()};
    for(const ab of enabled){results[ab.id]={...scoreAbility(ab,analysis,null),modelPending:true};states[ab.id]='完成';paint(ab);}
    active=enabled[enabled.length-1].id;overview();renderLog();
    $('runStatus').textContent=`尺規結果已完成（${units.length} 段）。Laya 正在背景逐段運算…`;
    // 2) Laya pass: every unit, every enabled competency.
    const ids=enabled.flatMap(ab=>ab.comps.map(([id])=>id)), entries=Object.entries(modelQuestions(ids));
    try{
      await loadModel();
      if(version!==revision)return;
      const modelP=[], modelRaw=[];
      for(let i=0;i<units.length;i++){
        const pieces=await rpc('prepare',units[i]);
        if(version!==revision)return;
        const p={}, raw=[];
        for(let k=0;k<pieces.length;k++){
          $('runStatus').textContent=`尺規結果已完成。Laya 運算第 ${i+1}／${units.length} 段${pieces.length>1?`（第 ${k+1}／${pieces.length} 部分）`:''}，${ids.length} 個問題…`;
          const answers={};
          // Smaller batches limit WASM memory while retaining all questions.
          for(let j=0;j<entries.length;j+=3){
            if(version!==revision)return;
            const output=await agent.predict(pieces[k],Object.fromEntries(entries.slice(j,j+3)));
            if(version!==revision)return;
            Object.assign(answers,output.answers);calls+=Math.min(3,entries.length-j);$('mCalls').textContent=calls;
            await new Promise(resolve=>setTimeout(resolve,0));
          }
          raw.push({text:pieces[k],answers});
          for(const id of ids)p[id]=Math.max(p[id]??0,answers[id].noul);
        }
        modelP.push(p);modelRaw.push(raw);
      }
      course.modelP=modelP;course.modelRaw=modelRaw;
      for(const ab of enabled){results[ab.id]=scoreAbility(ab,analysis,modelP);paint(ab);}
      $('runStatus').textContent=`已完成 ${enabled.length} 個向度、${ids.length} 個細項、${units.length} 段課綱。分數依尺規比對原文；Laya 機率另列，供人工複核。`;
    }catch(e){
      if(version!==revision)return;
      console.error(e);
      for(const ab of enabled){results[ab.id]={...scoreAbility(ab,analysis,null),modelError:e.message||String(e)};paint(ab);}
      $('runStatus').textContent='尺規結果已完成，但 Laya 未能執行：'+(e.message||e)+'。可按「開始檢視 ABCD」重試。';
    }
    $('mLast').textContent=((performance.now()-start)/1000).toFixed(1)+' s';
    overview();renderLog();$('exportBtn').disabled=false;
  }catch(e){
    console.error(e);
    $('runStatus').textContent='檢視未完成：'+(e.message||e)+'。可按「開始檢視 ABCD」重試。';
    ABILITIES.forEach(ab=>{if(states[ab.id]==='檢視中'){states[ab.id]='檢視失敗';paint(ab);}});overview();
  }finally{
    running=false;$('runBtn').disabled=false;$('runBtn').textContent='開始檢視 ABCD';
    if(version!==revision)$('runStatus').textContent='內容已更新，舊版檢視已停止。請重新檢視 ABCD。';
  }
}
renderCards();fillCourse('good');
ABILITIES.forEach(ab=>{states[ab.id]='尚未檢視';paint(ab);});overview();renderLog();
$('runStatus').textContent='範例已填入。按「開始檢視 ABCD」取得結果。';
$('allGood').onclick=()=>fillCourse('good');$('allBad').onclick=()=>fillCourse('bad');
$('clearCourse').onclick=()=>{$('syllabus').value='';$('courseName').value='';invalidate();};
$('syllabus').oninput=invalidate;$('courseName').oninput=invalidate;
$('runBtn').onclick=runCourse;
$('loadBtn').onclick=()=>loadModel().catch(()=>{});
$('exportBtn').onclick=()=>{
  if(!lastInput||!course)return;
  const method='Evidence rubric v2: each competency gets L0–L4 from rule-based cues traced to the official IV definitions, merged across all teaching units (deduplicated, order-independent). Ability score = mean level / 4 × 100. Laya noul probabilities are reported separately and only flag items for human review. Not an official MOE scale and not the 0–5 scale of the other slide deck.';
  const blob=new Blob([JSON.stringify({...lastInput,method,modelPolicy:MODEL_POLICY,levels:LEVELS,
    units:course.units.map((u,i)=>({index:i+1,text:u,rubric:course.analysis[i].comps,laya:course.modelRaw?.[i]??null})),
    abilities:ABILITIES.map(ab=>({id:ab.id,name:ab.name,definitions:ab.comps,included:$('on-'+ab.id).checked,questions:modelQuestions(ab.comps.map(([id])=>id)),result:results[ab.id]??null}))},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='課程人才圖像檢視.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
};
