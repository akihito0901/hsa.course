import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.HSA_PLAYWRIGHT||'playwright-core');
const browser=await chromium.launch({headless:true});
const checks=[],errors=[];
const assert=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844}});
 await ctx.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:'window.supabase={createClient(){return {auth:{getSession:()=>new Promise(()=>{}),onAuthStateChange:()=>({})}}}};'}));
 await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4317');
 assert(await page.locator('#courseSelect option').count()===8,'Course navigation available while authentication hangs');
 await page.locator('#notice').filter({hasText:'会員情報を確認できませんでした'}).waitFor({state:'visible',timeout:14000});
 checks.push('Authentication wait ends with a visible explanation');
 await page.goto('http://127.0.0.1:4317/lessons/image-2.html');
 await page.locator('.lesson-lock-h').filter({hasText:'会員情報を確認できませんでした'}).waitFor({timeout:14000});
 assert(await page.locator('#hsaLockBuy').count()===0,'Authentication outage does not prompt repurchase');
 await page.goto('http://127.0.0.1:4317/lessons/basic-1.html');
 assert(await page.locator('.article').isVisible(),'Free lesson remains immediately readable');
 assert(errors.length===0,'No page errors');
 fs.writeFileSync('docs/auth-timeout-check.json',JSON.stringify({checks,errors},null,2)+'\n');
 console.log('PASS '+checks.length+' outage checks.');
}finally{await browser.close();}
