import {fresh,reduce,aiAction,observation,type Action} from '../src/engine/game.ts';
const results=[];
for(let seed=0;seed<1000;seed++){
 let s=reduce(fresh(seed),{type:'start',regular:seed%2?'bookkeeper':'gatekeeper'});
 let steps=0,contracts=0,made=0,sets=0,defences=0;
 while(s.phase!=='over'&&steps++<500){let a:Action;
 if(['auction','kitty','play'].includes(s.phase))a=aiAction(observation(s));
 else if(s.phase==='insight')a={type:'insight',accept:true};
 else if(s.phase==='trick')a={type:'collect'};
 else if(s.phase==='settlement'){
 if(!s.counters.settled){const ours=s.bid!.seat%2===0;const success=s.tricks[s.bid!.seat%2]>=s.bid!.tricks;if(ours){contracts++;if(success)made++;}else{defences++;if(!success)sets++;}}
 a=s.counters.settled?{type:'pub'}:{type:'settle'};
 }else if(s.phase==='pub')a=s.eventDone?{type:'next'}:{type:'event',choice:'rest'};else throw Error(s.phase);
 s=reduce(s,a);
 }
 if(s.phase!=='over')throw Error('Non-terminating seed '+seed);
 results.push({seed,score:s.score,survived:s.composure>0,contracts,made,sets,defences});
}
const sum=(key:'score'|'contracts'|'made'|'sets'|'defences')=>results.reduce((n,r)=>n+r[key],0);
console.log(JSON.stringify({description:'Baseline heuristic policies, no shop purchases; diagnostic only, not balance proof',nights:results.length,survived:results.filter(r=>r.survived).length,meanScore:sum('score')/results.length,minimumScore:Math.min(...results.map(r=>r.score)),maximumScore:Math.max(...results.map(r=>r.score)),contracts:sum('contracts'),made:sum('made'),defences:sum('defences'),sets:sum('sets')},null,2));
