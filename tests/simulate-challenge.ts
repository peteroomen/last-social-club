import {writeFileSync} from 'node:fs';
import {fresh,reduce,aiAction,observation,sittingScore,type State} from '../src/engine/game.ts';
const all:Record<string,unknown>[]=[];
for(const policy of ['no-tools','tools-and-recruits']){
 const reached=[0,0,0],passed=[0,0,0],scores:number[][]=[[],[],[]];
 for(let seed=0;seed<300;seed++){
 let s=reduce(fresh(seed),{type:'start',regular:'wallflower',challenge:true});let steps=0;
 while(s.phase!=='over'&&steps++<1600){
 if(s.phase==='prepare'){
  if(policy!=='no-tools'){
   const hands=[...s.hands[0],...s.hands[2]].sort((a,b)=>b.rank-a.rank),used=new Set<string>();
   for(const mod of s.challenge!.tools){const card=hands.find(c=>!used.has(c.id)&&(!mod.startsWith('ink')||c.suit!=='J'));if(card){s=reduce(s,{type:'place',mod,id:card.id});used.add(card.id);}}
  }s=reduce(s,{type:'ready'});
 }else if(s.phase==='pub'){
  if(policy!=='no-tools')for(const id of [...s.offer]){try{s=reduce(s,{type:'buy',id});}catch{}}
  s=reduce(s,s.eventDone?{type:'next'}:{type:'event',choice:policy==='no-tools'?'rest':s.insight<3?'ask':'rest'});
 }else if(s.phase==='settlement'){
  if(!s.counters.settled)s=reduce(s,{type:'settle'});
  else{if(s.deal%3===0){const i=s.challenge!.stage-1;reached[i]++;scores[i].push(sittingScore(s));if(sittingScore(s)>=s.challenge!.target&&s.composure>0)passed[i]++;}s=reduce(s,{type:'pub'});}
 }else s=reduce(s,s.phase==='trick'?{type:'collect'}:s.phase==='insight'?{type:'insight',accept:true}:aiAction(observation(s)));
 }if(s.phase!=='over')throw Error('Stalled seed '+seed);
 }
 all.push({policy,runs:300,reached,passed,median:scores.map(a=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)]??0)});
}
const report={note:'Diagnostic heuristic play, not human balance proof. Same opponents and three deals at every sitting.',targets:[500,1000,1800],results:all};
writeFileSync('tests/fixtures/challenge-balance.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
