# v0.5 — table layout and score-challenge prototype

## Changes

- Landscape room panoramas replace portrait crops; scale each room to its height with a centered horizontal crop.
- Opponents sit at the upper left with fully elliptical masks.
- Played cards, hand and receipt have separate layout areas. Contract and alternating trick stacks share the sidebar.
- The middle sidebar gives Regular portraits more room. Compact controls fit below the score.
- New nights default to the optional **Score challenge** prototype. Uncheck it for a classic three-deal night. Existing saves keep their original rules.
- Each challenge starts with Gilt, Stamped and Heart ink tools. Assign each to one card in North or South after dealing, before bidding. Move or remove assignments freely until bidding starts.
- Tools persist; assignments reset each deal. Buy one additional tool per pub visit for £3, up to five. The shared pack stays unmodified; the four house marks are applied to each new deal. Challenge dealing is uniform and does not guarantee a marked kitty.
- Three sittings target 500 / 1,000 / 1,800 points, with three deals each. Builds carry forward; score surplus does not. Zero Composure still ends a run. Opponent policies remain unchanged.

## Validation

- Production TypeScript/Vite build passes.
- 21 engine tests pass, including 100 challenge runs and 100 legacy nights with full replay equality and card conservation.
- Legacy v0.3 save still matches its full-state hash exactly.
- New tests cover ownership validation, reversible assignments, suit changes, bidding lock, fresh-deal reset, purchases, stage advancement and failure at the deal limit.
- 600 additional heuristic runs compare baseline play to tools/recruits/Insight. Exact output: `tests/fixtures/challenge-balance.json`; reproduce with `node --experimental-strip-types tests/simulate-challenge.ts`.
- Browser fixtures cover 13-card kitty, raised selections, four played cards, win flash, four collection flights, receipt, suit rewriting, tool purchase, pub navigation and tool persistence.
- Geometry harness measures actual rendered card rectangles against the hand and tracks receipt overlap, offscreen cards and clipped actions. Preview only; it is excluded from production.

## Balance limits

The diagnostic policies are not human playtests or an isolated comparison of tools alone: recruits and Insight also differ. Final clearance was 3/300 without builds and 210/300 with the combined build policy. This supports the fixed-deal pressure model but does not establish final difficulty. Keep targets labelled as a prototype and tune from player testing.
