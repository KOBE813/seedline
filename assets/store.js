/* Seedline local store: everything stays in this browser's localStorage. */
const SL=(()=>{const K='seedline.v1';
const blank=()=>({v:1,clients:[]});
const load=()=>{try{const d=JSON.parse(localStorage.getItem(K));return d&&Array.isArray(d.clients)?d:blank()}catch(e){return blank()}};
const save=d=>localStorage.setItem(K,JSON.stringify(d));
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api={esc,load,save,uid,
 clients:()=>load().clients,
 get:id=>load().clients.find(c=>c.id===id),
 upsert(c){const d=load();if(!c.id)c.id=uid();c.status=c.status||{};c.updated=new Date().toISOString();const i=d.clients.findIndex(x=>x.id===c.id);if(i<0)d.clients.push(c);else d.clients[i]={...d.clients[i],...c};save(d);return c.id},
 patch(id,fn){const d=load();const c=d.clients.find(x=>x.id===id);if(!c)return;c.status=c.status||{};fn(c);c.updated=new Date().toISOString();save(d)},
 remove(id){const d=load();d.clients=d.clients.filter(c=>c.id!==id);save(d)},
 param:new URLSearchParams(location.search).get('client'),
 download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'application/json'}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)},
 /* data bar: export/import/clear */
 bar(el,onchange){if(!el)return;const n=load().clients.length;
  el.innerHTML=`<span class="dbdot"></span><p><b>Stored only on this device.</b> Your clients and answers live in this browser (localStorage). Nothing is sent to Seedline or anyone else. <span class="mono small">${n} client${n===1?'':'s'}</span></p><div class="dbbtns"><button type="button" class="tbtn" data-a="exp">Export JSON</button><label class="tbtn">Import JSON<input type="file" accept="application/json,.json" hidden></label><button type="button" class="tbtn warnb" data-a="clr">Clear data</button></div>`;
  el.querySelector('[data-a=exp]').onclick=()=>api.download(`seedline-data-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(load(),null,2));
  el.querySelector('input').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!d||!Array.isArray(d.clients))throw 0;const cur=load();const ids=new Set(cur.clients.map(c=>c.id));d.clients.forEach(c=>{if(c&&c.name){if(!c.id||ids.has(c.id))c.id=c.id&&ids.has(c.id)?c.id:uid();const i=cur.clients.findIndex(x=>x.id===c.id);if(i<0)cur.clients.push(c);else cur.clients[i]=c}});save(cur);api.bar(el,onchange);onchange&&onchange();api.toast(`Imported ${d.clients.length} client${d.clients.length===1?'':'s'}`)}catch(_){api.toast('That file isn\u2019t a Seedline export.')}})};
  el.querySelector('[data-a=clr]').onclick=()=>{if(confirm('Delete all Seedline data stored in this browser? Export first if you want a copy.')){localStorage.removeItem(K);api.bar(el,onchange);onchange&&onchange();api.toast('All local data cleared')}};},
 /* client picker */
 picker(el,onpick){if(!el)return;const cs=load().clients;const sel=api.param||'';
  el.innerHTML=`<label class="picker"><span class="mono small">Client</span><select><option value="">No client (one-off)</option>${cs.map(c=>`<option value="${esc(c.id)}"${c.id===sel?' selected':''}>${esc(c.name)}</option>`).join('')}</select></label><a class="link small2" href="../app/">Manage clients</a>`;
  const s=el.querySelector('select');s.onchange=()=>{const u=new URL(location.href);s.value?u.searchParams.set('client',s.value):u.searchParams.delete('client');history.replaceState(null,'',u);api.param=s.value||null;onpick&&onpick(s.value?api.get(s.value):null)};
  if(sel&&api.get(sel))onpick&&onpick(api.get(sel));},
 toast(msg){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=msg;t.className='on';clearTimeout(t._h);t._h=setTimeout(()=>t.className='',2600)}
};return api})();
