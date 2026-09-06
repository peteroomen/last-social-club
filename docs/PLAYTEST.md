# First Sitting v0.4

This build proves a single table across three deals. Survive the night, combine Regulars and try to improve your score. There is deliberately no room score target yet: target-setting needs actual play data.

## A short test

1. Pick a Regular. Try the Gatekeeper if you want to defend, or the Bookkeeper for an exact-bid challenge.
2. Inspect both hands. Bid or pass for each of your seats. Passing removes that seat from the auction.
3. If you win, discard three from the declarer's thirteen cards. Cards cannot move between partners.
4. Play ten tricks. Tap a legal card and then Play. The winner flashes, then all four cards sweep automatically to the winning side’s stack. Tap Collect trick to skip the pause.
5. Check the score ledger, visit the pub and take a courtyard choice.
6. Reload during a deal to check resume. The menu can export a replay file for a bug report.

Useful feedback: did the hand and turn indicators make sense; were cards easy to tap; did bidding feel risky; was passing interesting; did a Regular change a decision; which parts felt slow; could you explain the final score?

## Provisional house rules

- Pack: no twos, threes or black fours, plus one joker, giving 43 cards.
- Bids 6–10, ordered spades, clubs, diamonds, hearts, no trumps within each level. Each bidding button offers the next legal bid in that suit; tap to commit.
- Passed seats cannot re-enter. All-pass forces the dealer into six spades; no free redeal loop.
- Trump order: joker, right bower, left bower, ace, king, queen, then numbers. Left bower counts as trump for following suit.
- Both of your hands are visible. Rivals receive **only their own hand and public information**, not your cards, partner cards or hidden kitty. This chooses the own-hand-only alternative discussed in the GDD.
- No trumps: no bowers, normal A–K–Q–J order; joker highest, playable on another lead only when void. Lead the joker and name any suit to follow (free-call house variant). NT scores 120/220/320/420/520. Misère is not implemented.
- Suit inks replace a non-joker card’s suit for following, trump and bower roles. Physical ID stays unchanged. Duplicate rank/suit ties go to the first played. An ink replaces the previous enhancement.
- Gatekeeper: arm Break suit to ignore follow-suit once per deal, shared across both player seats. The charge is spent only when playing an otherwise illegal card. Defensive scoring stays intact.

## Scoring and Insight

Every player-captured trick adds 10 points. Making your bid or setting theirs awards the contract's base bonus. Card and Regular effects then build points/Mult, with exact-contract effects applied at settlement.

At Insight 3, your first captured trick containing a marked card adds +2 Mult, Veiled captures give +15 points, and the Listener activates if owned. Your failed bids cost 2 extra Composure. Both the boon and cost are disclosed before the choice. The visual change is small in this slice: shifted colour, perspective detail and a stable mug. Full transformed portrait art is later scope.

The free pub favour selects one card for the next deal with weight 1.5. This is a sampling weight, not a promised probability. Kitty selection has priority. Enhancements can be received by either side. Shop purchases are bounded by cash, slots and one enhancement per visit.

## Saves and limitations

Saves contain ruleset `club-suited-1`, seed, committed actions and a small separate campaign journal. Reload reconstructs the game through the actual reducer. Import replays and validates every action, rather than accepting arbitrary resource values.

This implementation uses localStorage because the action logs are small. The GDD's IndexedDB migration is future work. Saves are device/browser-specific. Export before changing devices. Short sound effects unlock on your first tap. Mute them in Menu → Sound effects.

This first slice includes the eight Regular effects but only a small story beat. It does not claim complete unlock progression, tuned AI, balanced room targets, bosses or complete MVP scope.

## Verification

- Production TypeScript/Vite build passes.
- Focused tests cover card conservation, enhanced kitty, bowers, legal plays, auction closure, scoring, settlement idempotence, shops, save validation and information-limited AI.
- 100 simulated full nights finish and replay exactly. These are correctness checks using simple heuristic players, not proof of balance or fun.
- The local cloud preview was blocked, but the published Vercel game was accessible. Browser checks covered starter selection, bidding from both seats, declarer-only kitty/discards, a complete ten-trick deal, legal-card controls, settlement, mid-trick and post-settlement reload, a shop purchase, the courtyard Insight choice and entry to deal two. No application console errors appeared; browser-extension messages were unrelated.
- Browser checks include 740×360, 844×390 and fullscreen phone proportions. The user confirmed fullscreen works on Android. Device-specific audio and touch feel still benefit from playtesting.
- A separate 1,000-night heuristic baseline is recorded in `BALANCE-BASELINE.md`. It indicates forgiving survival and does not establish attack/defence parity.

## Landscape and room update
Landscape is the primary phone layout. Check card selection and kitty discards without page scrolling. Between deals, move through the card room, bar and courtyard; tap the counter for enhancements and Mabel for the courtyard choice. Enhanced cards show their names, materials and a selected-card effect button. Scoring animates a receipt and the live points × Mult tally; triggered Regular portraits flash. Reduced motion disables movement.

## v0.4 verification and open design question

17 tests cover the original invariants, NT bidding and joker nomination, full NT deals, inked bowers and legal following, one-use Gatekeeper enforcement, and byte-for-byte replay of a v0.3 night with recruits. Browser checks cover direct NT bids, joker suit choice, rule breaking, enhancement controls and automatic trick collection. These check correctness, not balance.

The deck is still shared. Per-player decks, partnership decks and guaranteed personal card access remain design alternatives; none has been silently adopted.
