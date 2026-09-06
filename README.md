# The Last Social Club

A portrait-first 500 card roguelike in a pub that becomes stranger after closing.

**First Sitting v0.1** is a three-deal playtest. Control both partnership hands, compete in the auction, take the kitty, and make your contract—or set your rivals'. Recruit pixel-painted Regulars and improve a shared deck that can still be dealt against you.

## Playtest scope

- Suited contracts from six to ten; the 43-card pack, joker, right and left bowers, legal follow-suit, and declarer-only kitty.
- Eight Regulars, five slots, four persistent card enhancements and a guaranteed marked kitty.
- Both attacking and defending score; higher bids carry higher Composure penalties.
- Pub shop, a card-favouring option, courtyard choice, one Insight threshold and a small persistent Mabel conversation.
- Browser-local save/resume, validated JSON import/export, deterministic action replay and a score ledger.

This is an early slice. No-trump, misère, room score gates, full campaign progression and audio are not included. Read [the playtest notes](docs/PLAYTEST.md) for the provisional rules and useful feedback.

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
- `public/art/`: approved visual reference and original generated portrait sheet. The UI uses CSS crops for the approved Bookkeeper, Operator and mug.

Artwork was generated with OpenAI's image-generation tool for this project. The approved reference is deliberately simple: chunky pixel paintings, quiet surfaces, simple brass frames and a warm pub palette. Character oddness starts subtly; larger impossibilities belong to later Insight.
