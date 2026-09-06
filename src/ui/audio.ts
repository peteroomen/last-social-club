export type Cue='deal'|'select'|'play'|'bid'|'score'|'mult'|'room'|'buy'|'win'|'sweep';
let context:AudioContext|null=null;
let enabled=true;
let lastCue=0;
export function setSoundEnabled(value:boolean){enabled=value;if(!value&&context?.state==='running')void context.suspend().catch(()=>{});}
export function unlockSound(){
 if(!enabled)return;
 try{context??=new AudioContext();if(context.state==='suspended')void context.resume().catch(()=>{});}catch{/* Audio may be unavailable. */}
}
export function playSound(cue:Cue){
 if(!enabled||!context||context.state!=='running'||document.visibilityState==='hidden')return;
 const now=context.currentTime;
 if(now-lastCue<.025)return;
 lastCue=now;
 const tone=(frequency:number,start:number,duration:number,volume:number,type:OscillatorType='triangle',end=frequency)=>{
  const osc=context!.createOscillator(),gain=context!.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(Math.max(30,end),start+duration);
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.006);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain);gain.connect(context!.destination);osc.start(start);osc.stop(start+duration+.02);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
 };
 if(cue==='select')tone(650,now,.05,.025,'triangle',350);
 if(cue==='play')tone(180,now,.08,.06,'triangle',65);
 if(cue==='bid'){tone(95,now,.13,.085,'triangle',45);tone(390,now+.04,.18,.04);tone(585,now+.08,.15,.025);}
 if(cue==='win'){tone(220,now,.1,.05,'triangle',110);tone(660,now+.05,.17,.04);tone(990,now+.13,.22,.03);}
 if(cue==='sweep'){tone(850,now,.2,.025,'triangle',110);tone(100,now+.58,.09,.065,'triangle',45);}
 if(cue==='deal')for(let i=0;i<5;i++)tone(1300-i*140,now+i*.035,.045,.018,'triangle',350);
 if(cue==='score'){tone(490,now,.12,.045);tone(735,now+.06,.16,.04);}
 if(cue==='mult'){tone(440,now,.15,.04);tone(660,now+.07,.16,.04);tone(880,now+.14,.2,.03);}
 if(cue==='room'){tone(100,now,.12,.06,'triangle',55);tone(160,now+.08,.12,.03,'triangle',60);}
 if(cue==='buy'){tone(980,now,.15,.025,'sine');tone(1470,now+.04,.18,.02,'sine');}
}
