(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

/* ---------- Course content comes from js/content.js ---------- */
var C=window.COURSE;
var MODULES=C.MODULES,STEPS=C.STEPS,WORDS=C.WORDS,WARMUP=C.WARMUP,STORY=C.STORY,DISTRACTORS=C.DISTRACTORS,SORT=C.SORT;

/* ---------- Icons (simple line drawings for each word) ---------- */
var ICONS={
  majority:'<circle cx="24" cy="24" r="17"/><text x="24" y="29.5" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor" stroke="none" font-family="Bricolage Grotesque, sans-serif">18</text>',
  milestone:'<path d="M15 40V19a9 9 0 0 1 18 0v21"/><path d="M8 40h32"/><path d="M20 23h8M20 29h8"/>',
  ceremony:'<circle cx="24" cy="17" r="9"/><path d="M24 12.5L25.1 15.5L28.3 15.6L25.8 17.6L26.6 20.6L24 18.9L21.4 20.6L22.2 17.6L19.7 15.6L22.9 15.5Z" fill="currentColor" stroke-width="1.2"/><path d="M19 25l-4 15 5-3 3 4 1-15"/><path d="M29 25l4 15-5-3-3 4-1-15"/>',
  election:'<path d="M18 22V8h12v14"/><path d="M21 15l2.5 2.5L28 12.5"/><rect x="9" y="22" width="30" height="18" rx="2"/><path d="M18 31h12"/>',
  licence:'<rect x="6" y="11" width="36" height="26" rx="3"/><circle cx="16" cy="21" r="4"/><path d="M10 31a6 5 0 0 1 12 0"/><path d="M26 19h10M26 25h10M26 31h6"/>',
  donation:'<path d="M24 32c-8-5.5-11-10-11-14a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 35 18c0 4-3 8.5-11 14z"/><path d="M8 34c5 6 11 8 16 8s11-2 16-8"/>',
  wage:'<ellipse cx="24" cy="13" rx="11" ry="4"/><path d="M13 13v7c0 2.2 4.9 4 11 4s11-1.8 11-4v-7"/><path d="M13 20v7c0 2.2 4.9 4 11 4s11-1.8 11-4v-7"/><path d="M13 27v7c0 2.2 4.9 4 11 4s11-1.8 11-4v-7"/>',
  tax:'<path d="M13 6h15l8 8v28H13z"/><path d="M28 6v8h8"/><circle cx="19.5" cy="23" r="2.5"/><circle cx="29.5" cy="34" r="2.5"/><path d="M30 22L19 35"/>',
  bill:'<path d="M13 6h22v34l-3.7-2.6L27.6 40l-3.6-2.6-3.6 2.6-3.7-2.6L13 40z"/><path d="M18 14h12M18 20h12M18 26h7"/>',
  card:'<rect x="6" y="11" width="36" height="26" rx="3"/><path d="M6 18.5h36" stroke-width="4"/><rect x="11" y="24" width="8" height="6" rx="1"/><path d="M26 31h11"/>',
  loan:'<path d="M7 18L24 8l17 10z"/><path d="M12 22v13M20 22v13M28 22v13M36 22v13"/><path d="M7 39h34"/>',
  resp:'<path d="M24 6l14 5v11c0 9-6 16-14 20-8-4-14-11-14-20V11z"/><path d="M18 24l4.5 4.5L31 20"/>'
};
var ICON_FOR={majority:'majority',milestone:'milestone',ceremony:'ceremony',election:'election',licence:'licence',donation:'donation',wage:'wage',tax:'tax',bill:'bill',card:'card',loan:'loan',resp:'resp'};
var PLAY='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>';
var CHECK='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- Saved progress (this browser only) ---------- */
var KEY='aom-course-v1';
var DEFAULTS={zh:false,rate:1,viewed:{},known:{},warm:{},match:{A:false,B:false},fill:{},fillDone:false,sort:{},s1:'',s2:'',conf:'',finished:false};
function fresh(){return JSON.parse(JSON.stringify(DEFAULTS));}
function load(){
  try{var raw=localStorage.getItem(KEY);if(raw){var s=JSON.parse(raw),d=fresh();for(var k in d){if(Object.prototype.hasOwnProperty.call(s,k))d[k]=s[k];}return d;}}catch(e){}
  return fresh();
}
var state=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}

/* ---------- Helpers ---------- */
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function icon(id){return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[ICON_FOR[id]]+'</svg>';}
function highlight(text,hl){
  var i=hl?text.toLowerCase().indexOf(hl.toLowerCase()):-1;
  if(i<0)return esc(text);
  return esc(text.slice(0,i))+'<mark>'+esc(text.slice(i,i+hl.length))+'</mark>'+esc(text.slice(i+hl.length));
}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function byId(id){for(var i=0;i<WORDS.length;i++){if(WORDS[i].id===id)return WORDS[i];}return null;}
var reduceMotion=false;try{reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
function goStep(id){var el=$('#step-'+id);if(el)el.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});}

var toastTimer;
function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('show');},3400);}

function copyText(text,okMsg){
  function fallback(){
    var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();
    toast(ok?okMsg:'Copy was blocked here. Select the text and copy it yourself.');
  }
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast(okMsg);},fallback);}
    else fallback();
  }catch(e){fallback();}
}

/* ---------- Audio (browser text-to-speech) ---------- */
var canSpeak=('speechSynthesis' in window)&&typeof window.SpeechSynthesisUtterance==='function';
function pickVoice(){
  try{var vs=window.speechSynthesis.getVoices()||[];
    for(var i=0;i<vs.length;i++){if(/en[-_]GB/i.test(vs[i].lang))return vs[i];}
    for(var j=0;j<vs.length;j++){if(/^en/i.test(vs[j].lang))return vs[j];}
  }catch(e){}
  return null;
}
function speak(text){
  if(!canSpeak){toast('Audio is not available here. Use the phonetic spelling instead.');return;}
  try{
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=state.rate;
    var v=pickVoice();if(v)u.voice=v;
    u.onerror=function(){toast('Audio could not play. Check your volume or use the phonetic spelling.');};
    window.speechSynthesis.speak(u);
  }catch(e){toast('Audio could not play. Use the phonetic spelling instead.');}
}

/* ---------- Navigation rail ---------- */
function renderRail(){
  var s=$('#railStudent'),t=$('#railTeacher');s.innerHTML='';t.innerHTML='';
  MODULES.forEach(function(m){
    var li=document.createElement('li');
    li.innerHTML='<a class="rail-link" href="#'+m.id+'" data-id="'+m.id+'"><span class="rail-n">'+m.n+'</span><span class="rail-t">'+esc(m.title)+'<span class="rail-s">'+(m.min?m.min+' min · ':'')+esc(m.sub)+'</span></span><span class="rail-status" id="rs-'+m.id+'"></span></a>';
    (m.teacher?t:s).appendChild(li);
  });
}
var VIEW_IDS=MODULES.map(function(m){return m.id;});
function route(fromHashChange){
  var h=(location.hash||'').slice(1);
  var id=VIEW_IDS.indexOf(h)>=0?h:'vocab';
  $$('.view').forEach(function(v){v.hidden=v.getAttribute('data-view')!==id;});
  $$('.rail-link').forEach(function(a){if(a.getAttribute('data-id')===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(fromHashChange){window.scrollTo(0,0);try{$('#main').focus({preventScroll:true});}catch(e){}}
}

/* ---------- Step tracker + progress ---------- */
function renderTracker(){
  $('#tracker').innerHTML=STEPS.map(function(s,i){
    return '<li data-step="'+s.id+'"><button type="button" data-go="'+s.id+'"><span class="t-dot">'+CHECK+'</span>'+(i+1)+'. '+s.label+' <span class="t-min">'+s.min+' min</span></button></li>';
  }).join('');
}
function stepDone(id){
  switch(id){
    case 'warm':return WARMUP.every(function(q,i){return state.warm[i]===true;});
    case 'learn':return WORDS.every(function(w){return !!state.viewed[w.id];});
    case 'practise':return !!(state.match.A&&state.match.B&&state.fillDone);
    case 'sort':return SORT.every(function(s,i){return state.sort[i]===true;});
    case 'reflect':return !!state.finished;
  }
  return false;
}
function updateProgress(){
  var n=0;
  STEPS.forEach(function(s){
    var d=stepDone(s.id);if(d)n++;
    var li=$('#tracker li[data-step="'+s.id+'"]');if(li)li.classList.toggle('done',d);
    var sec=$('#step-'+s.id);if(sec)sec.classList.toggle('is-done',d);
  });
  var pct=Math.round(n/STEPS.length*100),partDone=n===STEPS.length;
  var rs=$('#rs-vocab');
  if(rs){rs.textContent=partDone?'Done':(pct>0?pct+'%':'Start');rs.className='rail-status'+(partDone?' done':(pct>0?' active':''));}
  MODULES.forEach(function(m){if(!m.built){var r=$('#rs-'+m.id);if(r){r.textContent='Planned';r.className='rail-status';}}});
  var overall=Math.round(pct/4);
  $('#cpFill').style.width=overall+'%';
  $('#cpBar').setAttribute('aria-valuenow',String(overall));
  $('#cpNum').textContent=(partDone?1:0)+' / 4 parts';
  var viewed=WORDS.filter(function(w){return state.viewed[w.id];}).length;
  var known=WORDS.filter(function(w){return state.known[w.id];}).length;
  $('#counts').textContent='Opened '+viewed+' / 12 · I know '+known+' / 12';
}

/* ---------- Step 1: warm-up ---------- */
function renderWarm(){
  var host=$('#warmList');host.innerHTML='';
  WARMUP.forEach(function(q,i){
    var row=document.createElement('div');row.className='wq';
    row.innerHTML='<p class="wq-q"><span class="wq-n">'+(i+1)+'</span><span>'+esc(q.q)+'</span><span class="zh-hint" lang="zh-CN">'+esc(q.zh)+'</span></p>'+
      '<div class="wq-opts" role="group" aria-label="Minimum age: '+esc(q.q)+'">'+[14,16,18,20].map(function(a){return '<button type="button" class="age" data-i="'+i+'" data-a="'+a+'">'+a+'</button>';}).join('')+'</div>'+
      '<p class="wq-fb" id="wfb-'+i+'" aria-live="polite"></p>';
    host.appendChild(row);
    if(state.warm[i])markWarm(i);
  });
  $('#warmBridge').hidden=!stepDone('warm');
}
function markWarm(i){
  var q=WARMUP[i];
  $$('.age[data-i="'+i+'"]').forEach(function(b){b.disabled=true;if(+b.getAttribute('data-a')===q.a)b.classList.add('ok');});
  var fb=$('#wfb-'+i);fb.className='wq-fb ok-text';fb.textContent='Correct. '+q.fb;
}
$('#warmList').addEventListener('click',function(e){
  var b=e.target.closest('.age');if(!b||b.disabled)return;
  var i=+b.getAttribute('data-i'),a=+b.getAttribute('data-a'),q=WARMUP[i];
  if(a===q.a){state.warm[i]=true;save();markWarm(i);$('#warmBridge').hidden=!stepDone('warm');updateProgress();}
  else{b.classList.add('no');b.disabled=true;var fb=$('#wfb-'+i);fb.className='wq-fb no-text';fb.textContent='Not yet. Hint: '+q.hint;}
});

/* ---------- Step 2: word cards ---------- */
function renderCards(){
  ['A','B'].forEach(function(g){
    var host=$('#cards'+g);host.innerHTML='';
    WORDS.filter(function(w){return w.group===g;}).forEach(function(w){
      var card=document.createElement('article');
      card.className='wcard'+(state.known[w.id]?' known':'');card.setAttribute('data-id',w.id);
      card.innerHTML=
        '<div class="wc-top"><span class="wc-icon">'+icon(w.id)+'</span>'+
        '<div class="wc-word"><h4>'+esc(w.word)+'</h4><p class="wc-ipa">'+esc(w.pos)+' · '+esc(w.ipa)+'</p></div></div>'+
        '<div class="wc-actions">'+
          '<button type="button" class="btn small sound" data-say="word" aria-label="Play the word '+esc(w.word)+'">'+PLAY+'Word</button>'+
          '<button type="button" class="btn small sound" data-say="ex" aria-label="Play the example sentence for '+esc(w.word)+'">'+PLAY+'Example</button>'+
          '<button type="button" class="btn small reveal" aria-expanded="false" aria-controls="m-'+w.id+'">Show meaning</button>'+
        '</div>'+
        '<div class="wc-meaning" id="m-'+w.id+'" hidden>'+
          '<p class="wc-def">'+esc(w.def)+'</p>'+
          '<p class="zh-hint" lang="zh-CN">'+esc(w.zh)+'</p>'+
          '<p class="wc-ex">“'+highlight(w.ex,w.hl)+'”</p>'+
          (w.note?'<p class="wc-note">'+esc(w.note)+'</p>':'')+
        '</div>'+
        '<label class="wc-know" for="k-'+w.id+'"><input type="checkbox" id="k-'+w.id+'"'+(state.known[w.id]?' checked':'')+'> I know this word</label>';
      host.appendChild(card);
    });
  });
  if(!canSpeak){$$('.sound').forEach(function(b){b.hidden=true;});$('#rateGroup').hidden=true;$('#noAudio').hidden=false;}
}
$('#step-learn').addEventListener('click',function(e){
  var rate=e.target.closest('[data-rate]');
  if(rate){state.rate=parseFloat(rate.getAttribute('data-rate'));save();applyRate();return;}
  var card=e.target.closest('.wcard');if(!card)return;
  var w=byId(card.getAttribute('data-id'));
  var say=e.target.closest('[data-say]');
  if(say){speak(say.getAttribute('data-say')==='word'?w.word:w.ex);return;}
  var rev=e.target.closest('.reveal');
  if(rev){
    var m=$('#m-'+w.id),open=m.hidden;
    m.hidden=!open;rev.setAttribute('aria-expanded',String(open));rev.textContent=open?'Hide meaning':'Show meaning';
    if(open&&!state.viewed[w.id]){state.viewed[w.id]=true;save();updateProgress();}
  }
});
$('#step-learn').addEventListener('change',function(e){
  if(!e.target.matches('.wc-know input'))return;
  var card=e.target.closest('.wcard'),id=card.getAttribute('data-id');
  state.known[id]=e.target.checked;if(e.target.checked)state.viewed[id]=true;
  card.classList.toggle('known',e.target.checked);save();updateProgress();
});
function applyRate(){$$('[data-rate]').forEach(function(b){b.setAttribute('aria-pressed',String(parseFloat(b.getAttribute('data-rate'))===state.rate));});}

function wordListText(){
  return ['The Age of Majority · Part 1 word list',''].concat(WORDS.map(function(w,i){
    return (i+1)+'. '+w.word+' ('+w.pos+') '+w.ipa+'\n   '+w.def+'  |  '+w.zh+'\n   e.g. '+w.ex;
  })).join('\n');
}
$('#copyList').addEventListener('click',function(){copyText(wordListText(),'Word list copied.');});
$('#dlList').addEventListener('click',function(){
  try{
    var blob=new Blob([wordListText()],{type:'text/plain;charset=utf-8'});
    var url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='age-of-majority-word-list.txt';document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1500);
    toast('Word list downloaded.');
  }catch(e){toast('Download did not work in this browser. Use Copy word list instead.');}
});

/* ---------- Step 3A: matching ---------- */
var mSet='A',mSel=null;
function renderMatch(ignoreDone){
  var ws=WORDS.filter(function(w){return w.group===mSet;});
  var done=!ignoreDone&&!!state.match[mSet];
  $('#matchWords').innerHTML=ws.map(function(w){return '<button type="button" class="tile word'+(done?' ok':'')+'" data-kind="w" data-id="'+w.id+'" aria-pressed="false"'+(done?' disabled':'')+'>'+esc(w.word)+'</button>';}).join('');
  $('#matchDefs').innerHTML=shuffle(ws).map(function(w){return '<button type="button" class="tile def'+(done?' ok':'')+'" data-kind="d" data-id="'+w.id+'" aria-pressed="false"'+(done?' disabled':'')+'>'+esc(w.def)+'</button>';}).join('');
  $$('.tabbtn').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-set')===mSet));});
  setFb(done?'This set is complete. Try the other set, or press Shuffle and try again.':'',done?'ok':'');
  mSel=null;
}
function setFb(msg,kind){var f=$('#matchFb');f.textContent=msg;f.className='feedback'+(kind==='ok'?' ok-text':kind==='no'?' no-text':'');}
$('.set-tabs').addEventListener('click',function(e){
  var b=e.target.closest('.tabbtn');if(b){mSet=b.getAttribute('data-set');renderMatch(false);return;}
  if(e.target.closest('#matchAgain'))renderMatch(true);
});
$('#match').addEventListener('click',function(e){
  var t=e.target.closest('.tile');if(!t||t.disabled)return;
  if(mSel===t){t.setAttribute('aria-pressed','false');mSel=null;return;}
  if(!mSel||mSel.getAttribute('data-kind')===t.getAttribute('data-kind')){
    if(mSel)mSel.setAttribute('aria-pressed','false');
    mSel=t;t.setAttribute('aria-pressed','true');return;
  }
  var a=mSel,wordTile=a.getAttribute('data-kind')==='w'?a:t,defTile=a.getAttribute('data-kind')==='d'?a:t;
  a.setAttribute('aria-pressed','false');mSel=null;
  var w=byId(wordTile.getAttribute('data-id')),dw=byId(defTile.getAttribute('data-id'));
  if(w.id===dw.id){
    [wordTile,defTile].forEach(function(x){x.classList.add('ok');x.disabled=true;});
    setFb('Correct. “'+w.word+'” means '+w.def+'.','ok');
    if($$('#matchWords .tile').every(function(x){return x.disabled;})){
      state.match[mSet]=true;save();updateProgress();
      var other=mSet==='A'?'B':'A';
      setFb(state.match[other]?'Both sets complete. Now complete the story below.':'Set complete. Now try Set '+(other==='A'?'1':'2')+'.','ok');
    }
  }else{
    [wordTile,defTile].forEach(function(x){x.classList.remove('no');void x.offsetWidth;x.classList.add('no');});
    setFb('Not quite. That meaning goes with “'+dw.word+'”, not “'+w.word+'”. Try again.','no');
  }
});

/* ---------- Step 3B: story gap-fill ---------- */
var GAPS=STORY.filter(function(p){return typeof p!=='string';});
var OPTIONS=(function(){
  var seen={},out=[];
  GAPS.map(function(g){return g.a;}).concat(DISTRACTORS).forEach(function(o){if(!seen[o]){seen[o]=1;out.push(o);}});
  return out.sort(function(a,b){return a.replace(/^the /,'').localeCompare(b.replace(/^the /,''));});
})();
function renderStory(){
  var p=document.createElement('p'),gi=0;
  STORY.forEach(function(part){
    if(typeof part==='string'){p.appendChild(document.createTextNode(part));return;}
    var i=gi++,wrap=document.createElement('span');wrap.className='gap';
    var n=document.createElement('span');n.className='gap-n';n.textContent=String(i+1);n.setAttribute('aria-hidden','true');
    var s=document.createElement('select');s.id='gap-'+i;s.setAttribute('data-i',String(i));s.setAttribute('aria-label','Gap '+(i+1));
    s.innerHTML='<option value="">choose…</option>'+OPTIONS.map(function(o){return '<option value="'+esc(o)+'">'+esc(o)+'</option>';}).join('');
    s.value=state.fill[i]||'';
    wrap.appendChild(n);wrap.appendChild(s);p.appendChild(wrap);
  });
  var host=$('#story');host.innerHTML='';host.appendChild(p);
  if(state.fillDone)checkStory();
}
function checkStory(){
  var right=0,items=[];
  GAPS.forEach(function(g,i){
    var s=$('#gap-'+i);s.classList.remove('ok','no');
    if(s.value===g.a){s.classList.add('ok');right++;}
    else{s.classList.add('no');items.push('<li><strong>Gap '+(i+1)+':</strong> '+(s.value?'':'You have not chosen a word yet. ')+esc(g.hint)+' <span class="zh-hint" lang="zh-CN">'+esc(g.zh)+'</span></li>');}
  });
  var all=right===GAPS.length,sc=$('#storyScore');
  sc.textContent=right+' / '+GAPS.length+' correct';sc.className='score '+(all?'ok-text':'no-text');
  $('#storyFb').innerHTML=all?'<li class="ok-line">All correct. Look at “Soon I’ll be paying”: you will meet this future form again in the passage.</li>':items.join('');
  if(all&&!state.fillDone){state.fillDone=true;save();updateProgress();}
}
$('#story').addEventListener('change',function(e){
  var s=e.target.closest('select');if(!s)return;
  state.fill[s.getAttribute('data-i')]=s.value;save();s.classList.remove('ok','no');
});
$('#checkStory').addEventListener('click',checkStory);

/* ---------- Step 4: rights vs responsibilities ---------- */
function renderSort(){
  $('#sortList').innerHTML=SORT.map(function(s,i){
    return '<div class="srow" id="sr-'+i+'"><p class="st">'+esc(s.t)+'</p>'+
      '<div class="sbtns" role="group" aria-label="'+esc(s.t)+'"><button type="button" class="sbtn" data-i="'+i+'" data-v="right">Right · I can</button><button type="button" class="sbtn" data-i="'+i+'" data-v="resp">Responsibility · I must</button></div>'+
      '<p class="sfb" id="sfb-'+i+'" aria-live="polite"></p></div>';
  }).join('');
  SORT.forEach(function(s,i){if(state.sort[i])markSort(i);});
}
function markSort(i){
  var s=SORT[i];$('#sr-'+i).classList.add('ok');
  $$('.sbtn[data-i="'+i+'"]').forEach(function(b){b.disabled=true;b.classList.remove('wrong');b.classList.toggle('chosen',b.getAttribute('data-v')===s.a);});
  var f=$('#sfb-'+i);f.className='sfb ok-text';f.textContent='Correct. '+s.fb;
}
$('#sortList').addEventListener('click',function(e){
  var b=e.target.closest('.sbtn');if(!b||b.disabled)return;
  var i=+b.getAttribute('data-i'),s=SORT[i];
  if(b.getAttribute('data-v')===s.a){state.sort[i]=true;save();markSort(i);updateProgress();}
  else{b.classList.add('wrong');b.disabled=true;var f=$('#sfb-'+i);f.className='sfb no-text';f.textContent='Think again. '+s.hint;}
});

/* ---------- Step 5: reflect ---------- */
var lastInput=null;
function renderReflect(){
  $('#chips').innerHTML=WORDS.map(function(w){return '<button type="button" class="chip" data-w="'+esc(w.word)+'">'+esc(w.word)+'</button>';}).join('');
  $('#s1').value=state.s1;$('#s2').value=state.s2;
  if(state.conf){var r=$('#conf-'+state.conf);if(r)r.checked=true;}
  updateFinish();
  if(state.finished)showResult();
}
['s1','s2'].forEach(function(id){
  var inp=$('#'+id);
  inp.addEventListener('focus',function(){lastInput=inp;});
  inp.addEventListener('input',function(){state[id]=inp.value;save();updateFinish();});
});
$('#chips').addEventListener('click',function(e){
  var c=e.target.closest('.chip');if(!c)return;
  var inp=lastInput||$('#s1'),word=c.getAttribute('data-w');
  var st=typeof inp.selectionStart==='number'?inp.selectionStart:inp.value.length;
  var en=typeof inp.selectionEnd==='number'?inp.selectionEnd:st;
  var before=inp.value.slice(0,st),after=inp.value.slice(en);
  var pad=(before&&!/\s$/.test(before))?' ':'';
  var padAfter=(after&&!/^\s/.test(after))?' ':'';
  inp.value=before+pad+word+padAfter+after;
  var pos=(before+pad+word).length;
  inp.focus();try{inp.setSelectionRange(pos,pos);}catch(err){}
  state[inp.id]=inp.value;save();updateFinish();
});
$('#conf').addEventListener('change',function(e){if(e.target.name==='conf'){state.conf=e.target.value;save();updateFinish();}});
function updateFinish(){
  var ok=state.s1.trim().length>=3&&state.s2.trim().length>=3&&!!state.conf;
  $('#finishBtn').disabled=!ok;
  $('#finishNote').textContent=ok?(state.finished?'You can update your sentences and press Finish again.':'Ready when you are.'):'Write both sentences and choose how confident you feel.';
}
function usedWords(){
  var text=(state.s1+' '+state.s2).toLowerCase();
  return WORDS.filter(function(w){return w.key.some(function(k){return text.indexOf(k)>=0;});});
}
function showResult(){
  var used=usedWords(),box=$('#result');
  var usedMsg=used.length?'You used '+used.length+' new word'+(used.length>1?'s':'')+': '+used.map(function(w){return w.word;}).join(', ')+'.':'You did not use a word from the list yet. Try adding one, then press Finish again.';
  var confMsg={sure:'Great. You are ready for Part 2.',some:'Good. Look again at any card you did not tick before you move on.',review:'Go back to Step 2 and listen to each word again. Slow audio may help.'}[state.conf]||'';
  var known=WORDS.filter(function(w){return state.known[w.id];}).length;
  box.innerHTML='<p><strong>Part 1 complete.</strong> You ticked '+known+' of 12 words as known.</p>'+
    '<blockquote><p>When I turn 18, I’m looking forward to '+esc(state.s1.trim().replace(/[.!]$/,''))+'. I know I will also need to '+esc(state.s2.trim().replace(/[.!]$/,''))+'.</p></blockquote>'+
    '<p>'+esc(usedMsg)+'</p><p>'+esc(confMsg)+'</p>'+
    '<div class="row"><a class="btn primary" href="#starting-out">Go to Part 2: Starting out</a>'+
    (state.conf==='review'?'<button type="button" class="btn" id="backCards">Back to the word cards</button>':'')+
    '<button type="button" class="btn" id="copyMine">Copy my sentences</button></div>';
  box.hidden=false;
}
$('#finishBtn').addEventListener('click',function(){state.finished=true;save();showResult();updateProgress();updateFinish();});
$('#result').addEventListener('click',function(e){
  if(e.target.closest('#backCards'))goStep('learn');
  if(e.target.closest('#copyMine'))copyText('When I turn 18, I’m looking forward to '+state.s1.trim().replace(/[.!]$/,'')+'. I know I will also need to '+state.s2.trim().replace(/[.!]$/,'')+'.','Your sentences are copied.');
});

/* ---------- Timer ---------- */
var tLeft=20*60,tId=null;
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
$('#timerBtn').addEventListener('click',function(){
  var btn=this;
  if(tId){clearInterval(tId);tId=null;btn.textContent='Resume';return;}
  if(tLeft<=0)return;
  btn.textContent='Pause';
  tId=setInterval(function(){
    tLeft--;$('#timerOut').textContent=fmt(Math.max(tLeft,0));
    if(tLeft<=0){clearInterval(tId);tId=null;$('#timer').classList.add('up');btn.textContent='Time is up';btn.disabled=true;toast('20 minutes are up. Finish your current step, then move on to Part 2.');}
  },1000);
});
$('#timerReset').addEventListener('click',function(){
  clearInterval(tId);tId=null;tLeft=20*60;$('#timerOut').textContent=fmt(tLeft);$('#timer').classList.remove('up');
  var b=$('#timerBtn');b.textContent='Start timer';b.disabled=false;
});
$('#tracker').addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(b)goStep(b.getAttribute('data-go'));});

/* ---------- Chinese hints toggle ---------- */
function applyZh(){document.body.classList.toggle('show-zh',!!state.zh);$('#zhToggle').checked=!!state.zh;}
$('#zhToggle').addEventListener('change',function(){state.zh=this.checked;save();applyZh();});

/* ---------- Help dialog ---------- */
var dlg=$('#helpDialog'),resetArmed=false;
$('#helpBtn').addEventListener('click',function(){
  resetArmed=false;$('#resetBtn').textContent='Start Part 1 again';
  if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
});
$('#helpClose').addEventListener('click',function(){if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open');});
$('#resetBtn').addEventListener('click',function(){
  if(!resetArmed){resetArmed=true;this.textContent='Press again to clear your Part 1 answers';return;}
  var zh=state.zh,rate=state.rate;state=fresh();state.zh=zh;state.rate=rate;save();
  renderAll();if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open');
  $('#result').hidden=true;toast('Part 1 has been reset.');window.scrollTo(0,0);
});

/* ---------- Start ---------- */
function renderAll(){renderWarm();renderCards();renderMatch(false);renderStory();renderSort();renderReflect();applyZh();applyRate();updateProgress();}
renderRail();renderTracker();renderAll();route(false);
window.addEventListener('hashchange',function(){route(true);});
})();
