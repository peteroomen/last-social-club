export const REGULARS = [
  {id:'bookkeeper',name:'The Bookkeeper',short:'Bookkeeper',effect:'Make your own bid exactly: ×2 at settlement.',tag:'Precision',price:5,portrait:0},
  {id:'switchboard',name:'The Operator',short:'Operator',effect:'Consecutive tricks won by alternating partners: +1 Mult. Rival wins break the chain. Max +4.',tag:'Partnership',price:5,portrait:1},
  {id:'wallflower',name:'The Wallflower',short:'Wallflower',effect:'Win with your lowest-strength legal card: +1 Mult. Max +3 per deal.',tag:'Cheap tricks',price:5,portrait:2},
  {id:'gatekeeper',name:'The Gatekeeper',short:'Gatekeeper',effect:'On defence, +20 points for each trick at or beyond the trick that sets their contract.',tag:'Defence',price:4,portrait:3},
  {id:'underwriter',name:'The Underwriter',short:'Underwriter',effect:'Make a bid of eight or more: +2 Mult at settlement.',tag:'Bold bids',price:5,portrait:4},
  {id:'scavenger',name:'The Scavenger',short:'Scavenger',effect:'Each enhanced opposing card you capture adds 15 points.',tag:'Capture',price:4,portrait:5},
  {id:'groundskeeper',name:'The Groundskeeper',short:'Groundskeeper',effect:'Win a trick without any trumps in it: +1 Mult. Max +3 per deal.',tag:'Side suits',price:5,portrait:6},
  {id:'listener',name:'The Listener',short:'Listener',effect:'At Insight 3, your first won trick each deal adds +2 Mult.',tag:'Insight',price:4,portrait:7},
] as const;
export type RegularId = typeof REGULARS[number]['id'];
export const regular = (id: RegularId) => REGULARS.find(r => r.id === id)!;
export const MODIFIERS = {
  gilt:{name:'Gilt',mark:'✦',effect:'+15 points to whoever captures this card.'},
  stamped:{name:'Stamped',mark:'M',effect:'+1 Mult when this card wins its trick.'},
  threaded:{name:'Threaded',mark:'↔',effect:'+15 points when its partner wins the trick.'},
  veiled:{name:'Veiled',mark:'?',effect:'Keep from the kitty to be offered Insight. At Insight 3, capturing it gives +15 points.'},
} as const;
export type Modifier = keyof typeof MODIFIERS;
