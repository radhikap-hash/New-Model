/* Read-only visual workspace. No source data mutations or write requests. */
(() => {
  const ui = {sectors:[], project:'', billing:'', month:'', employee:'', role:''};
  const norm = value => String(value ?? '').trim().toLowerCase();
  const sectorName = a => SECNAME[SECID[a.sector]] || a.sector || 'Not assigned';
  const bill = a => String(a.billed || 'Not set');
  const selected = () => ALLOCS.filter(a => (!ui.sectors.length || ui.sectors.includes(sectorName(a))) && (!ui.project || a.project === ui.project) && (!ui.billing || bill(a) === ui.billing));
  const unique = as => [...new Set(as.map(a=>a.emp))].map(id=>PMAP[id]).filter(Boolean);
  const color = status => BS.find(b=>norm(b.k)===norm(status))?.c || '#929ca8';
  const monthKey = value => {
    const s=String(value || '');
    if (/^\d{4}-\d{2}(?:$|[-T])/.test(s)) return s.slice(0,7);
    return s; // Preserve unknown formats instead of guessing locale/date interpretation.
  };
  const badge = value => `<span class="dw-status"><i style="background:${color(value)}"></i>${esc(value)}</span>`;
  const dots = as => `<div class="dw-dots" aria-label="${as.length} allocations">${as.map(a=>`<i style="background:${color(bill(a))}" title="${esc(bill(a))}"></i>`).join('')}</div>`;
  const styles=document.createElement('style');
  styles.textContent=`
    body{background:#f5f7fa}#main{max-width:1180px} .dw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:20px 0}.dw-cube{background:#fff;border:1px solid #dce3ec;border-radius:12px;padding:19px;text-align:left;min-height:118px;display:flex;flex-direction:column;gap:12px;justify-content:space-between;color:inherit;font:inherit;cursor:pointer}.dw-cube[aria-pressed=true]{background:#edf2fa;border-color:#778ca9}.dw-cube strong{font-size:16px}.dw-sub{color:#617187;font-size:12px}.dw-dots{display:flex;gap:4px;flex-wrap:wrap}.dw-dots i,.dw-status i{width:10px;height:10px;border-radius:2px;display:inline-block}.dw-status{display:inline-flex;gap:7px;align-items:center;white-space:nowrap;font-size:12px}.dw-panel{background:#fff;border:1px solid #dce3ec;border-radius:12px;padding:22px;margin:18px 0}.dw-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:16px 0}.dw-controls label{font-size:12px;color:#617187;display:grid;gap:5px}.dw-controls select,.dw-controls input{background:#fff;border:1px solid #dce3ec;padding:9px;border-radius:7px;color:#24354a;max-width:100%}.dw-table{overflow-x:auto}.dw-table table{width:100%;border-collapse:collapse;font-size:13px}.dw-table th,.dw-table td{padding:12px 9px;text-align:left;border-bottom:1px solid #e4e9ef;vertical-align:top}.dw-table th{color:#617187;font-weight:500;font-size:12px}.dw-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.dw-heading h3{margin:0}.dw-org-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:18px 0}.dw-org-stat{background:#f6f8fb;border:1px solid #e0e6ee;border-radius:10px;padding:14px}.dw-org-stat strong{display:block;font-size:24px;margin-bottom:4px}.dw-org-map{display:grid;gap:18px}.dw-org-unit{border:1px solid #dce3ec;border-radius:12px;background:#f8fafc;overflow:hidden}.dw-org-unit>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 16px;background:#eef3f8;cursor:pointer;font-weight:600}.dw-org-unit>summary span{font-size:12px;color:#617187;font-weight:400}.dw-org-canvas{overflow-x:auto;padding:20px 14px 24px}.dw-org-branch{display:flex;flex-direction:column;align-items:center;min-width:180px;position:relative}.dw-org-children{display:flex;align-items:flex-start;justify-content:center;gap:16px;min-width:max-content;position:relative;padding-top:24px}.dw-org-children:before{content:'';position:absolute;top:0;left:50%;height:16px;border-left:2px solid #becbd9}.dw-org-children>.dw-org-branch:before{content:'';position:absolute;top:-8px;left:0;right:0;border-top:2px solid #becbd9}.dw-org-children>.dw-org-branch:first-child:before{left:50%}.dw-org-children>.dw-org-branch:last-child:before{right:50%}.dw-org-children>.dw-org-branch:only-child:before{left:50%;right:50%}.dw-org-roots{padding-top:0}.dw-org-roots:before,.dw-org-roots>.dw-org-branch:before{display:none}.dw-org-node{width:176px;min-height:112px;background:#fff;border:1px solid #d7e0e9;border-top:4px solid var(--bill,#929ca8);border-radius:10px;padding:12px;box-shadow:0 3px 10px rgba(31,50,73,.06);text-align:left}.dw-org-node.dw-org-lead{width:210px;background:#243f60;color:#fff;border-color:#243f60}.dw-org-node.dw-org-lead .dw-sub{color:#d4dfeb}.dw-org-person{display:flex;gap:9px;align-items:center;margin-bottom:9px}.dw-org-avatar{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:#eaf0f6;color:#284866;font-weight:700;font-size:12px}.dw-org-lead .dw-org-avatar{background:#fff;color:#243f60}.dw-org-name{border:0;background:none;color:inherit;font:inherit;font-weight:650;text-align:left;padding:0;cursor:pointer}.dw-org-meta{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.dw-org-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:999px;background:#edf2f7;color:#52657a;font-size:10px}.dw-org-lead .dw-org-pill{background:rgba(255,255,255,.14);color:#fff}.dw-org-pill i{width:7px;height:7px;border-radius:50%}.dw-org-alert{border-top-color:#d58c30;background:#fffaf1}.dw-score{display:inline-block;background:#edf2f7;padding:4px 8px;border-radius:5px}.dw-history{display:flex;gap:10px;flex-wrap:wrap}.dw-history button{padding:12px;border:1px solid #dce3ec;background:#fff;border-radius:7px;cursor:pointer}.dw-note{padding:13px;background:#edf2f8;border-radius:8px;font-size:12px;margin:12px 0}.dw-overview{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.dw-overview strong{font-size:29px}.dw-projects{margin-top:20px}.dw-scope{display:flex;gap:10px;flex-wrap:wrap}.dw-scope label{display:flex;gap:5px;align-items:center}.dw-legend{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}.dw-empty{padding:25px;color:#617187}@media(max-width:700px){.dw-panel{padding:12px}.dw-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dw-overview{gap:6px}.dw-cube{padding:13px;min-height:100px}.dw-org-summary{grid-template-columns:1fr}.dw-org-unit>summary{align-items:flex-start;flex-direction:column}.dw-org-canvas{padding:16px 8px 20px}.dw-org-node{width:158px}.dw-org-node.dw-org-lead{width:176px}.dw-org-children{gap:10px}}`;
  document.head.appendChild(styles);
  VIEWS.splice(0,VIEWS.length,...[{id:'overview',label:'Overview'},{id:'sectors',label:'Sectors'},{id:'reporting',label:'Reporting structure'},{id:'available',label:'Available people'},{id:'kpi',label:'KPI reviews'}]);

  function sectorCubes(){
    const names=[...new Set([...SECTORS.map(s=>s.name),...ALLOCS.map(sectorName)])];
    return `<div class="dw-grid">${names.map(name=>{const as=ALLOCS.filter(a=>sectorName(a)===name);return `<button class="dw-cube" data-dw-sector="${esc(name)}"><strong>${esc(name)}</strong>${dots(as)}<span class="dw-sub">${unique(as).length} people · ${as.length} allocations</span></button>`;}).join('')}</div>`;
  }
  function scope(){
    const names=[...new Set([...SECTORS.map(s=>s.name),...ALLOCS.map(sectorName)])];
    const statuses=[...new Set(ALLOCS.map(bill))].sort();
    return `<div class="dw-heading"><h2 class="view">${esc(VIEWS.find(v=>v.id===state.view)?.label || 'Sectors')}</h2><button class="back" data-dw-reset>All sectors</button></div><p class="sub">${esc(ui.sectors.join(' + '))}${ui.project?' / '+esc(ui.project):' / All projects'}</p><details><summary>Sector group & billing filters</summary><div class="dw-scope">${names.map(s=>`<label><input type="checkbox" data-dw-group="${esc(s)}" ${ui.sectors.includes(s)?'checked':''}>${esc(s)}</label>`).join('')}</div><div class="dw-controls"><label>Billing status<select data-dw-billing><option value="">All statuses</option>${statuses.map(s=>`<option ${ui.billing===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label></div></details>`;
  }
  function projects(){
    const as=ALLOCS.filter(a=>ui.sectors.includes(sectorName(a))&&(!ui.billing||bill(a)===ui.billing));
    const names=[...new Set(as.map(a=>a.project || 'Unassigned'))].sort();
    return `<div class="dw-grid dw-projects"><button class="dw-cube" data-dw-project="" aria-pressed="${!ui.project}"><strong>All projects</strong><span class="dw-sub">${unique(as).length} people</span></button>${names.map(p=>{const team=as.filter(a=>(a.project||'Unassigned')===p);return `<button class="dw-cube" data-dw-project="${esc(p)}" aria-pressed="${ui.project===p}"><strong>${esc(p)}</strong>${dots(team)}<span class="dw-sub">${unique(team).length} people</span></button>`;}).join('')}</div><div class="dw-legend">${[...new Set(as.map(bill))].map(badge).join('')}</div><div class="dw-sub">One square = one allocation. People totals count each employee once.</div>`;
  }
  function teamTable(as){
    return `<div class="dw-table"><table><thead><tr><th>Name / ID</th><th>Role</th><th>Experience (as recorded)</th><th>Billing</th><th>Skill</th><th>Recorded lead</th></tr></thead><tbody>${unique(as).map(p=>`<tr><td><button class="person-link" data-person="${esc(p.id)}">${esc(p.name)}</button><div class="dw-sub">${esc(p.id)}</div></td><td>${esc(p.designation||p.role||'Not recorded')}</td><td>${esc(p.yoe??'Not recorded')}</td><td>${[...new Set(as.filter(a=>a.emp===p.id).map(bill))].map(badge).join('<br>')}</td><td>${esc(p.domain||'Not recorded')}</td><td>${esc(p.lead||'Not recorded')}</td></tr>`).join('')}</tbody></table></div>${!as.length?'<div class="dw-empty">No people match these filters.</div>':''}`;
  }
  function reporting(as){
    const members=unique(as), memberIds=new Set(members.map(p=>p.id)), names=new Map();
    const cleanName=value=>norm(value).replace(/[^a-z0-9]+/g,' ').trim();
    PEOPLE.forEach(p=>{const k=cleanName(p.name);names.set(k,[...(names.get(k)||[]),p]);});
    const resolveLead=value=>{
      const key=cleanName(value), exact=names.get(key)||[];
      if(exact.length===1)return exact[0];
      const prefixes=key?PEOPLE.filter(p=>cleanName(p.name).startsWith(key+' ')):[];
      return prefixes.length===1?prefixes[0]:null;
    };
    const groups=new Map(), parentOf=new Map(), unresolved=[];
    members.forEach(p=>{
      const lead=String(p.lead||'').trim(), parent=resolveLead(lead);
      parentOf.set(p.id,parent?.id||'');
      if(!parent&&lead)unresolved.push(p);
      const key=parent?.id||'external:'+String(lead||'Lead not recorded');
      if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);
    });
    const initials=name=>String(name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
    const personAllocations=p=>as.filter(a=>a.emp===p.id);
    const personCard=(p,lead=false,alert=false)=>{
      const allocations=personAllocations(p), statuses=[...new Set(allocations.map(bill))], projects=[...new Set(allocations.map(a=>a.project||'Unassigned'))];
      const topColor=statuses.length?color(statuses[0]):'#929ca8';
      return `<article class="dw-org-node ${lead?'dw-org-lead':''} ${alert?'dw-org-alert':''}" style="--bill:${topColor}"><div class="dw-org-person"><span class="dw-org-avatar">${esc(initials(p.name))}</span><div><button class="dw-org-name" data-person="${esc(p.id)}">${esc(p.name)}</button><div class="dw-sub">${esc(p.designation||p.role||'Role not recorded')}</div></div></div><div class="dw-org-meta">${statuses.map(s=>`<span class="dw-org-pill"><i style="background:${color(s)}"></i>${esc(s)}</span>`).join('')||'<span class="dw-org-pill">Billing not set</span>'}${projects.slice(0,2).map(x=>`<span class="dw-org-pill">${esc(x)}</span>`).join('')}${projects.length>2?`<span class="dw-org-pill">+${projects.length-2} projects</span>`:''}</div></article>`;
    };
    const seen=new Set();
    function branch(p,path=new Set()){
      if(path.has(p.id))return `<div class="dw-org-branch">${personCard(p,false,true)}<div class="dw-sub">Reporting loop flagged</div></div>`;
      if(seen.has(p.id))return '';
      seen.add(p.id);const next=new Set(path);next.add(p.id);const kids=(groups.get(p.id)||[]).filter(x=>memberIds.has(x.id));
      return `<div class="dw-org-branch">${personCard(p,kids.length>0)}${kids.length?`<div class="dw-org-children">${kids.map(c=>branch(c,next)).join('')}</div>`:''}</div>`;
    }
    const rootGroups=new Map();
    for(const p of members)if(!memberIds.has(parentOf.get(p.id))){
      const parentId=parentOf.get(p.id), key=parentId||'external:'+String(p.lead||'Top level');
      if(!rootGroups.has(key))rootGroups.set(key,[]);rootGroups.get(key).push(p);
    }
    function subtreeIds(p,path=new Set()){
      if(path.has(p.id))return new Set([p.id]);
      const next=new Set(path);next.add(p.id);const ids=new Set([p.id]);
      for(const kid of groups.get(p.id)||[])if(memberIds.has(kid.id))for(const id of subtreeIds(kid,next))ids.add(id);
      return ids;
    }
    let html=[...rootGroups].map(([key,roots])=>{
      const parentId=key.startsWith('external:')?'':key, parent=parentId?PMAP[parentId]:null;
      const label=parent?.name||key.slice(9), ids=new Set();roots.forEach(root=>subtreeIds(root).forEach(id=>ids.add(id)));
      const trees=roots.map(root=>branch(root)).join('');
      return `<details class="dw-org-unit" open><summary>${esc(label)}<span>${ids.size} ${ids.size===1?'person':'people'} shown</span></summary><div class="dw-org-canvas">${roots.length>1?`<div class="dw-org-children dw-org-roots">${trees}</div>`:trees}</div></details>`;
    }).join('');
    const left=members.filter(p=>!seen.has(p.id));
    if(left.length)html+=`<details class="dw-org-unit" open><summary>Relationships needing review<span>${left.length} people</span></summary><div class="dw-org-canvas"><div class="dw-org-children">${left.map(p=>branch(p)).join('')}</div></div></details>`;
    const directLeads=members.filter(p=>(groups.get(p.id)||[]).some(c=>memberIds.has(c.id))).length;
    return `<section class="dw-panel"><div class="dw-heading"><div><h3>Team reporting map</h3><p class="dw-sub">Read top to bottom: lead, then direct reports. Click any person for full details.</p></div><div class="dw-legend">${[...new Set(as.map(bill))].map(badge).join('')}</div></div><div class="dw-org-summary"><div class="dw-org-stat"><strong>${members.length}</strong><span class="dw-sub">People in this view</span></div><div class="dw-org-stat"><strong>${directLeads}</strong><span class="dw-sub">People with direct reports</span></div><div class="dw-org-stat"><strong>${unresolved.length}</strong><span class="dw-sub">Lead names needing review</span></div></div><div class="dw-org-map">${html||'<div class="dw-empty">No reporting data in this selection.</div>'}</div><p class="dw-sub" style="margin-top:16px">Connections use only the recorded Reports To field. An outside lead can appear as a team heading even when that person is outside the current sector or project filter.</p></section>`;
  }
  function resultRows(p){return KPI_RESULTS.filter(r=>String(r.emp)===p.id&&ui.sectors.includes(r.sector)&&(!ui.project||r.project===ui.project)&&r.project&&r.role);}
  function scopedResults(){return KPI_RESULTS.filter(r=>ui.sectors.includes(r.sector)&&(!ui.project||r.project===ui.project));}
  function kpi(as){
    const ps=unique(as), periods=[...new Set(scopedResults().map(r=>monthKey(r.month)).filter(Boolean))].sort().reverse();
    if(!periods.includes(ui.month))ui.month=periods[0]||'';
    const controls=`<div class="dw-controls"><label>Review month<select data-dw-month><option value="">${periods.length?'Choose period':'No recorded reviews'}</option>${periods.map(m=>`<option ${ui.month===m?'selected':''}>${esc(m)}</option>`).join('')}</select></label></div>`;
    if(!ui.employee)return `<section class="dw-panel"><h3>Team reviews</h3>${controls}<p class="dw-sub">Select a person to examine each project/role review and its history. Missing results are not zero.</p><div class="dw-table"><table><thead><tr><th>Person</th><th>Recorded role</th><th>Reviews this period</th><th>Recorded scores / 5</th></tr></thead><tbody>${ps.map(p=>{const rs=resultRows(p).filter(r=>monthKey(r.month)===ui.month);return `<tr><td><button class="person-link" data-dw-employee="${esc(p.id)}">${esc(p.name)}</button></td><td>${esc(p.designation||'Not recorded')}</td><td>${rs.length||'Not assessed'}</td><td>${rs.length?rs.map(r=>`${esc(r.project)} / ${esc(r.role)}: ${esc(r.score??'Not scored')}`).join('<br>'):'—'}</td></tr>`;}).join('')}</tbody></table></div>${!ps.length?'<div class="dw-empty">No people in selection.</div>':''}</section>`;
    const p=ps.find(p=>p.id===ui.employee);if(!p){ui.employee='';return kpi(as);}
    const history=resultRows(p),contexts=[...new Set(history.map(r=>JSON.stringify([r.sector,r.project,r.role])))];
    if(!contexts.includes(ui.role))ui.role=contexts[0]||'';
    const context=ui.role?JSON.parse(ui.role):null;
    const rs=history.filter(r=>JSON.stringify([r.sector,r.project,r.role])===ui.role&&monthKey(r.month)===ui.month);
    const r=rs.length===1?rs[0]:null;
    const metrics=context?KPI_CATALOG[context[0]+'|'+context[2]]||[]:[];
    return `<section class="dw-panel"><button class="back" data-dw-team>← Team reviews</button><h3>${esc(p.name)}</h3>${controls}<div class="dw-controls"><label>Recorded sector / project / role<select data-dw-role>${contexts.length?contexts.map(c=>`<option value="${esc(c)}" ${c===ui.role?'selected':''}>${esc(JSON.parse(c).join(' / '))}</option>`).join(''):'<option>No scoped review recorded</option>'}</select></label></div>${rs.length>1?'<div class="dw-note">Multiple reviews have the same context and month. Resolve duplicates before using a final score.</div>':''}<p>Recorded score: <strong>${r?esc(r.score??'Not scored'):'Not assessed'}</strong></p><div class="dw-table"><table><thead><tr><th>Measure</th><th>Definition</th><th>Recorded actual</th></tr></thead><tbody>${metrics.map((k,i)=>`<tr><td>${esc(k.category||'KPI '+(i+1))}<br>${esc(k.name)}</td><td>${esc(k.measure)}</td><td>${esc(r?.actual?.[i]??'Not recorded')}</td></tr>`).join('')}</tbody></table></div><div class="dw-note">Current catalogue definitions are reference only. Historical targets, per-measure scores, evidence and reviewer notes are not supplied by this feed; this dashboard does not recalculate old scores using current targets.</div><h3>Review history</h3><div class="dw-history">${history.filter(r=>JSON.stringify([r.sector,r.project,r.role])===ui.role).sort((a,b)=>monthKey(b.month).localeCompare(monthKey(a.month))).map(r=>`<button data-dw-period="${esc(monthKey(r.month))}">${esc(monthKey(r.month))}<br>${esc(r.score??'Not scored')} / 5</button>`).join('')||'<p class="dw-sub">No reviews recorded for this person in the selected scope.</p>'}</div></section>`;
  }
  function overview(){return `<h2 class="view">People overview</h2><p class="lede">Choose a sector, then a project, then a person.</p><div class="dw-overview"><div class="dw-cube"><strong>${PEOPLE.length}</strong>People</div><div class="dw-cube"><strong>${ALLOCS.length}</strong>Allocations</div><button class="dw-cube" data-view="available"><strong>${unique(ALLOCS.filter(a=>/^(unassigned|need to assign)$/i.test(a.project||'Unassigned')||a.sector==='Need to Assign')).length}</strong>Without a project</button></div>${sectorCubes()}`;}
  function workspace(){
    if(state.view==='overview')return overview();
    if(!ui.sectors.length)return `<h2 class="view">${esc(VIEWS.find(v=>v.id===state.view)?.label||'Sectors')}</h2><p class="sub">Choose a sector</p>${sectorCubes()}`;
    const as=selected();let body;
    if(state.view==='reporting')body=reporting(as);
    else if(state.view==='kpi')body=kpi(as);
    else if(state.view==='available'){const pool=as.filter(a=>/^(unassigned|need to assign)$/i.test(a.project||'Unassigned')||a.sector==='Need to Assign');body=`<section class="dw-panel"><h3>${unique(pool).length} people without a project</h3><p class="dw-sub">Unassigned does not establish deployment availability. Confirm billed people and other commitments before assigning.</p>${teamTable(pool)}</section>`;}
    else body=`<section class="dw-panel"><h3>${esc(ui.project||'All projects')} · ${unique(as).length} people</h3>${teamTable(as)}</section>`;
    return scope()+(state.view==='available'?'':projects())+body;
  }
  render = function(){
    // Compatibility with existing links, refresh and person-detail navigation.
    if(SECNAME[state.view]){ui.sectors=[SECNAME[state.view]];state.view='sectors';}
    if(state.view==='projects')state.view='sectors';if(state.view==='assign')state.view='available';
    if(state.project){const [id,...rest]=decodeURIComponent(state.project).split('|');ui.sectors=[SECNAME[id]||id];ui.project=rest.join('|');state.project=null;state.view='sectors';}
    $('#rail').innerHTML=VIEWS.map(v=>`<button data-view="${v.id}" aria-current="${state.view===v.id}">${esc(v.label)}</button>`).join('');
    $('#main').innerHTML=state.person!==null?renderPerson(state.person):state.people!==null?renderPeopleList(state.people):workspace();
  };
  document.addEventListener('click',e=>{const b=e.target.closest('[data-dw-sector],[data-dw-project],[data-dw-reset],[data-dw-employee],[data-dw-team],[data-dw-period]');if(!b)return;
    if(b.hasAttribute('data-dw-sector')){ui.sectors=[b.dataset.dwSector];ui.project='';if(state.view==='overview')state.view='sectors';}
    if(b.hasAttribute('data-dw-project'))ui.project=b.dataset.dwProject;
    if(b.hasAttribute('data-dw-reset')){ui.sectors=[];ui.project='';ui.billing='';}
    ui.employee=b.dataset.dwEmployee||'';
    if(b.hasAttribute('data-dw-period')){ui.month=b.dataset.dwPeriod;ui.employee=state.dwLastEmployee||'';}
    if(b.hasAttribute('data-dw-employee'))state.dwLastEmployee=ui.employee;
    render();
  });
  document.addEventListener('change',e=>{const el=e.target;
    if(el.hasAttribute('data-dw-group')){ui.sectors=el.checked?[...new Set([...ui.sectors,el.dataset.dwGroup])]:ui.sectors.filter(s=>s!==el.dataset.dwGroup);ui.project='';ui.employee='';}
    else if(el.hasAttribute('data-dw-billing')){ui.billing=el.value;ui.employee='';}
    else if(el.hasAttribute('data-dw-month'))ui.month=el.value;
    else if(el.hasAttribute('data-dw-role'))ui.role=el.value;
    else return;render();
  });
  render();
})();
