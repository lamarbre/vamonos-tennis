const fs=require('fs'),vm=require('vm'),path=require('path');
const DIR=__dirname;
const ctx={console,Math,JSON,Date,Array,Object,Set,Map};vm.createContext(ctx);
['data.js','tour.js','match.js','world.js','career.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(DIR,f),'utf8'),ctx,{filename:f}));
vm.runInContext('globalThis.__=({World,Career,MatchEngine,ORIGINS,STYLES,NATIONS,TIERS,TRAININGS})',ctx);
const A=ctx.__,C=A.Career,W=A.World,M=A.MatchEngine,pick=a=>a[Math.floor(Math.random()*a.length)];
const c=C.create({nation:pick(A.NATIONS),style:pick(A.STYLES),origin:pick(A.ORIGINS),gender:'m'});
console.log('JOUEUR',c.me.name,'| pot',c.me.pot,'| niv',Math.round(c.me._lvl),'| rang',c.me.rank);
console.log('sem  tournoi                 cat    statut  cut   parcours');
for(let k=0;k<20;k++){
  const best=C.bestFit(c,c.world.week);
  if(best && c.fitness>38 && !C.isInjured(c)) C.enter(c,c.world.week,best.t.id);
  const wk=C.beginWeek(c);
  let played=null,desc='';
  if(wk.type==='tournament'){
    played=wk.t.id;
    const st=C.startTournament(c,wk.t,wk.status);
    const cut=st.quali.cut;
    let path=[];
    while(!st.done){
      const opp=C.myOpponent(c);
      if(!opp){C.resolveRound(c,true);continue;}
      const m=M.create(c.me,opp,{surface:wk.t.surf,bo5:!!A.TIERS[wk.t.tier].bo5,fatigueA:100-c.fitness,fatigueB:opp.fatigue});
      M.playAll(m);
      const won=m.winner===0;
      path.push((st.phase==='quali'?'Q':'')+(won?'V':'D')+'#'+opp.rank);
      c.fitness=Math.max(0,c.fitness-C.matchCost(m.minutes));
      C.resolveRound(c,won);
    }
    desc=`${A.TIERS[wk.t.tier].short.padEnd(6)} ${wk.status.padEnd(7)} #${String(cut).padEnd(4)} ${path.join(' ')} => ${st.pts} pts`;
    console.log(String(c.world.week).padStart(3),(wk.t.name+' ('+wk.t.surf+')').padEnd(24),desc);
    C.clearEntry(c,c.world.week);
  } else { console.log(String(c.world.week).padStart(3),'—— entrainement / repos'); C.train(c,'ground','normal'); }
  C.endWeek(c,played);
}
console.log('');
console.log('rang',c.me.rank,'| points',c.me.points,'| pts52 non nuls :',c.me.pts52.filter(x=>x>0).length,'sur',c.me.pts52.length);
