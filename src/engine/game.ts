import { REGULARS, regular, type RegularId, type Modifier } from '../content/regulars.ts';
export const RULESET = 'club-suited-1';
export const SUITS = ['S','C','D','H'] as const;
export type Suit = typeof SUITS[number];
export type Seat = 0|1|2|3;
export type Card = {id:string;suit:Suit|'J';rank:number;mod?:Modifier};
export type Bid = {seat:Seat;tricks:number;suit:Suit};
export type Play = {seat:Seat;card:Card;lowest:boolean};
export type Trick = {plays:Play[];winner:Seat};
export type Entry = {label:string;points?:number;mult?:number;factor?:number};
export type Phase = 'arrival'|'auction'|'kitty'|'insight'|'play'|'trick'|'settlement'|'pub'|'over';
export type Action =
 | {type:'start';regular:RegularId} | {type:'bid';tricks:number;suit:Suit} | {type:'pass'}
 | {type:'discard';ids:string[]} | {type:'insight';accept:boolean} | {type:'play';id:string}
 | {type:'collect'} | {type:'settle'} | {type:'pub'} | {type:'buy';id:RegularId}
 | {type:'enhance';id:string;mod:Modifier} | {type:'favour';id:string|null}
 | {type:'event';choice:'rest'|'ask'|'leave'} | {type:'next'};
export type State = {
 version:typeof RULESET; seed:number; night:number; phase:Phase; deal:number; dealer:Seat; turn:Seat;
 deck:Card[];hands:Card[][];kitty:Card[];discarded:Card[];passed:boolean[];bid:Bid|null;auction:string[];
 plays:Play[];history:Trick[];tricks:[number,number];ledger:Entry[];points:number;mult:number;
 score:number;cash:number;composure:number;insight:number;regulars:RegularId[];favour:string|null;
 counters:Record<string,number>;lastWinner:Seat|null;penalty:number;dealScore:number;made:boolean;
 eventDone:boolean;enhanced:boolean;offer:RegularId[];actions:Action[];message:string;
};
export const symbol = (s:Card['suit']) => ({S:'♠',C:'♣',D:'♦',H:'♥',J:'★'})[s];
export const rankName = (c:Card) => c.suit==='J'?'JK':({11:'J',12:'Q',13:'K',14:'A'}[c.rank]??String(c.rank));
export const cardName = (c:Card) => `${rankName(c)}${c.suit==='J'?'':symbol(c.suit)}`;
export const side = (seat:number) => seat%2;
export const isPlayer = (seat:number) => side(seat)===0;
export const seatName = (seat:number) => ['South','Arthur','North','Mabel'][seat];
export const nextSeat = (seat:number):Seat => ((seat+1)%4) as Seat;
export const bidValue = (b:Pick<Bid,'tricks'|'suit'>) => (b.tricks-6)*100+SUITS.indexOf(b.suit)*20+40;
export const failCost = (s:State,b:Bid) => 2+2*(b.tricks-6)+(s.insight>=3?2:0);
export function rng(seed:number) {let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function shuffle<T>(items:T[],random:()=>number) {const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createDeck():Card[] {
 const cards:Card[]=[];for(const suit of SUITS)for(let rank=(suit==='S'||suit==='C'?5:4);rank<=14;rank++)cards.push({id:`${suit}${rank}`,suit,rank});
 cards.push({id:'joker',suit:'J',rank:15});
 for(const [id,mod] of [['H9','gilt'],['C8','stamped'],['D7','threaded'],['S6','veiled']] as const)cards.find(c=>c.id===id)!.mod=mod;
 return cards;
}
export function effective(c:Card,trump:Suit):Suit {if(c.suit==='J'||c.rank===11&&c.suit!==trump&&colour(c.suit)===colour(trump))return trump;return c.suit as Suit;}
function colour(s:Card['suit']) {return s==='H'||s==='D'?'red':'black';}
export function strength(c:Card,trump:Suit,lead?:Suit) {
 if(c.suit==='J')return 200;if(effective(c,trump)===trump){if(c.rank===11)return c.suit===trump?199:198;return 100+c.rank;}
 return (lead===undefined||effective(c,trump)===lead?20:0)+c.rank;
}
export function legalCards(hand:Card[],plays:Play[],trump:Suit) {if(!plays.length)return hand;const lead=effective(plays[0].card,trump);const follow=hand.filter(c=>effective(c,trump)===lead);return follow.length?follow:hand;}
export function trickWinner(plays:Play[],trump:Suit):Seat {
 if(!plays.length)throw new Error('Empty trick');const lead=effective(plays[0].card,trump);let best=plays[0];
 for(const p of plays.slice(1))if(strength(p.card,trump,lead)>strength(best.card,trump,lead))best=p;return best.seat;
}
export function sortHand(hand:Card[],trump:Suit='H') {return [...hand].sort((a,b)=>{const sa=effective(a,trump),sb=effective(b,trump);return (sa===trump?4:SUITS.indexOf(sa))-(sb===trump?4:SUITS.indexOf(sb))||strength(b,trump)-strength(a,trump);});}
export function fresh(seed:number,night=1):State {return {version:RULESET,seed:seed>>>0,night,phase:'arrival',deal:0,dealer:3,turn:0,deck:createDeck(),hands:[[],[],[],[]],kitty:[],discarded:[],passed:[false,false,false,false],bid:null,auction:[],plays:[],history:[],tricks:[0,0],ledger:[],points:0,mult:1,score:0,cash:6,composure:20,insight:0,regulars:[],favour:null,counters:{},lastWinner:null,penalty:0,dealScore:0,made:false,eventDone:false,enhanced:false,offer:[],actions:[],message:''};}
// Uniformly choose among all eligible kitty triples: exact bounded sampling.
export function dealCards(deck:Card[],random:()=>number,favour:string|null) {
 const triples:number[][]=[];for(let i=0;i<deck.length-2;i++)for(let j=i+1;j<deck.length-1;j++)for(let k=j+1;k<deck.length;k++)if(deck[i].mod||deck[j].mod||deck[k].mod)triples.push([i,j,k]);
 if(!triples.length)throw new Error('The deck needs a marked card');
 const chosen=triples[Math.floor(random()*triples.length)];const kitty=chosen.map(i=>({...deck[i]}));
 const rest=deck.filter((_,i)=>!chosen.includes(i)).map(c=>({card:{...c},key:-Math.log(Math.max(Number.MIN_VALUE,random()))/(c.id===favour?1.5:1)})).sort((a,b)=>a.key-b.key);
 const ours=shuffle(rest.slice(0,20).map(x=>x.card),random),theirs=shuffle(rest.slice(20).map(x=>x.card),random);
 return {kitty,hands:[ours.slice(0,10),theirs.slice(0,10),ours.slice(10),theirs.slice(10)]};
}
function startDeal(s:State) {
 s.deal++;s.dealer=nextSeat(s.dealer);s.turn=nextSeat(s.dealer); // Deal 1 starts with Arthur; deal 2 with North.
 Object.assign(s,dealCards(s.deck,rng((s.seed+s.deal*1009)>>>0),s.favour));
 s.favour=null;s.phase='auction';s.bid=null;s.passed=[false,false,false,false];s.auction=[];s.plays=[];s.history=[];s.discarded=[];s.tricks=[0,0];s.points=0;s.mult=1;s.ledger=[];s.counters={};s.lastWinner=null;s.penalty=0;s.dealScore=0;s.eventDone=false;s.enhanced=false;s.message='';
}
function finishAuction(s:State) {s.turn=s.bid!.seat;s.hands[s.turn].push(...s.kitty);s.kitty=[];s.phase='kitty';}
function advanceAuction(s:State) {
 if(s.passed.every(Boolean)&&!s.bid){s.bid={seat:s.dealer,tricks:6,suit:'S'};s.auction.push('All pass: dealer takes 6♠ (house rule).');finishAuction(s);return;}
 let next=nextSeat(s.turn);for(let i=0;i<4&&s.passed[next];i++)next=nextSeat(next);
 if(s.bid&&next===s.bid.seat){finishAuction(s);return;}s.turn=next;
}
function add(s:State,label:string,points=0,mult=0,factor=0) {s.ledger.push({label,...(points?{points}:{}),...(mult?{mult}:{}),...(factor?{factor}:{})});s.points+=points;s.mult+=mult;}
function capped(s:State,id:string,cap:number) {if((s.counters[id]??0)>=cap)return false;s.counters[id]=(s.counters[id]??0)+1;return true;}
function collect(s:State) {
 const trump=s.bid!.suit,winner=trickWinner(s.plays,trump),ourWin=isPlayer(winner),won=s.plays.find(p=>p.seat===winner)!;
 s.tricks[side(winner)]++;s.history.push({plays:[...s.plays],winner});
 if(ourWin){
 add(s,`Trick ${s.history.length} · ${seatName(winner)}`,10);
 if(s.insight>=3&&s.plays.some(p=>p.card.mod)&&capped(s,'insight',1))add(s,'Insight · marked capture',0,2);
 for(const p of s.plays){
 if(p.card.mod==='gilt')add(s,`Gilt ${cardName(p.card)}`,15);
 if(p.card.mod==='veiled'&&s.insight>=3)add(s,`Veiled ${cardName(p.card)}`,15);
 if(p.card.mod==='threaded'&&p.seat===(winner+2)%4)add(s,`Threaded ${cardName(p.card)}`,15);
 if(s.regulars.includes('scavenger')&&p.card.mod&&!isPlayer(p.seat))add(s,'The Scavenger',15);
 }
 if(won.card.mod==='stamped')add(s,`Stamped ${cardName(won.card)}`,0,1);
 if(s.regulars.includes('wallflower')&&won.lowest&&capped(s,'wallflower',3))add(s,'The Wallflower',0,1);
 if(s.regulars.includes('switchboard')&&s.lastWinner!==null&&isPlayer(s.lastWinner)&&s.lastWinner!==winner&&capped(s,'switchboard',4))add(s,'The Operator',0,1);
 if(s.regulars.includes('gatekeeper')&&!isPlayer(s.bid!.seat)&&s.tricks[0]>=11-s.bid!.tricks)add(s,'The Gatekeeper',20);
 if(s.regulars.includes('groundskeeper')&&s.plays.every(p=>effective(p.card,trump)!==trump)&&capped(s,'groundskeeper',3))add(s,'The Groundskeeper',0,1);
 if(s.regulars.includes('listener')&&s.insight>=3&&capped(s,'listener',1))add(s,'The Listener',0,2);
 }
 s.lastWinner=winner;s.turn=winner;s.plays=[];s.phase=s.history.length===10?'settlement':'play';
}
function settle(s:State) {
 const b=s.bid!,declaring=isPlayer(b.seat);s.made=s.tricks[side(b.seat)]>=b.tricks;const success=declaring?s.made:!s.made;
 if(success)add(s,declaring?'Contract made':'Their contract set',bidValue(b));
 if(success&&declaring&&b.tricks>=8&&s.regulars.includes('underwriter'))add(s,'The Underwriter',0,2);
 let factor=1;if(success&&declaring&&s.tricks[0]===b.tricks&&s.regulars.includes('bookkeeper')){factor=2;add(s,'The Bookkeeper · exact contract',0,0,2);}
 s.penalty=success?0:declaring?failCost(s,b):1+b.tricks-6;
 s.composure=Math.max(0,s.composure-s.penalty);s.dealScore=Math.floor(s.points*s.mult*factor);s.score+=s.dealScore;s.cash+=success?3:2;
 s.message=success?(declaring?'Contract made':'Rivals set'):(declaring?'Contract missed':'Rivals made their contract');
 // Remain at settlement for review. A counter prevents duplicate rewards.
 s.counters.settled=1;
}
export function reduce(state:State,action:Action):State {
 const s:State=structuredClone(state);const bad=()=>{throw new Error(`Unavailable action: ${action.type} in ${s.phase}`);};
 switch(action.type){
 case 'start':if(s.phase!=='arrival'||!REGULARS.some(r=>r.id===action.regular))return bad();s.regulars=[action.regular];startDeal(s);break;
 case 'bid':if(s.phase!=='auction'||!SUITS.includes(action.suit)||!Number.isInteger(action.tricks)||action.tricks<6||action.tricks>10||s.passed[s.turn]||(s.bid&&bidValue(action)<=bidValue(s.bid)))return bad();s.bid={seat:s.turn,tricks:action.tricks,suit:action.suit};s.auction.push(`${seatName(s.turn)} bids ${action.tricks}${symbol(action.suit)}`);advanceAuction(s);break;
 case 'pass':if(s.phase!=='auction'||s.passed[s.turn])return bad();s.passed[s.turn]=true;s.auction.push(`${seatName(s.turn)} passes`);advanceAuction(s);break;
 case 'discard':{
 if(s.phase!=='kitty'||action.ids.length!==3||new Set(action.ids).size!==3||!action.ids.every(id=>s.hands[s.turn].some(c=>c.id===id)))return bad();
 s.discarded=s.hands[s.turn].filter(c=>action.ids.includes(c.id));s.hands[s.turn]=s.hands[s.turn].filter(c=>!action.ids.includes(c.id));
 s.phase=isPlayer(s.turn)&&s.hands[s.turn].some(c=>c.mod==='veiled')?'insight':'play';break;}
 case 'insight':if(s.phase!=='insight')return bad();if(action.accept)s.insight=Math.min(3,s.insight+1);s.phase='play';break;
 case 'play':{
 if(s.phase!=='play'||!s.bid)return bad();const legal=legalCards(s.hands[s.turn],s.plays,s.bid.suit),card=legal.find(c=>c.id===action.id);if(!card)return bad();
 const lead=s.plays.length?effective(s.plays[0].card,s.bid.suit):undefined;
 s.plays.push({seat:s.turn,card,lowest:strength(card,s.bid.suit,lead)===Math.min(...legal.map(c=>strength(c,s.bid!.suit,lead)))});
 s.hands[s.turn]=s.hands[s.turn].filter(c=>c.id!==card.id);s.turn=nextSeat(s.turn);if(s.plays.length===4)s.phase='trick';break;}
 case 'collect':if(s.phase!=='trick')return bad();collect(s);break;
 case 'settle':if(s.phase!=='settlement'||s.counters.settled)return bad();settle(s);break;
 case 'pub':if(s.phase!=='settlement'||!s.counters.settled)return bad();s.phase=s.deal>=3||s.composure<=0?'over':'pub';s.offer=shuffle(REGULARS.filter(r=>!s.regulars.includes(r.id)).map(r=>r.id),rng(s.seed+s.deal*601)).slice(0,3);break;
 case 'buy':{const r=regular(action.id);if(s.phase!=='pub'||!r||!s.offer.includes(action.id)||s.cash<r.price||s.regulars.length>=5||s.regulars.includes(action.id))return bad();s.cash-=r.price;s.regulars.push(action.id);s.offer=s.offer.filter(id=>id!==action.id);break;}
 case 'enhance':{const c=s.deck.find(c=>c.id===action.id);if(s.phase!=='pub'||s.cash<3||s.enhanced||!c||!['gilt','stamped','threaded','veiled'].includes(action.mod))return bad();c.mod=action.mod;s.cash-=3;s.enhanced=true;break;}
 case 'favour':if(s.phase!=='pub'||action.id!==null&&!s.deck.some(c=>c.id===action.id))return bad();s.favour=action.id;break;
 case 'event':if(s.phase!=='pub'||s.eventDone||!['rest','ask','leave'].includes(action.choice))return bad();s.eventDone=true;if(action.choice==='rest')s.composure=Math.min(20,s.composure+3);if(action.choice==='ask')s.insight=Math.min(3,s.insight+2);break;
 case 'next':if(s.phase!=='pub'||!s.eventDone)return bad();startDeal(s);break;
 default:return bad();
 }
 s.actions.push(action);return s;
}
export function replay(seed:number,actions:Action[],night=1) {return actions.reduce((s,a)=>reduce(s,a),fresh(seed,night));}
export const pending = (s:State) => s.points*s.mult;
export function observation(s:State) {return {hand:s.hands[s.turn],plays:s.plays,bid:s.bid,seat:s.turn,phase:s.phase,trait:s.turn===1?'bold':'cautious'} as const;}
// Policies only receive own cards and public information, never opponents' hands or undeclared kitty.
export function aiAction(o:ReturnType<typeof observation>):Action {
 if(o.phase==='auction'){
 const options:Bid[]=[];
 for(const suit of SUITS){const trumps=o.hand.filter(c=>effective(c,suit)===suit);const power=trumps.reduce((v,c)=>v+(strength(c,suit)>=198?1.0:c.rank>=13?0.85:c.rank>=10?0.5:0.28),0);const aces=o.hand.filter(c=>effective(c,suit)!==suit&&c.rank===14).length;
 const expected=2.4+power+aces*0.7+(trumps.length>=5?0.6:0)+(o.trait==='bold'?0.5:-0.25);
 for(let tricks=6;tricks<=Math.min(10,Math.floor(expected));tricks++){const b={seat:o.seat,tricks,suit};if(!o.bid||bidValue(b)>bidValue(o.bid))options.push(b);}}
 if(!options.length)return {type:'pass'};options.sort((a,b)=>bidValue(a)-bidValue(b));const b=options[0];return {type:'bid',tricks:b.tricks,suit:b.suit};
 }
 if(o.phase==='kitty'){const trump=o.bid!.suit;const sorted=[...o.hand].sort((a,b)=>strength(a,trump)-strength(b,trump));return {type:'discard',ids:sorted.slice(0,3).map(c=>c.id)};}
 if(o.phase==='play'){
 const trump=o.bid!.suit,legal=legalCards(o.hand,o.plays,trump),lead=o.plays.length?effective(o.plays[0].card,trump):undefined;
 const ordered=[...legal].sort((a,b)=>strength(a,trump,lead)-strength(b,trump,lead));
 if(!o.plays.length){const high=ordered.at(-1)!;return {type:'play',id:(strength(high,trump)>=198?high:ordered.find(c=>c.rank===14)??ordered[0]).id};}
 const current=trickWinner(o.plays,trump);if(side(current)===side(o.seat))return {type:'play',id:ordered[0].id};
 const winner=o.plays.find(p=>p.seat===current)!.card;return {type:'play',id:(ordered.find(c=>strength(c,trump,lead)>strength(winner,trump,lead))??ordered[0]).id};
 }
 throw new Error('AI not active');
}
