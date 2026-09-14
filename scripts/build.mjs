import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cats=vm.runInNewContext(read('assets/data.js')+';CATEGORIES');
const outcomes={basic:['在宅学習の環境・ファイル管理表・案件確認メモ','準備 → 操作 → 保存・共有 → 安全な仕事の受け方'],image:['架空の整理講座の告知バナーと、納品用ファイル','目的を決める → 配置と文字 → 素材 → 完成・納品'],web:['架空講座の案内ページと、公開・改善のチェック表','企画 → 構成 → ページ制作 → スマホ確認・公開・改善'],sns:['発信の設計書・画像投稿・短い動画台本・運用報告','読者を決める → 企画 → 投稿制作 → 分析・運用提案'],writing:['読者の疑問に答える記事と、推敲・取材の記録','読者と目的 → 構成 → 執筆 → 確認・推敲'],ai:['用途別プロンプト集と、AIの出力を確認する手順書','試す → 条件を伝える → 文章・画像・整理 → 検証'],sales:['小さな商品の企画・販売ページ・提供と改善の計画','需要を確かめる → 商品設計 → 価格と販売文 → 提供・改善']};
if(!fs.existsSync('content/base.json')){
 const base={};for(const c of cats)for(const l of c.lessons)base[l.url]=read(l.url).match(/<article[^>]*>([\s\S]*?)<\/article>/)[1];
 fs.writeFileSync('content/base.json',JSON.stringify(base,null,2)+'\n');
}
const base=JSON.parse(read('content/base.json'));
const refs=fs.existsSync('content/references.json')?JSON.parse(read('content/references.json')):{};
const videos=JSON.parse(read('content/videos.json'));
const stats=[];
const description={basic:'道具の準備と基本操作。自分で保存・共有し、安全に仕事を進める土台を作ります。',image:'伝わる配置と素材の扱いを学び、Canvaで告知バナーを完成させます。',web:'構成からスマホ確認まで。申し込みの流れが分かる案内ページを作ります。',sns:'発信の方向性を決め、投稿制作・分析・運用提案を練習します。',writing:'読者の疑問から構成を作り、具体例と根拠のある記事へ仕上げます。',ai:'質問・指示・確認を練習し、文章や画像、日々の作業へ活用します。',sales:'知識を小さな商品へ。企画・価格・販売文・購入後の提供を設計します。'};
for(const c of cats){
 c.desc=description[c.id];[c.outcome,c.route]=outcomes[c.id];
 const file='content/'+c.id+'.json';if(!fs.existsSync(file))throw Error('Missing course: '+file);
 const add=JSON.parse(read(file));if(add.length!==c.lessons.length)throw Error('Lesson count mismatch '+c.id);
 for(const [i,l] of c.lessons.entries()){
  const x=add[i],id=c.id+'-'+i,slug=c.id+'-'+(i+1);
  for(const key of ['focus','sections','steps','example','template','exercise','checks','question','answer'])if(!x[key])throw Error(slug+' missing '+key);
  if(c.id==='sns'&&i===4)l.t='おすすめ表示の仕組みを理解する';
  if(c.id==='ai'&&i===3){l.t='有料プランが必要かを判断する';l.d='機能・利用量・費用を比べ、自分に必要かを判断します。';}
  if(c.id==='sales'&&i===7){l.t='Xで役立つ投稿から記事へつなぐ';l.d='拡散だけに頼らず、投稿と販売記事をつなぐ設計を学びます。';}
  if(c.id==='basic'&&i===9)l.t='在宅ワークの環境づくり（時間・スペース・集中）';
  l.d=x.focus;l.practiceMin=(i===c.lessons.length-1?40:20);
  l.keywords=[...x.sections.map(s=>s.h),x.focus].join(' ');
  let theory=base[l.url].replace(/<h3>/g,'<h3>').trim();
  const video=videos[slug];let media='<div class="video-status"><span class="video-status-icon" aria-hidden="true">▷</span><div><b>動画は準備中です</b><p>この章は、文章と実践ワークだけで学習できます。</p></div><span class="video-status-tag">TEXT LESSON</span></div>';
  if(video){
    const u=new URL(video.url);if(u.protocol!=='https:')throw Error('HTTPS video required: '+slug);
    if(video.type==='embed'&&['www.youtube-nocookie.com','player.vimeo.com'].includes(u.hostname))media=`<div class="video-frame"><iframe src="${esc(video.url)}" title="${esc(l.t)}の動画" loading="lazy" allowfullscreen></iframe></div>`;
    else if(video.type==='mp4')media=`<div class="video-frame"><video controls preload="metadata" src="${esc(video.url)}" aria-label="${esc(l.t)}の動画"></video></div>`;
    else throw Error('Unsupported video '+slug);
  }
  let article=`<section class="lesson-objective"><span class="eyebrow">TODAY’S GOAL</span><p>${esc(x.focus)}</p><div class="learning-flow"><span>01 理解する</span><span>02 試してみる</span><span>03 振り返る</span></div></section>${media}<section class="theory"><h2>基本を理解する</h2>${theory}</section>`;
  article+=x.sections.map(s=>`<section><h2>${esc(s.h)}</h2>${s.p.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('');
  article+=`<section><h2>手を動かす：実践の手順</h2><ol class="practice-steps">${x.steps.map((t,j)=>`<li><span class="step-count">${String(j+1).padStart(2,'0')}</span><div>${esc(t)}</div></li>`).join('')}</ol></section><section class="worked-example"><span class="eyebrow">WORKED EXAMPLE</span><h2>具体例で確かめる</h2><p>${esc(x.example)}</p></section><section><h2>コピーして使えるワークシート</h2><p>自分の条件に置き換えて使ってください。入力内容は、下の学習メモにも残せます。</p><div class="template-block"><div class="template-bar"><span>記入用テンプレート</span><button type="button" class="copy-button" data-copy>コピーする</button></div><pre class="worksheet">${esc(x.template)}</pre></div></section><section class="assignment"><span class="eyebrow">YOUR PRACTICE</span><h2>この章の実践課題</h2><p>${esc(x.exercise)}</p><h3>できたことを確認する</h3><div class="checklist">${x.checks.map((t,j)=>`<label><input type="checkbox" data-check="${j}"><span>${esc(t)}</span></label>`).join('')}</div><p class="small-text">チェックはこのブラウザに保存されます。すべてにチェックしなくても、教材は自由に読み進められます。</p></section><section><h2>理解度チェック</h2><p class="quiz-question">${esc(x.question)}</p><details class="answer"><summary>答えと解説を確認する</summary><p>${esc(x.answer)}</p></details></section><section class="notes-section"><h2>学習メモ</h2><label for="studyNote">できたこと・つまずいたこと・次に試すこと</label><textarea id="studyNote" rows="6" maxlength="20000" placeholder="例：今日はここまでできた。次回は、この手順から再開する。"></textarea><div class="note-actions"><span id="noteStatus" role="status">このブラウザに自動保存します</span><button class="copy-button" data-download type="button">メモを保存（.txt）</button></div><p class="small-text">端末間では同期されません。共有端末ではご注意ください。パスワード、認証コード、お客様の個人情報は記入しないでください。</p></section>`;
  const sources=refs[slug]||refs[c.id]||[];
  if(sources.length)article+=`<section class="source-section"><h2>公式情報・確認先</h2><p>操作画面・料金・利用条件は変わることがあります。利用時点の公式案内を確認してください。</p><ul>${sources.map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a></li>`).join('')}</ul><p class="small-text">教材改訂：2026年9月14日。具体例の数値や案件は、特記のない限り練習用です。</p></section>`;
  let n=0;const toc=[];article=article.replace(/<h([23])>(.*?)<\/h\1>/g,(_,level,title)=>{const anchor='section-'+(++n);toc.push({level,anchor,title});return `<h${level} id="${anchor}">${title}</h${level}>`;});
  const text=article.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();l.min=Math.max(5,Math.ceil(text.length/500));
  const prev=i?`<a class="foot-nav-btn" href="${c.id}-${i}.html"><small>前の教材</small><span>← ${esc(c.lessons[i-1].t)}</span></a>`:`<a class="foot-nav-btn" href="../index.html?course=${c.id}"><small>コースの入口</small><span>← ${esc(c.title)}の教材一覧</span></a>`;
  const next=i<c.lessons.length-1?`<a class="foot-nav-btn next" href="${c.id}-${i+2}.html"><small>次の教材</small><span>${esc(c.lessons[i+1].t)} →</span></a>`:`<a class="foot-nav-btn next" href="../index.html"><small>コースの学習、お疲れさまでした</small><span>次に学ぶコースを選ぶ →</span></a>`;
  const html=`<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(l.t)}｜${esc(c.title)}｜HSA</title><meta name="description" content="${esc(x.focus)}"><link rel="stylesheet" href="../assets/campus.css"><link rel="stylesheet" href="../assets/reader.css"><script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script defer src="../assets/config.js"></script><script defer src="../assets/auth.js"></script><script defer src="../assets/lesson-guard.js"></script><script defer src="../assets/learning.js"></script><script defer src="../assets/reader.js"></script></head><body class="reader" data-course="${c.id}" data-lesson="${id}"><a class="skip-link" href="#lesson-content">本文へ移動</a><header class="reader-header"><a class="brand" href="../index.html"><span class="brand-mark">hsa</span><span><b>HSA</b><small>LEARNING CAMPUS</small></span></a><a class="reader-back" href="../index.html?course=${c.id}">← ${esc(c.title)}の教材一覧</a><span class="reader-count">${String(i+1).padStart(2,'0')} / ${c.lessons.length}</span></header><div class="reading-track" aria-hidden="true"><i id="readingFill"></i></div><main class="lesson-wrap"><div class="lesson-hero"><a class="lesson-cat" href="../index.html?course=${c.id}">${esc(c.title)} / LESSON ${String(i+1).padStart(2,'0')}</a><h1>${esc(l.t)}</h1><p class="lesson-meta">読む目安 ${l.min}分 <span>·</span> 実践目安 ${l.practiceMin}分 <span>·</span> 文章＋ワークシート</p></div><div class="reader-layout"><aside class="reader-toc"><details id="tocDetails" open><summary>この章の目次 <span aria-hidden="true">＋</span></summary><nav aria-label="この章の目次">${toc.filter(t=>t.level==='2').map(t=>`<a href="#${t.anchor}">${t.title}</a>`).join('')}</nav></details><div class="reader-tools"><button type="button" class="text-button" data-size aria-pressed="false">文字を大きくする</button><button type="button" class="text-button" data-reader-bookmark aria-pressed="false">この教材を保存する</button><a class="text-button" href="#${toc.find(t=>t.title==='学習メモ').anchor}">学習メモへ移動 ↓</a></div><p class="toc-note">少しずつ、自分のペースで。<br>読む → 試す → 記録する。</p></aside><article class="article" id="lesson-content">${article}</article></div><div class="completion-area"><button class="complete-btn" data-lesson="${id}" type="button" aria-pressed="false">この教材を学習済みにする</button><p>読み終えたら記録しましょう。あとで解除できます。</p></div><nav class="lesson-foot-nav" aria-label="前後の教材">${prev}${next}</nav><a class="back-to-list" href="../index.html?course=${c.id}">コースの教材一覧へ戻る</a></main><footer class="reader-footer">HOME SUCCESS ACADEMY <span>学びを、毎日の力に。</span></footer><div id="toast" class="toast" role="status" hidden></div></body></html>`;
  fs.writeFileSync(l.url,html+'\n');stats.push({file:l.url,course:c.id,chars:text.length,readingMin:l.min,practiceMin:l.practiceMin,headings:toc.length,sections:toc.filter(t=>t.level==='2').length});
 }
}
fs.writeFileSync('assets/data.js','/* Generated by scripts/build.mjs. Source: content/*.json. Existing category and lesson IDs are preserved. */\nconst CATEGORIES = '+JSON.stringify(cats,null,2)+';\n');
fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/content-stats.json',JSON.stringify({total:stats.length,characters:stats.reduce((s,r)=>s+r.chars,0),lessons:stats},null,2)+'\n');
console.log('Built '+stats.length+' lessons; '+stats.reduce((n,r)=>n+r.chars,0).toLocaleString()+' characters.');
