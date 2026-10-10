// 講座動画（MP4）の再生速度ボタン。選んだ速さは次の教材でも使う
(function(){
 const KEY='hsa_video_rate';
 const read=()=>{try{return parseFloat(localStorage.getItem(KEY))||1}catch(e){return 1}};
 const save=r=>{try{localStorage.setItem(KEY,String(r))}catch(e){}};
 document.querySelectorAll('.video-speed').forEach(bar=>{
  const v=bar.previousElementSibling&&bar.previousElementSibling.querySelector('video');
  if(!v)return;
  const apply=r=>{v.playbackRate=r;v.defaultPlaybackRate=r;bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(parseFloat(b.dataset.rate)===r)));};
  apply(read());
  v.addEventListener('loadedmetadata',()=>apply(read()));
  bar.addEventListener('click',e=>{const b=e.target.closest('button[data-rate]');if(!b)return;const r=parseFloat(b.dataset.rate);save(r);apply(r);});
 });
})();
