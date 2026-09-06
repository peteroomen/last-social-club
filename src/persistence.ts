import {replay,RULESET,type State,type Action} from './engine/game.ts';
const KEY='last-social-club.v1';
export type Campaign={nights:number;best:number;metMabel:boolean};
export type Save={version:string;seed:number;night:number;actions:Action[];campaign:Campaign};
export function pack(s:State,campaign:Campaign):Save{return {version:RULESET,seed:s.seed,night:s.night,actions:s.actions,campaign};}
export function unpack(raw:string):{state:State;campaign:Campaign}{
 const x:Save=JSON.parse(raw);
 if(x.version!==RULESET||!Number.isSafeInteger(x.seed)||x.seed<0||x.seed>4294967295||!Number.isSafeInteger(x.night)||x.night<1||!Array.isArray(x.actions)||x.actions.length>2000)throw new Error('This save belongs to a different version or is damaged.');
 if(!x.campaign||!Number.isSafeInteger(x.campaign.nights)||x.campaign.nights<0||!Number.isFinite(x.campaign.best)||x.campaign.best<0||typeof x.campaign.metMabel!=='boolean')throw new Error('Invalid journal.');
 return {state:replay(x.seed,x.actions,x.night),campaign:x.campaign};
}
export function load(){const raw=localStorage.getItem(KEY);return raw?unpack(raw):null;}
export function save(s:State,campaign:Campaign){localStorage.setItem(KEY,JSON.stringify(pack(s,campaign)));}
