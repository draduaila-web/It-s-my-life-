/* BERTH.A RC209 — Kids · Neblina finalizada + variações + trilha travada
   Regras:
   bronze → prata → ouro → troféu → super troféu → cápsula
   cápsula revela o pet; a cada 3 medalhas após a cápsula libera 1 acessório;
   5 acessórios completam o pet; reinicia com nova cápsula / novo pet;
   sem punição, sem perda de pontos, sem ranking; tudo por coleção;
   Owner escolhe coleção e pet.
*/
(function(){
  'use strict';

  const STORAGE={
    collection:'bertha.kids.owner.collection',
    pet:'bertha.kids.owner.pet',
    palette:'bertha.kids.palette.',
    variant:'bertha.kids.accessory.variant.'
  };

  const COLLECTIONS={
    mist:{
      order:1,name:'Neblina',accent:'#8fb8c9',accent2:'#c7b7df',
      palette:['#a7c4d1','#9fd2c2','#f2e7d8','#f0deb2','#df9c8f','#c7b7df','#b8d7b4'],
      pets:[
        ['mist_v1_cat','Gato Neblina','Curioso, calmo e sempre atento ao que acontece ao redor.','☁'],
        ['mist_v1_rabbit','Coelho de Nuvem','Leve, rápido e cheio de ideias boas.','☾'],
        ['mist_v1_fox','Raposa Neblina','Esperta, gentil e excelente em encontrar novos caminhos.','✦'],
        ['mist_v1_owl','Corujinha Lunar','Observadora, serena e amiga das pequenas descobertas.','◐'],
        ['mist_v1_deer','Cervo de Nuvem','Tranquilo, elegante e sempre seguindo em frente.','☁'],
        ['mist_v1_bear','Ursinho de Bruma','Acolhedor, constante e ótimo companheiro de jornada.','✧']
      ],
      accessories:[
        ['head','Boné de Bruma','Cabeça','catcap'],['neck','Coleira Lunar','Pescoço','catcollar'],['eyes','Óculos Neblina','Olhos','catglasses'],['back','Mochila Etérea','Corpo / costas','catbackpack'],['special','Amuleto Lunar','Especial','catcharm']
      ],
      petAccessories:{
        mist_v1_cat:[
          ['head','Boné de Bruma','Cabeça','catcap'],['neck','Coleira Lunar','Pescoço','catcollar'],['eyes','Óculos Neblina','Olhos','catglasses'],['back','Mochila Etérea','Corpo / costas','catbackpack'],['special','Amuleto Lunar','Especial','catcharm']
        ],
        mist_v1_rabbit:[
          ['head','Gorro de Nuvem','Cabeça','rabbitbeanie'],['neck','Bandana de Bruma','Pescoço','rabbitbandana'],['eyes','Óculos Nuvem','Olhos','rabbitglasses'],['back','Bolsa Saltinho','Corpo / costas','rabbitbag'],['special','Pingente Lua','Especial','rabbitmoon']
        ],
        mist_v1_fox:[
          ['head','Chapéu Cometa','Cabeça','foxhat'],['neck','Lenço Nebuloso','Pescoço','foxscarf'],['eyes','Visor Crepúsculo','Olhos','foxvisor'],['back','Alforge Cauda','Corpo / costas','foxsatchel'],['special','Chaveiro Cometa','Especial','foxcharm']
        ],
        mist_v1_owl:[
          ['head','Chapéuzinho Lunar','Cabeça','owlhat'],['neck','Cachecol de Nuvem','Pescoço','owlscarf'],['eyes','Óculos de grau lunar','Olhos','owlreading'],['back','Bolsa Carteiro Estelar','Corpo / costas','owlsatchel'],['special','Amuleto de Pena','Especial','owlfeather']
        ],
        mist_v1_deer:[
          ['head','Coroa de Galhos','Cabeça','deercrown'],['neck','Gola de Bruma','Pescoço','deercollar'],['eyes','Luneta de Trilha','Olhos','deerscope'],['back','Alforge Nuvem','Corpo / costas','deersaddle'],['special','Medalhão Constelação','Especial','deermedallion']
        ],
        mist_v1_bear:[
          ['head','Gorro de Bruma','Cabeça','bearbeanie'],['neck','Cachecol Menta','Pescoço','bearscarf'],['eyes','Óculos Redondos','Olhos','bearglasses'],['back','Pochete Nuvem','Corpo / costas','bearpouch'],['special','Amuleto Patinha','Especial','bearpaw']
        ]
      }
    },
    ocean:{
      order:2,name:'Oceano',accent:'#79b8c7',accent2:'#91d5c3',
      palette:['#9ec9d4','#93d3c1','#f0e6d7','#f0d78f','#df9a83','#b9b6d9','#b5d7bd'],
      pets:[
        ['ocean_turtle','Tartaruga','Calma, persistente e pronta para explorar.','◉'],
        ['ocean_shark','Tubarão','Corajoso, curioso e cheio de energia.','▲'],
        ['ocean_jelly','Água-viva','Leve, brilhante e sempre em movimento.','◎'],
        ['ocean_octopus','Polvo','Criativo, ágil e excelente em resolver desafios.','✣'],
        ['ocean_whale','Baleia','Serena, forte e companheira de grandes jornadas.','◒'],
        ['ocean_clownfish','Peixe-palhaço','Alegre, sociável e cheio de personalidade.','◆']
      ],
      accessories:[
        ['head','Boné náutico','Cabeça','cap'],['neck','Coleira/concha','Pescoço','shell'],['eyes','Óculos de mergulho','Olhos','goggles'],['back','Mochila oceano','Corpo / costas','backpack'],['snorkel','Snorkel','Equipamento','snorkel'],['medal','Concha especial / medalha oceano','Colecionável','medal'],['bubble','Bolha de ar','Especial','bubble']
      ]
    },
    space:{
      order:3,name:'Espaço',accent:'#88a9c8',accent2:'#b8afd4',
      palette:['#9fbad1','#9ecfc2','#efe6d9','#ead998','#d9988d','#bcb1d6','#b7d5b7'],
      pets:[
        ['space_cat','Gato espacial','Curioso e pronto para novas órbitas.','✦'],
        ['space_alien','Alien','Amigável, diferente e cheio de descobertas.','◉'],
        ['space_robot','Robô','Lógico, gentil e sempre aprendendo.','▣'],
        ['space_astronaut','Astronauta','Explorador e preparado para grandes missões.','◌'],
        ['space_planet','Planetinha','Pequeno universo de possibilidades.','●'],
        ['space_comet','Estrela cadente','Rápida, luminosa e cheia de movimento.','★']
      ],
      accessories:[
        ['head','Capacete/visor','Cabeça','helmet'],['neck','Coleira estelar','Pescoço','star'],['eyes','Óculos futuristas','Olhos','visor'],['back','Mochila espacial','Corpo / costas','backpack'],['badge','Insígnia galáctica','Colecionável','badge'],['special','Item especial cósmico','Especial','cosmic'],['ship','Espaçonave','Equipamento','ship']
      ]
    },
    forest:{
      order:4,name:'Floresta',accent:'#8fb9a4',accent2:'#c7b57f',
      palette:['#9fbec0','#9fcbb1','#ede5d5','#ead58d','#d99b80','#beb6d0','#a9ce9e'],
      pets:[
        ['forest_fox','Raposa','Esperta e atenta aos detalhes.','◆'],['forest_wolf','Lobo','Leal, firme e companheiro.','▲'],['forest_tiger','Tigre','Corajoso e cheio de presença.','≋'],['forest_faun','Fauno','Curioso e conectado à natureza.','♧'],['forest_bird','Ave','Livre, observadora e leve.','⌁'],['forest_capybara','Capivara','Tranquila, sociável e constante.','●']
      ],
      accessories:[
        ['head','Chapéu/folha','Cabeça','leaf'],['neck','Coleira natureza','Pescoço','nature'],['eyes','Óculos camp','Olhos','glasses'],['back','Mochila floresta','Corpo / costas','backpack'],['medal','Medalha botânica','Colecionável','medal'],['special','Item especial floresta','Especial','forest'],['binocular','Binóculo','Equipamento','binocular']
      ]
    },
    solar:{
      order:5,name:'Solar',accent:'#ddb873',accent2:'#e1a08c',
      palette:['#aac1cb','#a6cfbc','#efe4d2','#edce82','#df9a83','#c1b4d0','#b5d5a8'],
      pets:[
        ['solar_lion','Leão','Forte, generoso e confiante.','☀'],['solar_phoenix','Fênix','Resiliente e sempre pronta para recomeçar.','✦'],['solar_dragon','Dragão solar','Protetor e cheio de energia.','◆'],['solar_lizard','Lagarto','Ágil, atento e adaptável.','≈'],['solar_mystic','Criatura mística brilhante','Luminosa, curiosa e única.','✧'],['solar_bee','Abelha','Organizada, ativa e colaborativa.','⬡']
      ],
      accessories:[
        ['head','Coroa/tiara solar','Cabeça','crown'],['neck','Coleira brilho','Pescoço','sun'],['eyes','Óculos solares','Olhos','glasses'],['back','Mochila solar','Corpo / costas','backpack'],['medal','Medalha sol','Colecionável','medal'],['special','Item especial radiante','Especial','radiant'],['umbrella','Guarda-sol','Equipamento','umbrella']
      ]
    },
    coral:{
      order:6,name:'Coral',accent:'#7fbfc0',accent2:'#dc9a88',
      palette:['#9fc8ce','#9fd1bd','#eee4d7','#ebd58d','#dc9b86','#beb6d3','#b7d5ad'],
      pets:[
        ['coral_axolotl','Axolote','Curioso, simpático e sempre surpreendente.','✦'],['coral_octopus','Polvo coral','Criativo e cheio de possibilidades.','✣'],['coral_seahorse','Cavalo-marinho','Delicado, atento e persistente.','ϟ'],['coral_star','Estrela-do-mar','Calma, firme e brilhante.','★'],['coral_shrimp','Camarão','Ágil, esperto e divertido.','≈'],['coral_ray','Arraia','Leve, elegante e livre.','⌁']
      ],
      accessories:[
        ['head','Tiara algas','Cabeça','algae'],['neck','Coleira pérola','Pescoço','pearl'],['eyes','Óculos coral','Olhos','glasses'],['back','Mochila coral','Corpo / costas','backpack'],['medal','Medalha concha','Colecionável','medal'],['special','Item especial recife','Especial','reef'],['toy','Brinquedos de praia','Equipamento','beach']
      ]
    }
  };

  const COLLECTION_ORDER=Object.keys(COLLECTIONS).sort((a,b)=>COLLECTIONS[a].order-COLLECTIONS[b].order);
  const PET_MAP={}; const ACC_MAP={};
  COLLECTION_ORDER.forEach(key=>{
    const col=COLLECTIONS[key];
    col.pets=col.pets.map((p,pi)=>({id:p[0],name:p[1],desc:p[2],symbol:p[3],collection:key,index:pi}));
    col.pets.forEach((p,pi)=>{
      PET_MAP[p.id]=p;
      const defs=(col.petAccessories&&col.petAccessories[p.id])||[0,1,2,3,4].map(offset=>col.accessories[(pi+offset)%col.accessories.length]);
      p.accessories=defs.map((src,offset)=>{
        const id=`${key}_${p.id}_${src[0]}_${offset}`;
        const a={id,name:src[1],slot:src[0],slotLabel:src[2],kind:src[3],pet:p.id,collection:key};
        ACC_MAP[id]=a;return a;
      });
    });
  });

  const oldImg=window.r147img;
  const oldThemes=window.r152Themes;
  function esc(v){return typeof window.r147esc==='function'?window.r147esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function hsl(hex,alpha){return hex+alpha}
  function paletteMode(member){
    const saved=window.berthaHmlStorage?.getItem(STORAGE.palette+member?.id)||'auto';
    if(saved!=='auto')return saved;
    const k=String(member?.avatarKey||'').toLowerCase();
    if(k==='boy'||k==='son')return 'boy'; if(k==='girl'||k==='daughter')return 'girl'; return 'neutral';
  }
  function paletteFor(col,mode){
    const base=col.palette.slice();
    if(mode==='boy') return [base[0],base[1],base[2],base[3],base[6],'#a9bfd3','#9fc8ba'];
    if(mode==='girl') return [base[0],base[1],base[2],base[3],base[4],base[5],'#d6b4b2'];
    return base;
  }
  function colorFor(col,i,mode){const p=paletteFor(col,mode);return p[i%p.length]}
  function variantFor(mid,aid){
    const raw=window.berthaHmlStorage?.getItem(STORAGE.variant+String(mid||'')+'.'+aid);
    const n=Number(raw); return Number.isFinite(n)?Math.max(0,Math.min(2,n)):2;
  }
  function variantPalette(col,mode,variant){
    const p=paletteFor(col,mode);
    if(variant===0) return [p[0],p[1],p[2],p[3],p[5]||'#b7b4d8'];
    if(variant===1) return [p[4]||'#df9c8f',p[3],p[2],p[6]||'#b8d7b4',p[1]];
    return [p[0],p[4]||'#df9c8f',p[2],p[3],p[1]];
  }

  function iconSvg(kind,col,mode,symbol,variant=2){
    const p=variantPalette(col,mode,variant), c1=p[0],c2=p[1],c3=p[2],c4=p[3],c5=p[4];
    const uid='i'+Math.random().toString(36).slice(2,8);
    const defs=`<defs><linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c3}"/><stop offset=".48" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><linearGradient id="${uid}h" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".88"/><stop offset="1" stop-color="${c4}" stop-opacity=".75"/></linearGradient></defs>`;
    const glyph=symbol||'✦'; let body='';
    if(kind==='reward-bronze'||kind==='reward-silver'||kind==='reward-gold'){
      const metal=kind==='reward-bronze'?['#b67a53','#e4ad7d']:kind==='reward-silver'?['#9eabb8','#edf2f4']:['#d4a740','#ffe29a'];
      body=`<path d="M43 70l-7 28 24-13 24 13-7-28" fill="${c1}"/><circle cx="60" cy="50" r="31" fill="${metal[0]}"/><circle cx="60" cy="50" r="23" fill="${metal[1]}"/><circle cx="60" cy="50" r="15" fill="${c3}"/><path d="M60 39l3.5 7 7.7 1-5.6 5.4 1.3 7.6-6.9-3.6-6.9 3.6 1.3-7.6-5.6-5.4 7.7-1z" fill="${c5}"/>`;
    } else if(kind==='reward-trophy'||kind==='reward-super'){
      body=`<path d="M39 25h42v27c0 18-9 28-21 28S39 70 39 52z" fill="url(#${uid}g)"/><path d="M39 31H24v8c0 12 7 18 17 18M81 31h15v8c0 12-7 18-17 18" fill="none" stroke="${c4}" stroke-width="7" stroke-linecap="round"/><path d="M54 79h12v11H54zM42 91h36v10H42z" fill="${c4}"/><path d="M60 39l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="${c3}"/>${kind==='reward-super'?`<path d="M60 5l4 7 8 2-6 5 1 8-7-4-7 4 1-8-6-5 8-2z" fill="${c5}"/><path d="M30 45l-11-8 6 14M90 45l11-8-6 14" fill="none" stroke="${c5}" stroke-width="6" stroke-linecap="round"/>`:''}`;
    } else if(kind==='reward-capsule'){
      body=`<path d="M28 61V49a32 32 0 0164 0v12z" fill="url(#${uid}h)"/><path d="M28 61h64v10a32 32 0 01-64 0z" fill="url(#${uid}g)"/><circle cx="60" cy="61" r="12" fill="${c3}"/><circle cx="60" cy="61" r="7" fill="${c5}"/><circle cx="45" cy="45" r="7" fill="${c2}"/><circle cx="68" cy="39" r="6" fill="${c4}"/><circle cx="78" cy="50" r="5" fill="${c1}"/>`;
    } else if(kind==='catcap'){
      body=`<path d="M29 70c8-27 53-31 66 0-12 13-54 14-66 0z" fill="url(#${uid}g)"/><path d="M38 53l6-13 10 10M82 52l-5-13-10 11" fill="${c2}"/><path d="M39 72c23 8 44 3 56-3-8 15-45 22-56 3z" fill="${c1}"/><circle cx="61" cy="58" r="10" fill="${c3}"/><path d="M61 50l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${c5}"/>`;
    } else if(kind==='rabbitbeanie'){
      body=`<ellipse cx="60" cy="63" rx="31" ry="24" fill="url(#${uid}g)"/><path d="M40 52C29 32 30 18 40 20c8 2 12 19 13 31M80 52c11-20 10-34 0-32-8 2-12 19-13 31" fill="${c3}" stroke="${c1}" stroke-width="5"/><circle cx="60" cy="43" r="7" fill="${c4}"/>`;
    } else if(kind==='foxhat'){
      body=`<path d="M28 72h65l-10-17-18-12-18 7z" fill="url(#${uid}g)"/><path d="M47 50l-4-14 12 8M76 47l5-13 9 13" fill="${c2}"/><path d="M25 72c18 8 49 8 70 0" fill="none" stroke="${c4}" stroke-width="9" stroke-linecap="round"/>`;
    } else if(kind==='owlhat'){
      body=`<path d="M34 73h53L71 31 55 48 43 43z" fill="url(#${uid}g)"/><path d="M28 74h65" stroke="${c4}" stroke-width="10" stroke-linecap="round"/><path d="M64 44l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${c5}"/>`;
    } else if(kind==='deercrown'){
      body=`<path d="M34 67c14-10 38-10 52 0" fill="none" stroke="${c1}" stroke-width="10" stroke-linecap="round"/><path d="M43 54c-11-8-15-20-10-25m10 24c-3-13 2-22 9-27M77 54c11-8 15-20 10-25m-10 24c3-13-2-22-9-27" fill="none" stroke="${c4}" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="64" r="8" fill="${c3}"/>`;
    } else if(kind==='bearbeanie'){
      body=`<path d="M32 69c0-25 12-37 28-37s28 12 28 37z" fill="url(#${uid}g)"/><circle cx="41" cy="38" r="10" fill="${c1}"/><circle cx="79" cy="38" r="10" fill="${c1}"/><path d="M30 70h60" stroke="${c4}" stroke-width="10" stroke-linecap="round"/>`;
    } else if(kind==='catcollar'||kind==='deercollar'){
      body=`<path d="M24 45c16 23 56 23 72 0" fill="none" stroke="url(#${uid}g)" stroke-width="14" stroke-linecap="round"/><rect x="52" y="58" width="16" height="13" rx="5" fill="${c4}"/><circle cx="60" cy="80" r="13" fill="${c3}"/><path d="M60 72l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${c5}"/>`;
    } else if(kind==='rabbitbandana'){
      body=`<path d="M29 43c15 12 47 12 62 0L75 88 60 73 45 88z" fill="url(#${uid}g)"/><circle cx="60" cy="58" r="9" fill="${c3}"/>`;
    } else if(kind==='foxscarf'||kind==='owlscarf'||kind==='bearscarf'){
      body=`<path d="M28 48c17 17 47 18 64 0" fill="none" stroke="url(#${uid}g)" stroke-width="15" stroke-linecap="round"/><path d="M65 57l17 31M58 59l-7 33" stroke="${c1}" stroke-width="12" stroke-linecap="round"/><circle cx="59" cy="57" r="8" fill="${c4}"/>`;
    } else if(kind==='catglasses'||kind==='rabbitglasses'||kind==='owlreading'||kind==='bearglasses'){
      const round=kind==='owlreading'||kind==='bearglasses';
      body=round?`<circle cx="39" cy="58" r="17" fill="${c3}" stroke="${c1}" stroke-width="6"/><circle cx="81" cy="58" r="17" fill="${c3}" stroke="${c1}" stroke-width="6"/><path d="M56 58h8" stroke="${c4}" stroke-width="5"/>`:`<rect x="20" y="45" width="37" height="28" rx="13" fill="${c3}" stroke="${c1}" stroke-width="6"/><rect x="63" y="45" width="37" height="28" rx="13" fill="${c3}" stroke="${c1}" stroke-width="6"/><path d="M57 57h6" stroke="${c4}" stroke-width="5"/>`;
    } else if(kind==='foxvisor'){
      body=`<path d="M22 49c19-11 57-11 76 0l-8 26c-19 8-41 8-60 0z" fill="${c3}" stroke="${c1}" stroke-width="6"/><path d="M31 53c18-7 41-7 58 0" stroke="#fff" stroke-opacity=".65" stroke-width="5" stroke-linecap="round"/>`;
    } else if(kind==='deerscope'){
      body=`<circle cx="40" cy="58" r="15" fill="${c3}" stroke="${c1}" stroke-width="7"/><circle cx="78" cy="58" r="15" fill="${c3}" stroke="${c1}" stroke-width="7"/><path d="M55 58h8M25 58l-9 5M93 58l10 5" stroke="${c4}" stroke-width="6" stroke-linecap="round"/>`;
    } else if(kind==='catbackpack'){
      body=`<rect x="28" y="28" width="64" height="70" rx="20" fill="url(#${uid}g)"/><rect x="40" y="18" width="40" height="18" rx="9" fill="${c4}"/><rect x="40" y="63" width="40" height="23" rx="9" fill="${c3}"/><path d="M60 68l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${c5}"/>`;
    } else if(kind==='rabbitbag'){
      body=`<rect x="34" y="42" width="52" height="46" rx="14" fill="url(#${uid}g)"/><path d="M36 46c7-20 41-20 48 0" fill="none" stroke="${c4}" stroke-width="8"/><circle cx="60" cy="65" r="8" fill="${c3}"/>`;
    } else if(kind==='foxsatchel'||kind==='owlsatchel'){
      body=`<path d="M31 45h58v43H31z" rx="10" fill="url(#${uid}g)"/><path d="M31 54l29 17 29-17" fill="${c3}"/><path d="M36 44c8-18 40-18 48 0" fill="none" stroke="${c4}" stroke-width="7"/><circle cx="60" cy="68" r="6" fill="${c5}"/>`;
    } else if(kind==='deersaddle'){
      body=`<rect x="18" y="44" width="34" height="43" rx="12" fill="url(#${uid}g)"/><rect x="68" y="44" width="34" height="43" rx="12" fill="url(#${uid}g)"/><path d="M48 48c8-8 16-8 24 0" fill="none" stroke="${c4}" stroke-width="8"/><circle cx="35" cy="64" r="6" fill="${c3}"/><circle cx="85" cy="64" r="6" fill="${c3}"/>`;
    } else if(kind==='bearpouch'){
      body=`<path d="M25 53c22-10 48-10 70 0l-7 31H32z" fill="url(#${uid}g)"/><path d="M31 52c18 12 41 12 58 0" fill="${c3}"/><rect x="53" y="63" width="14" height="10" rx="4" fill="${c5}"/>`;
    } else if(kind==='catcharm'||kind==='rabbitmoon'||kind==='foxcharm'||kind==='owlfeather'||kind==='deermedallion'||kind==='bearpaw'){
      let g='★'; if(kind==='rabbitmoon')g='☾'; if(kind==='foxcharm')g='☄'; if(kind==='owlfeather')g='◜'; if(kind==='deermedallion')g='✦'; if(kind==='bearpaw')g='●';
      body=`<circle cx="60" cy="58" r="27" fill="url(#${uid}g)"/><circle cx="60" cy="58" r="18" fill="${c3}"/><text x="60" y="67" text-anchor="middle" font-size="26" fill="${c5}" font-family="system-ui">${g}</text><circle cx="60" cy="25" r="8" fill="none" stroke="${c4}" stroke-width="5"/>`;
    } else {
      body=`<circle cx="60" cy="60" r="40" fill="url(#${uid}g)"/><circle cx="60" cy="60" r="26" fill="${c3}"/><text x="60" y="70" text-anchor="middle" font-size="32" fill="${c5}" font-family="system-ui">${glyph}</text>`;
    }
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${defs}<ellipse cx="60" cy="104" rx="30" ry="6" fill="#655d69" opacity=".06"/>${body}</svg>`;
  }

  function petArt(p,col,mode){
    if(p.collection==='mist' && oldImg){
      const legacy=oldImg(p.id);
      if(legacy) return legacy;
    }
    const c1=colorFor(col,p.index,mode), c2=colorFor(col,p.index+2,mode), c3=colorFor(col,p.index+4,mode);
    return `<span class="r197-art rc208-pet-proxy"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="pg${p.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs><ellipse cx="60" cy="102" rx="30" ry="6" fill="#665d6d" opacity=".06"/><circle cx="60" cy="60" r="38" fill="url(#pg${p.id})"/><circle cx="46" cy="54" r="5" fill="#4c4a53"/><circle cx="74" cy="54" r="5" fill="#4c4a53"/><path d="M53 70c5 5 9 5 14 0" fill="none" stroke="#665d6d" stroke-width="3" stroke-linecap="round"/><text x="60" y="42" text-anchor="middle" font-size="24" fill="#fff" opacity=".9" font-family="system-ui">${esc(p.symbol)}</text></svg></span>`;
  }

  function accessoryArt(a,col,mode){
    const sym={catcap:'☾',catcollar:'✦',catglasses:'◉',catbackpack:'◆',catcharm:'★',rabbitbeanie:'☁',rabbitbandana:'☾',rabbitglasses:'◉',rabbitbag:'◆',rabbitmoon:'☾',foxhat:'☄',foxscarf:'☁',foxvisor:'◉',foxsatchel:'◆',foxcharm:'☄',owlhat:'☾',owlscarf:'☁',owlreading:'◉',owlsatchel:'◆',owlfeather:'◜',deercrown:'✦',deercollar:'☁',deerscope:'◉',deersaddle:'◆',deermedallion:'✦',bearbeanie:'☁',bearscarf:'☁',bearglasses:'◉',bearpouch:'◆',bearpaw:'●',cap:'☾',helmet:'◉',leaf:'⌁',crown:'☀',algae:'≈',scarf:'☁',shell:'◔',star:'★',nature:'♧',sun:'☀',pearl:'●',glasses:'◉',goggles:'◉',visor:'▣',backpack:'◆',amulet:'✦',medal:'✦',bubble:'○',snorkel:'⌁',badge:'★',cosmic:'✧',ship:'➤',forest:'♧',binocular:'◉',radiant:'☀',umbrella:'☂',reef:'≈',beach:'◇'}[a.kind]||'✦';
    const v=variantFor(window.__rc209Member,a.id);
    return `<span class="r197-art rc209-acc-proxy" data-acc="${esc(a.id)}" data-v="${v}">${iconSvg(a.kind,col,mode,sym,v)}</span>`;
  }

  function img(name,cls=''){
    if(PET_MAP[name]){const p=PET_MAP[name],col=COLLECTIONS[p.collection];return petArt(p,col,window.__rc208Palette||'neutral')}
    if(ACC_MAP[name]){const a=ACC_MAP[name],col=COLLECTIONS[a.collection];return accessoryArt(a,col,window.__rc208Palette||'neutral')}
    if(name==='medal_bronze')return `<span class="r197-art ${cls}">${iconSvg('reward-bronze',COLLECTIONS.mist,window.__rc208Palette||'neutral','')}</span>`;
    if(name==='medal_silver')return `<span class="r197-art ${cls}">${iconSvg('reward-silver',COLLECTIONS.mist,window.__rc208Palette||'neutral','')}</span>`;
    if(name==='medal_gold')return `<span class="r197-art ${cls}">${iconSvg('reward-gold',COLLECTIONS.mist,window.__rc208Palette||'neutral','')}</span>`;
    if(name==='trophy')return `<span class="r197-art ${cls}">${iconSvg('reward-trophy',COLLECTIONS.mist,window.__rc208Palette||'neutral','')}</span>`;
    if(name==='super_trophy')return `<span class="r197-art ${cls}">${iconSvg('reward-super',COLLECTIONS.mist,window.__rc208Palette||'neutral','')}</span>`;
    if(/^capsule_/.test(name)){const key=name.replace('capsule_','');return `<span class="r197-art ${cls}">${iconSvg('reward-capsule',COLLECTIONS[key]||COLLECTIONS.mist,window.__rc208Palette||'neutral','')}</span>`}
    return oldImg?oldImg(name,cls):'';
  }
  window.r147img=img;

  window.r152Themes=function(){
    const out={}; COLLECTION_ORDER.forEach(k=>{const c=COLLECTIONS[k];out[k]={name:c.name,capsule:'capsule_'+k,pets:c.pets.map(p=>p.id),acc:c.pets[0].accessories.map(a=>a.id)}});return out;
  };
  window.r152PetLabel=x=>PET_MAP[x]?.name||'Companheiro';
  window.r152AccLabel=x=>ACC_MAP[x]?.name||'Acessório';

  function selectedCollection(mid){
    const saved=window.berthaHmlStorage?.getItem(STORAGE.collection+'.'+mid)||window.berthaHmlStorage?.getItem(STORAGE.collection)||'mist';
    return COLLECTIONS[saved]?saved:'mist';
  }
  function firstUnusedPet(box,key){
    const used=new Set((box.history||[]).filter(h=>h.theme===key).map(h=>h.pet));
    return COLLECTIONS[key].pets.find(p=>!used.has(p.id))?.id||COLLECTIONS[key].pets[0].id;
  }
  function currentLifetime(mid){return +(window.loadKidsProgress?.()[mid]?.lifetime||0)}
  window.r152NewCycle=function(mid){
    const {box}=window.r152Box(mid); const theme=selectedCollection(mid); const pet=firstUnusedPet(box,theme);
    return {id:'cy_'+Date.now(),number:(box.history||[]).length+1,theme,pet,accessories:PET_MAP[pet].accessories.map(a=>a.id),pointsPerStep:20,medalsPerAccessory:3,startLifetime:currentLifetime(mid),createdAt:Date.now(),status:'active'};
  };
  window.r152EnsureCycle=function(mid){
    const {all,box}=window.r152Box(mid); let c=box.current||null;
    if(!c)c=window.r152NewCycle(mid);
    if(!COLLECTIONS[c.theme])c.theme='mist';
    if(!PET_MAP[c.pet]||PET_MAP[c.pet].collection!==c.theme)c.pet=firstUnusedPet(box,c.theme);
    c.accessories=PET_MAP[c.pet].accessories.map(a=>a.id); c.pointsPerStep=Math.max(1,+c.pointsPerStep||20); c.medalsPerAccessory=3;
    if(c.startLifetime==null)c.startLifetime=0;
    box.current=c;all[mid]=box;window.r152SaveAllCycles(all);return c;
  };

  function stageData(mid,c){
    const life=currentLifetime(mid), cycle=Math.max(0,life-(+c.startLifetime||0));
    const units=Math.floor(cycle/Math.max(1,+c.pointsPerStep||20));
    const idx=Math.min(4,units); const capsuleReached=units>=5; const post=Math.max(0,units-5);
    const accessoryMedals=post; const unlocked=Math.min(5,Math.floor(accessoryMedals/3));
    const nextMedals=unlocked>=5?0:3-(accessoryMedals%3||0);
    return {life,cycle,units,idx,capsuleReached,accessoryMedals,unlocked,nextMedals,complete:unlocked>=5};
  }

  function collectionSelector(active){
    return `<div class="rc208-collections">${COLLECTION_ORDER.map(k=>{const c=COLLECTIONS[k];return `<button type="button" data-rc208collection="${k}" class="${k===active?'active':''}" style="--c1:${c.accent};--c2:${c.accent2}"><b>${String(c.order).padStart(2,'0')}</b><span>${esc(c.name)}</span></button>`}).join('')}</div>`;
  }

  window.r152KidsPanel=function(mid){
    const kids=(window.loadSatellites?.().members||[]).filter(m=>m.status!=='removed'&&m.role==='kids');
    const member=kids.find(k=>String(k.id)===String(mid))||kids[0];
    if(!member)return '<section class="r147-card"><div class="sat-empty">Cadastre um satélite como Kids para configurar a trilha.</div></section>';
    const mode=paletteMode(member); window.__rc208Palette=mode; window.__rc209Member=member.id;
    const c=window.r152EnsureCycle(member.id), col=COLLECTIONS[c.theme], box=window.r152Box(member.id).box, hist=box.history||[], sd=stageData(member.id,c), pet=PET_MAP[c.pet];
    const trail=[['bronze','Medalha Bronze'],['prata','Medalha Prata'],['ouro','Medalha Ouro'],['trofeu','Troféu'],['super','Super Troféu']];
    const used=new Set(hist.filter(h=>h.theme===c.theme).map(h=>h.pet));
    const phaseLabel=sd.capsuleReached?(sd.complete?'Pet completo':'Acessórios'):trail[Math.min(sd.idx,trail.length-1)][1];
    return `<section class="r197-kids-shell rc209-kids-shell">
      <section class="r197-hero"><div class="r197-top"><div><span class="r197-kicker">KIDS · TRILHA POR COLEÇÃO</span><h2>${esc(member.name)}</h2><p>${esc(col.name)} · Ciclo ${c.number} · sem ranking, sem perda de pontos</p></div><select id="r152KidSel">${kids.map(k=>`<option value="${esc(k.id)}" ${String(k.id)===String(member.id)?'selected':''}>${esc(k.name)}</option>`).join('')}</select></div>
      ${collectionSelector(c.theme)}
      <div class="r197-current"><div class="r197-current-art">${img(c.pet)}</div><div><span class="r197-label">COMPANHEIRO-ALVO</span><h3>${esc(pet.name)}</h3><p>${esc(pet.desc)}</p><div class="r197-stats"><span><small>Fase</small><b>${esc(phaseLabel)}</b></span><span><small>Pontos do ciclo</small><b>${sd.cycle}</b></span><span><small>Acessórios</small><b>${sd.unlocked}/5</b></span></div></div></div></section>

      <section class="r197-card rc258-trail-card"><div class="r197-head"><div><span class="r197-kicker">TRILHA DO UNIVERSO</span><h3>${esc(col.name)}</h3><p>Medalha Bronze → Medalha Prata → Medalha Ouro → Troféu → Super Troféu</p></div></div><div class="r197-trail rc258-trail">${trail.map(([a,l],i)=>`<div class="r197-step ${i<sd.idx||sd.capsuleReached?'done':''} ${i===sd.idx&&!sd.capsuleReached?'current':''}"><span class="rc258-reward-art"><img src="rc258_reward_${({mist:'neblina',ocean:'oceano',space:'espaco',forest:'floresta',solar:'solar',coral:'coral'}[c.theme]||c.theme)}_${a}.jpg" alt="${esc(col.name)} — ${esc(l)}"></span><b>${l}</b></div>`).join('')}</div><div class="r197-after rc258-capsule rc260-capsule"><div><b>${sd.capsuleReached?'Super Troféu conquistado · cápsula liberada':'Prêmio do Super Troféu: cápsula'}</b><span>${sd.capsuleReached?(sd.complete?'5/5 acessórios · pet completo':'Cápsula aberta · '+sd.unlocked+'/5 acessórios liberados'):'A cápsula é liberada junto com o Super Troféu.'}</span></div><img class="rc260-capsule-art" src="rc260_capsule_${({mist:'neblina',ocean:'oceano',space:'espaco',forest:'floresta',solar:'solar',coral:'coral'}[c.theme]||c.theme)}.jpg" alt="Cápsula do Universo ${esc(col.name)}"></div></section>

      <section class="r197-card"><div class="r197-head row"><div><span class="r197-kicker">COLEÇÃO ${String(col.order).padStart(2,'0')}</span><h3>${esc(col.name)}</h3><p>6 pets · biblioteca temática · 5 acessórios completam cada pet</p></div><span class="r197-count">6 pets</span></div><div class="r197-pets">${col.pets.map(pp=>`<button type="button" data-r152pet="${pp.id}" class="${pp.id===c.pet?'active':''} ${used.has(pp.id)?'used':''}"><span class="r197-pet-art">${img(pp.id)}</span><strong>${esc(pp.name)}</strong><small>${used.has(pp.id)?'conquistado':'disponível'}</small></button>`).join('')}</div></section>

      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">KIT DO PET</span><h3>${esc(pet.name)}</h3><p>5 acessórios exclusivos deste companheiro · cada 3 medalhas libera 1.</p></div></div><div class="r197-acc-grid">${pet.accessories.map((a,i)=>{const vv=variantFor(member.id,a.id);return `<label class="r197-acc ${i<sd.unlocked?'unlocked':''}"><input type="checkbox" disabled ${i<sd.unlocked?'checked':''}><span class="r197-acc-art">${img(a.id)}</span><strong>${esc(a.name)}</strong><small>${esc(a.slotLabel)}</small><div class="rc209-variants" role="group" aria-label="Variações de cor"><button type="button" data-rc209variant="0" data-aid="${a.id}" class="${vv===0?'active':''}"><i class="cool"></i><span>Névoa</span></button><button type="button" data-rc209variant="1" data-aid="${a.id}" class="${vv===1?'active':''}"><i class="warm"></i><span>Coral</span></button><button type="button" data-rc209variant="2" data-aid="${a.id}" class="${vv===2?'active':''}"><i class="mix"></i><span>Misto</span></button></div><div class="rc208-lock">${i<sd.unlocked?'Liberado':`Faltam ${Math.max(0,(i+1)*3-sd.accessoryMedals)} medalhas`}</div></label>`}).join('')}</div></section>

      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">BIBLIOTECA DO COMPANHEIRO</span><h3>${esc(pet.name)}</h3><p>Os cinco acessórios são próprios deste pet. Os próximos companheiros mudam formatos e funções para manter a coleção divertida.</p></div></div><div class="rc208-library">${pet.accessories.map(a=>`<span><i>${iconSvg(a.kind,col,mode,'✦',variantFor(member.id,a.id))}</i><b>${esc(a.name)}</b></span>`).join('')}</div></section>

      <section class="r197-card"><div class="r197-head"><div><span class="r197-kicker">CONFIGURAÇÃO DO OWNER</span><h3>Coleção, pet e ritmo</h3><p>O Owner escolhe o próximo alvo. A criança vê somente a própria jornada.</p></div></div><div class="r197-settings rc208-settings"><label>Coleção<select id="rc208CollectionSel">${COLLECTION_ORDER.map(k=>`<option value="${k}" ${k===c.theme?'selected':''}>${esc(COLLECTIONS[k].name)}</option>`).join('')}</select></label><label>Pet<select id="rc208PetSel">${col.pets.map(p=>`<option value="${p.id}" ${p.id===c.pet?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><label>Pontos por marco<input id="r152Pts" type="number" min="1" value="${c.pointsPerStep}"></label><label>Paleta<select id="r152Palette"><option value="auto">Automática pelo avatar</option><option value="neutral" ${mode==='neutral'?'selected':''}>Neutra</option><option value="boy" ${mode==='boy'?'selected':''}>Masculina</option><option value="girl" ${mode==='girl'?'selected':''}>Feminina</option></select></label></div><button class="primary r197-save" id="r152SaveCycle">Salvar ciclo</button></section>

      <section class="r197-card"><div class="r197-head row"><div><span class="r197-kicker">FECHAMENTO</span><h3>${sd.complete?'Pet completo':'Ciclo em andamento'}</h3><p>${sd.complete?'Os 5 acessórios foram liberados. Inicie nova cápsula / novo pet.':'A conclusão só é liberada quando o pet chegar a 5/5 acessórios.'}</p></div><button class="r147-action" id="r152FinishCycle" ${sd.complete?'':'disabled'}>Concluir pet</button></div><div class="r197-history">${hist.length?hist.slice().reverse().slice(0,12).map(h=>`<div><span>${img(h.pet)}</span><p><strong>${esc(COLLECTIONS[h.theme]?.name||'Coleção')} · Ciclo ${h.number}</strong><small>${esc(PET_MAP[h.pet]?.name||'Pet')} · concluído</small></p></div>`).join(''):'<div class="sat-empty">Nenhum pet concluído ainda.</div>'}</div></section>
    </section>`;
  };

  window.r152WireKids=function(){
    const sel=document.querySelector('#r152KidSel'); if(!sel)return;
    const render=()=>window.renderRewardsRC152?.('kids');
    sel.onchange=()=>{window.berthaHmlStorage.setItem('bertha.rewards.selected.kid',sel.value);render()};
    document.querySelectorAll('[data-rc209variant]').forEach(btn=>btn.onclick=(ev)=>{
      ev.preventDefault();ev.stopPropagation();
      const aid=btn.dataset.aid,v=Math.max(0,Math.min(2,Number(btn.dataset.rc209variant)||0));
      window.berthaHmlStorage.setItem(STORAGE.variant+String(sel.value)+'.'+aid,String(v));render();
    });
    document.querySelectorAll('[data-rc208collection]').forEach(b=>b.onclick=()=>{
      const key=b.dataset.rc208collection;window.berthaHmlStorage.setItem(STORAGE.collection+'.'+sel.value,key);
      const {all,box}=window.r152Box(sel.value);const c=window.r152EnsureCycle(sel.value);c.theme=key;c.pet=firstUnusedPet(box,key);c.accessories=PET_MAP[c.pet].accessories.map(a=>a.id);box.current=c;all[sel.value]=box;window.r152SaveAllCycles(all);render();
    });
    document.querySelectorAll('[data-r152pet]').forEach(b=>b.onclick=()=>{const {all,box}=window.r152Box(sel.value),c=window.r152EnsureCycle(sel.value);c.pet=b.dataset.r152pet;c.theme=PET_MAP[c.pet].collection;c.accessories=PET_MAP[c.pet].accessories.map(a=>a.id);box.current=c;all[sel.value]=box;window.r152SaveAllCycles(all);render()});
    document.querySelector('#rc208CollectionSel')?.addEventListener('change',e=>{const key=e.target.value;window.berthaHmlStorage.setItem(STORAGE.collection+'.'+sel.value,key);const {all,box}=window.r152Box(sel.value),c=window.r152EnsureCycle(sel.value);c.theme=key;c.pet=firstUnusedPet(box,key);c.accessories=PET_MAP[c.pet].accessories.map(a=>a.id);box.current=c;all[sel.value]=box;window.r152SaveAllCycles(all);render()});
    document.querySelector('#rc208PetSel')?.addEventListener('change',e=>{const {all,box}=window.r152Box(sel.value),c=window.r152EnsureCycle(sel.value);c.pet=e.target.value;c.theme=PET_MAP[c.pet].collection;c.accessories=PET_MAP[c.pet].accessories.map(a=>a.id);box.current=c;all[sel.value]=box;window.r152SaveAllCycles(all);render()});
    document.querySelector('#r152SaveCycle')?.addEventListener('click',e=>{const {all,box}=window.r152Box(sel.value),c=window.r152EnsureCycle(sel.value);c.pointsPerStep=Math.max(1,+document.querySelector('#r152Pts')?.value||20);c.medalsPerAccessory=3;box.current=c;all[sel.value]=box;window.r152SaveAllCycles(all);const pal=document.querySelector('#r152Palette')?.value||'auto';window.berthaHmlStorage?.setItem(STORAGE.palette+sel.value,pal);e.currentTarget.textContent='Salvo';setTimeout(()=>{e.currentTarget.textContent='Salvar ciclo';render()},500)});
    document.querySelector('#r152FinishCycle')?.addEventListener('click',()=>{const {all,box}=window.r152Box(sel.value),c=window.r152EnsureCycle(sel.value),sd=stageData(sel.value,c);if(!sd.complete)return;box.history.push({...c,status:'complete',completedAt:Date.now()});box.current=null;all[sel.value]=box;window.r152SaveAllCycles(all);render()});
  };

  function refresh(){
    if((location.hash||'').replace('#','')!=='premiacoes')return;
    const pane=document.querySelector('[data-r147pane="kids"]');if(!pane)return;
    const kids=(window.loadSatellites?.().members||[]).filter(m=>m.status!=='removed'&&m.role==='kids');if(!kids.length)return;
    let mid=window.berthaHmlStorage.getItem('bertha.rewards.selected.kid')||kids[0].id;if(!kids.some(k=>String(k.id)===String(mid)))mid=kids[0].id;
    pane.innerHTML=window.r152KidsPanel(mid);window.r152WireKids();
  }

  const style=document.createElement('style');style.id='rc208-kids-collections';style.textContent=`
    .rc208-collections{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:14px}.rc208-collections button{border:1px solid rgba(83,77,88,.10);border-radius:16px;background:#fffaf5;padding:9px 5px;display:grid;gap:2px;color:#625b66}.rc208-collections button b{font-size:8px;letter-spacing:.08em;color:#9a919b}.rc208-collections button span{font-size:9.5px}.rc208-collections button.active{background:linear-gradient(135deg,color-mix(in srgb,var(--c1) 25%,#fff),color-mix(in srgb,var(--c2) 22%,#fff));box-shadow:0 0 0 2px color-mix(in srgb,var(--c1) 32%,transparent)}
    .rc208-library{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;margin-top:13px}.rc208-library span{display:grid;gap:5px;text-align:center;align-content:start}.rc208-library i{width:58px;height:58px;border-radius:16px;background:#fffaf5;border:1px solid rgba(83,77,88,.08);display:grid;place-items:center;margin:auto;overflow:hidden}.rc208-library i svg{width:100%;height:100%}.rc208-library b{font-size:8px;font-weight:500;color:#746b76;line-height:1.2}.rc208-lock{font-size:8px;color:#8d8490;background:#f5f1ee;border-radius:999px;padding:4px 7px;margin-top:3px}.r197-acc.unlocked .rc208-lock{background:#edf6f1;color:#678071}.rc208-settings{grid-template-columns:repeat(4,minmax(0,1fr))!important}.r197-acc:not(.unlocked){opacity:.48!important}.r197-acc.unlocked{opacity:1!important}.r197-step.done>span{box-shadow:0 0 0 1px rgba(131,166,154,.25),0 7px 16px rgba(74,68,80,.06)}#r152FinishCycle:disabled{opacity:.45;pointer-events:none}.rc208-pet-proxy svg,.rc208-acc-proxy svg{width:100%;height:100%}
    @media(max-width:700px){.rc208-collections{grid-template-columns:repeat(3,minmax(0,1fr))}.rc208-library{grid-template-columns:repeat(4,minmax(0,1fr))}.rc208-settings{grid-template-columns:1fr 1fr!important}}
    @media(max-width:480px){.rc208-library{grid-template-columns:repeat(3,minmax(0,1fr))}.rc208-settings{grid-template-columns:1fr!important}.r197-head h3{line-height:1.25}}
    .rc258-trail-card{margin-top:16px}.rc258-trail{overflow-x:auto;scrollbar-width:none}.rc258-trail::-webkit-scrollbar{display:none}.rc258-trail .r197-step{min-width:92px}.rc258-reward-art{display:block!important;width:84px!important;height:84px!important;border-radius:18px!important;overflow:hidden!important;background:#fffaf5!important}.rc258-reward-art img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important}.rc258-capsule{background:linear-gradient(110deg,rgba(231,216,255,.58),rgba(255,236,199,.55),rgba(214,241,230,.58))!important}
  `;document.head.appendChild(style);

  function stamp(){
    document.documentElement.dataset.berthaBuild='RC239';document.documentElement.dataset.berthaIndex='RC239';
    const idx=document.getElementById('rc157IndexBadge');if(idx)idx.textContent='INDEX · RC239';
    document.querySelectorAll('body *').forEach(el=>{if(el.children.length===0&&/^HML\s*·\s*RC\d+/i.test((el.textContent||'').trim()))el.textContent='HML · RC209'});
  }
  stamp();setTimeout(stamp,200);setTimeout(stamp,850);
  window.addEventListener('pageshow',()=>{setTimeout(refresh,120);setTimeout(stamp,180)});
  document.addEventListener('click',e=>{if(e.target.closest('[data-r147tab="kids"]'))setTimeout(refresh,50)});
  setTimeout(refresh,180);setTimeout(refresh,520);

  (function injectRC209CSS(){
    if(document.getElementById('rc209KidsCss'))return;
    const st=document.createElement('style');st.id='rc209KidsCss';st.textContent=`
      .rc209-kids-shell .r197-pet-art{overflow:visible!important;padding:10px!important;box-sizing:border-box}
      .rc209-kids-shell .r197-pet-art img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;transform:scale(.88)!important;transform-origin:center center!important}
      .rc209-kids-shell .r197-acc-art{min-height:112px;display:grid;place-items:center}
      .rc209-kids-shell .r197-acc-art .r197-art svg{width:102px;height:102px;filter:drop-shadow(0 7px 10px rgba(78,70,88,.10))}
      .rc209-variants{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0 4px}
      .rc209-variants button{appearance:none;border:1px solid rgba(98,88,108,.12);background:rgba(255,255,255,.68);border-radius:14px;padding:7px 4px;display:flex;flex-direction:column;align-items:center;gap:4px;color:#726b76;font:inherit;font-size:11px}
      .rc209-variants button.active{box-shadow:0 0 0 2px rgba(142,126,164,.22);border-color:rgba(122,106,148,.32)}
      .rc209-variants i{width:28px;height:12px;border-radius:999px;display:block;border:1px solid rgba(255,255,255,.75)}
      .rc209-variants i.cool{background:linear-gradient(90deg,#a7c4d1,#9fd2c2,#f2e7d8)}
      .rc209-variants i.warm{background:linear-gradient(90deg,#df9c8f,#f0deb2,#b8d7b4)}
      .rc209-variants i.mix{background:linear-gradient(90deg,#9fd2c2,#df9c8f,#a7c4d1)}
      .rc209-kids-shell .rc208-library span{min-height:148px}
      .rc209-kids-shell .rc208-library i svg{width:84px;height:84px}
    `;document.head.appendChild(st);
  })();
})();

/* RC260 FINAL — escala + cápsulas ovo aprovadas */
(function(){
 if(document.getElementById('rc260-final-style'))return;
 const s=document.createElement('style');s.id='rc260-final-style';
 s.textContent=`
 .rc258-trail{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:5px!important;overflow:visible!important}
 .rc258-trail .r197-step{min-width:0!important;width:auto!important}
 .rc258-trail .rc258-reward-art{width:100%!important;height:auto!important;max-width:88px!important;aspect-ratio:1/1!important;margin:0 auto 6px!important;border-radius:15px!important}
 .rc258-trail .r197-step b{display:block!important;font-size:9px!important;line-height:1.12!important;text-align:center!important;font-weight:400!important}
 .rc260-capsule{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;overflow:hidden!important}
 .rc260-capsule>div{min-width:0!important;flex:1 1 auto!important}
 .rc260-capsule b,.rc260-capsule span{display:block!important}
 .rc260-capsule-art{width:82px!important;height:82px!important;flex:0 0 82px!important;object-fit:cover!important;border-radius:18px!important}
 @media(max-width:390px){.rc258-trail{gap:3px!important}.rc258-trail .rc258-reward-art{max-width:76px!important}.rc258-trail .r197-step b{font-size:8.5px!important}.rc260-capsule-art{width:72px!important;height:72px!important;flex-basis:72px!important}}
 `;
 document.head.appendChild(s);
})();

/* RC261 — microajuste final: Troféu/Super Troféu e cápsula */
(function(){
  if(document.getElementById('rc261-micro-style')) return;
  const s=document.createElement('style');
  s.id='rc261-micro-style';
  s.textContent=`
    /* Medalhas permanecem exatamente como na RC260.
       Reduz apenas os dois últimos itens: Troféu e Super Troféu. */
    .rc258-trail .r197-step:nth-child(4) .rc258-reward-art,
    .rc258-trail .r197-step:nth-child(5) .rc258-reward-art{
      transform:scale(.92)!important;
      transform-origin:center center!important;
    }

    /* Cápsula: 10% menor e centralizada no espaço da direita. */
    .rc260-capsule{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) 78px!important;
      align-items:center!important;
      column-gap:14px!important;
      padding-right:18px!important;
    }
    .rc260-capsule>div{
      min-width:0!important;
      align-self:center!important;
    }
    .rc260-capsule-art{
      width:74px!important;
      height:74px!important;
      flex:none!important;
      justify-self:center!important;
      align-self:center!important;
      margin:0!important;
      object-fit:cover!important;
      object-position:center!important;
    }

    @media(max-width:390px){
      .rc260-capsule{
        grid-template-columns:minmax(0,1fr) 68px!important;
        column-gap:10px!important;
        padding-right:14px!important;
      }
      .rc260-capsule-art{
        width:65px!important;
        height:65px!important;
      }
    }
  `;
  document.head.appendChild(s);
})();

/* RC263 — tamanho RC261 + centralização sem encolher os troféus */
(function(){
 if(document.getElementById('rc263-trophy-align'))return;
 const s=document.createElement('style'); s.id='rc263-trophy-align';
 s.textContent=`
   /* Os dois últimos slots ocupam normalmente suas colunas. */
   .rc258-trail .r197-step:nth-child(4),
   .rc258-trail .r197-step:nth-child(5){
     min-width:0!important;
     width:auto!important;
     overflow:visible!important;
     display:flex!important;
     flex-direction:column!important;
     align-items:center!important;
   }

   /* Recupera exatamente a escala visual da RC261,
      mas centraliza a caixa em vez de deixá-la ancorada lateralmente. */
   .rc258-trail .r197-step:nth-child(4) .rc258-reward-art,
   .rc258-trail .r197-step:nth-child(5) .rc258-reward-art{
     width:100%!important;
     max-width:88px!important;
     margin-left:auto!important;
     margin-right:auto!important;
     position:relative!important;
     left:50%!important;
     right:auto!important;
     transform:translateX(-50%) scale(.92)!important;
     transform-origin:center center!important;
     overflow:visible!important;
     box-sizing:border-box!important;
   }

   /* O JPG continua inteiro: nada de crop. */
   .rc258-trail .r197-step:nth-child(4) .rc258-reward-art img,
   .rc258-trail .r197-step:nth-child(5) .rc258-reward-art img{
     display:block!important;
     width:100%!important;
     height:100%!important;
     max-width:100%!important;
     max-height:100%!important;
     object-fit:contain!important;
     object-position:center center!important;
     margin:0!important;
     transform:none!important;
   }

   /* Mantém a cápsula no posicionamento que funcionou visualmente na RC262. */
   .rc260-capsule-art{
     position:relative!important;
     left:-9px!important;
   }

   @media(max-width:390px){
     .rc258-trail .r197-step:nth-child(4) .rc258-reward-art,
     .rc258-trail .r197-step:nth-child(5) .rc258-reward-art{
       max-width:76px!important;
       left:50%!important;
       transform:translateX(-50%) scale(.92)!important;
     }
     .rc260-capsule-art{left:-8px!important}
   }
 `;
 document.head.appendChild(s);
})();