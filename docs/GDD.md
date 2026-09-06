# The Last Social Club

Game design document · v0.2 · 6 September 2026

**Status:** visual direction approved; gameplay remains in preproduction. This document distinguishes accepted direction from proposals to prototype. Numerical values are experiment settings, not validated balance. No playable build or simulation results are claimed.

## 1. The game in one paragraph

A single-player, portrait-first card roguelike set in a familiar pub that becomes stranger after closing. Control both hands of a 500 partnership, bid against two distinct rivals, and fulfil dangerous contracts or profit from setting theirs. Recruit portrait-card Regulars, enhance a deck everyone shares, and tilt future deals toward favoured cards. Take Insight to discover powerful exceptions and the pub's true nature, at a disclosed cost. Return on another night to people who remember you.

Working title: **The Last Social Club**. The venue is a pub with a members' card room; the title need not describe its business type. Alternatives for later consideration: **After Last Orders**, **The Long Table**. No availability or name clearance has been performed. Proposed repository slug: `last-social-club`.

## 2. Agreed direction and remaining experiments

### Accepted in the conversation

- Balatro is an inspiration for combinations, card enhancement and score feedback; 500 supplies bidding and trick play.
- Both partnership hands are controlled and visible to the player. Each seat bids separately; the declarer's hand gets the kitty.
- A shared deck with persistent enhancements, an enhanced card in every kitty, five Regular slots, and point/multiplier scoring.
- Attacking and defending are equally legitimate strategies. Higher contracts must carry higher rewards and higher failure costs.
- Insight reveals an eldritch pub and grants power; its downside needs design and testing.
- Opponents have traits and can appear in different pairings between runs.
- Pub characters, conversations, choice events and stories progressing across nights belong to the identity. Conversations can affect Composure and unlock Regulars.
- Portrait phone play, GitHub source control and Vercel hosting; TypeScript/React/Vite is the accepted initial stack direction.
- Build a small slice, prove it, then extend it. Model the systems for balance, replay and automated testing.
- Art direction approved after the simplified portrait gameplay mockup: **chunky pixel paintings**, broad shapes, restrained textures, simple brass frames, bottle green, amber, oxblood and cream. Regulars have distinct, subtly uncanny or vaguely silly proportions and expressions even before Insight. Preserve their humanity and the warm pub atmosphere; varied painting styles and eras remain welcome, especially longer term.
- Keep the ceramic mug as a small environmental detail. Different drinks per room are a later variety idea, not a requirement to produce a drink set now.
- Future, **not MVP**: a mahjong minigame. The user played 500 and mahjong with their oma. Preserve that personal connection without inventing her biography or which mahjong variant they played.

### Proposed defaults, not yet accepted

- Composure remains the provisional survival name; explain it as “Keep your nerve. At zero, the night ends.” No suit-shaped health icons.
- Optional Insight thresholds grant a boon and an explicitly disclosed complication.
- A weighted, quota-preserving deal system lets the player favour up to three physical cards.
- Three rooms with a maximum of three deals each; room score targets and a short shop after deals.
- An asymmetric narrative campaign with horizontal unlocks, rather than permanent statistical power increases.
- The overall visual direction and palette are approved. Exact native sprite resolution, phone readability and how different painting traditions fit the same card format still need production tests. Earlier, more detailed studies are superseded by the simplified portrait gameplay mockup.

## 3. Differentiation: what must survive every scope cut

This is a design comparison of intended player decisions, not a feature-completeness claim about other games.

| Pillar | Our central decision | Feature that proves it |
| --- | --- | --- |
| Commit before executing | How much can I promise, and what am I willing to lose? | Competitive auction, declarer-specific kitty, visible contract stakes |
| Defence as an objective | Should I pass and make their ambition punishable? | Defensive trick scoring, set bonus, defensive build support |
| Coordinate two hands | Who must win this trick to make the next one possible? | Separate seats, leads, trump management and partner support effects |
| Improve a contested resource | Is an enhancement worth creating if a rival can receive it? | Shared persistent card identities and modest deal influence |
| Learn a dangerous place | Is this new power worth the rule it awakens? | Optional Insight boon/complication pairs |
| Return to people | Who do I spend time with tonight? | Persistent pub character states, choices and Regular unlocks |

Design veto: a major upgrade should change a bidding, card-play, preparation or event decision. Pure score upgrades are useful support, but cannot constitute the entire content pool. The auction must remain interesting when all decorative effects are disabled.

## 4. A night at the pub

1. Arrive: select a starting Regular from unlocked options; one brief character interaction.
2. Enter a room: inspect rival traits, room rule, target and remaining deals.
3. Prepare: select favoured cards before seeing a new deal.
4. Deal: ten cards to each seat and three to the kitty.
5. Auction: bid/pass in seat order, showing stakes before commitment.
6. Kitty: winning declarer collects three and discards three from that hand alone.
7. Play: ten tricks, with legal-card highlighting and a readable trick history.
8. Settle: pay contract/defence score, cash and Composure consequences once.
9. If the room is cleared, finish the deal then choose a between-room destination. Otherwise, visit a short shop and deal again if permitted.
10. Clear the final room to finish the night. At zero Composure or an uncleared room after its last allowed deal, end the run and retain eligible story/discovery progress.

Room score resets on room entry. Cash, Composure, Regulars, enhancements and Insight persist during the night. An encounter cannot repeat indefinitely for recovery or profit. Save after every committed action.

Target duration: 20–30 minutes for experienced players, a hypothesis. Nine full deals may exceed this; measure before fixing room/deal counts. The first playable slice has three deals total.

## 5. House rules contract

Our adaptation needs its own versioned ruleset. Reference for variation review: https://www.pagat.com/euchre/500.html . The following is a proposed implementation baseline, not a claim that every NZ table plays this way.

- Four seats, opposing seats form partnerships. Player controls North/South. East/West are rivals.
- Proposed 43-card pack: a standard deck minus all twos and threes and the black fours, plus one joker. Each card has one permanent physical identity.
- Ten cards per seat, three-card kitty, clockwise turns. First bidder is left of dealer; dealer rotates each deal.
- Suited bids six through ten, ordered by contract value with suits spades, clubs, diamonds, hearts. A bid must exceed the current bid. A passed seat cannot re-enter this auction.
- Three consecutive passes after a bid end the auction. All-pass triggers one forced dealer six-spades contract in the slice, announced in the rules. Prototype this unpopular but deterministic fallback against an all-pass no-trump defensive hand before MVP lock; no free repeated redeals.
- Declarer picks up and discards alone and leads the first trick. Subsequent trick winner leads.
- Follow effective suit when possible. The left bower belongs to trump, not its printed suit. Trump order: joker, right bower, left bower, ace, king, queen, remaining ranks descending.
- All discarded cards stay out for this deal; their enhancements remain next deal. No free transfer between partners.
- Suited contracts ship first. No-trump is an MVP candidate after explicitly specifying joker lead/follow rules. Misère/open misère are a later milestone unless they displace another feature; do not advertise an avoidance build before its contract is playable.
- Point scoring differs from traditional match-to-500 scoring. Legal bid precedence is distinct from roguelike payout; multipliers cannot change which bid outranks another.

Open rules gate before engine implementation: confirm the exact pack and all-pass rule, and set no-trump/misère release scope. Record ruleset version in every save and replay.

## 6. Bidding, score, money and survival

Three resources have separate jobs: **Score** clears a room, **Cash** purchases upgrades, **Composure** keeps the night going. Insight is a track, not a spendable wallet.

Initial scoring experiment for suited contracts, using `n` = bid tricks and `s` = suit index 0–3:

| Quantity | Draft formula |
| --- | --- |
| Ordinary trick points | 10 per trick captured by the player's partnership |
| Successful player contract bonus | `40 + 100 × (n − 6) + 20 × s` |
| Successful defence set bonus | Initially the same base bonus as the defeated contract |
| Player contract failure | Lose `2 + 2 × (n − 6)` Composure |
| Failed defence | Lose `1 + (n − 6)` Composure |
| Starting/max Composure | 20 / 20 |
| Initial cash | 6 |
| Cash per completed deal | 2 plus 1 if player contract made or defence set |
| Room targets | Leave unassigned until baseline policy simulations and human slice tests |

The equal set/contract bonus is an experimental baseline, not an assertion of equal difficulty. Defence succeeds with fewer tricks; compare outcome probabilities and adjust set bonus, cash and exposure together. Suit-dependent failure costs are a later tuning option; current numeric exposure scales by trick level.

`deal score = floor((trick points + card point effects + earned contract/set bonus) × (1 + additive Mult) × product of active multiplicative effects)`

- A failed contract earns no contract bonus and still applies its full penalty even if trick points clear the room target. Resolve penalties before deciding whether the run survives.
- Only player-side scoring contributes to the room. Opponent card effects are evaluated for simulation and relevant mechanics; never accidentally award them to the player.
- A player-side exact-contract bonus applies only when the player's side declares and takes exactly the bid, not when defending.
- Overtricks already supply trick points; additional overtrick payout comes from effects, initially not a universal second bonus.
- Build Mult across the deal; trick animations show contributions to a pending ledger, not misleading fully banked settlement scores.
- Cash does not scale with explosive score. Prevent early runaway shop economies.
- Penalties never multiply with score Mult. Display “Make: base bonus… / Fail: lose… Composure” before a bid. Show conditional effects separately, never as guaranteed payout.
- Evaluate all ten tricks. No auto-settle shortcut while remaining plays can change score, exactness, cash, Insight or triggers.

Example without modifiers: eight diamonds, eight tricks taken: `(80 + 280) × 1 = 360`. With Bookkeeper ×2: 720. Seven tricks instead: 70 score, no contract bonus, six Composure lost. Defending against eight diamonds and taking three tricks sets the contract: `30 + 280 = 310`. These examples check arithmetic only; they do not demonstrate balance.

## 7. Regulars, cards and Favours

Regulars are portrait cards with a name, concise effect and expandable trigger explanation. Five slots. Each has a stable ID, rarity, price, allowed triggers, reset scope and build tags. A Regular stays the same person when Insight alters the portrait. No duplicated portrait cards in the initial shop pool.

Eight-Regular slice roster, numbers provisional:

| ID / name | Effect | Build / reset |
| --- | --- | --- |
| bookkeeper / The Bookkeeper | ×2 at settlement for making your own contract exactly | Precision / deal |
| wallflower / The Wallflower | +1 Mult when your winning play was the lowest-strength legal card at play time | Cheap winners / up to 3 per deal |
| switchboard / The Switchboard Operator | +1 Mult when the player's partnership wins consecutive tricks with alternating seats | Partnership / cap 4 per deal; rival win breaks chain |
| gatekeeper / The Gatekeeper | +20 points per defensive trick at or beyond the trick that sets the contract | Defence / deal |
| underwriter / The Underwriter | Successful player bids of eight or more earn +2 Mult | Bold contracts / once per deal |
| scavenger / The Scavenger | +15 points for each enhanced opposing card captured | Capture / per physical card per deal |
| groundskeeper / The Groundskeeper | +1 Mult when a non-trump card wins a trick containing no trump cards | Side-suit control / cap 3 per deal |
| listener / The Listener | At Insight tier 1+, your first won trick each deal grants +2 Mult | Insight support / once per deal |

“Lowest strength” uses a documented ordering for the current lead/trump context with deterministic tie handling; store the legal set when the card was played. A natural low card that is not legal does not count. Review whether this effect is understandable enough to keep.

The Undertaker remains a future misère Regular. It is not sold while misère is unavailable.

Initial physical-card enhancements, one per card:

- **Gilt:** +15 points to the side capturing this card, regardless of who played it.
- **Stamped:** +1 Mult to the card owner's side if this card wins the trick.
- **Threaded:** +15 points to the owner's side when its partner wins this trick.
- **Veiled:** if the declarer retains it after kitty discard, offer +1 Insight with the applicable disclosed consequence. At accepted Insight tier 1+, capturing it grants +15 points to that side. The Insight prompt occurs only once for that physical card per deal. Rivals do not maintain campaign Insight; the player-only offer is explicitly marked.

Rule-breaking ranks, suits and duplicate cards wait until the initial engine is reliable. Modifier art is a legible corner stamp/border treatment, never damage to the rank or suit.

**Favours:** consumables in two slots, initially used before dealing or during preparation. Examples: favour a physical card for the next deal; recover two Composure for a shop cost. Do not add unrestricted mid-trick information reveals or card movement in the slice.

Regular price experiments: common 4–6, uncommon 7–9. One enhancement 3–5. No free rerolls, resale loop or unlimited recovery. Actual distribution lives in tuning data, not scattered UI code.

## 8. Shared deck and favoured cards

Player-owned Regulars and world-owned cards are explicitly different. Buying an enhancement changes a physical card for the rest of the run, whoever receives it next. The UI shows the deck and all known enhancement locations, but not hidden card ownership after a deal.

Proposed **Favoured cards** mechanic: an earned preparation ability permits selecting up to three card IDs before dealing. Selected cards have weight 1.5 instead of 1 when choosing the player's partnership's allocation from cards not in the kitty. Selection lasts as stated by its source; default a single next deal. No guaranteed ace/trump access.

Deal algorithm contract:

1. Begin the run with at least one enhanced card.
2. Sample a three-card kitty uniformly from eligible subsets containing at least one enhanced card. Implement an exact bounded combinatorial sampler, not an unbounded rejection loop.
3. Select twenty of the remaining forty cards for the player partnership using weighted sampling without replacement (e.g. seeded exponential keys).
4. Uniformly split those twenty into two ten-card hands. Uniformly split the other twenty between the rivals.
5. Never alter the deal after observing an auction or player decision. No cards are duplicated or deleted. Log preparation parameters and seed.

This intentionally biases deals toward the player; rivals do not secretly compensate. The kitty guarantee takes precedence over favouring a card. UI must say “more likely”, not “50% chance” or “50% more likely”: weight 1.5 is not a marginal probability. Compute marginal allocation rates across seeds before presenting actual odds. Track enhanced-card availability, max hand concentration, kitty diversion and combined upgrade dominance.

The enhanced kitty rule must hold even at zero Insight. Rival declarers get the same kitty guarantee and enhancement behaviour. Taking the kitty is a tactical reward, not the only viable engine: defensive builds can capture its enhanced cards.

## 9. Insight and the price of seeing

Proposal: earn Insight from explicit choices, retained Veiled kitty cards or disclosed challenges. Ordinary progression alone does not force it. A threshold offer lists its boon and complication together; accepting activates both for the rest of the run. Declining caps progress below that threshold until a later eligible offer, with no farmable reward for repeated decline/reconsider.

Initial thresholds: 3 and 6, giving three visual states including zero. These values are hypotheses.

Example boon/complication pairs:

- **The room remembers:** favour one additional card, within the hard cap of three; failed player contracts cost two extra Composure.
- **Nothing is wasted:** first enhanced card captured each deal scores its point effect twice; between-room recovery restores two less Composure, minimum zero.
- **An empty chair:** partnership alternation can accumulate one additional Mult per qualifying trick; when you defend, a made rival contract costs two extra Composure.

Do not offer an inapplicable boon such as an extra favoured slot when already capped. Complications are fixed and inspectable; effects cannot change legal plays unexpectedly midway through a trick. No hidden input interference, randomly false tooltips or forced misclicks as horror.

Insight should help a run through new build opportunities while increasing exposure. Low-Insight runs remain viable. The next run resets Insight and mechanical complications, while the journal remembers discoveries. Familiar rooms start apparently normal again, preserving the contrast.

## 10. The pub between rooms and between nights

The **pub** is the setting. Its **counter/bar** is one location, not the name for the whole venue.

| Location | Mechanical role | Story role |
| --- | --- | --- |
| Pub counter | Recruit Regulars, purchase Favours | Recurring publican, gossip, introductions |
| Courtyard | Recover Composure or accept a quiet choice | Intimate conversations and conflicting accounts |
| Cloakroom | Enhance or favour a card | Lost property, objects that should not have owners |
| Committee room | Accept a disclosed challenge | Learn the club's obligations and rules |

MVP: two functional destinations, counter and courtyard, plus a small event pool that can reference the others. A choice event is required between rooms; initial arrival and final return provide narrative bookends.

Three persistent characters, each with a short three-beat arc, are sufficient to prove cross-run continuity. A named narrative character maps to an unlockable Regular identity when appropriate. Story unlocks add options to future selection/shop pools; do not silently add permanent Mult. Let players skip dialogue and show the mechanical consequence clearly.

Example event proposal: a woman in the courtyard asks you to confirm that her usual chair has always been empty. “Sit with her” restores Composure but spends the recovery opportunity; “Ask who used it” grants Insight with a threshold preview if relevant; “Return inside” changes neither. Specific story text should be written after the character outline, without repetitive cryptic aphorisms.

Recovery comes from company, rest and reassurance; not an alcohol consumption mechanic. Conversations can also unsettle you. Mechanical costs are legible; the underlying mystery can remain ambiguous.

## 11. Rivals and information

Two rival seat policies, varied pairings. Initial traits: aggressive bidder, cautious declarer, trump conservator, partnership supporter. Traits bias choices rather than granting hidden cards or ignoring follow-suit rules. Opponent identity, bid and last play remain visible.

Proposed information parity for prototyping: each rival policy can inspect its own partnership's two hands, matching the player, but never the player's hands or undeclared kitty. This is a deliberate departure from traditional hidden partner hands and needs user review. The alternative is own-hand-only rivals with public inference; benchmark separately, do not silently switch during difficulty scaling.

Use deterministic heuristic bidding/card play initially, with legal-move filtering before strategy. AI policy receives an explicit observation object rather than the entire engine state. Tie randomness uses a separate seeded stream. Test behavioural distinctions and avoid forced top bids that create automatic defensive farms.

## 12. Art, UI and sound

**Approved visual reference:** the simplified portrait bidding mockup, generated as `exec-51d202d0-a864-4391-8ffb-a3f0df1eaf0c.png` and accepted with “Love it. That's the vibe”. It supersedes the more detailed portrait mockup and the earlier comparison boards. Approval covers the visual style; it does not validate generated card markings, final screen dimensions, scoring values or touch behaviour.

Regular portraits are paintings rendered in visibly chunky pixels. Build faces, hair, clothing and pub scenery from a small number of broad colour clusters. Use quiet surfaces and clear silhouettes; omit fine woodgrain, mottled felt, elaborate card-back patterns, tiny hair strands and photographic shading. Brass remains an identifying accent, with simple frames and a small number of shade steps. UI text and suit symbols must remain readable independently of the artwork's pixel density.

At zero Insight, each person already has a small individual oddity: the Bookkeeper's severe hair silhouette, low spectacles and sideways stare; the Operator's unusually upright posture and almost-too-polite expression; Arthur's oversized flat cap and solemn moustache. These are direction examples, not mandatory traits for everyone. Keep the effect subtly uncanny or vaguely silly, with recognisable humanity. Do not homogenise the cast into conventional attractive faces, exaggerate them into broad cartoons, or use overt monster transformations at the start of a night. Stronger impossibilities belong to later Insight.

Different painting traditions can give the portrait collection history: a dark formal oil portrait, a spare local sign-painter's likeness, a woodcut-like print, a loose modern colour study. Express those differences through pixel clusters, composition and palette while keeping one card format, consistent native pixel density and crisp scaling. For MVP, establish one strong house style plus one contrasting portrait; a full survey of eras is later content. Do not treat these styles as a mechanical rarity hierarchy by default.

Insight can alter the painting itself: a sitter changes pose, a concealed older face shows through, the painted perspective contradicts the frame, or the shadow represents someone else. Identity remains recognisable. Start production tests around 32 × 40 and 48 × 64 native pixels, then choose a consistent portrait grid based on actual phone thumbnails. These sizes are test candidates, not an accepted resolution. Avoid adding detail merely because a larger asset allows it. UI text remains separately rendered and legible.

Approved palette direction: bottle green, cream, tobacco amber, oxblood, near-black and brass. One confident face/pose per Regular, recognisable at thumbnail scale. Simple frames. Clear typeset rules remain separate from generated art. No tiny generated writing or invented slogans baked into production assets.

The mug is an approved environmental motif. Later, drinks can vary by room: whisky, a milkshake, water, juice, a piña colada, beer, and other ordinary drinks. This is a small variety idea, not a new drinks system or current asset-production task. No mechanical drink bonuses have been agreed.

Insight modifies specific persistent objects: doorway depth, reflection angle, portrait shadow. Higher Insight need not add more visual clutter. Cards remain readable in every state. No default purple glow, tentacle carpet, floating runes or decorative skull frames.

Phone layout prototype requirements:

- Design at 390 × 844, verify 360-pixel width and large text before adding content.
- Five Regular thumbnails open full rule details on tap.
- Both player hands remain inspectable; active hand is expanded with thumb-friendly hit areas, inactive hand uses a compact rank/suit strip that can expand without selecting a card.
- Select a card to preview, tap a clear play control to commit. Optional faster mode later. Bids retain explicit confirmation because their cost is large.
- Centre trick area, persistent trump/contract/turn indicators, expandable trick history and score ledger.
- Plain-text legal-play explanation; display left bower's effective suit.
- Large-number formatting must never push bidding, hand or navigation controls off-screen; expanded exact values available on tap.
- High-contrast suit shapes as well as colour; reduced-motion and independent sound/music controls.

Sound: restrained room tone, rain, chair creak and tactile card sounds; a sparse warm musical bed. Insight changes arrangement and spatial details. Score layers have voice limits and predictable gain. Mobile audio starts after a user gesture; recover cleanly from pause/background and prevent duplicate audio loops.

Art review gate: **passed for the visual direction**, following explicit approval of the simplified portrait bidding mockup. Carry this reference into a responsive phone layout, preserving its simplicity. Validate both-hand inspection, card readability, Regular detail access and bidding controls in that layout before expanding the playable build. The generated mockup is not evidence that the final mobile layout works. Further concept-art variants are not required before this step.

## 13. Scope and milestones

### M0 — preproduction

- Reviewable GDD, differentiators, explicit hypotheses and initial balance formulas.
- Working name and repository access established; simplified portrait gameplay art direction approved.
- Carry the approved visual reference into the responsive table before expanding gameplay. Rules hypotheses remain reviewable in this document.

### M1 — playable slice

- One table; suited bidding, kitty, ten legal tricks; both hands controlled.
- Eight Regulars, four enhancements, guaranteed enhanced kitty, one favouring effect.
- Three-deal challenge, score/cash/Composure settlement, small shop.
- One Insight threshold, one courtyard choice, one character whose state persists into a second night.
- Deterministic replay, action saves and headless simulation hooks using the actual rules engine.

### M2 — first complete MVP

- Three rooms, targets tuned from M1 rather than guessed now.
- Around twenty Regulars spanning supported build styles; at least two viable defensive packages.
- Two opponent traits minimum in M1, four in M2 with varied pairings; three clearly disclosed room rules.
- Both Insight thresholds, six choice events, two destinations, three short character arcs.
- Onboarding, mobile performance/accessibility pass, complete-run save/resume.
- No-trump only after joker rules and tests are signed off. Misère remains explicit stretch scope; replace other content if brought forward.

### Later

- Misère/open misère and avoidance builds; longer story arcs and rooms; daily seeds and optional cloud saves.
- Mahjong minigame in a quieter pub room, preserving the association with playing cards and tiles with the user's oma. Before design, ask whether the intended game is a multiplayer mahjong ruleset or solitaire tile matching and which family rules matter. No inference from the word alone.
- Multiplayer, accounts and competitive leaderboards are separate projects, not MVP dependencies.

## 14. Architecture and repository plan

TypeScript domain engine with no DOM, React or network dependency. React + Vite front end; GitHub repository; Vercel deploys static assets. Browser-local game state. No server secret or LLM required for opponents. Online features can be added later without changing legal-play resolution.

Proposed structure:

```text
docs/GDD.md
docs/rules.md
docs/art-direction.md
src/engine/        # cards, auction, legal moves, trick and settlement reducers
src/content/       # versioned Regular, modifier, event and opponent definitions
src/ai/            # observation builders and seat policies
src/simulation/    # seeded runs, baseline policies and reports
src/persistence/   # action log, save validation and migrations
src/ui/            # portrait table, auction, pub and ledger
public/art/        # selected production art, not discarded concept variants
tests/             # meaningful rules, invariants and regression scenarios
```

Use a pure transition boundary such as `reduce(state, action) -> {state, events}`. Animation consumes events; it never owns game rules. Commit an action and save before animating its outcome. Animation skip cannot repeat rewards. Validate content references and trigger dependencies before starting a run.

Persist schema version, ruleset version, content version, seed/PRNG states, action index, run state and separate campaign state. A reload cannot reroll a deal, repeat a reward or duplicate a conversation unlock. Use IndexedDB transactions for local saves, with export/import and explicit recovery if storage is unavailable. Do not promise cross-device saves in MVP.

GitHub setup status: the user created `peteroomen/last-social-club`; access and the empty repository were verified, and a local checkout exists. The repository was created public; its visibility has not been changed. No gameplay code or Vercel deployment has been created in this project flow.

## 15. Balance model and verification specification

The following defines work to implement, not completed simulations.

### State inventory

- Campaign: character/arc states, choices, unlocked Regular IDs, journal, settings.
- Run: room, remaining deals, score, cash, Composure, Insight, active complications, Regulars, Favours, physical deck and enhancements.
- Deal: dealer, turn, auction history, current bid/declarer, passes, hands, kitty/discards, trick/history, pending score effects, one-shot flags.
- Replay: seed and independent deal/AI/shop/event RNG streams, input actions, versioned content hashes and scoring ledger.

### Effect resolution

Snapshot legal context at card play; determine trick winner; apply per-card point effects; apply trick Regular triggers in fixed priority and stable ID order; record additive Mult; settle contract/defence and conditional multipliers once; apply Composure consequences; then decide survival and room progression. Snapshot effect eligibility before mutations that could recursively retrigger it. Content caps and per-event source IDs prevent repeat rewards. The UI explains the same ledger used by simulations.

### Required correctness checks

- Conservation and uniqueness: 43 physical cards, 10/10/10/10/3 before discard, no duplicates after biased allocation.
- Every kitty has an enhancement; modifiers persist through discard and next deal.
- Trump/bower handling, follow suit, turn order, monotonic legal auction, terminal all-pass behaviour.
- Exact-contract triggers never fire on defence or failed contracts.
- Every settlement/reward/story unlock is idempotent across reload and animation skip.
- Rival observations cannot expose the player's hidden cards or unrevealed kitty.
- Deterministic replay reproduces state and ledger with the same versioned inputs.
- Large scores remain finite in the initial number model; define overflow/formatting bounds before endless mode.

### Simulation matrix

Compare conservative/aggressive/adaptive bidders, defensive/contract/hybrid builds, no/moderate/high Insight, favouring weights 1/1.25/1.5/2, varied opponent pairings, and new/unlocked content pools. Start with at least 1,000 shared seeds per focused comparison, expand only if uncertainty matters. Report distributions and confidence intervals; retain action traces for outliers.

Measure: bid distribution, pass frequency, contract success by level/suit/declarer, set frequency, score per deal and source, Composure loss, shop purchasing, upgrade availability, favourite-card marginal rates, zero-Insight completion, failure room, length and contribution by partner hand. Test trivial policies (always pass, always minimum bid, always high bid) to expose dominant exploits.

Comparison gates: specialised defence and contract builds should both complete runs across shared seed sets with overlapping practical success ranges; no claim of parity from mean score alone. Human tests must show at least occasional reasons to change bid or card sequence because of a Regular. No universal target can be locked until player skill and AI competence are measured.

Manual acceptance: play on a phone; explain a loss from the ledger; spot trump and active hand instantly; close/reopen mid-auction and mid-trick; background audio and resume; compare the same pub/portrait at each Insight tier. A reviewer must be able to inspect both hands without accidental plays.

## 16. Immediate decisions and next action

1. The simplified portrait bidding mockup is the approved art direction. Translate it into a responsive phone layout, using chunky pixel-painted portraits, quiet textures, simple brass frames and subtly peculiar characters. Do not drift back toward the earlier detailed studies.
2. Keep the working title until a stronger name wins; no naming session should block a prototype.
3. Review proposed Insight boon/complication pairs and favoured-card mechanic.
4. Resolve the pack/all-pass rules and rival partner-hand visibility before coding the auction.
5. Repository access is verified. After the phone layout and rules baseline are ready, implement M1 in small reviewable steps. Deployment follows a tested playable slice.

The game should be identifiable from an ordinary decision: **I could make seven, but if I pass I can set their nine—and the card I improved yesterday is probably in their kitty.**
