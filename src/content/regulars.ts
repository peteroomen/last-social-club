export const REGULARS = [
  {id:'bookkeeper',name:'The Bookkeeper',short:'Bookkeeper',effect:'Exact bid: ×2 score.',tag:'Precision',price:5,portrait:0},
  {id:'switchboard',name:'The Operator',short:'Operator',effect:'Alternate partners on consecutive wins: +1 Mult, max +4. Rival win resets chain.',tag:'Partnership',price:5,portrait:1},
  {id:'wallflower',name:'The Wallflower',short:'Wallflower',effect:'Win with your weakest legal card: +1 Mult, max +3/deal.',tag:'Cheap tricks',price:5,portrait:2},
  {id:'gatekeeper',name:'The Gatekeeper',short:'Gatekeeper',effect:'Once/deal: break follow-suit. Defend: +20 points per win from the setting trick.',tag:'Defence',price:4,portrait:3},
  {id:'underwriter',name:'The Underwriter',short:'Underwriter',effect:'Make a bid of 8+: +2 Mult.',tag:'Bold bids',price:5,portrait:4},
  {id:'scavenger',name:'The Scavenger',short:'Scavenger',effect:'Capture an enhanced rival card: +15 points.',tag:'Capture',price:4,portrait:5},
  {id:'groundskeeper',name:'The Groundskeeper',short:'Groundskeeper',effect:'Win a trump-free trick: +1 Mult, max +3/deal.',tag:'Side suits',price:5,portrait:6},
  {id:'listener',name:'The Listener',short:'Listener',effect:'Insight 3: first win each deal +2 Mult.',tag:'Insight',price:4,portrait:7},
] as const;
export type RegularId = typeof REGULARS[number]['id'];
export const regular = (id: RegularId) => REGULARS.find(r => r.id === id)!;
export const MODIFIERS = {
  inkS:{name:'Spade ink',mark:'♠',effect:'Becomes a spade. Changes following suit, trumps and bowers.'},
  inkC:{name:'Club ink',mark:'♣',effect:'Becomes a club. Changes following suit, trumps and bowers.'},
  inkD:{name:'Diamond ink',mark:'♦',effect:'Becomes a diamond. Changes following suit, trumps and bowers.'},
  inkH:{name:'Heart ink',mark:'♥',effect:'Becomes a heart. Changes following suit, trumps and bowers.'},
  gilt:{name:'Gilt',mark:'✦',effect:'Capture: +15 points.'},
  stamped:{name:'Stamped',mark:'M',effect:'Win with this card: +1 Mult.'},
  threaded:{name:'Threaded',mark:'↔',effect:'Partner wins this trick: +15 points.'},
  veiled:{name:'Veiled',mark:'?',effect:'Keep after discard: optional +1 Insight. Capture at Insight 3: +15 points.'},
} as const;
export type Modifier = keyof typeof MODIFIERS;
