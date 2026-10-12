(()=>{const E=SL.esc,$=id=>document.getElementById(id),f=$('addf');let editing=null;
const fmt=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const STEPS=[['plan','Written plan adopted','../plan/','Build'],['notice','Employee notice sent',null,'Mark sent'],['enroll','Sign-ups collected','../enroll/','Form'],['test','Nondiscrimination tested','../test/','Run'],['payroll','Payroll set up','../payroll/','Guide']];
function st(c,k){const s=c.status||{};if(k==='plan')return s.plan?['ok','Built']:['','To do'];if(k==='notice')return s.notice?['ok','Sent']:['','To do'];
 if(k==='enroll'){const n=c.enrollments||0;return n?['ok',n+(c.eligible?' / '+c.eligible:'')+' in']:s.enrollForm?['mid','Form ready']:['','To do']}
 if(k==='test')return s.test==='pass'?['ok','Pass']:s.test==='fail'?['no','Fail']:['','Not run'];
 return s.payroll==='done'?['ok','Done']:s.payroll==='started'?['mid','In progress']:['','To do']}
function deadlines(c){const out=[];const now=new Date();now.setHours(0,0,0,0);
 if(c.pystart){const s=new Date(c.pystart+'T12:00');out.push(['Plan year starts',s,'Plan adopted + notice sent before']);const end=new Date(s);end.setFullYear(end.getFullYear()+1);end.setDate(end.getDate()-1);out.push(['55% test date',end,'Last day of plan year']);
  const w2=new Date(end.getFullYear()+1,0,31);out.push(['W-2 box 12 TA + statement',w2,'Jan 31 after the calendar year']);}
 return out.map(([l,d,n])=>{const days=Math.round((d-now)/864e5);return `<div class="${days>=0&&days<=45?'soon':''}"><span class="mono small">${l}</span><b>${fmt(d)}</b><span>${days<0?'Passed':days===0?'Today':'In '+days+' day'+(days===1?'':'s')} · ${n}</span></div>`}).join('')}
function render(){const cs=SL.clients();const done=c=>STEPS.filter(([k])=>st(c,k)[0]==='ok').length;
 $('kpis').innerHTML=`<div><b>${cs.length}</b><span>clients</span></div><div><b>${cs.filter(c=>done(c)===5).length}</b><span>fully set up</span></div><div><b>${cs.filter(c=>c.status&&c.status.test==='fail').length}</b><span>failing tests</span></div>`;
 $('clients').innerHTML=cs.length?cs.map(c=>{const d=done(c),C=2*Math.PI*18;return `<article class="cl2" data-id="${E(c.id)}"><div><h3>${E(c.name)}</h3><p class="meta">${[c.ein&&'EIN '+E(c.ein),E(c.payroll||''),c.admin&&E(c.admin)].filter(Boolean).join(' · ')}</p>
 <div class="ring2"><svg viewBox="0 0 44 44"><circle class="t" cx="22" cy="22" r="18"/><circle class="p" cx="22" cy="22" r="18" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-d/5)}"/></svg><span><b>${d} of 5</b> steps done</span></div>
 <div class="cact"><button class="tbtn" data-a="edit">Edit</button><button class="tbtn" data-a="json">Export</button><button class="tbtn warnb" data-a="del">Delete</button></div></div>
 <ul class="steps2">${STEPS.map(([k,l,u,b])=>{const [cls,t]=st(c,k);return `<li><span>${l}</span><span class="pill ${cls}">${t}</span>${u?`<a class="go" href="${u}?client=${encodeURIComponent(c.id)}">${b} →</a>`:`<button class="go" data-a="notice">${c.status&&c.status.notice?'Undo':b}</button>`}</li>`}).join('')}</ul>
 <div class="dl">${deadlines(c)||'<span class="meta">Add a plan year start to see deadlines.</span>'}</div></article>`}).join(''):`<div class="empty"><svg class="logomark" style="width:40px;height:40px"><use href="#mark"/></svg><h3>No clients yet</h3><p>Add your first employer to track their plan, notice, sign-ups, testing, and payroll. It's saved only in this browser.</p><button class="btn sm" id="new2">+ Add client</button></div>`;
 const n2=$('new2');if(n2)n2.onclick=open_;}
function open_(c){editing=c&&c.id?c.id:null;f.reset();$('addk').textContent=editing?'Edit client':'New client';if(editing)for(const k of ['name','ein','pystart','payroll','admin','aemail','eligible','notes'])if(c[k]!=null)f[k].value=c[k];
 if(!editing){const y=new Date().getFullYear()+1;f.pystart.value=`${y}-01-01`}f.hidden=false;f.name.focus()}
$('new').onclick=()=>open_();$('cancel').onclick=()=>{f.hidden=true};
f.onsubmit=e=>{e.preventDefault();for(const el of f.querySelectorAll('input'))if(!el.checkValidity()){el.focus();$('err').textContent=el.name==='ein'?'EIN should look like 12-3456789.':'Please check the highlighted field.';return}
 const d=Object.fromEntries(new FormData(f));if(editing)d.id=editing;d.py=d.pystart?+d.pystart.slice(0,4):undefined;SL.upsert(d);f.hidden=true;$('err').textContent='';render();SL.bar($('databar'),render);SL.toast(editing?'Client updated':'Client added')};
$('clients').onclick=e=>{const b=e.target.closest('button[data-a]');if(!b)return;const id=b.closest('[data-id]').dataset.id,c=SL.get(id);
 if(b.dataset.a==='edit')open_(c);
 if(b.dataset.a==='del'&&confirm(`Delete ${c.name} from this browser?`)){SL.remove(id);render();SL.bar($('databar'),render)}
 if(b.dataset.a==='json')SL.download(`seedline-${c.name.replace(/\W+/g,'-').toLowerCase()}.json`,JSON.stringify({v:1,clients:[c]},null,2));
 if(b.dataset.a==='notice'){SL.patch(id,x=>{x.status.notice=!x.status.notice});render()}};
$('expcsv').onclick=()=>{const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;const L=['name,ein,plan_year_start,payroll,admin,admin_email,plan,notice,signups,eligible,test,payroll_setup'];SL.clients().forEach(c=>{const s=c.status||{};L.push([c.name,c.ein,c.pystart,c.payroll,c.admin,c.aemail,s.plan?'built':'',s.notice?'sent':'',c.enrollments||0,c.eligible||'',s.test||'',s.payroll||''].map(q).join(','))});SL.download('seedline-clients.csv',L.join('\n'),'text/csv')};
document.querySelector('.pickrow').remove();SL.bar($('databar'),render);render();
})();
