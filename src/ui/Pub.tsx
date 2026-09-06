import {useState} from 'react';
import {playSound} from './audio.ts';
type Area='lounge'|'bar'|'courtyard';
type Props={arrival:boolean;challenge?:boolean;deal:number;eventDone:boolean;onStart:()=>void;onRecruit:()=>void;onDeck:()=>void;onMabel:()=>void;onNext:()=>void;};
export function Pub({arrival,challenge,deal,eventDone,onStart,onRecruit,onDeck,onMabel,onNext}:Props){
 const [area,setArea]=useState<Area>('lounge');
 const move=(next:Area)=>{playSound('room');setArea(next);};
 return <section className={`pub-space room-${area}`} aria-label={area==='lounge'?'Card room':area==='bar'?'Bar':'Courtyard'}>
  <div key={area} className={`room-art room-art-${area}`} aria-hidden="true"/>
  <h2 className="room-sign">{area==='lounge'?'CARD ROOM':area==='bar'?'THE BAR':'COURTYARD'}</h2>
  {area==='lounge'&&<>
   <button className="hotspot lounge-door" onClick={()=>move('bar')}>Bar →</button>
   <button className="hotspot table-seat primary" onClick={arrival?onStart:eventDone?onNext:()=>move('courtyard')}>{arrival?'Take a seat':eventDone?`Deal ${deal+1}`:'Visit Mabel'}</button>
   {!arrival&&<button className="hotspot lounge-regulars" onClick={onRecruit}>Regulars</button>}
  </>}
  {area==='bar'&&<>
   <button className="hotspot bar-lounge" onClick={()=>move('lounge')}>← Card room</button>
   <button className="hotspot bar-courtyard" onClick={()=>move('courtyard')}>Courtyard →</button>
   <button className="hotspot bar-counter" onClick={arrival?onStart:onDeck}>{arrival?'Choose a Regular':challenge?'Enhancement tools':'Improve a card'}</button>
   {!arrival&&<button className="hotspot bar-regulars" onClick={onRecruit}>Recruit</button>}
  </>}
  {area==='courtyard'&&<>
   <button className="hotspot courtyard-door" onClick={()=>move('bar')}>← Inside</button>
   <button className="hotspot mabel-seat" onClick={arrival?()=>move('lounge'):onMabel}>{arrival?'Your table is ready':eventDone?'Mabel · visited':'Talk to Mabel'}</button>
  </>}
  <nav className="room-path" aria-label="Pub rooms">
   <button aria-current={area==='lounge'?'location':undefined} onClick={()=>move('lounge')}>Card room</button><span>—</span>
   <button aria-current={area==='bar'?'location':undefined} onClick={()=>move('bar')}>Bar</button><span>—</span>
   <button aria-current={area==='courtyard'?'location':undefined} onClick={()=>move('courtyard')}>Courtyard</button>
  </nav>
 </section>;
}
