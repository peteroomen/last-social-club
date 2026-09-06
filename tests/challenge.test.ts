import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,reduce,replay,aiAction,observation,cardSuit,challengePassed,sittingScore,type State,type Action} from '../src/engine/game.ts';
const start=()=>reduce(fresh(91),{type:'start',regular:'wallflower',challenge:true});
function completeDeal(s:State){while(s.phase!=='settlement'){const a:Action=s.phase==='prepare'?{type:'ready'}:s.phase==='insight'?{type:'insight',accept:true}:s.phase==='trick'?{type:'collect'}:aiAction(observation(s));s=reduce(s,a);}return reduce(s,{type:'settle'});}
test('post-deal tools affect only owned hands, are movable, reversible and locked before bidding',()=>{
 let s=start();const original=structuredClone(s),[a,b]=s.hands[0],rival=s.hands[1][0];
 assert.equal(s.phase,'prepare');assert.equal(s.deck.some(c=>c.mod),false);
 assert.throws(()=>reduce(s,{type:'place',id:rival.id,mod:'gilt'}));assert.throws(()=>reduce(s,{type:'place',id:a.id,mod:'inkS'}));
 s=reduce(s,{type:'place',id:a.id,mod:'stamped'});s=reduce(s,{type:'place',id:b.id,mod:'stamped'});
 assert.equal(s.hands[0][0].mod,original.hands[0][0].mod);assert.equal(s.hands[0][1].mod,'stamped');assert.equal(s.challenge!.placements.length,1);
 s=reduce(s,{type:'place',id:b.id,mod:'gilt'});assert.deepEqual(s.challenge!.placements,[{mod:'gilt',id:b.id}]);
 s=reduce(s,{type:'place',id:null,mod:'gilt'});assert.deepEqual(s.hands,original.hands);assert.deepEqual(s.deck,original.deck);
 const partner=s.hands[2].find(c=>c.suit!=='J')!;s=reduce(s,{type:'place',id:partner.id,mod:'inkH'});assert.equal(cardSuit(s.hands[2].find(c=>c.id===partner.id)!),'H');
 s=reduce(s,{type:'ready'});assert.throws(()=>reduce(s,{type:'place',id:partner.id,mod:'gilt'}));assert.deepEqual(replay(s.seed,s.actions),s);
});
test('tools persist and placements reset at the next uniform shared deal',()=>{
 let s=start();s=reduce(s,{type:'place',id:s.hands[0][0].id,mod:'gilt'});s=completeDeal(s);s=reduce(s,{type:'pub'});
 assert.throws(()=>reduce(s,{type:'enhance',id:'S14',mod:'gilt'}));assert.throws(()=>reduce(s,{type:'favour',id:'S14'}));
 s=reduce(s,{type:'tool',mod:'inkS'});assert.throws(()=>reduce(s,{type:'tool',mod:'inkD'}));s=reduce(s,{type:'event',choice:'rest'});s=reduce(s,{type:'next'});
 assert.equal(s.phase,'prepare');assert.equal(s.challenge!.tools.includes('inkS'),true);assert.deepEqual(s.challenge!.placements,[]);assert.equal(s.deck.some(c=>c.mod),false);
 assert.equal(new Set([...s.hands.flat(),...s.kitty].map(c=>c.id)).size,43);assert.deepEqual(s.hands.map(h=>h.length),[10,10,10,10]);
 assert.deepEqual(replay(s.seed,s.actions),s);
});
test('three-deal targets stop a failed sitting, carry builds, and reset stage score without banking surplus',()=>{
 let s=completeDeal(start());s.deal=3;s.score=499;s.challenge!.target=500;assert.equal(reduce(s,{type:'pub'}).phase,'over');
 s.score=750;assert.equal(challengePassed(s),true);s=reduce(s,{type:'pub'});assert.equal(s.phase,'pub');s=reduce(s,{type:'event',choice:'rest'});s=reduce(s,{type:'next'});
 assert.equal(s.challenge!.stage,2);assert.equal(s.challenge!.target,1000);assert.equal(sittingScore(s),0);assert.equal(s.regulars[0],'wallflower');assert.equal(s.deal,4);
 s=completeDeal(s);s.deal=9;s.challenge!.stage=3;s.score=s.challenge!.banked+1800;s.challenge!.target=1800;assert.equal(reduce(s,{type:'pub'}).phase,'over');
});
test('100 complete challenge runs terminate, conserve the shared pack and replay exactly',()=>{
 for(let seed=0;seed<100;seed++){
 let s=reduce(fresh(seed),{type:'start',regular:'wallflower',challenge:true}),steps=0;
 while(s.phase!=='over'&&steps++<1500){
  if(s.phase==='pub'){
   if(!s.eventDone)s=reduce(s,{type:'event',choice:'rest'});else s=reduce(s,{type:'next'});
  }else if(s.phase==='settlement')s=reduce(s,{type:s.counters.settled?'pub':'settle'});
  else if(s.phase==='prepare'){
   const c=s.hands[0].find(c=>c.rank===14)??s.hands[0][0];s=reduce(s,{type:'place',mod:'stamped',id:c.id});s=reduce(s,{type:'ready'});
  }else s=reduce(s,s.phase==='trick'?{type:'collect'}:s.phase==='insight'?{type:'insight',accept:true}:aiAction(observation(s)));
  const all=[...s.hands.flat(),...s.kitty,...s.discarded,...s.plays.map(p=>p.card),...s.history.flatMap(t=>t.plays.map(p=>p.card))];
  assert.equal(all.length,43);assert.equal(new Set(all.map(c=>c.id)).size,43);assert.equal(s.deck.some(c=>c.mod),false);
 }
 assert.equal(s.phase,'over');assert.ok(s.deal<=9);assert.deepEqual(replay(seed,s.actions),s);
 }
});
