# First Sitting v0.1

This build proves a single table across three deals. Survive the night, combine Regulars and try to improve your score. There is deliberately no room score target yet: target-setting needs actual play data.

## A short test

1. Pick a Regular. Try the Gatekeeper if you want to defend, or the Bookkeeper for an exact-bid challenge.
2. Inspect both hands. Bid or pass for each of your seats. Passing removes that seat from the auction.
3. If you win, discard three from the declarer's thirteen cards. Cards cannot move between partners.
4. Play ten tricks. Tap a legal card and then Play. Use Next Trick after seeing all four cards.
5. Check the score ledger, visit the pub and take a courtyard choice.
6. Reload during a deal to check resume. The menu can export a replay file for a bug report.

Useful feedback: did the hand and turn indicators make sense; were cards easy to tap; did bidding feel risky; was passing interesting; did a Regular change a decision; which parts felt slow; could you explain the final score?

## Provisional house rules

- Pack: no twos, threes or black fours, plus one joker, giving 43 cards.
- Suited bids only, 6–10, ordered spades, clubs, diamonds, hearts within each trick level.
- Passed seats cannot re-enter. All-pass forces the dealer into six spades; no free redeal loop.
- Trump order: joker, right bower, left bower, ace, king, queen, then numbers. Left bower counts as trump for following suit.
- Both of your hands are visible. Rivals receive **only their own hand and public information**, not your cards, partner cards or hidden kitty. This chooses the own-hand-only alternative discussed in the GDD.
- No-trump and misère wait for the next rules milestone.

## Scoring and Insight

Every player-captured trick adds 10 points. Making your bid or setting theirs awards the contract's base bonus. Card and Regular effects then build points/Mult, with exact-contract effects applied at settlement.

At Insight 3, your first captured trick containing a marked card adds +2 Mult, Veiled captures give +15 points, and the Listener activates if owned. Your failed bids cost 2 extra Composure. Both the boon and cost are disclosed before the choice. The visual change is small in this slice: shifted colour, perspective detail and a reversed mug. Full transformed portrait art is later scope.

The free pub favour selects one card for the next deal with weight 1.5. This is a sampling weight, not a promised probability. Kitty selection has priority. Enhancements can be received by either side. Shop purchases are bounded by cash, slots and one enhancement per visit.

## Saves and limitations

Saves contain ruleset `club-suited-1`, seed, committed actions and a small separate campaign journal. Reload reconstructs the game through the actual reducer. Import replays and validates every action, rather than accepting arbitrary resource values.

This implementation uses localStorage because the action logs are small. The GDD's IndexedDB migration is future work. Saves are device/browser-specific. Export before changing devices. No audio runs in v0.1.

This first slice includes the eight Regular effects but only a small story beat. It does not claim complete unlock progression, tuned AI, balanced room targets, bosses or complete MVP scope.

## Verification

- Production TypeScript/Vite build passes.
- Focused tests cover card conservation, enhanced kitty, bowers, legal plays, auction closure, scoring, settlement idempotence, shops, save validation and information-limited AI.
- 100 simulated full nights finish and replay exactly. These are correctness checks using simple heuristic players, not proof of balance or fun.
- Cloud browser preview was unavailable (`ERR_BLOCKED_BY_CLIENT`); phone visual and interaction verification remains unconfirmed. The first user playtest should prioritise layout, card selection, turn changes and scrolling.
