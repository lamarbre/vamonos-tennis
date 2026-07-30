/* Banc d'essai v2 : joue une carriere complete sans interface. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const DIR=__dirname;
const ctx={console,Math,JSON,Date,Array,Object,Set,Map};vm.createContext(ctx);
['data.js','tour.js','match.js','world.js','career.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(DIR,f),'utf8'),ctx,{filename:f}));
vm.runInContext('globalThis.__=({World,Career,MatchEngine,ORIGINS,STYLES,NATIONS,TIERS,TRAININGS,INTENSITIES,STAFF,TACTICS,BAL})',ctx);
const A=ctx.__,C=A.Career,W=A.World,M=A.MatchEngine;
const pick=a=>a[Math.floor(Math.random()*a.length)];

const c=C.create({nation:pick(A.NATIONS),style:pick(A.STYLES),origin:pick(A.ORIGINS),gender:'m'});
console.log('JOUEUR :',c.me.name,c.me.nation.name,'|',c.me.style.short,'| pot',c.me.pot,'| niv',Math.round(c.me._lvl));
console.log('');

let year=c.world.year, seasons=0, matchesPlayed=0, totalMinutes=0;
while(seasons<18 && !c.retired){
  // Inscription : le meilleur tournoi accessible
  const best=C.bestFit(c,c.world.week);
  if(best && c.fitness>38 && !C.isInjured(c)) C.enter(c,c.world.week,best.t.id);
  const wk=C.beginWeek(c);
  let played=null;
  if(wk.type==='tournament'){
    played=wk.t.id;
    const st=C.startTournament(c,wk.t,wk.status);
    while(!st.done){
      const opp=C.myOpponent(c);
      if(!opp){ C.resolveRound(c,true); continue; }
      const m=M.create(c.me,opp,{surface:wk.t.surf,bo5:!!A.TIERS[wk.t.tier].bo5,
        tournament:wk.t.name,round:C.roundName(st,st.round),fatigueA:100-c.fitness,fatigueB:opp.fatigue});
      M.playAll(m);
      matchesPlayed++; totalMinutes+=m.minutes;
      c.fitness=Math.max(0,c.fitness-C.matchCost(m.minutes));C.matchWear(c,m.minutes,wk.t.surf);
      C.resolveRound(c,m.winner===0);
    }
    C.clearEntry(c,c.world.week);
  } else if(wk.type==='injured'){
    C.rehabWeek(c);
  } else {
    const tr = c.fitness<45 ? 'rest' : pick(A.TRAININGS.filter(t=>t.id!=='rest'&&t.id!=='exho')).id;
    C.train(c,tr,'normal');
  }
  const r=C.endWeek(c,played);
  if(r.event) C.resolveOption(c,pick(r.event.options));
  if(r.newYear){
    seasons++;
    const s=r.season;
    console.log(`${s.year}  ${String(s.age).padStart(2)} ans  #${String(s.rank).padStart(4)}  ${String(s.points).padStart(5)} pts  ${String(s.w).padStart(3)}V-${String(s.l).padStart(2)}D  ${String(s.titles.length)} titre(s)  ${C.money(s.prize).padStart(9)}  niv ${Math.round(c.me._lvl)}  corps ${Math.round(C.bodyAvg(c))}  banque ${C.money(c.money)}`);
    if(s.titles.length) console.log('        └─ '+s.titles.join(', '));
  }
}
console.log('');
console.log('Matchs joues :',matchesPlayed,'| duree moyenne',Math.round(totalMinutes/matchesPlayed),'min');
console.log('Bilan :',c.me.wins+'V -',c.me.losses+'D | meilleur classement #'+c.me.bestRank);
console.log('Titres :',JSON.stringify(c.me.titles));
console.log('Grands Chelems :',c.me.slams.map(s=>s.name+' '+s.year).join(', ')||'aucun');
console.log('Gains carriere :',C.money(c.earned),'| score',C.careerScore(c),'|',C.tierFor(C.careerScore(c)).label);
console.log('Top 10 mondial actuel :');
c.world.ranking.slice(0,10).forEach((p,i)=>console.log('  '+String(i+1).padStart(2)+'.',String(p.points).padStart(6),p.name,p.nation.flag,'('+p.age+' ans, '+p.titles.slam+' GC)'));
