(()=>{const E=SL.esc,$=id=>document.getElementById(id),money=n=>'$'+Math.round(n).toLocaleString('en-US'),pct=n=>(Math.round(n*10)/10).toFixed(1)+'%';
const COLS=['name','prior_year_comp','owner_pct','age','years_service','union','self_employed','eligible','contribution','pilot_match'];
const PASS=`name,prior_year_comp,owner_pct,age,years_service,union,self_employed,eligible,contribution,pilot_match
Maria Lopez,52000,0,34,6,no,no,yes,1000,0
James Carter,61000,0,41,9,no,no,yes,1000,0
Aisha Khan,47000,0,29,3,no,no,yes,1000,0
Tom Nguyen,58000,0,38,4,no,no,yes,1000,1000
Priya Shah,72000,0,45,12,no,no,yes,1000,0
Dev Patel,39000,0,24,2,no,no,yes,1000,0
Lena Brooks,44000,0,19,0.5,no,no,no,0,0
Sam Ortiz,185000,0,50,15,no,no,yes,1000,0
Rachel Kim,210000,30,47,10,no,no,yes,1000,1000
Chris Avery,0,40,52,10,no,yes,no,0,0`;
const FAIL=`name,prior_year_comp,owner_pct,age,years_service,union,self_employed,eligible,contribution,pilot_match
Maria Lopez,52000,0,34,6,no,no,no,0,0
James Carter,61000,0,41,9,no,no,yes,500,0
Aisha Khan,47000,0,29,3,no,no,no,0,0
Tom Nguyen,58000,0,38,4,no,no,no,0,0
Priya Shah,72000,0,45,12,no,no,yes,500,0
Dev Patel,39000,0,24,2,yes,no,no,0,0
Sam Ortiz,185000,0,50,15,no,no,yes,2500,0
Rachel Kim,210000,30,47,10,no,no,yes,2500,0
Nora Wells,168000,0,44,7,no,no,yes,2500,0`;
const tb=document.querySelector('#grid tbody');let client=null;
const yn=v=>/^(y|yes|true|1|x)$/i.test(String(v).trim());
function parse(t){const L=t.trim().split(/\r?\n/).filter(Boolean);if(L.length<2)throw new Error('The CSV has no employee rows.');
 const split=l=>{const o=[];let c='',q=false;for(const ch of l){if(ch==='"')q=!q;else if(ch===','&&!q){o.push(c);c=''}else c+=ch}o.push(c);return o.map(s=>s.trim())};
 const h=split(L[0]).map(s=>s.toLowerCase().replace(/\s+/g,'_'));const miss=COLS.filter(c=>!h.includes(c)&&c!=='pilot_match');if(miss.length)throw new Error('Missing column'+(miss.length>1?'s':'')+': '+miss.join(', '));
 return L.slice(1).map(l=>{const v=split(l),r={};COLS.forEach(c=>r[c]=v[h.indexOf(c)]??'');return r})}
function row(r={}){const tr=document.createElement('tr');const num=(k,st)=>`<td class="n"><input data-k="${k}" type="number" step="${st||1}" value="${E(r[k]??'')}"></td>`;const sel=k=>`<td><select data-k="${k}"><option${yn(r[k])?'':' selected'}>no</option><option${yn(r[k])?' selected':''}>yes</option></select></td>`;
 tr.innerHTML=`<td><input class="nm" data-k="name" value="${E(r.name||'')}" placeholder="Employee name"></td>${num('prior_year_comp',100)}${num('owner_pct',.1)}${num('age')}${num('years_service',.1)}${sel('union')}${sel('self_employed')}${sel('eligible')}${num('contribution')}${num('pilot_match')}<td><button type="button" class="x" aria-label="Remove row">×</button></td>`;
 tr.querySelector('.x').onclick=()=>{tr.remove();count()};tb.appendChild(tr)}
const rows=()=>[...tb.rows].map(tr=>{const r={};tr.querySelectorAll('[data-k]').forEach(i=>r[i.dataset.k]=i.value);return r}).filter(r=>r.name.trim());
function load(list){tb.innerHTML='';list.forEach(row);count();$('err').textContent=''}
function count(){$('cnt').textContent=`${tb.rows.length} employee${tb.rows.length===1?'':'s'}`}
$('spass').onclick=()=>load(parse(PASS));$('sfail').onclick=()=>load(parse(FAIL));$('add').onclick=()=>{row();count()};
$('dlsample').onclick=()=>SL.download('seedline-sample-employees.csv',PASS,'text/csv');
$('csv').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{load(parse(t));SL.toast(`Loaded ${tb.rows.length} employees`)}catch(x){$('err').textContent=x.message}});e.target.value=''};
function compute(list){const thr=+$('thr').value||160000,sr=$('srdis').checked;
 const emp=list.map(r=>{const o={name:r.name,comp:+r.prior_year_comp||0,own:+r.owner_pct||0,age:+r.age||0,svc:+r.years_service||0,union:yn(r.union),se:yn(r.self_employed),elig:yn(r.eligible),c:+r.contribution||0,pm:+r.pilot_match||0};
  o.hce=o.own>5||o.comp>thr;o.why=o.own>5?'>5% owner':o.comp>thr?'Comp > '+money(thr):'';
  o.excl=o.se?'Self-employed (not an employee)':(o.age<21||o.svc<1)?'Under 21 or < 1 yr service':(o.union&&!o.elig)?'Union, not in plan':'';
  o.other=Math.max(0,o.c-o.pm);return o});
 const warn=[];emp.filter(e=>!e.se&&e.c>2500).forEach(e=>warn.push(`${e.name}: ${money(e.c)} is over the $2,500 per-employee exclusion. The excess isn't a section 128 contribution.`));
 emp.filter(e=>!e.elig&&e.c>0).forEach(e=>warn.push(`${e.name} is marked not eligible but has a contribution.`));
 const T=emp.filter(e=>!e.excl);const H=T.filter(e=>e.hce),N=T.filter(e=>!e.hce);
 // Test 1 contributions & benefits (heuristic), pilot match disregarded
 const eH=H.filter(e=>e.elig),eN=N.filter(e=>e.elig);const maxN=Math.max(0,...eN.map(e=>e.other)),minN=eN.length?Math.min(...eN.map(e=>e.other)):0,maxH=Math.max(0,...eH.map(e=>e.other));
 const t1={pass:!(eH.length&&eN.length&&maxH>maxN)&&!(eH.length&&!eN.length&&maxH>0),maxH,maxN,minN};
 // Test 2 eligibility
 const pN=N.length?eN.length/N.length:0,pH=H.length?eH.length/H.length:1;const ratio=H.length?(pH?pN/pH:1):1;const conc=T.length?N.length/T.length*100:0;
 const shp=90-0.75*Math.max(0,Math.floor(conc)-60);const t2={pass:!H.length||ratio*100>=shp,ratio:ratio*100,shp,conc,pN:pN*100,pH:pH*100,noH:!H.length,noN:!N.length};
 // Test 3 average benefits
 const N3=sr?N.filter(e=>e.comp>=25000):N;const avg=a=>a.length?a.reduce((s,e)=>s+e.other,0)/a.length:0;const aN=avg(N3),aH=avg(H);const r3=aH?aN/aH:1;
 const t3={pass:!aH||r3>=0.55,aN,aH,r:r3*100,nN:N3.length,nH:H.length};
 let corr=null;if(!t3.pass){const q=aN/0.55;const allOver=H.every(e=>e.other>q);let ex;
  if(allOver)ex=H.map(e=>({e,x:e.other-q}));else{let need=H.reduce((s,e)=>s+e.other,0)-q*H.length;const s=[...H].sort((a,b)=>b.other-a.other);const amt=new Map(s.map(e=>[e,e.other]));
   while(need>0.005){const top=Math.max(...amt.values());const at=s.filter(e=>amt.get(e)===top);const next=Math.max(0,...[...amt.values()].filter(v=>v<top));const room=(top-next)*at.length;const cut=Math.min(need,room);at.forEach(e=>amt.set(e,top-cut/at.length));need-=cut;if(room===0)break}
   ex=s.map(e=>({e,x:e.other-amt.get(e)}))}
  corr={q,allOver,ex:ex.filter(o=>o.x>0.005)}}
 return {emp,T,H,N,t1,t2,t3,corr,warn,thr,sr}}
const meter=(v,line,bad)=>`<div class="meterx${bad?' bad':''}"><i style="width:${Math.min(100,v)}%"></i><u style="left:${Math.min(100,line)}%"></u></div>`;
let last=null;
$('run').onclick=()=>{const list=rows();if(!list.length){$('err').textContent='Add at least one employee, or load a sample.';return}$('err').textContent='';const R=last=compute(list);
 const ok=R.t1.pass&&R.t2.pass&&R.t3.pass,py=+$('py').value;
 const pill=p=>`<span class="pill ${p?'ok':'no'}">${p?'Pass':'Fail'}</span>`;
 $('res').innerHTML=`<div class="verdict ${ok?'':'fail'}"><span class="big">${ok?'✓':'!'}</span><div><b>${ok?'Passes all three tests':'Fails '+[R.t1,R.t2,R.t3].filter(t=>!t.pass).length+' of 3 tests'}</b><p>${R.T.length} employees tested · ${R.H.length} HCE · ${R.N.length} NHCE · ${R.emp.length-R.T.length} excluded. ${client?'Client: '+E(client.name)+'. ':''}Plan year ${py}.</p></div></div>
 ${R.warn.length?`<div class="warn">${R.warn.map(E).join('<br>')}</div>`:''}
 <div class="tests">
 <article class="tc"><p class="mono small">Test 1 · § 1.128-3(a)</p><h3>Contributions &amp; benefits</h3>${pill(R.t1.pass)}<p class="fig">${money(R.t1.maxH)}<small>top HCE vs ${money(R.t1.maxN)} top NHCE</small></p><p>${R.t1.pass?'Eligible HCEs don\u2019t get more than eligible NHCEs (pilot-match dollars ignored). Same terms for everyone eligible satisfies this test.':'Some HCEs get more than any NHCE. Unless the formula is the same for everyone (for example a per-child amount), this likely favors HCEs.'}</p><p class="unc2">Facts-and-circumstances test. Only a screen.</p></article>
 <article class="tc"><p class="mono small">Test 2 · § 1.128-3(b)</p><h3>Eligibility</h3>${pill(R.t2.pass)}<p class="fig">${R.t2.noH?'—':pct(R.t2.ratio)}<small>ratio vs ${pct(R.t2.shp)} safe harbor</small></p>${R.t2.noH?'':meter(R.t2.ratio,R.t2.shp,!R.t2.pass)}<p>${pct(R.t2.pN)} of NHCEs and ${pct(R.t2.pH)} of HCEs are eligible. NHCE concentration ${pct(R.t2.conc)}. ${R.t2.noH?'No non-excluded HCEs, so the classification can\u2019t favor them.':R.t2.pass?'Meets the numerical safe harbor.':'Below the safe harbor. The classification may still pass on facts and circumstances, but needs an advisor\u2019s review.'}</p></article>
 <article class="tc"><p class="mono small">Test 3 · § 1.128-3(c)</p><h3>55% average benefits</h3>${pill(R.t3.pass)}<p class="fig">${R.t3.aH?pct(R.t3.r):'—'}<small>NHCE avg ÷ HCE avg</small></p>${R.t3.aH?meter(R.t3.r,55,!R.t3.pass):''}<p>Average NHCE contribution ${money(R.t3.aN)} (${R.t3.nN} people, including zeros) vs HCE ${money(R.t3.aH)} (${R.t3.nH}). Needs at least 55%. Tested as of the last day of the plan year.</p></article></div>
 ${R.corr?`<div class="fix"><p class="kicker">Correction option · § 1.128-3(c)(5)</p><h3>Include ${money(R.corr.ex.reduce((s,o)=>s+o.x,0))} in HCE income by the W-2 deadline</h3><p>The program can still count as passing if, by the Form W-2 deadline for ${py} (generally January 31, ${py+1}), you include the excess in the affected HCEs' income and send the corrective notice. Each HCE's contribution is brought down to ${money(R.corr.q)} (NHCE average ÷ 0.55). ${R.corr.allOver?'Because every HCE is above that level, each HCE\u2019s excess is their amount above it.':'Not every HCE is above that level, so the reduction is allocated by leveling the highest amounts first, which is one reasonable method.'}</p>
 <div class="tblwrap"><table class="tbl"><thead><tr><th>HCE</th><th class="n">Contribution</th><th class="n">Add to income</th></tr></thead><tbody>${R.corr.ex.map(o=>`<tr><td>${E(o.e.name)}</td><td class="n">${money(o.e.other)}</td><td class="n"><b>${money(o.x)}</b></td></tr>`).join('')}</tbody></table></div><p class="unc2" style="margin-top:12px">Alternatively, raise NHCE contributions before year end. Have your advisor confirm the amounts.</p></div>`:''}
 <div class="roster"><div class="tblwrap"><table class="tbl"><thead><tr><th>Employee</th><th>Status</th><th>Why</th><th>Eligible</th><th class="n">Counted $</th><th class="n">Pilot match $</th></tr></thead><tbody>${R.emp.map(e=>`<tr><td>${E(e.name)}</td><td>${e.excl?'<span class="pill">Excluded</span>':e.hce?'<span class="pill mid">HCE</span>':'<span class="pill">NHCE</span>'}</td><td>${E(e.excl||e.why||'')}</td><td>${e.elig?'Yes':'No'}</td><td class="n">${money(e.other)}</td><td class="n">${e.pm?money(e.pm):''}</td></tr>`).join('')}</tbody></table></div></div>`;
 $('out').hidden=false;$('out').scrollIntoView({behavior:'smooth'});
 if(client){SL.patch(client.id,c=>{c.status.test=ok?'pass':'fail';c.lastTest={date:new Date().toISOString(),py,pass:ok,t:[R.t1.pass,R.t2.pass,R.t3.pass],employees:list}});SL.toast('Saved result to '+client.name)}};
$('csvout').onclick=()=>{if(!last)return;const L=['name,status,reason,eligible,counted_contribution,pilot_match'];last.emp.forEach(e=>L.push([`"${e.name.replace(/"/g,'""')}"`,e.excl?'excluded':e.hce?'HCE':'NHCE',`"${e.excl||e.why}"`,e.elig?'yes':'no',e.other,e.pm].join(',')));L.push('',`test1_contributions,${last.t1.pass?'pass':'fail'}`,`test2_eligibility,${last.t2.pass?'pass':'fail'},ratio ${last.t2.ratio.toFixed(1)}%,safe harbor ${last.t2.shp}%`,`test3_avg_benefits,${last.t3.pass?'pass':'fail'},${last.t3.r.toFixed(1)}%`);SL.download('seedline-nondiscrimination.csv',L.join('\n'),'text/csv')};
SL.bar($('databar'),()=>SL.picker($('pick'),pick));
function pick(c){client=c;if(c&&c.lastTest&&c.lastTest.employees){load(c.lastTest.employees);$('py').value=c.lastTest.py}}
SL.picker($('pick'),pick);if(!tb.rows.length){row();row();count()}
})();
