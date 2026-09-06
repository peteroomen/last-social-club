import {useEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {fresh,reduce,aiAction,observation,isPlayer,seatName,SUITS,symbol,cardName,rankName,sortHand,effective,legalCards,bidValue,failCost,trickWinner,pending,type State,type Action,type Card,type Suit,type Seat,type Entry} from '../engine/game.ts';
import {REGULARS,regular,MODIFIERS,type RegularId,type Modifier} from '../content/regulars.ts';
import {load,save,pack,unpack,type Campaign} from '../persistence.ts';
import {Pub} from './Pub.tsx';
import {playSound,unlockSound,setSoundEnabled} from './audio.ts';

type Feedback={id:number;entries:Entry[];points:number;mult:number;factor:number;cards:State['plays'];winner:Seat|null};
function seed(){return crypto.getRandomValues(new Uint32Array(1))[0];}
function initial(){try{const loaded=load();if(loaded)return {...loaded,error:''};}catch{return {state:fresh(seed()),campaign:{nights:0,best:0,metMabel:false},error:'Save unreadable. Started a new night.'};}return {state:fresh(seed()),campaign:{nights:0,best:0,metMabel:false},error:''};}
const compact=(n:number)=>new Intl.NumberFormat('en',{notation:n>=10000?'compact':'standard',maximumFractionDigits:1}).format(n);
const suitName=(s:Suit)=>({S:'spades',C:'clubs',D:'diamonds',H:'hearts'})[s];

function Portrait({id,className=''}:{id:number;className?:string}){return <div className={`portrait portrait-${id} ${className}`} style={{backgroundPosition:`${(id%4)*100/3}% ${Math.floor(id/4)*100}%`}} aria-hidden="true"/>;}
function CardFace({card,onClick,selected=false,disabled=false,compact:small=false,trump,style}:{card:Card;onClick?:()=>void;selected?:boolean;disabled?:boolean;compact?:boolean;trump?:Suit;style?:CSSProperties}){
 const bower=trump&&card.rank===11&&card.suit!==trump&&effective(card,trump)===trump;
 const label=`${cardName(card)}${bower?`, left bower, counts as ${suitName(trump)}`:''}${card.mod?`, ${MODIFIERS[card.mod].name}`:''}`;
 const content=<><span className="card-corner">{rankName(card)}<span>{symbol(card.suit)}</span></span>{!small&&<span className="card-pip">{symbol(card.suit)}</span>}{card.mod&&<><span className={`stamp ${card.mod}`}>{MODIFIERS[card.mod].mark}</span>{!small&&<span className="enchantment-name">{MODIFIERS[card.mod].name}</span>}</>}{bower&&<span className="bower">{symbol(trump!)} trump</span>}</>;
 const cls=`playing-card ${card.mod?'enchanted enchant-'+card.mod:''} ${card.suit==='H'||card.suit==='D'?'red':''} ${selected?'selected':''} ${small?'small':''} ${disabled?'unplayable':''}`;
 return onClick?<button className={cls} style={style} aria-label={label} aria-pressed={selected} onClick={onClick} aria-disabled={disabled}>{content}</button>:<div className={cls} style={style} role="img" aria-label={label}>{content}</div>;
}
function fanStyle(index:number,count:number):CSSProperties{
 const position=count>1?(index/(count-1)*2-1):0;
 return {'--fan-angle':`${position*10}deg`,'--fan-drop':`${position*position*17}px`,'--fan-order':index+1} as CSSProperties;
}
function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;d?.showModal();return()=>d?.close();},[]);
 return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}} aria-labelledby="dialog-title"><div className="modal-head"><h2 id="dialog-title">{title}</h2><button className="close" onClick={onClose} aria-label="Close">×</button></div>{children}</dialog>;
}
export default function App(){
 const [boot]=useState(initial);
 const [sound,setSound]=useState(()=>{try{return localStorage.getItem('last-social-club.sound')!=='off';}catch{return true;}});
 const [feedback,setFeedback]=useState<Feedback|null>(null);const [s,setS]=useState(boot.state);const [campaign,setCampaign]=useState<Campaign>(boot.campaign);
 const [error,setError]=useState(boot.error);const [modal,setModal]=useState<string|null>(null);const [selected,setSelected]=useState<string[]>([]);
 const [bidSuit,setBidSuit]=useState<Suit>('H');const [bidTricks,setBidTricks]=useState(6);const [inspect,setInspect]=useState<Seat|null>(null);
 const [speed,setSpeed]=useState(false);const [busy,setBusy]=useState(false);const [enhanceId,setEnhanceId]=useState('H9');const [enhanceMod,setEnhanceMod]=useState<Modifier>('gilt');
 const fileRef=useRef<HTMLInputElement>(null);
 const [fullscreen,setFullscreen]=useState(!!document.fullscreenElement);
 useEffect(()=>{const update=()=>setFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update);},[]);
 const toggleFullscreen=async()=>{
  try{
   if(document.fullscreenElement){await document.exitFullscreen();return;}
   if(!document.documentElement.requestFullscreen){setError('Fullscreen is unavailable in this browser.');return;}
   await document.documentElement.requestFullscreen({navigationUI:'hide'});
   const orientation=screen.orientation as ScreenOrientation&{lock?:(value:string)=>Promise<void>};
   try{await orientation.lock?.('landscape');}catch{/* The table also fits browsers without orientation locking. */}
  }catch{setError('Fullscreen could not open. Try the fullscreen button again.');}
 };

 useEffect(()=>{setSoundEnabled(sound);try{localStorage.setItem('last-social-club.sound',sound?'on':'off');}catch{}},[sound]);
 const dispatch=(a:Action)=>{setError('');try{
  const next=reduce(s,a);
  if(a.type==='start'||a.type==='next')playSound('deal');
  else if(a.type==='bid'||a.type==='pass')playSound('bid');
  else if(a.type==='play')playSound('play');
  else if(a.type==='buy'||a.type==='enhance')playSound('buy');
  else if(a.type==='pub')playSound('room');
  if(a.type==='collect'||a.type==='settle'){
   const entries=next.ledger.slice(s.ledger.length);
   playSound(entries.some(e=>e.mult||e.factor)?'mult':'score');
   setFeedback({id:next.actions.length,entries,points:entries.reduce((n,e)=>n+(e.points??0),0),mult:entries.reduce((n,e)=>n+(e.mult??0),0),factor:entries.reduce((n,e)=>n*(e.factor??1),1),cards:a.type==='collect'?s.plays:[],winner:next.lastWinner});
  }else if(next.deal!==s.deal)setFeedback(null);
  setS(next);setSelected([]);
 }catch(e){setError(e instanceof Error?e.message:'That action is unavailable.');}};
 useEffect(()=>{if(!feedback)return;const timeout=setTimeout(()=>setFeedback(null),2600);return()=>clearTimeout(timeout);},[feedback]);
 useEffect(()=>{try{save(s,campaign);}catch{setError('Couldn’t save. Use Menu → Export save.');}},[s,campaign]);
 useEffect(()=>{
  if(s.phase==='over')setCampaign(c=>({...c,nights:Math.max(c.nights,s.night),best:Math.max(c.best,s.score)}));
 },[s.phase,s.night,s.score]);
 useEffect(()=>{
  const ai=['auction','kitty','play'].includes(s.phase)&&!isPlayer(s.turn);
  const settling=s.phase==='settlement'&&!s.counters.settled;
  if(!ai&&!settling)return;const timeout=setTimeout(()=>{dispatch(settling?{type:'settle'}:aiAction(observation(s)));},settling?80:speed?150:650);
  return ()=>clearTimeout(timeout);
 },[s,speed]);
 useEffect(()=>{if(s.phase==='auction'){const possible=SUITS.flatMap(suit=>[6,7,8,9,10].map(tricks=>({tricks,suit}))).filter(b=>!s.bid||bidValue(b)>bidValue(s.bid));if(s.bid&&bidValue({tricks:bidTricks,suit:bidSuit})<=bidValue(s.bid)&&possible.length){const first=possible.sort((a,b)=>bidValue(a)-bidValue(b))[0];setBidTricks(first.tricks);setBidSuit(first.suit);}}},[s.bid,s.phase]);
 const activeSeat:Seat=s.phase==='kitty'||s.phase==='insight'?isPlayer(s.turn)?s.turn:0:isPlayer(s.turn)?s.turn:0;
 const shownSeat=inspect??activeSeat;const otherSeat:Seat=shownSeat===0?2:0;const trump=s.bid?.suit;
 const ourTurn=isPlayer(s.turn);const playable=s.phase==='play'&&ourTurn?legalCards(s.hands[s.turn],s.plays,trump!):[];
 const canSelect=(s.phase==='play'||s.phase==='kitty')&&ourTurn&&shownSeat===s.turn;
 const select=(id:string)=>{playSound('select');setSelected(old=>s.phase==='kitty'?(old.includes(id)?old.filter(x=>x!==id):old.length<3?[...old,id]:old):[id]);};
 const picked=s.hands.flat().find(c=>c.id===selected[selected.length-1]);
 const exportSave=()=>{const blob=new Blob([JSON.stringify(pack(s,campaign),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`last-social-club-${s.seed}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const startNew=(same=false)=>{setFeedback(null);setS(fresh(same?s.seed:seed(),campaign.nights+1));setModal(null);setSelected([]);setInspect(null);};
 const chooseEvent=(choice:'rest'|'ask'|'leave')=>{dispatch({type:'event',choice});if(choice!=='leave')setCampaign(c=>({...c,metMabel:true}));};
 const isTable=['auction','kitty','insight','play','trick'].includes(s.phase);
 const regularId=modal?.startsWith('regular:')?modal.slice(8) as RegularId:null;
 return <main onPointerDown={unlockSound} onKeyDown={unlockSound} className={`club ${isTable?'table-screen':s.phase==='arrival'||s.phase==='pub'?'room-screen':'summary-screen'} phase-${s.phase} ${s.insight>=3?'after-hours':''}`}>
  <header className="masthead"><div><h1>THE LAST SOCIAL CLUB</h1><span className="version-chip">FIRST SITTING · v0.3</span></div><div className="header-controls"><button className="fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen?'Exit fullscreen':'Enter fullscreen'} title={fullscreen?'Exit fullscreen':'Enter fullscreen'}><span aria-hidden="true">{fullscreen?'↙':'⛶'}</span><span>{fullscreen?'Exit':'Full screen'}</span></button><button className="menu-button" onClick={()=>setModal('menu')} aria-label="Open menu">☰</button></div></header>
  <div className="resources"><button onClick={()=>setModal('composure')}><span>COMPOSURE</span><strong>{s.composure}<small>/20</small></strong><i className="nerve"><i style={{width:`${s.composure*5}%`}}/></i></button><div className="money"><span>POCKET</span><strong>£{s.cash}</strong></div><button onClick={()=>setModal('insight')}><span>INSIGHT</span><strong>{s.insight}<small>/3</small></strong><i className="insight-dots">{[1,2,3].map(n=><i key={n} className={s.insight>=n?'lit':''}/>)}</i></button></div>
  {error&&<div className="error" role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss">×</button></div>}
  {s.phase==='arrival'?<Pub arrival deal={0} eventDone={false} onStart={()=>setModal('starters')} onRecruit={()=>setModal('starters')} onDeck={()=>setModal('starters')} onMabel={()=>setModal('starters')} onNext={()=>setModal('starters')}/>:<>
  <div className={`regular-rack ${s.regulars.length>2?'many-regulars':''}`} aria-label="Your Regulars">
   <div className="owned-regulars">{s.regulars.map(id=><button key={id} className={`regular-card ${feedback?.entries.some(e=>e.label.includes(regular(id).name))?'triggered':''}`} onClick={()=>setModal(`regular:${id}`)}><Portrait id={regular(id).portrait}/><span>{regular(id).short}</span></button>)}</div>
   {s.regulars.length<5&&<div className="empty-regulars">{Array.from({length:5-s.regulars.length},(_,i)=><div key={i} className="regular-empty" aria-label="Empty Regular slot">+</div>)}</div>}
  </div>
  {isTable&&<>
   <section className="partner-hand"><button className="hand-label" onClick={()=>{setInspect(otherSeat);setSelected([]);}}>{seatName(otherSeat).toUpperCase()} · YOUR {otherSeat===2?'PARTNER':'HAND'} <span>Inspect ↗</span></button><div className="compact-hand">{sortHand(s.hands[otherSeat],trump).map((c,i)=><CardFace style={fanStyle(i,s.hands[otherSeat].length)} key={c.id} card={c} compact trump={trump} onClick={()=>{setInspect(otherSeat);setSelected([]);}}/>)}</div></section>
   <section className="table" aria-label="Playing table">
    <div className={`rival left ${s.turn===3?'acting':''}`}><Portrait id={2}/><strong>MABEL</strong><span>Cautious</span><div className="card-backs">{[0,1,2].map(i=><i key={i}/>)}</div></div>
    <div className={`rival right ${s.turn===1?'acting':''}`}><Portrait id={3}/><strong>ARTHUR</strong><span>Bold</span><div className="card-backs">{[0,1,2].map(i=><i key={i}/>)}</div></div>
    <div className="table-centre">
     {feedback&&<TrickReceipt feedback={feedback} trump={trump}/>}
     {s.phase==='auction'?<><div className="kitty-backs"><i/><i/><i/></div><span className="table-caption">KITTY · 1+ marked</span><div className="contract-plaque">{s.bid?<>{seatName(s.bid.seat).toUpperCase()} BIDS <b>{s.bid.tricks}{symbol(s.bid.suit)}</b></>:'BIDDING'}</div></>:s.phase==='kitty'||s.phase==='insight'?<><p className="table-caption">{seatName(s.bid!.seat).toUpperCase()} TAKES THE KITTY</p><div className="contract-plaque"><b>{s.bid!.tricks}{symbol(trump!)}</b> CONTRACT</div><p className="table-caption">{ourTurn?'Discard 3':'Discarding…'}</p></>:<><div className="contract-mini">{seatName(s.bid!.seat)} · {s.bid!.tricks}{symbol(trump!)} <span>{isPlayer(s.bid!.seat)?'Your contract':'You defend'}</span></div><div className="trick-cards">{s.plays.length?s.plays.map(p=><div key={p.seat} className={`trick-play seat-${p.seat}`}><CardFace card={p.card} trump={trump}/><small>{seatName(p.seat)}</small></div>):<span className="empty-trick">{seatName(s.turn)} leads</span>}</div></>}
    </div><div className="mug" aria-hidden="true"/>
    <div className="table-bottom">{s.phase==='trick'?<strong>{seatName(trickWinner(s.plays,trump!))} wins the trick</strong>:<strong>{ourTurn?'YOUR TURN':'THINKING'} · {seatName(s.turn).toUpperCase()}</strong>}{s.phase!=='auction'&&<span>Tricks · You {s.tricks[0]} : {s.tricks[1]} Rivals</span>}</div>
   </section>
   <section className="active-hand"><div className="hand-label">{seatName(shownSeat).toUpperCase()} · {s.phase==='kitty'&&s.turn===shownSeat?'DISCARD 3':'YOUR HAND'}{inspect!==null&&inspect!==activeSeat?<button onClick={()=>{setInspect(null);setSelected([]);}}>Back to turn ↩</button>:<span>{s.hands[shownSeat].length} cards</span>}</div><div style={{'--cards':s.hands[shownSeat].length||1} as CSSProperties} className={`full-hand ${s.hands[shownSeat].length>10?'kitty-hand':''}`}>{sortHand(s.hands[shownSeat],trump).map((c,i)=><CardFace style={fanStyle(i,s.hands[shownSeat].length)} key={c.id} card={c} trump={trump} onClick={canSelect&&!(s.phase==='play'&&!playable.some(p=>p.id===c.id))?()=>select(c.id):()=>setModal(`card:${c.id}`)} selected={selected.includes(c.id)} disabled={canSelect&&s.phase==='play'&&!playable.some(p=>p.id===c.id)}/>)}</div></section>
   <div className="score-strip"><span>Deal {s.deal}/3<br/><small>Night {compact(s.score)}</small></span><button className={feedback?'score-meter scoring':'score-meter'} onClick={()=>setModal('ledger')} aria-label={`Deal score: ${s.points} points times ${s.mult} multiplier equals ${pending(s)}. Score details`}><span className="points-value"><small>POINTS</small><AnimatedNumber value={s.points}/></span><span className="score-times">×</span><span className="mult-value"><small>MULT</small><AnimatedNumber value={s.mult}/></span><span className="score-equals">=</span><strong><AnimatedNumber value={pending(s)}/></strong></button></div>
   <section className="action-panel" aria-live="polite">
    {picked?.mod&&<button className={`card-explain explain-${picked.mod}`} onClick={()=>setModal(`card:${picked.id}`)}><b>{MODIFIERS[picked.mod].name}</b> · {MODIFIERS[picked.mod].effect} <span>ⓘ</span></button>}
    {s.phase==='auction'&&ourTurn?<><h2>{s.bid?'RAISE TO':'OPEN WITH'} {bidTricks}<span className={bidSuit==='D'||bidSuit==='H'?'red-text':''}>{symbol(bidSuit)}</span></h2><div className="bid-select"><div className="suit-picker">{SUITS.map(suit=><button key={suit} className={`${bidSuit===suit?'chosen':''} ${suit==='D'||suit==='H'?'red-text':''}`} aria-label={suitName(suit)} aria-pressed={bidSuit===suit} onClick={()=>setBidSuit(suit)}>{symbol(suit)}</button>)}</div><div className="quantity"><button disabled={bidTricks<=6} onClick={()=>setBidTricks(n=>n-1)} aria-label="Bid fewer tricks">−</button><strong>{bidTricks}</strong><button disabled={bidTricks>=10} onClick={()=>setBidTricks(n=>n+1)} aria-label="Bid more tricks">+</button></div></div><p className="stakes">Make +{bidValue({tricks:bidTricks,suit:bidSuit})} pts · Fail −{failCost(s,{seat:s.turn,tricks:bidTricks,suit:bidSuit})}</p><div className="actions"><button onClick={()=>dispatch({type:'pass'})}>PASS</button><button className="primary" disabled={!!s.bid&&bidValue({tricks:bidTricks,suit:bidSuit})<=bidValue(s.bid)} onClick={()=>dispatch({type:'bid',tricks:bidTricks,suit:bidSuit})}>BID {bidTricks}{symbol(bidSuit)}</button></div></>:null}
    {s.phase==='kitty'&&ourTurn&&<><p>{selected.length} / 3 discards selected</p><button className="primary wide" disabled={selected.length!==3} onClick={()=>{dispatch({type:'discard',ids:selected});setInspect(null);}}>DISCARD 3</button></>}
    {s.phase==='insight'&&<><h3>Gain 1 Insight?</h3><InsightCost/><div className="actions"><button onClick={()=>dispatch({type:'insight',accept:false})}>Decline</button><button className="primary" onClick={()=>dispatch({type:'insight',accept:true})}>Accept · +1</button></div></>}
    {s.phase==='play'&&ourTurn&&<><div className="play-hint">{picked?<><strong>{cardName(picked)}</strong>{picked.mod?` · ${MODIFIERS[picked.mod].name}`:''}{trump&&picked.rank===11&&picked.suit!==trump&&effective(picked,trump)===trump?` · Left bower: ${suitName(trump)}`:''}</>:s.plays.length?`Follow ${suitName(effective(s.plays[0].card,trump!))} if possible.`:'Select a card to lead.'}</div><button className="primary wide" disabled={!picked||!playable.some(c=>c.id===picked.id)} onClick={()=>{dispatch({type:'play',id:picked!.id});setInspect(null);}}>PLAY {picked?cardName(picked):'A CARD'}</button></>}
    {s.phase==='trick'&&<><button className="primary wide" onClick={()=>dispatch({type:'collect'})}>{s.history.length===9?'FINISH THE DEAL':'NEXT TRICK'}</button></>}
    {!ourTurn&&['auction','play','kitty'].includes(s.phase)&&<><p>{seatName(s.turn)} {s.phase==='auction'?'is bidding':s.phase==='kitty'?'is discarding':'is playing'}…</p></>}

   </section>
  </>}
  {s.phase==='settlement'&&<section className="settlement"><p className="eyebrow">DEAL {s.deal} · {s.bid!.tricks}{symbol(trump!)} BY {seatName(s.bid!.seat).toUpperCase()}</p><h2>{s.message||'Scoring…'}</h2><div className="big-score">+<AnimatedNumber value={s.dealScore}/></div><p>{s.points} points × {s.mult} Mult{s.ledger.some(e=>e.factor)?' × 2 exact bid':''}</p><div className="result-facts"><span>You took <b>{s.tricks[0]} tricks</b></span><span>{s.penalty?`−${s.penalty} Composure`:'Composure held'}</span><span>Night score <b>{compact(s.score)}</b></span></div><details className="score-details"><summary>Score breakdown</summary><Ledger s={s}/></details><button className="primary wide" disabled={!s.counters.settled} onClick={()=>dispatch({type:'pub'})}>{s.composure<=0||s.deal>=3?'END THE NIGHT':'VISIT THE PUB'}</button></section>}
  {s.phase==='pub'&&<Pub arrival={false} deal={s.deal} eventDone={s.eventDone} onStart={()=>{}} onRecruit={()=>setModal('recruit')} onDeck={()=>setModal('deck')} onMabel={()=>setModal('mabel')} onNext={()=>{dispatch({type:'next'});setInspect(null);}}/>}
  {s.phase==='over'&&<section className="night-end"><p className="eyebrow">NIGHT {s.night}</p><h2>{s.composure>0?'Night complete':'Night over'}</h2><div className="big-score"><AnimatedNumber value={s.score}/></div><p>points across {s.deal} {s.deal===1?'deal':'deals'}</p><p>{s.composure} Composure · {s.insight} Insight · {s.regulars.length} Regulars</p><div className="result-facts"><span>Best night <b>{compact(Math.max(campaign.best,s.score))}</b></span></div><button className="primary wide" onClick={()=>startNew()}>ANOTHER NIGHT</button><button className="wide" onClick={exportSave}>Export save</button><button className="text-button" onClick={()=>startNew(true)}>Replay this seed</button></section>}
  </>}
  <div className="rotate-hint">↻ Turn sideways for the full table</div><footer className="club-footer"><span>{s.insight>=3?'AFTER HOURS':'CLOSING TIME'}</span></footer>
  {modal&&<Modal title={regularId?regular(regularId).name:modal.startsWith('card:')?'Card detail':({menu:'Menu',rules:'How to play',history:'History',ledger:'Score',insight:'Insight',composure:'Composure',restart:'New night?',starters:'Choose a Regular',recruit:'Regulars',deck:'Improve a card',mabel:'Mabel'}[modal]??'The club')} onClose={()=>setModal(null)}>
   {modal==='starters'&&<><p className="hint">You play North &amp; South · Three deals</p><div className="starter-grid">{(['bookkeeper','gatekeeper','switchboard','wallflower'] as RegularId[]).map(id=>{const r=regular(id);return <button key={id} className="starter" onClick={()=>{dispatch({type:'start',regular:id});setModal(null);}}><Portrait id={r.portrait}/><div><h3>{r.name}</h3><p>{r.effect}</p></div></button>;})}</div></>}
   {modal==='recruit'&&<div className="shop-list">{s.offer.map(id=>{const r=regular(id);return <article key={id} className="shop-item"><Portrait id={r.portrait}/><div><h3>{r.name}</h3><p>{r.effect}</p><button disabled={s.cash<r.price||s.regulars.length>=5} onClick={()=>dispatch({type:'buy',id})}>Recruit · £{r.price}</button></div></article>;})}{!s.offer.length&&<p>No Regulars left.</p>}</div>}
   {modal==='deck'&&<div className="deck-workbench"><div className="enchant-preview"><CardFace card={{...s.deck.find(c=>c.id===enhanceId)!,mod:enhanceMod}}/><div><h3>{MODIFIERS[enhanceMod].name}</h3><p>{MODIFIERS[enhanceMod].effect}</p></div></div><label>Card<select value={enhanceId} onChange={e=>setEnhanceId(e.target.value)}>{s.deck.map(c=><option key={c.id} value={c.id}>{cardName(c)}{c.mod?` · ${MODIFIERS[c.mod].name}`:''}</option>)}</select></label><div className="enchant-choices">{Object.entries(MODIFIERS).map(([id,m])=><button key={id} aria-pressed={enhanceMod===id} onClick={()=>setEnhanceMod(id as Modifier)}>{m.mark} {m.name}</button>)}</div><button className="primary wide" disabled={s.cash<3||s.enhanced} onClick={()=>dispatch({type:'enhance',id:enhanceId,mod:enhanceMod})}>{s.enhanced?'Enhanced':'Enhance · £3'}</button><button className="wide" onClick={()=>dispatch({type:'favour',id:enhanceId})}>Favour · free</button><p className="hint">Lasts this night. Rivals can receive this card.</p>{s.favour&&<p>Favoured: {cardName(s.deck.find(c=>c.id===s.favour)!)} <button className="text-button" onClick={()=>dispatch({type:'favour',id:null})}>Clear</button></p>}</div>}
   {modal==='mabel'&&<>{!s.eventDone?<><p>{campaign.metMabel?'“Good to see you.”':'“Take a seat.”'}</p><button className="wide" onClick={()=>{chooseEvent('rest');setModal(null);}}>Rest · +3 Composure</button><button className="wide" onClick={()=>{chooseEvent('ask');setModal(null);}}>Ask · +2 Insight</button><InsightCost/><button className="text-button" onClick={()=>{chooseEvent('leave');setModal(null);}}>Skip</button></>:<p>“See you inside.”</p>}</>}
   {regularId&&<><Portrait id={regular(regularId).portrait} className="detail-portrait"/><p className="tag">{regular(regularId).tag}</p><p>{regular(regularId).effect}</p></>}
   {modal.startsWith('card:')&&(()=>{const c=s.hands.flat().find(c=>c.id===modal.slice(5));return c?<><CardFace card={c} trump={trump}/><p>{cardName(c)}{c.mod?` · ${MODIFIERS[c.mod].name}`:''}</p><p>{c.mod?MODIFIERS[c.mod].effect:'No enhancement.'}</p>{trump&&effective(c,trump)===trump&&<p>Counts as trump: {suitName(trump)}.</p>}</>:null;})()}
   {modal==='composure'&&<><p>At 0, the night ends.</p><p>Failed bid: −2 at six tricks, −2 per extra trick. Rivals succeed: −1 at six, −1 per extra trick.</p><p>Insight 3: failed bids cost 2 more. Rest: +3, up to 20.</p></>}
   {modal==='insight'&&<><p>{s.insight} / 3</p><InsightCost/><p>Also at 3: Veiled captures +15 points; Listener activates.</p><p>Optional. Resets each night.</p></>}
   {modal==='rules'&&<Rules/>}
   {modal==='ledger'&&<><p>{s.points} points × {s.mult} Mult. Bid bonuses apply at deal end.</p><Ledger s={s}/></>}
   {modal==='history'&&<><h3>Auction</h3><ol>{s.auction.map((a,i)=><li key={i}>{a}</li>)}</ol><h3>Tricks</h3>{s.history.map((t,i)=><p key={i}><b>{i+1}. {seatName(t.winner)} wins</b><br/>{t.plays.map(p=>`${seatName(p.seat)} ${cardName(p.card)}`).join(' · ')}</p>)}{!s.history.length&&<p>No tricks yet.</p>}</>}
   {modal==='menu'&&<><p className="muted">First sitting · v0.3 · Suited 500</p><button className="wide" onClick={toggleFullscreen}>{fullscreen?'Exit fullscreen':'Full screen'}</button><button className="wide" onClick={()=>setModal('rules')}>Help</button><button className="wide" onClick={()=>setModal('history')}>History</button><label className="speed"><input type="checkbox" checked={sound} onChange={e=>{setSoundEnabled(e.target.checked);if(e.target.checked)unlockSound();setSound(e.target.checked);}}/> Sound effects</label><label className="speed"><input type="checkbox" checked={speed} onChange={e=>setSpeed(e.target.checked)}/> Faster rival turns</label><button className="wide" onClick={exportSave}>Export save</button><button className="wide" disabled={busy} onClick={()=>fileRef.current?.click()}>Import save</button><input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);try{if(file.size>500000)throw new Error('Save is too large.');const data=unpack(await file.text());setFeedback(null);setS(data.state);setCampaign(data.campaign);setInspect(null);setSelected([]);setModal(null);}catch(err){setError(err instanceof Error?err.message:'Could not import save.');}finally{setBusy(false);e.target.value='';}}}/><button className="wide" onClick={()=>setModal('restart')}>New night</button><p className="footer-note">Autosaved · Best {compact(campaign.best)} · Seed {s.seed}</p></>}
   {modal==='restart'&&<><p>Replace this night? Best score and story progress stay.</p><button className="wide" onClick={exportSave}>Export save</button><button className="primary wide" onClick={()=>startNew()}>New night</button></>}
  </Modal>}
 </main>;
}
function Ledger({s}:{s:State}) {return <div className="ledger">{s.ledger.length?s.ledger.map((e,i)=><div key={i}><span>{e.label}</span><strong>{e.points?`+${e.points} pts`:e.mult?`+${e.mult} Mult`:`×${e.factor}`}</strong></div>):<p>No points yet.</p>}</div>;}
function AnimatedNumber({value}:{value:number}){
 const [shown,setShown]=useState(value);const previous=useRef(value);
 useEffect(()=>{
  const from=previous.current;previous.current=value;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setShown(value);return;}
  const start=performance.now();let frame=0;
  const tick=(now:number)=>{const t=Math.min(1,(now-start)/480);setShown(Math.round(from+(value-from)*(1-Math.pow(1-t,3))));if(t<1)frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[value]);
 return <span>{compact(shown)}</span>;
}
function TrickReceipt({feedback:f,trump}:{feedback:Feedback;trump?:Suit}){
 return <div key={f.id} className="trick-feedback" aria-live="polite">
  {!!f.cards.length&&<div className={`collected-cards to-seat-${f.winner}`} aria-hidden="true">{f.cards.map(p=><CardFace key={p.seat} card={p.card} compact trump={trump}/>)}</div>}
  <div className={`score-receipt ${f.points||f.mult||f.factor>1?'reward':'rival-capture'}`}>
   <small>{f.cards.length?(f.winner!==null&&isPlayer(f.winner)?'TRICK WON':'RIVALS TAKE'):'CONTRACT'}</small>
   <div>{f.points>0&&<strong>+{f.points} <small>POINTS</small></strong>}{f.mult>0&&<strong className="receipt-mult">+{f.mult} <small>MULT</small></strong>}{f.factor>1&&<strong>×{f.factor}</strong>}</div>
   {f.entries.filter(e=>!e.label.startsWith('Trick ')).slice(0,2).map((e,i)=><span key={i}>{e.label.replace('The ','')}</span>)}
  </div>
 </div>;
}
function InsightCost(){return <p className="hint">At Insight 3, each deal: first marked capture +2 Mult. Failed bids cost 2 extra Composure.</p>;}
function Rules(){return <div className="rules">
 <p>You play North &amp; South. Win your bid or stop theirs. Three deals; keep Composure above 0.</p>
 <details><summary>Bidding</summary><p>Bid 6–10 tricks. Suit order: ♠ ♣ ♦ ♥. More tricks beats any lower bid. Passing is final. All pass: dealer bids 6♠.</p><p>Winner takes the kitty, discards three and leads.</p></details>
 <details><summary>Playing</summary><p>Follow suit if possible; otherwise play any card. Highest trump wins, or highest led suit. Winner leads next. Ten tricks per deal.</p><p>Trump order: joker → trump jack → same-colour jack → A K Q → numbers. Both jacks count as trump.</p><p>43-card deck: no 2s, 3s or black 4s; one joker. Suited bids only.</p></details>
 <details><summary>Scoring</summary><p>Each captured trick: +10 points. Make your bid or defeat theirs for the contract bonus.</p><p>Score = points × Mult × exact-bid effects. Failed contracts still cost Composure.</p></details>
 <details><summary>Regulars &amp; cards</summary><p>Regulars last one night. Tap a portrait for its effect.</p><p>Enhancements can reach either side. The kitty has at least one. Favour increases your chance of receiving a card next deal; the kitty has priority.</p></details>
 </div>;}
