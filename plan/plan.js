(()=>{
const LIMIT=2500;
const f=document.getElementById('f'),steps=[...f.querySelectorAll('.step')],stepper=document.getElementById('stepper'),err=document.getElementById('err');
let cur=0;
stepper.innerHTML=steps.map((s,i)=>`<li><span class="sn">${String(i+1).padStart(2,'0')}</span><span>${s.dataset.t}</span></li>`).join('');
const $=n=>f.elements[n];
const today=new Date();$('eff').value=`${today.getFullYear()+1}-01-01`;
function show(i){cur=i;steps.forEach((s,j)=>s.hidden=j!==i);[...stepper.children].forEach((li,j)=>{li.className=j<i?'done':j===i?'on':''});
 document.getElementById('back').style.visibility=i?'visible':'hidden';
 document.getElementById('next').innerHTML=i===steps.length-1?'Build my plan <span class="arr" aria-hidden="true">→</span>':'Continue <span class="arr" aria-hidden="true">→</span>';
 document.getElementById('cnt').textContent=`${i+1} / ${steps.length}`;err.textContent='';}
function sync(){
 const ent=$('entity').value;document.getElementById('ownerhint').hidden=!/S corp|Limited|Partnership|Sole/.test(ent);
 document.getElementById('fyw').hidden=$('py').value!=='fiscal';
 document.getElementById('waitw').hidden=$('elig').value!=='wait';
 document.getElementById('ptwarn').hidden=!$('pt').checked;
 const fm=$('form').value;document.getElementById('amtlab').textContent=fm==='emp'?'Amount per employee, per year ($) *':'Amount per eligible child, per year ($) *';
 const a=+$('amt').value||0,m=document.getElementById('meter');
 if(fm==='emp'){m.className='meter'+(a>LIMIT?' bad':'');m.innerHTML=a>LIMIT?`Over the $2,500 limit. Only $2,500 a year can be excluded from income, so the plan caps it there.`:`<b>$${a.toLocaleString()}</b> of the $2,500 annual limit per employee <span class="bar"><i style="width:${Math.min(100,a/LIMIT*100)}%"></i></span>`;}
 else{const k=Math.max(1,Math.floor(LIMIT/Math.max(a,1)));m.className='meter'+(a>LIMIT?' bad':'');m.innerHTML=a>LIMIT?`Over the $2,500 limit per employee. Lower the amount.`:`An employee with ${k>=5?'5+':k} child${k>1?'ren':''} hits the $2,500 cap. The plan stops contributions at $2,500 per employee, however many children.`;}
}
f.addEventListener('input',()=>{err.textContent='';sync()});f.addEventListener('change',sync);
function check(){const s=steps[cur];for(const el of s.querySelectorAll('input,select')){if(el.closest('[hidden]'))continue;if(!el.checkValidity()){el.focus();return el.name==='ein'?'EIN should look like 12-3456789.':el.name==='aemail'?'Enter a valid email.':el.name==='months'?'Waiting period must be 1 to 12 months.':'Please fill in the required fields.';}}
 if(cur===3){const a=+$('amt').value;if(!(a>0))return 'Enter a contribution amount above $0.';if(a>LIMIT)return 'Contributions above $2,500 per employee per year aren\u2019t excludable under Section 128. Enter $2,500 or less.';}
 return '';}
document.getElementById('back').onclick=()=>show(Math.max(0,cur-1));
f.onsubmit=e=>{e.preventDefault();const m=check();if(m){err.textContent=m;return;}if(cur<steps.length-1){show(cur+1);f.scrollIntoView({block:'start',behavior:'smooth'});}else build();};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'$'+Number(n).toLocaleString('en-US');
function fmtDate(v){if(!v)return'';const[y,m,d]=v.split('-');return new Date(+y,m-1,+d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});}
let html='';
function build(){
 const d=Object.fromEntries(new FormData(f));['age21','cba','pt','sr'].forEach(k=>d[k]=!!$(k).checked);
 const N=esc(d.name),eff=fmtDate(d.eff),PN=`${N} Trump Account Contribution Plan`,amt=Math.min(LIMIT,+d.amt);
 const owner=/S corp|Limited|Partnership|Sole/.test(d.entity);
 const py=d.py==='cal'?'the calendar year (January 1 through December 31)':`the Employer's fiscal year${d.fy?`, beginning each ${esc(d.fy)}`:''}`;
 const timing={annual:'once each Plan Year, on a date the Plan Administrator sets',quarterly:'in equal quarterly installments',payroll:'in equal installments each regular payroll period, prorated'}[d.timing];
 const excl=[];if(d.elig==='wait')excl.push(`employees who have not completed ${+d.months} month${+d.months>1?'s':''} of service`);
 if(d.age21)excl.push('employees who have not reached age 21');if(d.cba)excl.push('employees covered by a collective bargaining agreement, unless the agreement provides for participation');
 if(d.pt)excl.push(`part-time employees who are regularly scheduled to work fewer than ${+d.pthrs||20} hours per week`);
 excl.push('individuals treated as self-employed under Code section 401(c)(1), including partners, sole proprietors, directors acting only as directors, and 2-percent shareholders of an S corporation (Code section 1372(b))');
 excl.push('leased employees and individuals not classified by the Employer as common-law employees on its payroll records');
 const contrib={emp:`For each Plan Year, the Employer will contribute ${money(amt)} on behalf of each Participant to one or more Eligible Trump Accounts designated by the Participant.`,
 child:`For each Plan Year, the Employer will contribute ${money(amt)} to the Eligible Trump Account of each dependent of a Participant who is an Account Beneficiary in his or her growth period.`,
 pilot:`For each Plan Year, the Employer will contribute ${money(amt)} to the Eligible Trump Account of each dependent of a Participant who is eligible to receive, and for whom a request has been made for, a pilot program contribution under Code section 6434 (a "Pilot Match Contribution"). Pilot Match Contributions are available on the same terms and conditions to all Participants.`}[d.form];
 const ein=d.ein?` (EIN ${esc(d.ein)})`:'',sign=esc(d.signer)||'Authorized officer',adm=esc(d.admin),ae=esc(d.aemail),ap=esc(d.aphone);
 const unc=t=>`<span class="unc">${t}</span>`;
 const plan=`<article class="paper" id="plandoc">
<header class="phd"><div class="pmeta"><span class="mono small">Draft · for advisor review</span><span class="mono small">Section 128 written plan</span></div>
<h1 class="ptitle">${PN}</h1><p class="psub">Adopted by ${N}${ein}${d.entity&&d.entity!=='Other'?`, ${/^S /.test(d.entity)?'an':'a'} ${esc(/^[SC] /.test(d.entity)?d.entity:d.entity.toLowerCase())}`:''}${d.state?` organized in ${esc(d.state)}`:''}. Effective ${eff}.</p></header>
<section><h2><span>Art. 1</span>Purpose</h2><p>${N} (the "Employer") establishes this ${PN} (the "Plan") to make contributions to the Trump accounts of its eligible employees and their dependents. The Plan is intended to be a separate written plan for the exclusive benefit of employees and a "Trump account contribution program" under section 128 of the Internal Revenue Code of 1986, as amended (the "Code"), so that contributions are excludable from employees' gross income to the extent provided in Code section 128. The Plan will be interpreted and operated consistently with that intent, and the Employer will follow the Plan's terms.</p></section>
<section><h2><span>Art. 2</span>Definitions</h2><dl>
<dt>Account Beneficiary</dt><dd>The individual for whose benefit a Trump account is established.</dd>
<dt>Eligible Trump Account</dt><dd>A Trump account (Code section 530A) whose Account Beneficiary is (a) the Participant or a dependent of the Participant and (b) in his or her growth period, which ends on December 31 of the calendar year in which the Account Beneficiary turns 17.</dd>
<dt>HCE</dt><dd>A highly compensated employee under Code section 414(q). An NHCE is any other employee.</dd>
<dt>Participant</dt><dd>An employee who meets the eligibility requirements of Article 3.</dd>
<dt>Plan Year</dt><dd>${py[0].toUpperCase()+py.slice(1)}. The first Plan Year begins on ${eff}${d.py==='cal'?'':' and may be a short Plan Year'}.</dd>
<dt>Plan Administrator</dt><dd>${adm}, or another person the Employer appoints.</dd></dl></section>
<section><h2><span>Art. 3</span>Eligibility</h2><p>${d.elig==='all'?'Each employee of the Employer is eligible to participate on his or her date of hire':`Each employee becomes eligible on the first day of the payroll period after completing ${+d.months} month${+d.months>1?'s':''} of service`}, except the following, who are not eligible: ${excl.map((x,i)=>`(${String.fromCharCode(97+i)}) ${x}`).join('; ')}.</p><p>These classifications are intended to be reasonable, based on objective business criteria, and not to discriminate in favor of HCEs or their dependents.</p></section>
<section><h2><span>Art. 4</span>Contributions</h2><p>4.1 <b>Employer contributions.</b> ${contrib} Contributions are made ${timing}.</p>
<p>4.2 <b>Salary reduction.</b> ${d.sr?`A Participant may also elect to contribute by salary reduction under the Employer's separate section 125 cafeteria plan, but only to the Eligible Trump Account of a dependent and never to the Participant's own Trump account. ${unc('Requires a written cafeteria plan that lists this benefit.')}`:'The Plan does not permit contributions by salary reduction.'}</p>
<p>4.3 <b>Designation and certification.</b> To receive contributions, a Participant must designate each Eligible Trump Account in writing (paper or electronic) and certify (a) that the Account Beneficiary is the Participant or is expected to be the Participant's dependent for the Participant's taxable year in which the contribution is made, (b) the Account Beneficiary's date of birth, and (c) that the Participant knows of no facts that would make the Account Beneficiary ineligible to receive a contribution that calendar year. The Employer may rely on the certification unless it actually knows it is incorrect, but will separately use reasonable procedures to confirm that each designated account is a Trump account.</p>
<p>4.4 <b>Payment and trustee notice.</b> Contributions are paid directly to the trustee of the Eligible Trump Account, and the Employer will identify each payment to the trustee as a section 128 contribution. ${unc('Trustee procedures are still being set up by Treasury and account trustees.')}</p></section>
<section><h2><span>Art. 5</span>Limits</h2><p>The total of all contributions under this Plan (including any salary reduction) for a Participant in a calendar year may not exceed $2,500, as adjusted for inflation after 2027 under Code section 128(b). The limit applies per Participant, not per Account Beneficiary. If a contribution would exceed the limit, the excess will not be made. Contributions to any single Trump account also count toward that account's annual contribution limit ($5,000, as adjusted), and the Plan will not knowingly contribute above it.</p>
<p>Contributions excluded from income under Code section 128 remain wages for FICA and FUTA purposes and will be reported as required, including in box 12 of Form W-2 with code TA.</p></section>
<section><h2><span>Art. 6</span>Nondiscrimination</h2><p>The Plan is intended to satisfy the nondiscrimination requirements of Code section 128(c) and proposed Treasury Regulation section 1.128-3: (a) contributions and benefits will not discriminate in favor of HCEs or their dependents; (b) the Plan will benefit employees under a classification that does not discriminate in favor of HCEs or their dependents; and (c) the average contributions to NHCEs under all of the Employer's Trump account contribution programs will be at least 55 percent of the average contributions to HCEs. In applying (b) and (c), employees under age 21 who have not completed one year of service, and certain collectively bargained employees, are disregarded as permitted.${d.form==='pilot'?' Pilot Match Contributions are intended to qualify for the pilot match safe harbor for requirements (a) and (c); they remain subject to requirement (b).':''}</p>
<p>If the Plan fails a requirement for a Plan Year, the Employer will correct it as permitted, including by treating excess amounts as taxable income of affected HCEs on or before the Form W-2 deadline for that year.</p></section>
<section><h2><span>Art. 7</span>Administration</h2><p>The Plan Administrator is ${adm} (${ae}${ap?`, ${ap}`:''}). The Plan Administrator has authority to interpret the Plan, set reasonable procedures, keep records, and coordinate with the Employer's payroll provider (currently ${esc(d.payroll)}). The Plan Administrator will: (a) give all eligible employees reasonable notice of the Plan's availability and terms before they become Participants and when terms change; (b) furnish each Participant, on or before January 31, a written statement of section 128 contributions for the prior calendar year, which may be done on Form W-2; and (c) if an amount treated as a section 128 contribution is later found not to be excludable, correct the reporting and notify the affected employee and trustee.</p></section>
<section><h2><span>Art. 8</span>Amendment and termination</h2><p>The Employer may amend or end the Plan at any time by written action, including to comply with final regulations or other IRS guidance. No amendment may reduce a contribution already paid. Participants will be notified of any material change. If the Plan ends, contributions stop as of the date the Employer sets; amounts already in a Trump account belong to that account.</p></section>
<section><h2><span>Art. 9</span>General</h2><p>The Plan does not create a right to continued employment. The Employer does not guarantee any tax result or investment return. This Plan is governed by the Code and, to the extent not preempted, the laws of ${esc(d.state)||'the state in which the Employer is organized'}.</p></section>
<div class="sig"><div><span class="sl"></span><span class="mono small">${sign} · for ${N}</span></div><div><span class="sl"></span><span class="mono small">Date adopted</span></div></div>
<p class="pdis">Generated with Seedline (beta). A general template based on proposed regulations REG-101355-26 (Aug 11, 2026), which may change. Not legal or tax advice. Have a qualified advisor review before adoption. Not affiliated with the IRS.${owner?' Owners who are self-employed individuals can sponsor but can\u2019t participate.':''}</p>
</article>`;
 const notice=`<article class="paper notice" id="noticedoc">
<header class="phd"><div class="pmeta"><span class="mono small">Employee notice</span><span class="mono small">${N}</span></div>
<h1 class="ptitle">Your employer will add money to your family's Trump Account</h1><p class="psub">${PN} · effective ${eff}</p></header>
<div class="ngrid"><div class="nbig"><span class="mono small">${d.form==='emp'?'Per employee, per year':'Per eligible child, per year'}</span><b>${money(amt)}</b><span class="mono small">paid ${{annual:'once a year',quarterly:'quarterly',payroll:'each payday'}[d.timing]}</span></div>
<div><h3>Who can join</h3><p>${d.elig==='all'?'All employees, from day one':`Employees after ${+d.months} month${+d.months>1?'s':''} of service`}${excl.length>2?', with a few exclusions listed in the plan':''}. Owners who are self-employed for tax purposes can't take part.</p></div></div>
<h3>What it's for</h3><p>${d.form==='emp'?'A contribution to your own Trump Account or your child\u2019s':d.form==='child'?'A contribution to each of your children\u2019s Trump Accounts':'A match for children who receive the $1,000 federal pilot deposit (children born 2025–2028)'}. An account can receive contributions through December 31 of the year the account holder turns 17. Your total from us is capped at $2,500 a year, however many children you have.</p>
${d.sr?`<h3>Adding your own money</h3><p>You can also set aside pre-tax pay for your child's Trump Account through our cafeteria plan. This counts toward the same $2,500 yearly total.</p>`:''}
<h3>Taxes</h3><p>Up to $2,500 a year is not counted as income for federal income tax. It is still subject to Social Security and Medicare (FICA) tax, and it will appear in box 12 of your W-2 with code TA. By January 31 each year you'll get a statement of what we contributed.</p>
<h3>How to sign up</h3><ol class="nsteps"><li>Open a Trump Account for your child (or yourself, if eligible) and get the account details.</li><li>Fill out our designation form. You'll confirm the child is your dependent, give their date of birth, and confirm you know of no reason they can't receive a contribution.</li><li>Send it to ${adm} at ${ae}${ap?` or ${ap}`:''}.</li></ol>
<p class="pdis">This notice summarizes the plan. The written plan controls. The rules are based on proposed IRS regulations and may change. This isn't tax advice; talk to a tax professional about your situation.</p>
</article>`;
 const docs=document.getElementById('docs');docs.innerHTML=plan+notice;
 html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${PN}</title><style>${DOCCSS}</style></head><body>${plan}${notice}</body></html>`;
 document.getElementById('builder').hidden=true;document.querySelector('.phead').hidden=true;document.getElementById('out').hidden=false;window.scrollTo(0,0);
}
const DOCCSS=`body{font:15px/1.6 Georgia,serif;color:#0f2a1f;max-width:760px;margin:40px auto;padding:0 24px}.mono{font:11px monospace;text-transform:uppercase;letter-spacing:.06em}.pmeta{display:flex;justify-content:space-between;color:#b8502a}h1{font-weight:400;font-size:32px;line-height:1.1;margin:18px 0 6px}h2{font-size:18px;font-weight:500;border-top:1px solid #0f2a1f;padding-top:10px;margin:26px 0 8px}h2 span{display:block;font:11px monospace;color:#b8502a;text-transform:uppercase}dt{font-weight:bold}dd{margin:0 0 8px}.unc{display:block;font:12px sans-serif;color:#b8502a;margin-top:4px}.unc::before{content:"Note: "}.sig{display:flex;gap:40px;margin-top:48px}.sig>div{flex:1;display:grid;gap:6px}.sl{border-bottom:1px solid #0f2a1f;height:36px}.pdis{font-size:12px;color:#4d5f55;border-top:1px solid #ccc;margin-top:28px;padding-top:10px}.notice{page-break-before:always;margin-top:60px}.nbig b{display:block;font-size:40px;font-weight:400}.ngrid{display:grid;grid-template-columns:1fr 1.4fr;gap:24px;margin:20px 0}`;
document.getElementById('edit').onclick=()=>{document.getElementById('out').hidden=true;document.getElementById('builder').hidden=false;document.querySelector('.phead').hidden=false;show(0);};
document.getElementById('pdf').onclick=()=>window.print();
document.getElementById('dl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download='trump-account-contribution-plan.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
show(0);sync();
})();
