import {type State,seatName,isPlayer,symbol,trickWinner} from '../engine/game.ts';
const strokes:Record<string,string>={
 '0':'M9 3C1 2 1 21 8 21C16 22 17 2 9 3Z',
 '1':'M4 7L10 3L9 21M4 21L14 21',
 '2':'M2 7C4 0 17 2 14 9C12 13 5 17 2 21L16 20',
 '3':'M3 4C18-1 17 11 8 11C20 9 16 26 2 19',
 '4':'M12 2L2 15L17 14M12 7L11 22',
 '5':'M16 3L4 3L3 11C18 6 19 23 3 21',
 '6':'M14 3C4-1-2 21 8 21C19 21 16 7 5 12',
 '7':'M2 4L17 3L7 22M6 12L14 11',
 '8':'M9 11C-5 6 9-4 15 5C21 15-2 9 3 19C10 27 23 16 9 11Z',
 '9':'M13 12C0 18 0 1 10 3C20 4 14 23 5 22',
 '.':'M8 21L9 21',',':'M9 20L7 24','-':'M3 13L14 12',
 K:'M3 3L2 22M15 3L3 13L16 22',M:'M2 22L3 3L10 14L17 3L17 22',
 k:'M3 3L2 22M15 9L3 15L15 22',m:'M2 22L2 10Q7 5 9 12Q15 5 17 12L17 22'
};
export function PencilNumber({value}:{value:string|number}){
 const chars=String(value).split('');
 return <svg className="pencil-number" viewBox={`0 0 ${chars.length*20} 26`} style={{width:`${chars.length*.64}em`}} role="img" aria-label={String(value)}>{chars.map((c,i)=><path key={i} d={strokes[c]??strokes['-']} transform={`translate(${i*20} 0)`}/>)}</svg>;
}
export function ContractBoard({s,onHistory,pulse}:{s:State;onHistory:()=>void;pulse:number}){
 return <div className="contract-board">
  <button className={`trick-pile ${s.lastWinner!==null&&isPlayer(s.lastWinner)?'pile-awarded':''}`} data-team="0" onClick={onHistory} aria-label={`Your partnership: ${s.tricks[0]} tricks`}>
   <small>US</small><span className="pile-content"><span className="stack-cards" aria-hidden="true">{Array.from({length:s.tricks[0]},(_,i)=><i key={i} style={{translate:`${i*.7}px ${-i*1.5}px`,rotate:i%2?'90deg':'0deg'}}/>)}</span><span key={`${pulse}-${s.tricks[0]}`} className="trick-total"><PencilNumber value={s.tricks[0]}/></span></span>
  </button>
  <button key={s.bid?`${s.bid.seat}-${s.bid.tricks}-${s.bid.suit}`:'opening'} className={`contract-ticket ${s.bid?'bid-stamped':''}`} onClick={onHistory} aria-label={s.bid?`${s.phase==='auction'?'Bid':'Contract'}: ${seatName(s.bid.seat)} ${s.bid.tricks} ${s.bid.suit==='NT'?'no trumps':symbol(s.bid.suit)}`:'Bidding opens'}>
   <small>{s.bid?seatName(s.bid.seat).toUpperCase():'OPENING BID'}</small><strong>{s.bid?<><PencilNumber value={s.bid.tricks}/><span className={s.bid.suit==='H'||s.bid.suit==='D'?'red-text':''}>{symbol(s.bid.suit)}</span></>:'—'}</strong>
  </button>
  <button className={`trick-pile ${s.lastWinner!==null&&!isPlayer(s.lastWinner)?'pile-awarded':''}`} data-team="1" onClick={onHistory} aria-label={`Rivals: ${s.tricks[1]} tricks`}>
   <small>THEM</small><span className="pile-content"><span className="stack-cards" aria-hidden="true">{Array.from({length:s.tricks[1]},(_,i)=><i key={i} style={{translate:`${i*.7}px ${-i*1.5}px`,rotate:i%2?'90deg':'0deg'}}/>)}</span><span key={`${pulse}-${s.tricks[1]}`} className="trick-total"><PencilNumber value={s.tricks[1]}/></span></span>
  </button>
  <span className="board-turn">{s.phase==='trick'?`${seatName(trickWinner(s.plays,s.bid!.suit))} wins`:s.phase==='kitty'||s.phase==='insight'?`${seatName(s.turn)} · discard 3`:`${isPlayer(s.turn)?'Your turn':'Thinking'} · ${seatName(s.turn)}`}</span>
 </div>;
}
