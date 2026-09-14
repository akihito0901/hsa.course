(() => {
 const S=Study,$=s=>document.querySelector(s),id=document.body.dataset.lesson;
 const key='hsa_work_'+id;let stored=S.read(key,{});let work=stored&&typeof stored==='object'&&!Array.isArray(stored)?stored:{};
 let active=false;let toastTimer;
 const notify=t=>{const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3500);};
 function sync(){const done=S.list('hsa_completed').has(id),bm=S.list('hsa_bookmarks').has(id),btn=$('.complete-btn'),star=$('[data-reader-bookmark]');if(btn){btn.textContent=done?'✓ 学習済み（クリックで解除）':'この教材を学習済みにする';btn.classList.toggle('done',done);btn.setAttribute('aria-pressed',String(done));}if(star){star.textContent=bm?'✓ 保存済み（クリックで解除）':'この教材を保存する';star.setAttribute('aria-pressed',String(bm));}}
 const toc=$('#tocDetails');if(!toc)return;const media=matchMedia('(max-width: 960px)');function responsive(){toc.open=!media.matches;}responsive();media.addEventListener('change',responsive);
 let large=S.read('hsa_large_text',false)===true;document.body.classList.toggle('large-text',large);$('[data-size]').setAttribute('aria-pressed',String(large));$('[data-size]').textContent=large?'文字を標準に戻す':'文字を大きくする';
 document.addEventListener('click',async ev=>{
  const size=ev.target.closest('[data-size]');if(size){large=!large;document.body.classList.toggle('large-text',large);S.write('hsa_large_text',large);size.setAttribute('aria-pressed',String(large));size.textContent=large?'文字を標準に戻す':'文字を大きくする';}
  if(ev.target.closest('.reader-toc nav a')&&media.matches)toc.open=false;
  if(!active)return;
  if(ev.target.closest('.complete-btn')){const result=S.toggle('hsa_completed',id);sync();notify(result.saved?(result.on?'学習済みにしました。お疲れさまでした。':'学習済みを解除しました'):'この環境では保存できません。');}
  if(ev.target.closest('[data-reader-bookmark]')){const result=S.toggle('hsa_bookmarks',id);sync();notify(result.saved?(result.on?'教材を保存しました':'保存を解除しました'):'この環境では保存できません。');}
  const copy=ev.target.closest('[data-copy]');if(copy){const text=copy.closest('.template-block').querySelector('pre').textContent;try{await navigator.clipboard.writeText(text);notify('テンプレートをコピーしました');}catch{const range=document.createRange();range.selectNodeContents(copy.closest('.template-block').querySelector('pre'));getSelection().removeAllRanges();getSelection().addRange(range);notify('コピーできないため文章を選択しました。手動でコピーしてください。');}}
  if(ev.target.closest('[data-download]')){const note=$('#studyNote').value;const text=$('h1').textContent+'\n\n'+note+'\n\nできたこと\n'+[...document.querySelectorAll('[data-check]')].map(el=>(el.checked?'[x] ':'[ ] ')+el.nextElementSibling.textContent).join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='HSA-'+id+'-学習メモ.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 });
 function saveWork(){const ok=S.write(key,work);const status=$('#noteStatus');if(status)status.textContent=ok?'保存しました（このブラウザのみ）':'保存できません。メモを.txtで保存してください。';}
 function activate(){if(active||!$('.article'))return;active=true;const note=$('#studyNote');if(note){note.value=typeof work.note==='string'?work.note:'';note.addEventListener('input',()=>{work.note=note.value;saveWork();});}
 document.querySelectorAll('[data-check]').forEach(el=>{el.checked=Array.isArray(work.checks)&&work.checks.includes(el.dataset.check);el.addEventListener('change',()=>{work.checks=[...document.querySelectorAll('[data-check]:checked')].map(x=>x.dataset.check);saveWork();});});
 const sections=[...document.querySelectorAll('.article h2')];let lastSection='';const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){lastSection=entry.target.id;document.querySelectorAll('.reader-toc nav a').forEach(a=>{const current=a.hash==='#'+lastSection;a.classList.toggle('current',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});S.write('hsa_last',{id,section:lastSection});}}},{rootMargin:'-90px 0px -65% 0px',threshold:0});sections.forEach(el=>observer.observe(el));S.write('hsa_last',{id,section:/^#section-\d+$/.test(location.hash)?location.hash.slice(1):''});sync();
 }
 function updateReading(){const article=$('.article');if(!active||!article)return;const start=article.getBoundingClientRect().top+scrollY,end=start+article.offsetHeight-innerHeight;const pct=Math.max(0,Math.min(100,(scrollY-start)/Math.max(1,end-start)*100));$('#readingFill').style.width=pct+'%';}window.addEventListener('scroll',updateReading,{passive:true});
 window.addEventListener('hsa:lesson-access',ev=>{if(ev.detail.allowed){activate();if(location.hash){requestAnimationFrame(()=>{document.getElementById(location.hash.slice(1))?.scrollIntoView();});}}});
 window.addEventListener('storage',ev=>{if(ev.key==='hsa_completed'||ev.key==='hsa_bookmarks')sync();});window.addEventListener('studychange',sync);
 const parts=id.split('-');if(parts[0]==='basic'||parts[1]==='0')activate();else if(document.documentElement.dataset.lessonAccess==='allowed')activate();
 sync();
})();
