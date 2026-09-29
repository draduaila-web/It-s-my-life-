/* BERTH.A RC207 — Kids · Neblina · família limpa + menos rococó
   Primeira coleção fechada: 6 pets × 5 acessórios por pet.
   Sem ranking, sem perda de pontos, paleta neutra e suave.
   Este patch depende da RC196 já publicada. */
(function(){
  const COLLECTION={
    key:'mist',
    name:'Neblina',
    subtitle:'Coleção 1 de 6',
    capsule:'mist_v1_capsule',
    palette:['#bda7f4','#ffd76b','#7fd9c9','#ffb897','#85b9ff','#f1a8c6'],
    pets:[
      {id:'mist_v1_cat',name:'Gato Neblina',desc:'Curioso, calmo e sempre atento ao que acontece ao redor.',acc:[
        ['mist_v1_cat_head','Boné Neblina','head'],['mist_v1_cat_neck','Coleira Lunar','neck'],['mist_v1_cat_eyes','Medalha de Bruma','chest'],['mist_v1_cat_back','Mochila Neblina','back'],['mist_v1_cat_special','Boia Estelar','special']]},
      {id:'mist_v1_rabbit',name:'Coelho de Nuvem',desc:'Leve, rápido e cheio de ideias boas.',acc:[
        ['mist_v1_rabbit_head','Touca de Nuvem','head'],['mist_v1_rabbit_neck','Medalhão de Lua','neck'],['mist_v1_rabbit_eyes','Lentes de Orvalho','eyes'],['mist_v1_rabbit_back','Bolsa de Algodão','back'],['mist_v1_rabbit_special','Estrela de Bruma','special']]},
      {id:'mist_v1_fox',name:'Raposa Neblina',desc:'Esperta, gentil e excelente em encontrar novos caminhos.',acc:[
        ['mist_v1_fox_head','Coroa de Névoa','head'],['mist_v1_fox_neck','Pingente de Aurora','neck'],['mist_v1_fox_eyes','Visor de Bruma','eyes'],['mist_v1_fox_back','Capa de Nuvem','back'],['mist_v1_fox_special','Cristal Nebuloso','special']]},
      {id:'mist_v1_owl',name:'Corujinha Lunar',desc:'Observadora, serena e amiga das pequenas descobertas.',acc:[
        ['mist_v1_owl_head','Arco Lunar','head'],['mist_v1_owl_neck','Colar de Estrela','neck'],['mist_v1_owl_eyes','Lunetas de Névoa','eyes'],['mist_v1_owl_back','Mochila de Lua','back'],['mist_v1_owl_special','Orbe de Luar','special']]},
      {id:'mist_v1_deer',name:'Cervo de Nuvem',desc:'Tranquilo, elegante e sempre seguindo em frente.',acc:[
        ['mist_v1_deer_head','Guirlanda de Bruma','head'],['mist_v1_deer_neck','Medalha Celeste','neck'],['mist_v1_deer_eyes','Óculos de Aurora','eyes'],['mist_v1_deer_back','Manta de Nuvem','back'],['mist_v1_deer_special','Cristal do Céu','special']]},
      {id:'mist_v1_bear',name:'Ursinho de Bruma',desc:'Acolhedor, constante e ótimo companheiro de jornada.',acc:[
        ['mist_v1_bear_head','Gorro de Nuvem','head'],['mist_v1_bear_neck','Pingente de Estrela','neck'],['mist_v1_bear_eyes','Óculos de Orvalho','eyes'],['mist_v1_bear_back','Mochila Macia','back'],['mist_v1_bear_special','Coração de Bruma','special']]}
    ]
  };

  const PET_ASSETS={
    mist_v1_cat:'kids_neblina_cat_rc207.png',
    mist_v1_rabbit:'kids_neblina_rabbit_rc207.png',
    mist_v1_fox:'kids_neblina_fox_rc207.png',
    mist_v1_owl:'kids_neblina_owl_rc207.png',
    mist_v1_deer:'kids_neblina_deer_rc207.png',
    mist_v1_bear:'kids_neblina_bear_rc207.png'
  };
  function petArt(id){
    const file=PET_ASSETS[id];
    return file?`<span class="r197-art r199-pet-art"><img src="./${file}?v=207" alt="" aria-hidden="true"></span>`:'';
  }


  const ACC_TYPE_ASSETS={
    head:'kids_ref_head_rc207.jpeg',
    neck:'kids_ref_neck_rc207.jpeg',
    eyes:'kids_ref_chest_rc207.jpeg',
    chest:'kids_ref_chest_rc207.jpeg',
    back:'kids_ref_back_rc207.jpeg',
    special:'kids_ref_special_rc207.jpeg'
  };
  const ACC_ASSETS={};
  COLLECTION.pets.forEach(p=>p.acc.forEach(a=>ACC_ASSETS[a[0]]=ACC_TYPE_ASSETS[a[2]]||ACC_TYPE_ASSETS.special));
  function kidsPaletteFor(member){
    const saved=window.berthaHmlStorage?.getItem('bertha.kids.palette.'+member?.id)||'auto';
    if(saved!=='auto')return saved;
    const k=String(member?.avatarKey||'').toLowerCase();
    if(k==='boy'||k==='son')return 'boy';
    if(k==='girl'||k==='daughter')return 'girl';
    return 'neutral';
  }
  let ACTIVE_KID_PALETTE='neutral';
  function accArt(id){
    const file=ACC_ASSETS[id];
    if(!file)return '';
    return `<span class="r197-art r204-acc-art rc206-palette-${ACTIVE_KID_PALETTE}"><img src="./${file}?v=207" alt="" aria-hidden="true"></span>`;
  }

  const PET_MAP=Object.fromEntries(COLLECTION.pets.map(p=>[p.id,p]));
  const ACC_MAP={}; COLLECTION.pets.forEach(p=>p.acc.forEach(a=>ACC_MAP[a[0]]={id:a[0],name:a[1],type:a[2],pet:p.id}));
  const ACC_TYPES={head:'Cabeça',neck:'Pescoço',eyes:'Olhos',chest:'Peito',back:'Corpo / costas',special:'Especial'};
  const COLORS=[['Neblina','#bda7f4'],['Menta','#82d9c8'],['Pêssego','#f5b89d'],['Céu','#86b9ff'],['Solar','#f4d66e'],['Coral','#efa6b8']];

  function esc(v){return typeof r147esc==='function'?r147esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function petAcc(id){return (PET_MAP[id]?.acc||[]).map(x=>x[0])}
  function firstUnused(box){const used=new Set((box.history||[]).map(h=>h.pet));return COLLECTION.pets.find(p=>!used.has(p.id))?.id||COLLECTION.pets[0].id}

  function svg(kind,id){
    const pet=PET_MAP[id],acc=ACC_MAP[id],type=acc?.type||kind;
    const tone=COLLECTION.palette[(Object.keys(PET_MAP).indexOf(id)+6)%COLLECTION.palette.length]||'#d9cff0';
    const uid='k'+String(id).replace(/[^a-z0-9]/gi,'');
    if(id==='medal_bronze'||id==='medal_silver'||id==='medal_gold'){
      const c=id==='medal_bronze'?['#c97946','#efb978','#7a4b31']:id==='medal_silver'?['#cbd3df','#f7fbff','#7f91aa']:['#e7b33b','#ffe58a','#a86c15'];
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="${uid}m" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c[1]}"/><stop offset=".5" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient></defs><path d="M39 71l-9 35 30-16 30 16-9-35z" fill="#8db4d9"/><circle cx="60" cy="52" r="34" fill="url(#${uid}m)"/><circle cx="60" cy="52" r="25" fill="#fff7ea" opacity=".92"/><path d="M60 32l6 12 13 2-10 9 3 13-12-7-12 7 3-13-10-9 13-2z" fill="${c[0]}"/></svg>`;
    }
    if(id==='trophy'||id==='super_trophy'){
      const superT=id==='super_trophy';
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="${uid}t" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffe07d"/><stop offset=".55" stop-color="#f0b63c"/><stop offset="1" stop-color="#cc7d22"/></linearGradient></defs><path d="M38 24h44v24c0 20-10 31-22 31S38 68 38 48z" fill="url(#${uid}t)"/><path d="M39 31H24v9c0 13 8 20 18 20M81 31h15v9c0 13-8 20-18 20" fill="none" stroke="#e6ad39" stroke-width="7" stroke-linecap="round"/><path d="M54 78h12v12H54zM42 91h36v10H42z" fill="#d18a28"/><path d="M60 37l5 10 11 2-8 8 2 11-10-6-10 6 2-11-8-8 11-2z" fill="#fff4cc"/>${superT?'<circle cx="60" cy="18" r="8" fill="#8fbde8"/><path d="M60 5l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#f3d066"/>':''}</svg>`;
    }
    if(id===COLLECTION.capsule){
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="${uid}c" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9cc9ef"/><stop offset=".5" stop-color="#b7a5e5"/><stop offset="1" stop-color="#f2b08e"/></linearGradient></defs><rect x="29" y="20" width="62" height="82" rx="31" fill="url(#${uid}c)"/><path d="M29 61h62" stroke="#fff8ee" stroke-width="7"/><circle cx="60" cy="61" r="11" fill="#fff8ee"/><path d="M60 52l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#e7b845"/></svg>`;
    }    if(acc){
      const icon= type==='head' ? `<path d="M34 63c9-15 43-15 52 0-7 9-45 9-52 0z" fill="url(#${uid}g)"/><path d="M45 57c3-9 8-15 15-18 7 3 12 9 15 18" fill="none" stroke="#fff" stroke-opacity=".78" stroke-width="4" stroke-linecap="round"/>` :
        type==='neck' ? `<path d="M34 49c7 26 45 26 52 0" fill="none" stroke="url(#${uid}g)" stroke-width="10" stroke-linecap="round"/><circle cx="60" cy="75" r="14" fill="url(#${uid}g)"/><path d="M60 67l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff" opacity=".8"/>` :
        type==='eyes' ? `<rect x="24" y="47" width="31" height="22" rx="10" fill="url(#${uid}g)"/><rect x="65" y="47" width="31" height="22" rx="10" fill="url(#${uid}g)"/><path d="M55 57h10" stroke="#9f91ab" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="56" r="5" fill="#fff" opacity=".75"/><circle cx="80" cy="56" r="5" fill="#fff" opacity=".75"/>` :
        type==='back' ? `<rect x="30" y="30" width="60" height="68" rx="22" fill="url(#${uid}g)"/><rect x="43" y="19" width="34" height="22" rx="11" fill="#eee2f5"/><rect x="41" y="60" width="38" height="24" rx="10" fill="#fff" opacity=".55"/><path d="M31 48c-13 9-13 31 0 39M89 48c13 9 13 31 0 39" fill="none" stroke="#b8a7c2" stroke-width="6" stroke-linecap="round"/>` :
        `<circle cx="60" cy="60" r="33" fill="url(#${uid}g)"/><path d="M60 37l7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#fff" opacity=".82"/>`;
      return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff3fb"/><stop offset=".48" stop-color="${tone}"/><stop offset="1" stop-color="#ffd983"/></linearGradient><filter id="${uid}s"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity=".18"/></filter></defs><ellipse cx="60" cy="100" rx="28" ry="6" fill="#786e82" opacity=".06"/><g filter="url(#${uid}s)">${icon}</g></svg>`
    }
    const shapes={
      mist_v1_cat:`<path d="M37 39L27 19l24 12M83 39l10-20-24 12" fill="${tone}"/><ellipse cx="60" cy="60" rx="34" ry="31" fill="url(#${uid}g)"/><path d="M42 57c6 4 11 4 16 0M62 57c6 4 11 4 16 0" stroke="#665e6d" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M56 68c3 3 5 3 8 0" stroke="#9e7e8f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      mist_v1_rabbit:`<ellipse cx="45" cy="28" rx="11" ry="25" fill="${tone}" transform="rotate(-9 45 28)"/><ellipse cx="75" cy="28" rx="11" ry="25" fill="${tone}" transform="rotate(9 75 28)"/><ellipse cx="60" cy="65" rx="32" ry="31" fill="url(#${uid}g)"/><circle cx="48" cy="59" r="3.5" fill="#665e6d"/><circle cx="72" cy="59" r="3.5" fill="#665e6d"/><path d="M56 69c3 3 5 3 8 0" stroke="#9e7e8f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      mist_v1_fox:`<path d="M30 28l22 14-14 20zM90 28L68 42l14 20z" fill="${tone}"/><path d="M60 28c22 0 34 16 30 38-4 20-17 30-30 30S34 86 30 66c-4-22 8-38 30-38z" fill="url(#${uid}g)"/><path d="M60 60l-12 18h24z" fill="#fff" opacity=".62"/><circle cx="48" cy="57" r="3.5" fill="#665e6d"/><circle cx="72" cy="57" r="3.5" fill="#665e6d"/><circle cx="60" cy="70" r="3.5" fill="#876f7e"/>`,
      mist_v1_owl:`<ellipse cx="60" cy="63" rx="34" ry="36" fill="url(#${uid}g)"/><circle cx="45" cy="57" r="13" fill="#fff" opacity=".7"/><circle cx="75" cy="57" r="13" fill="#fff" opacity=".7"/><circle cx="45" cy="57" r="4" fill="#665e6d"/><circle cx="75" cy="57" r="4" fill="#665e6d"/><path d="M55 68l5 7 5-7z" fill="#d5aa7f"/><path d="M33 35l12 7M87 35l-12 7" stroke="${tone}" stroke-width="9" stroke-linecap="round"/>`,
      mist_v1_deer:`<ellipse cx="60" cy="66" rx="31" ry="30" fill="url(#${uid}g)"/><path d="M42 40c-9-10-10-20-4-29M42 30l-11-9M78 40c9-10 10-20 4-29M78 30l11-9" fill="none" stroke="#b9a58d" stroke-width="5" stroke-linecap="round"/><path d="M35 43L20 31l5 22zM85 43l15-12-5 22z" fill="${tone}"/><circle cx="49" cy="61" r="3.5" fill="#665e6d"/><circle cx="71" cy="61" r="3.5" fill="#665e6d"/><ellipse cx="60" cy="73" rx="5" ry="4" fill="#9a7e7b"/>`,
      mist_v1_bear:`<circle cx="36" cy="38" r="13" fill="${tone}"/><circle cx="84" cy="38" r="13" fill="${tone}"/><ellipse cx="60" cy="64" rx="34" ry="32" fill="url(#${uid}g)"/><circle cx="49" cy="59" r="3.5" fill="#665e6d"/><circle cx="71" cy="59" r="3.5" fill="#665e6d"/><ellipse cx="60" cy="72" rx="8" ry="6" fill="#fff" opacity=".54"/><circle cx="60" cy="70" r="3" fill="#846f7d"/>`
    };
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8f0fb"/><stop offset=".5" stop-color="${tone}"/><stop offset="1" stop-color="#e8dbc5"/></linearGradient><filter id="${uid}s"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-opacity=".11"/></filter></defs><ellipse cx="60" cy="103" rx="32" ry="6" fill="#746a78" opacity=".06"/><g filter="url(#${uid}s)">${shapes[id]||shapes.mist_v1_cat}</g></svg>`
  }

  const oldImg=window.r147img;
  window.r147img=r147img=function(name,cls=''){
    if(PET_MAP[name]) return petArt(name);
    if(ACC_ASSETS[name]) return accArt(name);
    if(name===COLLECTION.capsule||ACC_MAP[name]||['medal_bronze','medal_silver','medal_gold','trophy','super_trophy'].includes(name)) return `<span class="r197-art ${cls}" data-kids-art="${esc(name)}">${svg(ACC_MAP[name]?.type||'reward',name)}</span>`;
    return oldImg?oldImg(name,cls):'';
  };

  window.r152Themes=r152Themes=function(){return {mist:{name:COLLECTION.name,capsule:COLLECTION.capsule,pets:COLLECTION.pets.map(p=>p.id),acc:COLLECTION.pets[0].acc.map(a=>a[0])}}};
  window.r152PetLabel=r152PetLabel=function(x){return PET_MAP[x]?.name||'Companheiro'};
  window.r152AccLabel=r152AccLabel=function(x){return ACC_MAP[x]?.name||'Acessório'};
  window.r152NewCycle=r152NewCycle=function(mid){
    const {box}=r152Box(mid),pet=firstUnused(box);
    return {id:'cy_'+Date.now(),number:(box.history||[]).length+1,theme:'mist',pet,accessories:petAcc(pet),pointsPerStep:20,medalsPerAccessory:3,createdAt:Date.now(),status:'active'}
  };
  const baseEnsure=window.r152EnsureCycle;
  window.r152EnsureCycle=r152EnsureCycle=function(mid){
    const {all,box}=r152Box(mid);
    let c=box.current||null;
    if(!c)c=r152NewCycle(mid);
    if(c.theme!=='mist'||!PET_MAP[c.pet]){c.theme='mist';c.pet=firstUnused(box)}
    c.accessories=petAcc(c.pet);c.pointsPerStep=Math.max(1,+c.pointsPerStep||20);c.medalsPerAccessory=Math.max(1,+c.medalsPerAccessory||3);box.current=c;all[mid]=box;r152SaveAllCycles(all);return c
  };

  window.r152KidsPanel=r152KidsPanel=function(mid){
    const kids=(loadSatellites().members||[]).filter(m=>m.status!=='removed'&&m.role==='kids');
    const member=kids.find(k=>String(k.id)===String(mid))||kids[0];
    ACTIVE_KID_PALETTE=kidsPaletteFor(member);
    if(!member)return '<section class="r147-card"><div class="sat-empty">Cadastre um satélite como Kids para configurar um Ciclo de Progressão.</div></section>';
    const c=r152EnsureCycle(member.id), box=r152Box(member.id).box, hist=box.history||[], p=loadKidsProgress()[member.id]||{lifetime:0,season:0,log:[]};
    const units=Math.floor((+p.lifetime||0)/Math.max(1,+c.pointsPerStep||20)),idx=Math.min(5,units),after=Math.max(0,units-6),unlocked=Math.min(5,Math.floor(after/Math.max(1,+c.medalsPerAccessory||3))),used=new Set(hist.map(h=>h.pet));
    const trail=[['medal_bronze','Bronze'],['medal_silver','Prata'],['medal_gold','Ouro'],['trophy','Troféu'],['super_trophy','Super Troféu'],[COLLECTION.capsule,'Cápsula']];
    const currentPet=PET_MAP[c.pet]||COLLECTION.pets[0];
    const accessories=currentPet.acc;
    return `<section class="r197-kids-shell">
      <section class="r197-hero"><div class="r197-top"><div><span class="r197-kicker">KIDS · ${COLLECTION.subtitle.toUpperCase()}</span><h2>${esc(member.name)}</h2><p>${esc(COLLECTION.name)} · Ciclo ${c.number}</p></div><select id="r152KidSel">${kids.map(k=>`<option value="${esc(k.id)}" ${String(k.id)===String(member.id)?'selected':''}>${esc(k.name)}</option>`).join('')}</select></div>
      <div class="r197-current"><div class="r197-current-art">${r147img(c.pet)}</div><div><span class="r197-label">COMPANHEIRO-ALVO</span><h3>${esc(currentPet.name)}</h3><p>${esc(currentPet.desc)}</p><div class="r197-stats"><span><small>Fase</small><b>${['Bronze','Prata','Ouro','Troféu','Super Troféu','Cápsula'][idx]}</b></span><span><small>Pontos</small><b>${+p.lifetime||0}</b></span><span><small>Acessórios</small><b>${unlocked}/5</b></span></div></div></div></section>
      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">TRILHA</span><h3>Do primeiro marco à cápsula</h3><p>Sem perda de pontos e sem ranking.</p></div></div><div class="r197-trail">${trail.map(([a,l],i)=>`<div class="r197-step ${i<idx?'done':''} ${i===idx?'current':''}"><span>${r147img(a)}</span><b>${l}</b></div>`).join('')}</div><div class="r197-after"><b>Depois da cápsula</b><span>A cada ${c.medalsPerAccessory} medalhas, 1 acessório · ${unlocked}/5 liberados</span></div></section>
      <section class="r197-card"><div class="r197-head row"><div><span class="r197-kicker">COLEÇÃO 01</span><h3>Neblina</h3><p>6 pets · 5 acessórios exclusivos por pet</p></div><span class="r197-count">6 pets</span></div><div class="r197-pets">${COLLECTION.pets.map(pp=>`<button type="button" data-r152pet="${pp.id}" class="${pp.id===c.pet?'active':''} ${used.has(pp.id)?'used':''}"><span class="r197-pet-art">${r147img(pp.id)}</span><strong>${esc(pp.name)}</strong><small>${used.has(pp.id)?'conquistado':'disponível'}</small></button>`).join('')}</div></section>
      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">KIT DO PET</span><h3>${esc(currentPet.name)}</h3><p>Os 5 itens pertencem somente a este companheiro.</p></div></div><div class="r197-acc-grid">${accessories.map((a,i)=>`<label class="r197-acc ${i<unlocked?'unlocked':''}"><input type="checkbox" data-r152acc="${a[0]}" checked><span class="r197-acc-art">${r147img(a[0])}</span><strong>${esc(a[1])}</strong><small>${esc(ACC_TYPES[a[2]])}</small><div class="r197-swatches">${COLORS.map(([n,cx],ci)=>`<i title="${n}" style="--sw:${cx}" class="${ci===0?'active':''}"></i>`).join('')}</div></label>`).join('')}</div></section>
      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">CONFIGURAÇÃO DO OWNER</span><h3>Ritmo do ciclo</h3><p>A criança vê a jornada; estes parâmetros ficam com o Owner.</p></div></div><div class="r197-settings"><label>Pontos por marco<input id="r152Pts" type="number" min="1" value="${c.pointsPerStep}"></label><label>Medalhas por acessório<input id="r152Medals" type="number" min="1" value="${c.medalsPerAccessory}"></label><label>Paleta dos Kids<select id="r152Palette"><option value="auto">Automática pelo avatar</option><option value="neutral" ${ACTIVE_KID_PALETTE==='neutral'?'selected':''}>Neutra</option><option value="boy" ${ACTIVE_KID_PALETTE==='boy'?'selected':''}>Menino</option><option value="girl" ${ACTIVE_KID_PALETTE==='girl'?'selected':''}>Menina</option></select></label></div><button class="primary r197-save" id="r152SaveCycle">Salvar ciclo</button></section>
      <section class="r197-card"><div class="r197-head row"><div><span class="r197-kicker">HISTÓRICO</span><h3>Ciclos concluídos</h3><p>O pet conquistado permanece na coleção.</p></div><button class="r147-action" id="r152FinishCycle">Concluir ciclo</button></div><div class="r197-history">${hist.length?hist.slice().reverse().map(h=>`<div><span>${r147img(h.pet)}</span><p><strong>Ciclo ${h.number}</strong><small>${esc(r152PetLabel(h.pet))} · concluído</small></p></div>`).join(''):'<div class="sat-empty">Nenhum ciclo concluído ainda.</div>'}</div></section>
      <section class="r197-next"><span>Próximas coleções</span><div><i>Oceano</i><i>Espaço</i><i>Floresta</i><i>Solar</i><i>Coral</i></div></section>
    </section>`
  };

  window.r152WireKids=r152WireKids=function(){
    const sel=document.querySelector('#r152KidSel');if(!sel)return;
    const render=()=>renderRewardsRC152('kids');
    sel.onchange=()=>{window.berthaHmlStorage.setItem('bertha.rewards.selected.kid',sel.value);render()};
    document.querySelectorAll('[data-r152pet]').forEach(b=>b.onclick=()=>{const {all,box}=r152Box(sel.value);const c=r152EnsureCycle(sel.value);c.pet=b.dataset.r152pet;c.theme='mist';c.accessories=petAcc(c.pet);box.current=c;all[sel.value]=box;r152SaveAllCycles(all);render()});
    document.querySelector('#r152SaveCycle')?.addEventListener('click',e=>{const {all,box}=r152Box(sel.value),c=r152EnsureCycle(sel.value);c.pointsPerStep=Math.max(1,+document.querySelector('#r152Pts').value||20);c.medalsPerAccessory=Math.max(1,+document.querySelector('#r152Medals').value||3);c.accessories=petAcc(c.pet);box.current=c;all[sel.value]=box;r152SaveAllCycles(all);const pal=document.querySelector('#r152Palette')?.value||'auto';window.berthaHmlStorage?.setItem('bertha.kids.palette.'+sel.value,pal);e.currentTarget.textContent='Salvo';setTimeout(()=>e.currentTarget.textContent='Salvar ciclo',800)});
    document.querySelector('#r152FinishCycle')?.addEventListener('click',()=>{const {all,box}=r152Box(sel.value),c=r152EnsureCycle(sel.value);box.history.push({...c,status:'complete',completedAt:Date.now()});box.current=null;all[sel.value]=box;r152SaveAllCycles(all);render()})
  };

  function refresh(){
    if((location.hash||'').replace('#','')!=='premiacoes')return;
    const pane=document.querySelector('[data-r147pane="kids"]');
    if(!pane)return;
    const kids=(loadSatellites().members||[]).filter(m=>m.status!=='removed'&&m.role==='kids');
    if(!kids.length)return;
    let mid=window.berthaHmlStorage.getItem('bertha.rewards.selected.kid')||kids[0].id;
    if(!kids.some(k=>String(k.id)===String(mid)))mid=kids[0].id;
    pane.innerHTML=r152KidsPanel(mid);r152WireKids();
  }

  const style=document.createElement('style');style.id='rc197-kids-neblina';style.textContent=`
    .r197-kids-shell{display:grid;gap:14px;padding-bottom:120px}.r197-hero,.r197-card{border:1px solid rgba(113,96,130,.08);border-radius:28px;background:#fffdf9;box-shadow:0 10px 28px rgba(70,54,68,.035);overflow:hidden}.r197-hero{padding:17px;background:linear-gradient(140deg,#f7f1fb 0%,#fff8e7 48%,#edf5f3 100%)}.r197-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.r197-top h2,.r197-head h3{margin:2px 0 0;font-weight:430;letter-spacing:-.025em;color:#4f4853}.r197-top h2{font-size:25px}.r197-top p,.r197-head p{margin:4px 0 0;color:#837b86;font-size:11px;line-height:1.4}.r197-top select{min-height:36px;border-radius:999px;border:1px solid rgba(113,96,130,.10);background:#fffdf9;padding:0 12px;font-size:14px}.r197-kicker,.r197-label{font-size:9px;letter-spacing:.11em;color:#958b99}.r197-current{display:grid;grid-template-columns:148px 1fr;gap:16px;align-items:center;margin-top:15px}.r197-current-art{height:148px;border-radius:26px;background:rgba(255,255,255,.62);border:1px solid rgba(113,96,130,.06);display:grid;place-items:center}.r197-current-art .r197-art{width:132px;height:132px}.r197-current h3{font-size:24px;margin:3px 0 0;font-weight:450;color:#4f4853}.r197-current p{font-size:11.5px;line-height:1.45;color:#7f7682;margin:5px 0 10px;max-width:360px}.r197-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.r197-stats span{padding:9px 10px;background:rgba(255,255,255,.64);border-radius:14px;border:1px solid rgba(113,96,130,.06)}.r197-stats small{display:block;font-size:8px;color:#918793}.r197-stats b{display:block;margin-top:2px;font-size:11px;font-weight:540;color:#5d555f}.r197-card{padding:16px}.r197-head.row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.r197-head h3{font-size:19px}.r197-count{font-size:10px;padding:7px 10px;border-radius:999px;background:#f5f0f7;color:#796f7d}.r197-trail{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:14px}.r197-step{display:grid;justify-items:center;gap:5px;opacity:.43;text-align:center}.r197-step.done,.r197-step.current{opacity:1}.r197-step>span{width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:#fffaf5;border:1px solid rgba(113,96,130,.07);overflow:hidden}.r197-step .r197-art,.r197-step img{width:100%;height:100%;object-fit:contain}.r197-step b{font-size:9px;font-weight:500;color:#615964}.r197-step.current>span{box-shadow:0 0 0 2px rgba(176,153,202,.28)}.r197-after{margin-top:12px;padding:11px 13px;border-radius:16px;background:linear-gradient(135deg,#f3edf7,#edf4ef);display:grid;gap:3px}.r197-after b{font-size:11px;font-weight:520}.r197-after span{font-size:9.5px;color:#817984}.r197-pets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:14px}.r197-pets button{border:1px solid rgba(113,96,130,.07);background:#fffaf6;border-radius:20px;padding:9px 8px;display:grid;justify-items:center;gap:6px;color:#514955}.r197-pets button.active{box-shadow:0 0 0 2px rgba(183,158,207,.22);border-color:rgba(167,141,193,.26)}.r197-pets button.used:not(.active){opacity:.62}.r197-pet-art{width:100%;aspect-ratio:1;max-height:112px;border-radius:17px;background:linear-gradient(145deg,#fbf6fc,#fff8e9);display:grid;place-items:center}.r197-pet-art .r197-art{width:92%;height:92%}.r197-pets strong{font-size:10px;font-weight:520}.r197-pets small{font-size:8.5px;color:#8b828e}.r197-art{display:grid;place-items:center}.r197-art svg{width:100%;height:100%;display:block}.r199-pet-art img{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 8px 18px rgba(91,76,102,.10))}.r197-acc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}.r197-acc{border:1px solid rgba(113,96,130,.07);border-radius:20px;background:#fffaf6;padding:10px;display:grid;justify-items:center;gap:5px}.r197-acc>input{display:none}.r197-acc-art{width:94px;height:94px}.r197-acc-art .r197-art{width:100%;height:100%}.r197-acc strong{font-size:10px;font-weight:520;text-align:center;color:#5a535d}.r197-acc small{font-size:8.5px;color:#8b828e}.r197-acc:not(.unlocked){opacity:.62}.r197-swatches{display:flex;gap:5px;margin-top:3px}.r197-swatches i{width:15px;height:15px;border-radius:50%;background:var(--sw);border:2px solid #fff;box-shadow:0 0 0 1px rgba(113,96,130,.10)}.r197-swatches i.active{box-shadow:0 0 0 2px rgba(132,153,170,.36)}.r197-settings{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}.r197-settings label{display:grid;gap:5px;font-size:10px;color:#817984}.r197-settings input,.r197-settings select{min-height:43px;border-radius:14px;border:1px solid rgba(113,96,130,.11);background:#fff;padding:8px 10px;font-size:16px}.r197-save{margin-top:12px}.r197-history{display:grid;gap:8px;margin-top:12px}.r197-history>div:not(.sat-empty){display:grid;grid-template-columns:48px 1fr;gap:10px;align-items:center;padding:8px;border-radius:16px;background:#fffaf6}.r197-history>div>span{width:48px;height:48px}.r197-history p{margin:0;display:grid;gap:2px}.r197-history strong{font-size:10.5px;font-weight:520}.r197-history small{font-size:9px;color:#8b828e}.r197-next{padding:13px 14px 17px;display:grid;gap:9px}.r197-next>span{font-size:9px;letter-spacing:.11em;color:#958b99}.r197-next>div{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none}.r197-next i{font-style:normal;font-size:10px;white-space:nowrap;padding:8px 11px;border-radius:999px;background:#f5f1f4;color:#9a919b;border:1px solid rgba(113,96,130,.06)}
    /* RC202 — Kids com mais vida, leitura e separação de imagem/texto */
    .r197-hero{background:radial-gradient(circle at 18% 20%,rgba(203,178,255,.36),transparent 32%),radial-gradient(circle at 82% 22%,rgba(255,214,111,.30),transparent 34%),radial-gradient(circle at 78% 82%,rgba(126,220,203,.24),transparent 36%),linear-gradient(140deg,#fbf5ff 0%,#fff9e8 46%,#eef9f7 100%)!important}
    .r197-card{background:linear-gradient(180deg,rgba(255,254,251,.98),rgba(255,251,247,.96))!important;box-shadow:0 12px 30px rgba(93,71,105,.055)!important}
    .r197-current-art{background:linear-gradient(145deg,#fff6fb,#f4f4ff 48%,#eefaf7)!important;border-color:rgba(174,148,199,.13)!important;overflow:hidden!important}
    .r197-current-art .r199-pet-art{width:100%!important;height:100%!important;padding:8px!important;box-sizing:border-box!important}
    .r197-current-art .r199-pet-art img{width:100%!important;height:100%!important;object-fit:contain!important;transform:none!important}
    .r197-trail{gap:9px!important}.r197-step>span{background:linear-gradient(145deg,#fff8fb,#f4f3ff 55%,#fff9e5)!important;border-color:rgba(153,132,178,.10)!important;box-shadow:0 6px 15px rgba(105,83,116,.06)!important}.r197-step.current>span{box-shadow:0 0 0 2px rgba(159,128,202,.28),0 8px 20px rgba(129,104,160,.10)!important}.r197-step.done>span{filter:saturate(1.12)}
    .r197-after{background:linear-gradient(135deg,rgba(221,206,249,.66),rgba(255,233,190,.55) 48%,rgba(205,238,230,.65))!important;border:1px solid rgba(140,121,159,.07)!important}
    .r197-pets{gap:12px!important}.r197-pets button{padding:10px 10px 12px!important;gap:0!important;grid-template-rows:auto auto auto!important;background:linear-gradient(160deg,#fffdfb,#fff8f2)!important;border-color:rgba(132,112,147,.10)!important;overflow:hidden!important;min-height:198px!important;box-shadow:0 7px 18px rgba(84,67,95,.045)!important}.r197-pets button.active{background:linear-gradient(155deg,#fff8fd,#f5f1ff 54%,#fff7df)!important;box-shadow:0 0 0 2px rgba(183,158,207,.30),0 10px 24px rgba(92,73,106,.08)!important}.r197-pet-art{aspect-ratio:auto!important;height:138px!important;max-height:none!important;margin:0 0 8px!important;border-radius:18px!important;background:linear-gradient(145deg,#fff8fb,#f3f3ff 52%,#fff8e9)!important;overflow:hidden!important;display:grid!important;place-items:center!important}.r197-pet-art .r197-art{width:100%!important;height:100%!important;padding:7px!important;box-sizing:border-box!important}.r197-pet-art .r199-pet-art img{width:100%!important;height:100%!important;object-fit:contain!important;transform:none!important;filter:drop-shadow(0 7px 14px rgba(93,72,105,.10)) saturate(1.08)!important}.r197-pets strong{display:block!important;position:relative!important;z-index:2!important;margin-top:0!important;padding:0 2px!important;font-size:11.5px!important;line-height:1.25!important;font-weight:600!important;color:#4e4653!important}.r197-pets small{display:block!important;margin-top:3px!important;font-size:9.5px!important;color:#8a7e8d!important}
    .r197-acc-grid{gap:12px!important}.r197-acc{min-height:188px!important;padding:12px 10px 11px!important;background:linear-gradient(155deg,#fff8fb,#f5f4ff 52%,#fff9ea)!important;border-color:rgba(132,112,147,.10)!important;box-shadow:0 7px 18px rgba(84,67,95,.045)!important;opacity:1!important}.r197-acc:not(.unlocked){opacity:.58!important;filter:saturate(.9)}.r197-acc.unlocked{box-shadow:0 0 0 1px rgba(183,158,207,.16),0 8px 20px rgba(84,67,95,.06)!important}.r197-acc-art{width:104px!important;height:104px!important;filter:saturate(1.35) contrast(1.03)!important}.r197-acc strong{font-size:11px!important;font-weight:600!important;color:#514857!important}.r197-acc small{font-size:9px!important}.r197-swatches i{width:17px!important;height:17px!important;box-shadow:0 0 0 1px rgba(113,96,130,.12),0 2px 5px rgba(90,72,99,.08)!important}
    .r197-count{background:linear-gradient(135deg,#efe4fb,#fff1c9)!important;color:#67596f!important;font-weight:600!important}
    @media(max-width:560px){.r197-current{grid-template-columns:118px 1fr;gap:12px}.r197-current-art{height:118px}.r197-current-art .r197-art{width:108px;height:108px}.r197-current h3{font-size:20px}.r197-stats{grid-template-columns:1fr 1fr}.r197-stats span:first-child{grid-column:1/-1}.r197-trail{display:flex;overflow-x:auto;scrollbar-width:none}.r197-step{min-width:62px}.r197-pets{grid-template-columns:repeat(2,minmax(0,1fr))}.r197-pets button{min-height:190px!important}.r197-pet-art{height:132px!important}.r197-acc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.r197-top{align-items:center}.r197-top h2{font-size:22px}}

    /* RC204 — pés completos + acessórios ricos */
    .r197-pet-art{overflow:hidden!important;padding:8px!important;box-sizing:border-box!important}
    .r197-pet-art .r199-pet-art,.r197-pet-art .r197-art{width:100%!important;height:100%!important;padding:0!important}
    .r197-pet-art img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center center!important;transform:scale(.94)!important}
    .r197-current-art img{object-fit:contain!important;object-position:center center!important;transform:scale(.92)!important}
    .r204-acc-art{width:100%!important;height:100%!important;display:grid!important;place-items:center!important}
    .r204-acc-art img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;filter:drop-shadow(0 7px 14px rgba(92,73,106,.12)) saturate(1.12)!important}
    .r197-acc-art{width:112px!important;height:112px!important;overflow:visible!important}
    /* RC205 — referências mais limpas, menos rococó e maior contraste */
    .r197-acc{background:#fffdf9!important;border-color:rgba(116,104,125,.11)!important}
    .r204-acc-art img{width:92%!important;height:92%!important;object-fit:contain!important;filter:drop-shadow(0 7px 13px rgba(74,65,88,.12)) saturate(1.08) contrast(1.04)!important}
    .r197-settings{grid-template-columns:repeat(3,minmax(0,1fr))!important}
    @media(max-width:560px){.r197-settings{grid-template-columns:1fr!important}}

    /* RC207 — linha limpa das referências + pés inteiros */
    .r197-pet-art{height:150px!important;padding:15px!important;overflow:hidden!important;background:linear-gradient(145deg,#fffdf8,#f4f6fb 55%,#f7fbf8)!important}
    .r197-pet-art .r199-pet-art{width:100%!important;height:100%!important;padding:0!important;display:grid!important;place-items:center!important}
    .r197-pet-art .r199-pet-art img{width:auto!important;height:auto!important;max-width:88%!important;max-height:88%!important;object-fit:contain!important;object-position:center!important;transform:none!important;filter:drop-shadow(0 6px 12px rgba(71,63,82,.10)) saturate(.96)!important}
    .r197-current-art{overflow:hidden!important;padding:12px!important}
    .r197-current-art .r199-pet-art img{width:auto!important;height:auto!important;max-width:86%!important;max-height:86%!important;transform:none!important}
    .r197-acc{background:linear-gradient(160deg,#fffdfa,#f7f8fb)!important;border:1px solid rgba(89,84,96,.10)!important;box-shadow:0 7px 18px rgba(69,61,77,.045)!important}
    .r197-acc-art{width:116px!important;height:116px!important;overflow:visible!important}
    .r204-acc-art{width:100%!important;height:100%!important;display:grid!important;place-items:center!important}
    .r204-acc-art img{width:auto!important;height:auto!important;max-width:91%!important;max-height:91%!important;object-fit:contain!important;filter:drop-shadow(0 6px 12px rgba(69,61,77,.12)) saturate(1.08) contrast(1.04)!important}
    .rc206-palette-neutral img{filter:drop-shadow(0 6px 12px rgba(69,61,77,.12)) saturate(.98) hue-rotate(18deg) contrast(1.05)!important}
    .rc206-palette-boy img{filter:drop-shadow(0 6px 12px rgba(69,61,77,.12)) saturate(1.05) hue-rotate(135deg) contrast(1.06)!important}
    .rc206-palette-girl img{filter:drop-shadow(0 6px 12px rgba(69,61,77,.12)) saturate(1.04) hue-rotate(-8deg) contrast(1.04)!important}
    @media(max-width:560px){.r197-pet-art{height:146px!important;padding:16px!important}.r197-pets button{min-height:204px!important}}

    /* RC207 — família visual limpa, sem rococó */
    .r197-pet-art{background:#fffaf4!important;padding:18px!important}
    .r197-pet-art .r199-pet-art img{max-width:84%!important;max-height:84%!important;filter:drop-shadow(0 5px 10px rgba(63,57,68,.10)) saturate(.94) contrast(1.03)!important}
    .r197-acc{background:#fffaf4!important}
    .r197-acc-art{height:112px!important;width:112px!important;padding:8px!important;box-sizing:border-box!important}
    .r204-acc-art img{max-width:100%!important;max-height:100%!important;border-radius:18px!important;filter:none!important;mix-blend-mode:multiply}
    .rc206-palette-boy img{filter:hue-rotate(8deg) saturate(.96) contrast(1.03)!important}
    .rc206-palette-girl img{filter:hue-rotate(-8deg) saturate(.96) contrast(1.03)!important}
    .rc206-palette-neutral img{filter:saturate(.98) contrast(1.03)!important}
    .r197-step>span{background:#fffaf4!important}
    .r197-step svg{padding:7px;box-sizing:border-box}

  `;document.head.appendChild(style);

  // Atualiza a build e reaplica após repaints do core.
  document.documentElement.dataset.berthaBuild='RC207';
  const badge=document.querySelector('.hml-build-pill');if(badge)badge.textContent='HML · RC207';

  function rc206Stamp(){
    document.documentElement.dataset.berthaBuild='RC207';
    const idx=document.getElementById('rc157IndexBadge'); if(idx) idx.textContent='INDEX · RC207';
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length===0 && /^HML\s*·\s*RC\d+/i.test((el.textContent||'').trim())) el.textContent='HML · RC207';
    });
  }
  rc206Stamp(); setTimeout(rc206Stamp,250); setTimeout(rc206Stamp,900);

  window.addEventListener('pageshow',()=>{setTimeout(refresh,120);setTimeout(rc206Stamp,180)});
  document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab="kids"]'))setTimeout(refresh,40)});
  setTimeout(refresh,160);setTimeout(refresh,520);
})();
