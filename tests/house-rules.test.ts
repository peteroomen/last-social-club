import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDeck,cardSuit,effective,strength,legalCards,trickWinner,bidValue,nextBid,fresh,reduce,replay,canBreakSuit,aiAction,observation,type Card,type Play,type State} from '../src/engine/game.ts';
import {pack,unpack} from '../src/persistence.ts';
const card=(id:string):Card=>({...createDeck().find(c=>c.id===id)!});
const play=(id:string,seat:0|1|2|3=0):Play=>({card:card(id),seat,lowest:false});
test('no-trumps bids fit between hearts and the next spade level',()=>{
 assert.equal(bidValue({tricks:6,suit:'NT'}),120);assert.equal(bidValue({tricks:10,suit:'NT'}),520);
 assert.deepEqual(nextBid('S',{seat:0,tricks:6,suit:'NT'}),{tricks:7,suit:'S'});
 assert.deepEqual(nextBid('NT',{seat:0,tricks:6,suit:'H'}),{tricks:6,suit:'NT'});
 assert.equal(nextBid('NT',{seat:0,tricks:10,suit:'NT'}),null);
 let s=reduce(fresh(23),{type:'start',regular:'bookkeeper'});s=reduce(s,{type:'bid',tricks:6,suit:'NT'});
 assert.throws(()=>reduce(s,{type:'bid',tricks:6,suit:'H'}));
});
test('no-trumps removes bowers, respects led suit, and restricts the joker',()=>{
 assert.equal(effective(card('D11'),'NT'),'D');assert.ok(strength(card('D14'),'NT')>strength(card('D11'),'NT'));
 const lead=[play('H5')];assert.deepEqual(legalCards([card('H6'),card('joker'),card('S14')],lead,'NT').map(c=>c.id),['H6']);
 assert.deepEqual(legalCards([card('joker'),card('S14')],lead,'NT').map(c=>c.id),['joker','S14']);
 assert.equal(trickWinner([...lead,play('S14',1),play('H11',2),play('D11',3)],'NT'),2);
 const jokerLead:Play={...play('joker'),leadSuit:'C'};
 assert.deepEqual(legalCards([card('C5'),card('H14')],[jokerLead],'NT').map(c=>c.id),['C5']);
 assert.equal(trickWinner([jokerLead,play('C14',1),play('H14',2),play('C13',3)],'NT'),0);
});
test('no-trump joker nomination is required, validated and recorded',()=>{
 const s=fresh(1);s.phase='play';s.turn=0;s.bid={seat:0,tricks:6,suit:'NT'};s.hands[0]=[card('joker'),card('H14')];
 assert.throws(()=>reduce(s,{type:'play',id:'joker'}));assert.throws(()=>reduce(s,{type:'play',id:'H14',leadSuit:'H'}));
 const next=reduce(s,{type:'play',id:'joker',leadSuit:'D'});assert.equal(next.plays[0].leadSuit,'D');
 const ai=aiAction(observation(s));assert.deepEqual(ai,{type:'play',id:'joker',leadSuit:'H'});
});
test('suit ink changes following, bowers and winners while retaining card identity',()=>{
 const inked:Card={...card('D11'),mod:'inkS'};
 assert.equal(cardSuit(inked),'S');assert.equal(effective(inked,'H'),'S');assert.equal(effective(inked,'C'),'C');
 assert.ok(strength(inked,'C')>strength(card('C14'),'C'));
 const lead=[play('S5')];assert.deepEqual(legalCards([inked,card('D14')],lead,'H').map(c=>c.id),['D11']);
 assert.equal(trickWinner([...lead,{card:inked,seat:1,lowest:false},play('S10',2),play('D14',3)],'NT'),1);
 const shop=fresh(3);shop.phase='pub';const bought=reduce(shop,{type:'enhance',id:'D11',mod:'inkS'});assert.equal(bought.deck.find(c=>c.id==='D11')!.suit,'D');
 assert.throws(()=>reduce(shop,{type:'enhance',id:'joker',mod:'inkS'}));
});
test('Gatekeeper permits one explicit break per deal, only for the partnership',()=>{
 const s=fresh(2);s.phase='play';s.bid={seat:1,tricks:6,suit:'H'};s.turn=0;s.regulars=['gatekeeper'];s.plays=[play('C5',3)];s.hands[0]=[card('C14'),card('H14')];
 assert.ok(canBreakSuit(s));assert.throws(()=>reduce(s,{type:'play',id:'H14'}));
 const used=reduce(s,{type:'play',id:'H14',breakSuit:true});assert.equal(used.counters.gatePass,1);assert.equal(used.plays.at(-1)!.ruleBreak,true);
 used.turn=0;used.hands[0]=[card('C14'),card('H13')];assert.equal(canBreakSuit(used),false);assert.throws(()=>reduce(used,{type:'play',id:'H13',breakSuit:true}));
 const kept=reduce(s,{type:'play',id:'C14',breakSuit:true});assert.equal(kept.counters.gatePass,undefined);
 s.turn=1;s.hands[1]=s.hands[0];assert.equal(canBreakSuit(s),false);assert.throws(()=>reduce(s,{type:'play',id:'H14',breakSuit:true}));
});
test('complete no-trumps deals, ink and Gatekeeper actions replay through existing saves',()=>{
 for(let seed=0;seed<25;seed++){
  let s=reduce(fresh(seed),{type:'start',regular:'gatekeeper'});s=reduce(s,{type:'bid',tricks:10,suit:'NT'});
  while(s.phase==='auction')s=reduce(s,{type:'pass'});
  while(s.phase!=='settlement'){
   if(s.phase==='insight')s=reduce(s,{type:'insight',accept:false});
   else if(s.phase==='trick')s=reduce(s,{type:'collect'});
   else if(canBreakSuit(s)){const legal=legalCards(s.hands[s.turn],s.plays,'NT');const chosen=s.hands[s.turn].find(c=>!legal.some(l=>l.id===c.id))!;s=reduce(s,{type:'play',id:chosen.id,breakSuit:true});}
   else s=reduce(s,aiAction(observation(s)));
  }
  s=reduce(s,{type:'settle'});assert.equal(s.tricks[0]+s.tricks[1],10);assert.deepEqual(replay(s.seed,s.actions),s);
  s=reduce(s,{type:'pub'});if(s.phase==='pub'){s=reduce(s,{type:'enhance',id:'D11',mod:'inkS'});s=reduce(s,{type:'event',choice:'rest'});s=reduce(s,{type:'next'});assert.equal(s.counters.gatePass,undefined);}
  assert.deepEqual(unpack(JSON.stringify(pack(s,{nights:0,best:0,metMabel:false}))).state,s);
 }
});

test('v0.3 completed night with recruits still replays byte-for-byte',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/v03-save.json',import.meta.url),'utf8'));
 const state=unpack(JSON.stringify(fixture.save)).state;
 assert.equal(createHash('sha256').update(JSON.stringify(state)).digest('hex'),fixture.expectedSha);
});
