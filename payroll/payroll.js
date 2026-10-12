(()=>{const E=SL.esc,$=id=>document.getElementById(id);let client=null,cur='qb';
const P={
qb:{n:'QuickBooks Payroll',s:'ok',st:'Supported',sum:'QuickBooks has a built-in Trump Account company contribution item that reports in W-2 box 12, code TA.',src:'QuickBooks help article',steps:[
 ['Create a Company Contribution payroll item and set its tax tracking type to “Trump Accounts”.','Per QuickBooks: this item is for the company contribution plus any allowed pre-tax employee deduction.'],
 ['Enter the annual maximum on each employee’s profile ($2,500 combined employer + pre-tax for 2026–2027).','QuickBooks says the limit must be added per employee and adjusted manually if it changes.'],
 ['Set up any extra employee money as an “Other After-Tax Deduction”, not the Trump Account item.','Only amounts within the $2,500 pre-tax limit go on the Trump Account item.'],
 ['Run a test payroll and confirm FICA and FUTA are still withheld on the contribution.','The proposed rules say section 128 contributions are still wages for FICA/FUTA. ⚑ Confirm QuickBooks’ tax setup matches.']]},
iris:{n:'IRIS Payroll Relief',s:'ok',st:'Supported (since July 4, 2026)',sum:'IRIS added “TRUMP Account – Employee (TA)” and “TRUMP Account – Employer (TA)” deduction types, with a child selector for up to five children per employee.',src:'IRIS help + June 23, 2026 release notes',steps:[
 ['In Employer Setup → Deductions, add “TRUMP Account – Employer (TA)” (and “– Employee (TA)” if you allow employee money).','Suggested names: “Trump Account – Employer 1” … matching “Child 1”.'],
 ['Assign deductions on each employee, one row per child, and enter the account number (or the child’s name until it’s known).','If only the employer contributes, IRIS says the employee deduction must still be active at $0.0000.'],
 ['Rely on IRIS’s caps but check them: $5,000 per child combined, $2,500 employer per employee.',''],
 ['⚑ Check the W-2 code before year end. IRIS’s release notes say box 12 code “TT”; the IRS instructions use code TA.','This looks like a typo in IRIS’s notes, but confirm with IRIS support.']]},
gusto:{n:'Gusto',s:'no',st:'Not supported for setup or funding',sum:'Gusto’s help center says it does not currently support setting up or funding Trump Account contributions. You’d contribute outside Gusto. Gusto says it’s working on W-2 reporting for outside contributions before year end.',src:'Gusto Help Center',steps:[
 ['Fund contributions outside Gusto, directly to each account’s trustee, and record every payment by employee and child.',''],
 ['Make sure FICA and FUTA are still paid on those amounts through payroll.','⚑ Gusto’s article says IRS guidance on FICA/FUTA hasn’t been issued; the Aug 2026 proposed rules say they apply. Ask your advisor how to run this in Gusto.'],
 ['Before year end, confirm Gusto can put the amounts in W-2 box 12, code TA, or plan a W-2 correction with your advisor.','Gusto: “We’re working on adding support for this kind of reporting before the end of the year.”']]},
adp:{n:'ADP',s:'mid',st:'Guidance published; setup steps not public',sum:'ADP’s SPARK article (Aug 2026) summarizes the proposed rules, including box 12 code TA and FICA/FUTA, but we found no public product setup instructions.',src:'ADP SPARK article',steps:[
 ['Ask your ADP rep how to set up a section 128 Trump Account contribution earning/deduction code in your ADP product (RUN, Workforce Now, etc.).','⚑ Not publicly documented as of Oct 12, 2026.'],
 ['Confirm the code is excluded from federal income tax, but included for FICA and FUTA, and maps to W-2 box 12 code TA.',''],
 ['Confirm whether ADP tracks the $2,500 per-employee cap across children, or track it yourself.','']]},
paychex:{n:'Paychex',s:'mid',st:'Unverified',sum:'We couldn’t find a public Paychex help article on Trump Account contributions as of Oct 12, 2026.',src:'No public source found',steps:[
 ['Ask your Paychex payroll specialist whether a Trump Account (section 128) contribution code is available.','⚑ Unverified. Don’t assume support.'],
 ['Confirm federal income tax exclusion, FICA/FUTA inclusion, and W-2 box 12 code TA.',''],
 ['If not supported, fund outside payroll and plan W-2 reporting with your advisor.','']]},
other:{n:'Other / in-house',s:'mid',st:'Check with your provider',sum:'Use this generic checklist with any payroll system or accountant-run payroll.',src:'Proposed regs + W-2 instructions',steps:[
 ['Create a separate pay code for section 128 employer contributions (and a separate one for any after-tax employee deductions).',''],
 ['Set it to: excluded from federal income tax up to $2,500 per employee; subject to FICA and FUTA; W-2 box 12 code TA.',''],
 ['Track the $2,500 at the employee level (across all children) and $5,000 at the account level.','']]}};
const COMMON=[['Before you start',[
 ['Adopt the written plan before contributing.','The plan must be followed in operation. <a class="link" href="../plan/">Plan builder →</a>'],
 ['Give all eligible employees reasonable notice of the plan and its terms.','⚑ The rules don’t set a specific number of days. Send it before sign-ups open.'],
 ['Collect a signed sign-up and certification form for each account, and verify each account is a real, claimed Trump Account.','<a class="link" href="../enroll/">Sign-up form →</a>'],
 ['If employees can add pre-tax money: add it to a written cafeteria plan, dependents’ accounts only.','']]],
['Each payroll',[
 ['Pay contributions to the account trustee and identify each payment as a section 128 contribution.',''],
 ['Stop at $2,500 per employee for the calendar year (employer + pre-tax combined).','Amounts above aren’t excludable and must be treated as wages.']]],
['Year end',[
 ['Run the nondiscrimination tests; the 55% test is measured on the last day of the plan year.','<a class="link" href="../test/">Checker →</a>'],
 ['Report contributions in W-2 box 12, code TA.',''],
 ['Give each employee a written statement of contributions by January 31 (the W-2 can satisfy this).',''],
 ['If a test failed, include HCE excess in income by the W-2 deadline and send corrective notices.','']]]];
function render(){const p=P[cur];const done=(client&&client.payrollChecks&&client.payrollChecks[cur])||{};
 [...$('provs').children].forEach(b=>b.setAttribute('aria-selected',b.dataset.k===cur));
 $('status').innerHTML=`<div class="stcard"><span class="pill ${p.s==='ok'?'ok':p.s==='no'?'no':'mid'}">${p.st}</span><h3>${p.n}</h3><p>${p.sum}</p><p class="mono small">Source: ${p.src} · checked Oct 12, 2026</p></div>`;
 const groups=[[p.n+' setup',p.steps],...COMMON];let i=0;
 $('list').innerHTML=`<header class="phd"><div class="pmeta"><span class="mono small">${client?E(client.name):'Payroll checklist'}</span><span class="mono small">${E(p.n)}</span></div><h1 class="ptitle">Trump Account payroll checklist</h1><div class="prog" id="prog"></div></header>`+groups.map(([h,items],g)=>`<section><h2><span>${String(g+1).padStart(2,'0')}</span>${E(h)}</h2><ul class="cl">${items.map(([t,s])=>{const k='i'+(i++);return `<li><label><input type="checkbox" data-k="${k}"${done[k]?' checked':''}><span>${t}${s?`<small>${s}</small>`:''}</span></label></li>`}).join('')}</ul></section>`).join('')+`<p class="pdis">Educational checklist from Seedline (beta), based on proposed regulations (Aug 2026) and provider help pages as of Oct 12, 2026. Not legal or tax advice. Not affiliated with the IRS or any payroll provider.</p>`;
 const boxes=[...$('list').querySelectorAll('input')];const upd=()=>{const n=boxes.filter(b=>b.checked).length;$('prog').innerHTML=`<span>${n} / ${boxes.length} done</span><span class="bar"><i style="width:${n/boxes.length*100}%"></i></span>`};upd();
 boxes.forEach(b=>b.onchange=()=>{upd();if(client){SL.patch(client.id,c=>{c.payrollProvider=cur;c.payrollChecks=c.payrollChecks||{};c.payrollChecks[cur]=c.payrollChecks[cur]||{};c.payrollChecks[cur][b.dataset.k]=b.checked;c.status.payroll=boxes.every(x=>x.checked)?'done':boxes.some(x=>x.checked)?'started':'';});client=SL.get(client.id)}});}
$('provs').innerHTML=Object.entries(P).map(([k,p])=>`<button type="button" role="tab" data-k="${k}"><i class="${p.s==='ok'?'ok':p.s==='no'?'no':''}"></i>${p.n.replace(' Payroll','').replace(' Payroll Relief','')}</button>`).join('');
$('provs').onclick=e=>{const b=e.target.closest('button');if(b){cur=b.dataset.k;render()}};
const map={'QuickBooks Payroll':'qb',Gusto:'gusto',ADP:'adp',Paychex:'paychex'};
const pick=c=>{client=c;if(c){const pp=c.payrollProvider||map[c.payroll]||(/IRIS/i.test(c.payroll||'')?'iris':null);if(pp)cur=pp}render()};
SL.bar($('databar'),()=>SL.picker($('pick'),pick));SL.picker($('pick'),pick);render();
})();
