/* BERTH.A RC203 — Kids · Coleção 02 Oceano
   Adiciona a segunda coleção preservando a Coleção 01 Neblina.
   6 pets · 5 acessórios por pet · paleta própria da coleção.
*/
(function(){
  const STORE=window.berthaHmlStorage||localStorage;
  const BASE_PANEL=window.r152KidsPanel;
  const BASE_WIRE=window.r152WireKids;
  const COLLECTION_KEY='bertha.kids.activeCollection';
  const OCEAN={
    key:'ocean',name:'Oceano',subtitle:'Coleção 2 de 6',capsule:'ocean_v1_capsule',
    palette:[['Oceano','#5eaee8'],['Aqua','#66d8d0'],['Coral','#ff9e9a'],['Areia','#f3d8a5'],['Menta','#97dfbf'],['Lilás','#a9a3eb']],
    pets:[
      {id:'ocean_v1_turtle',name:'Tartaruga',desc:'Paciente, curiosa e sempre pronta para explorar com calma.',img:'kids_oceano_turtle_rc203.jpg',acc:[
        ['ocean_turtle_head','Boné de Maré','head','kids_oceano_0_0.jpg'],['ocean_turtle_neck','Colar de Concha','neck','kids_oceano_0_1.jpg'],['ocean_turtle_eyes','Óculos de Mergulho','eyes','kids_oceano_0_2.jpg'],['ocean_turtle_back','Mochila Coral','back','kids_oceano_0_3.jpg'],['ocean_turtle_special','Concha da Maré','special','kids_oceano_1_0.jpg']]},
      {id:'ocean_v1_shark',name:'Tubarão',desc:'Ágil, corajoso e cheio de energia para novos desafios.',img:'kids_oceano_shark_rc203.jpg',acc:[
        ['ocean_shark_head','Boné Capitão','head','kids_oceano_0_0.jpg'],['ocean_shark_neck','Pingente de Concha','neck','kids_oceano_0_1.jpg'],['ocean_shark_eyes','Visor Azul','eyes','kids_oceano_0_2.jpg'],['ocean_shark_back','Mochila Corrente','back','kids_oceano_0_3.jpg'],['ocean_shark_special','Estrela do Abismo','special','kids_oceano_1_3.jpg']]},
      {id:'ocean_v1_dolphin',name:'Golfinho',desc:'Brincalhão, atento e ótimo companheiro para descobrir caminhos.',img:'kids_oceano_dolphin_rc203.jpg',acc:[
        ['ocean_dolphin_head','Boné de Onda','head','kids_oceano_0_0.jpg'],['ocean_dolphin_neck','Pingente Bolha','neck','kids_oceano_0_1.jpg'],['ocean_dolphin_eyes','Óculos Oceano','eyes','kids_oceano_0_2.jpg'],['ocean_dolphin_back','Mochila Salto','back','kids_oceano_0_3.jpg'],['ocean_dolphin_special','Insígnia da Maré','special','kids_oceano_1_2.jpg']]},
      {id:'ocean_v1_octopus',name:'Polvo',desc:'Criativo, divertido e cheio de jeitos diferentes de resolver tudo.',img:'kids_oceano_octopus_rc203.jpg',acc:[
        ['ocean_octopus_head','Chapéu Náutico','head','kids_oceano_0_0.jpg'],['ocean_octopus_neck','Colar Pérola','neck','kids_oceano_0_1.jpg'],['ocean_octopus_eyes','Lentes Marinhas','eyes','kids_oceano_0_2.jpg'],['ocean_octopus_back','Bolsa de Maré','back','kids_oceano_0_3.jpg'],['ocean_octopus_special','Concha Mágica','special','kids_oceano_1_0.jpg']]},
      {id:'ocean_v1_whale',name:'Baleia',desc:'Tranquila, forte e constante, mesmo nas jornadas mais longas.',img:'kids_oceano_whale_rc203.jpg',acc:[
        ['ocean_whale_head','Touca de Onda','head','kids_oceano_0_0.jpg'],['ocean_whale_neck','Pingente Azul','neck','kids_oceano_0_1.jpg'],['ocean_whale_eyes','Óculos Profundos','eyes','kids_oceano_0_2.jpg'],['ocean_whale_back','Mochila Oceano','back','kids_oceano_0_3.jpg'],['ocean_whale_special','Medalha Oceano','special','kids_oceano_1_2.jpg']]},
      {id:'ocean_v1_clownfish',name:'Peixe-palhaço',desc:'Alegre, vibrante e sempre trazendo movimento para a coleção.',img:'kids_oceano_clownfish_rc203.jpg',acc:[
        ['ocean_clownfish_head','Boné Coral','head','kids_oceano_0_0.jpg'],['ocean_clownfish_neck','Colar de Recife','neck','kids_oceano_0_1.jpg'],['ocean_clownfish_eyes','Óculos de Recife','eyes','kids_oceano_0_2.jpg'],['ocean_clownfish_back','Mochila Coral','back','kids_oceano_0_3.jpg'],['ocean_clownfish_special','Estrela do Recife','special','kids_oceano_1_3.jpg']]}
    ]
  };
  const PET_MAP=Object.fromEntries(OCEAN.pets.map(p=>[p.id,p]));
  const ACC_MAP={};OCEAN.pets.forEach(p=>p.acc.forEach(a=>ACC_MAP[a[0]]={id:a[0],name:a[1],type:a[2],file:a[3],pet:p.id}));
  const ACC_TYPES={head:'Cabeça',neck:'Pescoço',eyes:'Olhos',back:'Corpo / costas',special:'Especial'};
  function esc(v){return typeof r147esc==='function'?r147esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function active(){return STORE.getItem(COLLECTION_KEY)||'mist'}
  function setActive(k){STORE.setItem(COLLECTION_KEY,k)}
  function petImg(id){const p=PET_MAP[id];return p?`<span class="r197-art r203-ocean-art"><img src="./${p.img}?v=203" alt="" aria-hidden="true"></span>`:''}
  function accImg(id){const a=ACC_MAP[id];return a?`<span class="r197-art r203-ocean-acc"><img src="./${a.file}?v=203" alt="" aria-hidden="true"></span>`:''}
  function nav(){return `<div class="r203-collection-switch" role="tablist" aria-label="Coleções Kids"><button type="button" data-r203collection="mist" class="${active()==='mist'?'active':''}">01 · Neblina</button><button type="button" data-r203collection="ocean" class="${active()==='ocean'?'active':''}">02 · Oceano</button></div>`}
  function draftKey(mid){return `bertha.kids.oceanDraft.${mid}`}
  function getDraft(mid){try{return JSON.parse(STORE.getItem(draftKey(mid))||'null')}catch(e){return null}}
  function saveDraft(mid,d){STORE.setItem(draftKey(mid),JSON.stringify(d))}
  function oceanCycle(mid){let d=getDraft(mid);if(!d||!PET_MAP[d.pet])d={number:1,theme:'ocean',pet:OCEAN.pets[0].id,pointsPerStep:20,medalsPerAccessory:3};d.accessories=PET_MAP[d.pet].acc.map(a=>a[0]);saveDraft(mid,d);return d}
  function renderOcean(mid){
    const kids=(loadSatellites().members||[]).filter(m=>m.status!=='removed'&&m.role==='kids');
    const member=kids.find(k=>String(k.id)===String(mid))||kids[0];
    if(!member)return '<section class="r147-card"><div class="sat-empty">Cadastre um satélite como Kids para configurar um Ciclo de Progressão.</div></section>';
    const c=oceanCycle(member.id), p=loadKidsProgress()[member.id]||{lifetime:0,season:0,log:[]};
    const units=Math.floor((+p.lifetime||0)/Math.max(1,+c.pointsPerStep||20)),idx=Math.min(5,units),after=Math.max(0,units-6),unlocked=Math.min(5,Math.floor(after/Math.max(1,+c.medalsPerAccessory||3)));
    const current=PET_MAP[c.pet]||OCEAN.pets[0];
    const trail=[['medal_bronze','Bronze'],['medal_silver','Prata'],['medal_gold','Ouro'],['trophy','Troféu'],['super_trophy','Super Troféu'],['ocean_v1_capsule','Cápsula']];
    const trailArt=(id)=>id==='ocean_v1_capsule'?`<span class="r203-capsule">◌</span>`:r147img(id);
    return `<section class="r197-kids-shell r203-ocean-shell">${nav()}
      <section class="r197-hero r203-ocean-hero"><div class="r197-top"><div><span class="r197-kicker">KIDS · ${OCEAN.subtitle.toUpperCase()}</span><h2>${esc(member.name)}</h2><p>${OCEAN.name} · Ciclo ${c.number}</p></div><select id="r152KidSel">${kids.map(k=>`<option value="${esc(k.id)}" ${String(k.id)===String(member.id)?'selected':''}>${esc(k.name)}</option>`).join('')}</select></div>
      <div class="r197-current"><div class="r197-current-art">${petImg(c.pet)}</div><div><span class="r197-label">COMPANHEIRO-ALVO</span><h3>${esc(current.name)}</h3><p>${esc(current.desc)}</p><div class="r197-stats"><span><small>Fase</small><b>${['Bronze','Prata','Ouro','Troféu','Super Troféu','Cápsula'][idx]}</b></span><span><small>Pontos</small><b>${+p.lifetime||0}</b></span><span><small>Acessórios</small><b>${unlocked}/5</b></span></div></div></div></section>
      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">TRILHA</span><h3>Do primeiro marco à cápsula</h3><p>Sem perda de pontos e sem ranking.</p></div></div><div class="r197-trail">${trail.map(([a,l],i)=>`<div class="r197-step ${i<idx?'done':''} ${i===idx?'current':''}"><span>${trailArt(a)}</span><b>${l}</b></div>`).join('')}</div><div class="r197-after"><b>Depois da cápsula</b><span>A cada ${c.medalsPerAccessory} medalhas, 1 acessório · ${unlocked}/5 liberados</span></div></section>
      <section class="r197-card"><div class="r197-head row"><div><span class="r197-kicker">COLEÇÃO 02</span><h3>Oceano</h3><p>6 pets · 5 acessórios por pet</p></div><span class="r197-count r203-ocean-count">6 pets</span></div><div class="r197-pets">${OCEAN.pets.map(pp=>`<button type="button" data-r203pet="${pp.id}" class="${pp.id===c.pet?'active':''}"><span class="r197-pet-art">${petImg(pp.id)}</span><strong>${esc(pp.name)}</strong><small>disponível</small></button>`).join('')}</div></section>
      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">KIT DO PET</span><h3>${esc(current.name)}</h3><p>5 itens da coleção Oceano para este companheiro.</p></div></div><div class="r197-acc-grid">${current.acc.map((a,i)=>`<label class="r197-acc ${i<unlocked?'unlocked':''}"><input type="checkbox" checked><span class="r197-acc-art">${accImg(a[0])}</span><strong>${esc(a[1])}</strong><small>${ACC_TYPES[a[2]]}</small><div class="r197-swatches">${OCEAN.palette.map(([n,cx],ci)=>`<i title="${n}" style="--sw:${cx}" class="${ci===0?'active':''}"></i>`).join('')}</div></label>`).join('')}</div></section>
      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">CONFIGURAÇÃO DO OWNER</span><h3>Ritmo do ciclo</h3><p>Parâmetros desta coleção.</p></div></div><div class="r197-settings"><label>Pontos por marco<input id="r203Pts" type="number" min="1" value="${c.pointsPerStep}"></label><label>Medalhas por acessório<input id="r203Medals" type="number" min="1" value="${c.medalsPerAccessory}"></label></div><button class="primary r197-save" id="r203SaveCycle">Salvar ciclo</button></section>
      <section class="r197-next"><span>Coleções</span><div><i>Neblina</i><i class="r203-on">Oceano</i><i>Espaço</i><i>Floresta</i><i>Solar</i><i>Coral</i></div></section>
    </section>`;
  }
  window.r152KidsPanel=function(mid){
    if(active()==='ocean')return renderOcean(mid);
    let html=BASE_PANEL(mid);
    return html.replace('<section class="r197-kids-shell">','<section class="r197-kids-shell">'+nav());
  };
  window.r152WireKids=function(){
    document.querySelectorAll('[data-r203collection]').forEach(b=>b.onclick=()=>{setActive(b.dataset.r203collection);renderRewardsRC152('kids')});
    if(active()!=='ocean'){BASE_WIRE();document.querySelectorAll('[data-r203collection]').forEach(b=>b.onclick=()=>{setActive(b.dataset.r203collection);renderRewardsRC152('kids')});return;}
    const sel=document.querySelector('#r152KidSel');if(!sel)return;
    sel.onchange=()=>{STORE.setItem('bertha.rewards.selected.kid',sel.value);renderRewardsRC152('kids')};
    document.querySelectorAll('[data-r203pet]').forEach(b=>b.onclick=()=>{const d=oceanCycle(sel.value);d.pet=b.dataset.r203pet;saveDraft(sel.value,d);renderRewardsRC152('kids')});
    document.querySelector('#r203SaveCycle')?.addEventListener('click',e=>{const d=oceanCycle(sel.value);d.pointsPerStep=Math.max(1,+document.querySelector('#r203Pts').value||20);d.medalsPerAccessory=Math.max(1,+document.querySelector('#r203Medals').value||3);saveDraft(sel.value,d);e.currentTarget.textContent='Salvo';setTimeout(()=>e.currentTarget.textContent='Salvar ciclo',800)});
  };
  const st=document.createElement('style');st.id='rc203-kids-oceano';st.textContent=`
    .r203-collection-switch{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 2px 0}.r203-collection-switch button{border:1px solid rgba(100,128,151,.12);background:#fffdf9;border-radius:999px;padding:9px 13px;color:#7a7680;font-size:10px;font-weight:600;white-space:nowrap}.r203-collection-switch button.active{background:linear-gradient(135deg,#dff5fb,#d9f5ef 48%,#fff0d8);color:#486775;box-shadow:0 0 0 1px rgba(94,174,232,.18)}
    .r203-ocean-hero{background:radial-gradient(circle at 16% 18%,rgba(102,216,208,.28),transparent 34%),radial-gradient(circle at 83% 22%,rgba(94,174,232,.26),transparent 34%),radial-gradient(circle at 75% 86%,rgba(255,158,154,.22),transparent 38%),linear-gradient(145deg,#effbfb,#f2f8ff 48%,#fff8e9)!important}.r203-ocean-count{background:linear-gradient(135deg,#d8f4f0,#dbeeff 52%,#ffe7dd)!important;color:#4f7482!important}
    .r203-ocean-art,.r203-ocean-acc{width:100%;height:100%;display:grid;place-items:center}.r203-ocean-art img,.r203-ocean-acc img{width:100%;height:100%;object-fit:contain;display:block;border-radius:14px}.r203-ocean-shell .r197-pet-art{padding:5px!important;background:linear-gradient(145deg,#f2fbfa,#f2f7ff 52%,#fff7e9)!important}.r203-ocean-shell .r197-pet-art .r197-art{padding:0!important}.r203-ocean-shell .r197-acc-art{width:108px!important;height:108px!important}.r203-ocean-shell .r197-acc-art img{filter:saturate(1.08) contrast(1.02)}.r203-capsule{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#68d9d0,#7cbcff 48%,#ffb49d);color:white;font-size:28px;font-weight:300;box-shadow:inset 0 0 0 4px rgba(255,255,255,.56),0 4px 12px rgba(73,141,161,.15)}.r203-on{background:linear-gradient(135deg,#dff5fb,#d9f5ef)!important;color:#537584!important}
  `;document.head.appendChild(st);
  document.documentElement.dataset.berthaBuild='RC203';
  const badge=document.querySelector('.hml-build-pill');if(badge)badge.textContent='HML · RC203';
  setTimeout(()=>{if((location.hash||'').replace('#','')==='premiacoes')renderRewardsRC152('kids')},180);
})();
