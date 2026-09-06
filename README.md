# The Last Social Club

A landscape-first 500 card roguelike in a pub that becomes stranger after closing.

**First Sitting v0.4** is a three-deal playtest. Control both partnership hands, compete in the auction, take the kitty, and make your contract—or set your rivals'. Recruit pixel-painted Regulars and improve a shared deck that can still be dealt against you.

## Playtest scope

- Suited and no-trump contracts from six to ten; the 43-card pack, joker, right and left bowers, legal follow-suit, and declarer-only kitty.
- Eight Regulars, five slots, eight persistent card enhancements, including four suit inks, and a guaranteed marked kitty.
- Both attacking and defending score; higher bids carry higher Composure penalties.
- Pub shop, a card-favouring option, courtyard choice, one Insight threshold and a small persistent Mabel conversation.
- Fullscreen landscape layout, visible contract/trick stacks, pencil scores, direct next-bid choices and optional sound effects.
- Winner flashes and automatic card sweeps to alternating trick piles. Reduced-motion support.
- Gatekeeper can break follow-suit once per deal; suit inks change actual suit and bower roles.
- Browser-local save/resume, validated JSON import/export, deterministic action replay and a score ledger.

This is an early slice. Misère, room score gates, full campaign progression are not included. Read [the playtest notes](docs/PLAYTEST.md) for the provisional rules and useful feedback.

## Development

Node 24 is recommended (the headless tests use native TypeScript support).

```sh
npm ci
npm run dev
npm test
npm run simulate
npm run build
```

React + TypeScript + Vite. Vercel can build the repository using its Vite preset; `dist` is the static output. There are no API keys, accounts or runtime services.

## Project map

- `src/engine/game.ts`: deterministic reducer, deal generation, rules, scoring and information-limited rival policies.
- `src/content/regulars.ts`: stable Regular and enhancement definitions.
- `src/persistence.ts`: versioned action saves and validation.
- `src/ui/`: responsive table and pub.
- `tests/`: rules, invariants, replay and baseline simulations.
- `docs/GDD.md`: design direction and future scope, with hypotheses identified.
- `public/art/`: approved visual reference and original generated portrait sheet. The UI uses CSS crops for the approved Bookkeeper, Operator and rival portraits, plus a transparent mug sprite.

Artwork was generated with OpenAI's image-generation tool for this project. The approved reference is deliberately simple: chunky pixel paintings, quiet surfaces, simple brass frames and a warm pub palette. Character oddness starts subtly; larger impossibilities belong to later Insight.
