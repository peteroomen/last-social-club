import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDeck,dealCards,rng,effective,strength,legalCards,trickWinner,fresh,reduce,replay,aiAction,observation,type State,type Card,type Action,SUITS} from '../src/engine/game.ts';
import {pack,unpack} from '../src/persistence.ts';
const c=(id:string)=>createDeck().find(c=>c.id===id)!;
test('43 unique cards; exact hand quotas and enhanced kitty across 200 favoured deals',()=>{
 const deck=createDeck();assert.equal(deck.length,43);assert.equal(new Set(deck.map(c=>c.id)).size,43);
 for(let seed=0;seed<200;seed++){const d=dealCards(deck,rng(seed),'H9');assert.deepEqual(d.hands.map(h=>h.length),[10,10,10,10]);assert.equal(d.kitty.length,3);assert.ok(d.kitty.some(c=>c.mod));assert.equal(new Set([...d.kitty,...d.hands.flat()].map(c=>c.id)).size,43);}
});
test('bower effective suit, trump order, and follow suit',()=>{
 assert.equal(effective(c('D11'),'H'),'H');assert.equal(effective(c('H11'),'D'),'D');assert.ok(strength(c('joker'),'H')>strength(c('H11'),'H'));assert.ok(strength(c('H11'),'H')>strength(c('D11'),'H'));assert.ok(strength(c('D11'),'H')>strength(c('H14'),'H'));
 const lead=[{seat:0 as const,card:c('H5'),lowest:false}];assert.deepEqual(legalCards([c('D11'),c('S14')],lead,'H').map(c=>c.id),['D11']);
 assert.equal(trickWinner([...lead,{seat:1,card:c('S14'),lowest:false},{seat:2,card:c('D11'),lowest:false},{seat:3,card:c('H11'),lowest:false}],'H'),3);
});
test('passed seats cannot re-enter; all-pass forces dealer contract',()=>{
 let s=reduce(fresh(42),{type:'start',regular:'gatekeeper'});const first=s.turn;
 for(let i=0;i<4;i++)s=reduce(s,{type:'pass'});
 assert.equal(s.phase,'kitty');assert.equal(s.bid!.seat,s.dealer);assert.equal(s.bid!.tricks,6);assert.equal(s.hands[s.dealer].length,13);
 assert.throws(()=>reduce(s,{type:'pass'}));assert.ok(s.passed[first]);
});
test('auction uses contract precedence and preserves declarer-only kitty',()=>{
 let s=reduce(fresh(2),{type:'start',regular:'bookkeeper'});s=reduce(s,{type:'bid',tricks:6,suit:'H'});
 assert.throws(()=>reduce(s,{type:'bid',tricks:6,suit:'C'}));s=reduce(s,{type:'bid',tricks:7,suit:'S'});const declarer=s.bid!.seat;
 for(let i=0;i<3;i++)s=reduce(s,{type:'pass'});assert.equal(s.phase,'kitty');assert.equal(s.hands[declarer].length,13);assert.equal(s.hands[(declarer+2)%4].length,10);
 assert.throws(()=>reduce(s,{type:'discard',ids:[s.hands[declarer][0].id,s.hands[declarer][0].id,s.hands[declarer][1].id]}));
});
function settlement(ours:boolean,taken:number){let s=fresh(1);s.phase='settlement';s.bid={seat:ours?0:1,tricks:8,suit:'D'};s.tricks=[taken,10-taken];s.regulars=['bookkeeper'];s.points=taken*10;return reduce(s,{type:'settle'});}
test('contract, failure, defence and exact-bid arithmetic match the GDD examples',()=>{
 const exact=settlement(true,8);assert.equal(exact.dealScore,720);assert.equal(exact.penalty,0);
 const fail=settlement(true,7);assert.equal(fail.dealScore,70);assert.equal(fail.penalty,6);
 const defence=settlement(false,3);assert.equal(defence.dealScore,310);assert.equal(defence.penalty,0);
 const lost=settlement(false,2);assert.equal(lost.penalty,3);assert.equal(lost.dealScore,20);
 assert.throws(()=>reduce(exact,{type:'settle'}));
});
export function run(seed:number,starter:'bookkeeper'|'gatekeeper'|'switchboard'|'wallflower'='bookkeeper'){
 let s=reduce(fresh(seed),{type:'start',regular:starter});let guard=0;
 while(s.phase!=='over'&&guard++<500){let a:Action;
  if(['auction','kitty','play'].includes(s.phase))a=aiAction(observation(s));
  else if(s.phase==='insight')a={type:'insight',accept:true};else if(s.phase==='trick')a={type:'collect'};
  else if(s.phase==='settlement')a=s.counters.settled?{type:'pub'}:{type:'settle'};
  else if(s.phase==='pub')a=s.eventDone?{type:'next'}:{type:'event',choice:'rest'};else throw Error(s.phase);
  s=reduce(s,a);
 }
 assert.equal(s.phase,'over');return s;
}
test('100 complete nights terminate, conserve cards, and replay exactly',()=>{
 for(let i=0;i<100;i++){const s=run(i);assert.ok(s.score>=0&&Number.isFinite(s.score));assert.equal(s.history.length,10);const cards=[...s.history.flatMap(t=>t.plays.map(p=>p.card)),...s.discarded];assert.equal(cards.length,43);assert.equal(new Set(cards.map(c=>c.id)).size,43);assert.deepEqual(replay(s.seed,s.actions),s);}
});
test('save validation and replay roundtrip preserve a mid-auction night',()=>{
 const s=reduce(fresh(987),{type:'start',regular:'switchboard'});const saved=pack(s,{nights:0,best:0,metMabel:false});assert.deepEqual(unpack(JSON.stringify(saved)).state,s);assert.throws(()=>unpack('{bad'));assert.throws(()=>unpack(JSON.stringify({...saved,version:'old'})));
});
test('AI observation excludes hidden partnership and opponent cards',()=>{const s=reduce(fresh(19),{type:'start',regular:'gatekeeper'});const o=observation(s);assert.deepEqual(Object.keys(o).sort(),['hand','plays','bid','seat','phase','trait'].sort());assert.equal(o.hand.length,10);});
test('Insight bonus and penalty activate at threshold, not below',()=>{
 let s=fresh(3);s.phase='settlement';s.bid={seat:0,tricks:8,suit:'H'};s.tricks=[2,8];s.insight=3;s=reduce(s,{type:'settle'});assert.equal(s.penalty,8);
});
test('shop enforces money, five slots, and one event per visit',()=>{
 let s=fresh(42);s.phase='pub';s.offer=['gatekeeper'];s.cash=4;s=reduce(s,{type:'buy',id:'gatekeeper'});assert.equal(s.cash,0);assert.throws(()=>reduce(s,{type:'buy',id:'gatekeeper'}));s=reduce(s,{type:'event',choice:'ask'});assert.equal(s.insight,2);assert.throws(()=>reduce(s,{type:'event',choice:'ask'}));
});
