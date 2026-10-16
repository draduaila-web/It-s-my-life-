/* BERTH.A coordinated selective reset, local policy v1.
 * Offline artifact. Loading this module has no side effects and no network access.
 * Input/output and rollback data stay in caller memory or HML-prefixed storage.
 */
(function(root,factory){
  'use strict';
  if(typeof module==='object' && module.exports) module.exports=factory();
  else root.BerthaScopedReset=factory();
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const SOURCE_URL='https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/';
const SOURCE_PREFIX='bertha-hml::';
const PREFIX='bertha-hml-reset-v1::';
const FORMAT='BERTHA_SCOPED_RESET_PLAN';
const POLICY_VERSION=1;
// Validate syntax, duplicate properties and exact decimal representability before
// JSON.parse can silently discard information. No evaluation or coercion.
function decimal(token) {
  const [mantissa, expText = '0'] = token.toLowerCase().split('e');
  const negative = mantissa.startsWith('-');
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const [whole, fraction = ''] = unsigned.split('.');
  let digits = (whole + fraction).replace(/^0+/, '');
  let exponent = Number(expText) - fraction.length;
  if (!digits) return negative ? '-0' : '0';
  while (digits.endsWith('0')) { digits = digits.slice(0, -1); exponent++; }
  return `${negative ? '-' : ''}${digits}e${exponent}`;
}
function parseStrictJSON(text) {
  if (typeof text !== 'string') throw Error('JSON deve ser texto.');
  let pos = 0;
  const fail = () => { throw Error('JSON inválido, duplicado ou com número não representável sem perda.'); };
  const ws = () => { while (pos < text.length && /[\x20\x09\x0a\x0d]/.test(text[pos])) pos++; };
  function string() {
    const start = pos++;
    while (pos < text.length) {
      const char = text[pos++];
      if (char === '\\') { pos++; continue; }
      if (char === '"') {
        try { return JSON.parse(text.slice(start, pos)); } catch { fail(); }
      }
    }
    fail();
  }
  function value(depth = 0) {
    if (depth >= 100) fail();
    ws(); const char = text[pos];
    if (char === '"') { string(); return; }
    if (char === '{') {
      pos++; ws(); const names = new Set();
      if (text[pos] === '}') { pos++; return; }
      while (true) {
        ws(); if (text[pos] !== '"') fail(); const name = string();
        if (names.has(name)) fail(); names.add(name);
        ws(); if (text[pos++] !== ':') fail(); value(depth + 1); ws();
        const end = text[pos++]; if (end === '}') return; if (end !== ',') fail();
      }
    }
    if (char === '[') {
      pos++; ws(); if (text[pos] === ']') { pos++; return; }
      while (true) { value(depth + 1); ws(); const end = text[pos++]; if (end === ']') return; if (end !== ',') fail(); }
    }
    for (const literal of ['true', 'false', 'null']) if (text.startsWith(literal, pos)) { pos += literal.length; return; }
    const match = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(text.slice(pos));
    if (!match) fail();
    const token = match[0], num = Number(token);
    if (token.length > 1000 || !Number.isFinite(num) || Object.is(num, -0) || decimal(token) !== decimal(String(num))) fail();
    pos += token.length;
  }
  value(); ws(); if (pos !== text.length) fail();
  return JSON.parse(text);
}

const owns = (x, k) => Object.prototype.hasOwnProperty.call(x, k);
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const clone = x => JSON.parse(JSON.stringify(x));
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// Diagnostic only. Integrity is enforced by exact policy recomputation, never this checksum.
const digest = text => { let n=2166136261; for(let i=0;i<text.length;i++) n=Math.imul(n ^ text.charCodeAt(i),16777619); return (n>>>0).toString(16).padStart(8,'0'); };
const hash = x => digest(JSON.stringify(x));
const canonical = x => Array.isArray(x) ? x.map(canonical) : object(x)
  ? Object.fromEntries(Object.keys(x).sort().map(k => [k, canonical(x[k])])) : x;
const dataHash = data => hash(canonical(data));
const forbiddenNames = new Set(['__proto__', 'prototype', 'constructor']);
function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }
function inspectKeys(x, depth = 0) {
  assert(depth < 100, 'Estrutura excessivamente profunda; revisão manual necessária.');
  if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) {
    assert(!forbiddenNames.has(k), 'Nome de campo reservado; arquivo recusado.');
    inspectKeys(v, depth + 1);
  }
}
const sensitiveKey = k => /(^|[.:_-])(auth|oauth|token|password|secret|credential|api[._:-]?key|session[._:-]?key|access[._:-]?token|refresh[._:-]?token)([.:_-]|$)/i.test(String(k).replace(/([a-z0-9])([A-Z])/g, '$1_$2'));
function inspectSecrets(value) {
  if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
    assert(!sensitiveKey(key), 'Campo possivelmente secreto detectado; arquivo recusado.');
    inspectSecrets(child);
  }
}
const POLICY = Object.freeze({
  engine: 'bertha.time-engine.v1',
  learning: 'bertha.duration-learning.v1',
  achievements: 'bertha.owner.achievements.v1',
  studies: 'minha-vida.estudos.v1',
  studyMarks: 'minha-vida.estudos.mapas.v1',
  exercises: 'minha-vida.exercicios.v1',
  food: 'minha-vida.alimentacao.v1',
  foodIntelligence: 'bertha.food-intelligence.v1',
  recipes: 'minha-vida.receitas.v1',
  casa: 'minha-vida.casa.v1',
  casaExecutions: 'minha-vida.casa.executions.v1',
  ritualChecklists: 'bertha.ritual.checklists.v1',
  tasks: 'minha-vida.pendencias.v1',
  ideas: 'minha-vida.ideias.v1',
  kidsProgress: 'bertha.kids.progress.v1',
  kidsCycles: 'bertha.kids.cycles.v2',
  kidsMissions: 'bertha.kids.missions.v1',
  recognitions: 'bertha.recognitions.v1',
  work: Object.freeze(['minha-vida.trabalho.crefito.v1', 'minha-vida.trabalho.bec.v1', 'minha-vida.trabalho.tiktok.v1'])
});
const executionTimes = ['startedAt', 'completedAt', 'lastCompletedAt', 'actualMinutes'];
const sharedFields = ['claimedById', 'assigneeId', 'completedById', 'networkPendingRef', 'networkCompletedRef', 'networkTaskId', 'pointsAwardedAt'];
function isShared(row) {
  return ['help', 'delegated'].includes(row.responsibility)
    || sharedFields.some(k => Boolean(row[k]))
    || (Array.isArray(row.targets) && row.targets.length > 0)
    || (Array.isArray(row.allowedMembers) && row.allowedMembers.length > 0)
    || (Array.isArray(row.assigneeIds) && row.assigneeIds.length > 0)
    || (typeof row.satelliteStatus === 'string' && !['', 'open'].includes(row.satelliteStatus));
}
function shape(value, kind, key) {
  const valid = kind === 'array' ? Array.isArray(value) : object(value);
  assert(valid, `Esquema inesperado em ${key}; proposta inteira bloqueada, sem coerção.`);
}


function transformEntries(inputData, options = {}) {
  validateEntries(inputData);
  const candidate = clone(inputData);
  const operations = [];
  const reviews = [];
  const visited = new Set();
  const parsedBefore = new Map();
  const parsedAfter = new Map();
  const warn = (code, key, detail) => {
    if (!reviews.some(x => x.code === code && x.key === key)) reviews.push({ code, key, detail });
  };
  function mutate(key, kind, fn) {
    if (!owns(inputData, key)) return;
    visited.add(key);
    let before;
    try { before = parseStrictJSON(inputData[key]); } catch { fail(`JSON interno inválido em ${key}; proposta bloqueada.`); }
    inspectKeys(before);
    shape(before, kind, key);
    const after = clone(before);
    parsedBefore.set(key, before);
    const localOps = [];
    function at(path) {
      let parent = after;
      for (const part of path.slice(0, -1)) {
        assert(parent !== null && typeof parent === 'object' && owns(parent, part), 'Caminho interno inválido.');
        parent = parent[part];
      }
      return [parent, path.at(-1)];
    }
    function change(path, mode, value, reason) {
      const [parent, field] = at(path);
      if (!owns(parent, field) && !(key === POLICY.exercises && path.length === 1 && field === 'plans' && mode === 'set')) return;
      const existed = owns(parent, field);
      const old = parent[field];
      if (mode === 'delete') assert(old === null || ['number', 'string'].includes(typeof old), `Campo de execução com esquema desconhecido em ${key}.`);
      if (mode === 'set' && value === null) {
        const objectTarget = (key === 'bertha.time-engine.v1' && path.length === 1 && field === 'active') ||
          (key === 'bertha.food-intelligence.v1' && path.length === 1 && field === 'lastBatch');
        const valid = objectTarget ? old === null || object(old)
          : key === 'bertha.duration-learning.v1' ? old === null || typeof old === 'number'
          : field === 'cookingProgressKey' ? old === null || typeof old === 'string'
          : old === null || ['number', 'string'].includes(typeof old);
        assert(valid, `Campo anulável com esquema desconhecido em ${key}.`);
      }
      if (mode === 'set' && existed && value !== null && ['string', 'number', 'boolean'].includes(typeof value))
        assert(typeof old === typeof value || old === null && typeof value === 'number', `Tipo de campo inesperado em ${key}; nenhuma coerção permitida.`);
      if (mode === 'set' && equal(old, value)) return;
      const operation = { key, path: [...path], mode, reason, existed, beforeHash: existed ? hash(old) : null,
        beforeCount: Array.isArray(old) ? old.length : object(old) ? Object.keys(old).length : null };
      if (mode === 'delete') delete parent[field];
      else { parent[field] = clone(value); operation.afterHash = hash(value); }
      localOps.push(operation);
    }
    const set = (path, value, reason) => change(path, 'set', value, reason);
    const remove = (path, reason) => change(path, 'delete', null, reason);
    function rows(path, fnRow) {
      let rows = after;
      for (const part of path) {
        if (!owns(rows, part)) return;
        rows = rows[part];
      }
      shape(rows, 'array', key);
      rows.forEach((row, i) => { shape(row, 'object', key); fnRow(row, [...path, i]); });
    }
    function fields(path, entries, reason) {
      for (const [field, value] of Object.entries(entries)) set([...path, field], value, reason);
    }
    function clearArrays(path, names, reason) {
      let target = after;
      for (const part of path) target = target[part];
      for (const name of names) if (owns(target, name)) {
        shape(target[name], 'array', key); set([...path, name], [], reason);
      }
    }
    function clearMaps(path, names, reason) {
      let target = after;
      for (const part of path) target = target[part];
      for (const name of names) if (owns(target, name)) {
        shape(target[name], 'object', key); set([...path, name], {}, reason);
      }
    }
    const context = { set, remove, rows, fields, clearArrays, clearMaps, warn: (code, detail) => warn(code, key, detail) };
    fn(after, context);
    if (localOps.length) candidate[key] = JSON.stringify(after);
    parsedAfter.set(key, after);
    operations.push(...localOps);
  }
  mutate(POLICY.engine, 'object', (v, c) => {
    if (owns(v, 'active')) assert(v.active === null || object(v.active), 'Timer ativo com esquema desconhecido.');
    const hadActiveTimer = Boolean(v.active) || (Array.isArray(v.actives) && v.actives.length > 0);
    c.clearArrays([], ['history', 'actives'], 'Execuções e timers ativos');
    c.clearMaps([], ['snoozed'], 'Adiamentos operacionais');
    c.set(['active'], null, 'Timer ativo');
    if (hadActiveTimer) c.warn('ACTIVE_TIMER', 'Um timer estava ativo; interromper o aplicativo seria obrigatório antes de qualquer aplicação futura.');
  });
  mutate(POLICY.learning, 'object', (v, c) => {
    if (!owns(v, 'items')) return;
    shape(v.items, 'object', POLICY.learning);
    for (const [id, row] of Object.entries(v.items)) {
      shape(row, 'object', POLICY.learning);
      c.clearArrays(['items', id], ['samples'], 'Amostras de duração aprendida');
      c.fields(['items', id], { count: 0, usableCount: 0, learned: false, learnedMinutes: null,
        confidence: 'collecting', lastMinutes: null, medianMinutes: null, spreadMinutes: null }, 'Indicadores aprendidos');
      if (owns(row, 'suggestedMinutes')) {
        if (typeof row.configuredMinutes === 'number' && row.configuredMinutes > 0)
          c.set(['items', id, 'suggestedMinutes'], row.configuredMinutes, 'Volta à duração configurada');
        else c.remove(['items', id, 'suggestedMinutes'], 'Sem duração configurada; não inventar valor');
      }
      c.remove(['items', id, 'updatedAt'], 'Data da última aprendizagem');
    }
  });
  mutate(POLICY.achievements, 'object', (v, c) => {
    assert(v.version === 1, 'Versão desconhecida de conquistas Owner.');
    c.clearArrays([], ['awards'], 'Conquistas obtidas, preservando os critérios em chave separada');
    c.clearMaps([], ['seen', 'pending'], 'Estado derivado das conquistas');
    if(owns(v,'sourcesVersion')) { assert([1,2].includes(v.sourcesVersion),'Versão desconhecida de fontes de conquistas Owner.'); c.set(['sourcesVersion'],1,'Baseline inicial evita premiar novamente metas preservadas'); }
    c.warn('AWARDS_REBASE', 'sourcesVersion=1 aciona baseline sem premiação em RC362; metas e indicadores financeiros preservados podem continuar visíveis.');
  });
  mutate(POLICY.studies, 'object', (v, c) => {
    c.clearArrays([], ['sessions'], 'Sessões de estudos');
    if ((v.reviews || []).length || (v.questions || []).length)
      c.warn('STUDY_LEGACY', 'reviews/questions legados preservados: significado não comprovado no código atual.');
  });
  mutate(POLICY.studyMarks, 'object', (v, c) => {
    for (const [id, row] of Object.entries(v)) {
      shape(row, 'object', POLICY.studyMarks);
      c.fields([id], { primeira: false, questoes: false, domino: false, r1: false, r3: false, r7: false, r15: false }, 'Marcações de estudo e revisão');
      for (const field of ['primeiraAt', 'r1Due', 'r3Due', 'r7Due', 'r15Due'])
        c.remove([id, field], 'Data derivada da primeira leitura; conteúdo do mapa preservado');
    }
  });
  mutate(POLICY.exercises, 'object', (v, c) => {
    c.clearArrays([], ['plans', 'sessions'], 'Treinos cadastrados e sessões; remoção do catálogo autorizada');
    if (!owns(v, 'plans')) c.set(['plans'], [], 'Override explícito impede restaurar treinos padrão');
    if ((v.cycles || []).length || (v.weeklyPlan?.cycles || []).length)
      c.warn('EXERCISE_CYCLES', 'Ciclos e plano semanal preservados integralmente; a autorização para removê-los precisa ser esclarecida.');
  });
  if (!owns(inputData, POLICY.exercises)) {
    candidate[POLICY.exercises] = JSON.stringify({ plans: [] });
    operations.push({key:POLICY.exercises,path:[],mode:'create',reason:'Override explícito impede treinos padrão',existed:false,beforeHash:null,afterHash:hash({plans:[]})});
  }
  mutate(POLICY.food, 'object', (v, c) => {
    c.clearArrays([], ['cookingHistory', 'lastCookedRecipeIds'], 'Histórico de preparo');
    c.fields([], { cookingDone: false, cookingDoneAt: null, cookingProgressKey: null }, 'Marcações de preparo');
    if (!owns(v, 'mealLog')) return;
    shape(v.mealLog, 'object', POLICY.food);
    for (const [date, day] of Object.entries(v.mealLog)) {
      shape(day, 'object', POLICY.food);
      if (!owns(day, 'meals')) continue;
      shape(day.meals, 'object', POLICY.food);
      for (const [id, meal] of Object.entries(day.meals)) {
        shape(meal, 'object', POLICY.food);
        for (const field of ['consumption', 'consumedAt', 'skippedAt'])
          c.remove(['mealLog', date, 'meals', id, field], 'Consumo registrado; escolhas e planejamento preservados');
      }
    }
  });
  mutate(POLICY.foodIntelligence, 'object', (v, c) => {
    c.clearArrays([], ['recentBatches', 'recentPreparedRecipeIds'], 'Histórico derivado dos preparos');
    c.clearMaps([], ['frequencyByRecipe'], 'Frequência aprendida');
    c.set(['lastBatch'], null, 'Último preparo');
    c.remove(['updatedAt'], 'Data do cálculo aprendido');
  });
  mutate(POLICY.recipes, 'object', (v, c) => c.clearArrays([], ['consumptionLog'], 'Consumo; receitas, favoritos e nutrição preservados'));
  mutate(POLICY.casaExecutions, 'array', (v, c) => {
    // Top-level arrays are handled through an explicit bounded operation.
    // A wrapper allows the same mutation engine to preserve the outer schema.
  });
  // Explicit top-level history array: no recursive or prefix-based deletion.
  if (owns(inputData, POLICY.casaExecutions)) {
    const before = parsedBefore.get(POLICY.casaExecutions);
    if (before.length) {
      candidate[POLICY.casaExecutions] = '[]';
      parsedAfter.set(POLICY.casaExecutions, []);
      operations.push({ key: POLICY.casaExecutions, path: [], mode: 'set', reason: 'Execuções da Casa', beforeHash: hash(before), afterHash: hash([]), beforeCount: before.length });
    }
  }
  function resetSharedExecution(row, path, c) {
    for (const field of ['claimedById','completedById','networkPendingRef','networkCompletedRef','networkTaskId','pointsAwardedAt']) c.remove([...path,field], 'Execução de rede anterior; critérios e destinatários preservados');
    // assigneeId is written by claim, but can also be a legacy assignment. Preserve it when no canonical assignment list proves its runtime role.
    if (owns(row,'assigneeId') && Array.isArray(row.assigneeIds) && row.assigneeIds.length) c.remove([...path,'assigneeId'],'Atribuição corrente; lista configurada preservada');
    else if (row.assigneeId) c.warn('LEGACY_ASSIGNEE_PRESERVED','assigneeId sem assigneeIds foi preservado por ambiguidade entre cadastro e execução.');
    if (owns(row,'declinedByIds')) { shape(row.declinedByIds,'array','declinedByIds'); c.set([...path,'declinedByIds'],[],'Recusas anteriores'); }
    if (owns(row,'satelliteStatus')) {
      assert(typeof row.satelliteStatus==='string' && ['', 'open','available','assigned','accepted','in_progress','completed','validated'].includes(row.satelliteStatus),'Estado de rede desconhecido.');
      c.set([...path,'satelliteStatus'],row.responsibility==='help'?'available':row.responsibility==='delegated'?'assigned':'open','Estado de execução; configuração de ajuda preservada');
    }
  }
  mutate(POLICY.casa, 'object', (v, c) => {
    const reset = (row, path, maintenance = false) => {
      resetSharedExecution(row, path, c);
      c.fields(path, { done: false }, 'Marcação de realização da Casa');
      for (const field of ['completedAt', 'lastCompletedAt']) c.remove([...path, field], 'Última realização da Casa');
      if (maintenance && ['concluida', 'Concluído', 'aguardando_validacao'].includes(row.status)) c.set([...path, 'status'], 'a_fazer', 'Estado de execução da manutenção');
      if (row.nextDue || maintenance && row.date) c.warn('CASA_DATES', 'Datas e nextDue preservados: não é possível distinguir todas as datas configuradas das datas avançadas por execução.');
    };
    c.rows(['areas'], (area, p) => c.rows([...p, 'tasks'], (row, tp) => reset(row, tp)));
    c.rows(['maintenance'], (row, p) => reset(row, p, true));
  });
  mutate(POLICY.ritualChecklists, 'object', (v, c) => {
    for (const [id, row] of Object.entries(v)) {
      shape(row, 'object', POLICY.ritualChecklists);
      c.clearMaps([id], ['marks'], 'Checklist de execução; etapas e cuidados preservados');
      c.remove([id, 'updatedAt'], 'Última marcação');
    }
  });
  function resetTask(v, c, status) {
    c.rows([], (row, p) => {
      const dated=[row.dueDate,row.date,row.nextDue].find(x=>typeof x==='string' && /^\d{4}-\d{2}-\d{2}$/.test(x));
      if(options.resetFloor && (!dated || dated<options.resetFloor)) {
        c.warn('BLOCKER_OLD_LOCAL_PENDING','Cadastro anterior ou sem data preservado: não é possível distinguir teste passado de compromisso válido. Não reabrir nem excluir silenciosamente.');
        return;
      }
      resetSharedExecution(row, p, c);
      c.fields(p, { done: false, completed: false }, 'Marcações da tarefa; o cadastro será reaberto na proposta');
      for (const field of executionTimes) c.remove([...p, field], 'Tempo e conclusão da tarefa');
      if (['Concluído', 'concluido', 'concluida', 'done', 'Em andamento', 'aguardando_validacao'].includes(row.status))
        c.set([...p, 'status'], status, 'Reabrir o cadastro preservando datas, detalhes e recorrência');
    });
  }
  mutate(POLICY.tasks, 'array', (v, c) => resetTask(v, c, 'Aberto'));
  const workKeys = new Set(POLICY.work);
  if (owns(inputData, 'bertha.work.fronts.v1')) {
    let fronts;
    try { fronts = parseStrictJSON(inputData['bertha.work.fronts.v1']); } catch { fail('Catálogo de frentes de trabalho inválido.'); }
    shape(fronts, 'array', 'bertha.work.fronts.v1');
    for (const front of fronts) {
      if (object(front) && typeof front.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(front.id))
        workKeys.add(`minha-vida.trabalho.custom.${front.id}.v1`);
    }
  }
  for (const key of workKeys) mutate(key, 'array', (v, c) => resetTask(v, c, 'A fazer'));
  mutate(POLICY.ideas, 'array', (v, c) => {
    c.rows([], (row, p) => {
      if (row.type !== 'projeto') return;
      resetSharedExecution(row, p, c);
      c.set([...p, 'progressMinutes'], 0, 'Tempo realizado do projeto');
      for (const field of ['lastWorkedAt', 'completedAt']) c.remove([...p, field], 'Execução do projeto');
      if (['concluido', 'Concluído'].includes(row.status)) c.set([...p, 'status'], 'ativo', 'Reabrir projeto sem mudar conteúdo, prazo ou total planejado');
    });
  });
  mutate(POLICY.kidsProgress, 'object', (v,c) => {
    for (const [id,row] of Object.entries(v)) {
      shape(row,'object',POLICY.kidsProgress);
      c.fields([id],{lifetime:0,season:0},'Pontos Kids anteriores');
      c.clearArrays([id],['awards','log'],'Conquistas e histórico Kids');
      c.clearMaps([id],['networkClaims'],'Créditos de ocorrências anteriores');
    }
  });
  mutate(POLICY.kidsCycles, 'object', (v,c) => {
    for (const [id,box] of Object.entries(v)) {
      shape(box,'object',POLICY.kidsCycles);
      c.clearArrays([id],['history'],'Histórico de ciclos Kids');
      if (owns(box,'current') && box.current !== null) {
        shape(box.current,'object',POLICY.kidsCycles);
        c.fields([id,'current'],{number:1,startLifetime:0,rc393AwardFloor:0,rc393AccessoryFloor:0},'Contadores do ciclo Kids; critérios, tema e pet preservados');
        for (const field of ['completedAt']) c.remove([id,'current',field],'Conclusão anterior do ciclo');
        if (owns(box.current,'status')) {
          assert(['active','complete','completed'].includes(box.current.status),'Estado de ciclo Kids desconhecido.');
          c.set([id,'current','status'],'active','Reabrir o ciclo mantendo sua configuração');
        }
      }
    }
  });
  mutate(POLICY.kidsMissions, 'array', (v,c) => resetTask(v,c,'Aberto'));
  mutate(POLICY.recognitions, 'array', () => {});
  if (owns(inputData,POLICY.recognitions)) {
    const before=parsedBefore.get(POLICY.recognitions);
    before.forEach(row=>shape(row,'object',POLICY.recognitions));
    if(before.length) {
      candidate[POLICY.recognitions]='[]'; parsedAfter.set(POLICY.recognitions,[]);
      operations.push({key:POLICY.recognitions,path:[],mode:'set',reason:'Histórico de reconhecimentos; presets e mensagens independentes preservados',existed:true,beforeHash:hash(before),afterHash:hash([]),beforeCount:before.length});
    }
  }
  for (const [key, code, detail] of [
    ['bertha.repeat-queue.v1', 'REPEAT_QUEUE', 'Fila de repetições preservada: pode conter atividades futuras solicitadas. Não é seguro descartá-la inteira.'],
    ['bertha.ritual.events.v2', 'RITUAL_EVENTS', 'Cuidados, cronogramas e eventos de ritual preservados integralmente; não são um log de execução.'],
    ['bertha.ritual.cycles.v1', 'RITUAL_CYCLES', 'Ciclos de ritual preservados: estado de execução e programação estão misturados.'],
    ['bertha.commitments.v1', 'COMMITMENTS', 'Compromissos preservados integralmente, inclusive datas futuras e estados mistos.'],
    ['minha-vida.compras.v1', 'PURCHASE_RECORDS', 'Compras preservadas: marcações podem ser comprovantes de transações.'],
    ['minha-vida.saude.v1', 'HEALTH_RECORDS', 'Registros de saúde preservados integralmente.']
  ]) if (owns(inputData, key)) warn(code, key, detail);
  if (Object.keys(inputData).some(k => /^bertha\.(kids|satellite|recognition|network|helper|invites)/.test(k)))
    warn('NETWORK_STATE', 'rede', 'Estado remoto e demais aparelhos exigem reset e epoch coordenados; este módulo só modifica a allowlist local. Mensagens, membros e regras permanecem intactos.');
  if (Object.keys(inputData).some(k => /(^minha-vida\.financeiro\.|^bertha\.finance\.)/.test(k)))
    warn('FINANCE_PRESERVED', 'financeiro', 'Todos os registros financeiros permanecem intactos; os indicadores financeiros podem continuar mostrando histórico.');

  // Strong preservation check: reverse only the recorded allowlisted field changes
  // in a disposable clone and compare the complete original, including unknown fields.
  const restoredSemantic = new Map([...parsedAfter].map(([k, v]) => [k, clone(v)]));
  for (const op of [...operations].reverse()) {
    if (op.mode === 'create') continue;
    if (!op.path.length) { restoredSemantic.set(op.key, clone(parsedBefore.get(op.key))); continue; }
    let original = parsedBefore.get(op.key), target = restoredSemantic.get(op.key);
    for (const part of op.path.slice(0, -1)) { original = original[part]; target = target[part]; }
    const last = op.path.at(-1);
    if (!owns(original,last)) delete target[last];
    else Object.defineProperty(target, last, { value: clone(original[last]), enumerable: true, configurable: true, writable: true });
  }
  for (const [key, value] of restoredSemantic)
    assert(equal(canonical(value), canonical(parsedBefore.get(key))), `Falha de preservação em ${key}.`);
  for (const key of Object.keys(inputData)) if (!operations.some(x => x.key === key))
    assert(candidate[key] === inputData[key], 'Uma chave não autorizada foi alterada.');

  for (const op of operations) assert(allowedOperation(op.key, op.path), 'Operação fora da whitelist independente.');
  const changedKeys = [...new Set(operations.map(x => x.key))].sort();
  return { candidate, changedKeys, operations, reviews, structuralPreservationVerified: true };
}
// Independent final audit: only these literal key/path combinations may differ.
function allowedOperation(key, path) {
  const fields = {
    'bertha.time-engine.v1': ['history', 'actives', 'active', 'snoozed'],
    'bertha.owner.achievements.v1': ['awards', 'seen', 'pending', 'sourcesVersion'],
    'minha-vida.estudos.v1': ['sessions'],
    'minha-vida.exercicios.v1': ['plans', 'sessions'],
    'minha-vida.receitas.v1': ['consumptionLog'],
    'bertha.food-intelligence.v1': ['recentBatches', 'recentPreparedRecipeIds', 'frequencyByRecipe', 'lastBatch', 'updatedAt'],
    'minha-vida.alimentacao.v1': ['cookingHistory', 'lastCookedRecipeIds', 'cookingDone', 'cookingDoneAt', 'cookingProgressKey']
  };
  if (path.length === 1 && fields[key]?.includes(path[0])) return true;
  if (key === POLICY.exercises && path.length === 0) return true;
  if (key === POLICY.recognitions && path.length === 0) return true;
  if (key === POLICY.kidsProgress) return path.length===2 && ['lifetime','season','awards','log','networkClaims'].includes(path[1]);
  if (key === POLICY.kidsCycles) return path.length===2 && path[1]==='history' || path.length===3 && path[1]==='current' && ['number','startLifetime','rc393AwardFloor','rc393AccessoryFloor','completedAt','status'].includes(path[2]);
  const runtime=['claimedById','completedById','networkPendingRef','networkCompletedRef','networkTaskId','pointsAwardedAt','assigneeId','declinedByIds','satelliteStatus'];
  const rowKey=key===POLICY.tasks || key===POLICY.ideas || key===POLICY.kidsMissions || /^minha-vida\.trabalho\.(crefito|bec|tiktok|custom\.[A-Za-z0-9_-]+)\.v1$/.test(key);
  if (rowKey && path.length===2 && Number.isInteger(path[0]) && runtime.includes(path[1])) return true;
  if(key===POLICY.casa && ((path.length===5 && path[0]==='areas' && Number.isInteger(path[1]) && path[2]==='tasks' && Number.isInteger(path[3]) && runtime.includes(path[4])) || (path.length===3 && path[0]==='maintenance' && Number.isInteger(path[1]) && runtime.includes(path[2])))) return true;
  if (key === 'minha-vida.casa.executions.v1') return path.length === 0;
  if (key === 'bertha.duration-learning.v1') return path.length === 3 && path[0] === 'items' && typeof path[1] === 'string' &&
    ['samples', 'count', 'usableCount', 'learned', 'learnedMinutes', 'confidence', 'lastMinutes', 'medianMinutes', 'spreadMinutes', 'suggestedMinutes', 'updatedAt'].includes(path[2]);
  if (key === 'minha-vida.estudos.mapas.v1') return path.length === 2 && typeof path[0] === 'string' &&
    ['primeira', 'questoes', 'domino', 'r1', 'r3', 'r7', 'r15', 'primeiraAt', 'r1Due', 'r3Due', 'r7Due', 'r15Due'].includes(path[1]);
  if (key === 'minha-vida.alimentacao.v1') return path.length === 5 && path[0] === 'mealLog' && typeof path[1] === 'string' && path[2] === 'meals' && typeof path[3] === 'string' && ['consumption', 'consumedAt', 'skippedAt'].includes(path[4]);
  if (key === 'minha-vida.casa.v1') return (path.length === 5 && path[0] === 'areas' && Number.isInteger(path[1]) && path[2] === 'tasks' && Number.isInteger(path[3]) && ['done', 'completedAt', 'lastCompletedAt'].includes(path[4])) ||
    (path.length === 3 && path[0] === 'maintenance' && Number.isInteger(path[1]) && ['done', 'completedAt', 'lastCompletedAt', 'status'].includes(path[2]));
  if (key === 'bertha.ritual.checklists.v1') return path.length === 2 && typeof path[0] === 'string' && ['marks', 'updatedAt'].includes(path[1]);
  if (key === POLICY.kidsMissions || key === 'minha-vida.pendencias.v1' || /^minha-vida\.trabalho\.(crefito|bec|tiktok|custom\.[A-Za-z0-9_-]+)\.v1$/.test(key))
    return path.length === 2 && Number.isInteger(path[0]) && ['done', 'completed', 'startedAt', 'completedAt', 'lastCompletedAt', 'actualMinutes', 'status'].includes(path[1]);
  if (key === 'minha-vida.ideias.v1') return path.length === 2 && Number.isInteger(path[0]) && ['progressMinutes', 'lastWorkedAt', 'completedAt', 'status'].includes(path[1]);
  return false;
}

const TARGET_NETWORK='405f9c98-9e4d-4a41-98d3-8f3c1475c912';
const FRONT_KEY='bertha.work.fronts.v1';
const BASE_KEYS=Object.freeze([...Object.values(POLICY).filter(x=>typeof x==='string'),...POLICY.work,FRONT_KEY]);
function freeze(value) { if(value && typeof value==='object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function validateEntries(entries) {
  assert(object(entries) && [Object.prototype,null].includes(Object.getPrototypeOf(entries)),'Mapa de storage inválido.');
  let size=0;
  for(const key of Object.keys(entries)) {
    assert(!forbiddenNames.has(key) && /^(bertha\.|minha-vida\.)/.test(key) && !sensitiveKey(key),'Chave secreta ou namespace inválido; entrada recusada.');
    const descriptor=Object.getOwnPropertyDescriptor(entries,key);
    assert(descriptor && owns(descriptor,'value') && typeof descriptor.value==='string','Valores precisam ser strings sem accessors.');
    if(/^[\s]*[\[{]/.test(descriptor.value)) {const value=parseStrictJSON(descriptor.value);inspectKeys(value);inspectSecrets(value);}
    size+=key.length+descriptor.value.length;
    assert(size<=16*1024*1024,'Mapa acima do limite seguro de 16M caracteres.');
  }
}
function validateMeta(options) {
  assert(object(options),'Metadados do reset obrigatórios.');
  assert(options.sourceUrl===SOURCE_URL,'Somente a URL exata de homologação é aceita.');
  assert(options.networkId===TARGET_NETWORK,'Rede fora do alvo autorizado.');
  assert(Number.isSafeInteger(options.epoch) && options.epoch>0,'Geração de reset inválida.');
  assert(typeof options.resetId==='string' && /^[A-Za-z0-9_-]{1,80}$/.test(options.resetId),'Identificador de reset inválido.');
  assert(typeof options.resetAt==='string' && Number.isFinite(Date.parse(options.resetAt)),'reset_at obrigatório.');
  assert(typeof options.resetFloor==='string' && /^\d{4}-\d{2}-\d{2}$/.test(options.resetFloor) && new Date(options.resetFloor+'T12:00:00Z').toISOString().slice(0,10)===options.resetFloor,'reset_floor inválido.');
  return {sourceUrl:SOURCE_URL,networkId:TARGET_NETWORK,epoch:options.epoch,resetId:options.resetId,resetAt:options.resetAt,resetFloor:options.resetFloor};
}
function trackedKeys(entries) {
  const keys=new Set(BASE_KEYS);
  if(owns(entries,FRONT_KEY)) {
    const fronts=parseStrictJSON(entries[FRONT_KEY]); shape(fronts,'array',FRONT_KEY);
    fronts.forEach(front=>{ shape(front,'object',FRONT_KEY); assert(typeof front.id==='string' && /^[A-Za-z0-9_-]+$/.test(front.id),'ID de frente desconhecido.'); keys.add('minha-vida.trabalho.custom.'+front.id+'.v1'); });
  }
  Object.keys(entries).forEach(k=>keys.add(k));
  return [...keys].sort();
}
function preparePlan(entries,options) {
  const meta=validateMeta(options); validateEntries(entries);
  const sourceEntries=clone(entries), result=transformEntries(sourceEntries,meta);
  const resetChanges=result.changedKeys.map(key=>({key,before:owns(sourceEntries,key)?sourceEntries[key]:null,after:result.candidate[key]}));
  const changes=Object.keys(result.candidate).sort().map(key=>({key,before:null,after:result.candidate[key]}));
  for(const key of Object.keys(entries)) if(/^bertha\.kids\.30day\.anchor/.test(key)) result.reviews.push({code:'UNKNOWN_KIDS_ANCHOR_PRESERVED',key,detail:'Chave sem leitor comprovado no RC396 disponível; preservada sem alegar reset completo.'});
  return freeze({format:FORMAT,version:POLICY_VERSION,meta,sourceEntries,candidate:result.candidate,changes,resetChanges,trackedKeys:trackedKeys(sourceEntries),report:{...result,candidate:undefined,completeReset:false,remoteStateVerified:false}});
}
function validatePlan(plan) {
  assert(object(plan) && plan.format===FORMAT && plan.version===POLICY_VERSION,'Plano inválido.');
  const expected=preparePlan(plan.sourceEntries,plan.meta);
  assert(JSON.stringify(plan)===JSON.stringify(expected),'Plano alterado: não corresponde à allowlist.');
  return expected;
}
function rawStorage(storage) {
  assert(storage && ['getItem','setItem','removeItem'].every(k=>typeof storage[k]==='function'),'Storage bruto não disponível.');
}
// No enumeration and no credential reads. Unknown storage keys stay untouched.
function captureScoped(storage,options) {
  rawStorage(storage); const out={};
  assert(options && Array.isArray(options.includeKeys),'Informe explicitamente as chaves de origem aprovadas para cópia.');
  const probe={}; for(const key of options.includeKeys) {assert(typeof key==='string','Nome de chave inválido.');Object.defineProperty(probe,key,{value:'',enumerable:true});} validateEntries(probe);
  for(const key of new Set([...BASE_KEYS,...options.includeKeys])) { const value=storage.getItem(SOURCE_PREFIX+key); if(value!==null) out[key]=value; }
  const keys=trackedKeys(out);
  for(const key of keys) if(!BASE_KEYS.includes(key)) {const value=storage.getItem(SOURCE_PREFIX+key);if(value!==null) out[key]=value;}
  validateEntries(out); return out;
}
function storageKeys(meta) {
  return {journal:PREFIX+'bertha.scoped-reset.journal.v1.'+meta.networkId, marker:PREFIX+'bertha.scoped-reset.marker.v1.'+meta.networkId};
}
function markerFor(plan) {return JSON.stringify({version:POLICY_VERSION,networkId:plan.meta.networkId,epoch:plan.meta.epoch,resetId:plan.meta.resetId,resetAt:plan.meta.resetAt,resetFloor:plan.meta.resetFloor});}
function verifyGuard(plan,options,phase) {
  assert(options && typeof options.verifyContext==='function','Caller deve verificar alvo, geração e pausa de writers.');
  const c=options.verifyContext(freeze({...plan.meta,phase}));
  assert(object(c) && typeof c.then!=='function','Verificação de contexto precisa ser síncrona e comprovada pelo caller.');
  assert(c.environment==='HOMOLOGACAO' && c.sourceUrl===SOURCE_URL && c.networkId===plan.meta.networkId && c.epoch===plan.meta.epoch && c.resetAt===plan.meta.resetAt && c.resetFloor===plan.meta.resetFloor,'Contexto HML/rede/generation divergente.');
  assert(c.writersPaused===true && c.remoteResetCommitted===true && c.isolationVerified===true && c.sourceSnapshotPreserved===true && c.sourcePrefix===SOURCE_PREFIX && c.targetPrefix===PREFIX,'Reset remoto, isolamento e pausa de writers não confirmados.');
}
function compareSnapshot(storage,plan,applied) {
  for(const key of plan.trackedKeys) {
    const wanted=owns(plan.sourceEntries,key)?plan.sourceEntries[key]:null;
    assert(storage.getItem(SOURCE_PREFIX+key)===wanted,'SOURCE_CONCURRENT_CHANGE: '+key);
  }
  if(applied) for(const c of plan.changes) assert(storage.getItem(PREFIX+c.key)===c.after,'TARGET_CONCURRENT_CHANGE: '+c.key);
}
function assertTargetKeys(storage,plan,keys) {
  const allowed=new Set(plan.changes.map(c=>PREFIX+c.key).concat([keys.journal,keys.marker]));
  for(let i=0;i<storage.length;i++) {const key=storage.key(i);assert(typeof key==='string','TARGET_ENUMERATION_CHANGED');if(key.startsWith(PREFIX))assert(allowed.has(key),'TARGET_CONCURRENT_KEY: '+key);}
}
function assertEmptyTarget(storage) {
  assert(Number.isSafeInteger(storage.length) && storage.length>=0 && typeof storage.key==='function','Enumeração do namespace alvo indisponível.');
  for(let i=0;i<storage.length;i++) {const key=storage.key(i);assert(typeof key==='string' && !key.startsWith(PREFIX),'TARGET_NOT_EMPTY: namespace novo já tem dados.');}
}
function rollbackChanges(storage,changes) {
  // Preflight all keys before restoring any key. Never overwrite a third value.
  const conflict=changes.filter(c=>{const now=storage.getItem(PREFIX+c.key);return now!==c.before && now!==c.after;}).map(c=>c.key);
  if(conflict.length) return {restored:false,conflicts:conflict};
  const failed=[];
  for(const c of [...changes].reverse()) {
    try {
      const now=storage.getItem(PREFIX+c.key);
      if(now===c.before) continue;
      if(now!==c.after) {failed.push(c.key);continue;}
      if(c.before===null) storage.removeItem(PREFIX+c.key); else storage.setItem(PREFIX+c.key,c.before);
      if(storage.getItem(PREFIX+c.key)!==c.before) failed.push(c.key);
    } catch(_) {failed.push(c.key);}
  }
  return {restored:failed.length===0,conflicts:failed};
}
function applyScoped(storage,inputPlan,options) {
  rawStorage(storage);const plan=validatePlan(inputPlan),keys=storageKeys(plan.meta),marker=markerFor(plan);
  verifyGuard(plan,options,'preflight');
  const previousMarker=storage.getItem(keys.marker),existingJournal=storage.getItem(keys.journal);
  if(previousMarker===marker) return {applied:false,alreadyApplied:true,epoch:plan.meta.epoch,journalAvailable:existingJournal!==null};
  assert(existingJournal===null,'JOURNAL_PENDING: recuperar ou reverter o journal existente antes de aplicar.');
  if(previousMarker!==null) {const previous=parseStrictJSON(previousMarker);assert(previous.networkId===plan.meta.networkId && Number.isSafeInteger(previous.epoch) && previous.epoch<plan.meta.epoch,'Marker de geração conflitante.');}
  assert(!plan.report.reviews.some(r=>r.code.startsWith('BLOCKER_')),'POLICY_REVIEW_REQUIRED: pendência local ou chave sem semântica comprovada.');
  assertEmptyTarget(storage);compareSnapshot(storage,plan,false);
  const journal=JSON.stringify({format:'BERTHA_SCOPED_RESET_JOURNAL',version:POLICY_VERSION,plan,previousMarker,marker});
  let journalWritten=false,markerWritten=false;
  try {
    storage.setItem(keys.journal,journal);journalWritten=true;
    assert(storage.getItem(keys.journal)===journal,'Journal não persistiu integralmente.');
    for(const c of plan.changes) {
      verifyGuard(plan,options,'write');
      assert(storage.getItem(keys.journal)===journal && storage.getItem(keys.marker)===previousMarker,'JOURNAL_CONFLICT');
      assert(storage.getItem(PREFIX+c.key)===c.before,'CONCURRENT_CHANGE: '+c.key);
      storage.setItem(PREFIX+c.key,c.after);
      assert(storage.getItem(PREFIX+c.key)===c.after,'WRITE_NOT_PERSISTED: '+c.key);
    }
    verifyGuard(plan,options,'commit');compareSnapshot(storage,plan,true);assertTargetKeys(storage,plan,keys);
    assert(storage.getItem(keys.journal)===journal && storage.getItem(keys.marker)===previousMarker,'JOURNAL_CONFLICT');
    storage.setItem(keys.marker,marker);markerWritten=true;
    assert(storage.getItem(keys.marker)===marker,'Marker não persistiu.');
    return {applied:true,alreadyApplied:false,epoch:plan.meta.epoch,changedKeys:plan.changes.map(c=>c.key),journalAvailable:true};
  } catch(error) {
    // Rollback is limited to this attempt's own journal and writes. A changed context
    // still permits undoing our exact bytes in the same fixed namespace, never new data.
    let rollback={restored:false,conflicts:['journal']};
    if(journalWritten && storage.getItem(keys.journal)===journal) {
      rollback=rollbackChanges(storage,plan.changes);
      if(rollback.restored) {
        try {
          if(markerWritten && storage.getItem(keys.marker)===marker) { if(previousMarker===null) storage.removeItem(keys.marker);else storage.setItem(keys.marker,previousMarker); }
          if(storage.getItem(keys.marker)===previousMarker) storage.removeItem(keys.journal);
          else rollback={restored:false,conflicts:['marker']};
        }catch(_){rollback={restored:false,conflicts:['journal-or-marker']};}
      }
    } else if(!journalWritten) rollback={restored:true,conflicts:[]};
    const failure=Error('APPLY_ABORTED: '+error.message);failure.rollback=rollback;throw failure;
  }
}
function rollbackScoped(storage,inputPlan,options) {
  rawStorage(storage);const plan=validatePlan(inputPlan),keys=storageKeys(plan.meta);
  verifyGuard(plan,options,'rollback');
  const raw=storage.getItem(keys.journal);assert(raw!==null,'Sem journal para reverter.');
  const journal=parseStrictJSON(raw);assert(journal.format==='BERTHA_SCOPED_RESET_JOURNAL' && journal.version===POLICY_VERSION,'Journal desconhecido.');
  assert(JSON.stringify(journal.plan)===JSON.stringify(plan) && journal.marker===markerFor(plan),'Journal não pertence a este plano.');
  assert(journal.previousMarker===null || typeof journal.previousMarker==='string','Marker anterior inválido.');
  const marker=storage.getItem(keys.marker);assert(marker===journal.marker || marker===journal.previousMarker,'Marker alterado concorrencialmente.');
  const result=rollbackChanges(storage,plan.changes);
  if(!result.restored) return result;
  assert(storage.getItem(keys.journal)===raw,'Journal alterado concorrencialmente.');
  assert(storage.getItem(keys.marker)===marker,'Marker alterado concorrencialmente.');
  if(journal.previousMarker===null) storage.removeItem(keys.marker);else storage.setItem(keys.marker,journal.previousMarker);
  assert(storage.getItem(keys.marker)===journal.previousMarker,'Falha ao restaurar marker.');
  storage.removeItem(keys.journal);assert(storage.getItem(keys.journal)===null,'Falha ao remover journal revertido.');
  return {restored:true,conflicts:[],changedKeys:plan.changes.map(c=>c.key)};
}
function readJournal(storage,options) {
  rawStorage(storage);const meta=validateMeta(options),raw=storage.getItem(storageKeys(meta).journal);
  if(raw===null)return null;
  const journal=parseStrictJSON(raw);assert(journal.format==='BERTHA_SCOPED_RESET_JOURNAL' && journal.version===POLICY_VERSION,'Journal desconhecido.');
  const plan=validatePlan(journal.plan);assert(equal(plan.meta,meta),'Journal de outra operação.');
  return plan;
}
return freeze({POLICY,FORMAT,POLICY_VERSION,SOURCE_URL,SOURCE_PREFIX,PREFIX,TARGET_NETWORK,parseStrictJSON,transformEntries,preparePlan,captureScoped,applyScoped,rollbackScoped,readJournal,storageKeys});
});
