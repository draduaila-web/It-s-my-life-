/* BERTH.A RC360 — testes do fonte ativo, sem browser/storage real.
   Execute: TZ=America/Sao_Paulo node homologação/tests/owner-tempo-rc360.cjs
   Repita com TZ=America/New_York para a transição de horário de verão. */
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.resolve(process.argv[2]||path.join(__dirname,'..'),'bertha-time-rc380.js'),'utf8');
const names=['dayStart','calendarDayDistance','commitmentOccursOn','addRitualDays','ritualBaseStart','ritualOccurrenceDate','selfcareCurrentCycleStartIndex','cloneCycle','currentCycleState','ritualCycleEndedForDate','shouldShowCycleActions','endCycle','ritualDetailData'];
function extract(name){const a=source.indexOf('function '+name+'(');if(a<0)throw Error('Função ausente: '+name);let i=source.indexOf('{',a)+1,level=1;for(;level&&i<source.length;i++)level+=(source[i]==='{')-(source[i]==='}');if(level)throw Error('Função incompleta: '+name);return source.slice(a,i);}
const assert=require('node:assert/strict'),vm=require('node:vm');
let clock='2026-10-14', schedules={},cycles={};
const RealDate=Date;class TestDate extends RealDate{constructor(...args){super(...(args.length?args:[clock+'T12:00:00']));}}
const context={read:()=>[],selfcareEvent:()=>null,capillaryEvent:()=>null,selfcareProcedure:x=>{if(!x)throw Error("Evento vazio recebido");return x;},Date:TestDate,Math,Number,Array,alert:()=>{},rerender:()=>{},iso:d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,CAPILLARY_START:new TestDate(2026,8,12),SELFCARE_START:new TestDate(2026,8,12),capillaryCycleTotal:()=>33,ritualCycles:()=>cycles,saveRitualCycles:x=>cycles=x,ritualScheduleStore:()=>schedules,saveRitualScheduleStore:x=>schedules=x,ritualScheduleState:id=>({shift:schedules[id]?.shift||0,overrides:{...(schedules[id]?.overrides||{})}})};
vm.createContext(context);
vm.runInContext(names.map(extract).join('\n'),context);
const c=context;
assert.equal(c.iso(c.ritualOccurrenceDate('capilar',32)),'2026-10-14');assert.equal(c.shouldShowCycleActions('capilar'),true);
c.cloneCycle('capilar',false);assert.equal(cycles.capilar.number,2);assert.equal(c.iso(c.ritualOccurrenceDate('capilar',0)),'2026-10-15');assert.equal(c.iso(c.ritualOccurrenceDate('capilar',32)),'2026-11-16');assert.equal(c.shouldShowCycleActions('capilar'),false);assert.equal(cycles.capilar.revisions[0].schedule.shift,0);
clock='2026-11-16';assert.equal(c.shouldShowCycleActions('capilar'),true);c.cloneCycle('capilar',true);assert.equal(cycles.capilar.number,3);assert.equal(c.iso(c.ritualOccurrenceDate('capilar',0)),'2026-11-17');assert.equal(cycles.capilar.revisions.length,2);assert.equal(cycles.capilar.mode,'review');
schedules={capilar:{shift:0,overrides:{'1':'2026-09-16'}}};cycles={};clock='2026-10-14';c.cloneCycle('capilar');assert.equal(c.iso(c.ritualOccurrenceDate('capilar',1)),'2026-10-19');assert.equal(cycles.capilar.revisions[0].schedule.overrides['1'],'2026-09-16');
schedules={};cycles={};clock='2026-10-12';assert.equal(c.selfcareCurrentCycleStartIndex(),28);assert.equal(c.shouldShowCycleActions('autocuidado'),false);clock='2026-10-23';assert.equal(c.shouldShowCycleActions('autocuidado'),true);c.cloneCycle('autocuidado');assert.equal(c.iso(c.ritualOccurrenceDate('autocuidado',0)),'2026-10-24');assert.equal(c.shouldShowCycleActions('autocuidado'),false);
c.endCycle('autocuidado');assert.equal(c.ritualCycleEndedForDate('autocuidado',new TestDate(2026,9,24)),true);assert.equal(c.ritualCycleEndedForDate('autocuidado',new TestDate(2026,9,22)),false);assert.equal(c.shouldShowCycleActions('autocuidado'),true);
console.log(JSON.stringify({result:'PASS',checks:22,timezone:process.env.TZ,scope:'reinício/ revisão/ override/ fim capilar33dias e autocuidado14dias; relógio exclusivamente simulado'}));
const cases=[[{"date": "2026-12-28", "repeat": "weekly"}, "2027-01-04", true], [{"date": "2026-12-28", "repeat": "weekly"}, "2027-01-03", false], [{"date": "2026-10-12", "repeat": "daily", "repeatUntil": "2026-10-14"}, "2026-10-15", false], [{"date": "2026-10-12", "repeat": "weekdays", "weekdays": [1, 3]}, "2026-10-14", true], [{"date": "2026-10-12", "repeat": "weekdays", "weekdays": [1, 3]}, "2026-10-13", false], [{"date": "2026-01-31", "repeat": "monthly"}, "2026-02-28", false], [{"date": "2026-01-31", "repeat": "monthly"}, "2026-03-31", true], [{"date": "2026-03-01", "repeat": "weekly"}, "2026-03-08", true], [{"date": "2026-03-01", "repeat": "weekly"}, "2026-03-15", true]];

for(const [item,date,expected] of cases)assert.equal(c.commitmentOccursOn(item,date),expected,JSON.stringify({item,date}));
console.log('PASS: 9 verificações de recorrência, incluindo virada de ano e horário de verão.');

assert.equal(c.ritualDetailData("autocuidado"),null);assert.equal(c.ritualDetailData("capilar"),null);console.log("PASS: 2 verificações de evento ausente sem procedimento undefined.");
