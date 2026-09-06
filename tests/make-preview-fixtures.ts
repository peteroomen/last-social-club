// Valid replay saves for manual browser checks. Only uploaded to preview deployments.
import {writeFileSync} from 'node:fs';
import {fresh,reduce,aiAction,observation,canBreakSuit,isPlayer,type State} from '../src/engine/game.ts';
import {pack} from '../src/persistence.ts';
const fixtures:Record<string,ReturnType<typeof pack>>={};
const keep=(name:string,s:State)=>{fixtures[name]??=pack(s,{nights:0,best:0,metMabel:false});};
for(let seed=0;seed<80;seed++){
 let s=reduce(fresh(seed),{type:'start',regular:'gatekeeper'});s=reduce(s,{type:'pass'});keep('auction',s);
 s=reduce(s,{type:'bid',tricks:10,suit:'NT'});while(s.phase==='auction')s=reduce(s,{type:'pass'});
 while(s.phase!=='settlement'){
  if(s.phase==='kitty'){
   const sorted=s.hands[s.turn].filter(c=>c.suit!=='J').sort((a,b)=>a.rank-b.rank);s=reduce(s,{type:'discard',ids:sorted.slice(0,3).map(c=>c.id)});
  }else if(s.phase==='insight')s=reduce(s,{type:'insight',accept:false});
  else if(s.phase==='trick')s=reduce(s,{type:'collect'});
  else{
   if(isPlayer(s.turn)&&!s.plays.length&&s.hands[s.turn].some(c=>c.suit==='J'))keep('joker',s);
   if(canBreakSuit(s))keep('gatekeeper',s);
   if(isPlayer(s.turn)&&s.plays.length===3)keep('last-card',s);
   s=reduce(s,aiAction(observation(s)));
  }
 }
 s=reduce(s,{type:'settle'});s=reduce(s,{type:'pub'});
 if(s.phase==='pub'){
  keep('workbench',s);s=reduce(s,{type:'enhance',id:'D11',mod:'inkS'});s=reduce(s,{type:'event',choice:'rest'});s=reduce(s,{type:'next'});
  if(s.hands[0].concat(s.hands[2]).some(c=>c.id==='D11'))keep('inked-hand',s);
 }
 if(Object.keys(fixtures).length===6)break;
}
writeFileSync('tests/fixtures/preview.json',JSON.stringify(fixtures));
console.log(Object.keys(fixtures));
